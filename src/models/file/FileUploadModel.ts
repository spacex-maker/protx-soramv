export interface FileUploadState {
  file: File;
  name: string;
  fileSize: number;
  status: 'pending' | 'uploading' | 'creating' | 'success' | 'error' | 'skipped' | 'paused';
  progress: number;
  speed?: number;
  isDuplicate?: boolean;
  action?: 'upload' | 'skip' | 'overwrite' | 'ask';
  errorMessage?: string;
  uploadCompleted?: boolean;
  fileCreated?: boolean;
  isEncrypted?: boolean;
  startTime?: number;
  lastTime?: number;
  lastProgress?: number;
  taskId?: string;
}

export interface FileStats {
  total: number;
  duplicates: number;
  succeeded: number;
  failed: number;
  uploading: number;
  skipped: number;
  progress: number;
}

export interface UploadStats {
  progress: number;
  speed: number;
  remainingTime: number;
  totalSize: number;
  uploadedSize: number;
} 