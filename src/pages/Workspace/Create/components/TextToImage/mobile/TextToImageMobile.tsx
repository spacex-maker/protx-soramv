import React, { useState, useEffect } from 'react';
import {
  Typography,
  Input,
  Button,
  Select,
  Slider,
  Form,
  Space,
  message,
  Image,
  Empty,
  Spin,
  Tooltip,
  Drawer,
} from 'antd';
import {
  ThunderboltOutlined,
  DownloadOutlined,
  PictureOutlined,
  InfoCircleOutlined,
  EditOutlined,
  FileImageOutlined,
  AppstoreOutlined,
  NumberOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  RobotOutlined,
  EyeOutlined,
  SettingOutlined,
  CloseOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';
import ModelDetailModal, { ModelDetail } from '../../ModelDetailModal';
import { ModelFamily, Model } from '../types';
import {
  isFree,
  getAspectRatioOption,
  calculateDimensionsFromRatio,
  parseResolution,
  formatResolution,
} from '../utils';
import {
  MobileContainer,
  MobileFormSection,
  MobileResultSection,
  MobileImageGrid,
  MobileImageWrapper,
  MobileImageActions,
  MobileModelOption,
  MobileActionBar,
  MobileDrawerContent,
} from './styles';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TextToImageMobile: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [modelFamilies, setModelFamilies] = useState<ModelFamily[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<ModelFamily | null>(
    null
  );
  const [styleModels, setStyleModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [familiesLoading, setFamiliesLoading] = useState(false);
  const [styleModelsLoading, setStyleModelsLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailModel, setDetailModel] = useState<ModelDetail | null>(null);
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);

  // 获取模型家族列表
  useEffect(() => {
    const fetchFamilies = async () => {
      setFamiliesLoading(true);
      try {
        const response = await instance.get(
          '/productx/sa-ai-models/image/families'
        );
        if (
          response.data.success &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          setModelFamilies(response.data.data);
          const firstFamily = response.data.data[0];
          setSelectedFamily(firstFamily);
          form.setFieldsValue({ familyId: firstFamily.id });
          if (firstFamily.modelCode) {
            fetchStyleModels(firstFamily.modelCode, firstFamily);
          }
        } else {
          message.warning(
            intl.formatMessage({
              id: 'create.model.family.empty',
              defaultMessage: '暂无可用模型家族',
            })
          );
        }
      } catch (error: any) {
        console.error('获取模型家族列表失败:', error);
        message.error(
          intl.formatMessage({
            id: 'create.model.family.loadFailed',
            defaultMessage: '加载模型家族列表失败',
          })
        );
      } finally {
        setFamiliesLoading(false);
      }
    };

    fetchFamilies();
  }, [intl]);

  // 获取风格模型列表
  const fetchStyleModels = async (
    parentModelCode: string,
    family?: ModelFamily
  ) => {
    setStyleModelsLoading(true);
    try {
      const response = await instance.get(
        '/productx/sa-ai-models/image/models/by-family',
        {
          params: { parentModelCode },
        }
      );
      const targetFamily =
        family ||
        modelFamilies.find((f) => f.modelCode === parentModelCode);

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const styleModelsList: Model[] = response.data.data.map((item: any) => ({
          id: item.id,
          modelName: item.modelName,
          modelCode: item.modelCode,
          description: item.description,
          imageDefaultResolution: item.imageDefaultResolution,
          imageMaxResolution: item.imageMaxResolution,
          imageAspectRatios: item.imageAspectRatios,
          imageFormats: item.imageFormats,
          supportControlnet: item.supportControlnet,
          supportInpaint: item.supportInpaint,
          supportReference: item.supportReference,
          currency: item.currency,
          outputPrice: item.outputPrice,
          coverImage: item.coverImage || null,
        }));
        setStyleModels(styleModelsList);
        if (styleModelsList.length > 0) {
          const firstStyleModel = styleModelsList[0];
          setSelectedModel(firstStyleModel);
          form.setFieldsValue({ styleModelId: firstStyleModel.id });
          updateFormByModel(firstStyleModel);
        } else {
          if (targetFamily) {
            const familyAsModel: Model = {
              id: targetFamily.id,
              modelName: targetFamily.modelName,
              modelCode: targetFamily.modelCode,
              description: targetFamily.description,
              imageDefaultResolution: targetFamily.imageDefaultResolution,
              imageMaxResolution: targetFamily.imageMaxResolution,
              imageAspectRatios: targetFamily.imageAspectRatios,
              imageFormats: targetFamily.imageFormats,
              supportControlnet: targetFamily.supportControlnet,
              supportInpaint: targetFamily.supportInpaint,
              supportReference: targetFamily.supportReference,
              currency: targetFamily.currency,
              outputPrice: targetFamily.outputPrice,
              coverImage: null,
            };
            setSelectedModel(familyAsModel);
            form.setFieldsValue({ styleModelId: null });
            updateFormByModel(familyAsModel);
          }
        }
      } else {
        if (targetFamily) {
          const familyAsModel: Model = {
            id: targetFamily.id,
            modelName: targetFamily.modelName,
            modelCode: targetFamily.modelCode,
            description: targetFamily.description,
            imageDefaultResolution: targetFamily.imageDefaultResolution,
            imageMaxResolution: targetFamily.imageMaxResolution,
            imageAspectRatios: targetFamily.imageAspectRatios,
            imageFormats: targetFamily.imageFormats,
            supportControlnet: targetFamily.supportControlnet,
            supportInpaint: targetFamily.supportInpaint,
            supportReference: targetFamily.supportReference,
            currency: targetFamily.currency,
            outputPrice: targetFamily.outputPrice,
            coverImage: null,
          };
          setSelectedModel(familyAsModel);
          setStyleModels([]);
          form.setFieldsValue({ styleModelId: null });
          updateFormByModel(familyAsModel);
        }
      }
    } catch (error: any) {
      console.error('获取风格模型列表失败:', error);
      message.error(
        intl.formatMessage({
          id: 'create.model.style.loadFailed',
          defaultMessage: '加载风格模型列表失败',
        })
      );
      const targetFamily =
        family ||
        modelFamilies.find((f) => f.modelCode === parentModelCode);
      if (targetFamily) {
        const familyAsModel: Model = {
          id: targetFamily.id,
          modelName: targetFamily.modelName,
          modelCode: targetFamily.modelCode,
          description: targetFamily.description,
          imageDefaultResolution: targetFamily.imageDefaultResolution,
          imageMaxResolution: targetFamily.imageMaxResolution,
          imageAspectRatios: targetFamily.imageAspectRatios,
          imageFormats: targetFamily.imageFormats,
          supportControlnet: targetFamily.supportControlnet,
          supportInpaint: targetFamily.supportInpaint,
          supportReference: targetFamily.supportReference,
          currency: targetFamily.currency,
          outputPrice: targetFamily.outputPrice,
          coverImage: null,
        };
        setSelectedModel(familyAsModel);
        setStyleModels([]);
        form.setFieldsValue({ styleModelId: null });
        updateFormByModel(familyAsModel);
      }
    } finally {
      setStyleModelsLoading(false);
    }
  };

  // 根据模型更新表单参数
  const updateFormByModel = (model: Model) => {
    if (!model) return;

    const updates: any = {};

    // 设置默认分辨率（如果有）
    if (model.imageDefaultResolution) {
      const currentResolution = form.getFieldValue('resolution');
      if (!currentResolution) {
        updates.resolution = model.imageDefaultResolution;
      }
    }

    // 设置图片比例（如果有支持的比例）
    if (model.imageAspectRatios) {
      const ratios = model.imageAspectRatios.split(',').map((r) => r.trim());
      if (ratios.length > 0) {
        // 检查当前选择的比例是否在支持列表中，如果不在则使用第一个
        const currentRatio = form.getFieldValue('aspectRatio');
        if (!ratios.includes(currentRatio)) {
          updates.aspectRatio = ratios[0];
        }
      }
    }

    // 设置图片格式（如果有支持的格式）
    if (model.imageFormats) {
      const formats = model.imageFormats.split(',').map((f) => f.trim());
      if (formats.length > 0) {
        // 检查当前选择的格式是否在支持列表中，如果不在则使用第一个
        const currentFormat = form.getFieldValue('imageFormat');
        if (!currentFormat || !formats.includes(currentFormat)) {
          updates.imageFormat = formats[0];
        }
      }
    }

    // 如果有更新，则更新表单
    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
  };

  // 处理模型家族选择变化
  const handleFamilyChange = (familyId: number) => {
    const family = modelFamilies.find((f) => f.id === familyId);
    if (family) {
      setSelectedFamily(family);
      form.setFieldsValue({ familyId: familyId });
      if (family.modelCode) {
        fetchStyleModels(family.modelCode, family);
      }
    }
  };

  // 处理风格模型选择变化
  const handleStyleModelChange = (modelId: number | null) => {
    if (modelId === null) {
      if (selectedFamily) {
        const familyAsModel: Model = {
          id: selectedFamily.id,
          modelName: selectedFamily.modelName,
          modelCode: selectedFamily.modelCode,
          description: selectedFamily.description,
          imageDefaultResolution: selectedFamily.imageDefaultResolution,
          imageMaxResolution: selectedFamily.imageMaxResolution,
          imageAspectRatios: selectedFamily.imageAspectRatios,
          imageFormats: selectedFamily.imageFormats,
          supportControlnet: selectedFamily.supportControlnet,
          supportInpaint: selectedFamily.supportInpaint,
          supportReference: selectedFamily.supportReference,
          currency: selectedFamily.currency,
          outputPrice: selectedFamily.outputPrice,
          coverImage: null,
        };
        setSelectedModel(familyAsModel);
        form.setFieldsValue({ styleModelId: null });
        updateFormByModel(familyAsModel);
      }
    } else {
      const model = styleModels.find((m) => m.id === modelId);
      if (model) {
        setSelectedModel(model);
        form.setFieldsValue({ styleModelId: modelId });
        updateFormByModel(model);
      }
    }
  };

  // 获取支持的图片比例选项
  const getAvailableAspectRatios = () => {
    if (!selectedModel || !selectedModel.imageAspectRatios) {
      return [];
    }
    const supportedRatios = selectedModel.imageAspectRatios
      .split(',')
      .map((r) => r.trim());
    return supportedRatios.map((ratio) => getAspectRatioOption(ratio, intl));
  };

  // 获取支持的图片格式选项
  const getAvailableImageFormats = () => {
    if (!selectedModel || !selectedModel.imageFormats) {
      return [];
    }
    const formats = selectedModel.imageFormats.split(',').map((f) => f.trim());
    return formats;
  };

  // 获取支持的分辨率选项
  const getAvailableResolutions = () => {
    if (!selectedModel) {
      return [];
    }
    const resolutions: string[] = [];
    if (selectedModel.imageDefaultResolution) {
      resolutions.push(selectedModel.imageDefaultResolution);
    }
    if (
      selectedModel.imageMaxResolution &&
      selectedModel.imageMaxResolution !== selectedModel.imageDefaultResolution
    ) {
      resolutions.push(selectedModel.imageMaxResolution);
    }
    if (resolutions.length === 0 && selectedModel.imageAspectRatios) {
      const ratios = selectedModel.imageAspectRatios.split(',').map((r) => r.trim());
      ratios.forEach((ratio) => {
        const dimensions = calculateDimensionsFromRatio(ratio);
        if (dimensions) {
          const resolution = `${dimensions.width}x${dimensions.height}`;
          if (!resolutions.includes(resolution)) {
            resolutions.push(resolution);
          }
        }
      });
    }
    const commonResolutions = ['512x512', '768x768', '1024x1024', '1024x768', '768x1024'];
    commonResolutions.forEach((res) => {
      if (!resolutions.includes(res)) {
        resolutions.push(res);
      }
    });
    return resolutions.map((res) => ({
      label: formatResolution(res),
      value: res,
    }));
  };

  // 调用后端 API 生成图片
  const handleGenerate = async (values: any) => {
    console.log('handleGenerate called with values:', values);
    
    if (!selectedModel) {
      message.warning(
        intl.formatMessage({
          id: 'create.model.select.image.placeholder',
          defaultMessage: '请选择要使用的图片生成模型',
        })
      );
      return;
    }

    if (!selectedFamily) {
      message.warning(
        intl.formatMessage({
          id: 'create.model.family.select.placeholder',
          defaultMessage: '请选择模型家族',
        })
      );
      return;
    }

    // 获取表单所有字段值（包括高级设置中的参数）
    const allValues = form.getFieldsValue();
    console.log('All form values:', allValues);
    
    // 检查提示词
    if (!values.prompt && !allValues.prompt) {
      message.warning(
        intl.formatMessage({
          id: 'create.prompt.required',
          defaultMessage: '请输入提示词',
        })
      );
      return;
    }
    
    setLoading(true);
    setGeneratedImages([]);

    try {
      const requestData: any = {
        prompt: values.prompt || allValues.prompt,
        modelCode: selectedModel.modelCode,
      };

      if (selectedFamily.modelCode) {
        requestData.sdModelCheckpoint = selectedFamily.modelCode;
      }

      // 使用所有表单值（包括高级设置中的参数）
      if (allValues.negativePrompt) {
        requestData.negativePrompt = allValues.negativePrompt;
      }

      if (allValues.resolution) {
        const dimensions = parseResolution(allValues.resolution);
        if (dimensions) {
          requestData.width = dimensions.width;
          requestData.height = dimensions.height;
        }
      } else if (allValues.aspectRatio) {
        const dimensions = calculateDimensionsFromRatio(allValues.aspectRatio);
        if (dimensions) {
          requestData.width = dimensions.width;
          requestData.height = dimensions.height;
        }
      }

      if (allValues.batchSize) {
        requestData.batchSize = allValues.batchSize;
      }
      
      // imageFormat 字段后端不支持，移除

      const response = await instance.post(
        '/productx/sa-ai-models/image/generate/text',
        requestData,
        {
          timeout: 900000,
        }
      );

      if (response.data && response.data.success !== false) {
        // 处理返回的图片数据（base64编码）
        const images =
          response.data.images || response.data.data?.images || [];

        if (images && images.length > 0) {
          // 将 base64 字符串转换为可显示的图片 URL
          const imageUrls = images.map((base64: string) => {
            // 如果已经是完整的数据URL，直接返回
            if (base64.startsWith('data:image')) {
              return base64;
            }
            // 否则添加 data URL 前缀
            return `data:image/png;base64,${base64}`;
          });

          setGeneratedImages(imageUrls);
          message.success(
            intl.formatMessage({
              id: 'create.generate.success',
              defaultMessage: `成功生成 ${images.length} 张图片！`,
            })
          );
        } else {
          // 检查是否有错误信息
          const errorMsg = response.data.error || response.data.message;
          if (errorMsg) {
            message.error(errorMsg);
          } else {
            message.warning(
              intl.formatMessage({
                id: 'create.generate.noImages',
                defaultMessage: '生成完成，但没有返回图片',
              })
            );
          }
        }
      } else {
        message.error(
          response.data?.message ||
            intl.formatMessage({
              id: 'create.generate.failed',
              defaultMessage: '生成失败，请重试',
            })
        );
      }
    } catch (error: any) {
      console.error('生成图片失败:', error);
      message.error(
        error.response?.data?.message ||
          intl.formatMessage({
            id: 'create.generate.error',
            defaultMessage: '生成失败，请检查网络连接或稍后重试',
          })
      );
    } finally {
      setLoading(false);
    }
  };

  // 下载图片
  const downloadImage = (url: string, index?: number) => {
    try {
      if (url.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = url;
        const fileName =
          index !== undefined
            ? `generated-${Date.now()}-${index + 1}.jpg`
            : `generated-${Date.now()}.jpg`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const link = document.createElement('a');
        link.href = url;
        const fileName =
          index !== undefined
            ? `generated-${Date.now()}-${index + 1}.jpg`
            : `generated-${Date.now()}.jpg`;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('下载图片失败:', error);
      message.error(
        intl.formatMessage({
          id: 'create.download.error',
          defaultMessage: '下载失败，请重试',
        })
      );
    }
  };

  // 打开详情弹窗
  const handleShowDetail = (e: React.MouseEvent, model: ModelFamily | Model) => {
    e.stopPropagation();
    setDetailModel(model as ModelDetail);
    setDetailModalVisible(true);
  };

  return (
    <MobileContainer>
      {/* 主要表单区域 */}
        <MobileFormSection>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              aspectRatio: undefined,
              resolution: undefined,
              styleModelId: null,
              batchSize: 2,
              steps: 30,
              familyId: null,
              imageFormat: undefined,
            }}
          >
            {/* 模型家族选择 */}
            <Form.Item
              name="familyId"
              label={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  width: '100%',
                  margin: 0,
                  padding: 0
                }}>
                  <Space style={{ margin: 0, padding: 0 }}>
                    <RobotOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    <FormattedMessage
                      id="create.model.family.select"
                      defaultMessage="选择模型家族"
                    />
                  </Space>
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    onClick={() => setSettingsDrawerVisible(true)}
                    style={{ 
                      padding: 0, 
                      height: 'auto',
                      marginLeft: 'auto',
                      minWidth: 'auto',
                      marginTop: 0,
                      marginBottom: 0
                    }}
                  />
                </div>
              }
            >
              <Select
                value={selectedFamily?.id}
                onChange={handleFamilyChange}
                placeholder={intl.formatMessage({
                  id: 'create.model.family.select.placeholder',
                  defaultMessage: '请选择模型家族',
                })}
                loading={familiesLoading}
                size="large"
              >
                {modelFamilies.map((family) => (
                  <Select.Option key={family.id} value={family.id}>
                    <MobileModelOption>
                      <div className="model-name">{family.modelName}</div>
                      <div className="model-meta">
                        {isFree(family.outputPrice, family.currency) ? (
                          <span className="model-free">
                            {intl.formatMessage({
                              id: 'create.model.free',
                              defaultMessage: '免费',
                            })}
                          </span>
                        ) : (
                          family.outputPrice !== null &&
                          family.outputPrice !== undefined && (
                            <span className="model-price">
                              {family.outputPrice} {family.currency || 'USD'}
                            </span>
                          )
                        )}
                      </div>
                    </MobileModelOption>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 艺术风格（可选） */}
            {selectedFamily && (
              <Form.Item
                name="styleModelId"
                label={
                  <Space>
                    <AppstoreOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    <FormattedMessage
                      id="create.style"
                      defaultMessage="艺术风格"
                    />
                  </Space>
                }
              >
                <Select
                  value={selectedModel?.id}
                  onChange={handleStyleModelChange}
                  placeholder={intl.formatMessage({
                    id: 'create.style.select.placeholder',
                    defaultMessage:
                      '请选择艺术风格（可选，默认使用家族模型）',
                  })}
                  loading={styleModelsLoading}
                  disabled={!selectedFamily || styleModelsLoading}
                  allowClear
                  size="large"
                >
                  {/* 添加一个选项，允许使用家族本身 */}
                  <Select.Option
                    key={`family-${selectedFamily.id}`}
                    value={null}
                  >
                    <MobileModelOption>
                      <div className="model-name">
                        {selectedFamily.modelName} (默认)
                      </div>
                      <div className="model-meta">
                        {isFree(selectedFamily.outputPrice, selectedFamily.currency) ? (
                          <span className="model-free">
                            {intl.formatMessage({
                              id: 'create.model.free',
                              defaultMessage: '免费',
                            })}
                          </span>
                        ) : (
                          selectedFamily.outputPrice !== null &&
                          selectedFamily.outputPrice !== undefined && (
                            <span className="model-price">
                              {selectedFamily.outputPrice} {selectedFamily.currency || 'USD'}
                            </span>
                          )
                        )}
                      </div>
                    </MobileModelOption>
                  </Select.Option>
                  {styleModels.map((model) => (
                    <Select.Option key={model.id} value={model.id}>
                      <MobileModelOption>
                        <div className="model-name">{model.modelName}</div>
                        <div className="model-meta">
                          {isFree(model.outputPrice, model.currency) ? (
                            <span className="model-free">
                              {intl.formatMessage({
                                id: 'create.model.free',
                                defaultMessage: '免费',
                              })}
                            </span>
                          ) : (
                            model.outputPrice !== null &&
                            model.outputPrice !== undefined && (
                              <span className="model-price">
                                {model.outputPrice} {model.currency || 'USD'}
                              </span>
                            )
                          )}
                        </div>
                      </MobileModelOption>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {/* 提示词输入 */}
            <Form.Item
              name="prompt"
              label={
                <Space>
                  <EditOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                  <FormattedMessage
                    id="create.prompt"
                    defaultMessage="提示词 (Prompt)"
                  />
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'create.prompt.required',
                    defaultMessage: '请输入提示词',
                  }),
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={intl.formatMessage({
                  id: 'create.prompt.placeholder',
                  defaultMessage:
                    '例如：一只在太空中漫步的赛博朋克猫咪，霓虹灯背景，高清细节...',
                })}
                maxLength={1000}
                showCount
              />
            </Form.Item>

            {/* 生成按钮 */}
            <Form.Item>
              <Button
                type="primary"
                size="large"
                block
                icon={<ThunderboltOutlined />}
                loading={loading}
                onClick={async () => {
                  try {
                    // 手动触发表单验证
                    const values = await form.validateFields();
                    console.log('Form validation passed:', values);
                    // 调用生成函数
                    await handleGenerate(values);
                  } catch (errorInfo: any) {
                    console.log('Form validation failed:', errorInfo);
                    // 验证失败时，仍然尝试提交（可能只是高级设置中的字段验证失败）
                    const allValues = form.getFieldsValue();
                    if (allValues.prompt) {
                      await handleGenerate(allValues);
                    } else {
                      message.error(
                        intl.formatMessage({
                          id: 'create.prompt.required',
                          defaultMessage: '请输入提示词',
                        })
                      );
                    }
                  }
                }}
                style={{
                  borderRadius: '24px',
                  height: '48px',
                }}
              >
                <FormattedMessage
                  id="create.generate"
                  defaultMessage="生成图片"
                />
              </Button>
            </Form.Item>
          </Form>
        </MobileFormSection>

        {/* 结果展示区域 */}
        <MobileResultSection>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  <FormattedMessage
                    id="create.generating"
                    defaultMessage="正在生成中，请稍候..."
                  />
                </Text>
              </div>
            </div>
          ) : generatedImages.length > 0 ? (
            <>
              <MobileActionBar>
                <Text strong>
                  <FormattedMessage
                    id="create.results"
                    defaultMessage="生成结果"
                  />
                  ({generatedImages.length})
                </Text>
                <Button
                  type="primary"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    generatedImages.forEach((url, index) => {
                      setTimeout(() => {
                        downloadImage(url, index);
                      }, index * 300);
                    });
                    message.success(
                      intl.formatMessage({
                        id: 'create.downloadAll.start',
                        defaultMessage: `开始下载 ${generatedImages.length} 张图片`,
                      })
                    );
                  }}
                >
                  <FormattedMessage
                    id="create.downloadAll"
                    defaultMessage="全部下载"
                  />
                </Button>
              </MobileActionBar>
              <Image.PreviewGroup>
                <MobileImageGrid>
                  {generatedImages.map((url, index) => (
                    <MobileImageWrapper key={index}>
                      <Image
                        src={url}
                        width="100%"
                        height="100%"
                        style={{ objectFit: 'contain', cursor: 'pointer' }}
                        preview={{
                          mask: <EyeOutlined style={{ fontSize: 16 }} />,
                        }}
                      />
                      <MobileImageActions className="mobile-image-actions">
                        <Button
                          shape="circle"
                          icon={<DownloadOutlined />}
                          onClick={() => downloadImage(url, index)}
                          style={{
                            color: '#fff',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                          }}
                        />
                      </MobileImageActions>
                    </MobileImageWrapper>
                  ))}
                </MobileImageGrid>
              </Image.PreviewGroup>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">
                  <FormattedMessage
                    id="create.empty"
                    defaultMessage="暂无生成记录，快去输入灵感吧！"
                  />
                </Text>
              }
            />
          )}
        </MobileResultSection>

      {/* 设置抽屉 */}
      <Drawer
        title={
          <Space>
            <SettingOutlined />
            <FormattedMessage
              id="create.settings"
              defaultMessage="高级设置"
            />
          </Space>
        }
        placement="bottom"
        height="80%"
        open={settingsDrawerVisible}
        onClose={() => setSettingsDrawerVisible(false)}
        closeIcon={<CloseOutlined />}
      >
        <MobileDrawerContent>
          <Form form={form} layout="vertical">
            {/* 反向提示词 */}
            <Form.Item
              name="negativePrompt"
              label={
                <Space>
                  <EditOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                  <FormattedMessage
                    id="create.negativePrompt"
                    defaultMessage="反向提示词"
                  />
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'create.negativePrompt.tooltip',
                      defaultMessage: '你不希望画面中出现的元素',
                    })}
                  >
                    <InfoCircleOutlined style={{ color: '#999' }} />
                  </Tooltip>
                </Space>
              }
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'create.negativePrompt.placeholder',
                  defaultMessage: '例如：模糊，低质量，变形的手指...',
                })}
              />
            </Form.Item>

            {/* 画面比例 */}
            <Form.Item
              name="aspectRatio"
              label={
                <Space>
                  <FileImageOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                  <FormattedMessage
                    id="create.ratio"
                    defaultMessage="画面比例"
                  />
                </Space>
              }
            >
              <Select
                optionLabelProp="label"
                disabled={
                  !selectedModel ||
                  getAvailableAspectRatios().length === 0
                }
                placeholder={
                  !selectedModel
                    ? intl.formatMessage({
                        id: 'create.model.select.placeholder',
                        defaultMessage: '请先选择模型',
                      })
                    : undefined
                }
              >
                {getAvailableAspectRatios().map((ratio) => (
                  <Select.Option
                    key={ratio.value}
                    value={ratio.value}
                    label={
                      <Space>
                        {ratio.icon}
                        <span>{ratio.label}</span>
                      </Space>
                    }
                  >
                    <Space>
                      {ratio.icon}
                      <span>{ratio.label}</span>
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 分辨率 */}
            <Form.Item
              name="resolution"
              label={
                <Space>
                  <DesktopOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                  <FormattedMessage
                    id="create.resolution"
                    defaultMessage="分辨率"
                  />
                </Space>
              }
            >
              <Select
                disabled={!selectedModel || getAvailableResolutions().length === 0}
                placeholder={
                  !selectedModel
                    ? intl.formatMessage({
                        id: 'create.model.select.placeholder',
                        defaultMessage: '请先选择模型',
                      })
                    : undefined
                }
              >
                {getAvailableResolutions().map((res) => (
                  <Select.Option key={res.value} value={res.value}>
                    {res.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 输出格式 */}
            <Form.Item
              name="imageFormat"
              label={
                <Space>
                  <FileImageOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                  <FormattedMessage
                    id="create.image.format"
                    defaultMessage="输出格式"
                  />
                </Space>
              }
            >
              <Select
                disabled={
                  !selectedModel ||
                  getAvailableImageFormats().length === 0
                }
                placeholder={
                  !selectedModel
                    ? intl.formatMessage({
                        id: 'create.model.select.placeholder',
                        defaultMessage: '请先选择模型',
                      })
                    : undefined
                }
              >
                {getAvailableImageFormats().map((format) => (
                  <Select.Option key={format} value={format}>
                    {format.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 批次大小 */}
            <Form.Item
              name="batchSize"
              label={
                <Space>
                  <NumberOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                  <FormattedMessage
                    id="create.batchSize"
                    defaultMessage="批次大小"
                  />
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'create.batchSize.tooltip',
                      defaultMessage: '一次生成多少张图片',
                    })}
                  >
                    <InfoCircleOutlined style={{ color: '#999' }} />
                  </Tooltip>
                </Space>
              }
            >
              <Slider
                min={1}
                max={4}
                marks={{
                  1: '1',
                  2: '2',
                  3: '3',
                  4: '4',
                }}
              />
            </Form.Item>
          </Form>
        </MobileDrawerContent>
      </Drawer>

      {/* 模型详情弹窗 */}
      <ModelDetailModal
        open={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setDetailModel(null);
        }}
        model={detailModel}
      />
    </MobileContainer>
  );
};

export default TextToImageMobile;

