import styled, { keyframes, css } from "styled-components";
import { Link } from "react-router-dom";

// 定义跑马灯效果
export const marqueeGlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

// 定义脉冲效果
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

// 定义选中状态的发光动画
export const activeGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 16px rgba(59, 130, 246, 0.6);
  }
`;

// 定义选中状态的图标脉冲动画
export const iconPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

export const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 72px;
  z-index: 100;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.3)'
    : 'rgba(255, 255, 255, 0.3)'};
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  border-bottom: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
  padding: 0 35px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.scrolled
    ? props.theme.mode === 'dark'
      ? '0 4px 12px rgba(0, 0, 0, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.08)'
    : 'none'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.15) 100%)'
      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%)'};
    z-index: -1;
  }

  @supports not (backdrop-filter: blur(8px)) {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.8)'
      : 'rgba(255, 255, 255, 0.8)'};
  }

  @media (max-width: 768px) {
    padding: 0 24px;
  }
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  width: 100%;
  position: relative;
  z-index: 1;
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const NavLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ant-color-text);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    color: var(--ant-color-primary);
    background: var(--ant-color-bg-container);
  }
`;

export const PrimaryLink = styled(NavLink)`
  color: var(--ant-color-text);
  border: 1px solid var(--ant-color-text);
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  height: 36px;
  display: inline-flex;
  align-items: center;

  &:hover {
    color: var(--ant-color-primary);
    background: var(--ant-color-bg-container);
    border-color: var(--ant-color-primary);
  }

  @media (max-width: 768px) {
    display: none; // 移动端隐藏注册按钮
  }
`;

export const DarkModeButton = styled.button`
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--ant-color-text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--ant-color-text-secondary);
    background: var(--ant-color-bg-container);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }
`;

export const LanguageButton = styled.button`
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  color: var(--ant-color-text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-width: 40px;
  height: 36px;

  &:hover {
    color: var(--ant-color-text-secondary);
    background: var(--ant-color-bg-container);
  }

  .anticon {
    font-size: 1.125rem;
  }
`;

// 语言下拉面板容器（自定义布局）
export const LanguageDropdownPanel = styled.div`
  min-width: 168px;
  padding: 6px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(30, 30, 30, 0.98)'
    : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 8px 24px rgba(0, 0, 0, 0.4)'
    : '0 8px 24px rgba(0, 0, 0, 0.12)'};
`;

export const LanguageDropdownItem = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ant-color-text);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: block;

  &:hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)'};
  }

  &.selected {
    color: var(--ant-color-primary);
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.15)'
      : 'rgba(59, 130, 246, 0.08)'};
    font-weight: 500;
  }
`;

export const IconNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  min-width: 36px;
  height: 36px;
  position: relative;
  transition: all 0.3s ease;

  .anticon {
    font-size: 1.25rem;
    transition: all 0.3s ease;
  }

  /* 选中状态特效 */
  ${props => props.$active && css`
    color: var(--ant-color-primary) !important;
    background: ${props.theme.mode === 'dark' 
      ? 'rgba(59, 130, 246, 0.15)' 
      : 'rgba(59, 130, 246, 0.1)'} !important;
    animation: ${activeGlow} 2s ease-in-out infinite;
    
    .anticon {
      color: var(--ant-color-primary);
      animation: ${iconPulse} 2s ease-in-out infinite;
    }

    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 20px;
      padding: 2px;
      background: linear-gradient(45deg, 
        var(--ant-color-primary), 
        rgba(59, 130, 246, 0.3),
        var(--ant-color-primary)
      );
      background-size: 200% 200%;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: ${marqueeGlow} 3s linear infinite;
      opacity: 0.6;
    }
  `}

  &:hover {
    ${props => !props.$active && css`
      color: var(--ant-color-primary);
      background: var(--ant-color-bg-container);
    `}
  }
`; 