import React from 'react';
import { Progress, Tooltip, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { formatFileSize, formatSpeed, getEllipsisFileName } from 'utils/format';
import { DownloadItemWrapper, IconButton } from './styles';
import { DownloadItemProps } from './types';

const { Text } = Typography;

/**
 * 下载项组件
 * 显示单个下载项的详细信息，包括：
 * - 文件名（带省略号处理）
 * - 下载进度条
 * - 已下载大小/总大小
 * - 下载速度或状态信息
 * - 取消下载按钮（仅在下载中状态显示）
 */
const DownloadItem: React.FC<DownloadItemProps> = ({ download, onCancel }) => {
  return (
    <DownloadItemWrapper>
      {/* 文件名和取消按钮 */}
      <div className="item-header">
        <Tooltip title={download.filename}>
          <Text className="filename">{getEllipsisFileName(download.filename)}</Text>
        </Tooltip>
        {download.status === 'downloading' && onCancel && (
          <IconButton
            type="text"
            icon={<CloseOutlined />}
            onClick={() => onCancel(download.id)}
          />
        )}
      </div>

      {/* 进度条和下载大小信息 */}
      <div className="item-progress">
        <Progress
          percent={download.progress}
          status={download.status === 'error' ? 'exception' : undefined}
          strokeColor={download.status === 'completed' ? '#52c41a' : undefined}
          size="small"
        />
        {download.status === 'downloading' && (
          <div className="download-size">
            <span>{formatFileSize(download.loadedBytes)}</span>
            <span className="size-divider">/</span>
            <span>{formatFileSize(download.totalBytes)}</span>
          </div>
        )}
      </div>

      {/* 下载状态和速度信息 */}
      <div className="item-info">
        <span>
          {download.status === 'downloading' && formatSpeed(download.speed)}
          {download.status === 'completed' && '已完成'}
          {download.status === 'error' && '下载失败'}
        </span>
        {download.status !== 'downloading' && (
          <span>{formatFileSize(download.totalBytes)}</span>
        )}
      </div>
    </DownloadItemWrapper>
  );
};

export default DownloadItem; 