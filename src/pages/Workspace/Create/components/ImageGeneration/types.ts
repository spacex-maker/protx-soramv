export type ImageGenerationMode = 'textToImage' | 'imageToImage';

export const IMAGE_GENERATION_MODES: ImageGenerationMode[] = ['textToImage', 'imageToImage'];

export const LEGACY_IMAGE_PATH_TO_MODE: Record<string, ImageGenerationMode> = {
  '/workspace/create/text-to-image': 'textToImage',
  '/workspace/create/image-to-image': 'imageToImage',
};

export function resolveImageGenerationMode(
  value: string | null | undefined,
  fallback: ImageGenerationMode = 'textToImage'
): ImageGenerationMode {
  if (value === 'textToImage' || value === 'imageToImage') {
    return value;
  }
  return fallback;
}

export interface ImageGenerationEnabledModes {
  textToImage: boolean;
  imageToImage: boolean;
}

export function getDefaultImageGenerationMode(
  enabled: ImageGenerationEnabledModes
): ImageGenerationMode | null {
  if (enabled.textToImage) return 'textToImage';
  if (enabled.imageToImage) return 'imageToImage';
  return null;
}

export function resolveImageGenerationModeWithEnabled(
  value: string | null | undefined,
  enabled: ImageGenerationEnabledModes
): ImageGenerationMode | null {
  const preferred = resolveImageGenerationMode(value, 'textToImage');
  if (preferred === 'textToImage' && enabled.textToImage) return 'textToImage';
  if (preferred === 'imageToImage' && enabled.imageToImage) return 'imageToImage';
  return getDefaultImageGenerationMode(enabled);
}
