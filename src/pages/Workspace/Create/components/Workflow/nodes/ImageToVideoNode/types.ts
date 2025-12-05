import { VideoResult } from '../../../ImageToVideo/types';

// 重新导出 VideoResult 供其他模块使用
export type { VideoResult };

export interface ImageToVideoNodeData {
  label?: string;
  prompt?: string;
  imageUrl?: string;
  imageFile?: File;
  modelId?: number;
  aspectRatio?: string;
  duration?: number;
  videoFormat?: string;
  videoSupportStyle?: string;
  videoQuality?: string;
  generatedVideo?: VideoResult | null;
  nodeKey?: string;
  nodeConfig?: any;
}

export interface TaskItem {
  taskId: string;
  modelName: string;
  prompt: string;
  submitTime: string;
  aspectRatio: string;
  duration: number;
  status?: 'queued' | 'processing' | 'completed' | 'failed';
}

