import React from 'react';
import { Button } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const QueueButton = styled(Button)`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const QueueBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4d4f;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid ${(p) => (p.theme.mode === 'dark' ? '#1f1f1f' : '#f9f9f9')};
`;

export interface VideoTaskQueueButtonProps {
  waitingCount: number;
  onOpen: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const VideoTaskQueueButton: React.FC<VideoTaskQueueButtonProps> = ({
  waitingCount,
  onOpen,
  className,
  style,
}) => (
  <QueueButton
    type="default"
    icon={<UnorderedListOutlined />}
    onClick={onOpen}
    className={[className, waitingCount > 0 ? 'task-queue-button-active' : ''].filter(Boolean).join(' ') || undefined}
    style={style}
  >
    <FormattedMessage id="create.video.taskQueue" defaultMessage="任务队列" />
    {waitingCount > 0 ? <QueueBadge>{waitingCount}</QueueBadge> : null}
  </QueueButton>
);

export default VideoTaskQueueButton;
