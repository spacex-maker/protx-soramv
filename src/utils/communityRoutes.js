/** 社区广场（首页） */
export const COMMUNITY_PLAZA_PATH = '/community';

/** 社区频道列表 */
export const COMMUNITY_CHANNELS_PATH = '/community/channels';

/** 与 /community/* 下系统路由冲突的 segment，不能作为裸 /community/:key 使用 */
export const COMMUNITY_RESERVED_SEGMENTS = new Set([
  'channels',
  'explore',
  'challenge',
  'daily-challenge',
  'post',
  'c',
]);

export const communityChannelPath = (channelKey) =>
  `/community/c/${encodeURIComponent(channelKey)}`;

export const isCommunityChannelKey = (segment) =>
  Boolean(segment) && !COMMUNITY_RESERVED_SEGMENTS.has(segment);
