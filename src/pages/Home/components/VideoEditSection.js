import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  AudioOutlined,
  FileImageOutlined,
  FieldTimeOutlined,
  ExperimentOutlined,
  RocketOutlined,
  ScissorOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';

const ACCENT = '#13c2c2';
const ACCENT_ALT = '#08979c';

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.92); opacity: 0.55; }
  70% { transform: scale(1.08); opacity: 0; }
  100% { transform: scale(1.08); opacity: 0; }
`;

const StyledSection = styled(Section)`
  position: relative;
  overflow: hidden;
  background: ${(props) =>
    props.theme.mode === 'dark'
      ? 'linear-gradient(180deg, #050508 0%, #06141a 50%, #050508 100%)'
      : 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 48%, #ecfeff 100%)'};

  &::before {
    content: '';
    position: absolute;
    top: 12%;
    left: -6%;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(19, 194, 194, 0.18) 0%, transparent 68%);
    filter: blur(70px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 8%;
    right: -4%;
    width: 440px;
    height: 440px;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.12) 0%, transparent 68%);
    filter: blur(70px);
    pointer-events: none;
  }
`;

const SectionTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(19, 194, 194, 0.18), rgba(24, 144, 255, 0.12));
  color: ${(props) => (props.theme.mode === 'dark' ? '#5cdbd3' : ACCENT_ALT)};
  border: 1px solid rgba(19, 194, 194, 0.35);
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

const DemoPanel = styled(motion.div)`
  background: ${(props) =>
    props.theme.mode === 'dark' ? 'rgba(12, 22, 28, 0.9)' : 'rgba(255, 255, 255, 0.92)'};
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(19, 194, 194, 0.28)' : 'rgba(19, 194, 194, 0.18)'};
  border-radius: 28px;
  padding: 28px;
  backdrop-filter: blur(20px);
  box-shadow: ${(props) =>
    props.theme.mode === 'dark'
      ? '0 24px 48px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 24px 48px -14px rgba(19, 194, 194, 0.18)'};

  @media (max-width: 768px) {
    padding: 20px 16px;
    border-radius: 20px;
  }
`;

const DemoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
`;

const EngineBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(19, 194, 194, 0.2), rgba(24, 144, 255, 0.12));
  color: ${(props) => (props.theme.mode === 'dark' ? '#5cdbd3' : ACCENT_ALT)};
  border: 1px solid rgba(19, 194, 194, 0.3);
`;

const ModeTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ModeTab = styled.button`
  border: 1px solid
    ${(props) =>
      props.$active
        ? props.$accent
        : props.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(15, 23, 42, 0.08)'};
  background: ${(props) =>
    props.$active ? `${props.$accent}18` : 'transparent'};
  color: ${(props) =>
    props.$active
      ? props.$accent
      : props.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.65)'
        : '#64748b'};
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => props.$accent};
    color: ${(props) => props.$accent};
  }
`;

const AssetRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const AssetCard = styled.div`
  position: relative;
  min-height: 86px;
  border-radius: 14px;
  padding: 12px;
  border: 1px dashed ${(props) => `${props.$accent}88`};
  background: ${(props) => `${props.$accent}10`};
  overflow: hidden;

  .icon {
    font-size: 18px;
    color: ${(props) => props.$accent};
    margin-bottom: 8px;
  }

  .label {
    font-size: 12px;
    font-weight: 700;
    color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#0f172a')};
  }

  .meta {
    margin-top: 4px;
    font-size: 11px;
    color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#64748b')};
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 14px;
    box-shadow: inset 0 0 0 1px ${(props) => `${props.$accent}22`};
    pointer-events: none;
  }
`;

const PromptBox = styled.div`
  min-height: 92px;
  padding: 14px 16px;
  border-radius: 16px;
  margin-bottom: 14px;
  background: ${(props) =>
    props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(19, 194, 194, 0.05)'};
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(19, 194, 194, 0.14)'};
  font-size: 13px;
  line-height: 1.65;
  color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.86)' : '#334155')};
`;

const Mention = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 2px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: ${(props) => props.$accent};
`;

const DemoFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatusChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : '#64748b')};

  .dot {
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${ACCENT};

    &::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 1px solid ${ACCENT};
      animation: ${pulseRing} 1.8s ease-out infinite;
    }
  }
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeatureCard = styled(motion.div)`
  padding: 18px 18px 18px 16px;
  border-radius: 18px;
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.06)'};
  background: ${(props) =>
    props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.82)'};
  border-left: 3px solid ${(props) => props.$accent};
  backdrop-filter: blur(10px);

  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.$accent};
    background: ${(props) => `${props.$accent}18`};
    font-size: 16px;
  }

  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.92)' : '#0f172a')};
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.52)' : '#64748b')};
  }
`;

const CtaRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 44px;
  position: relative;
  z-index: 1;
`;

const PrimaryBtn = styled(Button)`
  && {
    height: 48px;
    padding: 0 28px;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, ${ACCENT}, #1890ff, #6366f1);
    background-size: 200% 200%;
    animation: ${gradientFlow} 4s ease infinite;
    box-shadow: 0 10px 28px rgba(19, 194, 194, 0.35);
  }

  &&:hover {
    color: #fff !important;
    transform: translateY(-2px);
  }
`;

const CAPABILITY_KEYS = ['multimodal', 'edit', 'extend'];

const VideoEditSection = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMode((prev) => (prev + 1) % CAPABILITY_KEYS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const t = (id, defaultMessage) => intl.formatMessage({ id, defaultMessage });

  const modes = [
    {
      key: 'multimodal',
      accent: ACCENT,
      icon: <ExperimentOutlined />,
      label: t('home.videoEdit.mode.multimodal', '多模态参考'),
      title: t('home.videoEdit.feature.multimodal.title', '多模态参考生成'),
      desc: t(
        'home.videoEdit.feature.multimodal.desc',
        '组合参考视频、图片与音频，按 Prompt 中 @视频 / @图像 / @音频 精细保持主体特征。'
      ),
      prompt: t(
        'home.videoEdit.demo.prompt.multimodal',
        '以 @视频1 的运镜为主，人物穿着换成 @图像1 的外套，配乐参考 @音频1 的节奏。'
      ),
    },
    {
      key: 'edit',
      accent: '#722ed1',
      icon: <ScissorOutlined />,
      label: t('home.videoEdit.mode.edit', '视频编辑'),
      title: t('home.videoEdit.feature.edit.title', '精准定向编辑'),
      desc: t(
        'home.videoEdit.feature.edit.desc',
        '主体替换、对象增删改、局部重绘修复，动作与运镜可保持不变，改你想改的部分。'
      ),
      prompt: t(
        'home.videoEdit.demo.prompt.edit',
        '保留 @视频1 中人物动作与镜头运动，将背景换成雨夜城市霓虹街景。'
      ),
    },
    {
      key: 'extend',
      accent: '#1890ff',
      icon: <FieldTimeOutlined />,
      label: t('home.videoEdit.mode.extend', '视频延长'),
      title: t('home.videoEdit.feature.extend.title', '无缝视频延长'),
      desc: t(
        'home.videoEdit.feature.extend.desc',
        '以前序视频为轨道起点，用提示词续写下一段叙事，镜头与氛围自然衔接。'
      ),
      prompt: t(
        'home.videoEdit.demo.prompt.extend',
        '承接 @视频1 结尾，镜头缓缓推进至窗外雨景，人物转身离开，画面更沉静。'
      ),
    },
  ];

  const current = modes[activeMode];

  const handleCTA = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/workspace/create/video-generation?mode=videoEdit' : '/signup');
  };

  return (
    <StyledSection id="video-edit">
      <ContentWrapper>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <SectionTag>
            <ScissorOutlined />
            {t('home.videoEdit.tag', 'Seedance 2 · 视频剪辑')}
          </SectionTag>
          <SectionTitle>
            {t('home.videoEdit.title', '视频剪辑 — 参考、编辑、延长一站搞定')}
          </SectionTitle>
          <SectionSubtitle style={{ marginBottom: 0 }}>
            {t(
              'home.videoEdit.subtitle',
              '上传参考视频，可组合图片与音频；用 @素材 精准引用，完成多模态参考生成、定向编辑与无缝延长。基于 Seedance 2 统一能力。'
            )}
          </SectionSubtitle>
        </motion.div>

        <LayoutGrid>
          <DemoPanel
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            <DemoHeader>
              <EngineBadge>
                <ThunderboltOutlined />
                {t('home.videoEdit.engine', 'Seedance 2.0')}
              </EngineBadge>
              <ModeTabs>
                {modes.map((mode, index) => (
                  <ModeTab
                    key={mode.key}
                    type="button"
                    $active={activeMode === index}
                    $accent={mode.accent}
                    onClick={() => setActiveMode(index)}
                  >
                    {mode.label}
                  </ModeTab>
                ))}
              </ModeTabs>
            </DemoHeader>

            <AssetRow>
              <AssetCard $accent={ACCENT}>
                <div className="icon">
                  <VideoCameraOutlined />
                </div>
                <div className="label">{t('home.videoEdit.demo.video', '参考视频')}</div>
                <div className="meta">{t('home.videoEdit.demo.videoMeta', '必填 · 最多 3 段')}</div>
              </AssetCard>
              <AssetCard $accent="#722ed1">
                <div className="icon">
                  <FileImageOutlined />
                </div>
                <div className="label">{t('home.videoEdit.demo.image', '参考图片')}</div>
                <div className="meta">{t('home.videoEdit.demo.imageMeta', '可选 · 最多 9 张')}</div>
              </AssetCard>
              <AssetCard $accent="#1890ff">
                <div className="icon">
                  <AudioOutlined />
                </div>
                <div className="label">{t('home.videoEdit.demo.audio', '参考音频')}</div>
                <div className="meta">{t('home.videoEdit.demo.audioMeta', '可选 · 最多 3 段')}</div>
              </AssetCard>
            </AssetRow>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <PromptBox>
                  {current.prompt.split(/(@视频\d|@图像\d|@音频\d|@Video\d|@Image\d|@Audio\d)/g).map(
                    (part, idx) => {
                      if (/^@(视频|图像|音频|Video|Image|Audio)\d$/.test(part)) {
                        const accent = part.includes('视频') || part.includes('Video')
                          ? ACCENT
                          : part.includes('图像') || part.includes('Image')
                            ? '#722ed1'
                            : '#1890ff';
                        return (
                          <Mention key={`${part}-${idx}`} $accent={accent}>
                            {part}
                          </Mention>
                        );
                      }
                      return <React.Fragment key={idx}>{part}</React.Fragment>;
                    }
                  )}
                </PromptBox>
              </motion.div>
            </AnimatePresence>

            <DemoFooter>
              <StatusChip>
                <span className="dot" />
                {t('home.videoEdit.demo.status', '上传素材 · @ 引用 · 一键生成')}
              </StatusChip>
              <PrimaryBtn
                type="primary"
                icon={<RocketOutlined />}
                onClick={handleCTA}
                style={{ height: 40, padding: '0 18px', fontSize: 13 }}
              >
                {t('home.videoEdit.demo.cta', '尝试此能力')}
              </PrimaryBtn>
            </DemoFooter>
          </DemoPanel>

          <RightCol>
            {modes.map((mode, index) => (
              <FeatureCard
                key={mode.key}
                $accent={mode.accent}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.08 * index }}
                style={{
                  boxShadow:
                    activeMode === index
                      ? `0 12px 28px -16px ${mode.accent}66`
                      : 'none',
                  transform: activeMode === index ? 'translateY(-2px)' : undefined,
                }}
              >
                <div className="head">
                  <div className="icon-wrap">{mode.icon}</div>
                  <h4>{mode.title}</h4>
                </div>
                <p>{mode.desc}</p>
              </FeatureCard>
            ))}
          </RightCol>
        </LayoutGrid>

        <CtaRow>
          <PrimaryBtn type="primary" icon={<RocketOutlined />} onClick={handleCTA}>
            {t('home.videoEdit.cta', '立即体验视频剪辑')}
          </PrimaryBtn>
        </CtaRow>
      </ContentWrapper>
    </StyledSection>
  );
};

export default VideoEditSection;
