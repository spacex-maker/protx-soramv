/**
 * 社区帖子分享/详情路径（对齐 /works/s/{shareCode}）
 */
export const buildPostShareUrl = (shareCode: string): string => {
  if (!shareCode) return '';
  const path = `/community/s/${encodeURIComponent(shareCode)}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
};

export const buildPostDetailPath = (post: { id: number; shareCode?: string | null }): string => {
  if (post.shareCode) {
    return `/community/s/${encodeURIComponent(post.shareCode)}`;
  }
  return `/community/post/${post.id}`;
};
