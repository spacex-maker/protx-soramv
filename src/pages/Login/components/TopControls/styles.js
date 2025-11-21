import styled from 'styled-components';
import { fadeInScale } from '../../styles';

export const TopRightControls = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
  z-index: 1000;
  animation: ${fadeInScale} 0.8s ease-out 0.7s both;
  
  @media (max-width: 768px) {
    top: 0.5rem;
    right: 0.5rem;
    gap: 0.5rem;
  }
`;

export const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.06)'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.04)' 
    : '#ffffff'};
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  transition: all 0.3s;
  -webkit-tap-highlight-color: transparent;
  backdrop-filter: blur(8px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`; 