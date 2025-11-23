import React from 'react';
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  VideoCameraOutlined,
  BorderOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

// 判断是否应该显示"免费"
export const isFree = (
  outputPrice: number | null | undefined,
  currency: string | null | undefined,
  unit?: string | null | undefined
): boolean => {
  // 如果价格为null、undefined或0，显示免费
  if (outputPrice === null || outputPrice === undefined || outputPrice === 0) {
    return true;
  }
  // 如果currency为null、undefined或空字符串，显示免费
  if (!currency || currency.trim() === '') {
    return true;
  }
  // 如果unit存在且为null、undefined或空字符串，显示免费
  if (unit !== undefined && (!unit || unit.trim() === '')) {
    return true;
  }
  return false;
};

// 根据比例值获取对应的图标和标签
export const getAspectRatioOption = (ratio: string, intl: any) => {
  const ratioMap: {
    [key: string]: { labelKey: string; defaultLabel: string; icon: React.ReactNode };
  } = {
    '16:9': {
      labelKey: 'create.aspectRatio.16:9',
      defaultLabel: '16:9 (Landscape)',
      icon: <DesktopOutlined />,
    },
    '9:16': {
      labelKey: 'create.aspectRatio.9:16',
      defaultLabel: '9:16 (Portrait)',
      icon: <MobileOutlined />,
    },
    '21:9': {
      labelKey: 'create.aspectRatio.21:9',
      defaultLabel: '21:9 (Cinema)',
      icon: <VideoCameraOutlined />,
    },
    '1:1': {
      labelKey: 'create.aspectRatio.1:1',
      defaultLabel: '1:1 (Square)',
      icon: <AppstoreOutlined />,
    },
    '4:3': {
      labelKey: 'create.aspectRatio.4:3',
      defaultLabel: '4:3 (Classic)',
      icon: <TabletOutlined />,
    },
    '3:4': {
      labelKey: 'create.aspectRatio.3:4',
      defaultLabel: '3:4 (Portrait Classic)',
      icon: <MobileOutlined />,
    },
  };

  const option = ratioMap[ratio];
  if (option) {
    return {
      label: intl.formatMessage({
        id: option.labelKey,
        defaultMessage: option.defaultLabel,
      }),
      value: ratio,
      icon: option.icon,
    };
  }

  // 如果没有预定义的比例，返回默认格式
  return {
    label: ratio,
    value: ratio,
    icon: <BorderOutlined />,
  };
};

// 根据比例字符串计算宽高（基准尺寸为512）
export const calculateDimensionsFromRatio = (
  aspectRatio: string
): { width: number; height: number } | null => {
  if (!aspectRatio) return null;

  const parts = aspectRatio.split(':');
  if (parts.length !== 2) return null;

  const widthRatio = parseFloat(parts[0]);
  const heightRatio = parseFloat(parts[1]);

  if (
    isNaN(widthRatio) ||
    isNaN(heightRatio) ||
    widthRatio <= 0 ||
    heightRatio <= 0
  ) {
    return null;
  }

  // 使用基准尺寸512，保持比例
  const baseSize = 512;
  const ratio = widthRatio / heightRatio;

  let width: number;
  let height: number;

  if (ratio >= 1) {
    // 横向或正方形
    width = baseSize;
    height = Math.round(baseSize / ratio);
  } else {
    // 纵向
    height = baseSize;
    width = Math.round(baseSize * ratio);
  }

  // 确保尺寸是8的倍数（很多模型要求这样）
  width = Math.round(width / 8) * 8;
  height = Math.round(height / 8) * 8;

  return { width, height };
};

