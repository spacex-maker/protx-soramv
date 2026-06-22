import { FormInstance } from 'antd';
import instance from 'api/axios';
import { FetchStyleModelsOptions } from './useStyleModels';
import { Model, ModelFamily } from './types';

interface ResolvePreferredT2iModelParams {
  modelCode: string;
  families: ModelFamily[];
  form: FormInstance;
  setSelectedFamily: (family: ModelFamily | null) => void;
  setSelectedModel: (model: Model | null) => void;
  setStyleModels: (models: Model[]) => void;
  fetchStyleModels: (
    parentModelCode: string,
    family?: ModelFamily | null,
    options?: FetchStyleModelsOptions
  ) => Promise<void>;
}

const mapStyleModel = (item: Record<string, unknown>): Model => ({
  id: item.id as number,
  modelName: item.modelName as string,
  modelCode: item.modelCode as string,
  description: item.description as string,
  descriptionEn: (item.descriptionEn as string | null) ?? null,
  imageDefaultResolution: (item.imageDefaultResolution as string | null) ?? null,
  imageMaxResolution: (item.imageMaxResolution as string | null) ?? null,
  imageAspectRatios: (item.imageAspectRatios as string | null) ?? null,
  imageFormats: (item.imageFormats as string | null) ?? null,
  supportControlnet: !!item.supportControlnet,
  supportInpaint: !!item.supportInpaint,
  supportReference: !!item.supportReference,
  supportNegativePrompt: !!item.supportNegativePrompt,
  currency: (item.currency as string | null) ?? null,
  outputPrice: (item.outputPrice as number | null) ?? null,
  companyName: (item.companyName as string | null) ?? null,
  coverImage: (item.coverImage as string | null) ?? null,
  modelSource: (item.modelSource as string | null) ?? null,
  tokenCost: (item.tokenCost as number | null) ?? null,
  videoDefaultResolution:
    (item.videoDefaultResolution as string | null) ?? (item.video_default_resolution as string | null) ?? null,
  videoMaxResolution:
    (item.videoMaxResolution as string | null) ?? (item.video_max_resolution as string | null) ?? null,
});

export async function resolvePreferredT2iModel({
  modelCode,
  families,
  form,
  setSelectedFamily,
  setSelectedModel,
  setStyleModels,
  fetchStyleModels,
}: ResolvePreferredT2iModelParams): Promise<boolean> {
  const familyMatch = families.find((family) => family.modelCode === modelCode);
  if (familyMatch) {
    setSelectedFamily(familyMatch);
    form.setFieldsValue({ familyId: familyMatch.id, styleModelId: null });
    setSelectedModel(null);
    await fetchStyleModels(familyMatch.modelCode, familyMatch, { autoSelectFirst: false });
    return true;
  }

  for (const family of families) {
    try {
      const response = await instance.get('/productx/sa-ai-models/image/models/by-family', {
        params: { parentModelCode: family.modelCode },
      });
      if (!response.data.success || !response.data.data?.length) {
        continue;
      }
      const list = (response.data.data as Record<string, unknown>[]).map(mapStyleModel);
      const styleMatch = list.find((model) => model.modelCode === modelCode);
      if (styleMatch) {
        setSelectedFamily(family);
        setStyleModels(list);
        setSelectedModel(styleMatch);
        form.setFieldsValue({ familyId: family.id, styleModelId: styleMatch.id });
        return true;
      }
    } catch {
      // try next family
    }
  }

  return false;
}
