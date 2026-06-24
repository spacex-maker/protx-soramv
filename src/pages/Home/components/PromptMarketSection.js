import React, { useContext } from 'react';
import styled, { ThemeContext, keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import {
  ThunderboltFilled,
  SketchOutlined,
  RocketFilled,
  ArrowRightOutlined,
  SafetyCertificateFilled,
  ExperimentOutlined,
  CrownOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  FileTextOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Section, ContentWrapper } from '../styles';

// --- CSS Animations (持续性背景动画) ---

// 漂浮背景
const float = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
`;

// 文字流光动画
const textGradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 按钮扫光
const sheen = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
`;

// --- Styled Components ---

const HeroSection = styled(Section)`
  position: relative;
  overflow: hidden;
  padding: 140px 24px;
  background: ${(props) =>
    props.theme.mode === 'dark' ? '#000000' : '#f5f5f7'};
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  perspective: 1000px; /* 开启 3D 视角 */

  /* 动态光斑背景 1 */
  &::before {
    content: '';
    position: absolute;
    top: -10%;
    left: 10%;
    width: 50vw;
    height: 50vw;
    background: radial-gradient(circle, ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(41, 151, 255, 0.15)'
        : 'rgba(0, 122, 255, 0.1)'} 0%, transparent 60%);
    filter: blur(90px);
    animation: ${float} 25s ease-in-out infinite;
    z-index: 0;
  }

  /* 动态光斑背景 2 */
  &::after {
    content: '';
    position: absolute;
    bottom: -10%;
    right: 5%;
    width: 45vw;
    height: 45vw;
    background: radial-gradient(circle, ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(175, 82, 222, 0.12)'
        : 'rgba(175, 82, 222, 0.08)'} 0%, transparent 60%);
    filter: blur(80px);
    animation: ${float} 20s ease-in-out infinite reverse;
    z-index: 0;
  }
`;

const HeaderContainer = styled(motion.div)`
  max-width: 900px;
  margin: 0 auto 100px;
  position: relative;
  z-index: 1;
`;

// 标题区：精选产品 + 提示词商城 统一成一块
const TitleBlock = styled(motion.div)`
  text-align: center;
  margin-bottom: 0;
`;

const Label = styled(motion.span)`
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: ${(props) => (props.theme.mode === 'dark' ? '#5ac8fa' : '#007aff')};
  margin-bottom: 14px;
  padding: 6px 14px;
  border-radius: 100px;
  background: ${(props) =>
    props.theme.mode === 'dark'
      ? 'rgba(41, 151, 255, 0.12)'
      : 'rgba(0, 122, 255, 0.08)'};
  border: 1px solid ${(props) =>
    props.theme.mode === 'dark'
      ? 'rgba(41, 151, 255, 0.25)'
      : 'rgba(0, 122, 255, 0.2)'};
`;

// 提示词商城 — 大标题主视觉
const MarketTitle = styled(motion.h1)`
  font-size: clamp(42px, 6.5vw, 72px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin: 0;
  color: ${(props) => (props.theme.mode === 'dark' ? '#f5f5f7' : '#1d1d1f')};
  position: relative;
  display: inline-block;

  .gradient-text {
    background: linear-gradient(135deg, #2997ff 0%, #5ac8fa 35%, #af52de 70%, #ff2d55 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${textGradientFlow} 10s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -10px;
    width: 80px;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(90deg, #2997ff, #af52de);
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    font-size: clamp(36px, 10vw, 48px);
    &::after { width: 48px; height: 3px; bottom: -8px; }
  }
`;

const MainTitle = styled(motion.h2)`
  font-size: clamp(48px, 6vw, 80px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 32px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#f5f5f7' : '#1d1d1f')};
  
  .highlight {
    background: linear-gradient(90deg, #2997ff, #af52de, #ff2d55, #2997ff);
    background-size: 300% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${textGradientFlow} 8s linear infinite;
    padding-right: 10px; /* 防止斜体或复杂字体被切 */
  }
`;

const SubDescription = styled(motion.p)`
  font-size: clamp(20px, 2.5vw, 26px);
  line-height: 1.5;
  font-weight: 400;
  color: ${(props) => (props.theme.mode === 'dark' ? '#86868b' : '#6e6e73')};
  max-width: 720px;
  margin: 0 auto;
`;

// 提示词商城介绍段落（独立介绍模块）- 优化排版与可读性
const IntroBlock = styled(motion.div)`
  max-width: 720px;
  margin: 40px auto 36px;
  padding: 28px 36px 30px;
  text-align: left;
  background: ${(props) =>
    props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(255, 255, 255, 0.85)'};
  border-radius: 20px;
  border: 1px solid ${(props) =>
    props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: ${(props) =>
    props.theme.mode === 'dark'
      ? 'none'
      : '0 4px 24px -4px rgba(0, 0, 0, 0.06)'};
  position: relative;
  z-index: 1;

  /* 左侧装饰条 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 24px;
    bottom: 24px;
    width: 4px;
    border-radius: 2px;
    background: linear-gradient(180deg, #2997ff, #af52de);
    opacity: 0.7;
  }

  .intro-text {
    font-size: 17px;
    line-height: 1.85;
    font-weight: 400;
    color: ${(props) => (props.theme.mode === 'dark' ? '#a1a1a6' : '#4a4a4f')};
    margin: 0;
    padding-left: 4px;
  }

  @media (max-width: 768px) {
    margin: 32px 16px 28px;
    padding: 22px 24px 24px;
    text-align: center;

    &::before {
      left: 50%;
      transform: translateX(-50%);
      top: 0;
      bottom: auto;
      width: 48px;
      height: 4px;
      border-radius: 2px;
    }

    .intro-text {
      font-size: 15px;
      line-height: 1.8;
      padding-left: 0;
    }
  }
`;

// 提供商标签区
const ProviderStrip = styled(motion.div)`
  margin-top: 48px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
  text-align: center;

  .provider-label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(props) => (props.theme.mode === 'dark' ? '#86868b' : '#6e6e73')};
    margin-bottom: 20px;
  }

  .provider-pills {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    max-width: 900px;
    margin: 0 auto;
  }

  .pill {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)')};
    background: ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.04)'};
    border: 1px solid ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.08)'};
    border-radius: 100px;
    transition: all 0.25s ease;
  }

  .pill:hover {
    background: ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(41, 151, 255, 0.12)'
        : 'rgba(41, 151, 255, 0.08)'};
    border-color: rgba(41, 151, 255, 0.35);
    color: ${(props) => (props.theme.mode === 'dark' ? '#5ac8fa' : '#007aff')};
  }

  @media (max-width: 768px) {
    margin-top: 32px;
    margin-bottom: 8px;
    .provider-pills { gap: 8px; }
    .pill { padding: 6px 12px; font-size: 12px; }
  }
`;

// Bento Grid
const BentoGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 2;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
  }
`;

const GlassCard = styled(motion.div)`
  grid-column: span ${(props) => props.$colSpan || 4};
  background: ${(props) =>
    props.theme.mode === 'dark'
      ? 'rgba(28, 28, 30, 0.4)'
      : 'rgba(255, 255, 255, 0.5)'};
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid ${(props) =>
    props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(255, 255, 255, 0.6)'};
  border-radius: 32px;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.02);
  
  /* 悬停时的光晕效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
      ${(props) => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'}, 
      transparent 40%);
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
    z-index: 0;
  }

  &:hover::before {
    opacity: 1;
  }

  @media (max-width: 900px) {
    min-height: 320px;
  }
`;

const CardContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardIconWrapper = styled(motion.div)`
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: ${(props) => props.$bg || 'linear-gradient(135deg, #2997ff 0%, #007aff 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  margin-bottom: 32px;
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.3);
`;

const CardTitle = styled.h3`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#1d1d1f')};
  letter-spacing: -0.01em;
`;

const CardText = styled.p`
  font-size: 17px;
  line-height: 1.6;
  color: ${(props) => (props.theme.mode === 'dark' ? '#a1a1a6' : '#86868b')};
  margin: 0;
  flex-grow: 1;
`;

// 装饰性背景图标（大卡片里的虚影）
const DecorIcon = styled(motion.div)`
  position: absolute;
  right: -20px;
  bottom: -40px;
  font-size: 240px;
  opacity: 0.03;
  color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#000')};
  pointer-events: none;
  z-index: 0;
  transform: rotate(-15deg);
`;

const ActionButton = styled(motion.button)`
  margin-top: 80px;
  padding: 20px 48px;
  font-size: 19px;
  font-weight: 600;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  background: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#1d1d1f')};
  color: ${(props) => (props.theme.mode === 'dark' ? '#000' : '#fff')};
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);

  /* 扫光条 */
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: ${sheen} 3s infinite;
  }
`;

// --- Framer Motion Variants (核心动效配置) ---

// 容器：控制子元素的交错播放
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // 子元素间隔 0.2s 出现
      delayChildren: 0.1,
    },
  },
};

// 标题：模糊+向上浮动+透明度
const blurTextVariant = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 40 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] },
  },
};

// 卡片：弹性放大+模糊变清晰
const cardVariant = {
  hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)', y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 80, 
      damping: 15,
      mass: 1 
    },
  },
};

// 图标：在卡片出现后，再弹一下
const iconPopVariant = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 12, delay: 0.2 } 
  }
};

// --- 买断与交易机制介绍区 ---

const MechanismSection = styled(motion.div)`
  max-width: 1100px;
  width: 100%;
  margin: 72px auto 48px;
  position: relative;
  z-index: 2;
`;

const MechanismHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h3 {
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 14px;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f5f5f7' : '#1d1d1f')};
  }

  p {
    font-size: 17px;
    line-height: 1.7;
    max-width: 720px;
    margin: 0 auto;
    color: ${(p) => (p.theme.mode === 'dark' ? '#86868b' : '#6e6e73')};
  }
`;

const MechanismGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  > *:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;

    > *:last-child:nth-child(odd) {
      grid-column: auto;
    }
  }
`;

const MechanismCard = styled(motion.div)`
  padding: 24px 26px;
  border-radius: 20px;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'rgba(28, 28, 30, 0.55)'
      : 'rgba(255, 255, 255, 0.72)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${(p) =>
    p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: ${(p) =>
    p.theme.mode === 'dark'
      ? 'none'
      : '0 4px 24px -6px rgba(0, 0, 0, 0.06)'};

  .card-top {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 12px;
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #fff;
    background: ${(p) => p.$bg || 'linear-gradient(135deg, #2997ff, #5856d6)'};
    box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.25);
  }

  h4 {
    font-size: 17px;
    font-weight: 700;
    margin: 0 0 4px;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f5f5f7' : '#1d1d1f')};
    line-height: 1.35;
  }

  .card-desc {
    font-size: 14px;
    line-height: 1.75;
    color: ${(p) => (p.theme.mode === 'dark' ? '#a1a1a6' : '#6e6e73')};
    margin: 0;
  }
`;

const MechanismNote = styled(motion.div)`
  margin-top: 24px;
  padding: 20px 24px;
  border-radius: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.1)'
      : 'rgba(99, 102, 241, 0.06)'};
  border: 1px solid ${(p) =>
    p.theme.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.28)'
      : 'rgba(99, 102, 241, 0.2)'};

  .note-icon {
    font-size: 20px;
    color: #6366f1;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .note-title {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 6px;
    color: ${(p) => (p.theme.mode === 'dark' ? '#e5e5e5' : '#1e293b')};
  }

  .note-body {
    font-size: 13px;
    line-height: 1.7;
    margin: 0;
    color: ${(p) => (p.theme.mode === 'dark' ? '#a3a3a3' : '#64748b')};
  }
`;

const MECHANISM_ITEMS = [
  {
    id: 'view',
    icon: EyeOutlined,
    bg: 'linear-gradient(135deg, #2997ff 0%, #5856d6 100%)',
    titleId: 'market.mechanism.view.title',
    descId: 'market.mechanism.view.desc',
  },
  {
    id: 'buyout',
    icon: CrownOutlined,
    bg: 'linear-gradient(135deg, #ff9500 0%, #ff3b30 100%)',
    titleId: 'market.mechanism.buyout.title',
    descId: 'market.mechanism.buyout.desc',
  },
  {
    id: 'dualPrice',
    icon: ThunderboltFilled,
    bg: 'linear-gradient(135deg, #fa8c16 0%, #f59e0b 100%)',
    titleId: 'market.mechanism.dualPrice.title',
    descId: 'market.mechanism.dualPrice.desc',
  },
  {
    id: 'protection',
    icon: LockOutlined,
    bg: 'linear-gradient(135deg, #30b0c7 0%, #5856d6 100%)',
    titleId: 'market.mechanism.protection.title',
    descId: 'market.mechanism.protection.desc',
  },
  {
    id: 'transfer',
    icon: SwapOutlined,
    bg: 'linear-gradient(135deg, #ea580c 0%, #fbbf24 100%)',
    titleId: 'market.mechanism.transfer.title',
    descId: 'market.mechanism.transfer.desc',
  },
  {
    id: 'auth',
    icon: SafetyCertificateOutlined,
    bg: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    titleId: 'market.mechanism.auth.title',
    descId: 'market.mechanism.auth.desc',
  },
  {
    id: 'myPrompts',
    icon: FileTextOutlined,
    bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    titleId: 'market.mechanism.myPrompts.title',
    descId: 'market.mechanism.myPrompts.desc',
  },
];

// 兼容的 AI 提供商（品牌名保持英文）
const PROVIDERS = [
  'OpenAI', 'Google', 'Anthropic', 'ByteDance', 'Midjourney', 'Runway', 'Kling',
  'Luma', 'Black Forest Labs', 'Suno', 'ElevenLabs', 'Ideogram', 'Recraft',
  'Qwen', 'Hailuo', 'Veed', 'Topaz', 'Grok', 'Kie', 'Wan',
];

const PromptMarketSection = () => {
  const theme = useContext(ThemeContext);
  const intl = useIntl();
  const navigate = useNavigate();

  // 简单的鼠标移动效果处理（可选）
  const handleMouseMove = (e) => {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  return (
    <HeroSection onMouseMove={handleMouseMove}>
      <ContentWrapper style={{ width: '100%', maxWidth: '1400px' }}>
        
        {/* 头部区域 */}
        <HeaderContainer
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <TitleBlock variants={blurTextVariant}>
            <Label theme={theme}>
              {intl.formatMessage({ id: 'market.sectionTag', defaultMessage: 'PROMPT MARKET' })}
            </Label>
            <MarketTitle theme={theme}>
              <span className="gradient-text">
                {intl.formatMessage({ id: 'market.label', defaultMessage: 'PROMPT MARKETPLACE' })}
              </span>
            </MarketTitle>
          </TitleBlock>

          <IntroBlock theme={theme} variants={blurTextVariant}>
            <p className="intro-text">
              {intl.formatMessage({
                id: 'market.intro',
                defaultMessage: 'Prompt Market is a discovery, trade, and reuse platform for AI prompts. Find battle-tested recipes for Midjourney, Runway, Sora, and more—import with one click, or list your best prompts and earn.'
              })}
            </p>
          </IntroBlock>
          
          <MainTitle variants={blurTextVariant} theme={theme}>
             {intl.formatMessage({ id: 'market.h1', defaultMessage: 'Unleash your' })} <br/>
             <span className="highlight">
               {intl.formatMessage({ id: 'market.h1.highlight', defaultMessage: 'Creative Intelligence.' })}
             </span>
          </MainTitle>
          
          <SubDescription variants={blurTextVariant} theme={theme}>
            {intl.formatMessage({ id: 'market.sub', defaultMessage: 'The premium destination for AI prompts. Verified recipes for Midjourney, ChatGPT, and Sora. Stop guessing, start creating.' })}
          </SubDescription>

          <ProviderStrip
            theme={theme}
            variants={blurTextVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="provider-label">
              {intl.formatMessage({ id: 'market.providers.title', defaultMessage: 'Works with leading models & platforms' })}
            </div>
            <div className="provider-pills">
              {PROVIDERS.map((name) => (
                <span key={name} className="pill">{name}</span>
              ))}
            </div>
          </ProviderStrip>
        </HeaderContainer>

        {/* Bento Grid 布局 */}
        <BentoGrid
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {/* Card 1: 大卡片 (7列) */}
          <GlassCard 
            theme={theme} 
            $colSpan={7} 
            variants={cardVariant}
            className="glass-card"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <CardContent>
              <CardIconWrapper variants={iconPopVariant}>
                <ThunderboltFilled />
              </CardIconWrapper>
              <CardTitle theme={theme}>
                {intl.formatMessage({ id: 'market.card1.title', defaultMessage: 'Instant Integration' })}
              </CardTitle>
              <CardText theme={theme} style={{ maxWidth: '85%' }}>
                {intl.formatMessage({ id: 'market.card1.desc', defaultMessage: 'Skip the prompt engineering learning curve. Import battle-tested prompts directly into your workflow with one click.' })}
              </CardText>
            </CardContent>
            <DecorIcon theme={theme} initial={{ rotate: -15 }} animate={{ rotate: 0, transition: { duration: 10, repeat: Infinity, repeatType: 'mirror' }}}>
               <RocketFilled />
            </DecorIcon>
          </GlassCard>

          {/* Card 2: 中卡片 (5列) */}
          <GlassCard 
            theme={theme} 
            $colSpan={5} 
            variants={cardVariant}
            className="glass-card"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <CardContent>
              <CardIconWrapper variants={iconPopVariant} $bg="linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)">
                <SketchOutlined />
              </CardIconWrapper>
              <CardTitle theme={theme}>
                {intl.formatMessage({ id: 'market.card2.title', defaultMessage: 'Monetize Creativity' })}
              </CardTitle>
              <CardText theme={theme}>
                {intl.formatMessage({ id: 'market.card2.desc', defaultMessage: 'Turn your best prompts into passive income. Join thousands of creators earning from their AI expertise.' })}
              </CardText>
            </CardContent>
          </GlassCard>

          {/* Card 3: 中卡片 (5列) */}
          <GlassCard 
            theme={theme} 
            $colSpan={5} 
            variants={cardVariant}
            className="glass-card"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <CardContent>
              <CardIconWrapper variants={iconPopVariant} $bg="linear-gradient(135deg, #30B0C7 0%, #5856D6 100%)">
                <SafetyCertificateFilled />
              </CardIconWrapper>
              <CardTitle theme={theme}>
                {intl.formatMessage({ id: 'market.card3.title', defaultMessage: 'Verified Quality' })}
              </CardTitle>
              <CardText theme={theme}>
                {intl.formatMessage({ id: 'market.card3.desc', defaultMessage: 'Every listing is manually reviewed and tested. We guarantee consistent results across different models.' })}
              </CardText>
            </CardContent>
          </GlassCard>

          {/* Card 4: 大卡片 (7列) - 探索更多 */}
          <GlassCard 
            theme={theme} 
            $colSpan={7} 
            variants={cardVariant}
            className="glass-card"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            style={{ cursor: 'pointer', background: theme.mode === 'dark' ? 'linear-gradient(120deg, #1c1c1e 0%, #2c2c2e 100%)' : '#fff' }}
            onClick={() => navigate('/workspace/prompt-market')}
          >
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
                <div>
                   <CardIconWrapper variants={iconPopVariant} $bg="linear-gradient(135deg, #32D74B 0%, #00C7BE 100%)" style={{ width: 56, height: 56, fontSize: 24, marginBottom: 20 }}>
                      <ExperimentOutlined />
                   </CardIconWrapper>
                   <CardTitle theme={theme} style={{ fontSize: 32 }}>
                     {intl.formatMessage({ id: 'market.card4.title', defaultMessage: 'Explore the Lab' })}
                   </CardTitle>
                   <CardText theme={theme}>
                     {intl.formatMessage({ id: 'market.card4.desc', defaultMessage: 'Discover over 10,000+ assets generated by community.' })}
                   </CardText>
                </div>
                <motion.div 
                   whileHover={{ x: 10 }}
                   style={{ 
                      width: 80, height: 80, borderRadius: '50%', background: theme.mode === 'dark' ? '#fff' : '#000', color: theme.mode === 'dark' ? '#000' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
                   }}
                >
                   <ArrowRightOutlined />
                </motion.div>
             </div>
          </GlassCard>
        </BentoGrid>

        <MechanismSection
          theme={theme}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={containerVariants}
        >
          <MechanismHeader theme={theme}>
            <motion.h3 variants={blurTextVariant}>
              {intl.formatMessage({
                id: 'market.mechanism.title',
                defaultMessage: 'Trading & Buyout',
              })}
            </motion.h3>
            <motion.p variants={blurTextVariant}>
              {intl.formatMessage({
                id: 'market.mechanism.subtitle',
                defaultMessage:
                  'Dual-track pricing with view purchase and exclusive buyout. After buyout, the holder controls transfer and authorization—both off by default until enabled.',
              })}
            </motion.p>
          </MechanismHeader>

          <MechanismGrid>
            {MECHANISM_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <MechanismCard
                  key={item.id}
                  theme={theme}
                  $bg={item.bg}
                  variants={cardVariant}
                  className="glass-card"
                >
                  <div className="card-top">
                    <div className="icon-wrap" $bg={item.bg}>
                      <Icon />
                    </div>
                    <h4>
                      {intl.formatMessage({
                        id: item.titleId,
                        defaultMessage: item.id,
                      })}
                    </h4>
                  </div>
                  <p className="card-desc">
                    {intl.formatMessage({
                      id: item.descId,
                      defaultMessage: '',
                    })}
                  </p>
                </MechanismCard>
              );
            })}
          </MechanismGrid>

          <MechanismNote theme={theme} variants={blurTextVariant}>
            <ThunderboltFilled className="note-icon" />
            <div>
              <p className="note-title">
                {intl.formatMessage({
                  id: 'market.mechanism.note.title',
                  defaultMessage: 'Good to know',
                })}
              </p>
              <p className="note-body">
                {intl.formatMessage({
                  id: 'market.mechanism.note.body',
                  defaultMessage:
                    'All trades settle in TOKEN. Transfer buyout and authorization are controlled by the current buyout holder—not enabled by default.',
                })}
              </p>
            </div>
          </MechanismNote>
        </MechanismSection>

        {/* 底部 CTA 按钮 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
        >
          <ActionButton 
            theme={theme} 
            onClick={() => navigate('/workspace/prompt-market')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {intl.formatMessage({ id: 'market.cta', defaultMessage: 'Launch Prompt Market' })} <ArrowRightOutlined />
          </ActionButton>
        </motion.div>

      </ContentWrapper>
    </HeroSection>
  );
};

export default PromptMarketSection;