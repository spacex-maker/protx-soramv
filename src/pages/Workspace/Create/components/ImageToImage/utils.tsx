import React from 'react';
import {
  DesktopOutlined,
  MobileOutlined,
  AppstoreOutlined,
  TabletOutlined,
  BorderOutlined,
} from '@ant-design/icons';

// 根据比例值获取对应的图标和标签
export const getAspectRatioOption = (ratio: string, intl: any) => {
  const ratioMap: { [key: string]: { labelKey: string; defaultLabel: string; icon: React.ReactNode } } = {
    '1:1': {
      labelKey: 'create.aspectRatio.1:1',
      defaultLabel: '1:1 (Square)',
      icon: <AppstoreOutlined />
    },
    '2:3': {
      labelKey: 'create.aspectRatio.2:3',
      defaultLabel: '2:3 (Portrait)',
      icon: <MobileOutlined />
    },
    '3:2': {
      labelKey: 'create.aspectRatio.3:2',
      defaultLabel: '3:2 (Landscape)',
      icon: <DesktopOutlined />
    },
    '3:4': {
      labelKey: 'create.aspectRatio.3:4',
      defaultLabel: '3:4 (Portrait Classic)',
      icon: <MobileOutlined />
    },
    '4:3': {
      labelKey: 'create.aspectRatio.4:3',
      defaultLabel: '4:3 (Classic)',
      icon: <TabletOutlined />
    },
    '4:5': {
      labelKey: 'create.aspectRatio.4:5',
      defaultLabel: '4:5 (Portrait)',
      icon: <MobileOutlined />
    },
    '5:4': {
      labelKey: 'create.aspectRatio.5:4',
      defaultLabel: '5:4 (Landscape)',
      icon: <DesktopOutlined />
    },
    '9:16': {
      labelKey: 'create.aspectRatio.9:16',
      defaultLabel: '9:16 (Portrait)',
      icon: <MobileOutlined />
    },
    '16:9': {
      labelKey: 'create.aspectRatio.16:9',
      defaultLabel: '16:9 (Landscape)',
      icon: <DesktopOutlined />
    },
    '21:9': {
      labelKey: 'create.aspectRatio.21:9',
      defaultLabel: '21:9 (Cinema)',
      icon: <DesktopOutlined />
    },
    'auto': {
      labelKey: 'create.aspectRatio.auto',
      defaultLabel: 'Auto',
      icon: <BorderOutlined />
    },
  };

  const option = ratioMap[ratio.toLowerCase()];
  if (option) {
    return {
      label: intl.formatMessage({ id: option.labelKey, defaultMessage: option.defaultLabel }),
      value: ratio,
      icon: option.icon
    };
  }

  // 如果没有预定义的比例，返回默认格式
  return {
    label: ratio,
    value: ratio,
    icon: <BorderOutlined />
  };
};

// 判断 URL 是否是图片
export const isImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '') || url.startsWith('data:image');
};

// 规范化 URL
export const normalizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

// 获取模型支持的图片比例列表
export const getModelAspectRatios = (model: { imageAspectRatios?: string | null; imageAspectRatiosEnum?: string | null } | null): string[] => {
  if (!model) return [];
  
  // 优先使用 imageAspectRatios
  if (model.imageAspectRatios) {
    return model.imageAspectRatios.split(',').map(r => r.trim()).filter(r => r);
  }
  
  // 如果 imageAspectRatios 为空，使用 imageAspectRatiosEnum（以逗号分隔的枚举值）
  if (model.imageAspectRatiosEnum) {
    return model.imageAspectRatiosEnum.split(',').map(r => r.trim()).filter(r => r);
  }
  
  return [];
};

// 获取模型支持的分辨率选项
export const getModelResolutions = (model: { imageMaxResolution?: string | null } | null): string[] => {
  if (!model) return ['1K', '2K', '4K'];
  
  // 根据 imageMaxResolution 返回可选的分辨率
  const resolutions = ['1K', '2K', '4K'];
  if (model.imageMaxResolution) {
    // 根据最大分辨率过滤
    if (model.imageMaxResolution === '1K') {
      return ['1K'];
    } else if (model.imageMaxResolution === '2K') {
      return ['1K', '2K'];
    }
  }
  
  return resolutions;
};

// 获取模型支持的输出格式
export const getModelOutputFormats = (model: { imageFormats?: string | null } | null): string[] => {
  if (!model || !model.imageFormats) return ['png', 'jpg'];
  
  return model.imageFormats.split(',').map(f => f.trim().toLowerCase()).filter(f => f);
};

// 将文件转换为 base64 预览 URL
export const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// 上传图片到COS（返回URL）
export const uploadImageToServer = async (file: File): Promise<string> => {
  try {
    // 动态导入 cosService 和 getUserStorageNodes
    const { cosService } = await import('services/cos');
    const { getUserStorageNodes } = await import('services/storageService');
    
    // 获取用户信息
    const storedUserInfo = localStorage.getItem('userInfo');
    if (!storedUserInfo) {
      throw new Error('用户未登录');
    }
    const userInfo = JSON.parse(storedUserInfo);
    const fullPath = `${userInfo.username}/`;
    
    // 获取用户的默认存储节点
    const nodesResponse = await getUserStorageNodes();
    if (!nodesResponse.success || !nodesResponse.data || nodesResponse.data.length === 0) {
      throw new Error('未找到可用的存储节点');
    }
    
    // 找到默认节点或使用第一个节点
    const defaultNode = nodesResponse.data.find(node => node.isDefault);
    const nodeId = defaultNode ? defaultNode.id : nodesResponse.data[0].id;
    
    console.log('使用存储节点:', nodeId);
    
    // 上传进度回调（可选：显示上传进度）
    const onProgress = (progress: number, speed: number) => {
      console.log(`上传进度: ${progress.toFixed(1)}%`, speed > 0 ? `速度: ${(speed / 1024 / 1024).toFixed(2)} MB/s` : '');
    };
    
    // 上传到COS
    const uploadResult = await (cosService as any).uploadFile(
      file,
      fullPath,
      onProgress, // 进度回调函数
      false, // useChunkUpload
      false, // useAccelerate
      null, // resumeData
      null, // bucketName (使用默认值)
      nodeId // 传递节点ID
    );
    
    if (uploadResult && uploadResult.url) {
      console.log('图片上传成功，URL:', uploadResult.url);
      return uploadResult.url;
    } else {
      throw new Error('上传成功但未返回URL');
    }
  } catch (error: any) {
    console.error('上传图片到COS失败:', error);
    throw new Error(error.message || '上传图片失败');
  }
};

/**
 * 获取图片的原始尺寸 (宽/高)
 * 优先使用腾讯云COS的imageInfo接口，失败则降级为加载图片获取
 * @param src 图片地址
 */
export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise(async (resolve, reject) => {
    // 如果是base64图片，直接加载获取尺寸
    if (src.startsWith('data:')) {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = src;
      return;
    }

    // 如果是腾讯云COS图片，尝试使用imageInfo接口
    if (src.includes('myqcloud.com') || src.includes('cos.')) {
      try {
        // 移除已有的查询参数中的imageInfo/imageMogr2等
        const baseUrl = src.split('?')[0];
        const infoUrl = `${baseUrl}?imageInfo`;
        
        const response = await fetch(infoUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.width && data.height) {
            resolve({ width: data.width, height: data.height });
            return;
          }
        }
      } catch (error) {
        console.warn('[getImageDimensions] 使用imageInfo获取尺寸失败，降级为加载图片:', error);
      }
    }

    // 降级方案：直接加载图片获取尺寸
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域问题
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = src;
  });
};