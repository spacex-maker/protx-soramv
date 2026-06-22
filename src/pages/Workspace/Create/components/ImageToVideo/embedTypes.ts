export interface ImageToVideoEmbedTaskPayload {
  taskId: string;
  videoUrl?: string;
}

export interface ImageToVideoEmbedConfig {
  initialPrompt?: string;
  initialAspectRatio?: string;
  initialDuration?: number;
  initialStartFrameUrl?: string;
  initialEndFrameUrl?: string;
  initialSeedanceCameraFixed?: boolean;
  preferredModelCode?: string;
  hideHistory?: boolean;
  hideHeader?: boolean;
  hideTaskQueue?: boolean;
  excludeFreeModels?: boolean;
  onTaskSubmitted?: (payload: ImageToVideoEmbedTaskPayload) => void | Promise<void>;
}

export interface ImageToVideoProps {
  /** 是否为 Seedance 专用页（仅展示 Seedance 模型、独立路由） */
  seedancePage?: boolean;
  variant?: 'page' | 'embed';
  embedConfig?: ImageToVideoEmbedConfig;
  embedActive?: boolean;
}
