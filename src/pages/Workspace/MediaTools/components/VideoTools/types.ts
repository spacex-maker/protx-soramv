export const VIDEO_TOOL_MODES = ['compress', 'convert', 'clip'] as const;

export type VideoToolMode = typeof VIDEO_TOOL_MODES[number];

export const resolveVideoToolMode = (value: string | null): VideoToolMode => {
  if (value && VIDEO_TOOL_MODES.includes(value as VideoToolMode)) {
    return value as VideoToolMode;
  }
  return 'compress';
};

export const LEGACY_VIDEO_TAB_TO_MODE: Record<string, VideoToolMode> = {
  videoCompress: 'compress',
  videoConvert: 'convert',
};
