import React from 'react';
import { Form, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { ModelFamily } from './types';
import CreateModelSelectField from '../shared/CreateModelSelectField';
import {
  ModelSelectDisplayData,
  resolveModelBrand,
} from '../shared/modelSelectDisplayUtils';

export interface ModelFamilySelectProps {
  form: ReturnType<typeof Form.useForm>[0];
  selectedFamily: ModelFamily | null;
  familiesLoading: boolean;
  onOpenModal: () => void;
  formItemName?: string;
  label?: React.ReactNode;
  compact?: boolean;
}

function toDisplayModel(family: ModelFamily): ModelSelectDisplayData {
  return {
    modelName: family.modelName,
    modelCode: family.modelCode,
    coverImage: family.coverImage,
    outputPrice: family.outputPrice,
    currency: family.currency,
    tokenCost: family.tokenCost,
    companyName: resolveModelBrand(family.companyName, family.modelName),
  };
}

const ModelFamilySelect: React.FC<ModelFamilySelectProps> = ({
  selectedFamily,
  familiesLoading,
  onOpenModal,
  formItemName = 'familyId',
  label,
  compact = false,
}) => {
  const defaultLabel = (
    <Space>
      <RobotOutlined style={{ color: '#1890ff' }} />
      <FormattedMessage id="create.model.family.select" defaultMessage="选择模型家族" />
    </Space>
  );

  return (
    <CreateModelSelectField
      formItemName={formItemName}
      label={label ?? defaultLabel}
      model={selectedFamily ? toDisplayModel(selectedFamily) : null}
      loading={familiesLoading}
      disabled={familiesLoading}
      compact={compact}
      billingMode="image"
      marginBottom={compact ? 28 : 36}
      placeholderMessageId="create.model.family.select.placeholder"
      placeholderDefaultMessage="请选择模型家族"
      onOpen={onOpenModal}
    />
  );
};

export default ModelFamilySelect;
