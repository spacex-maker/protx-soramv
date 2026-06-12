import { isVideoUrl, modelCoverUrl } from '../ImageToVideo/utils';
import { EngineModel } from './engineTypes';

export { isVideoUrl, modelCoverUrl };

export function getEngineDisplayName(model: EngineModel, locale: string): string {
  return locale === 'zh' || locale === 'zh-CN'
    ? model.modelName
    : (model.modelNameEn || model.modelName);
}

export function getEngineDescription(model: EngineModel, locale: string): string | undefined {
  const desc = locale === 'zh' || locale === 'zh-CN'
    ? model.description
    : (model.descriptionEn || model.description);
  return desc?.trim() || undefined;
}

export function isPerCharUnit(unit?: string): boolean {
  return unit === 'char';
}

export function formatEngineTokenCost(model: EngineModel): number {
  return model.tokenCost ?? 0;
}
