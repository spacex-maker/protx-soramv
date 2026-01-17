import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Slider, InputNumber, Select, Button, 
  Typography, message, Segmented
} from 'antd';
import { 
  InboxOutlined, 
  CompressOutlined, 
  DownloadOutlined, 
  DeleteOutlined, 
  ColumnHeightOutlined, 
  ColumnWidthOutlined, 
  BgColorsOutlined, 
  ArrowLeftOutlined, 
  ArrowRightOutlined, 
  LoadingOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';

const { Dragger } = Upload;
const { Title, Text } = Typography;

// --- 1. 定义 TypeScript 接口 ---
interface OverlayImageProps {
  $width: number;
  $containerWidth: number;
  $containerHeight: number;
}

interface SliderHandleProps {
  $left: number;
}

// --- 2. 动画定义 ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- 3. 样式组件 ---
const PageContainer = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease-out;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
  text-align: center;
  flex-shrink: 0;
`;

const HeroUploadWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;

  .ant-upload-drag {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)'} !important;
    border: 2px dashed ${props => props.theme.mode === 'dark' ? '#333' : '#d9d9d9'} !important;
    border-radius: 24px !important;
    transition: all 0.3s;
    height: 320px;
    width: 100%;
    max-width: 800px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #8338ec !important;
      background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.05)' : 'rgba(131, 56, 236, 0.02)'} !important;
    }
  }
`;

const Workspace = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  flex: 1;
  min-height: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`;

const PreviewArea = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#f0f2f5'};
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  
  /* 棋盘格背景 */
  background-image: 
    linear-gradient(45deg, #ccc 25%, transparent 25%), 
    linear-gradient(-45deg, #ccc 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #ccc 75%), 
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(20,20,20,0.95)' : 'rgba(245,247,250,0.9)'};
    z-index: 0;
  }
`;

const CompareContainer = styled.div`
  position: relative;
  max-width: 90%;
  max-height: 90%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  z-index: 1;
  user-select: none;

  img {
    max-width: 100%;
    max-height: 100%;
    display: block;
    border-radius: 8px;
    pointer-events: none;
  }
`;

const OverlayImage = styled.div<OverlayImageProps>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: ${props => props.$width}%;
  overflow: hidden;
  border-right: 2px solid #fff;
  background: #fff;

  img {
    width: ${props => props.$containerWidth}px;
    height: ${props => props.$containerHeight}px;
    max-width: none;
    max-height: none;
  }
`;

const SliderHandle = styled.div<SliderHandleProps>`
  position: absolute;
  top: 50%;
  left: ${props => props.$left}%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  z-index: 10;
  color: #333;

  &::after {
    content: '';
    position: absolute;
    top: -100vh;
    bottom: -100vh;
    left: 50%;
    width: 2px;
    background: rgba(255,255,255,0.5);
    transform: translateX(-50%);
    pointer-events: none;
    z-index: -1;
  }
`;

const LabelBadge = styled.div`
  position: absolute;
  top: 16px;
  padding: 6px 12px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 12px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  z-index: 5;
  
  &.original { left: 16px; }
  &.compressed { right: 16px; }
`;

const ControlPanel = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  overflow-y: auto;
`;

const PanelSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${props => props.theme.mode === 'dark' ? '#888' : '#999'};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#f8f9fa'};
  padding: 16px;
  border-radius: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  
  .label {
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
  }
  .value {
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#e8eaed' : '#1f1f1f'};
  }
`;

const ActionFooter = styled.div`
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};
`;

// --- 4. 工具函数 ---
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- 5. 主组件 ---
const ImageCompress: React.FC = () => {
  const intl = useIntl();
  
  // 核心状态
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [meta, setMeta] = useState({ width: 0, height: 0, originalSize: 0, compressedSize: 0 });
  const [isCompressing, setIsCompressing] = useState(false);

  // 设置状态
  const [quality, setQuality] = useState(0.8);
  const [resizeMode, setResizeMode] = useState<string | number>('scale'); 
  const [scale, setScale] = useState(100);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  
  // 默认设置为 JPEG，因为它是最常用的有损压缩格式
  const [format, setFormat] = useState('jpeg');
  
  // UI 状态
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDim, setContainerDim] = useState({ w: 0, h: 0 });

  // 判断是否应该隐藏质量滑块
  // PNG 是无损的，所以当 format 为 png，或者 auto 且原图是 png 时隐藏
  const isLossless = format === 'png' || (format === 'auto' && file?.type === 'image/png');

  // 处理上传
  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        setFile(file);
        setOriginalPreview(e.target?.result as string);
        setCompressedPreview(e.target?.result as string); 
        setMeta({
          width: img.width,
          height: img.height,
          originalSize: file.size,
          compressedSize: file.size 
        });
        setCustomWidth(img.width);
        setCustomHeight(img.height);
      };
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  // 压缩逻辑
  const compressImage = async () => {
    if (!originalPreview || !file) return;
    setIsCompressing(true);

    const img = new Image();
    img.src = originalPreview;
    
    await new Promise(resolve => img.onload = resolve);

    // 1. 计算目标尺寸
    let targetWidth = img.width;
    let targetHeight = img.height;

    if (resizeMode === 'scale') {
      targetWidth = Math.round(img.width * (scale / 100));
      targetHeight = Math.round(img.height * (scale / 100));
    } else {
      if (customWidth) targetWidth = customWidth;
      if (customHeight) targetHeight = customHeight;
    }

    // 2. 绘制到 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // 如果是 JPEG，给一个白色底，否则透明图片变黑
      if (format === 'jpeg' || (format === 'auto' && file.type === 'image/jpeg')) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // 3. 导出设置
      let mimeType = file.type;
      if (format !== 'auto') {
        mimeType = format === 'png' ? 'image/png' : (format === 'webp' ? 'image/webp' : 'image/jpeg');
      }

      // 4. 生成 Blob
      canvas.toBlob((blob) => {
        if (!blob) {
          message.error('Compression failed');
          setIsCompressing(false);
          return;
        }
        
        // 如果压缩后反而变大 (常见于 JPG -> PNG 或重度压缩图二次压缩)
        if (blob.size > file.size) {
           message.warning('Output is larger than original. Try reducing quality or using WebP.', 4);
        } else {
           message.success('Compressed successfully!');
        }
        
        const newUrl = URL.createObjectURL(blob);
        setCompressedBlob(blob);
        setCompressedPreview(newUrl);
        setMeta(prev => ({
          ...prev,
          compressedSize: blob.size,
        }));
        setIsCompressing(false);
      }, mimeType, quality); // Quality 参数对 PNG 无效，浏览器会忽略
    }
  };

  // 处理滑块交互
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  // 监听图片加载以获取显示尺寸
  useEffect(() => {
    if (containerRef.current) {
      setContainerDim({
        w: containerRef.current.offsetWidth,
        h: containerRef.current.offsetHeight
      });
    }
  }, [originalPreview, compressedPreview]);

  // 下载
  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    
    // 确定扩展名
    let ext = file.name.split('.').pop();
    if (format !== 'auto') {
      ext = format === 'jpeg' ? 'jpg' : format;
    }
    
    link.download = `compressed_${file.name.split('.')[0]}.${ext}`;
    link.click();
  };

  const handleReset = () => {
    setFile(null);
    setOriginalPreview(null);
    setCompressedPreview(null);
    setCompressedBlob(null);
  };

  // 计算节省比例
  const savings = meta.originalSize > 0 
    ? (1 - meta.compressedSize / meta.originalSize) * 100 
    : 0;

  return (
    <PageContainer>
      <Header>
        <Title level={2} style={{ marginBottom: 8 }}>
          <CompressOutlined style={{ marginRight: 12, color: '#8338ec' }} />
          Image Compressor Pro
        </Title>
        <Text type="secondary">
          智能压缩算法，保持最佳画质的同时显著减小体积
        </Text>
      </Header>

      {!file ? (
        // Hero Upload State
        <HeroUploadWrapper>
          <Dragger 
            accept="image/*" 
            beforeUpload={handleUpload} 
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#8338ec', fontSize: 64 }} />
            </p>
            <Title level={4}>点击或拖拽图片到这里</Title>
            <Text type="secondary">支持 JPG, PNG, WEBP 高清无损处理</Text>
          </Dragger>
        </HeroUploadWrapper>
      ) : (
        // Workspace State
        <Workspace>
          {/* 左侧：工作区 */}
          <PreviewArea>
            <CompareContainer 
              ref={containerRef} 
              onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)}
              onClick={handleMouseMove}
            >
              {/* 底图：压缩图 (位于右侧，被顶层遮盖) */}
              <img 
                src={compressedPreview || originalPreview || ''} 
                alt="Compressed Background" 
                onLoad={(e) => setContainerDim({ w: e.currentTarget.width, h: e.currentTarget.height })}
              />
              <LabelBadge className="compressed" style={{ opacity: sliderPos > 90 ? 0 : 1 }}>
                Compressed ({formatSize(meta.compressedSize)})
              </LabelBadge>

              {/* 顶层：原图 (位于左侧，被 width 裁剪) */}
              <OverlayImage 
                $width={sliderPos} 
                $containerWidth={containerDim.w}
                $containerHeight={containerDim.h}
              >
                <img src={originalPreview || ''} alt="Original Overlay" />
              </OverlayImage>
              <LabelBadge className="original">Original ({formatSize(meta.originalSize)})</LabelBadge>

              {/* 滑动杆 */}
              <SliderHandle $left={sliderPos}>
                <ArrowLeftOutlined style={{ fontSize: 10, marginRight: 2 }} />
                <ArrowRightOutlined style={{ fontSize: 10, marginLeft: 2 }} />
              </SliderHandle>
            </CompareContainer>
          </PreviewArea>

          {/* 右侧：控制面板 */}
          <ControlPanel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Title level={4} style={{ margin: 0 }}>Settings</Title>
              <Button type="text" icon={<DeleteOutlined />} onClick={handleReset} danger>
                Clear
              </Button>
            </div>

            <StatsGrid>
              <StatItem>
                <span className="label">Savings</span>
                <span className="value" style={{ color: savings >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {savings.toFixed(1)}%
                </span>
              </StatItem>
              <StatItem>
                <span className="label">New Size</span>
                <span className="value">{formatSize(meta.compressedSize)}</span>
              </StatItem>
            </StatsGrid>

            {/* 只有非无损格式才显示质量压缩选项 */}
            {!isLossless && (
              <PanelSection>
                <SectionTitle>
                  <span>Compression Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </SectionTitle>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Slider 
                    style={{ flex: 1 }}
                    min={0.01} 
                    max={1.0} 
                    step={0.01} 
                    value={quality} 
                    onChange={(val) => setQuality(val)}
                    tooltip={{ formatter: val => `${Math.round((val || 0) * 100)}%` }}
                  />
                  
                  <InputNumber 
                    min={1} 
                    max={100} 
                    value={Math.round(quality * 100)} 
                    onChange={(val) => {
                      const num = val === null ? 100 : val;
                      setQuality(num / 100);
                    }}
                    formatter={value => `${value}%`}
                    parser={value => value!.replace('%', '') as unknown as number}
                    style={{ width: 70 }}
                    size="small"
                  />
                </div>
              </PanelSection>
            )}

            <PanelSection>
              <SectionTitle>Resize</SectionTitle>
              <Segmented 
                options={[
                  { label: 'Scale %', value: 'scale', icon: <BgColorsOutlined /> },
                  { label: 'Custom px', value: 'custom', icon: <ColumnWidthOutlined /> }
                ]}
                value={resizeMode}
                onChange={setResizeMode}
                block
                style={{ marginBottom: 16 }}
              />
              
              {resizeMode === 'scale' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Slider 
                    style={{ flex: 1 }}
                    min={10} 
                    max={100} 
                    value={scale} 
                    onChange={setScale} 
                  />
                  <InputNumber 
                    min={10} 
                    max={100} 
                    value={scale} 
                    onChange={(val) => setScale(val ?? 100)} 
                    formatter={value => `${value}%`}
                    style={{ width: 70 }}
                    size="small"
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                   <InputNumber 
                     prefix={<ColumnWidthOutlined style={{color: '#999'}}/>}
                     placeholder="Width" 
                     value={customWidth} 
                     onChange={setCustomWidth} 
                     style={{ flex: 1 }} 
                   />
                   <InputNumber 
                     prefix={<ColumnHeightOutlined style={{color: '#999'}}/>}
                     placeholder="Height" 
                     value={customHeight} 
                     onChange={setCustomHeight} 
                     style={{ flex: 1 }} 
                   />
                </div>
              )}
            </PanelSection>

            <PanelSection>
              <SectionTitle>Format</SectionTitle>
              <Select 
                value={format} 
                onChange={setFormat} 
                style={{ width: '100%' }}
                options={[
                  { value: 'auto', label: 'Auto (Same as Original)' },
                  { value: 'jpeg', label: 'JPEG (Best for Photos)' },
                  { value: 'png', label: 'PNG (Lossless, Larger)' },
                  { value: 'webp', label: 'WebP (Recommended)' },
                ]}
              />
              {/* 如果选中 PNG，给出提示 */}
              {isLossless && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#faad14' }}>
                  <FileImageOutlined /> PNG format is lossless. Quality slider is disabled.
                </div>
              )}
            </PanelSection>

            <ActionFooter>
              <Button 
                type="primary" 
                block 
                size="large" 
                icon={isCompressing ? <LoadingOutlined /> : <CompressOutlined />}
                onClick={compressImage}
                style={{ 
                  height: 50, 
                  borderRadius: 12, 
                  background: 'linear-gradient(135deg, #8338ec 0%, #3a86ff 100%)',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 12
                }}
              >
                {isCompressing ? 'Compressing...' : 'Apply & Compress'}
              </Button>
              
              <Button 
                block 
                size="large" 
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={!compressedBlob}
                style={{ 
                  height: 50, 
                  borderRadius: 12,
                  fontWeight: 600
                }}
              >
                Download Image
              </Button>
            </ActionFooter>
          </ControlPanel>
        </Workspace>
      )}
    </PageContainer>
  );
};

export default ImageCompress;