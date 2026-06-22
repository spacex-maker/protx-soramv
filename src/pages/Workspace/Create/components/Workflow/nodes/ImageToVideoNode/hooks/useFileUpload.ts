import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getBase64 } from '../../../../ImageToVideo/utils';
import { ImageToVideoNodeData } from '../types';

export const useFileUpload = (
  nodeData: ImageToVideoNodeData | null,
  setOriginalImageUrl: (url: string | null) => void,
  setOriginalImageFile: (file: File | null) => void
) => {
  const [isDragging, setIsDragging] = useState(false);

  // 处理文件选择
  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) {
      setOriginalImageUrl(null);
      setOriginalImageFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件');
      return;
    }

    try {
      const url = await getBase64(file);
      setOriginalImageUrl(url);
      setOriginalImageFile(file);
      if (nodeData) {
        nodeData.imageUrl = url;
        nodeData.imageFile = file;
      }
    } catch (error) {
      message.error('图片读取失败');
    }
  }, [nodeData, setOriginalImageUrl, setOriginalImageFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  return {
    isDragging,
    handleFileSelect,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

