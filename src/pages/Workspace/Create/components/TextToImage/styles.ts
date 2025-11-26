import styled, { createGlobalStyle } from 'styled-components';
import { Card, Button } from 'antd';

export const TitleSection = styled.div`
  margin-bottom: 8px;

  @media (max-width: 768px) {
    display: none;
  }
`;

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
  background: ${(props) =>
    props.theme.mode === 'dark' ? '#1f1f1f' : '#f9f9f9'};
  border-radius: 12px;
  padding: 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed
    ${(props) => (props.theme.mode === 'dark' ? '#444' : '#d9d9d9')};
  position: relative;
`;

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 100%;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
`;

export const ImageWrapper = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  max-width: 250px;
  margin: 0 auto;
  aspect-ratio: 1;

  &:hover {
    transform: translateY(-5px);
    .image-actions {
      opacity: 1;
    }
  }
`;

export const ImageActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.3s ease;
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
    background: ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(82, 196, 26, 0.1)'
        : 'rgba(82, 196, 26, 0.06)'};
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
  
  .model-free {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
    padding: 2px 8px;
    border-radius: 4px;
    background: ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(24, 144, 255, 0.1)'
        : 'rgba(24, 144, 255, 0.06)'};
    font-weight: 600;
    font-size: 14px;
    color: #1890ff;
    line-height: 1.2;
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
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    overflow-wrap: break-word;
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
  background: ${(props) =>
    props.theme.mode === 'dark' ? '#2a2a2a' : '#f0f0f0'};
  border-radius: 16px;
  font-size: 12px;
  margin: 4px;
  border: 1px solid
    ${(props) => (props.theme.mode === 'dark' ? '#444' : '#e0e0e0')};
  
  .anticon {
    color: #1890ff;
    font-size: 14px;
  }
`;

export const ResolutionTag = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: ${(props) =>
    props.theme.mode === 'dark' ? '#1a3a52' : '#e6f7ff'};
  border-radius: 16px;
  font-size: 12px;
  margin: 4px;
  border: 1px solid
    ${(props) => (props.theme.mode === 'dark' ? '#2a4a6a' : '#91d5ff')};
  color: ${(props) => (props.theme.mode === 'dark' ? '#91d5ff' : '#1890ff')};
  font-weight: 500;
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

// 生成记录区域样式
export const HistorySection = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid
    ${(props) => (props.theme.mode === 'dark' ? '#333' : '#e8e8e8')};
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
  background: ${(props) =>
    props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border: 1px solid
    ${(props) => (props.theme.mode === 'dark' ? '#333' : '#e8e8e8')};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #1890ff;
  }
`;

export const HistoryImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: ${(props) =>
    props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f5f5'};
  
  .ant-image {
    width: 100%;
    height: 100%;
    display: block;
    
    .ant-image-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }
  
  ${HistoryCard}:hover & {
    .ant-image-img {
      transform: scale(1.05);
    }
  }
`;

export const HistoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${HistoryCard}:hover & {
    transform: scale(1.05);
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
  
  ${(props) => {
    if (props.status === 2) {
      // 成功
      return `
        background: rgba(82, 196, 26, 0.2);
        color: #52c41a;
        border: 1px solid rgba(82, 196, 26, 0.3);
      `;
    } else if (props.status === 3 || props.status === 4) {
      // 失败或超时
      return `
        background: rgba(255, 77, 79, 0.2);
        color: #ff4d4f;
        border: 1px solid rgba(255, 77, 79, 0.3);
      `;
    } else {
      // 排队或进行中
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const HistoryModelName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#262626')};
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HistoryTime = styled.div`
  font-size: 11px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#8c8c8c' : '#8c8c8c')};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const HistoryActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;
`;

export const HistoryEmpty = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#8c8c8c' : '#8c8c8c')};
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
    background: ${(props) =>
      props.theme.mode === 'dark'
        ? 'rgba(82, 196, 26, 0.1)'
        : 'rgba(82, 196, 26, 0.06)'};
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

