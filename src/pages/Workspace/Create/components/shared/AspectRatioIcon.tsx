import React from 'react';
import { BorderOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const IconBox = styled.span<{ $boxSize: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$boxSize}px;
  height: ${(p) => p.$boxSize}px;
  flex-shrink: 0;
  color: #1890ff;
`;

const RatioShape = styled.span<{ $width: number; $height: number }>`
  display: block;
  width: ${(p) => p.$width}px;
  height: ${(p) => p.$height}px;
  border: 2px solid currentColor;
  border-radius: 2px;
  box-sizing: border-box;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.12)' : 'rgba(24, 144, 255, 0.08)'};
`;

export function parseAspectRatioParts(
  ratio: string
): { width: number; height: number } | null {
  const normalized = ratio.trim().toLowerCase();
  if (normalized === 'portrait') return { width: 9, height: 16 };
  if (normalized === 'landscape') return { width: 16, height: 9 };
  if (normalized === 'adaptive') return null;

  const separator = normalized.includes(':')
    ? ':'
    : normalized.includes('/')
      ? '/'
      : normalized.includes('x')
        ? 'x'
        : null;
  if (!separator) return null;

  const parts = normalized.split(separator);
  if (parts.length !== 2) return null;

  const width = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

export interface AspectRatioIconProps {
  ratio: string;
  size?: number;
  className?: string;
}

/** 按实际宽高比绘制的比例预览图标 */
const AspectRatioIcon: React.FC<AspectRatioIconProps> = ({
  ratio,
  size = 18,
  className,
}) => {
  const parts = parseAspectRatioParts(ratio);
  if (!parts) {
    return <BorderOutlined className={className} style={{ fontSize: size, color: '#1890ff' }} />;
  }

  const aspect = parts.width / parts.height;
  let shapeWidth: number;
  let shapeHeight: number;

  if (aspect >= 1) {
    shapeWidth = size;
    shapeHeight = Math.max(4, Math.round(size / aspect));
  } else {
    shapeHeight = size;
    shapeWidth = Math.max(4, Math.round(size * aspect));
  }

  return (
    <IconBox $boxSize={size} className={className ?? 'aspect-ratio-icon'} aria-hidden>
      <RatioShape $width={shapeWidth} $height={shapeHeight} />
    </IconBox>
  );
};

export default AspectRatioIcon;
