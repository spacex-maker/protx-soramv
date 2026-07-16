import type { MediaAsset } from './constants';
import type { AssetUploadProgress } from './GenerateUploadButton';
import { uploadFileToCos } from './uploadToCos';

async function uploadAssetList(
  assets: MediaAsset[],
  ctx: {
    totalBytes: number;
    totalCount: number;
    completedBytes: number;
    pendingIndex: number;
    onProgress?: (progress: AssetUploadProgress) => void;
  }
): Promise<string[]> {
  const urls: string[] = [];

  for (const asset of assets) {
    if (asset.remoteUrl) {
      urls.push(asset.remoteUrl);
      continue;
    }

    ctx.pendingIndex += 1;
    const currentIndex = ctx.pendingIndex;

    const url = await uploadFileToCos(asset.file, (percent, speed) => {
      const currentBytes = (percent / 100) * asset.file.size;
      const overallPercent =
        ctx.totalBytes > 0
          ? Math.min(
              100,
              Math.round(((ctx.completedBytes + currentBytes) / ctx.totalBytes) * 100)
            )
          : 100;

      ctx.onProgress?.({
        overallPercent,
        currentFileName: asset.file.name,
        currentIndex,
        totalCount: ctx.totalCount,
        speed,
      });
    });

    ctx.completedBytes += asset.file.size;
    asset.remoteUrl = url;
    urls.push(url);

    ctx.onProgress?.({
      overallPercent:
        ctx.totalBytes > 0
          ? Math.min(100, Math.round((ctx.completedBytes / ctx.totalBytes) * 100))
          : 100,
      currentFileName: asset.file.name,
      currentIndex,
      totalCount: ctx.totalCount,
      speed: 0,
    });
  }

  return urls;
}

export async function uploadAllMediaAssets(
  videos: MediaAsset[],
  images: MediaAsset[],
  audios: MediaAsset[],
  onProgress?: (progress: AssetUploadProgress) => void
): Promise<{ videoUrls: string[]; imageUrls: string[]; audioUrls: string[] }> {
  const allAssets = [...videos, ...images, ...audios];
  const pending = allAssets.filter((asset) => !asset.remoteUrl);
  const totalBytes = pending.reduce((sum, asset) => sum + asset.file.size, 0);

  const ctx = {
    totalBytes,
    totalCount: pending.length,
    completedBytes: 0,
    pendingIndex: 0,
    onProgress,
  };

  const videoUrls = await uploadAssetList(videos, ctx);
  const imageUrls = await uploadAssetList(images, ctx);
  const audioUrls = await uploadAssetList(audios, ctx);

  return { videoUrls, imageUrls, audioUrls };
}

export async function ensureRemoteUrls(
  assets: MediaAsset[],
  onProgress?: (progress: AssetUploadProgress) => void
): Promise<string[]> {
  return uploadAssetList(assets, {
    totalBytes: assets.filter((asset) => !asset.remoteUrl).reduce((sum, asset) => sum + asset.file.size, 0),
    totalCount: assets.filter((asset) => !asset.remoteUrl).length,
    completedBytes: 0,
    pendingIndex: 0,
    onProgress,
  });
}
