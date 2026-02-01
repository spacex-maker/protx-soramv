import React, { useState, useRef, useEffect, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { Modal, theme, Tag } from "antd";
import { motion } from "framer-motion";
import { useIntl } from "react-intl";
import {
  CrownFilled,
  StarFilled,
  RocketFilled,
  CheckCircleFilled,
  RightOutlined,
  LeftOutlined,
  ThunderboltFilled,
  CloudServerOutlined,
  BgColorsOutlined,
  LockFilled,
  ExperimentFilled,
  FireFilled,
  SafetyCertificateFilled
} from "@ant-design/icons";

// ==========================================
// 1. 动效定义
// ==========================================

const float3D = keyframes`
  0% { transform: perspective(1000px) rotateY(0deg) translateY(0); }
  50% { transform: perspective(1000px) rotateY(10deg) translateY(-10px); }
  100% { transform: perspective(1000px) rotateY(0deg) translateY(0); }
`;

const shine = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

// ==========================================
// 2. 样式组件
// ==========================================

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 32px;
    overflow: hidden;
    background: #000;
    /* 使用 GPU 合成层 */
    transform: translateZ(0);
  }
  
  .ant-modal-close {
    top: 24px; right: 24px;
    color: #fff;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(10px);
    z-index: 200;
    transition: all 0.2s;
    &:hover { background: rgba(255,255,255,0.2); transform: rotate(90deg); }
  }

  .ant-modal-body {
    height: 800px;
    display: flex;
    flex-direction: column;
    background: #050507;
    overflow: hidden;
    position: relative;
  }
`;

const StarField = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  /* 静态背景不需要频繁重绘 */
  will-change: transform;
  
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
  /* 强制 GPU 加速 */
  will-change: transform, opacity;
  transform: translateZ(0);
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
    background: linear-gradient(180deg, #fff 0%, #888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
  }
  
  p { 
    font-size: 16px; 
    color: rgba(255,255,255,0.6); 
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
  perspective: 1000px; /* 3D 空间 */
  z-index: 10;
  padding-bottom: 40px;
  /* 优化 3D 渲染 */
  transform-style: preserve-3d;
`;

// 优化后的卡片样式
const Card3D = styled(motion.div)`
  position: absolute;
  width: 380px;
  height: 580px;
  border-radius: 32px;
  
  /* 性能优化核心：
     只在激活状态使用 backdrop-filter (非常耗能)
     非激活状态使用纯色半透明背景 (性能极高)
  */
  background: ${props => props.$active ? 'rgba(20, 20, 24, 0.6)' : 'rgba(20, 20, 24, 0.95)'};
  backdrop-filter: ${props => props.$active ? 'blur(20px)' : 'none'};
  
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform-origin: center center;
  cursor: grab;
  overflow: hidden;
  
  /* 强制开启 GPU 加速 */
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
  transform: translateZ(0);
  
  &:active { cursor: grabbing; }

  ${props => props.$active && css`
    box-shadow: 0 20px 60px -20px ${props.$color}40, 0 0 0 1px ${props.$color}40;
    z-index: 100 !important;
  `}

  ${props => props.$locked && css`
    filter: grayscale(0.9) brightness(0.6);
    .lock-mask { opacity: 1; }
  `}

  .lock-mask {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: rgba(255,255,255,0.2);
    opacity: 0;
    pointer-events: none;
    z-index: 0;
  }

  .icon-wrapper {
    width: 88px; height: 88px;
    border-radius: 24px;
    background: ${props => props.$active ? props.$color : 'rgba(255,255,255,0.05)'};
    display: flex; align-items: center; justify-content: center;
    font-size: 42px;
    color: ${props => props.$active ? '#000' : '#fff'};
    margin-bottom: 24px;
    box-shadow: ${props => props.$active ? `0 10px 30px ${props.$color}60` : 'none'};
    transition: background 0.3s, color 0.3s; /* 仅对颜色做 CSS 过渡，避免重排 */
    position: relative;
    z-index: 1;
  }

  .card-header { position: relative; z-index: 1; }
  .card-title {
    h3 { font-size: 36px; font-weight: 800; color: #fff; margin: 0; letter-spacing: 0.5px; }
    span { font-size: 14px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
  }

  .features {
    margin-top: 32px; position: relative; z-index: 1;
    .item {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 15px; color: rgba(255,255,255,0.7);
      padding: 10px 0;
      border-bottom: 1px dashed rgba(255,255,255,0.1);
      &:last-child { border-bottom: none; }
      .val { font-weight: 600; color: #fff; font-family: 'SF Mono', monospace; }
      .icon { margin-right: 8px; color: ${props => props.$color}; }
    }
  }

  .action-btn {
    width: 100%; height: 56px;
    border-radius: 20px; border: none;
    font-size: 16px; font-weight: 600;
    margin-top: 24px; cursor: pointer;
    background: ${props => props.$active ? '#fff' : 'rgba(255,255,255,0.1)'};
    color: ${props => props.$active ? '#000' : 'rgba(255,255,255,0.4)'};
    transition: transform 0.2s;
    position: relative; z-index: 1;
    &:hover { transform: scale(1.02); }
  }

  &::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  }
  
  /* 减少阴影层级，提升性能 */
  &::before {
    content: ''; position: absolute; bottom: 0; right: 0;
    width: 150px; height: 150px;
    background: radial-gradient(circle at bottom right, ${props => props.$color}20, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
    opacity: ${props => props.$active ? 1 : 0}; /* 仅激活时显示底部光晕 */
  }
`;

const NavBtn = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 64px; height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 24px;
  cursor: pointer;
  z-index: 50;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  &:hover { background: rgba(255,255,255,0.15); transform: translateY(-50%) scale(1.1); border-color: rgba(255,255,255,0.3); }
  &.left { left: 40px; }
  &.right { right: 40px; }
  @media (max-width: 768px) { display: none; }
`;

const Indicators = styled.div`
  position: absolute;
  bottom: 40px;
  left: 0; right: 0;
  display: flex; justify-content: center; gap: 16px;
  z-index: 20;

  .dot {
    width: 6px; height: 6px;
    border-radius: 4px;
    background: rgba(255,255,255,0.2);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &.active { width: 40px; background: #fff; box-shadow: 0 0 15px rgba(255,255,255,0.5); }
  }
`;

// ==========================================
// 3. 数据配置
// ==========================================

const memberLevels = [
  {
    level: 0, name: 'BASIC', sub: '普通会员', icon: <StarFilled />, color: '#a1a1aa',
    features: [
      { icon: <ThunderboltFilled />, label: '生成额度', value: '5次/月' },
      { icon: <BgColorsOutlined />, label: '画质', value: '720P' },
      { icon: <CloudServerOutlined />, label: '存储', value: '1GB' },
    ]
  },
  {
    level: 1, name: 'SILVER', sub: '白银会员', icon: <RocketFilled />, color: '#94a3b8',
    features: [
      { icon: <ThunderboltFilled />, label: '生成额度', value: '20次/月' },
      { icon: <BgColorsOutlined />, label: '画质', value: '1080P' },
      { icon: <CloudServerOutlined />, label: '存储', value: '5GB' },
      { icon: <CheckCircleFilled />, label: '优先队列', value: '✓' },
    ]
  },
  {
    level: 2, name: 'GOLD', sub: '黄金会员', icon: <CrownFilled />, color: '#fbbf24',
    features: [
      { icon: <ThunderboltFilled />, label: '生成额度', value: '100次/月' },
      { icon: <BgColorsOutlined />, label: '画质', value: '1080P+' },
      { icon: <CloudServerOutlined />, label: '存储', value: '20GB' },
      { icon: <CheckCircleFilled />, label: '极速队列', value: '✓' },
      { icon: <SafetyCertificateFilled />, label: '商业授权', value: '✓' },
    ]
  },
  {
    level: 3, name: 'DIAMOND', sub: '钻石会员', icon: <ExperimentFilled />, color: '#38bdf8',
    features: [
      { icon: <ThunderboltFilled />, label: '生成额度', value: '500次/月' },
      { icon: <BgColorsOutlined />, label: '画质', value: '4K' },
      { icon: <CloudServerOutlined />, label: '存储', value: '100GB' },
      { icon: <CheckCircleFilled />, label: '专属通道', value: '✓' },
      { icon: <CheckCircleFilled />, label: 'API 访问', value: '✓' },
    ]
  },
  {
    level: 4, name: 'ULTIMATE', sub: '至尊会员', icon: <FireFilled />, color: '#f43f5e',
    features: [
      { icon: <ThunderboltFilled />, label: '生成额度', value: '无限' },
      { icon: <BgColorsOutlined />, label: '画质', value: '8K' },
      { icon: <CloudServerOutlined />, label: '存储', value: '1TB' },
      { icon: <CheckCircleFilled />, label: '私有部署', value: '支持' },
      { icon: <CheckCircleFilled />, label: '1v1 客服', value: '✓' },
    ]
  }
];

// ==========================================
// 4. 逻辑组件 (使用 React.memo 优化性能)
// ==========================================

const CARD_WIDTH = 380;
const GAP = 60;

// 提取卡片组件并 Memo 化，避免不必要的重绘
const MemberCardItem = React.memo(({ level, index, activeIndex, currentLevel, onDragEnd, setActiveIndex }) => {
  const isCurrent = level.level === currentLevel;
  const isLocked = level.level > currentLevel;
  const isActive = index === activeIndex;

  // 动态计算样式
  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);
  
  // 定义动画目标值
  const variants = {
    animate: {
      x: offset * (CARD_WIDTH + GAP),
      scale: 1 - absOffset * 0.15,
      zIndex: 100 - absOffset,
      rotateY: offset * -25,
      opacity: Math.max(0, 1 - absOffset * 0.2),
      filter: `brightness(${1 - absOffset * 0.3}) blur(${isActive ? 0 : absOffset * 4}px)`, // 非激活卡片模糊
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 25,
        mass: 0.8
      }
    }
  };

  // 距离太远不渲染 (Virtualization)
  if (Math.abs(offset) > 2) return null;

  return (
    <Card3D
      $active={isActive}
      $color={level.color}
      $locked={isLocked}
      initial={false} // 禁用初始动画，防止闪烁
      animate="animate"
      variants={variants}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={(e, info) => onDragEnd(info)}
      onClick={() => setActiveIndex(index)}
    >
      <LockFilled className="lock-mask" />
      <div className="card-header">
        <div className="icon-wrapper">{level.icon}</div>
        <div className="card-title">
          <h3>{level.name}</h3>
          <span>{level.sub}</span>
        </div>
      </div>

      <div className="features">
        {level.features.map((f, i) => (
          <div key={i} className="item">
            <span style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{color: level.color}}>{f.icon}</span> {f.label}
            </span>
            <span className="val">{f.value}</span>
          </div>
        ))}
      </div>

      <button className="action-btn">
        {isCurrent ? '当前方案' : isLocked ? '立即升级' : '已解锁'}
      </button>

      {isCurrent && (
         <Tag color={level.color} style={{ position: 'absolute', top: 32, right: 32, border: 'none', fontWeight: 800, fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>
           CURRENT
         </Tag>
      )}
    </Card3D>
  );
});

const AchievementModal = ({ open, onClose, userInfo }) => {
  const { token } = theme.useToken();
  // 后端会员等级是 1-5，前端数组索引是 0-4，需要转换
  // 后端 1 -> 前端 0 (BASIC)
  // 后端 2 -> 前端 1 (SILVER)
  // 后端 3 -> 前端 2 (GOLD)
  // 后端 4 -> 前端 3 (DIAMOND)
  // 后端 5 -> 前端 4 (ULTIMATE)
  const backendLevel = userInfo?.memberLevel || 1; // 后端默认是 1
  const currentLevel = Math.max(0, Math.min(4, backendLevel - 1)); // 转换为前端索引 0-4
  const [activeIndex, setActiveIndex] = useState(currentLevel);
  
  // 当 modal 打开或 userInfo 变化时，同步 activeIndex 到当前等级
  useEffect(() => {
    if (open) {
      setActiveIndex(currentLevel);
    }
  }, [open, currentLevel]);
  
  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      if (e.key === 'ArrowRight') setActiveIndex(prev => Math.min(prev + 1, memberLevels.length - 1));
      if (e.key === 'ArrowLeft') setActiveIndex(prev => Math.max(prev - 1, 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleDragEnd = (info) => {
    const threshold = 50;
    const { offset, velocity } = info;
    if (offset.x > threshold || velocity.x > 500) setActiveIndex(prev => Math.max(prev - 1, 0));
    else if (offset.x < -threshold || velocity.x < -500) setActiveIndex(prev => Math.min(prev + 1, memberLevels.length - 1));
  };

  return (
    <StyledModal
      $token={token}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1400}
      centered
      destroyOnHidden
      closeIcon={<span style={{fontSize: 20}}>×</span>}
      styles={{ mask: { backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(30px)' } }}
    >
      <StarField />
      
      {/* 环境光 - 使用 CSS 动画过渡代替 Framer Motion 以提升性能 */}
      <AmbientLight 
        $color={memberLevels[activeIndex].color} 
        style={{
          transition: 'background 0.5s ease'
        }}
      />

      <Header>
        <h2>MEMBERSHIP LEVELS</h2>
        <p>滑动卡片或使用键盘方向键探索权益</p>
      </Header>

      <CarouselStage>
        <NavBtn className="left" onClick={() => setActiveIndex(p => Math.max(0, p - 1))} style={{opacity: activeIndex === 0 ? 0.3 : 1}}>
          <LeftOutlined />
        </NavBtn>
        <NavBtn className="right" onClick={() => setActiveIndex(p => Math.min(memberLevels.length - 1, p + 1))} style={{opacity: activeIndex === memberLevels.length - 1 ? 0.3 : 1}}>
          <RightOutlined />
        </NavBtn>

        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '1000px' }}>
          {memberLevels.map((level, index) => (
            <MemberCardItem
              key={level.level}
              level={level}
              index={index}
              activeIndex={activeIndex}
              currentLevel={currentLevel}
              onDragEnd={handleDragEnd}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </div>
      </CarouselStage>

      <Indicators>
        {memberLevels.map((_, i) => (
          <div 
            key={i} 
            className={`dot ${i === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </Indicators>

    </StyledModal>
  );
};

export default AchievementModal;