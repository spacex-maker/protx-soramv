import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
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
  DeleteOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import instance from 'api/axios';
import ModelDetailModal, { ModelDetail } from '../../ModelDetailModal';
import ModelSelectionModal from '../ModelSelectionModal';
import { ModelFamily, Model, GenerationTask, GenerationTaskPageResponse } from '../types';
import {
  isFree,
  getAspectRatioOption,
  calculateDimensionsFromRatio,
  parseResolution,
  formatResolution,
} from '../utils';
import { checkAndSetSubmitting, clearSubmitting } from '../submitGuard';
import EstimatedPriceHint from '../../shared/EstimatedPriceHint';
import { useTokenBalance } from '../../shared/useTokenBalance';
import { getImageEstimatedPrice, getImageRequiredTokens } from '../../shared/estimatedPriceText';
import { useInsufficientBalanceGuard } from '../../shared/useInsufficientBalanceGuard';
import InsufficientBalanceModal from '../../shared/InsufficientBalanceModal';
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
  const { tokenBalance, balanceLoading } = useTokenBalance();
  const {
    insufficientBalanceOpen,
    insufficientBalanceRequired,
    insufficientBalanceModalBalance,
    closeInsufficientBalanceModal,
    ensureSufficientBalance,
    tryShowFromApiError,
  } = useInsufficientBalanceGuard();
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
  
  // 模型选择模态框相关状态
  const [familyModalVisible, setFamilyModalVisible] = useState(false);
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  
  // 生成记录相关状态
  const [historyTasks, setHistoryTasks] = useState<GenerationTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
          '/productx/sa-ai-models/image/families',
          { params: { lang: locale || 'en' } }
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
  }, [intl, locale]);

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
          coverImage: item.coverImage || null,
          videoDefaultResolution: item.videoDefaultResolution ?? item.video_default_resolution,
          videoMaxResolution: item.videoMaxResolution ?? item.video_max_resolution,
          companyName: item.companyName || null,
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

  // 处理模型家族选择变化
  const handleFamilyChange = (family: ModelFamily) => {
    setSelectedFamily(family);
    form.setFieldsValue({ familyId: family.id });
    if (family.modelCode) {
      fetchStyleModels(family.modelCode, family);
    }
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

  const resolution = Form.useWatch('resolution', form) || '2K';

  const isApiModel =
    (selectedModel?.modelSource ?? selectedFamily?.modelSource ?? '')
      .toUpperCase() === 'API';

  const effectiveFamily = selectedFamily as ModelFamily & { companyCode?: string } | null;
  const effectiveSelectedModel = selectedModel as Model & { companyCode?: string } | null;
  const companyCode = effectiveFamily?.companyCode ?? effectiveSelectedModel?.companyCode ?? '';
  const effectiveModelCode = effectiveFamily?.modelCode ?? effectiveSelectedModel?.modelCode ?? '';
  const isVolcSeedream = companyCode === 'Volc' && effectiveModelCode?.toLowerCase().includes('seedream');
  const useAsyncApi = isApiModel && !isVolcSeedream;

  const batchSize = Form.useWatch('batchSize', form) ?? 1;
  const effectiveModelForPrice = getEffectiveModel();
  const textToImageEstimatedPrice =
    effectiveModelForPrice &&
    !isFree(
      effectiveModelForPrice.outputPrice,
      effectiveModelForPrice.currency,
      effectiveModelForPrice.tokenCost,
    )
      ? getImageEstimatedPrice(
          effectiveModelForPrice.tokenCost,
          batchSize,
          !isApiModel,
        )
      : null;

  const VOLC_SEEDREAM_SIZE_ASPECT_MAP: Record<string, Record<string, string>> = {
    '2K': { '1:1': '2048x2048', '4:3': '2304x1728', '3:4': '1728x2304', '16:9': '2560x1440', '9:16': '1440x2560', '3:2': '2496x1664', '2:3': '1664x2496', '21:9': '3024x1296' },
    '4K': { '1:1': '4096x4096', '4:3': '4704x3520', '3:4': '3520x4704', '16:9': '5504x3040', '9:16': '3040x5504', '3:2': '4992x3328', '2:3': '3328x4992', '21:9': '6240x2656' },
  };
  const VOLC_SEEDREAM_ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9'];
  const VOLC_SEEDREAM_SIZES = ['2K', '4K'];

  // API 模型：从后端 imageMaxResolution（如 "1K,2K,4K"）解析可选分辨率，无则默认 1K,2K,4K
  const getApiResolutions = (model: Model | ModelFamily | null): string[] => {
    if (!model?.imageMaxResolution) return ['1K', '2K', '4K'];
    const list = model.imageMaxResolution.split(',').map((s) => s.trim()).filter(Boolean);
    return list.length > 0 ? list : ['1K', '2K', '4K'];
  };

  // Resolution 配置：Volc Seedream 用 2K/4K；否则优先 video 字段，没有则用 image 字段
  const getResolutionOptions = (model: Model | ModelFamily | null): string[] => {
    if (!model) return [];
    const m = model as Model & ModelFamily & { companyCode?: string };
    if (m.companyCode === 'Volc' && m.modelCode?.toLowerCase().includes('seedream')) {
      return ['2K', '4K'];
    }
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

  const API_ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9', 'auto'];
  const API_IMAGE_FORMATS = ['png', 'jpg'];

  // 获取支持的图片比例选项（Volc Seedream 时附带当前分辨率对应的像素）
  const getAvailableAspectRatios = () => {
    if (isVolcSeedream) {
      const sizeKey = (resolution || '2K').toUpperCase();
      const sizeMap = VOLC_SEEDREAM_SIZE_ASPECT_MAP[sizeKey];
      return VOLC_SEEDREAM_ASPECT_RATIOS.map((ratio) => {
        const base = getAspectRatioOption(ratio, intl);
        const px = sizeMap?.[ratio];
        const pixelInfo = px ? ` (${px.replace('x', '×')})` : '';
        return { ...base, label: base.label + pixelInfo };
      });
    }
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

  // 获取支持的图片格式选项
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

  // 获取支持的分辨率选项：Volc Seedream 用 2K/4K；否则优先 video 字段，否则 image 字段
  const getAvailableResolutions = () => {
    if (isVolcSeedream) {
      return VOLC_SEEDREAM_SIZES.map((v) => ({ label: v, value: v }));
    }
    const list = getResolutionOptions(getEffectiveModel());
    if (list.length === 0) return [];
    return list.map((value) => ({
      label: value.length <= 6 ? value : formatResolution(value),
      value,
    }));
  };

  // 调用后端 API 生成图片
  const handleGenerate = async (values: any) => {
    if (checkAndSetSubmitting()) return;
    if (!selectedFamily) {
      message.warning(
        intl.formatMessage({
          id: 'create.model.family.select.placeholder',
          defaultMessage: '请选择模型家族',
        })
      );
      clearSubmitting();
      return;
    }

    // 获取表单所有字段值（包括高级设置中的参数）
    const allValues = form.getFieldsValue();
    
    // 检查提示词
    if (!values.prompt && !allValues.prompt) {
      message.warning(
        intl.formatMessage({
          id: 'create.prompt.required',
          defaultMessage: '请输入提示词',
        })
      );
      clearSubmitting();
      return;
    }

    const modelForPrice = getEffectiveModel();
    const isApiModelForPrice =
      (selectedModel?.modelSource ?? selectedFamily?.modelSource ?? '')
        .toUpperCase() === 'API';
    const requiredTokens =
      modelForPrice &&
      !isFree(
        modelForPrice.outputPrice,
        modelForPrice.currency,
        modelForPrice.tokenCost,
      )
        ? getImageRequiredTokens(
            modelForPrice.tokenCost,
            batchSize,
            !isApiModelForPrice,
          )
        : 0;
    if (!(await ensureSufficientBalance(requiredTokens))) {
      clearSubmitting();
      return;
    }
    
    setLoading(true);
    setGeneratedImages([]);

    const isApiModel =
      (selectedModel?.modelSource ?? selectedFamily?.modelSource ?? '')
        .toUpperCase() === 'API';
    const isVolcSeedreamGen = companyCode === 'Volc' && effectiveModelCode?.toLowerCase().includes('seedream');
    const useAsyncApiGen = isApiModel && !isVolcSeedreamGen;

    let skipFinallyLoading = false;
    try {
      if (isVolcSeedreamGen) {
        const modelCode = selectedModel?.modelCode || selectedFamily?.modelCode || '';
        const requestData: any = {
          prompt: values.prompt || allValues.prompt,
          sdModelCheckpoint: selectedFamily?.modelCode || modelCode,
          size: allValues.resolution || '2K',
          seedreamWatermark: allValues.seedreamWatermark === true,
        };
        if (allValues.aspectRatio && allValues.resolution) {
          const sizeKey = (allValues.resolution || '2K').toUpperCase();
          const map = VOLC_SEEDREAM_SIZE_ASPECT_MAP[sizeKey];
          if (map && map[allValues.aspectRatio]) {
            requestData.size = map[allValues.aspectRatio];
          }
        }
        const response = await instance.post('/productx/sa-ai-models/image/generate/text', requestData, { timeout: 120000 });
        if (response.data && response.data.success !== false) {
          const rawList = response.data.images || response.data.data?.images || response.data.data?.resultUrls || [];
          const imageUrls = (Array.isArray(rawList) ? rawList : [])
            .map((img: any) => normalizeImageData(typeof img === 'string' ? img : img?.url || img))
            .filter((url: string | null): url is string => Boolean(url));
          if (imageUrls.length > 0) {
            setGeneratedImages(imageUrls);
            message.success(intl.formatMessage({ id: 'create.generate.success', defaultMessage: `成功生成 ${imageUrls.length} 张图片！` }));
          } else {
            message.warning(intl.formatMessage({ id: 'create.generate.noImages', defaultMessage: '生成完成，但没有返回图片' }));
          }
          fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
        } else {
          message.error(response.data?.error || response.data?.message || intl.formatMessage({ id: 'create.generate.failed', defaultMessage: '生成失败，请重试' }));
        }
      } else if (useAsyncApiGen) {
        const modelCode =
          selectedModel?.modelCode || selectedFamily.modelCode || '';
        const asyncPayload: any = {
          prompt: values.prompt || allValues.prompt,
          modelCode,
        };
        if (allValues.aspectRatio) asyncPayload.aspectRatio = allValues.aspectRatio;
        if (allValues.resolution) asyncPayload.resolution = allValues.resolution;
        if (allValues.imageFormat) asyncPayload.outputFormat = allValues.imageFormat;

        const createRes = await instance.post(
          '/productx/sa-ai-models/image/generate/text/async',
          asyncPayload,
          { timeout: 30000 }
        );

        const taskId =
          createRes.data?.data?.id ?? createRes.data?.data?.taskId;
        if (!taskId) {
          message.error(
            createRes.data?.error ||
              createRes.data?.message ||
              intl.formatMessage({
                id: 'create.generate.failed',
                defaultMessage: '生成失败，请重试',
              })
          );
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
                    id: 'create.generate.success',
                    defaultMessage: `成功生成 ${imageUrls.length} 张图片！`,
                  })
                );
              } else {
                message.warning(
                  intl.formatMessage({
                    id: 'create.generate.noImages',
                    defaultMessage: '生成完成，但没有返回图片',
                  })
                );
              }
              setLoading(false);
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
                    id: 'create.generate.failed',
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
        skipFinallyLoading = true;
        return;
      }

      const requestData: any = {
        prompt: values.prompt || allValues.prompt,
      };

      if (selectedModel?.modelCode) {
        requestData.modelCode = selectedModel.modelCode;
      }

      if (selectedFamily.modelCode) {
        requestData.sdModelCheckpoint = selectedFamily.modelCode;
      }

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
        const images =
          response.data.images || response.data.data?.images || [];

        if (images && images.length > 0) {
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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        intl.formatMessage({
          id: 'create.generate.error',
          defaultMessage: '生成失败，请检查网络连接或稍后重试',
        });
      if (!(await tryShowFromApiError(errorMessage))) {
        message.error(errorMessage);
      }
    } finally {
      clearSubmitting();
      if (!skipFinallyLoading) {
        setLoading(false);
      }
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

  // 组件卸载时清除轮询
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
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

  const handleDeleteHistoryTask = async (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    Modal.confirm({
      title: intl.formatMessage({ id: 'create.history.deleteConfirm.title', defaultMessage: '确认删除' }),
      content: intl.formatMessage({ id: 'create.history.deleteConfirm.content', defaultMessage: '确定要删除这个任务吗？删除后将无法恢复。' }),
      okText: intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' }),
      cancelText: intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' }),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await instance.delete(`/productx/sa-ai-gen-task/${taskId}`);
          if (response.data?.success) {
            message.success(intl.formatMessage({ id: 'create.history.deleteSuccess', defaultMessage: '删除成功' }));
            fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
          } else {
            message.error(response.data?.message || intl.formatMessage({ id: 'create.history.deleteFailed', defaultMessage: '删除失败' }));
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || intl.formatMessage({ id: 'create.history.deleteFailed', defaultMessage: '删除失败' }));
        }
      },
    });
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
            initialValues={{
              aspectRatio: undefined,
              resolution: undefined,
              styleModelId: null,
              batchSize: 2,
              steps: 30,
              seedreamWatermark: false,
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSettingsDrawerVisible(true);
                    }}
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
              <div onClick={() => !familiesLoading && setFamilyModalVisible(true)} style={{ cursor: familiesLoading ? 'not-allowed' : 'pointer' }}>
                <Select
                  value={selectedFamily?.id}
                  open={false}
                  placeholder={intl.formatMessage({
                    id: 'create.model.family.select.placeholder',
                    defaultMessage: '请选择模型家族',
                  })}
                  loading={familiesLoading}
                  size="large"
                  style={{ width: '100%', pointerEvents: 'none' }}
                >
                  {selectedFamily && (
                    <Select.Option key={selectedFamily.id} value={selectedFamily.id}>
                      <MobileModelOption>
                        <div className="model-name">{selectedFamily.modelName}</div>
                        <div className="model-meta">
                          {isFree(selectedFamily.outputPrice, selectedFamily.currency, selectedFamily.tokenCost) ? (
                            <span className="model-free">
                              {intl.formatMessage({
                                id: 'create.model.free',
                                defaultMessage: '免费',
                              })}
                            </span>
                          ) : (
                            (selectedFamily.tokenCost != null && selectedFamily.tokenCost > 0) ? (
                              <span className="model-price">
                                {selectedFamily.tokenCost} {intl.formatMessage({ id: 'create.model.token.short', defaultMessage: 'token' })}
                              </span>
                            ) : (
                              selectedFamily.outputPrice != null && (
                                <span className="model-price">
                                  {selectedFamily.outputPrice} {selectedFamily.currency || 'USD'}
                                </span>
                              )
                            )
                          )}
                          {(selectedFamily.companyName || (selectedFamily.modelName === 'Nano Banana Pro' ? 'Google' : null)) && <span className="model-brand">{selectedFamily.companyName || 'Google'}</span>}
                        </div>
                      </MobileModelOption>
                    </Select.Option>
                  )}
                </Select>
              </div>
            </Form.Item>

            {/* 艺术风格（可选）- 仅 LOCAL 模型支持 */}
            {!isApiModel && selectedFamily && (
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
                <div 
                  onClick={() => !styleModelsLoading && setStyleModalVisible(true)}
                  style={{ cursor: styleModelsLoading ? 'not-allowed' : 'pointer' }}
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
                    disabled={styleModelsLoading}
                    size="large"
                    style={{ width: '100%', pointerEvents: 'none' }}
                  >
                    {(selectedModel || selectedFamily) && (
                      <Select.Option
                        key={selectedModel?.id || `family-${selectedFamily?.id}`}
                        value={selectedModel?.id ?? null}
                      >
                        {selectedModel ? (
                          <MobileModelOption>
                            <div className="model-name">{selectedModel.modelName}</div>
                            <div className="model-meta">
                              {isFree(selectedModel.outputPrice, selectedModel.currency, selectedModel.tokenCost) ? (
                                <span className="model-free">
                                  {intl.formatMessage({
                                    id: 'create.model.free',
                                    defaultMessage: '免费',
                                  })}
                                </span>
                              ) : (
                                (selectedModel.tokenCost != null && selectedModel.tokenCost > 0) ? (
                                  <span className="model-price">
                                    {selectedModel.tokenCost} {intl.formatMessage({ id: 'create.model.token.short', defaultMessage: 'token' })}
                                  </span>
                                ) : (
                                  selectedModel.outputPrice != null && (
                                    <span className="model-price">
                                      {selectedModel.outputPrice} {selectedModel.currency || 'USD'}
                                    </span>
                                  )
                                )
                              )}
                              {(selectedModel.companyName || (selectedModel.modelName === 'Nano Banana Pro' ? 'Google' : null)) && <span className="model-brand">{selectedModel.companyName || 'Google'}</span>}
                            </div>
                          </MobileModelOption>
                        ) : selectedFamily ? (
                          <MobileModelOption>
                            <div className="model-name">{selectedFamily.modelName} (默认)</div>
                            <div className="model-meta">
                              {isFree(selectedFamily.outputPrice, selectedFamily.currency, selectedFamily.tokenCost) ? (
                                <span className="model-free">
                                  {intl.formatMessage({
                                    id: 'create.model.free',
                                    defaultMessage: '免费',
                                  })}
                                </span>
                              ) : (
                                (selectedFamily.tokenCost != null && selectedFamily.tokenCost > 0) ? (
                                  <span className="model-price">
                                    {selectedFamily.tokenCost} {intl.formatMessage({ id: 'create.model.token.short', defaultMessage: 'token' })}
                                  </span>
                                ) : (
                                  selectedFamily.outputPrice != null && (
                                    <span className="model-price">
                                      {selectedFamily.outputPrice} {selectedFamily.currency || 'USD'}
                                    </span>
                                  )
                                )
                              )}
                              {(selectedFamily.companyName || (selectedFamily.modelName === 'Nano Banana Pro' ? 'Google' : null)) && <span className="model-brand">{selectedFamily.companyName || 'Google'}</span>}
                            </div>
                          </MobileModelOption>
                        ) : null}
                      </Select.Option>
                    )}
                  </Select>
                </div>
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
                htmlType="button"
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
              <EstimatedPriceHint
                price={textToImageEstimatedPrice}
                tokenBalance={tokenBalance}
                balanceLoading={balanceLoading}
              />
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <MobileHistoryModelName>{task.modelName}</MobileHistoryModelName>
                            <Tooltip title={intl.formatMessage({ id: 'create.history.delete', defaultMessage: '删除' })}>
                              <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={(e) => handleDeleteHistoryTask(e, task.id)}
                                style={{ color: '#ff4d4f', padding: '0 4px', minWidth: 28 }}
                              />
                            </Tooltip>
                          </div>
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
            {/* 反向提示词 - 仅当模型支持且非 API 模型时显示 */}
            {!isApiModel &&
              (selectedModel?.supportNegativePrompt || selectedFamily?.supportNegativePrompt) && (
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

            {isVolcSeedream && getAvailableResolutions().length > 0 && (
              <Form.Item
                name="resolution"
                label={
                  <Space>
                    <DesktopOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    <FormattedMessage id="create.resolution" defaultMessage="分辨率" />
                  </Space>
                }
              >
                <Select
                  disabled={!getEffectiveModel()}
                  placeholder={intl.formatMessage({ id: 'create.resolution.placeholder', defaultMessage: '选择分辨率（可选）' })}
                >
                  {getAvailableResolutions().map((res) => (
                    <Select.Option key={res.value} value={res.value}>{res.label}</Select.Option>
                  ))}
                </Select>
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
                style={isVolcSeedream ? { minWidth: 280, width: '100%' } : undefined}
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

            {!isVolcSeedream && getAvailableResolutions().length > 0 && (
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
                  disabled={!getEffectiveModel()}
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
            )}

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

            {/* 批次大小 - 仅 LOCAL 模型支持 */}
            {!isApiModel && (
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
            )}
          </Form>
        </MobileDrawerContent>
      </Drawer>

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
        onClose={() => {
          setDetailModalVisible(false);
          setDetailModel(null);
        }}
        model={detailModel}
      />

      <InsufficientBalanceModal
        open={insufficientBalanceOpen}
        onCancel={closeInsufficientBalanceModal}
        requiredTokens={insufficientBalanceRequired}
        tokenBalance={insufficientBalanceModalBalance}
      />
    </MobileContainer>
  );
};

export default TextToImageMobile;

