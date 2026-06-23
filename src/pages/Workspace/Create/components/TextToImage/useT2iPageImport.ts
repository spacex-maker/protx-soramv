import { useEffect, useRef } from 'react';
import { FormInstance, message } from 'antd';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { consumeT2iImportPayload, T2iImportPayload } from 'utils/postT2iImport';
import { resolvePreferredT2iModel } from './resolvePreferredT2iModel';
import { FetchStyleModelsOptions } from './useStyleModels';
import { Model, ModelFamily } from './types';

interface UseT2iPageImportOptions {
  isEmbed: boolean;
  importPayload?: T2iImportPayload | null;
  form: FormInstance;
  modelFamilies: ModelFamily[];
  familiesLoading: boolean;
  setSelectedFamily: (family: ModelFamily | null) => void;
  setSelectedModel: (model: Model | null) => void;
  setStyleModels: (models: Model[]) => void;
  fetchStyleModels: (
    parentModelCode: string,
    family?: ModelFamily | null,
    options?: FetchStyleModelsOptions
  ) => Promise<void>;
}

export function useT2iPageImport({
  isEmbed,
  importPayload: importPayloadProp,
  form,
  modelFamilies,
  familiesLoading,
  setSelectedFamily,
  setSelectedModel,
  setStyleModels,
  fetchStyleModels,
}: UseT2iPageImportOptions): T2iImportPayload | null {
  const intl = useIntl();
  const location = useLocation();
  const consumedRef = useRef<T2iImportPayload | null | undefined>(undefined);
  const initialAppliedRef = useRef(false);
  const preferredAppliedRef = useRef(false);
  const toastShownRef = useRef(false);

  if (consumedRef.current === undefined && !isEmbed && importPayloadProp === undefined) {
    consumedRef.current = consumeT2iImportPayload(location.state);
  }

  const importPayload = isEmbed
    ? null
    : importPayloadProp !== undefined
      ? importPayloadProp
      : consumedRef.current ?? null;

  useEffect(() => {
    if (isEmbed || !importPayload || initialAppliedRef.current) return;

    const updates: Record<string, unknown> = {};
    if (importPayload.prompt) updates.prompt = importPayload.prompt;
    if (importPayload.negativePrompt) updates.negativePrompt = importPayload.negativePrompt;
    if (importPayload.aspectRatio) updates.aspectRatio = importPayload.aspectRatio;
    if (importPayload.resolution) updates.resolution = importPayload.resolution;
    if (importPayload.batchSize != null) updates.batchSize = importPayload.batchSize;
    if (importPayload.seedreamWatermark != null) {
      updates.seedreamWatermark = importPayload.seedreamWatermark;
    }
    if (importPayload.imageFormat) updates.imageFormat = importPayload.imageFormat;

    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
    initialAppliedRef.current = true;
  }, [form, importPayload, isEmbed]);

  useEffect(() => {
    if (
      isEmbed ||
      !importPayload?.preferredModelCode ||
      familiesLoading ||
      modelFamilies.length === 0 ||
      preferredAppliedRef.current
    ) {
      return;
    }

    let cancelled = false;
    preferredAppliedRef.current = true;

    const applyPreferredModel = async () => {
      await resolvePreferredT2iModel({
        modelCode: importPayload.preferredModelCode!,
        families: modelFamilies,
        form,
        setSelectedFamily,
        setSelectedModel,
        setStyleModels,
        fetchStyleModels,
      });

      if (!cancelled && !toastShownRef.current) {
        toastShownRef.current = true;
        message.success(
          intl.formatMessage({
            id: 'post.t2iImportApplied',
            defaultMessage: '已填充同款生成参数，可直接生成',
          })
        );
      }
    };

    applyPreferredModel();
    return () => {
      cancelled = true;
    };
  }, [
    fetchStyleModels,
    familiesLoading,
    form,
    importPayload?.preferredModelCode,
    isEmbed,
    intl,
    modelFamilies,
    setSelectedFamily,
    setSelectedModel,
    setStyleModels,
  ]);

  return importPayload;
}
