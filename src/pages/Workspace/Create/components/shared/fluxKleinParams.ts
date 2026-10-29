/** FLUX.3 Klein：长边档位 + 比例 → 宽高（16 对齐，长边≤2048，总像素≤4.2MP） */

export type FluxKleinModelLike = {
  companyCode?: string | null;
  modelCode?: string | null;
  imageDefaultResolution?: string | null;
  imageMaxResolution?: string | null;
  imageAspectRatios?: string | null;
};

export type KleinMode = 'edit' | 'denoise';
/** follow=跟随原图（默认）；fixed=长边档位+固定比例 */
export type KleinSizeMode = 'follow' | 'fixed';

export const KLEIN_LONG_EDGE_OPTIONS = [512, 768, 1024, 1536, 2048] as const;
export const KLEIN_ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'] as const;
/** 图生图：按参考图真实宽高比输出（仍走 resize + 长边钳制，不用 keep resolution） */
export const KLEIN_ASPECT_ORIGINAL = 'original';
/** 默认 1024；512 质量差距大、提速有限，不做默认 */
export const KLEIN_DEFAULT_LONG_EDGE = 1024;
export const KLEIN_DEFAULT_ASPECT = '1:1';
/** 图生图默认跟原图比例 */
export const KLEIN_DEFAULT_I2I_ASPECT = KLEIN_ASPECT_ORIGINAL;
export const KLEIN_DEFAULT_SIZE_MODE: KleinSizeMode = 'follow';
export const KLEIN_DEFAULT_MODE: KleinMode = 'edit';
export const KLEIN_DEFAULT_DENOISE = 0.65;
export const KLEIN_MAX_LONG_EDGE = 2048;
export const KLEIN_MAX_PIXELS = 4_200_000;
/** Klein 精修原生多参考上限；重绘仅 1 张 */
export const KLEIN_MAX_REF_IMAGES = 4;

export function isKleinOriginalAspect(aspect: string | null | undefined): boolean {
  const a = String(aspect || '')
    .trim()
    .toLowerCase();
  return a === 'original' || a === 'auto' || a === 'keep' || a === 'source';
}

export function isFluxKleinModel(model: FluxKleinModelLike | null | undefined): boolean {
  if (!model) return false;
  const code = (model.modelCode || '').toLowerCase();
  if (model.companyCode && String(model.companyCode).toLowerCase() === 'flux' && code.includes('klein')) {
    return true;
  }
  return code.includes('flux') && code.includes('klein');
}

function floorToMultiple(n: number, m: number): number {
  return Math.max(m, Math.floor(n / m) * m);
}

/** 由长边档位 + 比例计算宽高，向下取整到 16 的倍数，并钳制总像素 */
export function computeKleinSize(
  longEdge: number,
  aspectRatio: string,
): { width: number; height: number } {
  const edge = Math.min(
    KLEIN_MAX_LONG_EDGE,
    Math.max(64, Number(longEdge) || KLEIN_DEFAULT_LONG_EDGE),
  );
  const parts = String(aspectRatio || KLEIN_DEFAULT_ASPECT).split(':').map(Number);
  const aw = parts[0] > 0 ? parts[0] : 1;
  const ah = parts[1] > 0 ? parts[1] : 1;

  let width: number;
  let height: number;
  if (aw >= ah) {
    width = edge;
    height = (edge * ah) / aw;
  } else {
    height = edge;
    width = (edge * aw) / ah;
  }

  width = floorToMultiple(width, 16);
  height = floorToMultiple(height, 16);

  // 总像素钳制：等比缩小再对齐 16
  let pixels = width * height;
  if (pixels > KLEIN_MAX_PIXELS) {
    const scale = Math.sqrt(KLEIN_MAX_PIXELS / pixels);
    width = floorToMultiple(width * scale, 16);
    height = floorToMultiple(height * scale, 16);
    pixels = width * height;
    while (pixels > KLEIN_MAX_PIXELS && (width > 16 || height > 16)) {
      if (width >= height) width = Math.max(16, width - 16);
      else height = Math.max(16, height - 16);
      pixels = width * height;
    }
  }

  return { width, height };
}

/** 固定档：保持参考图比例，强制长边到档位并 16 对齐 */
export function computeKleinSizeFromSource(
  longEdge: number,
  sourceWidth: number,
  sourceHeight: number,
): { width: number; height: number } {
  const sw = Math.max(1, Math.round(Number(sourceWidth) || 1));
  const sh = Math.max(1, Math.round(Number(sourceHeight) || 1));
  return computeKleinSize(longEdge, `${sw}:${sh}`);
}

/**
 * 跟随原图（规范 4.1）：s = min(1, 2048/max(w,h))，不放大；
 * 参考图本身 ≤2048 时输出≈原尺寸（仅 16 对齐）。
 */
export function computeKleinSizeFollowSource(
  sourceWidth: number,
  sourceHeight: number,
): { width: number; height: number } {
  const sw = Math.max(1, Math.round(Number(sourceWidth) || 1));
  const sh = Math.max(1, Math.round(Number(sourceHeight) || 1));
  const scale = Math.min(1, KLEIN_MAX_LONG_EDGE / Math.max(sw, sh));
  let width = floorToMultiple(sw * scale, 16);
  let height = floorToMultiple(sh * scale, 16);
  let pixels = width * height;
  if (pixels > KLEIN_MAX_PIXELS) {
    const shrink = Math.sqrt(KLEIN_MAX_PIXELS / pixels);
    width = floorToMultiple(width * shrink, 16);
    height = floorToMultiple(height * shrink, 16);
    pixels = width * height;
    while (pixels > KLEIN_MAX_PIXELS && (width > 16 || height > 16)) {
      if (width >= height) width = Math.max(16, width - 16);
      else height = Math.max(16, height - 16);
      pixels = width * height;
    }
  }
  return { width, height };
}

export function formatKleinSizeLabel(
  longEdge: number,
  aspectRatio: string,
  sourceSize?: { width: number; height: number } | null,
  sizeMode: KleinSizeMode = 'fixed',
): string {
  if (sizeMode === 'follow' || isKleinOriginalAspect(aspectRatio)) {
    if (sourceSize?.width && sourceSize?.height) {
      const { width, height } =
        sizeMode === 'follow'
          ? computeKleinSizeFollowSource(sourceSize.width, sourceSize.height)
          : computeKleinSizeFromSource(longEdge, sourceSize.width, sourceSize.height);
      return `${width}×${height}`;
    }
    return '跟随原图';
  }
  const { width, height } = computeKleinSize(longEdge, aspectRatio);
  return `${width}×${height}`;
}

/** 多图合成提示词（按内容描述匹配，不用「图1/图2」空编号） */
export function buildKleinComposePrompt(
  imageDescs: string[],
  goal: string,
): string {
  const lines = imageDescs
    .map((d, i) => `Image ${i + 1}: ${(d || '').trim() || `<describe image ${i + 1}>`}.`)
    .join(' ');
  const g = (goal || '').trim();
  return `${lines} ${g || 'Generate a coherent image combining elements from the reference images, naming which element comes from which image.'}`.trim();
}

/** 换装专用句式（实测：wearing/replace 易叠穿或换人） */
export function buildKleinOutfitPrompt(opts: {
  personDesc: string;
  garmentDesc: string;
  removeGarmentHint?: string;
}): string {
  const person = (opts.personDesc || '').trim() || 'a person';
  const garment = (opts.garmentDesc || '').trim() || 'the clothing from Image 2';
  const remove = (opts.removeGarmentHint || '').trim();
  const negative = remove
    ? `The ${remove} must not appear in the result.`
    : 'The original clothing of Image 1 must not appear in the result.';
  return [
    `Image 1: ${person}.`,
    `Image 2: ${garment}.`,
    `Change the clothing of the person in Image 1 to the outfit shown in Image 2.`,
    negative,
    'Keep their face, hair, body shape and pose unchanged.',
  ].join(' ');
}

/** 读取本地/远程图片自然尺寸 */
export function probeImageNaturalSize(
  src: string | Blob,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrl: string | null = null;
    const cleanup = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      cleanup();
      if (width > 0 && height > 0) resolve({ width, height });
      else reject(new Error('invalid image size'));
    };
    img.onerror = () => {
      cleanup();
      reject(new Error('image load failed'));
    };
    if (typeof src === 'string') {
      img.crossOrigin = 'anonymous';
      img.src = src;
    } else {
      objectUrl = URL.createObjectURL(src);
      img.src = objectUrl;
    }
  });
}

/** 纯生成秒数（方图像素档近似）；进度条用 1.5× 作上限，勿当精确倒计时 */
const GEN_SEC_SQUARE: Record<
  number,
  { t2i: number; denoise: number; edit: number }
> = {
  512: { t2i: 2.5, denoise: 3.8, edit: 5.6 },
  768: { t2i: 3.5, denoise: 4.0, edit: 6.4 },
  1024: { t2i: 5.5, denoise: 5.8, edit: 8.0 },
  1536: { t2i: 8.9, denoise: 10.5, edit: 11.6 },
  2048: { t2i: 15.2, denoise: 21, edit: 18.8 },
};

function nearestLongEdgeBucket(longEdge: number): number {
  let best = 1024;
  let bestDiff = Infinity;
  for (const e of KLEIN_LONG_EDGE_OPTIONS) {
    const d = Math.abs(e - longEdge);
    if (d < bestDiff) {
      best = e;
      bestDiff = d;
    }
  }
  return best;
}

/** 端到端预估毫秒（生成 + PNG 下载约 200KB/s），再 ×1.5 作进度条上限 */
export function estimateKleinProgressCapMs(
  mode: 't2i' | KleinMode,
  longEdge: number,
  aspectRatio: string,
): number {
  const { width, height } = computeKleinSize(longEdge, aspectRatio);
  const bucket = nearestLongEdgeBucket(Math.max(width, height));
  const row = GEN_SEC_SQUARE[bucket] || GEN_SEC_SQUARE[1024];
  const genSec =
    mode === 't2i' ? row.t2i : mode === 'denoise' ? row.denoise : row.edit;
  // 公网 PNG 体积粗估：1024²≈2.1MB，按像素比例；下行 ~200KB/s
  const mp = (width * height) / (1024 * 1024);
  const pngMb = Math.max(0.4, 2.1 * mp);
  const downloadSec = (pngMb * 1024) / 200;
  const queuePadSec = 10;
  return Math.round((genSec + downloadSec + queuePadSec) * 1.5 * 1000);
}

export const KLEIN_PENDING_T2I_KEY = 'klein-pending-t2i-task';
export const KLEIN_PENDING_I2I_KEY = 'klein-pending-i2i-task';

export function saveKleinPendingTask(key: string, taskId: string | number) {
  try {
    sessionStorage.setItem(key, String(taskId));
  } catch {
    /* ignore */
  }
}

export function loadKleinPendingTask(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function clearKleinPendingTask(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
