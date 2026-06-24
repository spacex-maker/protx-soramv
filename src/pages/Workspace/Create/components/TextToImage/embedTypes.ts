import React from 'react';

export interface TextToImageEmbedConfig {
  initialPrompt?: string;
  initialAspectRatio?: string;
  preferredModelCode?: string;
  hideHistory?: boolean;
  hideHeader?: boolean;
  initialBatchSize?: number;
  /** embed 模式下排除免费模型 */
  excludeFreeModels?: boolean;
  onApplyImage?: (imageUrl: string) => void | Promise<void>;
  applyingImageUrl?: string | null;
  applyButtonLabel?: React.ReactNode;
}

export interface TextToImageProps {
  variant?: 'page' | 'embed';
  embedConfig?: TextToImageEmbedConfig;
  embedActive?: boolean;
  embedded?: boolean;
}
