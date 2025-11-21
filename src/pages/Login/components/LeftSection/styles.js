import styled, { keyframes, css } from 'styled-components';
import { slideInFromLeft, fadeInScale } from '../../styles';

const gradientShift = keyframes`
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

export const LeftSectionWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-7) 100%)'
    : 'linear-gradient(135deg, #00C6FF 0%, #0072FF 25%, #00E1FF 50%, #0047FF 75%, #00C6FF 100%)'};
  background-size: ${props => props.theme.mode === 'dark' ? '100% 100%' : '400% 400%'};
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  animation: ${slideInFromLeft} 0.8s ease-out;

  ${props => props.theme.mode !== 'dark' && css`
    animation: ${slideInFromLeft} 0.8s ease-out,
               ${gradientShift} 10s ease infinite;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.mode === 'dark' 
      ? 'none'
      : 'linear-gradient(45deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.25) 100%)'};
    pointer-events: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const WelcomeText = styled.div`
  max-width: 480px;
  text-align: center;
  position: relative;
  z-index: 1;
  animation: ${fadeInScale} 0.8s ease-out 0.3s both;

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  p {
    font-size: 1.125rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`; 