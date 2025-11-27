import styled, { createGlobalStyle } from 'styled-components';
import { Card, Select } from 'antd';

// 全局下拉菜单样式
export const GlobalSelectStyles = createGlobalStyle`
  /* 下拉框输入框圆角 */
  .ant-select {
    .ant-select-selector {
      border-radius: 12px !important;
      overflow: hidden !important;
    }
    
    &.ant-select-focused .ant-select-selector {
      border-radius: 12px !important;
      overflow: hidden !important;
    }
    
    &:hover .ant-select-selector {
      border-radius: 12px !important;
      overflow: hidden !important;
    }
  }
  
  /* 模型选择框显示区域样式 */
  .model-video-select {
    margin-bottom: 24px !important;
    
    .ant-select-selector {
      padding: 0 !important;
      min-height: 75px !important;
      display: flex !important;
      align-items: center !important;
      border-radius: 12px !important;
      overflow: hidden !important;
    }
    
    &.ant-select-focused .ant-select-selector {
      border-radius: 12px !important;
      overflow: hidden !important;
    }
    
    &:hover .ant-select-selector {
      border-radius: 12px !important;
      overflow: hidden !important;
    }
    
    .ant-select-selection-item {
      padding: 0 !important;
      height: auto !important;
      line-height: normal !important;
      display: flex !important;
      align-items: center !important;
      width: 100% !important;
      overflow: visible !important;
    }
    
    .ant-select-selection-placeholder {
      padding: 0 11px !important;
      line-height: 75px !important;
    }
    
    /* 确保显示内容正确对齐 */
    .ant-select-selection-item > * {
      width: 100%;
    }
  }
  
  /* 下拉选项容器圆角 */
  .ant-select-dropdown {
    border-radius: 12px !important;
    overflow: hidden !important;
    padding: 4px !important;
    
    .rc-virtual-list {
      border-radius: 12px;
    }
    
    .rc-virtual-list-holder {
      border-radius: 12px;
    }
    
    .ant-select-item {
      border-radius: 8px !important;
      margin: 2px 0 !important;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      
      &:first-child {
        margin-top: 0 !important;
      }
      
      &:last-child {
        margin-bottom: 0 !important;
      }
      
      &.ant-select-item-option {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
      
      &.ant-select-item-option-active {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
      
      &.ant-select-item-option-selected {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
      
      &:hover {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
    }
    
    /* 只针对模型选择下拉框设置高度和padding */
    &.model-select-dropdown {
      .ant-select-item {
        padding: 0 !important;
        min-height: 80px !important;
        height: auto !important;
        
        .ant-select-item-option-content {
          height: 100%;
          min-height: 80px;
          display: block;
          padding: 0 !important;
        }
      }
    }
  }
`;

export const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  
  .ant-card-body {
    padding: 24px;
  }
`;

export const ResultArea = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f9f9f9'};
  border-radius: 12px;
  padding: 20px;
  min-height: 550px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
  position: relative;
`;

export const VideoPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }
`;

export const ActionOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
`;

export const AspectRatioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .anticon {
    font-size: 16px;
    color: #1890ff;
  }
`;

// 模型选择框显示组件（用于 Select 的显示框）
export const ModelSelectDisplay = styled.div<{ coverImage?: string | null; isVideo?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  padding: 12px 12px;
  min-height: 75px;
  height: 100%;
  
  /* 背景图样式：从右到左渐变透明，显示右边部分 */
  ${(props) =>
    props.coverImage && !props.isVideo
      ? `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 40%;
      background-image: url(${props.coverImage});
      background-size: cover;
      background-position: center right;
      background-repeat: no-repeat;
      z-index: 0;
      border-radius: 0 12px 12px 0;
      mask-image: linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%);
    }
    /* 添加半透明背景层确保文字可读性 */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: ${props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)'};
      z-index: 0;
      pointer-events: none;
    }
  `
      : ''}
  
  /* 视频背景容器 */
  ${(props) =>
    props.coverImage && props.isVideo
      ? `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: ${props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)'};
      z-index: 0;
      pointer-events: none;
    }
  `
      : ''}
  
  /* 确保内容在背景图之上 */
  > * {
    position: relative;
    z-index: 1;
  }
  
  /* 视频元素样式 */
  .cover-video {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 40%;
    object-fit: cover;
    z-index: 0;
    border-radius: 0 12px 12px 0;
    mask-image: linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%);
    -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%);
    pointer-events: none;
  }
  
  .model-display-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }
  
  .model-display-name {
    font-weight: 600;
    font-size: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.3px;
    background-size: 200% auto;
    animation: gradient-shift 3s ease infinite;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% center;
    }
    50% {
      background-position: 100% center;
    }
  }
  
  .model-display-code {
    font-size: 11px;
    color: #999;
    white-space: nowrap;
  }
  
  .model-display-price {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    margin-left: auto;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.06)'};
    flex-shrink: 0;
  }
  
  .model-display-price-amount {
    font-weight: 600;
    font-size: 13px;
    color: #52c41a;
    line-height: 1.2;
  }
  
  .model-display-price-currency {
    font-weight: 500;
    font-size: 10px;
    color: #8c8c8c;
    margin-left: 1px;
  }
  
  .model-display-price-unit {
    font-weight: 400;
    font-size: 9px;
    color: #bfbfbf;
    margin-left: 2px;
  }
`;

export const ModelOptionWrapper = styled.div<{ coverImage?: string | null; isVideo?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  min-height: 80px;
  height: 100%;
  padding: 12px;
  
  /* 背景图样式：从右到左渐变透明，显示右边部分 */
  ${(props) =>
    props.coverImage && !props.isVideo
      ? `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 45%;
      background-image: url(${props.coverImage});
      background-size: cover;
      background-position: center right;
      background-repeat: no-repeat;
      z-index: 0;
      mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%);
      transition: mask-image 0.3s ease, -webkit-mask-image 0.3s ease;
    }
    /* 添加半透明背景层确保文字可读性 */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: ${props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.4)'};
      z-index: 0;
      pointer-events: none;
      transition: background 0.3s ease;
    }
    /* hover时图片变清晰 */
    &:hover::before {
      mask-image: linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%);
    }
    /* hover时减少背景层透明度 */
    &:hover::after {
      background: ${props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'};
    }
  `
      : ''}
  
  /* 视频背景容器 */
  ${(props) =>
    props.coverImage && props.isVideo
      ? `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: ${props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.4)'};
      z-index: 0;
      pointer-events: none;
    }
  `
      : ''}
  
  /* 确保内容在背景图之上 */
  > * {
    position: relative;
    z-index: 1;
  }
  
  /* 视频元素样式 */
  .cover-video {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 45%;
    object-fit: cover;
    z-index: 0;
    mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%);
    -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%);
    pointer-events: none;
  }
  
  .model-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  
  .model-name {
    font-weight: 700;
    font-size: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.5px;
    background-size: 200% auto;
    animation: gradient-shift 3s ease infinite;
  }
  
  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% center;
    }
    50% {
      background-position: 100% center;
    }
  }
  
  .model-price {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    margin-left: auto;
    padding: 2px 8px;
    border-radius: 4px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.06)'};
  }
  
  .model-price-amount {
    font-weight: 700;
    font-size: 16px;
    color: #52c41a;
    line-height: 1.2;
  }
  
  .model-price-currency {
    font-weight: 500;
    font-size: 11px;
    color: #8c8c8c;
    margin-left: 1px;
  }
  
  .model-price-unit {
    font-weight: 400;
    font-size: 10px;
    color: #bfbfbf;
    margin-left: 2px;
  }
  
  .model-code {
    font-size: 12px;
    color: #999;
  }
  
  .model-description {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
    line-height: 1.4;
  }
`;

export const AspectRatioTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#f0f0f0'};
  border-radius: 16px;
  font-size: 12px;
  margin: 4px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  
  .anticon {
    color: #1890ff;
    font-size: 14px;
  }
`;

export const ResolutionTag = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1a3a52' : '#e6f7ff'};
  border-radius: 16px;
  font-size: 12px;
  margin: 4px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#2a4a6a' : '#91d5ff'};
  color: ${props => props.theme.mode === 'dark' ? '#91d5ff' : '#1890ff'};
  font-weight: 500;
`;

// 历史记录相关样式
export const HistorySection = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
`;

export const HistoryTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  h4 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
`;

export const HistoryCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #1890ff;
  }
`;

export const HistoryVideoWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f5f5'};
  
  video, img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const HistoryStatusBadge = styled.div<{ status: number }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  ${props => {
    if (props.status === 2) {
      return `
        background: rgba(82, 196, 26, 0.2);
        color: #52c41a;
        border: 1px solid rgba(82, 196, 26, 0.3);
      `;
    } else if (props.status === 3 || props.status === 4) {
      return `
        background: rgba(255, 77, 79, 0.2);
        color: #ff4d4f;
        border: 1px solid rgba(255, 77, 79, 0.3);
      `;
    } else {
      return `
        background: rgba(24, 144, 255, 0.2);
        color: #1890ff;
        border: 1px solid rgba(24, 144, 255, 0.3);
      `;
    }
  }}
`;

export const HistoryInfo = styled.div`
  padding: 12px;
`;

export const HistoryModelName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#333'};
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HistoryTime = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
`;

export const HistoryEmpty = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
`;

// 等待任务显示区域
export const WaitingTaskCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e8e8e8'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1890ff, #52c41a, #1890ff);
    background-size: 200% 100%;
    animation: progress-bar 2s linear infinite;
  }
  
  @keyframes progress-bar {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const WaitingTaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const WaitingTaskTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#333'};
`;

export const WaitingTaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

export const WaitingTaskInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  
  .label {
    color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
    min-width: 60px;
  }
  
  .value {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#333'};
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const WaitingTaskPrompt = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f5f5'};
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: ${props => props.theme.mode === 'dark' ? '#ccc' : '#666'};
  max-height: 80px;
  overflow-y: auto;
  font-family: 'SF Mono', 'Menlo', monospace;
  white-space: pre-wrap;
  word-break: break-word;
`;

