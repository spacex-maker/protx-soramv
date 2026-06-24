import React from 'react';
import { Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { Model } from './types';
import { isVideoUrl, modelCoverUrl } from './utils';
import CreateModelSelectField from '../shared/CreateModelSelectField';
import {
  ModelSelectDisplayData,
  resolveModelBrand,
} from '../shared/modelSelectDisplayUtils';

export interface VideoModelSelectFieldProps {
  selectedModel: Model | null;
  modelsLoading: boolean;
  onOpenModal: () => void;
  formItemName?: string;
  label?: React.ReactNode;
  compact?: boolean;
  marginBottom?: number;
}

function toDisplayModel(model: Model): ModelSelectDisplayData {
  const cover = modelCoverUrl(model);
  return {
    modelName: model.modelName,
    modelCode: model.modelCode,
    coverImage: cover,
    coverIsVideo: cover ? isVideoUrl(cover) : false,
    tokenCost: model.tokenCost,
    companyName: resolveModelBrand(model.companyName, model.modelName),
  };
}

/** 文生视频 / 图生视频模型选择展示（与文生图共用 CreateModelSelectField） */
const VideoModelSelectField: React.FC<VideoModelSelectFieldProps> = ({
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
      <RobotOutlined style={{ color: '#1890ff' }} />
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
      billingMode="video"
      marginBottom={marginBottom}
      placeholderMessageId="create.model.select.placeholder"
      placeholderDefaultMessage="请选择要使用的视频生成模型"
      onOpen={onOpenModal}
    />
  );
};

export default VideoModelSelectField;
