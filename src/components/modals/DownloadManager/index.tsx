import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DownloadContainer, MOBILE_BREAKPOINT } from './styles';
import DownloadHeader from './DownloadHeader';
import DownloadList from './DownloadList';
import DownloadBubble from './DownloadBubble';
import { DownloadManagerProps } from './types';

/**
 * 下载管理器组件
 * 一个可拖拽、可最小化的下载管理面板
 * 
 * 功能特点：
 * - 支持拖拽移动位置
 * - 支持最小化/展开
 * - 响应式布局（移动端/桌面端）
 * - 支持折叠/展开下载列表
 * - 实时显示下载进度和状态
 * - 支持取消下载和清除已完成项目
 * 
 * 状态管理：
 * - collapsed: 是否折叠下载列表
 * - minimized: 是否最小化为气泡
 * - position: 面板位置（拖拽后）
 * - expanded: 移动端是否展开
 * - isDragging: 是否正在拖拽
 */
const DownloadManager: React.FC<DownloadManagerProps> = ({
  downloads,
  onCancel,
  onClear,
  onCollapse: onCollapseCallback,
}) => {
  // DOM 引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 状态管理
  const [collapsed, setCollapsed] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState<{ x: string; y: string; } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 拖拽相关的引用
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const initialStateRef = useRef({ minimized: false, collapsed: true, expanded: false });
  
  // 下载项分类
  const activeDownloads = downloads.filter(d => d.status === 'downloading');
  const completedDownloads = downloads.filter(d => ['completed', 'error'].includes(d.status));
  
  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 自动折叠/展开处理
  useEffect(() => {
    const hasDownloads = activeDownloads.length > 0 || completedDownloads.length > 0;
    if (!hasDownloads) {
      setCollapsed(true);
      if (onCollapseCallback) {
        onCollapseCallback(true);
      }
    } else if (activeDownloads.length > 0) {
      setCollapsed(false);
      if (onCollapseCallback) {
        onCollapseCallback(false);
      }
    }
  }, [activeDownloads.length, completedDownloads.length, onCollapseCallback]);

  /**
   * 处理折叠/展开
   * 移动端和桌面端行为不同
   */
  const handleCollapse = () => {
    if (isMobile) {
      setExpanded(!expanded);
    } else {
      setCollapsed(!collapsed);
      if (onCollapseCallback) {
        onCollapseCallback(!collapsed);
      }
    }
  };

  /**
   * 更新容器尺寸
   * 用于计算拖拽边界
   */
  const updateContainerSize = useCallback(() => {
    if (containerRef.current) {
      containerSizeRef.current = {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      };
    }
  }, []);

  // 在最小化状态改变时更新容器尺寸
  useEffect(() => {
    updateContainerSize();
  }, [minimized, updateContainerSize]);

  /**
   * 处理鼠标按下事件
   * 初始化拖拽状态
   */
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.actions')) return;
    
    setIsDragging(true);
    initialStateRef.current = {
      minimized,
      collapsed,
      expanded
    };
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    dragOffsetRef.current = {
      x: clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left,
      y: clientY - (e.currentTarget as HTMLElement).getBoundingClientRect().top
    };
  };

  /**
   * 处理鼠标移动事件
   * 计算并更新面板位置
   */
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    let x = clientX - dragOffsetRef.current.x;
    let y = clientY - dragOffsetRef.current.y;
    
    // 限制拖拽范围
    const maxX = window.innerWidth - containerSizeRef.current.width;
    const maxY = window.innerHeight - containerSizeRef.current.height;
    
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    
    // 使用 requestAnimationFrame 优化性能
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      if (x !== lastPositionRef.current.x || y !== lastPositionRef.current.y) {
        lastPositionRef.current = { x, y };
        setPosition({
          x: `${x}px`,
          y: `${y}px`
        });
      }
    });
  }, [isDragging]);

  /**
   * 处理鼠标松开事件
   * 结束拖拽状态
   */
  const handleMouseUp = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setIsDragging(false);
    setMinimized(initialStateRef.current.minimized);
    setCollapsed(initialStateRef.current.collapsed);
    setExpanded(initialStateRef.current.expanded);
  }, []);

  // 添加和移除拖拽事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: true });
      document.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  /**
   * 处理最小化/还原
   */
  const handleMinimize = () => {
    setMinimized(!minimized);
    if (!minimized) {
      setCollapsed(true);
      setExpanded(false);
      if (onCollapseCallback) {
        onCollapseCallback(true);
      }
    }
  };

  // 最小化状态显示气泡
  if (minimized) {
    return (
      <DownloadContainer 
        ref={containerRef}
        isMobile={isMobile} 
        minimized={minimized}
        position={position}
      >
        <DownloadBubble
          activeDownloadsCount={activeDownloads.length}
          onMinimize={handleMinimize}
          onMouseDown={handleMouseDown}
        />
      </DownloadContainer>
    );
  }

  // 正常状态显示完整面板
  return (
    <DownloadContainer 
      ref={containerRef}
      isMobile={isMobile} 
      expanded={expanded} 
      collapsed={collapsed}
      position={position}
    >
      <DownloadHeader 
        activeDownloads={activeDownloads.length}
        completedDownloads={completedDownloads.length}
        onClear={onClear}
        onMinimize={handleMinimize}
        onCollapse={handleCollapse}
        isMobile={isMobile}
        expanded={expanded}
        collapsed={collapsed}
        onMouseDown={handleMouseDown}
      />
      {!collapsed && (
        <DownloadList
          activeDownloads={activeDownloads}
          completedDownloads={completedDownloads}
          onCancel={onCancel}
        />
      )}
    </DownloadContainer>
  );
};

export default DownloadManager; 