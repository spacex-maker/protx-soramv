import { useState, useCallback } from 'react';
import { message } from 'antd';
import instance from '../../../../../../../../api/axios';
import { ImageToVideoNodeData } from '../types';

export const usePromptEnhancement = (
  prompt: string,
  nodeData: ImageToVideoNodeData | null,
  setPrompt: (prompt: string) => void
) => {
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);

  // AI丰富提示词
  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim()) {
      message.warning('请先输入基础提示词');
      return;
    }

    setEnhancingPrompt(true);
    try {
      if (!originalPrompt || originalPrompt !== prompt.trim()) {
        setOriginalPrompt(prompt.trim());
      }

      const response = await instance.post('/productx/sa-ai-models/prompt/enhance', {
        basePrompt: prompt.trim(),
        language: 'zh',
        scene: 'video',
      });

      if (response.data.success && response.data.data) {
        const enhancedPrompt = typeof response.data.data === 'string' 
          ? response.data.data 
          : response.data.data.prompt || response.data.data;
        
        if (enhancedPrompt) {
          setPrompt(enhancedPrompt);
          if (nodeData) {
            nodeData.prompt = enhancedPrompt;
          }
          message.success('提示词丰富成功！');
        } else {
          message.warning('未生成丰富后的提示词，请重试');
        }
      } else {
        message.error(response.data.message || '提示词丰富失败，请重试');
      }
    } catch (error: any) {
      console.error('丰富提示词失败:', error);
      message.error(error.response?.data?.message || '提示词丰富失败，请重试');
    } finally {
      setEnhancingPrompt(false);
    }
  }, [prompt, originalPrompt, nodeData, setPrompt]);

  const handleRestorePrompt = useCallback(() => {
    if (originalPrompt !== null) {
      setPrompt(originalPrompt);
      if (nodeData) {
        nodeData.prompt = originalPrompt;
      }
      message.success('已恢复到原始提示词');
    }
  }, [originalPrompt, nodeData, setPrompt]);

  return {
    enhancingPrompt,
    originalPrompt,
    handleEnhancePrompt,
    handleRestorePrompt,
  };
};

