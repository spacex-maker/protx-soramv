// 解析奖励配置
export const parseRewardsConfig = (rewardsConfig) => {
  try {
    const config = JSON.parse(rewardsConfig);
    
    // 辅助函数：提取奖励值（支持数字或 {badge, tokens} 对象）
    const extractValue = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'object' && value !== null && 'tokens' in value) {
        return Number(value.tokens) || 0;
      }
      return 0;
    };
    
    return {
      first: extractValue(config['1st'] || config.first),
      second: extractValue(config['2nd'] || config.second),
      third: extractValue(config['3rd'] || config.third),
    };
  } catch (e) { 
    return { first: 0, second: 0, third: 0 }; 
  }
};

// 解析标签数组：支持数组、JSON字符串、逗号分隔字符串
export const parseTags = (tags) => {
  if (!tags) return [];
  
  // 如果已经是数组，直接返回
  if (Array.isArray(tags)) {
    return tags;
  }
  
  // 如果是字符串，尝试解析
  if (typeof tags === 'string') {
    try {
      // 尝试解析 JSON 字符串
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // 如果不是 JSON，尝试按逗号分割
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
  }
  
  return [];
};

// 计算总奖品
export const calculateTotalPrize = (config) => {
    const r = parseRewardsConfig(config);
    return r.first + r.second + r.third;
};

// 获取挑战时间阶段（与详情页逻辑一致，优先于数据库 status 字段）
export const getChallengeTimeFlags = (challenge) => {
  if (!challenge?.startTime || !challenge?.endTime) {
    return {
      isNotStarted: false,
      isOngoing: false,
      isVoting: false,
      isEnded: true,
    };
  }

  const now = Date.now();
  const startTime = new Date(challenge.startTime).getTime();
  const deadline = new Date(challenge.endTime).getTime();
  const votingEndTime = challenge.votingEndTime
    ? new Date(challenge.votingEndTime).getTime()
    : deadline;

  return {
    isNotStarted: now < startTime,
    isOngoing: now >= startTime && now < deadline,
    isVoting: now >= deadline && now < votingEndTime,
    isEnded: now >= votingEndTime,
  };
};

export const getChallengePhase = (challenge) => {
  const { isNotStarted, isOngoing, isVoting, isEnded } = getChallengeTimeFlags(challenge);
  if (isNotStarted) return 'upcoming';
  if (isOngoing) return 'live';
  if (isVoting) return 'voting';
  if (isEnded) return 'ended';
  return 'unknown';
};

const PHASE_STATUS_MAP = {
  upcoming: 0,
  live: 1,
  voting: 2,
  ended: 3,
};

const STATUS_PHASE_MAP = {
  0: 'upcoming',
  1: 'live',
  2: 'voting',
  3: 'ended',
};

// 获取状态信息：传入 challenge 对象时按时间计算，传入数字时兼容旧逻辑
export const getStatusInfo = (statusOrChallenge, intl) => {
  const phase = typeof statusOrChallenge === 'object' && statusOrChallenge !== null
    ? getChallengePhase(statusOrChallenge)
    : (STATUS_PHASE_MAP[Number(statusOrChallenge)] || 'unknown');

  switch (phase) {
    case 'upcoming':
      return { label: intl.formatMessage({ id: 'challenge.status.upcoming', defaultMessage: 'Upcoming' }), color: '#1890ff', dot: '#1890ff', phase };
    case 'live':
      return { label: intl.formatMessage({ id: 'challenge.status.live', defaultMessage: 'Live Now' }), color: '#52c41a', dot: '#52c41a', phase };
    case 'voting':
      return { label: intl.formatMessage({ id: 'challenge.status.voting', defaultMessage: 'Voting' }), color: '#722ed1', dot: '#722ed1', phase };
    case 'ended':
      return { label: intl.formatMessage({ id: 'challenge.status.ended', defaultMessage: 'Ended' }), color: '#888', dot: '#888', phase };
    default:
      return { label: intl.formatMessage({ id: 'challenge.status.unknown', defaultMessage: 'Unknown' }), color: '#888', dot: '#888', phase: 'unknown' };
  }
};

export const isChallengeLive = (challenge) => getChallengePhase(challenge) === 'live';

export const sortChallengesByPhase = (challenges) => {
  const order = { live: 0, voting: 1, upcoming: 2, ended: 3, unknown: 4 };
  return [...challenges].sort((a, b) => {
    const phaseDiff = order[getChallengePhase(a)] - order[getChallengePhase(b)];
    if (phaseDiff !== 0) return phaseDiff;
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });
};

/** 从列表中按时间找出当前活跃挑战（进行中或投票中），与详情页状态一致 */
export const findActiveChallengeFromList = (challenges) => {
  if (!Array.isArray(challenges) || challenges.length === 0) return null;
  return (
    challenges.find((c) => {
      const phase = getChallengePhase(c);
      return phase === 'live' || phase === 'voting';
    }) || null
  );
};

// 清理挑战数据
export const cleanChallengeData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    title: typeof data.title === 'string' ? data.title : '',
    description: typeof data.description === 'string' ? data.description : undefined,
    coverUrl: typeof data.coverUrl === 'string' ? data.coverUrl : undefined,
    requiredTags: typeof data.requiredTags === 'string' ? data.requiredTags : undefined,
    requiredModel: typeof data.requiredModel === 'string' ? data.requiredModel : undefined,
    referenceImageUrl: typeof data.referenceImageUrl === 'string' ? data.referenceImageUrl : undefined,
    startTime: typeof data.startTime === 'string' ? data.startTime : '',
    endTime: typeof data.endTime === 'string' ? data.endTime : '',
    votingEndTime: typeof data.votingEndTime === 'string' ? data.votingEndTime : '',
    rewardsConfig: typeof data.rewardsConfig === 'string' ? data.rewardsConfig : undefined,
    status: (() => {
      const phase = getChallengePhase(data);
      return PHASE_STATUS_MAP[phase] ?? (Number(data.status) || 0);
    })(),
    viewCount: data.viewCount !== undefined && data.viewCount !== null ? Number(data.viewCount) : 0,
    createTime: typeof data.createTime === 'string' ? data.createTime : '',
  };
};

// 清理帖子数据
export const cleanPostData = (post) => {
  let mediaUrls = [];
  if (Array.isArray(post.mediaUrls)) {
    mediaUrls = post.mediaUrls;
  } else if (typeof post.mediaUrls === 'string') {
    try {
      const parsed = JSON.parse(post.mediaUrls);
      mediaUrls = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      mediaUrls = [];
    }
  }
  
  return {
    id: post.id,
    userId: post.userId,
    userNickname: typeof post.userNickname === 'string' ? post.userNickname : '',
    userAvatar: typeof post.userAvatar === 'string' ? post.userAvatar : undefined,
    title: typeof post.title === 'string' ? post.title : '',
    mediaType: post.mediaType,
    mediaUrls,
    coverUrl: typeof post.coverUrl === 'string' ? post.coverUrl : undefined,
    prompt: typeof post.prompt === 'string' ? post.prompt : undefined,
    negativePrompt: typeof post.negativePrompt === 'string' ? post.negativePrompt : undefined,
    modelKey: typeof post.modelKey === 'string' ? post.modelKey : undefined,
    generationParams: typeof post.generationParams === 'string' ? post.generationParams : undefined,
    viewCount: Number(post.viewCount) || 0,
    likeCount: Number(post.likeCount) || 0,
    commentCount: Number(post.commentCount) || 0,
    collectCount: Number(post.collectCount) || 0,
    status: Number(post.status) || 0,
    isFeatured: Boolean(post.isFeatured),
    channelId: post.channelId,
    channelName: typeof post.channelName === 'string' ? post.channelName : undefined,
    isChallengeEntry: Boolean(post.isChallengeEntry),
    challengeId: post.challengeId,
    challengeScore: post.challengeScore ? Number(post.challengeScore) : undefined,
    isLiked: Boolean(post.isLiked),
    isCollected: Boolean(post.isCollected),
    tags: Array.isArray(post.tags) ? post.tags : [],
    createTime: typeof post.createTime === 'string' ? post.createTime : '',
  };
};

// 生成默认挑战背景图（基于挑战ID的SVG渐变）
export const generateDefaultChallengeBackground = (challengeId, width = 800, height = 320) => {
  if (!challengeId) challengeId = Math.floor(Math.random() * 1000);
  
  // 基于ID生成稳定的颜色组合
  const seed = Number(challengeId) || 0;
  const hue1 = (seed * 137.508) % 360; // 使用黄金角度确保分布均匀
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 120) % 360;
  
  // 生成渐变色
  const colors = [
    `hsl(${hue1}, 70%, 50%)`,
    `hsl(${hue2}, 65%, 45%)`,
    `hsl(${hue3}, 75%, 40%)`,
    `hsl(${hue1}, 60%, 35%)`
  ];
  
  // 生成SVG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="30%" style="stop-color:${colors[1]};stop-opacity:1" />
          <stop offset="70%" style="stop-color:${colors[2]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[3]};stop-opacity:1" />
        </linearGradient>
        <radialGradient id="radial-${seed}" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.2);stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad-${seed})" />
      <rect width="100%" height="100%" fill="url(#radial-${seed})" />
      <circle cx="${width * 0.2}" cy="${height * 0.3}" r="${width * 0.15}" fill="rgba(255,255,255,0.05)" />
      <circle cx="${width * 0.8}" cy="${height * 0.7}" r="${width * 0.2}" fill="rgba(255,255,255,0.03)" />
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// 获取挑战背景图URL（如果有则使用，否则生成默认图）
export const getChallengeCoverUrl = (challenge) => {
  if (challenge?.coverUrl) {
    return challenge.coverUrl;
  }
  return generateDefaultChallengeBackground(challenge?.id);
};

/**
 * 为腾讯云图片URL添加压缩参数
 * @param {string} url - 原始图片URL
 * @param {object} options - 压缩选项
 * @returns {string} - 添加了压缩参数的URL
 */
export const addTencentImageCompression = (url, options = {}) => {
  if (!url) return '';
  
  // 默认压缩参数
  const {
    format = 'webp',      // 图片格式：webp, jpg, png
    quality = 20,         // 图片质量：1-100
    width = null,         // 限制宽度
    height = null,        // 限制高度
  } = options;
  
  // 检查是否已经包含压缩参数
  if (url.includes('imageMogr2') || url.includes('imageView2')) {
    return url;
  }
  
  // 构建压缩参数
  let params = `imageMogr2/format/${format}/quality/${quality}`;
  
  if (width) params += `/thumbnail/${width}x`;
  if (height && !width) params += `/thumbnail/x${height}`;
  if (width && height) params += `/thumbnail/${width}x${height}`;
  
  // 判断URL是否已有查询参数
  const separator = url.includes('?') ? '&' : '?';
  
  return `${url}${separator}${params}`;
};

