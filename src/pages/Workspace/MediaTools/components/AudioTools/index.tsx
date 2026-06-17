import React from 'react';
import {
  CustomerServiceOutlined,
  ScissorOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import AudioCompress from '../AudioCompress';
import AudioConvert from '../AudioConvert';
import AudioClip from '../AudioClip';
import { logMediaToolUsage } from '../../utils/mediaToolUsageLog';
import { AudioToolMode } from './types';

interface AudioToolsProps {
  mode: AudioToolMode;
  onModeChange: (mode: AudioToolMode) => void;
}

interface ModeConfig {
  value: AudioToolMode;
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
    value: 'compress',
    icon: <SoundOutlined />,
    accent: '#8338ec',
    accentSoft: 'rgba(131, 56, 236, 0.12)',
    titleId: 'mediaTools.audioTools.mode.compress',
    titleDefault: '音频压缩',
    descId: 'mediaTools.audioTools.mode.compressDesc',
    descDefault: '减小体积，保持音质',
  },
  {
    value: 'convert',
    icon: <CustomerServiceOutlined />,
    accent: '#7c3aed',
    accentSoft: 'rgba(124, 58, 237, 0.12)',
    titleId: 'mediaTools.audioTools.mode.convert',
    titleDefault: '音频转换',
    descId: 'mediaTools.audioTools.mode.convertDesc',
    descDefault: 'MP3、WAV、AAC 等格式互转',
  },
  {
    value: 'clip',
    icon: <ScissorOutlined />,
    accent: '#0ea5e9',
    accentSoft: 'rgba(14, 165, 233, 0.12)',
    titleId: 'mediaTools.audioTools.mode.clip',
    titleDefault: '音频剪辑',
    descId: 'mediaTools.audioTools.mode.clipDesc',
    descDefault: '裁剪起止，导出片段',
  },
];

const TOOL_CODE_MAP: Record<AudioToolMode, 'audio_compress' | 'audio_convert' | 'audio_clip'> = {
  compress: 'audio_compress',
  convert: 'audio_convert',
  clip: 'audio_clip',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const ModeSwitcher = styled.div`
  margin-bottom: 20px;
  padding: 6px;
  border-radius: 18px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f4f6f9'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#e8ecf1'};
`;

const ModeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  border: 1px solid ${props => props.$active
    ? props.$accent
    : props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  border-radius: 14px;
  background: ${props => props.$active
    ? props.theme.mode === 'dark'
      ? props.$accentSoft
      : '#fff'
    : props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.02)'
      : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: all 0.22s ease;
  box-shadow: ${props => props.$active
    ? props.theme.mode === 'dark'
      ? `0 8px 24px -12px ${props.$accent}55`
      : '0 8px 24px -14px rgba(15, 23, 42, 0.12)'
    : 'none'};

  &:hover {
    background: ${props => props.theme.mode === 'dark' ? props.$accentSoft : '#fff'};
    border-color: ${props => props.$accent}88;
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${props => props.$accent};
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
  color: ${props => props.$active ? '#fff' : props.$accent};
  background: ${props => props.$active
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
  font-weight: ${props => props.$active ? 600 : 500};
  color: ${props => props.$active
    ? props.$accent
    : props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.88)' : '#1f2937'};
  line-height: 1.3;
`;

const ModeDesc = styled.div`
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
`;

const ToolContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const AudioTools: React.FC<AudioToolsProps> = ({ mode, onModeChange }) => {
  const intl = useIntl();

  const handleModeChange = (nextMode: AudioToolMode) => {
    if (nextMode === mode) return;
    onModeChange(nextMode);
    logMediaToolUsage({ toolCode: TOOL_CODE_MAP[nextMode], action: 'tab_view' });
  };

  return (
    <Container>
      <ModeSwitcher role="tablist" aria-label={intl.formatMessage({ id: 'mediaTools.audioTools.modeSelect', defaultMessage: '选择功能' })}>
        <ModeGrid>
          {MODE_CONFIGS.map((item) => {
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

      <ToolContent role="tabpanel">
        {mode === 'compress' && <AudioCompress />}
        {mode === 'convert' && <AudioConvert />}
        {mode === 'clip' && <AudioClip />}
      </ToolContent>
    </Container>
  );
};

export default AudioTools;
