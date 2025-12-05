import React, { useState, useCallback, useEffect } from 'react';
import { InputNumber, Slider, Button, Tag, message } from 'antd';
import { DeleteOutlined, ZoomInOutlined } from '@ant-design/icons';
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
    border-color: ${props => props.theme.mode === 'dark' ? '#13c2c2' : '#13c2c2'};
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
  color: #13c2c2;
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
  
  input, button, .ant-input-number, .ant-slider {
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
  margin-bottom: 4px;
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
    box-shadow: 0 0 0 2px rgba(19, 194, 194, 0.2);
  }
`;

const StyledSlider = styled(Slider)`
  margin: 8px 0;
  
  .ant-slider-track {
    background: #13c2c2;
  }
  
  .ant-slider-handle {
    border-color: #13c2c2;
    
    &:hover, &:focus {
      border-color: #13c2c2;
    }
  }
  
  .ant-slider-dot-active {
    border-color: #13c2c2;
  }
`;

const SliderWrapper = styled.div`
  padding: 0 4px;
`;

const InfoText = styled.div`
  font-size: 10px;
  color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
  margin-top: 4px;
  font-style: italic;
`;

const StyledHandle = styled(Handle)`
  width: 10px;
  height: 10px;
  background: #13c2c2;
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

interface VideoUpscaleNodeData {
  label?: string;
  scale?: number;
  denoise?: number;
  nodeKey?: string;
  nodeConfig?: any;
}

const VideoUpscaleNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as VideoUpscaleNodeData;
  const { deleteElements } = useReactFlow();
  const [scale, setScale] = useState(nodeData?.scale || 2);
  const [denoise, setDenoise] = useState(nodeData?.denoise ?? 0.5);

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.scale = scale;
      nodeData.denoise = denoise;
    }
  }, [scale, denoise, nodeData]);

  const handleScaleChange = useCallback((value: number | string | null) => {
    const newScale = typeof value === 'number' ? (value || 2) : (typeof value === 'string' ? parseFloat(value) || 2 : 2);
    const clampedScale = Math.max(1, Math.min(4, newScale));
    setScale(clampedScale);
    if (nodeData) {
      nodeData.scale = clampedScale;
    }
  }, [nodeData]);

  const handleDenoiseChange = useCallback((value: number) => {
    const clampedDenoise = Math.max(0, Math.min(1, value));
    setDenoise(clampedDenoise);
    if (nodeData) {
      nodeData.denoise = clampedDenoise;
    }
  }, [nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  const baseCost = nodeData?.nodeConfig?.baseCost || 300;
  const pricingMode = nodeData?.nodeConfig?.pricingMode || 'FIXED';

  // 计算输出分辨率提示
  const getResolutionHint = () => {
    const scaleValue = scale || 2;
    if (scaleValue === 2) return '输出: 2K/4K';
    if (scaleValue === 3) return '输出: 4K+';
    if (scaleValue === 4) return '输出: 8K';
    return `输出: ${scaleValue}x 放大`;
  };

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#13c2c2' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <ZoomInOutlined />
          </NodeIcon>
          <div>
            <NodeName>4K 超分增强</NodeName>
            <CostInfo>
              {pricingMode === 'FIXED' ? `固定: ${baseCost}` : `基础: ${baseCost}`}
            </CostInfo>
          </div>
        </NodeTitle>
        {nodeData?.nodeConfig?.tag && (
          <NodeTag color="cyan">{nodeData.nodeConfig.tag}</NodeTag>
        )}
      </NodeHeader>
      
      <NodeContent>
        <div style={{ marginBottom: 16 }}>
          <LabelRow>
            <Label>放大倍数</Label>
            <InfoText>{getResolutionHint()}</InfoText>
          </LabelRow>
          <StyledInputNumber
            value={scale}
            onChange={handleScaleChange}
            min={1}
            max={4}
            step={0.5}
            precision={1}
            className="nodrag"
          />
          <SliderWrapper>
            <StyledSlider
              value={scale}
              onChange={handleScaleChange}
              min={1}
              max={4}
              step={0.5}
              marks={{
                1: '1x',
                2: '2x',
                3: '3x',
                4: '4x',
              }}
              className="nodrag"
            />
          </SliderWrapper>
        </div>
        
        <div>
          <LabelRow>
            <Label>降噪强度</Label>
            <InfoText>{denoise.toFixed(1)}</InfoText>
          </LabelRow>
          <StyledInputNumber
            value={denoise}
            onChange={(value) => handleDenoiseChange(typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0.5 : 0.5))}
            min={0}
            max={1}
            step={0.1}
            precision={1}
            className="nodrag"
          />
          <SliderWrapper>
            <StyledSlider
              value={denoise}
              onChange={handleDenoiseChange}
              min={0}
              max={1}
              step={0.1}
              marks={{
                0: '0',
                0.5: '0.5',
                1: '1',
              }}
              className="nodrag"
            />
          </SliderWrapper>
          <InfoText>0=无降噪, 1=最大降噪</InfoText>
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

export default React.memo(VideoUpscaleNode);

