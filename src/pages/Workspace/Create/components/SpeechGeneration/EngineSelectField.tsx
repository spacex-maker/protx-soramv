import React from 'react';
import { Form, Select, Space } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { ModelSelectDisplay } from '../ImageToVideo/styles';
import { EngineSelectTrigger } from './styles';
import { EngineModel } from './engineTypes';
import { formatEngineTokenCost, getEngineDisplayName, isPerCharUnit, isVideoUrl, modelCoverUrl } from './engineUtils';

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

function renderEngineSelectDisplay(model: EngineModel | null, locale: string) {
  if (!model) return null;

  const cover = modelCoverUrl(model);
  const isVideo = Boolean(cover && isVideoUrl(cover));
  const perChar = isPerCharUnit(model.unit);

  return (
    <ModelSelectDisplay coverImage={cover} isVideo={isVideo} style={{ width: '100%', boxSizing: 'border-box' }}>
      {isVideo && cover && (
        <video
          className="cover-video"
          src={cover}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      )}
      <div className="model-display-header" style={{ width: '100%' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="model-display-name">{getEngineDisplayName(model, locale)}</div>
          {model.modelCode && <div className="model-display-code">{model.modelCode}</div>}
        </div>
        {model.tokenCost !== null && model.tokenCost !== undefined && (
          <div className="model-display-price">
            <span className="model-display-price-amount">{formatEngineTokenCost(model)}</span>
            <span className="model-display-price-currency">Token</span>
            <span className="model-display-price-unit">
              {perChar ? (
                <FormattedMessage id="create.model.price.perChar" defaultMessage="/字" />
              ) : (
                <FormattedMessage id="create.model.price.perSecond" defaultMessage="/秒" />
              )}
            </span>
          </div>
        )}
      </div>
    </ModelSelectDisplay>
  );
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
  const intl = useIntl();

  return (
    <Form.Item
      name="modelCode"
      label={(
        <Space>
          <SoundOutlined style={{ color: iconColor }} />
          <FormattedMessage id={labelMessageId} defaultMessage={labelDefaultMessage} />
        </Space>
      )}
      rules={[{ required: true }]}
      style={{ marginBottom: 0, width: '100%' }}
    >
      <EngineSelectTrigger
        data-disabled={enginesLoading ? 'true' : 'false'}
        onClick={() => !enginesLoading && onOpenModal()}
      >
        <Select
          value={selectedEngine?.modelCode}
          open={false}
          placeholder={intl.formatMessage({
            id: placeholderMessageId,
            defaultMessage: placeholderDefaultMessage,
          })}
          loading={enginesLoading}
          style={{ width: '100%', pointerEvents: 'none' }}
          optionLabelProp="label"
          className="speech-engine-select"
        >
          {selectedEngine && (
            <Select.Option
              key={selectedEngine.modelCode}
              value={selectedEngine.modelCode}
              label={renderEngineSelectDisplay(selectedEngine, locale)}
            >
              {getEngineDisplayName(selectedEngine, locale)}
            </Select.Option>
          )}
        </Select>
      </EngineSelectTrigger>
    </Form.Item>
  );
};

export default EngineSelectField;
