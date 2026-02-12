import React from 'react';
import { Form, Select, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { ModelFamily } from './types';
import { isFree } from './utils';
import { ModelSelectDisplay } from './styles';

export interface ModelFamilySelectProps {
  form: ReturnType<typeof Form.useForm>[0];
  /** 当前选中的模型家族 */
  selectedFamily: ModelFamily | null;
  familiesLoading: boolean;
  /** 点击选择框时打开模型家族选择弹窗 */
  onOpenModal: () => void;
}

/**
 * 自定义模型家族选择框显示内容
 */
function renderFamilyDisplay(
  family: ModelFamily | null,
  intl: ReturnType<typeof useIntl>
) {
  if (!family) return null;

  return (
    <ModelSelectDisplay coverImage={family.coverImage}>
      <div className="model-display-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="model-display-name">{family.modelName}</div>
          {family.modelCode && (
            <div className="model-display-code">{family.modelCode}</div>
          )}
        </div>
        {isFree(family.outputPrice, family.currency, family.tokenCost) ? (
          <div className="model-display-free">
            {intl.formatMessage({
              id: 'create.model.free',
              defaultMessage: '免费',
            })}
          </div>
        ) : (family.tokenCost != null && family.tokenCost > 0) ? (
          <div className="model-display-price">
            <span className="model-display-price-amount">{family.tokenCost}</span>
            <span className="model-display-price-currency">
              {intl.formatMessage({ id: 'create.model.token', defaultMessage: ' token' })}
            </span>
          </div>
        ) : (
          family.outputPrice != null && (
            <div className="model-display-price">
              <span className="model-display-price-amount">{family.outputPrice}</span>
              <span className="model-display-price-currency">{family.currency || 'USD'}</span>
              <span className="model-display-price-unit">
                {intl.formatMessage({ id: 'create.model.price.perImage', defaultMessage: '/张' })}
              </span>
            </div>
          )
        )}
      </div>
      {(family.companyName || (family.modelName === 'Nano Banana Pro' ? 'Google' : null)) && (
        <span className="model-display-brand">{family.companyName || 'Google'}</span>
      )}
    </ModelSelectDisplay>
  );
}

/**
 * 模型家族下拉框组件：展示当前选中的家族，点击打开选择弹窗
 */
const ModelFamilySelect: React.FC<ModelFamilySelectProps> = ({
  form,
  selectedFamily,
  familiesLoading,
  onOpenModal,
}) => {
  const intl = useIntl();

  return (
    <Form.Item
      name="familyId"
      label={
        <Space>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <FormattedMessage
            id="create.model.family.select"
            defaultMessage="选择模型家族"
          />
        </Space>
      }
      style={{ marginBottom: 20 }}
    >
      <div
        onClick={() => !familiesLoading && onOpenModal()}
        style={{ cursor: familiesLoading ? 'not-allowed' : 'pointer' }}
      >
        <Select
          value={selectedFamily?.id}
          open={false}
          placeholder={intl.formatMessage({
            id: 'create.model.family.select.placeholder',
            defaultMessage: '请选择模型家族',
          })}
          loading={familiesLoading}
          style={{ width: '100%', pointerEvents: 'none' }}
          optionLabelProp="label"
          className="model-family-select"
        >
          {selectedFamily && (
            <Select.Option
              key={selectedFamily.id}
              value={selectedFamily.id}
              label={renderFamilyDisplay(selectedFamily, intl)}
            >
              {selectedFamily.modelName}
            </Select.Option>
          )}
        </Select>
      </div>
    </Form.Item>
  );
};

export default ModelFamilySelect;
