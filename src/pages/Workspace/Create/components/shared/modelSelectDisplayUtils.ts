/** 模型展示条：价格与封面工具 */

export const isModelFree = (
  outputPrice: number | null | undefined,
  currency: string | null | undefined,
  tokenCost?: number | null
): boolean => {
  if (tokenCost != null && tokenCost > 0) {
    return false;
  }
  if (outputPrice == null || outputPrice === 0) {
    return true;
  }
  return false;
};

export function isVideoCoverUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.trim().startsWith('data:video')) return true;
  const path = url.split('?')[0].split('#')[0];
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'webm', 'mov', 'mkv', 'm4v'].includes(ext);
}

export function resolveModelBrand(
  companyName?: string | null,
  modelName?: string | null
): string | null {
  if (companyName) return companyName;
  if (modelName === 'Nano Banana Pro') return 'Google';
  return null;
}

export type ModelSelectBillingMode = 'image' | 'video' | 'speech';

/** 创作台模型展示条统一数据结构（文生图 / 文生视频 / 语音生成等） */
export interface ModelSelectDisplayData {
  modelName: string;
  modelCode?: string | null;
  coverImage?: string | null;
  coverIsVideo?: boolean;
  outputPrice?: number | null;
  currency?: string | null;
  tokenCost?: number | null;
  /** 语音等按单位计费：char / second */
  tokenUnit?: 'char' | 'second';
  companyName?: string | null;
  /** 追加在名称后，如「 (默认)」 */
  nameSuffix?: string;
}

export function resolveCoverMedia(model: ModelSelectDisplayData | null): {
  cover: string | null;
  isVideo: boolean;
} {
  if (!model?.coverImage) {
    return { cover: null, isVideo: false };
  }
  const isVideo =
    model.coverIsVideo != null
      ? model.coverIsVideo
      : isVideoCoverUrl(model.coverImage);
  return { cover: model.coverImage, isVideo };
}
