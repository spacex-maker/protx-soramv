import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Typography, Tag, Spin, message, Button, Tooltip, Image } from 'antd';
import {
  CloseOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SyncOutlined,
  ThunderboltFilled,
  CodeFilled,
  CalendarOutlined,
  FileImageOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  LoadingOutlined,
  DoubleRightOutlined,
  EyeOutlined
} from '@ant-design/icons';
import styled, { css, keyframes } from 'styled-components';
import { useIntl } from 'react-intl';
import instance from 'api/axios';
import dayjs from 'dayjs';
import {
  likeModel,
  unlikeModel,
  favoriteModel,
  unfavoriteModel,
  getInteractionStatus,
  ModelInteractionResponse,
} from 'api/modelInteraction';

// ==========================================
// 1. 动画定义
// ==========================================

// 背景流动动画
const gradientBG = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 炫彩标题动画
const shine = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 中间连接符流动动画
const flowAnim = keyframes`
  0% { transform: translateX(-5px); opacity: 0.3; }
  50% { transform: translateX(5px); opacity: 1; }
  100% { transform: translateX(-5px); opacity: 0.3; }
`;

// ==========================================
// 2. 样式组件系统
// ==========================================

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
    background: ${props => props.theme.mode === 'dark' ? '#000' : '#fff'};
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
  .ant-modal-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    max-height: 90vh; 
    overflow-y: auto;
  }
  .ant-modal-close {
    top: 16px;
    right: 16px;
    color: rgba(255,255,255,0.8);
    background: rgba(0,0,0,0.3);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    transition: all 0.2s;
    z-index: 100;
    
    &:hover {
      background: rgba(0,0,0,0.6);
      color: #fff;
    }
  }
  /* 滚动条美化 */
  .ant-modal-body::-webkit-scrollbar { width: 6px; }
  .ant-modal-body::-webkit-scrollbar-thumb { background: rgba(100, 100, 100, 0.3); border-radius: 3px; }
`;

// --- Hero 头部区域 ---

const HeroSection = styled.div<{ $bg?: string }>`
  position: relative;
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex-shrink: 0;
  overflow: hidden;
  background: #0f172a;
  
  ${props => props.$bg ? css`
    background-image: url(${props.$bg});
    background-size: cover;
    background-position: center;
  ` : css`
    background: linear-gradient(
      -45deg,
      #0f172a,
      #312e81,
      #581c87,
      #0f172a
    );
    background-size: 400% 400%;
    animation: ${gradientBG} 15s ease infinite;
  `}
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.1) 0%,
      rgba(0,0,0,0.4) 60%,
      rgba(0,0,0,0.95) 100%
    );
    pointer-events: none;
    z-index: 2;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 10;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }
`;

const TitleArea = styled.div`
  flex: 1;
  .meta-row {
    display: flex;
    gap: 16px;
    align-items: center;
    color: rgba(255,255,255,0.7);
    font-size: 13px;
    flex-wrap: wrap;
    font-family: 'SF Mono', monospace;
    span { display: flex; align-items: center; gap: 6px; }
  }
`;

const GradientTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 12px 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
  background: linear-gradient(
    90deg,
    #ffffff 0%,
    #a5f3fc 20%,
    #c4b5fd 40%,
    #fbcfe8 60%,
    #a5f3fc 80%,
    #ffffff 100%
  );
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${shine} 8s linear infinite;
  text-shadow: 0 10px 30px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ModelDescriptionBox = styled.div`
  margin-top: 12px;
  max-height: 100px;
  overflow: hidden;
  .description-text {
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255,255,255,0.85);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ActionArea = styled.div`
  display: flex;
  gap: 12px;
`;

const GlassButton = styled.button<{ $primary?: boolean }>`
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(255,255,255,0.3)'};
  background: ${props => props.$primary ? '#fff' : 'rgba(255,255,255,0.1)'};
  color: ${props => props.$primary ? '#000' : '#fff'};
  font-weight: 600;
  font-size: 13px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    background: ${props => props.$primary ? '#e6e6e6' : 'rgba(255,255,255,0.2)'};
  }
`;

// --- 新增结果区样式 (酷炫版) ---

const ResultSection = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f0f2f5'};
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#222' : '#e8e8e8'};
`;

const ResultGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 24px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const MediaCard = styled.div<{ $isOutput?: boolean }>`
  flex: 1;
  width: 100%;
  min-width: 300px;
  max-width: 500px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(30,30,30,0.6)' : 'rgba(255,255,255,0.6)'};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  backdrop-filter: blur(20px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* 输出卡片发光特效 */
  ${props => props.$isOutput && css`
    border-color: rgba(82, 196, 26, 0.3);
    box-shadow: 0 0 30px rgba(82, 196, 26, 0.05);
  `}

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    border-color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
    
    ${props => props.$isOutput && css`
      box-shadow: 0 20px 50px rgba(82, 196, 26, 0.15);
      border-color: rgba(82, 196, 26, 0.6);
    `}
  }
`;

const MediaHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  
  .icon-box {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    &.input { background: rgba(255,255,255,0.1); color: #1890ff; }
    &.output { background: rgba(82, 196, 26, 0.1); color: #52c41a; }
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};

  /* 棋盘格透明背景 */
  background-image: 
    linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  
  .ant-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ant-image-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.5s ease;
  }

  &:hover .ant-image-img {
    transform: scale(1.05);
  }
`;

const FlowConnector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
  font-size: 24px;
  .arrow {
    animation: ${flowAnim} 2s infinite ease-in-out;
  }
  @media (max-width: 768px) {
    transform: rotate(90deg);
    margin: 10px 0;
  }
`;

// --- 详情网格区域 ---

const ContentGrid = styled.div<{ $hasPrompt: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$hasPrompt ? '1.8fr 1fr' : '1fr'};
  gap: 32px;
  padding: 32px;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 24px;
  }
`;

const PromptBox = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f8fafc'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  position: relative;
  
  h3 {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 12px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#64748b'};
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .prompt-text {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 14px;
    line-height: 1.7;
    color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#334155'};
    white-space: pre-wrap;
  }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px dashed ${props => props.theme.mode === 'dark' ? '#333' : '#e2e8f0'};
    
    &:last-child { border-bottom: none; }
    
    label {
      color: ${props => props.theme.mode === 'dark' ? '#666' : '#94a3b8'};
      font-size: 13px;
    }
    
    .val {
      font-weight: 500;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#0f172a'};
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

// ==========================================
// 工具函数
// ==========================================

const normalizeUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const isImage = (url: string) => {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '') || url.startsWith('data:image');
};

// ==========================================
// 主组件 Logic
// ==========================================

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  taskId: number | null;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ open, onClose, taskId }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<any | null>(null);
  
  // 交互状态
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const fetchInteractionStatus = useCallback(async (modelId: number) => {
    try {
      const response = await getInteractionStatus(modelId);
      setIsLiked(response.isLiked);
      setIsFavorited(response.isFavorited);
      setLikesCount(response.likesCount);
      setFavoritesCount(response.favoritesCount);
    } catch (error) {
      setIsLiked(false);
      setIsFavorited(false);
    }
  }, []);

  useEffect(() => {
    if (open && taskId) {
      fetchDetail();
    }
  }, [open, taskId]);

  useEffect(() => {
    if (task?.model?.id) {
      fetchInteractionStatus(task.model.id);
    }
  }, [task?.model?.id, fetchInteractionStatus]);

  const handleLike = async () => {
    if (!task?.model?.id || likeLoading) return;
    setLikeLoading(true);
    try {
      let response: ModelInteractionResponse;
      if (isLiked) {
        response = await unlikeModel(task.model.id);
        message.success(intl.formatMessage({ id: 'create.model.unliked', defaultMessage: '已取消喜欢' }));
      } else {
        response = await likeModel(task.model.id);
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
    if (!task?.model?.id || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      let response: ModelInteractionResponse;
      if (isFavorited) {
        response = await unfavoriteModel(task.model.id);
        message.success(intl.formatMessage({ id: 'create.model.unfavorited', defaultMessage: '已取消收藏' }));
      } else {
        response = await favoriteModel(task.model.id);
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

  const fetchDetail = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await instance.get(`/productx/sa-ai-gen-task/${taskId}/detail`);
      if (res.data.success) {
        setTask(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      message.error(intl.formatMessage({ id: 'create.taskDetail.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!task?.outputFiles?.[0]?.fileUrl) return;
    const url = normalizeUrl(task.outputFiles[0].fileUrl);
    const ext = url.split('.').pop()?.toLowerCase() || 'png';
    const a = document.createElement('a');
    a.href = url;
    a.download = `task_${taskId}_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderStatus = (status: number) => {
    const config = {
      1: { color: '#1890ff', icon: <SyncOutlined spin />, text: intl.formatMessage({ id: 'create.taskDetail.status.generating', defaultMessage: '生成中' }) },
      2: { color: '#52c41a', icon: <CheckCircleFilled />, text: intl.formatMessage({ id: 'create.taskDetail.status.success', defaultMessage: '成功' }) },
      3: { color: '#ff4d4f', icon: <CloseCircleFilled />, text: intl.formatMessage({ id: 'create.taskDetail.status.failed', defaultMessage: '失败' }) },
    }[status as 1 | 2 | 3] || { color: '#faad14', icon: <ClockCircleOutlined />, text: intl.formatMessage({ id: 'create.taskDetail.status.queued', defaultMessage: '排队中' }) };

    return (
      <Tag color={config.color} style={{ border: 'none', padding: '2px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, borderRadius: 100, lineHeight: '20px' }}>
        {config.icon} {config.text}
      </Tag>
    );
  };

  if (!task && loading) return <Modal open={open} footer={null} width={900}><div style={{padding: 40, textAlign:'center'}}><Spin /></div></Modal>;
  if (!task) return null;

  // 数据计算
  const coverUrl = normalizeUrl(task.coverImage || task.model?.coverImage || '');
  const inputImageUrl = task.inputFiles?.[0]?.fileUrl ? normalizeUrl(task.inputFiles[0].fileUrl) : null;
  const outputImageUrl = task.outputFiles?.[0]?.fileUrl ? normalizeUrl(task.outputFiles[0].fileUrl) : null;
  const hasInputImage = inputImageUrl && isImage(inputImageUrl);
  const hasOutputImage = outputImageUrl && isImage(outputImageUrl);
  
  const getDuration = () => {
    if (task.endTime && task.createTime) {
      const start = dayjs(task.createTime);
      const end = dayjs(task.endTime);
      return end.diff(start, 'second').toFixed(1);
    }
    return 'N/A';
  };
  const durationStr = getDuration();
  const aspectRatio = task.model?.imageAspectRatios || '1:1';
  const hasPrompt = task.prompt && task.prompt.trim().length > 0;
  
  // 背景逻辑
  const heroBgImage = outputImageUrl || inputImageUrl || coverUrl || '';

  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
    >
      {/* 1. Hero Header */}
      <HeroSection $bg={heroBgImage}>
        {!hasOutputImage && !hasInputImage && !coverUrl && (
           <div style={{
             position: 'absolute', inset: 0, zIndex: 0, opacity: 0.2,
             backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
             backgroundSize: '20px 20px'
           }}/>
        )}

        <HeroContent>
          <TitleArea>
            <GradientTitle>
              {task.modelName || intl.formatMessage({ id: 'create.taskDetail.unnamedTask', defaultMessage: '未命名任务' })}
              {renderStatus(task.status)}
            </GradientTitle>
            <div className="meta-row">
              <span><CalendarOutlined /> {dayjs(task.createTime).format('YYYY-MM-DD HH:mm')}</span>
              <span><ClockCircleOutlined /> {intl.formatMessage({ id: 'create.taskDetail.durationLabel', defaultMessage: '耗时' })} {durationStr}s</span>
            </div>
            {task.model?.description && (
              <ModelDescriptionBox>
                <div className="description-text">
                  {task.model.description}
                </div>
              </ModelDescriptionBox>
            )}
          </TitleArea>

          <ActionArea>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Tooltip title={intl.formatMessage({ id: 'create.model.like', defaultMessage: '喜欢' })}>
                <GlassButton onClick={handleLike} disabled={likeLoading} style={isLiked ? { background: 'rgba(255,77,79,0.3)', borderColor: '#ff4d4f' } : {}}>
                  {likeLoading ? <LoadingOutlined /> : (isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />)}
                </GlassButton>
              </Tooltip>
              {likesCount > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{likesCount}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Tooltip title={intl.formatMessage({ id: 'create.model.favorite', defaultMessage: '收藏' })}>
                <GlassButton onClick={handleFavorite} disabled={favoriteLoading} style={isFavorited ? { background: 'rgba(250,173,20,0.3)', borderColor: '#faad14' } : {}}>
                  {favoriteLoading ? <LoadingOutlined /> : (isFavorited ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />)}
                </GlassButton>
              </Tooltip>
              {favoritesCount > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{favoritesCount}</span>}
            </div>
            <Tooltip title={intl.formatMessage({ id: 'create.model.share', defaultMessage: '分享' })}>
              <GlassButton onClick={handleShare}>
                <ShareAltOutlined />
              </GlassButton>
            </Tooltip>
            {hasOutputImage && (
              <GlassButton $primary onClick={handleDownload}>
                <DownloadOutlined /> {intl.formatMessage({ id: 'create.taskDetail.download', defaultMessage: '下载' })}
              </GlassButton>
            )}
          </ActionArea>
        </HeroContent>
      </HeroSection>

      {/* 2. 酷炫的输入/输出结果区域 (新) */}
      {(hasInputImage || hasOutputImage) && (
        <ResultSection id="result-image-section">
          <ResultGroup>
            
            {/* 左侧：输入卡片 */}
            {hasInputImage && (
              <MediaCard>
                <MediaHeader>
                  <div className="icon-box input"><FileImageOutlined /></div>
                  {intl.formatMessage({ id: 'create.taskDetail.inputImage', defaultMessage: '输入参考' })}
                </MediaHeader>
                <ImageWrapper>
                  <Image
                    src={inputImageUrl || ''}
                    alt="Input"
                    placeholder={<Spin />}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                  />
                </ImageWrapper>
              </MediaCard>
            )}

            {/* 中间：连接动画 */}
            {hasInputImage && hasOutputImage && (
              <FlowConnector>
                <DoubleRightOutlined className="arrow" />
              </FlowConnector>
            )}

            {/* 右侧：输出卡片 */}
            {hasOutputImage && (
              <MediaCard $isOutput={true} style={!hasInputImage ? { maxWidth: 600 } : {}}>
                <MediaHeader>
                  <div className="icon-box output"><ThunderboltFilled /></div>
                  <span style={{ color: '#52c41a' }}>
                    {intl.formatMessage({ id: 'create.taskDetail.result', defaultMessage: '生成结果' })}
                  </span>
                </MediaHeader>
                <ImageWrapper>
                  <Image
                    src={outputImageUrl || ''}
                    alt="Output"
                    placeholder={<Spin />}
                    preview={{
                      mask: (
                        <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <EyeOutlined /> {intl.formatMessage({ id: 'common.preview', defaultMessage: '预览' })}
                        </div>
                      ),
                    }}
                  />
                </ImageWrapper>
              </MediaCard>
            )}

          </ResultGroup>
        </ResultSection>
      )}

      {/* 3. 任务详情网格 */}
      <ContentGrid $hasPrompt={hasPrompt}>
        {hasPrompt && (
          <div>
            <PromptBox>
              <h3><ThunderboltFilled /> {intl.formatMessage({ id: 'create.taskDetail.prompt.title', defaultMessage: 'Prompt / 提示词' })}</h3>
              <div className="prompt-text">
                {task.prompt}
              </div>
              <div style={{marginTop: 16, textAlign: 'right'}}>
                <Button 
                  size="small" 
                  icon={<CopyOutlined />} 
                  onClick={() => {
                    navigator.clipboard.writeText(task.prompt || '');
                    message.success(intl.formatMessage({ id: 'create.taskDetail.prompt.copied', defaultMessage: '已复制提示词' }));
                  }}
                >
                  {intl.formatMessage({ id: 'create.taskDetail.copyPrompt', defaultMessage: '复制提示词' })}
                </Button>
              </div>
            </PromptBox>
          </div>
        )}

        <div>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>{intl.formatMessage({ id: 'create.taskDetail.taskParams', defaultMessage: '任务参数' })}</h3>
          <InfoList>
            <div className="info-item">
              <label>{intl.formatMessage({ id: 'create.taskDetail.tokenCost', defaultMessage: 'Token消耗' })}</label>
              <div className="val" style={{ color: '#faad14' }}>
                <ThunderboltFilled /> {task.creditsCost || 0} Token
              </div>
            </div>
            <div className="info-item">
              <label>{intl.formatMessage({ id: 'create.taskDetail.aspectRatio', defaultMessage: '画面比例' })}</label>
              <div className="val">{aspectRatio}</div>
            </div>
            <div className="info-item">
              <label>{intl.formatMessage({ id: 'create.taskDetail.inputType', defaultMessage: '输入类型' })}</label>
              <div className="val"><CodeFilled /> {task.inputType}</div>
            </div>
            <div className="info-item">
              <label>{intl.formatMessage({ id: 'create.taskDetail.modelCode', defaultMessage: '模型代号' })}</label>
              <div className="val" style={{fontFamily: 'monospace', fontSize: 12}}>{task.modelCode}</div>
            </div>
          </InfoList>
        </div>
      </ContentGrid>
    </StyledModal>
  );
};

export default TaskDetailModal;