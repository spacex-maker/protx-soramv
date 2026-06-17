import React from 'react';
import { Form, Select, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { Model } from './types';
import { ModelSelectDisplay } from './styles';
import { isVideoUrl, modelCoverUrl } from './utils';
import CoverPreviewVideo from '../shared/CoverPreviewVideo';

export interface VideoModelSelectFieldProps {
  selectedModel: Model | null;
  modelsLoading: boolean;
  onOpenModal: () => void;
}

function renderModelSelectDisplay(model: Model | null) {
  if (!model) return null;

  const cover = modelCoverUrl(model);
  const isVideo = Boolean(cover && isVideoUrl(cover));

  return (
    <ModelSelectDisplay coverImage={cover} isVideo={isVideo}>
      {isVideo && cover && (
        <CoverPreviewVideo className="cover-video" src={cover} playMode="always" />
      )}
      <div className="model-display-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="model-display-name">{model.modelName}</div>
          {model.modelCode && <div className="model-display-code">{model.modelCode}</div>}
        </div>
        {model.tokenCost !== null && model.tokenCost !== undefined && (
          <div className="model-display-price">
            <span className="model-display-price-amount">{model.tokenCost}</span>
            <span className="model-display-price-currency">Token</span>
            <span className="model-display-price-unit">
              <FormattedMessage id="create.model.price.perSecond" defaultMessage="/秒" />
            </span>
          </div>
        )}
      </div>
    </ModelSelectDisplay>
  );
}

const VideoModelSelectField: React.FC<VideoModelSelectFieldProps> = ({
  selectedModel,
  modelsLoading,
  onOpenModal,
}) => {
  const intl = useIntl();

  return (
    <Form.Item
      name="modelId"
      label={
        <Space>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <FormattedMessage id="create.model.select" defaultMessage="选择模型" />
        </Space>
      }
      style={{ marginBottom: 28 }}
    >
      <div
        onClick={() => !modelsLoading && onOpenModal()}
        style={{ cursor: modelsLoading ? 'not-allowed' : 'pointer' }}
      >
        <Select
          value={selectedModel?.id}
          open={false}
          placeholder={intl.formatMessage({
            id: 'create.model.select.placeholder',
            defaultMessage: '请选择要使用的视频生成模型',
          })}
          loading={modelsLoading}
          style={{ width: '100%', pointerEvents: 'none' }}
          optionLabelProp="label"
          className="model-video-select"
        >
          {selectedModel && (
            <Select.Option
              key={selectedModel.id}
              value={selectedModel.id}
              label={renderModelSelectDisplay(selectedModel)}
            >
              {selectedModel.modelName}
            </Select.Option>
          )}
        </Select>
      </div>
    </Form.Item>
  );
};

export default VideoModelSelectField;
