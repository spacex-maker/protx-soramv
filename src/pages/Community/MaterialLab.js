import React, { useState, useEffect } from 'react';
import { Typography, Button, Tag, Rate, Tooltip } from 'antd';
import styled, { keyframes, css } from 'styled-components';
import { 
  ShoppingCartOutlined, 
  CheckCircleFilled, 
  InfoCircleOutlined,
  ThunderboltFilled,
  ExperimentOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

const { Title, Text } = Typography;

// --- 动画定义 ---

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const scanLight = keyframes`
  0% { top: -20%; opacity: 0; }
  50% { opacity: 1; }
  100% { top: 120%; opacity: 0; }
`;

// --- 布局组件 ---

const SectionContainer = styled.div`
  margin: 100px auto;
  padding: 0 40px;
  max-width: 1400px;
  animation: ${fadeInUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  @media (max-width: 768px) {
    padding: 0 20px;
    margin: 60px auto;
  }
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 60px;
  position: relative;
`;

const StyledTitle = styled(Title)`
  &.ant-typography {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 16px;
    letter-spacing: -1px;
    background: linear-gradient(135deg, ${props => props.theme.mode === 'dark' ? '#fff 0%, #999 100%' : '#333 0%, #666 100%'});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

// --- 左侧：产品展示视口 (The Viewport) ---

const ViewportCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: ${props => props.theme.mode === 'dark' ? '#0f0f0f' : '#f5f5f7'};
  border-radius: 32px;
  overflow: hidden;
  box-shadow: inset 0 0 60px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1);
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 核心：底图 (白模)
// 我们使用一张高质量的白色抽象 3D 图作为底色
const BaseObjLayer = styled.div`
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'); 
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 1;
  filter: grayscale(100%) contrast(1.1) brightness(1.1); // 保持纯净的黑白灰关系
  animation: ${float} 6s ease-in-out infinite;
  transition: all 0.5s ease;
`;

// 核心：材质叠加层 (Magic Layer)
// 通过 mix-blend-mode 实现真实的材质贴图效果
const MaterialOverlay = styled.div`
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  background: ${props => props.$overlay}; // 材质颜色/渐变
  mask-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'); // 关键：遮罩
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop');
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  
  mix-blend-mode: ${props => props.$blendMode || 'multiply'}; // 混合模式
  opacity: ${props => props.$opacity || 0.8};
  z-index: 2;
  pointer-events: none;
  transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  filter: ${props => props.$filter || 'none'};

  // 扫描光效
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 20px;
    background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.8), transparent);
    animation: ${props => props.$animate ? css`${scanLight} 0.8s ease-out` : 'none'};
    opacity: 0.5;
  }
`;

// 浮动的规格卡片
const SpecFloatingCard = styled.div`
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  z-index: 10;
  width: 260px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: all 0.3s ease;

  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .price {
    font-family: 'SF Mono', monospace;
    color: #4cc9f0;
  }
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  
  span:last-child {
    font-weight: 600;
    color: #fff;
  }
`;

// --- 右侧：控制面板 ---

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const MaterialGroupTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${props => props.theme.mode === 'dark' ? '#888' : '#666'};
  margin-bottom: 16px;
`;

const MaterialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 16px;
`;

const MaterialSwatch = styled.button`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid ${props => props.$active ? props.$color : 'transparent'};
  padding: 4px; // 间距
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  // 内部真实的颜色球
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${props => props.$background};
    box-shadow: inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2);
  }

  // 选中勾选
  .check-icon {
    position: absolute;
    top: 0;
    right: 0;
    color: #fff;
    background: ${props => props.$color};
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    opacity: ${props => props.$active ? 1 : 0};
    transform: ${props => props.$active ? 'scale(1)' : 'scale(0)'};
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 2;
  }
`;

const OrderButton = styled(Button)`
  height: 64px;
  width: 100%;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  border: none;
  background: ${props => props.$gradient};
  color: #fff;
  box-shadow: 0 10px 20px ${props => props.$shadowColor};
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px ${props => props.$shadowColor};
    color: #fff;
  }
`;

// --- 数据 ---

const MATERIALS = [
  {
    id: 'obsidian',
    name: '黑曜石 (Obsidian)',
    category: 'MINERAL',
    price: 129,
    time: '48h',
    weight: 'Heavy',
    // 视觉参数
    swatchBg: '#1a1a1a',
    overlay: '#000000',
    blendMode: 'multiply',
    opacity: 0.9,
    filter: 'contrast(1.2) brightness(0.8)', // 增加对比度显出光泽
    btnGradient: 'linear-gradient(135deg, #2b2b2b 0%, #000 100%)',
    btnShadow: 'rgba(0,0,0,0.4)'
  },
  {
    id: 'gold',
    name: '拉丝亮金 (Brushed Gold)',
    category: 'METAL',
    price: 299,
    time: '72h',
    weight: 'Medium',
    // 视觉参数 - 金色需要特殊的 color 混合
    swatchBg: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
    overlay: 'linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(218, 165, 32, 0.8))',
    blendMode: 'color', 
    opacity: 0.8,
    filter: 'contrast(1.1) saturate(1.2)',
    btnGradient: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
    btnShadow: 'rgba(184, 134, 11, 0.4)'
  },
  {
    id: 'clay',
    name: '素烧白陶 (White Clay)',
    category: 'CERAMIC',
    price: 89,
    time: '24h',
    weight: 'Light',
    // 视觉参数
    swatchBg: '#f0f0f0',
    overlay: '#ffffff',
    blendMode: 'soft-light',
    opacity: 0.3,
    filter: 'brightness(1.05)',
    btnGradient: 'linear-gradient(135deg, #e0e0e0 0%, #b0b0b0 100%)',
    btnShadow: 'rgba(0,0,0,0.1)'
  },
  {
    id: 'cyber',
    name: '赛博霓虹 (Cyber Neon)',
    category: 'SPECIAL',
    price: 159,
    time: '36h',
    weight: 'Medium',
    // 视觉参数
    swatchBg: 'linear-gradient(135deg, #00f260 0%, #0575e6 100%)',
    overlay: 'linear-gradient(45deg, #00f260, #0575e6)',
    blendMode: 'overlay',
    opacity: 0.7,
    filter: 'contrast(1.2)',
    btnGradient: 'linear-gradient(135deg, #00f260 0%, #0575e6 100%)',
    btnShadow: 'rgba(5, 117, 230, 0.4)'
  },
  {
    id: 'rose',
    name: '玫瑰石英 (Rose Quartz)',
    category: 'MINERAL',
    price: 149,
    time: '50h',
    weight: 'Heavy',
    // 视觉参数
    swatchBg: '#fbc2eb',
    overlay: '#fbc2eb',
    blendMode: 'multiply',
    opacity: 0.6,
    filter: 'contrast(1.1)',
    btnGradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    btnShadow: 'rgba(251, 194, 235, 0.4)'
  },
  {
    id: 'carbon',
    name: '碳纤维 (Carbon Fiber)',
    category: 'COMPOSITE',
    price: 199,
    time: '60h',
    weight: 'Ultra Light',
    // 视觉参数 - 黑色带纹理感
    swatchBg: 'repeating-linear-gradient(45deg, #111 0, #111 2px, #333 2px, #333 4px)',
    overlay: '#1a1a1a',
    blendMode: 'hard-light',
    opacity: 0.9,
    filter: 'contrast(1.3)',
    btnGradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    btnShadow: 'rgba(0,0,0,0.5)'
  }
];

// --- 主组件 ---

const MaterialLab = () => {
  const [selectedId, setSelectedId] = useState('gold');
  const [isAnimating, setIsAnimating] = useState(false);

  const activeMaterial = MATERIALS.find(m => m.id === selectedId);

  const handleSelect = (id) => {
    if (id === selectedId) return;
    setIsAnimating(true);
    setSelectedId(id);
    // 重置动画状态
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <SectionContainer>
      <HeaderWrapper>
        <StyledTitle level={2}>
          <FormattedMessage id="material.title" defaultMessage="The Material Lab" />
        </StyledTitle>
        <Typography.Text type="secondary" style={{ fontSize: 18 }}>
          <FormattedMessage id="material.subtitle" defaultMessage="Select a material to visualize the physical outcome instantly." />
        </Typography.Text>
      </HeaderWrapper>

      <ContentGrid>
        {/* 左侧：3D 视窗 */}
        <ViewportCard>
          {/* 1. 纯白底模 */}
          <BaseObjLayer />
          
          {/* 2. 材质叠加层 (这是实现真实切换的关键) */}
          <MaterialOverlay 
            $overlay={activeMaterial.overlay}
            $blendMode={activeMaterial.blendMode}
            $opacity={activeMaterial.opacity}
            $filter={activeMaterial.filter}
            $animate={isAnimating}
          />

          {/* 3. 悬浮数据卡片 */}
          <SpecFloatingCard>
            <h3>
              {activeMaterial.name}
              <span className="price">${activeMaterial.price}</span>
            </h3>
            <div style={{ margin: '12px 0 16px', height: 1, background: 'rgba(255,255,255,0.2)' }} />
            <StatRow>
              <span>Process Time</span>
              <span><ClockCircleOutlined /> {activeMaterial.time}</span>
            </StatRow>
            <StatRow>
              <span>Weight Class</span>
              <span>{activeMaterial.weight}</span>
            </StatRow>
            <StatRow>
              <span>Material Type</span>
              <Tag color="blue" style={{margin:0}}>{activeMaterial.category}</Tag>
            </StatRow>
            <div style={{ marginTop: 16 }}>
              <Rate disabled defaultValue={5} style={{ fontSize: 14, color: '#4cc9f0' }} />
            </div>
          </SpecFloatingCard>
        </ViewportCard>

        {/* 右侧：控制面板 */}
        <PanelContainer>
          <div>
            <MaterialGroupTitle><ExperimentOutlined /> Select Material</MaterialGroupTitle>
            <MaterialGrid>
              {MATERIALS.map(mat => (
                <Tooltip title={mat.name} key={mat.id}>
                  <MaterialSwatch 
                    $background={mat.swatchBg}
                    $active={selectedId === mat.id}
                    $color={mat.overlay.includes('linear') ? '#8338ec' : mat.overlay} // 边框色
                    onClick={() => handleSelect(mat.id)}
                  >
                    <div className="check-icon"><CheckCircleFilled /></div>
                  </MaterialSwatch>
                </Tooltip>
              ))}
            </MaterialGrid>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.02)', padding: 24, borderRadius: 16 }}>
            <Title level={4} style={{ marginTop: 0 }}>Fabrication Details</Title>
            <Text type="secondary">
              Each material is processed using industrial-grade SLA/SLS printers or CNC machining. 
              The finish shown represents the raw output after post-processing.
            </Text>
          </div>

          <OrderButton 
            $gradient={activeMaterial.btnGradient}
            $shadowColor={activeMaterial.btnShadow}
          >
            <ShoppingCartOutlined />
            Order {activeMaterial.name} Sample
          </OrderButton>
        </PanelContainer>
      </ContentGrid>

    </SectionContainer>
  );
};

export default MaterialLab;