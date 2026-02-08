import React, { useState, useEffect, useRef } from 'react';
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
  SwapOutlined,
  RobotOutlined,
  EyeOutlined,
  DesktopOutlined,
  HistoryOutlined,
  BulbOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import instance from 'api/axios';
import ModelDetailModal, { ModelDetail } from '../ModelDetailModal';
import ModelSelectionModal from './ModelSelectionModal';
import TaskDetailModal from './TaskDetailModal';
import PromptVersionHistoryModal from 'components/common/PromptVersionHistoryModal';
import HistorySection from './HistorySection';
import ResultSection from './ResultSection';
import { ModelFamily, Model } from './types';
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
  ModelOptionWrapper,
  ModelSelectDisplay,
  DetailButton,
  AspectRatioTag,
  AspectRatioOption,
  TitleSection,
  SelectLikeButton,
} from './styles';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

  // Normalize image source
  const trimmed = source.trim();
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
  
  // 模型选择模态框相关状态
  const [familyModalVisible, setFamilyModalVisible] = useState(false);
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  
  // 任务详情模态框相关状态
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  // 提示词版本历史模态框相关状态
  const [promptVersionModalVisible, setPromptVersionModalVisible] = useState(false);
  
  // 生成记录刷新触发器
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // API 模型异步任务轮询
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          '/productx/sa-ai-models/image/families',
          { params: { lang: locale || 'en' } }
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
  }, [intl, form, locale]);

  // 根据模型更新表单参数
  const updateFormByModel = (model: Model | ModelFamily | null) => {
    if (!model) return;

    const updates: any = {};
    const isApi = (model as Model & ModelFamily).modelSource?.toUpperCase() === 'API';

    // 设置默认分辨率：优先 video_default_resolution，否则 video_max 第一个，否则 image_default 第一个，否则 image_max 第一个
    const resolutionOptions = getResolutionOptions(model);
    if (resolutionOptions.length > 0) {
      const firstImageDef = model.imageDefaultResolution
        ? model.imageDefaultResolution.split(',')[0]?.trim()
        : '';
      const defaultVal =
        model.videoDefaultResolution?.trim() ||
        firstImageDef ||
        resolutionOptions[0];
      const currentResolution = form.getFieldValue('resolution');
      if (!currentResolution || !resolutionOptions.includes(currentResolution)) {
        updates.resolution = defaultVal;
      }
    } else {
      updates.resolution = undefined;
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
          descriptionEn: item.descriptionEn,
          imageDefaultResolution: item.imageDefaultResolution,
          imageMaxResolution: item.imageMaxResolution,
          imageAspectRatios: item.imageAspectRatios,
          imageFormats: item.imageFormats,
          supportControlnet: item.supportControlnet,
          supportInpaint: item.supportInpaint,
          supportReference: item.supportReference,
          currency: item.currency,
          outputPrice: item.outputPrice,
          modelLevel: item.modelLevel,
          tokenCost: item.tokenCost,
          coverImage: item.coverImage || null,
          videoDefaultResolution: item.videoDefaultResolution ?? item.video_default_resolution,
          videoMaxResolution: item.videoMaxResolution ?? item.video_max_resolution,
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
  const handleFamilyChange = (family: ModelFamily) => {
    setSelectedFamily(family);
    form.setFieldsValue({ familyId: family.id });
    // 获取该家族下的风格模型列表
    if (family.modelCode) {
      fetchStyleModels(family.modelCode, family);
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
          {isFree(family.outputPrice, family.currency, family.tokenCost) ? (
            <div className="model-display-free">
              {intl.formatMessage({
                id: 'create.model.free',
                defaultMessage: '免费',
              })}
            </div>
          ) : (
            (family.tokenCost != null && family.tokenCost > 0) ? (
              <div className="model-display-price">
                <span className="model-display-price-amount">{family.tokenCost}</span>
                <span className="model-display-price-currency">
                  {intl.formatMessage({ id: 'create.model.token', defaultMessage: ' token' })}
                </span>
              </div>
            ) : (
              family.outputPrice != null && (
                <div className="model-display-price">
                  <span className="model-display-price-amount">{family.outputPrice}</span>
                  <span className="model-display-price-currency">{family.currency || 'USD'}</span>
                  <span className="model-display-price-unit">
                    {intl.formatMessage({ id: 'create.model.price.perImage', defaultMessage: '/张' })}
                  </span>
                </div>
              )
            )
          )}
        </div>
        {family.modelName === 'Nano Banana Pro' && (
          <span className="model-display-brand">Google</span>
        )}
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
          {isFree(model.outputPrice, model.currency, model.tokenCost) ? (
            <div className="model-display-free">
              {intl.formatMessage({
                id: 'create.model.free',
                defaultMessage: '免费',
              })}
            </div>
          ) : (
            (model.tokenCost != null && model.tokenCost > 0) ? (
              <div className="model-display-price">
                <span className="model-display-price-amount">{model.tokenCost}</span>
                <span className="model-display-price-currency">
                  {intl.formatMessage({ id: 'create.model.token', defaultMessage: ' token' })}
                </span>
              </div>
            ) : (
              model.outputPrice != null && (
                <div className="model-display-price">
                  <span className="model-display-price-amount">{model.outputPrice}</span>
                  <span className="model-display-price-currency">{model.currency || 'USD'}</span>
                  <span className="model-display-price-unit">
                    {intl.formatMessage({ id: 'create.model.price.perImage', defaultMessage: '/张' })}
                  </span>
                </div>
              )
            )
          )}
        </div>
        {model.modelName === 'Nano Banana Pro' && (
          <span className="model-display-brand">Google</span>
        )}
      </ModelSelectDisplay>
    );
  };

  // 处理风格模型选择变化
  const handleStyleModelChange = (model: Model | ModelFamily) => {
    // 判断是否是家族默认（通过检查是否是 ModelFamily 类型）
    const isFamily = 'modelCode' in model && !styleModels.find(m => m.id === model.id);
    
    if (isFamily) {
      setSelectedModel(null);
      form.setFieldsValue({ styleModelId: null });
      updateFormByModel(model);
    } else {
      setSelectedModel(model as Model);
      form.setFieldsValue({ styleModelId: model.id });
      updateFormByModel(model);
    }
  };

  const getEffectiveModel = () => selectedModel || selectedFamily || null;

  const isApiModel =
    (selectedModel?.modelSource ?? selectedFamily?.modelSource ?? '')
      .toUpperCase() === 'API';

  // API 模型：从后端 imageMaxResolution（如 "1K,2K,4K"）解析可选分辨率，无则默认 1K,2K,4K
  const getApiResolutions = (model: Model | ModelFamily | null): string[] => {
    if (!model?.imageMaxResolution) return ['1K', '2K', '4K'];
    const list = model.imageMaxResolution.split(',').map((s) => s.trim()).filter(Boolean);
    return list.length > 0 ? list : ['1K', '2K', '4K'];
  };

  // Resolution 配置：优先 video 字段，没有则用 image 字段；都没有则不显示该配置
  const getResolutionOptions = (model: Model | ModelFamily | null): string[] => {
    if (!model) return [];
    const vDef = model.videoDefaultResolution?.trim() || '';
    const vMax = model.videoMaxResolution
      ? model.videoMaxResolution.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (vMax.length > 0) {
      const list = [...vMax];
      if (vDef && !list.includes(vDef)) list.unshift(vDef);
      return list;
    }
    if (vDef) return [vDef];
    const fromImageDef = model.imageDefaultResolution
      ? model.imageDefaultResolution.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const fromImageMax = model.imageMaxResolution
      ? model.imageMaxResolution.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const list: string[] = [];
    fromImageDef.forEach((v) => { if (v && !list.includes(v)) list.push(v); });
    fromImageMax.forEach((v) => { if (v && !list.includes(v)) list.push(v); });
    return list;
  };

  // API 模型固定比例（与 /image/generate/text/async 一致）
  const API_ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9', 'auto'];
  const API_IMAGE_FORMATS = ['png', 'jpg'];

  // 获取支持的图片比例选项（根据选中的模型或家族）
  const getAvailableAspectRatios = () => {
    if (isApiModel) {
      return API_ASPECT_RATIOS.map((ratio) => getAspectRatioOption(ratio, intl));
    }
    const activeModel = getEffectiveModel();
    if (!activeModel || !activeModel.imageAspectRatios) {
      return [];
    }

    const supportedRatios = activeModel.imageAspectRatios
      .split(',')
      .map((r) => r.trim());

    return supportedRatios.map((ratio) => getAspectRatioOption(ratio, intl));
  };

  // 获取支持的图片格式选项（根据选中的模型或家族）
  const getAvailableImageFormats = () => {
    if (isApiModel) {
      return API_IMAGE_FORMATS;
    }
    const activeModel = getEffectiveModel();
    if (!activeModel || !activeModel.imageFormats) {
      return [];
    }

    const formats = activeModel.imageFormats.split(',').map((f) => f.trim());
    return formats;
  };

  // 获取支持的分辨率选项：优先 video 字段，否则 image 字段；都没有则无选项（不显示该配置）
  const getAvailableResolutions = () => {
    const list = getResolutionOptions(getEffectiveModel());
    if (list.length === 0) return [];
    return list.map((value) => ({
      label: value.length <= 6 ? value : formatResolution(value),
      value,
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

    const isApiModel =
      (selectedModel?.modelSource ?? selectedFamily.modelSource ?? '')
        .toUpperCase() === 'API';

    let skipFinallyLoading = false;
    try {
      if (isApiModel) {
        // 走异步文生图接口：提交任务后轮询状态
        const modelCode =
          selectedModel?.modelCode || selectedFamily.modelCode || '';
        const asyncPayload: any = {
          prompt: values.prompt,
          modelCode,
        };
        if (values.aspectRatio) asyncPayload.aspectRatio = values.aspectRatio;
        if (values.resolution) asyncPayload.resolution = values.resolution;
        if (values.imageFormat) asyncPayload.outputFormat = values.imageFormat;

        const createRes = await instance.post(
          '/productx/sa-ai-models/image/generate/text/async',
          asyncPayload,
          { timeout: 30000 }
        );

        const taskId =
          createRes.data?.data?.id ?? createRes.data?.data?.taskId;
        if (!taskId) {
          const err =
            createRes.data?.error ||
            createRes.data?.message ||
            intl.formatMessage({
              id: 'create.error',
              defaultMessage: '生成失败，请重试',
            });
          message.error(err);
          return;
        }

        message.info(
          intl.formatMessage({
            id: 'create.image.generate.queued',
            defaultMessage: '任务已提交，正在生成中…',
          })
        );

        const pollStatus = async () => {
          try {
            const statusRes = await instance.get(
              `/productx/sa-ai-models/image/task/${taskId}/status`,
              { timeout: 60000 }
            );
            const data = statusRes.data?.data;
            const status = data?.status;

            if (status === 'completed' || status === 'success') {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              const urls =
                data?.resultUrls ||
                (data?.imageUrl ? [data.imageUrl] : []);
              const imageUrls = urls
                .map((url: string) => normalizeImageData(url))
                .filter((u: string | null): u is string => Boolean(u));
              if (imageUrls.length > 0) {
                setGeneratedImages(imageUrls);
                message.success(
                  intl.formatMessage({
                    id: 'create.success',
                    defaultMessage: '生成成功！',
                  })
                );
              } else {
                message.warning(
                  intl.formatMessage({
                    id: 'create.noResult',
                    defaultMessage: '未生成图片，请重试',
                  })
                );
              }
              setLoading(false);
              setHistoryRefreshTrigger((t) => t + 1);
              return;
            }
            if (
              status === 'failed' ||
              status === 'error' ||
              status === 'fail'
            ) {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              message.error(
                data?.error ||
                  intl.formatMessage({
                    id: 'create.error',
                    defaultMessage: '生成失败，请重试',
                  })
              );
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('轮询任务状态失败:', e);
          }
        };

        await pollStatus();
        pollingIntervalRef.current = setInterval(pollStatus, 3000);
        skipFinallyLoading = true; // 轮询中，由 pollStatus 回调里 setLoading(false)
        return;
      }

      // 非 API 模型：走同步文生图接口
      const requestData: any = {
        prompt: values.prompt,
      };

      if (selectedModel?.modelCode) {
        requestData.modelCode = selectedModel.modelCode;
      }

      if (selectedFamily.modelCode) {
        requestData.sdModelCheckpoint = selectedFamily.modelCode;
      }

      if (values.negativePrompt) {
        requestData.negativePrompt = values.negativePrompt;
      }

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

      if (values.batchSize) {
        requestData.batchSize = values.batchSize;
      }

      if (values.imageFormat) {
        requestData.imageFormat = values.imageFormat;
      }

      console.log('Generating image with params:', requestData);

      const response = await instance.post(
        '/productx/sa-ai-models/image/generate/text',
        requestData,
        {
          timeout: 900000,
        }
      );

      if (response.data && response.data.success !== false) {
        const images =
          response.data.images || response.data.data?.images || [];

        if (images && images.length > 0) {
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
      if (!skipFinallyLoading) {
        setLoading(false);
      }
    }
  };

  // 组件卸载时清除轮询
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

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

  // 生成成功后刷新记录
  useEffect(() => {
    if (generatedImages.length > 0 && !loading) {
      // 延迟一下再刷新，确保后端数据已更新
      setTimeout(() => {
        setHistoryRefreshTrigger(prev => prev + 1);
      }, 1000);
    }
  }, [generatedImages.length, loading]);

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
                  <div onClick={() => !familiesLoading && setFamilyModalVisible(true)} style={{ cursor: familiesLoading ? 'not-allowed' : 'pointer' }}>
                    <Select
                      value={selectedFamily?.id}
                      open={false}
                      placeholder={intl.formatMessage({
                        id: 'create.model.family.select.placeholder',
                        defaultMessage: '请选择模型家族',
                      })}
                      loading={familiesLoading}
                      style={{ width: '100%', pointerEvents: 'none' }}
                      optionLabelProp="label"
                      className="model-family-select"
                    >
                      {selectedFamily && (
                        <Select.Option
                          key={selectedFamily.id}
                          value={selectedFamily.id}
                          label={renderFamilySelectDisplay(selectedFamily)}
                        >
                          {selectedFamily.modelName}
                        </Select.Option>
                      )}
                    </Select>
                  </div>
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
                        <Tooltip
                          title={intl.formatMessage({
                            id: 'create.prompt.version.history.tooltip',
                            defaultMessage: '查看提示词版本历史',
                          })}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<HistoryOutlined />}
                            onClick={() => setPromptVersionModalVisible(true)}
                            style={{
                              fontSize: 12,
                              height: 24,
                              padding: '0 8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              borderRadius: 6,
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#3b82f6',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              fontWeight: 500,
                              transition: 'all 0.3s ease',
                              marginLeft: 8,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <FormattedMessage
                              id="create.prompt.version.history"
                              defaultMessage="版本历史"
                            />
                          </Button>
                        </Tooltip>
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

                {/* 反向提示词 (可选) - 仅当模型支持且非 API 模型时显示 */}
                {!isApiModel &&
                  (selectedModel?.supportNegativePrompt || selectedFamily?.supportNegativePrompt) && (
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
                  {getAvailableResolutions().length > 0 && (
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
                          disabled={!getEffectiveModel()}
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
                  )}
                </Row>

                {/* 艺术风格（可选）- 仅 LOCAL 模型支持 */}
                {!isApiModel && (
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
                      <div 
                        onClick={() => !styleModelsLoading && selectedFamily && setStyleModalVisible(true)}
                        style={{ cursor: (!selectedFamily || styleModelsLoading) ? 'not-allowed' : 'pointer' }}
                      >
                        <Select
                          value={selectedModel?.id ?? null}
                          open={false}
                          placeholder={intl.formatMessage({
                            id: 'create.style.select.placeholder',
                            defaultMessage:
                              '请选择艺术风格（可选，默认使用家族模型）',
                          })}
                          loading={styleModelsLoading}
                          disabled={!selectedFamily || styleModelsLoading}
                          allowClear={false}
                          style={{ width: '100%', pointerEvents: 'none' }}
                          optionLabelProp="label"
                          className="model-style-select"
                        >
                          {(selectedModel || selectedFamily) && (
                            <Select.Option
                              key={selectedModel?.id || `family-${selectedFamily?.id}`}
                              value={selectedModel?.id ?? null}
                              label={
                                selectedModel 
                                  ? renderStyleModelSelectDisplay(selectedModel, false)
                                  : selectedFamily 
                                  ? renderStyleModelSelectDisplay(selectedFamily, true)
                                  : null
                              }
                            >
                              {selectedModel 
                                ? selectedModel.modelName
                                : selectedFamily 
                                ? `${selectedFamily.modelName} (默认)`
                                : ''
                              }
                            </Select.Option>
                          )}
                        </Select>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
                )}

                {/* 生成数量 - 仅 LOCAL 模型支持 */}
                {!isApiModel && (
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
                )}

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
            <ResultSection
              loading={loading}
              generatedImages={generatedImages}
              downloadImage={downloadImage}
              downloadAllImages={downloadAllImages}
            />

            {/* 生成记录区域 */}
            <HistorySection
              refreshTrigger={historyRefreshTrigger}
              onTaskDetailClick={(taskId) => {
                setSelectedTaskId(taskId);
                setTaskDetailModalVisible(true);
              }}
              downloadImage={downloadImage}
            />
          </Col>
        </Row>
      </StyledCard>

      {/* 模型家族选择模态框 */}
      <ModelSelectionModal
        open={familyModalVisible}
        onClose={() => setFamilyModalVisible(false)}
        type="family"
        title={intl.formatMessage({
          id: 'create.model.family.select',
          defaultMessage: '选择模型家族',
        })}
        models={modelFamilies}
        selectedModel={selectedFamily}
        onSelect={(model) => handleFamilyChange(model as ModelFamily)}
        onShowDetail={(model) => {
          setDetailModel(model as ModelDetail);
          setDetailModalVisible(true);
        }}
        loading={familiesLoading}
      />

      {/* 艺术风格选择模态框 */}
      <ModelSelectionModal
        open={styleModalVisible}
        onClose={() => setStyleModalVisible(false)}
        type="style"
        title={intl.formatMessage({
          id: 'create.style',
          defaultMessage: '艺术风格',
        })}
        models={selectedFamily ? [selectedFamily, ...styleModels] : styleModels}
        selectedModel={selectedModel || selectedFamily}
        onSelect={(model) => handleStyleModelChange(model)}
        onShowDetail={(model) => {
          setDetailModel(model as ModelDetail);
          setDetailModalVisible(true);
        }}
        loading={styleModelsLoading}
      />

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

      {/* 提示词版本历史弹窗 */}
      <PromptVersionHistoryModal
        open={promptVersionModalVisible}
        onClose={() => setPromptVersionModalVisible(false)}
        moduleType="t2i"
        onSelectPrompt={(prompt, negativePrompt) => {
          form.setFieldsValue({ 
            prompt,
            ...(negativePrompt && { negativePrompt })
          });
          setPromptValue(prompt);
        }}
      />
    </>
  );
};

export default TextToImage;

