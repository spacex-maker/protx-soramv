// 规范化图片数据
export const normalizeImageSource = (image: string): string => {
  if (!image) return '';
  const trimmed = image.trim();
  if (trimmed.startsWith('data:image')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//') && typeof window !== 'undefined') {
    return `${window.location.protocol}${trimmed}`;
  }
  if (trimmed.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${trimmed}`;
  }
  return `data:image/png;base64,${trimmed}`;
};

export const normalizeImageData = (image: any): string | null => {
  if (!image) return null;
  const source = typeof image === 'string' ? image : image.url || image.base64 || image.data || '';
  if (!source) return null;
  return normalizeImageSource(source);
};

// 从URL获取图片并转换为File
export const urlToFile = async (url: string): Promise<File> => {
  try {
    let blob: Blob;
    let fileName = 'image.png';
    let mimeType = 'image/png';
    
    // 处理 base64 数据
    if (url.startsWith('data:image')) {
      const base64Data = url.split(',')[1];
      const mimeMatch = url.match(/data:image\/([^;]+)/);
      if (mimeMatch) {
        mimeType = `image/${mimeMatch[1]}`;
        const extension = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
        fileName = `image.${extension}`;
      }
      
      // 将 base64 转换为 Blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: mimeType });
    } else {
      // 处理 HTTP URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      blob = await response.blob();
      
      // 尝试从 URL 或 Content-Type 获取文件名和类型
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        mimeType = contentType;
        const extension = contentType.split('/')[1];
        fileName = `image.${extension === 'jpeg' ? 'jpg' : extension}`;
      }
      
      // 尝试从 URL 路径获取文件名
      const urlPath = url.split('/').pop();
      if (urlPath && urlPath.includes('.')) {
        fileName = urlPath.split('?')[0]; // 移除查询参数
      }
    }
    
    const file = new File([blob], fileName, { type: mimeType });
    return file;
  } catch (error: any) {
    console.error('从URL获取图片失败:', error);
    throw new Error('从URL获取图片失败: ' + (error.message || '未知错误'));
  }
};

// 上传图片到服务器
export const uploadImageToServer = async (file: File | Blob | null | undefined): Promise<string> => {
  try {
    // 验证文件
    if (!file) {
      throw new Error('文件不能为空');
    }
    
    // 确保是 File 或 Blob 对象
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error('无效的文件对象，必须是 File 或 Blob 类型');
    }
    
    // 如果是 Blob，转换为 File
    let fileToUpload: File;
    if (file instanceof Blob && !(file instanceof File)) {
      const fileName = (file as any).name || `image_${Date.now()}.png`;
      const fileType = file.type || 'image/png';
      fileToUpload = new File([file], fileName, { type: fileType });
    } else {
      fileToUpload = file as File;
    }
    
    // 确保文件有 name 属性
    if (!fileToUpload.name) {
      const timestamp = Date.now();
      const extension = fileToUpload.type?.split('/')[1]?.split(';')[0] || 'png';
      fileToUpload = new File([fileToUpload], `image_${timestamp}.${extension}`, { 
        type: fileToUpload.type || 'image/png' 
      });
    }
    
    // 验证文件大小
    if (fileToUpload.size === 0) {
      throw new Error('文件大小不能为0');
    }
    
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
    
    const defaultNode = nodesResponse.data.find(node => node.isDefault);
    const nodeId = defaultNode ? defaultNode.id : nodesResponse.data[0].id;
    
    console.log('准备上传文件:', {
      name: fileToUpload.name,
      size: fileToUpload.size,
      type: fileToUpload.type,
      isFile: fileToUpload instanceof File,
      isBlob: fileToUpload instanceof Blob
    });
    
    const uploadResult = await (cosService as any).uploadFile(
      fileToUpload,
      fullPath,
      () => {},
      false,
      false,
      null,
      null,
      nodeId
    );
    
    if (uploadResult && uploadResult.url) {
      return uploadResult.url;
    } else {
      throw new Error('上传成功但未返回URL');
    }
  } catch (error: any) {
    console.error('上传图片到COS失败:', error);
    throw new Error(error.message || '上传图片失败');
  }
};

