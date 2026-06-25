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
  periodUsedTokens?: number;
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

export interface CommunityAiOperatorPostRecordStats {
  totalPosts?: number;
  postSuccess?: number;
  postFailed?: number;
  totalGenerates?: number;
  generateSuccess?: number;
  generateFailed?: number;
  totalActions?: number;
  firstActionTime?: string;
  lastActionTime?: string;
}

export const getAiOperatorPostRecordStats = async (
  operatorId: number
): Promise<CommunityAiOperatorPostRecordStats> => {
  const response = await instance.get<ApiResponse<CommunityAiOperatorPostRecordStats>>(
    '/productx/community/ai-operator/post-records/stats',
    { params: { operatorId } }
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '加载失败');
  }
  return response.data.data || {};
};

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

export interface AiOperatorBudgetStatus {
  channelId?: number;
  policyId?: number;
  enabled?: boolean;
  periodType?: string;
  periodKey?: string;
  budgetLimit?: number;
  usedTokens?: number;
  remainingTokens?: number | null;
  usagePercent?: number;
  warning?: boolean;
  exceeded?: boolean;
  warningThresholdPercent?: number;
  exceedAction?: string;
  remark?: string;
  operatorBreakdown?: Array<{
    operatorId: number;
    displayName?: string;
    avatar?: string;
    status?: boolean;
    usedTokens?: number;
    lastPostTime?: string;
  }>;
}

export interface AiOperatorBudgetSaveRequest {
  channelId: number;
  enabled?: boolean;
  periodType?: string;
  budgetLimit?: number;
  warningThresholdPercent?: number;
  exceedAction?: string;
  remark?: string;
}

export const getChannelAiOperatorBudget = async (channelId: number): Promise<AiOperatorBudgetStatus> => {
  const response = await instance.get<ApiResponse<AiOperatorBudgetStatus>>(
    '/productx/community/ai-operator/budget',
    { params: { channelId } }
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '加载预算失败');
  }
  return response.data.data;
};

export const saveChannelAiOperatorBudget = async (
  request: AiOperatorBudgetSaveRequest
): Promise<AiOperatorBudgetStatus> => {
  const response = await instance.post<ApiResponse<AiOperatorBudgetStatus>>(
    '/productx/community/ai-operator/budget/save',
    request
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '保存预算失败');
  }
  return response.data.data;
};

export interface AiOperatorRuntimeStatus {
  runtimeEnabled?: boolean;
}

export const getAiOperatorRuntimeStatus = async (): Promise<AiOperatorRuntimeStatus> => {
  const response = await instance.get<ApiResponse<AiOperatorRuntimeStatus>>(
    '/productx/community/ai-operator/runtime-status'
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '加载运行状态失败');
  }
  return response.data.data || { runtimeEnabled: true };
};

export const setAiOperatorRuntimeEnabled = async (enabled: boolean): Promise<AiOperatorRuntimeStatus> => {
  const response = await instance.post<ApiResponse<AiOperatorRuntimeStatus>>(
    '/productx/community/ai-operator/runtime-switch',
    null,
    { params: { enabled } }
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '设置运行状态失败');
  }
  return response.data.data || { runtimeEnabled: enabled };
};
