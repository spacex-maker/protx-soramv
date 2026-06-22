import { IntlShape } from 'react-intl';

export type DirectorShotSize =
  | 'extreme_wide'
  | 'wide'
  | 'full'
  | 'medium'
  | 'close_up'
  | 'extreme_close_up';

export type DirectorCameraMotion =
  | 'none'
  | 'zoom_in'
  | 'dolly_out'
  | 'pan_left'
  | 'tilt_up'
  | 'orbital';

const SHOT_SIZE_ALIASES: Record<string, DirectorShotSize> = {
  extreme_wide: 'extreme_wide',
  extremewide: 'extreme_wide',
  wide: 'wide',
  wideshot: 'wide',
  full: 'full',
  fullshot: 'full',
  medium: 'medium',
  mediumshot: 'medium',
  close_up: 'close_up',
  closeup: 'close_up',
  cu: 'close_up',
  extreme_close_up: 'extreme_close_up',
  extremecloseup: 'extreme_close_up',
  long: 'wide',
  longshot: 'wide',
};

const CAMERA_MOTION_ALIASES: Record<string, DirectorCameraMotion> = {
  none: 'none',
  static: 'none',
  fixed: 'none',
  zoom_in: 'zoom_in',
  zoomin: 'zoom_in',
  pushin: 'zoom_in',
  dolly_out: 'dolly_out',
  dollyout: 'dolly_out',
  pullout: 'dolly_out',
  pan_left: 'pan_left',
  panleft: 'pan_left',
  tilt_up: 'tilt_up',
  tiltup: 'tilt_up',
  orbital: 'orbital',
  orbit: 'orbital',
};

const SHOT_SIZE_PROMPT: Record<DirectorShotSize, string> = {
  extreme_wide: 'extreme wide shot',
  wide: 'wide shot',
  full: 'full shot',
  medium: 'medium shot',
  close_up: 'close-up shot',
  extreme_close_up: 'extreme close-up shot',
};

const CAMERA_MOTION_PROMPT: Record<Exclude<DirectorCameraMotion, 'none'>, string> = {
  zoom_in: 'camera slowly pushes in',
  dolly_out: 'camera slowly pulls back',
  pan_left: 'camera pans left',
  tilt_up: 'camera tilts up',
  orbital: 'orbital camera movement around the subject',
};

const normalizeKey = (raw?: string | null) =>
  raw?.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_') || '';

export const normalizeShotSize = (raw?: string | null): DirectorShotSize | undefined => {
  const key = normalizeKey(raw);
  if (!key) return undefined;
  return SHOT_SIZE_ALIASES[key] || (key in SHOT_SIZE_PROMPT ? (key as DirectorShotSize) : undefined);
};

export const normalizeCameraMotion = (raw?: string | null): DirectorCameraMotion | undefined => {
  const key = normalizeKey(raw);
  if (!key) return undefined;
  return CAMERA_MOTION_ALIASES[key] || (key in CAMERA_MOTION_PROMPT ? (key as DirectorCameraMotion) : undefined);
};

export const getShotSizeOptions = (intl: IntlShape) =>
  (Object.keys(SHOT_SIZE_PROMPT) as DirectorShotSize[]).map((value) => ({
    value,
    label: intl.formatMessage({
      id: `director.shot.size.${value}`,
      defaultMessage: value.replace(/_/g, ' '),
    }),
  }));

export const getCameraMotionOptions = (intl: IntlShape) => [
  {
    value: 'none' as const,
    label: intl.formatMessage({ id: 'create.cameraMotion.none', defaultMessage: '无运动 (None)' }),
  },
  {
    value: 'zoom_in' as const,
    label: intl.formatMessage({ id: 'create.cameraMotion.zoomIn', defaultMessage: '向前推 (Zoom In)' }),
  },
  {
    value: 'dolly_out' as const,
    label: intl.formatMessage({ id: 'create.cameraMotion.dollyOut', defaultMessage: '向后拉 (Dolly Out)' }),
  },
  {
    value: 'pan_left' as const,
    label: intl.formatMessage({ id: 'create.cameraMotion.panLeft', defaultMessage: '向左平移 (Pan Left)' }),
  },
  {
    value: 'tilt_up' as const,
    label: intl.formatMessage({ id: 'create.cameraMotion.tiltUp', defaultMessage: '向上倾斜 (Tilt Up)' }),
  },
  {
    value: 'orbital' as const,
    label: intl.formatMessage({ id: 'create.cameraMotion.orbital', defaultMessage: '360° 环绕 (Orbital)' }),
  },
];

export const dialoguePromptPhrase = (dialogue?: string | null) => {
  const trimmed = dialogue?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) {
    return `dialogue: ${trimmed}`;
  }
  return `dialogue: "${trimmed.replace(/"/g, "'")}"`;
};

export type ProductionPromptParams = {
  prompt?: string | null;
  description?: string | null;
  dialogue?: string | null;
  shotSize?: string | null;
  cameraMotion?: string | null;
};

export const isProductionPreviewEmpty = (params: ProductionPromptParams) => {
  const hasContent = !!(params.description?.trim() || params.dialogue?.trim() || params.prompt?.trim());
  const motion = normalizeCameraMotion(params.cameraMotion);
  const hasMotion = !!motion && motion !== 'none';
  return !hasContent && !hasMotion;
};

export const buildProductionPromptPreview = (params: ProductionPromptParams) => {
  const parts: string[] = [];
  const size = normalizeShotSize(params.shotSize);
  if (size) parts.push(SHOT_SIZE_PROMPT[size]);
  const motion = normalizeCameraMotion(params.cameraMotion);
  if (motion && motion !== 'none') parts.push(CAMERA_MOTION_PROMPT[motion]);
  if (params.description?.trim()) parts.push(params.description.trim());
  const dialoguePhrase = dialoguePromptPhrase(params.dialogue);
  if (dialoguePhrase) parts.push(dialoguePhrase);
  if (params.prompt?.trim()) parts.push(params.prompt.trim());
  return parts.join(', ');
};

export const isSeedanceModelCode = (modelCode?: string | null) =>
  !!modelCode && modelCode.toLowerCase().includes('seedance');

export const isSeedance15ModelCode = (modelCode?: string | null) =>
  isSeedanceModelCode(modelCode) &&
  !modelCode!.toLowerCase().includes('seedance-2') &&
  !modelCode!.toLowerCase().includes('seedance2');

/** Seedance 1.5：无运镜 / none 时镜头固定 */
export const mapCameraMotionToSeedanceCameraFixed = (motion?: string | null) => {
  const normalized = normalizeCameraMotion(motion);
  return !normalized || normalized === 'none';
};
