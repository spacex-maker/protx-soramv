import React from 'react';
import { 
  Typography, 
  Button, 
  Row, 
  Col, 
  Space, 
  Empty,
  Spin,
} from 'antd';
import { 
  DownloadOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { ImageResult, WaitingTask } from './types';
import { ResultArea } from './styles';
import { normalizeUrl } from './utils';

const { Title, Text } = Typography;

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
  return (
    <Col xs={24} lg={15}>
      <ResultArea>
        {loading ? (
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text type="secondary" style={{ marginTop: 16 }}>
              {waitingTasks.length > 0 ? (
                <FormattedMessage 
                  id="create.image.polling" 
                  defaultMessage="正在生成图片，请稍候..." 
                />
              ) : (
                <FormattedMessage 
                  id="create.image.analyzing" 
                  defaultMessage="正在处理图片和提示词..." 
                />
              )}
            </Text>
          </Space>
        ) : generatedImage ? (
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <FormattedMessage id="create.i2i.result" defaultMessage="生成对比" />
              </Title>
              <Button type="primary" icon={<DownloadOutlined />} href={generatedImage.url} download="sora_mv_i2i_image.png">
                <FormattedMessage id="create.download" defaultMessage="下载图片" />
              </Button>
            </div>
            <Row gutter={[24, 16]}>
              {/* 原图对比 */}
              <Col span={12}>
                <div style={{ 
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)', 
                  borderRadius: 12, 
                  padding: 16,
                  height: '100%'
                }}>
                  <div style={{ 
                    marginBottom: 12, 
                    fontWeight: 600, 
                    fontSize: 14,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6,
                    color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'
                  }}>
                    <FileImageOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.i2i.original" defaultMessage="原图" />
                  </div>
                  <div style={{ 
                    width: '100%', 
                    aspectRatio: '16 / 9',
                    borderRadius: 8, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'
                  }}>
                    <img 
                      src={originalImageUrl || "https://placehold.co/400x225?text=Original+Image"} 
                      alt="Original Preview" 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              </Col>
              
              {/* 生成图片预览 */}
              <Col span={12}>
                <div style={{ 
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.12) 100%)' 
                    : 'linear-gradient(135deg, rgba(24, 144, 255, 0.04) 0%, rgba(24, 144, 255, 0.08) 100%)', 
                  borderRadius: 12, 
                  padding: 16,
                  height: '100%'
                }}>
                  <div style={{ 
                    marginBottom: 12, 
                    fontWeight: 600, 
                    fontSize: 14,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6,
                    color: '#1890ff'
                  }}>
                    <FileImageOutlined />
                    <FormattedMessage id="create.image.result" defaultMessage="生成图片" />
                  </div>
                  <div style={{ 
                    width: '100%', 
                    aspectRatio: '16 / 9',
                    borderRadius: 8, 
                    overflow: 'hidden',
                    background: '#000'
                  }}>
                    <img 
                      src={normalizeUrl(generatedImage.url)}
                      alt="Generated Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              </Col>
            </Row>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginTop: 16,
              padding: '12px 0',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <FormattedMessage 
                  id="create.image.info" 
                  defaultMessage="比例: {ratio}" 
                  values={{ 
                    ratio: generatedImage.aspectRatio || 'auto'
                  }} 
                />
              </Text>
            </div>
          </div>
        ) : (
          <Empty
            image={<FileImageOutlined style={{ fontSize: 48, color: '#aaa' }} />}
            description={
              <Text type="secondary">
                <FormattedMessage id="create.i2i.empty" defaultMessage="生成结果与原图对比将显示在此处" />
              </Text>
            }
          />
        )}
      </ResultArea>
    </Col>
  );
};

export default ImageResultDisplay;
