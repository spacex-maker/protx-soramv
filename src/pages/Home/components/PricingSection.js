import React, { useState, useEffect, useContext } from 'react';
import styled, { keyframes, css, ThemeContext } from 'styled-components';
import { Tag } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import {
  StarFilled,
  RocketFilled,
  CrownFilled,
  CheckCircleFilled,
  RightOutlined,
  LeftOutlined,
  ThunderboltFilled,
  CloudServerOutlined,
  BgColorsOutlined,
  SafetyCertificateFilled,
  ExperimentFilled,
  PictureOutlined,
  EditOutlined,
  AppstoreOutlined,
  BranchesOutlined
} from '@ant-design/icons';
import { Section, ContentWrapper, SectionTitle } from '../styles';
// 导入本地图片
import basicBgImageSrc from '../../../images/home/compressed_f1c9bce0-28da-473c-be4a-822caf0f9484.jpeg';
import proBgImageSrc from '../../../images/home/compressed_e096709f-a8ef-4f19-a580-03db1aa0654e.jpg';
import teamBgImageSrc from '../../../images/home/compressed_5258249b-df9d-4a81-9770-8d7b0fcd6b8d.jpg';

// ==========================================
// 1. 动效定义
// ==========================================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const shine = keyframes`
  0% { 
    background-position: -200% center;
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% { 
    background-position: 200% center;
    opacity: 0.8;
  }
`;

const glow = keyframes`
  0%, 100% { 
    text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
    filter: brightness(1);
  }
  50% { 
    text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
    filter: brightness(1.2);
  }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ==========================================
// 2. 样式组件
// ==========================================

const PricingSectionContainer = styled(Section)`
  position: relative;
  min-height: 800px;
  background: ${props => props.theme.mode === 'dark' ? '#050507' : '#f5f5f7'};
  overflow: hidden;
  
  @media (max-width: 768px) {
    min-height: 600px;
  }
`;

const StarField = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  will-change: transform;
  display: ${props => props.theme.mode === 'dark' ? 'block' : 'none'};
  
  &::before {
    content: "";
    position: absolute;
    width: 2px; height: 2px;
    background: transparent;
    box-shadow: 
      100px 200px #fff, 200px 500px #fff, 400px 100px #fff,
      800px 300px #fff, 600px 700px #fff, 1000px 100px #fff,
      1200px 400px #fff, 300px 800px #fff;
    opacity: 0.3;
    animation: ${float} 20s linear infinite;
  }
`;

const AmbientLight = styled(motion.div)`
  position: absolute;
  top: -20%; left: 50%;
  transform: translateX(-50%);
  width: 800px; height: 800px;
  background: radial-gradient(circle, ${props => props.$color}40 0%, transparent 70%);
  filter: blur(80px);
  z-index: 1;
  will-change: transform, opacity;
  transform: translateZ(0);
  display: ${props => props.theme.mode === 'dark' ? 'block' : 'none'};
`;

const Header = styled.div`
  text-align: center;
  padding-top: 60px;
  position: relative;
  z-index: 10;

  h2 {
    font-size: 42px;
    font-weight: 800;
    margin: 0 0 16px 0;
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(180deg, #fff 0%, #888 100%)' 
      : 'linear-gradient(180deg, #1d1d1f 0%, #6e6e73 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
  }
  
  p { 
    font-size: 16px; 
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}; 
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const CarouselStage = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  z-index: 10;
  padding: 80px 0 120px;
  min-height: 700px;
  transform-style: preserve-3d;
  
  @media (max-width: 768px) {
    min-height: 600px;
    padding: 40px 0 100px;
  }
`;

const Card3D = styled(motion.div)`
  position: absolute;
  width: 420px;
  height: 680px;
  border-radius: 32px;
  
  background-color: ${props => {
    if (props.theme.mode === 'dark') {
      return props.$active ? 'rgba(20, 20, 24, 0.6)' : 'rgba(20, 20, 24, 0.95)';
    } else {
      return props.$active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)';
    }
  }};
  ${props => props.$backgroundImage && css`
    background-image: url(${props.$backgroundImage});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  `}
  
  /* 如果有背景图片，添加遮罩层以确保文字可读性 */
  ${props => props.$backgroundImage && css`
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: ${props.theme.mode === 'dark' 
        ? 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%)' 
        : 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.95) 100%)'};
      border-radius: 32px;
      z-index: 0;
      pointer-events: none;
    }
  `}
  
  backdrop-filter: ${props => props.$active ? 'blur(20px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$active ? 'blur(20px)' : 'none'};
  
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'};
  border-top: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)'};
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform-origin: center center;
  cursor: grab;
  overflow: hidden;
  
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
  transform: translateZ(0);
  transition: backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  
  &:active { cursor: grabbing; }
  
  /* 鼠标悬停时的玻璃膜效果 */
  &:hover {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background-color: ${props => {
      if (props.theme.mode === 'dark') {
        return props.$backgroundImage 
          ? 'rgba(20, 20, 24, 0.25)' 
          : 'rgba(20, 20, 24, 0.4)';
      } else {
        return props.$backgroundImage 
          ? 'rgba(255, 255, 255, 0.5)' 
          : 'rgba(255, 255, 255, 0.75)';
      }
    }};
    border-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(0, 0, 0, 0.18)'};
    border-top-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.4)' 
      : 'rgba(0, 0, 0, 0.25)'};
    box-shadow: ${props => props.$active 
      ? `0 20px 60px -20px ${props.$color}40, 0 0 0 1px ${props.$color}40`
      : props.theme.mode === 'dark'
        ? '0 20px 60px -20px rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 20px 60px -20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)'};
    
    /* 如果有背景图片，hover时调整遮罩层透明度以显示玻璃效果 */
    ${props => props.$backgroundImage && css`
      &::after {
        background: ${props.theme.mode === 'dark' 
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 100%)' 
          : 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.75) 100%)'};
        transition: background 0.3s ease;
      }
    `}
  }

  ${props => props.$active && css`
    box-shadow: 0 20px 60px -20px ${props.$color}40, 0 0 0 1px ${props.$color}40;
    z-index: 100 !important;
  `}

  .icon-wrapper {
    width: 88px; height: 88px;
    border-radius: 24px;
    background: ${props => props.$active ? props.$color : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')};
    display: flex; align-items: center; justify-content: center;
    font-size: 42px;
    color: ${props => props.$active ? '#000' : (props.theme.mode === 'dark' ? '#fff' : '#1d1d1f')};
    margin-bottom: 24px;
    box-shadow: ${props => props.$active ? `0 10px 30px ${props.$color}60` : 'none'};
    transition: background 0.3s, color 0.3s;
    position: relative;
    z-index: 1;
  }

  .card-header { position: relative; z-index: 1; }
  .card-title { 
    h3 { 
      font-size: 36px; 
      font-weight: 800; 
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'}; 
      margin: 0; 
      letter-spacing: 0.5px; 
    }
    span { 
      font-size: 14px; 
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}; 
      text-transform: uppercase; 
      letter-spacing: 2px; 
      font-weight: 600; 
    }
  }
  
  .price {
    font-size: 48px;
    font-weight: 800;
    margin: 16px 0;
    position: relative;
    display: inline-block;
    background: ${props => {
      const color = props.$color || '#2997ff';
      return `linear-gradient(90deg, ${color} 0%, #fff 25%, ${color} 50%, #fff 75%, ${color} 100%)`;
    }};
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${gradientShift} 3s ease infinite;
    position: relative;
    
    /* 炫光扫过效果 */
    &::before {
      content: attr(data-price);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.8) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: ${shine} 3s ease-in-out infinite;
      pointer-events: none;
    }
    
    /* 当有首月价格时，禁用::before伪元素 */
    &.has-first-month::before {
      display: none;
    }
    
    span { 
      font-size: 18px; 
      font-weight: 500; 
      background: ${props => {
        const color = props.$color || '#2997ff';
        return `linear-gradient(90deg, ${color}80 0%, rgba(255,255,255,0.6) 50%, ${color}80 100%)`;
      }};
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: ${gradientShift} 3s ease infinite;
    }
  }

  .features {
    margin-top: 32px; 
    position: relative; 
    z-index: 1;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 380px;
    padding-right: 8px;
    
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255,255,255,0.05)' 
        : 'rgba(0,0,0,0.05)'};
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props => props.$color}80;
      border-radius: 3px;
      transition: background 0.2s;
      
      &:hover {
        background: ${props => props.$color};
      }
    }
    
    /* Firefox 滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: ${props => props.$color}80 ${props => props.theme.mode === 'dark' 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(0,0,0,0.05)'};
    
    .item {
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      font-size: 15px; 
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'};
      padding: 10px 0;
      border-bottom: 1px dashed ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      &:last-child { border-bottom: none; }
      .val { 
        font-weight: 700; 
        color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'}; 
        font-family: 'SF Mono', monospace; 
      }
      .icon { margin-right: 8px; color: ${props => props.$color}; }
    }
  }

  .action-btn {
    width: 100%; height: 56px;
    border-radius: 20px; border: none;
    font-size: 16px; font-weight: 600;
    margin-top: 24px; cursor: pointer;
    background: ${props => props.$active 
      ? (props.theme.mode === 'dark' ? '#fff' : '#1d1d1f') 
      : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')};
    color: ${props => props.$active 
      ? (props.theme.mode === 'dark' ? '#000' : '#fff') 
      : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')};
    transition: transform 0.2s;
    position: relative; z-index: 1;
    &:hover { transform: scale(1.02); }
  }

  &::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' 
      : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)'};
  }
  
  &::before {
    content: ''; position: absolute; bottom: 0; right: 0;
    width: 150px; height: 150px;
    background: radial-gradient(circle at bottom right, ${props => props.$color}20, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
    opacity: ${props => props.$active ? 1 : 0};
    z-index: 0;
  }
  
  /* 玻璃膜层 */
  .glass-overlay {
    position: absolute;
    inset: 0;
    border-radius: 32px;
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(255, 255, 255, 0.4)'};
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    transition: opacity 0.3s ease;
    border: 1px solid ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(255, 255, 255, 0.6)'};
  }
  
  &:hover .glass-overlay {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    width: 340px;
    height: 600px;
    padding: 32px 24px;
  }
`;

const NavBtn = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 64px; height: 64px;
  border-radius: 50%;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255,255,255,0.05)' 
    : 'rgba(0,0,0,0.05)'};
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255,255,255,0.1)' 
    : 'rgba(0,0,0,0.1)'};
  display: flex; align-items: center; justify-content: center;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'}; 
  font-size: 24px;
  cursor: pointer;
  z-index: 50;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  &:hover { 
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255,255,255,0.15)' 
      : 'rgba(0,0,0,0.1)'}; 
    transform: translateY(-50%) scale(1.1); 
    border-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255,255,255,0.3)' 
      : 'rgba(0,0,0,0.2)'}; 
  }
  &.left { left: 40px; }
  &.right { right: 40px; }
  @media (max-width: 768px) { display: none; }
`;

const Indicators = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0; right: 0;
  display: flex; justify-content: center; gap: 16px;
  z-index: 20;

  .dot {
    width: 6px; height: 6px;
    border-radius: 4px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255,255,255,0.2)' 
      : 'rgba(0,0,0,0.2)'};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &.active { 
      width: 40px; 
      background: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'}; 
      box-shadow: ${props => props.theme.mode === 'dark' 
        ? '0 0 15px rgba(255,255,255,0.5)' 
        : '0 0 15px rgba(0,0,0,0.3)'}; 
    }
  }
`;

// ==========================================
// 3. 数据配置（将在组件内部使用国际化）
// ==========================================

// ==========================================
// 4. 逻辑组件
// ==========================================

const CARD_WIDTH = 420;
const GAP = 60;

const PricingCardItem = React.memo(({ plan, index, activeIndex, onDragEnd, setActiveIndex, theme, navigate, isChinese, intl, basicBgImage, proBgImage, teamBgImage }) => {
  const isActive = index === activeIndex;

  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);
  
  const variants = {
    animate: {
      x: offset * (CARD_WIDTH + GAP),
      scale: 1 - absOffset * 0.15,
      zIndex: 100 - absOffset,
      rotateY: offset * -25,
      opacity: Math.max(0, 1 - absOffset * 0.2),
      filter: `brightness(${1 - absOffset * 0.3}) blur(${isActive ? 0 : absOffset * 4}px)`,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 25,
        mass: 0.8
      }
    }
  };

  if (Math.abs(offset) > 2) return null;

  // 价格转换：人民币转美元（汇率约 7:1）
  const getPriceDisplay = () => {
    if (isChinese) {
      return {
        symbol: '¥',
        price: plan.price,
        unit: '/月',
        firstMonthPrice: null
      };
    } else {
      // 专业版特殊处理：首月9.9美元，之后29.9美元
      if (plan.level === 1) {
        return {
          symbol: '$',
          price: '29.9',
          unit: '/month',
          firstMonthPrice: '9.9'
        };
      }
      // 团队版特殊处理：显示99.9美元
      if (plan.level === 2) {
        return {
          symbol: '$',
          price: '99.9',
          unit: '/month',
          firstMonthPrice: null
        };
      }
      // 其他套餐：将人民币价格转换为美元（简单除以7，四舍五入）
      const usdPrice = Math.round(parseFloat(plan.price) / 7);
      return {
        symbol: '$',
        price: usdPrice.toString(),
        unit: '/month',
        firstMonthPrice: null
      };
    }
  };

  const priceDisplay = getPriceDisplay();

  // 根据套餐等级设置背景图片
  const getBackgroundImage = () => {
    if (plan.level === 0) {
      return basicBgImage; // BASIC版 - 使用状态管理的图片
    } else if (plan.level === 1) {
      return proBgImage; // PRO版 - 使用状态管理的图片
    } else if (plan.level === 2) {
      return teamBgImage; // TEAM版 - 使用状态管理的图片
    }
    return null;
  };

  return (
    <Card3D
      $active={isActive}
      $color={plan.color}
      $backgroundImage={getBackgroundImage()}
      theme={theme}
      initial={false}
      animate="animate"
      variants={variants}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={(e, info) => onDragEnd(info)}
      onClick={() => setActiveIndex(index)}
    >
      <div className="glass-overlay" />
      <div className="card-header">
        <div className="icon-wrapper">{plan.icon}</div>
        <div className="card-title">
          <h3>{plan.name}</h3>
          <span>{plan.sub}</span>
          <div 
            className={`price ${priceDisplay.firstMonthPrice ? 'has-first-month' : ''}`} 
            data-price={`${priceDisplay.symbol}${priceDisplay.firstMonthPrice || priceDisplay.price}`}
          >
            {priceDisplay.firstMonthPrice ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: '24px', opacity: 0.5 }}>
                  <span style={{ textDecoration: 'line-through' }}>
                    {priceDisplay.symbol}{priceDisplay.price}
                  </span>
                </div>
                <div style={{ fontSize: '48px', lineHeight: '1' }}>
                  {priceDisplay.symbol}{priceDisplay.firstMonthPrice}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '2px' }}>
                  {intl.formatMessage({ id: 'pricing.then', defaultMessage: 'then' })} {priceDisplay.symbol}{priceDisplay.price}{priceDisplay.unit}
                </div>
              </div>
            ) : (
              <>
                {priceDisplay.symbol}{priceDisplay.price}<span>{priceDisplay.unit}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div 
        className="features"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => {
          // 如果是垂直滚动，阻止事件冒泡，避免触发卡片拖拽
          if (Math.abs(e.touches[0].clientY - (e.currentTarget.scrollTop + e.currentTarget.offsetTop)) > 10) {
            e.stopPropagation();
          }
        }}
      >
        {plan.features.map((f, i) => (
          <div key={i} className="item">
            <span style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{color: plan.color}}>{f.icon}</span> {f.label}
            </span>
            <span className="val">{f.value}</span>
          </div>
        ))}
      </div>

      <button 
        className="action-btn"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/signup');
        }}
      >
        {plan.buttonText}
      </button>

      {plan.popular && (
        <Tag color={plan.color} style={{ position: 'absolute', top: 32, right: 32, border: 'none', fontWeight: 800, fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>
          {plan.popularTag}
        </Tag>
      )}
    </Card3D>
  );
});

const PricingSection = () => {
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();
  const intl = useIntl();
  const { locale } = useLocale();
  const [activeIndex, setActiveIndex] = useState(1); // 默认选中专业版
  const [basicBgImage, setBasicBgImage] = useState(basicBgImageSrc);
  const [proBgImage, setProBgImage] = useState(proBgImageSrc);
  const [teamBgImage, setTeamBgImage] = useState(teamBgImageSrc);
  
  // 判断是否为中文
  const isChinese = locale === 'zh';

  // 使用国际化生成套餐数据
  const plans = [
    {
      level: 0, 
      name: 'BASIC', 
      sub: intl.formatMessage({ id: 'pricing.plan.basic.sub', defaultMessage: '基础版' }), 
      icon: <StarFilled />, 
      color: '#a1a1aa',
      price: '0',
      buttonText: intl.formatMessage({ id: 'pricing.plan.button.select', defaultMessage: '选择此方案' }),
      features: [
        { icon: <ThunderboltFilled />, label: intl.formatMessage({ id: 'pricing.feature.videoQuota', defaultMessage: '视频生成额度' }), value: intl.formatMessage({ id: 'pricing.plan.basic.videoQuota', defaultMessage: '5次/月' }) },
        { icon: <BgColorsOutlined />, label: intl.formatMessage({ id: 'pricing.feature.videoDuration', defaultMessage: '视频时长' }), value: intl.formatMessage({ id: 'pricing.plan.basic.videoDuration', defaultMessage: '6-10秒' }) },
        { icon: <BgColorsOutlined />, label: intl.formatMessage({ id: 'pricing.feature.videoQuality', defaultMessage: '视频画质' }), value: intl.formatMessage({ id: 'pricing.plan.basic.videoQuality', defaultMessage: '720P' }) },
        { icon: <PictureOutlined />, label: intl.formatMessage({ id: 'pricing.feature.sdImage', defaultMessage: 'SD生图' }), value: intl.formatMessage({ id: 'pricing.feature.unlimited', defaultMessage: '无限量' }) },
        { icon: <EditOutlined />, label: intl.formatMessage({ id: 'pricing.feature.promptOptimization', defaultMessage: '提示词优化' }), value: '✓' },
        { icon: <BgColorsOutlined />, label: intl.formatMessage({ id: 'pricing.feature.imageSize', defaultMessage: '生图尺寸' }), value: '1024×1024' },
        { icon: <CloudServerOutlined />, label: intl.formatMessage({ id: 'pricing.feature.storage', defaultMessage: '存储空间' }), value: '1GB' },
      ]
    },
    {
      level: 1, 
      name: 'PRO', 
      sub: intl.formatMessage({ id: 'pricing.plan.pro.sub', defaultMessage: '专业版' }), 
      icon: <RocketFilled />, 
      color: '#2997ff',
      price: '199',
      popular: true,
      popularTag: intl.formatMessage({ id: 'pricing.plan.popular', defaultMessage: 'POPULAR' }),
      buttonText: intl.formatMessage({ id: 'pricing.plan.button.subscribe', defaultMessage: '立即订阅' }),
      features: [
        { icon: <ThunderboltFilled />, label: intl.formatMessage({ id: 'pricing.feature.videoQuota', defaultMessage: '视频生成额度' }), value: intl.formatMessage({ id: 'pricing.plan.pro.videoQuota', defaultMessage: '30次/月' }) },
        { icon: <BgColorsOutlined />, label: intl.formatMessage({ id: 'pricing.feature.videoDuration', defaultMessage: '视频时长' }), value: intl.formatMessage({ id: 'pricing.plan.pro.videoDuration', defaultMessage: '10-15秒' }) },
        { icon: <BgColorsOutlined />, label: intl.formatMessage({ id: 'pricing.feature.videoQuality', defaultMessage: '视频画质' }), value: intl.formatMessage({ id: 'pricing.plan.pro.videoQuality', defaultMessage: '1080P' }) },
        { icon: <AppstoreOutlined />, label: intl.formatMessage({ id: 'pricing.feature.storyboard', defaultMessage: '分镜功能' }), value: '✓' },
        { icon: <CheckCircleFilled />, label: intl.formatMessage({ id: 'pricing.feature.priorityQueue', defaultMessage: '优先队列' }), value: '✓' },
        { icon: <PictureOutlined />, label: intl.formatMessage({ id: 'pricing.feature.sdImage', defaultMessage: 'SD生图' }), value: intl.formatMessage({ id: 'pricing.feature.unlimited', defaultMessage: '无限量' }) },
        { icon: <EditOutlined />, label: intl.formatMessage({ id: 'pricing.feature.promptOptimization', defaultMessage: '提示词优化' }), value: '✓' },
        { icon: <CloudServerOutlined />, label: intl.formatMessage({ id: 'pricing.feature.storage', defaultMessage: '存储空间' }), value: '20GB' },
        { icon: <SafetyCertificateFilled />, label: intl.formatMessage({ id: 'pricing.feature.commercialLicense', defaultMessage: '商业授权' }), value: '✓' },
      ]
    },
    {
      level: 2, 
      name: 'TEAM', 
      sub: intl.formatMessage({ id: 'pricing.plan.team.sub', defaultMessage: '团队版' }), 
      icon: <CrownFilled />, 
      color: '#fbbf24',
      price: '699',
      buttonText: intl.formatMessage({ id: 'pricing.plan.button.select', defaultMessage: '选择此方案' }),
      features: [
        { icon: <ThunderboltFilled />, label: intl.formatMessage({ id: 'pricing.feature.videoQuota', defaultMessage: '视频生成额度' }), value: intl.formatMessage({ id: 'pricing.plan.team.videoQuota', defaultMessage: '100次/月' }) },
        { icon: <BgColorsOutlined />, label: intl.formatMessage({ id: 'pricing.feature.videoDuration', defaultMessage: '视频时长' }), value: intl.formatMessage({ id: 'pricing.plan.team.videoDuration', defaultMessage: '10-15秒' }) },
        { icon: <BgColorsOutlined />, label: intl.formatMessage({ id: 'pricing.feature.videoQuality', defaultMessage: '视频画质' }), value: intl.formatMessage({ id: 'pricing.plan.team.videoQuality', defaultMessage: '1080P/4K' }) },
        { icon: <AppstoreOutlined />, label: intl.formatMessage({ id: 'pricing.feature.storyboard', defaultMessage: '分镜功能' }), value: '✓' },
        { icon: <BranchesOutlined />, label: intl.formatMessage({ id: 'pricing.feature.workflow', defaultMessage: '工作流' }), value: '✓' },
        { icon: <CheckCircleFilled />, label: intl.formatMessage({ id: 'pricing.feature.exclusiveChannel', defaultMessage: '专属通道' }), value: '✓' },
        { icon: <CheckCircleFilled />, label: intl.formatMessage({ id: 'pricing.feature.highestQuality', defaultMessage: '最高质量模式' }), value: '✓' },
        { icon: <PictureOutlined />, label: intl.formatMessage({ id: 'pricing.feature.sdImage', defaultMessage: 'SD生图' }), value: intl.formatMessage({ id: 'pricing.feature.unlimited', defaultMessage: '无限量' }) },
        { icon: <EditOutlined />, label: intl.formatMessage({ id: 'pricing.feature.promptOptimization', defaultMessage: '提示词优化' }), value: '✓' },
        { icon: <CloudServerOutlined />, label: intl.formatMessage({ id: 'pricing.feature.storage', defaultMessage: '存储空间' }), value: '100GB' },
        { icon: <ExperimentFilled />, label: intl.formatMessage({ id: 'pricing.feature.apiAccess', defaultMessage: 'API 访问' }), value: '✓' },
      ]
    }
  ];

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setActiveIndex(prev => Math.min(prev + 1, plans.length - 1));
      if (e.key === 'ArrowLeft') setActiveIndex(prev => Math.max(prev - 1, 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragEnd = (info) => {
    const threshold = 50;
    const { offset, velocity } = info;
    // 只处理水平方向的拖拽，忽略垂直滚动
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > threshold || velocity.x > 500) setActiveIndex(prev => Math.max(prev - 1, 0));
      else if (offset.x < -threshold || velocity.x < -500) setActiveIndex(prev => Math.min(prev + 1, plans.length - 1));
    }
  };

  return (
    <PricingSectionContainer theme={theme}>
      <StarField theme={theme} />
      
      <AmbientLight 
        $color={plans[activeIndex].color} 
        theme={theme}
        style={{
          transition: 'background 0.5s ease'
        }}
      />

      <ContentWrapper>
        <Header theme={theme}>
          <h2>{intl.formatMessage({ id: 'pricing.title', defaultMessage: '选择适合您的方案' })}</h2>
        </Header>

        <CarouselStage>
          <NavBtn 
            className="left" 
            theme={theme}
            onClick={() => setActiveIndex(p => Math.max(0, p - 1))} 
            style={{opacity: activeIndex === 0 ? 0.3 : 1}}
          >
            <LeftOutlined />
          </NavBtn>
          <NavBtn 
            className="right" 
            theme={theme}
            onClick={() => setActiveIndex(p => Math.min(plans.length - 1, p + 1))} 
            style={{opacity: activeIndex === plans.length - 1 ? 0.3 : 1}}
          >
            <RightOutlined />
          </NavBtn>

          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '1000px' }}>
            {plans.map((plan, index) => (
              <PricingCardItem
                key={plan.level}
                plan={plan}
                index={index}
                activeIndex={activeIndex}
                onDragEnd={handleDragEnd}
                setActiveIndex={setActiveIndex}
                theme={theme}
                navigate={navigate}
                isChinese={isChinese}
                intl={intl}
                basicBgImage={basicBgImage}
                proBgImage={proBgImage}
                teamBgImage={teamBgImage}
              />
            ))}
          </div>
        </CarouselStage>

        <Indicators theme={theme}>
          {plans.map((_, i) => (
            <div 
              key={i} 
              className={`dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </Indicators>
      </ContentWrapper>
    </PricingSectionContainer>
  );
};

export default PricingSection;