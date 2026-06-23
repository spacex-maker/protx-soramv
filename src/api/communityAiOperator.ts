import instance from './axios';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CommunityAiOperator {
  id: number;
  userId: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  internalName?: string;
  personaPreset?: string;
  languageStyle?: string;
  interestedTags?: string[];
  excludeTags?: string[];
  userDescription?: string;
  postPromptTemplate?: string;
  generationSystemPrompt?: string;
  channelId?: number;
  canPost?: boolean;
  postSourceType?: string;
  generationModelCode?: string;
  generationImageCount?: number;
  generationMediaType?: string;
  status?: boolean;
  activeTimeRange?: string;
  actionsPerDay?: number;
  postFrequencyDays?: number;
  lastActionTime?: string;
  createTime?: string;
}

export interface CommunityAiOperatorUpdateRequest {
  id: number;
  nickname?: string;
  channelId?: number;
  canPost?: boolean;
  postSourceType?: string;
  generationModelCode?: string;
  generationImageCount?: number;
  generationMediaType?: string;
  status?: boolean;
  activeTimeRange?: string;
  actionsPerDay?: number;
  postFrequencyDays?: number;
}

export interface CommunityAiOperatorPromptMarketRequest {
  publishToPromptMarket?: boolean;
  description?: string;
  tags?: string;
  priceToken?: number;
  originalPriceToken?: number;
  licenseType?: number;
  isPromptHidden?: number;
}

export interface CommunityAiOperatorTriggerRequest {
  operatorId: number;
  promptMarket?: CommunityAiOperatorPromptMarketRequest;
}

export const checkAiOperatorManagePermission = async (): Promise<boolean> => {
  const response = await instance.get<ApiResponse<boolean>>(
    '/productx/community/ai-operator/check-manage-permission'
  );
  return Boolean(response.data.data);
};

export const listChannelAiOperators = async (channelId: number): Promise<CommunityAiOperator[]> => {
  const response = await instance.get<ApiResponse<CommunityAiOperator[]>>(
    '/productx/community/ai-operator/list',
    { params: { channelId } }
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '加载失败');
  }
  return response.data.data || [];
};

export const updateChannelAiOperator = async (
  request: CommunityAiOperatorUpdateRequest
): Promise<CommunityAiOperator> => {
  const response = await instance.post<ApiResponse<CommunityAiOperator>>(
    '/productx/community/ai-operator/update',
    request
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '更新失败');
  }
  return response.data.data;
};

export const triggerChannelAiOperatorPost = async (
  operatorId: number,
  promptMarket?: CommunityAiOperatorPromptMarketRequest
): Promise<string> => {
  const payload: CommunityAiOperatorTriggerRequest = { operatorId };
  if (promptMarket?.publishToPromptMarket) {
    payload.promptMarket = promptMarket;
  }
  const response = await instance.post<ApiResponse<string>>(
    '/productx/community/ai-operator/trigger-post',
    payload
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '触发失败');
  }
  return response.data.data || response.data.message || '已触发';
};

export interface TextToImageModel {
  id: number;
  modelCode: string;
  modelName?: string;
  modelNameEn?: string;
  status?: boolean;
}

export const listTextToImageModels = async (): Promise<TextToImageModel[]> => {
  const response = await instance.get<ApiResponse<TextToImageModel[]>>(
    '/productx/sa-ai-models/enabled/by-type',
    { params: { modelType: 't2i' } }
  );
  return response.data.data || [];
};

export interface PageResult<T> {
  data: T[];
  totalNum: number;
}

export interface CommunityAiOperatorPostRecord {
  id: number;
  operatorId: number;
  actionType: 'POST_PUBLISH' | 'GENERATE_IMAGE' | string;
  actionResult: 'SUCCESS' | 'FAILED' | string;
  actionDescription?: string;
  errorMessage?: string;
  resourceId?: number;
  taskId?: number;
  stockId?: number;
  postId?: number;
  channelId?: number;
  imageUrl?: string;
  prompt?: string;
  modelCode?: string;
  size?: string;
  width?: number;
  height?: number;
  negativePrompt?: string;
  generationParams?: string;
  syncCompleted?: boolean;
  autoPublish?: boolean;
  publishStatus?: string;
  publishError?: string;
  postTitle?: string;
  postStatus?: number;
  postLikeCount?: number;
  postViewCount?: number;
  createTime?: string;
}

export const listAiOperatorPostRecords = async (
  operatorId: number,
  page = 1,
  pageSize = 10,
  actionType?: string
): Promise<PageResult<CommunityAiOperatorPostRecord>> => {
  const response = await instance.get<ApiResponse<PageResult<CommunityAiOperatorPostRecord>>>(
    '/productx/community/ai-operator/post-records',
    { params: { operatorId, page, pageSize, actionType: actionType || undefined } }
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '加载失败');
  }
  return response.data.data || { data: [], totalNum: 0 };
};
