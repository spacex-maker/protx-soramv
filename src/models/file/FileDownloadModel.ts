export interface DownloadTask {
  id: string;
  filename: string;
  size: number;
  progress: number;
  speed: number;
  status: 'downloading' | 'completed' | 'error';
  xhr?: XMLHttpRequest;
  totalBytes: number;
  loadedBytes: number;
} 