import dayjs from 'dayjs';

export const CREATION_TASK_TYPES = ['t2i', 't2v', 'i2i', 'i2v', 't2a', 'vclone'];

export const CREATION_TASK_TYPES_PARAM = CREATION_TASK_TYPES.join(',');

export const MEDIA_TYPE_TASK_TYPES = {
  image: 't2i,i2i',
  video: 't2v,i2v',
  audio: 't2a,vclone',
};

export const SOURCE_TAB_OPTIONS = [
  { key: 'all', taskTypes: CREATION_TASK_TYPES_PARAM },
  { key: 't2i', taskType: 't2i' },
  { key: 't2v', taskType: 't2v' },
  { key: 'i2i', taskType: 'i2i' },
  { key: 'i2v', taskType: 'i2v' },
  { key: 't2a', taskType: 't2a' },
  { key: 'vclone', taskType: 'vclone' },
];

export const isVideoUrl = (url) => /\.(mp4|webm|mov|ogg|mkv)(\?|$)/i.test(url || '');

export const normalizeResultUrls = (raw) => {
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === 'string' && !!item);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => typeof item === 'string' && !!item);
        }
      } catch {
        return [];
      }
    }
    if (trimmed.startsWith('http')) {
      return [trimmed];
    }
  }
  return [];
};

export const addImageCompressSuffix = (url, width = 480) => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

export const resolveMediaType = (task) => {
  if (task.outputType === 'audio' || task.taskType === 't2a' || task.taskType === 'vclone') return 'audio';
  if (task.outputType === 'video' || task.taskType === 't2v' || task.taskType === 'i2v') return 'video';
  return 'image';
};

export const getPreviewUrl = (task) => {
  const urls = normalizeResultUrls(task.resultUrls);
  const first = urls[0] || '';
  if (task.thumbnailUrl) return task.thumbnailUrl;
  if (resolveMediaType(task) === 'image' && first) {
    return addImageCompressSuffix(first);
  }
  return first || null;
};

export const getTaskTypeLabel = (taskType, intl) => {
  const labels = {
    t2i: intl.formatMessage({ id: 'works.source.t2i', defaultMessage: '文生图' }),
    t2v: intl.formatMessage({ id: 'works.source.t2v', defaultMessage: '文生视频' }),
    i2i: intl.formatMessage({ id: 'works.source.i2i', defaultMessage: '图生图' }),
    i2v: intl.formatMessage({ id: 'works.source.i2v', defaultMessage: '图生视频' }),
    t2a: intl.formatMessage({ id: 'works.source.t2a', defaultMessage: '语音生成' }),
    vclone: intl.formatMessage({ id: 'works.source.vclone', defaultMessage: '语音复刻' }),
  };
  return labels[taskType] || taskType;
};

export const buildFetchParams = ({ sourceTab, typeFilter, currentPage, pageSize }) => {
  const params = {
    currentPage,
    pageSize,
    successOnly: true,
  };

  if (sourceTab && sourceTab !== 'all') {
    params.taskType = sourceTab;
    return params;
  }

  if (typeFilter === 'image') {
    params.taskTypes = MEDIA_TYPE_TASK_TYPES.image;
  } else if (typeFilter === 'video') {
    params.taskTypes = MEDIA_TYPE_TASK_TYPES.video;
  } else if (typeFilter === 'audio') {
    params.taskTypes = MEDIA_TYPE_TASK_TYPES.audio;
  } else {
    params.taskTypes = CREATION_TASK_TYPES_PARAM;
  }

  return params;
};

export const mapTaskToWork = (task, intl) => {
  const urls = normalizeResultUrls(task.resultUrls);
  const mediaType = resolveMediaType(task);
  const url = urls[0] || '';
  const previewUrl = getPreviewUrl(task);
  const title = task.prompt?.trim()
    || task.voiceName
    || task.voiceNameEn
    || task.modelName
    || intl.formatMessage({ id: 'works.untitled', defaultMessage: '未命名作品' });

  return {
    id: task.id,
    taskType: task.taskType,
    taskTypeLabel: getTaskTypeLabel(task.taskType, intl),
    title,
    type: mediaType,
    thumbnail: previewUrl,
    url,
    resultUrls: urls,
    createdAt: task.createTime ? dayjs(task.createTime) : dayjs(),
    model: task.modelName,
    modelCode: task.modelCode,
    voiceName: task.voiceName || task.voiceNameEn,
    voiceCode: task.voiceCode,
    creditsCost: task.creditsCost,
    prompt: task.prompt,
    status: task.status,
    shareCode: task.shareCode,
    viewCount: task.viewCount ?? 0,
    raw: task,
  };
};

export const filterWorks = (works, { searchText, dateRange }) => {
  let filtered = [...works];

  if (searchText) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter((work) =>
      work.title.toLowerCase().includes(q)
      || (work.model || '').toLowerCase().includes(q)
      || (work.voiceName || '').toLowerCase().includes(q)
      || (work.prompt || '').toLowerCase().includes(q)
      || (work.taskTypeLabel || '').toLowerCase().includes(q));
  }

  if (dateRange && dateRange.length === 2) {
    filtered = filtered.filter((work) =>
      work.createdAt.isAfter(dateRange[0].startOf('day'))
      && work.createdAt.isBefore(dateRange[1].endOf('day')));
  }

  return filtered;
};

export const sortWorks = (works, sortBy, sortOrder) => {
  const sorted = [...works];
  sorted.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'model':
        comparison = (a.model || '').localeCompare(b.model || '');
        break;
      case 'date':
      default:
        comparison = a.createdAt.valueOf() - b.createdAt.valueOf();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  return sorted;
};

export const paginateWorks = (works, currentPage, pageSize) => {
  const start = (currentPage - 1) * pageSize;
  return works.slice(start, start + pageSize);
};
