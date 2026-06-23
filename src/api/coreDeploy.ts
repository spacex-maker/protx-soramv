import instance from './axios';

export interface CoreDeployUploadResult {
  cosKey: string;
  jarFileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  downloadUrl: string;
}

export const checkCoreDeployPermission = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const { data } = await instance.get('/productx/core-deploy/check-permission');
    return Boolean(data?.success && data?.data);
  } catch {
    return false;
  }
};

export const uploadCoreJar = async (
  file: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await instance.post('/productx/core-deploy/upload-jar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000,
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
};
