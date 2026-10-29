import instance from 'api/axios';
import type { Model } from '../ImageToImage/types';
import {
  computeKleinSize,
  isFluxKleinModel,
  KLEIN_DEFAULT_LONG_EDGE,
  KLEIN_DEFAULT_MODE,
  KLEIN_PENDING_I2I_KEY,
} from '../shared/fluxKleinParams';
import { pollKleinImageTask } from '../shared/kleinTaskPoll';

export async function fetchPreferredI2iModel(): Promise<Model | null> {
  const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
    params: { modelType: 'i2i' },
  });
  const list: Model[] = response.data?.success ? response.data.data || [] : [];
  if (!list.length) return null;
  const klein = list.find((m) => isFluxKleinModel(m));
  return klein || list[0];
}

export async function uploadImageToCos(file: File): Promise<string> {
  const { cosService } = await import('services/cos');
  const { getUserStorageNodes } = await import('services/storageService');

  const storedUserInfo = localStorage.getItem('userInfo');
  if (!storedUserInfo) {
    throw new Error('用户未登录');
  }
  const userInfo = JSON.parse(storedUserInfo);
  const fullPath = `${userInfo.username}/`;

  const nodesResponse = await getUserStorageNodes();
  if (!nodesResponse.success || !nodesResponse.data?.length) {
    throw new Error('未找到可用的存储节点');
  }

  const defaultNode = nodesResponse.data.find((node) => node.isDefault);
  const nodeId = defaultNode ? defaultNode.id : nodesResponse.data[0].id;

  const uploadResult = await (cosService as { uploadFile: (...args: unknown[]) => Promise<{ url?: string }> }).uploadFile(
    file,
    fullPath,
    () => {},
    false,
    false,
    null,
    null,
    nodeId,
  );

  if (uploadResult?.url) {
    return uploadResult.url;
  }
  throw new Error('上传成功但未返回 URL');
}

export async function uploadImageFiles(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadImageToCos(file));
  }
  return urls;
}

export type GenerateKleinResult =
  | { ok: true; url: string }
  | { ok: false; error: string; timeout?: boolean };

export async function generateKleinImage(params: {
  model: Model;
  imageUrls: string[];
  prompt: string;
  aspectRatio: string;
  kleinMode: 'edit' | 'denoise';
  signal?: AbortSignal;
}): Promise<GenerateKleinResult> {
  const { width, height } = computeKleinSize(KLEIN_DEFAULT_LONG_EDGE, params.aspectRatio);
  const requestData: Record<string, unknown> = {
    modelCode: params.model.modelCode,
    imageUrls: params.imageUrls,
    prompt: params.prompt,
    width,
    height,
    size: `${width}x${height}`,
    aspectRatio: params.aspectRatio,
    kleinMode: params.kleinMode || KLEIN_DEFAULT_MODE,
  };

  const response = await instance.post('/productx/sa-ai-models/image/generate/image', requestData, {
    timeout: 15_000,
    signal: params.signal,
  });

  if (!response.data?.success) {
    return { ok: false, error: response.data?.message || '生成失败' };
  }

  const data = response.data.data;
  const taskId = data?.id ?? data?.taskId;
  const status = String(data?.status || '').toLowerCase();

  if (taskId && status !== 'completed' && status !== 'success') {
    const poll = await pollKleinImageTask(taskId, {
      pendingKey: KLEIN_PENDING_I2I_KEY,
      signal: params.signal,
    });
    if (poll.status === 'completed' && poll.urls[0]) {
      return { ok: true, url: poll.urls[0] };
    }
    if (poll.status === 'timeout') {
      return { ok: false, error: poll.error || '任务仍在处理，稍后可在历史记录查看', timeout: true };
    }
    return { ok: false, error: poll.error || '生成失败' };
  }

  const rawList =
    response.data.images ||
    data?.images ||
    data?.resultUrls ||
    (data?.imageUrl ? [data.imageUrl] : []);
  const url = Array.isArray(rawList) ? rawList.filter(Boolean)[0] : undefined;
  if (url) {
    return { ok: true, url: String(url) };
  }
  return { ok: false, error: '未返回图片' };
}
