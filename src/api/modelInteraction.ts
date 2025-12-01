import instance from './axios';

export interface ModelInteractionResponse {
  modelId: number;
  isLiked: boolean;
  isFavorited: boolean;
  likesCount: number;
  favoritesCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

/**
 * 点赞模型
 */
export const likeModel = async (modelId: number): Promise<ModelInteractionResponse> => {
  const response = await instance.post<ApiResponse<ModelInteractionResponse>>(
    `/productx/sa-ai-models/${modelId}/like`
  );
  return response.data.data;
};

/**
 * 取消点赞
 */
export const unlikeModel = async (modelId: number): Promise<ModelInteractionResponse> => {
  const response = await instance.post<ApiResponse<ModelInteractionResponse>>(
    `/productx/sa-ai-models/${modelId}/unlike`
  );
  return response.data.data;
};

/**
 * 收藏模型
 */
export const favoriteModel = async (modelId: number, folderName?: string): Promise<ModelInteractionResponse> => {
  const params = folderName ? { folderName } : {};
  const response = await instance.post<ApiResponse<ModelInteractionResponse>>(
    `/productx/sa-ai-models/${modelId}/favorite`,
    null,
    { params }
  );
  return response.data.data;
};

/**
 * 取消收藏
 */
export const unfavoriteModel = async (modelId: number): Promise<ModelInteractionResponse> => {
  const response = await instance.post<ApiResponse<ModelInteractionResponse>>(
    `/productx/sa-ai-models/${modelId}/unfavorite`
  );
  return response.data.data;
};

/**
 * 获取模型交互状态
 */
export const getInteractionStatus = async (modelId: number): Promise<ModelInteractionResponse> => {
  const response = await instance.get<ApiResponse<ModelInteractionResponse>>(
    `/productx/sa-ai-models/${modelId}/interaction-status`
  );
  return response.data.data;
};

