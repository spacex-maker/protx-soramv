import styled, { keyframes } from 'styled-components';
import { Button, Card } from 'antd';
import { motion } from 'framer-motion';

// --- 1. 动画定义 ---
export const colorRotate = keyframes`
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
`;

export const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

export const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- 2. 基础容器 ---
export const PageContainer = styled.div`
  min-height: 100vh;
  /* 适配暗黑模式的背景 */
  background: ${props => props.theme.mode === 'dark' ? '#000' : '#f5f5f7'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
  font-family: "SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
`;

export const ContentWrapper = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
`;

export const Section = styled.section`
  padding: 120px 0;
  position: relative;
  background: transparent;
  
  @media (max-width: 768px) {
    padding: 80px 0;
  }
`;

// --- 3. 排版组件 (新增) ---
export const SectionTitle = styled(motion.h2)`
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
`;

export const SectionSubtitle = styled(motion.p)`
  font-size: clamp(16px, 2vw, 20px);
  text-align: center;
  color: ${props => props.theme.mode === 'dark' ? '#86868b' : '#6e6e73'};
  max-width: 800px;
  margin: 0 auto 60px;
  line-height: 1.6;
`;

// --- 4. 按钮组件 ---
export const StyledButton = styled(Button)`
  border-radius: 100px !important;
  height: 48px;
  padding: 0 32px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  }
`;

export const EnterpriseButton = styled(StyledButton)`
  && {
    background: linear-gradient(45deg, #ff0080, #7928ca, #40e0d0);
    background-size: 200% 200%;
    color: white;
    animation: ${gradientShift} 5s ease infinite;
    border: none;
    
    &:hover {
      opacity: 0.9;
      box-shadow: 0 8px 24px rgba(121, 40, 202, 0.4);
    }
  }
`;

// --- 5. 卡片组件 (核心新增) ---

// 通用毛玻璃卡片基类
export const GlassCard = styled(motion.div)`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 30, 32, 0.6)' 
    : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
`;

// Bento Grid 风格卡片
export const BentoCard = styled(GlassCard)`
  padding: 40px;
  height: 100%;
  overflow: hidden;
  position: relative;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 20px 40px -10px rgba(0, 0, 0, 0.3)' 
    : '0 20px 40px -10px rgba(0, 0, 0, 0.05)'};

  &:hover {
    transform: scale(1.02);
    z-index: 2;
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 30px 60px -12px rgba(0, 0, 0, 0.5)' 
      : '0 30px 60px -12px rgba(0, 0, 0, 0.1)'};
  }
`;

// 兼容旧代码的 FeatureCard (映射到新 BentoCard)
export const FeatureCard = styled(BentoCard)`
  text-align: center;
`;

// 兼容旧代码的 PriceCard
export const PriceCard = styled(BentoCard)`
  text-align: center;
  border: ${props => props.popular 
    ? `2px solid ${props.theme.mode === 'dark' ? '#2997ff' : '#0071e3'}`
    : `1px solid ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
  };
`;