import styled, { keyframes } from 'styled-components';
import { Card, Button } from 'antd';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--ant-color-bg-container);
`;

export const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
`;

export const Section = styled.section`
  padding: 80px 0;
  background: ${props => props.background || 'transparent'};
`;

export const StyledButton = styled(Button)`
  border-radius: 20px !important;
  height: 36px;
  padding: 0 20px;

  &.ant-btn-lg {
    height: 40px;
    padding: 0 24px;
    font-size: 16px;
  }
`;

const colorRotate = keyframes`
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
`;

export const EnterpriseButton = styled(StyledButton)`
  &&.ant-btn {
    position: relative;
    overflow: hidden;
    border: none !important;
    background: linear-gradient(
      45deg,
      #ff0080,
      #ff8c00,
      #40e0d0,
      #7b68ee,
      #ff0080
    ) !important;
    background-size: 200% 200% !important;
    animation: ${colorRotate} 10s linear infinite;
    transition: all 0.3s ease;
    color: white !important;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      opacity: 0.95;
      animation-play-state: paused;
    }

    &:active {
      transform: translateY(1px);
    }

    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: inherit;
      filter: blur(10px);
      opacity: 0.5;
      z-index: -1;
    }
  }
`;

export const FeatureCard = styled(Card)`
  height: 100%;
  text-align: center;
  transition: all 0.3s ease;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
      : '0 8px 24px rgba(0, 0, 0, 0.1)'};
  }

  .ant-card-body {
    padding: 24px;
  }

  .icon-wrapper {
    font-size: 36px;
    color: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
    margin-bottom: 16px;
  }
`;

export const PriceCard = styled(Card)`
  height: 100%;
  text-align: center;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  border: ${props => props.popular 
    ? `2px solid ${props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'}`
    : `1px solid ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`};
  transition: all 0.3s ease;
  border-radius: 20px !important;
  overflow: hidden;
  
  .ant-card-body {
    padding: 24px;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
      : '0 8px 24px rgba(0, 0, 0, 0.1)'};
  }

  .price {
    font-size: 48px;
    font-weight: bold;
    color: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
    margin: 16px 0;
    
    .currency {
      font-size: 24px;
      vertical-align: super;
    }
    
    .period {
      font-size: 16px;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
    }
  }
`; 