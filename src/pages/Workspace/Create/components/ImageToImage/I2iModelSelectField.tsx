import React from 'react';
import { Space } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { Model } from './types';
import CreateModelSelectField from '../shared/CreateModelSelectField';
import {
  ModelSelectDisplayData,
  resolveModelBrand,
} from '../shared/modelSelectDisplayUtils';
import { isImageUrl, normalizeUrl } from './utils';

export interface I2iModelSelectFieldProps {
  selectedModel: Model | null;
  modelsLoading: boolean;
  onOpenModal: () => void;
  formItemName?: string;
  label?: React.ReactNode;
  compact?: boolean;
  marginBottom?: number;
}

function toDisplayModel(model: Model): ModelSelectDisplayData {
  const coverRaw = model.coverImage ? normalizeUrl(model.coverImage) : null;
  return {
    modelName: model.modelName,
    modelCode: model.modelCode,
    coverImage: coverRaw,
    coverIsVideo: coverRaw ? !isImageUrl(coverRaw) : false,
    outputPrice: model.outputPrice,
    currency: model.currency,
    tokenCost: model.tokenCost,
    companyName: resolveModelBrand(undefined, model.modelName),
  };
}

/** 图生图模型选择展示（与文生图 T2iModelSelectField 一致：点击打开卡片弹窗） */
const I2iModelSelectField: React.FC<I2iModelSelectFieldProps> = ({
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
      placeholderDefaultMessage="请选择要使用的图生图模型"
      onOpen={onOpenModal}
    />
  );
};

export default I2iModelSelectField;
