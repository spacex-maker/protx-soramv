/**
 * Upload a local file to the user's Tencent COS and return a public HTTPS URL
 * (same path as ImageToVideo — Seedance receives COS URLs, not Volc uploads).
 */
export async function uploadFileToCos(file: File): Promise<string> {
  const { cosService } = await import('services/cos');
  const { getUserStorageNodes } = await import('services/storageService');

  const storedUserInfo = localStorage.getItem('userInfo');
  if (!storedUserInfo) {
    throw new Error('用户未登录');
  }
  const userInfo = JSON.parse(storedUserInfo);
  const fullPath = `${userInfo.username}/`;

  const nodesResponse = await getUserStorageNodes();
  if (!nodesResponse.success || !nodesResponse.data || nodesResponse.data.length === 0) {
    throw new Error('未找到可用的存储节点');
  }

  const defaultNode = nodesResponse.data.find((node) => node.isDefault);
  const nodeId = defaultNode ? defaultNode.id : nodesResponse.data[0].id;

  const onProgress = (progress: number, speed: number) => {
    if (progress % 25 === 0 || progress === 100) {
      console.log(
        `上传进度: ${progress}%`,
        speed > 0 ? `速度: ${(speed / 1024 / 1024).toFixed(2)} MB/s` : ''
      );
    }
  };

  const uploadResult = await (cosService as any).uploadFile(
    file,
    fullPath,
    onProgress,
    false,
    false,
    null,
    null,
    nodeId
  );

  if (uploadResult && uploadResult.url) {
    return uploadResult.url as string;
  }
  throw new Error('上传成功但未返回URL');
}
