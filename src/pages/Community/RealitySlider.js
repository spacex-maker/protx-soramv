import React, { useState, useRef, useEffect } from 'react';
import { Typography, Tag } from 'antd';
import styled, { keyframes, css } from 'styled-components';
import { 
  BulbFilled,
  CodeSandboxOutlined,
  ColumnWidthOutlined,
  FieldTimeOutlined,
  FormatPainterOutlined,
  RightOutlined,
  LeftOutlined,
  ScanOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// --- 动画定义 ---

const scanAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

const textGlow = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// --- 样式组件 ---

const SectionContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 80px auto;
  padding: 0 24px;
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const StyledTitle = styled(Title)`
  &.ant-typography {
    font-size: 42px;
    font-weight: 800;
    margin-bottom: 16px;
    letter-spacing: -1px;
    background: linear-gradient(135deg, ${props => props.theme.mode === 'dark' ? '#fff 0%, #aaa 100%' : '#333 0%, #666 100%'});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (max-width: 768px) {
      font-size: 32px;
    }
  }
`;

// 主卡片容器
const SliderCard = styled.div`
  position: relative;
  width: 100%;
  height: 650px; // 足够的高度展示细节
  border-radius: 32px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  user-select: none;
  touch-action: none; // 防止触摸滚动

  @media (max-width: 768px) {
    height: 500px;
  }
`;

// 图片层
const ImageLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  
  // 动态宽度控制显示区域
  width: ${props => props.$width}%;
  z-index: ${props => props.$zIndex};
  
  // 右侧（实物）层需要特殊处理，让背景图固定，只是容器宽度变化
  ${props => props.$isRight && css`
    right: 0;
    left: auto;
    width: ${props.$width}%;
    
    // 关键：背景图反向位移，保持视觉静止
    background-position: right center; 
  `}

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$overlay || 'transparent'};
  }
`;

// 左上/右上角的大标签
const CornerLabel = styled.div`
  position: absolute;
  top: 32px;
  ${props => props.$side === 'left' ? 'left: 32px;' : 'right: 32px;'}
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(16px);
  padding: 8px 20px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .icon-box {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-size: 12px;
  }
`;

// 分割线手柄
const Handle = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${props => props.$pos}%;
  width: 4px;
  background: #fff;
  z-index: 30;
  cursor: ew-resize;
  transform: translateX(-50%);
  box-shadow: 0 0 20px rgba(0,0,0,0.5);

  // 上下渐变光晕
  &::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: -20px; right: -20px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  }

  // 中央控制钮
  .control-knob {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 2px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    transition: all 0.2s;
    animation: ${scanAnimation} 3s infinite;

    &:hover {
      transform: translate(-50%, -50%) scale(1.1);
      background: rgba(255, 255, 255, 0.3);
    }

    svg {
      font-size: 20px;
      color: #fff;
    }
  }
`;

// 底部悬浮信息面板
const InfoPanel = styled.div`
  position: absolute;
  bottom: 32px;
  left: 32px;
  right: 32px;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: none; // 让鼠标可以穿透到图片上拖动

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    left: 20px; right: 20px; bottom: 20px;
  }
`;

const InfoCard = styled.div`
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(20px);
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto; // 恢复交互
  max-width: 400px;
  animation: ${textGlow} 3s infinite alternate;

  h3 {
    margin: 0 0 8px 0;
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    line-height: 1.5;
  }
`;

const TechSpecs = styled.div`
  display: flex;
  gap: 12px;
  pointer-events: auto;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const SpecBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 12px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .icon {
    color: ${props => props.$color || '#fff'};
  }
`;

// --- 数据配置 ---

// 这里使用 Unsplash 的图片来模拟。
// 实际项目中，你应该替换为真实的 "AI生成图" 和 "实物拍摄图"
const DEMO_DATA = {
  // 左侧：看起来像 3D 渲染、抽象、发光的图片
  aiImage: 'https://usa-1258150206.cos.na-siliconvalley.myqcloud.com/wzdhfn/e914658e-a364-41d7-97b4-ac299608c21e.png', 
  // 右侧：看起来像真实室内摄影的台灯图片
  physicalImage: 'https://usa-1258150206.cos.na-siliconvalley.myqcloud.com/TestAdmin/f1ed8863-6859-4222-b69f-3362ce0c7340.png',
  title: '参数化菌丝台灯',
  desc: '由 Midjourney 生成有机形态，经算法优化结构，最终使用生物降解 PLA 材料 3D 打印而成。',
  specs: [
    { icon: <CodeSandboxOutlined />, label: 'PLA Resin', color: '#00f2ff' },
    { icon: <FieldTimeOutlined />, label: '14h Print', color: '#bd00ff' },
    { icon: <ColumnWidthOutlined />, label: 'H: 45cm', color: '#ffbd00' },
  ]
};

const RealitySlider = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // 统一处理鼠标和触摸移动
  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = (x / width) * 100;
    
    // 限制范围在 0-100 之间，留一点边距
    const clamped = Math.min(Math.max(percentage, 0), 100);
    setSliderPos(clamped);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  // 监听全局松开事件
  useEffect(() => {
    const stopDrag = () => setIsDragging(false);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
    return () => {
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, []);

  return (
    <SectionContainer>
      <HeaderWrapper>
        <StyledTitle level={2}>虚实孪生：从比特到原子</StyledTitle>
        <Typography.Text type="secondary" style={{ fontSize: 18 }}>
          拖动滑块，见证 AI 灵感如何被精准还原为实体产品。
        </Typography.Text>
      </HeaderWrapper>

      <SliderCard 
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* 1. 左侧：AI 创意层 (底层) */}
        <ImageLayer 
          $width={100} 
          $zIndex={1} 
          style={{ backgroundImage: `url(${DEMO_DATA.aiImage})` }}
        >
          {/* 增加一点蓝色滤镜模拟 "蓝图/AI" 感 */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(58, 134, 255, 0.2)', mixBlendMode: 'overlay' }} />
        </ImageLayer>
        
        {/* 左上角标签 */}
        <CornerLabel $side="left" $color="#00f2ff">
          <div className="icon-box"><BulbFilled /></div>
          <span>AI 创意概念</span>
        </CornerLabel>

        {/* 2. 右侧：实物层 (覆盖层) */}
        {/* 这里的逻辑是：这个div宽度随着滑块变大，从右向左遮盖底层 */}
        <ImageLayer 
          $width={100 - sliderPos} 
          $zIndex={2} 
          $isRight={true} // 标记为右侧层
          style={{ 
            backgroundImage: `url(${DEMO_DATA.physicalImage})`,
            // 确保背景图也是固定的，不会随容器压缩
            backgroundSize: 'cover',
            backgroundPosition: 'center', // 这里的对齐方式很重要
            // 我们需要稍微复杂的计算来让背景不动，
            // 但最简单的方法是让ImageLayer全宽，然后用clip-path
            clipPath: `inset(0 0 0 0)` // 这里只是为了重置，真正的裁剪由width决定
          }}
        >
           {/* 由于 ImageLayer 使用了 absolute right:0 和 width变化，
               我们需要用内层 div 反向抵消位移，或者使用 clip-path 方案。
               下面改用 clip-path 方案重写 ImageLayer 的逻辑会更流畅。
           */}
        </ImageLayer>

        {/* 修正：使用 Clip-Path 实现更稳健的遮罩效果 */}
        {/* 重新覆盖一个全尺寸的实物图，通过 clip-path 只显示右半部分 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${DEMO_DATA.physicalImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 5,
          clipPath: `inset(0 0 0 ${sliderPos}%)`, // 关键：从左边裁剪
          pointerEvents: 'none'
        }} />

        {/* 右上角标签 */}
        <CornerLabel $side="right" $color="#06ffa5">
          <div className="icon-box"><ScanOutlined /></div>
          <span>实体落地产品</span>
        </CornerLabel>

        {/* 3. 分割线手柄 */}
        <Handle $pos={sliderPos}>
          <div className="control-knob">
            {isDragging ? <ScanOutlined /> : <ColumnWidthOutlined />}
          </div>
        </Handle>

        {/* 4. 底部信息面板 */}
        <InfoPanel>
          <InfoCard>
            <h3>{DEMO_DATA.title}</h3>
            <p>{DEMO_DATA.desc}</p>
          </InfoCard>

          <TechSpecs>
             {DEMO_DATA.specs.map((spec, i) => (
               <SpecBadge key={i} $color={spec.color}>
                 <span className="icon">{spec.icon}</span>
                 {spec.label}
               </SpecBadge>
             ))}
             <Tag color="gold" style={{margin: 0, height: 38, display: 'flex', alignItems: 'center', borderRadius: 12, border: 'none'}}>
                Production Ready
             </Tag>
          </TechSpecs>
        </InfoPanel>

      </SliderCard>
    </SectionContainer>
  );
};

export default RealitySlider;