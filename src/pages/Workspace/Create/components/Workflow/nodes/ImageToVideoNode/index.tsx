import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Select, Button, Spin, message } from 'antd';
import { DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Model } from '../../../ImageToVideo/types';
import { getModelAspectRatios, getModelDurationOptions } from '../../../ImageToVideo/utils';
import { ImageToVideoNodeData, TaskItem } from './types';
import { useImageFromNode } from './hooks/useImageFromNode';
import { usePromptFromNode } from './hooks/usePromptFromNode';
import { useModels } from './hooks/useModels';
import { useFileUpload } from './hooks/useFileUpload';
import { usePromptEnhancement } from './hooks/usePromptEnhancement';
import { useVideoGeneration } from './hooks/useVideoGeneration';
import { useVideoCardResize } from './hooks/useVideoCardResize';
import { NodeHeader } from './components/NodeHeader';
import { ImageUpload } from './components/ImageUpload';
import { PromptInput } from './components/PromptInput';
import { VideoParams } from './components/VideoParams';
import { TaskCard } from './components/TaskCard';
import { VideoPreview } from './components/VideoPreview';
import {
  NodeContainer,
  DeleteButtonWrapper,
  DeleteButton,
  NodeContent,
  Label,
  StyledSelect,
  StyledHandle,
  BottomLabel,
  GenerateButton,
  VideoPreviewSection,
} from './styles';

const { Option } = Select;

const ImageToVideoNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as ImageToVideoNodeData;
  const { deleteElements, getEdges } = useReactFlow();
  
  const [prompt, setPrompt] = useState(nodeData?.prompt || '');
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(() => {
    return nodeData?.imageUrl || null;
  });
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(nodeData?.imageFile || null);
  const [aspectRatio, setAspectRatio] = useState(nodeData?.aspectRatio || '');
  const [duration, setDuration] = useState(nodeData?.duration || 8);
  const [videoFormat, setVideoFormat] = useState(nodeData?.videoFormat || '');
  const [videoSupportStyle, setVideoSupportStyle] = useState(nodeData?.videoSupportStyle || '');
  const [videoQuality, setVideoQuality] = useState(nodeData?.videoQuality || '');
  const [generatedVideo, setGeneratedVideo] = useState(nodeData?.generatedVideo || null);
  
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 使用自定义 hooks
  const { models, selectedModel, setSelectedModel, modelsLoading } = useModels(nodeData, aspectRatio, setAspectRatio);
  
  useImageFromNode(
    id,
    nodeData,
    originalImageUrl,
    originalImageFile,
    setOriginalImageUrl,
    setOriginalImageFile
  );

  usePromptFromNode(nodeData, prompt, setPrompt);

  const {
    isDragging,
    handleFileSelect,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileUpload(nodeData, setOriginalImageUrl, setOriginalImageFile);

  const {
    enhancingPrompt,
    originalPrompt,
    handleEnhancePrompt,
    handleRestorePrompt,
  } = usePromptEnhancement(prompt, nodeData, setPrompt);

  const {
    generating,
    waitingTasks,
    handleGenerate,
  } = useVideoGeneration(
    prompt,
    selectedModel,
    originalImageUrl,
    originalImageFile,
    aspectRatio,
    duration,
    videoFormat,
    videoSupportStyle,
    videoQuality,
    nodeData,
    setGeneratedVideo
  );

  const {
    videoCardSize,
    isResizing,
    videoCardRef,
    handleResizeStart,
  } = useVideoCardResize();

  // 根据模型更新参数
  const updateFormByModel = useCallback((model: Model | null) => {
    if (!model) return;

    // 设置视频比例
    const supportedRatios = getModelAspectRatios(model);
    if (supportedRatios.length > 0) {
      if (!supportedRatios.includes(aspectRatio)) {
        setAspectRatio(supportedRatios[0]);
        if (nodeData) nodeData.aspectRatio = supportedRatios[0];
      }
    }

    // 设置视频时长
    const durationOptions = getModelDurationOptions(model);
    if (durationOptions === null) {
      if (model.videoDuration) {
        if (duration > model.videoDuration) {
          setDuration(model.videoDuration);
          if (nodeData) nodeData.duration = model.videoDuration;
        } else if (duration < 4) {
          setDuration(4);
          if (nodeData) nodeData.duration = 4;
        }
      }
    } else if (durationOptions.length > 0) {
      if (!durationOptions.includes(duration)) {
        setDuration(durationOptions[0]);
        if (nodeData) nodeData.duration = durationOptions[0];
      }
    }

    // 设置视频格式
    if (model.videoFormats) {
      const formats = model.videoFormats.split(',').map(f => f.trim());
      if (formats.length > 0) {
        if (!videoFormat || !formats.includes(videoFormat)) {
          setVideoFormat(formats[0]);
          if (nodeData) nodeData.videoFormat = formats[0];
        }
      }
    } else {
      if (videoFormat) {
        setVideoFormat('');
        if (nodeData) nodeData.videoFormat = '';
      }
    }

    // 设置视频风格
    if (model.videoSupportStyle) {
      const styles = model.videoSupportStyle.split(',').map(s => s.trim()).filter(s => s);
      if (styles.length > 0) {
        if (!videoSupportStyle || !styles.includes(videoSupportStyle)) {
          setVideoSupportStyle(styles[0]);
          if (nodeData) nodeData.videoSupportStyle = styles[0];
        }
      }
    } else {
      if (videoSupportStyle) {
        setVideoSupportStyle('');
        if (nodeData) nodeData.videoSupportStyle = '';
      }
    }

    // 设置视频质量
    if (model.videoQuality) {
      const qualities = model.videoQuality.split(',').map(q => q.trim()).filter(q => q);
      if (qualities.length > 0) {
        if (!videoQuality || !qualities.includes(videoQuality)) {
          setVideoQuality(qualities[0]);
          if (nodeData) nodeData.videoQuality = qualities[0];
        }
      }
    } else {
      if (videoQuality) {
        setVideoQuality('');
        if (nodeData) nodeData.videoQuality = '';
      }
    }
  }, [aspectRatio, duration, videoFormat, videoSupportStyle, videoQuality, nodeData]);

  const handleModelChange = useCallback((value: unknown) => {
    const modelId = value as number;
    const model = models.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      if (nodeData) {
        nodeData.modelId = modelId;
      }
      updateFormByModel(model);
    }
  }, [models, nodeData, setSelectedModel, updateFormByModel]);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    if (nodeData) {
      nodeData.prompt = value;
    }
  }, [nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  const handleDeleteImage = useCallback(() => {
    // 断开与上游节点的连线
    const edges = getEdges();
    const incomingEdges = edges.filter(edge => edge.target === id);
    if (incomingEdges.length > 0) {
      deleteElements({ edges: incomingEdges });
    }
    
    // 清除图片
    setOriginalImageUrl(null);
    setOriginalImageFile(null);
    if (nodeData) {
      nodeData.imageUrl = undefined;
      nodeData.imageFile = undefined;
    }
  }, [id, getEdges, deleteElements, nodeData]);

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.prompt = prompt;
      nodeData.imageUrl = originalImageUrl || undefined;
      nodeData.aspectRatio = aspectRatio;
      nodeData.duration = duration;
      nodeData.videoFormat = videoFormat;
      nodeData.videoSupportStyle = videoSupportStyle;
      nodeData.videoQuality = videoQuality;
      nodeData.generatedVideo = generatedVideo;
    }
  }, [prompt, originalImageUrl, aspectRatio, duration, videoFormat, videoSupportStyle, videoQuality, generatedVideo, nodeData]);

  // 清理
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#1890ff' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader nodeData={nodeData} />
      
      <NodeContent>
        <ImageUpload
          id={id}
          originalImageUrl={originalImageUrl}
          isDragging={isDragging}
          nodeData={nodeData}
          onFileSelect={handleFileSelect}
          onDelete={handleDeleteImage}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileInputChange={handleFileInputChange}
        />

        <PromptInput
          prompt={prompt}
          originalPrompt={originalPrompt}
          enhancingPrompt={enhancingPrompt}
          onPromptChange={handlePromptChange}
          onEnhancePrompt={handleEnhancePrompt}
          onRestorePrompt={handleRestorePrompt}
        />

        <div style={{ marginBottom: 12 }}>
          <Label>模型</Label>
          <Spin spinning={modelsLoading}>
            <StyledSelect
              value={selectedModel?.id}
              onChange={handleModelChange}
              className="nodrag"
              popupClassName="nodrag"
              placeholder="选择模型"
            >
              {models.map((model) => (
                <Option key={model.id} value={model.id}>
                  {model.modelName}
                </Option>
              ))}
            </StyledSelect>
          </Spin>
        </div>

        <VideoParams
          selectedModel={selectedModel}
          aspectRatio={aspectRatio}
          duration={duration}
          videoFormat={videoFormat}
          videoSupportStyle={videoSupportStyle}
          videoQuality={videoQuality}
          nodeData={nodeData}
          onAspectRatioChange={(value) => {
            setAspectRatio(value);
            if (nodeData) nodeData.aspectRatio = value;
          }}
          onDurationChange={(value) => {
            setDuration(value);
            if (nodeData) nodeData.duration = value;
          }}
          onVideoFormatChange={(value) => {
            setVideoFormat(value);
            if (nodeData) nodeData.videoFormat = value;
          }}
          onVideoSupportStyleChange={(value) => {
            setVideoSupportStyle(value);
            if (nodeData) nodeData.videoSupportStyle = value;
          }}
          onVideoQualityChange={(value) => {
            setVideoQuality(value);
            if (nodeData) nodeData.videoQuality = value;
          }}
        />
      </NodeContent>
      
      <GenerateButton
        type="primary"
        icon={<ThunderboltOutlined />}
        loading={generating}
        onClick={handleGenerate}
        className="nodrag"
      >
        {generating ? '正在生成...' : '立即生成'}
      </GenerateButton>
      
      <StyledHandle type="source" position={Position.Right} />
      
      {nodeData?.label || nodeData?.nodeConfig?.nodeName ? (
        <BottomLabel>
          {nodeData?.label || nodeData?.nodeConfig?.nodeName}
        </BottomLabel>
      ) : null}
      
      <DeleteButtonWrapper>
        <DeleteButton
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          size="small"
        />
      </DeleteButtonWrapper>

      {/* 显示任务状态卡片和视频卡片 */}
      {(waitingTasks.length > 0 || generatedVideo) && (
        <VideoPreviewSection>
          {/* 显示进行中的任务卡片 */}
          {waitingTasks.map((task, index) => {
            const cardCenter = index * 128 + 60;
            // 确保 taskId 存在且唯一，如果不存在则使用 index
            const taskKey = task.taskId || `task-${index}-${Date.now()}`;
            
            return (
              <React.Fragment key={taskKey}>
                <TaskCard 
                  task={task}
                  index={index}
                  totalTasks={waitingTasks.length}
                />
                {/* 为每个任务卡片添加 Handle */}
                <StyledHandle
                  type="source"
                  position={Position.Right}
                  id={`${id}-task-${taskKey}`}
                  style={{
                    left: 'calc(100% + 8px + 200px - 12px)',
                    top: `${cardCenter}px`,
                    transform: 'translateY(-50%)',
                    zIndex: 10000,
                    pointerEvents: 'auto',
                  }}
                />
              </React.Fragment>
            );
          })}
          
          <VideoPreview
            id={id}
            waitingTasks={waitingTasks}
            generatedVideo={generatedVideo}
            videoCardSize={videoCardSize}
            videoCardRef={videoCardRef}
            isResizing={isResizing}
            onResizeStart={handleResizeStart}
          />
        </VideoPreviewSection>
      )}
    </NodeContainer>
  );
};

export default React.memo(ImageToVideoNode);

