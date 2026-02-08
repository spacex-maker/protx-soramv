// 视频结果类型
export interface VideoResult {
  url: string;
  aspectRatio: string;
  duration: number;
  thumbnail: string;
}

// 模型类型定义
export interface Model {
  id: number;
  modelName: string;
  modelCode: string;
  description: string;
  descriptionEn?: string | null;
  videoDefaultResolution: string | null;
  videoMaxResolution: string | null;
  videoDuration: number | null; // 视频最大时长（秒）
  videoDurationEnum: string | null; // 视频时长枚举（以逗号分隔，如 "10,15,25"）- 当 videoDuration 为空时使用
  videoFps: number | null;
  videoMaxFrames: number | null;
  videoAspectRatios: string | null; // 视频比例（图生视频也使用此字段）
  videoAspectRatiosEnum: string | null; // 支持的视频比例枚举（portrait，landscape）- 当 videoAspectRatios 为空时使用
  videoAspectResolution: string | null;
  videoFormats: string | null;
  supportCameraMotion: boolean;
  supportImg2video: boolean;
  supportVideoEdit: boolean;
  supportCharacterConsistency: boolean;
  supportReference: boolean;
  currency: string | null;
  outputPrice: number | null;
  tokenCost: number | null; // 视频每秒token消耗或图片生成每张消耗
  videoSupportStyle: string | null; // 视频支持风格枚举（以逗号分隔，如 "fun,normal,spicy"）
  videoQuality: string | null; // 视频质量枚举（以逗号分隔，如 "standard,high"）
  likesCount?: number; // 点赞总数
  favoritesCount?: number; // 收藏总数
  coverImage?: string | null; // 封面图
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
  inputUrls: string[] | null; // 图生视频需要输入图片URL
  thumbnailUrl: string | null;
  errorMessage: string | null;
  createTime: string;
  updateTime: string;
  startTime: string | null;
  endTime: string | null;
  // 可选字段（列表接口可能不返回）
  prompt?: string | null;
  creditsCost?: number | null;
  durationMs?: number | null;
  model?: {
    videoAspectRatios?: string | null;
  } | null;
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
  videoDefaultResolution: string;
  videoMaxResolution: string;
  videoDuration: number;
  videoFps: number;
  videoMaxFrames: number;
  videoAspectRatios: string;
  videoFormats: string;
  supportCameraMotion: boolean;
  supportImg2video: boolean;
  supportVideoEdit: boolean;
  supportCharacterConsistency: boolean;
  supportReference: boolean;
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
  coverImage?: string | null; // 封面图，可能是视频或图片链接
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

