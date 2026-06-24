import styled, { createGlobalStyle } from 'styled-components';
import { Card, Select, Button } from 'antd';

// Global select dropdown styles
export const GlobalSelectStyles = createGlobalStyle`
  /* Task queue button pulse animation */
  @keyframes taskQueuePulse {
    0%, 100% {
      box-shadow: 0 0 4px rgba(24, 144, 255, 0.4),
                  0 0 8px rgba(24, 144, 255, 0.2),
                  inset 0 0 2px rgba(24, 144, 255, 0.1);
      border-color: rgba(24, 144, 255, 0.6);
    }
    50% {
      box-shadow: 0 0 8px rgba(24, 144, 255, 0.7),
                  0 0 16px rgba(24, 144, 255, 0.4),
                  0 0 24px rgba(24, 144, 255, 0.2),
                  inset 0 0 4px rgba(24, 144, 255, 0.2);
      border-color: rgba(24, 144, 255, 0.9);
    }
  }
  
  .task-queue-button-active {
    animation: taskQueuePulse 2s ease-in-out infinite;
    border: 1px solid rgba(24, 144, 255, 0.6) !important;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(24, 144, 255, 0.02) 100%) !important;
    
    &:hover {
      animation: taskQueuePulse 1.5s ease-in-out infinite;
      border-color: rgba(24, 144, 255, 0.8) !important;
    }
  }

  /* Select input border radius */
  .ant-select {
    .ant-select-selector {
      border-radius: 12px !important;
      overflow: hidden !important;
    }

    &.ant-select-focused .ant-select-selector,
    &:hover .ant-select-selector {
      border-radius: 12px !important;
      overflow: hidden !important;
    }
  }
  
  /* 涓嬫媺閫夐」瀹瑰櫒鍦嗚 */
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
    
    /* 鍙拡瀵规ā鍨嬮€夋嫨涓嬫媺妗嗚缃珮搴﹀拰padding */
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

export const EmbedControlPanel = styled.div`
  padding: 8px 16px 12px 8px;

  .ant-form-item {
    margin-bottom: 22px;
  }

  .ant-form-item-label > label {
    height: auto;
    white-space: normal;
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

// 鍥剧墖涓婁紶鐩稿叧鏍峰紡
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
  
  /* 鑳屾櫙鍥炬牱寮忥細浠庡彸鍒板乏娓愬彉閫忔槑锛屾樉绀哄彸杈归儴鍒?*/
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
      background-size: auto 100%;
      background-position: right center;
      background-repeat: no-repeat;
      z-index: 0;
      mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%);
      transition: mask-image 0.3s ease, -webkit-mask-image 0.3s ease;
    }
    /* 娣诲姞鍗婇€忔槑鑳屾櫙灞傜‘淇濇枃瀛楀彲璇绘€?*/
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
    /* hover鏃跺浘鐗囧彉娓呮櫚 */
    &:hover::before {
      mask-image: linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%);
    }
    /* hover鏃跺噺灏戣儗鏅眰閫忔槑搴?*/
    &:hover::after {
      background: ${props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'};
    }
  `
      : ''}
  
  /* 瑙嗛鑳屾櫙瀹瑰櫒 */
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
  
  /* 纭繚鍐呭鍦ㄨ儗鏅浘涔嬩笂 */
  > * {
    position: relative;
    z-index: 1;
  }
  
  /* 瑙嗛鍏冪礌鏍峰紡 */
  .cover-video {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 45%;
    height: 100%;
    object-fit: cover;
    object-position: right center;
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
    padding-left: 26px;
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

