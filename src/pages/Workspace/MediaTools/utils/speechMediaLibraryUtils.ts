import instance from 'api/axios';
import { normalizeResultUrls } from 'pages/Works/genTaskWorksUtils';

export interface SpeechLibraryTask {
  id: number;
  prompt?: string;
  resultUrls: string[];
  createTime?: string;
  modelName?: string;
  voiceCode?: string;
  voiceName?: string;
  voiceNameEn?: string;
}

const normalizeTask = (raw: Record<string, unknown>): SpeechLibraryTask => ({
  id: Number(raw.id),
  prompt: typeof raw.prompt === 'string' ? raw.prompt : undefined,
  resultUrls: normalizeResultUrls(raw.resultUrls),
  createTime: typeof raw.createTime === 'string' ? raw.createTime : undefined,
  modelName: typeof raw.modelName === 'string' ? raw.modelName : undefined,
  voiceCode: typeof raw.voiceCode === 'string' ? raw.voiceCode : undefined,
  voiceName: typeof raw.voiceName === 'string' ? raw.voiceName : undefined,
  voiceNameEn: typeof raw.voiceNameEn === 'string' ? raw.voiceNameEn : undefined,
});

export const fetchSpeechLibraryTasks = async (
  page = 1,
  pageSize = 12,
): Promise<{ records: SpeechLibraryTask[]; total: number }> => {
  const response = await instance.get('/productx/sa-ai-gen-task/my-tasks/page', {
    params: { currentPage: page, pageSize, taskType: 't2a', successOnly: true },
  });

  if (!response.data?.success || !response.data?.data) {
    throw new Error(response.data?.message || 'fetch failed');
  }

  const records = (response.data.data.records || [])
    .map((task: Record<string, unknown>) => normalizeTask(task))
    .filter((task: SpeechLibraryTask) => task.resultUrls.length > 0);

  return {
    records,
    total: response.data.data.totalNum || 0,
  };
};

const AUDIO_EXT_PATTERN = /\.(mp3|wav|aac|m4a|ogg|oga|flac)(\?|$)/i;

export const guessSpeechAudioFilename = (url: string, task: SpeechLibraryTask): string => {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split('/').pop() || '';
    if (base && AUDIO_EXT_PATTERN.test(base)) {
      return decodeURIComponent(base.split('?')[0]);
    }
  } catch {
    // ignore invalid URL
  }

  const slug = (task.prompt || 'speech')
    .trim()
    .slice(0, 24)
    .replace(/[^\w\u4e00-\u9fff-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'speech';

  return `${slug}_${task.id}.mp3`;
};

export const fetchSpeechAudioAsFile = async (
  url: string,
  task: SpeechLibraryTask,
): Promise<File> => {
  const filename = guessSpeechAudioFilename(url, task);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const ext = filename.split('.').pop()?.toLowerCase() || 'mp3';
  const fallbackMime: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    flac: 'audio/flac',
  };
  const mime = blob.type && blob.type.startsWith('audio/')
    ? blob.type
    : (fallbackMime[ext] || 'audio/mpeg');

  return new File([blob], filename, { type: mime });
};

export const resolveSpeechVoiceLabel = (
  task: SpeechLibraryTask,
  locale?: string,
): string | undefined => {
  const isZh = locale === 'zh' || locale === 'zh-CN';
  const label = isZh
    ? (task.voiceName || task.voiceCode)
    : (task.voiceNameEn || task.voiceName || task.voiceCode);
  return label?.trim() || undefined;
};
