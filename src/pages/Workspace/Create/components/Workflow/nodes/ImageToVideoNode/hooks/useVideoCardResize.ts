import { useState, useRef, useCallback, useEffect } from 'react';

interface ResizeState {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export const useVideoCardResize = () => {
  const [videoCardSize, setVideoCardSize] = useState<{ width: number; height?: number }>({ width: 200 });
  const [isResizing, setIsResizing] = useState(false);
  const videoCardRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 处理视频卡片拖拽调整大小 - 使用业界标准的 Pointer Events API
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 如果已经在调整大小，先清理
    if (resizeStateRef.current) {
      handleResizeEnd();
    }
    
    const element = videoCardRef.current;
    if (!element) return;
    
    // 获取初始状态
    const rect = element.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = videoCardSize.width;
    const startHeight = videoCardSize.height || rect.height;
    
    // 设置约束
    const minWidth = 200;
    const maxWidth = 1200;
    const minHeight = 150;
    const maxHeight = 800;
    
    resizeStateRef.current = {
      startX,
      startY,
      startWidth,
      startHeight,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
    };
    
    setIsResizing(true);
    
    // 设置指针捕获，确保即使指针移出元素也能继续跟踪
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    
    // 设置全局样式
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    
    // 添加事件监听器
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!resizeStateRef.current) return;
      
      moveEvent.preventDefault();
      
      const state = resizeStateRef.current;
      const deltaX = moveEvent.clientX - state.startX;
      const deltaY = moveEvent.clientY - state.startY;
      
      // 使用 requestAnimationFrame 优化性能
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      rafIdRef.current = requestAnimationFrame(() => {
        if (!resizeStateRef.current) return;
        
        // 计算新尺寸
        const newWidth = Math.max(
          state.minWidth,
          Math.min(state.maxWidth, state.startWidth + deltaX)
        );
        const newHeight = Math.max(
          state.minHeight,
          Math.min(state.maxHeight, state.startHeight + deltaY)
        );
        
        setVideoCardSize({ width: newWidth, height: newHeight });
      });
    };
    
    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.preventDefault();
      
      // 释放指针捕获
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      
      handleResizeEnd();
    };
    
    // 存储事件处理器以便清理
    (resizeStateRef.current as any).handlePointerMove = handlePointerMove;
    (resizeStateRef.current as any).handlePointerUp = handlePointerUp;
    
    // 添加全局事件监听器
    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp, { passive: false, once: true });
    document.addEventListener('pointercancel', handlePointerUp, { passive: false, once: true });
    
    // 窗口失去焦点时也停止
    const handleBlur = () => {
      handleResizeEnd();
    };
    window.addEventListener('blur', handleBlur, { once: true });
    (resizeStateRef.current as any).handleBlur = handleBlur;
  }, [videoCardSize]);

  // 结束调整大小
  const handleResizeEnd = useCallback(() => {
    const state = resizeStateRef.current;
    if (!state) return;
    
    // 清理事件监听器
    const handlePointerMove = (state as any).handlePointerMove;
    const handlePointerUp = (state as any).handlePointerUp;
    const handleBlur = (state as any).handleBlur;
    
    if (handlePointerMove) {
      document.removeEventListener('pointermove', handlePointerMove);
    }
    if (handlePointerUp) {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    }
    if (handleBlur) {
      window.removeEventListener('blur', handleBlur);
    }
    
    // 取消动画帧
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // 恢复样式
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
    
    // 清理状态
    resizeStateRef.current = null;
    setIsResizing(false);
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      handleResizeEnd();
    };
  }, [handleResizeEnd]);

  return {
    videoCardSize,
    isResizing,
    videoCardRef,
    handleResizeStart,
  };
};

