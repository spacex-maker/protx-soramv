import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { ImageToVideoNodeData } from '../types';

export const usePromptFromNode = (
  nodeData: ImageToVideoNodeData | null,
  prompt: string,
  setPrompt: (prompt: string) => void
) => {
  const { getNodes } = useReactFlow();

  // 从上游节点获取提示词
  useEffect(() => {
    const nodes = getNodes();
    const connectedNodes = nodes.filter(node => {
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
  }, [getNodes, nodeData, prompt, setPrompt]);
};

