import React from 'react';
import { Form } from 'antd';
import type { Rule } from 'antd/es/form';
import { useIntl } from 'react-intl';
import ModelSelectBar from './ModelSelectBar';
import ModelSelectBarContent from './ModelSelectBarContent';
import {
  ModelSelectBillingMode,
  ModelSelectDisplayData,
  resolveCoverMedia,
} from './modelSelectDisplayUtils';

export interface CreateModelSelectFieldProps {
  formItemName: string;
  label: React.ReactNode;
  model: ModelSelectDisplayData | null;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  showBrand?: boolean;
  billingMode?: ModelSelectBillingMode;
  marginBottom?: number;
  rules?: Rule[];
  placeholderMessageId: string;
  placeholderDefaultMessage: string;
  onOpen: () => void;
}

/**
 * 创作台统一模型选择展示字段（文生图 / 文生视频 / 语音生成等）
 * 点击打开弹窗，由外层页面处理选择逻辑
 */
const CreateModelSelectField: React.FC<CreateModelSelectFieldProps> = ({
  formItemName,
  label,
  model,
  loading = false,
  disabled = false,
  compact = false,
  showBrand = true,
  billingMode = 'image',
  marginBottom = 28,
  rules,
  placeholderMessageId,
  placeholderDefaultMessage,
  onOpen,
}) => {
  const intl = useIntl();
  const { cover, isVideo } = resolveCoverMedia(model);
  const isDisabled = disabled || loading;

  return (
    <Form.Item name={formItemName} label={label} rules={rules} style={{ marginBottom }}>
      <ModelSelectBar
        compact={compact}
        loading={loading}
        disabled={isDisabled}
        placeholder={intl.formatMessage({
          id: placeholderMessageId,
          defaultMessage: placeholderDefaultMessage,
        })}
        coverImage={cover}
        isVideo={isVideo}
        onClick={onOpen}
      >
        {model ? (
          <ModelSelectBarContent
            model={model}
            billingMode={billingMode}
            showBrand={showBrand && !compact}
          />
        ) : null}
      </ModelSelectBar>
    </Form.Item>
  );
};

export default CreateModelSelectField;
