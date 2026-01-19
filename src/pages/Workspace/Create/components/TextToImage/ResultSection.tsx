import React from 'react';
import {
  Typography,
  Button,
  Empty,
  Spin,
  Image,
  Space,
} from 'antd';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import {
  ResultArea,
  ImageGrid,
  ImageWrapper,
  ImageActions,
} from './styles';

const { Title, Text } = Typography;

interface ResultSectionProps {
  loading: boolean;
  generatedImages: string[];
  downloadImage: (url: string, index?: number) => void;
  downloadAllImages: () => void;
}

const ResultSection: React.FC<ResultSectionProps> = ({
  loading,
  generatedImages,
  downloadImage,
  downloadAllImages,
}) => {
  return (
    <ResultArea>
      {loading ? (
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text
            type="secondary"
            style={{ marginTop: 16, textAlign: 'center' }}
          >
            <FormattedMessage
              id="create.generating.waiting"
              defaultMessage="AI 正在挥洒创意，请稍候..."
            />
          </Text>
          <Text
            type="secondary"
            style={{ marginTop: 8, fontSize: 12, textAlign: 'center' }}
          >
            <FormattedMessage
              id="create.generating.tip"
              defaultMessage="图片生成可能需要几分钟时间，请耐心等待，不要关闭页面"
            />
          </Text>
        </Space>
      ) : generatedImages.length > 0 ? (
        <div style={{ width: '100%' }}>
          <div
            style={{
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Title
              level={4}
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <FormattedMessage
                id="create.result.title"
                defaultMessage="生成结果"
              />
            </Title>
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={downloadAllImages}
            >
              <FormattedMessage
                id="create.downloadAll"
                defaultMessage="全部下载"
              />
            </Button>
          </div>

          <Image.PreviewGroup>
            <ImageGrid>
              {generatedImages.map((src, index) => (
                <ImageWrapper key={index}>
                  <Image
                    src={src}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'contain', cursor: 'pointer' }}
                    preview={{
                      mask: <EyeOutlined style={{ fontSize: 16 }} />,
                    }}
                  />
                  <ImageActions className="image-actions">
                    <Button
                      shape="circle"
                      icon={<DownloadOutlined />}
                      onClick={() => downloadImage(src, index)}
                      style={{
                        color: '#fff',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                      }}
                    />
                  </ImageActions>
                </ImageWrapper>
              ))}
            </ImageGrid>
          </Image.PreviewGroup>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" align="center">
              <Text type="secondary">
                <FormattedMessage
                  id="create.empty"
                  defaultMessage="暂无生成记录，快去左侧输入灵感吧！"
                />
              </Text>
            </Space>
          }
        />
      )}
    </ResultArea>
  );
};

export default ResultSection;
