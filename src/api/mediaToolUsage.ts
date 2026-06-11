import instance from './axios';

export interface MediaToolUsageLogPayload {
  toolCode: string;
  action?: string;
  inputFormat?: string;
  outputFormat?: string;
  inputSizeBytes?: number;
  outputSizeBytes?: number;
  durationMs?: number;
  batchCount?: number;
  success?: boolean;
  errorMessage?: string;
  metadata?: string;
  clientSessionId?: string;
  sourcePage?: string;
}

export interface MediaToolUsageLogListParams {
  currentPage?: number;
  pageSize?: number;
  toolCode?: string;
  action?: string;
  success?: boolean;
}

export const mediaToolUsageApi = {
  log(payload: MediaToolUsageLogPayload) {
    return instance.post('/productx/media-tool-usage/log', payload);
  },

  list(params: MediaToolUsageLogListParams = {}) {
    return instance.get('/productx/media-tool-usage/list', { params });
  },
};

export default mediaToolUsageApi;
