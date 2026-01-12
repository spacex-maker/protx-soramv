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
  status: number; // 0=审核中, 1=公开, 2=私有, 9=违规下架
  reviewerId?: number;
  reviewerNickname?: string;
  reviewTime?: string;
  reviewComment?: string;
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
  taskId?: number; // 关联的生成任务ID（如果传入，将自动从任务中获取prompt、negativePrompt、modelKey、generationParams等字段）
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

/**
 * 获取当前可用的挑战列表（截止日期前的）
 */
export const getAvailableChallenges = async (): Promise<DailyChallenge[]> => {
  const response = await instance.get<ApiResponse<DailyChallenge[]>>(
    '/productx/community/challenge/available'
  );
  return response.data.data;
};

/**
 * 获取所有挑战列表（按时间倒序，最新的在前）
 */
export const listAllChallenges = async (limit?: number): Promise<DailyChallenge[]> => {
  const response = await instance.get<ApiResponse<DailyChallenge[]>>(
    '/productx/community/challenge/list',
    { params: limit ? { limit } : {} }
  );
  return response.data.data;
};

export interface UserRelationResponse {
  targetUserId: number;
  isFollowing: boolean;
  isMutual: boolean;
  followingCount: number;
  followersCount: number;
}

export interface UserRelationListResponse {
  userId: number;
  nickname?: string;
  avatar?: string;
  username?: string;
  description?: string;
  isFollowing: boolean;
  isMutual: boolean;
}

export interface CommunityUserRole {
  id: number;
  userId: number;
  roleId: number;
  roleName: string;
  roleCode: string;
  permissions?: string;
  isOfficial: boolean;
  description?: string;
  expiredTime?: string;
  expired: boolean;
  createTime: string;
}

/**
 * 关注用户
 */
export const followUser = async (targetUserId: number, followSource?: string): Promise<UserRelationResponse> => {
  const response = await instance.post<ApiResponse<UserRelationResponse>>(
    `/productx/user/relation/${targetUserId}/follow`,
    null,
    { params: { followSource: followSource || 'WORK_DETAIL' } }
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '关注失败');
  }
  return response.data.data;
};

/**
 * 取消关注
 */
export const unfollowUser = async (targetUserId: number): Promise<UserRelationResponse> => {
  const response = await instance.post<ApiResponse<UserRelationResponse>>(
    `/productx/user/relation/${targetUserId}/unfollow`
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '取消关注失败');
  }
  return response.data.data;
};

/**
 * 获取关注状态
 */
export const getRelationStatus = async (targetUserId: number): Promise<UserRelationResponse> => {
  const response = await instance.get<ApiResponse<UserRelationResponse>>(
    `/productx/user/relation/${targetUserId}/status`
  );
  return response.data.data;
};

/**
 * 获取粉丝列表
 */
export const getFollowersList = async (userId: number): Promise<UserRelationListResponse[]> => {
  const response = await instance.get<ApiResponse<UserRelationListResponse[]>>(
    `/productx/user/relation/${userId}/followers`
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '获取粉丝列表失败');
  }
  return response.data.data;
};

/**
 * 获取关注列表
 */
export const getFollowingList = async (userId: number): Promise<UserRelationListResponse[]> => {
  const response = await instance.get<ApiResponse<UserRelationListResponse[]>>(
    `/productx/user/relation/${userId}/following`
  );
  if (!response.data.success) {
    throw new Error(response.data.message || '获取关注列表失败');
  }
  return response.data.data;
};

/**
 * 获取当前用户的社区角色
 */
export const getMyRoles = async (): Promise<CommunityUserRole[]> => {
  const response = await instance.get<ApiResponse<CommunityUserRole[]>>(
    '/productx/community-user-role/my-roles'
  );
  return response.data.data;
};

// =============== 社区角色申请相关 ===============

export interface CommunityRole {
  id: number;
  roleName: string;
  roleCode: string;
  permissions?: string;
  isOfficial: boolean;
  description?: string;
  createTime: string;
}

export interface RoleApplicationRequest {
  roleId: number;
  applyReason: string;
  experienceDescription?: string;
  contactInfo?: string;
}

export interface RoleApplication {
  id: number;
  roleId: number;
  roleName: string;
  roleCode: string;
  applyReason: string;
  status: number; // 0-待审核，1-审核通过，2-审核拒绝，3-已撤回
  statusDesc: string;
  reviewTime?: string;
  reviewComment?: string;
  experienceDescription?: string;
  contactInfo?: string;
  createTime: string;
  updateTime: string;
  canWithdraw: boolean;
}

export interface RoleApplicationListResponse {
  data: RoleApplication[];
  totalNum: number;
}

/**
 * 获取所有可申请的社区角色列表
 */
export const getAvailableRoles = async (): Promise<CommunityRole[]> => {
  const response = await instance.get<ApiResponse<CommunityRole[]>>(
    '/productx/community-role/available'
  );
  return response.data.data;
};

/**
 * 提交角色申请
 */
export const applyForRole = async (request: RoleApplicationRequest): Promise<boolean> => {
  const response = await instance.post<ApiResponse<boolean>>(
    '/productx/community-role-application/apply',
    request
  );
  return response.data.data;
};

/**
 * 获取我的申请记录
 */
export const getMyApplications = async (params?: {
  currentPage?: number;
  pageSize?: number;
  roleId?: number;
  status?: number;
}): Promise<RoleApplicationListResponse> => {
  const response = await instance.post<ApiResponse<RoleApplicationListResponse>>(
    '/productx/community-role-application/my-applications',
    {
      currentPage: params?.currentPage || 1,
      pageSize: params?.pageSize || 10,
      roleId: params?.roleId,
      status: params?.status,
    }
  );
  return response.data.data;
};

/**
 * 撤回申请
 */
export const withdrawApplication = async (id: number): Promise<boolean> => {
  const response = await instance.post<ApiResponse<boolean>>(
    `/productx/community-role-application/withdraw/${id}`
  );
  return response.data.data;
};

/**
 * 获取申请详情
 */
export const getApplicationDetail = async (id: number): Promise<RoleApplication> => {
  const response = await instance.get<ApiResponse<RoleApplication>>(
    `/productx/community-role-application/${id}`
  );
  return response.data.data;
};

// ==================== 帖子审核相关接口 ====================

/**
 * 频道信息
 */
export interface ChannelInfo {
  id: number;
  channelKey: string;
  name: string;
  description?: string;
  iconUrl?: string;
  coverUrl?: string;
  themeColor?: string;
  layoutMode?: string;
  type?: string;
  isVipOnly?: boolean;
  allowUserPost?: boolean;
}

/**
 * 审核帖子（专用于审核管理，不与社区帖子混用）
 */
export interface ReviewPost {
  id: number;
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
  status: number; // 0=审核中, 1=公开, 2=私有, 9=违规下架
  isFeatured?: boolean;
  isChallengeEntry?: boolean;
  challengeId?: number;
  challengeScore?: number;
  // 用户信息
  userId: number;
  userNickname?: string;
  username?: string;
  userAvatar?: string;
  // 审核信息
  reviewerId?: number;
  reviewerNickname?: string;
  reviewTime?: string;
  reviewComment?: string;
  // 频道信息（子对象）
  channel?: ChannelInfo;
  // 挑战信息（子对象）
  challenge?: DailyChallenge;
  // 时间信息
  createTime: string;
  updateTime?: string;
}

export interface PostReviewRequest {
  postId: number;
  status: number; // 1=通过, 9=拒绝
  reviewComment?: string;
}

export interface PostReviewQueryRequest {
  currentPage: number;
  pageSize: number;
  status?: number; // 0=待审核, 1=已通过, 9=已拒绝
  onlyMine?: boolean;
  userId?: number;
  channelId?: number;
  sortOrder?: 'asc' | 'desc'; // asc=最早在前, desc=最新在前
}

export interface PostReviewListResponse {
  data: ReviewPost[];
  totalNum: number;
}

/**
 * 检查是否有审核权限
 */
export const checkReviewPermission = async (): Promise<boolean> => {
  const response = await instance.get<ApiResponse<boolean>>(
    '/productx/post-review/check-permission'
  );
  return response.data.data;
};

/**
 * 审核帖子
 */
export const reviewPost = async (request: PostReviewRequest): Promise<boolean> => {
  const response = await instance.post<ApiResponse<boolean>>(
    '/productx/post-review/review',
    request
  );
  return response.data.data;
};

/**
 * 查询待审核帖子列表
 */
export const getPendingPosts = async (
  query: PostReviewQueryRequest
): Promise<PostReviewListResponse> => {
  const response = await instance.post<ApiResponse<PostReviewListResponse>>(
    '/productx/post-review/pending',
    query
  );
  return response.data.data;
};

/**
 * 查询我审核的帖子列表
 */
export const getMyReviewedPosts = async (
  query: PostReviewQueryRequest
): Promise<PostReviewListResponse> => {
  const response = await instance.post<ApiResponse<PostReviewListResponse>>(
    '/productx/post-review/my-reviewed',
    query
  );
  return response.data.data;
};

