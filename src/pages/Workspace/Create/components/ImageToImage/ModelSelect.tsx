import React, { useState } from 'react';
import { Dropdown, Form, Space } from 'antd';
import { RobotOutlined, FileImageOutlined, EyeOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { Model } from './types';
import {
  ModelOptionWrapper,
  AspectRatioTag,
  ResolutionTag,
  DetailButton,
} from './styles';
import ModelSelectBar from '../shared/ModelSelectBar';
import { ModelSelectDropdownItem, ModelSelectDropdownPanel } from '../shared/ModelSelectBarStyles';
import { getModelDescription } from '../modelUtils';
import {
  getAspectRatioOption,
  isImageUrl,
  normalizeUrl,
  getModelAspectRatios,
} from './utils';

interface ModelSelectProps {
  models: Model[];
  selectedModel: Model | null;
  modelsLoading: boolean;
  form: any;
  onModelChange: (modelId: number) => void;
  onShowModelDetail: (model: Model) => void;
}

function renderSelectedModelContent(model: Model) {
  return (
    <div className="model-display-header">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="model-display-name">{model.modelName}</div>
        {model.modelCode && <div className="model-display-code">{model.modelCode}</div>}
      </div>
      {model.tokenCost !== null && model.tokenCost !== undefined && (
        <div className="model-display-price">
          <span className="model-display-price-amount">{model.tokenCost}</span>
          <span className="model-display-price-currency">Token</span>
        </div>
      )}
    </div>
  );
}

function renderModelOption(
  model: Model,
  intl: ReturnType<typeof useIntl>,
  onShowModelDetail: (model: Model) => void
) {
  const coverImage = (model as any).coverImage ? normalizeUrl((model as any).coverImage) : null;
  const isVideo = coverImage ? !isImageUrl(coverImage) : false;

  return (
    <ModelOptionWrapper coverImage={coverImage}>
      {isVideo && coverImage && (
        <video className="cover-video" src={coverImage} autoPlay loop muted playsInline />
      )}
      {!isVideo && coverImage && (
        <img className="cover-image" src={coverImage} alt={model.modelName} />
      )}
      <div className="model-header">
        <FileImageOutlined style={{ color: '#1890ff', fontSize: 18, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="model-name">{model.modelName}</div>
          {model.modelCode && <div className="model-code">{model.modelCode}</div>}
        </div>
        {model.tokenCost !== null && model.tokenCost !== undefined && (
          <div className="model-price">
            <span className="model-price-amount">{model.tokenCost}</span>
            <span className="model-price-currency">Token</span>
          </div>
        )}
      </div>
      {getModelDescription(model, intl.locale || '') && (
        <div className="model-description" style={{ marginTop: 6, paddingLeft: 26 }}>
          {getModelDescription(model, intl.locale || '')}
        </div>
      )}
      <div className="model-bottom-row">
        {(getModelAspectRatios(model).length > 0 || model.imageDefaultResolution) && (
          <div className="model-aspect-ratios">
            {getModelAspectRatios(model).map((ratio, index) => {
              const ratioOption = getAspectRatioOption(ratio, intl);
              return (
                <AspectRatioTag key={index}>
                  {ratioOption.icon}
                  <span>{ratio}</span>
                </AspectRatioTag>
              );
            })}
            {model.imageDefaultResolution && (
              <ResolutionTag>{model.imageDefaultResolution}</ResolutionTag>
            )}
          </div>
        )}
        <DetailButton
          className="model-detail-button"
          size="small"
          icon={<EyeOutlined />}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onShowModelDetail(model);
          }}
        >
          <FormattedMessage id="create.model.detail" defaultMessage="详情" />
        </DetailButton>
      </div>
    </ModelOptionWrapper>
  );
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  selectedModel,
  modelsLoading,
  onModelChange,
  onShowModelDetail,
}) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const selectedCover = selectedModel
    ? (selectedModel as any).coverImage
      ? normalizeUrl((selectedModel as any).coverImage)
      : null
    : null;
  const selectedIsVideo = selectedCover ? !isImageUrl(selectedCover) : false;

  const handleSelect = (modelId: number) => {
    onModelChange(modelId);
    setOpen(false);
  };

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
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={['click']}
        placement="bottomLeft"
        disabled={modelsLoading || models.length === 0}
        dropdownRender={() => (
          <ModelSelectDropdownPanel>
            {models.map((model) => (
              <ModelSelectDropdownItem
                key={model.id}
                $active={selectedModel?.id === model.id}
                onClick={() => handleSelect(model.id)}
              >
                {renderModelOption(model, intl, onShowModelDetail)}
              </ModelSelectDropdownItem>
            ))}
          </ModelSelectDropdownPanel>
        )}
      >
        <div>
          <ModelSelectBar
            loading={modelsLoading}
            disabled={modelsLoading || models.length === 0}
            placeholder={intl.formatMessage({
              id: 'create.model.select.placeholder',
              defaultMessage: '请选择要使用的图片生成模型',
            })}
            coverImage={selectedCover}
            isVideo={selectedIsVideo}
          >
            {selectedModel ? renderSelectedModelContent(selectedModel) : null}
          </ModelSelectBar>
        </div>
      </Dropdown>
    </Form.Item>
  );
};

export default ModelSelect;
