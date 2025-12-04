import React, { useState, useCallback, useEffect } from 'react';
import { Select, InputNumber, Button, Tag, message, Badge } from 'antd';
import { DeleteOutlined, CrownOutlined } from '@ant-design/icons';
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
    border-color: ${props => props.theme.mode === 'dark' ? '#1890ff' : '#1890ff'};
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
  color: #1890ff;
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

const VipBadge = styled(Badge)`
  .ant-badge-status-dot {
    width: 8px;
    height: 8px;
    background: #ffd700;
  }
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
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
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
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

const StyledHandle = styled(Handle)`
  width: 10px;
  height: 10px;
  background: #1890ff;
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

interface SoraProNodeData {
  label?: string;
  duration?: number;
  resolution?: string;
  nodeKey?: string;
  nodeConfig?: any;
}

const SoraProNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as SoraProNodeData;
  const { deleteElements } = useReactFlow();
  const [duration, setDuration] = useState(nodeData?.duration || 10);
  const [resolution, setResolution] = useState(nodeData?.resolution || '1080p');

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.duration = duration;
      nodeData.resolution = resolution;
    }
  }, [duration, resolution, nodeData]);

  const handleDurationChange = useCallback((value: number | string | null) => {
    const newDuration = typeof value === 'number' ? (value || 10) : (typeof value === 'string' ? parseFloat(value) || 10 : 10);
    setDuration(newDuration);
    if (nodeData) {
      nodeData.duration = newDuration;
    }
  }, [nodeData]);

  const handleResolutionChange = useCallback((value: unknown) => {
    const resolutionValue = value as string;
    setResolution(resolutionValue);
    if (nodeData) {
      nodeData.resolution = resolutionValue;
    }
  }, [nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  const baseCost = nodeData?.nodeConfig?.baseCost || 2500;
  const pricingMode = nodeData?.nodeConfig?.pricingMode || 'FIXED';
  const isVipOnly = nodeData?.nodeConfig?.isVipOnly || false;

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#1890ff' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <CrownOutlined />
          </NodeIcon>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <NodeName>Sora (OpenAI)</NodeName>
              {isVipOnly && (
                <VipBadge status="processing" text="VIP" />
              )}
            </div>
            <CostInfo>
              {pricingMode === 'FIXED' ? `固定: ${baseCost}` : `基础: ${baseCost}`}
            </CostInfo>
          </div>
        </NodeTitle>
        {nodeData?.nodeConfig?.tag && (
          <NodeTag color="blue">{nodeData.nodeConfig.tag}</NodeTag>
        )}
      </NodeHeader>
      
      <NodeContent>
        <div style={{ marginBottom: 12 }}>
          <Label>时长（秒）</Label>
          <StyledInputNumber
            value={duration}
            onChange={handleDurationChange}
            min={1}
            max={60}
            className="nodrag"
          />
        </div>
        
        <div>
          <Label>分辨率</Label>
          <StyledSelect
            value={resolution}
            onChange={handleResolutionChange}
            className="nodrag"
            popupClassName="nodrag"
          >
            <Option value="720p">720p</Option>
            <Option value="1080p">1080p</Option>
            <Option value="2K">2K</Option>
            <Option value="4K">4K</Option>
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

export default React.memo(SoraProNode);

