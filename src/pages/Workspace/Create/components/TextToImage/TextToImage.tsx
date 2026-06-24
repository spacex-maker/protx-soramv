import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Typography,
  Input,
  Button,
  Select,
  Slider,
  Switch,
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
  NumberOutlined,
  SwapOutlined,
  EyeOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { useLocale } from 'contexts/LocaleContext';
import instance from 'api/axios';
import ModelDetailModal, { ModelDetail } from '../ModelDetailModal';
import ModelSelectionModal from './ModelSelectionModal';
import TaskDetailModal from './TaskDetailModal';
import HistorySection from './HistorySection';
import AIPromptSection from './AIPromptSection';
import StyleModelSelect from './StyleModelSelect';
import ModelFamilySelect from './ModelFamilySelect';
import ResultSection from './ResultSection';
import { ModelFamily, Model } from './types';
import {
  getAspectRatioOption,
  calculateDimensionsFromRatio,
  parseResolution,
  formatResolution,
  parseResponseImages,
  isFree,
} from './utils';
import EstimatedPriceHint from '../shared/EstimatedPriceHint';
import { useTokenBalance } from '../shared/useTokenBalance';
import { getImageEstimatedPrice, getImageRequiredTokens } from '../shared/estimatedPriceText';
import { useInsufficientBalanceGuard } from '../shared/useInsufficientBalanceGuard';
import { handleGenerationApiFailure } from '../shared/generationErrorUtils';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal';
import { appendTranslatePromptFlag } from '../shared/promptTranslateUtils';
import {
  VOLC_SEEDREAM_SIZE_ASPECT_MAP,
  VOLC_SEEDREAM_ASPECT_RATIOS,
  VOLC_SEEDREAM_SIZES,
  API_ASPECT_RATIOS,
  API_IMAGE_FORMATS,
} from './constants';
import { checkAndSetSubmitting, clearSubmitting } from './submitGuard';
import { useModelFamilies } from './useModelFamilies';
import { useStyleModels } from './useStyleModels';
import { useDownloadImage } from './useDownloadImage';
import {
  GlobalSelectStyles,
  StyledCard,
  EmbedControlPanel,
  ModelOptionWrapper,
  DetailButton,
  AspectRatioTag,
  AspectRatioOption,
  TitleSection,
  SelectLikeButton,
} from './styles';
import type { TextToImageProps } from './embedTypes';
import { resolvePreferredT2iModel } from './resolvePreferredT2iModel';
import { useT2iPageImport } from './useT2iPageImport';
import { consumeT2iImportPayload } from 'utils/postT2iImport';

const { Title, Text } = Typography;

const TextToImage: React.FC<TextToImageProps> = ({
  variant = 'page',
  embedConfig,
  embedActive = true,
  embedded = false,
}) => {
  const intl = useIntl();
  const { locale } = useLocale();
  const location = useLocation();
  const pageImportPayload = useMemo(
    () => (variant === 'embed' ? null : consumeT2iImportPayload(location.state)),
    [location.state, variant]
  );
  const { tokenBalance, balanceLoading } = useTokenBalance();
  const {
    insufficientBalanceOpen,
    insufficientBalanceRequired,
    insufficientBalanceModalBalance,
    closeInsufficientBalanceModal,
    ensureSufficientBalance,
    tryShowFromApiError,
    ensureKycForModel,
  } = useInsufficientBalanceGuard();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const onFirstFamilySelectedRef = useRef<((family: ModelFamily) => void) | null>(null);

  const {
    modelFamilies,
    setModelFamilies,
    selectedFamily,
    setSelectedFamily,
    familiesLoading,
  } = useModelFamilies({
    locale,
    form,
    onFirstFamilySelected: (family) => {
      if (pageImportPayload?.preferredModelCode) return;
      onFirstFamilySelectedRef.current?.(family);
    },
  });

  const updateFormByModelRef = useRef<((model: Model | ModelFamily | null) => void) | null>(null);

  const {
    styleModels,
    setStyleModels,
    selectedModel,
    setSelectedModel,
    styleModelsLoading,
    fetchStyleModels,
  } = useStyleModels({
    form,
    modelFamilies,
    onAfterLoad: (model) => updateFormByModelRef.current?.(model),
  });

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailModel, setDetailModel] = useState<ModelDetail | null>(null);
  
  // 模型选择模态框相关状态
  const [familyModalVisible, setFamilyModalVisible] = useState(false);
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  
  // 任务详情模态框相关状态
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  // 生成记录刷新触发器
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const { downloadImage } = useDownloadImage();

  // API 模型异步任务轮询
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const embedInitialAppliedRef = useRef(false);
  const embedPreferredAppliedRef = useRef(false);
  const embedUserPickedModelRef = useRef(false);

  const isEmbed = variant === 'embed';
  const embedReady = !isEmbed || embedActive;

  useT2iPageImport({
    isEmbed,
    importPayload: pageImportPayload,
    form,
    modelFamilies,
    familiesLoading,
    setSelectedFamily,
    setSelectedModel,
    setStyleModels,
    fetchStyleModels,
  });

  const LeftPanel = isEmbed ? EmbedControlPanel : 'div';
  const paramColProps = isEmbed
    ? ({ xs: 24 as const, sm: 12 as const })
    : ({ flex: '1' as const, style: { minWidth: 0 } });
  const aspectRatioColProps = isEmbed
    ? ({ xs: 24 as const, sm: 13 as const })
    : ({ flex: '1 1 0' as const, style: { minWidth: 0 } });
  const imageFormatColProps = isEmbed
    ? ({ xs: 24 as const, sm: 11 as const })
    : ({ flex: '0 0 108px' as const, style: { width: 108, maxWidth: 108 } });
  const nestedModalProps = isEmbed
    ? { zIndex: 2100, getContainer: () => document.body }
    : {};

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

  updateFormByModelRef.current = updateFormByModel;

  onFirstFamilySelectedRef.current = (family: ModelFamily) => {
    if (isEmbed && embedConfig?.preferredModelCode && !embedUserPickedModelRef.current) {
      return;
    }
    if (family.modelCode) {
      fetchStyleModels(family.modelCode, family);
    }
  };

  // 处理模型家族选择变化
  const handleFamilyChange = (family: ModelFamily) => {
    if (isEmbed) {
      embedUserPickedModelRef.current = true;
    }
    setSelectedFamily(family);
    form.setFieldsValue({ familyId: family.id });
    // 获取该家族下的风格模型列表
    if (family.modelCode) {
      fetchStyleModels(family.modelCode, family);
    }
  };

  // 处理风格模型选择变化
  const handleStyleModelChange = (model: Model | ModelFamily) => {
    if (isEmbed) {
      embedUserPickedModelRef.current = true;
    }
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
  const batchSize = Form.useWatch('batchSize', form) ?? 1;

  const isApiModel =
    (selectedModel?.modelSource ?? selectedFamily?.modelSource ?? '')
      .toUpperCase() === 'API';

  // Volc Seedream 文生图：companyCode=Volc 且 modelCode 包含 seedream，走同步接口
  const effectiveFamily = selectedFamily as ModelFamily & { companyCode?: string } | null;
  const effectiveSelectedModel = selectedModel as Model & { companyCode?: string } | null;
  const companyCode = effectiveFamily?.companyCode ?? effectiveSelectedModel?.companyCode ?? '';
  const effectiveModelCode = effectiveFamily?.modelCode ?? effectiveSelectedModel?.modelCode ?? '';
  const isVolcSeedream =
    companyCode === 'Volc' && effectiveModelCode?.toLowerCase().includes('seedream');

  // API 模型（非 Volc Seedream）：走异步接口
  const isApiModelAsync = isApiModel && !isVolcSeedream;

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
          !isApiModelAsync,
        )
      : null;

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

  // 获取支持的分辨率选项：Volc Seedream 用 2K/4K；其余优先 video 字段，否则 image 字段
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

  // 缓存选项列表，避免每次渲染重算
  const availableAspectRatios = useMemo(
    () => getAvailableAspectRatios(),
    [isVolcSeedream, isApiModel, resolution, selectedModel, selectedFamily, intl]
  );
  const availableImageFormats = useMemo(
    () => getAvailableImageFormats(),
    [isApiModel, selectedModel, selectedFamily]
  );
  const availableResolutions = useMemo(
    () => getAvailableResolutions(),
    [isVolcSeedream, selectedModel, selectedFamily]
  );

  // 三条生成路线共用的结果处理
  const applySuccess = (imageUrls: string[]) => {
    if (imageUrls.length > 0) {
      setGeneratedImages(imageUrls);
      message.success(intl.formatMessage({ id: 'create.success', defaultMessage: '生成成功！' }));
    } else {
      message.warning(intl.formatMessage({ id: 'create.noResult', defaultMessage: '未生成图片，请重试' }));
    }
    setHistoryRefreshTrigger((t) => t + 1);
  };
  const applyError = async (payload?: unknown, err?: string) => {
    const handled = await handleGenerationApiFailure(payload, tryShowFromApiError, {
      fallbackMessage: err || intl.formatMessage({ id: 'create.error', defaultMessage: '生成失败，请重试' }),
    });
    if (!handled) {
      message.error(err || intl.formatMessage({ id: 'create.error', defaultMessage: '生成失败，请重试' }));
    }
  };

  /** 路线一：Volc Seedream 同步文生图 */
  const runSeedreamSync = async (values: any) => {
    const modelCode = selectedModel?.modelCode || selectedFamily?.modelCode || '';
    const requestData: any = appendTranslatePromptFlag({
      prompt: values.prompt,
      sdModelCheckpoint: selectedFamily?.modelCode || modelCode,
      size: values.resolution || '2K',
      seedreamWatermark: values.seedreamWatermark === true,
    }, values);
    if (values.aspectRatio && values.resolution) {
      const sizeKey = (values.resolution || '2K').toUpperCase();
      const map = VOLC_SEEDREAM_SIZE_ASPECT_MAP[sizeKey];
      if (map?.[values.aspectRatio]) requestData.size = map[values.aspectRatio];
    }
    const batch = values.batchSize ?? 1;
    if (batch > 1) {
      requestData.batchSize = batch;
    }
    const response = await instance.post(
      '/productx/sa-ai-models/image/generate/text',
      requestData,
      { timeout: 120000 }
    );
    if (response.data && response.data.success !== false) {
      const data = response.data.data;
      const rawList =
        response.data.images ||
        data?.images ||
        data?.resultUrls ||
        (data?.imageUrl ? [data.imageUrl] : []);
      applySuccess(parseResponseImages(rawList));
    } else {
      await applyError(response.data, response.data?.error || response.data?.message);
    }
  };

  /** 路线二：API 异步文生图（提交任务 + 轮询状态） */
  const runApiAsync = async (values: any) => {
    const modelCode = selectedModel?.modelCode || selectedFamily?.modelCode || '';
    const asyncPayload: any = appendTranslatePromptFlag({ prompt: values.prompt, modelCode }, values);
    if (values.aspectRatio) asyncPayload.aspectRatio = values.aspectRatio;
    if (values.resolution) asyncPayload.resolution = values.resolution;
    if (values.imageFormat) asyncPayload.outputFormat = values.imageFormat;

    const createRes = await instance.post(
      '/productx/sa-ai-models/image/generate/text/async',
      asyncPayload,
      { timeout: 30000 }
    );
    const taskId = createRes.data?.data?.id ?? createRes.data?.data?.taskId;
    if (!taskId) {
      await applyError(
        createRes.data,
        createRes.data?.error ||
          createRes.data?.message ||
          intl.formatMessage({ id: 'create.error', defaultMessage: '生成失败，请重试' })
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
          const rawList = data?.resultUrls ?? (data?.imageUrl ? [data.imageUrl] : []);
          applySuccess(parseResponseImages(rawList));
          setLoading(false);
          return;
        }
        if (status === 'failed' || status === 'error' || status === 'fail') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          await applyError(data, data?.error);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('轮询任务状态失败:', e);
      }
    };

    await pollStatus();
    pollingIntervalRef.current = setInterval(pollStatus, 3000);
  };

  /** 路线三：非 API 模型同步文生图（LOCAL） */
  const runLocalSync = async (values: any) => {
    const requestData: any = appendTranslatePromptFlag({ prompt: values.prompt }, values);
    if (selectedModel?.modelCode) requestData.modelCode = selectedModel.modelCode;
    if (selectedFamily?.modelCode) requestData.sdModelCheckpoint = selectedFamily.modelCode;
    if (values.negativePrompt) requestData.negativePrompt = values.negativePrompt;

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
    if (values.batchSize) requestData.batchSize = values.batchSize;
    if (values.imageFormat) requestData.imageFormat = values.imageFormat;

    const response = await instance.post(
      '/productx/sa-ai-models/image/generate/text',
      requestData,
      { timeout: 900000 }
    );

    if (response.data && response.data.success !== false) {
      const rawList = response.data.images || response.data.data?.images || [];
      const imageUrls = parseResponseImages(rawList);
      if (imageUrls.length > 0) {
        applySuccess(imageUrls);
      } else {
        const errorMsg = response.data.error || response.data.message;
        if (errorMsg) message.error(errorMsg);
        else message.warning(intl.formatMessage({ id: 'create.noResult', defaultMessage: '未生成图片，请重试' }));
      }
    } else {
      await applyError(
        response.data,
        response.data?.error ||
          response.data?.message ||
          intl.formatMessage({ id: 'create.error', defaultMessage: '生成失败，请重试' })
      );
    }
  };

  // 调用后端 API 生成图片：按模型类型走三条路线之一
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

    const modelForPrice = getEffectiveModel();
    const requiredTokens =
      modelForPrice &&
      !isFree(
        modelForPrice.outputPrice,
        modelForPrice.currency,
        modelForPrice.tokenCost,
      )
        ? getImageRequiredTokens(modelForPrice.tokenCost, batchSize, !isApiModelAsync)
        : 0;
    if (!(await ensureSufficientBalance(requiredTokens))) {
      clearSubmitting();
      return;
    }

    const modelForKyc = getEffectiveModel() || selectedFamily;
    if (!(await ensureKycForModel(modelForKyc, selectedFamily, selectedModel))) {
      clearSubmitting();
      return;
    }

    setLoading(true);
    setGeneratedImages([]);

    let skipFinallyLoading = false;
    try {
      if (isVolcSeedream) {
        const allValues = { ...form.getFieldsValue(), ...values };
        await runSeedreamSync(allValues);
        return;
      }
      if (isApiModelAsync) {
        await runApiAsync(values);
        skipFinallyLoading = true;
        return;
      }
      await runLocalSync(values);
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
        if (!(await tryShowFromApiError(errorMessage, error))) {
          message.error(errorMessage);
        }
      }
    } finally {
      clearSubmitting();
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

  // 生成成功后刷新记录
  useEffect(() => {
    if (generatedImages.length > 0 && !loading) {
      // 延迟一下再刷新，确保后端数据已更新
      setTimeout(() => {
        setHistoryRefreshTrigger(prev => prev + 1);
      }, 1000);
    }
  }, [generatedImages.length, loading]);

  useEffect(() => {
    if (!embedActive) {
      embedInitialAppliedRef.current = false;
      embedPreferredAppliedRef.current = false;
      embedUserPickedModelRef.current = false;
    }
  }, [embedActive]);

  useEffect(() => {
    if (!isEmbed || !embedReady || !embedConfig || embedInitialAppliedRef.current) return;
    const updates: Record<string, unknown> = {};
    if (embedConfig.initialPrompt) updates.prompt = embedConfig.initialPrompt;
    if (embedConfig.initialAspectRatio) updates.aspectRatio = embedConfig.initialAspectRatio;
    if (embedConfig.initialBatchSize != null) updates.batchSize = embedConfig.initialBatchSize;
    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
    embedInitialAppliedRef.current = true;
  }, [
    isEmbed,
    embedReady,
    embedConfig?.initialPrompt,
    embedConfig?.initialAspectRatio,
    embedConfig?.initialBatchSize,
    form,
    embedConfig,
  ]);

  useEffect(() => {
    if (
      !isEmbed ||
      !embedReady ||
      !embedConfig?.preferredModelCode ||
      modelFamilies.length === 0 ||
      embedPreferredAppliedRef.current ||
      embedUserPickedModelRef.current
    ) {
      return;
    }
    let cancelled = false;
    const applyPreferredModel = async () => {
      embedPreferredAppliedRef.current = true;
      const restored = await resolvePreferredT2iModel({
        modelCode: embedConfig.preferredModelCode!,
        families: modelFamilies,
        form,
        setSelectedFamily,
        setSelectedModel,
        setStyleModels,
        fetchStyleModels,
      });
      if (!cancelled && !restored && modelFamilies[0] && !embedUserPickedModelRef.current) {
        setSelectedFamily(modelFamilies[0]);
        form.setFieldsValue({ familyId: modelFamilies[0].id });
        await fetchStyleModels(modelFamilies[0].modelCode, modelFamilies[0]);
      }
    };
    applyPreferredModel();
    return () => {
      cancelled = true;
    };
  }, [
    isEmbed,
    embedReady,
    embedConfig?.preferredModelCode,
    modelFamilies,
    form,
    setSelectedFamily,
    setSelectedModel,
    setStyleModels,
    fetchStyleModels,
  ]);

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
      <StyledCard
        style={
          isEmbed
            ? {
                boxShadow: 'none',
                border: 'none',
                background: 'transparent',
                padding: 0,
              }
            : undefined
        }
      >
        <Row gutter={isEmbed ? [28, 28] : [32, 24]}>
          {/* --- 左侧：控制面板 --- */}
          <Col xs={24} lg={isEmbed ? 13 : 9}>
            <LeftPanel style={isEmbed ? undefined : { width: '100%' }}>
            <Space direction="vertical" size={isEmbed ? 'large' : 'middle'} style={{ width: '100%' }}>
              {!embedded && (!isEmbed || !embedConfig?.hideHeader) ? (
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
              ) : null}

              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  aspectRatio: undefined,
                  resolution: undefined,
                  styleModelId: null,
                  batchSize: 2,
                  steps: 30,
                  familyId: null,
                  imageFormat: undefined,
                  seedreamWatermark: false,
                }}
              >
                {/* 模型家族选择 */}
                <ModelFamilySelect
                  form={form}
                  selectedFamily={selectedFamily}
                  familiesLoading={familiesLoading}
                  onOpenModal={() => setFamilyModalVisible(true)}
                />

                {/* 提示词输入（含 AI 生成/丰富、版本历史、恢复） */}
                <AIPromptSection form={form} locale={locale} />

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

                {/* 参数设置：embed 模式双列换行，页面模式单行自适应 */}
                <Row gutter={isEmbed ? [16, 16] : [16, 16]} style={{ marginBottom: isEmbed ? 24 : 20 }}>
                  <Col {...aspectRatioColProps}>
                    <Form.Item
                      name="aspectRatio"
                      label={<Space><FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} /><FormattedMessage id="create.ratio" defaultMessage="画面比例" /></Space>}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        optionLabelProp="label"
                        disabled={!getEffectiveModel() || availableAspectRatios.length === 0}
                        placeholder={!getEffectiveModel() ? intl.formatMessage({ id: 'create.model.select.placeholder', defaultMessage: '请先选择模型' }) : undefined}
                        dropdownMatchSelectWidth={false}
                        dropdownStyle={{ minWidth: 'max-content' }}
                      >
                        {availableAspectRatios.map((ratio) => (
                          <Select.Option key={ratio.value} value={ratio.value} label={<AspectRatioOption>{ratio.icon}<span>{ratio.label}</span></AspectRatioOption>}>
                            <AspectRatioOption>{ratio.icon}<span>{ratio.label}</span></AspectRatioOption>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col {...imageFormatColProps}>
                    <Form.Item
                      name="imageFormat"
                      label={<Space><FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} /><FormattedMessage id="create.image.format" defaultMessage="输出格式" /></Space>}
                      style={{ marginBottom: 0 }}
                    >
                      <Select disabled={!getEffectiveModel()} placeholder={!getEffectiveModel() ? intl.formatMessage({ id: 'create.model.select.placeholder', defaultMessage: '请先选择模型' }) : undefined}>
                        {availableImageFormats.map((format) => <Select.Option key={format} value={format}>{format.toUpperCase()}</Select.Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  {availableResolutions.length > 0 && (
                    <Col {...paramColProps}>
                      <Form.Item
                        name="resolution"
                        label={<Space><DesktopOutlined style={{ color: '#1890ff', fontSize: 12 }} /><FormattedMessage id="create.resolution" defaultMessage="分辨率" /><Tooltip title={intl.formatMessage({ id: 'create.resolution.tooltip', defaultMessage: '选择图片的分辨率，优先级高于画面比例' })}><InfoCircleOutlined style={{ color: '#999' }} /></Tooltip></Space>}
                        style={{ marginBottom: 0 }}
                      >
                        <Select disabled={!getEffectiveModel()} placeholder={intl.formatMessage({ id: 'create.resolution.placeholder', defaultMessage: '选择分辨率（可选）' })} allowClear>
                          {availableResolutions.map((res) => <Select.Option key={res.value} value={res.value}>{res.label}</Select.Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                  {isVolcSeedream && (
                    <Col {...paramColProps}>
                      <Form.Item
                        name="seedreamWatermark"
                        label={<Space><InfoCircleOutlined style={{ color: '#1890ff', fontSize: 12 }} /><FormattedMessage id="create.seedream.watermark" defaultMessage="添加水印" /></Space>}
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <Switch
                          checkedChildren={intl.formatMessage({ id: 'create.seedream.watermark.yes', defaultMessage: '添加' })}
                          unCheckedChildren={intl.formatMessage({ id: 'create.seedream.watermark.no', defaultMessage: '不添加' })}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>

                {/* 艺术风格（可选）- 仅 LOCAL 模型支持 */}
                {!isApiModel && !isVolcSeedream && (
                  <StyleModelSelect
                    form={form}
                    selectedFamily={selectedFamily}
                    selectedModel={selectedModel}
                    styleModelsLoading={styleModelsLoading}
                    onOpenModal={() => setStyleModalVisible(true)}
                  />
                )}

                {/* 生成数量 - LOCAL / Volc Seedream 支持 */}
                {(!isApiModel || isVolcSeedream) && (
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

                {/* 提交按钮 - 仅 onClick 触发，避免 onFinish 导致双重提交 */}
                <Form.Item style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    htmlType="button"
                    icon={<ThunderboltOutlined />}
                    size="large"
                    block
                    loading={loading}
                    onClick={() => {
                      form.validateFields().then((values) => handleGenerate(values)).catch(() => {});
                    }}
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
                  <EstimatedPriceHint
                    price={textToImageEstimatedPrice}
                    tokenBalance={tokenBalance}
                    balanceLoading={balanceLoading}
                  />
                </Form.Item>
              </Form>
            </Space>
            </LeftPanel>
          </Col>

          {/* --- 右侧：结果展示区 --- */}
          <Col xs={24} lg={isEmbed ? 11 : 15}>
            <ResultSection
              loading={loading}
              generatedImages={generatedImages}
              downloadImage={downloadImage}
              downloadAllImages={downloadAllImages}
              onApplyImage={embedConfig?.onApplyImage}
              applyingImageUrl={embedConfig?.applyingImageUrl}
              applyButtonLabel={embedConfig?.applyButtonLabel}
            />

            {(!isEmbed || !embedConfig?.hideHistory) ? (
              <HistorySection
                refreshTrigger={historyRefreshTrigger}
                onTaskDetailClick={(taskId) => {
                  setSelectedTaskId(taskId);
                  setTaskDetailModalVisible(true);
                }}
                downloadImage={downloadImage}
              />
            ) : null}
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
        {...nestedModalProps}
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
        {...nestedModalProps}
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

      <InsufficientBalanceModal
        open={insufficientBalanceOpen}
        onCancel={closeInsufficientBalanceModal}
        requiredTokens={insufficientBalanceRequired}
        tokenBalance={insufficientBalanceModalBalance}
      />
    </>
  );
};

export default TextToImage;

