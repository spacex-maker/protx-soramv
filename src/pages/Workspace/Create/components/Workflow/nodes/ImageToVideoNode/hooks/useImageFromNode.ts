import { useCallback, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { normalizeImageData } from '../utils';
import { ImageToVideoNodeData } from '../types';

export const useImageFromNode = (
  id: string,
  nodeData: ImageToVideoNodeData | null,
  originalImageUrl: string | null,
  originalImageFile: File | null,
  setOriginalImageUrl: (url: string | null) => void,
  setOriginalImageFile: (file: File | null) => void
) => {
  const { getNodes, getEdges } = useReactFlow();

  // 从上游节点获取图片（通过连接的边）
  const updateImageFromConnectedNode = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    
    // 找到所有连接到当前节点的边（目标节点是当前节点）
    const incomingEdges = edges.filter(edge => edge.target === id);
    
    if (incomingEdges.length === 0) {
      // 没有连接的边，清空图片（除非用户手动上传过）
      if (!originalImageFile) {
        setOriginalImageUrl(null);
        if (nodeData) {
          nodeData.imageUrl = undefined;
        }
      }
      return;
    }

    // 获取第一个连接的边
    const connectedEdge = incomingEdges[0];
    const sourceNodeId = connectedEdge.source;
    const sourceNode = nodes.find(node => node.id === sourceNodeId);
    
    if (!sourceNode) {
      return;
    }

    let imageUrl: string | null = null;

    // 处理 SD 节点（stable-diffusion-xl）
    if (sourceNode.type === 'stable-diffusion-xl') {
      const sdNodeData = sourceNode.data as any;
      const generatedImages = sdNodeData?.generatedImages || [];
      
      if (Array.isArray(generatedImages) && generatedImages.length > 0) {
        // 从 sourceHandle 中提取图片索引，格式为: ${sourceNodeId}-image-${index}
        const sourceHandle = connectedEdge.sourceHandle || '';
        const match = sourceHandle.match(/-image-(\d+)$/);
        const imageIndex = match ? parseInt(match[1], 10) : 0;
        
        // 确保索引在有效范围内
        if (imageIndex >= 0 && imageIndex < generatedImages.length) {
          const imageData = generatedImages[imageIndex];
          imageUrl = normalizeImageData(imageData);
        } else if (generatedImages.length > 0) {
          // 如果无法从handle获取索引，使用第一张图片
          imageUrl = normalizeImageData(generatedImages[0]);
        }
      }
    }
    // 处理其他图片节点类型
    else if (sourceNode.type === 'input_image' || sourceNode.type === 'image_display') {
      const imageData = sourceNode.data?.url || sourceNode.data?.imageUrl;
      imageUrl = normalizeImageData(imageData);
    }

    // 更新图片URL（如果与当前不同）
    if (imageUrl && imageUrl !== originalImageUrl) {
      setOriginalImageUrl(imageUrl);
      if (nodeData) {
        nodeData.imageUrl = imageUrl;
      }
      // 从连接的节点获取图片时，不需要设置文件
      setOriginalImageFile(null);
    } else if (!imageUrl && !originalImageFile) {
      // 如果连接的节点没有图片，且用户也没有手动上传，则清空
      setOriginalImageUrl(null);
      if (nodeData) {
        nodeData.imageUrl = undefined;
      }
    }
  }, [getNodes, getEdges, nodeData, id, originalImageUrl, originalImageFile, setOriginalImageUrl, setOriginalImageFile]);

  useEffect(() => {
    updateImageFromConnectedNode();
  }, [updateImageFromConnectedNode]);

  // 定期检查连接的节点图片数据变化
  useEffect(() => {
    const checkInterval = setInterval(() => {
      updateImageFromConnectedNode();
    }, 500); // 每500ms检查一次

    return () => clearInterval(checkInterval);
  }, [updateImageFromConnectedNode]);

  return { updateImageFromConnectedNode };
};

