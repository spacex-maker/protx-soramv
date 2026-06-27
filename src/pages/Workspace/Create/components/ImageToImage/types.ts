// 图片结果类型定义
export interface ImageResult {
  url: string;
  aspectRatio?: string;
  resolution?: string;
  format?: string;
}

// 模型类型定义
export interface Model {
  id: number;
  companyCode?: string | null;
  companyName?: string | null;
  modelName: string;
  modelCode: string;
  description: string;
  descriptionEn?: string | null;
  imageDefaultResolution: string | null;
  imageMaxResolution: string | null;
  imageAspectRatios: string | null; // 支持的图片比例，如 "1:1,16:9,9:16"
  imageAspectRatiosEnum: string | null; // 支持的图片比例枚举
  imageFormats: string | null; // 支持的输出格式，如 "png,jpg"
  currency: string | null;
  outputPrice: number | null;
  tokenCost: number | null; // 图片生成每张token消耗
  /** 是否需要实名认证 */
  requireKyc?: boolean | null;
  likesCount?: number; // 点赞总数
  favoritesCount?: number; // 收藏总数
  coverImage?: string | null; // 封面图
  /** 是否官方玩法生成 */
  officialPlay?: boolean;
  officialPlayCode?: string | null;
  officialPlayName?: string | null;
}

// 生成任务记录类型
export interface GenerationTask {
  id: number;
  taskType: string;
  modelName: string;
  modelCode: string;
  status: number; // 0: 排队, 1: 处理中, 2: 成功, 3: 失败
  inputType: string;
  outputType: string;
  resultUrls: string[] | null;
  inputUrls: string[] | null; // 图生图需要输入图片URL
  thumbnailUrl: string | null;
  errorMessage: string | null;
  createTime: string;
  updateTime: string;
  startTime: string | null;
  endTime: string | null;
  // 可选字段（列表接口可能不返回）
  prompt?: string | null;
  /** 是否官方玩法生成 */
  officialPlay?: boolean;
  officialPlayCode?: string | null;
  officialPlayName?: string | null;
  creditsCost?: number | null;
  durationMs?: number | null;
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

export interface TaskInputFile {
  id: number;
  taskId: number;
  fileUrl: string;
  fileType: string;
  sortOrder: number;
  createTime: string;
}

export interface TaskDetailModel {
  id: number;
  modelName: string;
  modelCode: string;
  modelType: string;
  description: string;
  descriptionEn?: string | null;
  releaseYear: string;
  coverImage: string;
  imageDefaultResolution: string;
  imageMaxResolution: string;
  imageAspectRatios: string;
  imageFormats: string;
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
  coverImage?: string | null; // 封面图，可能是图片链接
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
  inputFiles: TaskInputFile[];
  outputFiles: TaskOutputFile[];
  model: TaskDetailModel;
}

// 等待任务类型
export interface WaitingTask {
  id: number;
  taskId: string;
  prompt: string;
  modelName: string;
  status: number;
  createTime: string;
  submitTime: string; // 提交时间，用于显示
  aspectRatio?: string; // 图片比例（可选）
}

