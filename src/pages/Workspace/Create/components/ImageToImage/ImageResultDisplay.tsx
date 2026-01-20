import React, { useState, useRef } from 'react';
import { 
  Typography, 
  Button, 
  Col, 
  Space, 
  Empty,
  Spin,
  Image,
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

const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  max-height: 600px;
  aspect-ratio: 16/9;
  user-select: none;
  cursor: ew-resize;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  background: #fff;
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
  const [useSliderView, setUseSliderView] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
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
            
            <Button type="primary" icon={<DownloadOutlined />} href={normalizeUrl(generatedImage.url)} download={`generated_${Date.now()}.png`}>
              <FormattedMessage id="create.download" defaultMessage="下载" />
            </Button>
          </Space>
        </div>

        {useSliderView && originalImageUrl ? (
          <CompareContainer>
            <SliderWrapper 
              ref={sliderRef}
              onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)}
              onClick={handleMouseMove}
            >
              <img src={normalizeUrl(generatedImage.url)} alt="Result" draggable={false} />
              
              <OverlayImage position={sliderPosition}>
                <img 
                  src={originalImageUrl} 
                  alt="Original" 
                  draggable={false} 
                  style={{ 
                    width: sliderRef.current?.offsetWidth || '100%', 
                    height: sliderRef.current?.offsetHeight || '100%',
                    objectFit: 'cover'
                  }} 
                />
              </OverlayImage>
              
              <SliderHandle position={sliderPosition} />

              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, pointerEvents:'none' }}>
                <FormattedMessage id="create.i2i.original" defaultMessage="原图" />
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(82, 196, 26, 0.9)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, pointerEvents:'none' }}>
                <FormattedMessage id="create.image.result" defaultMessage="结果" />
              </div>
            </SliderWrapper>
          </CompareContainer>
        ) : (
          <SideBySideWrapper>
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
