import React from 'react';
import { Typography, Row, Col } from 'antd';
import {
  PlayCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  VideoCameraAddOutlined,
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { ContentWrapper, Section } from '../styles';

const { Title, Text } = Typography;

// 渐变动画
const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

// 浮动动画
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// 脉冲动画
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const FeaturesContainer = styled(Section)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.mode === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(99, 179, 237, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'};
    pointer-events: none;
  }
`;

const StyledFeatureCard = styled.div`
  position: relative;
  height: 100%;
  padding: 32px 24px;
  border-radius: 24px;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(99, 179, 237, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      #3b82f6,
      #8b5cf6,
      #ec4899,
      #3b82f6
    );
    background-size: 200% 100%;
    animation: ${gradientShift} 3s ease infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(99, 179, 237, 0.5)'
      : 'rgba(59, 130, 246, 0.4)'};
    box-shadow: ${props => props.theme.mode === 'dark'
      ? '0 20px 40px rgba(99, 179, 237, 0.2), 0 0 0 1px rgba(99, 179, 237, 0.1)'
      : '0 20px 40px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)'};

    &::before {
      opacity: 1;
    }

    .icon-wrapper {
      transform: scale(1.1) rotate(5deg);
      background: ${props => props.theme.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(99, 179, 237, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'};
    }
  }

  .icon-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
    border-radius: 20px;
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(99, 179, 237, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'};
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: ${float} 3s ease-in-out infinite;

    .anticon {
      font-size: 40px;
      background: ${props => props.theme.mode === 'dark'
        ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 20px;
      padding: 2px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  &:hover .icon-wrapper::after {
    opacity: 0.5;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const FeatureTitle = styled(Title)`
  margin-bottom: 12px !important;
  font-size: 20px !important;
  font-weight: 600 !important;
  color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'} !important;
`;

const FeatureDescription = styled(Text)`
  font-size: 14px !important;
  line-height: 1.6 !important;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(226, 232, 240, 0.7)' : 'rgba(30, 41, 59, 0.7)'} !important;
`;

const SectionTitle = styled(Title)`
  text-align: center;
  margin-bottom: 16px !important;
  font-size: 42px !important;
  font-weight: 700 !important;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SectionSubtitle = styled(Text)`
  display: block;
  text-align: center;
  margin-bottom: 64px !important;
  font-size: 18px !important;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(30, 41, 59, 0.6)'} !important;
`;

const features = [
  {
    icon: <PlayCircleOutlined />,
    title: '文本生成视频',
    description: '输入文字描述，Sora AI 将您的创意转化为高质量视频，支持复杂的场景和动作描述'
  },
  {
    icon: <PictureOutlined />,
    title: '图片生成视频',
    description: '上传参考图片，AI 自动生成动态视频内容，让静态图片焕发生机'
  },
  {
    icon: <RobotOutlined />,
    title: '多种 AI 模型',
    description: '提供多种 Sora 模型选择，满足不同创作需求和风格偏好，从写实到艺术风格'
  },
  {
    icon: <VideoCameraAddOutlined />,
    title: '高质量输出',
    description: '支持 720p、1080p 和 4K 超高清分辨率，生成电影级质量的视频作品'
  },
  {
    icon: <ThunderboltOutlined />,
    title: '快速生成',
    description: '优化的 AI 模型和强大的计算资源，快速完成视频生成，节省创作时间'
  },
  {
    icon: <FileTextOutlined />,
    title: '参数自定义',
    description: '支持视频时长、帧率、风格等参数自定义，让您完全掌控创作过程'
  }
];

const FeaturesSection = () => {
  return (
    <FeaturesContainer>
      <ContentWrapper>
        <SectionTitle level={2}>核心功能</SectionTitle>
        <SectionSubtitle>
          基于 Sora 先进 AI 技术，为您提供全方位的视频生成解决方案
        </SectionSubtitle>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <StyledFeatureCard>
                <div className="icon-wrapper">{feature.icon}</div>
                <FeatureTitle level={4}>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </StyledFeatureCard>
            </Col>
          ))}
        </Row>
      </ContentWrapper>
    </FeaturesContainer>
  );
};

export default FeaturesSection;
