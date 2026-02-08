import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Typography, Tag, Spin, message, Button, Tooltip, Space, Divider } from 'antd';
import {
  CloseOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SyncOutlined,
  InfoCircleOutlined,
  PlayCircleFilled,
  ThunderboltFilled,
  CodeFilled,
  CalendarOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  LoadingOutlined,
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
import { getModelDescription } from '../modelUtils';

// ==========================================
// 1. 样式系统
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

// 1. 纯氛围头部
// 修复 TS 报错：允许 $bg 为可选字符串
const HeroSection = styled.div<{ $bg?: string }>`
  position: relative;
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex-shrink: 0;
  overflow: hidden;
  
  /* 核心逻辑：如果没有背景图，显示高级动态渐变 */
  background: #0f172a; /* 默认底色 */
  
  ${props => props.$bg ? css`
    /* 有图片时显示图片 */
    background-image: url(${props.$bg});
    background-size: cover;
    background-position: center;
  ` : css`
    /* 无图片/视频时的酷炫兜底：极光渐变 */
    background: linear-gradient(
      -45deg,
      #0f172a,
      #312e81, /* Indigo */
      #581c87, /* Purple */
      #0f172a
    );
    background-size: 400% 400%;
    animation: ${gradientBG} 15s ease infinite;
  `}
  
  /* 底部遮罩，保证文字清晰 */
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

const HeroVideoBg = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0; /* 位于遮罩之下，背景之上 */
  opacity: 0.8;
  transition: opacity 0.5s;
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
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px 0;
    text-shadow: 0 4px 8px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
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

// 炫彩标题样式
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

// 模型介绍容器
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

// 2. 生成结果区
const ResultSection = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f0f2f5'};
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#222' : '#e8e8e8'};
`;

const SectionLabel = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#333'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VideoPlayerBox = styled.div`
  width: 100%;
  max-width: 800px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#ddd'};
  min-height: 300px;

  video {
    width: 100%;
    max-height: 450px;
    outline: none;
  }
`;

// 3. 详情网格
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

const isVideo = (url: string) => {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'mov', 'mkv'].includes(ext || '') || url.startsWith('data:video');
};

// ==========================================
// 主组件
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
      fetchDetail();
    }
  }, [open, taskId]);

  // 当任务加载完成后获取模型交互状态
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `task_${taskId}_${Date.now()}.mp4`;
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

  // 数据处理
  const coverUrl = normalizeUrl(task.coverImage || task.model?.coverImage || '');
  const videoUrl = task.outputFiles?.[0]?.fileUrl ? normalizeUrl(task.outputFiles[0].fileUrl) : null;
  const hasOutputVideo = videoUrl && isVideo(videoUrl);
  const isCoverVideo = isVideo(coverUrl);
  
  const getDuration = () => {
    if (task.durationMs) {
      return (task.durationMs / 1000).toFixed(1);
    }
    if (task.endTime && task.createTime) {
      const start = dayjs(task.createTime);
      const end = dayjs(task.endTime);
      return end.diff(start, 'second').toFixed(1);
    }
    return 'N/A';
  };
  const durationStr = getDuration();
  const aspectRatio = task.model?.imageAspectRatios || '16:9';
  const hasPrompt = task.prompt && task.prompt.trim().length > 0;

  // 逻辑核心：决定 Hero 背景显示什么
  // 1. 如果是视频封面 -> bg传空串 (依靠 Video 标签), 否则传 url
  // 2. 如果 URL 都不存在 -> 传空串 (触发 CSS 默认极光动画)
  const heroBgImage = isCoverVideo ? '' : (coverUrl || '');

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
      {/* 1. 头部区域 */}
      <HeroSection $bg={heroBgImage}>
        
        {/* 动态视频背景：如果是视频封面，自动播放作为背景 */}
        {isCoverVideo && (
          <HeroVideoBg 
            src={coverUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            onError={(e: any) => e.target.style.display = 'none'} // 如果加载失败，隐藏视频，显示底下的极光
          />
        )}

        {/* 如果既没有图片也没有视频，显示一个装饰性纹理叠加在极光上 */}
        {!isCoverVideo && !coverUrl && (
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
            {/* 模型介绍 */}
            {task.model && getModelDescription(task.model, intl.locale || '') && (
              <ModelDescriptionBox>
                <div className="description-text">
                  {getModelDescription(task.model, intl.locale || '')}
                </div>
              </ModelDescriptionBox>
            )}
          </TitleArea>

          <ActionArea>
            {/* 点赞 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Tooltip title={intl.formatMessage({ id: 'create.model.like', defaultMessage: '喜欢' })}>
                <GlassButton onClick={handleLike} disabled={likeLoading} style={isLiked ? { background: 'rgba(255,77,79,0.3)', borderColor: '#ff4d4f' } : {}}>
                  {likeLoading ? <LoadingOutlined /> : (isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />)}
                </GlassButton>
              </Tooltip>
              {likesCount > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{likesCount}</span>}
            </div>
            {/* 收藏 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Tooltip title={intl.formatMessage({ id: 'create.model.favorite', defaultMessage: '收藏' })}>
                <GlassButton onClick={handleFavorite} disabled={favoriteLoading} style={isFavorited ? { background: 'rgba(250,173,20,0.3)', borderColor: '#faad14' } : {}}>
                  {favoriteLoading ? <LoadingOutlined /> : (isFavorited ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />)}
                </GlassButton>
              </Tooltip>
              {favoritesCount > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{favoritesCount}</span>}
            </div>
            {/* 分享 */}
            <Tooltip title={intl.formatMessage({ id: 'create.model.share', defaultMessage: '分享' })}>
              <GlassButton onClick={handleShare}>
                <ShareAltOutlined />
              </GlassButton>
            </Tooltip>
            {/* 下载 */}
            {hasOutputVideo && (
              <GlassButton $primary onClick={handleDownload}>
                <DownloadOutlined /> {intl.formatMessage({ id: 'create.taskDetail.download', defaultMessage: '下载' })}
              </GlassButton>
            )}
          </ActionArea>
        </HeroContent>
      </HeroSection>

      {/* 2. 独立影院区 */}
      {hasOutputVideo && (
        <ResultSection id="result-video-section">
          <SectionLabel>
            <PlayCircleFilled style={{color: '#2997ff'}}/> {intl.formatMessage({ id: 'create.taskDetail.result', defaultMessage: '生成结果' })}
          </SectionLabel>
          <VideoPlayerBox>
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              controlsList="nodownload"
            />
          </VideoPlayerBox>
        </ResultSection>
      )}

      {/* 3. 详情信息网格 */}
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