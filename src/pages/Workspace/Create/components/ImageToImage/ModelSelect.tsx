import React from 'react';
import { Form, Select, Space } from 'antd';
import { RobotOutlined, FileImageOutlined, EyeOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { Model } from './types';
import { 
  ModelOptionWrapper,
  ModelSelectDisplay,
  AspectRatioTag,
  ResolutionTag,
  DetailButton,
} from './styles';
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

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  selectedModel,
  modelsLoading,
  form,
  onModelChange,
  onShowModelDetail,
}) => {
  const intl = useIntl();

  // 自定义模型选择框显示内容
  const renderModelSelectDisplay = (model: Model | null) => {
    if (!model) return null;
    
    const coverImage = (model as any).coverImage ? normalizeUrl((model as any).coverImage) : null;
    const isVideo = coverImage ? !isImageUrl(coverImage) : false;
    
    return (
      <ModelSelectDisplay coverImage={coverImage}>
        {isVideo && coverImage && (
          <video 
            className="cover-video"
            src={coverImage}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        {!isVideo && coverImage && (
          <img className="cover-image" src={coverImage} alt={model.modelName} />
        )}
        <div className="model-display-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="model-display-name">
              {model.modelName}
            </div>
            {model.modelCode && (
              <div className="model-display-code">{model.modelCode}</div>
            )}
          </div>
          {model.tokenCost !== null && model.tokenCost !== undefined && (
            <div className="model-display-price">
              <span className="model-display-price-amount">
                {model.tokenCost}
              </span>
              <span className="model-display-price-currency">
                Token
              </span>
            </div>
          )}
        </div>
      </ModelSelectDisplay>
    );
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
      <Select
        value={selectedModel?.id}
        onChange={onModelChange}
        placeholder={intl.formatMessage({ 
          id: 'create.model.select.placeholder', 
          defaultMessage: '请选择要使用的图片生成模型' 
        })}
        loading={modelsLoading}
        style={{ width: '100%' }}
        optionLabelProp="label"
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        dropdownClassName="model-select-dropdown"
        className="model-image-select"
      >
        {models.map(model => (
          <Select.Option 
            key={model.id} 
            value={model.id}
            label={
              <div style={{ width: '100%' }}>
                {renderModelSelectDisplay(model)}
              </div>
            }
          >
            {(() => {
              const coverImage = (model as any).coverImage ? normalizeUrl((model as any).coverImage) : null;
              const isVideo = coverImage ? !isImageUrl(coverImage) : false;
              return (
                <ModelOptionWrapper coverImage={coverImage}>
                  {isVideo && coverImage && (
                    <video 
                      className="cover-video"
                      src={coverImage}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  )}
                  {!isVideo && coverImage && (
                    <img className="cover-image" src={coverImage} alt={model.modelName} />
                  )}
                  <div className="model-header">
                    <FileImageOutlined style={{ color: '#1890ff', fontSize: 18, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="model-name">
                        {model.modelName}
                      </div>
                      {model.modelCode && (
                        <div className="model-code">
                          {model.modelCode}
                        </div>
                      )}
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
                          <ResolutionTag>
                            {model.imageDefaultResolution}
                          </ResolutionTag>
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
                      <FormattedMessage
                        id="create.model.detail"
                        defaultMessage="详情"
                      />
                    </DetailButton>
                  </div>
                </ModelOptionWrapper>
              );
            })()}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default ModelSelect;

