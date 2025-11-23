import React, { useState, useEffect } from 'react';
import {
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
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';
import ModelDetailModal, { ModelDetail } from '../ModelDetailModal';
import { ModelFamily, Model } from './types';
import {
  isFree,
  getAspectRatioOption,
  calculateDimensionsFromRatio,
} from './utils';
import {
  GlobalSelectStyles,
  StyledCard,
  ResultArea,
  ImageGrid,
  ImageWrapper,
  ImageActions,
  ModelOptionWrapper,
  DetailButton,
  AspectRatioTag,
  AspectRatioOption,
} from './styles';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TextToImage: React.FC = () => {
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
          // 默认选择第一个家族
          const firstFamily = response.data.data[0];
          setSelectedFamily(firstFamily);
          form.setFieldsValue({ familyId: firstFamily.id });
          // 获取该家族下的风格模型列表
          if (firstFamily.modelCode) {
            fetchStyleModels(firstFamily.modelCode, firstFamily);
          }
        } else {
          message.warning(
            intl.formatMessage({
              id: 'create.model.family.loadFailed',
              defaultMessage: '加载模型家族列表失败',
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
  }, [intl, form]);

  // 根据模型更新表单参数
  const updateFormByModel = (model: Model) => {
    if (!model) return;

    const updates: any = {};

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

  // 获取家族下的风格模型列表
  const fetchStyleModels = async (
    parentModelCode: string,
    family: ModelFamily | null = null
  ) => {
    setStyleModelsLoading(true);
    try {
      const response = await instance.get(
        '/productx/sa-ai-models/image/models/by-family',
        {
          params: { parentModelCode },
        }
      );

      // 获取家族信息（优先使用传入的，否则从状态中查找）
      const targetFamily =
        family || modelFamilies.find((f) => f.modelCode === parentModelCode);

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const styleModelsList = response.data.data.map((item: any) => ({
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
        // 默认选择第一个风格模型
        if (styleModelsList.length > 0) {
          const firstStyleModel = styleModelsList[0];
          setSelectedModel(firstStyleModel);
          form.setFieldsValue({ styleModelId: firstStyleModel.id });
          updateFormByModel(firstStyleModel);
        } else {
          // 如果没有风格模型，使用家族本身作为模型
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
        // 如果没有风格模型，使用家族本身作为模型
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
      // 出错时使用家族本身作为模型
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

  // 处理模型家族选择变化
  const handleFamilyChange = (familyId: number) => {
    const family = modelFamilies.find((f) => f.id === familyId);
    if (family) {
      setSelectedFamily(family);
      form.setFieldsValue({ familyId: familyId });
      // 获取该家族下的风格模型列表
      if (family.modelCode) {
        fetchStyleModels(family.modelCode, family);
      }
    }
  };

  // 处理风格模型选择变化
  const handleStyleModelChange = (modelId: number | null) => {
    if (modelId === null) {
      // 如果选择"无"或家族本身，使用家族作为模型
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

  // 获取支持的图片比例选项（根据选中的模型）
  const getAvailableAspectRatios = () => {
    if (!selectedModel || !selectedModel.imageAspectRatios) {
      return [];
    }

    const supportedRatios = selectedModel.imageAspectRatios
      .split(',')
      .map((r) => r.trim());

    // 根据后端返回的比例动态生成选项
    return supportedRatios.map((ratio) => getAspectRatioOption(ratio, intl));
  };

  // 获取支持的图片格式选项（根据选中的模型）
  const getAvailableImageFormats = () => {
    if (!selectedModel || !selectedModel.imageFormats) {
      return [];
    }

    const formats = selectedModel.imageFormats.split(',').map((f) => f.trim());
    return formats;
  };

  // 调用后端 API 生成图片
  const handleGenerate = async (values: any) => {
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

    setLoading(true);
    setGeneratedImages([]); // 清空旧图

    try {
      // 构建请求参数
      const requestData: any = {
        prompt: values.prompt,
        modelCode: selectedModel.modelCode,
      };

      // 添加模型检查点（使用模型家族的 modelCode）
      if (selectedFamily.modelCode) {
        requestData.sdModelCheckpoint = selectedFamily.modelCode;
      }

      // 添加反向提示词（可选）
      if (values.negativePrompt) {
        requestData.negativePrompt = values.negativePrompt;
      }

      // 根据比例计算宽高
      if (values.aspectRatio) {
        const dimensions = calculateDimensionsFromRatio(values.aspectRatio);
        if (dimensions) {
          requestData.width = dimensions.width;
          requestData.height = dimensions.height;
        }
      }

      // 添加批次大小（可选）
      if (values.batchSize) {
        requestData.batchSize = values.batchSize;
      }

      console.log('Generating image with params:', requestData);

      // 调用真实的 API，设置超时时间为 15 分钟（900000ms），生图可能需要较长时间
      const response = await instance.post(
        '/productx/sa-ai-models/image/generate/text',
        requestData,
        {
          timeout: 900000, // 15 分钟超时
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
              id: 'create.success',
              defaultMessage: '生成成功！',
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
                id: 'create.noResult',
                defaultMessage: '未生成图片，请重试',
              })
            );
          }
        }
      } else {
        const errorMsg =
          response.data?.error ||
          response.data?.message ||
          intl.formatMessage({
            id: 'create.error',
            defaultMessage: '生成失败，请重试',
          });
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error('图片生成失败:', error);

      // 检查是否是超时错误
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message.error(
          intl.formatMessage({
            id: 'create.error.timeout',
            defaultMessage:
              '生成超时，请稍后重试。图片生成可能需要较长时间，请耐心等待。',
          })
        );
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          intl.formatMessage({
            id: 'create.error',
            defaultMessage: '生成失败，请重试',
          });
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url: string, index?: number) => {
    try {
      // 如果是 base64 数据 URL，转换为 blob 下载
      if (url.startsWith('data:image')) {
        // 提取 base64 数据
        const base64Data = url.split(',')[1];
        const mimeType = url.match(/data:image\/([^;]+)/)?.[1] || 'png';

        // 将 base64 转换为二进制
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${mimeType}` });

        // 创建下载链接
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const fileName =
          index !== undefined
            ? `generated-${Date.now()}-${index + 1}.${mimeType}`
            : `generated-${Date.now()}.${mimeType}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 释放 blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        // 普通 URL 下载
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

  // 下载所有图片
  const downloadAllImages = () => {
    if (generatedImages.length === 0) {
      message.warning(
        intl.formatMessage({
          id: 'create.noImages',
          defaultMessage: '没有可下载的图片',
        })
      );
      return;
    }

    // 依次下载所有图片，添加延迟避免浏览器阻止多个下载
    generatedImages.forEach((url, index) => {
      setTimeout(() => {
        downloadImage(url, index);
      }, index * 300); // 每个下载间隔300ms
    });

    message.success(
      intl.formatMessage({
        id: 'create.downloadAll.start',
        defaultMessage: `开始下载 ${generatedImages.length} 张图片`,
      })
    );
  };

  // 打开详情弹窗
  const handleShowDetail = (e: React.MouseEvent, model: ModelFamily | Model) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发选择
    setDetailModel(model as ModelDetail);
    setDetailModalVisible(true);
  };

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setDetailModel(null);
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
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <SwapOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                  <FormattedMessage
                    id="create.textToImage.title"
                    defaultMessage="AI 文生图"
                  />
                </Title>
                <Text
                  type="secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
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
                  aspectRatio: undefined,
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
                    <Space>
                      <RobotOutlined style={{ color: '#1890ff' }} />
                      <FormattedMessage
                        id="create.model.family.select"
                        defaultMessage="选择模型家族"
                      />
                    </Space>
                  }
                  style={{ marginBottom: 20 }}
                >
                  <Select
                    value={selectedFamily?.id}
                    onChange={handleFamilyChange}
                    placeholder={intl.formatMessage({
                      id: 'create.model.family.select.placeholder',
                      defaultMessage: '请选择模型家族',
                    })}
                    loading={familiesLoading}
                    style={{ width: '100%' }}
                    optionLabelProp="label"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    dropdownClassName="model-select-dropdown"
                  >
                    {modelFamilies.map((family) => (
                      <Select.Option
                        key={family.id}
                        value={family.id}
                        label={
                          <Space>
                            <span>{family.modelName}</span>
                            {family.modelCode && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                ({family.modelCode})
                              </Text>
                            )}
                          </Space>
                        }
                      >
                        <ModelOptionWrapper>
                          <div className="model-header">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="model-name">
                                {family.modelName}
                              </div>
                              {family.modelCode && (
                                <div className="model-code">
                                  {family.modelCode}
                                </div>
                              )}
                            </div>
                            {isFree(family.outputPrice, family.currency) ? (
                              <div className="model-free">
                                {intl.formatMessage({
                                  id: 'create.model.free',
                                  defaultMessage: '免费',
                                })}
                              </div>
                            ) : (
                              family.outputPrice !== null &&
                              family.outputPrice !== undefined && (
                                <div className="model-price">
                                  <span className="model-price-amount">
                                    {family.outputPrice}
                                  </span>
                                  <span className="model-price-currency">
                                    {family.currency || 'USD'}
                                  </span>
                                  <span className="model-price-unit">
                                    {intl.formatMessage({
                                      id: 'create.model.price.perImage',
                                      defaultMessage: '/张',
                                    })}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                          {family.description && (
                            <div className="model-description" style={{ marginTop: 6 }}>
                              {family.description}
                            </div>
                          )}
                          {/* 显示支持的比例和详情按钮 */}
                          <div className="model-bottom-row">
                            {family.imageAspectRatios && (
                              <div className="model-aspect-ratios">
                                {family.imageAspectRatios
                                  .split(',')
                                  .map((ratio, index) => {
                                    const ratioStr = ratio.trim();
                                    const ratioOption = getAspectRatioOption(
                                      ratioStr,
                                      intl
                                    );
                                    return (
                                      <AspectRatioTag key={index}>
                                        {ratioOption.icon}
                                        <span>{ratioStr}</span>
                                      </AspectRatioTag>
                                    );
                                  })}
                              </div>
                            )}
                            <DetailButton
                              className="model-detail-button"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={(e) => handleShowDetail(e, family)}
                            >
                              <FormattedMessage
                                id="create.model.detail"
                                defaultMessage="详情"
                              />
                            </DetailButton>
                          </div>
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
                  style={{ marginBottom: 20 }}
                >
                  <TextArea
                    rows={5}
                    placeholder={intl.formatMessage({
                      id: 'create.prompt.placeholder',
                      defaultMessage:
                        '例如：一只在太空中漫步的赛博朋克猫咪，霓虹灯背景，高清细节...',
                    })}
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
                      <EditOutlined
                        style={{ color: '#1890ff', fontSize: 12 }}
                      />
                      <FormattedMessage
                        id="create.negativePrompt"
                        defaultMessage="反向提示词 (Negative)"
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
                  style={{ marginBottom: 20 }}
                >
                  <Input
                    placeholder={intl.formatMessage({
                      id: 'create.negativePrompt.placeholder',
                      defaultMessage: '例如：模糊，低质量，变形的手指...',
                    })}
                  />
                </Form.Item>

                {/* 参数设置行 */}
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={12}>
                    <Form.Item
                      name="aspectRatio"
                      label={
                        <Space>
                          <FileImageOutlined
                            style={{ color: '#1890ff', fontSize: 12 }}
                          />
                          <FormattedMessage
                            id="create.ratio"
                            defaultMessage="画面比例"
                          />
                        </Space>
                      }
                      style={{ marginBottom: 0 }}
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
                      name="imageFormat"
                      label={
                        <Space>
                          <FileImageOutlined
                            style={{ color: '#1890ff', fontSize: 12 }}
                          />
                          <FormattedMessage
                            id="create.image.format"
                            defaultMessage="输出格式"
                          />
                        </Space>
                      }
                      style={{ marginBottom: 0 }}
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
                  </Col>
                </Row>

                {/* 艺术风格（可选） */}
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <Form.Item
                      name="styleModelId"
                      label={
                        <Space>
                          <AppstoreOutlined
                            style={{ color: '#1890ff', fontSize: 12 }}
                          />
                          <FormattedMessage
                            id="create.style"
                            defaultMessage="艺术风格"
                          />
                        </Space>
                      }
                      style={{ marginBottom: 0 }}
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
                        optionLabelProp="label"
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        dropdownClassName="model-select-dropdown"
                      >
                        {/* 添加一个选项，允许使用家族本身 */}
                        {selectedFamily && (
                          <Select.Option
                            key={`family-${selectedFamily.id}`}
                            value={null}
                            label={
                              <Space>
                                <span>
                                  {selectedFamily.modelName} (默认)
                                </span>
                              </Space>
                            }
                          >
                            <ModelOptionWrapper>
                              <div className="model-header">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="model-name">
                                    {selectedFamily.modelName} (默认)
                                  </div>
                                  {selectedFamily.modelCode && (
                                    <div className="model-code">
                                      {selectedFamily.modelCode}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {selectedFamily.description && (
                                <div
                                  className="model-description"
                                  style={{ marginTop: 6 }}
                                >
                                  {selectedFamily.description}
                                </div>
                              )}
                              {/* 显示支持的比例和详情按钮 */}
                              <div className="model-bottom-row">
                                {selectedFamily.imageAspectRatios && (
                                  <div className="model-aspect-ratios">
                                    {selectedFamily.imageAspectRatios
                                      .split(',')
                                      .map((ratio, index) => {
                                        const ratioStr = ratio.trim();
                                        const ratioOption = getAspectRatioOption(
                                          ratioStr,
                                          intl
                                        );
                                        return (
                                          <AspectRatioTag key={index}>
                                            {ratioOption.icon}
                                            <span>{ratioStr}</span>
                                          </AspectRatioTag>
                                        );
                                      })}
                                  </div>
                                )}
                                <DetailButton
                                  className="model-detail-button"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={(e) =>
                                    handleShowDetail(e, selectedFamily)
                                  }
                                >
                                  <FormattedMessage
                                    id="create.model.detail"
                                    defaultMessage="详情"
                                  />
                                </DetailButton>
                              </div>
                            </ModelOptionWrapper>
                          </Select.Option>
                        )}
                        {styleModels.map((model) => (
                          <Select.Option
                            key={model.id}
                            value={model.id}
                            label={
                              <Space>
                                <span>{model.modelName}</span>
                              </Space>
                            }
                          >
                            <ModelOptionWrapper coverImage={model.coverImage}>
                              <div className="model-header">
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
                                {isFree(model.outputPrice, model.currency) ? (
                                  <div className="model-free">
                                    {intl.formatMessage({
                                      id: 'create.model.free',
                                      defaultMessage: '免费',
                                    })}
                                  </div>
                                ) : (
                                  model.outputPrice !== null &&
                                  model.outputPrice !== undefined && (
                                    <div className="model-price">
                                      <span className="model-price-amount">
                                        {model.outputPrice}
                                      </span>
                                      <span className="model-price-currency">
                                        {model.currency || 'USD'}
                                      </span>
                                      <span className="model-price-unit">
                                        {intl.formatMessage({
                                          id: 'create.model.price.perImage',
                                          defaultMessage: '/张',
                                        })}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                              {model.description && (
                                <div
                                  className="model-description"
                                  style={{ marginTop: 6 }}
                                >
                                  {model.description}
                                </div>
                              )}
                              {/* 显示支持的比例和详情按钮 */}
                              <div className="model-bottom-row">
                                {model.imageAspectRatios && (
                                  <div className="model-aspect-ratios">
                                    {model.imageAspectRatios
                                      .split(',')
                                      .map((ratio, index) => {
                                        const ratioStr = ratio.trim();
                                        const ratioOption = getAspectRatioOption(
                                          ratioStr,
                                          intl
                                        );
                                        return (
                                          <AspectRatioTag key={index}>
                                            {ratioOption.icon}
                                            <span>{ratioStr}</span>
                                          </AspectRatioTag>
                                        );
                                      })}
                                  </div>
                                )}
                                <DetailButton
                                  className="model-detail-button"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={(e) => handleShowDetail(e, model)}
                                >
                                  <FormattedMessage
                                    id="create.model.detail"
                                    defaultMessage="详情"
                                  />
                                </DetailButton>
                              </div>
                            </ModelOptionWrapper>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* 高级滑块 */}
                <Form.Item
                  name="batchSize"
                  label={
                    <Space>
                      <NumberOutlined style={{ color: '#1890ff' }} />
                      <FormattedMessage
                        id="create.batchSize"
                        defaultMessage="生成数量"
                      />
                    </Space>
                  }
                  style={{ marginBottom: 20 }}
                >
                  <Slider
                    min={1}
                    max={4}
                    marks={{ 1: '1', 2: '2', 3: '3', 4: '4' }}
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
                    style={{
                      height: 48,
                      fontSize: 16,
                      borderRadius: 24,
                    }}
                  >
                    {loading ? (
                      <FormattedMessage
                        id="create.generating"
                        defaultMessage="正在绘制..."
                      />
                    ) : (
                      <FormattedMessage
                        id="create.generate"
                        defaultMessage="立即生成"
                      />
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
                  <Text
                    type="secondary"
                    style={{ marginTop: 16, textAlign: 'center' }}
                  >
                    <FormattedMessage
                      id="create.generating.waiting"
                      defaultMessage="AI 正在挥洒创意，请稍候..."
                    />
                  </Text>
                  <Text
                    type="secondary"
                    style={{ marginTop: 8, fontSize: 12, textAlign: 'center' }}
                  >
                    <FormattedMessage
                      id="create.generating.tip"
                      defaultMessage="图片生成可能需要几分钟时间，请耐心等待，不要关闭页面"
                    />
                  </Text>
                </Space>
              ) : generatedImages.length > 0 ? (
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      marginBottom: 20,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <FormattedMessage
                        id="create.result.title"
                        defaultMessage="生成结果"
                      />
                    </Title>
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={downloadAllImages}
                    >
                      <FormattedMessage
                        id="create.downloadAll"
                        defaultMessage="全部下载"
                      />
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
                            style={{ objectFit: 'contain', cursor: 'pointer' }}
                            preview={{
                              mask: <EyeOutlined style={{ fontSize: 16 }} />,
                            }}
                          />
                          <ImageActions className="image-actions">
                            <Button
                              shape="circle"
                              icon={<DownloadOutlined />}
                              onClick={() => downloadImage(src, index)}
                              style={{
                                color: '#fff',
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                              }}
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
                        <FormattedMessage
                          id="create.empty"
                          defaultMessage="暂无生成记录，快去左侧输入灵感吧！"
                        />
                      </Text>
                    </Space>
                  }
                />
              )}
            </ResultArea>
          </Col>
        </Row>
      </StyledCard>

      {/* 模型详情弹窗 */}
      <ModelDetailModal
        open={detailModalVisible}
        onClose={handleCloseDetail}
        model={detailModel}
      />
    </>
  );
};

export default TextToImage;

