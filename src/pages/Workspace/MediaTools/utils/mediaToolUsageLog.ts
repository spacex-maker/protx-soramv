import { mediaToolUsageApi } from 'api/mediaToolUsage';

export type MediaToolCode =
  | 'image_compress'
  | 'video_compress'
  | 'audio_compress'
  | 'video_convert'
  | 'video_clip'
  | 'audio_convert'
  | 'audio_clip';

export type MediaToolAction = 'process' | 'download' | 'cancel' | 'tab_view';

export interface MediaToolUsageParams {
  toolCode: MediaToolCode;
  action?: MediaToolAction;
  inputFormat?: string;
  outputFormat?: string;
  inputSizeBytes?: number;
  outputSizeBytes?: number;
  durationMs?: number;
  batchCount?: number;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

const SESSION_KEY = 'media_tool_session_id';

const getClientSessionId = (): string => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const getSourcePage = (): 'workspace' | 'public' => {
  const path = window.location.pathname;
  return path.includes('/workspace') ? 'workspace' : 'public';
};

export const createMediaToolUsageTimer = (): (() => number) => {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
};

export const logMediaToolUsage = (params: MediaToolUsageParams): void => {
  mediaToolUsageApi.log({
    toolCode: params.toolCode,
    action: params.action ?? 'process',
    inputFormat: params.inputFormat,
    outputFormat: params.outputFormat,
    inputSizeBytes: params.inputSizeBytes,
    outputSizeBytes: params.outputSizeBytes,
    durationMs: params.durationMs,
    batchCount: params.batchCount,
    success: params.success ?? true,
    errorMessage: params.errorMessage,
    metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
    clientSessionId: getClientSessionId(),
    sourcePage: getSourcePage(),
  }).catch((error) => {
    console.warn('[MediaToolUsage] failed to log usage:', error);
  });
};

export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};
