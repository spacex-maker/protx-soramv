import styled, { keyframes, css } from 'styled-components';
import { slideInFromLeft } from '../../styles';

// Apple 风格的缓动函数
const appleEase = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

// ============================================
// 🌌 极光/Aurora 效果 - 类似 macOS Sonoma
// ============================================

// 极光流动动画
const auroraFlow = keyframes`
  0% {
    transform: translateX(-50%) translateY(-50%) rotate(0deg) scale(1);
  }
  33% {
    transform: translateX(-50%) translateY(-50%) rotate(120deg) scale(1.1);
  }
  66% {
    transform: translateX(-50%) translateY(-50%) rotate(240deg) scale(0.9);
  }
  100% {
    transform: translateX(-50%) translateY(-50%) rotate(360deg) scale(1);
  }
`;

// 极光颜色变化
const auroraColors = keyframes`
  0%, 100% {
    filter: hue-rotate(0deg) brightness(1);
  }
  50% {
    filter: hue-rotate(30deg) brightness(1.1);
  }
`;

// 淡入上升动画
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 呼吸动画
const breathe = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

// 渐变文字动画
const textGradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 星星闪烁
const twinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

export const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* 深色基础背景 */
  background: ${props => props.theme.mode === 'dark' 
    ? '#000000'
    : 'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #0d0d2b 100%)'};
  padding: 3rem;
  color: white;
  position: relative;
  overflow: hidden;
  animation: ${slideInFromLeft} 1s ${appleEase} forwards;

  @media (max-width: 768px) {
    display: none;
  }
`;

// 极光层容器
export const AuroraContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  
  /* 整体噪点纹理增加质感 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
  }
`;

// 单个极光光带
export const AuroraBeam = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  border-radius: 50%;
  filter: blur(80px);
  mix-blend-mode: screen;
  animation: ${auroraFlow} ${props => props.duration || '20s'} ease-in-out infinite,
             ${auroraColors} ${props => props.colorDuration || '10s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};

  ${props => props.variant === 1 && css`
    background: radial-gradient(ellipse at center,
      rgba(120, 80, 255, 0.5) 0%,
      rgba(80, 120, 255, 0.3) 30%,
      transparent 70%
    );
    animation-duration: 25s, 12s;
  `}

  ${props => props.variant === 2 && css`
    background: radial-gradient(ellipse at center,
      rgba(255, 80, 180, 0.4) 0%,
      rgba(180, 80, 255, 0.25) 35%,
      transparent 70%
    );
    animation-duration: 30s, 15s;
    animation-delay: -5s, -3s;
  `}

  ${props => props.variant === 3 && css`
    background: radial-gradient(ellipse at center,
      rgba(80, 200, 255, 0.35) 0%,
      rgba(80, 255, 200, 0.2) 40%,
      transparent 70%
    );
    animation-duration: 22s, 8s;
    animation-delay: -10s, -5s;
  `}

  ${props => props.variant === 4 && css`
    background: radial-gradient(ellipse at center,
      rgba(255, 150, 80, 0.3) 0%,
      rgba(255, 80, 120, 0.2) 35%,
      transparent 65%
    );
    animation-duration: 28s, 11s;
    animation-delay: -15s, -7s;
  `}
`;

// 星星粒子
export const Stars = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

export const Star = styled.div`
  position: absolute;
  width: ${props => props.size || '2px'};
  height: ${props => props.size || '2px'};
  background: white;
  border-radius: 50%;
  top: ${props => props.top};
  left: ${props => props.left};
  animation: ${twinkle} ${props => props.duration || '3s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  box-shadow: 0 0 ${props => props.size || '2px'} rgba(255, 255, 255, 0.5);
`;

// 浮动光球容器 (保留兼容)
export const FloatingOrbs = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
`;

export const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: ${breathe} ${props => props.duration || '8s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};

  ${props => props.variant === 1 && css`
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(138, 43, 226, 0.6) 0%, transparent 70%);
    top: -10%;
    left: -5%;
  `}

  ${props => props.variant === 2 && css`
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(0, 191, 255, 0.5) 0%, transparent 70%);
    top: 60%;
    right: -10%;
  `}

  ${props => props.variant === 3 && css`
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 20, 147, 0.4) 0%, transparent 70%);
    bottom: 10%;
    left: 10%;
  `}

  ${props => props.variant === 4 && css`
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(50, 205, 50, 0.35) 0%, transparent 70%);
    top: 30%;
    right: 20%;
  `}
`;

// 内容容器
export const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 560px;
  padding: 2rem;
`;

// 主标题
export const WelcomeText = styled.div`
  animation: ${fadeInUp} 1s ${appleEase} 0.4s both;

  h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 0;
    letter-spacing: -0.02em;
    
    /* Apple 风格渐变文字 */
    background: linear-gradient(
      135deg,
      #fff 0%,
      #a78bfa 25%,
      #818cf8 50%,
      #60a5fa 75%,
      #fff 100%
    );
    background-size: 300% 300%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${textGradient} 8s ease infinite;
    
    filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.3));
  }
`;

// 副标题/描述
export const Description = styled.p`
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin: 1.5rem 0 0;
  max-width: 420px;
  font-weight: 400;
  letter-spacing: 0.01em;
  animation: ${fadeInUp} 1s ${appleEase} 0.6s both;
`;

// 特性标签容器
export const FeatureTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 2.5rem;
  animation: ${fadeInUp} 1s ${appleEase} 0.8s both;
`;

// 单个特性标签
export const FeatureTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.4s ${appleEase};
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
                0 0 30px rgba(139, 92, 246, 0.2);
  }

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.9;
  }
`;

// 装饰线条
export const DecorativeLine = styled.div`
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(139, 92, 246, 0.8) 20%,
    rgba(59, 130, 246, 0.8) 50%,
    rgba(139, 92, 246, 0.8) 80%,
    transparent 100%
  );
  border-radius: 2px;
  margin: 2rem 0;
  animation: ${fadeInUp} 1s ${appleEase} 0.5s both;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
`;

// 底部装饰文字
export const BottomText = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  animation: ${fadeInUp} 1s ${appleEase} 1s both;
  font-weight: 500;
`;
