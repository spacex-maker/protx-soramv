import React from 'react';
import { Form, Row, Col, Space } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { ModelFamily, Model } from './types';
import CreateModelSelectField from '../shared/CreateModelSelectField';
import {
  ModelSelectDisplayData,
  resolveModelBrand,
} from '../shared/modelSelectDisplayUtils';

export interface StyleModelSelectProps {
  form: ReturnType<typeof Form.useForm>[0];
  selectedFamily: ModelFamily | null;
  selectedModel: Model | null;
  styleModelsLoading: boolean;
  onOpenModal: () => void;
  formItemName?: string;
  label?: React.ReactNode;
  compact?: boolean;
}

function toDisplayModel(
  model: Model | ModelFamily,
  isDefault: boolean
): ModelSelectDisplayData {
  return {
    modelName: model.modelName,
    modelCode: model.modelCode,
    coverImage: model.coverImage,
    outputPrice: model.outputPrice,
    currency: model.currency,
    tokenCost: model.tokenCost,
    companyName: resolveModelBrand(model.companyName, model.modelName),
    nameSuffix: isDefault ? ' (默认)' : undefined,
  };
}

const StyleModelSelect: React.FC<StyleModelSelectProps> = ({
  selectedFamily,
  selectedModel,
  styleModelsLoading,
  onOpenModal,
  formItemName = 'styleModelId',
  label,
  compact = false,
}) => {
  const displaySource = selectedModel ?? selectedFamily;
  const isDefault = !selectedModel && Boolean(selectedFamily);

  const defaultLabel = (
    <Space>
      <AppstoreOutlined style={{ color: '#1890ff', fontSize: 12 }} />
      <FormattedMessage id="create.style" defaultMessage="艺术风格" />
    </Space>
  );

  return (
    <Row gutter={16} style={{ marginBottom: compact ? 0 : 32 }}>
      <Col span={24}>
        <CreateModelSelectField
          formItemName={formItemName}
          label={label ?? defaultLabel}
          model={displaySource ? toDisplayModel(displaySource, isDefault) : null}
          loading={styleModelsLoading}
          disabled={!selectedFamily || styleModelsLoading}
          compact={compact}
          billingMode="image"
          marginBottom={0}
          placeholderMessageId="create.style.select.placeholder"
          placeholderDefaultMessage="请选择艺术风格（可选，默认使用家族模型）"
          onOpen={onOpenModal}
        />
      </Col>
    </Row>
  );
};

export default StyleModelSelect;
