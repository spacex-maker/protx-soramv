import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { slideInFromRight, fadeInScale, marqueeGlow } from '../../styles';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const submitShimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const submitGlowPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 16px rgba(59, 130, 246, 0.45),
      0 0 32px rgba(139, 92, 246, 0.28),
      0 4px 14px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow:
      0 0 22px rgba(59, 130, 246, 0.65),
      0 0 40px rgba(236, 72, 153, 0.35),
      0 6px 20px rgba(139, 92, 246, 0.3);
  }
`;

// 社交媒体的品牌颜色（Google 用白底+边框，与官方「通过 Google 登录」一致）
const SOCIAL_COLORS = {
  google: {
    color: '#ffffff',
    hoverColor: '#f8f9fa',
    borderColor: '#dadce0',
    hoverBorderColor: '#c6c9cc'
  },
  github: {
    color: '#333333',
    hoverColor: '#24292E'
  },
  apple: {
    color: '#000000',
    hoverColor: '#1A1A1A'
  },
  facebook: {
    color: '#4267B2',
    hoverColor: '#385899'
  },
  twitter: {
    color: '#1DA1F2',
    hoverColor: '#1A91DA'
  },
  linkedin: {
    color: '#0077B5',
    hoverColor: '#006399'
  },
  // 中国社交媒体
  wechat: {
    color: '#07C160',
    hoverColor: '#06AD56'
  },
  qq: {
    color: '#12B7F5',
    hoverColor: '#0FA5E0'
  },
  weibo: {
    color: '#E6162D',
    hoverColor: '#D01428'
  },
  alipay: {
    color: '#1677FF',
    hoverColor: '#0958D9'
  },
  phone: {
    color: '#52C41A',
    hoverColor: '#389E0D'
  },
  phone_sms: {
    color: '#52C41A',
    hoverColor: '#389E0D'
  },
  email: {
    color: '#1890FF',
    hoverColor: '#096DD9'
  },
  password: {
    color: '#722ED1',
    hoverColor: '#531DAB'
  }
};

// 默认颜色配置
const DEFAULT_SOCIAL_COLOR = {
  color: '#666666',
  hoverColor: '#444444'
};

// 获取社交媒体颜色，如果不存在则返回默认值
const getSocialColor = (type, property) => {
  const colorConfig = SOCIAL_COLORS[type] || DEFAULT_SOCIAL_COLOR;
  return colorConfig[property];
};

export const RightSectionWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 27, 75, 0.4)'
    : 'transparent'};
  backdrop-filter: ${props => props.theme.mode === 'dark' ? 'blur(20px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.theme.mode === 'dark' ? 'blur(20px)' : 'none'};
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100%;
  animation: ${slideInFromRight} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: flex-start;
    padding-top: 4rem;
  }
`;

export const LoginBox = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'transparent' 
    : 'transparent'};
  border-radius: 1rem;
  box-shadow: none;
  animation: ${fadeInScale} 0.8s ease-out 0.5s both;

  @media (max-width: 768px) {
    padding: 1.5rem;
    box-shadow: none;
  }
`;

export const Logo = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#000000'};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const BorderGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 9999px;
  pointer-events: none;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    border-radius: inherit;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      #1890ff 25%, 
      #40a9ff 50%, 
      #1890ff 75%, 
      transparent 100%
    );
    background-size: 200% 100%;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: 
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: ${marqueeGlow} 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &.active::before {
    opacity: 1;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-border)' 
    : '#e5e7eb'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.04)' 
    : '#f9fafb'};
  color: ${props => props.theme.mode === 'dark' 
    ? '#ffffff' 
    : '#000000'};
  font-size: 1rem;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 16px;
  }

  &:focus {
    outline: none;
    border-color: transparent;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.04)' 
      : '#ffffff'};
  }

  &::placeholder {
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(0, 0, 0, 0.25)'};
  }
`;

export const EmailSuffixButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 3;

  &:hover {
    color: var(--ant-color-text);
  }
`;

export const EmailSuffixDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : '#ffffff'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-border)' 
    : '#e5e7eb'};
  border-radius: 0.5rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  display: none;
  
  &.show {
    display: block;
  }
`;

export const EmailSuffixOption = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--ant-color-text);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'var(--ant-color-primary-bg)'};
    color: var(--ant-color-primary);
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 1.1rem;
  z-index: 3;
  
  &:hover {
    color: var(--ant-color-text);
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 9999px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.25s ease, filter 0.25s ease;
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    #3b82f6 0%,
    #6366f1 18%,
    #8b5cf6 36%,
    #ec4899 54%,
    #f59e0b 72%,
    #3b82f6 100%
  );
  background-size: 300% 300%;
  animation: ${gradientShift} 4s ease infinite, ${submitGlowPulse} 2.5s ease-in-out infinite;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.35),
      transparent
    );
    animation: ${submitShimmer} 2.8s ease-in-out infinite;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.35),
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.35)
    );
    background-size: 200% 100%;
    animation: ${marqueeGlow} 3s linear infinite;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.85;
  }

  span, & > * {
    position: relative;
    z-index: 1;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.06);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
    animation: none;
    filter: grayscale(0.15);
  }
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: var(--ant-color-text-quaternary);
  font-size: 0.875rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'var(--ant-color-border)' 
      : '#e5e7eb'};
  }

  span {
    padding: 0 1rem;
  }
`;

export const SocialLogin = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  max-width: 100%;
`;

export const SocialButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: ${props => {
    const border = getSocialColor(props.socialType, 'borderColor');
    return border ? `1px solid ${border}` : 'none';
  }};
  background: ${props => getSocialColor(props.socialType, 'color')};
  color: ${props => props.socialType === 'google' ? 'inherit' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$unsupported ? 'not-allowed' : 'pointer'};
  transition: all 0.3s;
  font-size: 1.25rem;
  opacity: ${props => props.$unsupported ? 0.45 : 0};
  filter: ${props => props.$unsupported ? 'grayscale(1)' : 'none'};
  animation: ${fadeInScale} 0.5s ease-out forwards;
  animation-delay: ${props => props.index * 0.1 + 0.8}s;

  svg {
    width: 20px;
    height: 20px;
  }

  img {
    display: block;
  }

  &:hover {
    background: ${props => getSocialColor(props.socialType, 'hoverColor')};
    ${props => getSocialColor(props.socialType, 'hoverBorderColor') ? `border-color: ${getSocialColor(props.socialType, 'hoverBorderColor')};` : ''}
    transform: ${props => props.$unsupported ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.$unsupported ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.08)'};
  }

  &:active {
    transform: ${props => props.$unsupported ? 'none' : 'translateY(0)'};
  }
`;

export const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  color: var(--ant-color-text-secondary);
  font-size: 0.875rem;

  a {
    color: var(--ant-color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: var(--ant-color-primary-hover);
    }
  }
`;

export const ErrorText = styled.div`
  color: var(--ant-color-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

export const FormOptionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

export const RememberLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  user-select: none;

  input {
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
    accent-color: var(--ant-color-primary);
  }
`;

export const ForgotPasswordLink = styled(Link)`
  font-size: 0.875rem;
  color: var(--ant-color-text-secondary);
  text-decoration: none;
  padding: 0.25rem 0;
  transition: color 0.3s ease;
  white-space: nowrap;

  &:hover {
    color: var(--ant-color-primary);
  }
`;