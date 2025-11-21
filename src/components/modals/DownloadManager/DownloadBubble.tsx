import React, { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { DownloadBubbleWrapper } from './styles';
import { DownloadBubbleProps } from './types';

/**
 * 下载气泡组件
 * 在下载管理器最小化时显示的悬浮图标
 * 
 * 功能：
 * - 显示下载图标
 * - 显示当前正在下载的数量（如果有）
 * - 支持点击展开
 * - 支持拖拽
 * 
 * 交互：
 * - 点击时恢复下载管理器
 * - 可以通过拖拽改变位置
 * - 显示下载数量的小红点
 */
const DownloadBubble: React.FC<DownloadBubbleProps> = ({
  activeDownloadsCount,
  onMinimize,
  onMouseDown,
}) => {
  // 用于判断是否发生了拖动
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setStartPos({ x: clientX, y: clientY });
    setIsDragging(false);
    onMouseDown(e);
  };

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - startPos.x, 2) + 
      Math.pow(e.clientY - startPos.y, 2)
    );
    
    // 如果移动距离小于 5px，认为是点击而不是拖动
    if (moveDistance < 5) {
      onMinimize();
    }
  };

  return (
    <DownloadBubbleWrapper
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* 下载图标 */}
      <DownloadOutlined className="download-icon" />

      {/* 下载数量指示器 */}
      {activeDownloadsCount > 0 && (
        <div className="download-count">{activeDownloadsCount}</div>
      )}
    </DownloadBubbleWrapper>
  );
};

export default DownloadBubble; 