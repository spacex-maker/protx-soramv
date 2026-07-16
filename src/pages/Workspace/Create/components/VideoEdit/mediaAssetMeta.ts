import { formatFileSize } from '../shared/fileSizeUtils';

export interface MediaAssetMeta {
  width?: number;
  height?: number;
  aspectRatio?: string;
  fileSize: number;
  /** 视频/音频时长（秒） */
  duration?: number;
}

const ASPECT_PRESETS: Array<{ ratio: number; label: string }> = [
  { ratio: 16 / 9, label: '16:9' },
  { ratio: 9 / 16, label: '9:16' },
  { ratio: 1, label: '1:1' },
  { ratio: 4 / 3, label: '4:3' },
  { ratio: 3 / 4, label: '3:4' },
  { ratio: 21 / 9, label: '21:9' },
  { ratio: 3 / 2, label: '3:2' },
  { ratio: 2 / 3, label: '2:3' },
];

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function formatAspectRatio(width?: number, height?: number): string | undefined {
  if (!width || !height) return undefined;
  const r = width / height;
  for (const preset of ASPECT_PRESETS) {
    if (Math.abs(r - preset.ratio) < 0.03) {
      return preset.label;
    }
  }
  const g = gcd(width, height);
  return `${Math.round(width / g)}:${Math.round(height / g)}`;
}

export function formatResolution(width?: number, height?: number): string | undefined {
  if (!width || !height) return undefined;
  return `${width}×${height}`;
}

export function formatDuration(seconds?: number): string | undefined {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return undefined;
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0) {
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  return `${s}s`;
}

export function buildMediaMeta(
  file: File,
  dims?: { width?: number; height?: number; duration?: number }
): MediaAssetMeta {
  const { width, height, duration } = dims || {};
  return {
    width,
    height,
    aspectRatio: formatAspectRatio(width, height),
    fileSize: file.size,
    duration,
  };
}

export function readVideoMeta(
  file: File
): Promise<{ width: number; height: number; pixels: number; duration?: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const cleanup = () => URL.revokeObjectURL(url);
    video.onloadedmetadata = () => {
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      const duration = Number.isFinite(video.duration) ? video.duration : undefined;
      cleanup();
      resolve({ width, height, pixels: width * height, duration });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('无法读取视频信息'));
    };
    video.src = url;
  });
}

export function readImageMeta(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const cleanup = () => URL.revokeObjectURL(url);
    img.onload = () => {
      const width = img.naturalWidth || 0;
      const height = img.naturalHeight || 0;
      cleanup();
      resolve({ width, height });
    };
    img.onerror = () => {
      cleanup();
      reject(new Error('无法读取图片信息'));
    };
    img.src = url;
  });
}

export function readAudioDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    const cleanup = () => URL.revokeObjectURL(url);
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : undefined;
      cleanup();
      resolve(duration);
    };
    audio.onerror = () => {
      cleanup();
      resolve(undefined);
    };
    audio.src = url;
  });
}

export function formatMediaSize(fileSize: number): string {
  return formatFileSize(fileSize);
}

/** 缩略图底部两行：分辨率 + 比例·大小·时长 */
export function formatThumbMetaLines(meta?: MediaAssetMeta): { line1?: string; line2?: string } {
  if (!meta) return {};
  const resolution = formatResolution(meta.width, meta.height);
  const parts: string[] = [];
  if (meta.aspectRatio) parts.push(meta.aspectRatio);
  parts.push(formatMediaSize(meta.fileSize));
  const duration = formatDuration(meta.duration);
  if (duration) parts.push(duration);
  return {
    line1: resolution,
    line2: parts.length ? parts.join(' · ') : undefined,
  };
}

/** 预览弹窗详情行 */
export function formatPreviewMetaItems(meta?: MediaAssetMeta): Array<{ key: string; value: string }> {
  if (!meta) return [];
  const items: Array<{ key: string; value: string }> = [];
  const resolution = formatResolution(meta.width, meta.height);
  if (resolution) items.push({ key: 'resolution', value: resolution });
  if (meta.aspectRatio) items.push({ key: 'ratio', value: meta.aspectRatio });
  items.push({ key: 'size', value: formatMediaSize(meta.fileSize) });
  const duration = formatDuration(meta.duration);
  if (duration) items.push({ key: 'duration', value: duration });
  return items;
}
