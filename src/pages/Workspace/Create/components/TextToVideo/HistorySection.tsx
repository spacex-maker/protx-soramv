import React from 'react';
import { Button, Spin, Empty, Pagination, Tooltip, Tag } from 'antd';
import { 
  ReloadOutlined, 
  PlayCircleFilled, 
  CheckCircleFilled, 
  CloseCircleFilled, 
  SyncOutlined,
  EyeOutlined,
  FileTextOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ThunderboltFilled,
  ClockCircleOutlined,
  ColumnHeightOutlined
} from '@ant-design/icons';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. 样式系统
// ==========================================

const Container = styled.div`
  margin-top: 40px;
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
`;

const Card = styled(motion.div as any)`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#eee'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  aspect-ratio: 16 / 10;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    border-color: transparent;
    z-index: 10;

    .overlay { opacity: 1; }
    /* 悬停时，底部信息栏向上滑动并完全显示 */
    .info-bar { 
      transform: translateY(0); 
      background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 60%, transparent 100%);
    }
    .play-btn { transform: scale(1); opacity: 1; }
    .actions-bar { opacity: 1; transform: translateY(0); }
    .prompt-preview { height: auto; opacity: 1; margin-top: 8px; }
    .meta-tags { height: auto; opacity: 1; margin-top: 8px; }
  }
`;

const MediaWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s;
  }

  ${Card}:hover & img, ${Card}:hover & video {
    transform: scale(1.05); /* 背景微放大 */
  }
`;

const HoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  /* 遮罩层稍微加深，以便显示更多白色文字 */
  background: rgba(0,0,0,0.2); 
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const PlayBtn = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  transition: all 0.3s;
  transform: scale(0.8);
  opacity: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1) !important;
  }
`;

// 顶部操作栏 (下载/复制/删除)
const ActionsBar = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s;
`;

const ActionBtn = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  transition: all 0.2s;
  border: 1px solid rgba(255,255,255,0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    color: #000;
  }
  
  &.delete:hover {
    background: #ff4d4f;
    color: #fff;
    border-color: #ff4d4f;
  }
`;

// 底部详细信息栏
const InfoBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  /* 默认只显示底部一点渐变 */
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  transform: translateY(0);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 3;
  pointer-events: none; /* 文字部分穿透 */
`;

const ModelInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .name {
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  
  .time {
    color: rgba(255,255,255,0.6);
    font-size: 12px;
    font-family: 'SF Mono', monospace;
  }
`;

// 提示词预览 (默认隐藏，悬停显示)
const PromptPreview = styled.div`
  height: 0;
  opacity: 0;
  overflow: hidden;
  color: rgba(255,255,255,0.8);
  font-size: 12px;
  line-height: 1.5;
  transition: all 0.3s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
`;

// 元数据标签 (默认隐藏，悬停显示)
const MetaTags = styled.div`
  height: 0;
  opacity: 0;
  overflow: hidden;
  display: flex;
  gap: 8px;
  transition: all 0.3s;
  
  .tag {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', monospace;
  }
`;

const StatusTag = styled.div<{ $status: number }>`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
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
      case 2: return css`display: none;`; // 成功状态不显示，保持干净
      case 3: return css`background: rgba(239, 68, 68, 0.9); color: #fff;`;
      default: return css`background: rgba(59, 130, 246, 0.9); color: #fff;`;
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
  getStatusText?: (status: number) => string; 
}

const HistorySection: React.FC<HistorySectionProps> = ({
  historyTasks,
  historyLoading,
  historyPagination,
  onRefresh,
  onPageChange,
  onTaskClick,
}) => {
  const intl = useIntl();
  
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

  const renderCardContent = (task: any) => {
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
      <MediaWrapper>
        {isVideo ? (
          <video src={mediaUrl} muted loop playsInline onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
        ) : (
          <img src={mediaUrl} alt={task.modelName} loading="lazy" />
        )}
        <HoverOverlay className="overlay">
          <PlayBtn className="play-btn">
            {isVideo ? <PlayCircleFilled /> : <EyeOutlined />}
          </PlayBtn>
        </HoverOverlay>
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
        <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} loading={historyLoading} style={{ borderRadius: '8px' }}>
          刷新
        </Button>
      </Header>

      {historyLoading && historyTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
      ) : historyTasks.length > 0 ? (
        <>
          <Grid>
            <AnimatePresence>
              {historyTasks.map((task, index) => (
                <Card
                  key={task.id}
                  onClick={() => onTaskClick(task.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  {/* 左上角状态 (仅在非成功时显示) */}
                  <StatusTag $status={task.status}>
                    {task.status === 1 ? <SyncOutlined spin /> : <CloseCircleFilled />}
                    {task.status === 1 ? 'Processing' : 'Failed'}
                  </StatusTag>

                  {/* 右上角操作栏 (悬停显示) */}
                  <ActionsBar className="actions-bar">
                    {task.prompt && (
                      <Tooltip title="复制提示词">
                        <ActionBtn onClick={(e) => handleCopyPrompt(e, task.prompt)}>
                          <CopyOutlined />
                        </ActionBtn>
                      </Tooltip>
                    )}
                    {task.resultUrls?.[0] && (
                      <Tooltip title="下载">
                        <ActionBtn onClick={(e) => handleDownload(e, task.resultUrls[0], task.id)}>
                          <DownloadOutlined />
                        </ActionBtn>
                      </Tooltip>
                    )}
                    <Tooltip title="删除">
                      <ActionBtn className="delete" onClick={(e) => { e.stopPropagation(); /* Add delete logic */ }}>
                        <DeleteOutlined />
                      </ActionBtn>
                    </Tooltip>
                  </ActionsBar>

                  {/* 媒体内容 */}
                  {renderCardContent(task)}

                  {/* 底部详细信息 (悬停展开更多) */}
                  <InfoBar className="info-bar">
                    <ModelInfo>
                      <div className="name">{task.modelName || 'Untitled Task'}</div>
                      <div className="time">{dayjs(task.createTime).fromNow()}</div>
                    </ModelInfo>
                    
                    {/* 额外信息：Prompt + Meta */}
                    <PromptPreview className="prompt-preview">
                      {task.prompt || intl.formatMessage({ 
                        id: 'create.history.noPrompt', 
                        defaultMessage: '暂无提示词' 
                      })}
                    </PromptPreview>
                    
                    <MetaTags className="meta-tags">
                      {task.creditsCost !== null && task.creditsCost !== undefined && (
                        <div className="tag">
                          <ThunderboltFilled style={{color:'#eab308'}}/> 
                          {task.creditsCost} {intl.formatMessage({ 
                            id: 'create.taskDetail.points', 
                            defaultMessage: 'pts' 
                          })}
                        </div>
                      )}
                      {task.durationMs && (
                        <div className="tag">
                          <ClockCircleOutlined /> 
                          {(task.durationMs/1000).toFixed(1)}s
                        </div>
                      )}
                      {(task.model?.videoAspectRatios || task.model?.imageAspectRatios) && (
                        <div className="tag">
                          <ColumnHeightOutlined /> 
                          {task.model?.videoAspectRatios || task.model?.imageAspectRatios}
                        </div>
                      )}
                    </MetaTags>
                  </InfoBar>
                </Card>
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
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#999' }}>暂无历史记录</span>} style={{ margin: '80px 0' }} />
      )}
    </Container>
  );
};

export default HistorySection;