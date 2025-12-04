import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, message, Space, Input, Modal, Spin } from 'antd';
import { SaveOutlined, PlayCircleOutlined, PlusOutlined, AimOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { base } from '../../../../../api/base';
import NodePalette from './NodePalette';
import { nodeTypes } from './nodes';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { HocuspocusProvider } from '@hocuspocus/provider';

const WorkflowContainer = styled.div<{ $height?: number }>`
  display: flex;
  flex-direction: column;
  height: ${props => props.$height ? `${props.$height}px` : '100%'};
  width: 100%;
  min-height: 600px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'};
  overflow: hidden;
`;

const Toolbar = styled.div`
  padding: 16px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FlowCanvas = styled.div<{ $height?: number }>`
  flex: 1;
  position: relative;
  min-height: 500px;
  width: 100%;
  height: ${props => props.$height ? `${props.$height}px` : '100%'};
  overflow: hidden;
  
  .react-flow {
    width: 100% !important;
    height: 100% !important;
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
  }
  
  .react-flow__viewport {
    width: 100%;
    height: 100%;
  }
  
  .react-flow__node {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  
  .react-flow__handle {
    background: ${props => props.theme.mode === 'dark' ? '#1890ff' : '#1890ff'};
  }
  
  /* Controls 组件样式适配 */
  .react-flow__controls {
    background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'} !important;
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#ddd'} !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  }
  
  .react-flow__controls-button {
    background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'} !important;
    border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#ddd'} !important;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#333' : '#f5f5f5'} !important;
    }
    
    &:last-child {
      border-bottom: none !important;
    }
  }
  
  /* MiniMap 组件样式适配 */
  .react-flow__minimap {
    background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'} !important;
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#ddd'} !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
    border-radius: 8px !important;
    overflow: hidden !important;
  }
  
  .react-flow__minimap svg {
    background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'} !important;
  }
  
  .react-flow__minimap-mask {
    fill: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'} !important;
  }
  
  .react-flow__minimap-node {
    fill: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'} !important;
    stroke: ${props => props.theme.mode === 'dark' ? '#444' : '#ddd'} !important;
  }
  
  /* 确保 Controls 按钮图标颜色正确 */
  .react-flow__controls-button svg {
    fill: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  }
`;

const BottomToolbar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 60px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &.hidden {
    transform: translateY(100%);
  }
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SelectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .selection-count {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
    font-size: 14px;
    font-weight: 500;
  }
  
  .selection-hint {
    color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
    font-size: 12px;
  }
`;

// 工作流内容组件（在 ReactFlowProvider 内部）
const WorkflowContent: React.FC<{ 
  initialWorkflowId?: number | null;
  onWorkflowCreated?: (id: number) => void;
}> = ({ initialWorkflowId, onWorkflowCreated }) => {
  const intl = useIntl();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const workflowContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(600);
  const [loading, setLoading] = useState(false);
  const [nodePaletteVisible, setNodePaletteVisible] = useState(false);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  // 同步 provider 到 ref
  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  // 加载工作流数据
  const loadWorkflow = useCallback(async (id: number) => {
    setLoading(true);
    try {
      console.log('开始加载工作流:', id);
      const response = await base.getWorkflowDetail(id);
      console.log('工作流详情响应:', response);
      
      if (response.success && response.data) {
        const workflow = response.data;
        console.log('工作流数据:', workflow);
        
        // 设置工作流ID和名称
        setWorkflowId(id);
        setWorkflowName(workflow.name || 'Untitled Workflow');
        
        // 解析 graph_data，支持 graphData 和 graph_data 两种字段名
        const graphDataRaw = workflow.graphData || workflow.graph_data;
        if (graphDataRaw) {
          try {
            const graphData = typeof graphDataRaw === 'string' 
              ? JSON.parse(graphDataRaw) 
              : graphDataRaw;
            
            console.log('解析后的图数据:', graphData);
            
            if (graphData.nodes && Array.isArray(graphData.nodes)) {
              setNodes(graphData.nodes);
              console.log('设置节点:', graphData.nodes);
            } else {
              setNodes([]);
            }
            if (graphData.edges && Array.isArray(graphData.edges)) {
              setEdges(graphData.edges);
              console.log('设置边:', graphData.edges);
            } else {
              setEdges([]);
            }
          } catch (error) {
            console.error('解析工作流数据失败:', error, graphDataRaw);
            setNodes([]);
            setEdges([]);
          }
        } else {
          console.log('工作流没有图数据，使用空画布');
          setNodes([]);
          setEdges([]);
        }
        
        // 清理旧的 provider
        if (providerRef.current) {
          providerRef.current.destroy();
          providerRef.current = null;
        }
        
        // 连接 Hocuspocus 协同服务
        const token = localStorage.getItem('token') || '';
        const hocuspocusProvider = new HocuspocusProvider({
          url: 'ws://localhost:1234',
          name: id.toString(),
          token: token,
        });

        providerRef.current = hocuspocusProvider;
        setProvider(hocuspocusProvider);
        message.success('工作流加载成功');
      } else {
        message.error(response.message || '加载工作流失败');
      }
    } catch (error) {
      console.error('加载工作流失败:', error);
      message.error('加载工作流失败');
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  // 初始化工作流
  const initWorkflow = useCallback(async () => {
    try {
      const response = await base.createWorkflow({
        name: workflowName,
        description: '',
      });

      if (response.success && response.data) {
        const id = response.data;
        setWorkflowId(id);
        
        // 连接 Hocuspocus 协同服务
        const token = localStorage.getItem('token') || '';
        const hocuspocusProvider = new HocuspocusProvider({
          url: 'ws://localhost:1234',
          name: id.toString(),
          token: token,
        });

        setProvider(hocuspocusProvider);
        message.success('工作流创建成功');
        
        // 通知父组件
        if (onWorkflowCreated) {
          onWorkflowCreated(id);
        }
      } else {
        message.error(response.message || '创建工作流失败');
      }
    } catch (error) {
      console.error('创建工作流失败:', error);
      message.error('创建工作流失败');
    }
  }, [workflowName, onWorkflowCreated]);

  // 保存工作流
  const handleSave = useCallback(async () => {
    if (!workflowId) {
      await initWorkflow();
      return;
    }

    try {
      // 构建图数据
      const graphData = {
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const response = await base.updateWorkflow({
        id: workflowId,
        name: workflowName,
        graphData: JSON.stringify(graphData),
      });

      if (response.success) {
        message.success('保存成功');
      } else {
        message.error(response.message || '保存失败');
      }
    } catch (error) {
      console.error('保存工作流失败:', error);
      message.error('保存工作流失败');
    }
  }, [workflowId, workflowName, nodes, edges, initWorkflow]);

  // 运行工作流
  const handleRun = useCallback(async () => {
    if (!workflowId) {
      message.warning('请先创建工作流');
      return;
    }

    try {
      const response = await base.runWorkflow(workflowId, {});
      if (response.success) {
        message.success('工作流运行成功');
      } else {
        message.error(response.message || '运行失败');
      }
    } catch (error) {
      console.error('运行工作流失败:', error);
      message.error('运行工作流失败');
    }
  }, [workflowId]);

  // 打开节点选择面板
  const handleOpenNodePalette = useCallback(() => {
    setNodePaletteVisible(true);
  }, []);

  // 从节点库选择节点
  const handleSelectNode = useCallback((nodeConfig: any) => {
    console.log('选择节点:', nodeConfig);
    
    // 计算新节点的位置（在画布中心附近）
    let position = { x: 250, y: 250 };
    
    try {
      // 使用屏幕坐标转换为画布坐标
      position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      console.log('计算的位置:', position);
    } catch (error) {
      console.warn('计算位置失败，使用默认位置:', error);
      // 如果已有节点，在新节点附近添加
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        position = {
          x: lastNode.position.x + 200,
          y: lastNode.position.y,
        };
      }
    }
    
    // 解析默认参数
    let defaultParams = {};
    if (nodeConfig.defaultParams) {
      try {
        defaultParams = typeof nodeConfig.defaultParams === 'string' 
          ? JSON.parse(nodeConfig.defaultParams) 
          : nodeConfig.defaultParams;
      } catch (error) {
        console.warn('解析默认参数失败:', error);
      }
    }
    
    // 根据 nodeKey 确定节点类型，如果没有自定义类型则使用 default
    const nodeType = nodeTypes[nodeConfig.nodeKey as keyof typeof nodeTypes] ? nodeConfig.nodeKey : 'default';
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      data: { 
        label: nodeConfig.nodeName,
        nodeKey: nodeConfig.nodeKey,
        nodeConfig: nodeConfig,
        ...defaultParams,
      },
    };
    
    console.log('新节点:', newNode);
    setNodes(nds => {
      const newNodes = [...nds, newNode];
      console.log('更新后的节点列表:', newNodes);
      return newNodes;
    });
    
    // 延迟执行 fitView，确保节点已添加
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 200);
  }, [nodes, setNodes, screenToFlowPosition, fitView]);

  // 连接节点
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 删除连线
  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    // ReactFlow 会自动从 edges 中移除，这里可以添加额外的逻辑
    if (deleted.length > 0) {
      message.success(`已删除 ${deleted.length} 条连线`);
      setSelectedEdges((prev) => prev.filter(edge => !deleted.some(d => d.id === edge.id)));
    }
  }, []);

  // 删除节点（通过键盘快捷键）
  const onNodesDelete = useCallback((deleted: Node[]) => {
    if (deleted.length > 0) {
      // 同时删除与这些节点相关的连线
      const nodeIds = deleted.map(node => node.id);
      const relatedEdgeIds = edges
        .filter(edge => nodeIds.includes(edge.source) || nodeIds.includes(edge.target))
        .map(edge => edge.id);
      
      setEdges((eds) => eds.filter(edge => !relatedEdgeIds.includes(edge.id)));
      message.success(`已删除 ${deleted.length} 个节点`);
      setSelectedNodes((prev) => prev.filter(node => !deleted.some(d => d.id === node.id)));
    }
  }, [edges, setEdges]);


  // 监听选中的连线和节点
  useEffect(() => {
    const selectedE = edges.filter(edge => edge.selected);
    const selectedN = nodes.filter(node => node.selected);
    setSelectedEdges(selectedE);
    setSelectedNodes(selectedN);
  }, [edges, nodes]);

  // 删除选中的元素（节点和连线）
  const handleDeleteSelected = useCallback(() => {
    const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
    if (!hasSelection) {
      return;
    }

    let deletedCount = 0;
    const messages: string[] = [];

    // 删除选中的节点
    if (selectedNodes.length > 0) {
      const nodeIds = selectedNodes.map(node => node.id);
      // 同时删除与这些节点相关的连线
      const relatedEdgeIds = edges
        .filter(edge => nodeIds.includes(edge.source) || nodeIds.includes(edge.target))
        .map(edge => edge.id);
      
      setNodes((nds) => nds.filter(node => !nodeIds.includes(node.id)));
      setEdges((eds) => eds.filter(edge => !relatedEdgeIds.includes(edge.id)));
      
      deletedCount += selectedNodes.length;
      messages.push(`${selectedNodes.length} 个节点`);
    }

    // 删除选中的连线
    if (selectedEdges.length > 0) {
      const edgeIds = selectedEdges.map(edge => edge.id);
      setEdges((eds) => eds.filter(edge => !edgeIds.includes(edge.id)));
      
      deletedCount += selectedEdges.length;
      messages.push(`${selectedEdges.length} 条连线`);
    }

    message.success(`已删除 ${messages.join('和')}`);
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, selectedEdges, setNodes, setEdges, edges]);

  // 调整视图以显示所有节点
  const handleFitView = useCallback(() => {
    if (nodes.length > 0) {
      fitView({ padding: 0.2, duration: 300 });
      message.success('已调整视图');
    } else {
      message.warning('没有节点可显示');
    }
  }, [nodes.length, fitView]);

  // 清除所有节点
  const handleClearNodes = useCallback(() => {
    if (nodes.length === 0) {
      message.info('画布已经是空的了');
      return;
    }
    Modal.confirm({
      title: '确认清除',
      content: `确定要清除所有 ${nodes.length} 个节点吗？`,
      onOk: () => {
        setNodes([]);
        setEdges([]);
        message.success('已清除所有节点');
      },
    });
  }, [nodes.length, setNodes, setEdges]);

  // 计算容器高度
  useEffect(() => {
    const updateHeight = () => {
      if (workflowContainerRef.current) {
        const rect = workflowContainerRef.current.getBoundingClientRect();
        // 计算可用高度：窗口高度 - 容器顶部位置 - 工具栏高度 - 一些边距
        const toolbarHeight = 80; // 工具栏大约高度
        const padding = 40; // 上下边距
        const height = window.innerHeight - rect.top - toolbarHeight - padding;
        const calculatedHeight = Math.max(600, height);
        setContainerHeight(calculatedHeight);
        console.log('容器高度更新:', {
          windowHeight: window.innerHeight,
          top: rect.top,
          calculatedHeight,
          finalHeight: calculatedHeight,
          containerRect: rect
        });
      } else {
        // 如果容器还没准备好，使用默认值
        setContainerHeight(600);
      }
    };

    // 延迟执行，确保 DOM 已渲染
    const timer1 = setTimeout(updateHeight, 100);
    const timer2 = setTimeout(updateHeight, 500);
    
    // 使用 ResizeObserver 监听容器大小变化
    let resizeObserver: ResizeObserver | null = null;
    if (workflowContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(workflowContainerRef.current);
    }
    
    window.addEventListener('resize', updateHeight);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // 当 initialWorkflowId 变化时，加载工作流
  useEffect(() => {
    console.log('initialWorkflowId 变化:', { initialWorkflowId, currentWorkflowId: workflowId });
    
    if (initialWorkflowId) {
      // 如果有 initialWorkflowId 且与当前 workflowId 不同，则加载
      if (initialWorkflowId !== workflowId) {
        console.log('需要加载工作流:', initialWorkflowId);
        loadWorkflow(initialWorkflowId);
      }
    } else if (!initialWorkflowId && workflowId) {
      // 如果外部传入 null，重置状态
      console.log('重置工作流状态');
      setWorkflowId(null);
      setWorkflowName('Untitled Workflow');
      setNodes([]);
      setEdges([]);
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
        setProvider(null);
      }
    }
  }, [initialWorkflowId, workflowId, loadWorkflow]);

  // 清理
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
    };
  }, []);

  return (
    <WorkflowContainer ref={workflowContainerRef} $height={containerHeight}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <Spin size="large" tip="加载工作流中..." />
        </div>
      )}
      <Toolbar>
        <Space>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="工作流名称"
            style={{ width: 200 }}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={handleOpenNodePalette}
          >
            <FormattedMessage id="workflow.addNode" defaultMessage="添加节点" />
          </Button>
          <Button
            icon={<AimOutlined />}
            onClick={handleFitView}
            disabled={nodes.length === 0}
          >
            <FormattedMessage id="workflow.fitView" defaultMessage="适应视图" />
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={handleClearNodes}
            danger
            disabled={nodes.length === 0}
          >
            <FormattedMessage id="workflow.clear" defaultMessage="清除" />
          </Button>
        </Space>
        <Space>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSave}
          >
            <FormattedMessage id="workflow.save" defaultMessage="保存" />
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRun}
          >
            <FormattedMessage id="workflow.run" defaultMessage="运行" />
          </Button>
        </Space>
      </Toolbar>
      <FlowCanvas ref={containerRef} $height={containerHeight}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          selectNodesOnDrag={false}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        {nodes.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            点击"添加节点"开始创建工作流
          </div>
        )}
        
        <BottomToolbar className={selectedNodes.length === 0 && selectedEdges.length === 0 ? 'hidden' : ''}>
          <ToolbarLeft>
            <SelectionInfo>
              <div className="selection-count">
                {selectedNodes.length > 0 && selectedEdges.length > 0 && (
                  <>已选中 {selectedNodes.length} 个节点和 {selectedEdges.length} 条连线</>
                )}
                {selectedNodes.length > 0 && selectedEdges.length === 0 && (
                  <>已选中 {selectedNodes.length} 个节点</>
                )}
                {selectedNodes.length === 0 && selectedEdges.length > 0 && (
                  <>已选中 {selectedEdges.length} 条连线</>
                )}
              </div>
              <div className="selection-hint">
                按住 Ctrl 键可多选
              </div>
            </SelectionInfo>
          </ToolbarLeft>
          <ToolbarRight>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteSelected}
              disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
            >
              {selectedNodes.length > 0 && selectedEdges.length > 0 && '删除选中项'}
              {selectedNodes.length > 0 && selectedEdges.length === 0 && '删除节点'}
              {selectedNodes.length === 0 && selectedEdges.length > 0 && '删除连线'}
            </Button>
          </ToolbarRight>
        </BottomToolbar>
      </FlowCanvas>
      <NodePalette
        visible={nodePaletteVisible}
        onClose={() => setNodePaletteVisible(false)}
        onSelectNode={handleSelectNode}
      />
    </WorkflowContainer>
  );
};

const WorkflowDesktopWrapper: React.FC<{ 
  workflowId?: number | null;
  onWorkflowCreated?: (id: number) => void;
}> = ({ workflowId, onWorkflowCreated }) => {
  return (
    <ReactFlowProvider>
      <WorkflowContent 
        initialWorkflowId={workflowId}
        onWorkflowCreated={onWorkflowCreated}
      />
    </ReactFlowProvider>
  );
};

export default WorkflowDesktopWrapper;
