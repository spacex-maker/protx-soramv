import React, { useState, useRef } from 'react';
import { 
  Typography, 
  Button, 
  Col, 
  Space, 
  Empty,
  Spin,
  Image, // Ant Design Image
} from 'antd';
import { 
  DownloadOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  ColumnWidthOutlined,
  SplitCellsOutlined,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ImageResult, WaitingTask } from './types';
import { ResultArea } from './styles'; 
import { normalizeUrl } from './utils';

const { Title, Text } = Typography;

// ================= STYLED COMPONENTS =================

const CompareContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 16px;
  background: #f0f2f5; /* 给个背景色，方便看清边界 */
  border-radius: 12px;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  line-height: 0;
`;

const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  cursor: ew-resize; /* 鼠标样式：左右拖拽 */

  /* 核心修复：所有图片强制保持比例，绝对不拉伸 */
  img {
    display: block;
    width: 100%;
    height: 100%; /* 配合 absolute 铺满 */
    object-fit: contain; /* 关键：保持比例，居中对齐 */
    object-position: center; /* 关键：确保两张图中心重合 */
    pointer-events: none;
  }

  /* 1. 幽灵图 (Spacer) */
  /* 它的作用只是把容器撑开到正确的高度 (height: auto) */
  /* 它决定了整个对比区域的尺寸 */
  .ghost-img {
    position: relative; /* 相对定位，占据文档流 */
    width: 100%;
    height: auto;       /* 高度自适应 */
    opacity: 0;         /* 不可见 */
    visibility: hidden;
  }

  /* 2. 底层图 (结果图) */
  .bottom-img {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  /* 3. 顶层图 (原图) */
  /* 使用 clip-path 裁剪，不会改变图片的物理尺寸 */
  .top-img {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    will-change: clip-path;
  }
`;

const SliderHandle = styled.div.attrs<{ position: number }>(props => ({
  style: {
    left: `${props.position}%`
  }
}))<{ position: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #fff;
  z-index: 20;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  pointer-events: none;
  filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));

  /* 拖拽手柄图标 */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 32px;
    height: 32px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='%23333'%3E%3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z'/%3E%3C/svg%3E");
  }
`;

// 修复：并列显示的容器
const SideBySideWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  margin-top: 16px;
  flex-wrap: wrap;

  .image-box {
    flex: 1;
    min-width: 300px; /* 最小宽度，防止太窄 */
    display: flex;
    flex-direction: column;
    gap: 12px;

    .img-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      padding-left: 4px;
    }

    .img-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      background: rgba(0,0,0,0.02);
      border: 1px solid rgba(0,0,0,0.05);
      
      /* 关键修复：不要用 display:flex，防止 AntD Image 塌陷 */
      text-align: center;
      position: relative;
      
      /* 强制 AntD 图片容器样式 */
      .ant-image {
        width: 100%;
        display: block; /* 消除间隙 */
      }
      
      img {
        width: 100%;
        height: auto;
        max-height: 500px; /* 限制最大高度，防止霸屏 */
        object-fit: contain; /* 保证看全 */
      }
    }
  }
`;

// ================= COMPONENT =================

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
  const [useSliderView, setUseSliderView] = useState<boolean>(true); // 默认开启滑块
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 鼠标移动处理
  const handleMouseMove = (e: React.MouseEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    }
  };

  // 触摸屏移动处理
  const handleTouchMove = (e: React.TouchEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    }
  };

  const renderContent = () => {
    if (loading) {
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

    // 确定结果图 URL
    const resultUrl = normalizeUrl(generatedImage.url);

    return (
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <FormattedMessage id="create.i2i.result" defaultMessage="生成对比" />
          </Title>
          
          <Space>
            {originalImageUrl && (
              <Button 
                type="text" 
                icon={useSliderView ? <SplitCellsOutlined /> : <ColumnWidthOutlined />}
                onClick={() => setUseSliderView(!useSliderView)}
              >
                 {useSliderView ? (
                   <FormattedMessage id="view.switch.sidebyside" defaultMessage="并列对比" />
                 ) : (
                   <FormattedMessage id="view.switch.slider" defaultMessage="滑块对比" />
                 )}
              </Button>
            )}
            
            <Button type="primary" icon={<DownloadOutlined />} href={resultUrl} download={`generated_${Date.now()}.png`}>
              <FormattedMessage id="create.download" defaultMessage="下载" />
            </Button>
          </Space>
        </div>

        {useSliderView && originalImageUrl ? (
          // =================== 滑块模式 (CLIP-PATH 方案) ===================
          <CompareContainer>
            <SliderWrapper 
              ref={sliderRef}
              onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)}
              onClick={handleMouseMove}
              onTouchMove={handleTouchMove}
            >
              {/* 1. 幽灵图 (Spacer): 
                它的 width: 100%, height: auto。
                它是唯一一个真正占据文档流的元素，它的高度就是整个容器的高度。
              */}
              <img 
                src={resultUrl} 
                className="ghost-img"
                alt="" 
                draggable={false}
              />

              {/* 2. 底层图 (结果图): 
                absolute, width 100%, height 100% (铺满容器)
                object-fit: contain (保证在容器内居中显示，不拉伸)
              */}
              <img 
                src={resultUrl} 
                alt="Result" 
                className="bottom-img"
                draggable={false} 
              />
              
              {/* 3. 顶层图 (原图): 
                配置同上。因为配置完全一样，所以两张图的显示区域绝对重合。
                clip-path 负责裁剪，只显示左边部分。
              */}
              <img 
                src={originalImageUrl} 
                alt="Original" 
                className="top-img"
                draggable={false} 
                style={{
                  // 这里的百分比仅仅控制裁剪框，不影响图片本身的宽高
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                }}
              />
              
              <SliderHandle position={sliderPosition} />

              {/* 浮动标签 */}
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, pointerEvents:'none', zIndex: 30 }}>
                <FormattedMessage id="create.i2i.original" defaultMessage="原图" />
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(82, 196, 26, 0.9)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, pointerEvents:'none', zIndex: 30 }}>
                <FormattedMessage id="create.image.result" defaultMessage="结果" />
              </div>
            </SliderWrapper>
          </CompareContainer>
        ) : (
          // =================== 并列模式 (修复塌陷) ===================
          <SideBySideWrapper>
            {originalImageUrl && (
              <div className="image-box">
                <div className="img-header" style={{ color: isDark ? '#aaa' : '#666' }}>
                  <FileImageOutlined /> <FormattedMessage id="create.i2i.original" defaultMessage="原图" />
                </div>
                <div className="img-card">
                  {/* Ant Design Image 必须确保能撑开宽度 */}
                  <Image src={originalImageUrl} />
                </div>
              </div>
            )}
            <div className="image-box">
              <div className="img-header" style={{ color: '#1890ff' }}>
                <CheckCircleOutlined /> <FormattedMessage id="create.image.result" defaultMessage="生成结果" />
              </div>
              <div className="img-card">
                <Image src={resultUrl} />
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
            {generatedImage.aspectRatio && (
              <>
                <FormattedMessage id="create.image.ratio.label" defaultMessage="比例" />: {generatedImage.aspectRatio}
                {generatedImage.resolution && ' | '}
              </>
            )}
            {generatedImage.resolution && (
              <>
                <FormattedMessage id="create.image.resolution.label" defaultMessage="分辨率" />: {generatedImage.resolution}
              </>
            )}
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