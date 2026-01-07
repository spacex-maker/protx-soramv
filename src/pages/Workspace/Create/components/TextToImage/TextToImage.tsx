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
import ModelDetailModal, { ModelDetail } from '../ModelDetailModal';
import TaskDetailModal from './TaskDetailModal';
import { ModelFamily, Model, GenerationTask, GenerationTaskPageResponse } from './types';
import {
  isFree,
  getAspectRatioOption,
  calculateDimensionsFromRatio,
  parseResolution,
  formatResolution,
} from './utils';
import {
  GlobalSelectStyles,
  StyledCard,
  ResultArea,
  ImageGrid,
  ImageWrapper,
  ImageActions,
  ModelOptionWrapper,
  ModelSelectDisplay,
  DetailButton,
  AspectRatioTag,
  AspectRatioOption,
  TitleSection,
  HistorySection,
  HistoryTitle,
  HistoryGrid,
  HistoryCard,
  HistoryImageWrapper,
  HistoryStatusBadge,
  HistoryInfo,
  HistoryModelName,
  HistoryTime,
  HistoryActions,
  HistoryEmpty,
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

const TextToImage: React.FC = () => {
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
  
  // 任务详情模态框相关状态
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
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
      // 出错时回退到家族默认配置
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

  // 自定义模型家族选择框显示内容
  const renderFamilySelectDisplay = (family: ModelFamily | null) => {
    if (!family) return null;
    
    return (
      <ModelSelectDisplay coverImage={family.coverImage}>
        <div className="model-display-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="model-display-name">{family.modelName}</div>
            {family.modelCode && (
              <div className="model-display-code">{family.modelCode}</div>
            )}
          </div>
          {isFree(family.outputPrice, family.currency) ? (
            <div className="model-display-free">
              {intl.formatMessage({
                id: 'create.model.free',
                defaultMessage: '免费',
              })}
            </div>
          ) : (
            family.outputPrice !== null &&
            family.outputPrice !== undefined && (
              <div className="model-display-price">
                <span className="model-display-price-amount">
                  {family.outputPrice}
                </span>
                <span className="model-display-price-currency">
                  {family.currency || 'USD'}
                </span>
                <span className="model-display-price-unit">
                  {intl.formatMessage({
                    id: 'create.model.price.perImage',
                    defaultMessage: '/张',
                  })}
                </span>
              </div>
            )
          )}
        </div>
      </ModelSelectDisplay>
    );
  };

  // 自定义艺术风格选择框显示内容
  const renderStyleModelSelectDisplay = (model: Model | ModelFamily | null, isDefault: boolean = false) => {
    if (!model) return null;
    
    return (
      <ModelSelectDisplay coverImage={model.coverImage}>
        <div className="model-display-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="model-display-name">
              {isDefault ? `${model.modelName} (默认)` : model.modelName}
            </div>
            {model.modelCode && (
              <div className="model-display-code">{model.modelCode}</div>
            )}
          </div>
          {isFree(model.outputPrice, model.currency) ? (
            <div className="model-display-free">
              {intl.formatMessage({
                id: 'create.model.free',
                defaultMessage: '免费',
              })}
            </div>
          ) : (
            model.outputPrice !== null &&
            model.outputPrice !== undefined && (
              <div className="model-display-price">
                <span className="model-display-price-amount">
                  {model.outputPrice}
                </span>
                <span className="model-display-price-currency">
                  {model.currency || 'USD'}
                </span>
                <span className="model-display-price-unit">
                  {intl.formatMessage({
                    id: 'create.model.price.perImage',
                    defaultMessage: '/张',
                  })}
                </span>
              </div>
            )
          )}
        </div>
      </ModelSelectDisplay>
    );
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

  // 获取支持的图片比例选项（根据选中的模型或家族）
  const getAvailableAspectRatios = () => {
    const activeModel = getEffectiveModel();
    if (!activeModel || !activeModel.imageAspectRatios) {
      return [];
    }

    const supportedRatios = activeModel.imageAspectRatios
      .split(',')
      .map((r) => r.trim());

    // 根据后端返回的比例动态生成选项
    return supportedRatios.map((ratio) => getAspectRatioOption(ratio, intl));
  };

  // 获取支持的图片格式选项（根据选中的模型或家族）
  const getAvailableImageFormats = () => {
    const activeModel = getEffectiveModel();
    if (!activeModel || !activeModel.imageFormats) {
      return [];
    }

    const formats = activeModel.imageFormats.split(',').map((f) => f.trim());
    return formats;
  };

  // 获取支持的分辨率选项（根据选中的模型或家族）
  const getAvailableResolutions = () => {
    const activeModel = getEffectiveModel();
    if (!activeModel) {
      return [];
    }

    const resolutions: string[] = [];

    // 如果有默认分辨率，添加到列表
    if (activeModel.imageDefaultResolution) {
      resolutions.push(activeModel.imageDefaultResolution);
    }

    // 如果有最大分辨率，也添加到列表（如果与默认不同）
    if (
      activeModel.imageMaxResolution &&
      activeModel.imageMaxResolution !== activeModel.imageDefaultResolution
    ) {
      resolutions.push(activeModel.imageMaxResolution);
    }

    // 如果没有明确的分辨率，根据比例生成一些常用分辨率
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

    // 添加一些常用分辨率
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
      };

      if (selectedModel?.modelCode) {
        requestData.modelCode = selectedModel.modelCode;
      }

      // 添加模型检查点（使用模型家族的 modelCode）
      if (selectedFamily.modelCode) {
        requestData.sdModelCheckpoint = selectedFamily.modelCode;
      }

      // 添加反向提示词（可选）
      if (values.negativePrompt) {
        requestData.negativePrompt = values.negativePrompt;
      }

      // 优先使用分辨率，如果没有选择分辨率则使用比例计算宽高
      if (values.resolution) {
        const dimensions = parseResolution(values.resolution);
        if (dimensions) {
          requestData.width = dimensions.width;
          requestData.height = dimensions.height;
        }
      } else if (values.aspectRatio) {
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

      // 添加图片格式（可选）
      if (values.imageFormat) {
        requestData.imageFormat = values.imageFormat;
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
          // 兼容 base64 与 URL 链接
          const imageUrls = images
            .map((img: any) => normalizeImageData(img))
            .filter((url: string | null): url is string => Boolean(url));

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

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setDetailModel(null);
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
          taskType: 't2i', // 通过 taskType 参数查询文本生成图片类型的任务
        },
      });

      if (response.data.success && response.data.data) {
        setHistoryTasks(response.data.data.records);
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
    <>
      <GlobalSelectStyles />
      <StyledCard>
        <Row gutter={[32, 24]}>
          {/* --- 左侧：控制面板 --- */}
          <Col xs={24} lg={9}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <TitleSection>
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
              </TitleSection>

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
                    className="model-family-select"
                  >
                    {modelFamilies.map((family) => (
                      <Select.Option
                        key={family.id}
                        value={family.id}
                        label={
                          <div style={{ width: '100%' }}>
                            {renderFamilySelectDisplay(family)}
                          </div>
                        }
                      >
                        <ModelOptionWrapper coverImage={family.coverImage}>
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
                  className="prompt-form-item"
                  label={
                    <div className="prompt-label-wrapper">
                      <Space>
                        <EditOutlined style={{ color: '#1890ff' }} />
                        <FormattedMessage
                          id="create.prompt"
                          defaultMessage="提示词 (Prompt)"
                        />
                      </Space>
                      <div className="prompt-button-wrapper">
                        <Space size={8}>
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
                                  fontSize: 12,
                                  height: 28,
                                  padding: '0 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
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
                          className="prompt-generate-button"
                          style={{ 
                            fontSize: 12,
                            height: 28,
                            padding: '0 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            borderRadius: 6,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 500,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                            marginTop: 4,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
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
                  style={{ marginTop: 32, marginBottom: 20 }}
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
                    onChange={(e) => {
                      setPromptValue(e.target.value);
                    }}
                  />
                </Form.Item>

                {/* 反向提示词 (可选) - 仅当模型支持时显示 */}
                {(selectedModel?.supportNegativePrompt || selectedFamily?.supportNegativePrompt) && (
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
                )}

                {/* 参数设置行：画面比例、输出格式、分辨率 */}
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={8}>
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
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="resolution"
                      label={
                        <Space>
                          <DesktopOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                          <FormattedMessage
                            id="create.resolution"
                            defaultMessage="分辨率"
                          />
                          <Tooltip
                            title={intl.formatMessage({
                              id: 'create.resolution.tooltip',
                              defaultMessage: '选择图片的分辨率，优先级高于画面比例',
                            })}
                          >
                            <InfoCircleOutlined style={{ color: '#999' }} />
                          </Tooltip>
                        </Space>
                      }
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        disabled={!getEffectiveModel() || getAvailableResolutions().length === 0}
                        placeholder={
                          !getEffectiveModel()
                            ? intl.formatMessage({
                                id: 'create.model.select.placeholder',
                                defaultMessage: '请先选择模型',
                              })
                            : intl.formatMessage({
                                id: 'create.resolution.placeholder',
                                defaultMessage: '选择分辨率（可选）',
                              })
                        }
                        allowClear
                      >
                        {getAvailableResolutions().map((res) => (
                          <Select.Option key={res.value} value={res.value}>
                            {res.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* 艺术风格（可选） */}
                <Row gutter={16} style={{ marginBottom: 32 }}>
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
                        value={selectedModel?.id ?? null}
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
                        optionLabelProp="label"
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        dropdownClassName="model-select-dropdown"
                        className="model-style-select"
                      >
                        {/* 添加一个选项，允许使用家族本身 */}
                        {selectedFamily && (
                          <Select.Option
                            key={`family-${selectedFamily.id}`}
                            value={null}
                            label={
                              <div style={{ width: '100%' }}>
                                {renderStyleModelSelectDisplay(selectedFamily, true)}
                              </div>
                            }
                          >
                            <ModelOptionWrapper coverImage={selectedFamily.coverImage}>
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
                              <div style={{ width: '100%' }}>
                                {renderStyleModelSelectDisplay(model, false)}
                              </div>
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

            {/* 生成记录区域 */}
            <HistorySection>
              <HistoryTitle>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
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
              </HistoryTitle>

              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin />
                </div>
              ) : historyTasks.length > 0 ? (
                <>
                  <Image.PreviewGroup>
                    <HistoryGrid>
                      {historyTasks.map((task) => {
                        // 处理所有图片URL
                        const imageUrls = task.resultUrls && task.resultUrls.length > 0
                          ? task.resultUrls.map((url) => normalizeImageSource(url))
                          : [];
                        const thumbnailUrl = task.thumbnailUrl
                          ? normalizeImageSource(task.thumbnailUrl)
                          : imageUrls.length > 0 ? imageUrls[0] : null;
                        const imageCount = imageUrls.length;

                        return (
                          <HistoryCard key={task.id}>
                            <HistoryImageWrapper>
                              {thumbnailUrl ? (
                                <>
                                  {/* 显示第一张图片作为缩略图 */}
                                  <Image
                                    src={thumbnailUrl}
                                    alt={task.modelName}
                                    width="100%"
                                    height="100%"
                                    style={{ objectFit: 'cover', cursor: 'pointer' }}
                                    preview={{
                                      mask: <EyeOutlined style={{ fontSize: 16 }} />,
                                    }}
                                  />
                                  {/* 隐藏的其他图片，用于预览组 */}
                                  {imageUrls.length > 1 && imageUrls.slice(1).map((url, index) => (
                                    <Image
                                      key={`${task.id}-${index + 1}`}
                                      src={url}
                                      alt={`${task.modelName} - ${index + 2}`}
                                      style={{ display: 'none' }}
                                      preview={{}}
                                    />
                                  ))}
                                </>
                              ) : (
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: (task.status === 3 || task.status === 4) ? '#ff4d4f' : '#8c8c8c',
                                    padding: '16px',
                                  }}
                                >
                                  {(task.status === 3 || task.status === 4) ? (
                                    <>
                                      <PictureOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                      <div style={{ fontSize: 11, textAlign: 'center' }}>
                                        <FormattedMessage
                                          id="create.history.failed.noImage"
                                          defaultMessage="生成失败"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <PictureOutlined style={{ fontSize: 32 }} />
                                  )}
                                </div>
                              )}
                              <HistoryStatusBadge status={task.status}>
                                {getStatusText(task.status)}
                              </HistoryStatusBadge>
                              {/* 图片数量指示器 */}
                              {task.status === 2 && imageCount > 1 && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    padding: '4px 8px',
                                    borderRadius: 12,
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    color: '#fff',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                  }}
                                >
                                  <PictureOutlined style={{ fontSize: 12 }} />
                                  <span>{imageCount}</span>
                                </div>
                              )}
                            </HistoryImageWrapper>
                            <HistoryInfo>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <HistoryModelName>{task.modelName}</HistoryModelName>
                                {(task.status === 3 || task.status === 4) && task.errorMessage && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: '#ff4d4f',
                                      marginTop: 4,
                                      marginBottom: 4,
                                      lineHeight: 1.4,
                                      wordBreak: 'break-word',
                                      padding: '4px 8px',
                                      background: 'rgba(255, 77, 79, 0.1)',
                                      borderRadius: 4,
                                      border: '1px solid rgba(255, 77, 79, 0.2)',
                                    }}
                                  >
                                    {task.errorMessage}
                                  </div>
                                )}
                                <HistoryTime>
                                  <ClockCircleOutlined style={{ fontSize: 11 }} />
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
                                        <span style={{ marginLeft: 8, color: '#1890ff' }}>
                                          · {duration}s
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </HistoryTime>
                              </div>
                              <HistoryActions>
                                {/* 详情按钮 - 始终显示在右下角 */}
                                <Button
                                  shape="circle"
                                  size="small"
                                  icon={<InfoCircleOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTaskId(task.id);
                                    setTaskDetailModalVisible(true);
                                  }}
                                  style={{
                                    color: '#1890ff',
                                    background: 'rgba(24, 144, 255, 0.1)',
                                    border: '1px solid rgba(24, 144, 255, 0.3)',
                                  }}
                                  title={intl.formatMessage({
                                    id: 'create.history.detail.tooltip',
                                    defaultMessage: '查看详情',
                                  })}
                                />
                                {/* 下载按钮 - 仅在成功且有图片时显示 */}
                                {task.status === 2 && imageUrls.length > 0 && (
                                  <Button
                                    shape="circle"
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (imageUrls.length === 1) {
                                        downloadImage(imageUrls[0]);
                                      } else {
                                        // 下载所有图片
                                        imageUrls.forEach((url, index) => {
                                          setTimeout(() => {
                                            downloadImage(url, index);
                                          }, index * 300);
                                        });
                                        message.success(
                                          intl.formatMessage(
                                            {
                                              id: 'create.history.downloadAll.start',
                                              defaultMessage: '开始下载 {count} 张图片',
                                            },
                                            { count: imageUrls.length }
                                          )
                                        );
                                      }
                                    }}
                                    style={{
                                      color: '#52c41a',
                                      background: 'rgba(82, 196, 26, 0.1)',
                                      border: '1px solid rgba(82, 196, 26, 0.3)',
                                    }}
                                    title={
                                      imageUrls.length > 1
                                        ? intl.formatMessage(
                                            {
                                              id: 'create.history.downloadAll.tooltip',
                                              defaultMessage: '下载全部 {count} 张图片',
                                            },
                                            { count: imageUrls.length }
                                          )
                                        : intl.formatMessage({
                                            id: 'create.history.download.tooltip',
                                            defaultMessage: '下载图片',
                                          })
                                    }
                                  />
                                )}
                              </HistoryActions>
                            </HistoryInfo>
                          </HistoryCard>
                        );
                      })}
                    </HistoryGrid>
                  </Image.PreviewGroup>
                  {historyPagination.total > historyPagination.pageSize && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                      <Pagination
                        current={historyPagination.current}
                        pageSize={historyPagination.pageSize}
                        total={historyPagination.total}
                        onChange={handleHistoryPageChange}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total) =>
                          intl.formatMessage(
                            {
                              id: 'create.history.total',
                              defaultMessage: '共 {total} 条记录',
                            },
                            { total }
                          )
                        }
                      />
                    </div>
                  )}
                </>
              ) : (
                <HistoryEmpty>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <FormattedMessage
                        id="create.history.empty"
                        defaultMessage="暂无生成记录"
                      />
                    }
                  />
                </HistoryEmpty>
              )}
            </HistorySection>
          </Col>
        </Row>
      </StyledCard>

      {/* 模型详情弹窗 */}
      <ModelDetailModal
        open={detailModalVisible}
        onClose={handleCloseDetail}
        model={detailModel}
      />

      {/* 任务详情弹窗 */}
      <TaskDetailModal
        open={taskDetailModalVisible}
        onClose={() => {
          setTaskDetailModalVisible(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId}
      />
    </>
  );
};

export default TextToImage;

