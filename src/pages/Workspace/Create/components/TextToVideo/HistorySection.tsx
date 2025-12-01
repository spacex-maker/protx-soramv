import React, { useRef } from 'react';
import { Button, Spin, Empty, Pagination, Tooltip, Modal, message } from 'antd';
import instance from 'api/axios';
import { 
  ReloadOutlined, 
  SyncOutlined, 
  FileTextOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  ThunderboltFilled,
  ColumnHeightOutlined,
  CheckCircleFilled, 
  CloseCircleFilled
} from '@ant-design/icons';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. 样式系统 (Styled System)
// ==========================================

const Container = styled.div`
  margin-top: 40px;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#111'};
  }
  
  .count-badge {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f1f1f1'};
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#666'};
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
`;

// 核心卡片
const Card = styled(motion.div as any)`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#eee'};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  aspect-ratio: 16 / 9;
  display: flex; 
  flex-direction: column;
  transform: translateZ(0); 

  &:hover {
    border-color: transparent;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
    z-index: 10;

    .media-content { transform: scale(1.05); }
    
    /* InfoBar 背景加深，并展开隐藏内容 */
    .info-bar { 
      background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 60%, transparent 100%);
    }
    
    .top-actions { opacity: 1; transform: translateY(0); }
    
    /* 展开隐藏信息 */
    .expandable-content {
      max-height: 100px; /* 足够展示内容的高度 */
      opacity: 1;
      margin-top: 12px;
    }
  }
`;

const MediaWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
  flex: 1;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
`;

const TopActions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.2s ease-in-out;
`;

const ActionBtn = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fff;
    color: #000;
  }
  
  &.delete:hover {
    background: #ff4d4f;
    color: #fff;
    border-color: #ff4d4f;
  }
`;

// 底部详细信息栏 (修复版)
const InfoBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* 关键修改：增加底部 Padding，确保文字不贴底 */
  padding: 40px 20px 24px; 
  
  /* 默认渐变：保证未 hover 时文字也能看清 */
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
  
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 3;
  pointer-events: none;
  
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  
  /* 背景色过渡 */
  transition: background 0.3s ease;
`;

const ModelInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 确保基本信息始终可见且位置固定 */
  
  .name {
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .time {
    color: rgba(255,255,255,0.7);
    font-size: 12px;
    font-family: 'SF Mono', monospace;
    display: flex;
    align-items: center;
  }
`;

// 可展开的内容容器 (包含 Prompt 和 Tags)
const ExpandableContent = styled.div`
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* 使用 margin-top 在 hover 时推开距离 */
  margin-top: 0; 
`;

const PromptPreview = styled.div`
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  margin-bottom: 8px;
`;

const MetaTags = styled.div`
  display: flex;
  gap: 8px;
  
  .tag {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.15);
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'SF Mono', monospace;
    backdrop-filter: blur(4px);
  }
`;

const StatusTag = styled.div<{ $status: number }>`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => {
    switch (props.$status) {
      case 2: return css`display: none;`;
      case 3: return css`background: rgba(239, 68, 68, 0.8); color: #fff;`;
      default: return css`background: rgba(59, 130, 246, 0.8); color: #fff;`;
    }
  }}
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#222' : '#f5f5f5'};
  color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
  gap: 12px;
  .anticon { font-size: 24px; }
  span { font-size: 12px; }
`;

// ==========================================
// 2. 组件逻辑
// ==========================================

interface HistorySectionProps {
  historyTasks: any[]; 
  historyLoading: boolean;
  historyPagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onRefresh: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  onTaskClick: (taskId: number) => void;
  onTaskDeleted?: (taskId: number) => void;
  getStatusText?: (status: number) => string;
}

// 单个历史卡片组件，用于管理视频 ref
interface HistoryCardProps {
  task: any;
  index: number;
  onTaskClick: (taskId: number) => void;
  onDownload: (e: React.MouseEvent, url: string, id: string) => void;
  onCopyPrompt: (e: React.MouseEvent, prompt: string) => void;
  onDelete: (e: React.MouseEvent, taskId: number) => void;
  onVideoError: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onVideoAbort: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  renderCardContent: (task: any, videoRef?: React.RefObject<HTMLVideoElement | null>) => React.ReactNode;
  intl: any;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  task,
  index,
  onTaskClick,
  onDownload,
  onCopyPrompt,
  onDelete,
  onVideoError,
  onVideoAbort,
  renderCardContent,
  intl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleCardClick = () => {
    // 在点击时暂停视频，避免加载中止错误
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = ''; // 清空 src，停止加载
    }
    onTaskClick(task.id);
  };

  return (
    <Card
      key={task.id}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <StatusTag $status={task.status}>
        {task.status === 1 ? <SyncOutlined spin /> : <CloseCircleFilled />}
        {task.status === 1 ? 'Processing' : 'Failed'}
      </StatusTag>

      <TopActions className="top-actions">
        {task.prompt && (
          <Tooltip title="复制提示词">
            <ActionBtn onClick={(e) => onCopyPrompt(e, task.prompt)}>
              <CopyOutlined />
            </ActionBtn>
          </Tooltip>
        )}
        {task.resultUrls?.[0] && (
          <Tooltip title="下载">
            <ActionBtn onClick={(e) => onDownload(e, task.resultUrls[0], task.id)}>
              <DownloadOutlined />
            </ActionBtn>
          </Tooltip>
        )}
        <Tooltip title="删除">
          <ActionBtn className="delete" onClick={(e) => onDelete(e, task.id)}>
            <DeleteOutlined />
          </ActionBtn>
        </Tooltip>
      </TopActions>

      {renderCardContent(task, videoRef)}

      <InfoBar className="info-bar">
        <ModelInfo>
          <div className="name">{task.modelName || 'Untitled Task'}</div>
          <div className="time">
            <ClockCircleOutlined style={{fontSize: 10, marginRight: 4}} />
            {dayjs(task.createTime).fromNow()}
          </div>
        </ModelInfo>
        
        {/* 使用 ExpandableContent 包裹详细信息，实现向上生长 */}
        <ExpandableContent className="expandable-content">
          <PromptPreview>
            {task.prompt || intl.formatMessage({ id: 'create.history.noPrompt', defaultMessage: '暂无提示词' })}
          </PromptPreview>
          
          <MetaTags>
            {task.creditsCost !== null && task.creditsCost !== undefined && (
              <div className="tag">
                <ThunderboltFilled style={{color:'#fbbf24'}}/> {task.creditsCost}
              </div>
            )}
            {task.durationMs && (
              <div className="tag">
                <ClockCircleOutlined /> {(task.durationMs/1000).toFixed(1)}s
              </div>
            )}
            {(task.model?.videoAspectRatios || task.model?.imageAspectRatios) && (
              <div className="tag">
                <ColumnHeightOutlined /> {task.model?.videoAspectRatios || task.model?.imageAspectRatios}
              </div>
            )}
          </MetaTags>
        </ExpandableContent>
      </InfoBar>
    </Card>
  );
};

const HistorySection: React.FC<HistorySectionProps> = ({
  historyTasks,
  historyLoading,
  historyPagination,
  onRefresh,
  onPageChange,
  onTaskClick,
  onTaskDeleted,
}) => {
  const intl = useIntl();
  
  const handleDelete = async (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    
    Modal.confirm({
      title: intl.formatMessage({ id: 'create.history.deleteConfirm.title', defaultMessage: '确认删除' }),
      content: intl.formatMessage({ id: 'create.history.deleteConfirm.content', defaultMessage: '确定要删除这个任务吗？删除后将无法恢复。' }),
      okText: intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' }),
      cancelText: intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' }),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await instance.delete(`/productx/sa-ai-gen-task/${taskId}`);
          if (response.data?.success) {
            message.success(intl.formatMessage({ id: 'create.history.deleteSuccess', defaultMessage: '删除成功' }));
            onTaskDeleted?.(taskId);
            onRefresh();
          } else {
            message.error(response.data?.message || intl.formatMessage({ id: 'create.history.deleteFailed', defaultMessage: '删除失败' }));
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || intl.formatMessage({ id: 'create.history.deleteFailed', defaultMessage: '删除失败' }));
        }
      },
    });
  };
  
  const handleDownload = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `task_${id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (e: React.MouseEvent, prompt: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
  };

  // 处理视频错误，静默处理加载中止的错误
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const error = video.error;
    
    // 忽略加载中止的错误（这些是正常的，当组件卸载或用户导航时会发生）
    if (error && error.code === MediaError.MEDIA_ERR_ABORTED) {
      return; // 静默处理，不显示错误
    }
    
    // 其他错误可以在这里处理，比如显示占位符
    console.warn('Video load error:', error?.message || 'Unknown error');
  };

  // 处理视频加载中止（当用户点击卡片导致组件卸载时）
  const handleVideoAbort = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    // 静默处理加载中止，这是正常行为
    e.preventDefault();
  };

  const renderCardContent = (task: any, videoRef?: React.RefObject<HTMLVideoElement | null>) => {
    const mediaUrl = task.thumbnailUrl || (task.resultUrls && task.resultUrls[0]);
    const isVideo = task.outputType === 'video' || (mediaUrl && mediaUrl.endsWith('.mp4'));

    if (task.status === 1 || task.status === 0) { 
      return (
        <LoadingPlaceholder>
          <SyncOutlined spin style={{ color: '#3b82f6' }} />
          <span>生成中...</span>
        </LoadingPlaceholder>
      );
    }
    
    if (task.status === 3) { 
      return (
        <LoadingPlaceholder>
          <CloseCircleFilled style={{ color: '#ef4444' }} />
          <span>生成失败</span>
        </LoadingPlaceholder>
      );
    }

    if (!mediaUrl) {
      return (
        <LoadingPlaceholder>
          <FileTextOutlined style={{ fontSize: 24 }} />
          <span>无预览</span>
        </LoadingPlaceholder>
      );
    }

    return (
      <MediaWrapper className="media-content">
        {isVideo ? (
          <video 
            ref={videoRef}
            src={mediaUrl} 
            muted 
            loop 
            playsInline 
            preload="metadata"
            onMouseOver={e => {
              const video = e.currentTarget;
              if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                video.play().catch(() => {}); // 忽略播放错误
              }
            }} 
            onMouseOut={e => {
              const video = e.currentTarget;
              video.pause();
            }}
            onError={handleVideoError}
            onAbort={handleVideoAbort}
          />
        ) : (
          <img 
            src={mediaUrl} 
            alt={task.modelName} 
            loading="lazy"
            onError={(e) => {
              // 静默处理图片加载错误
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </MediaWrapper>
    );
  };

  return (
    <Container>
      <Header>
        <TitleArea>
          <h3>历史记录</h3>
          <span className="count-badge">{historyPagination.total}</span>
        </TitleArea>
        <Button 
          type="text" 
          icon={<ReloadOutlined />} 
          onClick={onRefresh} 
          loading={historyLoading}
          style={{ borderRadius: '8px' }}
        >
          刷新
        </Button>
      </Header>

      {historyLoading && historyTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : historyTasks.length > 0 ? (
        <>
          <Grid>
            <AnimatePresence>
              {historyTasks.map((task, index) => (
                <HistoryCard
                  key={task.id}
                  task={task}
                  index={index}
                  onTaskClick={onTaskClick}
                  onDownload={handleDownload}
                  onCopyPrompt={handleCopyPrompt}
                  onDelete={handleDelete}
                  onVideoError={handleVideoError}
                  onVideoAbort={handleVideoAbort}
                  renderCardContent={renderCardContent}
                  intl={intl}
                />
              ))}
            </AnimatePresence>
          </Grid>

          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={historyPagination.current}
              pageSize={historyPagination.pageSize}
              total={historyPagination.total}
              onChange={onPageChange}
              showSizeChanger={false}
              showQuickJumper
            />
          </div>
        </>
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description={<span style={{ color: '#999' }}>暂无历史记录</span>} 
          style={{ margin: '80px 0' }}
        />
      )}
    </Container>
  );
};

export default HistorySection;