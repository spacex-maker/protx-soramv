// 模型类型定义

export interface ModelFamily {
  id: number;
  modelName: string;
  modelCode: string;
  description: string;
  imageDefaultResolution: string | null;
  imageMaxResolution: string | null;
  imageAspectRatios: string | null;
  imageFormats: string | null;
  supportControlnet: boolean;
  supportInpaint: boolean;
  supportReference: boolean;
  currency: string | null;
  outputPrice: number | null;
  companyCode: string | null;
  releaseYear: string | null;
  status: boolean;
  coverImage: string | null;
}

export interface Model {
  id: number;
  modelName: string;
  modelCode: string;
  description: string;
  imageDefaultResolution: string | null;
  imageMaxResolution: string | null;
  imageAspectRatios: string | null;
  imageFormats: string | null;
  supportControlnet: boolean;
  supportInpaint: boolean;
  supportReference: boolean;
  currency: string | null;
  outputPrice: number | null;
  coverImage: string | null;
}

// 生成任务记录类型
export interface GenerationTask {
  id: number;
  taskType: string;
  modelName: string;
  modelCode: string;
  status: number; // 0: 处理中, 2: 成功, 3: 失败
  inputType: string;
  outputType: string;
  resultUrls: string[] | null;
  thumbnailUrl: string | null;
  errorMessage: string | null;
  createTime: string;
  updateTime: string;
  startTime: string | null;
  endTime: string | null;
}

export interface GenerationTaskPageResponse {
  records: GenerationTask[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 任务详情类型定义
export interface TaskOutputFile {
  id: number;
  taskId: number;
  fileUrl: string;
  fileType: string;
  extraMetadata: string | null;
  sortOrder: number;
  createTime: string;
  extraMetadataMap: any | null;
}

export interface TaskDetailModel {
  id: number;
  modelName: string;
  modelCode: string;
  modelType: string;
  description: string;
  releaseYear: string;
  coverImage: string;
  imageDefaultResolution: string;
  imageMaxResolution: string;
  imageAspectRatios: string;
  imageFormats: string;
  supportControlnet: boolean;
  supportInpaint: boolean;
  modelLevel: number;
  parentModelCode: string;
  likesCount?: number;
  favoritesCount?: number;
}

export interface TaskDetail {
  taskType: string;
  modelCode: string;
  modelName: string;
  prompt: string;
  status: number;
  inputType: string;
  outputType: string;
  thumbnailUrl: string | null;
  seed: number | null;
  version: string | null;
  creditsCost: number;
  billingStatus: number;
  durationMs: number | null;
  workerNode: string | null;
  gpuType: string | null;
  queueName: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  startTime: string;
  endTime: string;
  createTime: string;
  updateTime: string;
  inputFiles: any[];
  outputFiles: TaskOutputFile[];
  model: TaskDetailModel;
}

