export const T2I_IMPORT_STORAGE_KEY = 'protx:t2i-import-payload';

export interface T2iImportPayload {
  prompt?: string;
  negativePrompt?: string;
  preferredModelCode?: string;
  aspectRatio?: string;
  resolution?: string;
  batchSize?: number;
  seedreamWatermark?: boolean;
  imageFormat?: string;
}

type PostLike = {
  prompt?: string | null;
  negativePrompt?: string | null;
  modelKey?: string | null;
  generationParams?: string | Record<string, unknown> | null;
  isPromptHidden?: boolean;
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

const parseGenerationParams = (post: PostLike): Record<string, unknown> => {
  if (!post?.generationParams) return {};
  try {
    return typeof post.generationParams === 'string'
      ? JSON.parse(post.generationParams)
      : { ...post.generationParams };
  } catch {
    return {};
  }
};

const aspectRatioFromDimensions = (width: unknown, height: unknown): string | undefined => {
  const w = Number(width);
  const h = Number(height);
  if (!w || !h) return undefined;
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
};

const normalizeResolution = (params: Record<string, unknown>): string | undefined => {
  if (params.resolution != null && String(params.resolution).trim()) {
    return String(params.resolution).trim();
  }
  if (params.size != null) {
    const size = String(params.size).trim();
    if (/^(1K|2K|4K)$/i.test(size)) {
      return size.toUpperCase();
    }
    if (/^\d+[x*×]\d+$/i.test(size)) {
      return size.replace(/[*×]/g, 'x');
    }
    return size;
  }
  if (params.width && params.height) {
    return `${params.width}x${params.height}`;
  }
  return undefined;
};

const pickPreferredModelCode = (params: Record<string, unknown>, modelKey?: string | null): string | undefined => {
  const candidates = [
    params.loraModelCode,
    params.modelCode,
    modelKey,
    params.sdModelCheckpoint,
  ];
  for (const item of candidates) {
    if (item != null && String(item).trim()) {
      return String(item).trim();
    }
  }
  return undefined;
};

/** 从社区帖子构建文生图导入参数 */
export const buildT2iImportFromPost = (post: PostLike | null | undefined): T2iImportPayload | null => {
  if (!post) {
    return null;
  }

  const params = parseGenerationParams(post);
  const prompt = typeof post.prompt === 'string' ? post.prompt.trim() : '';
  if (!prompt) {
    return null;
  }

  const negativePrompt =
    (typeof post.negativePrompt === 'string' && post.negativePrompt.trim()) ||
    (typeof params.negativePrompt === 'string' && params.negativePrompt.trim()) ||
    undefined;

  const aspectRatio =
    (typeof params.aspectRatio === 'string' && params.aspectRatio.trim()) ||
    aspectRatioFromDimensions(params.width, params.height);

  const batchRaw = params.batchSize ?? params.generationImageCount;
  const batchSize =
    batchRaw != null && Number(batchRaw) > 0 ? Math.min(4, Math.max(1, Number(batchRaw))) : undefined;

  const payload: T2iImportPayload = {
    prompt,
    negativePrompt,
    preferredModelCode: pickPreferredModelCode(params, post.modelKey),
    aspectRatio,
    resolution: normalizeResolution(params),
    batchSize,
  };

  if (params.seedreamWatermark != null) {
    payload.seedreamWatermark = Boolean(params.seedreamWatermark);
  }
  if (params.imageFormat != null && String(params.imageFormat).trim()) {
    payload.imageFormat = String(params.imageFormat).trim();
  } else if (params.outputFormat != null && String(params.outputFormat).trim()) {
    payload.imageFormat = String(params.outputFormat).trim();
  }

  return payload;
};

export const persistT2iImportPayload = (payload: T2iImportPayload): void => {
  try {
    sessionStorage.setItem(T2I_IMPORT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
};

export const consumeT2iImportPayload = (locationState?: unknown): T2iImportPayload | null => {
  const fromState = (locationState as { t2iImport?: T2iImportPayload } | null)?.t2iImport;
  if (fromState && typeof fromState === 'object') {
    try {
      sessionStorage.removeItem(T2I_IMPORT_STORAGE_KEY);
    } catch {
      // ignore
    }
    return fromState;
  }

  try {
    const raw = sessionStorage.getItem(T2I_IMPORT_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(T2I_IMPORT_STORAGE_KEY);
    return JSON.parse(raw) as T2iImportPayload;
  } catch {
    return null;
  }
};
