import COS from 'cos-js-sdk-v5';
import instance from './axios';

export interface KycCosCredential {
  secretId: string;
  secretKey: string;
  sessionToken: string;
  host: string;
  bucketName: string;
  region: string;
  pathPrefix: string;
}

const DEFAULT_PATH_PREFIX = 'userKyc/';

const inferFileExtension = (file: File): string => {
  const name = file.name || '';
  const dot = name.lastIndexOf('.');
  if (dot > 0 && dot < name.length - 1) {
    return name.slice(dot).toLowerCase();
  }
  const type = file.type || '';
  if (type.includes('png')) return '.png';
  if (type.includes('webp')) return '.webp';
  if (type.includes('gif')) return '.gif';
  if (type.includes('heic')) return '.heic';
  if (type.includes('heif')) return '.heif';
  return '.jpg';
};

const buildObjectKey = (file: File, pathPrefix: string): string => {
  const prefix = pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`;
  const ext = inferFileExtension(file);
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}${id}${ext}`;
};

/** 获取实名认证证件图 COS 临时凭证（仅鉴权，文件不经过后端） */
export const fetchKycCosCredential = async (countryCode: string): Promise<KycCosCredential> => {
  const { data } = await instance.get('/productx/user/verification/cos-credential', {
    params: { countryCode },
  });
  if (!data?.success || !data?.data) {
    throw new Error(data?.message || '获取 COS 临时凭证失败');
  }
  return data.data as KycCosCredential;
};

const uploadFileDirectToCos = async (
  file: File,
  cred: KycCosCredential,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const bucket = cred.bucketName;
  const region = cred.region;
  const key = buildObjectKey(file, cred.pathPrefix || DEFAULT_PATH_PREFIX);

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

    const options = {
      Bucket: bucket,
      Region: region,
      Key: key,
      Body: file,
      onProgress: handleProgress,
    };

    if (useChunkUpload) {
      cos.sliceUploadFile(
        {
          ...options,
          ChunkSize: 1024 * 1024 * 8,
        },
        callback
      );
    } else {
      cos.putObject(options, callback);
    }
  });

  const host = cred.host?.endsWith('/') ? cred.host : `${cred.host}/`;
  return `${host}${key}`;
};

/** 实名认证证件图直传 COS，返回可入库的 URL */
export const uploadKycImageToCos = async (
  file: File,
  countryCode: string,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const cred = await fetchKycCosCredential(countryCode);
  return uploadFileDirectToCos(file, cred, onProgress);
};

export interface KycVerificationSubmitPayload {
  countryCode: string;
  realName: string;
  idType: string;
  cardNum: string;
  idFrontPhotoUrl?: string;
  idBackPhotoUrl?: string;
}

export const submitKycVerification = async (payload: KycVerificationSubmitPayload) => {
  const { data } = await instance.post('/productx/user/verification', payload);
  return data;
};
