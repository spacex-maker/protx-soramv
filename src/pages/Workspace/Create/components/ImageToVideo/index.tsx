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
  Empty,
  Spin,
  Tooltip,
  Modal,
} from 'antd';
import { 
  ThunderboltOutlined,
  DownloadOutlined, 
  VideoCameraOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  CloseOutlined,
  SyncOutlined,
  InboxOutlined,
  DeleteOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';
import { VideoResult, Model, GenerationTask, GenerationTaskPageResponse } from './types';
import { 
  GlobalSelectStyles,
  StyledCard,
  ResultArea,
  VideoPlaceholder,
  ActionOverlay,
  AspectRatioOption,
  CustomUploadArea,
  UploadIcon,
  UploadText,
  UploadHint,
  EmbedControlPanel,
} from './styles';
import VideoModelSelectionModal from './VideoModelSelectionModal';
import VideoModelSelectField from './VideoModelSelectField';
import { 
  getAspectRatioOption, 
  getCameraMotions, 
  getModelAspectRatios, 
  getModelDurationOptions,
  getBase64,
  normalizeUrl,
} from './utils';
import HistorySection from './HistorySection';
import TaskDetailModal from './TaskDetailModal';
import WaitingTaskQueue, { WaitingTask } from './WaitingTaskQueue';
import {
  loadPersistedWaitingTasks,
  persistWaitingTasks,
} from '../shared/waitingTaskPersistence';
import ModelDetailModal from './ModelDetailModal';
import DoubaoSeedance20Params, {
  DOUBAO_SEEDANCE_2_0_FAST_260128,
  DOUBAO_SEEDANCE_20_I2V_FIRST_INPUT_ID,
  DOUBAO_SEEDANCE_20_I2V_END_INPUT_ID,
} from './generationParams/DoubaoSeedance20Params';
import EstimatedPriceHint from '../shared/EstimatedPriceHint';
import { useTokenBalance } from '../shared/useTokenBalance';
import { formatDurationEstimatedTooltip } from '../shared/estimatedPriceText';
import { getVideoRequiredTokens } from '../shared/balanceUtils';
import { useInsufficientBalanceGuard } from '../shared/useInsufficientBalanceGuard';
import { handleGenerationApiFailure } from '../shared/generationErrorUtils';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal';
import PromptTranslateEnSwitch from '../shared/PromptTranslateEnSwitch';
import { appendTranslatePromptFlag } from '../shared/promptTranslateUtils';
import ImageGenPickerModal, { type ImagePickerTarget } from '../shared/ImageGenPickerModal';
import SelectedImagePreviewOverlay from '../shared/SelectedImagePreviewOverlay';
import { preloadVideoModelCovers } from '../shared/videoModelCoverPreload';
import VideoTaskQueueButton from '../shared/VideoTaskQueueButton';
import { filterPaidT2iModels } from '../TextToImage/utils';
import type { ImageToVideoProps } from './embedTypes';
import { resolvePreferredI2vModel } from './resolvePreferredI2vModel';

const WAITING_QUEUE_SCOPE = 'imageToVideo';

const { Title, Text } = Typography;
const { TextArea } = Input;

function isSeedance2Model(model: Model | null | undefined): boolean {
  const code = (model?.modelCode || '').toLowerCase();
  return code.includes('seedance-2') || code.includes('seedance2');
}

function isSeedance15Model(model: Model | null | undefined): boolean {
  const code = (model?.modelCode || '').toLowerCase();
  return code.includes('seedance') && !isSeedance2Model(model);
}

function getSeedance2ResolutionSelectOptions(model: Model | null | undefined): { value: string; label: string }[] {
  const max = (model?.videoMaxResolution || '').toLowerCase();
  const opts = [
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p' },
    { value: '1080p', label: '1080p' },
  ];
  if (max.includes('1080')) {
    return opts;
  }
  return opts.filter((o) => o.value !== '1080p');
}

function splitSeedanceRefLines(raw: string | undefined | null): string[] {
  if (!raw || !String(raw).trim()) return [];
  return String(raw)
    .split(/[\r\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeSeedance2ResolutionFromModel(model: Model | null | undefined): string {
  const raw = (model?.videoDefaultResolution || '720p').trim();
  const lower = raw.toLowerCase();
  if (lower === '480p' || lower === '720p' || lower === '1080p') return lower;
  return '720p';
}

export type { ImageToVideoEmbedConfig, ImageToVideoEmbedTaskPayload, ImageToVideoProps } from './embedTypes';

const ImageToVideo: React.FC<ImageToVideoProps> = ({
  seedancePage = false,
  embedded = false,
  variant = 'page',
  embedConfig,
  embedActive = true,
}) => {
  const intl = useIntl();
  const { tokenBalance, balanceLoading } = useTokenBalance();
  const {
    insufficientBalanceOpen,
    insufficientBalanceRequired,
    insufficientBalanceModalBalance,
    closeInsufficientBalanceModal,
    ensureSufficientBalance,
    ensureKycForModel,
    tryShowFromApiError,
  } = useInsufficientBalanceGuard();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const updateFormByModelRef = useRef<(model: Model) => void>(() => {});
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTasksRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [waitingTasks, setWaitingTasks] = useState<WaitingTask[]>(() =>
    loadPersistedWaitingTasks(WAITING_QUEUE_SCOPE)
  );
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false);
  const isUserSubmitRef = useRef<boolean>(false);
  
  // 图片上传状态
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageRemoteUrl, setOriginalImageRemoteUrl] = useState<string | null>(null);
  /** Seedance 2.x 可选尾帧图（上传后作为 imageUrls 第二项） */
  const [endFrameImageUrl, setEndFrameImageUrl] = useState<string | null>(null);
  const [endFrameImageFile, setEndFrameImageFile] = useState<File | null>(null);
  const [endFrameImageRemoteUrl, setEndFrameImageRemoteUrl] = useState<string | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<ImagePickerTarget>('first');
  const [isDragging, setIsDragging] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  // AI提示词丰富相关状态
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState(''); // 监听提示词输入框的值
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null); // 保存AI丰富之前的原始提示词
  
  // 生成记录相关状态
  const [historyTasks, setHistoryTasks] = useState<GenerationTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // 任务详情模态框相关状态
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  // 模型详情模态框相关状态
  const [modelDetailModalVisible, setModelDetailModalVisible] = useState(false);
  const [selectedModelForDetail, setSelectedModelForDetail] = useState<Model | null>(null);

  const isEmbed = variant === 'embed';
  const embedReady = !isEmbed || embedActive;
  const LeftPanel = isEmbed ? EmbedControlPanel : 'div';
  const paramColProps = isEmbed
    ? ({ xs: 24 as const, sm: 12 as const })
    : ({ flex: '1' as const, style: { minWidth: 0 } });
  const nestedModalProps = isEmbed
    ? { zIndex: 2100, getContainer: () => document.body }
    : {};
  const embedInitialAppliedRef = useRef(false);
  const embedPreferredAppliedRef = useRef(false);
  const embedUserPickedModelRef = useRef(false);
  const embedConfigRef = useRef(embedConfig);
  embedConfigRef.current = embedConfig;

  const notifyEmbedTask = async (taskId: string, videoUrl?: string) => {
    const handler = embedConfigRef.current?.onTaskSubmitted;
    if (!isEmbed || !handler) return;
    await handler({ taskId, videoUrl });
  };

  // 初始化时确保标志为 false
  useEffect(() => {
    isUserSubmitRef.current = false;
  }, []);

  // 监听主题变化
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
          params: { modelType: 'i2v' },
        });
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          let list = response.data.data as Model[];
          if (seedancePage) {
            list = list.filter((m: Model) => (m.modelCode || '').toLowerCase().includes('seedance'));
          }
          if (isEmbed && embedConfig?.excludeFreeModels) {
            list = filterPaidT2iModels(list);
          }
          setModels(list);
          const firstModel = list[0];
          if (firstModel && !(isEmbed && embedConfig?.preferredModelCode && !embedUserPickedModelRef.current)) {
            setSelectedModel(firstModel);
            form.setFieldsValue({ modelId: firstModel.id });
            updateFormByModelRef.current(firstModel);
          }
          preloadVideoModelCovers(list, { priorityModelId: firstModel?.id });
          if (seedancePage && list.length === 0) {
            message.warning(
              intl.formatMessage({
                id: 'create.seedance.noModel',
                defaultMessage: '暂无可用的 Seedance 模型，请先在后台配置',
              })
            );
          } else if (!firstModel && !seedancePage) {
            message.warning(
              intl.formatMessage({
                id: 'create.model.loadFailed',
                defaultMessage: '加载模型列表失败',
              })
            );
          }
        } else {
          setModels([]);
          setSelectedModel(null);
          form.setFieldsValue({ modelId: null });
          message.warning(
            intl.formatMessage(
              seedancePage
                ? {
                    id: 'create.seedance.noModel',
                    defaultMessage: '暂无可用的 Seedance 模型，请先在后台配置',
                  }
                : {
                    id: 'create.model.loadFailed',
                    defaultMessage: '加载模型列表失败',
                  }
            )
          );
        }
      } catch (error: unknown) {
        console.error('获取模型列表失败:', error);
        message.error(
          intl.formatMessage({
            id: 'create.model.loadFailed',
            defaultMessage: '加载模型列表失败',
          })
        );
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
    if (!isEmbed) {
      fetchHistoryTasks();
      fetchPendingTasks();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      pollingTasksRef.current.forEach((timer) => {
        clearInterval(timer);
      });
      pollingTasksRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 与历史一致：intl / seedance 页切换时重拉
  }, [intl, seedancePage, isEmbed, embedConfig?.excludeFreeModels]);

  useEffect(() => {
    persistWaitingTasks(WAITING_QUEUE_SCOPE, waitingTasks);
  }, [waitingTasks]);

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
    if (embedConfig.initialDuration != null) updates.duration = embedConfig.initialDuration;
    if (embedConfig.initialSeedanceCameraFixed != null) {
      updates.seedanceCameraFixed = embedConfig.initialSeedanceCameraFixed;
    }
    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
      if (typeof updates.prompt === 'string') {
        setPromptValue(updates.prompt);
      }
    }
    if (embedConfig.initialStartFrameUrl) {
      setOriginalImageRemoteUrl(embedConfig.initialStartFrameUrl);
      setOriginalImageUrl(normalizeUrl(embedConfig.initialStartFrameUrl));
      setOriginalImageFile(null);
    }
    if (embedConfig.initialEndFrameUrl) {
      setEndFrameImageRemoteUrl(embedConfig.initialEndFrameUrl);
      setEndFrameImageUrl(normalizeUrl(embedConfig.initialEndFrameUrl));
      setEndFrameImageFile(null);
    }
    embedInitialAppliedRef.current = true;
  }, [isEmbed, embedReady, embedConfig, form]);

  useEffect(() => {
    if (
      !isEmbed ||
      !embedReady ||
      !embedConfig?.preferredModelCode ||
      models.length === 0 ||
      embedPreferredAppliedRef.current ||
      embedUserPickedModelRef.current
    ) {
      return;
    }
    embedPreferredAppliedRef.current = true;
    const restored = resolvePreferredI2vModel({
      modelCode: embedConfig.preferredModelCode,
      models,
      form,
      setSelectedModel,
      updateFormByModel: (model) => updateFormByModelRef.current(model),
    });
    if (!restored && models[0] && !embedUserPickedModelRef.current) {
      setSelectedModel(models[0]);
      form.setFieldsValue({ modelId: models[0].id });
      updateFormByModelRef.current(models[0]);
    }
  }, [isEmbed, embedReady, embedConfig?.preferredModelCode, models, form]);

  useEffect(() => {
    if (selectedModel && models.length > 0) {
      preloadVideoModelCovers(models, { priorityModelId: selectedModel.id });
    }
  }, [selectedModel?.id, models]);

  // 生成成功后刷新记录
  useEffect(() => {
    if (generatedVideo && !loading) {
      setTimeout(() => {
        fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
      }, 1000);
    }
  }, [generatedVideo, loading]);

  // AI丰富提示词
  const handleEnhancePrompt = async () => {
    setEnhancingPrompt(true);
    try {
      // 获取当前输入框中的提示词（作为基础提示词）
      const currentPrompt = form.getFieldValue('prompt') || '';
      
      // 验证提示词不能为空
      if (!currentPrompt.trim()) {
        message.warning(intl.formatMessage({
          id: 'create.prompt.enhance.empty',
          defaultMessage: '请先输入基础提示词',
        }));
        return;
      }
      
      // 保存当前提示词作为原始值
      if (!originalPrompt || originalPrompt !== currentPrompt.trim()) {
        setOriginalPrompt(currentPrompt.trim());
      }
      
      const requestData: any = {
        basePrompt: currentPrompt.trim(),
        language: intl.locale || 'zh',
        scene: 'video', // 图生视频场景
      };
      
      const response = await instance.post('/productx/sa-ai-models/prompt/enhance', requestData);

      if (response.data.success && response.data.data) {
        // 处理响应数据
        const enhancedPrompt = 
          typeof response.data.data === 'string' 
            ? response.data.data 
            : response.data.data.prompt || response.data.data;
        
        if (enhancedPrompt) {
          // 将丰富后的提示词填充到输入框
          form.setFieldsValue({ prompt: enhancedPrompt });
          setPromptValue(enhancedPrompt);
          message.success(
            intl.formatMessage({
              id: 'create.prompt.enhance.success',
              defaultMessage: '提示词丰富成功！',
            })
          );
        } else {
          message.warning(
            intl.formatMessage({
              id: 'create.prompt.enhance.empty.result',
              defaultMessage: '未生成丰富后的提示词，请重试',
            })
          );
        }
      } else {
        message.error(
          response.data.message ||
          intl.formatMessage({
            id: 'create.prompt.enhance.error',
            defaultMessage: '提示词丰富失败，请重试',
          })
        );
      }
    } catch (error: any) {
      console.error('丰富提示词失败:', error);
      message.error(
        error.response?.data?.message ||
        intl.formatMessage({
          id: 'create.prompt.enhance.error',
          defaultMessage: '提示词丰富失败，请重试',
        })
      );
    } finally {
      setEnhancingPrompt(false);
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

  // 根据模型更新表单参数
  const updateFormByModel = (model: Model) => {
    if (!model) return;

    const updates: any = {};

    // 设置视频比例
    const supportedRatios = getModelAspectRatios(model);
    if (supportedRatios.length > 0) {
      const currentRatio = form.getFieldValue('aspectRatio');
      if (!supportedRatios.includes(currentRatio)) {
        updates.aspectRatio = supportedRatios[0];
      }
    }

    // 设置视频时长
    const durationOptions = getModelDurationOptions(model);
    if (durationOptions === null) {
      if (model.videoDuration) {
        const currentDuration = form.getFieldValue('duration') || 8;
        if (currentDuration > model.videoDuration) {
          updates.duration = model.videoDuration;
        } else if (currentDuration < 4) {
          updates.duration = 4;
        }
      }
    } else if (durationOptions.length > 0) {
      const currentDuration = form.getFieldValue('duration');
      if (!currentDuration || !durationOptions.includes(currentDuration)) {
        updates.duration = durationOptions[0];
      }
    }

    // 如果不支持镜头运动，设置为 none
    if (!model.supportCameraMotion) {
      updates.cameraMotion = 'none';
    }

    // Seedance 1.5 / 2.x 默认参数（2.x 水印默认关，与方舟 body.watermark 一致）
    if (isSeedance2Model(model)) {
      const allowedRes = getSeedance2ResolutionSelectOptions(model).map((o) => o.value);
      let res = normalizeSeedance2ResolutionFromModel(model);
      if (!allowedRes.includes(res)) {
        res = allowedRes.includes('720p') ? '720p' : allowedRes[0] || '720p';
      }
      updates.seedanceResolution = res;
      updates.seedanceWatermark = false;
      updates.seedanceGenerateAudio = false;
      updates.seedanceReturnLastFrame = false;
    } else if (model.modelCode && model.modelCode.toLowerCase().includes('seedance')) {
      updates.seedanceCameraFixed = false;
      updates.seedanceWatermark = true;
    }

    // 设置视频格式
    if (model.videoFormats) {
      const formats = model.videoFormats.split(',').map(f => f.trim());
      if (formats.length > 0) {
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

  updateFormByModelRef.current = updateFormByModel;

  const applySelectedModel = (model: Model) => {
    if (isEmbed) {
      embedUserPickedModelRef.current = true;
    }
    if (!isSeedance2Model(model)) {
      setEndFrameImageUrl(null);
      setEndFrameImageFile(null);
      setEndFrameImageRemoteUrl(null);
    }
    setSelectedModel(model);
    form.setFieldsValue({ modelId: model.id });
    updateFormByModel(model);
  };

  const openImagePicker = (target: ImagePickerTarget) => {
    setImagePickerTarget(target);
    setImagePickerOpen(true);
  };

  // 处理文件选择
  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setOriginalImageUrl(null);
      setOriginalImageFile(null);
      setOriginalImageRemoteUrl(null);
      form.setFieldsValue({ inputFile: undefined });
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      message.error(intl.formatMessage({ id: 'create.i2v.fileType.error', defaultMessage: '请选择图片文件' }));
      return;
    }

    try {
      const url = await getBase64(file);
      setOriginalImageUrl(url);
      setOriginalImageFile(file);
      setOriginalImageRemoteUrl(null);
      form.setFieldsValue({ inputFile: file.name });
    } catch (error) {
      message.error(intl.formatMessage({ id: 'create.i2v.fileRead.error', defaultMessage: '图片读取失败' }));
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
    setOriginalImageFile(null);
    setOriginalImageRemoteUrl(null);
    form.setFieldsValue({ inputFile: undefined });
    const fileInput = document.getElementById('i2v-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    const seedance20First = document.getElementById(DOUBAO_SEEDANCE_20_I2V_FIRST_INPUT_ID) as HTMLInputElement;
    if (seedance20First) seedance20First.value = '';
  };

  const handleEndFrameFileSelect = async (file: File | null) => {
    if (!file) {
      setEndFrameImageUrl(null);
      setEndFrameImageFile(null);
      setEndFrameImageRemoteUrl(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      message.error(intl.formatMessage({ id: 'create.i2v.fileType.error', defaultMessage: '请选择图片文件' }));
      return;
    }
    try {
      const url = await getBase64(file);
      setEndFrameImageUrl(url);
      setEndFrameImageFile(file);
      setEndFrameImageRemoteUrl(null);
    } catch {
      message.error(intl.formatMessage({ id: 'create.i2v.fileRead.error', defaultMessage: '图片读取失败' }));
    }
  };

  const handleEndFrameFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleEndFrameFileSelect(file);
  };

  const handleRemoveEndFrame = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEndFrameImageUrl(null);
    setEndFrameImageFile(null);
    setEndFrameImageRemoteUrl(null);
    const el = document.getElementById('i2v-endframe-upload-input') as HTMLInputElement;
    if (el) el.value = '';
    const seedance20End = document.getElementById(DOUBAO_SEEDANCE_20_I2V_END_INPUT_ID) as HTMLInputElement;
    if (seedance20End) seedance20End.value = '';
  };

  const applyRemoteImageSelection = (
    target: ImagePickerTarget,
    remoteUrl: string,
  ) => {
    if (target === 'first') {
      setOriginalImageUrl(remoteUrl);
      setOriginalImageFile(null);
      setOriginalImageRemoteUrl(remoteUrl);
      form.setFieldsValue({ inputFile: 'library' });
      return;
    }
    setEndFrameImageUrl(remoteUrl);
    setEndFrameImageFile(null);
    setEndFrameImageRemoteUrl(remoteUrl);
  };

  const handlePickerSelectLocal = async (file: File) => {
    if (imagePickerTarget === 'first') {
      await handleFileSelect(file);
      return;
    }
    await handleEndFrameFileSelect(file);
  };

  const handlePickerSelectRemote = async (remoteUrl: string) => {
    applyRemoteImageSelection(imagePickerTarget, remoteUrl);
  };

  const handleQuickSelectEndFrame = async (remoteUrl: string) => {
    if (!isSeedance2Model(selectedModel)) return;
    applyRemoteImageSelection('end', remoteUrl);
  };

  // 获取支持的视频比例选项
  const getAvailableAspectRatios = () => {
    if (!selectedModel) {
      return [];
    }

    const supportedRatios = getModelAspectRatios(selectedModel);
    
    if (supportedRatios.length === 0) {
      return [];
    }
    
    return supportedRatios.map(ratio => getAspectRatioOption(ratio, intl));
  };

  // 获取最大视频时长
  const getMaxDuration = () => {
    return selectedModel?.videoDuration || 15;
  };

  // 获取视频时长选项
  const getDurationOptions = () => {
    return getModelDurationOptions(selectedModel);
  };

  // 计算预估价格
  const calculateEstimatedPrice = (duration: number): string => {
    if (!selectedModel || selectedModel.tokenCost === null || selectedModel.tokenCost === undefined) {
      return '';
    }
    
    const totalTokens = selectedModel.tokenCost * duration;
    
    return `${totalTokens} Token`;
  };

  // 获取支持的视频格式选项
  const getAvailableVideoFormats = () => {
    if (!selectedModel || !selectedModel.videoFormats) {
      return [];
    }

    const formats = selectedModel.videoFormats.split(',').map(f => f.trim());
    return formats;
  };

  // 获取支持的视频风格选项
  const getAvailableVideoStyles = () => {
    if (!selectedModel || !selectedModel.videoSupportStyle) {
      return [];
    }

    const styles = selectedModel.videoSupportStyle.split(',').map(s => s.trim()).filter(s => s);
    return styles;
  };

  // 获取支持的视频质量选项
  const getAvailableVideoQualities = () => {
    if (!selectedModel || !selectedModel.videoQuality) {
      return [];
    }

    const qualities = selectedModel.videoQuality.split(',').map(q => q.trim()).filter(q => q);
    return qualities;
  };

  /** 视频比例 + 输出格式（可选第三列，如 Seedance Fast 的输出分辨率） */
  const renderAspectRatioAndFormatRow = (layout?: { marginBottom?: number; thirdColumn?: React.ReactNode }) => {
    const mb = layout?.marginBottom ?? 20;
    const thirdColumn = layout?.thirdColumn;
    const availableRatios = getAvailableAspectRatios();
    const availableFormats = getAvailableVideoFormats();
    const hasRatios = availableRatios.length > 0;
    const hasFormats = availableFormats.length > 0;
    if (!hasRatios && !hasFormats && !thirdColumn) {
      return null;
    }
    const colCount = (hasRatios ? 1 : 0) + (hasFormats ? 1 : 0) + (thirdColumn ? 1 : 0);
    const smSpan = colCount >= 3 ? 8 : colCount === 2 ? 12 : 24;
    return (
      <Row gutter={16} style={{ marginBottom: mb }}>
        {hasRatios && (
          <Col xs={24} sm={smSpan}>
            <Form.Item
              name="aspectRatio"
              label={
                <Space>
                  <FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                  <FormattedMessage id="create.video.ratio" defaultMessage="视频比例" />
                </Space>
              }
              style={{ marginBottom: 0 }}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const validValues = availableRatios.map((r) => r.value);
                    if (validValues.includes(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        intl.formatMessage({
                          id: 'create.video.ratio.invalid',
                          defaultMessage: '请选择模型支持的视频比例',
                        }),
                      ),
                    );
                  },
                },
              ]}
            >
              <Select
                optionLabelProp="label"
                placeholder={intl.formatMessage({
                  id: 'create.video.ratio.placeholder',
                  defaultMessage: '请选择视频比例',
                })}
                allowClear={false}
              >
                {availableRatios.map((ratio) => (
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
        )}
        {hasFormats && (
          <Col xs={24} sm={smSpan}>
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
                placeholder={intl.formatMessage({
                  id: 'create.video.format.placeholder',
                  defaultMessage: '请选择输出格式',
                })}
              >
                {availableFormats.map((format) => (
                  <Select.Option key={format} value={format}>
                    {format.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}
        {thirdColumn && (
          <Col xs={24} sm={smSpan}>
            {thirdColumn}
          </Col>
        )}
      </Row>
    );
  };

  const renderVideoDurationField = (layout?: { marginBottom?: number }) => {
    const mb = layout?.marginBottom ?? 20;
    const durationOptions = getDurationOptions();
    if (durationOptions !== null && durationOptions.length === 0) {
      return null;
    }
    return (
      <Form.Item
        name="duration"
        label={
          <Space>
            <ClockCircleOutlined style={{ color: '#1890ff' }} />
            <FormattedMessage id="create.video.duration" defaultMessage="视频时长 (秒)" />
          </Space>
        }
        style={{ marginBottom: mb }}
      >
        {durationOptions === null ? (
          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.duration !== currentValues.duration} noStyle>
            {({ getFieldValue }) => {
              const duration = getFieldValue('duration') || 8;
              return (
                <Slider
                  min={4}
                  max={getMaxDuration()}
                  value={duration}
                  marks={{
                    4: intl.formatMessage({ id: 'create.duration.4s', defaultMessage: '4s' }),
                    8: intl.formatMessage({ id: 'create.duration.8s', defaultMessage: '8s' }),
                    [getMaxDuration()]: intl.formatMessage(
                      {
                        id: 'create.duration.format',
                        defaultMessage: '{duration}s',
                      },
                      { duration: getMaxDuration() },
                    ),
                  }}
                  tooltip={{
                    formatter: (val) => {
                      const d = val as number;
                      const price = calculateEstimatedPrice(d);
                      if (price) {
                        return formatDurationEstimatedTooltip(
                          intl,
                          d,
                          price,
                          tokenBalance,
                          balanceLoading,
                        );
                      }
                      return intl.formatMessage(
                        {
                          id: 'create.duration.format',
                          defaultMessage: '{duration}s',
                        },
                        { duration: d },
                      );
                    },
                  }}
                  disabled={!selectedModel}
                  onChange={(val) => {
                    form.setFieldsValue({ duration: val });
                  }}
                />
              );
            }}
          </Form.Item>
        ) : (
          <Select
            disabled={!selectedModel || durationOptions.length === 0}
            placeholder={
              !selectedModel
                ? intl.formatMessage({
                    id: 'create.model.select.placeholder',
                    defaultMessage: '请先选择模型',
                  })
                : intl.formatMessage({
                    id: 'create.duration.select.placeholder',
                    defaultMessage: '请选择视频时长',
                  })
            }
          >
            {durationOptions.map((duration) => (
              <Select.Option key={duration} value={duration}>
                {intl.formatMessage(
                  {
                    id: 'create.duration.format',
                    defaultMessage: '{duration}s',
                  },
                  { duration },
                )}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
    );
  };

  // 根据选中的比例获取对应的分辨率
  const getResolutionByAspectRatio = (aspectRatio: string): string | null => {
    if (!selectedModel || !selectedModel.videoAspectResolution) {
      return null;
    }

    const ratios = getModelAspectRatios(selectedModel);
    if (ratios.length === 0) {
      return null;
    }

    const resolutions = selectedModel.videoAspectResolution.split(',').map(r => r.trim());
    
    const index = ratios.indexOf(aspectRatio);
    if (index >= 0 && index < resolutions.length) {
      return resolutions[index];
    }
    
    return null;
  };

  // 停止所有轮询
  const stopAllPolling = () => {
    pollingTasksRef.current.forEach((timer) => {
      clearInterval(timer);
    });
    pollingTasksRef.current.clear();
    setWaitingTasks([]);
  };

  // 已完成任务的ID集合，用于防止重复处理
  const completedTasksRef = useRef<Set<string>>(new Set());
  /** 用户主动从队列删除的任务，恢复 pending 时不再拉回 */
  const dismissedTaskIdsRef = useRef<Set<string>>(new Set());

  const clearTaskPollingTimer = (taskId: string) => {
    const timer = pollingTasksRef.current.get(taskId);
    if (timer) {
      clearInterval(timer);
      pollingTasksRef.current.delete(taskId);
    }
  };

  const removeTaskFromQueue = (taskId: string) => {
    clearTaskPollingTimer(taskId);
    dismissedTaskIdsRef.current.add(taskId);
    setWaitingTasks((prev) => prev.filter((task) => task.taskId !== taskId));
  };

  /** 任务完成/失败时移出队列 */
  const finishTaskInQueue = (taskId: string) => {
    clearTaskPollingTimer(taskId);
    setWaitingTasks((prev) => prev.filter((task) => task.taskId !== taskId));
  };

  // 兼容完成回调中的旧命名
  const stopTaskPolling = finishTaskInQueue;

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string, aspectRatio: string, duration: number) => {
    // 如果任务已被标记为完成，直接返回
    if (completedTasksRef.current.has(taskId)) {
      return;
    }
    if (dismissedTaskIdsRef.current.has(taskId)) {
      return;
    }
    // 已停止轮询的任务不再请求状态
    if (!pollingTasksRef.current.has(taskId)) {
      return;
    }
    
    try {
      const response = await instance.get(`/productx/sa-ai-models/video/task/${taskId}/status`);
      
      // 再次检查，防止并发请求 / 用户已停止轮询
      if (completedTasksRef.current.has(taskId)) {
        return;
      }
      if (!pollingTasksRef.current.has(taskId)) {
        return;
      }
      
      if (response.data && response.data.success) {
        const taskData = response.data.data;
        const status = taskData.status;

        // 如果任务完成
        if (status === 'completed' || status === 'success') {
          const videoUrl = taskData.videoUrl || taskData.video_url;
          // 原子性：没有可播放视频 URL 时不出队，继续轮询等待结果落库
          if (!videoUrl) {
            setWaitingTasks((prev) =>
              prev.map((task) =>
                task.taskId === taskId
                  ? { ...task, pollStatus: 'fetching_result' as const }
                  : task
              )
            );
            return;
          }

          setGeneratedVideo({
            url: videoUrl,
            aspectRatio,
            duration,
            thumbnail: taskData.thumbnail || taskData.thumbnailUrl || '',
          });
          completedTasksRef.current.add(taskId);
          stopTaskPolling(taskId);
          setLoading(false);
          message.success(
            intl.formatMessage({
              id: 'create.video.generate.success',
              defaultMessage: '视频生成成功',
            })
          );
          await notifyEmbedTask(taskId, videoUrl);
        } else if (status === 'finalizing' || status === 'syncing') {
          setWaitingTasks((prev) =>
            prev.map((task) =>
              task.taskId === taskId && task.pollStatus !== 'cancelled'
                ? { ...task, pollStatus: 'fetching_result' as const }
                : task
            )
          );
        }
        // 如果任务失败
        else if (status === 'failed' || status === 'error') {
          // 标记任务已完成，防止重复处理
          completedTasksRef.current.add(taskId);
          stopTaskPolling(taskId);
          setLoading(false);
          const errorMsg = taskData.error || intl.formatMessage({ 
            id: 'create.video.generate.failed', 
            defaultMessage: '视频生成失败' 
          });
          message.error(errorMsg);
        }
      } else {
        throw new Error(response.data?.message || intl.formatMessage({ 
          id: 'create.video.status.checkFailed', 
          defaultMessage: '查询任务状态失败' 
        }));
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || 
          error.message === 'canceled' || 
          error.code === 'ERR_CANCELED') {
        return;
      }
      
      console.error('查询任务状态失败:', error);
    }
  };

  // 开始轮询任务状态
  const startPolling = (taskId: string, aspectRatio: string, duration: number, prompt?: string) => {
    dismissedTaskIdsRef.current.delete(taskId);
    completedTasksRef.current.delete(taskId);

    const referenceImages: WaitingTask['referenceImages'] = [];
    if (originalImageUrl) {
      referenceImages.push({
        url: originalImageRemoteUrl || originalImageUrl,
        kind: 'image',
        label: '@图像1',
      });
    }
    if (endFrameImageUrl) {
      referenceImages.push({
        url: endFrameImageRemoteUrl || endFrameImageUrl,
        kind: 'image',
        label: '@图像2',
      });
    }

    setWaitingTasks((prev) => {
      const existing = prev.find((task) => task.taskId === taskId);
      if (existing) {
        return prev.map((task) =>
          task.taskId === taskId
            ? {
                ...task,
                pollStatus: 'polling' as const,
                aspectRatio: aspectRatio || task.aspectRatio,
                duration: duration || task.duration,
                prompt: prompt ?? task.prompt,
                referenceImages:
                  referenceImages.length > 0 ? referenceImages : task.referenceImages,
              }
            : task
        );
      }
      return [
        ...prev,
        {
          taskId,
          modelName: selectedModel?.modelName || '未知模型',
          prompt: prompt || form.getFieldValue('prompt') || '',
          submitTime: new Date().toLocaleString('zh-CN'),
          aspectRatio,
          duration,
          pollStatus: 'polling',
          referenceImages: referenceImages.length ? referenceImages : undefined,
        },
      ];
    });

    if (!pollingTasksRef.current.has(taskId)) {
      const timer = setInterval(() => {
        pollTaskStatus(taskId, aspectRatio, duration);
      }, 3000);
      pollingTasksRef.current.set(taskId, timer);
      pollTaskStatus(taskId, aspectRatio, duration);
    }
  };

  const handleStopPolling = (taskId: string) => {
    clearTaskPollingTimer(taskId);
    setWaitingTasks((prev) =>
      prev.map((task) =>
        task.taskId === taskId ? { ...task, pollStatus: 'cancelled' as const } : task
      )
    );
    message.info(
      intl.formatMessage({
        id: 'create.waitingTask.stopDone',
        defaultMessage: '已停止该任务的状态轮询',
      })
    );
  };

  const handleRemoveTask = (taskId: string) => {
    removeTaskFromQueue(taskId);
    message.success(
      intl.formatMessage({
        id: 'create.waitingTask.removed',
        defaultMessage: '已从任务队列中删除',
      })
    );
  };

  const handleResumePolling = (taskId: string) => {
    const task = waitingTasks.find((t) => t.taskId === taskId);
    if (!task) return;
    startPolling(taskId, task.aspectRatio || '16:9', task.duration || 8, task.prompt);
    message.success(
      intl.formatMessage({
        id: 'create.waitingTask.resumed',
        defaultMessage: '已重新开始轮询该任务',
      })
    );
  };

  // 取消当前正在进行的生成
  const handleCancelGenerate = () => {
    stopAllPolling();
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setLoading(false);
    message.info(intl.formatMessage({ 
      id: 'create.video.generate.cancelled', 
      defaultMessage: '已取消视频生成' 
    }));
  };

  // 获取用户进行中的任务并恢复轮询
  const fetchPendingTasks = async () => {
    // 页面刷新后：恢复本地队列中未取消任务的轮询，以便重新拉取已成功的视频结果
    const persisted = loadPersistedWaitingTasks(WAITING_QUEUE_SCOPE);
    persisted.forEach((task) => {
      if (task.pollStatus === 'cancelled') return;
      if (dismissedTaskIdsRef.current.has(task.taskId)) return;
      if (pollingTasksRef.current.has(task.taskId)) return;
      const aspectRatio = task.aspectRatio || '16:9';
      const duration = task.duration || 8;
      const timer = setInterval(() => {
        pollTaskStatus(task.taskId, aspectRatio, duration);
      }, 3000);
      pollingTasksRef.current.set(task.taskId, timer);
      pollTaskStatus(task.taskId, aspectRatio, duration);
    });

    try {
      const response = await instance.get<{
        success: boolean;
        data: GenerationTask[];
      }>('/productx/sa-ai-gen-task/my-tasks/pending', {
        params: { taskType: 'i2v' },
      });

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const pendingTasks = response.data.data;
        console.log('恢复进行中的任务:', pendingTasks.length);

        const newQueueItems: WaitingTask[] = [];

        pendingTasks.forEach((task) => {
          if (!task.id) return;
          const taskId = String(task.id);
          if (dismissedTaskIdsRef.current.has(taskId)) return;

          newQueueItems.push({
            taskId,
            modelName: task.modelName || '未知模型',
            prompt: task.prompt || '',
            submitTime: task.createTime
              ? new Date(task.createTime).toLocaleString('zh-CN')
              : new Date().toLocaleString('zh-CN'),
            aspectRatio: '16:9',
            duration: 8,
            pollStatus: 'polling',
            referenceImages: (task.inputUrls || [])
              .filter(Boolean)
              .map((url, index) => ({
                url,
                kind: 'image' as const,
                label: `@图像${index + 1}`,
              })),
            referenceVideos: (task.seedanceVideoReferenceUrls || [])
              .filter(Boolean)
              .map((url, index) => ({
                url,
                kind: 'video' as const,
                label: `@视频${index + 1}`,
              })),
            referenceAudios: (task.seedanceAudioReferenceUrls || [])
              .filter(Boolean)
              .map((url, index) => ({
                url,
                kind: 'audio' as const,
                label: `@音频${index + 1}`,
              })),
          });
        });

        let queueSnapshot: WaitingTask[] = [];
        setWaitingTasks((prev) => {
          queueSnapshot = prev;
          const existingIds = new Set(prev.map((t) => t.taskId));
          const toAdd = newQueueItems.filter((item) => !existingIds.has(item.taskId));
          return toAdd.length ? [...prev, ...toAdd] : prev;
        });

        newQueueItems.forEach((item) => {
          const taskId = item.taskId;
          if (dismissedTaskIdsRef.current.has(taskId)) return;
          if (pollingTasksRef.current.has(taskId)) return;
          const existing = queueSnapshot.find((t) => t.taskId === taskId);
          if (existing?.pollStatus === 'cancelled') return;

          const timer = setInterval(() => {
            pollTaskStatus(taskId, '16:9', 8);
          }, 3000);
          pollingTasksRef.current.set(taskId, timer);
          pollTaskStatus(taskId, '16:9', 8);
        });

        if (pendingTasks.length > 0) {
          setLoading(true);
        }
      }
    } catch (error: any) {
      console.error('获取进行中任务失败:', error);
      // 不显示错误提示，避免干扰用户体验
    }
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
          taskType: 'i2v',
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
    } finally {
      setHistoryLoading(false);
    }
  };

  // 获取状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return intl.formatMessage({ id: 'create.history.status.processing', defaultMessage: '处理中' });
      case 2:
        return intl.formatMessage({ id: 'create.history.status.success', defaultMessage: '成功' });
      case 3:
      case 4:
        return intl.formatMessage({ id: 'create.history.status.failed', defaultMessage: '失败' });
      default:
        return intl.formatMessage({ id: 'create.history.status.unknown', defaultMessage: '未知' });
    }
  };

  // 处理分页变化
  const handleHistoryPageChange = (page: number, pageSize: number) => {
    fetchHistoryTasks(page, pageSize);
  };

  // 显示任务详情
  const handleShowTaskDetail = (taskId: number) => {
    setSelectedTaskId(taskId);
    setTaskDetailModalVisible(true);
  };

  // 关闭任务详情模态框
  const handleCloseTaskDetail = () => {
    setTaskDetailModalVisible(false);
    setSelectedTaskId(null);
  };

  // 关闭模型详情模态框
  const handleCloseModelDetail = () => {
    setModelDetailModalVisible(false);
    setSelectedModelForDetail(null);
  };

  // 上传图片到COS（返回URL）
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      // 动态导入 cosService 和 getUserStorageNodes
      const { cosService } = await import('services/cos');
      const { getUserStorageNodes } = await import('services/storageService');
      
      // 获取用户信息
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) {
        throw new Error('用户未登录');
      }
      const userInfo = JSON.parse(storedUserInfo);
      const fullPath = `${userInfo.username}/`;
      
      // 获取用户的默认存储节点
      const nodesResponse = await getUserStorageNodes();
      if (!nodesResponse.success || !nodesResponse.data || nodesResponse.data.length === 0) {
        throw new Error('未找到可用的存储节点');
      }
      
      // 找到默认节点或使用第一个节点
      const defaultNode = nodesResponse.data.find(node => node.isDefault);
      const nodeId = defaultNode ? defaultNode.id : nodesResponse.data[0].id;
      
      console.log('使用存储节点:', nodeId);
      
      // 上传进度回调（可选：显示上传进度）
      const onProgress = (progress: number, speed: number) => {
        console.log(`上传进度: ${progress.toFixed(1)}%`, speed > 0 ? `速度: ${(speed / 1024 / 1024).toFixed(2)} MB/s` : '');
      };
      
      // 上传到COS
      const uploadResult = await (cosService as any).uploadFile(
        file,
        fullPath,
        onProgress, // 进度回调函数
        false, // useChunkUpload
        false, // useAccelerate
        null, // resumeData
        null, // bucketName (使用默认值)
        nodeId // 传递节点ID
      );
      
      if (uploadResult && uploadResult.url) {
        console.log('图片上传成功，URL:', uploadResult.url);
        return uploadResult.url;
      } else {
        throw new Error('上传成功但未返回URL');
      }
    } catch (error: any) {
      console.error('上传图片到COS失败:', error);
      throw new Error(error.message || '上传图片失败');
    }
  };

  // 调用后端 API 生成视频
  const handleGenerate = async (values: any) => {
    // 防止自动提交
    if (!isUserSubmitRef.current) {
      console.log('阻止自动提交：不是用户主动提交');
      return;
    }
    
    isUserSubmitRef.current = false;
    
    if (loading) {
      return;
    }

    if (!selectedModel) {
      message.warning(intl.formatMessage({ 
        id: 'create.model.select.placeholder', 
        defaultMessage: '请选择要使用的视频生成模型' 
      }));
      return;
    }

    if (!originalImageUrl || (!originalImageFile && !originalImageRemoteUrl)) {
      message.warning(intl.formatMessage({ 
        id: 'create.i2v.upload.warning', 
        defaultMessage: '请先上传一张图片作为生成参考。' 
      }));
      return;
    }

    const duration = Number(values.duration) || 8;
    const requiredTokens = getVideoRequiredTokens(selectedModel.tokenCost, duration);
    if (!(await ensureSufficientBalance(requiredTokens))) {
      return;
    }

    if (!(await ensureKycForModel(selectedModel))) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setGeneratedVideo(null); 

    try {
      // 显示上传提示
      const uploadingMessage = message.loading(
        intl.formatMessage({ 
          id: 'create.i2v.uploading.image', 
          defaultMessage: '正在上传图片到云端...' 
        }),
        0 // 0表示不会自动关闭
      );
      
      try {
        let imageUrl = originalImageRemoteUrl;
        if (!imageUrl) {
          if (!originalImageFile) {
            throw new Error('missing image file');
          }
          imageUrl = await uploadImageToServer(originalImageFile);
        }
        const imageUrls: string[] = [imageUrl];
        let seedanceContentMode: 'first_last_frame' | 'multimodal_reference' | undefined;
        if (isSeedance2Model(selectedModel)) {
          let endUrl = endFrameImageRemoteUrl;
          if (!endUrl && endFrameImageFile) {
            endUrl = await uploadImageToServer(endFrameImageFile);
          }
          if (endUrl) {
            imageUrls.push(endUrl);
          }
          const hasExtraRefs =
            splitSeedanceRefLines(values.seedanceVideoRefsRaw).length > 0 ||
            splitSeedanceRefLines(values.seedanceAudioRefsRaw).length > 0;
          seedanceContentMode = hasExtraRefs ? 'multimodal_reference' : 'first_last_frame';
        }
        
        // 关闭上传提示
        uploadingMessage();
        
        message.success(
          intl.formatMessage({ 
            id: 'create.i2v.upload.success', 
            defaultMessage: '图片上传成功' 
          })
        );
      
        // 构建请求参数
        const requestData: any = appendTranslatePromptFlag({
        prompt: values.prompt,
        modelCode: selectedModel.modelCode,
        imageUrls,
      }, values);

      // 添加视频比例
      if (values.aspectRatio) {
        requestData.aspectRatio = values.aspectRatio;
        
        const resolution = getResolutionByAspectRatio(values.aspectRatio);
        if (resolution) {
          requestData.size = resolution;
        }
      }

      // 添加视频时长
      if (values.duration !== undefined && values.duration !== null) {
        requestData.seconds = Number(values.duration);
      }

      // 添加视频风格
      if (values.videoSupportStyle) {
        requestData.videoSupportStyle = values.videoSupportStyle;
      }

      // 添加视频质量
      if (values.videoQuality) {
        requestData.videoQuality = values.videoQuality;
      }

      // Seedance 1.5 / 2.x（字节豆包图生视频）
      const mc = selectedModel?.modelCode?.toLowerCase() || '';
      if (mc.includes('seedance')) {
        if (isSeedance2Model(selectedModel)) {
          if (values.seedanceResolution) {
            requestData.seedanceResolution = values.seedanceResolution;
          }
          if (values.aspectRatio) {
            requestData.seedanceRatio = values.aspectRatio;
          }
          requestData.seedanceGenerateAudio = values.seedanceGenerateAudio === true;
          requestData.seedanceReturnLastFrame = values.seedanceReturnLastFrame === true;
          requestData.seedanceWatermark = values.seedanceWatermark === true;
          const vRefs = splitSeedanceRefLines(values.seedanceVideoRefsRaw);
          const aRefs = splitSeedanceRefLines(values.seedanceAudioRefsRaw);
          if (vRefs.length) requestData.seedanceVideoReferenceUrls = vRefs;
          if (aRefs.length) requestData.seedanceAudioReferenceUrls = aRefs;
          if (seedanceContentMode) requestData.seedanceContentMode = seedanceContentMode;
        } else {
          requestData.seedanceCameraFixed = values.seedanceCameraFixed === true;
          requestData.seedanceWatermark = values.seedanceWatermark !== false;
        }
      }

      console.log('Generating image-to-video with params:', requestData);
      
      // 调用后端 API
      const response = await instance.post('/productx/sa-ai-models/video/generate/image', requestData, {
        timeout: 0,
        signal: abortController.signal
      });
      
      if (abortController.signal.aborted) {
        return;
      }
      
      if (response.data && response.data.success) {
        const result = response.data.data;
        const status = result.status;
        
        // 如果任务在队列中，开始轮询
        if (status === 'queued' && result.id) {
          message.success(intl.formatMessage({ 
            id: 'create.video.generate.queued', 
            defaultMessage: '视频生成任务已提交，正在排队中...' 
          }));
          
          await notifyEmbedTask(String(result.id));
          startPolling(
            result.id, 
            values.aspectRatio || '16:9', 
            values.duration || 8,
            values.prompt
          );
        } 
        // 如果任务已完成，直接显示结果
        else if ((status === 'completed' || status === 'success') && result.videoUrl) {
          const videoResult: VideoResult = {
            url: result.videoUrl,
            aspectRatio: values.aspectRatio || '16:9',
            duration: values.duration || 8,
            thumbnail: result.thumbnail || result.thumbnailUrl || '',
          };
          
          setGeneratedVideo(videoResult);
          setLoading(false);
          message.success(intl.formatMessage({ 
            id: 'create.video.generate.success', 
            defaultMessage: '视频生成成功' 
          }));
          if (result.id) {
            await notifyEmbedTask(String(result.id), result.videoUrl);
          }
        }
        // 如果任务失败
        else if (status === 'failed' || status === 'error') {
          setLoading(false);
          const errorMsg = result.error || intl.formatMessage({ 
            id: 'create.video.generate.failed', 
            defaultMessage: '视频生成失败' 
          });
          message.error(errorMsg);
        }
        // 其他状态（如 processing）
        else {
          message.info(intl.formatMessage({ 
            id: 'create.video.generate.processing', 
            defaultMessage: '视频生成任务已提交，正在处理中...' 
          }));
          
          if (result.id) {
            await notifyEmbedTask(String(result.id));
            startPolling(
              result.id, 
              values.aspectRatio || '16:9', 
              values.duration || 8,
              values.prompt
            );
          } else {
            setLoading(false);
          }
        }
      } else {
        const handled = await handleGenerationApiFailure(response.data, tryShowFromApiError, {
          fallbackMessage: intl.formatMessage({
            id: 'create.video.generate.failed',
            defaultMessage: '视频生成失败',
          }),
        });
        if (!handled) {
          throw new Error(response.data?.message || intl.formatMessage({
            id: 'create.video.generate.failed',
            defaultMessage: '视频生成失败',
          }));
        }
      }
      } catch (uploadError: any) {
        // 关闭上传提示
        uploadingMessage();
        
        // 上传图片失败
        console.error('上传图片失败:', uploadError);
        message.error(
          uploadError.message || intl.formatMessage({ 
            id: 'create.i2v.upload.failed', 
            defaultMessage: '图片上传失败，请重试' 
          })
        );
        throw uploadError; // 继续抛出错误，让外层catch处理
      }
    } catch (error: any) {
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
      if (!(await tryShowFromApiError(errorMessage, error))) {
        message.error(errorMessage);
      }
    } finally {
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
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {!embedded && (!isEmbed || !embedConfig?.hideHeader) && (
              <div style={{ marginBottom: 8 }}>
                <Title level={3} style={{ margin: 0, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SwapOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                  {seedancePage ? (
                    <FormattedMessage id="create.seedance.title" defaultMessage="Seedance 图生视频" />
                  ) : (
                    <FormattedMessage id="create.imageToVideo.title" defaultMessage="AI 图生视频" />
                  )}
                </Title>
                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <VideoCameraOutlined style={{ fontSize: 14 }} />
                  {seedancePage ? (
                    <FormattedMessage id="create.seedance.subtitle" defaultMessage="字节豆包 Seedance 1.5 / 2.0，图片驱动视频生成" />
                  ) : (
                    <FormattedMessage id="create.imageToVideo.subtitle" defaultMessage="赋予静态图片生命，通过提示词控制运动" />
                  )}
                </Text>
              </div>
              )}

              <div
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target instanceof HTMLElement) {
                    if (e.target.tagName === 'TEXTAREA') {
                      return;
                    }
                    if (e.target.tagName === 'INPUT') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }
                }}
              >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleGenerate}
                onFinishFailed={(errorInfo) => {
                  console.log('表单验证失败:', errorInfo);
                }}
                initialValues={{
                  aspectRatio: undefined,
                  cameraMotion: 'none',
                  duration: 8,
                  videoFormat: undefined,
                  videoSupportStyle: undefined,
                  videoQuality: undefined,
                  modelId: null,
                  seedanceCameraFixed: false,
                  seedanceWatermark: true,
                  seedanceResolution: '720p',
                  seedanceGenerateAudio: false,
                  seedanceReturnLastFrame: false,
                  seedanceVideoRefsRaw: '',
                  seedanceAudioRefsRaw: '',
                }}
              >
                <VideoModelSelectField
                  selectedModel={selectedModel}
                  modelsLoading={modelsLoading}
                  onOpenModal={() => setModelPickerVisible(true)}
                />

                {/* Seedance 2.0 / 2.0 Fast：共用参数组件（字段一致，分辨率等由模型元数据裁剪） */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
                    if (!selectedModel || !isSeedance2Model(selectedModel)) return null;
                    const resOptions = getSeedance2ResolutionSelectOptions(selectedModel);
                    const isFast = selectedModel.modelCode === DOUBAO_SEEDANCE_2_0_FAST_260128;
                    return (
                      <DoubaoSeedance20Params
                        isDark={isDark}
                        originalImageUrl={originalImageUrl}
                        endFrameImageUrl={endFrameImageUrl}
                        onFirstFrameFileChange={handleFileInputChange}
                        onRemoveFirstFrame={handleRemoveImage}
                        onEndFrameFileChange={handleEndFrameFileInputChange}
                        onRemoveEndFrame={handleRemoveEndFrame}
                        onOpenFirstFramePicker={() => openImagePicker('first')}
                        onOpenEndFramePicker={() => openImagePicker('end')}
                        onFirstFrameDropFile={(file) => {
                          void handleFileSelect(file);
                        }}
                        onEndFrameDropFile={(file) => {
                          void handleEndFrameFileSelect(file);
                        }}
                        ratioAndFormatRow={renderAspectRatioAndFormatRow({
                          marginBottom: 16,
                          thirdColumn: (
                            <Form.Item
                              name="seedanceResolution"
                              label={
                                <Space>
                                  <VideoCameraOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                                  <FormattedMessage
                                    id="create.seedance2.resolution"
                                    defaultMessage="输出分辨率"
                                  />
                                  <Tooltip
                                    title={intl.formatMessage({
                                      id: isFast
                                        ? 'create.seedance2.resolution.tooltip.fast'
                                        : 'create.seedance2.resolution.tooltip',
                                      defaultMessage: isFast
                                        ? 'Fast 版最高 720p（与方舟一致）；可选 480p / 720p'
                                        : '对应方舟 API 的 resolution 字段（480p / 720p / 1080p）',
                                    })}
                                  >
                                    <InfoCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                                  </Tooltip>
                                </Space>
                              }
                              style={{ marginBottom: 0 }}
                            >
                              <Select options={resOptions} />
                            </Form.Item>
                          ),
                        })}
                        durationField={renderVideoDurationField({ marginBottom: 20 })}
                      />
                    );
                  }}
                </Form.Item>

                {/* 上传图片区域（Seedance 2.x 见上方共用组件） */}
                {!isSeedance2Model(selectedModel) && (
                <Form.Item
                  name="inputFile"
                  label={
                    <Space>
                      <FileImageOutlined style={{ color: '#1890ff' }} />
                      <FormattedMessage id="create.i2v.upload" defaultMessage="上传参考图片 (起始帧)" />
                    </Space>
                  }
                  rules={[{ required: true, message: intl.formatMessage({ id: 'create.i2v.upload.required', defaultMessage: '请上传参考图片' }) }]}
                  style={{ marginBottom: 20, marginTop: 0 }}
                >
                  {originalImageUrl ? (
                    <SelectedImagePreviewOverlay
                      imageUrl={originalImageUrl}
                      alt="Original"
                      onRemove={handleRemoveImage}
                      onReselect={() => openImagePicker('first')}
                    />
                  ) : (
                    <CustomUploadArea
                      $isDark={isDark}
                      $isDragging={isDragging}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => openImagePicker('first')}
                    >
                      <input
                        id="i2v-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                      />
                      <UploadIcon $isDark={isDark}>
                        <InboxOutlined style={{ fontSize: 48 }} />
                      </UploadIcon>
                      <UploadText $isDark={isDark}>
                        <FormattedMessage id="create.i2v.upload.click" defaultMessage="点击选择图片" />
                      </UploadText>
                      <UploadHint $isDark={isDark}>
                        <FormattedMessage
                          id="create.i2v.imagePicker.uploadHint"
                          defaultMessage="本地上传，或从文生图/图生图记录选用"
                        />
                      </UploadHint>
                    </CustomUploadArea>
                  )}
                </Form.Item>
                )}

                {/* 提示词输入 */}
                <Form.Item
                  name="prompt"
                  label={
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space wrap align="center">
                        <EditOutlined style={{ color: '#1890ff' }} />
                        <FormattedMessage id="create.prompt" defaultMessage="运动引导提示词 (Prompt)" />
                        <PromptTranslateEnSwitch />
                      </Space>
                      <Space size="small">
                        {originalPrompt && (
                          <Tooltip title={intl.formatMessage({ id: 'create.prompt.restore', defaultMessage: '恢复原始提示词' })}>
                            <Button 
                              type="text" 
                              size="small"
                              icon={<SyncOutlined />}
                              onClick={handleRestorePrompt}
                              style={{ fontSize: 12 }}
                            >
                              <FormattedMessage id="create.prompt.restore" defaultMessage="恢复" />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip title={intl.formatMessage({ id: 'create.prompt.enhance.tooltip', defaultMessage: 'AI丰富提示词，让描述更加详细生动' })}>
                          <Button 
                            type="primary" 
                            size="small"
                            icon={<ThunderboltOutlined />}
                            onClick={handleEnhancePrompt}
                            loading={enhancingPrompt}
                            style={{ fontSize: 12 }}
                          >
                            <FormattedMessage id="create.prompt.enhance" defaultMessage="AI丰富" />
                          </Button>
                        </Tooltip>
                      </Space>
                    </Space>
                  }
                  rules={[{ required: true, message: intl.formatMessage({ id: 'create.i2v.prompt.required', defaultMessage: '请输入视频运动的引导描述' }) }]}
                  style={{ marginBottom: 20 }}
                >
                  <TextArea 
                    rows={3} 
                    placeholder={intl.formatMessage({ id: 'create.prompt.i2v.placeholder', defaultMessage: '例如：让图片中的人物开始行走，背景的树叶随风摇摆...' })} 
                    maxLength={1500}
                    showCount
                    style={{ resize: 'none' }}
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    onPressEnter={(e) => {
                      e.preventDefault();
                    }}
                  />
                </Form.Item>

                {/* 视频参数设置（Seedance 2.x 在下方「生成参数」分组内一并展示，避免重复与顺序混乱） */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
                    if (isSeedance2Model(selectedModel)) {
                      return null;
                    }
                    return renderAspectRatioAndFormatRow({ marginBottom: 20 });
                  }}
                </Form.Item>

                {/* 视频风格选择 */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
                    const availableStyles = getAvailableVideoStyles();
                    if (availableStyles.length === 0) {
                      return null;
                    }
                    
                    return (
                      <Form.Item
                        name="videoSupportStyle"
                        label={
                          <Space>
                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                            <FormattedMessage id="create.video.style" defaultMessage="视频风格" />
                            <Tooltip title={intl.formatMessage({ 
                              id: 'create.video.style.tooltip', 
                              defaultMessage: '选择视频生成风格' 
                            })}>
                              <InfoCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                            </Tooltip>
                          </Space>
                        }
                        style={{ marginBottom: 20 }}
                      >
                        <Select
                          disabled={!selectedModel || availableStyles.length === 0}
                          placeholder={intl.formatMessage({ 
                            id: 'create.video.style.placeholder', 
                            defaultMessage: '请选择视频风格' 
                          })}
                        >
                          {availableStyles.map(style => (
                            <Select.Option key={style} value={style}>
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    );
                  }}
                </Form.Item>

                {/* 视频质量选择 */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
                    const availableQualities = getAvailableVideoQualities();
                    if (availableQualities.length === 0) {
                      return null;
                    }
                    
                    return (
                      <Form.Item
                        name="videoQuality"
                        label={
                          <Space>
                            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                            <FormattedMessage id="create.video.quality" defaultMessage="视频质量" />
                            <Tooltip title={intl.formatMessage({ 
                              id: 'create.video.quality.tooltip', 
                              defaultMessage: '选择视频生成质量' 
                            })}>
                              <InfoCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                            </Tooltip>
                          </Space>
                        }
                        style={{ marginBottom: 20 }}
                      >
                        <Select
                          disabled={!selectedModel || availableQualities.length === 0}
                          placeholder={intl.formatMessage({ 
                            id: 'create.video.quality.placeholder', 
                            defaultMessage: '请选择视频质量' 
                          })}
                        >
                          {availableQualities.map(quality => (
                            <Select.Option key={quality} value={quality}>
                              {quality.charAt(0).toUpperCase() + quality.slice(1)}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    );
                  }}
                </Form.Item>

                {/* Seedance 1.5：镜头固定、水印 */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
                    if (!isSeedance15Model(selectedModel)) return null;
                    return (
                      <Row gutter={16} style={{ marginBottom: 20 }}>
                        <Col span={12}>
                          <Form.Item
                            name="seedanceCameraFixed"
                            label={
                              <Space>
                                <CameraOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                                <FormattedMessage id="create.seedance.cameraFixed" defaultMessage="镜头固定" />
                              </Space>
                            }
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              options={[
                                { value: false, label: intl.formatMessage({ id: 'create.seedance.cameraFixed.false', defaultMessage: '否（动态）' }) },
                                { value: true, label: intl.formatMessage({ id: 'create.seedance.cameraFixed.true', defaultMessage: '是（固定）' }) },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="seedanceWatermark"
                            label={
                              <Space>
                                <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                                <FormattedMessage id="create.seedance.watermark" defaultMessage="添加水印" />
                              </Space>
                            }
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              options={[
                                { value: true, label: intl.formatMessage({ id: 'create.seedance.watermark.true', defaultMessage: '是' }) },
                                { value: false, label: intl.formatMessage({ id: 'create.seedance.watermark.false', defaultMessage: '否' }) },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  }}
                </Form.Item>

                {/* 时长控制（Seedance 2.x 已并入上方共用组件） */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
                    if (isSeedance2Model(selectedModel)) {
                      return null;
                    }
                    return renderVideoDurationField({ marginBottom: 20 });
                  }}
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
                        icon={<ThunderboltOutlined />} 
                        size="large" 
                        block
                        loading={loading}
                        disabled={loading || !selectedModel}
                        style={{ height: 48, fontSize: 16, borderRadius: 24 }}
                        onClick={() => {
                          isUserSubmitRef.current = true;
                          form.submit();
                        }}
                      >
                        <FormattedMessage id="create.generate.i2v" defaultMessage="开始生成视频" />
                      </Button>
                    )}
                    <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.duration !== currentValues.duration} noStyle>
                      {({ getFieldValue }) => {
                        const duration = getFieldValue('duration') || 8;
                        const estimatedPrice = selectedModel && selectedModel.tokenCost !== null && selectedModel.tokenCost !== undefined
                          ? calculateEstimatedPrice(duration)
                          : null;
                        
                        return (
                          <EstimatedPriceHint
                            price={estimatedPrice}
                            tokenBalance={tokenBalance}
                            balanceLoading={balanceLoading}
                          />
                        );
                      }}
                    </Form.Item>
                  </div>
                </Form.Item>
              </Form>
              </div>
            </Space>
            </LeftPanel>
          </Col>

          {/* --- 右侧：结果展示区 --- */}
          <Col xs={24} lg={isEmbed ? 11 : 15}>
            <ResultArea>
              {(!isEmbed || !embedConfig?.hideTaskQueue) && (
                <VideoTaskQueueButton
                  waitingCount={
                    waitingTasks.filter((t) => {
                      const s = t.pollStatus || 'polling';
                      return s === 'polling' || s === 'fetching_result';
                    }).length
                  }
                  onOpen={() => setQueueDrawerOpen(true)}
                  style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}
                />
              )}
              <div style={{ width: '100%', paddingTop: 40 }}>
              {loading ? (
                <Space direction="vertical" align="center">
                  <Spin size="large" />
                  <Text type="secondary" style={{ marginTop: 16 }}>
                    {waitingTasks.length > 0 ? (
                      <FormattedMessage 
                        id="create.video.polling" 
                        defaultMessage="正在生成视频，请稍候..." 
                      />
                    ) : (
                      <FormattedMessage 
                        id="create.video.analyzing" 
                        defaultMessage="正在分析图片和提示词，构建 3D 世界..." 
                      />
                    )}
                  </Text>
                </Space>
              ) : generatedVideo ? (
                <div style={{ width: '100%' }}>
                  <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <FormattedMessage id="create.i2v.result" defaultMessage="生成对比" />
                    </Title>
                    <Button type="primary" icon={<DownloadOutlined />} href={generatedVideo.url} download="sora_mv_i2v_video.mp4">
                      <FormattedMessage id="create.download" defaultMessage="下载视频" />
                    </Button>
                  </div>
                  <Row gutter={[24, 16]}>
                    {/* 原图对比 */}
                    <Col span={12}>
                      <div style={{ 
                        background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)', 
                        borderRadius: 12, 
                        padding: 16,
                        height: '100%'
                      }}>
                        <div style={{ 
                          marginBottom: 12, 
                          fontWeight: 600, 
                          fontSize: 14,
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6,
                          color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'
                        }}>
                          <FileImageOutlined style={{ color: '#1890ff' }} />
                          <FormattedMessage id="create.i2v.original" defaultMessage="原图 (起始帧)" />
                        </div>
                        <div style={{ 
                          width: '100%', 
                          aspectRatio: '16 / 9',
                          borderRadius: 8, 
                          overflow: 'hidden', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'
                        }}>
                          <img 
                            src={originalImageUrl || "https://placehold.co/400x225?text=Original+Image"} 
                            alt="Original Preview" 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    </Col>
                    
                    {/* 视频预览 */}
                    <Col span={12}>
                      <div style={{ 
                        background: isDark 
                          ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.12) 100%)' 
                          : 'linear-gradient(135deg, rgba(24, 144, 255, 0.04) 0%, rgba(24, 144, 255, 0.08) 100%)', 
                        borderRadius: 12, 
                        padding: 16,
                        height: '100%'
                      }}>
                        <div style={{ 
                          marginBottom: 12, 
                          fontWeight: 600, 
                          fontSize: 14,
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6,
                          color: '#1890ff'
                        }}>
                          <VideoCameraOutlined />
                          <FormattedMessage id="create.video.result" defaultMessage="生成视频" />
                        </div>
                        <div style={{ 
                          width: '100%', 
                          aspectRatio: '16 / 9',
                          borderRadius: 8, 
                          overflow: 'hidden',
                          background: '#000'
                        }}>
                          <video 
                            src={generatedVideo.url}
                            poster={generatedVideo.thumbnail}
                            controls
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    marginTop: 16,
                    padding: '12px 0',
                    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      <FormattedMessage 
                        id="create.video.info" 
                        defaultMessage="时长: {duration}s | 比例: {ratio}" 
                        values={{ 
                          duration: generatedVideo.duration, 
                          ratio: generatedVideo.aspectRatio 
                        }} 
                      />
                    </Text>
                  </div>
                </div>
              ) : (
                <Empty
                  image={<VideoCameraOutlined style={{ fontSize: 48, color: '#aaa' }} />}
                  description={
                    <Text type="secondary">
                      <FormattedMessage id="create.i2v.empty" defaultMessage="生成结果与原图对比将显示在此处" />
                    </Text>
                  }
                />
              )}
              </div>
            </ResultArea>
          </Col>
        </Row>
        
        {/* 视频播放 Modal */}
        <Modal
          title={<FormattedMessage id="create.video.preview" defaultMessage="视频预览" />}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose={true}
          width={800}
          centered
          bodyStyle={{ padding: 0 }}
        >
          <video controls autoPlay style={{ width: '100%', maxHeight: '70vh', display: 'block' }}>
            <source src={generatedVideo?.url} type="video/mp4" />
            <FormattedMessage id="video.not.supported" defaultMessage="您的浏览器不支持视频播放。" />
          </video>
        </Modal>

        {/* 生成记录 */}
        {(!isEmbed || !embedConfig?.hideHistory) ? (
          <HistorySection
            historyTasks={historyTasks}
            historyLoading={historyLoading}
            historyPagination={historyPagination}
            onRefresh={() => fetchHistoryTasks(historyPagination.current, historyPagination.pageSize)}
            onPageChange={handleHistoryPageChange}
            onTaskClick={handleShowTaskDetail}
            getStatusText={getStatusText}
          />
        ) : null}
      </StyledCard>

      <VideoModelSelectionModal
        open={modelPickerVisible}
        onClose={() => setModelPickerVisible(false)}
        type="family"
        title={intl.formatMessage({
          id: 'create.model.select',
          defaultMessage: '选择模型',
        })}
        models={models}
        selectedModel={selectedModel}
        onSelect={(m) => applySelectedModel(m as Model)}
        onShowDetail={(m) => {
          setSelectedModelForDetail(m as Model);
          setModelDetailModalVisible(true);
        }}
        loading={modelsLoading}
        {...nestedModalProps}
      />

      {/* 任务详情模态框 */}
      <TaskDetailModal
        open={taskDetailModalVisible}
        onClose={handleCloseTaskDetail}
        taskId={selectedTaskId}
      />

      {/* 等待任务队列 */}
      <WaitingTaskQueue
        open={queueDrawerOpen}
        onClose={() => setQueueDrawerOpen(false)}
        tasks={waitingTasks}
        onStopPolling={handleStopPolling}
        onRemoveTask={handleRemoveTask}
        onResumePolling={handleResumePolling}
      />

      {/* 模型详情模态框 */}
      <ModelDetailModal
        open={modelDetailModalVisible}
        onClose={handleCloseModelDetail}
        model={selectedModelForDetail}
      />

      <InsufficientBalanceModal
        open={insufficientBalanceOpen}
        onCancel={closeInsufficientBalanceModal}
        requiredTokens={insufficientBalanceRequired}
        tokenBalance={insufficientBalanceModalBalance}
      />

      <ImageGenPickerModal
        open={imagePickerOpen}
        target={imagePickerTarget}
        supportsEndFrame={isSeedance2Model(selectedModel)}
        onClose={() => setImagePickerOpen(false)}
        onSelectLocal={handlePickerSelectLocal}
        onSelectRemote={({ remoteUrl }) => handlePickerSelectRemote(remoteUrl)}
        onQuickSelectEndFrame={handleQuickSelectEndFrame}
      />
    </>
  );
};

export default ImageToVideo;

