import React from 'react';
import { Form, Select, Row, Col, Space } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { ModelFamily, Model } from './types';
import { isFree } from './utils';
import { ModelSelectDisplay } from './styles';

export interface StyleModelSelectProps {
  form: ReturnType<typeof Form.useForm>[0];
  /** 当前选中的模型家族（用于显示“默认”选项） */
  selectedFamily: ModelFamily | null;
  /** 当前选中的艺术风格模型，null 表示使用家族默认 */
  selectedModel: Model | null;
  styleModelsLoading: boolean;
  /** 点击选择框时打开艺术风格选择弹窗 */
  onOpenModal: () => void;
}

/**
 * 自定义艺术风格选择框显示内容
 */
function renderStyleModelDisplay(
  model: Model | ModelFamily | null,
  isDefault: boolean,
  intl: ReturnType<typeof useIntl>
) {
  if (!model) return null;

  return (
    <ModelSelectDisplay coverImage={model.coverImage}>
      <div className="model-display-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="model-display-name">
            {isDefault ? `${model.modelName} (默认)` : model.modelName}
          </div>
          {model.modelCode && (
            <div className="model-display-code">{model.modelCode}</div>
          )}
        </div>
        {isFree(model.outputPrice, model.currency, model.tokenCost) ? (
          <div className="model-display-free">
            {intl.formatMessage({
              id: 'create.model.free',
              defaultMessage: '免费',
            })}
          </div>
        ) : (model.tokenCost != null && model.tokenCost > 0) ? (
          <div className="model-display-price">
            <span className="model-display-price-amount">{model.tokenCost}</span>
            <span className="model-display-price-currency">
              {intl.formatMessage({ id: 'create.model.token', defaultMessage: ' token' })}
            </span>
          </div>
        ) : (
          model.outputPrice != null && (
            <div className="model-display-price">
              <span className="model-display-price-amount">{model.outputPrice}</span>
              <span className="model-display-price-currency">{model.currency || 'USD'}</span>
              <span className="model-display-price-unit">
                {intl.formatMessage({ id: 'create.model.price.perImage', defaultMessage: '/张' })}
              </span>
            </div>
          )
        )}
      </div>
      {(model.companyName || (model.modelName === 'Nano Banana Pro' ? 'Google' : null)) && (
        <span className="model-display-brand">{model.companyName || 'Google'}</span>
      )}
    </ModelSelectDisplay>
  );
}

/**
 * 艺术风格下拉框组件：展示当前选中的风格/家族默认，点击打开选择弹窗
 */
const StyleModelSelect: React.FC<StyleModelSelectProps> = ({
  form,
  selectedFamily,
  selectedModel,
  styleModelsLoading,
  onOpenModal,
}) => {
  const intl = useIntl();

  return (
    <Row gutter={16} style={{ marginBottom: 32 }}>
      <Col span={24}>
        <Form.Item
          name="styleModelId"
          label={
            <Space>
              <AppstoreOutlined style={{ color: '#1890ff', fontSize: 12 }} />
              <FormattedMessage id="create.style" defaultMessage="艺术风格" />
            </Space>
          }
          style={{ marginBottom: 0 }}
        >
          <div
            onClick={() => !styleModelsLoading && selectedFamily && onOpenModal()}
            style={{
              cursor: !selectedFamily || styleModelsLoading ? 'not-allowed' : 'pointer',
            }}
          >
            <Select
              value={selectedModel?.id ?? null}
              open={false}
              placeholder={intl.formatMessage({
                id: 'create.style.select.placeholder',
                defaultMessage: '请选择艺术风格（可选，默认使用家族模型）',
              })}
              loading={styleModelsLoading}
              disabled={!selectedFamily || styleModelsLoading}
              allowClear={false}
              style={{ width: '100%', pointerEvents: 'none' }}
              optionLabelProp="label"
              className="model-style-select"
            >
              {(selectedModel || selectedFamily) && (
                <Select.Option
                  key={selectedModel?.id ?? `family-${selectedFamily?.id}`}
                  value={selectedModel?.id ?? null}
                  label={
                    selectedModel
                      ? renderStyleModelDisplay(selectedModel, false, intl)
                      : selectedFamily
                        ? renderStyleModelDisplay(selectedFamily, true, intl)
                        : null
                  }
                >
                  {selectedModel
                    ? selectedModel.modelName
                    : selectedFamily
                      ? `${selectedFamily.modelName} (默认)`
                      : ''}
                </Select.Option>
              )}
            </Select>
          </div>
        </Form.Item>
      </Col>
    </Row>
  );
};

export default StyleModelSelect;
