/** 图生图官方玩法（列表接口返回，不含提示词） */
import { addImageCompressSuffix } from 'utils/imageCompress';

export const OFFICIAL_PLAY_CARD_IMAGE_WIDTH = 480;
export const OFFICIAL_PLAY_PREVIEW_IMAGE_WIDTH = 960;
export const OFFICIAL_PLAY_THUMB_IMAGE_WIDTH = 280;

export function resolveOfficialPlayImageUrl(
  url: string | null | undefined,
  width = OFFICIAL_PLAY_CARD_IMAGE_WIDTH
): string {
  return addImageCompressSuffix(url, width);
}

export interface I2iOfficialPlay {
  id?: number;
  playCode: string;
  playName: string;
  playNameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  coverEmoji?: string | null;
  referenceBeforeImage?: string | null;
  referenceAfterImage?: string | null;
  category?: string | null;
  sortOrder?: number | null;
  likesCount?: number;
  favoritesCount?: number;
  generationCount?: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  userGenerationCount?: number;
}

export type I2iCreationMode = 'custom' | 'official';

export type I2iOfficialPlaySortBy = 'sort' | 'likes' | 'generations';

export function resolvePlayDisplayName(
  play: I2iOfficialPlay,
  locale: string
): string {
  const isEn = locale.startsWith('en');
  if (isEn && play.playNameEn) {
    return play.playNameEn;
  }
  return play.playName;
}

export function resolvePlayDescription(
  play: I2iOfficialPlay,
  locale: string
): string {
  const isEn = locale.startsWith('en');
  if (isEn && play.descriptionEn) {
    return play.descriptionEn;
  }
  return play.description || '';
}

export function findOfficialPlay(
  plays: I2iOfficialPlay[],
  playCode: string | null | undefined
): I2iOfficialPlay | undefined {
  if (!playCode) return undefined;
  return plays.find((p) => p.playCode === playCode);
}

export function resolveOfficialTaskPromptLabel(
  task: { officialPlay?: boolean; officialPlayName?: string | null; prompt?: string | null },
  intl: { formatMessage: (d: { id: string; defaultMessage: string }, v?: Record<string, string>) => string }
): string {
  if (task.officialPlay) {
    if (task.officialPlayName) {
      return intl.formatMessage(
        {
          id: 'create.i2i.official.generatedByNamed',
          defaultMessage: '由官方模板「{name}」生成',
        },
        { name: task.officialPlayName }
      );
    }
    return intl.formatMessage({
      id: 'create.i2i.official.generatedBy',
      defaultMessage: '由官方模板生成',
    });
  }
  return (
    task.prompt ||
    intl.formatMessage({ id: 'create.history.noPrompt', defaultMessage: '暂无提示词' })
  );
}
