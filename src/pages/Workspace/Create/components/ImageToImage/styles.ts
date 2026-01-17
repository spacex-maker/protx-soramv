import styled, { createGlobalStyle } from 'styled-components';
import { Card, Select, Button } from 'antd';

// 全局下拉菜单样式
export const GlobalSelectStyles = createGlobalStyle`
  /* 下拉框输入框圆角 */
  .ant-select {
    .ant-select-selector {
      border-radius: 12px !important;
    }
    
    &.ant-select-focused .ant-select-selector {
      border-radius: 12px !important;
    }
  }
  
  /* 模型家族选择框显示区域样式 */
  .model-family-select {
    .ant-select-selector {
      padding: 0 !important;
      min-height: 65px !important;
      display: flex !important;
      align-items: center !important;
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
      line-height: 65px !important;
    }
    
    /* 确保显示内容正确对齐 */
    .ant-select-selection-item > * {
      width: 100%;
    }
  }
  
  /* 艺术风格选择框显示区域样式 */
  .model-style-select {
    .ant-select-selector {
      padding: 0 !important;
      min-height: 65px !important;
      display: flex !important;
      align-items: center !important;
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
      line-height: 65px !important;
    }
    
    /* 确保显示内容正确对齐 */
    .ant-select-selection-item > * {
      width: 100%;
    }
  }
  
  /* 模型图片选择框显示区域样式 */
  .model-image-select {
    .ant-select-selector {
      padding: 0 !important;
      min-height: 65px !important;
      display: flex !important;
      align-items: center !important;
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
      line-height: 65px !important;
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
      
      &:first-child {
        margin-top: 0 !important;
      }
      
      &:last-child {
        margin-bottom: 0 !important;
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
  
  /* 提示词输入框标签样式 - 确保按钮靠右 */
  .prompt-form-item {
    .ant-form-item-label {
      width: 100% !important;
      max-width: 100% !important;
      
      > label {
        width: 100% !important;
        max-width: 100% !important;
      }
    }
    
    .prompt-label-wrapper {
      display: flex !important;
      align-items: center !important;
      width: 100% !important;
      justify-content: space-between !important;
      
      .prompt-button-wrapper {
        margin-left: auto !important;
        flex-shrink: 0 !important;
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

export const ImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);

  img {
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

// 图片上传相关样式
export const InputImageContainer = styled.div`
  width: 100%;
  height: 260px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: transparent;

  &:hover .overlay-actions {
    opacity: 1;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    width: auto !important; 
    height: auto !important;
    object-fit: contain; 
    display: block;
    border-radius: 12px;
  }
`;

export const OverlayActions = styled.div`
  position: absolute;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
`;

export const CustomUploadArea = styled.div<{ $isDark?: boolean; $isDragging?: boolean }>`
  width: 100%;
  height: 260px;
  border-radius: 12px;
  border: 1px dashed ${props => props.$isDark ? '#444' : '#d9d9d9'};
  background: ${props => props.$isDark ? '#1f1f1f' : '#fafafa'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.$isDragging && `
    border-color: #1890ff;
    background: ${props.$isDark ? '#2a2a2a' : '#f0f7ff'};
  `}
  
  &:hover {
    border-color: #1890ff;
  }
  
  input[type="file"] {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

export const UploadIcon = styled.div<{ $isDark?: boolean }>`
  margin-bottom: 16px;
  color: #1890ff;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const UploadText = styled.div<{ $isDark?: boolean }>`
  color: ${props => props.$isDark ? '#fff' : '#333'};
  font-size: 16px;
  margin-bottom: 8px;
`;

export const UploadHint = styled.div<{ $isDark?: boolean }>`
  color: ${props => props.$isDark ? '#999' : '#999'};
  font-size: 12px;
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
export const ModelSelectDisplay = styled.div<{ coverImage?: string | null }>`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  padding: 10px 12px;
  min-height: 65px;
  height: 100%;
  width: 100%;
  
  /* 背景图样式：从右到左渐变透明，显示右边部分 */
  ${(props) =>
    props.coverImage
      ? `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 40%;
      max-width: 40%;
      background-image: url(${props.coverImage});
      background-size: cover;
      background-position: center right;
      background-repeat: no-repeat;
      z-index: 0;
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
  
  /* 确保内容在背景图之上 */
  > * {
    position: relative;
    z-index: 1;
  }
  
  /* 图片元素不应该显示，因为使用 CSS 背景图 */
  .cover-image {
    display: none !important;
  }
  
  /* 视频元素需要显示，因为 CSS background-image 不支持视频 */
  .cover-video {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 40%;
    max-width: 40%;
    height: 100%;
    object-fit: cover;
    object-position: center right;
    z-index: 0;
    border-radius: 0 8px 8px 0;
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
  
  .model-display-free {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(24, 144, 255, 0.1)'
        : 'rgba(24, 144, 255, 0.06)'};
    font-weight: 600;
    font-size: 12px;
    color: #1890ff;
    line-height: 1.2;
    flex-shrink: 0;
  }
`;

export const ModelOptionWrapper = styled.div<{ coverImage?: string | null }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  min-height: 80px;
  height: 100%;
  padding: 12px;
  width: 100%;
  
  /* 背景图样式：从右到左渐变透明，显示右边部分 */
  ${(props) =>
    props.coverImage
      ? `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 45%;
      max-width: 45%;
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
  
  /* 确保内容在背景图之上 */
  > * {
    position: relative;
    z-index: 1;
  }
  
  /* 图片元素不应该显示，因为使用 CSS 背景图 */
  .cover-image {
    display: none !important;
  }
  
  /* 视频元素需要显示，因为 CSS background-image 不支持视频 */
  .cover-video {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 45%;
    max-width: 45%;
    height: 100%;
    object-fit: cover;
    object-position: center right;
    z-index: 0;
    border-radius: 0 8px 8px 0;
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
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .model-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    gap: 8px;
  }

  .model-aspect-ratios {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
  }

  .model-detail-button {
    flex-shrink: 0;
    opacity: 1;
    transition: opacity 0.3s ease, transform 0.2s ease;
    
    &:hover {
      opacity: 1;
      transform: scale(1.05);
    }
  }
`;

export const DetailButton = styled(Button)`
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 14px;
  background: ${(props) =>
    props.theme.mode === 'dark'
      ? 'rgba(24, 144, 255, 0.35)'
      : 'rgba(24, 144, 255, 0.2)'};
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(24, 144, 255, 0.4)'
        : 'rgba(24, 144, 255, 0.35)'};
  color: #1890ff;
  
  &:hover {
    background: ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(24, 144, 255, 0.45)'
        : 'rgba(24, 144, 255, 0.3)'};
    border-color: #1890ff;
    color: #1890ff;
  }
  
  .anticon {
    font-size: 12px;
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

