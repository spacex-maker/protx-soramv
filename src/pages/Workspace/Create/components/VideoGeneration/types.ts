export type VideoGenerationMode = 'textToVideo' | 'imageToVideo';

export const VIDEO_GENERATION_MODES: VideoGenerationMode[] = ['textToVideo', 'imageToVideo'];

export const LEGACY_VIDEO_PATH_TO_MODE: Record<string, VideoGenerationMode> = {
  '/workspace/create/text-to-video': 'textToVideo',
  '/workspace/create/image-to-video': 'imageToVideo',
};

export function resolveVideoGenerationMode(
  value: string | null | undefined,
  fallback: VideoGenerationMode = 'textToVideo'
): VideoGenerationMode {
  if (value === 'textToVideo' || value === 'imageToVideo') {
    return value;
  }
  return fallback;
}

export interface VideoGenerationEnabledModes {
  textToVideo: boolean;
  imageToVideo: boolean;
}

export function getDefaultVideoGenerationMode(
  enabled: VideoGenerationEnabledModes
): VideoGenerationMode | null {
  if (enabled.textToVideo) return 'textToVideo';
  if (enabled.imageToVideo) return 'imageToVideo';
  return null;
}

export function resolveVideoGenerationModeWithEnabled(
  value: string | null | undefined,
  enabled: VideoGenerationEnabledModes
): VideoGenerationMode | null {
  const preferred = resolveVideoGenerationMode(value, 'textToVideo');
  if (preferred === 'textToVideo' && enabled.textToVideo) return 'textToVideo';
  if (preferred === 'imageToVideo' && enabled.imageToVideo) return 'imageToVideo';
  return getDefaultVideoGenerationMode(enabled);
}
