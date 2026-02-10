import { useState, useEffect, useRef } from 'react';
import { FormInstance, message } from 'antd';
import { useIntl } from 'react-intl';
import instance from 'api/axios';
import { ModelFamily } from './types';

export interface UseModelFamiliesOptions {
  locale: string | null;
  form: FormInstance;
  /** 首次加载完家族列表并选中第一个家族时回调，用于加载该家族下的风格模型 */
  onFirstFamilySelected?: (family: ModelFamily) => void;
}

export interface UseModelFamiliesResult {
  modelFamilies: ModelFamily[];
  setModelFamilies: React.Dispatch<React.SetStateAction<ModelFamily[]>>;
  selectedFamily: ModelFamily | null;
  setSelectedFamily: React.Dispatch<React.SetStateAction<ModelFamily | null>>;
  familiesLoading: boolean;
}

/**
 * 获取并管理模型家族列表的 Hook
 */
export function useModelFamilies({
  locale,
  form,
  onFirstFamilySelected,
}: UseModelFamiliesOptions): UseModelFamiliesResult {
  const intl = useIntl();
  const onFirstFamilySelectedRef = useRef(onFirstFamilySelected);
  onFirstFamilySelectedRef.current = onFirstFamilySelected;

  const [modelFamilies, setModelFamilies] = useState<ModelFamily[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<ModelFamily | null>(null);
  const [familiesLoading, setFamiliesLoading] = useState(false);

  useEffect(() => {
    const fetchFamilies = async () => {
      setFamiliesLoading(true);
      try {
        const response = await instance.get(
          '/productx/sa-ai-models/image/families',
          { params: { lang: locale || 'en' } }
        );
        if (
          response.data.success &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          const families = response.data.data;
          setModelFamilies(families);
          const firstFamily = families[0];
          setSelectedFamily(firstFamily);
          form.setFieldsValue({ familyId: firstFamily.id });
          onFirstFamilySelectedRef.current?.(firstFamily);
        } else {
          message.warning(
            intl.formatMessage({
              id: 'create.model.family.loadFailed',
              defaultMessage: '加载模型家族列表失败',
            })
          );
        }
      } catch (error: any) {
        console.error('获取模型家族列表失败:', error);
        message.error(
          intl.formatMessage({
            id: 'create.model.family.loadFailed',
            defaultMessage: '加载模型家族列表失败',
          })
        );
      } finally {
        setFamiliesLoading(false);
      }
    };

    fetchFamilies();
  }, [locale, form, intl]);

  return {
    modelFamilies,
    setModelFamilies,
    selectedFamily,
    setSelectedFamily,
    familiesLoading,
  };
}
