export const AUDIO_TOOL_MODES = ['compress', 'convert', 'clip'] as const;

export type AudioToolMode = typeof AUDIO_TOOL_MODES[number];

export const resolveAudioToolMode = (value: string | null): AudioToolMode => {
  if (value && AUDIO_TOOL_MODES.includes(value as AudioToolMode)) {
    return value as AudioToolMode;
  }
  return 'compress';
};

export const LEGACY_AUDIO_TAB_TO_MODE: Record<string, AudioToolMode> = {
  audioCompress: 'compress',
  audioConvert: 'convert',
};
