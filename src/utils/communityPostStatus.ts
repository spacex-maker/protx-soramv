export const COMMUNITY_POST_STATUS = {
  PENDING: 0,
  PUBLIC: 1,
  PRIVATE: 2,
  DELISTED: 9,
} as const;

export function isPostDelisted(status?: number | null): boolean {
  return Number(status) === COMMUNITY_POST_STATUS.DELISTED;
}
