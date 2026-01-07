import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { proficiencyLevels } from '../../constants';

// 辅助函数：判断是否是暗黑模式
const isDarkMode = (bgColor) => {
  if (!bgColor || typeof bgColor !== 'string') return false;
  
  try {
    let r, g, b;
    
    // 处理十六进制颜色 (#ffffff 或 #fff)
    if (bgColor.startsWith('#')) {
      const hex = bgColor.replace('#', '');
      if (hex.length === 3) {
        // 短格式 #fff -> #ffffff
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else {
        return false;
      }
    } 
    // 处理 RGB/RGBA 颜色
    else if (bgColor.startsWith('rgb')) {
      const matches = bgColor.match(/\d+/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      } else {
        return false;
      }
    } 
    // 如果颜色值看起来像暗色（包含 'dark'、'black' 等关键词，或数值较小）
    else if (bgColor.toLowerCase().includes('dark') || bgColor.toLowerCase().includes('black')) {
      return true;
    } else {
      return false;
    }
    
    // 计算亮度 (使用相对亮度公式)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 140; // 如果亮度小于 140，认为是暗黑模式
  } catch (e) {
    // 如果解析失败，默认返回 false（浅色模式）
    return false;
  }
};

const ProficiencyRulerContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  /* 半透明玻璃膜效果 */
  background: ${props => {
    const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
    const dark = isDarkMode(bgColor);
    return dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
  }};
  border: 1px solid ${props => {
    const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
    const dark = isDarkMode(bgColor);
    return dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  }};
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 12px 24px;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  min-width: 400px;
  max-width: 90vw;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  /* 使用 ::before 增强模糊效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: ${props => {
      const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
      const dark = isDarkMode(bgColor);
      return dark
        ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.15) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%)';
    }};
    border-radius: 50px;
    z-index: -1;
    pointer-events: none;
  }
  
  /* 降级方案 */
  @supports not (backdrop-filter: blur(20px)) {
    background: ${props => {
      const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
      const dark = isDarkMode(bgColor);
      return dark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    }};
  }

  @media (max-width: 768px) {
    min-width: 320px;
    padding: 10px 20px;
    bottom: 16px;
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    
    &::before {
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
    }
  }
`;

const RulerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  position: relative;

  @media (max-width: 768px) {
    gap: 8px;
    flex-direction: column;
  }
`;

const RulerLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$token.colorTextSecondary};
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 4px;
  }
`;

const RulerScale = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  height: 24px;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 2px;
    width: 100%;
  }
`;

const ScaleSegment = styled.div`
  flex: 1;
  min-width: 0;
  height: 10px;
  background: ${props => props.$color};
  border-radius: 5px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  align-self: center;

  &:hover {
    height: 14px;
    box-shadow: 0 2px 12px ${props => props.$color}60;
    transform: translateY(-2px);
    
    &::before {
      content: '${props => props.$label || ''}';
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 600;
      color: ${props => props.$token?.colorText || '#000'};
      white-space: nowrap;
      background: ${props => props.$token?.colorBgElevated || '#fff'};
      padding: 4px 8px;
      border-radius: 6px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      z-index: 10;
      border: 1px solid ${props => props.$token?.colorBorder || '#ddd'};
    }
    
    &::after {
      content: '${props => props.$range || ''}';
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      color: ${props => props.$token?.colorTextSecondary || '#666'};
      white-space: nowrap;
      background: ${props => props.$token?.colorBgElevated || '#fff'};
      padding: 2px 6px;
      border-radius: 4px;
      z-index: 10;
    }
  }
`;

const InfoButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.$token.colorTextSecondary};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
  flex-shrink: 0;
  margin-left: 8px;
  user-select: none;
  -webkit-user-select: none;
  outline: none;

  &:hover {
    color: ${props => props.$token.colorPrimary};
    background: ${props => props.$token.colorPrimaryBg};
  }

  &:focus {
    outline: none;
  }
`;

const InfoPanel = styled.div`
  position: fixed;
  bottom: 84px; /* 20px (标尺bottom) + 48px (标尺高度) + 16px (间距) */
  left: 50%;
  transform: translateX(-50%) translateZ(0);
  width: 600px;
  max-width: 90vw;
  /* 半透明玻璃膜效果 - 更透明 */
  background: ${props => {
    const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
    const dark = isDarkMode(bgColor);
    return dark ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
  }};
  border: 1px solid ${props => {
    const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
    const dark = isDarkMode(bgColor);
    return dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  }};
  border-radius: 16px;
  box-shadow: ${props => {
    const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
    const dark = isDarkMode(bgColor);
    return dark 
      ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
      : '0 8px 32px rgba(0, 0, 0, 0.15)';
  }};
  padding: 24px;
  z-index: 100;
  animation: slideUp 0.3s ease;
  /* 背景模糊和饱和度增强 */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* 使用 ::before 增强模糊效果 - 参考 header */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: ${props => {
      const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
      const dark = isDarkMode(bgColor);
      return dark
        ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.04) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.04) 100%)';
    }};
    border-radius: 16px;
    z-index: -1;
    pointer-events: none;
  }
  
  /* 顶部高光 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${props => {
      const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
      const dark = isDarkMode(bgColor);
      return dark
        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent)';
    }};
    border-radius: 16px 16px 0 0;
    pointer-events: none;
    z-index: 1;
  }

  /* 降级方案 - 不支持 backdrop-filter 时使用不透明背景 */
  @supports not (backdrop-filter: blur(20px)) {
    background: ${props => {
      const bgColor = props.$token?.colorBgLayout || props.$token?.colorBgElevated || '#ffffff';
      const dark = isDarkMode(bgColor);
      return dark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    }};
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px) translateZ(0);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) translateZ(0);
    }
  }

  @media (max-width: 768px) {
    bottom: 80px; /* 16px (标尺bottom) + 48px (标尺高度) + 16px (间距) */
    width: calc(100vw - 32px);
    padding: 20px;
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    
    &::before {
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
    }
  }
  
  /* 确保内容在模糊层之上 */
  > * {
    position: relative;
    z-index: 2;
  }
`;

const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.$token.colorBorder};
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$token.colorText};
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.$token.colorTextSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 16px;
  user-select: none;
  -webkit-user-select: none;
  outline: none;

  &:hover {
    color: ${props => props.$token.colorText};
    background: ${props => props.$token.colorFillTertiary};
  }

  &:focus {
    outline: none;
  }
`;

const LevelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LevelItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const LevelColorBar = styled.div`
  width: 4px;
  height: 100%;
  background: ${props => props.$color};
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const LevelContent = styled.div`
  flex: 1;
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
`;

const LevelName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$token.colorText};
`;

const LevelRange = styled.span`
  font-size: 12px;
  color: ${props => props.$color || props.$token.colorTextSecondary};
  background: ${props => props.$color ? `${props.$color}20` : props.$token.colorFillTertiary};
  border: 1px solid ${props => props.$color ? `${props.$color}40` : 'transparent'};
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
`;

const LevelDescription = styled.p`
  font-size: 13px;
  color: ${props => props.$token.colorTextSecondary};
  line-height: 1.6;
  margin: 0;
`;

export default function ProficiencyRuler({ token }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <ProficiencyRulerContainer $token={token}>
        <RulerContent>
          <RulerLabel $token={token}>熟练度标尺：</RulerLabel>
          <RulerScale>
            {proficiencyLevels.map((item, index) => (
              <ScaleSegment
                key={index}
                $color={item.color}
                $label={item.level}
                $range={item.range}
                $token={token}
                title={`${item.level} (${item.range})`}
              />
            ))}
          </RulerScale>
          <InfoButton 
            type="button"
            $token={token}
            onClick={() => setShowInfo(!showInfo)}
            title="查看详细说明"
          >
            <QuestionCircleOutlined />
          </InfoButton>
        </RulerContent>
      </ProficiencyRulerContainer>
      
      {showInfo && createPortal(
        <InfoPanel $token={token}>
          <InfoHeader $token={token}>
            <InfoTitle $token={token}>熟练度等级说明</InfoTitle>
            <CloseButton 
              type="button"
              $token={token}
              onClick={() => setShowInfo(false)}
            >
              <CloseOutlined />
            </CloseButton>
          </InfoHeader>
          <LevelList>
            {proficiencyLevels.map((level, index) => (
              <LevelItem key={index}>
                <LevelColorBar $color={level.color} />
                <LevelContent>
                  <LevelHeader>
                    <LevelName $token={token}>{level.level}</LevelName>
                    <LevelRange $token={token} $color={level.color}>{level.range}</LevelRange>
                  </LevelHeader>
                  <LevelDescription $token={token}>
                    {level.description}
                  </LevelDescription>
                </LevelContent>
              </LevelItem>
            ))}
          </LevelList>
        </InfoPanel>,
        document.body
      )}
    </>
  );
}

