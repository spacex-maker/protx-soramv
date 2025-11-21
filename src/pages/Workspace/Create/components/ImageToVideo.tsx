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
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { 
  ThunderboltOutlined, 
  DownloadOutlined, 
  VideoCameraOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  PictureOutlined
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

const UploadPreview = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1; /* 保持一致性 */
  object-fit: contain;
  border-radius: 8px;
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 处理文件上传预览和状态
  const handleUploadChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); 

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
        const url = await getBase64(newFileList[0].originFileObj as File);
        setOriginalImageUrl(url);
    } else {
        setOriginalImageUrl(null);
    }
    form.setFieldsValue({ inputFile: newFileList.length > 0 ? newFileList[0].uid : undefined });
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
            <div>
              <Title level={3} style={{ margin: 0 }}>
                <FormattedMessage id="create.imageToVideo.title" defaultMessage="AI 图生视频" />
              </Title>
              <Text type="secondary">
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
                label={<FormattedMessage id="create.i2v.upload" defaultMessage="上传参考图片 (起始帧)" />}
                valuePropName="fileList"
                getValueFromEvent={() => fileList}
                rules={[{ required: true, message: '请上传参考图片' }]}
              >
                {originalImageUrl ? (
                    <div style={{ position: 'relative' }}>
                        <UploadPreview src={originalImageUrl} alt="Original Preview" />
                        <Button 
                            type="dashed" 
                            size="small"
                            onClick={() => { setOriginalImageUrl(null); setFileList([]); form.resetFields(['inputFile']); }}
                            style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                        >
                            <FormattedMessage id="create.i2v.reupload" defaultMessage="更换" />
                        </Button>
                    </div>
                ) : (
                    <Upload
                        beforeUpload={() => false} 
                        onChange={handleUploadChange}
                        fileList={fileList}
                        accept="image/*"
                        listType="picture-card"
                        maxCount={1}
                        showUploadList={false}
                    >
                        <Space direction="vertical" align="center" style={{ padding: '10px 0' }}>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>
                                <FormattedMessage id="create.i2v.upload.click" defaultMessage="点击或拖拽上传" />
                            </div>
                        </Space>
                    </Upload>
                )}
              </Form.Item>

              {/* 2. 运动强度控制 (I2V 核心参数) */}
              <Form.Item
                name="motionStrength"
                label={
                  <Space>
                    <FormattedMessage id="create.i2v.motionStrength" defaultMessage="运动强度 (Motion Strength)" />
                    <Tooltip title={intl.formatMessage({ 
                        id: 'create.i2v.motionStrength.tip', 
                        defaultMessage: '控制视频中动态变化的幅度。低值：仅轻微动画；高值：物体或场景剧烈运动。' 
                    })}>
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                }
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
                label={<FormattedMessage id="create.prompt" defaultMessage="运动引导提示词 (Prompt)" />}
                rules={[{ required: true, message: '请输入视频运动的引导描述' }]}
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
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="duration"
                    label={<FormattedMessage id="create.video.duration" defaultMessage="视频时长 (秒)" />}
                  >
                     <Select options={DURATIONS} />
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
                <Row gutter={16}>
                    {/* 原图对比 */}
                    <Col span={12}>
                        <Title level={5} style={{ margin: 0 }}>
                            <PictureOutlined style={{ marginRight: 8 }} />
                            <FormattedMessage id="create.i2v.original" defaultMessage="原图 (起始帧)" />
                        </Title>
                        <UploadPreview src={originalImageUrl || "https://placehold.co/400x225?text=Original+Image"} alt="Original Preview" style={{aspectRatio: '16/9'}} />
                    </Col>
                    
                    {/* 视频预览 */}
                    <Col span={12}>
                        <Title level={5} style={{ margin: 0 }}>
                            <VideoCameraOutlined style={{ marginRight: 8 }} />
                            <FormattedMessage id="create.video.result" defaultMessage="生成视频预览" />
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