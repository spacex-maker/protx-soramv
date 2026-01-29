import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Typography, Tooltip } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes, css } from 'styled-components';
import { 
  SendOutlined, 
  VideoCameraFilled, 
  RocketFilled,
  CustomerServiceFilled,
  FileImageFilled,
  CodeSandboxOutlined,
  ThunderboltFilled,
  GatewayOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// --- 1. 极致动效定义 ---

// 核心能量球的呼吸与旋转
const corePulse = keyframes`
  0% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg); }
  50% { transform: scale(1.05) rotate(180deg); filter: hue-rotate(15deg); }
  100% { transform: scale(1) rotate(360deg); filter: hue-rotate(0deg); }
`;

// 背景星尘流动
const stardustMove = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
`;

// 文字光影扫描
const textShimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// 上帝光闪烁
const godRayPulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scaleY(1); }
  50% { opacity: 0.6; transform: scaleY(1.2); }
`;

// --- 2. 宏大容器组件 ---

const UniverseContainer = styled.div`
  position: relative;
  width: 100%;
  height: 85vh; // 占据大部分视口高度，制造压迫感和沉浸感
  min-height: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 40px; // 外部容器大圆角
  margin-top: 20px;
  
  // 动态主题色变量
  --theme-color: ${props => props.$color};
  --theme-glow: ${props => props.$color}80; // 50% opacity
  
  background: ${props => props.theme.mode === 'dark' ? '#050505' : '#ffffff'};
  transition: background 0.5s ease;

  // 这里的边框光晕增加了层次感
  box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};

  @media (max-width: 768px) {
    height: auto; // 移动端不强制高度
    min-height: auto; // 移除最小高度
    border-radius: 20px; // 减小圆角
    margin-top: 16px;
    padding: 40px 20px; // 添加内边距
  }

  @media (max-width: 480px) {
    border-radius: 16px;
    margin-top: 12px;
    padding: 32px 16px;
  }
`;

// 深邃背景层
const DeepSpaceBackground = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0;
  
  // 径向渐变模拟宇宙深处
  background: radial-gradient(
    circle at center 60%, 
    ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#f0f2f5'} 0%, 
    ${props => props.theme.mode === 'dark' ? '#000000' : '#ffffff'} 80%
  );

  // 噪点纹理
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.15;
    mix-blend-mode: overlay;
  }
`;

// 中央能量核心 (Visual Anchor)
const EnergyCore = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--theme-glow) 0%, transparent 70%);
  opacity: 0.4;
  filter: blur(80px);
  z-index: 1;
  animation: ${corePulse} 10s infinite ease-in-out;
  pointer-events: none;
  transition: background 1s ease;

  // 核心光束 (God Ray)
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: 20%;
    width: 60%;
    height: 200%;
    background: linear-gradient(to bottom, transparent, var(--theme-color), transparent);
    opacity: 0.1;
    transform: perspective(500px) rotateX(60deg);
    filter: blur(40px);
    animation: ${godRayPulse} 6s infinite ease-in-out;
  }

  @media (max-width: 768px) {
    width: 300px;
    height: 300px;
    filter: blur(60px);
    opacity: 0.3;
  }
`;

// 巨大的背景文字 (Atmospheric Text)
const BigBackgroundText = styled.div`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16vw; // 极其巨大的文字
  font-weight: 900;
  white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 2px ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
  z-index: 1;
  pointer-events: none;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.05em;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 20vw; // 移动端适当放大
    -webkit-text-stroke: 1px ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
  }
`;

// --- 3. 悬浮控制台 (HUD) ---

const ConsoleWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1000px; // 更宽
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;

  @media (max-width: 768px) {
    gap: 20px;
    padding: 0 16px;
  }

  @media (max-width: 480px) {
    gap: 16px;
    padding: 0 8px;
  }
`;

const ModeSwitcher = styled.div`
  display: flex;
  gap: 16px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'};
  backdrop-filter: blur(20px);
  padding: 8px;
  border-radius: 100px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'};
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    gap: 8px;
    padding: 6px;
    width: 100%;
    border-radius: 20px; // 减小圆角，适配移动端
  }

  @media (max-width: 560px) {
    gap: 6px;
    padding: 6px;
    flex-wrap: wrap;
    justify-content: space-between; // 改为两端对齐，让按钮分布更均匀
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    padding: 6px;
  }
`;

const ModeBtn = styled.button`
  border: none;
  background: ${props => props.$active ? 'var(--theme-color)' : 'transparent'};
  color: ${props => props.$active ? '#000' : props.theme.mode === 'dark' ? '#aaa' : '#666'};
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &:hover {
    color: ${props => props.$active ? '#000' : 'var(--theme-color)'};
    background: ${props => props.$active ? 'var(--theme-color)' : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  }

  svg { font-size: 16px; }

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 13px;
    gap: 5px;
    justify-content: center;
    
    svg { font-size: 13px; }
  }

  @media (max-width: 560px) {
    padding: 8px 12px;
    font-size: 12px;
    gap: 4px;
    flex: 1 1 calc(50% - 3px); // 换行时每行两个，减小间隙
    min-width: 0; // 移除最小宽度限制
    max-width: calc(50% - 3px); // 确保不超过50%
    
    svg { font-size: 12px; }
  }

  @media (max-width: 480px) {
    padding: 7px 10px;
    font-size: 11px;
    gap: 3px;
    
    svg { font-size: 11px; }
  }

  @media (max-width: 380px) {
    padding: 6px 8px;
    font-size: 10px;
    gap: 3px;
    
    svg { font-size: 10px; }
  }
`;

const MainInputBar = styled.div`
  position: relative;
  width: 100%;
  height: 80px; // 更加厚实
  background: ${props => props.theme.mode === 'dark' ? 'rgba(20,20,20,0.7)' : 'rgba(255,255,255,0.8)'};
  backdrop-filter: blur(30px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 12px 0 32px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  box-shadow: 
    0 20px 50px rgba(0,0,0,0.2),
    0 0 0 1px ${props => props.$active ? 'var(--theme-glow)' : 'transparent'} inset;
  transition: all 0.3s ease;

  &:focus-within {
    transform: scale(1.02);
    box-shadow: 
      0 30px 80px rgba(0,0,0,0.3),
      0 0 0 2px var(--theme-color) inset;
  }

  @media (max-width: 768px) {
    height: 60px;
    border-radius: 16px;
    padding: 0 8px 0 20px;
    
    &:focus-within {
      transform: scale(1.01);
    }
  }

  @media (max-width: 480px) {
    height: 52px;
    border-radius: 12px;
    padding: 0 6px 0 16px;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  font-size: 22px;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  font-weight: 500;
  height: 100%;
  outline: none;
  
  &::placeholder {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
    font-weight: 400;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const GenerateBtn = styled.button`
  height: 60px;
  padding: 0 40px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, var(--theme-color) 0%, #fff 200%); // 简单的金属质感
  color: #000; // 假设主题色较亮，文字用黑
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 10px 20px var(--theme-glow);

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
    box-shadow: 0 15px 30px var(--theme-glow);
  }
  
  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 768px) {
    height: 44px;
    padding: 0 24px;
    border-radius: 12px;
    font-size: 14px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    height: 40px;
    padding: 0 20px;
    border-radius: 10px;
    font-size: 13px;
    gap: 4px;
  }
`;

const InspirationTags = styled.div`
  display: flex;
  gap: 12px;
  margin-top: -10px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;

  @media (max-width: 768px) {
    gap: 8px;
    margin-top: -5px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    margin-top: 0;
    
    // 在非常小的屏幕上，可以考虑只显示部分标签或滚动
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 4px;
    
    // 隐藏滚动条但保持功能
    &::-webkit-scrollbar {
      height: 3px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
  }
`;

const TagPill = styled.button`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: ${props => props.theme.mode === 'dark' ? '#888' : '#666'};
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);

  &:hover {
    background: var(--theme-glow);
    color: #fff;
    border-color: transparent;
  }

  @media (max-width: 768px) {
    padding: 5px 12px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 4px 10px;
    font-size: 11px;
    white-space: nowrap;
    flex-shrink: 0; // 防止在横向滚动时被压缩
  }
`;

// 标题组
const HeaderGroup = styled.div`
  text-align: center;
  position: relative;
  z-index: 2;
  margin-bottom: 20px;

  h1 {
    font-size: 64px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -2px;
    background: linear-gradient(180deg, 
      ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} 0%, 
      ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    // 增加一点文字发光
    text-shadow: 0 10px 40px rgba(0,0,0,0.1);

    @media (max-width: 768px) {
      font-size: 36px;
      letter-spacing: -1px;
    }

    @media (max-width: 480px) {
      font-size: 28px;
      letter-spacing: -0.5px;
    }
  }

  p {
    font-size: 20px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
    margin-top: 12px;
    font-weight: 300;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 768px) {
      font-size: 16px;
      max-width: 90%;
      margin-top: 8px;
    }

    @media (max-width: 480px) {
      font-size: 14px;
      margin-top: 6px;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

// --- 4. 配置数据 ---

const MODES = [
  { key: '3d', label: 'Object', icon: <CodeSandboxOutlined />, color: '#00f2ff', bgText: 'OBJECT' },
  { key: 'video', label: 'Motion', icon: <VideoCameraFilled />, color: '#bd00ff', bgText: 'MOTION' },
  { key: 'physical', label: 'Reality', icon: <RocketFilled />, color: '#ffbd00', bgText: 'REALITY' },
  { key: 'audio', label: 'Sonic', icon: <CustomerServiceFilled />, color: '#00ff9d', bgText: 'SONIC' },
];

const SUGGESTIONS = [
  "Cyberpunk helmet, 8k render",
  "Isometric living room, clay style",
  "Golden ring with ruby, macro shot"
];

// --- 5. 主组件 ---

const ThePromptverse = () => {
  const [activeMode, setActiveMode] = useState('3d');
  const [inputValue, setInputValue] = useState('');
  
  const currentMode = MODES.find(m => m.key === activeMode);

  return (
    <UniverseContainer $color={currentMode.color}>
      {/* 1. 环境层 */}
      <DeepSpaceBackground />
      
      {/* 2. 视觉核心：根据颜色变化的能量球 */}
      <EnergyCore />
      
      {/* 3. 巨大的背景文字装饰 */}
      <BigBackgroundText>{currentMode.bgText}</BigBackgroundText>

      {/* 4. 前景内容 */}
      <HeaderGroup>
        <h1>Create Everything.</h1>
        <p>From prompt to reality. The most advanced multimodal generation engine.</p>
      </HeaderGroup>

      <ConsoleWrapper>
        {/* 模式切换胶囊 */}
        <ModeSwitcher>
          {MODES.map(mode => (
            <ModeBtn 
              key={mode.key}
              $active={activeMode === mode.key}
              onClick={() => setActiveMode(mode.key)}
            >
              {mode.icon}
              {mode.label}
            </ModeBtn>
          ))}
        </ModeSwitcher>

        {/* 巨大的输入框 */}
        <MainInputBar $active={!!inputValue}>
          <StyledInput 
            placeholder={`Describe your dream ${currentMode.label.toLowerCase()}...`} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <GenerateBtn>
            Generate <ThunderboltFilled />
          </GenerateBtn>
        </MainInputBar>

        {/* 灵感标签 */}
        <InspirationTags>
          {SUGGESTIONS.map(tag => (
            <TagPill key={tag} onClick={() => setInputValue(tag)}>
              {tag}
            </TagPill>
          ))}
          <TagPill onClick={() => setInputValue('')} style={{borderStyle: 'dashed'}}>
            <GatewayOutlined /> Surprise Me
          </TagPill>
        </InspirationTags>

      </ConsoleWrapper>
    </UniverseContainer>
  );
};

export default ThePromptverse;