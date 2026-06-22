import { FormInstance } from 'antd';
import { Model } from './types';

interface ResolvePreferredI2vModelParams {
  modelCode: string;
  models: Model[];
  form: FormInstance;
  setSelectedModel: (model: Model | null) => void;
  updateFormByModel: (model: Model) => void;
}

export function resolvePreferredI2vModel({
  modelCode,
  models,
  form,
  setSelectedModel,
  updateFormByModel,
}: ResolvePreferredI2vModelParams): boolean {
  const match = models.find((model) => model.modelCode === modelCode);
  if (!match) return false;
  setSelectedModel(match);
  form.setFieldsValue({ modelId: match.id });
  updateFormByModel(match);
  return true;
}
