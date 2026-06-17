import { isVideoUrl, modelCoverUrl } from '../ImageToVideo/utils';

const blobUrlByOriginal = new Map<string, string>();
const loadingByOriginal = new Map<string, Promise<string>>();

const addImageCompressSuffix = (url: string, width = 600): string => {
  if (!url.includes('imageMogr2') && !url.startsWith('data:')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}imageMogr2/format/webp/quality/85/thumbnail/${width}x`;
  }
  return url;
};

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

async function fetchVideoToBlobUrl(url: string): Promise<string> {
  const cached = blobUrlByOriginal.get(url);
  if (cached) return cached;

  let pending = loadingByOriginal.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        blobUrlByOriginal.set(url, blobUrl);
        loadingByOriginal.delete(url);
        return blobUrl;
      })
      .catch(() => {
        loadingByOriginal.delete(url);
        return url;
      });
    loadingByOriginal.set(url, pending);
  }

  return pending;
}

/** 播放时优先使用已预加载的 blob URL */
export async function resolveCoverPlaybackUrl(url: string): Promise<string> {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (!isVideoUrl(url)) return url;
  return fetchVideoToBlobUrl(url);
}

export function getPreloadedCoverUrl(url: string): string | null {
  return blobUrlByOriginal.get(url) ?? null;
}

/**
 * 进入视频生成 Tab 后预加载模型封面（视频 blob + 图片）。
 * 默认并发 2，避免占满带宽；priorityModelId 对应封面最先加载。
 */
export function preloadVideoModelCovers(
  models: Array<{ id?: number; coverImage?: unknown; cover_image?: unknown }>,
  options?: { priorityModelId?: number; concurrency?: number },
): void {
  if (!models?.length || typeof window === 'undefined') return;

  const concurrency = Math.max(1, options?.concurrency ?? 2);
  const videoUrls: { url: string; priority: number }[] = [];
  const imageTasks: Promise<void>[] = [];

  models.forEach((model, index) => {
    const cover = modelCoverUrl(model);
    if (!cover) return;

    const priority =
      model.id != null && model.id === options?.priorityModelId
        ? 0
        : index + 1;

    if (isVideoUrl(cover)) {
      videoUrls.push({ url: cover, priority });
    } else {
      imageTasks.push(preloadImage(addImageCompressSuffix(cover, 400)));
      imageTasks.push(preloadImage(addImageCompressSuffix(cover, 600)));
    }
  });

  void Promise.all(imageTasks);

  videoUrls.sort((a, b) => a.priority - b.priority);

  let cursor = 0;
  const worker = async () => {
    while (cursor < videoUrls.length) {
      const current = videoUrls[cursor];
      cursor += 1;
      if (current) {
        await fetchVideoToBlobUrl(current.url);
      }
    }
  };

  void Promise.all(Array.from({ length: Math.min(concurrency, videoUrls.length) }, () => worker()));
}

export function clearVideoModelCoverPreloadCache(): void {
  blobUrlByOriginal.forEach((blobUrl) => {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  });
  blobUrlByOriginal.clear();
  loadingByOriginal.clear();
}
