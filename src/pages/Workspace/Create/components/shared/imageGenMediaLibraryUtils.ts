import instance from 'api/axios';
import {
  addImageCompressSuffix,
  normalizeResultUrls,
} from 'pages/Works/genTaskWorksUtils';

export type ImageLibraryTaskType = 't2i' | 'i2i';

export interface ImageLibraryTask {
  id: number;
  taskType: ImageLibraryTaskType;
  prompt?: string;
  resultUrls: string[];
  createTime?: string;
  modelName?: string;
}

export interface ImageLibraryItem {
  key: string;
  taskId: number;
  taskType: ImageLibraryTaskType;
  imageUrl: string;
  imageIndex: number;
  prompt?: string;
  createTime?: string;
  modelName?: string;
}

const normalizeTask = (
  raw: Record<string, unknown>,
  taskType: ImageLibraryTaskType,
): ImageLibraryTask => ({
  id: Number(raw.id),
  taskType,
  prompt: typeof raw.prompt === 'string' ? raw.prompt : undefined,
  resultUrls: normalizeResultUrls(raw.resultUrls),
  createTime: typeof raw.createTime === 'string' ? raw.createTime : undefined,
  modelName: typeof raw.modelName === 'string' ? raw.modelName : undefined,
});

export const flattenTasksToImageItems = (tasks: ImageLibraryTask[]): ImageLibraryItem[] => {
  const items: ImageLibraryItem[] = [];
  tasks.forEach((task) => {
    task.resultUrls.forEach((url, index) => {
      if (!url) return;
      items.push({
        key: `${task.id}-${index}`,
        taskId: task.id,
        taskType: task.taskType,
        imageUrl: url,
        imageIndex: index,
        prompt: task.prompt,
        createTime: task.createTime,
        modelName: task.modelName,
      });
    });
  });
  return items;
};

export const fetchImageLibraryTasks = async (
  taskType: ImageLibraryTaskType,
  page = 1,
  pageSize = 12,
): Promise<{ records: ImageLibraryTask[]; total: number }> => {
  const response = await instance.get('/productx/sa-ai-gen-task/my-tasks/page', {
    params: { currentPage: page, pageSize, taskType, successOnly: true },
  });

  if (!response.data?.success || !response.data?.data) {
    throw new Error(response.data?.message || 'fetch failed');
  }

  const records = (response.data.data.records || [])
    .map((task: Record<string, unknown>) => normalizeTask(task, taskType))
    .filter((task: ImageLibraryTask) => task.resultUrls.length > 0);

  return {
    records,
    total: response.data.data.totalNum || 0,
  };
};

export const getImagePreviewUrl = (url: string, width = 320): string =>
  addImageCompressSuffix(url, width);

const IMAGE_EXT_PATTERN = /\.(jpg|jpeg|png|webp|gif|bmp)(\?|$)/i;

export const guessImageFilename = (url: string, item: ImageLibraryItem): string => {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split('/').pop() || '';
    if (base && IMAGE_EXT_PATTERN.test(base)) {
      return decodeURIComponent(base.split('?')[0]);
    }
  } catch {
    // ignore invalid URL
  }

  const slug = (item.prompt || 'image')
    .trim()
    .slice(0, 24)
    .replace(/[^\w\u4e00-\u9fff-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'image';

  return `${slug}_${item.taskId}_${item.imageIndex}.jpg`;
};

export const fetchImageAsFile = async (url: string, item: ImageLibraryItem): Promise<File> => {
  const filename = guessImageFilename(url, item);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const fallbackMime: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
  };
  const mime = blob.type && blob.type.startsWith('image/')
    ? blob.type
    : (fallbackMime[ext] || 'image/jpeg');

  return new File([blob], filename, { type: mime });
};
