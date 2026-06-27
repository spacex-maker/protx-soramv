import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Typography, 
  Input, 
  Button, 
  Select, 
  Row, 
  Col, 
  Form, 
  Space, 
  message, 
  Tooltip,
  Switch,
  Slider,
} from 'antd';
import { 
  ThunderboltOutlined,
  FileImageOutlined,
  InfoCircleOutlined,
  EditOutlined,
  EyeOutlined,
  SwapOutlined,
  RobotOutlined,
  CloseOutlined,
  SyncOutlined,
  InboxOutlined,
  DeleteOutlined,
  NumberOutlined,
  DesktopOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';
import { ImageResult, Model, GenerationTask, GenerationTaskPageResponse, WaitingTask } from './types';
import { 
  GlobalSelectStyles,
  StyledCard,
  AspectRatioOption,
  InputImageContainer,
  OverlayActions,
  CustomUploadArea,
  UploadIcon,
  UploadText,
  UploadHint,
  EnhancePromptButton,
  OfficialPlayTriggerButton,
  PromptGlowButtonShell,
  I2iPromptLabelActions,
} from './styles';
import { 
  getAspectRatioOption, 
  getModelAspectRatios, 
  getModelResolutions,
  getModelOutputFormats,
  getBase64,
} from './utils';
import { HistorySection, TaskDetailModal } from './History';
import WaitingTaskQueue from './WaitingTaskQueue';
import ModelDetailModal from './ModelDetailModal';
import ImageResultDisplay from './ImageResultDisplay';
import OfficialPlaySelectionModal from './OfficialPlaySelectionModal';
import OfficialPlaySelectedBanner from './OfficialPlaySelectedBanner';
import I2iModelSelectField from './I2iModelSelectField';
import { I2iCreationMode, I2iOfficialPlay, findOfficialPlay } from './officialPlayTypes';
import ModelSelectionModal from '../TextToImage/ModelSelectionModal';
import EstimatedPriceHint from '../shared/EstimatedPriceHint';
import { useTokenBalance } from '../shared/useTokenBalance';
import { getImageEstimatedPrice } from '../shared/estimatedPriceText';
import { useInsufficientBalanceGuard } from '../shared/useInsufficientBalanceGuard';
import { handleGenerationApiFailure } from '../shared/generationErrorUtils';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal';
import PromptTranslateEnSwitch from '../shared/PromptTranslateEnSwitch';
import { appendTranslatePromptFlag } from '../shared/promptTranslateUtils';
import {
  VOLC_SEEDREAM_SIZE_ASPECT_MAP,
  VOLC_SEEDREAM_ASPECT_RATIOS,
  VOLC_SEEDREAM_SIZES,
  VOLC_SEEDREAM_MAX_UPLOAD_BYTES,
  VOLC_SEEDREAM_UPLOAD_ACCEPT,
  VOLC_SEEDREAM_UPLOAD_EXTENSIONS,
} from '../TextToImage/constants';
import { parseResponseImages } from '../TextToImage/utils';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ImageToImage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const intl = useIntl();
  const location = useLocation();
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
  const [generatedImage, setGeneratedImage] = useState<ImageResult | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTasksRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [waitingTasks, setWaitingTasks] = useState<WaitingTask[]>([]);
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false);
  const isUserSubmitRef = useRef<boolean>(false);
  
  // 图片上传状态
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  // AI提示词丰富相关状态
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  
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
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [creationMode, setCreationMode] = useState<I2iCreationMode>('custom');
  const [selectedPlay, setSelectedPlay] = useState<I2iOfficialPlay | null>(null);
  const [officialPlayModalVisible, setOfficialPlayModalVisible] = useState(false);
  const isVolcSeedream = useMemo(() => {
    if (!selectedModel) return false;
    const modelCode = selectedModel.modelCode?.toLowerCase() ?? '';
    if (!modelCode.includes('seedream')) return false;
    const companyCode = selectedModel.companyCode?.trim();
    return !companyCode || companyCode === 'Volc';
  }, [selectedModel]);
  const resolution = Form.useWatch('resolution', form);
  const batchSize = Form.useWatch('batchSize', form) ?? 1;

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

  const handleSelectOfficialPlay = (play: I2iOfficialPlay) => {
    setSelectedPlay(play);
    setCreationMode('official');
  };

  const handleClearOfficialPlay = () => {
    setSelectedPlay(null);
    setCreationMode('custom');
  };

  useEffect(() => {
    const state = location.state as { officialPlayCode?: string } | null;
    const playCode = state?.officialPlayCode;
    if (!playCode) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await instance.get('/productx/sa-ai-models/image/i2i/official-plays', {
          params: { sortBy: 'sort' },
        });
        if (cancelled || !response.data.success || !Array.isArray(response.data.data)) return;
        const play = findOfficialPlay(response.data.data, playCode);
        if (play) {
          setSelectedPlay(play);
          setCreationMode('official');
        }
      } catch (error) {
        console.error('预加载官方玩法失败:', error);
      } finally {
        if (!cancelled) {
          window.history.replaceState({}, document.title);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.state]);

  // 获取模型列表
  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
          params: { modelType: 'i2i' }
        });
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          setModels(response.data.data);
          // 默认选择第一个模型
          const firstModel = response.data.data[0];
          setSelectedModel(firstModel);
          // 同步更新表单的 modelId 字段
          form.setFieldsValue({ modelId: firstModel.id });
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
    fetchHistoryTasks();
    fetchPendingTasks();

    // 组件卸载时清理 AbortController 和轮询定时器
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // 清理所有任务轮询
      pollingTasksRef.current.forEach((timer) => {
        clearInterval(timer);
      });
      pollingTasksRef.current.clear();
    };
  }, [intl]);

  // 生成成功后刷新记录
  useEffect(() => {
    if (generatedImage && !loading) {
      setTimeout(() => {
        fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
      }, 1000);
    }
  }, [generatedImage, loading]);

  // AI丰富提示词
  const handleEnhancePrompt = async () => {
    setEnhancingPrompt(true);
    try {
      const currentPrompt = form.getFieldValue('prompt') || '';
      
      if (!currentPrompt.trim()) {
        message.warning(intl.formatMessage({
          id: 'create.prompt.enhance.empty',
          defaultMessage: '请先输入基础提示词',
        }));
        return;
      }
      
      if (!originalPrompt || originalPrompt !== currentPrompt.trim()) {
        setOriginalPrompt(currentPrompt.trim());
      }
      
      const requestData: any = {
        basePrompt: currentPrompt.trim(),
        language: intl.locale || 'zh',
        scene: 'image', // 图生图场景
      };
      
      const response = await instance.post('/productx/sa-ai-models/prompt/enhance', requestData);

      if (response.data.success && response.data.data) {
        const enhancedPrompt = 
          typeof response.data.data === 'string' 
            ? response.data.data 
            : response.data.data.prompt || response.data.data;
        
        if (enhancedPrompt) {
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

    const updates: Record<string, unknown> = {};
    const isVolc = model.companyCode === 'Volc' && model.modelCode?.toLowerCase().includes('seedream');

    if (isVolc) {
      const volcSizes = getVolcSeedreamSizes(model);
      updates.resolution = model.imageDefaultResolution?.split(',')[0]?.trim().toUpperCase() || volcSizes[0] || '2K';
      updates.aspectRatio = getVolcSeedreamAspectRatios(model)[0] || VOLC_SEEDREAM_ASPECT_RATIOS[0];
      updates.seedreamWatermark = false;
      updates.batchSize = 1;
      updates.outputFormat = undefined;
    } else {
      const supportedRatios = getModelAspectRatios(model);
      if (supportedRatios.length > 0) {
        const currentRatio = form.getFieldValue('aspectRatio');
        if (currentRatio !== 'auto' && !supportedRatios.includes(currentRatio)) {
          updates.aspectRatio = 'auto';
        }
      }

      const resolutions = getModelResolutions(model);
      if (resolutions.length > 0) {
        const currentResolution = form.getFieldValue('resolution');
        if (!resolutions.includes(currentResolution)) {
          updates.resolution = resolutions[0];
        }
      }

      if (model.imageFormats) {
        const formats = model.imageFormats.split(',').map((f) => f.trim());
        if (formats.length > 0) {
          const currentFormat = form.getFieldValue('outputFormat');
          if (!currentFormat || !formats.includes(currentFormat)) {
            updates.outputFormat = formats[0];
          }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
  };

  const getVolcSeedreamSizes = (model: Model | null): string[] => {
    if (!model?.imageMaxResolution) {
      return [...VOLC_SEEDREAM_SIZES];
    }
    const list = model.imageMaxResolution
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    return list.length > 0 ? list : [...VOLC_SEEDREAM_SIZES];
  };

  const getVolcSeedreamAspectRatios = (model: Model | null): string[] => {
    const fromModel = getModelAspectRatios(model);
    if (fromModel.length === 0) {
      return [...VOLC_SEEDREAM_ASPECT_RATIOS];
    }
    return VOLC_SEEDREAM_ASPECT_RATIOS.filter((ratio) => fromModel.includes(ratio));
  };

  // 处理模型选择变化
  const handleModelChange = (model: Model) => {
    setSelectedModel(model);
    form.setFieldsValue({ modelId: model.id });
    updateFormByModel(model);
  };

  // 显示模型详情（模型选择弹窗）
  const handleShowModelDetailFromSelect = (model: Model) => {
    setSelectedModelForDetail(model);
    setModelDetailModalVisible(true);
  };

  // 处理文件选择
  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setOriginalImageUrl(null);
      setOriginalImageFile(null);
      form.setFieldsValue({ inputFile: undefined });
      return;
    }

    const useVolcLimits = isVolcSeedream;
    const maxSize = useVolcLimits ? VOLC_SEEDREAM_MAX_UPLOAD_BYTES : 30 * 1024 * 1024;

    if (!file.type.startsWith('image/')) {
      message.error(intl.formatMessage({ id: 'create.i2i.fileType.error', defaultMessage: '请选择图片文件' }));
      return;
    }

    if (useVolcLimits) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const mimeOk =
        VOLC_SEEDREAM_UPLOAD_ACCEPT.split(',').includes(file.type) ||
        VOLC_SEEDREAM_UPLOAD_EXTENSIONS.includes(ext);
      if (!mimeOk) {
        message.error(
          intl.formatMessage({
            id: 'create.i2i.volc.fileType.error',
            defaultMessage: 'Seedream 图生图仅支持 JPG、PNG、WebP、BMP、TIFF、GIF 格式',
          })
        );
        return;
      }
    }

    if (file.size > maxSize) {
      message.error(
        intl.formatMessage(
          {
            id: useVolcLimits ? 'create.i2i.volc.fileSize.error' : 'create.i2i.fileSize.error',
            defaultMessage: useVolcLimits
              ? '参考图片大小不能超过 10MB（火山引擎限制）'
              : '图片文件大小不能超过30MB',
          }
        )
      );
      return;
    }

    try {
      const url = await getBase64(file);
      setOriginalImageUrl(url);
      setOriginalImageFile(file);
      form.setFieldsValue({ inputFile: file.name });
    } catch (error) {
      message.error(intl.formatMessage({ id: 'create.i2i.fileRead.error', defaultMessage: '图片读取失败' }));
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
    form.setFieldsValue({ inputFile: undefined });
    const fileInput = document.getElementById('i2i-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };


  // 获取支持的图片比例选项
  const getAvailableAspectRatios = () => {
    if (!selectedModel) {
      return [];
    }

    if (isVolcSeedream) {
      const sizeKey = (resolution || selectedModel.imageDefaultResolution || '2K').toUpperCase().split(',')[0].trim();
      const sizeMap = VOLC_SEEDREAM_SIZE_ASPECT_MAP[sizeKey];
      return getVolcSeedreamAspectRatios(selectedModel).map((ratio) => {
        const base = getAspectRatioOption(ratio, intl);
        const px = sizeMap?.[ratio];
        const pixelInfo = px ? ` (${px.replace('x', '×')})` : '';
        return { ...base, label: base.label + pixelInfo };
      });
    }

    const supportedRatios = getModelAspectRatios(selectedModel);
    if (supportedRatios.length === 0) {
      return [];
    }
    return supportedRatios.map((ratio) => getAspectRatioOption(ratio, intl));
  };

  // 获取支持的图片分辨率选项
  const getAvailableResolutions = (): Array<string | { label: string; value: string }> => {
    if (!selectedModel) {
      return [];
    }
    if (isVolcSeedream) {
      return getVolcSeedreamSizes(selectedModel).map((value) => ({ label: value, value }));
    }
    return getModelResolutions(selectedModel);
  };

  // 获取支持的图片格式选项（Volc Seedream 由 API 固定返回 URL，不提供格式选项）
  const getAvailableOutputFormats = () => {
    if (!selectedModel || isVolcSeedream) {
      return [];
    }
    return getModelOutputFormats(selectedModel);
  };

  const availableAspectRatios = useMemo(
    () => getAvailableAspectRatios(),
    [isVolcSeedream, resolution, selectedModel, intl]
  );
  const availableResolutions = useMemo(
    () => getAvailableResolutions(),
    [isVolcSeedream, selectedModel]
  );
  const availableOutputFormats = useMemo(
    () => getAvailableOutputFormats(),
    [isVolcSeedream, selectedModel]
  );

  const i2iEstimatedPrice =
    selectedModel?.tokenCost != null
      ? getImageEstimatedPrice(selectedModel.tokenCost, batchSize, isVolcSeedream)
      : null;

  // 停止所有轮询
  const stopAllPolling = () => {
    pollingTasksRef.current.forEach((timer) => {
      clearInterval(timer);
    });
    pollingTasksRef.current.clear();
    setWaitingTasks([]);
  };

  // 停止单个任务的轮询
  const stopTaskPolling = (taskId: string) => {
    const timer = pollingTasksRef.current.get(taskId);
    if (timer) {
      clearInterval(timer);
      pollingTasksRef.current.delete(taskId);
    }
    setWaitingTasks(prev => prev.filter(task => task.taskId !== taskId));
  };

  // 已完成任务的ID集合，用于防止重复处理
  const completedTasksRef = useRef<Set<string>>(new Set());
  // 正在请求中的任务ID集合，用于防止并发请求
  const pollingInProgressRef = useRef<Set<string>>(new Set());

  // 轮询任务状态 - 使用任务详情接口作为备选方案
  const pollTaskStatus = async (taskId: string, aspectRatio: string) => {
    if (completedTasksRef.current.has(taskId)) {
      return;
    }
    
    // 如果该任务正在请求中，跳过本次轮询
    if (pollingInProgressRef.current.has(taskId)) {
      console.log(`任务 ${taskId} 正在请求中，跳过本次轮询`);
      return;
    }
    
    // 标记该任务开始请求
    pollingInProgressRef.current.add(taskId);
    
    try {
      // 优先尝试图片任务状态查询接口（如果后端实现了）
      let response;
      try {
        // 设置较长的超时时间（60秒），方便后端调试
        response = await instance.get(`/productx/sa-ai-models/image/task/${taskId}/status`, {
          timeout: 60000
        });
      } catch (error: any) {
        // 如果图片任务状态接口不存在，使用任务详情接口作为备选
        if (error.response?.status === 404) {
          response = await instance.get(`/productx/sa-ai-gen-task/${taskId}/detail`, {
            timeout: 60000
          });
          // 转换任务详情格式为标准格式
          if (response.data.success && response.data.data) {
            const task = response.data.data;
            response.data.data = {
              id: String(task.id),
              status: task.status === 0 ? 'queued' : task.status === 1 ? 'processing' : task.status === 2 ? 'completed' : 'failed',
              imageUrl: task.outputFiles?.[0]?.fileUrl || null,
              error: task.errorMessage || null,
            };
          }
        } else {
          throw error;
        }
      }
      
      if (completedTasksRef.current.has(taskId)) {
        return;
      }
      
      if (response.data && response.data.success) {
        const taskData = response.data.data;
        const status = taskData.status;

        // 如果任务完成
        if (status === 'completed' || status === 'success') {
          completedTasksRef.current.add(taskId);
          stopTaskPolling(taskId);
          setLoading(false);
          
          const imageUrl = taskData.imageUrl || taskData.resultUrl || (taskData.resultUrls && taskData.resultUrls[0]);
          if (imageUrl) {
            const imageResult: ImageResult = {
              url: imageUrl,
              aspectRatio: aspectRatio,
              resolution: taskData.resolution || undefined,
              format: taskData.format || undefined,
            };
            setGeneratedImage(imageResult);
            message.success(intl.formatMessage({ 
              id: 'create.image.generate.success', 
              defaultMessage: '图片生成成功' 
            }));
          } else {
            throw new Error(intl.formatMessage({ 
              id: 'create.image.generate.noUrl', 
              defaultMessage: '图片生成完成，但未获取到图片地址' 
            }));
          }
        } 
        // 如果任务失败
        else if (status === 'failed' || status === 'error' || status === 'fail') {
          completedTasksRef.current.add(taskId);
          stopTaskPolling(taskId);
          setLoading(false);
          const errorMsg = taskData.error || intl.formatMessage({ 
            id: 'create.image.generate.failed', 
            defaultMessage: '图片生成失败' 
          });
          message.error(errorMsg);
        }
      } else {
        throw new Error(response.data?.message || intl.formatMessage({ 
          id: 'create.image.status.checkFailed', 
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
    } finally {
      // 请求完成后，移除标记
      pollingInProgressRef.current.delete(taskId);
    }
  };

  // 开始轮询任务状态
  const startPolling = (taskId: string, aspectRatio: string, prompt?: string) => {
    const existingTask = waitingTasks.find(task => task.taskId === taskId);
    if (existingTask) {
      return;
    }
    
    const newTask: WaitingTask = {
      id: Number(taskId),
      taskId,
      modelName: selectedModel?.modelName || '未知模型',
      prompt: prompt || form.getFieldValue('prompt') || '',
      status: 1,
      createTime: new Date().toISOString(),
      submitTime: new Date().toLocaleString('zh-CN'),
    };
    
    setWaitingTasks(prev => [...prev, newTask]);
    
    pollTaskStatus(taskId, aspectRatio);
    
    const timer = setInterval(() => {
      pollTaskStatus(taskId, aspectRatio);
    }, 3000);
    
    pollingTasksRef.current.set(taskId, timer);
  };

  // 取消单个任务
  const handleCancelTask = (taskId: string) => {
    stopTaskPolling(taskId);
    message.info(intl.formatMessage({ 
      id: 'create.image.generate.cancelled.polling', 
      defaultMessage: '已取消任务轮询' 
    }));
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
      id: 'create.image.generate.cancelled', 
      defaultMessage: '已取消图片生成' 
    }));
  };

  // 获取用户进行中的任务并恢复轮询
  const fetchPendingTasks = async () => {
    try {
      const response = await instance.get<{
        success: boolean;
        data: GenerationTask[];
      }>('/productx/sa-ai-gen-task/my-tasks/pending', {
        params: { taskType: 'i2i' },
      });

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const pendingTasks = response.data.data;
        console.log('恢复进行中的任务:', pendingTasks.length);
        
        pendingTasks.forEach(task => {
          if (task.id) {
            const newTask: WaitingTask = {
              id: task.id,
              taskId: String(task.id),
              modelName: task.modelName || '未知模型',
              prompt: task.prompt || '',
              status: task.status === 0 ? 0 : 1,
              createTime: task.createTime || new Date().toISOString(),
              submitTime: task.createTime ? new Date(task.createTime).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'),
            };
            
            setWaitingTasks(prev => {
              if (prev.find(t => t.taskId === newTask.taskId)) {
                return prev;
              }
              return [...prev, newTask];
            });
            
            if (!pollingTasksRef.current.has(String(task.id))) {
              const timer = setInterval(() => {
                pollTaskStatus(String(task.id), '16:9');
              }, 3000);
              pollingTasksRef.current.set(String(task.id), timer);
              
              pollTaskStatus(String(task.id), '16:9');
            }
          }
        });
        
        if (pendingTasks.length > 0) {
          setLoading(true);
        }
      }
    } catch (error: any) {
      console.error('获取进行中任务失败:', error);
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
          taskType: 'i2i',
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

  // 显示模型详情
  const handleShowModelDetail = (e: React.MouseEvent, model: Model) => {
    e.stopPropagation();
    setSelectedModelForDetail(model);
    setModelDetailModalVisible(true);
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

  // 调用后端 API 生成图片
  const handleGenerate = async (values: any) => {
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
        defaultMessage: '请选择要使用的图片生成模型' 
      }));
      return;
    }

    if (!originalImageUrl || !originalImageFile) {
      message.warning(intl.formatMessage({ 
        id: 'create.i2i.upload.warning', 
        defaultMessage: '请先上传一张图片作为生成参考。' 
      }));
      return;
    }

    const requiredTokens = isVolcSeedream
      ? (selectedModel.tokenCost ?? 0) * Math.max(1, batchSize)
      : (selectedModel.tokenCost ?? 0);
    if (!(await ensureSufficientBalance(requiredTokens))) {
      return;
    }

    if (!(await ensureKycForModel(selectedModel))) {
      return;
    }

    if (creationMode === 'official') {
      if (!selectedPlay) {
        message.warning(
          intl.formatMessage({
            id: 'create.i2i.official.selectRequired',
            defaultMessage: '请先选择一种官方玩法',
          })
        );
        return;
      }
    } else if (!values.prompt?.trim()) {
      message.warning(
        intl.formatMessage({
          id: 'create.i2i.prompt.required',
          defaultMessage: '请输入图片生成的描述',
        })
      );
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setGeneratedImage(null); 

    try {
      // 显示上传提示
      const uploadingMessage = message.loading(
        intl.formatMessage({ 
          id: 'create.i2i.uploading.image', 
          defaultMessage: '正在上传图片到云端...' 
        }),
        0
      );
      
      try {
        // 上传图片到COS
        const imageUrl = await uploadImageToServer(originalImageFile);
        
        uploadingMessage();
        
        message.success(
          intl.formatMessage({ 
            id: 'create.i2i.upload.success', 
            defaultMessage: '图片上传成功' 
          })
        );
      
        // 构建请求参数
        const requestData: any = appendTranslatePromptFlag(
          {
            modelCode: selectedModel.modelCode,
            imageUrls: [imageUrl],
            ...(creationMode === 'official' && selectedPlay
              ? { officialPlayCode: selectedPlay.playCode }
              : { prompt: values.prompt }),
          },
          values
        );

        if (isVolcSeedream) {
          requestData.size = values.resolution || '2K';
          requestData.seedreamWatermark = values.seedreamWatermark === true;
          if (values.aspectRatio && values.resolution) {
            const sizeKey = (values.resolution || '2K').toUpperCase();
            const map = VOLC_SEEDREAM_SIZE_ASPECT_MAP[sizeKey];
            if (map?.[values.aspectRatio]) {
              requestData.size = map[values.aspectRatio];
            }
          }
          const batch = values.batchSize ?? 1;
          if (batch > 1) {
            requestData.batchSize = batch;
          }
        } else {
          // 添加图片比例
          if (values.aspectRatio) {
            requestData.aspectRatio = values.aspectRatio;
          }

          // 添加图片分辨率
          if (values.resolution) {
            requestData.resolution = values.resolution;
          }

          // 添加图片格式
          if (values.outputFormat) {
            requestData.outputFormat = values.outputFormat;
          }
        }

        // 添加种子值
        if (!isVolcSeedream && values.seed !== undefined && values.seed !== null && values.seed !== '') {
          requestData.seed = Number(values.seed);
        }

        // 添加负面提示词
        if (!isVolcSeedream && values.negativePrompt) {
          requestData.negativePrompt = values.negativePrompt;
        }

        // 添加批次大小（非 Seedream Kie 路径）
        if (!isVolcSeedream && values.batchSize !== undefined && values.batchSize !== null) {
          requestData.batchSize = Number(values.batchSize);
        }

        console.log('Generating image-to-image with params:', requestData);
        
        // 调用后端 API
        const response = await instance.post('/productx/sa-ai-models/image/generate/image', requestData, {
          timeout: isVolcSeedream ? 120000 : 0,
          signal: abortController.signal
        });
        
        if (abortController.signal.aborted) {
          return;
        }
        
        if (response.data && response.data.success) {
          const result = response.data.data;
          const status = result.status;
          const rawList =
            response.data.images ||
            result?.images ||
            result?.resultUrls ||
            (result?.imageUrl ? [result.imageUrl] : []);
          const syncImages = parseResponseImages(rawList);

          if ((status === 'completed' || status === 'success') && syncImages.length > 0) {
            const outputUrl = syncImages[0];
            setGeneratedImage({
              url: outputUrl,
              aspectRatio: values.aspectRatio || '16:9',
              resolution: values.resolution || undefined,
              format: values.outputFormat || undefined,
            });
            setLoading(false);
            message.success(intl.formatMessage({
              id: 'create.image.generate.success',
              defaultMessage: '图片生成成功',
            }));
            return;
          }
          
          // 如果任务在队列中，开始轮询
          if (status === 'queued' && result.id) {
            message.success(intl.formatMessage({ 
              id: 'create.image.generate.queued', 
              defaultMessage: '图片生成任务已提交，正在排队中...' 
            }));
            
            startPolling(
              result.id, 
              values.aspectRatio || '16:9',
              values.prompt
            );
          } 
          // 如果任务已完成，直接显示结果
          else if ((status === 'completed' || status === 'success') && (result.imageUrl || result.resultUrl)) {
            const imageUrl = result.imageUrl || result.resultUrl || (result.resultUrls && result.resultUrls[0]);
            const imageResult: ImageResult = {
              url: imageUrl,
              aspectRatio: values.aspectRatio || '16:9',
              resolution: result.resolution || values.resolution || undefined,
              format: result.format || values.outputFormat || undefined,
            };
            
            setGeneratedImage(imageResult);
            setLoading(false);
            message.success(intl.formatMessage({ 
              id: 'create.image.generate.success', 
              defaultMessage: '图片生成成功' 
            }));
          }
          // 如果任务失败
          else if (status === 'failed' || status === 'error') {
            setLoading(false);
            const errorMsg = result.error || intl.formatMessage({ 
              id: 'create.image.generate.failed', 
              defaultMessage: '图片生成失败' 
            });
            message.error(errorMsg);
          }
          // 其他状态（如 processing）
          else {
            message.info(intl.formatMessage({ 
              id: 'create.image.generate.processing', 
              defaultMessage: '图片生成任务已提交，正在处理中...' 
            }));
            
            if (result.id) {
              startPolling(
                result.id, 
                values.aspectRatio || '16:9',
                values.prompt
              );
            } else {
              setLoading(false);
            }
          }
        } else {
          const handled = await handleGenerationApiFailure(response.data, tryShowFromApiError, {
            fallbackMessage: intl.formatMessage({
              id: 'create.image.generate.failed',
              defaultMessage: '图片生成失败',
            }),
          });
          if (!handled) {
            throw new Error(response.data?.message || intl.formatMessage({
              id: 'create.image.generate.failed',
              defaultMessage: '图片生成失败',
            }));
          }
        }
      } catch (uploadError: any) {
        uploadingMessage();
        
        console.error('上传图片失败:', uploadError);
        message.error(
          uploadError.message || intl.formatMessage({ 
            id: 'create.i2i.upload.failed', 
            defaultMessage: '图片上传失败，请重试' 
          })
        );
        throw uploadError;
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || 
          error.message === 'canceled' || 
          error.code === 'ERR_CANCELED' ||
          abortController.signal.aborted) {
        return;
      }
      
      console.error('图片生成失败:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          intl.formatMessage({ 
                            id: 'create.image.generate.failed', 
                            defaultMessage: '图片生成失败，请重试' 
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

  return (
    <>
      <GlobalSelectStyles />
      <StyledCard>
        <Row gutter={[32, 24]}>
          {/* --- 左侧：控制面板 --- */}
          <Col xs={24} lg={9}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {!embedded && (
              <div style={{ marginBottom: 8 }}>
                <Title level={3} style={{ margin: 0, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SwapOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                  <FormattedMessage id="create.imageToImage.title" defaultMessage="AI 图生图" />
                </Title>
                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileImageOutlined style={{ fontSize: 14 }} />
                  <FormattedMessage 
                    id="create.imageToImage.subtitle" 
                    defaultMessage="基于参考图片生成新图片" 
                  />
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
                  aspectRatio: 'auto',
                  resolution: undefined,
                  outputFormat: undefined,
                  seed: undefined,
                  negativePrompt: undefined,
                  batchSize: 1,
                  modelId: null,
                }}
              >
                {/* 模型选择 */}
                <I2iModelSelectField
                  selectedModel={selectedModel}
                  modelsLoading={modelsLoading}
                  onOpenModal={() => setModelModalVisible(true)}
                />

                {creationMode === 'official' && selectedPlay && (
                <OfficialPlaySelectedBanner
                  play={selectedPlay}
                  onChangePlay={() => setOfficialPlayModalVisible(true)}
                  onClear={handleClearOfficialPlay}
                />
                )}

                {/* 上传图片区域 */}
                <Form.Item
                  name="inputFile"
                  label={
                    <Space>
                      <FileImageOutlined style={{ color: '#1890ff' }} />
                      <FormattedMessage id="create.i2i.upload" defaultMessage="上传参考图片" />
                    </Space>
                  }
                  rules={[{ required: true, message: intl.formatMessage({ id: 'create.i2i.upload.required', defaultMessage: '请上传参考图片' }) }]}
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
                          <FormattedMessage id="create.i2i.replaceImage" defaultMessage="更换图片" />
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
                      onClick={() => document.getElementById('i2i-upload-input')?.click()}
                    >
                      <input
                        id="i2i-upload-input"
                        type="file"
                        accept={isVolcSeedream ? VOLC_SEEDREAM_UPLOAD_ACCEPT : 'image/*'}
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                      />
                      <UploadIcon $isDark={isDark}>
                        <InboxOutlined style={{ fontSize: 48 }} />
                      </UploadIcon>
                      <UploadText $isDark={isDark}>
                        <FormattedMessage id="create.i2i.upload.click" defaultMessage="点击或拖拽上传" />
                      </UploadText>
                      <UploadHint $isDark={isDark}>
                        {isVolcSeedream ? (
                          <FormattedMessage
                            id="create.i2i.upload.volcFormats"
                            defaultMessage="支持 JPG、PNG、WebP、BMP、TIFF、GIF（最大 10MB，火山引擎限制）"
                          />
                        ) : (
                          <FormattedMessage
                            id="create.i2i.upload.supportedFormats"
                            defaultMessage="支持 JPG, PNG, WebP (最大 30MB)"
                          />
                        )}
                      </UploadHint>
                    </CustomUploadArea>
                  )}
                </Form.Item>

                {/* 提示词输入（官方玩法模式下隐藏） */}
                {creationMode === 'custom' && (
                <Form.Item
                  name="prompt"
                  className="i2i-prompt-form-item"
                  label={
                    <Space style={{ width: '100%', justifyContent: 'space-between', overflow: 'visible' }}>
                      <Space wrap align="center">
                        <EditOutlined style={{ color: '#1890ff' }} />
                        <FormattedMessage id="create.prompt" defaultMessage="提示词 (Prompt)" />
                        <PromptTranslateEnSwitch />
                      </Space>
                      <I2iPromptLabelActions size="small" align="center">
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
                        <PromptGlowButtonShell>
                          <Tooltip title={intl.formatMessage({ id: 'create.prompt.enhance.tooltip', defaultMessage: 'AI丰富提示词，让描述更加详细生动' })}>
                            <EnhancePromptButton
                              type="primary"
                              size="small"
                              icon={<ThunderboltOutlined />}
                              onClick={handleEnhancePrompt}
                              loading={enhancingPrompt}
                            >
                              <FormattedMessage id="create.prompt.enhance" defaultMessage="AI丰富" />
                            </EnhancePromptButton>
                          </Tooltip>
                        </PromptGlowButtonShell>
                        <PromptGlowButtonShell>
                          <Tooltip title={intl.formatMessage({ id: 'create.i2i.official.buttonTooltip', defaultMessage: '选择平台官方图生图玩法' })}>
                            <OfficialPlayTriggerButton
                              type="primary"
                              size="small"
                              $active={Boolean(selectedPlay)}
                              icon={<AppstoreOutlined />}
                              onClick={() => setOfficialPlayModalVisible(true)}
                            >
                              <FormattedMessage id="create.i2i.official.button" defaultMessage="官方玩法" />
                            </OfficialPlayTriggerButton>
                          </Tooltip>
                        </PromptGlowButtonShell>
                      </I2iPromptLabelActions>
                    </Space>
                  }
                  rules={[{ required: true, message: intl.formatMessage({ id: 'create.i2i.prompt.required', defaultMessage: '请输入图片生成的描述' }) }]}
                  style={{ marginBottom: 20 }}
                >
                  <TextArea 
                    rows={3} 
                    placeholder={intl.formatMessage({ id: 'create.prompt.i2i.placeholder', defaultMessage: '例如：将图片转换为水彩画风格，添加彩虹背景...' })} 
                    maxLength={20000}
                    showCount
                    style={{ resize: 'none' }}
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    onPressEnter={(e) => {
                      e.preventDefault();
                    }}
                  />
                </Form.Item>
                )}

                {/* 图片参数设置（Volc Seedream 与文生图一致：比例 + 分辨率档位 + 水印；非 Seedream 保留 Kie 参数） */}
                {(availableAspectRatios.length > 0 ||
                  availableResolutions.length > 0 ||
                  availableOutputFormats.length > 0 ||
                  isVolcSeedream) && (
                  <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    {availableAspectRatios.length > 0 && (
                      <Col
                        xs={24}
                        sm={isVolcSeedream ? 8 : availableResolutions.length > 0 || availableOutputFormats.length > 0 ? 8 : 24}
                      >
                        <Form.Item
                          name="aspectRatio"
                          label={
                            <Space>
                              <FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                              <FormattedMessage id="create.ratio" defaultMessage="画面比例" />
                            </Space>
                          }
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            optionLabelProp="label"
                            disabled={!selectedModel}
                            placeholder={
                              !selectedModel
                                ? intl.formatMessage({
                                    id: 'create.model.select.placeholder',
                                    defaultMessage: '请先选择模型',
                                  })
                                : undefined
                            }
                            dropdownMatchSelectWidth={false}
                            dropdownStyle={{ minWidth: 'max-content' }}
                          >
                            {availableAspectRatios.map((ratio) => (
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
                    {availableResolutions.length > 0 && (
                      <Col
                        xs={24}
                        sm={
                          isVolcSeedream
                            ? 8
                            : availableAspectRatios.length > 0 && availableOutputFormats.length > 0
                              ? 8
                              : availableAspectRatios.length > 0 || availableOutputFormats.length > 0
                                ? 12
                                : 24
                        }
                      >
                        <Form.Item
                          name="resolution"
                          label={
                            <Space>
                              <DesktopOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                              <FormattedMessage id="create.resolution" defaultMessage="分辨率" />
                              {isVolcSeedream && (
                                <Tooltip
                                  title={intl.formatMessage({
                                    id: 'create.resolution.tooltip',
                                    defaultMessage: '选择图片的分辨率，优先级高于画面比例',
                                  })}
                                >
                                  <InfoCircleOutlined style={{ color: '#999' }} />
                                </Tooltip>
                              )}
                            </Space>
                          }
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            disabled={!selectedModel}
                            placeholder={
                              isVolcSeedream
                                ? intl.formatMessage({
                                    id: 'create.resolution.placeholder',
                                    defaultMessage: '选择分辨率（2K/4K）',
                                  })
                                : intl.formatMessage({
                                    id: 'create.image.resolution.placeholder',
                                    defaultMessage: '请选择分辨率',
                                  })
                            }
                            allowClear={!isVolcSeedream}
                          >
                            {availableResolutions.map((res) => {
                              const value = typeof res === 'string' ? res : res.value;
                              const label = typeof res === 'string' ? res : res.label;
                              return (
                                <Select.Option key={value} value={value}>
                                  {label}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                    {availableOutputFormats.length > 0 && (
                      <Col
                        xs={24}
                        sm={
                          availableAspectRatios.length > 0 && availableResolutions.length > 0
                            ? 8
                            : availableAspectRatios.length > 0 || availableResolutions.length > 0
                              ? 12
                              : 24
                        }
                      >
                        <Form.Item
                          name="outputFormat"
                          label={
                            <Space>
                              <FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                              <FormattedMessage id="create.image.format" defaultMessage="输出格式" />
                            </Space>
                          }
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            disabled={!selectedModel}
                            placeholder={intl.formatMessage({
                              id: 'create.image.format.placeholder',
                              defaultMessage: '请选择输出格式',
                            })}
                          >
                            {availableOutputFormats.map((format) => (
                              <Select.Option key={format} value={format}>
                                {format.toUpperCase()}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                    {isVolcSeedream && (
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name="seedreamWatermark"
                          label={
                            <Space>
                              <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                              <FormattedMessage id="create.seedream.watermark" defaultMessage="添加水印" />
                            </Space>
                          }
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Switch
                            checkedChildren={intl.formatMessage({
                              id: 'create.seedream.watermark.yes',
                              defaultMessage: '添加',
                            })}
                            unCheckedChildren={intl.formatMessage({
                              id: 'create.seedream.watermark.no',
                              defaultMessage: '不添加',
                            })}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                )}

                {isVolcSeedream && (
                  <Form.Item
                    name="batchSize"
                    label={
                      <Space>
                        <NumberOutlined style={{ color: '#1890ff' }} />
                        <FormattedMessage id="create.batchSize" defaultMessage="生成数量" />
                        <Tooltip
                          title={intl.formatMessage({
                            id: 'create.seedream.batchSize.tooltip',
                            defaultMessage: '组图模式：单次最多 4 张，与火山 sequential_image_generation 一致',
                          })}
                        >
                          <InfoCircleOutlined style={{ color: '#999' }} />
                        </Tooltip>
                      </Space>
                    }
                    initialValue={1}
                    style={{ marginBottom: 20 }}
                  >
                    <Slider min={1} max={4} marks={{ 1: '1', 2: '2', 3: '3', 4: '4' }} />
                  </Form.Item>
                )}

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
                        <FormattedMessage id="create.image.generate.cancel" defaultMessage="取消生成" />
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
                        <FormattedMessage id="create.generate.i2i" defaultMessage="开始生成图片" />
                      </Button>
                    )}
                    <EstimatedPriceHint
                      price={i2iEstimatedPrice}
                      tokenBalance={tokenBalance}
                      balanceLoading={balanceLoading}
                    />
                  </div>
                </Form.Item>
              </Form>
              </div>
            </Space>
          </Col>

          {/* --- 右侧：结果展示区 --- */}
          <ImageResultDisplay
            loading={loading}
            generatedImage={generatedImage}
            waitingTasks={waitingTasks}
            originalImageUrl={originalImageUrl}
            isDark={isDark}
            onOpenQueue={() => setQueueDrawerOpen(true)}
          />
        </Row>
        
        {/* 生成记录 */}
        <HistorySection
          historyTasks={historyTasks}
          historyLoading={historyLoading}
          historyPagination={historyPagination}
          onRefresh={() => fetchHistoryTasks(historyPagination.current, historyPagination.pageSize)}
          onPageChange={handleHistoryPageChange}
          onTaskClick={handleShowTaskDetail}
          getStatusText={getStatusText}
        />
      </StyledCard>

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
        onCancelTask={handleCancelTask}
      />

      {/* 模型选择模态框 */}
      <ModelSelectionModal
        open={modelModalVisible}
        onClose={() => setModelModalVisible(false)}
        type="family"
        title={intl.formatMessage({
          id: 'create.model.select',
          defaultMessage: '选择模型',
        })}
        models={models}
        selectedModel={selectedModel}
        onSelect={(model) => handleModelChange(model as Model)}
        onShowDetail={(model) => handleShowModelDetailFromSelect(model as Model)}
        loading={modelsLoading}
      />

      <OfficialPlaySelectionModal
        open={officialPlayModalVisible}
        onClose={() => setOfficialPlayModalVisible(false)}
        selectedPlayCode={selectedPlay?.playCode ?? null}
        onSelectPlay={handleSelectOfficialPlay}
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
    </>
  );
};

export default ImageToImage;

