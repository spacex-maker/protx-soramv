import React, { useState, useCallback, useEffect } from 'react';
import { Select, Switch, Button, message } from 'antd';
import { DeleteOutlined, RocketOutlined } from '@ant-design/icons';
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
    border-color: ${props => props.theme.mode === 'dark' ? '#722ed1' : '#722ed1'};
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
  color: #722ed1;
  font-size: 20px;
`;

const NodeName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
`;

const CostInfo = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-top: 4px;
`;

const NodeContent = styled.div`
  padding: 12px;
  
  input, select, button, .ant-select, .ant-switch {
    pointer-events: auto;
  }
`;

const Label = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-bottom: 8px;
  font-weight: 500;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
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
    box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.2) !important;
  }
`;

const StyledSwitch = styled(Switch)`
  &.ant-switch-checked {
    background-color: #722ed1;
  }
`;

const StyledHandle = styled(Handle)`
  width: 10px;
  height: 10px;
  background: #722ed1;
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

interface LumaDreamNodeData {
  label?: string;
  loop?: boolean;
  aspect_ratio?: string;
  nodeKey?: string;
  nodeConfig?: any;
}

const LumaDreamNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as LumaDreamNodeData;
  const { deleteElements } = useReactFlow();
  const [loop, setLoop] = useState(nodeData?.loop ?? false);
  const [aspectRatio, setAspectRatio] = useState(nodeData?.aspect_ratio || '16:9');

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.loop = loop;
      nodeData.aspect_ratio = aspectRatio;
    }
  }, [loop, aspectRatio, nodeData]);

  const handleLoopChange = useCallback((checked: boolean) => {
    setLoop(checked);
    if (nodeData) {
      nodeData.loop = checked;
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

  const baseCost = nodeData?.nodeConfig?.baseCost || 800;
  const pricingMode = nodeData?.nodeConfig?.pricingMode || 'FIXED';

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#722ed1' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <RocketOutlined />
          </NodeIcon>
          <div>
            <NodeName>Luma Dream Machine</NodeName>
            <CostInfo>
              {pricingMode === 'FIXED' ? `固定: ${baseCost}` : `基础: ${baseCost}`}
            </CostInfo>
          </div>
        </NodeTitle>
      </NodeHeader>
      
      <NodeContent>
        <div style={{ marginBottom: 12 }}>
          <LabelRow>
            <Label>循环播放</Label>
            <StyledSwitch
              checked={loop}
              onChange={handleLoopChange}
              className="nodrag"
            />
          </LabelRow>
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

export default React.memo(LumaDreamNode);

