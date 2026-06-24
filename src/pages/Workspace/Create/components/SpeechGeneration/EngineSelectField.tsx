import React from 'react';
import { Space } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import CreateModelSelectField from '../shared/CreateModelSelectField';
import {
  ModelSelectDisplayData,
  resolveModelBrand,
} from '../shared/modelSelectDisplayUtils';
import { EngineModel } from './engineTypes';
import {
  getEngineDisplayName,
  isPerCharUnit,
  isVideoUrl,
  modelCoverUrl,
} from './engineUtils';

export interface EngineSelectFieldProps {
  engines: EngineModel[];
  selectedEngine: EngineModel | null;
  enginesLoading: boolean;
  locale: string;
  onOpenModal: () => void;
  labelMessageId?: string;
  labelDefaultMessage?: string;
  placeholderMessageId?: string;
  placeholderDefaultMessage?: string;
  iconColor?: string;
}

function toDisplayModel(model: EngineModel, locale: string): ModelSelectDisplayData {
  const cover = modelCoverUrl(model);
  return {
    modelName: getEngineDisplayName(model, locale),
    modelCode: model.modelCode,
    coverImage: cover,
    coverIsVideo: cover ? isVideoUrl(cover) : false,
    tokenCost: model.tokenCost,
    tokenUnit: isPerCharUnit(model.unit) ? 'char' : 'second',
    companyName: resolveModelBrand(model.companyName, model.modelName),
  };
}

const EngineSelectField: React.FC<EngineSelectFieldProps> = ({
  selectedEngine,
  enginesLoading,
  locale,
  onOpenModal,
  labelMessageId = 'create.speech.engine',
  labelDefaultMessage = 'TTS 引擎',
  placeholderMessageId = 'create.speech.enginePlaceholder',
  placeholderDefaultMessage = '请选择 TTS 引擎',
  iconColor = '#13c2c2',
}) => {
  const defaultLabel = (
    <Space>
      <SoundOutlined style={{ color: iconColor }} />
      <FormattedMessage id={labelMessageId} defaultMessage={labelDefaultMessage} />
    </Space>
  );

  return (
    <CreateModelSelectField
      formItemName="modelCode"
      label={defaultLabel}
      model={selectedEngine ? toDisplayModel(selectedEngine, locale) : null}
      loading={enginesLoading}
      disabled={enginesLoading}
      billingMode="speech"
      marginBottom={0}
      rules={[{ required: true }]}
      placeholderMessageId={placeholderMessageId}
      placeholderDefaultMessage={placeholderDefaultMessage}
      onOpen={onOpenModal}
    />
  );
};

export default EngineSelectField;
