import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Button, 
  Col, 
  Space, 
  Empty,
  Spin,
  Image,
  message
} from 'antd';
import { 
  DownloadOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  ColumnWidthOutlined,
  SplitCellsOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ImageResult, WaitingTask } from './types';
import { ResultArea } from './styles'; 
import { getImageDimensions, normalizeUrl } from './utils';

const { Title, Text } = Typography;

// --- 样式组件 ---
const CompareContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 16px;
  background: rgba(0,0,0,0.02);
  border-radius: 12px;
  overflow: hidden;
`;

const SliderWrapper = styled.div<{ width: number; height: number }>`
  position: relative;
  max-height: 600px;
  /* 这里的 aspect-ratio 由生成图决定，确保容器被撑开 */
  aspect-ratio: ${props => props.width / props.height};
  user-select: none;
  cursor: ew-resize;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: fill; /* 强制填充，因为我们已经确保了比例一致，fill 能保证像素对齐 */
  }
`;

const SliderHandle = styled.div<{ position: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${props => props.position}%;
  width: 2px;
  background: #fff;
  z-index: 10;
  box-shadow: 0 0 8px rgba(0,0,0,0.5);
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='12' height='12'%3E%3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E%3C/svg%3E");
  }
`;

const OverlayImage = styled.div<{ position: number }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: ${props => props.position}%;
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.8);
  background: #fff; /* 防止透明图透视 */
`;

const SideBySideWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  margin-top: 16px;
  flex-wrap: wrap;

  .image-box {
    flex: 1;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .img-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      background: rgba(0,0,0,0.02);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

interface ImageResultDisplayProps {
  loading: boolean;
  generatedImage: ImageResult | null;
  waitingTasks: WaitingTask[];
  originalImageUrl: string | null;
  isDark: boolean;
}

const ImageResultDisplay: React.FC<ImageResultDisplayProps> = ({
  loading,
  generatedImage,
  waitingTasks,
  originalImageUrl,
  isDark,
}) => {
  // --- 状态管理 ---
  const [isSameRatio, setIsSameRatio] = useState<boolean>(false);
  const [checkingRatio, setCheckingRatio] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [imgDim, setImgDim] = useState({ width: 1, height: 1 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 核心修复：比例检测逻辑 ---
  useEffect(() => {
    let isMounted = true;

    const checkDimensions = async () => {
      // 1. 只要图片变化，先重置状态为“不一致”，防止UI闪烁或残留
      setIsSameRatio(false);
      setErrorMsg(null);

      if (originalImageUrl && generatedImage?.url) {
        setCheckingRatio(true);
        try {
          // 并行获取两张图片的尺寸
          const [originalSize, generatedSize] = await Promise.all([
            getImageDimensions(originalImageUrl),
            getImageDimensions(normalizeUrl(generatedImage.url))
          ]);

          if (!isMounted) return;

          const w1 = originalSize.width;
          const h1 = originalSize.height;
          const w2 = generatedSize.width;
          const h2 = generatedSize.height;

          const r1 = w1 / h1;
          const r2 = w2 / h2;

          // 调试日志：如果发现不对劲，可以看控制台
          console.log(`[ImageCompare] Original: ${w1}x${h1} (Ratio: ${r1.toFixed(3)})`);
          console.log(`[ImageCompare] Generated: ${w2}x${h2} (Ratio: ${r2.toFixed(3)})`);
          
          setImgDim(generatedSize);

          // 核心判断：允许 0.01 的浮点数误差
          const isRatioMatch = Math.abs(r1 - r2) < 0.01;

          if (isRatioMatch) {
            console.log('[ImageCompare] Ratios match. Using Slider.');
            setIsSameRatio(true);
          } else {
            console.log('[ImageCompare] Ratios mismatch. Using Side-by-Side.');
            setIsSameRatio(false);
          }
        } catch (error) {
          console.error("[ImageCompare] Failed to load image dimensions:", error);
          if (isMounted) {
            setIsSameRatio(false); // 出错则降级为并列显示
            setErrorMsg("无法读取图片尺寸，已切换为并列视图");
          }
        } finally {
          if (isMounted) setCheckingRatio(false);
        }
      } else {
        if (isMounted) {
          setIsSameRatio(false);
          setCheckingRatio(false);
        }
      }
    };

    checkDimensions();

    return () => { isMounted = false; };
  }, [originalImageUrl, generatedImage]); // 依赖项变化时重新执行

  // 滑块交互
  const handleMouseMove = (e: React.MouseEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    }
  };

  // --- 渲染部分 ---

  const renderContent = () => {
    // 1. 如果正在计算尺寸或加载任务，显示 Loading
    if (loading || checkingRatio) {
      return (
        <Space direction="vertical" align="center" style={{ width: '100%', padding: '60px 0' }}>
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 16 }}>
            {waitingTasks.length > 0 ? (
              <FormattedMessage id="create.image.polling" defaultMessage="正在生成图片，请稍候..." />
            ) : (
              <FormattedMessage id="create.image.analyzing" defaultMessage="正在处理..." />
            )}
          </Text>
        </Space>
      );
    }

    // 2. 如果没有生成结果，显示 Empty
    if (!generatedImage) {
      return (
        <Empty
          image={<FileImageOutlined style={{ fontSize: 48, color: '#aaa' }} />}
          description={
            <Text type="secondary">
              <FormattedMessage id="create.i2i.empty" defaultMessage="生成结果与原图对比将显示在此处" />
            </Text>
          }
        />
      );
    }

    // 3. 有结果，开始渲染对比界面
    return (
      <div style={{ width: '100%' }}>
        {/* Header Title & Actions */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <FormattedMessage id="create.i2i.result" defaultMessage="生成对比" />
          </Title>
          
          <Space>
            {errorMsg && <Text type="warning" style={{fontSize: 12}}><WarningOutlined /> {errorMsg}</Text>}
            
            {/* 只有在比例一致且有原图时，才允许切换视图 */}
            {isSameRatio && originalImageUrl && (
              <Button 
                type="text" 
                icon={isSameRatio ? <ColumnWidthOutlined /> : <SplitCellsOutlined />}
                onClick={() => setIsSameRatio(!isSameRatio)}
              >
                 <FormattedMessage id="view.switch" defaultMessage="切换视图" />
              </Button>
            )}
            
            <Button type="primary" icon={<DownloadOutlined />} href={normalizeUrl(generatedImage.url)} download={`generated_${Date.now()}.png`}>
              <FormattedMessage id="create.download" defaultMessage="下载" />
            </Button>
          </Space>
        </div>

        {/* 核心判断：只有 isSameRatio 为 true 且有原图时，才显示 Slider */}
        {isSameRatio && originalImageUrl ? (
          
          /* === 方案 A: 滑块对比 (Slider) === */
          <CompareContainer>
            <SliderWrapper 
              width={imgDim.width} 
              height={imgDim.height}
              ref={sliderRef}
              onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)}
              onClick={handleMouseMove}
            >
              {/* 底图: 结果 (确保 object-fit: fill) */}
              <img src={normalizeUrl(generatedImage.url)} alt="Result" draggable={false} />
              
              {/* 顶图: 原图 (带遮罩) */}
              <OverlayImage position={sliderPosition}>
                {/* 关键：强制设置宽高与容器一致，配合 object-fit: fill 确保完美重叠 */}
                <img 
                  src={originalImageUrl} 
                  alt="Original" 
                  draggable={false} 
                  style={{ 
                    width: sliderRef.current?.offsetWidth || '100%', 
                    height: sliderRef.current?.offsetHeight || '100%',
                    objectFit: 'fill'
                  }} 
                />
              </OverlayImage>
              
              <SliderHandle position={sliderPosition} />

              {/* 浮动标签 */}
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, pointerEvents:'none' }}>
                <FormattedMessage id="create.i2i.original" defaultMessage="原图" />
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(82, 196, 26, 0.9)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, pointerEvents:'none' }}>
                <FormattedMessage id="create.image.result" defaultMessage="结果" />
              </div>
            </SliderWrapper>
          </CompareContainer>

        ) : (

          /* === 方案 B: 左右并列 (Side by Side) === */
          <SideBySideWrapper>
            {/* 原图 */}
            {originalImageUrl && (
              <div className="image-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: isDark ? '#aaa' : '#666' }}>
                  <FileImageOutlined /> <FormattedMessage id="create.i2i.original" defaultMessage="原图" />
                </div>
                <div className="img-card">
                  <Image src={originalImageUrl} style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }} />
                </div>
              </div>
            )}
            {/* 结果图 */}
            <div className="image-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#1890ff' }}>
                <CheckCircleOutlined /> <FormattedMessage id="create.image.result" defaultMessage="生成结果" />
              </div>
              <div className="img-card">
                <Image src={normalizeUrl(generatedImage.url)} style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }} />
              </div>
            </div>
          </SideBySideWrapper>
        )}

        {/* 底部信息栏 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: 16, 
          paddingTop: 12,
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <FormattedMessage 
              id="create.image.info" 
              defaultMessage="比例: {ratio} | 分辨率: {res}" 
              values={{ 
                ratio: generatedImage.aspectRatio || 'auto',
                res: generatedImage.resolution || `${imgDim.width}x${imgDim.height}`
              }} 
            />
          </Text>
        </div>
      </div>
    );
  };

  return (
    <Col xs={24} lg={15}>
      <ResultArea>
        {renderContent()}
      </ResultArea>
    </Col>
  );
};

export default ImageResultDisplay;