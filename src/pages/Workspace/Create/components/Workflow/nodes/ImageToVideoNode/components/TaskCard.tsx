import React from 'react';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { TaskCard as StyledTaskCard, TaskCardContent, TaskHeader, TaskModelName, TaskTime, TaskPrompt, TaskStatus } from '../styles';
import { TaskItem } from '../types';

interface TaskCardProps {
  task: TaskItem;
  index: number;
  totalTasks: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, totalTasks }) => {
  return (
    <StyledTaskCard 
      $status={task.status}
      className="nodrag"
      style={{ 
        position: 'relative',
        zIndex: totalTasks - index,
        minHeight: '120px',
      }}
    >
      <TaskCardContent>
        <TaskHeader>
          <TaskModelName>{task.modelName}</TaskModelName>
          <TaskTime>{new Date(task.submitTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</TaskTime>
        </TaskHeader>
        {task.prompt && (
          <TaskPrompt>{task.prompt}</TaskPrompt>
        )}
        <TaskStatus $status={task.status}>
          {task.status === 'processing' && <LoadingOutlined spin />}
          {task.status === 'completed' && <CheckCircleOutlined />}
          {task.status === 'failed' && <CloseCircleOutlined />}
          {task.status === 'queued' && <ClockCircleOutlined />}
          <span>
            {task.status === 'queued' && '排队中'}
            {task.status === 'processing' && '生成中...'}
            {task.status === 'completed' && '已完成'}
            {task.status === 'failed' && '生成失败'}
          </span>
        </TaskStatus>
      </TaskCardContent>
    </StyledTaskCard>
  );
};

