import styled, { keyframes } from "styled-components";

// 动画效果定义
export const slideInFromLeft = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideInFromRight = keyframes`
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.98);
  }
  100% {
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