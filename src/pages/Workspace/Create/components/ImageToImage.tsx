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
  Tooltip,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { 
  ThunderboltOutlined, 
  DownloadOutlined, 
  UploadOutlined,
  InfoCircleOutlined,
  PictureOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text } = Typography;
const { TextArea } = Input;

// --- 样式定义 (复用或微调自T2I/T2V) ---

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

const UploadPreview = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1; /* 保持一致性 */
  object-fit: contain;
  border-radius: 8px;
`;

// --- 模拟数据与配置 ---

const STYLES = [
  { label: '通用 (General)', value: 'general' },
  { label: '油画 (Oil Painting)', value: 'oil_painting' },
  { label: '水墨 (Ink Wash)', value: 'ink_wash' },
  { label: '像素艺术 (Pixel Art)', value: 'pixel_art' },
];

// --- 工具函数 ---

// 将文件转换为 base64 预览 URL
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-i2i-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// --- 组件主体 ---

const ImageToImage: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 处理文件上传预览和状态
  const handleUploadChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); // 只保留最新上传的一个文件

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
        const url = await getBase64(newFileList[0].originFileObj as File);
        setOriginalImageUrl(url);
    } else {
        setOriginalImageUrl(null);
    }
    // 确保 FormItem 知道文件已上传
    form.setFieldsValue({ inputFile: newFileList.length > 0 ? newFileList[0].uid : undefined });
  };
  
  // 模拟 API 调用
  const handleGenerate = async (values: any) => {
    if (!originalImageUrl) {
        message.warning(intl.formatMessage({ id: 'create.i2i.upload.warning', defaultMessage: '请先上传一张图片作为参考。' }));
        return;
    }
    setLoading(true);
    setGeneratedImages([]); 

    try {
      console.log('Generating Image-to-Image with params:', values);
      
      // 模拟 3秒 延迟
      await new Promise(resolve => setTimeout(resolve, 3000));

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

  return (
    <StyledCard>
      <Row gutter={[32, 24]}>
        
        {/* --- 左侧：控制面板 --- */}
        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                <FormattedMessage id="create.imageToImage.title" defaultMessage="AI 图生图" />
              </Title>
              <Text type="secondary">
                <FormattedMessage 
                  id="create.imageToImage.subtitle" 
                  defaultMessage="上传图片，通过提示词进行风格迁移或细节重绘" 
                />
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                style: 'general',
                batchSize: 2,
                denoisingStrength: 0.75, // I2I 核心参数，默认 0.75
              }}
            >
              
              {/* 1. 上传图片区域 */}
              <Form.Item
                name="inputFile"
                label={<FormattedMessage id="create.i2i.upload" defaultMessage="上传参考图片" />}
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
                            <FormattedMessage id="create.i2i.reupload" defaultMessage="更换" />
                        </Button>
                    </div>
                ) : (
                    <Upload
                        beforeUpload={() => false} // 阻止自动上传
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
                                <FormattedMessage id="create.i2i.upload.click" defaultMessage="点击或拖拽上传" />
                            </div>
                        </Space>
                    </Upload>
                )}
              </Form.Item>


              {/* 2. 图像强度控制 (核心参数) */}
              <Form.Item
                name="denoisingStrength"
                label={
                  <Space>
                    <FormattedMessage id="create.i2i.strength" defaultMessage="图像强度 (Denoising Strength)" />
                    <Tooltip title={intl.formatMessage({ 
                        id: 'create.i2i.strength.tip', 
                        defaultMessage: '控制生成图与原图的相似度。0.1：轻微变化；0.9：完全重绘，仅保留构图。' 
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
                  marks={{ 0.1: '微调', 0.5: '风格化', 1.0: '重绘' }}
                />
              </Form.Item>


              {/* 3. 提示词输入 */}
              <Form.Item
                name="prompt"
                label={<FormattedMessage id="create.prompt" defaultMessage="引导提示词 (Prompt)" />}
                rules={[{ required: true, message: '请输入提示词以引导生成' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder={intl.formatMessage({ id: 'create.i2i.prompt.placeholder', defaultMessage: '例如：将此图片转化为油画风格，色彩鲜艳，高对比度...' })} 
                  maxLength={1000}
                  showCount
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              {/* 4. 风格与数量 */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="style"
                    label={<FormattedMessage id="create.style" defaultMessage="艺术风格" />}
                  >
                    <Select options={STYLES} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="batchSize"
                    label={<FormattedMessage id="create.batchSize" defaultMessage="生成数量" />}
                  >
                    <Slider min={1} max={4} marks={{ 1: '1', 2: '2', 3: '3', 4: '4' }} />
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
                  {loading ? '正在重绘...' : <FormattedMessage id="create.i2i.generate" defaultMessage="开始重绘" />}
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
                   正在分析图像结构，进行风格重构...
                </Text>
              </Space>
            ) : generatedImages.length > 0 ? (
              <div style={{ width: '100%' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0 }}>
                      <PictureOutlined style={{ marginRight: 8 }}/>
                      <FormattedMessage id="create.i2i.result" defaultMessage="生成结果与原图对比" />
                  </Title>
                  <Button type="text" icon={<DownloadOutlined />}>全部下载</Button>
                </div>
                
                <Image.PreviewGroup>
                    <Row gutter={[16, 16]}>
                        {/* 原图预览 */}
                        <Col span={24} md={12}>
                            <Title level={5} style={{ marginTop: 0 }}><FormattedMessage id="create.i2i.original" defaultMessage="原图" /></Title>
                            <ImageWrapper style={{ boxShadow: '0 0 0 2px #40a9ff' }}>
                                <Image 
                                  src={originalImageUrl || "https://placehold.co/512x512?text=Original+Image"} 
                                  width="100%" 
                                  style={{ objectFit: 'cover', aspectRatio: '1/1' }}
                                />
                            </ImageWrapper>
                        </Col>

                        {/* 生成图预览 (只显示第一个，多的放入 Grid) */}
                        {generatedImages[0] && (
                          <Col span={24} md={12}>
                            <Title level={5} style={{ marginTop: 0 }}><FormattedMessage id="create.i2i.generated" defaultMessage="生成图 (主)" /></Title>
                            <ImageWrapper>
                              <Image 
                                src={generatedImages[0]} 
                                width="100%" 
                                style={{ objectFit: 'cover', aspectRatio: '1/1' }}
                              />
                              <ImageActions className="image-actions">
                                <Button 
                                  shape="circle" 
                                  icon={<DownloadOutlined />} 
                                  onClick={() => downloadImage(generatedImages[0])}
                                  style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', border: 'none' }}
                                />
                              </ImageActions>
                            </ImageWrapper>
                          </Col>
                        )}
                    </Row>
                    
                    {/* 其他生成结果的 Grid 视图 */}
                    {generatedImages.length > 1 && (
                      <div style={{ marginTop: 24 }}>
                        <Title level={5}><FormattedMessage id="create.i2i.variations" defaultMessage="其他变体" /></Title>
                        <ImageGrid>
                           {generatedImages.slice(1).map((src, index) => (
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
                      </div>
                    )}

                </Image.PreviewGroup>
              </div>
            ) : (
              <Empty
                image={<PictureOutlined style={{ fontSize: 48, color: '#aaa' }} />}
                description={
                  <Text type="secondary">
                    <FormattedMessage id="create.i2i.empty" defaultMessage="生成结果与原图对比将显示在此处" />
                  </Text>
                }
              />
            )}
          </ResultArea>
        </Col>
      </Row>
    </StyledCard>
  );
};

export default ImageToImage;