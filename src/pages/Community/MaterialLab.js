import React, { useState } from 'react';
import { Typography, Button } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes, css } from 'styled-components';
import { 
  ShoppingCartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const materialPulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(131, 56, 236, 0.7); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(131, 56, 236, 0); }
`;

const SectionContainer = styled.div`
  margin-top: 80px;
  margin-bottom: 80px;
  padding: 0 40px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 0 24px;
    margin-top: 48px;
    margin-bottom: 48px;
  }
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 56px;
`;

const SectionTitle = styled(Title)`
  &.ant-typography {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 12px !important;
    color: ${props => props.theme.mode === 'dark' ? '#e8eaed' : '#202124'};
    
    @media (max-width: 768px) {
      font-size: 32px;
    }
  }
`;

const SectionSubtitle = styled(Text)`
  &.ant-typography {
    font-size: 18px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
    max-width: 600px;
    display: inline-block;
    line-height: 1.6;
  }
`;

// 主要内容区域 - 左右布局
const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 48px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

// 左侧：3D 模型预览区域
const ModelPreview = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 32px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a0033 0%, #0d1b2a 100%)'
    : 'linear-gradient(135deg, #f3e5f5 0%, #e3f2fd 100%)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#3c4043' : '#dadce0'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 500px;

  @media (max-width: 1024px) {
    aspect-ratio: 16 / 9;
    min-height: 400px;
  }
`;

// 材质纹理背景
const MaterialTexture = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => {
    const textures = {
      wood: 'repeating-linear-gradient(90deg, #8b4513 0%, #a0522d 50%, #8b4513 100%)',
      metal: 'repeating-linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 50%, #c0c0c0 100%)',
      resin: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)',
      glow: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 70%)',
      default: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)'
    };
    return textures[props.$materialType] || textures.default;
  }};
  opacity: ${props => props.$materialType ? 0.6 : 0};
  transition: opacity 0.5s ease, background 0.5s ease;
  filter: ${props => {
    if (props.$materialType === 'wood') return 'brightness(0.8) contrast(1.2)';
    if (props.$materialType === 'metal') return 'brightness(1.2) contrast(1.3)';
    return 'none';
  }};
  mix-blend-mode: ${props => props.$materialType === 'glow' ? 'screen' : 'normal'};
`;

const ModelPlaceholder = styled.div`
  font-size: 120px;
  font-weight: 700;
  opacity: 0.2;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 10px;
  
  @media (max-width: 768px) {
    font-size: 80px;
    letter-spacing: 5px;
  }
`;

// 材质信息展示
const MaterialInfo = styled.div`
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  padding: 20px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  z-index: 10;
`;

const MaterialName = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  margin-bottom: 8px;
`;

const MaterialDescription = styled.div`
  font-size: 14px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
  line-height: 1.6;
`;

// 右侧：材质球阵列
const MaterialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 24px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 16px;
  }
`;

// 材质球卡片
const MaterialBall = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 3px solid ${props => props.$active 
    ? (props.theme.mode === 'dark' ? '#8338ec' : '#8338ec')
    : 'transparent'};
  box-shadow: ${props => props.$active 
    ? '0 0 0 4px rgba(131, 56, 236, 0.2), 0 8px 24px rgba(0, 0, 0, 0.2)'
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  background: ${props => props.$background || '#e8e8e8'};
  overflow: hidden;
  z-index: ${props => props.$active ? 10 : 1};

  &:hover {
    transform: translateY(-8px) scale(1.1);
    border-color: ${props => props.theme.mode === 'dark' ? '#8338ec' : '#8338ec'};
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    z-index: 10;

    ${props => props.$isGlow && css`
      animation: ${materialPulse} 2s ease-in-out infinite;
    `}
  }

  &:active {
    transform: translateY(-4px) scale(1.05);
  }
`;

// 材质纹理叠加
const BallTexture = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => {
    const textures = {
      wood: 'repeating-linear-gradient(45deg, rgba(139, 69, 19, 0.3) 0%, rgba(160, 82, 45, 0.3) 50%, rgba(139, 69, 19, 0.3) 100%)',
      metal: 'repeating-linear-gradient(135deg, rgba(192, 192, 192, 0.4) 0%, rgba(232, 232, 232, 0.4) 50%, rgba(192, 192, 192, 0.4) 100%)',
      resin: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 70%)',
      glow: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
      default: 'none'
    };
    return textures[props.$type] || textures.default;
  }};
  border-radius: 50%;
  pointer-events: none;
`;

// 选中标记
const SelectedBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8338ec 0%, #3a86ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(131, 56, 236, 0.4);
  z-index: 20;
  opacity: ${props => props.$active ? 1 : 0};
  transform: ${props => props.$active ? 'scale(1)' : 'scale(0)'};
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

// CTA 按钮
const CTAButton = styled(Button)`
  width: 100%;
  height: 56px;
  margin-top: 48px;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  background: linear-gradient(135deg, #8338ec 0%, #3a86ff 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(131, 56, 236, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(131, 56, 236, 0.4);
    background: linear-gradient(135deg, #9c4af0 0%, #4a99ff 100%);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    margin-top: 32px;
  }
`;

const mockMaterials = [
  {
    id: 1,
    name: '木纹材质',
    description: '天然木纹纹理，温暖自然，适合家居装饰品',
    type: 'wood',
    background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
    isGlow: false
  },
  {
    id: 2,
    name: '金属拉丝',
    description: '现代工业风格，光泽质感，适合科技产品',
    type: 'metal',
    background: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)',
    isGlow: false
  },
  {
    id: 3,
    name: '透明树脂',
    description: '高透光性，晶莹剔透，适合灯具和装饰品',
    type: 'resin',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(200,200,255,0.5) 100%)',
    isGlow: false
  },
  {
    id: 4,
    name: '发光材质',
    description: 'LED 发光效果，未来感十足，适合创意产品',
    type: 'glow',
    background: 'linear-gradient(135deg, rgba(131,56,236,0.8) 0%, rgba(58,134,255,0.8) 100%)',
    isGlow: true
  },
  {
    id: 5,
    name: '陶瓷质感',
    description: '光滑细腻，温润如玉，适合工艺品',
    type: 'ceramic',
    background: 'linear-gradient(135deg, #f5f5dc 0%, #ffffff 100%)',
    isGlow: false
  },
  {
    id: 6,
    name: '碳纤维',
    description: '轻量坚固，科技感强，适合运动产品',
    type: 'carbon',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
    isGlow: false
  },
];

const MaterialLab = () => {
  const intl = useIntl();
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const handleMaterialClick = (material) => {
    setSelectedMaterial(material.id === selectedMaterial ? null : material.id);
  };

  const currentMaterial = mockMaterials.find(m => m.id === selectedMaterial) || mockMaterials[0];

  const handleOrderClick = () => {
    if (selectedMaterial) {
      console.log('Ordering material:', currentMaterial.name);
      // 处理订购逻辑
    }
  };

  return (
    <SectionContainer>
      <HeaderWrapper>
        <SectionTitle level={2}>
          <FormattedMessage 
            id="material.lab.title" 
            defaultMessage="The Material Lab" 
          />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage 
            id="material.lab.subtitle" 
            defaultMessage="点击材质球实时预览效果，你的设计可以变成任何材质" 
          />
        </SectionSubtitle>
      </HeaderWrapper>

      <MainContent>
        {/* 左侧：3D 模型预览 */}
        <ModelPreview>
          <MaterialTexture $materialType={currentMaterial?.type} />
          <ModelPlaceholder>OBJ</ModelPlaceholder>
          
          {currentMaterial && (
            <MaterialInfo>
              <MaterialName>{currentMaterial.name}</MaterialName>
              <MaterialDescription>{currentMaterial.description}</MaterialDescription>
            </MaterialInfo>
          )}
        </ModelPreview>

        {/* 右侧：材质球阵列 */}
        <div>
          <MaterialGrid>
            {mockMaterials.map((material) => (
              <MaterialBall
                key={material.id}
                $active={selectedMaterial === material.id}
                $background={material.background}
                $isGlow={material.isGlow}
                onClick={() => handleMaterialClick(material)}
              >
                <BallTexture $type={material.type} />
                <SelectedBadge $active={selectedMaterial === material.id}>
                  <CheckCircleOutlined />
                </SelectedBadge>
              </MaterialBall>
            ))}
          </MaterialGrid>

          <CTAButton 
            type="primary" 
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleOrderClick}
            disabled={!selectedMaterial}
          >
            <FormattedMessage 
              id="material.lab.order.button" 
              defaultMessage="订购实物样品" 
            />
          </CTAButton>
        </div>
      </MainContent>
    </SectionContainer>
  );
};

export default MaterialLab;

