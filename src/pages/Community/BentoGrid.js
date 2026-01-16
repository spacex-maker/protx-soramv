import React, { useState } from 'react';
import { Typography } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import { 
  PlayCircleOutlined,
  CustomerServiceOutlined,
  FileImageOutlined,
  BlockOutlined,
  SoundOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
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

// Bento Grid 容器 - 非对称网格布局
const BentoGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(4, 200px);
  gap: 24px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(6, 180px);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(8, 150px);
    gap: 16px;
  }
`;

// Bento 卡片基础样式
const BentoCard = styled.div`
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  cursor: pointer;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#3c4043' : '#dadce0'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${scaleIn} 0.5s ease-out;
  animation-delay: ${props => props.$delay * 0.1}s;
  animation-fill-mode: both;
  display: flex;
  flex-direction: column;
  grid-column: ${props => props.$colSpan || 'span 4'};
  grid-row: ${props => props.$rowSpan || 'span 2'};

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    border-color: transparent;
    z-index: 10;
  }

  @media (max-width: 1024px) {
    border-radius: 24px;
    grid-column: ${props => {
      if (props.$responsiveColSpan) return props.$responsiveColSpan;
      if (props.$colSpan === 'span 4') return 'span 4';
      if (props.$colSpan === 'span 6') return 'span 4';
      return 'span 4';
    }};
  }

  @media (max-width: 768px) {
    border-radius: 20px;
    grid-column: span 4;
    grid-row: span 2;
  }
`;

const CardBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => {
    const gradients = {
      video: 'linear-gradient(135deg, #8338ec 0%, #ff006e 100%)',
      audio: 'linear-gradient(135deg, #06ffa5 0%, #ffbe0b 100%)',
      image: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)',
      model: 'linear-gradient(135deg, #3a86ff 0%, #06ffa5 100%)',
      default: 'linear-gradient(135deg, #8338ec 0%, #3a86ff 100%)'
    };
    return gradients[props.$type] || gradients.default;
  }};
  opacity: ${props => props.theme.mode === 'dark' ? 0.2 : 0.1};
  z-index: 0;
`;

const CardImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0.6;
  transition: transform 0.6s ease, opacity 0.6s ease;
  z-index: 1;

  ${BentoCard}:hover & {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)'
    : 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)'};
  z-index: 2;
`;

const CardContent = styled.div`
  position: relative;
  z-index: 3;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  height: 100%;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const CardTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CardDescription = styled.div`
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (max-width: 768px) {
    font-size: 12px;
    -webkit-line-clamp: 1;
  }
`;

// 类型图标指示器
const TypeIndicator = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 4;
  transition: all 0.3s ease;

  ${BentoCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(0, 0, 0, 0.15)'};
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
    top: 16px;
    right: 16px;
  }
`;

// 音频可视化波形动画（仅用于音频卡片）
const audioWave = keyframes`
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
`;

const AudioVisualizer = styled.div`
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  z-index: 4;
`;

const WaveBar = styled.div`
  width: 4px;
  height: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  border-radius: 2px;
  animation: ${audioWave} 1s ease-in-out infinite;
  animation-delay: ${props => props.$delay * 0.1}s;
`;

const mockItems = [
  {
    id: 1,
    type: 'video',
    title: 'AI 生成产品演示视频',
    description: '展示从概念到实物的完整流程',
    icon: <PlayCircleOutlined />,
    colSpan: 'span 6',
    rowSpan: 'span 2',
    responsiveColSpan: 'span 4',
    image: 'https://via.placeholder.com/800x400/8338ec/ffffff?text=Video'
  },
  {
    id: 2,
    type: 'audio',
    title: 'AI 音乐创作',
    description: '由 AI 生成的背景音乐',
    icon: <SoundOutlined />,
    colSpan: 'span 6',
    rowSpan: 'span 2',
    responsiveColSpan: 'span 4',
    image: 'https://via.placeholder.com/800x400/06ffa5/ffffff?text=Audio'
  },
  {
    id: 3,
    type: 'model',
    title: '3D 模型预览',
    description: '可旋转查看的交互式 3D 模型',
    icon: <BlockOutlined />,
    colSpan: 'span 4',
    rowSpan: 'span 2',
    image: 'https://via.placeholder.com/400x400/3a86ff/ffffff?text=3D'
  },
  {
    id: 4,
    type: 'image',
    title: '手机壁纸',
    description: '为手机优化的竖版设计',
    icon: <FileImageOutlined />,
    colSpan: 'span 4',
    rowSpan: 'span 2',
    image: 'https://via.placeholder.com/400x800/ff006e/ffffff?text=Wallpaper'
  },
  {
    id: 5,
    type: 'image',
    title: '材质纹理',
    description: '高分辨率纹理贴图',
    icon: <FileImageOutlined />,
    colSpan: 'span 4',
    rowSpan: 'span 2',
    image: 'https://via.placeholder.com/400x400/ffbe0b/ffffff?text=Texture'
  },
  {
    id: 6,
    type: 'video',
    title: '短视频片段',
    description: '15秒创意展示',
    icon: <VideoCameraOutlined />,
    colSpan: 'span 4',
    rowSpan: 'span 2',
    image: 'https://via.placeholder.com/400x400/8338ec/ffffff?text=Short'
  },
];

const BentoGrid = () => {
  const intl = useIntl();

  const renderAudioVisualizer = () => {
    return (
      <AudioVisualizer>
        {Array.from({ length: 20 }, (_, i) => (
          <WaveBar key={i} $delay={i} />
        ))}
      </AudioVisualizer>
    );
  };

  return (
    <SectionContainer>
      <HeaderWrapper>
        <SectionTitle level={2}>
          <FormattedMessage 
            id="bento.grid.title" 
            defaultMessage="The Bento Grid" 
          />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage 
            id="bento.grid.subtitle" 
            defaultMessage="多模态内容混排展示，完美兼容视频、音频、图片和 3D 模型" 
          />
        </SectionSubtitle>
      </HeaderWrapper>

      <BentoGridContainer>
        {mockItems.map((item, index) => (
          <BentoCard
            key={item.id}
            $colSpan={item.colSpan}
            $rowSpan={item.rowSpan}
            $responsiveColSpan={item.responsiveColSpan}
            $delay={index}
          >
            <CardBackground $type={item.type} />
            <CardImage 
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <CardOverlay />
            
            <TypeIndicator>
              {item.icon}
            </TypeIndicator>

            {item.type === 'audio' && renderAudioVisualizer()}

            <CardContent>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </BentoCard>
        ))}
      </BentoGridContainer>
    </SectionContainer>
  );
};

export default BentoGrid;

