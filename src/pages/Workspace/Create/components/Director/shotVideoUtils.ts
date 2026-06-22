import { DirectorCharacter, DirectorShot } from 'api/director';

export type ShotVideoContentMode = 'first_last_frame' | 'multimodal_reference';

export type ShotVideoReferenceKind = 'character' | 'custom_image';

export interface ShotVideoReferenceAsset {
  id: string;
  kind: ShotVideoReferenceKind;
  label: string;
  url: string;
  characterId?: number;
  /** 本地待上传文件 */
  localFile?: File;
}

export const isSeedance2ModelCode = (modelCode?: string | null) => {
  const lc = (modelCode || '').toLowerCase();
  return lc.includes('seedance-2') || lc.includes('seedance2');
};

export const isDisplayableImageUrl = (url?: string | null): url is string => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:')
  );
};

export const splitSeedanceRefLines = (raw: string | undefined | null): string[] =>
  (raw || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface PromptMentionState {
  query: string;
  start: number;
  end: number;
}

/** 检测光标前是否处于 @ 提及输入中 */
export const detectPromptMention = (text: string, cursorPos: number): PromptMentionState | null => {
  const before = text.slice(0, cursorPos);
  const match = before.match(/@([^\s@]*)$/);
  if (!match) return null;
  return {
    query: match[1],
    start: cursorPos - match[0].length,
    end: cursorPos,
  };
};

export const applyPromptMention = (
  text: string,
  mention: PromptMentionState,
  label: string
): { value: string; cursor: number } => {
  const token = `@${label}`;
  const before = text.slice(0, mention.start);
  const after = text.slice(mention.end);
  const needsSpace = after.length > 0 && !after.startsWith(' ');
  const value = `${before}${token}${needsSpace ? ' ' : ''}${after}`;
  const cursor = before.length + token.length + (needsSpace ? 1 : 0);
  return { value, cursor };
};

/** 将 prompt 中的 @标签 替换为方舟可识别的 图片N */
export const resolvePromptReferenceLabels = (
  rawPrompt: string,
  references: ShotVideoReferenceAsset[]
): string => {
  let prompt = rawPrompt;
  references.forEach((ref, index) => {
    const token = `@${ref.label}`;
    const replacement = `图片${index + 1}`;
    prompt = prompt.replace(new RegExp(escapeRegExp(token), 'g'), replacement);
  });
  return prompt;
};

export const buildInitialShotReferences = (
  shot: DirectorShot | undefined,
  characters: DirectorCharacter[]
): ShotVideoReferenceAsset[] => {
  if (!shot?.characterIds?.length) return [];
  const byId = new Map(characters.map((c) => [c.id, c]));
  const refs: ShotVideoReferenceAsset[] = [];
  shot.characterIds.forEach((id) => {
    const character = byId.get(id);
    if (!character || !isDisplayableImageUrl(character.referenceImageUrl)) return;
    refs.push({
      id: `character-${character.id}`,
      kind: 'character',
      label: character.name,
      url: character.referenceImageUrl,
      characterId: character.id,
    });
  });
  return refs;
};

export const buildInitialReferencePrompt = (
  basePrompt: string,
  references: ShotVideoReferenceAsset[]
): string => {
  const trimmed = basePrompt.trim();
  if (!references.length) return trimmed;
  const mentionLine = references.map((ref) => `@${ref.label}`).join(' ');
  if (!trimmed) return `${mentionLine}，参考以上角色特征生成画面`;
  if (references.some((ref) => trimmed.includes(`@${ref.label}`))) return trimmed;
  return `${mentionLine}，${trimmed}`;
};

export const pickDefaultContentMode = (
  shot: DirectorShot | undefined,
  references: ShotVideoReferenceAsset[]
): ShotVideoContentMode => {
  if (isDisplayableImageUrl(shot?.keyframeImageUrl)) {
    return 'first_last_frame';
  }
  if (references.length > 0) {
    return 'multimodal_reference';
  }
  return 'first_last_frame';
};

/** Seedance / 方舟已知错误码 → i18n key */
export const SEEDANCE_VIDEO_ERROR_I18N: Record<string, { id: string; defaultMessage: string }> = {
  'InputImageSensitiveContentDetected.PrivacyInformation': {
    id: 'director.shot.videoError.realPerson',
    defaultMessage: '输入图片可能包含真实人物肖像，平台拒绝处理。请更换不含真人面孔的参考图或首尾帧后重试。',
  },
  InputImageSensitiveContentDetected: {
    id: 'director.shot.videoError.sensitiveImage',
    defaultMessage: '输入图片未通过内容安全审核，请更换参考图或首尾帧后重试。',
  },
};

const stripRequestId = (text: string) => text.replace(/\s*Request id:\s*[a-f0-9]+/gi, '').trim();

const tryParseNestedErrorJson = (raw: string): { code?: string; message?: string } | null => {
  const start = raw.indexOf('{"error"');
  if (start < 0) return null;
  const slice = raw.slice(start);
  try {
    const parsed = JSON.parse(slice) as { error?: { code?: string; message?: string } };
    if (parsed?.error) return parsed.error;
  } catch {
    // ignore malformed trailing JSON
  }
  return null;
};

export type VideoErrorTranslator = (descriptor: { id: string; defaultMessage: string }) => string;

/** 将后端/Seedance 原始错误文案转为可展示的用户提示 */
export const formatVideoGenerateError = (
  raw: string | undefined | null,
  translate: VideoErrorTranslator,
  fallback?: { id: string; defaultMessage: string }
): string => {
  const fallbackMsg = translate(
    fallback || {
      id: 'director.shot.videoGenerateFailed',
      defaultMessage: '视频生成失败，请重试',
    }
  );
  if (!raw?.trim()) return fallbackMsg;

  let text = raw.trim();
  const seedanceMatch = text.match(/^Seedance 视频生成异常:\s*(.+)$/i);
  if (seedanceMatch) {
    text = seedanceMatch[1].trim();
  }

  const nested = tryParseNestedErrorJson(text);
  if (nested?.code && SEEDANCE_VIDEO_ERROR_I18N[nested.code]) {
    return translate(SEEDANCE_VIDEO_ERROR_I18N[nested.code]);
  }
  if (nested?.message) {
    return stripRequestId(nested.message);
  }

  const httpBodyMatch = text.match(/^\d{3}\s+\w[\w\s]*:\s*"([\s\S]*)"$/);
  if (httpBodyMatch) {
    return formatVideoGenerateError(httpBodyMatch[1], translate, fallback);
  }

  return stripRequestId(text) || fallbackMsg;
};

export const extractVideoGenerateError = (
  error: unknown,
  translate: VideoErrorTranslator
): string => {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    const apiMsg = response?.data?.message;
    if (apiMsg) return formatVideoGenerateError(apiMsg, translate);
  }
  if (error instanceof Error && error.message) {
    return formatVideoGenerateError(error.message, translate);
  }
  return formatVideoGenerateError(String(error), translate);
};
