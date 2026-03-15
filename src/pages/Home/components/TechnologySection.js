import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExperimentOutlined, 
  DeploymentUnitOutlined, 
  GoldOutlined, 
  RocketOutlined, 
  ThunderboltFilled,
  SyncOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

// ==========================================
// 1. 动效定义 (Keyframes)
// ==========================================

const spin = keyframes`
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
`;

const scanLaser = keyframes`
  0% { transform: translateY(-100px); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(400px); opacity: 0; }
`;

const gridScroll = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 50px 50px; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

// ==========================================
// 2. 容器与环境
// ==========================================

const Container = styled.div`
  width: 100%;
  height: 100vh;
  min-height: 800px;
  background: #0b0c10;
  color: #c5c6c7;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  position: relative;
  overflow: hidden;
  display: flex;
`;

const BlueprintBg = styled.div`
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(102, 252, 241, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 252, 241, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: ${gridScroll} 30s linear infinite;
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 0%, #0b0c10 80%);
  }
`;

// ==========================================
// 3. 核心视觉：工业级 CSS 3D 渲染
// ==========================================

const Scene3D = styled.div`
  width: 320px;
  height: 320px;
  position: relative;
  perspective: 1200px;
  transform-style: preserve-3d;
`;

const WireframeObject = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: absolute;
  transform-style: preserve-3d;
  animation: ${spin} 20s linear infinite;

  .face {
    position: absolute;
    width: 200px;
    height: 200px;
    left: 60px;
    top: 60px;
    border: 1px solid #45a29e;
    background: rgba(69, 162, 158, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #66fcf1;
    box-shadow: inset 0 0 20px rgba(102, 252, 241, 0.1);
    transition: all 0.5s ease;
  }

  .front  { transform: translateZ(100px); }
  .back   { transform: rotateY(180deg) translateZ(100px); }
  .right  { transform: rotateY(90deg) translateZ(100px); }
  .left   { transform: rotateY(-90deg) translateZ(100px); }
  .top    { transform: rotateX(90deg) translateZ(100px); }
  .bottom { transform: rotateX(-90deg) translateZ(100px); }

  ${props => props.$shape === 'analysis' && css`
    .face { 
      border-radius: 50%; 
      border: 1px dashed #fab1a0; 
      background: rgba(250, 177, 160, 0.1); 
      color: #fab1a0;
    }
  `}
  
  ${props => props.$shape === 'structure' && css`
    .face { 
      border: 2px solid #66fcf1; 
      clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%);
      background: rgba(102, 252, 241, 0.15);
    }
  `}

  ${props => props.$shape === 'network' && css`
    .face {
      border: 1px dotted #ffeaa7;
      background: transparent;
      &::after {
        content: ''; position: absolute; inset: 20px; 
        border: 1px solid #ffeaa7; opacity: 0.5;
      }
    }
  `}
`;

const ScannerLine = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: #66fcf1;
  box-shadow: 0 0 15px #66fcf1, 0 0 30px #45a29e;
  animation: ${scanLaser} 3s ease-in-out infinite;
  z-index: 10;
`;

// ==========================================
// 4. 左侧导航
// ==========================================

const Sidebar = styled.div`
  width: 340px;
  height: 100%;
  background: rgba(11, 12, 16, 0.95);
  border-right: 1px solid #1f2833;
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 40px 0;
  backdrop-filter: blur(10px);
`;

const NavItem = styled.div`
  position: relative;
  padding: 24px 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${props => props.$active ? '#fff' : '#888'};
  background: ${props => props.$active ? 'linear-gradient(90deg, rgba(102, 252, 241, 0.1), transparent)' : 'transparent'};
  transition: all 0.3s;
  border-left: 3px solid ${props => props.$active ? props.$color : 'transparent'};

  &:hover { background: rgba(255,255,255,0.02); }

  .step-num {
    font-size: 10px;
    color: #45a29e;
    position: absolute;
    top: 10px;
    right: 20px;
  }
`;

// ==========================================
// 5. 右侧面板与光标修复
// ==========================================

const InfoPanel = styled.div`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 10;
`;

const DataCard = styled(motion.div)`
  background: rgba(11, 12, 16, 0.9);
  border: 1px solid #1f2833;
  padding: 20px;
  position: relative;
  
  &::before { content: ''; position: absolute; top: -1px; left: -1px; width: 10px; height: 10px; border-top: 2px solid #66fcf1; border-left: 2px solid #66fcf1; }
  &::after { content: ''; position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px; border-bottom: 2px solid #66fcf1; border-right: 2px solid #66fcf1; }

  h3 {
    margin: 0 0 12px 0;
    font-size: 12px;
    color: #45a29e;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    justify-content: space-between;
  }
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  
  .label { color: #888; }
  .value { color: #fff; font-weight: bold; font-family: 'Courier New', monospace; }
`;

const LogTerminal = styled.div`
  font-size: 10px;
  color: #45a29e;
  height: 80px;
  overflow: hidden;
  opacity: 0.7;
  line-height: 1.5;
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
`;

// ！！！修复的核心：将动画放在 Styled Component 内部 ！！！
const TerminalCursor = styled.span`
  display: inline-block;
  width: 6px;
  height: 10px;
  background: #66fcf1;
  margin-left: 4px;
  animation: ${blink} 1s step-end infinite;
  vertical-align: middle;
`;

// ==========================================
// 6. 主逻辑
// ==========================================

const AI2OBJPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "GENERATIVE ENGINEERING",
      subtitle: "Topology & CAD Optimization",
      color: "#66fcf1",
      icon: <DeploymentUnitOutlined />,
      shape: "structure",
      metrics: [
        { label: "WEIGHT REDUCTION", value: "-24%" },
        { label: "MATERIAL", value: "AL-6061" },
        { label: "POLY COUNT", value: "2.4M" }
      ],
      logs: [
        "> Generating 3D mesh...",
        "> Running topology optimization...",
        "> Structural integrity verified."
      ]
    },
    {
      id: 1,
      title: "DIGITAL TWIN SIM",
      subtitle: "FEA & Physics Validation",
      color: "#ff7675",
      icon: <ExperimentOutlined />,
      shape: "analysis",
      metrics: [
        { label: "STRESS LOAD", value: "4500 N" },
        { label: "THERMAL MAX", value: "85°C" },
        { label: "DRAG COEFF", value: "0.24 Cd" }
      ],
      logs: [
        "> Initializing Finite Element Analysis...",
        "> Simulating wind tunnel test...",
        "> Thermal dissipation grid active."
      ]
    },
    {
      id: 2,
      title: "SMART SUPPLY CHAIN",
      subtitle: "BOM & Sourcing Network",
      color: "#ffeaa7",
      icon: <GoldOutlined />,
      shape: "network",
      metrics: [
        { label: "SUPPLIERS", value: "14 ACTIVE" },
        { label: "LEAD TIME", value: "12 DAYS" },
        { label: "EST. COST", value: "$45.20" }
      ],
      logs: [
        "> Bill of Materials (BOM) compiled.",
        "> Querying global component db...",
        "> Logistics route optimized."
      ]
    },
    {
      id: 3,
      title: "CYBER MFG & LAUNCH",
      subtitle: "CAM & G-Code Generation",
      color: "#55efc4",
      icon: <RocketOutlined />,
      shape: "structure",
      metrics: [
        { label: "PRODUCTION", value: "READY" },
        { label: "TOLERANCE", value: "±0.01mm" },
        { label: "SKU ID", value: "AI-X-2026" }
      ],
      logs: [
        "> Compiling 5-axis CNC G-Code...",
        "> Quality control vision system online.",
        "> Digital twin synchronized."
      ]
    }
  ];

  const currentStep = steps[activeStep];

  return (
    <Container>
      <BlueprintBg />
      
      {/* Sidebar */}
      <Sidebar>
        <div style={{padding:'0 32px 40px'}}>
          <div style={{fontSize:24, fontWeight:800, color:'#fff', letterSpacing:1}}>GENESIS<span style={{color:'#45a29e'}}>ENGINE</span></div>
          <div style={{fontSize:10, color:'#666', marginTop:4}}>AI-DRIVEN PRODUCT LIFECYCLE</div>
        </div>

        {steps.map((step, idx) => (
          <NavItem 
            key={idx} 
            $active={activeStep === idx}
            $color={step.color}
            onClick={() => setActiveStep(idx)}
          >
            <span className="step-num">0{idx + 1}</span>
            <div style={{fontSize:20, color: activeStep === idx ? step.color : '#444'}}>
              {step.icon}
            </div>
            <div>
              <div style={{fontWeight:700, fontSize:13, letterSpacing:0.5}}>{step.title}</div>
              <div style={{fontSize:10, color:'#666', marginTop:2}}>{step.subtitle}</div>
            </div>
          </NavItem>
        ))}

        <div style={{marginTop:'auto', padding:'32px', borderTop:'1px solid #1f2833'}}>
          <div style={{display:'flex', gap:10, fontSize:11, color:'#45a29e'}}>
            <SyncOutlined spin /> 
            <span>LIVE CONNECTION</span>
          </div>
          <div style={{fontSize:10, color:'#444', marginTop:4}}>LATENCY: 14ms | SERVER: US-EAST</div>
        </div>
      </Sidebar>

      {/* Main View */}
      <div style={{flex:1, position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        
        <div style={{position:'absolute', top:40, textAlign:'center', zIndex:5}}>
           <h2 style={{fontSize:32, margin:0, color:'#fff', textShadow:'0 0 20px rgba(102, 252, 241, 0.3)'}}>
             {currentStep.title}
           </h2>
        </div>

        <Scene3D>
          <ScannerLine />
          <AnimatePresence mode='wait'>
            <WireframeObject 
              key={activeStep}
              $shape={currentStep.shape}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <div className="face front">{currentStep.icon}</div>
              <div className="face back">{currentStep.icon}</div>
              <div className="face right"><CheckCircleOutlined /></div>
              <div className="face left"><SyncOutlined spin={activeStep===3} /></div>
              <div className="face top">AI</div>
              <div className="face bottom">OBJ</div>
            </WireframeObject>
          </AnimatePresence>
          
          <div style={{
            position:'absolute', bottom:-50, left:0, width:'100%', height:20, 
            background:'radial-gradient(ellipse at center, rgba(102, 252, 241, 0.3), transparent 70%)',
            filter:'blur(10px)', transform:'rotateX(90deg)'
          }} />
        </Scene3D>

      </div>

      {/* Info Panel */}
      <InfoPanel>
        <AnimatePresence mode='wait'>
          <DataCard
            key={activeStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3><ThunderboltFilled /> Core Metrics</h3>
            {currentStep.metrics.map((m, i) => (
               <MetricRow key={i}>
                 <span className="label">{m.label}</span>
                 <span className="value" style={{color: currentStep.color}}>{m.value}</span>
               </MetricRow>
            ))}
          </DataCard>

          <DataCard
            key={`log-${activeStep}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{marginTop: 16}}
          >
             <h3>System Logs</h3>
             <LogTerminal>
               {currentStep.logs.map((log, i) => (
                 <div key={i} style={{marginBottom:4}}>{log}</div>
               ))}
               <TerminalCursor /> {/* 修复：使用组件代替内联样式 */}
             </LogTerminal>
          </DataCard>
        </AnimatePresence>
      </InfoPanel>

    </Container>
  );
};

export default AI2OBJPage;