import styled, { keyframes } from "styled-components";

// 动画效果定义
export const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const marqueeGlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

export const pulseEffect = keyframes`
  0% {
    transform: scale(0.97);
    opacity: 0.8;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.97);
    opacity: 0.8;
  }
`;

// 发送验证码时的脉冲动画
export const sendingPulse = keyframes`
  0% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-50%) scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
`;

// 发光扩散动画
export const glowRipple = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

// 页面进入动画
export const pageEnterAnimation = keyframes`
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 梦幻背景：光晕缓慢漂浮
const dreamyOrb1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
  33% { transform: translate(8%, -12%) scale(1.1); opacity: 0.8; }
  66% { transform: translate(-5%, 8%) scale(0.95); opacity: 0.5; }
`;
const dreamyOrb2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  50% { transform: translate(-10%, 5%) scale(1.15); opacity: 0.7; }
`;

// 基础样式组件
export const PageContainer = styled.div`
  min-height: 100vh;
  min-height: -webkit-fill-available;
  display: flex;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: ${pageEnterAnimation} 0.6s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
  /* 梦幻基底渐变 */
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, #0f0c29 0%, #1a1535 30%, #24243e 50%, #302b63 70%, #1a1535 100%)'
    : 'linear-gradient(135deg, #e0d5f5 0%, #f5e6ff 25%, #e8f4ff 50%, #fce4ec 75%, #e8e0f8 100%)'};

  /* 梦幻光晕 1 - 紫/蓝 */
  &::before {
    content: '';
    position: absolute;
    width: 80vmax;
    height: 80vmax;
    top: -20vmax;
    right: -20vmax;
    background: radial-gradient(circle, ${props => props.theme.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.35)'
      : 'rgba(167, 139, 250, 0.4)'} 0%, transparent 50%);
    filter: blur(60px);
    animation: ${dreamyOrb1} 18s ease-in-out infinite;
    pointer-events: none;
  }

  /* 梦幻光晕 2 - 粉/紫 */
  &::after {
    content: '';
    position: absolute;
    width: 70vmax;
    height: 70vmax;
    bottom: -15vmax;
    left: -15vmax;
    background: radial-gradient(circle, ${props => props.theme.mode === 'dark'
      ? 'rgba(168, 85, 247, 0.3)'
      : 'rgba(244, 114, 182, 0.35)'} 0%, transparent 50%);
    filter: blur(55px);
    animation: ${dreamyOrb2} 22s ease-in-out infinite;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const VersionTag = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  font-size: 0.75rem;
  color: var(--ant-color-text-quaternary);
  opacity: 0.7;
  z-index: 10;
`;

export const SignupPageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(243, 244, 246, 0.95)'};
  transition: background-color 0.3s ease;
  animation: ${pageEnterAnimation} 0.6s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08), transparent 70%)'
      : 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05), transparent 70%)'};
    animation: ${pulseEffect} 15s infinite linear;
    z-index: 0;
  }
`;

export const ContentWrapper = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

export const PhilosophyQuote = styled.div`
  position: fixed;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  color: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.45)' 
    : 'rgba(0, 0, 0, 0.45)'};
  text-align: center;
  width: 100%;
  padding: 0 1rem;
  z-index: 10;
  animation: ${fadeInScale} 0.5s ease-out forwards;
  animation-delay: 0.8s;
  opacity: 0;

  @media (max-width: 768px) {
    bottom: 4rem;
  }
`;

export const PoweredBy = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.25)' 
    : 'rgba(0, 0, 0, 0.25)'};
  text-align: center;
  width: 100%;
  padding: 0 1rem;
  z-index: 10;
  animation: ${fadeInScale} 0.5s ease-out forwards;
  animation-delay: 0.9s;
  opacity: 0;

  @media (max-width: 768px) {
    bottom: 2rem;
  }
`; 