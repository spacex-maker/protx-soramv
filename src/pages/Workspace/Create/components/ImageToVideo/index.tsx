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
  RobotOutlined,
  CloseOutlined,
  SyncOutlined,
  UnorderedListOutlined,
  InboxOutlined,
  DeleteOutlined,
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
  ModelOptionWrapper,
  ModelSelectDisplay,
  AspectRatioTag,
  ResolutionTag,
  DetailButton,
  InputImageContainer,
  OverlayActions,
  CustomUploadArea,
  UploadIcon,
  UploadText,
  UploadHint,
} from './styles';
import { 
  getAspectRatioOption, 
  getCameraMotions, 
  isVideoUrl, 
  normalizeUrl, 
  getModelAspectRatios, 
  getModelDurationOptions,
  getBase64,
} from './utils';
import HistorySection from './HistorySection';
import TaskDetailModal from './TaskDetailModal';
import WaitingTaskQueue, { WaitingTask } from './WaitingTaskQueue';
import ModelDetailModal from './ModelDetailModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ImageToVideo: React.FC = () => {
  const intl = useIntl();
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
  const isUserSubmitRef = useRef<boolean>(false);
  
  // 图片上传状态
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
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

  // 获取模型列表
  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
          params: { modelType: 'i2v' }
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

  // 处理模型选择变化
  const handleModelChange = (modelId: number) => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      form.setFieldsValue({ modelId: modelId });
      updateFormByModel(model);
    }
  };

  // 处理文件选择
  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setOriginalImageUrl(null);
      setOriginalImageFile(null);
      form.setFieldsValue({ inputFile: undefined });
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      message.error(intl.formatMessage({ id: 'create.i2v.fileType.error', defaultMessage: '请选择图片文件' }));
      return;
    }

    // 验证文件大小（例如限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      message.error(intl.formatMessage({ id: 'create.i2v.fileSize.error', defaultMessage: '图片文件大小不能超过10MB' }));
      return;
    }

    try {
      const url = await getBase64(file);
      setOriginalImageUrl(url);
      setOriginalImageFile(file);
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
    form.setFieldsValue({ inputFile: undefined });
    const fileInput = document.getElementById('i2v-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 自定义模型选择框显示内容
  const renderModelSelectDisplay = (model: Model | null) => {
    if (!model) return null;
    
    const coverImage = (model as any).coverImage ? normalizeUrl((model as any).coverImage) : null;
    const isVideo = coverImage ? isVideoUrl(coverImage) : false;
    
    return (
      <ModelSelectDisplay coverImage={coverImage} isVideo={isVideo}>
        {isVideo && coverImage && (
          <video 
            className="cover-video"
            src={coverImage}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        <div className="model-display-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="model-display-name">
              {model.modelName}
            </div>
            {model.modelCode && (
              <div className="model-display-code">{model.modelCode}</div>
            )}
          </div>
          {model.tokenCost !== null && model.tokenCost !== undefined && (
            <div className="model-display-price">
              <span className="model-display-price-amount">
                {model.tokenCost}
              </span>
              <span className="model-display-price-currency">
                Token
              </span>
              <span className="model-display-price-unit">
                {intl.formatMessage({ 
                  id: 'create.model.price.perSecond', 
                  defaultMessage: '/秒' 
                })}
              </span>
            </div>
          )}
        </div>
      </ModelSelectDisplay>
    );
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
    const existingTask = waitingTasks.find(task => task.taskId === taskId);
    if (existingTask) {
      return;
    }
    
    const newTask: WaitingTask = {
      taskId,
      modelName: selectedModel?.modelName || '未知模型',
      prompt: prompt || form.getFieldValue('prompt') || '',
      submitTime: new Date().toLocaleString('zh-CN'),
      aspectRatio,
      duration,
    };
    
    setWaitingTasks(prev => [...prev, newTask]);
    
    pollTaskStatus(taskId, aspectRatio, duration);
    
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
        
        // 为每个进行中的任务启动轮询
        pendingTasks.forEach(task => {
          if (task.id) {
            // 添加到等待任务队列
            const newTask: WaitingTask = {
              taskId: String(task.id),
              modelName: task.modelName || '未知模型',
              prompt: task.prompt || '',
              submitTime: task.createTime ? new Date(task.createTime).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'),
              aspectRatio: '16:9', // 默认值
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

    if (!originalImageUrl || !originalImageFile) {
      message.warning(intl.formatMessage({ 
        id: 'create.i2v.upload.warning', 
        defaultMessage: '请先上传一张图片作为生成参考。' 
      }));
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
        // 上传图片到COS
        const imageUrl = await uploadImageToServer(originalImageFile);
        
        // 关闭上传提示
        uploadingMessage();
        
        message.success(
          intl.formatMessage({ 
            id: 'create.i2v.upload.success', 
            defaultMessage: '图片上传成功' 
          })
        );
      
        // 构建请求参数
        const requestData: any = {
        prompt: values.prompt,
        modelCode: selectedModel.modelCode,
        imageUrls: [imageUrl], // 图生视频需要传递图片URL数组
      };

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
      message.error(errorMessage);
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
      <StyledCard>
        <Row gutter={[32, 24]}>
          {/* --- 左侧：控制面板 --- */}
          <Col xs={24} lg={9}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Title level={3} style={{ margin: 0, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SwapOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                    <FormattedMessage id="create.imageToVideo.title" defaultMessage="AI 图生视频" />
                  </Title>
                  <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <VideoCameraOutlined style={{ fontSize: 14 }} />
                    <FormattedMessage 
                      id="create.imageToVideo.subtitle" 
                      defaultMessage="赋予静态图片生命，通过提示词控制运动" 
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
                }}
              >
                {/* 模型选择 */}
                <Form.Item
                  name="modelId"
                  label={
                    <Space>
                      <RobotOutlined style={{ color: '#1890ff' }} />
                      <FormattedMessage id="create.model.select" defaultMessage="选择模型" />
                    </Space>
                  }
                  style={{ marginBottom: 28 }}
                >
                  <Select
                    value={selectedModel?.id}
                    onChange={handleModelChange}
                    placeholder={intl.formatMessage({ 
                      id: 'create.model.select.placeholder', 
                      defaultMessage: '请选择要使用的视频生成模型' 
                    })}
                    loading={modelsLoading}
                    style={{ width: '100%' }}
                    optionLabelProp="label"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    dropdownClassName="model-select-dropdown"
                    className="model-video-select"
                  >
                    {models.map(model => (
                      <Select.Option 
                        key={model.id} 
                        value={model.id}
                        label={
                          <div style={{ width: '100%' }}>
                            {renderModelSelectDisplay(model)}
                          </div>
                        }
                      >
                        {(() => {
                          const coverImage = (model as any).coverImage ? normalizeUrl((model as any).coverImage) : null;
                          const isVideo = coverImage ? isVideoUrl(coverImage) : false;
                          return (
                            <ModelOptionWrapper coverImage={coverImage} isVideo={isVideo}>
                              {isVideo && coverImage && (
                                <video 
                                  className="cover-video"
                                  src={coverImage}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                />
                              )}
                              <div className="model-header">
                                <VideoCameraOutlined style={{ color: '#1890ff', fontSize: 18, flexShrink: 0 }} />
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
                                {model.tokenCost !== null && model.tokenCost !== undefined && (
                                  <div className="model-price">
                                    <span className="model-price-amount">{model.tokenCost}</span>
                                    <span className="model-price-currency">Token</span>
                                    <span className="model-price-unit">
                                      {intl.formatMessage({ 
                                        id: 'create.model.price.perSecond', 
                                        defaultMessage: '/秒' 
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {model.description && (
                                <div className="model-description" style={{ marginTop: 6, paddingLeft: 26 }}>
                                  {model.description}
                                </div>
                              )}
                              <div className="model-bottom-row">
                                {(getModelAspectRatios(model).length > 0 || model.videoAspectResolution) && (
                                  <div className="model-aspect-ratios">
                                    {getModelAspectRatios(model).map((ratio, index) => {
                                      const ratioOption = getAspectRatioOption(ratio, intl);
                                      return (
                                        <AspectRatioTag key={index}>
                                          {ratioOption.icon}
                                          <span>{ratio}</span>
                                        </AspectRatioTag>
                                      );
                                    })}
                                    {model.videoAspectResolution && model.videoAspectResolution.split(',').map((resolution, index) => (
                                      <ResolutionTag key={index}>
                                        {resolution.trim()}
                                      </ResolutionTag>
                                    ))}
                                  </div>
                                )}
                                <DetailButton
                                  className="model-detail-button"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={(e: React.MouseEvent) => handleShowModelDetail(e, model)}
                                >
                                  <FormattedMessage
                                    id="create.model.detail"
                                    defaultMessage="详情"
                                  />
                                </DetailButton>
                              </div>
                            </ModelOptionWrapper>
                          );
                        })()}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* 上传图片区域 */}
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
                    <InputImageContainer>
                      <img src={originalImageUrl} alt="Original" />
                      <OverlayActions className="overlay-actions">
                        <Button 
                          type="primary" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={handleRemoveImage}
                        >
                          <FormattedMessage id="create.i2v.replaceImage" defaultMessage="更换图片" />
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
                      onClick={() => document.getElementById('i2v-upload-input')?.click()}
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
                        <FormattedMessage id="create.i2v.upload.click" defaultMessage="点击或拖拽上传" />
                      </UploadText>
                      <UploadHint $isDark={isDark}>
                        <FormattedMessage id="create.i2v.upload.supportedFormats" defaultMessage="支持 JPG, PNG, WebP" />
                      </UploadHint>
                    </CustomUploadArea>
                  )}
                </Form.Item>

                {/* 提示词输入 */}
                <Form.Item
                  name="prompt"
                  label={
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <EditOutlined style={{ color: '#1890ff' }} />
                        <FormattedMessage id="create.prompt" defaultMessage="运动引导提示词 (Prompt)" />
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

                {/* 视频参数设置 */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
                    const availableRatios = getAvailableAspectRatios();
                    const availableFormats = getAvailableVideoFormats();
                    const hasRatios = availableRatios.length > 0;
                    const hasFormats = availableFormats.length > 0;
                    
                    // 如果两个选项都不支持，则不显示整个Row
                    if (!hasRatios && !hasFormats) {
                      return null;
                    }
                    
                    return (
                      <Row gutter={16} style={{ marginBottom: 20 }}>
                        {hasRatios && (
                          <Col span={hasFormats ? 12 : 24}>
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
                                placeholder={intl.formatMessage({ 
                                  id: 'create.video.ratio.placeholder', 
                                  defaultMessage: '请选择视频比例' 
                                })}
                                allowClear={false}
                              >
                                {availableRatios.map(ratio => (
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
                          <Col span={hasRatios ? 12 : 24}>
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
                                  defaultMessage: '请选择输出格式' 
                                })}
                              >
                                {availableFormats.map(format => (
                                  <Select.Option key={format} value={format}>
                                    {format.toUpperCase()}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                        )}
                      </Row>
                    );
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

                {/* 时长控制 */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.modelId !== currentValues.modelId} noStyle>
                  {() => {
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
                        style={{ marginBottom: 20 }}
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
                                        return `${intl.formatMessage({ 
                                          id: 'create.duration.format', 
                                          defaultMessage: '{duration}s' 
                                        }, { duration })} | ${intl.formatMessage({ 
                                          id: 'create.estimated.price', 
                                          defaultMessage: '预估: {price}' 
                                        }, { price })}`;
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
                        
                        return estimatedPrice ? (
                          <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {intl.formatMessage({ 
                                id: 'create.estimated.price', 
                                defaultMessage: '预估: {price}' 
                              }, { price: estimatedPrice })}
                            </Text>
                          </div>
                        ) : null;
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
      <ModelDetailModal
        open={modelDetailModalVisible}
        onClose={handleCloseModelDetail}
        model={selectedModelForDetail}
      />
    </>
  );
};

export default ImageToVideo;

