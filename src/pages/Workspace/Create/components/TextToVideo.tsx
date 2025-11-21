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
  ThunderboltOutlined, // 使用兼容性好的闪电图标
  DownloadOutlined, 
  VideoCameraOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined
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

// --- 模拟数据与配置 ---

// 视频比例
const ASPECT_RATIOS = [
  { label: '16:9 (宽屏)', value: '16:9' },
  { label: '9:16 (竖屏)', value: '9:16' },
  { label: '21:9 (电影)', value: '21:9' },
  { label: '1:1 (方屏)', value: '1:1' },
];

// 镜头运动
const CAMERA_MOTIONS = [
  { label: '无运动 (None)', value: 'none' },
  { label: '向前推 (Zoom In)', value: 'zoom_in' },
  { label: '向后拉 (Dolly Out)', value: 'dolly_out' },
  { label: '向左平移 (Pan Left)', value: 'pan_left' },
  { label: '向上倾斜 (Tilt Up)', value: 'tilt_up' },
  { label: '360° 环绕 (Orbital)', value: 'orbital' },
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
            <div>
              <Title level={3} style={{ margin: 0 }}>
                <FormattedMessage id="create.textToVideo.title" defaultMessage="AI 文生视频" />
              </Title>
              <Text type="secondary">
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
                label={<FormattedMessage id="create.prompt" defaultMessage="场景描述 (Prompt)" />}
                rules={[{ required: true, message: '请输入视频场景描述' }]}
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
                    <FormattedMessage id="create.negativePrompt" defaultMessage="反向提示词 (Negative)" />
                    <Tooltip title="你不希望画面中出现的元素">
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                }
              >
                <Input placeholder="例如：水渍，闪烁，低分辨率，人物模糊..." />
              </Form.Item>

              {/* 视频参数设置 */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="aspectRatio"
                    label={<FormattedMessage id="create.video.ratio" defaultMessage="视频比例" />}
                  >
                    <Select options={ASPECT_RATIOS} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="cameraMotion"
                    label={<FormattedMessage id="create.video.camera" defaultMessage="镜头运动" />}
                  >
                    <Select options={CAMERA_MOTIONS} />
                  </Form.Item>
                </Col>
              </Row>

              {/* 时长控制 */}
              <Form.Item
                name="duration"
                label={
                  <Space>
                    <FormattedMessage id="create.video.duration" defaultMessage="视频时长 (秒)" />
                    <Text type="secondary">({form.getFieldValue('duration')}s)</Text>
                  </Space>
                }
              >
                <Slider min={4} max={15} marks={{ 4: '4s', 8: '8s', 15: '15s' }} tooltip={{ formatter: (val) => `${val}s` }} />
              </Form.Item>


              {/* 提交按钮 */}
              <Form.Item style={{ marginTop: 32 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<ThunderboltOutlined />} 
                  size="large" 
                  block
                  loading={loading}
                  style={{ height: 48, fontSize: 16 }}
                >
                  {loading ? 'Sora 正在构思中...' : <FormattedMessage id="create.generate.video" defaultMessage="立即生成视频" />}
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
                   正在分析提示词，构建 3D 世界...
                </Text>
              </Space>
            ) : generatedVideo ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5} style={{ margin: 0 }}>
                  <VideoCameraOutlined style={{ marginRight: 8 }} />
                  <FormattedMessage id="create.video.result" defaultMessage="最终视频预览" />
                </Title>
                
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
                    <Text type="secondary">时长: {generatedVideo.duration}s | 比例: {generatedVideo.aspectRatio}</Text>
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
        title="视频预览"
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