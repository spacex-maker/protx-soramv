import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Select, InputNumber, Input, Button, Tag, message, Spin, Image } from 'antd';
import { DeleteOutlined, PictureOutlined, BulbOutlined, ThunderboltOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import styled from 'styled-components';
import { useLocale } from 'contexts/LocaleContext';
import instance from '../../../../../../api/axios';

const { Option } = Select;
const { TextArea } = Input;

// 规范化图片数据
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

const NodeContainer = styled.div`
  min-width: 420px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 20px;
  overflow: visible;
  transition: border-color 0.2s;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#9254de' : '#9254de'};
  }
`;

const DeleteButtonWrapper = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${NodeContainer}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled(Button)`
  width: 100%;
  height: 100%;
  min-width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ff4d4f;
  border: 1px solid #fff;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.2s, transform 0.2s;
  
  &:hover {
    background: #ff7875;
    transform: scale(1.1);
  }
  
  .anticon {
    font-size: 12px;
  }
`;

const NodeHeader = styled.div`
  padding: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e8e8e8'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NodeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const NodeIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9254de;
  font-size: 20px;
`;

const NodeName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
`;

const NodeTag = styled(Tag)`
  margin: 0;
  font-size: 10px;
  padding: 2px 6px;
`;

const CostInfo = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-top: 4px;
`;

const NodeContent = styled.div`
  padding: 12px;
  max-height: 500px;
  overflow-y: auto;
  
  input, textarea, select, button, .ant-select, .ant-input-number {
    pointer-events: auto;
  }
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
    border-radius: 10px;
    transition: background 0.2s;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    }
  }
  
  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'} transparent;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-bottom: 8px;
  font-weight: 500;
`;

const StyledSelect = styled(Select)`
  width: 100%;
  border-radius: 12px;
  
  .ant-select-selector {
    border: none !important;
    border-radius: 12px !important;
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'} !important;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  }
  
  &:hover .ant-select-selector {
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'} !important;
  }
  
  &.ant-select-focused .ant-select-selector {
    box-shadow: 0 0 0 2px rgba(146, 84, 222, 0.2) !important;
  }
`;

const StyledInputNumber = styled(InputNumber)`
  width: 100%;
  border-radius: 12px;
  border: none;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  
  .ant-input-number-input {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  }
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  }
  
  &.ant-input-number-focused {
    box-shadow: 0 0 0 2px rgba(146, 84, 222, 0.2);
  }
`;

const StyledTextArea = styled(TextArea)`
  border: none;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  
  &:focus {
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
    box-shadow: 0 0 0 2px rgba(146, 84, 222, 0.2);
  }
  
  &::placeholder {
    color: ${props => props.theme.mode === 'dark' ? '#666' : '#bfbfbf'};
  }
`;

const SizeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const StyledHandle = styled(Handle)`
  width: 20px;
  height: 20px;
  background: #9254de;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  z-index: 100 !important;
  pointer-events: auto !important;
  cursor: crosshair;
  
  &.react-flow__handle-right {
    right: -6px;
  }
  
  &.react-flow__handle-left {
    left: -6px;
  }
`;

const BottomLabel = styled.div`
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 10px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#999'};
  pointer-events: none;
  user-select: none;
`;

const GenerateButton = styled(Button)`
  position: absolute;
  bottom: -56px;
  left: 12px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 5;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .anticon {
    font-size: 16px;
  }
`;

const ImagePreviewSection = styled.div`
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
`;

const ImageCard = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  /* 确保卡片本身不阻挡 Handle 的点击 */
  pointer-events: none;
  
  &:hover {
    border-color: #9254de;
    box-shadow: 0 4px 12px rgba(146, 84, 222, 0.3);
    transform: translateX(2px);
  }
  
  .ant-image {
    width: 100%;
    height: 100%;
    pointer-events: auto;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  pointer-events: auto;
`;

const ImageCount = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-top: 4px;
  text-align: center;
`;

interface ModelFamily {
  id: number;
  modelCode: string;
  modelName: string;
  description?: string;
}

interface StyleModel {
  id: number;
  modelCode: string;
  modelName: string;
  description?: string;
  iconUrl?: string;
}

interface StableDiffusionXLNodeData {
  label?: string;
  prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  sampler_name?: string;
  negative_prompt?: string;
  familyId?: number;
  modelCode?: string;
  batch_size?: number;
  n_iter?: number;
  generatedImages?: any[];
  nodeKey?: string;
  nodeConfig?: any;
}

const StableDiffusionXLNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as StableDiffusionXLNodeData;
  const { deleteElements, getNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const { locale } = useLocale();
  const [prompt, setPrompt] = useState(nodeData?.prompt || '');
  const [width, setWidth] = useState(nodeData?.width || 1024);
  const [height, setHeight] = useState(nodeData?.height || 1024);
  const [steps, setSteps] = useState(nodeData?.steps || 30);
  const [cfgScale, setCfgScale] = useState(nodeData?.cfg_scale ?? 7.0);
  const [samplerName, setSamplerName] = useState(nodeData?.sampler_name || 'DPM++ 2M Karras');
  const [negativePrompt, setNegativePrompt] = useState(nodeData?.negative_prompt || 'blurry, low quality, distortion, ugly');
  const [batchSize, setBatchSize] = useState(nodeData?.batch_size || 1);
  const [nIter, setNIter] = useState(nodeData?.n_iter || 1);
  
  // 模型相关状态
  const [modelFamilies, setModelFamilies] = useState<ModelFamily[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | undefined>(nodeData?.familyId);
  const [styleModels, setStyleModels] = useState<StyleModel[]>([]);
  const [selectedModelCode, setSelectedModelCode] = useState<string | undefined>(nodeData?.modelCode);
  const [loadingModels, setLoadingModels] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>(() => {
    // 从节点数据初始化生成的图片
    if (nodeData?.generatedImages && Array.isArray(nodeData.generatedImages)) {
      return nodeData.generatedImages
        .map((img: any) => normalizeImageData(img))
        .filter((url: string | null): url is string => Boolean(url));
    }
    return [];
  });

  // 从上游节点获取提示词
  useEffect(() => {
    const nodes = getNodes();
    const connectedNodes = nodes.filter(node => {
      // 查找连接到当前节点的 input_prompt 节点
      return node.type === 'input_prompt' && node.data;
    });
    
    if (connectedNodes.length > 0) {
      const promptNode = connectedNodes[0];
      const promptText = (promptNode.data?.text as string) || '';
      if (promptText && typeof promptText === 'string' && promptText !== prompt) {
        setPrompt(promptText);
        if (nodeData) {
          nodeData.prompt = promptText;
        }
      }
    }
  }, [getNodes, nodeData]);

  // 同步节点数据中的生成图片
  useEffect(() => {
    if (nodeData?.generatedImages && Array.isArray(nodeData.generatedImages)) {
      const imageUrls = nodeData.generatedImages
        .map((img: any) => normalizeImageData(img))
        .filter((url: string | null): url is string => Boolean(url));
      
      if (imageUrls.length > 0 && JSON.stringify(imageUrls) !== JSON.stringify(generatedImages)) {
        setGeneratedImages(imageUrls);
        // 通知 React Flow 节点内部结构已变化
        setTimeout(() => {
          updateNodeInternals(id);
        }, 100);
      }
    }
  }, [nodeData?.generatedImages, generatedImages, id, updateNodeInternals]);
  
  // 当生成的图片数量变化时，更新节点内部结构
  // 使用 useLayoutEffect 确保在 DOM 更新后立即更新节点
  useLayoutEffect(() => {
    if (generatedImages.length > 0) {
      // 使用 requestAnimationFrame 确保在浏览器下一次重绘前更新
      requestAnimationFrame(() => {
        updateNodeInternals(id);
      });
    }
  }, [generatedImages.length, id, updateNodeInternals]);

  // 加载模型家族列表
  useEffect(() => {
    const fetchModelFamilies = async () => {
      setLoadingModels(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/image/families', { params: { lang: locale || 'en' } });
        if (response.data.success && response.data.data) {
          setModelFamilies(response.data.data);
          if (response.data.data.length > 0 && !selectedFamilyId) {
            const firstFamily = response.data.data[0];
            setSelectedFamilyId(firstFamily.id);
            if (nodeData) {
              nodeData.familyId = firstFamily.id;
            }
            // 加载该家族下的风格模型
            if (firstFamily.modelCode) {
              fetchStyleModels(firstFamily.modelCode, firstFamily.id);
            }
          } else if (selectedFamilyId) {
            // 如果已有选中的家族，加载其风格模型
            const family = response.data.data.find((f: ModelFamily) => f.id === selectedFamilyId);
            if (family?.modelCode) {
              fetchStyleModels(family.modelCode, family.id);
            }
          }
        }
      } catch (error) {
        console.error('加载模型家族失败:', error);
        message.error('加载模型列表失败');
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModelFamilies();
  }, []);

  // 加载风格模型列表
  const fetchStyleModels = async (parentModelCode: string, familyId: number) => {
    try {
      const response = await instance.get(
        '/productx/sa-ai-models/image/models/by-family',
        {
          params: { parentModelCode },
        }
      );
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const styleModelsList = response.data.data.map((item: any) => ({
          id: item.id,
          modelName: item.modelName,
          modelCode: item.modelCode,
          description: item.description,
        }));
        setStyleModels(styleModelsList);
        if (styleModelsList.length > 0 && !selectedModelCode) {
          const firstModel = styleModelsList[0];
          setSelectedModelCode(firstModel.modelCode);
          if (nodeData) {
            nodeData.modelCode = firstModel.modelCode;
          }
        }
      } else {
        // 查不到艺术风格时，清空选中的模型
        setStyleModels([]);
        setSelectedModelCode(undefined);
        if (nodeData) {
          nodeData.modelCode = undefined;
        }
      }
    } catch (error) {
      console.error('加载风格模型失败:', error);
      // 出错时也清空
      setStyleModels([]);
      setSelectedModelCode(undefined);
      if (nodeData) {
        nodeData.modelCode = undefined;
      }
    }
  };

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      nodeData.prompt = prompt;
      nodeData.width = width;
      nodeData.height = height;
      nodeData.steps = steps;
      nodeData.cfg_scale = cfgScale;
      nodeData.sampler_name = samplerName;
      nodeData.negative_prompt = negativePrompt;
      nodeData.batch_size = batchSize;
      nodeData.n_iter = nIter;
      nodeData.familyId = selectedFamilyId;
      nodeData.modelCode = selectedModelCode;
    }
  }, [prompt, width, height, steps, cfgScale, samplerName, negativePrompt, batchSize, nIter, selectedFamilyId, selectedModelCode, nodeData]);

  const handleWidthChange = useCallback((value: number | string | null) => {
    const newWidth = typeof value === 'number' ? (value || 1024) : (typeof value === 'string' ? parseInt(value) || 1024 : 1024);
    const clampedWidth = Math.max(256, Math.min(2048, newWidth));
    setWidth(clampedWidth);
    if (nodeData) {
      nodeData.width = clampedWidth;
    }
  }, [nodeData]);

  const handleHeightChange = useCallback((value: number | string | null) => {
    const newHeight = typeof value === 'number' ? (value || 1024) : (typeof value === 'string' ? parseInt(value) || 1024 : 1024);
    const clampedHeight = Math.max(256, Math.min(2048, newHeight));
    setHeight(clampedHeight);
    if (nodeData) {
      nodeData.height = clampedHeight;
    }
  }, [nodeData]);

  const handleStepsChange = useCallback((value: number | string | null) => {
    const newSteps = typeof value === 'number' ? (value || 30) : (typeof value === 'string' ? parseInt(value) || 30 : 30);
    const clampedSteps = Math.max(1, Math.min(150, newSteps));
    setSteps(clampedSteps);
    if (nodeData) {
      nodeData.steps = clampedSteps;
    }
  }, [nodeData]);

  const handleCfgScaleChange = useCallback((value: number | string | null) => {
    const newCfgScale = typeof value === 'number' ? (value || 7.0) : (typeof value === 'string' ? parseFloat(value) || 7.0 : 7.0);
    const clampedCfgScale = Math.max(1, Math.min(30, newCfgScale));
    setCfgScale(clampedCfgScale);
    if (nodeData) {
      nodeData.cfg_scale = clampedCfgScale;
    }
  }, [nodeData]);

  const handleSamplerNameChange = useCallback((value: unknown) => {
    const samplerValue = value as string;
    setSamplerName(samplerValue);
    if (nodeData) {
      nodeData.sampler_name = samplerValue;
    }
  }, [nodeData]);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    if (nodeData) {
      nodeData.prompt = value;
    }
  }, [nodeData]);

  const handleNegativePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNegativePrompt(value);
    if (nodeData) {
      nodeData.negative_prompt = value;
    }
  }, [nodeData]);

  const handleFamilyChange = useCallback((value: unknown) => {
    const familyId = value as number;
    setSelectedFamilyId(familyId);
    // 切换家族时先清空选中的模型
    setSelectedModelCode(undefined);
    if (nodeData) {
      nodeData.familyId = familyId;
      nodeData.modelCode = undefined;
    }
    // 加载该家族下的风格模型
    const family = modelFamilies.find(f => f.id === familyId);
    if (family?.modelCode) {
      fetchStyleModels(family.modelCode, familyId);
    } else {
      // 如果没有 modelCode，直接清空风格模型列表
      setStyleModels([]);
    }
  }, [nodeData, modelFamilies]);

  const handleModelChange = useCallback((value: unknown) => {
    const modelCode = value as string;
    setSelectedModelCode(modelCode);
    if (nodeData) {
      nodeData.modelCode = modelCode;
    }
  }, [nodeData]);

  const handleBatchSizeChange = useCallback((value: number | string | null) => {
    const newBatchSize = typeof value === 'number' ? (value || 1) : (typeof value === 'string' ? parseInt(value) || 1 : 1);
    const clampedBatchSize = Math.max(1, Math.min(8, newBatchSize));
    setBatchSize(clampedBatchSize);
    if (nodeData) {
      nodeData.batch_size = clampedBatchSize;
    }
  }, [nodeData]);

  const handleNIterChange = useCallback((value: number | string | null) => {
    const newNIter = typeof value === 'number' ? (value || 1) : (typeof value === 'string' ? parseInt(value) || 1 : 1);
    const clampedNIter = Math.max(1, Math.min(10, newNIter));
    setNIter(clampedNIter);
    if (nodeData) {
      nodeData.n_iter = clampedNIter;
    }
  }, [nodeData]);

  // AI生成提示词
  const handleGeneratePrompt = useCallback(async () => {
    setGeneratingPrompt(true);
    try {
      const requestData: any = {
        language: 'zh',
      };
      
      if (prompt.trim()) {
        requestData.basePrompt = prompt.trim();
      }
      
      const response = await instance.post('/productx/sa-ai-models/image/prompt/generate', requestData);

      if (response.data.success && response.data.data) {
        const generatedPrompt = 
          typeof response.data.data === 'string' 
            ? response.data.data 
            : response.data.data.prompt || response.data.data;
        
        if (generatedPrompt) {
          setPrompt(generatedPrompt);
          if (nodeData) {
            nodeData.prompt = generatedPrompt;
          }
          message.success('提示词生成成功！');
        } else {
          message.warning('未生成提示词，请重试');
        }
      } else {
        message.error(response.data.message || '提示词生成失败，请重试');
      }
    } catch (error: any) {
      console.error('生成提示词失败:', error);
      message.error(
        error.response?.data?.message || '提示词生成失败，请重试'
      );
    } finally {
      setGeneratingPrompt(false);
    }
  }, [prompt, nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  // 生成图片
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词');
      return;
    }

    const selectedFamily = modelFamilies.find(f => f.id === selectedFamilyId);
    if (!selectedFamily) {
      message.warning('请选择模型家族');
      return;
    }

    setGenerating(true);

    try {
      // 构建请求参数
      const requestData: any = {
        prompt: prompt.trim(),
      };

      // 添加风格模型（如果选择了）
      if (selectedModelCode) {
        requestData.modelCode = selectedModelCode;
      }

      // 添加模型检查点（使用模型家族的 modelCode）
      if (selectedFamily.modelCode) {
        requestData.sdModelCheckpoint = selectedFamily.modelCode;
      }

      // 添加反向提示词
      if (negativePrompt.trim()) {
        requestData.negativePrompt = negativePrompt.trim();
      }

      // 添加尺寸
      requestData.width = width;
      requestData.height = height;

      // 添加采样步数
      requestData.steps = steps;

      // 添加 CFG Scale
      requestData.cfgScale = cfgScale;

      // 添加采样器
      requestData.samplerName = samplerName;

      // 添加批次大小
      if (batchSize > 1) {
        requestData.batchSize = batchSize;
      }

      // 添加迭代次数
      if (nIter > 1) {
        requestData.nIter = nIter;
      }

      console.log('Generating image with params:', requestData);

      // 调用 API，设置超时时间为 15 分钟
      const response = await instance.post(
        '/productx/sa-ai-models/image/generate/text',
        requestData,
        {
          timeout: 900000, // 15 分钟超时
        }
      );

      if (response.data && response.data.success !== false) {
        // 处理返回的图片数据
        const images = response.data.images || response.data.data?.images || [];

        if (images && images.length > 0) {
          // 规范化图片数据
          const imageUrls = images
            .map((img: any) => normalizeImageData(img))
            .filter((url: string | null): url is string => Boolean(url));
          
          setGeneratedImages(imageUrls);
          
          // 将生成的图片保存到节点数据中
          if (nodeData) {
            nodeData.generatedImages = imageUrls;
          }
          
          // 通知 React Flow 节点内部结构已变化，需要更新 Handle 位置
          // 使用 requestAnimationFrame 确保在浏览器下一次重绘前更新
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              updateNodeInternals(id);
            });
          });
          
          message.success(`生成成功！共生成 ${imageUrls.length} 张图片`);
        } else {
          const errorMsg = response.data.error || response.data.message;
          if (errorMsg) {
            message.error(errorMsg);
          } else {
            message.warning('未生成图片，请重试');
          }
        }
      } else {
        const errorMsg = response.data?.error || response.data?.message || '生成失败，请重试';
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error('生成图片失败:', error);
      message.error(
        error.response?.data?.message || error.message || '生成图片失败，请重试'
      );
    } finally {
      setGenerating(false);
    }
  }, [
    prompt,
    negativePrompt,
    selectedFamilyId,
    selectedModelCode,
    modelFamilies,
    width,
    height,
    steps,
    cfgScale,
    samplerName,
    batchSize,
    nIter,
    nodeData,
  ]);

  const baseCost = nodeData?.nodeConfig?.baseCost || 5;
  const pricingMode = nodeData?.nodeConfig?.pricingMode || 'FIXED';

  // 预设尺寸选项
  const presetSizes = [
    { label: '1024x1024', width: 1024, height: 1024 },
    { label: '1024x768', width: 1024, height: 768 },
    { label: '768x1024', width: 768, height: 1024 },
    { label: '1280x720', width: 1280, height: 720 },
    { label: '720x1280', width: 720, height: 1280 },
  ];

  const handlePresetSize = useCallback((preset: { width: number; height: number }) => {
    setWidth(preset.width);
    setHeight(preset.height);
    if (nodeData) {
      nodeData.width = preset.width;
      nodeData.height = preset.height;
    }
  }, [nodeData]);

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#9254de' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeHeader>
        <NodeTitle>
          <NodeIcon>
            <PictureOutlined />
          </NodeIcon>
          <div>
            <NodeName>Stable Diffusion XL</NodeName>
            <CostInfo>
              {pricingMode === 'FIXED' ? `固定: ${baseCost}/张` : `基础: ${baseCost}`}
            </CostInfo>
          </div>
        </NodeTitle>
        {nodeData?.nodeConfig?.tag && (
          <NodeTag color="purple">{nodeData.nodeConfig.tag}</NodeTag>
        )}
      </NodeHeader>
      
      <NodeContent>
        <div style={{ marginBottom: 12 }}>
          <Label style={{ marginBottom: 8 }}>
            <span>提示词</span>
            <Button
              type="text"
              size="small"
              icon={<BulbOutlined />}
              loading={generatingPrompt}
              onClick={handleGeneratePrompt}
              className="nodrag"
              style={{ 
                float: 'right',
                fontSize: 12,
                height: 28,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                marginTop: -2,
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
              {prompt.trim() ? 'AI 丰富提示词' : 'AI 生成提示词'}
            </Button>
          </Label>
          <StyledTextArea
            value={prompt}
            onChange={handlePromptChange}
            placeholder="输入你的创意描述...（可从上游提示词节点获取）"
            rows={2}
            maxLength={500}
            showCount
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="nodrag"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <Label>模型家族</Label>
          <Spin spinning={loadingModels}>
            <StyledSelect
              value={selectedFamilyId}
              onChange={handleFamilyChange}
              className="nodrag"
              popupClassName="nodrag"
              placeholder="选择模型家族"
            >
              {modelFamilies.map((family) => (
                <Option key={family.id} value={family.id}>
                  {family.modelName}
                </Option>
              ))}
            </StyledSelect>
          </Spin>
        </div>

        {selectedFamilyId && (
          <div style={{ marginBottom: 12 }}>
            <Label>艺术风格（模型）</Label>
            <StyledSelect
              value={selectedModelCode}
              onChange={handleModelChange}
              className="nodrag"
              popupClassName="nodrag"
              placeholder="选择艺术风格"
            >
              {styleModels.map((model) => (
                <Option key={model.id} value={model.modelCode}>
                  {model.modelName}
                </Option>
              ))}
            </StyledSelect>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <Label>生成数量</Label>
          <SizeRow>
            <div>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>批次大小</div>
              <StyledInputNumber
                value={batchSize}
                onChange={handleBatchSizeChange}
                min={1}
                max={8}
                className="nodrag"
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>迭代次数</div>
              <StyledInputNumber
                value={nIter}
                onChange={handleNIterChange}
                min={1}
                max={10}
                className="nodrag"
              />
            </div>
          </SizeRow>
          <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
            总生成数 = {batchSize} × {nIter} = {batchSize * nIter} 张
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Label>图片尺寸</Label>
          <SizeRow>
            <StyledInputNumber
              value={width}
              onChange={handleWidthChange}
              min={256}
              max={2048}
              step={64}
              placeholder="宽度"
              className="nodrag"
            />
            <StyledInputNumber
              value={height}
              onChange={handleHeightChange}
              min={256}
              max={2048}
              step={64}
              placeholder="高度"
              className="nodrag"
            />
          </SizeRow>
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {presetSizes.map((preset) => (
              <Button
                key={preset.label}
                size="small"
                type={width === preset.width && height === preset.height ? 'primary' : 'default'}
                onClick={() => handlePresetSize(preset)}
                className="nodrag"
                style={{ fontSize: 10, padding: '0 6px', height: 20 }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: 12 }}>
          <Label>采样步数</Label>
          <StyledInputNumber
            value={steps}
            onChange={handleStepsChange}
            min={1}
            max={150}
            className="nodrag"
          />
          <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
            更多步数 = 更高质量，但生成时间更长
          </div>
        </div>
        
        <div style={{ marginBottom: 12 }}>
          <Label>CFG Scale (引导强度)</Label>
          <StyledInputNumber
            value={cfgScale}
            onChange={handleCfgScaleChange}
            min={1}
            max={30}
            step={0.5}
            precision={1}
            className="nodrag"
          />
          <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
            值越高，越遵循提示词（建议 7-9）
          </div>
        </div>
        
        <div style={{ marginBottom: 12 }}>
          <Label>采样器</Label>
          <StyledSelect
            value={samplerName}
            onChange={handleSamplerNameChange}
            className="nodrag"
            popupClassName="nodrag"
          >
            <Option value="DPM++ 2M Karras">DPM++ 2M Karras</Option>
            <Option value="DPM++ SDE Karras">DPM++ SDE Karras</Option>
            <Option value="Euler a">Euler a</Option>
            <Option value="Euler">Euler</Option>
            <Option value="LMS">LMS</Option>
            <Option value="Heun">Heun</Option>
            <Option value="DPM2">DPM2</Option>
            <Option value="DPM2 a">DPM2 a</Option>
            <Option value="DPM++ 2S a">DPM++ 2S a</Option>
            <Option value="DPM++ 2M">DPM++ 2M</Option>
            <Option value="DPM++ SDE">DPM++ SDE</Option>
            <Option value="DPM fast">DPM fast</Option>
            <Option value="DPM adaptive">DPM adaptive</Option>
            <Option value="LMS Karras">LMS Karras</Option>
            <Option value="DDIM">DDIM</Option>
            <Option value="PLMS">PLMS</Option>
            <Option value="UniPC">UniPC</Option>
          </StyledSelect>
        </div>
        
        <div>
          <Label>负面提示词</Label>
          <StyledTextArea
            value={negativePrompt}
            onChange={handleNegativePromptChange}
            placeholder="描述不想要的内容..."
            rows={2}
            maxLength={500}
            showCount
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="nodrag"
          />
        </div>
      </NodeContent>
      
      <GenerateButton
        type="primary"
        icon={<ThunderboltOutlined />}
        loading={generating}
        onClick={handleGenerate}
        className="nodrag"
      >
        {generating ? '正在绘制...' : '立即生成'}
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

      {generatedImages.length > 0 && (
        <>
          <ImagePreviewSection>
            {generatedImages.map((imageUrl, index) => (
              <ImageCard 
                key={index} 
                className="nodrag"
                style={{ 
                  position: 'relative',
                  zIndex: generatedImages.length - index,
                }}
              >
                <ImageWrapper>
                  <Image
                    src={imageUrl}
                    alt={`生成图片 ${index + 1}`}
                    preview={{
                      mask: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <EyeOutlined />
                          <span>预览</span>
                        </div>
                      ),
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </ImageWrapper>
              </ImageCard>
            ))}
          </ImagePreviewSection>
          {generatedImages.map((imageUrl, index) => {
            // 计算每个 Handle 的位置：每个卡片高度120px，间距8px，卡片中心
            // ImagePreviewSection 在节点右侧 8px 处，卡片宽度 120px，Handle 应该在卡片右边缘
            const cardTop = index * 128; // 120px 卡片高度 + 8px 间距
            const cardCenter = cardTop + 60; // 卡片中心位置（卡片高度的一半）
            
            return (
              <StyledHandle
                key={`handle-${index}`}
                type="source"
                position={Position.Right}
                id={`${id}-image-${index}`}
                style={{
                  // 节点宽度 100% + 8px margin + 120px 卡片宽度，Handle 中心在卡片右边缘
                  left: `calc(100% + 8px + 120px - 10px)`, // Handle 宽度 20px，中心偏移 -10px
                  right: 'auto', // 覆盖默认的 right: -6px
                  top: `${cardCenter}px`,
                  transform: 'translateY(-50%)',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                }}
              />
            );
          })}
        </>
      )}
    </NodeContainer>
  );
};

export default React.memo(StableDiffusionXLNode);


