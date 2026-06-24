/** 探索页频道展示模式 */
export const EXPLORE_VIEW_EXO_APE = 'exoApe';
export const EXPLORE_VIEW_APPLE = 'apple';
export const EXPLORE_VIEW_REVEAL = 'reveal';
export const EXPLORE_VIEW_BENTO = 'bento';
export const EXPLORE_VIEW_COVERFLOW = 'coverflow';

export const EXPLORE_VIEW_STORAGE_KEY = 'community-explore-view';

export const EXPLORE_VIEW_OPTIONS = [
  {
    id: EXPLORE_VIEW_BENTO,
    labelId: 'community.explore.view.bento',
    defaultLabel: '拼贴',
  },
  {
    id: EXPLORE_VIEW_EXO_APE,
    labelId: 'community.explore.view.exoApe',
    defaultLabel: '画廊',
  },
  {
    id: EXPLORE_VIEW_APPLE,
    labelId: 'community.explore.view.apple',
    defaultLabel: '全幕',
  },
  {
    id: EXPLORE_VIEW_REVEAL,
    labelId: 'community.explore.view.reveal',
    defaultLabel: '揭示',
  },
  {
    id: EXPLORE_VIEW_COVERFLOW,
    labelId: 'community.explore.view.coverflow',
    defaultLabel: '轮播',
  },
];

const VALID_VIEWS = new Set([
  EXPLORE_VIEW_BENTO,
  EXPLORE_VIEW_EXO_APE,
  EXPLORE_VIEW_APPLE,
  EXPLORE_VIEW_REVEAL,
  EXPLORE_VIEW_COVERFLOW,
]);

export const getStoredExploreView = () => {
  try {
    const v = localStorage.getItem(EXPLORE_VIEW_STORAGE_KEY);
    if (VALID_VIEWS.has(v)) return v;
    if (v === 'seamless') return EXPLORE_VIEW_APPLE;
  } catch {
    /* ignore */
  }
  return EXPLORE_VIEW_BENTO;
};

export const storeExploreView = (view) => {
  try {
    localStorage.setItem(EXPLORE_VIEW_STORAGE_KEY, view);
  } catch {
    /* ignore */
  }
};
