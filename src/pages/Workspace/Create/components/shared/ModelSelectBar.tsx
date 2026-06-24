import React from 'react';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import CoverPreviewVideo from './CoverPreviewVideo';
import {
  ModelSelectBarArrow,
  ModelSelectBarPlaceholder,
  ModelSelectBarRoot,
} from './ModelSelectBarStyles';

export interface ModelSelectBarProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
  /** 封面 URL（图片或视频） */
  coverImage?: string | null;
  /** 封面为视频 URL 时设为 true */
  isVideo?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 创作台统一模型展示条：圆角长条 + 可选封面 + 点击打开选择器
 */
const ModelSelectBar: React.FC<ModelSelectBarProps> = ({
  onClick,
  loading = false,
  disabled = false,
  placeholder,
  compact = false,
  coverImage,
  isVideo = false,
  children,
  className,
  style,
}) => {
  const interactive = !disabled && !loading;
  const hasContent = React.Children.count(children) > 0;
  const hasCover = Boolean(coverImage);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <ModelSelectBarRoot
      className={className}
      style={style}
      $compact={compact}
      $disabled={disabled}
      $loading={loading}
      $hasCover={hasCover}
      onClick={interactive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-disabled={disabled || loading}
    >
      {hasCover && (
        <div className="model-select-bar-cover-media" aria-hidden>
          {isVideo ? (
            <CoverPreviewVideo
              className="model-select-bar-cover-video"
              src={coverImage!}
              playMode="always"
            />
          ) : (
            <div
              className="model-select-bar-cover-image"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
          )}
        </div>
      )}
      {!hasContent && placeholder ? (
        <ModelSelectBarPlaceholder>{placeholder}</ModelSelectBarPlaceholder>
      ) : (
        children
      )}
      <ModelSelectBarArrow className="model-select-bar-arrow">
        {loading ? <LoadingOutlined spin /> : <DownOutlined />}
      </ModelSelectBarArrow>
    </ModelSelectBarRoot>
  );
};

export default ModelSelectBar;
