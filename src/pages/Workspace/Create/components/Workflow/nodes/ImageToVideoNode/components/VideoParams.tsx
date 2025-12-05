import React from 'react';
import { Select, Slider } from 'antd';
import { Model } from '../../../../ImageToVideo/types';
import { getAspectRatioOption, getModelAspectRatios, getModelDurationOptions } from '../../../../ImageToVideo/utils';
import { ParamRow, ParamItem, CompactLabel, StyledSelect, StyledSlider } from '../styles';
import { ImageToVideoNodeData } from '../types';

const { Option } = Select;

interface VideoParamsProps {
  selectedModel: Model | null;
  aspectRatio: string;
  duration: number;
  videoFormat: string;
  videoSupportStyle: string;
  videoQuality: string;
  nodeData: ImageToVideoNodeData | null;
  onAspectRatioChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onVideoFormatChange: (value: string) => void;
  onVideoSupportStyleChange: (value: string) => void;
  onVideoQualityChange: (value: string) => void;
}

export const VideoParams: React.FC<VideoParamsProps> = ({
  selectedModel,
  aspectRatio,
  duration,
  videoFormat,
  videoSupportStyle,
  videoQuality,
  nodeData,
  onAspectRatioChange,
  onDurationChange,
  onVideoFormatChange,
  onVideoSupportStyleChange,
  onVideoQualityChange,
}) => {
  const getAvailableAspectRatios = () => {
    if (!selectedModel) return [];
    return getModelAspectRatios(selectedModel).map(ratio => getAspectRatioOption(ratio, { formatMessage: (msg: any) => msg.defaultMessage || msg.id }));
  };

  const getAvailableVideoFormats = () => {
    if (!selectedModel || !selectedModel.videoFormats) return [];
    return selectedModel.videoFormats.split(',').map(f => f.trim());
  };

  const getAvailableVideoStyles = () => {
    if (!selectedModel || !selectedModel.videoSupportStyle) return [];
    return selectedModel.videoSupportStyle.split(',').map(s => s.trim()).filter(s => s);
  };

  const getAvailableVideoQualities = () => {
    if (!selectedModel || !selectedModel.videoQuality) return [];
    return selectedModel.videoQuality.split(',').map(q => q.trim()).filter(q => q);
  };

  const getDurationOptions = () => {
    return getModelDurationOptions(selectedModel);
  };

  const getMaxDuration = () => {
    return selectedModel?.videoDuration || 15;
  };

  const availableAspectRatios = getAvailableAspectRatios();
  const durationOptions = getDurationOptions();
  const availableVideoFormats = getAvailableVideoFormats();
  const availableVideoStyles = getAvailableVideoStyles();
  const availableVideoQualities = getAvailableVideoQualities();

  return (
    <>
      {selectedModel && (availableAspectRatios.length > 0 || (durationOptions !== null && durationOptions.length > 0)) && (
        <ParamRow>
          {availableAspectRatios.length > 0 && (
            <ParamItem>
              <CompactLabel>视频比例</CompactLabel>
              <StyledSelect
                value={aspectRatio}
                onChange={(value: unknown) => {
                  onAspectRatioChange(value as string);
                }}
                className="nodrag"
                popupClassName="nodrag"
                placeholder="比例"
              >
                {availableAspectRatios.map((ratio, index) => (
                  <Option key={ratio.value || `ratio-${index}`} value={ratio.value}>
                    {ratio.icon} {ratio.label}
                  </Option>
                ))}
              </StyledSelect>
            </ParamItem>
          )}

          {durationOptions !== null && durationOptions.length > 0 && (
            <ParamItem>
              <CompactLabel>视频时长</CompactLabel>
              <StyledSelect
                value={duration}
                onChange={(value: unknown) => {
                  onDurationChange(value as number);
                }}
                className="nodrag"
                popupClassName="nodrag"
                placeholder="时长"
              >
                {durationOptions.map((d, index) => (
                  <Option key={d !== null && d !== undefined ? d : `duration-${index}`} value={d}>
                    {d}s
                  </Option>
                ))}
              </StyledSelect>
            </ParamItem>
          )}
        </ParamRow>
      )}

      {selectedModel && durationOptions === null && (
        <div style={{ marginBottom: 12 }}>
          <CompactLabel>视频时长 (秒)</CompactLabel>
          <StyledSlider
            min={4}
            max={getMaxDuration()}
            value={duration}
            marks={{ 
              4: '4s', 
              8: '8s', 
              [getMaxDuration()]: `${getMaxDuration()}s`
            }}
            onChange={(val) => {
              onDurationChange(val);
            }}
            className="nodrag"
          />
        </div>
      )}

      {selectedModel && (availableVideoFormats.length > 0 || availableVideoStyles.length > 0 || availableVideoQualities.length > 0) && (
        <ParamRow>
          {availableVideoFormats.length > 0 && (
            <ParamItem>
              <CompactLabel>输出格式</CompactLabel>
              <StyledSelect
                value={videoFormat}
                onChange={(value: unknown) => {
                  onVideoFormatChange(value as string);
                }}
                className="nodrag"
                popupClassName="nodrag"
                placeholder="格式"
              >
                {availableVideoFormats.map((format, index) => (
                  <Option key={format || `format-${index}`} value={format}>
                    {format.toUpperCase()}
                  </Option>
                ))}
              </StyledSelect>
            </ParamItem>
          )}

          {availableVideoStyles.length > 0 && (
            <ParamItem>
              <CompactLabel>视频风格</CompactLabel>
              <StyledSelect
                value={videoSupportStyle}
                onChange={(value: unknown) => {
                  onVideoSupportStyleChange(value as string);
                }}
                className="nodrag"
                popupClassName="nodrag"
                placeholder="风格"
              >
                {availableVideoStyles.map((style, index) => (
                  <Option key={style || `style-${index}`} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Option>
                ))}
              </StyledSelect>
            </ParamItem>
          )}

          {availableVideoQualities.length > 0 && (
            <ParamItem>
              <CompactLabel>视频质量</CompactLabel>
              <StyledSelect
                value={videoQuality}
                onChange={(value: unknown) => {
                  onVideoQualityChange(value as string);
                }}
                className="nodrag"
                popupClassName="nodrag"
                placeholder="质量"
              >
                {availableVideoQualities.map((quality, index) => (
                  <Option key={quality || `quality-${index}`} value={quality}>
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </Option>
                ))}
              </StyledSelect>
            </ParamItem>
          )}
        </ParamRow>
      )}
    </>
  );
};

