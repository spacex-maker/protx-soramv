import React, { useState, useCallback, useEffect } from 'react';
import { Button, Image, message } from 'antd';
import { DeleteOutlined, PictureOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import styled from 'styled-components';

const NodeContainer = styled.div`
  min-width: 280px;
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

const NodeContent = styled.div`
  padding: 12px;
  
  input, button, .ant-image {
    pointer-events: auto;
  }
`;

const ImagePreviewArea = styled.div`
  width: 100%;
  min-height: 200px;
  max-height: 400px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  border: 1px dashed ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
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

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
  max-height: 400px;
  
  .ant-image-img {
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 12px;
  }
`;

const FloatingButtons = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 10;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  ${ImagePreviewArea}:hover & {
    opacity: 1;
  }
`;

const FloatingButton = styled(Button)`
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none !important;
  backdrop-filter: blur(8px);
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.9)'} !important;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 1)'} !important;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  }
  
  &.primary {
    background: rgba(82, 196, 26, 0.9) !important;
    color: #fff !important;
    
    &:hover {
      background: rgba(82, 196, 26, 1) !important;
      color: #fff !important;
    }
  }
  
  .anticon {
    font-size: 16px !important;
    margin: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  /* 只隐藏文字，保留图标 */
  > span:not(.anticon) {
    display: none !important;
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

// 规范化图片数据
const normalizeImageSource = (image: string): string => {
  if (!image) {
    return '';
  }
  const trimmed = image.trim();

  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//') && typeof window !== 'undefined') {
    return `${window.location.protocol}${trimmed}`;
  }

  if (trimmed.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${trimmed}`;
  }

  return `data:image/png;base64,${trimmed}`;
};

const normalizeImageData = (image: any): string | null => {
  if (!image) {
    return null;
  }

  const source =
    typeof image === 'string'
      ? image
      : image.url || image.base64 || image.data || '';

  if (!source) {
    return null;
  }

  return normalizeImageSource(source);
};

interface ImageDisplayNodeData {
  label?: string;
  imageUrl?: string;
  imageIndex?: number;
  nodeKey?: string;
  nodeConfig?: any;
}

const ImageDisplayNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as ImageDisplayNodeData;
  const { deleteElements, getNodes, getEdges } = useReactFlow();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageIndex, setImageIndex] = useState<number>(-1);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 获取连接的SD节点和图片数据
  useEffect(() => {
    const nodes = getNodes();
    const edges = getEdges();
    
    // 找到所有连接到当前节点的边（从SD节点到当前节点）
    const incomingEdges = edges.filter(edge => edge.target === id);
    
    if (incomingEdges.length === 0) {
      console.log('[ImageDisplayNode] 没有找到连接的边, nodeId:', id);
      setImageUrl('');
      setImageIndex(-1);
      return;
    }

    // 找到源节点（SD节点）- 取第一个连接的SD节点
    const sourceNodeId = incomingEdges[0].source;
    const sourceNode = nodes.find(node => node.id === sourceNodeId);
    
    if (!sourceNode) {
      console.log('[ImageDisplayNode] 未找到源节点:', sourceNodeId);
      setImageUrl('');
      setImageIndex(-1);
      return;
    }

    if (sourceNode.type !== 'stable-diffusion-xl') {
      console.log('[ImageDisplayNode] 源节点类型不是 stable-diffusion-xl:', sourceNode.type, 'nodeId:', sourceNodeId);
      setImageUrl('');
      setImageIndex(-1);
      return;
    }

    // 获取SD节点生成的图片数组
    const sdNodeData = sourceNode.data as any;
    const generatedImages = sdNodeData?.generatedImages || [];
    
    console.log('[ImageDisplayNode] SD节点图片数据:', {
      sourceNodeId,
      generatedImagesCount: generatedImages.length,
      generatedImages: generatedImages,
      sdNodeDataKeys: Object.keys(sdNodeData || {})
    });
    
    if (!Array.isArray(generatedImages) || generatedImages.length === 0) {
      console.log('[ImageDisplayNode] 没有生成的图片或图片数组为空');
      setImageUrl('');
      setImageIndex(-1);
      return;
    }

    // 计算当前节点应该显示第几张图片
    // 找到所有连接到同一个SD节点的图片显示节点
    const allImageDisplayEdges = edges.filter(edge => 
      edge.source === sourceNodeId && 
      nodes.find(n => n.id === edge.target && n.type === 'image_display')
    );
    
    console.log('[ImageDisplayNode] 连接到SD节点的图片显示节点数量:', allImageDisplayEdges.length);
    
    // 获取所有连接的图片显示节点，并按位置（Y坐标）或ID排序
    const imageDisplayNodes = allImageDisplayEdges
      .map(edge => {
        const node = nodes.find(n => n.id === edge.target);
        return node ? { node, edge } : null;
      })
      .filter((item): item is { node: any; edge: any } => item !== null);
    
    // 按照节点的Y坐标（从上到下）排序，如果Y坐标相同则按X坐标（从左到右）排序
    // 如果位置信息不可用，则按节点ID排序
    imageDisplayNodes.sort((a, b) => {
      const aY = a.node.position?.y || 0;
      const bY = b.node.position?.y || 0;
      if (aY !== bY) {
        return aY - bY;
      }
      const aX = a.node.position?.x || 0;
      const bX = b.node.position?.x || 0;
      if (aX !== bX) {
        return aX - bX;
      }
      // 如果位置相同，按ID排序
      return a.node.id.localeCompare(b.node.id);
    });

    console.log('[ImageDisplayNode] 排序后的图片显示节点:', imageDisplayNodes.map(item => ({
      id: item.node.id,
      position: item.node.position
    })));

    // 找到当前节点在这些节点中的位置
    const displayIndex = imageDisplayNodes.findIndex(item => item.node.id === id);
    
    console.log('[ImageDisplayNode] 当前节点索引:', displayIndex, '当前节点ID:', id);
    
    if (displayIndex === -1) {
      console.log('[ImageDisplayNode] 未找到当前节点在排序列表中的位置');
      setImageUrl('');
      setImageIndex(-1);
      return;
    }

    if (displayIndex >= generatedImages.length) {
      console.log('[ImageDisplayNode] 索引超出范围:', displayIndex, '>=', generatedImages.length);
      setImageUrl('');
      setImageIndex(-1);
      return;
    }

    // 规范化并设置图片URL
    const imageData = generatedImages[displayIndex];
    console.log('[ImageDisplayNode] 准备显示的图片数据:', imageData, '类型:', typeof imageData);
    
    const normalizedUrl = normalizeImageData(imageData);
    console.log('[ImageDisplayNode] 规范化后的URL:', normalizedUrl ? '有URL' : '无URL', normalizedUrl?.substring(0, 50));
    
    if (normalizedUrl) {
      setImageUrl(normalizedUrl);
      setImageIndex(displayIndex);
      
      // 更新节点数据
      if (nodeData) {
        nodeData.imageUrl = normalizedUrl;
        nodeData.imageIndex = displayIndex;
      }
    } else {
      console.log('[ImageDisplayNode] 图片数据规范化失败');
      setImageUrl('');
      setImageIndex(-1);
    }
  }, [id, getNodes, getEdges, nodeData]);

  // 使用定期检查来监听SD节点图片数据的变化
  // 因为React Flow的节点数据变化不会自动触发子节点更新
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const nodes = getNodes();
      const edges = getEdges();
      const incomingEdges = edges.filter(edge => edge.target === id);
      
      if (incomingEdges.length === 0) return;
      
      const sourceNodeId = incomingEdges[0].source;
      const sourceNode = nodes.find(node => node.id === sourceNodeId);
      if (!sourceNode || sourceNode.type !== 'stable-diffusion-xl') return;
      
      const sdNodeData = sourceNode.data as any;
      const generatedImages = sdNodeData?.generatedImages;
      
      // 如果图片数据存在且与当前显示的不同，触发更新
      if (Array.isArray(generatedImages) && generatedImages.length > 0) {
        // 触发重新计算（通过更新一个状态来触发上面的useEffect）
        // 这里我们直接在上面的useEffect中处理，所以只需要确保它能定期检查
      }
    }, 500); // 每500ms检查一次

    return () => clearInterval(checkInterval);
  }, [id, getNodes, getEdges]);

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.imageUrl = imageUrl;
      nodeData.imageIndex = imageIndex;
    }
  }, [imageUrl, imageIndex, nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) {
      message.warning('没有可下载的图片');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${imageIndex >= 0 ? imageIndex + 1 : 'unknown'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('下载成功');
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败');
    }
  }, [imageUrl, imageIndex]);

  const handlePreview = useCallback(() => {
    if (!imageUrl) {
      message.info('暂无图片可预览');
      return;
    }
    setPreviewVisible(true);
  }, [imageUrl]);

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#52c41a' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <PictureOutlined />
          </NodeIcon>
          <NodeName>图片显示</NodeName>
        </NodeTitle>
      </NodeHeader>
      
      <NodeContent>
        <ImagePreviewArea className="nodrag">
          {imageUrl ? (
            <>
              <StyledImage
                src={imageUrl}
                alt={`图片 ${imageIndex >= 0 ? imageIndex + 1 : ''}`}
                preview={{
                  visible: previewVisible,
                  onVisibleChange: (visible) => setPreviewVisible(visible),
                  mask: null, // 移除默认预览遮罩，使用自定义按钮
                }}
              />
              <FloatingButtons>
                <FloatingButton
                  type="primary"
                  className="primary"
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  title="预览"
                />
                <FloatingButton
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  title="下载"
                />
              </FloatingButtons>
            </>
          ) : (
            <PreviewPlaceholder>
              <PreviewIcon>
                <PictureOutlined />
              </PreviewIcon>
              <PreviewText>
                {imageIndex >= 0 
                  ? `等待第 ${imageIndex + 1} 张图片...` 
                  : '请连接到 Stable Diffusion XL 节点'}
              </PreviewText>
            </PreviewPlaceholder>
          )}
        </ImagePreviewArea>
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

export default React.memo(ImageDisplayNode);

