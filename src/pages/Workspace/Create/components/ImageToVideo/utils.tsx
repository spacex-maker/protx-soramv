import React from 'react';
import {
  DesktopOutlined,
  MobileOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  TabletOutlined,
  BorderOutlined,
} from '@ant-design/icons';

// 根据比例值获取对应的图标和标签
export const getAspectRatioOption = (ratio: string, intl: any) => {
  const ratioMap: { [key: string]: { labelKey: string; defaultLabel: string; icon: React.ReactNode } } = {
    '16:9': {
      labelKey: 'create.aspectRatio.16:9',
      defaultLabel: '16:9 (Landscape)',
      icon: <DesktopOutlined />
    },
    '9:16': {
      labelKey: 'create.aspectRatio.9:16',
      defaultLabel: '9:16 (Portrait)',
      icon: <MobileOutlined />
    },
    '21:9': {
      labelKey: 'create.aspectRatio.21:9',
      defaultLabel: '21:9 (Cinema)',
      icon: <VideoCameraOutlined />
    },
    '1:1': {
      labelKey: 'create.aspectRatio.1:1',
      defaultLabel: '1:1 (Square)',
      icon: <AppstoreOutlined />
    },
    '4:3': {
      labelKey: 'create.aspectRatio.4:3',
      defaultLabel: '4:3 (Classic)',
      icon: <TabletOutlined />
    },
    '3:4': {
      labelKey: 'create.aspectRatio.3:4',
      defaultLabel: '3:4 (Portrait Classic)',
      icon: <MobileOutlined />
    },
    // 支持枚举值
    'portrait': {
      labelKey: 'create.aspectRatio.portrait',
      defaultLabel: 'Portrait (竖屏)',
      icon: <MobileOutlined />
    },
    'landscape': {
      labelKey: 'create.aspectRatio.landscape',
      defaultLabel: 'Landscape (横屏)',
      icon: <DesktopOutlined />
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

// 镜头运动 - 使用国际化函数生成选项
export const getCameraMotions = (intl: any) => [
  { label: intl.formatMessage({ id: 'create.cameraMotion.none', defaultMessage: '无运动 (None)' }), value: 'none' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.zoomIn', defaultMessage: '向前推 (Zoom In)' }), value: 'zoom_in' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.dollyOut', defaultMessage: '向后拉 (Dolly Out)' }), value: 'dolly_out' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.panLeft', defaultMessage: '向左平移 (Pan Left)' }), value: 'pan_left' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.tiltUp', defaultMessage: '向上倾斜 (Tilt Up)' }), value: 'tilt_up' },
  { label: intl.formatMessage({ id: 'create.cameraMotion.orbital', defaultMessage: '360° 环绕 (Orbital)' }), value: 'orbital' },
];

// 判断 URL 是否是视频
export const isVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'mov', 'mkv'].includes(ext || '') || url.startsWith('data:video');
};

// 规范化 URL
export const normalizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

// 获取模型支持的视频比例列表
// 优先使用 videoAspectRatios，如果为空则使用 videoAspectRatiosEnum（直接使用，不转换）
// videoAspectRatiosEnum 是以逗号分隔的枚举值，如 "portrait,landscape"
export const getModelAspectRatios = (model: { videoAspectRatios?: string | null; videoAspectRatiosEnum?: string | null } | null): string[] => {
  if (!model) return [];
  
  // 优先使用 videoAspectRatios
  if (model.videoAspectRatios) {
    return model.videoAspectRatios.split(',').map(r => r.trim()).filter(r => r);
  }
  
  // 如果 videoAspectRatios 为空，使用 videoAspectRatiosEnum（以逗号分隔的枚举值）
  if (model.videoAspectRatiosEnum) {
    return model.videoAspectRatiosEnum.split(',').map(r => r.trim()).filter(r => r);
  }
  
  return [];
};

// 获取模型支持的视频时长选项
// 如果 videoDuration 有值，返回 null（表示使用 Slider）
// 如果 videoDuration 为空但 videoDurationEnum 有值，返回枚举值数组（表示使用 Select）
// 如果两者都为空，返回空数组（表示不支持时长指定）
export const getModelDurationOptions = (model: { videoDuration?: number | null; videoDurationEnum?: string | null } | null): number[] | null => {
  if (!model) return null;
  
  // 如果 videoDuration 有值，返回 null（使用 Slider）
  if (model.videoDuration !== null && model.videoDuration !== undefined) {
    return null;
  }
  
  // 如果 videoDuration 为空，使用 videoDurationEnum（以逗号分隔的枚举值，如 "10,15,25"）
  if (model.videoDurationEnum) {
    return model.videoDurationEnum.split(',').map(d => {
      const num = parseInt(d.trim(), 10);
      return isNaN(num) ? null : num;
    }).filter((d): d is number => d !== null);
  }
  
  // 两者都为空，返回空数组（不支持时长指定）
  return [];
};

// 将文件转换为 base64 预览 URL
export const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// 上传图片到服务器并返回URL（这里需要实际实现上传逻辑）
export const uploadImageToServer = async (file: File): Promise<string> => {
  // TODO: 实现实际的图片上传逻辑
  // 这里返回 base64 作为临时方案
  return await getBase64(file);
};

