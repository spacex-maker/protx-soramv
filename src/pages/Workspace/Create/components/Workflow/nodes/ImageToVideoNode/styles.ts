import styled from 'styled-components';
import { Button, Tag, Select, Slider, Input } from 'antd';
import { Handle } from '@xyflow/react';

const { TextArea } = Input;

export const NodeContainer = styled.div`
  min-width: 420px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 20px;
  overflow: visible;
  transition: border-color 0.2s;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#1890ff' : '#1890ff'};
  }
`;

export const DeleteButtonWrapper = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${NodeContainer}:hover & {
    opacity: 1;
  }
`;

export const DeleteButton = styled(Button)`
  width: 100%;
  height: 100%;
  min-width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ff4d4f;
  border: 1px solid #fff;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.2s, transform 0.2s;
  
  &:hover {
    background: #ff7875;
    transform: scale(1.1);
  }
  
  .anticon {
    font-size: 12px;
  }
`;

export const NodeHeader = styled.div`
  padding: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e8e8e8'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const NodeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

export const NodeIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  font-size: 20px;
`;

export const NodeName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
`;

export const NodeTag = styled(Tag)`
  margin: 0;
  font-size: 10px;
  padding: 2px 6px;
`;

export const CostInfo = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-top: 4px;
`;

export const NodeContent = styled.div`
  padding: 12px;
  
  input, textarea, select, button, .ant-select, .ant-input-number {
    pointer-events: auto;
  }
`;

export const Label = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-bottom: 8px;
  font-weight: 500;
`;

export const ParamRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
`;

export const ParamItem = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CompactLabel = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-bottom: 6px;
  font-weight: 500;
`;

export const StyledSelect = styled(Select)`
  width: 100%;
  border-radius: 12px;
  
  .ant-select-selector {
    border: none !important;
    border-radius: 12px !important;
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'} !important;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  }
  
  &:hover .ant-select-selector {
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'} !important;
  }
  
  &.ant-select-focused .ant-select-selector {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
  }
`;

export const StyledSlider = styled(Slider)`
  margin: 8px 0;
  
  .ant-slider-track {
    background: #1890ff;
  }
  
  .ant-slider-handle {
    border-color: #1890ff;
  }
  
  .ant-slider-handle:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 5px rgba(24, 144, 255, 0.12);
  }
`;

export const StyledTextArea = styled(TextArea)`
  border: none;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  
  &:focus {
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  &::placeholder {
    color: ${props => props.theme.mode === 'dark' ? '#666' : '#bfbfbf'};
  }
`;

export const StyledHandle = styled(Handle)`
  width: 20px;
  height: 20px;
  background: #1890ff;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  z-index: 100 !important;
  pointer-events: auto !important;
  cursor: crosshair;
  
  &.react-flow__handle-right {
    right: -6px;
  }
  
  &.react-flow__handle-left {
    left: -6px;
  }
`;

export const BottomLabel = styled.div`
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 10px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#999'};
  pointer-events: none;
  user-select: none;
`;

export const GenerateButton = styled(Button)`
  position: absolute;
  bottom: -56px;
  left: 12px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  transition: all 0.3s ease;
  z-index: 5;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.5);
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: #fff;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  }
`;

export const VideoPreviewSection = styled.div`
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
`;

export const TaskCard = styled.div<{ $status?: string }>`
  position: relative;
  width: 200px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => {
    if (props.$status === 'processing') return '#1890ff';
    if (props.$status === 'completed') return '#52c41a';
    if (props.$status === 'failed') return '#ff4d4f';
    return props.theme.mode === 'dark' ? '#444' : '#e0e0e0';
  }};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  pointer-events: none;
  
  &:hover {
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    transform: translateX(2px);
  }
  
  ${props => props.$status === 'processing' && `
    animation: pulse 2s infinite;
    @keyframes pulse {
      0%, 100% { box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3); }
      50% { box-shadow: 0 4px 16px rgba(24, 144, 255, 0.6); }
    }
  `}
`;

export const TaskCardContent = styled.div`
  padding: 12px;
`;

export const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const TaskModelName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
`;

export const TaskTime = styled.div`
  font-size: 10px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
`;

export const TaskPrompt = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#aaa' : '#666'};
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const TaskStatus = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${props => {
    if (props.$status === 'processing') return '#1890ff';
    if (props.$status === 'completed') return '#52c41a';
    if (props.$status === 'failed') return '#ff4d4f';
    return props.theme.mode === 'dark' ? '#999' : '#666';
  }};
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
`;

export const VideoCard = styled.div<{ $width?: number; $height?: number }>`
  position: relative;
  width: ${props => props.$width ? `${props.$width}px` : '200px'};
  ${props => props.$height ? `height: ${props.$height}px;` : ''}
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s, box-shadow 0.2s;
  pointer-events: none;
  
  &:hover {
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  }
  
  video {
    width: 100%;
    height: ${props => props.$height ? `${props.$height}px` : 'auto'};
    display: block;
    pointer-events: auto !important;
    object-fit: contain;
  }
  
  button, a {
    pointer-events: auto !important;
  }
`;

export const ResizeHandle = styled.div<{ $isResizing?: boolean }>`
  position: absolute;
  bottom: -12px;
  right: -12px;
  width: 28px;
  height: 28px;
  background: #1890ff;
  border-radius: 50%;
  cursor: nwse-resize;
  pointer-events: auto !important;
  touch-action: none;
  user-select: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$isResizing ? 1 : 0.85};
  transition: ${props => props.$isResizing ? 'none' : 'opacity 0.2s, background 0.2s, transform 0.2s'};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  box-shadow: ${props => props.$isResizing 
    ? '0 4px 12px rgba(24, 144, 255, 0.6)' 
    : '0 2px 6px rgba(0, 0, 0, 0.3)'};
  transform: ${props => props.$isResizing ? 'scale(1.15)' : 'scale(1)'};
  
  &:hover {
    opacity: 1;
    background: #40a9ff;
    transform: scale(1.1);
  }
  
  &:active {
    opacity: 1;
    background: #096dd9;
    transform: scale(1.15);
  }
  
  /* 增加触摸区域（更大的可点击区域） */
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
  }
  
  /* 拖拽指示图标 */
  &::after {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 8px 8px;
    border-color: transparent transparent #fff transparent;
    position: absolute;
    bottom: 5px;
    right: 5px;
    pointer-events: none;
  }
  
  /* 拖拽时的额外视觉反馈 */
  ${props => props.$isResizing && `
    background: #096dd9;
    box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
  `}
`;

export const UploadArea = styled.div<{ $isDragging?: boolean }>`
  border: 2px dashed ${props => props.$isDragging ? '#1890ff' : (props.theme.mode === 'dark' ? '#444' : '#d9d9d9')};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  
  &:hover {
    border-color: #1890ff;
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f0f0f0'};
  }
`;

export const ImagePreview = styled.div`
  margin-top: 10px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  position: relative;
  width: 100%;
  height: 160px; /* 固定高度 */
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;

export const FloatingReplaceButton = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 10;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  ${ImagePreview}:hover & {
    opacity: 1;
  }
`;

export const FloatingButton = styled(Button)`
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none !important;
  backdrop-filter: blur(8px);
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.9)'} !important;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 1)'} !important;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  }
  
  &.primary {
    background: rgba(24, 144, 255, 0.9) !important;
    color: #fff !important;
    
    &:hover {
      background: rgba(24, 144, 255, 1) !important;
      color: #fff !important;
    }
  }
  
  &.danger {
    background: rgba(255, 77, 79, 0.9) !important;
    color: #fff !important;
    
    &:hover {
      background: rgba(255, 77, 79, 1) !important;
      color: #fff !important;
    }
  }
  
  .anticon {
    font-size: 16px !important;
    margin: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* 确保图标 SVG 可见 */
  .anticon svg {
    display: inline-block !important;
    width: 16px !important;
    height: 16px !important;
    opacity: 1 !important;
    visibility: visible !important;
    fill: currentColor !important;
  }
  
  /* 只隐藏文字，保留图标 */
  > span:not(.anticon) {
    display: none !important;
  }
`;

