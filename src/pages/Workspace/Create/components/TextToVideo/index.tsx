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
  FileImageOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  CloseOutlined,
  StopOutlined,
  SyncOutlined,
  UnorderedListOutlined,
  BulbOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import instance from 'api/axios';
import { VideoResult, Model, GenerationTask, GenerationTaskPageResponse } from './types';
import { 
  GlobalSelectStyles,
  StyledCard,
  ResultArea,
  VideoPlaceholder,
  ActionOverlay,
  AspectRatioOption,
} from './styles';
import { getAspectRatioOption, getCameraMotions, getModelAspectRatios, getModelDurationOptions } from './utils';
import HistorySection from './HistorySection';
import TaskDetailModal from './TaskDetailModal';
import WaitingTaskQueue, { WaitingTask } from './WaitingTaskQueue';
import ModelDetailModal from './ModelDetailModal';
import VideoModelSelectionModal from '../ImageToVideo/VideoModelSelectionModal';
import VideoModelSelectField from '../ImageToVideo/VideoModelSelectField';
import EstimatedPriceHint from '../shared/EstimatedPriceHint';
import { useTokenBalance } from '../shared/useTokenBalance';
import { formatDurationEstimatedTooltip } from '../shared/estimatedPriceText';
import { getVideoRequiredTokens } from '../shared/balanceUtils';
import { useInsufficientBalanceGuard } from '../shared/useInsufficientBalanceGuard';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal';
import PromptTranslateEnSwitch from '../shared/PromptTranslateEnSwitch';
import { appendTranslatePromptFlag } from '../shared/promptTranslateUtils';
import { preloadVideoModelCovers } from '../shared/videoModelCoverPreload';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TextToVideo: React.FC = () => {
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
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTasksRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [waitingTasks, setWaitingTasks] = useState<WaitingTask[]>([]);
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false);
  const isUserSubmitRef = useRef<boolean>(false); // 标记是否是用户主动提交
  
  // AI生成提示词相关状态
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState(''); // 监听提示词输入框的值
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null); // 保存AI生成/丰富之前的原始提示词
  
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
  const [modelPickerVisible, setModelPickerVisible] = useState(false);

  // 初始化时确保标志为 false
  useEffect(() => {
    isUserSubmitRef.current = false;
  }, []);

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
          // 同步更新表单的 modelId 字段
          form.setFieldsValue({ modelId: firstModel.id });
          updateFormByModel(firstModel);
          preloadVideoModelCovers(response.data.data, { priorityModelId: firstModel.id });
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
    fetchPendingTasks(); // 获取进行中的任务并恢复轮询

    // 组件卸载时清理 AbortController 和轮询定时器
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      // 清理所有任务轮询
      pollingTasksRef.current.forEach((timer) => {
        clearInterval(timer);
      });
      pollingTasksRef.current.clear();
    };
  }, [intl]);

  // 切换模型时优先预加载当前选中封面
  useEffect(() => {
    if (selectedModel && models.length > 0) {
      preloadVideoModelCovers(models, { priorityModelId: selectedModel.id });
    }
  }, [selectedModel?.id, models]);

  // 生成成功后刷新记录
  useEffect(() => {
    if (generatedVideo && !loading) {
      // 延迟一下再刷新，确保后端数据已更新
      setTimeout(() => {
        fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
      }, 1000);
    }
  }, [generatedVideo, loading]);

  // 根据模型更新表单参数
  const updateFormByModel = (model: Model) => {
    if (!model) return;

    const updates: any = {};

    // 设置视频比例（如果有支持的比例）
    const supportedRatios = getModelAspectRatios(model);
    if (supportedRatios.length > 0) {
      // 检查当前选择的比例是否在支持列表中，如果不在则使用第一个
      const currentRatio = form.getFieldValue('aspectRatio');
      if (!supportedRatios.includes(currentRatio)) {
        updates.aspectRatio = supportedRatios[0];
      }
    }

    // 设置视频时长
    const durationOptions = getModelDurationOptions(model);
    if (durationOptions === null) {
      // 使用 Slider（videoDuration 有值）
      if (model.videoDuration) {
        const currentDuration = form.getFieldValue('duration') || 8;
        if (currentDuration > model.videoDuration) {
          updates.duration = model.videoDuration;
        } else if (currentDuration < 4) {
          // 确保最小值为4秒
          updates.duration = 4;
        }
      }
    } else if (durationOptions.length > 0) {
      // 使用 Select（videoDurationEnum 有值）
      const currentDuration = form.getFieldValue('duration');
      if (!currentDuration || !durationOptions.includes(currentDuration)) {
        // 如果当前值不在选项中，使用第一个选项
        updates.duration = durationOptions[0];
      }
    }
    // 如果 durationOptions 为空数组，表示不支持时长指定，不做任何处理

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
  const applySelectedModel = (model: Model) => {
    setSelectedModel(model);
    form.setFieldsValue({ modelId: model.id });
    updateFormByModel(model);
  };

  // 获取支持的视频比例选项（根据选中的模型）
  // 注意：文生视频只使用 videoAspectRatios 或 videoAspectRatiosEnum，不使用 imageAspectRatios
  const getAvailableAspectRatios = () => {
    if (!selectedModel) {
      return [];
    }

    // 使用辅助函数获取支持的比例列表（优先 videoAspectRatios，如果为空则使用 videoAspectRatiosEnum）
    const supportedRatios = getModelAspectRatios(selectedModel);
    
    if (supportedRatios.length === 0) {
      return [];
    }
    
    // 根据后端返回的比例动态生成选项
    return supportedRatios.map(ratio => getAspectRatioOption(ratio, intl));
  };

  // 获取最大视频时长（根据选中的模型）
  // 只有在使用 Slider 时才需要此函数
  const getMaxDuration = () => {
    return selectedModel?.videoDuration || 15;
  };

  // 获取视频时长选项（用于判断是使用 Slider 还是 Select）
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

  // 获取支持的视频格式选项（根据选中的模型）
  const getAvailableVideoFormats = () => {
    if (!selectedModel || !selectedModel.videoFormats) {
      return [];
    }

    const formats = selectedModel.videoFormats.split(',').map(f => f.trim());
    return formats;
  };

  // 获取支持的视频风格选项（根据选中的模型）
  const getAvailableVideoStyles = () => {
    if (!selectedModel || !selectedModel.videoSupportStyle) {
      return [];
    }

    const styles = selectedModel.videoSupportStyle.split(',').map(s => s.trim()).filter(s => s);
    return styles;
  };

  // 获取支持的视频质量选项（根据选中的模型）
  const getAvailableVideoQualities = () => {
    if (!selectedModel || !selectedModel.videoQuality) {
      return [];
    }

    const qualities = selectedModel.videoQuality.split(',').map(q => q.trim()).filter(q => q);
    return qualities;
  };

  // 根据选中的比例获取对应的分辨率
  const getResolutionByAspectRatio = (aspectRatio: string): string | null => {
    if (!selectedModel || !selectedModel.videoAspectResolution) {
      return null;
    }

    // 使用辅助函数获取支持的比例列表
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

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string, aspectRatio: string, duration: number) => {
    // 如果任务已被标记为完成，直接返回
    if (completedTasksRef.current.has(taskId)) {
      return;
    }
    
    try {
      const response = await instance.get(`/productx/sa-ai-models/video/task/${taskId}/status`);
      
      // 再次检查，防止并发请求
      if (completedTasksRef.current.has(taskId)) {
        return;
      }
      
      if (response.data && response.data.success) {
        const taskData = response.data.data;
        const status = taskData.status;

        // 如果任务完成
        if (status === 'completed' || status === 'success') {
          // 标记任务已完成，防止重复处理
          completedTasksRef.current.add(taskId);
          stopTaskPolling(taskId);
          setLoading(false);
          
          if (taskData.videoUrl) {
            const videoResult: VideoResult = {
              url: taskData.videoUrl,
              aspectRatio: aspectRatio,
              duration: duration,
              thumbnail: taskData.thumbnail || taskData.thumbnailUrl || '',
            };
            setGeneratedVideo(videoResult);
            message.success(intl.formatMessage({ 
              id: 'create.video.generate.success', 
              defaultMessage: '视频生成成功' 
            }));
          } else {
            throw new Error(intl.formatMessage({ 
              id: 'create.video.generate.noUrl', 
              defaultMessage: '视频生成完成，但未获取到视频地址' 
            }));
          }
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
        // 如果任务仍在队列中或处理中，继续轮询
        else if (status === 'queued' || status === 'processing' || status === 'pending') {
          // 继续轮询，不做任何操作
        }
        // 其他未知状态
        else {
          console.warn('未知的任务状态:', status);
        }
      } else {
        throw new Error(response.data?.message || intl.formatMessage({ 
          id: 'create.video.status.checkFailed', 
          defaultMessage: '查询任务状态失败' 
        }));
      }
    } catch (error: any) {
      // 如果是用户取消的请求，不显示错误
      if (error.name === 'AbortError' || 
          error.message === 'canceled' || 
          error.code === 'ERR_CANCELED') {
        return;
      }
      
      console.error('查询任务状态失败:', error);
      // 轮询失败时，可以选择继续轮询或停止
      // 这里选择继续轮询，但可以记录错误
    }
  };

  // 开始轮询任务状态
  const startPolling = (taskId: string, aspectRatio: string, duration: number, prompt?: string) => {
    // 检查任务是否已存在
    const existingTask = waitingTasks.find(task => task.taskId === taskId);
    if (existingTask) {
      return; // 任务已存在，不重复添加
    }
    
    // 添加等待任务到队列
    const newTask: WaitingTask = {
      taskId,
      modelName: selectedModel?.modelName || '未知模型',
      prompt: prompt || form.getFieldValue('prompt') || '',
      submitTime: new Date().toLocaleString('zh-CN'),
      aspectRatio,
      duration,
    };
    
    setWaitingTasks(prev => [...prev, newTask]);
    
    // 立即查询一次
    pollTaskStatus(taskId, aspectRatio, duration);
    
    // 然后每3秒轮询一次
    const timer = setInterval(() => {
      pollTaskStatus(taskId, aspectRatio, duration);
    }, 3000);
    
    pollingTasksRef.current.set(taskId, timer);
  };

  // 取消单个任务
  const handleCancelTask = (taskId: string) => {
    stopTaskPolling(taskId);
          message.info(intl.formatMessage({ 
            id: 'create.video.generate.cancelled.polling', 
            defaultMessage: '已取消任务轮询' 
          }));
  };

  // 取消当前正在进行的生成
  const handleCancelGenerate = () => {
    // 停止所有轮询
    stopAllPolling();
    
    // 取消 HTTP 请求
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
    try {
      const response = await instance.get<{
        success: boolean;
        data: GenerationTask[];
      }>('/productx/sa-ai-gen-task/my-tasks/pending', {
        params: { taskType: 't2v' },
      });

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const pendingTasks = response.data.data;
        console.log('恢复进行中的任务:', pendingTasks.length);
        
        // 为每个进行中的任务启动轮询
        pendingTasks.forEach(task => {
          if (task.id) {
            // 添加到等待任务队列
            const newTask: WaitingTask = {
              taskId: String(task.id),
              modelName: task.modelName || '未知模型',
              prompt: task.prompt || '',
              submitTime: task.createTime ? new Date(task.createTime).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'),
              aspectRatio: '16:9', // 默认值，可从任务详情获取
              duration: 8, // 默认值
            };
            
            setWaitingTasks(prev => {
              // 检查是否已存在
              if (prev.find(t => t.taskId === newTask.taskId)) {
                return prev;
              }
              return [...prev, newTask];
            });
            
            // 开始轮询（如果尚未轮询）
            if (!pollingTasksRef.current.has(String(task.id))) {
              const timer = setInterval(() => {
                pollTaskStatus(String(task.id), '16:9', 8);
              }, 3000);
              pollingTasksRef.current.set(String(task.id), timer);
              
              // 立即查询一次
              pollTaskStatus(String(task.id), '16:9', 8);
            }
          }
        });
        
        // 如果有进行中的任务，设置loading状态
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
          taskType: 't2v', // 通过 taskType 参数查询文本生成视频类型的任务
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

  // AI生成提示词
  const handleGeneratePrompt = async () => {
    setGeneratingPrompt(true);
    try {
      // 获取当前输入框中的提示词（作为基础提示词）
      const currentPrompt = form.getFieldValue('prompt') || '';
      
      // 保存当前提示词作为原始值（如果还没有保存过，或者当前值与原始值不同）
      if (!originalPrompt || originalPrompt !== currentPrompt.trim()) {
        setOriginalPrompt(currentPrompt.trim() || null);
      }
      
      const requestData: any = {
        language: locale || 'zh',
      };
      
      // 如果有基础提示词，则传递
      if (currentPrompt.trim()) {
        requestData.basePrompt = currentPrompt.trim();
      }
      
      const response = await instance.post('/productx/sa-ai-models/video/prompt/generate', requestData);

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

  // 调用后端 API 生成视频
  const handleGenerate = async (values: any) => {
    // 防止自动提交：如果不是用户主动点击按钮提交，直接返回
    if (!isUserSubmitRef.current) {
      console.log('阻止自动提交：不是用户主动提交');
      return;
    }
    
    // 重置标志
    isUserSubmitRef.current = false;
    
    // 防止重复提交：如果正在加载中，直接返回
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

    const duration = Number(values.duration) || 8;
    const requiredTokens = getVideoRequiredTokens(selectedModel.tokenCost, duration);
    if (!(await ensureSufficientBalance(requiredTokens))) {
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
      const requestData: any = appendTranslatePromptFlag({
        prompt: values.prompt,
        modelCode: selectedModel.modelCode,
      }, values);

      // 添加视频比例
      if (values.aspectRatio) {
        requestData.aspectRatio = values.aspectRatio;
        
        // 同时添加分辨率（根据选中的比例，如果有的话）
        const resolution = getResolutionByAspectRatio(values.aspectRatio);
        if (resolution) {
          requestData.size = resolution;
        }
      }

      // 添加视频时长（确保传递数字类型）
      if (values.duration !== undefined && values.duration !== null) {
        requestData.seconds = Number(values.duration);
      }

      // 添加反向提示词（可选）
      if (values.negativePrompt) {
        requestData.negativePrompt = values.negativePrompt;
      }

      // 添加输出格式（可选）
      if (values.videoFormat) {
        requestData.outputFormat = values.videoFormat;
      }

      // 添加视频风格（可选，当模型支持时）
      if (values.videoSupportStyle) {
        requestData.videoSupportStyle = values.videoSupportStyle;
      }

      // 添加视频质量（可选，当模型支持时）
      if (values.videoQuality) {
        requestData.videoQuality = values.videoQuality;
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
        const status = result.status;
        
        // 如果任务在队列中，开始轮询
        if (status === 'queued' && result.id) {
          message.success(intl.formatMessage({ 
            id: 'create.video.generate.queued', 
            defaultMessage: '视频生成任务已提交，正在排队中...' 
          }));
          
          // 开始轮询任务状态
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
          
          // 如果有任务ID，开始轮询
          if (result.id) {
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
      if (!(await tryShowFromApiError(errorMessage))) {
        message.error(errorMessage);
      }
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
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
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
                <Button
                  type="default"
                  icon={<UnorderedListOutlined />}
                  onClick={() => setQueueDrawerOpen(true)}
                  className={waitingTasks.length > 0 ? 'task-queue-button-active' : ''}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6,
                    position: 'relative'
                  }}
                >
                  <FormattedMessage 
                    id="create.video.taskQueue" 
                    defaultMessage="任务队列" 
                  />
                  {waitingTasks.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      background: '#ff4d4f',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      border: '2px solid #fff'
                    }}>
                      {waitingTasks.length}
                    </span>
                  )}
                </Button>
              </div>

              <div
                onKeyDown={(e) => {
                  // 阻止表单中的 Enter 键触发表单提交（除了在 TextArea 中）
                  if (e.key === 'Enter' && e.target instanceof HTMLElement) {
                    // 如果是在 TextArea 中，允许换行
                    if (e.target.tagName === 'TEXTAREA') {
                      return;
                    }
                    // 如果是在 Input 或其他元素中，阻止默认行为
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
                  // 表单验证失败时的处理
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
                }}
              >
                <VideoModelSelectField
                  selectedModel={selectedModel}
                  modelsLoading={modelsLoading}
                  onOpenModal={() => setModelPickerVisible(true)}
                />

                {/* 提示词输入 */}
                <Form.Item
                  name="prompt"
                  className="prompt-form-item"
                  label={
                    <div className="prompt-label-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space wrap align="center">
                      <EditOutlined style={{ color: '#1890ff' }} />
                      <FormattedMessage id="create.prompt.video" defaultMessage="视频场景描述 (Prompt)" />
                      <PromptTranslateEnSwitch />
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
                  rules={[{ 
                    required: true, 
                    message: intl.formatMessage({ 
                      id: 'create.prompt.video.required', 
                      defaultMessage: '请输入视频场景描述' 
                    }) 
                  }]}
                  style={{ marginTop: 32, marginBottom: 20 }}
                >
                  <TextArea 
                    rows={4} 
                    placeholder={intl.formatMessage({ id: 'create.prompt.video.placeholder', defaultMessage: '例如：一只宇航员狗狗在月球表面跳舞，8K，电影光线，超现实主义。' })} 
                    maxLength={1500}
                    showCount
                    style={{ resize: 'none' }}
                    onChange={(e) => {
                      setPromptValue(e.target.value);
                    }}
                    onPressEnter={(e) => {
                      // 阻止 Enter 键触发表单提交，允许换行
                      if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        // Shift+Enter, Ctrl+Enter, Cmd+Enter 允许换行
                        return;
                      }
                      // 普通 Enter 键也允许换行，不触发表单提交
                      e.preventDefault();
                    }}
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
                  <Input 
                    placeholder={intl.formatMessage({ 
                      id: 'create.negativePrompt.video.placeholder', 
                      defaultMessage: '例如：水渍，闪烁，低分辨率，人物模糊...' 
                    })}
                    onPressEnter={(e) => {
                      // 阻止 Input 中的 Enter 键触发表单提交
                      // 用户应该点击"立即生成视频"按钮来提交
                      e.preventDefault();
                    }}
                  />
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
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) {
                              return Promise.resolve();
                            }
                            const availableRatios = getAvailableAspectRatios();
                            const validValues = availableRatios.map(r => r.value);
                            if (validValues.includes(value)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error(intl.formatMessage({ 
                              id: 'create.video.ratio.invalid', 
                              defaultMessage: '请选择模型支持的视频比例' 
                            })));
                          }
                        }
                      ]}
                    >
                      <Select
                        optionLabelProp="label"
                        disabled={!selectedModel || getAvailableAspectRatios().length === 0}
                        placeholder={!selectedModel ? intl.formatMessage({ 
                          id: 'create.model.select.placeholder', 
                          defaultMessage: '请先选择模型' 
                        }) : undefined}
                        allowClear={false}
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

                {/* 视频风格选择（当模型支持时显示） */}
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
                              defaultMessage: '选择视频生成风格（主要用于 Grok 模型）' 
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

                {/* 视频质量选择（当模型支持时显示） */}
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

                {/* 时长控制 */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
                    const durationOptions = getDurationOptions();
                    
                    // 如果两个字段都没有，不显示时长控制
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
                        style={{ marginBottom: 20 }}
                      >
                        {durationOptions === null ? (
                          // 使用 Slider（videoDuration 有值）
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
                                        return formatDurationEstimatedTooltip(
                                          intl,
                                          duration,
                                          price,
                                          tokenBalance,
                                          balanceLoading,
                                        );
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
                              );
                            }}
                          </Form.Item>
                        ) : (
                          // 使用 Select（videoDurationEnum 有值）
                          <Select
                            disabled={!selectedModel || durationOptions.length === 0}
                            placeholder={!selectedModel ? intl.formatMessage({ 
                              id: 'create.model.select.placeholder', 
                              defaultMessage: '请先选择模型' 
                            }) : intl.formatMessage({ 
                              id: 'create.duration.select.placeholder', 
                              defaultMessage: '请选择视频时长' 
                            })}
                          >
                            {durationOptions.map(duration => (
                              <Select.Option key={duration} value={duration}>
                                {intl.formatMessage({ 
                                  id: 'create.duration.format', 
                                  defaultMessage: '{duration}s' 
                                }, { duration })}
                              </Select.Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    );
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
                          // 设置用户主动提交标志
                          isUserSubmitRef.current = true;
                          // 手动触发表单提交
                          form.submit();
                        }}
                      >
                        <FormattedMessage id="create.generate.video" defaultMessage="立即生成视频" />
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
          </Col>

          {/* --- 右侧：结果展示区 --- */}
          <Col xs={24} lg={15}>
            <ResultArea>
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
                        defaultMessage="正在分析提示词，构建 3D 世界..." 
                      />
                    )}
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
                  
                  <VideoPlaceholder>
                    <video 
                      src={generatedVideo.url}
                      poster={generatedVideo.thumbnail}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
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

      {/* 模型详情模态框 */}
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
      />

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

export default TextToVideo;

