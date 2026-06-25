import COS from 'cos-js-sdk-v5';
import instance from './axios';

/** COS 固定路径，产线 deploy-core.sh 从此路径拉取 */
export const CORE_JAR_COS_KEY = 'deploy/core/core-0.0.1.jar';

export interface CoreDeployUploadResult {
  cosKey: string;
  jarFileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy?: string;
  downloadUrl: string;
}

interface CosCredentialPayload {
  secretId: string;
  secretKey: string;
  sessionToken: string;
  host: string;
  bucketName?: string;
  region?: string;
  cosKey?: string;
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

/** 获取 Core 部署专用 COS 临时凭证（仅鉴权，文件不经过后端） */
const fetchCoreDeployCosCredential = async (): Promise<CosCredentialPayload> => {
  const { data } = await instance.get('/productx/core-deploy/cos-credential');
  if (!data?.success || !data?.data) {
    throw new Error(data?.message || '获取 COS 临时凭证失败');
  }
  return data.data as CosCredentialPayload;
};

/** 经后端 multipart 上传（旧版接口，cos-credential 不可用时的回退） */
const uploadCoreJarViaServer = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; message?: string; data?: CoreDeployUploadResult }> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await instance.post('/productx/core-deploy/upload-jar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  if (!data?.success) {
    return { success: false, message: data?.message || '上传失败' };
  }
  return { success: true, message: data.message, data: data.data as CoreDeployUploadResult };
};

const uploadCoreJarDirectToCos = async (
  file: File,
  cred: CosCredentialPayload,
  onProgress?: (percent: number) => void
): Promise<CoreDeployUploadResult> => {
  const bucket = cred.bucketName || 'public-1258150206';
  const region = cred.region || 'ap-nanjing';
  const key = cred.cosKey || CORE_JAR_COS_KEY;

  const cos = new COS({
    SecretId: cred.secretId,
    SecretKey: cred.secretKey,
    SecurityToken: cred.sessionToken,
    Protocol: 'https:',
    UploadCheckContentMd5: true,
  });

  const useChunkUpload = file.size > 20 * 1024 * 1024;

  await new Promise<void>((resolve, reject) => {
    const handleProgress = (progressData: { percent: number }) => {
      if (onProgress) {
        onProgress(Math.min(Math.round(progressData.percent * 100), 100));
      }
    };

    const callback = (err: COS.CosError | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    };

    if (useChunkUpload) {
      cos.sliceUploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: file,
          ChunkSize: 1024 * 1024 * 8,
          onProgress: handleProgress,
        },
        callback
      );
    } else {
      cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: file,
          onProgress: handleProgress,
        },
        callback
      );
    }
  });

  const host = cred.host?.endsWith('/') ? cred.host : `${cred.host}/`;

  return {
    cosKey: key,
    jarFileName: 'core-0.0.1.jar',
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    downloadUrl: `${host}${key}`,
  };
};

/**
 * 上传 core JAR：优先浏览器直传 COS；若 cos-credential 接口不可用则回退经后端上传。
 */
export const uploadCoreJar = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; message?: string; data?: CoreDeployUploadResult }> => {
  try {
    const cred = await fetchCoreDeployCosCredential();
    const data = await uploadCoreJarDirectToCos(file, cred, onProgress);
    return { success: true, data };
  } catch (directError) {
    try {
      return await uploadCoreJarViaServer(file, onProgress);
    } catch (serverError: unknown) {
      const directMsg = directError instanceof Error ? directError.message : String(directError);
      const serverErr = serverError as { response?: { data?: { message?: string } }; message?: string };
      const serverMsg = serverErr?.response?.data?.message || serverErr?.message || '上传失败';
      throw new Error(serverMsg || directMsg);
    }
  }
};
