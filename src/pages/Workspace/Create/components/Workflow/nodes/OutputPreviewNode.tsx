import React, { useState, useCallback, useEffect } from 'react';
import { Switch, Button, Image, message } from 'antd';
import { DeleteOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
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
    border-color: ${props => props.theme.mode === 'dark' ? '#52c41a' : '#52c41a'};
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
  color: #52c41a;
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
  
  input, button, .ant-switch {
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
  margin-bottom: 12px;
`;

const StyledSwitch = styled(Switch)`
  &.ant-switch-checked {
    background-color: #52c41a;
  }
`;

const PreviewArea = styled.div`
  width: 100%;
  min-height: 200px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  border: 1px dashed ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  margin-top: 8px;
`;

const PreviewPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
  padding: 20px;
  text-align: center;
`;

const PreviewIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
`;

const PreviewText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
`;

const VideoPreview = styled.video`
  width: 100%;
  height: auto;
  max-height: 300px;
  border-radius: 12px;
  object-fit: contain;
`;

const ImagePreview = styled(Image)`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  
  .ant-image-img {
    border-radius: 12px;
  }
`;

const StyledHandle = styled(Handle)`
  width: 10px;
  height: 10px;
  background: #52c41a;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  
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

interface OutputPreviewNodeData {
  label?: string;
  autoplay?: boolean;
  previewUrl?: string;
  previewType?: 'video' | 'image' | 'none';
  nodeKey?: string;
  nodeConfig?: any;
}

const OutputPreviewNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as OutputPreviewNodeData;
  const { deleteElements } = useReactFlow();
  const [autoplay, setAutoplay] = useState(nodeData?.autoplay ?? true);
  const [previewUrl, setPreviewUrl] = useState(nodeData?.previewUrl || '');
  const [previewType, setPreviewType] = useState<'video' | 'image' | 'none'>(nodeData?.previewType || 'none');
  const [previewVisible, setPreviewVisible] = useState(false);

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.autoplay = autoplay;
      nodeData.previewUrl = previewUrl;
      nodeData.previewType = previewType;
    }
  }, [autoplay, previewUrl, previewType, nodeData]);

  // 检测预览 URL 类型
  useEffect(() => {
    if (previewUrl) {
      const url = previewUrl.toLowerCase();
      if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) {
        setPreviewType('video');
      } else if (url.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) {
        setPreviewType('image');
      } else {
        setPreviewType('none');
      }
    } else {
      setPreviewType('none');
    }
  }, [previewUrl]);

  const handleAutoplayChange = useCallback((checked: boolean) => {
    setAutoplay(checked);
    if (nodeData) {
      nodeData.autoplay = checked;
    }
  }, [nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  const handlePreview = useCallback(() => {
    if (previewUrl) {
      setPreviewVisible(true);
    } else {
      message.info('暂无预览内容');
    }
  }, [previewUrl]);

  // 从连接的节点获取预览 URL（这里需要根据实际的数据流实现）
  // 在实际工作流执行时，预览 URL 会从上游节点传递过来
  useEffect(() => {
    // 这里可以监听上游节点的输出数据
    // 暂时使用 nodeData 中的 previewUrl
    if (nodeData?.previewUrl && nodeData.previewUrl !== previewUrl) {
      setPreviewUrl(nodeData.previewUrl);
    }
  }, [nodeData?.previewUrl]);

  const baseCost = nodeData?.nodeConfig?.baseCost || 0;
  const pricingMode = nodeData?.nodeConfig?.pricingMode || 'FIXED';

  const renderPreview = () => {
    if (!previewUrl || previewType === 'none') {
      return (
        <PreviewPlaceholder>
          <PreviewIcon>
            <EyeOutlined />
          </PreviewIcon>
          <PreviewText>等待上游节点输出结果...</PreviewText>
        </PreviewPlaceholder>
      );
    }

    if (previewType === 'video') {
      return (
        <VideoPreview
          src={previewUrl}
          controls
          autoPlay={autoplay}
          loop={false}
          muted={autoplay}
          playsInline
          className="nodrag"
        />
      );
    }

    if (previewType === 'image') {
      return (
        <ImagePreview
          src={previewUrl}
          alt="预览"
          preview={{
            visible: previewVisible,
            src: previewUrl,
            onVisibleChange: (visible) => setPreviewVisible(visible),
          }}
          className="nodrag"
        />
      );
    }

    return null;
  };

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#52c41a' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <PlayCircleOutlined />
          </NodeIcon>
          <div>
            <NodeName>结果预览</NodeName>
            <CostInfo>
              {pricingMode === 'FIXED' ? `固定: ${baseCost}` : `基础: ${baseCost}`}
            </CostInfo>
          </div>
        </NodeTitle>
      </NodeHeader>
      
      <NodeContent>
        <LabelRow>
          <Label>自动播放</Label>
          <StyledSwitch
            checked={autoplay}
            onChange={handleAutoplayChange}
            className="nodrag"
          />
        </LabelRow>
        
        <PreviewArea className="nodrag">
          {renderPreview()}
        </PreviewArea>
        
        {previewUrl && (
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={handlePreview}
              className="nodrag"
              style={{ 
                background: '#52c41a',
                borderColor: '#52c41a',
              }}
            >
              查看大图
            </Button>
          </div>
        )}
      </NodeContent>
      
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

export default React.memo(OutputPreviewNode);
