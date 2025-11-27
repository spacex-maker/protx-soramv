import React from 'react';
import { Drawer, List, Typography, Empty, Tooltip } from 'antd';
import { 
  LoadingOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CodeSandboxOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

const { Text } = Typography;

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
    background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#ffffff'};
  }
  .ant-drawer-header {
    border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#222' : '#f0f0f0'};
    background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#ffffff'};
    padding: 24px;
  }
  .ant-drawer-title {
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#111'};
  }
  .ant-drawer-body {
    padding: 0;
    background: ${props => props.theme.mode === 'dark' ? '#000' : '#f9fafb'};
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

// 任务项容器 (关键修复：添加 'as any' 以解决 TS 类型报错)
const TaskItemWrapper = styled(motion.div as any)`
  position: relative;
  margin: 12px 16px;
  padding: 20px;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#e5e7eb'};
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: #2997ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
    
    .delete-btn {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* 正在处理的状态光效 */
  &.processing {
    border-color: #2997ff;
    animation: ${pulseAnimation} 2s infinite;
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ModelTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f2937'};
  
  .icon {
    color: #2997ff;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(41, 151, 255, 0.15)' : 'rgba(41, 151, 255, 0.1)'};
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
  color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

// 提示词区域 (可折叠)
const PromptPreview = styled.div`
  font-size: 13px;
  color: ${props => props.theme.mode === 'dark' ? '#aaa' : '#555'};
  line-height: 1.5;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#f3f4f6'};
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed ${props => props.theme.mode === 'dark' ? '#333' : '#eee'};
  
  .status-text {
    font-size: 12px;
    font-weight: 500;
    color: #2997ff;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .progress-track {
    flex: 1;
    height: 4px;
    background: ${props => props.theme.mode === 'dark' ? '#333' : '#eee'};
    border-radius: 2px;
    overflow: hidden;
    
    .bar {
      height: 100%;
      background: #2997ff;
      width: 60%; /* 模拟进度 */
      border-radius: 2px;
      animation: progress 2s ease-in-out infinite;
    }
  }
  
  @keyframes progress {
    0% { width: 0%; margin-left: 0; }
    50% { width: 100%; margin-left: 0; }
    100% { width: 0%; margin-left: 100%; }
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ff4d4f;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s;
  
  &:hover {
    background: #ff7875;
    transform: scale(1.1);
  }
`;

// ==========================================
// 2. 逻辑组件
// ==========================================

export interface WaitingTask {
  taskId: string;
  modelName: string;
  prompt: string;
  submitTime: string;
  aspectRatio?: string;
  duration?: number;
}

interface WaitingTaskQueueProps {
  open: boolean;
  onClose: () => void;
  tasks: WaitingTask[];
  onCancelTask: (taskId: string) => void;
}

const WaitingTaskQueue: React.FC<WaitingTaskQueueProps> = ({
  open,
  onClose,
  tasks,
  onCancelTask,
}) => {
  const intl = useIntl();
  
  return (
    <StyledDrawer
      title={
        <QueueHeader>
          <span>
            <FormattedMessage 
              id="create.waitingTask.queue" 
              defaultMessage="任务队列" 
            />
          </span>
          <span className="count-badge">{tasks.length}</span>
        </QueueHeader>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
    >
      {tasks.length === 0 ? (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
          <p style={{ color: '#999', marginTop: 16 }}>
            <FormattedMessage 
              id="create.waitingTask.empty" 
              defaultMessage="暂无进行中的任务" 
            />
          </p>
        </div>
      ) : (
        <div style={{ paddingBottom: 24 }}>
          <AnimatePresence>
            {tasks.map((task, index) => (
              <TaskItemWrapper
                key={task.taskId}
                className={index === 0 ? 'processing' : ''} // 假设第一个正在处理
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskHeader>
                  <ModelTag>
                    <div className="icon"><CodeSandboxOutlined /></div>
                    {task.modelName}
                  </ModelTag>
                  <TimeInfo>
                    <ClockCircleOutlined /> {dayjs(task.submitTime).format('HH:mm')}
                  </TimeInfo>
                </TaskHeader>

                {task.prompt && (
                  <PromptPreview>
                    <FileTextOutlined style={{ marginRight: 6, opacity: 0.7 }} />
                    {task.prompt}
                  </PromptPreview>
                )}

                <StatusBar>
                  <div className="status-text">
                    <LoadingOutlined />
                    {index === 0 ? (
                      <FormattedMessage 
                        id="create.waitingTask.generating" 
                        defaultMessage="生成中..." 
                      />
                    ) : (
                      <FormattedMessage 
                        id="create.waitingTask.queued" 
                        defaultMessage="排队中" 
                      />
                    )}
                  </div>
                  {index === 0 && (
                    <div className="progress-track">
                      <div className="bar" />
                    </div>
                  )}
                </StatusBar>

                <Tooltip title={intl.formatMessage({ id: 'create.waitingTask.cancel', defaultMessage: '取消任务' })}>
                  <DeleteButton 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelTask(task.taskId);
                    }}
                  >
                    <CloseOutlined style={{ fontSize: 14 }} />
                  </DeleteButton>
                </Tooltip>
              </TaskItemWrapper>
            ))}
          </AnimatePresence>
        </div>
      )}
    </StyledDrawer>
  );
};

export default WaitingTaskQueue;