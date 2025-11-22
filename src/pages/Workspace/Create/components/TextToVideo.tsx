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
  Empty,
  Spin,
  Tooltip,
  Modal
} from 'antd';
import { 
  ThunderboltOutlined,
  DownloadOutlined, 
  VideoCameraOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  EditOutlined,
  FileImageOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  TabletOutlined,
  MobileOutlined,
  BorderOutlined,
  DesktopOutlined
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
  min-height: 550px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
  position: relative;
`;

const VideoPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9; /* 默认视频比例 */
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
    object-fit: cover;
  }
`;

const ActionOverlay = styled.div`
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

const AspectRatioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .anticon {
    font-size: 16px;
    color: #1890ff;
  }
`;

// --- 模拟数据与配置 ---

// 视频比例 - 使用国际化函数生成选项
const getAspectRatios = (intl: any) => [
  { 
    label: intl.formatMessage({ id: 'create.aspectRatio.16:9', defaultMessage: '16:9 (Landscape)' }), 
    value: '16:9',
    icon: <DesktopOutlined />
  },
  { 
    label: intl.formatMessage({ id: 'create.aspectRatio.9:16', defaultMessage: '9:16 (Portrait)' }), 
    value: '9:16',
    icon: <MobileOutlined />
  },
  { 
    label: intl.formatMessage({ id: 'create.aspectRatio.21:9', defaultMessage: '21:9 (Cinema)' }), 
    value: '21:9',
    icon: <VideoCameraOutlined />
  },
  { 
    label: intl.formatMessage({ id: 'create.aspectRatio.1:1', defaultMessage: '1:1 (Square)' }), 
    value: '1:1',
    icon: <AppstoreOutlined />
  },
];

// 镜头运动 - 使用国际化函数生成选项
const getCameraMotions = (intl: any) => [
  { label: intl.formatMessage({ id: 'create.cameraMotion.none', defaultMessage: '无运动 (None)' }), value: 'none' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.zoomIn', defaultMessage: '向前推 (Zoom In)' }), value: 'zoom_in' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.dollyOut', defaultMessage: '向后拉 (Dolly Out)' }), value: 'dolly_out' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.panLeft', defaultMessage: '向左平移 (Pan Left)' }), value: 'pan_left' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.tiltUp', defaultMessage: '向上倾斜 (Tilt Up)' }), value: 'tilt_up' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.orbital', defaultMessage: '360° 环绕 (Orbital)' }), value: 'orbital' },
];

// 模拟视频结果类型
interface VideoResult {
    url: string;
    aspectRatio: string;
    duration: number;
    thumbnail: string;
}

// --- 组件主体 ---

const TextToVideo: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 模拟 API 调用
  const handleGenerate = async (values: any) => {
    setLoading(true);
    setGeneratedVideo(null); 

    try {
      console.log('Generating video with params:', values);
      
      // 模拟 4 秒延迟
      await new Promise(resolve => setTimeout(resolve, 4000));

      const mockResult: VideoResult = {
        url: 'https://mockup.com/sample_video.mp4', // 替换为真实的视频 CDN 地址
        aspectRatio: values.aspectRatio,
        duration: values.duration,
        thumbnail: 'https://picsum.photos/seed/' + Math.random() + '/800/450', // 模拟视频封面
      };
      
      setGeneratedVideo(mockResult);
      message.success(intl.formatMessage({ id: 'create.success', defaultMessage: '视频生成成功！' }));
    } catch (error) {
      message.error(intl.formatMessage({ id: 'create.error', defaultMessage: '视频生成失败，请重试' }));
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenModal = () => {
      if (generatedVideo?.url) {
          setIsModalOpen(true);
      }
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
                <FormattedMessage id="create.textToVideo.title" defaultMessage="AI 文生视频" />
              </Title>
              <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <VideoCameraOutlined style={{ fontSize: 14 }} />
                <FormattedMessage 
                  id="create.textToVideo.subtitle" 
                  defaultMessage="输入场景描述与镜头控制，生成高品质视频" 
                />
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                aspectRatio: '16:9',
                cameraMotion: 'none',
                duration: 8,
              }}
            >
              {/* 提示词输入 */}
              <Form.Item
                name="prompt"
                label={
                  <Space>
                    <EditOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.prompt.video" defaultMessage="视频场景描述 (Prompt)" />
                  </Space>
                }
                rules={[{ 
                  required: true, 
                  message: intl.formatMessage({ 
                    id: 'create.prompt.video.required', 
                    defaultMessage: '请输入视频场景描述' 
                  }) 
                }]}
                style={{ marginBottom: 20 }}
              >
                <TextArea 
                  rows={4} 
                  placeholder={intl.formatMessage({ id: 'create.prompt.video.placeholder', defaultMessage: '例如：一只宇航员狗狗在月球表面跳舞，8K，电影光线，超现实主义。' })} 
                  maxLength={1500}
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
                    <Tooltip title={intl.formatMessage({ 
                      id: 'create.negativePrompt.tooltip', 
                      defaultMessage: '你不希望画面中出现的元素' 
                    })}>
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <Input placeholder={intl.formatMessage({ 
                  id: 'create.negativePrompt.video.placeholder', 
                  defaultMessage: '例如：水渍，闪烁，低分辨率，人物模糊...' 
                })} />
              </Form.Item>

              {/* 视频参数设置 */}
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <Form.Item
                    name="aspectRatio"
                    label={
                      <Space>
                        <FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                        <FormattedMessage id="create.video.ratio" defaultMessage="视频比例" />
                      </Space>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      optionLabelProp="label"
                    >
                      {getAspectRatios(intl).map(ratio => (
                        <Select.Option 
                          key={ratio.value} 
                          value={ratio.value}
                          label={
                            <AspectRatioOption>
                              {ratio.icon}
                              <span>{ratio.label}</span>
                            </AspectRatioOption>
                          }
                        >
                          <AspectRatioOption>
                            {ratio.icon}
                            <span>{ratio.label}</span>
                          </AspectRatioOption>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="cameraMotion"
                    label={
                      <Space>
                        <CameraOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                        <FormattedMessage id="create.video.camera" defaultMessage="镜头运动" />
                      </Space>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Select>
                      {getCameraMotions(intl).map(motion => (
                        <Select.Option key={motion.value} value={motion.value}>
                          {motion.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* 时长控制 */}
              <Form.Item
                name="duration"
                label={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.video.duration" defaultMessage="视频时长 (秒)" />
                    <Text type="secondary">
                      ({intl.formatMessage({ 
                        id: 'create.duration.format', 
                        defaultMessage: '{duration}s' 
                      }, { duration: form.getFieldValue('duration') })})
                    </Text>
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <Slider 
                  min={4} 
                  max={15} 
                  marks={{ 
                    4: intl.formatMessage({ id: 'create.duration.4s', defaultMessage: '4s' }), 
                    8: intl.formatMessage({ id: 'create.duration.8s', defaultMessage: '8s' }), 
                    15: intl.formatMessage({ id: 'create.duration.15s', defaultMessage: '15s' }) 
                  }} 
                  tooltip={{ 
                    formatter: (val) => intl.formatMessage({ 
                      id: 'create.duration.format', 
                      defaultMessage: '{duration}s' 
                    }, { duration: val }) 
                  }} 
                />
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
                  {loading ? (
                    <FormattedMessage id="create.sora.thinking" defaultMessage="Sora 正在构思中..." />
                  ) : (
                    <FormattedMessage id="create.generate.video" defaultMessage="立即生成视频" />
                  )}
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
                  <FormattedMessage 
                    id="create.video.analyzing" 
                    defaultMessage="正在分析提示词，构建 3D 世界..." 
                  />
                </Text>
              </Space>
            ) : generatedVideo ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <FormattedMessage id="create.video.result" defaultMessage="最终视频预览" />
                  </Title>
                </div>
                
                <VideoPlaceholder onClick={handleOpenModal}>
                    <img 
                        src={generatedVideo.thumbnail} 
                        alt="Video Thumbnail" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <ActionOverlay>
                        <PlayCircleOutlined style={{ fontSize: 60, color: 'white' }} />
                    </ActionOverlay>
                </VideoPlaceholder>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                    <Text type="secondary">
                      <FormattedMessage 
                        id="create.video.info" 
                        defaultMessage="时长: {duration}s | 比例: {ratio}" 
                        values={{ 
                          duration: generatedVideo.duration, 
                          ratio: generatedVideo.aspectRatio 
                        }} 
                      />
                    </Text>
                    <Button type="primary" icon={<DownloadOutlined />} href={generatedVideo.url} download="sora_mv_video.mp4">
                        <FormattedMessage id="create.download" defaultMessage="下载视频" />
                    </Button>
                </div>
              </Space>
            ) : (
              <Empty
                image={<VideoCameraOutlined style={{ fontSize: 48, color: '#aaa' }} />}
                description={
                  <Text type="secondary">
                    <FormattedMessage id="create.video.empty" defaultMessage="生成结果将显示在此处" />
                  </Text>
                }
              />
            )}
          </ResultArea>
        </Col>
      </Row>
      
      {/* 视频播放 Modal */}
      <Modal
        title={<FormattedMessage id="create.video.preview" defaultMessage="视频预览" />}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose={true} // 关闭时销毁视频，节省资源
        width={800}
        centered
        bodyStyle={{ padding: 0 }}
      >
        {/* 真正的视频播放器 */}
        <video controls autoPlay style={{ width: '100%', maxHeight: '70vh', display: 'block' }}>
            {/* 这里的 src 需要是真正的视频地址 */}
            <source src={generatedVideo?.url} type="video/mp4" />
            <FormattedMessage id="video.not.supported" defaultMessage="您的浏览器不支持视频播放。" />
        </video>
      </Modal>
    </StyledCard>
  );
};

export default TextToVideo;