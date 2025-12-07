import instance from './axios';

export interface CommunityPost {
  id: number;
  userId: number;
  userNickname?: string;
  userAvatar?: string;
  title?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrls: string[];
  coverUrl?: string;
  prompt?: string;
  negativePrompt?: string;
  modelKey?: string;
  generationParams?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  status: number;
  isFeatured?: boolean;
  channelId?: number;
  channelName?: string;
  isChallengeEntry?: boolean;
  challengeId?: number;
  challengeScore?: number;
  isLiked?: boolean;
  isCollected?: boolean;
  tags?: string[];
  createTime: string;
}

export interface CommunityChannel {
  id: number;
  channelKey: string;
  name: string;
  description?: string;
  iconUrl?: string;
  coverUrl?: string;
  themeColor?: string;
  layoutMode: 'MASONRY' | 'GRID' | 'FEED';
  type: 'SYSTEM' | 'TAG' | 'MANUAL';
  isVipOnly?: boolean;
  allowUserPost?: boolean;
  postCount?: number;
}

export interface CommunityInteractionResponse {
  postId: number;
  isLiked: boolean;
  isCollected: boolean;
  likesCount: number;
  collectsCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface CreatePostRequest {
  title?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrls: string[];
  coverUrl?: string;
  prompt?: string;
  negativePrompt?: string;
  modelKey?: string;
  generationParams?: string;
  channelId?: number;
  tagIds?: number[];
  challengeId?: number;
}

export interface DailyChallenge {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  requiredTags?: string;
  requiredModel?: string;
  referenceImageUrl?: string;
  startTime: string;
  endTime: string;
  votingEndTime: string;
  rewardsConfig?: string;
  status: number; // 0=未开始, 1=进行中, 2=评审中, 3=已结束
  createTime: string;
}

/**
 * 创建社区作品
 */
export const createPost = async (request: CreatePostRequest): Promise<number> => {
  const response = await instance.post<ApiResponse<number>>(
    '/productx/community/post/create',
    request
  );
  return response.data.data;
};

/**
 * 查询作品列表
 */
export const listPosts = async (params: {
  channelId?: number;
  challengeId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'latest' | 'popular';
}): Promise<CommunityPost[]> => {
  const response = await instance.get<ApiResponse<CommunityPost[]>>(
    '/productx/community/post/list',
    { params }
  );
  return response.data.data;
};

/**
 * 查询作品详情
 */
export const getPostDetail = async (postId: number): Promise<CommunityPost> => {
  const response = await instance.get<ApiResponse<CommunityPost>>(
    `/productx/community/post/${postId}`
  );
  return response.data.data;
};

/**
 * 查询所有启用的频道
 */
export const listChannels = async (): Promise<CommunityChannel[]> => {
  const response = await instance.get<ApiResponse<CommunityChannel[]>>(
    '/productx/community/channel/list'
  );
  return response.data.data;
};

/**
 * 根据channelKey查询频道详情
 */
export const getChannelByKey = async (channelKey: string): Promise<CommunityChannel> => {
  const response = await instance.get<ApiResponse<CommunityChannel>>(
    `/productx/community/channel/${channelKey}`
  );
  return response.data.data;
};

/**
 * 点赞作品
 */
export const likePost = async (postId: number): Promise<CommunityInteractionResponse> => {
  const response = await instance.post<ApiResponse<CommunityInteractionResponse>>(
    `/productx/community/interaction/${postId}/like`
  );
  return response.data.data;
};

/**
 * 取消点赞
 */
export const unlikePost = async (postId: number): Promise<CommunityInteractionResponse> => {
  const response = await instance.post<ApiResponse<CommunityInteractionResponse>>(
    `/productx/community/interaction/${postId}/unlike`
  );
  return response.data.data;
};

/**
 * 收藏作品
 */
export const collectPost = async (postId: number): Promise<CommunityInteractionResponse> => {
  const response = await instance.post<ApiResponse<CommunityInteractionResponse>>(
    `/productx/community/interaction/${postId}/collect`
  );
  return response.data.data;
};

/**
 * 取消收藏
 */
export const uncollectPost = async (postId: number): Promise<CommunityInteractionResponse> => {
  const response = await instance.post<ApiResponse<CommunityInteractionResponse>>(
    `/productx/community/interaction/${postId}/uncollect`
  );
  return response.data.data;
};

/**
 * 获取用户对某作品的交互状态
 */
export const getPostInteractionStatus = async (postId: number): Promise<CommunityInteractionResponse> => {
  const response = await instance.get<ApiResponse<CommunityInteractionResponse>>(
    `/productx/community/interaction/${postId}/status`
  );
  return response.data.data;
};

/**
 * 获取当前进行中的挑战
 */
export const getCurrentChallenge = async (): Promise<DailyChallenge> => {
  const response = await instance.get<ApiResponse<DailyChallenge>>(
    '/productx/community/challenge/current'
  );
  return response.data.data;
};

/**
 * 根据ID获取挑战详情
 */
export const getChallengeById = async (challengeId: number): Promise<DailyChallenge> => {
  const response = await instance.get<ApiResponse<DailyChallenge>>(
    `/productx/community/challenge/${challengeId}`
  );
  return response.data.data;
};

/**
 * 获取最近的挑战
 */
export const getLatestChallenge = async (): Promise<DailyChallenge> => {
  const response = await instance.get<ApiResponse<DailyChallenge>>(
    '/productx/community/challenge/latest'
  );
  return response.data.data;
};

