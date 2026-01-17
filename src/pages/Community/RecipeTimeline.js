import React, { useState, useEffect } from 'react';
import { Typography, Steps, Tag } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes, css } from 'styled-components';
import { 
  BulbFilled,
  RobotFilled,
  CodeSandboxOutlined,
  PrinterFilled,
  CaretRightOutlined,
  CopyOutlined,
  CheckCircleFilled,
  LoadingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// --- 动画定义 ---

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(131, 56, 236, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(131, 56, 236, 0); }
  100% { box-shadow: 0 0 0 0 rgba(131, 56, 236, 0); }
`;

const lineFlow = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;

const textType = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

// --- 容器样式 ---

const SectionContainer = styled.div`
  margin: 100px auto;
  padding: 0 40px;
  max-width: 1400px;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 0 24px;
    margin: 60px auto;
  }
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const StyledTitle = styled(Title)`
  &.ant-typography {
    font-size: 42px;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -1px;
    background: linear-gradient(135deg, ${props => props.theme.mode === 'dark' ? '#fff 0%, #aaa 100%' : '#333 0%, #666 100%'});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

// --- 顶部：生产管线 (Pipeline) ---

const PipelineWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 50px;
  padding: 0 40px;

  // 连线背景
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 60px;
    right: 60px;
    height: 4px;
    background: ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
    transform: translateY(-50%);
    z-index: 0;
    border-radius: 4px;
  }

  // 激活的连线 (进度条)
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 60px;
    height: 4px;
    // 计算宽度：(当前索引 / (总数-1)) * 100%
    width: calc(${props => (props.$activeIndex / (props.$total - 1)) * 100}% - 120px); 
    background: linear-gradient(90deg, #8338ec, #3a86ff, #06ffa5);
    background-size: 200% 100%;
    animation: ${lineFlow} 2s linear infinite;
    transform: translateY(-50%);
    z-index: 0;
    transition: width 0.5s ease;
    border-radius: 4px;
    opacity: ${props => props.$activeIndex === 0 ? 0 : 1};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 40px;
    padding: 0;
    
    &::before, &::after {
      width: 4px;
      height: calc(100% - 80px);
      left: 50%;
      top: 40px;
      transform: translateX(-50%);
    }
    
    &::after {
      height: calc(${props => (props.$activeIndex / (props.$total - 1)) * 100}% - 80px);
      width: 4px;
    }
  }
`;

const StepNode = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 120px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const NodeCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border: 3px solid ${props => props.$active 
    ? (props.theme.mode === 'dark' ? '#06ffa5' : '#8338ec') 
    : (props.theme.mode === 'dark' ? '#333' : '#e0e0e0')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: ${props => props.$active ? (props.theme.mode === 'dark' ? '#06ffa5' : '#8338ec') : '#999'};
  box-shadow: ${props => props.$active ? '0 0 20px rgba(131, 56, 236, 0.4)' : 'none'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin-bottom: 16px;

  ${props => props.$active && css`
    animation: ${pulseGlow} 2s infinite;
    background: ${props.theme.mode === 'dark' ? '#2a2a2a' : '#f0f7ff'};
  `}
`;

const NodeLabel = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: ${props => props.$active 
    ? (props.theme.mode === 'dark' ? '#fff' : '#000') 
    : (props.theme.mode === 'dark' ? '#666' : '#999')};
  transition: color 0.3s;
`;

const NodeSubLabel = styled.div`
  font-size: 12px;
  color: ${props => props.$active ? '#8338ec' : 'transparent'};
  font-weight: 600;
  margin-top: 4px;
  text-transform: uppercase;
  transition: color 0.3s;
`;

// --- 底部：数据终端 (Data Console) ---

const ConsoleContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#111' : '#1e1e2e'}; // 始终保持深色底，更有极客感
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  min-height: 400px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

// 终端左侧：说明区
const ConsoleSidebar = styled.div`
  width: 35%;
  padding: 40px;
  background: rgba(255,255,255,0.03);
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 900px) {
    width: 100%;
    padding: 30px;
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
`;

const StepTitle = styled.h3`
  font-size: 28px;
  color: #fff;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-glow {
    filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
  }
`;

const StepDesc = styled.p`
  color: #aaa;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(6, 255, 165, 0.1);
  color: #06ffa5;
  border: 1px solid rgba(6, 255, 165, 0.3);
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  align-self: flex-start;
`;

// 终端右侧：代码/参数区
const ConsoleCodeArea = styled.div`
  width: 65%;
  padding: 40px;
  position: relative;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;

  @media (max-width: 900px) {
    width: 100%;
    padding: 30px;
  }
`;

const CodeWindow = styled.div`
  background: #000;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #333;
  height: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: 'TERMINAL_OUTPUT';
    position: absolute;
    top: 10px;
    right: 16px;
    font-size: 10px;
    color: #444;
    letter-spacing: 2px;
  }
`;

const CodeLine = styled.div`
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
  
  .line-num {
    color: #444;
    margin-right: 16px;
    user-select: none;
    min-width: 24px;
    text-align: right;
  }

  .content {
    color: #a5f3fc;
    
    &.key { color: #c4b5fd; }
    &.string { color: #86efac; }
    &.comment { color: #6b7280; font-style: italic; }
  }
`;

const BlinkingCursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 16px;
  background: #06ffa5;
  margin-left: 4px;
  animation: ${pulseGlow} 1s infinite;
  vertical-align: middle;
`;

// --- 数据 ---

const STEPS = [
  {
    id: 1,
    key: 'prompt',
    title: 'Prompt Engineering',
    icon: <BulbFilled style={{ color: '#ffd700' }} />,
    desc: 'Define the concept using natural language. Our LLM parses your intent into structured generation parameters.',
    status: 'PARSING_COMPLETE',
    code: [
      { type: 'comment', text: '// User Input' },
      { type: 'key', text: 'Prompt:', val: '"Futuristic lamp, organic shape"' },
      { type: 'key', text: 'Style:', val: '"Minimalist, transluscent"' },
      { type: 'key', text: 'Material:', val: '"Resin, Bio-plastic"' },
      { type: 'comment', text: '// System Optimization' },
      { type: 'key', text: 'Enrichment:', val: 'Enabled (v4.2)' },
    ]
  },
  {
    id: 2,
    key: 'gen2d',
    title: '2D Visualization',
    icon: <RobotFilled style={{ color: '#ff006e' }} />,
    desc: 'High-fidelity multi-view rendering generated by diffusion models to serve as the blueprint.',
    status: 'RENDER_SUCCESS',
    code: [
      { type: 'key', text: 'Model:', val: 'Midjourney v6.0' },
      { type: 'key', text: 'Aspect Ratio:', val: '--ar 16:9' },
      { type: 'key', text: 'Chaos:', val: '--c 10' },
      { type: 'key', text: 'Seed:', val: '293847102' },
      { type: 'key', text: 'Views:', val: '[Front, Top, Iso]' },
    ]
  },
  {
    id: 3,
    key: 'gen3d',
    title: '3D Synthesis',
    icon: <CodeSandboxOutlined style={{ color: '#3a86ff' }} />,
    desc: 'LGM (Large Gaussian Model) converts the 2D reference into a textured, watertight 3D mesh.',
    status: 'MESH_GENERATED',
    code: [
      { type: 'key', text: 'Engine:', val: 'TripoSR / CSM' },
      { type: 'key', text: 'Format:', val: '.OBJ + .MTL' },
      { type: 'key', text: 'Poly Count:', val: '250,000 tris' },
      { type: 'key', text: 'UV Map:', val: '4096 x 4096' },
      { type: 'key', text: 'Topology:', val: 'Quad-remeshed' },
    ]
  },
  {
    id: 4,
    key: 'fab',
    title: 'Fabrication',
    icon: <PrinterFilled style={{ color: '#06ffa5' }} />,
    desc: 'Automated slicing and G-code generation for additive manufacturing or CNC machining.',
    status: 'READY_TO_PRINT',
    code: [
      { type: 'key', text: 'Device:', val: 'Bambu Lab X1C' },
      { type: 'key', text: 'Material:', val: 'PLA-CF (Carbon)' },
      { type: 'key', text: 'Infill:', val: '15% Gyroid' },
      { type: 'key', text: 'Layer Height:', val: '0.12mm' },
      { type: 'key', text: 'Est. Time:', val: '14h 32m' },
    ]
  },
];

const RecipeTimeline = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [typingIndex, setTypingIndex] = useState(0);

  // 简单的自动播放逻辑 (可选，或者仅用户点击)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setActiveStep(prev => (prev + 1) % STEPS.length);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  // 重置打字效果
  useEffect(() => {
    setTypingIndex(0);
    const interval = setInterval(() => {
      setTypingIndex(prev => prev + 1);
    }, 100); // 打字速度
    return () => clearInterval(interval);
  }, [activeStep]);

  const currentStepData = STEPS[activeStep];

  return (
    <SectionContainer>
      <HeaderWrapper>
        <StyledTitle level={2}>
          <FormattedMessage id="workflow.title" defaultMessage="The Creation Workflow" />
        </StyledTitle>
        <Typography.Text type="secondary" style={{ fontSize: 18 }}>
          Trace the journey of a single idea transforming into physical reality.
        </Typography.Text>
      </HeaderWrapper>

      {/* 1. 上半部分：可视化管线 */}
      <PipelineWrapper $activeIndex={activeStep} $total={STEPS.length}>
        {STEPS.map((step, index) => (
          <StepNode 
            key={step.id} 
            onClick={() => setActiveStep(index)}
          >
            <NodeCircle $active={activeStep === index}>
              {step.icon}
            </NodeCircle>
            <NodeLabel $active={activeStep === index}>
              {step.title}
            </NodeLabel>
            <NodeSubLabel $active={activeStep === index}>
              Step 0{index + 1}
            </NodeSubLabel>
          </StepNode>
        ))}
      </PipelineWrapper>

      {/* 2. 下半部分：数据终端 */}
      <ConsoleContainer>
        <ConsoleSidebar>
          <StatusBadge>
             <LoadingOutlined spin style={{marginRight: 6}} /> 
             {currentStepData.status}
          </StatusBadge>
          <div style={{ height: 24 }} />
          <StepTitle>
            <span className="icon-glow">{currentStepData.icon}</span>
            {currentStepData.title}
          </StepTitle>
          <StepDesc>
            {currentStepData.desc}
          </StepDesc>
          <div style={{ display: 'flex', gap: 12 }}>
            <Tag color="#333" style={{ border: '1px solid #555', color: '#aaa' }}>v 2.4.0</Tag>
            <Tag color="#333" style={{ border: '1px solid #555', color: '#aaa' }}>Secure</Tag>
          </div>
        </ConsoleSidebar>

        <ConsoleCodeArea>
          <CodeWindow>
            {currentStepData.code.map((line, idx) => (
              <CodeLine key={idx} style={{ opacity: idx < typingIndex ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                <span className="line-num">{idx + 1}</span>
                <span className={`content ${line.type}`}>
                  {line.text} <span className={line.type === 'key' ? 'string' : ''}>{line.val}</span>
                </span>
              </CodeLine>
            ))}
            <div style={{ marginTop: 16 }}>
              <span className="line-num" style={{ opacity: 0 }}>00</span>
              <span style={{ color: '#06ffa5' }}>root@ai2obj:~$</span> <BlinkingCursor />
            </div>
          </CodeWindow>
        </ConsoleCodeArea>
      </ConsoleContainer>

    </SectionContainer>
  );
};

export default RecipeTimeline;