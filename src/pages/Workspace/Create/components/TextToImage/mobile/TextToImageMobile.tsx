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
  Pagination,
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
  HistoryOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  BulbOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import instance from 'api/axios';
import ModelDetailModal, { ModelDetail } from '../../ModelDetailModal';
import { ModelFamily, Model, GenerationTask, GenerationTaskPageResponse } from '../types';
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
  MobileHistorySection,
  MobileHistoryTitle,
  MobileHistoryGrid,
  MobileHistoryCard,
  MobileHistoryImageWrapper,
  MobileHistoryStatusBadge,
  MobileHistoryInfo,
  MobileHistoryModelName,
  MobileHistoryTime,
  MobileHistoryEmpty,
} from './styles';

const { Title, Text } = Typography;
const { TextArea } = Input;

const normalizeImageSource = (image: string): string => {
  if (!image) {
    return '';
  }
  const trimmed = image.trim();

  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//') && typeof window !== 'undefined') {
    return `${window.location.protocol}${trimmed}`;
  }

  if (trimmed.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${trimmed}`;
  }

  return `data:image/png;base64,${trimmed}`;
};

const normalizeImageData = (image: any): string | null => {
  if (!image) {
    return null;
  }

  const source =
    typeof image === 'string'
      ? image
      : image.url || image.base64 || image.data || '';

  if (!source) {
    return null;
  }

  return normalizeImageSource(source);
};

const TextToImageMobile: React.FC = () => {
  const intl = useIntl();
  const { locale } = useLocale();
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
  
  // 生成记录相关状态
  const [historyTasks, setHistoryTasks] = useState<GenerationTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // AI生成提示词相关状态
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState(''); // 监听提示词输入框的值
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null); // 保存AI生成/丰富之前的原始提示词
  const [promptHistory, setPromptHistory] = useState<string[]>([]); // 提示词版本历史（最多保存10个版本）

  // AI生成提示词
  const handleGeneratePrompt = async () => {
    setGeneratingPrompt(true);
    try {
      // 获取当前输入框中的提示词（作为基础提示词）
      const currentPrompt = form.getFieldValue('prompt') || '';
      
      // 保存当前提示词作为原始值（如果还没有保存过，或者当前值与原始值不同）
      if (!originalPrompt || originalPrompt !== currentPrompt.trim()) {
        setOriginalPrompt(currentPrompt.trim() || null);
        // 如果当前提示词不为空，添加到历史记录
        if (currentPrompt.trim()) {
          setPromptHistory((prev) => {
            const newHistory = [currentPrompt.trim(), ...prev].slice(0, 10); // 最多保存10个版本
            return newHistory;
          });
        }
      }
      
      const requestData: any = {
        language: locale || 'zh',
      };
      
      // 如果有基础提示词，则传递
      if (currentPrompt.trim()) {
        requestData.basePrompt = currentPrompt.trim();
      }
      
      const response = await instance.post('/productx/sa-ai-models/image/prompt/generate', requestData);

      if (response.data.success && response.data.data) {
        // 处理响应数据：可能是 { prompt: "..." } 或直接是字符串
        const generatedPrompt = 
          typeof response.data.data === 'string' 
            ? response.data.data 
            : response.data.data.prompt || response.data.data;
        
        if (generatedPrompt) {
          // 将生成的提示词填充到输入框
          form.setFieldsValue({ prompt: generatedPrompt });
          setPromptValue(generatedPrompt); // 更新状态
          message.success(
            intl.formatMessage({
              id: 'create.prompt.generate.success',
              defaultMessage: '提示词生成成功！',
            })
          );
        } else {
          message.warning(
            intl.formatMessage({
              id: 'create.prompt.generate.empty',
              defaultMessage: '未生成提示词，请重试',
            })
          );
        }
      } else {
        message.error(
          response.data.message ||
          intl.formatMessage({
            id: 'create.prompt.generate.error',
            defaultMessage: '提示词生成失败，请重试',
          })
        );
      }
    } catch (error: any) {
      console.error('生成提示词失败:', error);
      message.error(
        error.response?.data?.message ||
        intl.formatMessage({
          id: 'create.prompt.generate.error',
          defaultMessage: '提示词生成失败，请重试',
        })
      );
    } finally {
      setGeneratingPrompt(false);
    }
  };

  // 恢复原始提示词
  const handleRestorePrompt = () => {
    if (originalPrompt !== null) {
      form.setFieldsValue({ prompt: originalPrompt });
      setPromptValue(originalPrompt);
      message.success(
        intl.formatMessage({
          id: 'create.prompt.restore.success',
          defaultMessage: '已恢复到原始提示词',
        })
      );
    }
  };

  // 检查是否可以恢复（有原始值且当前值不等于原始值）
  const canRestore = originalPrompt !== null && promptValue.trim() !== originalPrompt;

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
          setSelectedModel(null);
          form.setFieldsValue({ styleModelId: null });
          if (targetFamily) {
            updateFormByModel(targetFamily);
          }
        }
      } else {
        setSelectedModel(null);
        setStyleModels([]);
        form.setFieldsValue({ styleModelId: null });
        if (targetFamily) {
          updateFormByModel(targetFamily);
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
        setSelectedModel(null);
        setStyleModels([]);
        form.setFieldsValue({ styleModelId: null });
        updateFormByModel(targetFamily);
      }
    } finally {
      setStyleModelsLoading(false);
    }
  };

  // 根据模型更新表单参数
  const updateFormByModel = (model: Model | ModelFamily | null) => {
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
    if (modelId === null || modelId === undefined) {
      setSelectedModel(null);
      form.setFieldsValue({ styleModelId: null });
      if (selectedFamily) {
        updateFormByModel(selectedFamily);
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

  const getEffectiveModel = () => selectedModel || selectedFamily || null;

  // 获取支持的图片比例选项
  const getAvailableAspectRatios = () => {
    const activeModel = getEffectiveModel();
    if (!activeModel || !activeModel.imageAspectRatios) {
      return [];
    }
    const supportedRatios = activeModel.imageAspectRatios
      .split(',')
      .map((r) => r.trim());
    return supportedRatios.map((ratio) => getAspectRatioOption(ratio, intl));
  };

  // 获取支持的图片格式选项
  const getAvailableImageFormats = () => {
    const activeModel = getEffectiveModel();
    if (!activeModel || !activeModel.imageFormats) {
      return [];
    }
    const formats = activeModel.imageFormats.split(',').map((f) => f.trim());
    return formats;
  };

  // 获取支持的分辨率选项
  const getAvailableResolutions = () => {
    const activeModel = getEffectiveModel();
    if (!activeModel) {
      return [];
    }
    const resolutions: string[] = [];
    if (activeModel.imageDefaultResolution) {
      resolutions.push(activeModel.imageDefaultResolution);
    }
    if (
      activeModel.imageMaxResolution &&
      activeModel.imageMaxResolution !== activeModel.imageDefaultResolution
    ) {
      resolutions.push(activeModel.imageMaxResolution);
    }
    if (resolutions.length === 0 && activeModel.imageAspectRatios) {
      const ratios = activeModel.imageAspectRatios.split(',').map((r) => r.trim());
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
      };

      if (selectedModel?.modelCode) {
        requestData.modelCode = selectedModel.modelCode;
      }

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

      // 添加图片格式（可选）
      if (allValues.imageFormat) {
        requestData.imageFormat = allValues.imageFormat;
      }

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
          // 兼容 base64 与图片链接
          const imageUrls = images
            .map((img: any) => normalizeImageData(img))
            .filter((url: string | null): url is string => Boolean(url));

          setGeneratedImages(imageUrls);
          message.success(
            intl.formatMessage({
              id: 'create.generate.success',
              defaultMessage: `成功生成 ${imageUrls.length} 张图片！`,
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
    
    // 关闭所有打开的下拉框
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
    // 移除所有 Select 的打开状态
    setTimeout(() => {
      const selectElements = document.querySelectorAll('.ant-select-open');
      selectElements.forEach((el) => {
        const select = el as HTMLElement;
        select.blur();
      });
    }, 0);
    
    setDetailModel(model as ModelDetail);
    setDetailModalVisible(true);
  };

  // 获取生成记录
  const fetchHistoryTasks = async (page: number = 1, pageSize: number = 10) => {
    setHistoryLoading(true);
    try {
      const response = await instance.get<{
        success: boolean;
        data: GenerationTaskPageResponse;
      }>('/productx/sa-ai-gen-task/my-tasks/page', {
        params: {
          currentPage: page,
          pageSize: pageSize,
        },
      });

      if (response.data.success && response.data.data) {
        // 只显示 t2i (文本生成图片) 类型的任务
        const t2iTasks = response.data.data.records.filter(
          (task) => task.taskType === 't2i'
        );
        setHistoryTasks(t2iTasks);
        setHistoryPagination({
          current: response.data.data.current,
          pageSize: response.data.data.size,
          total: response.data.data.total,
        });
      }
    } catch (error: any) {
      console.error('获取生成记录失败:', error);
      // 不显示错误提示，避免干扰用户体验
    } finally {
      setHistoryLoading(false);
    }
  };

  // 组件加载时获取生成记录
  useEffect(() => {
    fetchHistoryTasks();
  }, []);

  // 生成成功后刷新记录
  useEffect(() => {
    if (generatedImages.length > 0 && !loading) {
      // 延迟一下再刷新，确保后端数据已更新
      setTimeout(() => {
        fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
      }, 1000);
    }
  }, [generatedImages.length, loading]);

  // 处理分页变化
  const handleHistoryPageChange = (page: number, pageSize: number) => {
    fetchHistoryTasks(page, pageSize);
  };

  // 获取状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return intl.formatMessage({
          id: 'create.history.status.queued',
          defaultMessage: '排队',
        });
      case 1:
        return intl.formatMessage({
          id: 'create.history.status.processing',
          defaultMessage: '进行中',
        });
      case 2:
        return intl.formatMessage({
          id: 'create.history.status.success',
          defaultMessage: '成功',
        });
      case 3:
        return intl.formatMessage({
          id: 'create.history.status.failed',
          defaultMessage: '失败',
        });
      case 4:
        return intl.formatMessage({
          id: 'create.history.status.timeout',
          defaultMessage: '超时',
        });
      default:
        return '';
    }
  };

  // 计算生成时间（秒）
  const calculateGenerationTime = (startTime: string | null, endTime: string | null): number | null => {
    if (!startTime || !endTime) {
      return null;
    }
    try {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      if (isNaN(start) || isNaN(end) || end < start) {
        return null;
      }
      return Math.round((end - start) / 1000); // 转换为秒
    } catch (error) {
      console.error('计算生成时间失败:', error);
      return null;
    }
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
                  disabled={
                    !selectedFamily ||
                    styleModelsLoading ||
                    styleModels.length === 0
                  }
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
              className="prompt-form-item"
              label={
                <div className="prompt-label-wrapper">
                  <Space>
                    <EditOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    <FormattedMessage
                      id="create.prompt"
                      defaultMessage="提示词 (Prompt)"
                    />
                  </Space>
                  <div className="prompt-button-wrapper">
                    <Space size={6}>
                      {/* 恢复按钮 - 只在可以恢复时显示 */}
                      {canRestore && (
                        <Tooltip
                          title={intl.formatMessage({
                            id: 'create.prompt.restore.tooltip',
                            defaultMessage: '恢复到AI生成/丰富之前的提示词',
                          })}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<UndoOutlined />}
                            onClick={handleRestorePrompt}
                            style={{
                              fontSize: 10,
                              height: 26,
                              padding: '0 8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              borderRadius: 6,
                              background: 'rgba(0, 0, 0, 0.04)',
                              color: '#666',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              fontWeight: 500,
                              transition: 'all 0.3s ease',
                              marginTop: 4,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
                              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <FormattedMessage
                              id="create.prompt.restore"
                              defaultMessage="恢复"
                            />
                          </Button>
                        </Tooltip>
                      )}
                      <Button
                      type="text"
                      size="small"
                      icon={<BulbOutlined />}
                      loading={generatingPrompt}
                      onClick={handleGeneratePrompt}
                      style={{ 
                        fontSize: 11,
                        height: 26,
                        padding: '0 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)',
                        marginTop: 4,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(102, 126, 234, 0.3)';
                      }}
                    >
                      {promptValue.trim() ? (
                        <FormattedMessage
                          id="create.prompt.enrich"
                          defaultMessage="AI 丰富提示词"
                        />
                      ) : (
                        <FormattedMessage
                          id="create.prompt.generate"
                          defaultMessage="AI 生成提示词"
                        />
                      )}
                    </Button>
                    </Space>
                  </div>
                </div>
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
              style={{ marginTop: 24 }}
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
                onChange={(e) => {
                  setPromptValue(e.target.value);
                }}
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

        {/* 生成记录区域 */}
        <MobileHistorySection>
          <MobileHistoryTitle>
            <Title
              level={4}
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 16,
              }}
            >
              <HistoryOutlined style={{ color: '#1890ff' }} />
              <FormattedMessage
                id="create.history.title"
                defaultMessage="生成记录"
              />
            </Title>
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => fetchHistoryTasks(historyPagination.current, historyPagination.pageSize)}
              loading={historyLoading}
            >
              <FormattedMessage
                id="create.history.refresh"
                defaultMessage="刷新"
              />
            </Button>
          </MobileHistoryTitle>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin />
            </div>
          ) : historyTasks.length > 0 ? (
            <>
              <Image.PreviewGroup>
                <MobileHistoryGrid>
                  {historyTasks.map((task) => {
                    const imageUrl =
                      task.resultUrls && task.resultUrls.length > 0
                        ? normalizeImageSource(task.resultUrls[0])
                        : null;
                    const thumbnailUrl = task.thumbnailUrl
                      ? normalizeImageSource(task.thumbnailUrl)
                      : imageUrl;

                    return (
                      <MobileHistoryCard key={task.id}>
                        <MobileHistoryImageWrapper>
                          {thumbnailUrl ? (
                            <Image
                              src={thumbnailUrl}
                              alt={task.modelName}
                              width="100%"
                              height="100%"
                              style={{ objectFit: 'cover', cursor: 'pointer' }}
                              preview={{
                                mask: <EyeOutlined style={{ fontSize: 14 }} />,
                                src: imageUrl || thumbnailUrl,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: task.status === 3 ? '#ff4d4f' : '#8c8c8c',
                                padding: '12px',
                              }}
                            >
                              {task.status === 3 ? (
                                <>
                                  <PictureOutlined style={{ fontSize: 24, marginBottom: 6 }} />
                                  <div style={{ fontSize: 10, textAlign: 'center' }}>
                                    <FormattedMessage
                                      id="create.history.failed.noImage"
                                      defaultMessage="生成失败"
                                    />
                                  </div>
                                </>
                              ) : (
                                <PictureOutlined style={{ fontSize: 24 }} />
                              )}
                            </div>
                          )}
                          <MobileHistoryStatusBadge status={task.status}>
                            {getStatusText(task.status)}
                          </MobileHistoryStatusBadge>
                        </MobileHistoryImageWrapper>
                        <MobileHistoryInfo>
                          <MobileHistoryModelName>{task.modelName}</MobileHistoryModelName>
                          {task.status === 3 && task.errorMessage && (
                            <div
                              style={{
                                fontSize: 10,
                                color: '#ff4d4f',
                                marginTop: 4,
                                marginBottom: 4,
                                lineHeight: 1.3,
                                wordBreak: 'break-word',
                                padding: '3px 6px',
                                background: 'rgba(255, 77, 79, 0.1)',
                                borderRadius: 4,
                                border: '1px solid rgba(255, 77, 79, 0.2)',
                              }}
                            >
                              {task.errorMessage}
                            </div>
                          )}
                          <MobileHistoryTime>
                            <ClockCircleOutlined style={{ fontSize: 10 }} />
                            {new Date(task.createTime).toLocaleString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {(() => {
                              const duration = calculateGenerationTime(task.startTime, task.endTime);
                              if (duration !== null) {
                                return (
                                  <span style={{ marginLeft: 6, color: '#1890ff', fontSize: 10 }}>
                                    · {duration}s
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </MobileHistoryTime>
                        </MobileHistoryInfo>
                      </MobileHistoryCard>
                    );
                  })}
                </MobileHistoryGrid>
              </Image.PreviewGroup>
              {historyPagination.total > historyPagination.pageSize && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <Pagination
                    current={historyPagination.current}
                    pageSize={historyPagination.pageSize}
                    total={historyPagination.total}
                    onChange={handleHistoryPageChange}
                    showSizeChanger={false}
                    size="small"
                    simple
                  />
                </div>
              )}
            </>
          ) : (
            <MobileHistoryEmpty>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <FormattedMessage
                    id="create.history.empty"
                    defaultMessage="暂无生成记录"
                  />
                }
              />
            </MobileHistoryEmpty>
          )}
        </MobileHistorySection>

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
            {/* 反向提示词 - 仅当模型支持时显示 */}
            {(selectedModel?.supportNegativePrompt || selectedFamily?.supportNegativePrompt) && (
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
            )}

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
                  !getEffectiveModel() ||
                  getAvailableAspectRatios().length === 0
                }
                placeholder={
                  !getEffectiveModel()
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
                disabled={!getEffectiveModel() || getAvailableResolutions().length === 0}
                placeholder={
                  !getEffectiveModel()
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
                  !getEffectiveModel() ||
                  getAvailableImageFormats().length === 0
                }
                placeholder={
                  !getEffectiveModel()
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

