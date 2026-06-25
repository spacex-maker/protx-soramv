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

/**
 * 浏览器直传 core JAR 到 COS 固定路径，不经过后端业务服务器上传接口。
 */
export const uploadCoreJar = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; message?: string; data?: CoreDeployUploadResult }> => {
  const cred = await fetchCoreDeployCosCredential();
  const bucket = cred.bucketName || 'px-1258150206';
  const region = cred.region || 'ap-nanjing';
  const key = CORE_JAR_COS_KEY;

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
    success: true,
    data: {
      cosKey: key,
      jarFileName: 'core-0.0.1.jar',
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      downloadUrl: `${host}${key}`,
    },
  };
};
