import { TaskDetail, TaskOutputFile } from './types';

export const isVideoMediaFile = (url?: string, fileType?: string) => {
  if (fileType && /video/i.test(fileType)) return true;
  return /\.(mp4|webm|mov|ogg|mkv)(\?|$)/i.test(url || '');
};

export const resolvePublishMediaType = (taskDetail: TaskDetail | null): 'IMAGE' | 'VIDEO' => {
  if (taskDetail?.outputType === 'video') return 'VIDEO';
  if (taskDetail?.outputFiles?.some((file) => isVideoMediaFile(file.fileUrl, file.fileType))) {
    return 'VIDEO';
  }
  return 'IMAGE';
};

export const getPublishCoverUrl = (
  file: TaskOutputFile,
  taskDetail: TaskDetail | null,
  index: number,
) => {
  if (isVideoMediaFile(file.fileUrl, file.fileType)) {
    return taskDetail?.thumbnailUrl || file.fileUrl;
  }
  return file.fileUrl;
};

export const attachHorizontalWheelScroll = (element: HTMLElement | null) => {
  if (!element) return undefined;

  const onWheel = (event: WheelEvent) => {
    if (element.scrollWidth <= element.clientWidth) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    element.scrollLeft += event.deltaY;
  };

  element.addEventListener('wheel', onWheel, { passive: false });
  return () => element.removeEventListener('wheel', onWheel);
};
