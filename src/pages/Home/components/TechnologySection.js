import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Typography, Tag, Button, theme } from 'antd';
import { motion } from 'framer-motion';
import { useIntl } from 'react-intl';
import {
  ThunderboltFilled,
  DeploymentUnitOutlined,
  SettingFilled,
  PlayCircleFilled,
  DatabaseFilled,
  SafetyCertificateFilled,
  BgColorsOutlined,
  CloudSyncOutlined
} from '@ant-design/icons';
import { Section } from '../styles';

// ==========================================
// 1. 动效定义
// ==========================================

const flowAnimation = keyframes`
  to { stroke-dashoffset: 0; }
`;

// ==========================================
// 2. 样式组件集合
// ==========================================

const TechContainer = styled(Section)`
  background-color: #050507;
  padding: 0;
  position: relative;
  overflow: hidden;
  color: #e5e5e5;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  max-width: 900px;
  margin: 0 auto 80px;
  padding-top: 140px;
  position: relative;
  z-index: 2;

  h2 {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 700;
    background: linear-gradient(180deg, #fff 0%, #666 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 24px;
  }

  p {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 18px;
    color: #86868b;
    line-height: 1.6;
  }
`;

// --- A. 节点引擎样式 (EngineWorkspace) ---
const EngineWorkspace = styled.div`
  width: 100%;
  height: 90vh;
  min-height: 700px;
  background: #08080a;
  position: relative;
  overflow: hidden;
  border-top: 1px solid #222;
  border-bottom: 1px solid #222;
  
  /* 点阵背景 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#333 1px, transparent 1px);
    background-size: 30px 30px;
    opacity: 0.3;
  }
`;

const NodeCard = styled(motion.div)`
  position: absolute;
  width: 260px;
  background: rgba(25, 25, 28, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  z-index: 10;
  cursor: grab;
  
  &:active { cursor: grabbing; z-index: 100; }

  ${props => props.$active && css`
    box-shadow: 0 0 0 2px #2997ff, 0 0 30px rgba(41, 151, 255, 0.2);
  `}

  .node-header {
    height: 36px;
    background: ${props => props.$color || '#333'};
    border-radius: 12px 12px 0 0;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .node-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .io-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 20px;
    position: relative;
  }

  .socket {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #555;
    border: 2px solid #1e1e1e;
    position: absolute;
    transition: background 0.2s;
    
    &.input { left: -21px; }
    &.output { right: -21px; }
    &.connected { background: ${props => props.$color || '#2997ff'}; border-color: #fff; }
  }

  .control-input {
    background: #111;
    border: 1px solid #333;
    border-radius: 6px;
    color: #aaa;
    font-size: 12px;
    padding: 6px 10px;
    width: 100%;
    font-family: 'SF Mono', monospace;
    
    &:focus { outline: none; border-color: #2997ff; color: #fff; }
  }
`;

const SvgLayer = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  
  path {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
  }
  
  .wire-base { stroke: #333; stroke-width: 3px; }
  .wire-active {
    stroke: #2997ff;
    stroke-width: 3px;
    stroke-dasharray: 15;
    stroke-dashoffset: 300;
    animation: ${flowAnimation} 1s linear infinite;
    opacity: 0;
    transition: opacity 0.2s;
    &.running { opacity: 1; }
  }
`;

const HUDPanel = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 280px;
  background: rgba(10, 10, 12, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 20px;
  z-index: 50;

  .stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    color: #888;
    .val { color: #fff; font-weight: 600; font-family: 'SF Mono'; }
  }
  
  .bar-track {
    height: 4px;
    background: #333;
    border-radius: 2px;
    margin-top: 12px;
    overflow: hidden;
    .bar-fill { height: 100%; background: #2997ff; transition: width 0.2s; }
  }
`;

const TerminalWindow = styled.div`
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 420px;
  height: 240px;
  background: rgba(5, 5, 5, 0.9);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  z-index: 50;
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  
  .term-header {
    height: 32px;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    padding: 0 12px;
    border-bottom: 1px solid #333;
    .dots { display: flex; gap: 6px; span { width: 10px; height: 10px; border-radius: 50%; background: #333; } }
  }

  .term-body {
    padding: 16px;
    color: #888;
    height: calc(100% - 32px);
    overflow-y: auto;
    /* 隐藏滚动条但保留功能 */
    &::-webkit-scrollbar { width: 0px; }
    
    .line {
      margin-bottom: 6px;
      &.info { color: #60a5fa; }
      &.success { color: #4ade80; }
      &.warn { color: #facc15; }
    }
  }
`;

const FloatingRunBtn = styled(motion.button)`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  color: #000;
  border: none;
  padding: 14px 40px;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.2);
  cursor: pointer;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover { transform: translateX(-50%) scale(1.05); background: #f0f0f0; }
  &:active { transform: translateX(-50%) scale(0.95); }
  
  &.running {
    background: #333;
    color: #666;
    box-shadow: none;
    cursor: default;
  }
`;

// --- B. 性能仪表盘样式 ---
const BenchmarkSection = styled.div`
  padding: 160px 20px;
  background: #0b0c0e;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 900px) { grid-template-columns: 1fr; gap: 40px; }
`;

const ChartCard = styled(motion.div)`
  background: #111;
  border-radius: 32px;
  padding: 48px;
  border: 1px solid #222;

  h3 {
    font-size: 24px;
    color: #fff;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sub { color: #666; margin-bottom: 40px; font-size: 15px; }
`;

const BarRow = styled.div`
  margin-bottom: 28px;
  .label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #888;
    font-size: 14px;
    font-weight: 500;
  }
  .bar-bg {
    width: 100%;
    height: 12px;
    background: #222;
    border-radius: 6px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: ${props => props.$color || '#2997ff'};
    border-radius: 6px;
    width: 0;
  }
`;

// --- C. 3D 模型矩阵 (全新设计) ---
const GalaxyContainer = styled.div`
  padding: 160px 0 200px;
  background: radial-gradient(circle at center, #111 0%, #000 100%);
  overflow: hidden;
  perspective: 1000px; /* 3D 透视 */
`;

const GalaxyGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  width: 1400px;
  margin: 0 auto;
  /* 3D 倾斜 */
  transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg);
  transform-style: preserve-3d;
`;

const Model3DCard = styled(motion.div)`
  height: 400px;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  position: relative;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, #000 0%, transparent 60%);
    border-radius: 20px;
  }

  &:hover {
    transform: translateZ(40px) scale(1.05); /* 悬停时浮起 */
    box-shadow: 0 40px 80px rgba(0,0,0,0.8);
    border-color: #2997ff;
    z-index: 10;
    
    .meta { transform: translateY(0); opacity: 1; }
  }

  .meta {
    position: absolute;
    bottom: 24px;
    left: 24px;
    z-index: 2;
    transform: translateY(10px);
    opacity: 0.8;
    transition: all 0.3s;

    h4 { color: #fff; font-size: 18px; margin: 0 0 4px 0; font-weight: 700; }
    span { 
      color: #2997ff; 
      font-size: 12px; 
      background: rgba(41,151,255,0.1); 
      padding: 4px 8px; 
      border-radius: 4px; 
      border: 1px solid rgba(41,151,255,0.3);
    }
  }
`;

// ==========================================
// 3. 逻辑组件
// ==========================================

const TechnologySection = () => {
  const { token } = theme.useToken();
  const intl = useIntl();
  
  // --- 引擎节点数据 ---
  const getNodeTitle = (key) => intl.formatMessage({ id: key });
  const [nodes, setNodes] = useState([
    { id: 'n1', x: 50, y: 200, titleKey: 'technology.node.checkpointLoader', color: '#7c3aed', inputs: [], outputs: ['MODEL', 'CLIP', 'VAE'] },
    { id: 'n2', x: 400, y: 80, titleKey: 'technology.node.clipTextPositive', color: '#10b981', inputs: ['CLIP'], outputs: ['COND'], value: 'cyberpunk city, neon' },
    { id: 'n3', x: 400, y: 320, titleKey: 'technology.node.clipTextNegative', color: '#ef4444', inputs: ['CLIP'], outputs: ['COND'], value: 'blur, low quality' },
    { id: 'n4', x: 750, y: 200, titleKey: 'technology.node.ksamplerAdvanced', color: '#2997ff', inputs: ['MODEL', 'POS', 'NEG', 'LATENT'], outputs: ['LATENT'] },
    { id: 'n5', x: 1100, y: 200, titleKey: 'technology.node.vaeDecode', color: '#f59e0b', inputs: ['VAE', 'LATENT'], outputs: ['IMAGE'] },
    { id: 'n6', x: 1400, y: 150, titleKey: 'technology.node.previewImage', color: '#333', inputs: ['IMAGE'], outputs: [], isPreview: true }
  ]);

  // 连线关系 (纯数据，用于计算)
  const connections = [
    { from: 'n1', to: 'n4', fromPort: 0, toPort: 0 },
    { from: 'n1', to: 'n2', fromPort: 1, toPort: 0 },
    { from: 'n1', to: 'n3', fromPort: 1, toPort: 0 },
    { from: 'n1', to: 'n5', fromPort: 2, toPort: 0 },
    { from: 'n2', to: 'n4', fromPort: 0, toPort: 1 },
    { from: 'n3', to: 'n4', fromPort: 0, toPort: 2 },
    { from: 'n4', to: 'n5', fromPort: 0, toPort: 1 },
    { from: 'n5', to: 'n6', fromPort: 0, toPort: 0 },
  ];

  // 运行状态
  const [activeNode, setActiveNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // 初始化日志
  useEffect(() => {
    setLogs([
      { msg: intl.formatMessage({ id: 'technology.log.systemInitialized' }), type: 'info', time: new Date().toLocaleTimeString() },
      { msg: intl.formatMessage({ id: 'technology.log.waitingForInput' }), type: 'info', time: new Date().toLocaleTimeString() }
    ]);
  }, [intl]);
  const [gpuLoad, setGpuLoad] = useState(12);
  const terminalRef = useRef(null);
  const workspaceRef = useRef(null);

  // 修复3：自动滚动终端 (使用 scrollTop 而不是 scrollIntoView，避免页面跳动)
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // 修复2：拖拽处理
  // 使用 onDragEnd 而不是 onDrag，避免在拖拽过程中持续更新状态导致无限循环
  const handleDragEnd = (id, event, info) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        // 获取元素当前的位置（包括 transform）
        const element = event.target;
        const rect = element.getBoundingClientRect();
        
        // 获取父容器（EngineWorkspace）的位置
        if (workspaceRef.current) {
          const parentRect = workspaceRef.current.getBoundingClientRect();
          return { 
            ...n, 
            x: rect.left - parentRect.left, 
            y: rect.top - parentRect.top 
          };
        }
        // 如果找不到父容器，使用当前状态位置加上拖拽增量
        return { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y };
      }
      return n;
    }));
  };

  // 计算连线路径 (三次贝塞尔曲线)
  const getPath = (conn) => {
    const from = nodes.find(n => n.id === conn.from);
    const to = nodes.find(n => n.id === conn.to);
    if (!from || !to) return '';

    // 端口坐标偏移量
    const startX = from.x + 260; // 卡片宽度
    const startY = from.y + 50 + (conn.fromPort * 24);
    const endX = to.x;
    const endY = to.y + 50 + (conn.toPort * 24);

    const controlOffset = Math.abs(endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
  };

  // 模拟运行
  const runWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    const addLog = (msg, type) => setLogs(p => [...p, { msg, type, time: new Date().toLocaleTimeString() }]);

    const sequence = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'];
    
    for (const nodeId of sequence) {
      setActiveNode(nodeId);
      
      // 模拟 GPU 负载
      if (nodeId === 'n4') setGpuLoad(99); 
      else if (nodeId === 'n5') setGpuLoad(75);
      else setGpuLoad(35);

      // 模拟日志
      if (nodeId === 'n1') addLog(intl.formatMessage({ id: 'technology.log.loadingCheckpoint' }), 'warn');
      if (nodeId === 'n2') addLog(intl.formatMessage({ id: 'technology.log.tokenizingPrompt' }), 'info');
      if (nodeId === 'n4') addLog(intl.formatMessage({ id: 'technology.log.ksamplerSteps' }), 'success');

      await new Promise(r => setTimeout(r, nodeId === 'n4' ? 1500 : 600));
    }

    setActiveNode(null);
    setIsRunning(false);
    setGpuLoad(12);
    addLog(intl.formatMessage({ id: 'technology.log.generationComplete' }), 'success');
  };

  return (
    <TechContainer>
      {/* 1. 节点引擎部分 */}
      <SectionHeader>
        <div style={{ color: '#2997ff', marginBottom: 16, fontSize: 12, letterSpacing: 2 }}>{intl.formatMessage({ id: 'technology.coreArchitecture' })}</div>
        <h2>{intl.formatMessage({ id: 'technology.workflowEngine.title' })}</h2>
        <p>{intl.formatMessage({ id: 'technology.workflowEngine.description' })}</p>
      </SectionHeader>

      <EngineWorkspace ref={workspaceRef}>
        {/* 连线层 */}
        <SvgLayer>
          {connections.map((conn, i) => {
            const isActive = isRunning && activeNode === conn.from;
            return (
              <React.Fragment key={i}>
                <path d={getPath(conn)} className="wire-base" stroke="#333" />
                <path d={getPath(conn)} className={`wire-active ${isActive ? 'running' : ''}`} stroke={nodes.find(n=>n.id===conn.from)?.color} />
              </React.Fragment>
            );
          })}
        </SvgLayer>

        {/* 节点层 */}
        {nodes.map(node => (
          <NodeCard
            key={node.id}
            // 关键修复：使用 initial 和 animate 来同步位置，避免无限循环
            initial={{ x: node.x, y: node.y }}
            animate={{ x: node.x, y: node.y }}
            transition={{ duration: 0 }} // 禁用动画，立即更新位置
            drag
            dragMomentum={false} // 禁用惯性，更像专业软件
            onDragEnd={(e, info) => handleDragEnd(node.id, e, info)}
            $color={node.color}
            $active={activeNode === node.id}
          >
            <div className="node-header">
              <span>{intl.formatMessage({ id: node.titleKey })}</span>
              <SettingFilled />
            </div>
            <div className="node-body">
              {node.inputs?.map((inp, i) => (
                <div key={i} className="io-row" style={{justifyContent:'flex-start'}}>
                  <div className="socket input connected"/>
                  <span className="label" style={{marginLeft:8}}>{inp}</span>
                </div>
              ))}
              
              {node.value && (
                <textarea className="control-input" rows={2} defaultValue={node.value} onMouseDown={e=>e.stopPropagation()}/>
              )}

              {node.type === 'sampler' && (
                 <div style={{fontSize:10, color:'#666'}}>steps: 30 | cfg: 7.0 | seed: -1</div>
              )}

              {node.isPreview && (
                <div style={{width:'100%', height:120, background:'#000', borderRadius:4, overflow:'hidden'}}>
                  <img 
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80" 
                    style={{width:'100%', height:'100%', objectFit:'cover', opacity: activeNode === 'n6' ? 1 : 0.3, transition:'opacity 0.5s'}}
                    alt=""
                  />
                </div>
              )}

              {node.outputs?.map((out, i) => (
                <div key={i} className="io-row" style={{justifyContent:'flex-end'}}>
                  <span className="label" style={{marginRight:8}}>{out}</span>
                  <div className="socket output connected"/>
                </div>
              ))}
            </div>
          </NodeCard>
        ))}

        {/* HUD */}
        <HUDPanel>
          <div className="hud-header">{intl.formatMessage({ id: 'technology.hud.systemResourceMonitor' })}</div>
          <div className="stat-row">
            <span>{intl.formatMessage({ id: 'technology.hud.gpuVram' })}</span>
            <span className="val">{gpuLoad}%</span>
          </div>
          <div className="progress-bar">
            <div className="fill" style={{ width: `${gpuLoad}%`, background: gpuLoad > 90 ? '#ff4d4f' : '#2997ff' }}></div>
          </div>
        </HUDPanel>

        {/* Terminal */}
        <TerminalWindow>
          <div className="term-header">
            <div className="dots"><span></span><span></span><span></span></div>
            <span>{intl.formatMessage({ id: 'technology.terminal.console' })}</span>
          </div>
          <div className="term-body" ref={terminalRef}>
            {logs.map((log, i) => (
              <div key={i} className={`line ${log.type}`}>
                <span style={{opacity:0.5, marginRight:8}}>[{log.time}]</span>
                {log.msg}
              </div>
            ))}
          </div>
        </TerminalWindow>

        <FloatingRunBtn onClick={runWorkflow} disabled={isRunning} className={isRunning ? 'running' : ''}>
          {isRunning ? intl.formatMessage({ id: 'technology.button.running' }) : intl.formatMessage({ id: 'technology.button.runWorkflow' })}
        </FloatingRunBtn>
      </EngineWorkspace>

      {/* 2. 性能压测 */}
      <BenchmarkSection>
        <SectionHeader>
          <h2>{intl.formatMessage({ id: 'technology.benchmark.title' })}</h2>
          <p>{intl.formatMessage({ id: 'technology.benchmark.description' })}</p>
        </SectionHeader>
        <ChartGrid>
          <ChartCard
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3><ThunderboltFilled style={{color: '#eab308'}} /> {intl.formatMessage({ id: 'technology.benchmark.fps.title' })}</h3>
            <div className="sub">{intl.formatMessage({ id: 'technology.benchmark.fps.subtitle' })}</div>
            <BarRow $color="#2997ff">
              <div className="label"><span>{intl.formatMessage({ id: 'technology.benchmark.productX' })}</span> <span>24 fps</span></div>
              <div className="bar-bg"><motion.div className="bar-fill" initial={{width: 0}} whileInView={{width: '90%'}} transition={{duration: 1.5}} /></div>
            </BarRow>
            <BarRow $color="#444">
              <div className="label"><span>{intl.formatMessage({ id: 'technology.benchmark.others' })}</span> <span>8 fps</span></div>
              <div className="bar-bg"><motion.div className="bar-fill" initial={{width: 0}} whileInView={{width: '30%'}} transition={{duration: 1.5}} /></div>
            </BarRow>
          </ChartCard>
          <ChartCard
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3><DatabaseFilled style={{color: '#10b981'}} /> {intl.formatMessage({ id: 'technology.benchmark.vram.title' })}</h3>
            <div className="sub">{intl.formatMessage({ id: 'technology.benchmark.vram.subtitle' })}</div>
            <BarRow $color="#10b981">
              <div className="label"><span>{intl.formatMessage({ id: 'technology.benchmark.productX' })}</span> <span>8 GB</span></div>
              <div className="bar-bg"><motion.div className="bar-fill" initial={{width: 0}} whileInView={{width: '30%'}} transition={{duration: 1.5}} /></div>
            </BarRow>
            <BarRow $color="#444">
              <div className="label"><span>{intl.formatMessage({ id: 'technology.benchmark.standard' })}</span> <span>24 GB</span></div>
              <div className="bar-bg"><motion.div className="bar-fill" initial={{width: 0}} whileInView={{width: '90%'}} transition={{duration: 1.5}} /></div>
            </BarRow>
          </ChartCard>
        </ChartGrid>
      </BenchmarkSection>

      {/* 3. 无限模型宇宙 (重构：3D 视差墙) */}
      <SectionHeader style={{marginBottom: 60}}>
        <Tag color="purple" style={{background:'transparent', border:'1px solid #a855f7', marginBottom:16}}>{intl.formatMessage({ id: 'technology.galaxy.openEcology' })}</Tag>
        <h2>{intl.formatMessage({ id: 'technology.galaxy.title' })}</h2>
        <p>{intl.formatMessage({ id: 'technology.galaxy.description' })}</p>
      </SectionHeader>

      <GalaxyContainer>
        <GalaxyGrid
          animate={{ 
            rotateX: [20, 25, 20], // 3D 呼吸动效
            translateY: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          {/* 第一排：Checkpoint */}
          {[
            { name: 'CyberRealistic', type: 'CHECKPOINT', bg: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80' },
            { name: 'DreamShaper', type: 'CHECKPOINT', bg: 'https://files.catbox.moe/azjt7u.png' },
            { name: 'Realistic Vision', type: 'CHECKPOINT', bg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80' },
            { name: 'Deliberate', type: 'CHECKPOINT', bg: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80' }
          ].map((item, i) => (
            <Model3DCard key={i} $bg={item.bg} style={{marginTop: i % 2 * 40}}>
              <div className="meta">
                <h4>{item.name}</h4>
                <span>{item.type}</span>
              </div>
            </Model3DCard>
          ))}

          {/* 第二排：LoRA */}
          {[
            { name: 'Ghibli Style', type: 'LORA', bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80' },
            { name: 'Mecha Suit', type: 'LORA', bg: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80' },
            { name: 'Detailed Eye', type: 'LORA', bg: 'https://files.catbox.moe/q41csa.png' },
            { name: 'Add Detail', type: 'LORA', bg: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&q=80' }
          ].map((item, i) => (
            <Model3DCard key={i+4} $bg={item.bg} style={{marginTop: (i+1) % 2 * 40}}>
              <div className="meta">
                <div style={{display:'flex', gap:6, marginBottom:4}}>
                  <CloudSyncOutlined style={{color:'#2997ff'}}/>
                  <span style={{border:'none', padding:0, background:'transparent', color:'#fff'}}>{intl.formatMessage({ id: 'technology.galaxy.autoSync' })}</span>
                </div>
                <h4>{item.name}</h4>
                <span style={{borderColor:'#a855f7', color:'#a855f7', background:'rgba(168,85,247,0.1)'}}>{item.type}</span>
              </div>
            </Model3DCard>
          ))}
        </GalaxyGrid>
      </GalaxyContainer>

    </TechContainer>
  );
};

export default TechnologySection;