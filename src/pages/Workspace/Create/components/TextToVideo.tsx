import React, { useState, useEffect, useRef } from 'react';
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
  Descriptions
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
  DesktopOutlined,
  RobotOutlined,
  CloseOutlined
} from '@ant-design/icons';
import styled, { createGlobalStyle } from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';

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

// 下拉框样式组件
const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 12px !important;
  }
  
  &.ant-select-focused .ant-select-selector {
    border-radius: 12px !important;
  }
`;

// 全局下拉菜单样式
const GlobalSelectStyles = createGlobalStyle`
  /* 下拉框输入框圆角 */
  .ant-select {
    .ant-select-selector {
      border-radius: 12px !important;
    }
    
    &.ant-select-focused .ant-select-selector {
      border-radius: 12px !important;
    }
  }
  
  /* 下拉选项容器圆角 */
  .ant-select-dropdown {
    border-radius: 12px !important;
    overflow: hidden !important;
    padding: 4px !important;
    
    .rc-virtual-list {
      border-radius: 12px;
    }
    
    .rc-virtual-list-holder {
      border-radius: 12px;
    }
    
    .ant-select-item {
      border-radius: 8px !important;
      margin: 2px 0 !important;
      
      &:first-child {
        margin-top: 0 !important;
      }
      
      &:last-child {
        margin-bottom: 0 !important;
      }
    }
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

// 根据比例值获取对应的图标和标签
const getAspectRatioOption = (ratio: string, intl: any) => {
  const ratioMap: { [key: string]: { labelKey: string; defaultLabel: string; icon: React.ReactNode } } = {
    '16:9': {
      labelKey: 'create.aspectRatio.16:9',
      defaultLabel: '16:9 (Landscape)',
      icon: <DesktopOutlined />
    },
    '9:16': {
      labelKey: 'create.aspectRatio.9:16',
      defaultLabel: '9:16 (Portrait)',
      icon: <MobileOutlined />
    },
    '21:9': {
      labelKey: 'create.aspectRatio.21:9',
      defaultLabel: '21:9 (Cinema)',
      icon: <VideoCameraOutlined />
    },
    '1:1': {
      labelKey: 'create.aspectRatio.1:1',
      defaultLabel: '1:1 (Square)',
      icon: <AppstoreOutlined />
    },
    '4:3': {
      labelKey: 'create.aspectRatio.4:3',
      defaultLabel: '4:3 (Classic)',
      icon: <TabletOutlined />
    },
    '3:4': {
      labelKey: 'create.aspectRatio.3:4',
      defaultLabel: '3:4 (Portrait Classic)',
      icon: <MobileOutlined />
    },
  };

  const option = ratioMap[ratio];
  if (option) {
    return {
      label: intl.formatMessage({ id: option.labelKey, defaultMessage: option.defaultLabel }),
      value: ratio,
      icon: option.icon
    };
  }

  // 如果没有预定义的比例，返回默认格式
  return {
    label: ratio,
    value: ratio,
    icon: <BorderOutlined />
  };
};

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

// 模型类型定义
interface Model {
    id: number;
    modelName: string;
    modelCode: string;
    description: string;
    videoDefaultResolution: string | null;
    videoMaxResolution: string | null;
    videoDuration: number | null;
    videoFps: number | null;
    videoMaxFrames: number | null;
    videoAspectRatios: string | null;
    videoAspectResolution: string | null;
    videoFormats: string | null;
    supportCameraMotion: boolean;
    supportImg2video: boolean;
    supportVideoEdit: boolean;
    supportCharacterConsistency: boolean;
    supportReference: boolean;
    currency: string | null;
    outputPrice: number | null;
}

// --- 组件主体 ---

const ModelOptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  
  .model-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  
  .model-name {
    font-weight: 700;
    font-size: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.5px;
    background-size: 200% auto;
    animation: gradient-shift 3s ease infinite;
  }
  
  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% center;
    }
    50% {
      background-position: 100% center;
    }
  }
  
  .model-price {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    margin-left: auto;
    padding: 2px 8px;
    border-radius: 4px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.06)'};
  }
  
  .model-price-amount {
    font-weight: 700;
    font-size: 16px;
    color: #52c41a;
    line-height: 1.2;
  }
  
  .model-price-currency {
    font-weight: 500;
    font-size: 11px;
    color: #8c8c8c;
    margin-left: 1px;
  }
  
  .model-price-unit {
    font-weight: 400;
    font-size: 10px;
    color: #bfbfbf;
    margin-left: 2px;
  }
  
  .model-code {
    font-size: 12px;
    color: #999;
  }
  
  .model-description {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
    line-height: 1.4;
  }
`;

const AspectRatioTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#f0f0f0'};
  border-radius: 16px;
  font-size: 12px;
  margin: 4px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  
  .anticon {
    color: #1890ff;
    font-size: 14px;
  }
`;

const ResolutionTag = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1a3a52' : '#e6f7ff'};
  border-radius: 16px;
  font-size: 12px;
  margin: 4px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#2a4a6a' : '#91d5ff'};
  color: ${props => props.theme.mode === 'dark' ? '#91d5ff' : '#1890ff'};
  font-weight: 500;
`;

const TextToVideo: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 获取模型列表
  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
          params: { modelType: 't2v' }
        });
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          setModels(response.data.data);
          // 默认选择第一个模型
          const firstModel = response.data.data[0];
          setSelectedModel(firstModel);
          updateFormByModel(firstModel);
        } else {
          message.warning(intl.formatMessage({ 
            id: 'create.model.loadFailed', 
            defaultMessage: '加载模型列表失败' 
          }));
        }
      } catch (error: any) {
        console.error('获取模型列表失败:', error);
        message.error(intl.formatMessage({ 
          id: 'create.model.loadFailed', 
          defaultMessage: '加载模型列表失败' 
        }));
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();

    // 组件卸载时清理 AbortController
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [intl]);

  // 根据模型更新表单参数
  const updateFormByModel = (model: Model) => {
    if (!model) return;

    const updates: any = {};

    // 设置视频比例（如果有支持的比例）
    if (model.videoAspectRatios) {
      const ratios = model.videoAspectRatios.split(',').map(r => r.trim());
      if (ratios.length > 0) {
        // 检查当前选择的比例是否在支持列表中，如果不在则使用第一个
        const currentRatio = form.getFieldValue('aspectRatio');
        if (!ratios.includes(currentRatio)) {
          updates.aspectRatio = ratios[0];
        }
      }
    }

    // 设置视频时长（如果有最大时长限制）
    if (model.videoDuration) {
      const currentDuration = form.getFieldValue('duration') || 8;
      if (currentDuration > model.videoDuration) {
        updates.duration = model.videoDuration;
      } else if (currentDuration < 4) {
        // 确保最小值为4秒
        updates.duration = 4;
      }
    }

    // 如果不支持镜头运动，设置为 none
    if (!model.supportCameraMotion) {
      updates.cameraMotion = 'none';
    }

    // 设置视频格式（如果有支持的格式）
    if (model.videoFormats) {
      const formats = model.videoFormats.split(',').map(f => f.trim());
      if (formats.length > 0) {
        // 检查当前选择的格式是否在支持列表中，如果不在则使用第一个
        const currentFormat = form.getFieldValue('videoFormat');
        if (!currentFormat || !formats.includes(currentFormat)) {
          updates.videoFormat = formats[0];
        }
      }
    }

    // 如果有更新，则更新表单
    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
  };

  // 处理模型选择变化
  const handleModelChange = (modelId: number) => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      form.setFieldsValue({ modelId: modelId });
      updateFormByModel(model);
    }
  };

  // 获取支持的视频比例选项（根据选中的模型）
  const getAvailableAspectRatios = () => {
    if (!selectedModel || !selectedModel.videoAspectRatios) {
      return [];
    }

    const supportedRatios = selectedModel.videoAspectRatios.split(',').map(r => r.trim());
    
    // 根据后端返回的比例动态生成选项
    return supportedRatios.map(ratio => getAspectRatioOption(ratio, intl));
  };

  // 获取最大视频时长（根据选中的模型）
  const getMaxDuration = () => {
    return selectedModel?.videoDuration || 15;
  };

  // 计算预估价格
  const calculateEstimatedPrice = (duration: number): string => {
    if (!selectedModel || selectedModel.outputPrice === null || selectedModel.outputPrice === undefined) {
      return '';
    }
    
    const totalPrice = selectedModel.outputPrice * duration;
    const currency = selectedModel.currency || 'USD';
    
    // 格式化价格，保留2位小数
    const formattedPrice = totalPrice.toFixed(2);
    
    return `${formattedPrice} ${currency}`;
  };

  // 获取支持的视频格式选项（根据选中的模型）
  const getAvailableVideoFormats = () => {
    if (!selectedModel || !selectedModel.videoFormats) {
      return [];
    }

    const formats = selectedModel.videoFormats.split(',').map(f => f.trim());
    return formats;
  };

  // 根据选中的比例获取对应的分辨率
  const getResolutionByAspectRatio = (aspectRatio: string): string | null => {
    if (!selectedModel || !selectedModel.videoAspectRatios || !selectedModel.videoAspectResolution) {
      return null;
    }

    const ratios = selectedModel.videoAspectRatios.split(',').map(r => r.trim());
    const resolutions = selectedModel.videoAspectResolution.split(',').map(r => r.trim());
    
    const index = ratios.indexOf(aspectRatio);
    if (index >= 0 && index < resolutions.length) {
      return resolutions[index];
    }
    
    return null;
  };

  // 取消视频生成
  const handleCancelGenerate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      message.info(intl.formatMessage({ 
        id: 'create.video.generate.cancelled', 
        defaultMessage: '已取消视频生成' 
      }));
    }
  };

  // 调用后端 API 生成视频
  const handleGenerate = async (values: any) => {
    if (!selectedModel) {
      message.warning(intl.formatMessage({ 
        id: 'create.model.select.placeholder', 
        defaultMessage: '请选择要使用的视频生成模型' 
      }));
      return;
    }

    // 如果已有请求在进行，先取消
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setGeneratedVideo(null); 

    try {
      // 构建请求参数
      const requestData: any = {
        prompt: values.prompt,
        modelCode: selectedModel.modelCode,
      };

      // 添加分辨率（根据选中的比例）
      if (values.aspectRatio) {
        const resolution = getResolutionByAspectRatio(values.aspectRatio);
        if (resolution) {
          requestData.size = resolution;
        }
      }

      // 添加视频时长
      if (values.duration) {
        requestData.seconds = values.duration;
      }

      // 添加反向提示词（可选）
      if (values.negativePrompt) {
        requestData.negativePrompt = values.negativePrompt;
      }

      // 添加输出格式（可选）
      if (values.videoFormat) {
        requestData.outputFormat = values.videoFormat;
      }

      console.log('Generating video with params:', requestData);
      
      // 调用后端 API，设置 timeout: 0 表示不超时，使用 signal 支持取消
      const response = await instance.post('/productx/sa-ai-models/video/generate/text', requestData, {
        timeout: 0, // 不设置超时
        signal: abortController.signal
      });
      
      // 检查是否已被取消
      if (abortController.signal.aborted) {
        return;
      }
      
      if (response.data && response.data.success) {
        // 根据后端返回的数据结构处理结果
        const result = response.data.data;
        const videoResult: VideoResult = {
          url: result.videoUrl || result.url || '',
          aspectRatio: values.aspectRatio || '16:9',
          duration: values.duration || 8,
          thumbnail: result.thumbnail || result.thumbnailUrl || '',
        };
        
        setGeneratedVideo(videoResult);
        message.success(intl.formatMessage({ 
          id: 'create.video.generate.success', 
          defaultMessage: '视频生成任务已提交，请稍候查看结果' 
        }));
      } else {
        throw new Error(response.data?.message || intl.formatMessage({ 
          id: 'create.video.generate.failed', 
          defaultMessage: '视频生成失败' 
        }));
      }
    } catch (error: any) {
      // 如果是用户取消的请求，不显示错误
      if (error.name === 'AbortError' || 
          error.message === 'canceled' || 
          error.code === 'ERR_CANCELED' ||
          abortController.signal.aborted) {
        return;
      }
      
      console.error('视频生成失败:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          intl.formatMessage({ 
                            id: 'create.video.generate.failed', 
                            defaultMessage: '视频生成失败，请重试' 
                          });
      message.error(errorMessage);
    } finally {
      // 只有在不是取消的情况下才清除 loading
      if (!abortController.signal.aborted) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };
  
  const handleOpenModal = () => {
      if (generatedVideo?.url) {
          setIsModalOpen(true);
      }
  };

  return (
    <>
      <GlobalSelectStyles />
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
                aspectRatio: undefined,
                cameraMotion: 'none',
                duration: 8,
                videoFormat: undefined,
                modelId: null,
              }}
            >
              {/* 模型选择 */}
              <Form.Item
                name="modelId"
                label={
                  <Space>
                    <RobotOutlined style={{ color: '#1890ff' }} />
                    <FormattedMessage id="create.model.select" defaultMessage="选择模型" />
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <Select
                  value={selectedModel?.id}
                  onChange={handleModelChange}
                  placeholder={intl.formatMessage({ 
                    id: 'create.model.select.placeholder', 
                    defaultMessage: '请选择要使用的视频生成模型' 
                  })}
                  loading={modelsLoading}
                  style={{ width: '100%' }}
                  optionLabelProp="label"
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                >
                  {models.map(model => (
                    <Select.Option 
                      key={model.id} 
                      value={model.id}
                      label={
                        <Space>
                          <VideoCameraOutlined />
                          <span>{model.modelName}</span>
                          {model.modelCode && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              ({model.modelCode})
                            </Text>
                          )}
                        </Space>
                      }
                    >
                      <ModelOptionWrapper>
                        <div className="model-header">
                          <VideoCameraOutlined style={{ color: '#1890ff', fontSize: 18, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="model-name">
                              {model.modelName}
                            </div>
                            {model.modelCode && (
                              <div className="model-code">
                                {model.modelCode}
                              </div>
                            )}
                          </div>
                          {model.outputPrice !== null && model.outputPrice !== undefined && (
                            <div className="model-price">
                              <span className="model-price-amount">{model.outputPrice}</span>
                              <span className="model-price-currency">{model.currency || 'USD'}</span>
                              <span className="model-price-unit">
                                {intl.formatMessage({ 
                                  id: 'create.model.price.perSecond', 
                                  defaultMessage: '/秒' 
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                        {model.description && (
                          <div className="model-description" style={{ marginTop: 6, paddingLeft: 26 }}>
                            {model.description}
                          </div>
                        )}
                        {/* 显示支持的比例和分辨率 */}
                        {(model.videoAspectRatios || model.videoAspectResolution) && (
                          <div style={{ marginTop: 8, paddingLeft: 26, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {model.videoAspectRatios && model.videoAspectRatios.split(',').map((ratio, index) => {
                              const ratioStr = ratio.trim();
                              const ratioOption = getAspectRatioOption(ratioStr, intl);
                              return (
                                <AspectRatioTag key={index}>
                                  {ratioOption.icon}
                                  <span>{ratioStr}</span>
                                </AspectRatioTag>
                              );
                            })}
                            {model.videoAspectResolution && model.videoAspectResolution.split(',').map((resolution, index) => (
                              <ResolutionTag key={index}>
                                {resolution.trim()}
                              </ResolutionTag>
                            ))}
                          </div>
                        )}
                      </ModelOptionWrapper>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

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
                <Col span={8}>
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
                      disabled={!selectedModel || getAvailableAspectRatios().length === 0}
                      placeholder={!selectedModel ? intl.formatMessage({ 
                        id: 'create.model.select.placeholder', 
                        defaultMessage: '请先选择模型' 
                      }) : undefined}
                    >
                      {getAvailableAspectRatios().map(ratio => (
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
                <Col span={8}>
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
                    <Select disabled={!selectedModel || !selectedModel.supportCameraMotion}>
                      {getCameraMotions(intl).map(motion => (
                        <Select.Option key={motion.value} value={motion.value}>
                          {motion.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="videoFormat"
                    label={
                      <Space>
                        <FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                        <FormattedMessage id="create.video.format" defaultMessage="输出格式" />
                      </Space>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      disabled={!selectedModel || getAvailableVideoFormats().length === 0}
                      placeholder={!selectedModel ? intl.formatMessage({ 
                        id: 'create.model.select.placeholder', 
                        defaultMessage: '请先选择模型' 
                      }) : undefined}
                    >
                      {getAvailableVideoFormats().map(format => (
                        <Select.Option key={format} value={format}>
                          {format.toUpperCase()}
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
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <div>
                  <Slider 
                    min={4} 
                    max={getMaxDuration()} 
                    marks={{ 
                      4: intl.formatMessage({ id: 'create.duration.4s', defaultMessage: '4s' }), 
                      8: intl.formatMessage({ id: 'create.duration.8s', defaultMessage: '8s' }), 
                      [getMaxDuration()]: intl.formatMessage({ 
                        id: 'create.duration.format', 
                        defaultMessage: '{duration}s' 
                      }, { duration: getMaxDuration() })
                    }} 
                    tooltip={{ 
                      formatter: (val) => {
                        const duration = val as number;
                        const price = calculateEstimatedPrice(duration);
                        if (price) {
                          return `${intl.formatMessage({ 
                            id: 'create.duration.format', 
                            defaultMessage: '{duration}s' 
                          }, { duration })} | ${intl.formatMessage({ 
                            id: 'create.estimated.price', 
                            defaultMessage: '预估: {price}' 
                          }, { price })}`;
                        }
                        return intl.formatMessage({ 
                          id: 'create.duration.format', 
                          defaultMessage: '{duration}s' 
                        }, { duration });
                      }
                    }} 
                    disabled={!selectedModel}
                    onChange={(val) => {
                      form.setFieldsValue({ duration: val });
                    }}
                  />
                </div>
              </Form.Item>


              {/* 提交按钮 */}
              <Form.Item style={{ marginTop: 16 }}>
                <div>
                  {loading ? (
                    <Button 
                      type="default" 
                      danger
                      icon={<CloseOutlined />} 
                      size="large" 
                      block
                      onClick={handleCancelGenerate}
                      style={{ height: 48, fontSize: 16, borderRadius: 24 }}
                    >
                      <FormattedMessage id="create.video.generate.cancel" defaultMessage="取消生成" />
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<ThunderboltOutlined />} 
                      size="large" 
                      block
                      style={{ height: 48, fontSize: 16, borderRadius: 24 }}
                    >
                      <FormattedMessage id="create.generate.video" defaultMessage="立即生成视频" />
                    </Button>
                  )}
                  <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.duration !== currentValues.duration} noStyle>
                    {({ getFieldValue }) => {
                      const duration = getFieldValue('duration') || 8;
                      const estimatedPrice = selectedModel && selectedModel.outputPrice !== null && selectedModel.outputPrice !== undefined
                        ? calculateEstimatedPrice(duration)
                        : null;
                      
                      return estimatedPrice ? (
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {intl.formatMessage({ 
                              id: 'create.estimated.price', 
                              defaultMessage: '预估: {price}' 
                            }, { price: estimatedPrice })}
                          </Text>
                        </div>
                      ) : null;
                    }}
                  </Form.Item>
                </div>
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
    </>
  );
};

export default TextToVideo;