import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  SoundOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  SmileOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  ThunderboltOutlined,
  PlayCircleFilled,
  PauseCircleFilled,
} from '@ant-design/icons';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';

const wavePulse = keyframes`
  0%, 100% { transform: scaleY(0.35); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StyledSection = styled(Section)`
  position: relative;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(180deg, #050508 0%, #0a0812 50%, #050508 100%)'
    : 'linear-gradient(180deg, #f8f6ff 0%, #fff 50%, #f5f3ff 100%)'};

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 30%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(131, 56, 236, 0.15) 0%, transparent 65%);
    filter: blur(80px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: 10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 65%);
    filter: blur(60px);
    pointer-events: none;
  }
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const DemoPanel = styled(motion.div)`
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(18, 16, 28, 0.85)'
    : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(131, 56, 236, 0.25)'
    : 'rgba(131, 56, 236, 0.15)'};
  border-radius: 28px;
  padding: 32px;
  backdrop-filter: blur(20px);
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 24px 48px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
    : '0 24px 48px -12px rgba(131, 56, 236, 0.12)'};

  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 20px;
  }
`;

const DemoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const EngineBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(131, 56, 236, 0.2), rgba(59, 130, 246, 0.15));
  color: ${props => props.theme.mode === 'dark' ? '#c4b5fd' : '#7c3aed'};
  border: 1px solid rgba(131, 56, 236, 0.3);
`;

const PlayButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  background: linear-gradient(135deg, #8338ec, #3b82f6);
  box-shadow: 0 8px 24px rgba(131, 56, 236, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 32px rgba(131, 56, 236, 0.5);
  }
`;

const TextDisplay = styled.div`
  min-height: 72px;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.35)'
    : 'rgba(131, 56, 236, 0.04)'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(131, 56, 236, 0.1)'};
  font-size: 16px;
  line-height: 1.7;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.88)' : '#374151'};

  .cursor {
    display: inline-block;
    width: 2px;
    height: 1.1em;
    background: #8338ec;
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }
`;

const WaveformRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 56px;
  margin-bottom: 24px;
  padding: 0 16px;
`;

const WaveBar = styled.div`
  width: 4px;
  height: ${props => props.$height}px;
  border-radius: 4px;
  background: linear-gradient(180deg, #8338ec, #3b82f6);
  transform-origin: center;
  animation: ${wavePulse} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  opacity: ${props => props.$active ? 1 : 0.35};
`;

const VoiceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(131, 56, 236, 0.08)'
    : 'rgba(131, 56, 236, 0.06)'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(131, 56, 236, 0.2)'
    : 'rgba(131, 56, 236, 0.12)'};
`;

const VoiceAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const VoiceInfo = styled.div`
  flex: 1;
  min-width: 0;

  .name {
    font-weight: 600;
    font-size: 14px;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
    margin-bottom: 2px;
  }

  .meta {
    font-size: 12px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#6e6e73'};
  }
`;

const EmotionTag = styled.span`
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.25);
  white-space: nowrap;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  padding: 20px;
  border-radius: 18px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.06)'};
  transition: border-color 0.3s ease, transform 0.3s ease;

  &:hover {
    border-color: ${props => props.$accent || '#8338ec'}44;
    transform: translateY(-2px);
  }

  .icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-bottom: 12px;
    background: ${props => `${props.$accent || '#8338ec'}18`};
    color: ${props => props.$accent || '#8338ec'};
  }

  .title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
  }

  .desc {
    font-size: 13px;
    line-height: 1.5;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#6e6e73'};
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 32px;
`;

const StatItem = styled.div`
  .value {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #8338ec, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }

  .label {
    font-size: 13px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#6e6e73'};
    margin-top: 4px;
  }
`;

const CTAButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border: none;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #8338ec, #3b82f6, #8338ec);
  background-size: 200% 200%;
  animation: ${gradientFlow} 6s ease infinite;
  box-shadow: 0 12px 32px rgba(131, 56, 236, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(131, 56, 236, 0.45);
  }
`;

const SectionTag = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-bottom: 16px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(131, 56, 236, 0.15)'
    : 'rgba(131, 56, 236, 0.1)'};
  color: #8338ec;
  border: 1px solid rgba(131, 56, 236, 0.25);
`;

const WAVE_HEIGHTS = [12, 28, 18, 36, 22, 40, 16, 32, 24, 38, 14, 30, 20, 34, 26, 42, 18, 28, 22, 36];

const SpeechGenerationSection = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [emotionIndex, setEmotionIndex] = useState(0);
  const fullTextRef = useRef('');

  const demoText = intl.formatMessage({
    id: 'home.speech.demo.text',
    defaultMessage: '欢迎来到 AI2OBJ，让文字拥有温度与情感。只需输入文案，选择音色与情绪，即可生成专业级配音。',
  });

  const voices = [
    {
      name: intl.formatMessage({ id: 'home.speech.demo.voice1.name', defaultMessage: '温柔女声' }),
      meta: intl.formatMessage({ id: 'home.speech.demo.voice1.meta', defaultMessage: '中文 · 情感丰富' }),
      emoji: '🎙️',
      color: 'linear-gradient(135deg, #8338ec, #a855f7)',
    },
    {
      name: intl.formatMessage({ id: 'home.speech.demo.voice2.name', defaultMessage: '磁性男声' }),
      meta: intl.formatMessage({ id: 'home.speech.demo.voice2.meta', defaultMessage: '中文 · 沉稳大气' }),
      emoji: '🎤',
      color: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    },
    {
      name: intl.formatMessage({ id: 'home.speech.demo.voice3.name', defaultMessage: 'English Narrator' }),
      meta: intl.formatMessage({ id: 'home.speech.demo.voice3.meta', defaultMessage: 'English · Professional' }),
      emoji: '🗣️',
      color: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    },
  ];

  const emotions = [
    intl.formatMessage({ id: 'home.speech.demo.emotion1', defaultMessage: '自然' }),
    intl.formatMessage({ id: 'home.speech.demo.emotion2', defaultMessage: '热情' }),
    intl.formatMessage({ id: 'home.speech.demo.emotion3', defaultMessage: '温柔' }),
    intl.formatMessage({ id: 'home.speech.demo.emotion4', defaultMessage: '专业' }),
  ];

  const features = [
    {
      icon: <CustomerServiceOutlined />,
      titleId: 'home.speech.feature.voices.title',
      titleDefault: '百种音色',
      descId: 'home.speech.feature.voices.desc',
      descDefault: '男声、女声、童声、英文旁白，热门音色一键切换，支持收藏常用声音。',
      accent: '#8338ec',
    },
    {
      icon: <GlobalOutlined />,
      titleId: 'home.speech.feature.bilingual.title',
      titleDefault: '中英双语',
      descId: 'home.speech.feature.bilingual.desc',
      descDefault: '原生支持中文与英文合成，自动识别语言，跨语种内容一次搞定。',
      accent: '#3b82f6',
    },
    {
      icon: <SmileOutlined />,
      titleId: 'home.speech.feature.emotion.title',
      titleDefault: '情绪调控',
      descId: 'home.speech.feature.emotion.desc',
      descDefault: '自然、热情、温柔、专业等多种情绪预设，让每一句都更有感染力。',
      accent: '#06b6d4',
    },
    {
      icon: <DownloadOutlined />,
      titleId: 'home.speech.feature.export.title',
      titleDefault: '即时导出',
      descId: 'home.speech.feature.export.desc',
      descDefault: '生成完毕即可在线试听，支持 MP3 下载，直接用于视频配音与有声内容。',
      accent: '#10b981',
    },
  ];

  useEffect(() => {
    fullTextRef.current = demoText;
    setTypedText('');
  }, [demoText]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    let charIndex = 0;
    setTypedText('');

    const typeInterval = setInterval(() => {
      charIndex += 1;
      if (charIndex <= fullTextRef.current.length) {
        setTypedText(fullTextRef.current.slice(0, charIndex));
      } else {
        charIndex = 0;
        setTypedText('');
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, [isPlaying, demoText]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const voiceInterval = setInterval(() => {
      setVoiceIndex(prev => (prev + 1) % voices.length);
    }, 3500);

    const emotionInterval = setInterval(() => {
      setEmotionIndex(prev => (prev + 1) % emotions.length);
    }, 2800);

    return () => {
      clearInterval(voiceInterval);
      clearInterval(emotionInterval);
    };
  }, [isPlaying, voices.length, emotions.length]);

  const handleCTA = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/workspace/create/speech-generation' : '/signup');
  };

  const currentVoice = voices[voiceIndex];

  return (
    <StyledSection>
      <ContentWrapper>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <SectionTag>
            <SoundOutlined style={{ marginRight: 6 }} />
            {intl.formatMessage({ id: 'home.speech.tag', defaultMessage: '全新上线' })}
          </SectionTag>
          <SectionTitle>
            {intl.formatMessage({ id: 'home.speech.title', defaultMessage: 'AI 语音生成，让文字发声。' })}
          </SectionTitle>
          <SectionSubtitle style={{ marginBottom: 0 }}>
            {intl.formatMessage({
              id: 'home.speech.subtitle',
              defaultMessage: '基于豆包 TTS 2.0 引擎，输入文案、选择音色与情绪，秒级生成专业配音。适用于短视频旁白、有声读物、广告配音与多语种内容创作。',
            })}
          </SectionSubtitle>
        </motion.div>

        <LayoutGrid>
          <DemoPanel
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <DemoHeader>
              <EngineBadge>
                <ThunderboltOutlined />
                {intl.formatMessage({ id: 'home.speech.engine', defaultMessage: 'Doubao TTS 2.0' })}
              </EngineBadge>
              <PlayButton
                type="button"
                onClick={() => setIsPlaying(prev => !prev)}
                aria-label={isPlaying ? 'pause' : 'play'}
              >
                {isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
              </PlayButton>
            </DemoHeader>

            <TextDisplay>
              {typedText}
              {isPlaying && typedText.length < fullTextRef.current.length && <span className="cursor" />}
            </TextDisplay>

            <WaveformRow>
              {WAVE_HEIGHTS.map((h, i) => (
                <WaveBar
                  key={i}
                  $height={h}
                  $duration={0.6 + (i % 5) * 0.15}
                  $delay={i * 0.05}
                  $active={isPlaying}
                />
              ))}
            </WaveformRow>

            <AnimatePresence mode="wait">
              <motion.div
                key={voiceIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <VoiceRow>
                  <VoiceAvatar $color={currentVoice.color}>{currentVoice.emoji}</VoiceAvatar>
                  <VoiceInfo>
                    <div className="name">{currentVoice.name}</div>
                    <div className="meta">{currentVoice.meta}</div>
                  </VoiceInfo>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={emotionIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25 }}
                    >
                      <EmotionTag>{emotions[emotionIndex]}</EmotionTag>
                    </motion.span>
                  </AnimatePresence>
                </VoiceRow>
              </motion.div>
            </AnimatePresence>
          </DemoPanel>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatsRow>
              <StatItem>
                <div className="value">
                  {intl.formatMessage({ id: 'home.speech.stat.voices', defaultMessage: '100+' })}
                </div>
                <div className="label">
                  {intl.formatMessage({ id: 'home.speech.stat.voicesLabel', defaultMessage: '精选音色' })}
                </div>
              </StatItem>
              <StatItem>
                <div className="value">
                  {intl.formatMessage({ id: 'home.speech.stat.lang', defaultMessage: 'CN/EN' })}
                </div>
                <div className="label">
                  {intl.formatMessage({ id: 'home.speech.stat.langLabel', defaultMessage: '双语支持' })}
                </div>
              </StatItem>
              <StatItem>
                <div className="value">
                  {intl.formatMessage({ id: 'home.speech.stat.speed', defaultMessage: '秒级' })}
                </div>
                <div className="label">
                  {intl.formatMessage({ id: 'home.speech.stat.speedLabel', defaultMessage: '快速生成' })}
                </div>
              </StatItem>
            </StatsRow>

            <FeatureGrid>
              {features.map((feat, idx) => (
                <FeatureCard
                  key={feat.titleId}
                  $accent={feat.accent}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
                >
                  <div className="icon-wrap">{feat.icon}</div>
                  <div className="title">
                    {intl.formatMessage({ id: feat.titleId, defaultMessage: feat.titleDefault })}
                  </div>
                  <div className="desc">
                    {intl.formatMessage({ id: feat.descId, defaultMessage: feat.descDefault })}
                  </div>
                </FeatureCard>
              ))}
            </FeatureGrid>

            <FeatureCard
              $accent="#f59e0b"
              style={{ marginBottom: 28 }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                <ShareAltOutlined />
              </div>
              <div className="title">
                {intl.formatMessage({
                  id: 'home.speech.feature.community.title',
                  defaultMessage: '一键发布社区',
                })}
              </div>
              <div className="desc">
                {intl.formatMessage({
                  id: 'home.speech.feature.community.desc',
                  defaultMessage: '生成的配音可直接发布到 AI 语音社区，与全球创作者分享你的声音作品。',
                })}
              </div>
            </FeatureCard>

            <CTAButton
              type="button"
              onClick={handleCTA}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SoundOutlined />
              {intl.formatMessage({ id: 'home.speech.cta', defaultMessage: '立即体验语音生成' })}
            </CTAButton>
          </motion.div>
        </LayoutGrid>
      </ContentWrapper>
    </StyledSection>
  );
};

export default SpeechGenerationSection;
