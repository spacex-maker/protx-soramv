import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Input, 
  Button, 
  Select, 
  Slider, 
  Row, 
  Col, 
  Form, 
  Space, 
  message, 
  Image, 
  Empty,
  Spin,
  Tooltip
} from 'antd';
import { 
  ThunderboltOutlined, 
  DownloadOutlined, 
  PictureOutlined, 
  SettingOutlined,
  InfoCircleOutlined,
  EditOutlined,
  FileImageOutlined,
  AppstoreOutlined,
  NumberOutlined,
  SlidersOutlined,
  CheckCircleOutlined,
  SwapOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text } = Typography;
const { TextArea } = Input;

// --- 样式定义 ---

const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  
  .ant-card-body {
    padding: 24px;
  }
`;

const ResultArea = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f9f9f9'};
  border-radius: 12px;
  padding: 20px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
  position: relative;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
`;

const ImageWrapper = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    .image-actions {
      opacity: 1;
    }
  }
`;

const ImageActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

// --- 模拟数据与配置 ---

// 使用国际化函数生成选项
const getAspectRatios = (intl: any) => [
  { label: intl.formatMessage({ id: 'create.aspectRatio.1:1', defaultMessage: '1:1 (Square)' }), value: '1:1' },
  { label: intl.formatMessage({ id: 'create.aspectRatio.16:9', defaultMessage: '16:9 (Landscape)' }), value: '16:9' },
  { label: intl.formatMessage({ id: 'create.aspectRatio.9:16', defaultMessage: '9:16 (Portrait)' }), value: '9:16' },
  { label: intl.formatMessage({ id: 'create.aspectRatio.4:3', defaultMessage: '4:3 (Classic)' }), value: '4:3' },
];

const getStyles = (intl: any) => [
  { label: intl.formatMessage({ id: 'create.style.general', defaultMessage: '通用 (General)' }), value: 'general' },
  { label: intl.formatMessage({ id: 'create.style.anime', defaultMessage: '动漫 (Anime)' }), value: 'anime' },
  { label: intl.formatMessage({ id: 'create.style.realistic', defaultMessage: '写实 (Realistic)' }), value: 'realistic' },
  { label: intl.formatMessage({ id: 'create.style.3d-render', defaultMessage: '3D 渲染 (3D Render)' }), value: '3d-render' },
  { label: intl.formatMessage({ id: 'create.style.cyberpunk', defaultMessage: '赛博朋克 (Cyberpunk)' }), value: 'cyberpunk' },
];

// --- 组件主体 ---

const TextToImage: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // 模拟 API 调用
  const handleGenerate = async (values: any) => {
    setLoading(true);
    setGeneratedImages([]); // 清空旧图

    try {
      // 这里替换为真实的 API 调用
      console.log('Generating with params:', values);
      
      // 模拟 2秒 延迟
      await new Promise(resolve => setTimeout(resolve, 2500));

      // 模拟返回图片 (使用 picsum 随机图)
      const mockImages = Array.from({ length: values.batchSize || 2 }).map((_, i) => 
        `https://picsum.photos/seed/${Math.random()}/512/512`
      );
      
      setGeneratedImages(mockImages);
      message.success(intl.formatMessage({ id: 'create.success', defaultMessage: '生成成功！' }));
    } catch (error) {
      message.error(intl.formatMessage({ id: 'create.error', defaultMessage: '生成失败，请重试' }));
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url: string) => {
    // 简单的下载模拟逻辑
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <StyledCard>
      <Row gutter={[32, 24]}>
        
        {/* --- 左侧：控制面板 --- */}
        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ marginBottom: 8 }}>
              <Title level={3} style={{ margin: 0, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <SwapOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                <FormattedMessage id="create.textToImage.title" defaultMessage="AI 文生图" />
              </Title>
              <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PictureOutlined style={{ fontSize: 14 }} />
                <FormattedMessage 
                  id="create.textToImage.subtitle" 
                  defaultMessage="输入描述，让 AI 绘制您想象中的画面" 
                />
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                aspectRatio: '1:1',
                style: 'general',
                batchSize: 2,
                steps: 30
              }}
            >
              {/* 提示词输入 */}
              <Form.Item
                name="prompt"
                label={
                  <Space>
                    <EditOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.prompt" defaultMessage="提示词 (Prompt)" />
                  </Space>
                }
                rules={[{ required: true, message: intl.formatMessage({ id: 'create.prompt.required', defaultMessage: '请输入提示词' }) }]}
                style={{ marginBottom: 20 }}
              >
                <TextArea 
                  rows={5} 
                  placeholder={intl.formatMessage({ id: 'create.prompt.placeholder', defaultMessage: '例如：一只在太空中漫步的赛博朋克猫咪，霓虹灯背景，高清细节...' })} 
                  maxLength={1000}
                  showCount
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              {/* 反向提示词 (可选) */}
              <Form.Item
                name="negativePrompt"
                label={
                  <Space>
                    <EditOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                    <FormattedMessage id="create.negativePrompt" defaultMessage="反向提示词 (Negative)" />
                    <Tooltip title={intl.formatMessage({ id: 'create.negativePrompt.tooltip', defaultMessage: '你不希望画面中出现的元素' })}>
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <Input placeholder={intl.formatMessage({ id: 'create.negativePrompt.placeholder', defaultMessage: '例如：模糊，低质量，变形的手指...' })} />
              </Form.Item>

              {/* 参数设置行 */}
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <Form.Item
                    name="aspectRatio"
                    label={
                      <Space>
                        <FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                        <FormattedMessage id="create.ratio" defaultMessage="画面比例" />
                      </Space>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Select options={getAspectRatios(intl)} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="style"
                    label={
                      <Space>
                        <AppstoreOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                        <FormattedMessage id="create.style" defaultMessage="艺术风格" />
                      </Space>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Select options={getStyles(intl)} />
                  </Form.Item>
                </Col>
              </Row>

              {/* 高级滑块 */}
              <Form.Item
                name="batchSize"
                label={
                  <Space>
                    <NumberOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.batchSize" defaultMessage="生成数量" />
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <Slider min={1} max={4} marks={{ 1: '1', 2: '2', 3: '3', 4: '4' }} />
              </Form.Item>

              {/* 提交按钮 */}
              <Form.Item style={{ marginTop: 16 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<ThunderboltOutlined />} 
                  size="large" 
                  block
                  loading={loading}
                  style={{ height: 48, fontSize: 16, borderRadius: 24 }}
                >
                  {loading ? <FormattedMessage id="create.generating" defaultMessage="正在绘制..." /> : <FormattedMessage id="create.generate" defaultMessage="立即生成" />}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Col>

        {/* --- 右侧：结果展示区 --- */}
        <Col xs={24} lg={15}>
          <ResultArea>
            {loading ? (
              <Space direction="vertical" align="center">
                <Spin size="large" />
                <Text type="secondary" style={{ marginTop: 16 }}>
                  <FormattedMessage id="create.generating.waiting" defaultMessage="AI 正在挥洒创意，请稍候..." />
                </Text>
              </Space>
            ) : generatedImages.length > 0 ? (
              <div style={{ width: '100%' }}>
                <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <FormattedMessage id="create.result.title" defaultMessage="生成结果" />
                  </Title>
                  <Button type="text" icon={<DownloadOutlined />}>
                    <FormattedMessage id="create.downloadAll" defaultMessage="全部下载" />
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
                          style={{ objectFit: 'cover', aspectRatio: '1/1' }}
                        />
                        <ImageActions className="image-actions">
                          <Button 
                            shape="circle" 
                            icon={<DownloadOutlined />} 
                            onClick={() => downloadImage(src)}
                            style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', border: 'none' }}
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
                      <FormattedMessage id="create.empty" defaultMessage="暂无生成记录，快去左侧输入灵感吧！" />
                    </Text>
                  </Space>
                }
              />
            )}
          </ResultArea>
        </Col>
      </Row>
    </StyledCard>
  );
};

export default TextToImage;