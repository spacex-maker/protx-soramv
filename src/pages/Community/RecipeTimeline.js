import React, { useState } from 'react';
import { Typography } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import { 
  BulbOutlined,
  RobotOutlined,
  BlockOutlined,
  PrinterOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
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

// 时间轴容器 - 类似地铁线路图
const TimelineContainer = styled.div`
  position: relative;
  padding: 60px 0;
  overflow-x: auto;
  overflow-y: visible;

  /* 隐藏滚动条但保持滚动功能 */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f5f5f5'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#3c4043' : '#d9d9d9'};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#5f6368' : '#bfbfbf'};
    }
  }

  @media (max-width: 768px) {
    padding: 40px 0;
  }
`;

// 时间轴轨道（连接线）
const TimelineTrack = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(90deg, #8338ec 0%, #3a86ff 50%, #06ffa5 100%)'
    : 'linear-gradient(90deg, #e1bee7 0%, #bbdefb 50%, #c8e6c9 100%)'};
  transform: translateY(-50%);
  border-radius: 2px;
  z-index: 0;
`;

// 时间轴节点容器（横向布局）
const TimelineNodes = styled.div`
  position: relative;
  display: flex;
  gap: 80px;
  padding: 0 40px;
  min-width: fit-content;
  z-index: 1;

  @media (max-width: 1024px) {
    gap: 60px;
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    gap: 40px;
    padding: 0 10px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

// 连接箭头（仅在横向时显示）
const ConnectionArrow = styled.div`
  position: absolute;
  top: 50%;
  left: calc(100% + 20px);
  transform: translateY(-50%);
  color: ${props => props.theme.mode === 'dark' ? '#5f6368' : '#bfbfbf'};
  font-size: 24px;
  z-index: 2;

  @media (max-width: 768px) {
    display: none;
  }
`;

// 节点卡片
const NodeCard = styled.div`
  position: relative;
  width: 280px;
  min-width: 280px;
  padding: 32px;
  border-radius: 24px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
  border: 2px solid ${props => props.$active 
    ? (props.theme.mode === 'dark' ? '#8338ec' : '#8338ec')
    : (props.theme.mode === 'dark' ? '#3c4043' : '#dadce0')};
  box-shadow: ${props => props.$active 
    ? '0 8px 32px rgba(131, 56, 236, 0.3)'
    : '0 4px 12px rgba(0, 0, 0, 0.08)'};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: ${props => props.$active ? 10 : 2};

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: ${props => props.theme.mode === 'dark' ? '#8338ec' : '#8338ec'};
    box-shadow: 0 12px 48px ${props => props.theme.mode === 'dark' 
      ? 'rgba(131, 56, 236, 0.4)' 
      : 'rgba(131, 56, 236, 0.2)'};
    z-index: 10;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    padding: 24px;
  }
`;

// 节点图标容器
const NodeIcon = styled.div`
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #8338ec 0%, #3a86ff 100%)'
    : (props.theme.mode === 'dark' ? '#292a2d' : '#f5f5f5')};
  border: 4px solid ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: ${props => props.$active ? '#fff' : (props.theme.mode === 'dark' ? '#9aa0a6' : '#5f6368')};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 5;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  ${NodeCard}:hover & {
    animation: ${pulse} 2s ease-in-out infinite;
    transform: translateX(-50%) scale(1.1);
  }

  @media (max-width: 768px) {
    top: 24px;
    left: 24px;
    transform: none;
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
`;

const NodeContent = styled.div`
  margin-top: 24px;
  color: ${props => props.theme.mode === 'dark' ? '#e8eaed' : '#202124'};

  @media (max-width: 768px) {
    margin-top: 16px;
    padding-left: 72px;
  }
`;

const NodeTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#e8eaed' : '#202124'};
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
`;

const NodeDescription = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
  margin-bottom: 16px;
`;

// 详情展开区域
const NodeDetails = styled.div`
  max-height: ${props => props.$expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s ease;
  margin-top: ${props => props.$expanded ? '16px' : '0'};
  opacity: ${props => props.$expanded ? 1 : 0};
`;

const DetailItem = styled.div`
  padding: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#292a2d' : '#f5f5f5'};
  border-radius: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'};
`;

const DetailLabel = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
`;

const DetailValue = styled.div`
  font-family: 'Monaco', 'Courier New', monospace;
  word-break: break-all;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
`;

// 步骤序号标签
const StepBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #8338ec 0%, #3a86ff 100%)'
    : (props.theme.mode === 'dark' ? '#3c4043' : '#e8e8e8')};
  color: ${props => props.$active ? '#fff' : (props.theme.mode === 'dark' ? '#9aa0a6' : '#5f6368')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
`;

const timelineSteps = [
  {
    id: 1,
    title: 'Prompt 创意',
    icon: <BulbOutlined />,
    description: '输入你的创意想法，描述你想要生成的内容',
    details: {
      prompt: 'A futuristic minimalist lamp with organic curves, translucent resin material, soft warm light, modern interior design',
      tools: 'ChatGPT / Claude'
    }
  },
  {
    id: 2,
    title: 'AI 工具生成',
    icon: <RobotOutlined />,
    description: '使用 Midjourney 或 Stable Diffusion 生成概念图',
    details: {
      tool: 'Midjourney v6',
      parameters: '--ar 16:9 --v 6 --style raw',
      model: 'SDXL 1.0'
    }
  },
  {
    id: 3,
    title: '3D 转换',
    icon: <BlockOutlined />,
    description: '使用 Tripo AI 或 CSM 将 2D 图像转换为 3D 模型',
    details: {
      tool: 'Tripo AI',
      format: 'OBJ / STL',
      resolution: 'High (2048x2048)'
    }
  },
  {
    id: 4,
    title: '实物制造',
    icon: <PrinterOutlined />,
    description: '3D 打印或 CNC 加工，将数字模型变为真实物体',
    details: {
      method: '3D Printing',
      material: 'PLA Resin',
      duration: '12 hours',
      dimensions: '25cm × 15cm × 30cm'
    }
  },
];

const RecipeTimeline = () => {
  const intl = useIntl();
  const [activeNode, setActiveNode] = useState(null);
  const [expandedNode, setExpandedNode] = useState(null);

  const handleNodeClick = (nodeId) => {
    if (expandedNode === nodeId) {
      setExpandedNode(null);
    } else {
      setExpandedNode(nodeId);
    }
    setActiveNode(nodeId);
  };

  const handleNodeHover = (nodeId) => {
    setActiveNode(nodeId);
  };

  const handleNodeLeave = () => {
    if (!expandedNode) {
      setActiveNode(null);
    }
  };

  return (
    <SectionContainer>
      <HeaderWrapper>
        <SectionTitle level={2}>
          <FormattedMessage 
            id="recipe.timeline.title" 
            defaultMessage="Recipe Timeline" 
          />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage 
            id="recipe.timeline.subtitle" 
            defaultMessage="从灵感到实物的完整工作流，点击节点查看详细参数和提示词" 
          />
        </SectionSubtitle>
      </HeaderWrapper>

      <TimelineContainer>
        <TimelineTrack />
        <TimelineNodes>
          {timelineSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <NodeCard
                $active={activeNode === step.id || expandedNode === step.id}
                onClick={() => handleNodeClick(step.id)}
                onMouseEnter={() => handleNodeHover(step.id)}
                onMouseLeave={handleNodeLeave}
              >
                <StepBadge $active={activeNode === step.id || expandedNode === step.id}>
                  {step.id}
                </StepBadge>
                
                <NodeIcon $active={activeNode === step.id || expandedNode === step.id}>
                  {step.icon}
                </NodeIcon>

                <NodeContent>
                  <NodeTitle>{step.title}</NodeTitle>
                  <NodeDescription>{step.description}</NodeDescription>
                  
                  <NodeDetails $expanded={expandedNode === step.id}>
                    {Object.entries(step.details).map(([key, value]) => (
                      <DetailItem key={key}>
                        <DetailLabel>
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </DetailLabel>
                        <DetailValue>{value}</DetailValue>
                      </DetailItem>
                    ))}
                  </NodeDetails>
                </NodeContent>
              </NodeCard>
              
              {index < timelineSteps.length - 1 && (
                <ConnectionArrow>
                  <ArrowRightOutlined />
                </ConnectionArrow>
              )}
            </React.Fragment>
          ))}
        </TimelineNodes>
      </TimelineContainer>
    </SectionContainer>
  );
};

export default RecipeTimeline;

