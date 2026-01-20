import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Modal, Tag, Spin, message, Button, Tooltip, Image, Badge } from 'antd';
import {
  CloseOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SyncOutlined,
  ThunderboltFilled,
  CodeFilled,
  CalendarOutlined,
  FileImageOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  FileJpgOutlined,
  PictureOutlined,
  CompressOutlined,
  ColumnWidthOutlined,
  SplitCellsOutlined,
  NumberOutlined,
  ToolOutlined,
  LinkOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import instance from 'api/axios';
import dayjs from 'dayjs';
import {
  likeModel,
  unlikeModel,
  favoriteModel,
  unfavoriteModel,
  getInteractionStatus,
} from 'api/modelInteraction';
import BatchImageCompress from 'pages/Workspace/MediaTools/components/ImageCompress/BatchImageCompress';

// ==========================================
// 1. 工具函数
// ==========================================

const normalizeUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const addImageCompressSuffix = (url: string, width = 1200) => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

// ==========================================
// 2. 样式组件系统
// ==========================================

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
    background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
  .ant-modal-body {
    padding: 0;
    height: 85vh;
    max-height: 900px;
    display: flex;
    overflow: hidden;
  }
  .ant-modal-close {
    top: 16px;
    right: 16px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)'};
    z-index: 100;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
    &:hover {
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
      background: rgba(0,0,0,0.1);
    }
  }
  @media (max-width: 768px) {
    .ant-modal-body {
      flex-direction: column;
      height: auto;
      max-height: 95vh;
      overflow-y: auto;
    }
  }
`;

const SplitLayout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  @media (max-width: 768px) { flex-direction: column; }
`;

// --- 左侧：视觉展示区 ---

const VisualSide = styled.div`
  flex: 1;
  background: ${props => props.theme.mode === 'dark' ? '#000000' : '#f0f2f5'};
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  
  /* 棋盘格背景 */
  background-image: 
    linear-gradient(45deg, ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#e6e6e6'} 25%, transparent 25%), 
    linear-gradient(-45deg, ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#e6e6e6'} 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#e6e6e6'} 75%), 
    linear-gradient(-45deg, transparent 75%, ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#e6e6e6'} 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
`;

const MainViewArea = styled.div`
  flex: 1;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 24px;
`;

// --- 并列对比容器 ---
const SideBySideContainer = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

  .image-wrapper {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    max-width: 50%;
    
    .label {
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(0,0,0,0.6);
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 5;
    }

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
  }
`;

// --- 滑动对比组件样式 (修复版) ---
const CompareWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompareContainer = styled.div`
  position: relative;
  max-width: 100%; 
  max-height: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  user-select: none;
  border-radius: 12px;
  overflow: hidden;
  cursor: ew-resize;
  
  /* 底部图片决定容器尺寸 */
  & > img { 
    display: block;
    max-height: 75vh; 
    object-fit: contain;
    width: auto;
    max-width: 100%;
  }
`;

const CompareHandle = styled.div<{ $left: number }>`
  position: absolute; top: 0; bottom: 0; left: ${props => props.$left}%;
  width: 2px; background: #fff; z-index: 20;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  pointer-events: none; /* 确保鼠标事件穿透到容器 */
  
  &::after {
    content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 32px; height: 32px; background: #fff; border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    display: flex; alignItems: center; justifyContent: center;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M12 2l-5.5 9h11L12 2zm0 20l5.5-9h-11L12 22z' transform='rotate(90 12 12)'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: center;
  }
`;

// 修复后的 OverlayImage：全宽 + clip-path，确保内部图片不形变
const OverlayImage = styled.div<{ $clip: number }>`
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  overflow: hidden; 
  clip-path: inset(0 ${props => 100 - props.$clip}% 0 0); 
  pointer-events: none; 
  
  img { 
    display: block;
    width: 100%; 
    height: 100%; 
    object-fit: fill; /* 强制填满，因比例一致所以不会形变 */
  } 
`;

const CompareLabel = styled.div<{ $type: 'input' | 'output' }>`
  position: absolute; top: 16px; ${props => props.$type === 'input' ? 'left: 16px;' : 'right: 16px;'}
  padding: 6px 12px; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); color: #fff;
  border-radius: 6px; font-size: 12px; font-weight: 600; z-index: 10; pointer-events: none;
  display: flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.15);
`;

// --- 缩略图栏 ---
const ThumbnailStrip = styled.div`
  height: 80px;
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.8)'};
  backdrop-filter: blur(10px);
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 24px;
  overflow-x: auto;
  z-index: 20;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 2px; }
`;
const ThumbnailItem = styled.div<{ $active: boolean }>`
  width: 50px; height: 50px; border-radius: 6px; overflow: hidden; cursor: pointer;
  border: 2px solid ${props => props.$active ? '#1890ff' : 'transparent'};
  opacity: ${props => props.$active ? 1 : 0.6};
  transition: all 0.2s; flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
  &:hover { opacity: 1; transform: translateY(-2px); }
`;

// --- 右侧布局 ---
const InfoSide = styled.div`
  width: 420px; flex-shrink: 0;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
  border-left: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#f0f0f0'};
  display: flex; flex-direction: column; position: relative; z-index: 10;
  @media (max-width: 768px) { width: 100%; border-left: none; border-top: 1px solid #303030; }
`;
const InfoScrollArea = styled.div`
  flex: 1; overflow-y: auto; padding: 24px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(100, 100, 100, 0.2); border-radius: 2px; }
`;
const InfoFooter = styled.div`
  padding: 16px 24px; border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#f0f0f0'};
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
  display: flex; gap: 12px; justify-content: space-between; align-items: center;
`;
const HeaderTitle = styled.h2`
  font-size: 20px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.4;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
`;
const MetaRow = styled.div`
  display: flex; gap: 16px; align-items: center;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
  font-size: 12px; margin-bottom: 20px; font-family: 'SF Mono', monospace;
  span { display: flex; align-items: center; gap: 4px; }
`;
const SectionTitle = styled.h3`
  font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#9ca3af'};
  margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
`;
const ParamSection = styled.div` margin-bottom: 24px; `;
const PropsGroup = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#e2e8f0'};
  border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;
`;
const PropRow = styled.div<{ $highlight?: boolean }>`
  display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#f1f5f9'};
  background: ${props => props.$highlight ? (props.theme.mode === 'dark' ? 'rgba(250, 173, 20, 0.05)' : '#fffbe6') : 'transparent'};
  &:last-child { border-bottom: none; }
  &:hover { background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'}; }
`;
const PropLabel = styled.div`
  flex-shrink: 0; width: 110px; margin-right: 16px; font-size: 13px;
  color: ${props => props.theme.mode === 'dark' ? '#888' : '#64748b'};
  display: flex; align-items: center; gap: 8px; padding-top: 2px;
`;
const PropValue = styled.div`
  flex: 1; font-family: 'SF Mono', 'Menlo', monospace; font-size: 13px;
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1e293b'};
  text-align: right; word-break: break-all; line-height: 1.5;
  display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: 6px;
  .copy-icon { cursor: pointer; color: #1890ff; opacity: 0; transition: opacity 0.2s; margin-left: 4px; }
  &:hover .copy-icon { opacity: 1; }
`;
const PromptBox = styled.div`
  position: relative; background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f8fafc'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e2e8f0'};
  border-radius: 12px; padding: 16px; margin-bottom: 24px;
  .text {
    font-family: 'SF Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.6;
    color: ${props => props.theme.mode === 'dark' ? '#d1d5db' : '#334155'};
    white-space: pre-wrap; max-height: 150px; overflow-y: auto;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: rgba(100, 100, 100, 0.2); border-radius: 2px; }
  }
  .copy-btn { position: absolute; top: 8px; right: 8px; opacity: 0.6; &:hover { opacity: 1; } }
`;

// 媒体工具模态框样式
const MediaToolsModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
    background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
  }
  .ant-modal-body {
    padding: 24px;
    max-height: 85vh;
    overflow-y: auto;
  }
  .ant-modal-header {
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
    border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};
    padding: 16px 24px;
  }
  .ant-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  }
`;

// ==========================================
// 3. 滑动对比组件 (修复版)
// ==========================================
const ImageCompareSection: React.FC<{ inputUrl: string; outputUrl: string; intl: any }> = ({ inputUrl, outputUrl, intl }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <CompareWrapper>
      <CompareContainer 
        ref={containerRef} 
        onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)} 
        onClick={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <CompareLabel $type="input"><FileImageOutlined /> Input</CompareLabel>
        <CompareLabel $type="output"><ThunderboltFilled /> Result</CompareLabel>
        
        {/* 底层图片：决定容器大小 */}
        <img 
          src={addImageCompressSuffix(outputUrl)} 
          alt="Out" 
          draggable={false}
        />
        
        {/* 上层图片：全尺寸覆盖，通过 clip-path 裁剪 */}
        <OverlayImage $clip={sliderPos}>
          <img 
            src={addImageCompressSuffix(inputUrl)} 
            alt="In" 
            draggable={false}
          />
        </OverlayImage>
        
        <CompareHandle $left={sliderPos} />
      </CompareContainer>
    </CompareWrapper>
  );
};

// ==========================================
// 4. 并列对比组件
// ==========================================
const SideBySideSection: React.FC<{ inputUrl: string; outputUrl: string; intl: any }> = ({ inputUrl, outputUrl, intl }) => {
  return (
    <SideBySideContainer>
      <div className="image-wrapper">
        <div className="label"><FileImageOutlined /> Input</div>
        <Image src={inputUrl} />
      </div>
      <div className="image-wrapper">
        <div className="label" style={{background: 'rgba(82, 196, 26, 0.8)'}}><ThunderboltFilled /> Result</div>
        <Image src={outputUrl} />
      </div>
    </SideBySideContainer>
  );
};

// ==========================================
// 5. 主组件 Logic
// ==========================================

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  taskId: number | null;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ open, onClose, taskId }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<any | null>(null);
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0);
  
  // 智能对比状态
  const [isSameRatio, setIsSameRatio] = useState(false);
  const [checkingRatio, setCheckingRatio] = useState(false);
  const [forceSideBySide, setForceSideBySide] = useState(false); // 用户手动切换
  
  // 交互状态
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // 媒体工具模态框状态
  const [showMediaTools, setShowMediaTools] = useState(false);

  const fetchInteractionStatus = useCallback(async (modelId: number) => {
    try {
      const response = await getInteractionStatus(modelId);
      setIsLiked(response.isLiked);
      setIsFavorited(response.isFavorited);
    } catch (error) { setIsLiked(false); setIsFavorited(false); }
  }, []);

  const fetchDetail = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await instance.get(`/productx/sa-ai-gen-task/${taskId}/detail`);
      if (res.data.success) {
        setTask(res.data.data);
        setSelectedOutputIndex(0);
        setForceSideBySide(false); // 重置视图模式
      } else { message.error(res.data.message); }
    } catch (err) { message.error('Load Failed'); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open && taskId) {
      setTask(null);
      fetchDetail();
    }
  }, [open, taskId]);

  useEffect(() => {
    if (task?.model?.id) fetchInteractionStatus(task.model.id);
  }, [task?.model?.id, fetchInteractionStatus]);

  // --- 核心：比例检测逻辑 ---
  useEffect(() => {
    const checkRatio = async () => {
      const inputUrl = task?.inputFiles?.[0]?.fileUrl ? normalizeUrl(task.inputFiles[0].fileUrl) : null;
      const outputUrl = task?.outputFiles?.[selectedOutputIndex]?.fileUrl ? normalizeUrl(task.outputFiles[selectedOutputIndex].fileUrl) : null;

      if (inputUrl && outputUrl && task.taskType === 'i2i') {
        setCheckingRatio(true);
        setIsSameRatio(false);
        try {
          const [inDim, outDim] = await Promise.all([
            getImageDimensions(inputUrl),
            getImageDimensions(outputUrl)
          ]);
          
          const r1 = inDim.width / inDim.height;
          const r2 = outDim.width / outDim.height;
          
          // 容差 0.02
          if (Math.abs(r1 - r2) < 0.02) {
            setIsSameRatio(true);
          } else {
            setIsSameRatio(false);
          }
        } catch (e) {
          setIsSameRatio(false);
        } finally {
          setCheckingRatio(false);
        }
      } else {
        setIsSameRatio(false);
        setCheckingRatio(false);
      }
    };

    checkRatio();
  }, [task, selectedOutputIndex]);

  // Actions
  const handleLike = async () => {
    if (!task?.model?.id) return;
    setLikeLoading(true);
    try {
      const res = isLiked ? await unlikeModel(task.model.id) : await likeModel(task.model.id);
      setIsLiked(res.isLiked);
      message.success(isLiked ? 'Unliked' : 'Liked');
    } catch(e) { message.error('Failed'); } finally { setLikeLoading(false); }
  };

  const handleFavorite = async () => {
    if (!task?.model?.id) return;
    setFavoriteLoading(true);
    try {
      const res = isFavorited ? await unfavoriteModel(task.model.id) : await favoriteModel(task.model.id);
      setIsFavorited(res.isFavorited);
      message.success(isFavorited ? 'Unfavorited' : 'Favorited');
    } catch(e) { message.error('Failed'); } finally { setFavoriteLoading(false); }
  };

  const handleDownload = () => {
    const currentFile = task?.outputFiles?.[selectedOutputIndex];
    if (!currentFile?.fileUrl) return;
    const url = normalizeUrl(currentFile.fileUrl);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gen_task_${taskId}_${selectedOutputIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!task && loading) return <Modal open={open} footer={null} centered width={600}><div style={{padding: 60, textAlign:'center'}}><Spin size="large" /></div></Modal>;
  if (!task) return null;

  // 数据解析
  const inputImageUrl = task.inputFiles?.[0]?.fileUrl ? normalizeUrl(task.inputFiles[0].fileUrl) : null;
  const outputFiles = task.outputFiles || [];
  const currentOutputUrl = outputFiles[selectedOutputIndex]?.fileUrl ? normalizeUrl(outputFiles[selectedOutputIndex].fileUrl) : null;
  const hasInput = !!inputImageUrl && task.taskType === 'i2i';
  const hasMultipleOutputs = outputFiles.length > 1;
  const durationStr = task.durationMs 
    ? (task.durationMs / 1000).toFixed(1) + 's' 
    : (task.endTime && task.createTime ? dayjs(task.endTime).diff(dayjs(task.createTime), 'second') + 's' : '-');

  const renderStatus = (status: number) => {
    const map: any = { 2: { c: '#52c41a', i: <CheckCircleFilled />, t: 'Success' }, 3: { c: '#ff4d4f', i: <CloseCircleFilled />, t: 'Failed' } };
    const conf = map[status] || { c: '#faad14', i: <SyncOutlined spin />, t: 'Processing' };
    return <Tag color={conf.c} style={{border:'none', marginLeft: 8, display:'flex', alignItems:'center', gap:4}}>{conf.i} {conf.t}</Tag>;
  };

  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
    >
      <SplitLayout>
        {/* ================= 左侧：视觉区 ================= */}
        <VisualSide>
          <MainViewArea>
            {checkingRatio ? (
              <Spin tip="Comparing Dimensions..." />
            ) : currentOutputUrl ? (
              hasInput ? (
                (!forceSideBySide && isSameRatio) ? (
                  <ImageCompareSection 
                    inputUrl={inputImageUrl} 
                    outputUrl={currentOutputUrl} 
                    intl={intl} 
                  />
                ) : (
                  <SideBySideSection
                    inputUrl={inputImageUrl}
                    outputUrl={currentOutputUrl}
                    intl={intl}
                  />
                )
              ) : (
                <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                   <Image 
                     src={addImageCompressSuffix(currentOutputUrl)} 
                     style={{maxHeight: '75vh', borderRadius: 8, objectFit:'contain', maxWidth:'100%'}}
                     placeholder={<Spin />}
                   />
                </div>
              )
            ) : (
              <div style={{color: '#999', textAlign:'center'}}><LoadingOutlined style={{fontSize: 24, marginBottom:10}}/><br/>Processing...</div>
            )}
          </MainViewArea>

          {/* 底部控制栏 */}
          <div style={{
            position: 'absolute', 
            bottom: 0, left: 0, right: 0, 
            display: 'flex', flexDirection: 'column' 
          }}>
             {hasInput && isSameRatio && !checkingRatio && (
               <div style={{display: 'flex', justifyContent: 'center', paddingBottom: 8, zIndex: 30}}>
                  <Tooltip title="Switch View Mode">
                    <Button 
                      shape="round" 
                      size="small"
                      icon={forceSideBySide ? <SplitCellsOutlined /> : <ColumnWidthOutlined />}
                      onClick={() => setForceSideBySide(!forceSideBySide)}
                      style={{background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', backdropFilter: 'blur(4px)'}}
                    >
                      {forceSideBySide ? 'Compare Slider' : 'Side-by-Side'}
                    </Button>
                  </Tooltip>
               </div>
             )}

             {hasMultipleOutputs && (
              <ThumbnailStrip>
                {outputFiles.map((file: any, idx: number) => (
                  <ThumbnailItem 
                    key={file.id} 
                    $active={selectedOutputIndex === idx}
                    onClick={() => setSelectedOutputIndex(idx)}
                  >
                    <img src={addImageCompressSuffix(normalizeUrl(file.fileUrl), 200)} alt={`Var ${idx}`} />
                  </ThumbnailItem>
                ))}
              </ThumbnailStrip>
             )}
          </div>
        </VisualSide>

        {/* ================= 右侧：信息区 ================= */}
        <InfoSide>
          <InfoScrollArea>
            <div style={{marginBottom: 24}}>
              <HeaderTitle>
                {task.modelName || 'Untitled Task'}
                {renderStatus(task.status)}
              </HeaderTitle>
              <MetaRow>
                <span><CalendarOutlined /> {dayjs(task.createTime).format('YYYY-MM-DD HH:mm')}</span>
                <span><NumberOutlined /> ID: {task.id}</span>
              </MetaRow>
              {task.model?.description && (
                 <div style={{fontSize: 13, color: '#888', background: 'rgba(0,0,0,0.03)', padding: 10, borderRadius: 6}}>
                    {task.model.description}
                 </div>
              )}
            </div>

            <ParamSection>
              <SectionTitle><InfoCircleOutlined /> Configuration</SectionTitle>
              <PropsGroup>
                <PropRow $highlight>
                  <PropLabel><ThunderboltFilled style={{ color: '#faad14' }} /> Cost</PropLabel>
                  <PropValue style={{ color: '#faad14', fontWeight: 600 }}>{task.creditsCost || 0} Credits</PropValue>
                </PropRow>
                <PropRow>
                  <PropLabel><StarOutlined /> Model</PropLabel>
                  <PropValue>
                    <span title={task.modelName}>{task.modelCode || 'Unknown'}</span>
                    <Badge count={task.model?.modelLevel ? `Lv.${task.model.modelLevel}` : 0} style={{backgroundColor: '#52c41a', marginLeft: 8}} />
                    <CopyOutlined className="copy-icon" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(task.modelCode || ''); message.success('Copied'); }} />
                  </PropValue>
                </PropRow>
                <PropRow>
                  <PropLabel><CodeFilled /> Type</PropLabel>
                  <PropValue><Tag>{task.taskType || 't2i'}</Tag> {task.inputType && <Tag color="blue">{task.inputType}</Tag>}</PropValue>
                </PropRow>
                 <PropRow>
                  <PropLabel><CompressOutlined /> Res Max</PropLabel>
                  <PropValue>{task.model?.imageMaxResolution?.split(',').map((res: string) => <Tag key={res} bordered={false} style={{marginRight:4}}>{res}</Tag>) || '-'}</PropValue>
                </PropRow>
                <PropRow>
                  <PropLabel><FileJpgOutlined /> Format</PropLabel>
                  <PropValue>{task.model?.imageFormats?.toUpperCase() || 'PNG'}</PropValue>
                </PropRow>
                <PropRow>
                  <PropLabel><PictureOutlined /> Ratios</PropLabel>
                  <PropValue>
                    {task.model?.imageAspectRatios?.split(',').map((ratio: string) => (
                         <span key={ratio} style={{ display: 'inline-block', background: 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: 4, margin: '0 4px 4px 0', fontSize: 12, border: '1px solid rgba(0,0,0,0.05)' }}>{ratio}</span>
                    )) || '1:1'}
                  </PropValue>
                </PropRow>
                <PropRow>
                   <PropLabel><ClockCircleOutlined /> Time</PropLabel>
                   <PropValue>{durationStr}</PropValue>
                </PropRow>
              </PropsGroup>
            </ParamSection>

            {task.prompt && (
              <>
                <SectionTitle><ThunderboltFilled /> Prompt</SectionTitle>
                <PromptBox>
                  <Tooltip title="Copy Prompt">
                    <Button type="text" size="small" className="copy-btn" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(task.prompt); message.success('Copied'); }} />
                  </Tooltip>
                  <div className="text">{task.prompt}</div>
                </PromptBox>
              </>
            )}
          </InfoScrollArea>

          <InfoFooter>
             <div style={{ display: 'flex', gap: 8 }}>
                <Tooltip title={isLiked ? "Unlike" : "Like"}>
                  <Button shape="circle" icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} onClick={handleLike} loading={likeLoading}/>
                </Tooltip>
                <Tooltip title={isFavorited ? "Unfavorite" : "Favorite"}>
                  <Button shape="circle" icon={isFavorited ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />} onClick={handleFavorite} loading={favoriteLoading}/>
                </Tooltip>
                <Button shape="circle" icon={<ShareAltOutlined />} onClick={() => { navigator.clipboard.writeText(window.location.href); message.success('Link Copied'); }} />
             </div>
             {currentOutputUrl && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Tooltip title={intl.formatMessage({ id: 'taskDetail.mediaTools', defaultMessage: '媒体工具' })}>
                    <Button 
                      shape="round" 
                      icon={<ToolOutlined />} 
                      onClick={() => setShowMediaTools(true)}
                      style={{padding: '0 20px'}}
                    >
                      {intl.formatMessage({ id: 'taskDetail.compress', defaultMessage: '压缩' })}
                    </Button>
                  </Tooltip>
                  <Button type="primary" shape="round" icon={<DownloadOutlined />} onClick={handleDownload} style={{padding: '0 24px'}}>Download</Button>
                </div>
             )}
          </InfoFooter>
        </InfoSide>
      </SplitLayout>
      
      {/* 媒体工具模态框 */}
      <MediaToolsModal
        open={showMediaTools}
        onCancel={() => setShowMediaTools(false)}
        width={1400}
        centered
        destroyOnClose
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CompressOutlined style={{ color: '#8338ec' }} />
              {intl.formatMessage({ id: 'taskDetail.imageCompress', defaultMessage: '图片压缩工具' })}
            </div>
            <Tooltip title={intl.formatMessage({ id: 'taskDetail.goToMediaTools', defaultMessage: '访问完整媒体工具页面' })}>
              <Button 
                type="link" 
                icon={<LinkOutlined />}
                onClick={() => {
                  navigate('/tools');
                  setShowMediaTools(false);
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4,
                  color: '#1890ff'
                }}
              >
                {intl.formatMessage({ id: 'taskDetail.mediaToolsPage', defaultMessage: '完整工具页' })}
              </Button>
            </Tooltip>
          </div>
        }
        footer={null}
      >
        <BatchImageCompress />
      </MediaToolsModal>
    </StyledModal>
  );
};

export default TaskDetailModal;