import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Typography, Tag, Image, Spin, message, Button, Tooltip, Row, Col } from 'antd';
import {
  CloseOutlined,
  ClockCircleOutlined,
  FileImageOutlined,
  RobotOutlined,
  CodeSandboxOutlined,
  DownloadOutlined,
  EyeOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  CalendarOutlined,
  ColumnWidthOutlined,
  ExpandOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  FieldNumberOutlined,
  ThunderboltOutlined,
  FileJpgOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';
import { TaskDetail, TaskOutputFile } from './types';
import {
  likeModel,
  unlikeModel,
  favoriteModel,
  unfavoriteModel,
  getInteractionStatus,
  ModelInteractionResponse,
} from 'api/modelInteraction';

const { Text, Title, Paragraph } = Typography;

// ==========================================
// 1. 样式组件定义 (Styled Components)
// ==========================================

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 24px;
    overflow: hidden;
    background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.6);
  }
  .ant-modal-header { display: none; }
`;

// --- 头部区域 ---

const HeroHeader = styled.div<{ bgImage?: string }>`
  position: relative;
  min-height: 400px;
  background-color: #000;
  overflow: hidden;
  padding: 40px;
  display: flex;
  
  /* 背景模糊层 */
  &::before {
    content: '';
    position: absolute;
    inset: -20%;
    background-image: url(${props => props.bgImage});
    background-size: cover;
    background-position: center;
    filter: blur(80px) brightness(0.4); 
    z-index: 0;
  }
  
  /* 渐变遮罩 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%);
    z-index: 1;
    pointer-events: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 20;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  gap: 40px;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PosterImage = styled.div<{ src: string }>`
  width: 240px;
  height: 320px;
  border-radius: 16px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  box-shadow: 0 25px 50px rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
  transition: transform 0.3s ease;
  
  &:hover { transform: scale(1.02); }
`;

const InfoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 320px;
  justify-content: space-between;
  min-width: 0;
`;

const MetaHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const MetaTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-family: 'SF Mono', monospace;
`;

// 炫彩动画
const shine = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GradientTitle = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 8px 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #ffffff 0%, #a5f3fc 25%, #c4b5fd 50%, #fbcfe8 75%, #ffffff 100%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${shine} 8s linear infinite;
  text-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
`;

const ActionButton = styled.button`
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &.primary {
    background: #fff;
    color: #000;
    border-color: #fff;
    font-weight: 600;
    &:hover { background: #e6e6e6; }
  }
`;

// --- 内容区域 ---

const ContentBody = styled.div`
  padding: 32px 40px;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  .anticon { color: #1890ff; font-size: 18px; }
`;

// --- 底部等高布局 ---

const BottomSection = styled(Row)`
  display: flex;
  align-items: stretch; /* 关键：强制等高 */
  margin-top: 24px;
`;

const PromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f8f9fa'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#e9ecef'};
  border-radius: 16px;
  overflow: hidden;
`;

const PromptHeader = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#e9ecef'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.mode === 'dark' ? '#262626' : '#f1f3f5'};
  
  .title { font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 13px; color: ${props => props.theme.mode === 'dark' ? '#aaa' : '#666'}; }
`;

const PromptContent = styled.div`
  padding: 20px;
  flex: 1;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.8;
  color: ${props => props.theme.mode === 'dark' ? '#d9d9d9' : '#374151'};
  overflow-y: auto;
  max-height: 400px;
  white-space: pre-wrap;
`;

const DetailsContainer = styled.div`
  height: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#e9ecef'};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DetailGroup = styled.div`
  padding: 20px;
  border-bottom: 1px dashed ${props => props.theme.mode === 'dark' ? '#303030' : '#e9ecef'};
  &:last-child { border-bottom: none; }
`;

const GroupTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  &:last-child { margin-bottom: 0; }
  
  .label { color: ${props => props.theme.mode === 'dark' ? '#888' : '#666'}; }
  .value { font-weight: 600; color: ${props => props.theme.mode === 'dark' ? '#fff' : '#111'}; display: flex; align-items: center; gap: 6px;}
`;

const CapabilityTag = styled.span`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.2)' : '#e6f7ff'};
  color: #1890ff;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.3)' : '#91d5ff'};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
`;

// --- 图片展示区 ---

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  background: ${props => props.theme.mode === 'dark' ? '#303030' : '#eee'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : 'transparent'};
  &:hover .image-actions { opacity: 1; }
  &:hover .image-info { opacity: 1; }
`;

const ImageInfoOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%);
  padding: 12px;
  color: #fff;
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 5;
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    &:last-child { margin-bottom: 0; }
  }
  
  .info-label {
    opacity: 0.8;
    font-size: 10px;
  }
  
  .info-value {
    font-weight: 600;
    font-size: 11px;
  }
`;

const ImageActions = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.2s;
`;

// ==========================================
// 2. 工具函数
// ==========================================

const normalizeImageSource = (image: string): string => {
  if (!image) return '';
  const trimmed = image.trim();
  if (trimmed.startsWith('data:image') || /^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//') && typeof window !== 'undefined') return `${window.location.protocol}${trimmed}`;
  if (trimmed.startsWith('/') && typeof window !== 'undefined') return `${window.location.origin}${trimmed}`;
  return `data:image/png;base64,${trimmed}`;
};

// 图片信息接口
interface ImageInfo {
  width?: number;
  height?: number;
  fileSize?: number; // 字节
}

// 格式化文件大小
const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

// 从 extraMetadata 或 extraMetadataMap 中提取图片信息
const extractImageInfoFromMetadata = (file: TaskOutputFile): ImageInfo | null => {
  try {
    // 尝试从 extraMetadataMap 中获取
    if (file.extraMetadataMap) {
      const metadata = file.extraMetadataMap;
      const width = metadata.width || metadata.imageWidth;
      const height = metadata.height || metadata.imageHeight;
      const fileSize = metadata.fileSize || metadata.size || metadata.file_size;
      
      if (width && height) {
        return {
          width: typeof width === 'string' ? parseInt(width, 10) : width,
          height: typeof height === 'string' ? parseInt(height, 10) : height,
          fileSize: typeof fileSize === 'string' ? parseInt(fileSize, 10) : fileSize,
        };
      }
    }
    
    // 尝试从 extraMetadata JSON 字符串中解析
    if (file.extraMetadata) {
      const metadata = JSON.parse(file.extraMetadata);
      const width = metadata.width || metadata.imageWidth;
      const height = metadata.height || metadata.imageHeight;
      const fileSize = metadata.fileSize || metadata.size || metadata.file_size;
      
      if (width && height) {
        return {
          width: typeof width === 'string' ? parseInt(width, 10) : width,
          height: typeof height === 'string' ? parseInt(height, 10) : height,
          fileSize: typeof fileSize === 'string' ? parseInt(fileSize, 10) : fileSize,
        };
      }
    }
  } catch (e) {
    // 解析失败，返回 null
  }
  return null;
};

// 通过加载图片获取尺寸
const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = normalizeImageSource(url);
  });
};

// 通过 HEAD 请求获取文件大小
const getFileSize = async (url: string): Promise<number | null> => {
  try {
    const normalizedUrl = normalizeImageSource(url);
    // 如果是 data URL，无法获取大小
    if (normalizedUrl.startsWith('data:')) {
      return null;
    }
    
    const response = await fetch(normalizedUrl, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    return contentLength ? parseInt(contentLength, 10) : null;
  } catch (e) {
    return null;
  }
};

// ==========================================
// 3. 主组件
// ==========================================

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  taskId: number | null;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ open, onClose, taskId }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  
  // 预览控制
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewCurrent, setPreviewCurrent] = useState(0);
  
  // 图片信息缓存：fileId -> ImageInfo
  const [imageInfoMap, setImageInfoMap] = useState<Record<number, ImageInfo>>({});

  // 点赞收藏状态
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // 获取模型交互状态
  const fetchInteractionStatus = useCallback(async (modelId: number) => {
    try {
      const response = await getInteractionStatus(modelId);
      setIsLiked(response.isLiked);
      setIsFavorited(response.isFavorited);
      setLikesCount(response.likesCount);
      setFavoritesCount(response.favoritesCount);
    } catch (error) {
      // 未登录或其他错误，使用默认值
      setIsLiked(false);
      setIsFavorited(false);
    }
  }, []);

  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetail();
    } else {
      setTaskDetail(null);
      setPreviewVisible(false);
      setPreviewCurrent(0);
      setImageInfoMap({});
    }
  }, [open, taskId]);

  // 当任务加载完成后获取模型交互状态
  useEffect(() => {
    if (taskDetail?.model?.id) {
      fetchInteractionStatus(taskDetail.model.id);
    }
  }, [taskDetail?.model?.id, fetchInteractionStatus]);

  const handleLike = async () => {
    if (!taskDetail?.model?.id || likeLoading) return;
    setLikeLoading(true);
    try {
      let response: ModelInteractionResponse;
      if (isLiked) {
        response = await unlikeModel(taskDetail.model.id);
        message.success(intl.formatMessage({ id: 'create.model.unliked', defaultMessage: '已取消喜欢' }));
      } else {
        response = await likeModel(taskDetail.model.id);
        message.success(intl.formatMessage({ id: 'create.model.liked', defaultMessage: '已喜欢' }));
      }
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '操作失败' }));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!taskDetail?.model?.id || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      let response: ModelInteractionResponse;
      if (isFavorited) {
        response = await unfavoriteModel(taskDetail.model.id);
        message.success(intl.formatMessage({ id: 'create.model.unfavorited', defaultMessage: '已取消收藏' }));
      } else {
        response = await favoriteModel(taskDetail.model.id);
        message.success(intl.formatMessage({ id: 'create.model.favorited', defaultMessage: '已收藏' }));
      }
      setIsFavorited(response.isFavorited);
      setFavoritesCount(response.favoritesCount);
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '操作失败' }));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success(intl.formatMessage({ id: 'create.model.linkCopied', defaultMessage: '链接已复制' }));
  };

  // 加载图片信息
  const loadImageInfo = useCallback(async (file: TaskOutputFile) => {
    // 首先尝试从 metadata 中获取
    const metadataInfo = extractImageInfoFromMetadata(file);
    if (metadataInfo && metadataInfo.width && metadataInfo.height) {
      setImageInfoMap(prev => {
        // 如果已经有缓存，直接返回
        if (prev[file.id]) return prev;
        return { ...prev, [file.id]: metadataInfo };
      });
      return;
    }

    // 如果 metadata 中没有，则通过加载图片获取尺寸
    try {
      const dimensions = await getImageDimensions(file.fileUrl);
      const fileSize = await getFileSize(file.fileUrl);
      
      setImageInfoMap(prev => {
        // 如果已经有缓存，直接返回
        if (prev[file.id]) return prev;
        return {
          ...prev,
          [file.id]: {
            width: dimensions.width,
            height: dimensions.height,
            fileSize: fileSize || undefined,
          },
        };
      });
    } catch (e) {
      // 加载失败，不显示信息
      console.warn('Failed to load image info:', e);
    }
  }, []);

  // 当任务详情加载完成后，加载所有图片信息
  useEffect(() => {
    if (taskDetail?.outputFiles && taskDetail.outputFiles.length > 0) {
      taskDetail.outputFiles.forEach(file => {
        // 检查是否已有缓存，避免重复加载
        if (!imageInfoMap[file.id]) {
          loadImageInfo(file);
        }
      });
    }
  }, [taskDetail, loadImageInfo, imageInfoMap]);

  const fetchTaskDetail = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const response = await instance.get(`/productx/sa-ai-gen-task/${taskId}/detail`);
      if (response.data.success && response.data.data) {
        setTaskDetail(response.data.data);
      } else {
        message.error(response.data.message || intl.formatMessage({ id: 'create.taskDetail.loadFailed' }));
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'create.taskDetail.loadFailed' }));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(intl.formatMessage({ id: 'create.taskDetail.prompt.copied' }));
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = normalizeImageSource(url);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (index: number) => {
    setPreviewCurrent(index);
    setPreviewVisible(true);
  };

  const calculateDuration = (start?: string | null, end?: string | null) => {
     if (!start || !end) return null;
     const s = new Date(start).getTime();
     const e = new Date(end).getTime();
     if (isNaN(s) || isNaN(e)) return null;
     return ((e - s) / 1000).toFixed(1);
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 2: return { color: '#52c41a', icon: <CheckCircleOutlined />, text: intl.formatMessage({ id: 'create.taskDetail.status.success' }) };
      case 3: return { color: '#ff4d4f', icon: <WarningOutlined />, text: intl.formatMessage({ id: 'create.taskDetail.status.failed' }) };
      case 1: return { color: '#1890ff', icon: <SyncOutlined spin />, text: intl.formatMessage({ id: 'create.taskDetail.status.processing' }) };
      default: return { color: '#faad14', icon: <ClockCircleOutlined />, text: intl.formatMessage({ id: 'create.taskDetail.status.queued' }) };
    }
  };

  if (loading && !taskDetail) {
    return (
      <StyledModal open={open} onCancel={onClose} footer={null} width={900} closeIcon={null}>
        <div style={{ padding: '80px', textAlign: 'center' }}><Spin size="large" /></div>
      </StyledModal>
    );
  }

  const statusInfo = taskDetail ? getStatusInfo(taskDetail.status) : { color: '#999', icon: null, text: '' };
  const duration = calculateDuration(taskDetail?.startTime, taskDetail?.endTime);
  const coverImage = normalizeImageSource(taskDetail?.model?.coverImage || taskDetail?.outputFiles?.[0]?.fileUrl || '');
  const allImages = taskDetail?.outputFiles?.map(f => normalizeImageSource(f.fileUrl)) || [];

  return (
    <StyledModal 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      width={1000}
      closeIcon={null}
    >
      {taskDetail ? (
        <>
          <CloseButton onClick={onClose}><CloseOutlined /></CloseButton>

          {/* --- 1. 海报式头部 (Hero Header) --- */}
          <HeroHeader bgImage={coverImage}>
            <HeaderContent>
              {/* 左侧：海报 */}
              <PosterImage src={coverImage} />

              {/* 右侧：信息流 */}
              <InfoColumn>
                <div>
                    {/* 元数据行 */}
                    <MetaHeader>
                        <MetaTag style={{ borderColor: statusInfo.color, color: statusInfo.color, fontWeight: 700 }}>
                            {statusInfo.icon} {statusInfo.text}
                        </MetaTag>
                        {duration && (
                            <MetaTag>
                                <ClockCircleOutlined /> {duration}{intl.formatMessage({ id: 'create.taskDetail.seconds' })}
                            </MetaTag>
                        )}
                        <MetaTag>
                            <FieldNumberOutlined /> ID: {taskId}
                        </MetaTag>
                    </MetaHeader>

                    {/* 炫彩大标题 */}
                    <GradientTitle>
                        {taskDetail.modelName || 'Untitled Model'}
                    </GradientTitle>

                    {/* Code ID */}
                    <div style={{ opacity: 0.7, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', color: '#fff' }}>
                        <CodeSandboxOutlined /> {taskDetail.modelCode}
                    </div>

                    {/* 描述 */}
                    {taskDetail.model?.description && (
                         <div style={{ maxHeight: '80px', overflow: 'hidden' }}>
                            <Paragraph 
                                ellipsis={{ rows: 2, expandable: true, symbol: <span style={{color: '#7dd3fc', marginLeft: 8}}>{intl.formatMessage({ id: 'create.taskDetail.more' })}</span> }}
                                style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}
                            >
                                {taskDetail.model.description}
                            </Paragraph>
                         </div>
                    )}
                </div>

                {/* 底部操作栏 (右下角) */}
                <ActionBar>
                    {/* 点赞 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <ActionButton onClick={handleLike} disabled={likeLoading} style={isLiked ? { background: 'rgba(255,77,79,0.3)', borderColor: '#ff4d4f' } : {}}>
                        {likeLoading ? <LoadingOutlined /> : (isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />)}
                        <FormattedMessage id="create.taskDetail.like" />
                      </ActionButton>
                      {likesCount > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{likesCount}</span>}
                    </div>
                    {/* 收藏 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <ActionButton onClick={handleFavorite} disabled={favoriteLoading} style={isFavorited ? { background: 'rgba(250,173,20,0.3)', borderColor: '#faad14' } : {}}>
                        {favoriteLoading ? <LoadingOutlined /> : (isFavorited ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />)}
                        <FormattedMessage id="create.taskDetail.collect" />
                      </ActionButton>
                      {favoritesCount > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{favoritesCount}</span>}
                    </div>
                    {/* 分享 */}
                    <ActionButton onClick={handleShare}>
                        <ShareAltOutlined /> <FormattedMessage id="create.taskDetail.share" />
                    </ActionButton>
                    {taskDetail.outputFiles && taskDetail.outputFiles.length > 0 && (
                        <ActionButton className="primary" onClick={() => message.loading(intl.formatMessage({ id: 'create.taskDetail.downloading' }))}>
                            <DownloadOutlined /> <FormattedMessage id="create.taskDetail.downloadAll" />
                        </ActionButton>
                    )}
                </ActionBar>

              </InfoColumn>
            </HeaderContent>
          </HeroHeader>

          {/* --- 2. 内容主体 --- */}
          <ContentBody>
            {/* 2.1 生成结果 (Outputs) */}
            <SectionTitle>
               <FileImageOutlined /> 
               <FormattedMessage id="create.taskDetail.outputs" />
               <span style={{ fontSize: 12, fontWeight: 400, color: '#999', marginLeft: 6, background: '#eee', padding: '2px 8px', borderRadius: 10 }}>
                 {taskDetail.outputFiles?.length || 0}
               </span>
            </SectionTitle>

            {taskDetail.outputFiles && taskDetail.outputFiles.length > 0 ? (
              <>
                <ImageGrid>
                  {taskDetail.outputFiles.map((file, idx) => {
                    const imageInfo = imageInfoMap[file.id];
                    return (
                      <ImageCard key={file.id}>
                        <Image
                          src={normalizeImageSource(file.fileUrl)}
                          width="100%"
                          height="100%"
                          style={{ objectFit: 'cover' }}
                          preview={false} 
                          onLoad={() => loadImageInfo(file)}
                        />
                        <ImageInfoOverlay className="image-info">
                          {imageInfo && (imageInfo.width || imageInfo.height) && (
                            <>
                              <div className="info-row">
                                <span className="info-label">
                                  <FormattedMessage id="create.taskDetail.imageDimensions" />
                                </span>
                                <span className="info-value">
                                  {imageInfo.width} × {imageInfo.height}
                                </span>
                              </div>
                              {imageInfo.fileSize && (
                                <div className="info-row">
                                  <span className="info-label">
                                    <FormattedMessage id="create.taskDetail.fileSize" />
                                  </span>
                                  <span className="info-value">
                                    {formatFileSize(imageInfo.fileSize)}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          {!imageInfo && (
                            <div className="info-row">
                              <span className="info-label" style={{ fontSize: 10, opacity: 0.6 }}>
                                <InfoCircleOutlined style={{ marginRight: 4 }} />
                                <FormattedMessage id="create.taskDetail.loadingImageInfo" />
                              </span>
                            </div>
                          )}
                        </ImageInfoOverlay>
                        <ImageActions className="image-actions">
                          <Tooltip title={intl.formatMessage({ id: 'create.taskDetail.preview' })}>
                            <Button 
                              shape="circle" 
                              size="large"
                              icon={<EyeOutlined />} 
                              style={{ border: 'none', background: 'rgba(255,255,255,0.95)', color: '#000' }}
                              onClick={() => handlePreview(idx)}
                            />
                          </Tooltip>
                          <Tooltip title={intl.formatMessage({ id: 'create.taskDetail.download' })}>
                            <Button 
                              type="primary" 
                              shape="circle" 
                              size="large"
                              icon={<DownloadOutlined />} 
                              onClick={() => downloadImage(file.fileUrl, `task-${taskId}-${idx+1}.png`)}
                            />
                          </Tooltip>
                        </ImageActions>
                      </ImageCard>
                    );
                  })}
                </ImageGrid>
                {/* 隐藏的 Preview Group */}
                <div style={{ display: 'none' }}>
                  <Image.PreviewGroup
                    preview={{
                      visible: previewVisible,
                      onVisibleChange: (vis) => setPreviewVisible(vis),
                      current: previewCurrent,
                      onChange: (val) => setPreviewCurrent(val),
                    }}
                  >
                    {allImages.map((src, idx) => (
                      <Image key={idx} src={src} />
                    ))}
                  </Image.PreviewGroup>
                </div>
              </>
            ) : taskDetail.status === 3 ? (
               <div style={{ padding: '32px', background: 'rgba(255, 77, 79, 0.05)', border: '1px dashed #ff4d4f', borderRadius: 12, marginBottom: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#ff4d4f', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                    <WarningOutlined /> <FormattedMessage id="create.taskDetail.generationFailed" />
                  </div>
                  <Text type="secondary">{taskDetail.errorMessage}</Text>
               </div>
            ) : (
               <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: 12, marginBottom: 40 }}>
                  <Spin tip={intl.formatMessage({ id: 'create.taskDetail.generating' })} size="large" />
               </div>
            )}

            {/* 2.2 底部双栏布局 (Prompt + Details) - 强制等高 */}
            <BottomSection gutter={24}>
              
              {/* 左侧：Prompt */}
              <Col xs={24} lg={15} style={{ display: 'flex', flexDirection: 'column' }}>
                <PromptContainer>
                  <PromptHeader>
                    <div className="title">
                      <CodeSandboxOutlined style={{ color: '#1890ff' }} /> 
                      <FormattedMessage id="create.taskDetail.promptLabel" />
                    </div>
                    <Tooltip title={intl.formatMessage({ id: 'create.taskDetail.copy' })}>
                      <Button 
                        size="small" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard(taskDetail.prompt)}
                      >
                        <FormattedMessage id="create.taskDetail.copy" />
                      </Button>
                    </Tooltip>
                  </PromptHeader>
                  <PromptContent>
                    {taskDetail.prompt}
                  </PromptContent>
                </PromptContainer>
              </Col>

              {/* 右侧：Details */}
              <Col xs={24} lg={9} style={{ display: 'flex', flexDirection: 'column' }}>
                <DetailsContainer>
                  
                  {/* 第一组：执行统计 */}
                  <DetailGroup>
                    <GroupTitle>
                      <ThunderboltOutlined /> <FormattedMessage id="create.taskDetail.executionStats" />
                    </GroupTitle>
                    <InfoRow>
                      <span className="label"><FormattedMessage id="create.taskDetail.taskType" /></span>
                      <span className="value"><Tag>{taskDetail.taskType.toUpperCase()}</Tag></span>
                    </InfoRow>
                    <InfoRow>
                      <span className="label"><FormattedMessage id="create.taskDetail.creditsCost" /></span>
                      <span className="value" style={{ color: '#faad14' }}>
                         {taskDetail.creditsCost ?? 0} {intl.formatMessage({ id: 'create.taskDetail.points' })}
                      </span>
                    </InfoRow>
                    <InfoRow>
                      <span className="label"><FormattedMessage id="create.taskDetail.createTime" /></span>
                      <span className="value" style={{ fontSize: 13 }}>
                        {new Date(taskDetail.createTime).toLocaleDateString()}
                      </span>
                    </InfoRow>
                  </DetailGroup>

                  {/* 第二组：模型参数 */}
                  {taskDetail.model && (
                    <DetailGroup style={{ flex: 1 }}>
                      <GroupTitle>
                        <ColumnWidthOutlined /> <FormattedMessage id="create.taskDetail.modelSpecs" />
                      </GroupTitle>
                      
                      <InfoRow>
                        <span className="label"><FormattedMessage id="create.taskDetail.maxResolution" /></span>
                        <span className="value">{taskDetail.model.imageMaxResolution}</span>
                      </InfoRow>

                      <InfoRow>
                        <span className="label"><FormattedMessage id="create.taskDetail.formats" /></span>
                        <span className="value" style={{ textTransform: 'uppercase', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FileJpgOutlined />
                          {taskDetail.model.imageFormats?.split(',').join(' / ') || 'PNG'}
                        </span>
                      </InfoRow>
                      
                      <InfoRow>
                         <span className="label"><FormattedMessage id="create.taskDetail.capabilities" /></span>
                         <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
                           {taskDetail.model.supportControlnet && <CapabilityTag>ControlNet</CapabilityTag>}
                           {taskDetail.model.supportInpaint && <CapabilityTag>Inpaint</CapabilityTag>}
                           {!taskDetail.model.supportControlnet && !taskDetail.model.supportInpaint && <span style={{fontSize:12, color:'#999'}}>-</span>}
                         </div>
                      </InfoRow>

                      <div style={{ marginTop: 12 }}>
                        <span className="label" style={{ fontSize: 13, display:'block', marginBottom: 6 }}><FormattedMessage id="create.taskDetail.supportedRatios" /></span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {taskDetail.model.imageAspectRatios?.split(',').map(r => (
                              <Tag key={r} style={{ margin: 0, fontSize: 12 }}>{r}</Tag>
                            ))}
                        </div>
                      </div>
                    </DetailGroup>
                  )}

                </DetailsContainer>
              </Col>
            </BottomSection>

          </ContentBody>
        </>
      ) : (
        <div style={{ padding: '100px', textAlign: 'center' }}>
          <Text type="secondary"><FormattedMessage id="create.taskDetail.dataError" /></Text>
        </div>
      )}
    </StyledModal>
  );
};

export default TaskDetailModal;