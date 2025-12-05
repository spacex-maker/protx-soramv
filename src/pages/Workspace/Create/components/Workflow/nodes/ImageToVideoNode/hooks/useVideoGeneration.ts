import { useState, useRef, useCallback } from 'react';
import { message } from 'antd';
import instance from '../../../../../../../../api/axios';
import { Model, VideoResult } from '../../../../ImageToVideo/types';
import { getModelAspectRatios } from '../../../../ImageToVideo/utils';
import { uploadImageToServer, urlToFile } from '../utils';
import { ImageToVideoNodeData, TaskItem } from '../types';

export const useVideoGeneration = (
  prompt: string,
  selectedModel: Model | null,
  originalImageUrl: string | null,
  originalImageFile: File | null,
  aspectRatio: string,
  duration: number,
  videoFormat: string,
  videoSupportStyle: string,
  videoQuality: string,
  nodeData: ImageToVideoNodeData | null,
  setGeneratedVideo: (video: VideoResult | null) => void
) => {
  const [generating, setGenerating] = useState(false);
  const [waitingTasks, setWaitingTasks] = useState<TaskItem[]>([]);
  const pollingTasksRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const completedTasksRef = useRef<Set<string>>(new Set());

  // 停止单个任务的轮询
  const stopTaskPolling = useCallback((taskId: string) => {
    const timer = pollingTasksRef.current.get(taskId);
    if (timer) {
      clearInterval(timer);
      pollingTasksRef.current.delete(taskId);
    }
    setWaitingTasks(prev => prev.filter(task => task.taskId !== taskId));
  }, []);

  // 轮询任务状态
  const pollTaskStatus = useCallback(async (taskId: string, aspectRatio: string, duration: number) => {
    if (completedTasksRef.current.has(taskId)) return;
    
    try {
      const response = await instance.get(`/productx/sa-ai-models/video/task/${taskId}/status`);
      
      if (completedTasksRef.current.has(taskId)) return;
      
      if (response.data && response.data.success) {
        const taskData = response.data.data;
        const status = taskData.status;

        // 更新任务状态
        setWaitingTasks(prev => prev.map(task => 
          task.taskId === taskId 
            ? { ...task, status: status === 'queued' ? 'queued' : status === 'processing' ? 'processing' : status === 'completed' || status === 'success' ? 'completed' : 'failed' }
            : task
        ));

        if (status === 'completed' || status === 'success') {
          completedTasksRef.current.add(taskId);
          setGenerating(false);
          
          if (taskData.videoUrl) {
            const videoResult: VideoResult = {
              url: taskData.videoUrl,
              aspectRatio: aspectRatio,
              duration: duration,
              thumbnail: taskData.thumbnail || taskData.thumbnailUrl || '',
            };
            setGeneratedVideo(videoResult);
            if (nodeData) {
              nodeData.generatedVideo = videoResult;
            }
            message.success('视频生成成功');
            
            // 延迟移除任务卡片，让用户看到完成状态
            setTimeout(() => {
              stopTaskPolling(taskId);
            }, 2000);
          } else {
            stopTaskPolling(taskId);
          }
        } else if (status === 'failed' || status === 'error') {
          completedTasksRef.current.add(taskId);
          setGenerating(false);
          message.error(taskData.error || '视频生成失败');
          
          // 延迟移除失败的任务卡片
          setTimeout(() => {
            stopTaskPolling(taskId);
          }, 3000);
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'canceled' || error.code === 'ERR_CANCELED') {
        return;
      }
      console.error('查询任务状态失败:', error);
    }
  }, [nodeData, setGeneratedVideo, stopTaskPolling]);

  // 开始轮询任务状态
  const startPolling = useCallback((taskId: string, aspectRatio: string, duration: number, prompt?: string) => {
    // 验证 taskId 不为空
    if (!taskId || taskId.trim() === '') {
      console.error('taskId 不能为空');
      return;
    }
    
    const existingTask = waitingTasks.find(task => task.taskId === taskId);
    if (existingTask) {
      return;
    }
    
    const newTask: TaskItem = {
      taskId: taskId.trim(), // 确保 taskId 不为空字符串
      modelName: selectedModel?.modelName || '未知模型',
      prompt: prompt || '',
      submitTime: new Date().toLocaleString('zh-CN'),
      aspectRatio,
      duration,
      status: 'queued',
    };
    
    setWaitingTasks(prev => [...prev, newTask]);
    
    pollTaskStatus(taskId, aspectRatio, duration);
    
    const timer = setInterval(() => {
      pollTaskStatus(taskId, aspectRatio, duration);
    }, 3000);
    
    pollingTasksRef.current.set(taskId, timer);
  }, [waitingTasks, selectedModel, pollTaskStatus]);

  // 生成视频
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词');
      return;
    }

    if (!selectedModel) {
      message.warning('请选择模型');
      return;
    }

    if (!originalImageUrl) {
      message.warning('请先上传一张图片作为生成参考或连接一个图片节点');
      return;
    }

    setGenerating(true);

    try {
      let imageUrl: string;
      
      // 判断图片来源：
      // 1. 如果 originalImageFile 存在且是有效的 File，说明是用户手动上传的，需要上传
      // 2. 如果只有 originalImageUrl，说明是从上游节点获取的，直接使用或转换
      // 3. 如果是 base64，需要上传
      
      // 检查 originalImageFile 是否为有效的 File 对象
      const hasValidFile = originalImageFile && originalImageFile instanceof File;
      
      // 调试信息
      console.log('图片生成参数检查:', {
        hasOriginalImageFile: !!originalImageFile,
        isFile: originalImageFile instanceof File,
        hasValidFile,
        hasOriginalImageUrl: !!originalImageUrl,
        originalImageUrlType: originalImageUrl ? typeof originalImageUrl : 'null',
        originalImageUrlPreview: originalImageUrl ? originalImageUrl.substring(0, 50) : 'null'
      });
      
      if (hasValidFile) {
        // 用户手动上传的文件，需要上传
        const uploadingMessage = message.loading({ content: '正在上传图片到云端...', key: 'upload', duration: 0 });
        try {
          imageUrl = await uploadImageToServer(originalImageFile);
          message.destroy('upload');
        } catch (uploadError: any) {
          message.destroy('upload');
          console.error('上传图片失败:', uploadError);
          message.error(uploadError.message || '图片上传失败，请重试');
          setGenerating(false);
          return;
        }
      } else if (originalImageUrl) {
        // 处理来自上游节点的 URL
        if (originalImageUrl.startsWith('data:image')) {
          // base64 图片，需要上传
          const uploadingMessage = message.loading({ content: '正在上传图片到云端...', key: 'upload', duration: 0 });
          try {
            // 将 base64 转换为 File
            const imageFile = await urlToFile(originalImageUrl);
            if (!imageFile || !(imageFile instanceof File)) {
              throw new Error('转换图片文件失败');
            }
            imageUrl = await uploadImageToServer(imageFile);
            message.destroy('upload');
          } catch (uploadError: any) {
            message.destroy('upload');
            console.error('上传图片失败:', uploadError);
            message.error(uploadError.message || '图片上传失败，请重试');
            setGenerating(false);
            return;
          }
        } else if (originalImageUrl.startsWith('http://') || originalImageUrl.startsWith('https://')) {
          // 完整的 HTTP/HTTPS URL，直接使用
          imageUrl = originalImageUrl;
        } else if (originalImageUrl.startsWith('/') || originalImageUrl.startsWith('//')) {
          // 相对路径或协议相对路径，转换为完整 URL
          if (typeof window !== 'undefined') {
            if (originalImageUrl.startsWith('//')) {
              imageUrl = `${window.location.protocol}${originalImageUrl}`;
            } else {
              imageUrl = `${window.location.origin}${originalImageUrl}`;
            }
          } else {
            // 服务端环境，尝试使用原始 URL
            imageUrl = originalImageUrl;
          }
        } else {
          // 其他格式的 URL（可能是 COS URL 或其他），尝试直接使用
          // 如果后端不接受，可能需要先上传
          console.warn('未知格式的图片 URL，尝试直接使用:', originalImageUrl);
          imageUrl = originalImageUrl;
        }
      } else {
        message.error('图片数据无效');
        setGenerating(false);
        return;
      }

      const requestData: any = {
        prompt: prompt.trim(),
        modelCode: selectedModel.modelCode,
        imageUrls: [imageUrl],
      };

      if (aspectRatio) {
        requestData.aspectRatio = aspectRatio;
        const supportedRatios = getModelAspectRatios(selectedModel);
        if (selectedModel.videoAspectResolution) {
          const resolutions = selectedModel.videoAspectResolution.split(',').map(r => r.trim());
          const index = supportedRatios.indexOf(aspectRatio);
          if (index >= 0 && index < resolutions.length) {
            requestData.size = resolutions[index];
          }
        }
      }

      if (duration !== undefined && duration !== null) {
        requestData.seconds = Number(duration);
      }

      if (videoSupportStyle) {
        requestData.videoSupportStyle = videoSupportStyle;
      }

      if (videoQuality) {
        requestData.videoQuality = videoQuality;
      }

      if (videoFormat) {
        requestData.videoFormat = videoFormat;
      }

      const response = await instance.post('/productx/sa-ai-models/video/generate/image', requestData, {
        timeout: 0,
      });

      if (response.data && response.data.success) {
        const result = response.data.data;
        const status = result.status;
        
        if (status === 'queued' && result.id) {
          message.success('视频生成任务已提交，正在排队中...');
          startPolling(
            result.id, 
            aspectRatio || '16:9', 
            duration,
            prompt.trim()
          );
        } else if ((status === 'completed' || status === 'success') && result.videoUrl) {
          const videoResult: VideoResult = {
            url: result.videoUrl,
            aspectRatio: aspectRatio || '16:9',
            duration: duration,
            thumbnail: result.thumbnail || result.thumbnailUrl || '',
          };
          setGeneratedVideo(videoResult);
          if (nodeData) {
            nodeData.generatedVideo = videoResult;
          }
          setGenerating(false);
          message.success('视频生成成功');
        } else if (status === 'failed' || status === 'error') {
          setGenerating(false);
          message.error(result.error || '视频生成失败');
        } else if (result.id) {
          startPolling(
            result.id, 
            aspectRatio || '16:9', 
            duration,
            prompt.trim()
          );
        } else {
          setGenerating(false);
        }
      } else {
        throw new Error(response.data?.message || '视频生成失败');
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'canceled' || error.code === 'ERR_CANCELED') {
        return;
      }
      console.error('视频生成失败:', error);
      message.error(error.response?.data?.message || error.message || '视频生成失败，请重试');
      setGenerating(false);
    }
  }, [prompt, selectedModel, originalImageUrl, originalImageFile, aspectRatio, duration, videoFormat, videoSupportStyle, videoQuality, nodeData, setGeneratedVideo, startPolling]);

  return {
    generating,
    waitingTasks,
    handleGenerate,
    stopTaskPolling,
  };
};

