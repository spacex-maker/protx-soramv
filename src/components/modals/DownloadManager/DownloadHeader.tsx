import React from 'react';
import { DownloadOutlined, DeleteOutlined, MinusOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { DownloadHeaderWrapper, IconButton } from './styles';
import { DownloadHeaderProps } from './types';

/**
 * 下载管理器头部组件
 * 包含以下功能：
 * - 显示标题和当前下载数量
 * - 清除已完成下载按钮
 * - 最小化按钮
 * - 折叠/展开按钮
 * - 支持拖拽功能
 * - 响应式布局（移动端/桌面端）
 */
const DownloadHeader: React.FC<DownloadHeaderProps> = ({
  activeDownloads,
  completedDownloads,
  onClear,
  onMinimize,
  onCollapse,
  isMobile,
  expanded,
  collapsed,
  onMouseDown,
}) => {
  return (
    <DownloadHeaderWrapper onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
      {/* 标题区域 */}
      <div className="title">
        <DownloadOutlined />
        Downloads {activeDownloads > 0 && `(${activeDownloads})`}
      </div>

      {/* 操作按钮区域 */}
      <div className="actions">
        {/* 清除按钮 - 仅在有下载项时显示 */}
        {(activeDownloads > 0 || completedDownloads > 0) && (
          <IconButton
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onClear}
            title="Clear completed"
          />
        )}

        {/* 最小化按钮 */}
        <IconButton
          type="text"
          icon={<MinusOutlined />}
          onClick={onMinimize}
          title="Minimize"
        />

        {/* 折叠/展开按钮 - 根据设备类型显示不同图标 */}
        <IconButton
          type="text"
          icon={isMobile ? (expanded ? <DownOutlined /> : <UpOutlined />) : (collapsed ? <UpOutlined /> : <DownOutlined />)}
          onClick={onCollapse}
          title={collapsed ? 'Expand' : 'Collapse'}
        />
      </div>
    </DownloadHeaderWrapper>
  );
};

export default DownloadHeader; 