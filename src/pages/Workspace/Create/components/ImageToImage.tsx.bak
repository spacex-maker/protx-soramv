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
} from 'antd';
import { 
  ThunderboltOutlined, 
  DownloadOutlined, 
  InboxOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  DeleteOutlined,
  FileImageOutlined,
  EditOutlined,
  SlidersOutlined,
  AppstoreOutlined,
  NumberOutlined,
  HistoryOutlined,
  SwapOutlined,
  CheckCircleOutlined
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

// 左侧：输入图片容器 (限制高度，防止撑破布局)
const InputImageContainer = styled.div`
  width: 100%;
  height: 260px; /* 固定高度，保证侧边栏整洁 */
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

  /* 强制内部图片自适应容器，不裁切 */
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

// 输入图片的遮罩层（用于显示删除按钮）
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

// 自定义上传区域（完全自定义，避免 Ant Design 样式问题）
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

// 右侧：结果区域
const ResultArea = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f9f9f9'};
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  border: 1px dashed ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
`;

// 右侧：结果图片容器
const ResultImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px; /* 给一个舒适的默认高度 */
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  /* Antd Image 组件样式覆盖 */
  .ant-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    width: auto !important;
    height: auto !important;
    object-fit: contain; /* 核心：完整显示 */
    border-radius: 12px;
  }

  &:hover .result-actions {
    opacity: 1;
  }
`;

const ResultActions = styled.div`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 20;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px; /* 增加网格间距 */
  margin-top: 20px; /* 调整顶部间距 */
`;

// 历史图片区域
const HistoryImagesContainer = styled.div`
  width: 100%;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e8e8e8'};
`;

const HistoryImagesTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#333'};
  margin-bottom: 12px;
`;

const HistoryImagesScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#f0f0f0'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#555' : '#ccc'};
    border-radius: 3px;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
    }
  }
`;

const HistoryImageItem = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #1890ff;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  &.active {
    border-color: #1890ff;
  }
`;

// --- 模拟数据与配置 ---

const STYLES = [
  { label: '通用 (General)', value: 'general' },
  { label: '油画 (Oil Painting)', value: 'oil_painting' },
  { label: '水墨 (Ink Wash)', value: 'ink_wash' },
  { label: '赛博朋克 (Cyberpunk)', value: 'cyberpunk' },
  { label: '3D 渲染 (3D Render)', value: '3d_render' },
];

// --- 工具函数 ---

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
    link.download = `i2i-generated-${Date.now()}.jpg`;
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
  const [historyImages, setHistoryImages] = useState<string[]>([]); // 历史图片列表
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
      form.setFieldsValue({ inputFile: file.name }); // 触发表单校验
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
    // 重置文件输入
    const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // 模拟 API 调用
  const handleGenerate = async (values: any) => {
    if (!originalImageUrl) {
        message.warning('请先上传参考图片');
        return;
    }
    setLoading(true);
    setGeneratedImages([]); 

    try {
      console.log('Params:', values);
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 模拟生成结果
      const mockImages = Array.from({ length: values.batchSize || 2 }).map((_, i) => 
        `https://picsum.photos/seed/${Date.now() + i}/512/768` // 模拟一个竖图结果
      );
      
      setGeneratedImages(mockImages);
      // 将生成的图片添加到历史记录
      setHistoryImages(prev => [...mockImages, ...prev].slice(0, 20)); // 最多保留20张
      message.success('生成成功！');
    } catch (error) {
      message.error('生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledCard>
      <Row gutter={[32, 24]}>
        
        {/* --- 左侧：控制面板 --- */}
        <Col xs={24} lg={8} xl={7}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ marginBottom: 8 }}>
              <Title level={3} style={{ margin: 0, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <SwapOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                AI 图生图
              </Title>
              <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PictureOutlined style={{ fontSize: 14 }} />
                基于参考图进行风格重绘
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                style: 'general',
                batchSize: 2,
                denoisingStrength: 0.75,
              }}
            >
              
              {/* 1. 图片上传区域 (Fixed Height) */}
              <Form.Item
                name="inputFile"
                label={
                  <Space>
                    <FileImageOutlined style={{ color: '#1890ff' }} />
                    <span>参考图片</span>
                  </Space>
                }
                rules={[{ required: true, message: '请上传图片' }]}
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
                        onClick={() => document.getElementById('image-upload-input')?.click()}
                    >
                        <input
                            id="image-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                        />
                        <UploadIcon $isDark={isDark}>
                            <InboxOutlined style={{ fontSize: 48 }} />
                        </UploadIcon>
                        <UploadText $isDark={isDark}>点击或拖拽图片</UploadText>
                        <UploadHint $isDark={isDark}>支持 JPG, PNG, WebP</UploadHint>
                    </CustomUploadArea>
                )}
              </Form.Item>

              {/* 2. 提示词 */}
              <Form.Item
                name="prompt"
                label={
                  <Space>
                    <EditOutlined style={{ color: '#1890ff' }} />
                    <span>引导提示词</span>
                  </Space>
                }
                rules={[{ required: true, message: '请输入提示词' }]}
                style={{ marginBottom: 20 }}
              >
                <TextArea 
                  rows={4} 
                  placeholder="描述你想要生成的画面..." 
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              {/* 3. 参数控制 */}
              <Form.Item
                name="denoisingStrength"
                label={
                  <Space>
                    <SlidersOutlined style={{ color: '#1890ff' }} />
                    <span>重绘幅度 (Denoising)</span>
                    <Tooltip title="值越小越像原图，值越大变化越大">
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <Slider min={0.1} max={1.0} step={0.05} marks={{ 0.3: '微调', 0.75: '重绘' }} />
              </Form.Item>

              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={14}>
                    <Form.Item 
                      name="style" 
                      label={
                        <Space>
                          <AppstoreOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                          <span>风格</span>
                        </Space>
                      } 
                      style={{ marginBottom: 0 }}
                    >
                        <Select options={STYLES} />
                    </Form.Item>
                </Col>
                <Col span={10}>
                    <Form.Item 
                      name="batchSize" 
                      label={
                        <Space>
                          <NumberOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                          <span>数量</span>
                        </Space>
                      } 
                      style={{ marginBottom: 0 }}
                    >
                        <Select options={[
                            { label: '1张', value: 1 }, 
                            { label: '2张', value: 2 },
                            { label: '3张', value: 3 },
                            { label: '4张', value: 4 }
                        ]} />
                    </Form.Item>
                </Col>
              </Row>

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
                  {loading ? '重绘中...' : '开始生成'}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Col>

        {/* --- 右侧：结果展示区 --- */}
        <Col xs={24} lg={16} xl={17}>
          <ResultArea>
            {/* 历史图片区域 */}
            {historyImages.length > 0 && (
              <HistoryImagesContainer>
                <HistoryImagesTitle>
                  <Space>
                    <HistoryOutlined style={{ color: '#1890ff' }} />
                    <span>历史生成</span>
                  </Space>
                </HistoryImagesTitle>
                <HistoryImagesScroll>
                  {historyImages.map((imgUrl, index) => (
                    <HistoryImageItem
                      key={`${imgUrl}-${index}`}
                      onClick={() => {
                        // 点击历史图片时，将其设置为当前生成结果
                        setGeneratedImages([imgUrl]);
                      }}
                    >
                      <img src={imgUrl} alt={`历史图片 ${index + 1}`} />
                    </HistoryImageItem>
                  ))}
                </HistoryImagesScroll>
              </HistoryImagesContainer>
            )}
            
            {loading ? (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ marginTop: 24 }}>AI 正在构思并重绘图像细节...</Text>
              </div>
            ) : generatedImages.length > 0 ? (
              <div style={{ width: '100%' }}>
                <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <FormattedMessage id="create.i2i.result" defaultMessage="生成对比" />
                  </Title>
                  <Button icon={<DownloadOutlined />}>全部打包下载</Button>
                </div>
                
                {/* 主要对比区域 */}
                <Row gutter={[20, 20]}>
                    {/* 原图 */}
                    <Col xs={24} md={12}>
                        <div style={{ marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileImageOutlined style={{ color: '#1890ff' }} />
                          原图参考
                        </div>
                        <ResultImageWrapper>
                            <Image 
                                src={originalImageUrl || ''} 
                                preview={{ mask: <Space><PictureOutlined /> 查看大图</Space> }}
                            />
                        </ResultImageWrapper>
                    </Col>

                    {/* 主生成图 */}
                    <Col xs={24} md={12}>
                        <div style={{ marginBottom: 12, fontWeight: 600, color: '#1890ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ThunderboltOutlined />
                          生成结果
                        </div>
                        <ResultImageWrapper>
                            <Image 
                                src={generatedImages[0]} 
                                preview={{ mask: <Space><PictureOutlined /> 查看大图</Space> }}
                            />
                            <ResultActions className="result-actions">
                                <Button 
                                    shape="circle" 
                                    icon={<DownloadOutlined />} 
                                    onClick={() => downloadImage(generatedImages[0])}
                                    style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', border: 'none' }}
                                />
                            </ResultActions>
                        </ResultImageWrapper>
                    </Col>
                </Row>
                
                {/* 其他变体 (Grid) */}
                {generatedImages.length > 1 && (
                  <div style={{ marginTop: 28 }}>
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                      <AppstoreOutlined style={{ color: '#1890ff' }} />
                      其他生成结果
                    </Text>
                    <GridContainer>
                       {generatedImages.slice(1).map((src, index) => (
                         <ResultImageWrapper key={index} style={{ height: 180 }}>
                           <Image src={src} />
                           <ResultActions className="result-actions">
                             <Button 
                               shape="circle" 
                               icon={<DownloadOutlined />} 
                               size="small"
                               onClick={() => downloadImage(src)}
                               style={{ color: '#fff', background: 'rgba(255,255,255,0.2)', border: 'none' }}
                             />
                           </ResultActions>
                         </ResultImageWrapper>
                       ))}
                    </GridContainer>
                  </div>
                )}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="上传图片并点击生成以查看效果"
                style={{ margin: 'auto' }}
              />
            )}
          </ResultArea>
        </Col>
      </Row>
    </StyledCard>
  );
};

export default ImageToImage;