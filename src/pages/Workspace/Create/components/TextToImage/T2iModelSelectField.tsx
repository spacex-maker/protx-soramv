import React from 'react';
import { Space } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { ModelFamily } from './types';
import CreateModelSelectField from '../shared/CreateModelSelectField';
import {
  ModelSelectDisplayData,
  resolveModelBrand,
} from '../shared/modelSelectDisplayUtils';

export interface T2iModelSelectFieldProps {
  selectedModel: ModelFamily | null;
  modelsLoading: boolean;
  onOpenModal: () => void;
  formItemName?: string;
  label?: React.ReactNode;
  compact?: boolean;
  marginBottom?: number;
}

function toDisplayModel(model: ModelFamily): ModelSelectDisplayData {
  return {
    modelName: model.modelName,
    modelCode: model.modelCode,
    coverImage: model.coverImage,
    outputPrice: model.outputPrice,
    currency: model.currency,
    tokenCost: model.tokenCost,
    companyName: resolveModelBrand(model.companyName, model.modelName),
  };
}

/** 文生图模型选择展示（与 VideoModelSelectField 对称） */
const T2iModelSelectField: React.FC<T2iModelSelectFieldProps> = ({
  selectedModel,
  modelsLoading,
  onOpenModal,
  formItemName = 'modelId',
  label,
  compact = false,
  marginBottom = 28,
}) => {
  const defaultLabel = (
    <Space>
      <PictureOutlined style={{ color: '#1890ff' }} />
      <FormattedMessage id="create.model.select" defaultMessage="选择模型" />
    </Space>
  );

  return (
    <CreateModelSelectField
      formItemName={formItemName}
      label={label ?? defaultLabel}
      model={selectedModel ? toDisplayModel(selectedModel) : null}
      loading={modelsLoading}
      disabled={modelsLoading}
      compact={compact}
      billingMode="image"
      marginBottom={marginBottom}
      placeholderMessageId="create.model.select.placeholder"
      placeholderDefaultMessage="请选择要使用的文生图模型"
      onOpen={onOpenModal}
    />
  );
};

export default T2iModelSelectField;
