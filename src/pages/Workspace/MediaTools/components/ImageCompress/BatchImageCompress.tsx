import React, { useState, useEffect } from 'react';
import { Typography, message, Button } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { 
  compressCore, 
  type BatchFileItem, 
  type CompressOptions,
  saveImagesToCache,
  loadImagesFromCache,
  clearImageCache
} from './utils';
import ImageCompare from './ImageCompare';
import CompressSettings from './CompressSettings';

const { Text } = Typography;

const Workspace = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  width: 100%;
  height: calc(100vh - 240px);
  min-height: 650px;
  max-height: 900px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 380px;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
    max-height: none;
  }
`;

const LargePreviewArea = styled.div`
  position: relative;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#f0f2f5'};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 600px;
  height: 100%;
  
  /* 棋盘格背景 */
  background-image: 
    linear-gradient(45deg, #ccc 25%, transparent 25%), 
    linear-gradient(-45deg, #ccc 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #ccc 75%), 
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  
  /* 半透明覆盖层 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(20,20,20,0.95)' : 'rgba(245,247,250,0.9)'};
    z-index: 0;
    border-radius: 24px;
    pointer-events: none;
  }

  /* 确保对比容器在覆盖层之上 */
  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 1024px) {
    min-height: 400px;
    margin-bottom: 24px;
  }
`;

const ThumbnailList = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 4px;
  padding-bottom: 16px;
  overflow-x: auto;
  overflow-y: visible;
  margin-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  min-height: 120px;
  align-items: flex-start;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
    border-radius: 3px;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#555' : '#bfbfbf'};
    }
  }
`;

const UploadThumbnail = styled.label`
  position: sticky;
  left: 0;
  z-index: 10;
  min-width: 100px;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  border: 2px dashed ${props => props.theme.mode === 'dark' ? '#555' : '#d9d9d9'};
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fafafa'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    border-color: #8338ec;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.1)' : 'rgba(131, 56, 236, 0.05)'};
    transform: translateY(-2px);
  }

  input {
    display: none;
  }

  .upload-icon {
    font-size: 24px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#999'};
    margin-bottom: 4px;
  }

  .upload-text {
    font-size: 11px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#999'};
    text-align: center;
  }
`;

const ThumbnailItem = styled.div<{ $active: boolean }>`
  position: relative;
  min-width: 100px;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${props => props.$active ? '#8338ec' : 'transparent'};
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-color: ${props => props.$active ? '#8338ec' : props.theme.mode === 'dark' ? '#555' : '#ccc'};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .delete-btn {
    opacity: 1;
  }
`;

const PreviewContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
`;


interface ImageMeta {
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

const BatchImageCompress: React.FC = () => {
  const intl = useIntl();
  const [batchFiles, setBatchFiles] = useState<BatchFileItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesMeta, setImagesMeta] = useState<Record<string, ImageMeta>>({});
  const [compressedBlobs, setCompressedBlobs] = useState<Record<string, Blob>>({});
  const [compressedPreviews, setCompressedPreviews] = useState<Record<string, string>>({});
  const [isCompressing, setIsCompressing] = useState(false);
  
  // 压缩设置状态 - 全局共享
  const [quality, setQuality] = useState(0.8);
  const [resizeMode, setResizeMode] = useState<string | number>('scale');
  const [scale, setScale] = useState(100);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const [format, setFormat] = useState('jpeg');
  const [applyToAll, setApplyToAll] = useState(false);
  const [downloadAll, setDownloadAll] = useState(false);
  
  // 缓存开关状态（从 localStorage 读取偏好）
  const [enableCache, setEnableCache] = useState<boolean>(() => {
    const saved = localStorage.getItem('image_compress_enable_cache');
    return saved !== null ? saved === 'true' : true; // 默认启用
  });

  // 保存缓存偏好到 localStorage，并在禁用时清空缓存
  useEffect(() => {
    localStorage.setItem('image_compress_enable_cache', String(enableCache));
    if (!enableCache) {
      // 如果禁用缓存，清空已有缓存
      clearImageCache().catch(console.error);
    }
  }, [enableCache]);

  // 从缓存加载图片
  useEffect(() => {
    if (!enableCache) return;
    
    const loadCachedImages = async () => {
      const cached = await loadImagesFromCache();
      if (cached) {
        setBatchFiles(cached.files);
        setImagesMeta(cached.imagesMeta);
        setCompressedBlobs(cached.compressedBlobs);
        
        // 恢复压缩预览
        const previews: Record<string, string> = {};
        cached.files.forEach(item => {
          if (item.compressedPreview) {
            previews[item.id] = item.compressedPreview;
          }
        });
        setCompressedPreviews(previews);
        
        if (cached.files.length > 0) {
          setCurrentIndex(0);
          const firstMeta = cached.imagesMeta[cached.files[0].id];
          if (firstMeta) {
            setCustomWidth(firstMeta.width);
            setCustomHeight(firstMeta.height);
          }
        }
      }
    };
    
    loadCachedImages();
  }, [enableCache]);

  // 保存缓存（当数据变化时，使用 debounce 避免频繁保存）
  useEffect(() => {
    if (!enableCache) {
      // 如果缓存被禁用，清空缓存
      if (batchFiles.length === 0) {
        clearImageCache().catch(console.error);
      }
      return;
    }
    
    if (batchFiles.length === 0) {
      // 如果没有文件，尝试清空缓存
      clearImageCache().catch(console.error);
      return;
    }
    
    // 检查所有文件的 meta 是否都已加载（宽度和高度不为0）
    const allMetaLoaded = batchFiles.every(file => {
      const meta = imagesMeta[file.id];
      return meta && meta.width > 0 && meta.height > 0;
    });
    
    if (!allMetaLoaded) {
      // 如果还有文件的 meta 未加载，延迟保存
      return;
    }
    
    const timeoutId = setTimeout(() => {
      console.log('Auto-saving cache...', batchFiles.length, 'files');
      saveImagesToCache(batchFiles, imagesMeta, compressedBlobs).catch(console.error);
    }, 1000); // 延迟 1s 保存，确保数据稳定
    
    return () => clearTimeout(timeoutId);
  }, [batchFiles, imagesMeta, compressedBlobs, enableCache]);

  const handleBatchUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return false;
    const preview = URL.createObjectURL(file);
    const id = Math.random().toString(36).substr(2, 9);
    
    // 立即创建默认 meta 数据
    setImagesMeta(prev => ({
      ...prev,
      [id]: {
        width: 0,
        height: 0,
        originalSize: file.size,
        compressedSize: file.size
      }
    }));
    
    // 读取图片尺寸
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        setImagesMeta(prev => ({
          ...prev,
          [id]: {
            width: img.width,
            height: img.height,
            originalSize: file.size,
            compressedSize: file.size
          }
        }));
        setBatchFiles(prev => {
          if (prev.length === 0) {
            setCustomWidth(img.width);
            setCustomHeight(img.height);
          }
          return prev;
        });
      };
    };
    reader.readAsDataURL(file);

    const newItem: BatchFileItem = {
      id,
      file,
      preview,
      status: 'pending',
      originalSize: file.size
    };
    
    setBatchFiles(prev => {
      const updated = [...prev, newItem];
      if (prev.length === 0) {
        setCurrentIndex(0);
      }
      return updated;
    });
    
    return false;
  };

  const currentFile = batchFiles[currentIndex] || null;
  const currentMeta = currentFile 
    ? (imagesMeta[currentFile.id] || { 
        width: 0, 
        height: 0, 
        originalSize: currentFile.originalSize, 
        compressedSize: currentFile.originalSize 
      })
    : { width: 0, height: 0, originalSize: 0, compressedSize: 0 };
  const currentCompressedPreview = currentFile ? (compressedPreviews[currentFile.id] || currentFile.preview) : null;
  const isLossless = format === 'png' || (format === 'auto' && currentFile?.file.type === 'image/png');

  const runSingleCompress = async () => {
    if (!currentFile || !currentFile.preview) return;
    
    // 如果启用批量应用，执行批量压缩
    if (applyToAll && batchFiles.length > 1) {
      await runBatchCompress();
      return;
    }
    
    setIsCompressing(true);
    
    try {
      const img = new Image();
      img.src = currentFile.preview;
      await new Promise(resolve => img.onload = resolve);

      const options: CompressOptions = {
        quality,
        resizeMode,
        scale,
        customWidth,
        customHeight,
        format
      };
      
      const blob = await compressCore(currentFile.file, img, options);

      if (blob.size > currentFile.file.size && format !== 'png') {
        message.warning(intl.formatMessage({ id: 'imageCompress.message.larger', defaultMessage: '输出文件更大。尝试降低质量。' }));
      } else {
        message.success(intl.formatMessage({ id: 'imageCompress.message.compressed', defaultMessage: '压缩成功！' }));
      }

      const newUrl = URL.createObjectURL(blob);
      setCompressedBlobs(prev => ({ ...prev, [currentFile.id]: blob }));
      setCompressedPreviews(prev => ({ ...prev, [currentFile.id]: newUrl }));
      setImagesMeta(prev => ({
        ...prev,
        [currentFile.id]: {
          ...prev[currentFile.id],
          compressedSize: blob.size
        }
      }));
    } catch (e) {
      message.error(intl.formatMessage({ id: 'imageCompress.message.failed', defaultMessage: '压缩失败' }));
    }
    
    setIsCompressing(false);
  };

  const runBatchCompress = async () => {
    if (batchFiles.length === 0) return;
    setIsCompressing(true);
    
    const options: CompressOptions = {
      quality,
      resizeMode,
      scale,
      customWidth,
      customHeight,
      format
    };

    let successCount = 0;
    let failCount = 0;

    for (const item of batchFiles) {
      try {
        const img = new Image();
        img.src = item.preview;
        await new Promise(resolve => img.onload = resolve);

        const blob = await compressCore(item.file, img, options);

        const newUrl = URL.createObjectURL(blob);
        setCompressedBlobs(prev => ({ ...prev, [item.id]: blob }));
        setCompressedPreviews(prev => ({ ...prev, [item.id]: newUrl }));
        setImagesMeta(prev => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            compressedSize: blob.size
          }
        }));
        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    if (successCount > 0) {
      const failedText = failCount > 0 ? intl.formatMessage({ id: 'imageCompress.message.failed', defaultMessage: '压缩失败' }) : '';
      message.success(intl.formatMessage(
        { id: 'imageCompress.message.batchSuccess', defaultMessage: '成功压缩 {success} 张图片{failed}' },
        { success: successCount, failed: failCount > 0 ? `, ${failCount} ${failedText}` : '' }
      ));
    } else {
      message.error(intl.formatMessage({ id: 'imageCompress.message.batchFailed', defaultMessage: '所有压缩都失败了' }));
    }
    
    setIsCompressing(false);
  };

  const handleDownload = () => {
    // 如果启用批量下载，下载所有已压缩的图片
    if (downloadAll && batchFiles.length > 1) {
      const compressedFiles = batchFiles.filter(item => compressedBlobs[item.id]);
      if (compressedFiles.length === 0) {
        message.warning(intl.formatMessage({ id: 'imageCompress.message.noImagesToDownload', defaultMessage: '没有可下载的压缩图片' }));
        return;
      }
      
      // 依次下载所有压缩后的图片
      compressedFiles.forEach((item, index) => {
        const blob = compressedBlobs[item.id];
        if (!blob) return;
        
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          let ext = item.file.name.split('.').pop();
          if (format !== 'auto') ext = format === 'jpeg' ? 'jpg' : format;
          
          link.download = `min_${item.file.name.split('.')[0]}.${ext}`;
          link.click();
        }, index * 200); // 延迟下载，避免浏览器阻止多个下载
      });
      
      message.success(intl.formatMessage(
        { id: 'imageCompress.message.downloading', defaultMessage: '正在下载 {count} 张图片...' },
        { count: compressedFiles.length }
      ));
      return;
    }
    
    // 单个下载
    if (!currentFile) return;
    const blob = compressedBlobs[currentFile.id];
    if (!blob) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    let ext = currentFile.file.name.split('.').pop();
    if (format !== 'auto') ext = format === 'jpeg' ? 'jpg' : format;
    
    link.download = `min_${currentFile.file.name.split('.')[0]}.${ext}`;
    link.click();
  };

  const handleReset = () => {
    // 释放所有 blob URLs
    batchFiles.forEach(item => {
      URL.revokeObjectURL(item.preview);
      if (compressedPreviews[item.id] && compressedPreviews[item.id] !== item.preview) {
        URL.revokeObjectURL(compressedPreviews[item.id]);
      }
    });
    
    setBatchFiles([]);
    setCurrentIndex(0);
    setImagesMeta({});
    setCompressedBlobs({});
    setCompressedPreviews({});
    
    // 清空缓存
    clearImageCache();
  };

  const handleDeleteFile = (id: string, index: number) => {
    const file = batchFiles.find(f => f.id === id);
    if (file) {
      URL.revokeObjectURL(file.preview);
      if (compressedPreviews[id] && compressedPreviews[id] !== file.preview) {
        URL.revokeObjectURL(compressedPreviews[id]);
      }
    }

    setBatchFiles(prev => prev.filter(f => f.id !== id));
    
    // 更新当前索引
    if (batchFiles.length > 1) {
      if (index === currentIndex && index === batchFiles.length - 1) {
        // 删除的是最后一个，切换到前一个
        setCurrentIndex(index - 1);
      } else if (index < currentIndex) {
        // 删除的是当前之前的，索引减1
        setCurrentIndex(currentIndex - 1);
      }
    } else {
      setCurrentIndex(0);
    }
    
    // 清理相关数据
    setImagesMeta(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setCompressedBlobs(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setCompressedPreviews(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const singleSavings = currentMeta.originalSize > 0
    ? (1 - currentMeta.compressedSize / currentMeta.originalSize) * 100
    : 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        handleBatchUpload(file);
      });
    }
    // 重置 input 值，允许重复选择同一文件
    e.target.value = '';
  };

  return (
    <Workspace>
      <LargePreviewArea>
        <ThumbnailList>
          <UploadThumbnail>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
            />
            <InboxOutlined className="upload-icon" />
            <span className="upload-text">
              <FormattedMessage id="imageCompress.addImages" defaultMessage="添加图片" />
            </span>
          </UploadThumbnail>
          {batchFiles.map((item, index) => (
            <ThumbnailItem
              key={item.id}
              $active={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
            >
              <img src={item.preview} alt={item.file.name} />
              <Button
                className="delete-btn"
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(item.id, index);
                }}
                style={{
                  width: 24,
                  height: 24,
                  padding: 0,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </ThumbnailItem>
          ))}
        </ThumbnailList>
        
        {currentFile ? (
          <PreviewContent>
            <ImageCompare
              originalImage={currentFile.preview}
              compressedImage={currentCompressedPreview || currentFile.preview}
              originalSize={currentMeta.originalSize}
              compressedSize={currentMeta.compressedSize}
            />
          </PreviewContent>
        ) : (
          <PreviewContent>
            <div style={{ 
              textAlign: 'center', 
              color: '#999',
              padding: '40px'
            }}>
              <InboxOutlined style={{ fontSize: 64, marginBottom: 16, display: 'block' }} />
              <Text type="secondary">
                <FormattedMessage id="imageCompress.uploadToStart" defaultMessage="上传图片开始压缩" />
              </Text>
            </div>
          </PreviewContent>
        )}
      </LargePreviewArea>

      <CompressSettings
        singleSavings={singleSavings}
        singleMeta={currentMeta}
        quality={quality}
        setQuality={setQuality}
        resizeMode={resizeMode}
        setResizeMode={setResizeMode}
        scale={scale}
        setScale={setScale}
        customWidth={customWidth}
        setCustomWidth={setCustomWidth}
        customHeight={customHeight}
        setCustomHeight={setCustomHeight}
        format={format}
        setFormat={setFormat}
        isLossless={isLossless}
        isCompressing={isCompressing}
        onCompress={runSingleCompress}
        onDownload={handleDownload}
        onReset={handleReset}
        singleFile={currentFile?.file || null}
        hasCompressedResult={!!(currentFile && compressedBlobs[currentFile.id]) || batchFiles.some(item => compressedBlobs[item.id])}
        enableCache={enableCache}
        setEnableCache={setEnableCache}
        applyToAll={applyToAll}
        setApplyToAll={setApplyToAll}
        totalFilesCount={batchFiles.length}
        downloadAll={downloadAll}
        setDownloadAll={setDownloadAll}
      />
    </Workspace>
  );
};

export default BatchImageCompress;
