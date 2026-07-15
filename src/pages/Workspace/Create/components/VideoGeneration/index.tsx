import React, { useEffect, useMemo } from 'react';
import {
  FileImageOutlined,
  ScissorOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import TextToVideo from '../TextToVideo';
import ImageToVideo from '../ImageToVideo';
import VideoEdit from '../VideoEdit';
import {
  getDefaultVideoGenerationMode,
  resolveVideoGenerationModeWithEnabled,
  VideoGenerationEnabledModes,
  VideoGenerationMode,
} from './types';

interface VideoGenerationProps {
  enabledModes: VideoGenerationEnabledModes;
}

interface ModeConfig {
  value: VideoGenerationMode;
  icon: React.ReactNode;
  accent: string;
  accentSoft: string;
  titleId: string;
  titleDefault: string;
  descId: string;
  descDefault: string;
}

const MODE_CONFIGS: ModeConfig[] = [
  {
    value: 'textToVideo',
    icon: <VideoCameraOutlined />,
    accent: '#1890ff',
    accentSoft: 'rgba(24, 144, 255, 0.12)',
    titleId: 'create.tab.textToVideo',
    titleDefault: '文生视频',
    descId: 'create.textToVideo.subtitle',
    descDefault: '输入场景描述与镜头控制，生成高品质视频',
  },
  {
    value: 'imageToVideo',
    icon: <FileImageOutlined />,
    accent: '#722ed1',
    accentSoft: 'rgba(114, 46, 209, 0.12)',
    titleId: 'create.tab.imageToVideo',
    titleDefault: '图生视频',
    descId: 'create.imageToVideo.subtitle',
    descDefault: '赋予静态图片生命，通过提示词控制运动',
  },
  {
    value: 'videoEdit',
    icon: <ScissorOutlined />,
    accent: '#13c2c2',
    accentSoft: 'rgba(19, 194, 194, 0.12)',
    titleId: 'create.tab.videoEdit',
    titleDefault: '视频剪辑',
    descId: 'create.videoEdit.subtitle',
    descDefault: '多模态参考、视频编辑与延长，Seedance 2 统一创作',
  },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  width: 100%;
  max-width: 100%;
`;

const ModeSwitcher = styled.div`
  margin-bottom: 20px;
  padding: 6px;
  border-radius: 18px;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f4f6f9')};
  border: 1px solid ${(props) => (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#e8ecf1')};

  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding: 4px;
  }
`;

const ModeGrid = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$count}, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ModeCard = styled.button<{ $active?: boolean; $accent: string; $accentSoft: string }>`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid
    ${(props) =>
      props.$active
        ? props.$accent
        : props.theme.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'transparent'};
  border-radius: 14px;
  background: ${(props) =>
    props.$active
      ? props.theme.mode === 'dark'
        ? props.$accentSoft
        : '#fff'
      : props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.02)'
        : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: all 0.22s ease;
  box-shadow: ${(props) =>
    props.$active
      ? props.theme.mode === 'dark'
        ? `0 8px 24px -12px ${props.$accent}55`
        : '0 8px 24px -14px rgba(15, 23, 42, 0.12)'
      : 'none'};

  &:hover {
    background: ${(props) => (props.theme.mode === 'dark' ? props.$accentSoft : '#fff')};
    border-color: ${(props) => props.$accent}88;
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.$accent};
    outline-offset: 2px;
  }
`;

const ModeIcon = styled.div<{ $accent: string; $accentSoft: string; $active?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  color: ${(props) => (props.$active ? '#fff' : props.$accent)};
  background: ${(props) =>
    props.$active
      ? `linear-gradient(135deg, ${props.$accent}, ${props.$accent}cc)`
      : props.$accentSoft};
  transition: all 0.22s ease;
`;

const ModeText = styled.div`
  min-width: 0;
  flex: 1;
`;

const ModeTitle = styled.div<{ $active?: boolean; $accent?: string }>`
  font-size: 15px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  color: ${(props) =>
    props.$active
      ? props.$accent
      : props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.88)'
        : '#1f2937'};
  line-height: 1.3;
`;

const ModeDesc = styled.div`
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-word;
  overflow-wrap: anywhere;
  color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)')};
`;

const ToolContent = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  /* 由外层 Tabs content-holder 统一纵向滚动，这里只裁切横向溢出，避免双竖滚动条 */
  overflow-x: clip;
  overflow-y: visible;
`;

const VIDEO_GENERATION_PATHS = new Set([
  '/workspace/create/video-generation',
  '/workspace/create/text-to-video',
  '/workspace/create/image-to-video',
]);

const VideoGeneration: React.FC<VideoGenerationProps> = ({ enabledModes }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isActiveRoute = VIDEO_GENERATION_PATHS.has(location.pathname);

  const availableModes = useMemo(
    () => MODE_CONFIGS.filter((item) => enabledModes[item.value]),
    [enabledModes]
  );

  const defaultMode = getDefaultVideoGenerationMode(enabledModes);
  const mode =
    resolveVideoGenerationModeWithEnabled(searchParams.get('mode'), enabledModes) ?? defaultMode;

  useEffect(() => {
    if (!mode || !isActiveRoute) return;
    if (searchParams.get('mode') !== mode) {
      navigate(`/workspace/create/video-generation?mode=${mode}`, { replace: true });
    }
  }, [mode, navigate, searchParams, isActiveRoute]);

  const handleModeChange = (nextMode: VideoGenerationMode) => {
    if (nextMode === mode) return;
    navigate(`/workspace/create/video-generation?mode=${nextMode}`);
  };

  if (!mode || availableModes.length === 0) {
    return null;
  }

  return (
    <Container>
      {availableModes.length > 1 && (
        <ModeSwitcher
          role="tablist"
          aria-label={intl.formatMessage({
            id: 'create.videoGeneration.modeSelect',
            defaultMessage: '选择视频生成方式',
          })}
        >
          <ModeGrid $count={availableModes.length}>
            {availableModes.map((item) => {
              const active = mode === item.value;
              return (
                <ModeCard
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  $active={active}
                  $accent={item.accent}
                  $accentSoft={item.accentSoft}
                  onClick={() => handleModeChange(item.value)}
                >
                  <ModeIcon $accent={item.accent} $accentSoft={item.accentSoft} $active={active}>
                    {item.icon}
                  </ModeIcon>
                  <ModeText>
                    <ModeTitle $active={active} $accent={item.accent}>
                      <FormattedMessage id={item.titleId} defaultMessage={item.titleDefault} />
                    </ModeTitle>
                    <ModeDesc>
                      <FormattedMessage id={item.descId} defaultMessage={item.descDefault} />
                    </ModeDesc>
                  </ModeText>
                </ModeCard>
              );
            })}
          </ModeGrid>
        </ModeSwitcher>
      )}

      <ToolContent role="tabpanel">
        {mode === 'textToVideo' && <TextToVideo embedded />}
        {mode === 'imageToVideo' && <ImageToVideo embedded />}
        {mode === 'videoEdit' && <VideoEdit embedded />}
      </ToolContent>
    </Container>
  );
};

export default VideoGeneration;
