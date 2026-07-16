import React from 'react';
import { Drawer, Empty, Tooltip, Button, Space } from 'antd';
import {
  LoadingOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CodeSandboxOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  FileImageOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. 样式系统
// ==========================================

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content {
    background: ${(props) => (props.theme.mode === 'dark' ? '#0a0a0a' : '#ffffff')};
  }
  .ant-drawer-header {
    border-bottom: 1px solid ${(props) => (props.theme.mode === 'dark' ? '#222' : '#f0f0f0')};
    background: ${(props) => (props.theme.mode === 'dark' ? '#0a0a0a' : '#ffffff')};
    padding: 24px;
  }
  .ant-drawer-title {
    font-size: 18px;
    font-weight: 600;
    color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#111')};
  }
  .ant-drawer-body {
    padding: 0;
    background: ${(props) => (props.theme.mode === 'dark' ? '#000' : '#f9fafb')};
  }
`;

const QueueHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  .count-badge {
    background: #2997ff;
    color: #fff;
    padding: 2px 8px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
  }
`;

const TaskItemWrapper = styled(motion.div as any)`
  position: relative;
  margin: 12px 16px;
  padding: 20px;
  background: ${(props) => (props.theme.mode === 'dark' ? '#141414' : '#ffffff')};
  border: 1px solid ${(props) => (props.theme.mode === 'dark' ? '#2a2a2a' : '#e5e7eb')};
  border-radius: 16px;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    border-color: #2997ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  }

  &.processing {
    border-color: #2997ff;
    animation: ${pulseAnimation} 2s infinite;
  }

  &.cancelled {
    border-color: ${(props) => (props.theme.mode === 'dark' ? '#444' : '#d9d9d9')};
    opacity: 0.92;
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-right: 8px;
`;

const ModelTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#1f2937')};

  .icon {
    color: #2997ff;
    background: ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(41, 151, 255, 0.15)' : 'rgba(41, 151, 255, 0.1)'};
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const TimeInfo = styled.div`
  font-size: 12px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#666' : '#999')};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PromptPreview = styled.div`
  font-size: 13px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#aaa' : '#555')};
  line-height: 1.5;
  background: ${(props) => (props.theme.mode === 'dark' ? '#1a1a1a' : '#f3f4f6')};
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
`;

const MediaSection = styled.div`
  margin-top: 12px;
`;

const MediaSectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: ${(props) => (props.theme.mode === 'dark' ? '#888' : '#6b7280')};
  margin-bottom: 8px;
`;

const MediaStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MediaThumb = styled.div<{ $accent?: string }>`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid
    ${(props) =>
      props.$accent
        ? `${props.$accent}66`
        : props.theme.mode === 'dark'
          ? '#333'
          : '#e5e7eb'};
  flex-shrink: 0;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const MediaThumbBadge = styled.span<{ $accent?: string }>`
  position: absolute;
  top: 3px;
  left: 3px;
  z-index: 1;
  padding: 0 5px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  background: ${(props) => props.$accent || '#2997ff'};
  max-width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AudioThumb = styled(MediaThumb)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 4px;
  background: linear-gradient(180deg, rgba(24, 144, 255, 0.25), rgba(15, 23, 42, 0.9));

  .name {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.85);
    max-width: 56px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
`;

const MediaMore = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.theme.mode === 'dark' ? '#aaa' : '#6b7280')};
  background: ${(props) => (props.theme.mode === 'dark' ? '#1a1a1a' : '#f3f4f6')};
  border: 1px dashed ${(props) => (props.theme.mode === 'dark' ? '#333' : '#d1d5db')};
`;

const StatusBar = styled.div<{ $cancelled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed ${(props) => (props.theme.mode === 'dark' ? '#333' : '#eee')};

  .status-text {
    font-size: 12px;
    font-weight: 500;
    color: ${(props) => (props.$cancelled ? '#faad14' : '#2997ff')};
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .progress-track {
    flex: 1;
    height: 4px;
    background: ${(props) => (props.theme.mode === 'dark' ? '#333' : '#eee')};
    border-radius: 2px;
    overflow: hidden;

    .bar {
      height: 100%;
      background: #2997ff;
      width: 60%;
      border-radius: 2px;
      animation: progress 2s ease-in-out infinite;
    }
  }

  @keyframes progress {
    0% {
      width: 0%;
      margin-left: 0;
    }
    50% {
      width: 100%;
      margin-left: 0;
    }
    100% {
      width: 0%;
      margin-left: 100%;
    }
  }
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

// ==========================================
// 2. 逻辑组件
// ==========================================

export type WaitingTaskPollStatus = 'polling' | 'cancelled' | 'fetching_result';

export interface WaitingTaskRefMedia {
  url: string;
  kind: 'video' | 'image' | 'audio';
  /** 展示标签，如 @视频1 */
  label?: string;
  fileName?: string;
}

export interface WaitingTask {
  taskId: string;
  modelName: string;
  prompt: string;
  submitTime: string;
  aspectRatio?: string;
  duration?: number;
  /** 轮询状态：polling 并行轮询中；fetching_result 生成完成正在同步视频；cancelled 用户已停止轮询 */
  pollStatus?: WaitingTaskPollStatus;
  /** 参考图（图生视频 / 剪辑） */
  referenceImages?: WaitingTaskRefMedia[];
  /** 参考视频（视频剪辑） */
  referenceVideos?: WaitingTaskRefMedia[];
  /** 参考音频（视频剪辑） */
  referenceAudios?: WaitingTaskRefMedia[];
}

interface WaitingTaskQueueProps {
  open: boolean;
  onClose: () => void;
  tasks: WaitingTask[];
  /** 停止该任务的状态轮询（任务保留为「已取消」） */
  onStopPolling: (taskId: string) => void;
  /** 从队列中移除该任务（不再显示；恢复 pending 时也会跳过） */
  onRemoveTask: (taskId: string) => void;
  /** 重新开始轮询该任务状态 */
  onResumePolling: (taskId: string) => void;
}

const MAX_THUMBS_PER_KIND = 4;

function TaskRefMediaStrip({ task }: { task: WaitingTask }) {
  const videos = task.referenceVideos || [];
  const images = task.referenceImages || [];
  const audios = task.referenceAudios || [];
  if (!videos.length && !images.length && !audios.length) {
    return null;
  }

  return (
    <MediaSection>
      <MediaSectionLabel>
        {videos.length > 0 && <VideoCameraOutlined />}
        {images.length > 0 && <FileImageOutlined />}
        {audios.length > 0 && <AudioOutlined />}
        <FormattedMessage id="create.waitingTask.refs" defaultMessage="参考素材" />
        <span style={{ fontWeight: 500, opacity: 0.8 }}>
          {[
            videos.length > 0 ? `${videos.length}V` : null,
            images.length > 0 ? `${images.length}I` : null,
            audios.length > 0 ? `${audios.length}A` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </MediaSectionLabel>
      <MediaStrip>
        {videos.slice(0, MAX_THUMBS_PER_KIND).map((item, i) => (
          <Tooltip key={`v-${i}-${item.url}`} title={item.label || item.fileName || `@视频${i + 1}`}>
            <MediaThumb $accent="#13c2c2">
              <MediaThumbBadge $accent="#13c2c2">{item.label || `@视频${i + 1}`}</MediaThumbBadge>
              <video
                src={item.url}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => {
                  const el = e.currentTarget;
                  if (el.currentTime < 0.1) el.currentTime = 0.1;
                }}
              />
            </MediaThumb>
          </Tooltip>
        ))}
        {videos.length > MAX_THUMBS_PER_KIND && (
          <MediaMore>+{videos.length - MAX_THUMBS_PER_KIND}</MediaMore>
        )}
        {images.slice(0, MAX_THUMBS_PER_KIND).map((item, i) => (
          <Tooltip key={`i-${i}-${item.url}`} title={item.label || item.fileName || `@图像${i + 1}`}>
            <MediaThumb $accent="#722ed1">
              <MediaThumbBadge $accent="#722ed1">{item.label || `@图像${i + 1}`}</MediaThumbBadge>
              <img src={item.url} alt={item.label || `image-${i + 1}`} />
            </MediaThumb>
          </Tooltip>
        ))}
        {images.length > MAX_THUMBS_PER_KIND && (
          <MediaMore>+{images.length - MAX_THUMBS_PER_KIND}</MediaMore>
        )}
        {audios.slice(0, MAX_THUMBS_PER_KIND).map((item, i) => (
          <Tooltip key={`a-${i}-${item.url}`} title={item.label || item.fileName || `@音频${i + 1}`}>
            <AudioThumb $accent="#1890ff">
              <MediaThumbBadge $accent="#1890ff">{item.label || `@音频${i + 1}`}</MediaThumbBadge>
              <AudioOutlined style={{ fontSize: 18, color: '#69c0ff' }} />
              <span className="name">{item.fileName || item.label || `audio-${i + 1}`}</span>
            </AudioThumb>
          </Tooltip>
        ))}
        {audios.length > MAX_THUMBS_PER_KIND && (
          <MediaMore>+{audios.length - MAX_THUMBS_PER_KIND}</MediaMore>
        )}
      </MediaStrip>
    </MediaSection>
  );
}

const WaitingTaskQueue: React.FC<WaitingTaskQueueProps> = ({
  open,
  onClose,
  tasks,
  onStopPolling,
  onRemoveTask,
  onResumePolling,
}) => {
  const intl = useIntl();
  const activeCount = tasks.filter((t) => {
    const s = t.pollStatus || 'polling';
    return s === 'polling' || s === 'fetching_result';
  }).length;

  return (
    <StyledDrawer
      title={
        <QueueHeader>
          <span>
            <FormattedMessage id="create.waitingTask.queue" defaultMessage="任务队列" />
          </span>
          <span className="count-badge">{activeCount}</span>
        </QueueHeader>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
    >
      {tasks.length === 0 ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
          <p style={{ color: '#999', marginTop: 16 }}>
            <FormattedMessage id="create.waitingTask.empty" defaultMessage="暂无进行中的任务" />
          </p>
        </div>
      ) : (
        <div style={{ paddingBottom: 24 }}>
          <AnimatePresence>
            {tasks.map((task, index) => {
              const pollStatus = task.pollStatus || 'polling';
              const isCancelled = pollStatus === 'cancelled';
              const isFetchingResult = pollStatus === 'fetching_result';
              const isPolling = !isCancelled;

              return (
                <TaskItemWrapper
                  key={task.taskId}
                  className={isPolling ? 'processing' : 'cancelled'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskHeader>
                    <ModelTag>
                      <div className="icon">
                        <CodeSandboxOutlined />
                      </div>
                      {task.modelName}
                    </ModelTag>
                    <TimeInfo>
                      <ClockCircleOutlined /> {dayjs(task.submitTime).format('HH:mm')}
                    </TimeInfo>
                  </TaskHeader>

                  <TaskRefMediaStrip task={task} />

                  {task.prompt && (
                    <PromptPreview>
                      <FileTextOutlined style={{ marginRight: 6, opacity: 0.7 }} />
                      {task.prompt}
                    </PromptPreview>
                  )}

                  <StatusBar $cancelled={isCancelled}>
                    <div className="status-text">
                      {isPolling ? <LoadingOutlined /> : <PauseCircleOutlined />}
                      {isFetchingResult ? (
                        <FormattedMessage
                          id="create.waitingTask.fetchingResult"
                          defaultMessage="正在同步视频结果..."
                        />
                      ) : isPolling ? (
                        <FormattedMessage
                          id="create.waitingTask.generating"
                          defaultMessage="生成中..."
                        />
                      ) : (
                        <FormattedMessage
                          id="create.waitingTask.cancelled"
                          defaultMessage="已取消轮询"
                        />
                      )}
                    </div>
                    {isPolling && (
                      <div className="progress-track">
                        <div className="bar" />
                      </div>
                    )}
                  </StatusBar>

                  <ActionRow>
                    {isPolling ? (
                      <Tooltip
                        title={intl.formatMessage({
                          id: 'create.waitingTask.stopPolling',
                          defaultMessage: '停止轮询该任务状态',
                        })}
                      >
                        <Button
                          size="small"
                          icon={<StopOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStopPolling(task.taskId);
                          }}
                        >
                          <FormattedMessage
                            id="create.waitingTask.stop"
                            defaultMessage="停止轮询"
                          />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Space size={8} wrap>
                        <Tooltip
                          title={intl.formatMessage({
                            id: 'create.waitingTask.resumeHint',
                            defaultMessage: '重新请求并轮询该任务状态',
                          })}
                        >
                          <Button
                            size="small"
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onResumePolling(task.taskId);
                            }}
                          >
                            <FormattedMessage
                              id="create.waitingTask.resume"
                              defaultMessage="再次请求"
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          title={intl.formatMessage({
                            id: 'create.waitingTask.removeHint',
                            defaultMessage: '从队列中删除，不再显示',
                          })}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveTask(task.taskId);
                            }}
                          >
                            <FormattedMessage
                              id="create.waitingTask.remove"
                              defaultMessage="删除"
                            />
                          </Button>
                        </Tooltip>
                      </Space>
                    )}
                    {isPolling && (
                      <Tooltip
                        title={intl.formatMessage({
                          id: 'create.waitingTask.removeHint',
                          defaultMessage: '从队列中删除，不再显示',
                        })}
                      >
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTask(task.taskId);
                          }}
                        />
                      </Tooltip>
                    )}
                  </ActionRow>
                </TaskItemWrapper>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </StyledDrawer>
  );
};

export default WaitingTaskQueue;
