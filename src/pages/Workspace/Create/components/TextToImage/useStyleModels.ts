import { useState, useRef } from 'react';
import { FormInstance, message } from 'antd';
import { useIntl } from 'react-intl';
import instance from 'api/axios';
import { ModelFamily, Model } from './types';

export interface UseStyleModelsOptions {
  form: FormInstance;
  modelFamilies: ModelFamily[];
  /** 加载完风格模型并设置选中后回调，用于根据模型更新表单参数（分辨率、比例、格式等） */
  onAfterLoad?: (model: Model | ModelFamily | null) => void;
}

export interface UseStyleModelsResult {
  styleModels: Model[];
  setStyleModels: React.Dispatch<React.SetStateAction<Model[]>>;
  selectedModel: Model | null;
  setSelectedModel: React.Dispatch<React.SetStateAction<Model | null>>;
  styleModelsLoading: boolean;
  fetchStyleModels: (parentModelCode: string, family?: ModelFamily | null) => Promise<void>;
}

function mapItemToModel(item: Record<string, unknown>): Model {
  return {
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
    videoDefaultResolution: (item.videoDefaultResolution as string | null) ?? (item.video_default_resolution as string | null) ?? null,
    videoMaxResolution: (item.videoMaxResolution as string | null) ?? (item.video_max_resolution as string | null) ?? null,
  };
}

/**
 * 获取并管理家族下的风格模型列表
 */
export function useStyleModels({
  form,
  modelFamilies,
  onAfterLoad,
}: UseStyleModelsOptions): UseStyleModelsResult {
  const intl = useIntl();
  const onAfterLoadRef = useRef(onAfterLoad);
  onAfterLoadRef.current = onAfterLoad;

  const [styleModels, setStyleModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [styleModelsLoading, setStyleModelsLoading] = useState(false);

  const fetchStyleModels = async (
    parentModelCode: string,
    family: ModelFamily | null = null
  ) => {
    setStyleModelsLoading(true);
    try {
      const response = await instance.get(
        '/productx/sa-ai-models/image/models/by-family',
        { params: { parentModelCode } }
      );

      const targetFamily =
        family || modelFamilies.find((f) => f.modelCode === parentModelCode) || null;

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const styleModelsList = (response.data.data as Record<string, unknown>[]).map(
          mapItemToModel
        );
        setStyleModels(styleModelsList);
        if (styleModelsList.length > 0) {
          const firstStyleModel = styleModelsList[0];
          setSelectedModel(firstStyleModel);
          form.setFieldsValue({ styleModelId: firstStyleModel.id });
          onAfterLoadRef.current?.(firstStyleModel);
        } else {
          setSelectedModel(null);
          form.setFieldsValue({ styleModelId: null });
          onAfterLoadRef.current?.(targetFamily ?? null);
        }
      } else {
        setSelectedModel(null);
        setStyleModels([]);
        form.setFieldsValue({ styleModelId: null });
        onAfterLoadRef.current?.(targetFamily ?? null);
      }
    } catch (error: unknown) {
      console.error('获取风格模型列表失败:', error);
      message.error(
        intl.formatMessage({
          id: 'create.model.style.loadFailed',
          defaultMessage: '加载风格模型列表失败',
        })
      );
      const targetFamily =
        family || modelFamilies.find((f) => f.modelCode === parentModelCode) || null;
      setSelectedModel(null);
      setStyleModels([]);
      form.setFieldsValue({ styleModelId: null });
      onAfterLoadRef.current?.(targetFamily ?? null);
    } finally {
      setStyleModelsLoading(false);
    }
  };

  return {
    styleModels,
    setStyleModels,
    selectedModel,
    setSelectedModel,
    styleModelsLoading,
    fetchStyleModels,
  };
}
