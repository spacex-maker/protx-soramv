import styled from 'styled-components';
import { Button } from 'antd';

/** 移动设备断点宽度 */
export const MOBILE_BREAKPOINT = 768;

/**
 * 下载管理器容器组件
 * 支持拖拽、最小化、响应式布局
 */
export const DownloadContainer = styled.div<{
  /** 容器位置，用于拖拽功能 */
  position?: { x: string; y: string; } | null;
  /** 是否折叠 */
  collapsed?: boolean;
  /** 是否最小化 */
  minimized?: boolean;
  /** 是否为移动设备 */
  isMobile?: boolean;
  /** 是否展开（移动设备） */
  expanded?: boolean;
  /** 主题配置 */
  theme?: { mode: 'dark' | 'light' };
}>`
  position: fixed;
  top: ${props => props.position ? props.position.y : 'auto'};
  left: ${props => props.position ? props.position.x : 'auto'};
  bottom: ${props => props.position ? 'auto' : (props.collapsed ? '80px' : '100px')};
  right: ${props => props.position ? 'auto' : '20px'};
  width: ${props => props.minimized ? '56px' : (
    props.isMobile && props.expanded ? 'calc(100% - 40px)' : '360px'
  )};
  max-width: ${props => props.minimized ? '56px' : 'calc(100% - 40px)'};
  height: ${props => props.minimized ? '56px' : 'auto'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.1)' 
    : 'rgba(255, 255, 255, 0.2)'};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};
  border-radius: ${props => props.minimized ? '50%' : '12px'};
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.08)'};
  z-index: 1000;
  transition: none;
  color: var(--ant-color-text);
  user-select: none;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  overflow: hidden;
`;

/**
 * 下载管理器头部组件样式
 * 包含标题和操作按钮
 */
export const DownloadHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};
  cursor: move;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  
  .title {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
`;

/**
 * 下载列表容器组件样式
 * 支持滚动和自定义滚动条样式
 */
export const DownloadListWrapper = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.15)'};
    border-radius: 3px;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(0, 0, 0, 0.25)'};
    }
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 3px;
  }
`;

/**
 * 下载项组件样式
 * 包含文件名、进度条和状态信息
 */
export const DownloadItemWrapper = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  margin-bottom: 8px;
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.03)'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.03)'};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .filename {
      font-weight: 500;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 12px;
    }
  }
  
  .item-progress {
    margin-bottom: 4px;
  }
  
  .item-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--ant-color-text-secondary);
  }

  .download-size {
    font-size: 12px;
    color: var(--ant-color-text-secondary);
    margin-top: 2px;
    display: flex;
    justify-content: flex-end;
  }

  .size-divider {
    margin: 0 4px;
    color: var(--ant-color-text-quaternary);
  }
`;

/**
 * 操作按钮组件样式
 * 用于最小化、折叠等操作
 */
export const IconButton = styled(Button)`
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.ant-btn-text {
    color: var(--ant-color-text);
    
    &:hover {
      background: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.06)'};
    }
    
    &:active {
      background: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.16)'
        : 'rgba(0, 0, 0, 0.08)'};
    }
  }
`;

/**
 * 最小化状态下的下载气泡组件样式
 * 显示下载数量和图标
 */
export const DownloadBubbleWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .download-count {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--ant-color-primary);
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    padding: 0 4px;
  }
  
  .download-icon {
    font-size: 24px;
    color: var(--ant-color-text);
  }
`; 