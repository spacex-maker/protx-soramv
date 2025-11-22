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
  Modal,
} from 'antd';
import { 
  ThunderboltOutlined, 
  DownloadOutlined, 
  VideoCameraOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  FileImageOutlined,
  EditOutlined,
  SlidersOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  InboxOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SwapOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text } = Typography;
const { TextArea } = Input;

// --- 样式定义 (保持一致性) ---

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
  aspect-ratio: 16 / 9; 
  background: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 16px;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// 左侧：输入图片容器
const InputImageContainer = styled.div`
  width: 100%;
  height: 260px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: transparent;

  &:hover .overlay-actions {
    opacity: 1;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    width: auto !important; 
    height: auto !important;
    object-fit: contain; 
    display: block;
    border-radius: 12px;
  }
`;

// 输入图片的遮罩层
const OverlayActions = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
`;

// 自定义上传区域
const CustomUploadArea = styled.div<{ $isDark?: boolean; $isDragging?: boolean }>`
  width: 100%;
  height: 260px;
  border-radius: 12px;
  border: 1px dashed ${props => props.$isDark ? '#444' : '#d9d9d9'};
  background: ${props => props.$isDark ? '#1f1f1f' : '#fafafa'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.$isDragging && `
    border-color: #1890ff;
    background: ${props.$isDark ? '#2a2a2a' : '#f0f7ff'};
  `}
  
  &:hover {
    border-color: #1890ff;
  }
  
  input[type="file"] {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

const UploadIcon = styled.div<{ $isDark?: boolean }>`
  margin-bottom: 16px;
  color: #1890ff;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadText = styled.div<{ $isDark?: boolean }>`
  color: ${props => props.$isDark ? '#fff' : '#333'};
  font-size: 16px;
  margin-bottom: 8px;
`;

const UploadHint = styled.div<{ $isDark?: boolean }>`
  color: ${props => props.$isDark ? '#999' : '#999'};
  font-size: 12px;
`;

const UploadPreview = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  border-radius: 12px;
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

// 视频时长
const DURATIONS = [
  { label: '4s (短)', value: 4 },
  { label: '8s (标准)', value: 8 },
  { label: '15s (长)', value: 15 },
];

// 镜头运动
const CAMERA_MOTIONS = [
  { label: '无运动 (None)', value: 'none' },
  { label: '向前推 (Zoom In)', value: 'zoom_in' },
  { label: '向后拉 (Dolly Out)', value: 'dolly_out' },
  { label: '向左平移 (Pan Left)', value: 'pan_left' },
];

// 模拟视频结果类型
interface VideoResult {
    url: string;
    aspectRatio: string;
    duration: number;
    thumbnail: string;
}

// --- 工具函数 ---

// 将文件转换为 base64 预览 URL
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });


// --- 组件主体 ---

const ImageToVideo: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 图片上传状态
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // 监听主题变化
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  // 处理文件选择
  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setOriginalImageUrl(null);
      form.setFieldsValue({ inputFile: undefined });
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件');
      return;
    }

    try {
      const url = await getBase64(file);
      setOriginalImageUrl(url);
      form.setFieldsValue({ inputFile: file.name });
    } catch (error) {
      message.error('图片读取失败');
    }
  };

  // 处理文件输入变化
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOriginalImageUrl(null);
    form.setFieldsValue({ inputFile: undefined });
    const fileInput = document.getElementById('i2v-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };


  // 模拟 API 调用
  const handleGenerate = async (values: any) => {
    if (!originalImageUrl) {
        message.warning(intl.formatMessage({ id: 'create.i2v.upload.warning', defaultMessage: '请先上传一张图片作为生成参考。' }));
        return;
    }

    setLoading(true);
    setGeneratedVideo(null); 

    try {
      console.log('Generating Image-to-Video with params:', values);
      
      // 模拟 5 秒延迟 (视频生成通常更慢)
      await new Promise(resolve => setTimeout(resolve, 5000));

      const mockResult: VideoResult = {
        url: 'https://mockup.com/i2v_sample_video.mp4', 
        aspectRatio: '16:9', // 简化处理，默认 16:9
        duration: values.duration,
        thumbnail: 'https://picsum.photos/seed/' + Math.random() + '/800/450', 
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
                <FormattedMessage id="create.imageToVideo.title" defaultMessage="AI 图生视频" />
              </Title>
              <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <VideoCameraOutlined style={{ fontSize: 14 }} />
                <FormattedMessage 
                  id="create.imageToVideo.subtitle" 
                  defaultMessage="赋予静态图片生命，通过提示词控制运动" 
                />
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                cameraMotion: 'none',
                duration: 8,
                motionStrength: 0.7, // I2V 核心参数
              }}
            >
             
             {/* 1. 上传图片区域 */}
              <Form.Item
                name="inputFile"
                label={
                  <Space>
                    <FileImageOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.i2v.upload" defaultMessage="上传参考图片 (起始帧)" />
                  </Space>
                }
                rules={[{ required: true, message: '请上传参考图片' }]}
                style={{ marginBottom: 20, marginTop: 0 }}
              >
                {originalImageUrl ? (
                    <InputImageContainer>
                        <img src={originalImageUrl} alt="Original" />
                        <OverlayActions className="overlay-actions">
                            <Button 
                                type="primary" 
                                danger 
                                icon={<DeleteOutlined />}
                                onClick={handleRemoveImage}
                            >
                                更换图片
                            </Button>
                        </OverlayActions>
                    </InputImageContainer>
                ) : (
                    <CustomUploadArea
                        $isDark={isDark}
                        $isDragging={isDragging}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('i2v-upload-input')?.click()}
                    >
                        <input
                            id="i2v-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                        />
                        <UploadIcon $isDark={isDark}>
                            <InboxOutlined style={{ fontSize: 48 }} />
                        </UploadIcon>
                        <UploadText $isDark={isDark}>
                            <FormattedMessage id="create.i2v.upload.click" defaultMessage="点击或拖拽上传" />
                        </UploadText>
                        <UploadHint $isDark={isDark}>支持 JPG, PNG, WebP</UploadHint>
                    </CustomUploadArea>
                )}
              </Form.Item>

              {/* 2. 运动强度控制 (I2V 核心参数) */}
              <Form.Item
                name="motionStrength"
                label={
                  <Space>
                    <SlidersOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.i2v.motionStrength" defaultMessage="运动强度 (Motion Strength)" />
                    <Tooltip title={intl.formatMessage({ 
                        id: 'create.i2v.motionStrength.tip', 
                        defaultMessage: '控制视频中动态变化的幅度。低值：仅轻微动画；高值：物体或场景剧烈运动。' 
                    })}>
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <Slider 
                  min={0.1} 
                  max={1.0} 
                  step={0.05} 
                  marks={{ 0.1: '微动', 0.5: '标准', 1.0: '剧烈' }}
                />
              </Form.Item>

              {/* 3. 提示词输入 */}
              <Form.Item
                name="prompt"
                label={
                  <Space>
                    <EditOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.prompt" defaultMessage="运动引导提示词 (Prompt)" />
                  </Space>
                }
                rules={[{ required: true, message: '请输入视频运动的引导描述' }]}
                style={{ marginBottom: 20 }}
              >
                <TextArea 
                  rows={3} 
                  placeholder={intl.formatMessage({ id: 'create.prompt.i2v.placeholder', defaultMessage: '例如：让图片中的人物开始行走，背景的树叶随风摇摆...' })} 
                  maxLength={1500}
                  showCount
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              {/* 4. 视频参数设置 */}
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <Form.Item
                    name="duration"
                    label={
                      <Space>
                        <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                        <FormattedMessage id="create.video.duration" defaultMessage="视频时长 (秒)" />
                      </Space>
                    }
                    style={{ marginBottom: 0 }}
                  >
                     <Select options={DURATIONS} />
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
                    <Select options={CAMERA_MOTIONS} />
                  </Form.Item>
                </Col>
              </Row>

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
                  {loading ? 'AI 正在为图片注入生命...' : <FormattedMessage id="create.generate.i2v" defaultMessage="开始生成视频" />}
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
                   正在预测运动轨迹，渲染视频帧...
                </Text>
              </Space>
            ) : generatedVideo ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <FormattedMessage id="create.i2v.result" defaultMessage="生成对比" />
                  </Title>
                </div>
                <Row gutter={[20, 20]}>
                    {/* 原图对比 */}
                    <Col span={12}>
                        <div style={{ marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileImageOutlined style={{ color: '#1890ff' }} />
                          <FormattedMessage id="create.i2v.original" defaultMessage="原图 (起始帧)" />
                        </div>
                        <div style={{ width: '100%', height: 225, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                          <img 
                            src={originalImageUrl || "https://placehold.co/400x225?text=Original+Image"} 
                            alt="Original Preview" 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12 }}
                          />
                        </div>
                    </Col>
                    
                    {/* 视频预览 */}
                    <Col span={12}>
                        <div style={{ marginBottom: 12, fontWeight: 600, color: '#1890ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <VideoCameraOutlined />
                          <FormattedMessage id="create.video.result" defaultMessage="生成视频预览" />
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
                    </Col>
                </Row>


                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text type="secondary">时长: {generatedVideo.duration}s | 比例: {generatedVideo.aspectRatio}</Text>
                    <Button type="primary" icon={<DownloadOutlined />} href={generatedVideo.url} download="sora_mv_i2v_video.mp4">
                        <FormattedMessage id="create.download" defaultMessage="下载视频" />
                    </Button>
                </div>
              </Space>
            ) : (
              <Empty
                image={<VideoCameraOutlined style={{ fontSize: 48, color: '#aaa' }} />}
                description={
                  <Text type="secondary">
                    <FormattedMessage id="create.i2v.empty" defaultMessage="生成结果与原图对比将显示在此处" />
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
        destroyOnClose={true} 
        width={800}
        centered
        bodyStyle={{ padding: 0 }}
      >
        <video controls autoPlay style={{ width: '100%', maxHeight: '70vh', display: 'block' }}>
            <source src={generatedVideo?.url} type="video/mp4" />
            <FormattedMessage id="video.not.supported" defaultMessage="您的浏览器不支持视频播放。" />
        </video>
      </Modal>
    </StyledCard>
  );
};

export default ImageToVideo;