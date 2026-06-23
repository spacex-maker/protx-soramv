/**
 * 帖子提示词开放类型
 * - free: 社区直接展示提示词（含已购买解锁）
 * - paid: 提示词隐藏，需前往提示词商城购买
 * - none: 无可用提示词信息
 */
export const getPostPromptAccessType = (post) => {
  if (!post) return 'none';
  if (post.prompt) {
    return 'free';
  }
  if (post.isPromptHidden && post.promptMarketListingId) {
    return 'paid';
  }
  if (post.isPromptHidden) {
    return 'paid';
  }
  return 'none';
};

/** 是否仍应展示「前往提示词商城」引导（未购买且提示词未返回） */
export const isPostPromptMarketLocked = (post) => {
  if (!post?.isPromptHidden || !post.promptMarketListingId) {
    return false;
  }
  return !post.prompt;
};

export const postHasPromptIndicator = (post) => {
  const type = getPostPromptAccessType(post);
  return type === 'free' || type === 'paid';
};
