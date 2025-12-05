import { useState, useEffect } from 'react';
import { message } from 'antd';
import instance from '../../../../../../../../api/axios';
import { Model } from '../../../../ImageToVideo/types';
import { getModelAspectRatios } from '../../../../ImageToVideo/utils';
import { ImageToVideoNodeData } from '../types';

export const useModels = (
  nodeData: ImageToVideoNodeData | null,
  aspectRatio: string,
  setAspectRatio: (ratio: string) => void
) => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);

  // 加载模型列表
  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
          params: { modelType: 'i2v' }
        });
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          setModels(response.data.data);
          const firstModel = response.data.data[0];
          setSelectedModel(firstModel);
          if (nodeData) {
            nodeData.modelId = firstModel.id;
          }
          // 更新表单参数
          const supportedRatios = getModelAspectRatios(firstModel);
          if (supportedRatios.length > 0 && !aspectRatio) {
            setAspectRatio(supportedRatios[0]);
            if (nodeData) nodeData.aspectRatio = supportedRatios[0];
          }
        }
      } catch (error) {
        console.error('加载模型列表失败:', error);
        message.error('加载模型列表失败');
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, []);

  return {
    models,
    selectedModel,
    setSelectedModel,
    modelsLoading,
  };
};

