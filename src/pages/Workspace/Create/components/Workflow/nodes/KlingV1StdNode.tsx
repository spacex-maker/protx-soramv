import React, { useState, useCallback, useEffect } from 'react';
import { Select, InputNumber, Button, Tag, message } from 'antd';
import { DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import styled from 'styled-components';

const { Option } = Select;

const NodeContainer = styled.div`
  min-width: 320px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 20px;
  overflow: visible;
  transition: border-color 0.2s;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#ff4d4f' : '#ff4d4f'};
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
  color: #ff4d4f;
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
  
  input, select, button, .ant-select, .ant-input-number {
    pointer-events: auto;
  }
`;

const Label = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-bottom: 8px;
  font-weight: 500;
`;

const StyledSelect = styled(Select)`
  width: 100%;
  border-radius: 12px;
  
  .ant-select-selector {
    border: none !important;
    border-radius: 12px !important;
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'} !important;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  }
  
  &:hover .ant-select-selector {
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'} !important;
  }
  
  &.ant-select-focused .ant-select-selector {
    box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
  }
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
    box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
  }
`;

const StyledHandle = styled(Handle)`
  width: 10px;
  height: 10px;
  background: #ff4d4f;
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

interface KlingV1StdNodeData {
  label?: string;
  mode?: string;
  duration?: number;
  aspect_ratio?: string;
  nodeKey?: string;
  nodeConfig?: any;
}

const KlingV1StdNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as KlingV1StdNodeData;
  const { deleteElements } = useReactFlow();
  const [mode, setMode] = useState(nodeData?.mode || 'std');
  const [duration, setDuration] = useState(nodeData?.duration || 5);
  const [aspectRatio, setAspectRatio] = useState(nodeData?.aspect_ratio || '16:9');

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.mode = mode;
      nodeData.duration = duration;
      nodeData.aspect_ratio = aspectRatio;
    }
  }, [mode, duration, aspectRatio, nodeData]);

  const handleModeChange = useCallback((value: unknown) => {
    const modeValue = value as string;
    setMode(modeValue);
    if (nodeData) {
      nodeData.mode = modeValue;
    }
  }, [nodeData]);

  const handleDurationChange = useCallback((value: number | string | null) => {
    const newDuration = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 5 : 5);
    setDuration(newDuration);
    if (nodeData) {
      nodeData.duration = newDuration;
    }
  }, [nodeData]);

  const handleAspectRatioChange = useCallback((value: unknown) => {
    const ratioValue = value as string;
    setAspectRatio(ratioValue);
    if (nodeData) {
      nodeData.aspect_ratio = ratioValue;
    }
  }, [nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  const baseCost = nodeData?.nodeConfig?.baseCost || 600;
  const pricingMode = nodeData?.nodeConfig?.pricingMode || 'FIXED';

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#ff4d4f' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <ThunderboltOutlined />
          </NodeIcon>
          <div>
            <NodeName>Kling AI (标准版)</NodeName>
            <CostInfo>
              {pricingMode === 'FIXED' ? `固定: ${baseCost}` : `基础: ${baseCost}`}
            </CostInfo>
          </div>
        </NodeTitle>
        {nodeData?.nodeConfig?.tag && (
          <NodeTag color="red">{nodeData.nodeConfig.tag}</NodeTag>
        )}
      </NodeHeader>
      
      <NodeContent>
        <div style={{ marginBottom: 12 }}>
          <Label>模式</Label>
          <StyledSelect
            value={mode}
            onChange={handleModeChange}
            className="nodrag"
            popupClassName="nodrag"
          >
            <Option value="std">标准版</Option>
            <Option value="hd">高清版</Option>
          </StyledSelect>
        </div>
        
        <div style={{ marginBottom: 12 }}>
          <Label>时长（秒）</Label>
          <StyledInputNumber
            value={duration}
            onChange={handleDurationChange}
            min={1}
            max={10}
            className="nodrag"
          />
        </div>
        
        <div>
          <Label>宽高比</Label>
          <StyledSelect
            value={aspectRatio}
            onChange={handleAspectRatioChange}
            className="nodrag"
            popupClassName="nodrag"
          >
            <Option value="16:9">16:9</Option>
            <Option value="9:16">9:16</Option>
            <Option value="1:1">1:1</Option>
            <Option value="4:3">4:3</Option>
            <Option value="3:4">3:4</Option>
          </StyledSelect>
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

export default React.memo(KlingV1StdNode);

