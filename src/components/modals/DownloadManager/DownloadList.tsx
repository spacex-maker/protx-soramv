import React from 'react';
import { DownloadListWrapper } from './styles';
import DownloadItem from './DownloadItem';
import { DownloadListProps } from './types';

/**
 * 下载列表组件
 * 显示所有下载项，包括：
 * - 正在下载的项目（带进度条和取消按钮）
 * - 已完成的下载项目（显示完成状态）
 * 
 * 特点：
 * - 支持滚动加载
 * - 自定义滚动条样式
 * - 分组显示不同状态的下载项
 */
const DownloadList: React.FC<DownloadListProps> = ({
  activeDownloads,
  completedDownloads,
  onCancel,
}) => {
  return (
    <DownloadListWrapper>
      {/* 显示正在下载的项目 */}
      {activeDownloads.map((download) => (
        <DownloadItem
          key={download.id}
          download={download}
          onCancel={onCancel}
        />
      ))}

      {/* 显示已完成的下载项目 */}
      {completedDownloads.map((download) => (
        <DownloadItem
          key={download.id}
          download={download}
        />
      ))}
    </DownloadListWrapper>
  );
};

export default DownloadList; 