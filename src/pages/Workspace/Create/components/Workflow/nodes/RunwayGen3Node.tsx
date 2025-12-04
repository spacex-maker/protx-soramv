import React, { useState, useCallback, useEffect } from 'react';
import { InputNumber, Button, Tag, message } from 'antd';
import { DeleteOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import styled from 'styled-components';

const NodeContainer = styled.div`
  min-width: 320px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 20px;
  overflow: visible;
  transition: border-color 0.2s;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#fa8c16' : '#fa8c16'};
  }
`;

const DeleteButtonWrapper = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${NodeContainer}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled(Button)`
  width: 100%;
  height: 100%;
  min-width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ff4d4f;
  border: 1px solid #fff;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.2s, transform 0.2s;
  
  &:hover {
    background: #ff7875;
    transform: scale(1.1);
  }
  
  .anticon {
    font-size: 12px;
  }
`;

const NodeHeader = styled.div`
  padding: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e8e8e8'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NodeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const NodeIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fa8c16;
  font-size: 20px;
`;

const NodeName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
`;

const NodeTag = styled(Tag)`
  margin: 0;
  font-size: 10px;
  padding: 2px 6px;
`;

const CostInfo = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-top: 4px;
`;

const NodeContent = styled.div`
  padding: 12px;
  
  input, button, .ant-input-number {
    pointer-events: auto;
  }
`;

const Label = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-bottom: 8px;
  font-weight: 500;
`;

const StyledInputNumber = styled(InputNumber)`
  width: 100%;
  border-radius: 12px;
  border: none;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  
  .ant-input-number-input {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  }
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  }
  
  &.ant-input-number-focused {
    box-shadow: 0 0 0 2px rgba(250, 140, 22, 0.2);
  }
`;

const SeedInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const RandomButton = styled(Button)`
  font-size: 11px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
`;

const StyledHandle = styled(Handle)`
  width: 10px;
  height: 10px;
  background: #fa8c16;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  
  &.react-flow__handle-right {
    right: -6px;
  }
  
  &.react-flow__handle-left {
    left: -6px;
  }
`;

const BottomLabel = styled.div`
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 10px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#999'};
  pointer-events: none;
  user-select: none;
`;

interface RunwayGen3NodeData {
  label?: string;
  seed?: number;
  duration?: number;
  nodeKey?: string;
  nodeConfig?: any;
}

const RunwayGen3Node: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as RunwayGen3NodeData;
  const { deleteElements } = useReactFlow();
  const [seed, setSeed] = useState(nodeData?.seed ?? -1);
  const [duration, setDuration] = useState(nodeData?.duration || 5);

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.seed = seed;
      nodeData.duration = duration;
    }
  }, [seed, duration, nodeData]);

  const handleSeedChange = useCallback((value: number | string | null) => {
    const newSeed = typeof value === 'number' ? (value ?? -1) : (typeof value === 'string' ? parseInt(value) || -1 : -1);
    setSeed(newSeed);
    if (nodeData) {
      nodeData.seed = newSeed;
    }
  }, [nodeData]);

  const handleDurationChange = useCallback((value: number | string | null) => {
    const newDuration = typeof value === 'number' ? (value || 5) : (typeof value === 'string' ? parseFloat(value) || 5 : 5);
    setDuration(newDuration);
    if (nodeData) {
      nodeData.duration = newDuration;
    }
  }, [nodeData]);

  const handleRandomSeed = useCallback(() => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed);
    if (nodeData) {
      nodeData.seed = randomSeed;
    }
  }, [nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  const baseCost = nodeData?.nodeConfig?.baseCost || 100;
  const pricingMode = nodeData?.nodeConfig?.pricingMode || 'DURATION';

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#fa8c16' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <VideoCameraOutlined />
          </NodeIcon>
          <div>
            <NodeName>Runway Gen-3</NodeName>
            <CostInfo>
              {pricingMode === 'FIXED' ? `固定: ${baseCost}` : `基础: ${baseCost}/秒`}
            </CostInfo>
          </div>
        </NodeTitle>
        {nodeData?.nodeConfig?.tag && (
          <NodeTag color="orange">{nodeData.nodeConfig.tag}</NodeTag>
        )}
      </NodeHeader>
      
      <NodeContent>
        <div style={{ marginBottom: 12 }}>
          <Label>随机种子</Label>
          <SeedInputWrapper>
            <StyledInputNumber
              value={seed === -1 ? undefined : seed}
              onChange={handleSeedChange}
              placeholder="随机"
              min={-1}
              max={999999}
              className="nodrag"
              style={{ flex: 1 }}
            />
            <RandomButton
              size="small"
              onClick={handleRandomSeed}
              className="nodrag"
            >
              随机
            </RandomButton>
          </SeedInputWrapper>
          <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
            -1 表示随机生成
          </div>
        </div>
        
        <div>
          <Label>时长（秒）</Label>
          <StyledInputNumber
            value={duration}
            onChange={handleDurationChange}
            min={1}
            max={10}
            className="nodrag"
          />
        </div>
      </NodeContent>
      
      <StyledHandle type="source" position={Position.Right} />
      
      {nodeData?.label || nodeData?.nodeConfig?.nodeName ? (
        <BottomLabel>
          {nodeData?.label || nodeData?.nodeConfig?.nodeName}
        </BottomLabel>
      ) : null}
      
      <DeleteButtonWrapper>
        <DeleteButton
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          size="small"
        />
      </DeleteButtonWrapper>
    </NodeContainer>
  );
};

export default React.memo(RunwayGen3Node);

