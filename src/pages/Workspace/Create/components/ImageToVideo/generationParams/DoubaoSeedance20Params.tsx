import React, { useState } from 'react';
import { Button, Form, Input, Row, Col, Select, Space, Typography } from 'antd';
import {
  AudioOutlined,
  FileImageOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  InputImageContainer,
  OverlayActions,
  CustomUploadArea,
  UploadIcon,
  UploadText,
  UploadHint,
} from '../styles';

const { TextArea } = Input;
const { Text } = Typography;

/** 方舟官方 model_code */
export const DOUBAO_SEEDANCE_2_0_260128 = 'doubao-seedance-2-0-260128';
export const DOUBAO_SEEDANCE_2_0_FAST_260128 = 'doubao-seedance-2-0-fast-260128';

/** 与具体 model_code 无关，避免与通用 i2v-upload-input 冲突 */
export const DOUBAO_SEEDANCE_20_I2V_FIRST_INPUT_ID = 'i2v-doubao-seedance-20-first';
export const DOUBAO_SEEDANCE_20_I2V_END_INPUT_ID = 'i2v-doubao-seedance-20-end';

export interface DoubaoSeedance20ParamsProps {
  isDark: boolean;
  originalImageUrl: string | null;
  endFrameImageUrl: string | null;
  onFirstFrameFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFirstFrame: (e: React.MouseEvent) => void;
  onEndFrameFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveEndFrame: (e: React.MouseEvent) => void;
  onFirstFrameDropFile: (file: File | null) => void;
  onEndFrameDropFile: (file: File | null) => void;
  ratioAndFormatRow: React.ReactNode;
  durationField: React.ReactNode;
}

/**
 * Seedance 2.0 / 2.0 Fast 共用图生视频参数（字段一致；分辨率等约束由父级 model 元数据 + 文案区分）
 */
const DoubaoSeedance20Params: React.FC<DoubaoSeedance20ParamsProps> = ({
  isDark,
  originalImageUrl,
  endFrameImageUrl,
  onFirstFrameFileChange,
  onRemoveFirstFrame,
  onEndFrameFileChange,
  onRemoveEndFrame,
  onFirstFrameDropFile,
  onEndFrameDropFile,
  ratioAndFormatRow,
  durationField,
}) => {
  const intl = useIntl();
  const [dragSlot, setDragSlot] = useState<'first' | 'end' | null>(null);

  const bindDropZone = (slot: 'first' | 'end', onDropFile: (file: File | null) => void) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragSlot(slot);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setDragSlot((cur) => (cur === slot ? null : cur));
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragSlot(null);
      const file = e.dataTransfer.files?.[0] ?? null;
      onDropFile(file);
    },
  });

  const renderSameUploadUi = (
    slot: 'first' | 'end',
    imageUrl: string | null,
    inputId: string,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: (e: React.MouseEvent) => void,
    onDropFile: (file: File | null) => void,
  ) => {
    const dropHandlers = bindDropZone(slot, onDropFile);
    if (imageUrl) {
      return (
        <InputImageContainer {...dropHandlers}>
          <img src={imageUrl} alt="" />
          <OverlayActions className="overlay-actions">
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={onRemove}>
              <FormattedMessage id="create.i2v.replaceImage" defaultMessage="更换图片" />
            </Button>
          </OverlayActions>
        </InputImageContainer>
      );
    }
    return (
      <CustomUploadArea
        $isDark={isDark}
        $isDragging={dragSlot === slot}
        onDragOver={dropHandlers.onDragOver}
        onDragLeave={dropHandlers.onDragLeave}
        onDrop={dropHandlers.onDrop}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <input id={inputId} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        <UploadIcon $isDark={isDark}>
          <InboxOutlined style={{ fontSize: 48 }} />
        </UploadIcon>
        <UploadText $isDark={isDark}>
          <FormattedMessage id="create.i2v.upload.click" defaultMessage="点击或拖拽上传" />
        </UploadText>
        <UploadHint $isDark={isDark}>
          <FormattedMessage id="create.i2v.upload.supportedFormats" defaultMessage="支持 JPG, PNG, WebP" />
        </UploadHint>
      </CustomUploadArea>
    );
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        <Col xs={24} md={12}>
          <Form.Item
            name="inputFile"
            label={
              <Space>
                <FileImageOutlined style={{ color: '#1890ff' }} />
                <FormattedMessage id="create.i2v.upload" defaultMessage="上传参考图片 (起始帧)" />
              </Space>
            }
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'create.i2v.upload.required',
                  defaultMessage: '请上传参考图片',
                }),
              },
            ]}
            style={{ marginBottom: 0, marginTop: 0 }}
          >
            {renderSameUploadUi(
              'first',
              originalImageUrl,
              DOUBAO_SEEDANCE_20_I2V_FIRST_INPUT_ID,
              onFirstFrameFileChange,
              onRemoveFirstFrame,
              onFirstFrameDropFile,
            )}
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={
              <Space>
                <FileImageOutlined style={{ color: '#1890ff' }} />
                <FormattedMessage id="create.seedance2.endFrame" defaultMessage="尾帧图片（可选）" />
              </Space>
            }
            style={{ marginBottom: 0, marginTop: 0 }}
          >
            {renderSameUploadUi(
              'end',
              endFrameImageUrl,
              DOUBAO_SEEDANCE_20_I2V_END_INPUT_ID,
              onEndFrameFileChange,
              onRemoveEndFrame,
              onEndFrameDropFile,
            )}
          </Form.Item>
        </Col>
      </Row>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 20 }}>
        <FormattedMessage
          id="create.seedance2.endFrame.hint"
          defaultMessage="上传后作为第二帧传入，与首帧共同约束视频起止画面"
        />
      </Text>

      {ratioAndFormatRow}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="seedanceGenerateAudio"
            label={
              <Space>
                <AudioOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                <FormattedMessage id="create.seedance2.generateAudio" defaultMessage="生成原生音轨" />
              </Space>
            }
            style={{ marginBottom: 0 }}
          >
            <Select
              options={[
                {
                  value: false,
                  label: intl.formatMessage({ id: 'create.seedance2.option.no', defaultMessage: '否' }),
                },
                {
                  value: true,
                  label: intl.formatMessage({ id: 'create.seedance2.option.yes', defaultMessage: '是' }),
                },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="seedanceReturnLastFrame"
            label={
              <Space>
                <FileImageOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                <FormattedMessage id="create.seedance2.returnLastFrame" defaultMessage="返回尾帧图" />
              </Space>
            }
            style={{ marginBottom: 0 }}
          >
            <Select
              options={[
                {
                  value: false,
                  label: intl.formatMessage({ id: 'create.seedance2.option.no', defaultMessage: '否' }),
                },
                {
                  value: true,
                  label: intl.formatMessage({ id: 'create.seedance2.option.yes', defaultMessage: '是' }),
                },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="seedanceWatermark"
            label={
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                <FormattedMessage id="create.seedance2.watermark" defaultMessage="添加水印" />
              </Space>
            }
            style={{ marginBottom: 0 }}
          >
            <Select
              options={[
                {
                  value: false,
                  label: intl.formatMessage({ id: 'create.seedance.watermark.false', defaultMessage: '否' }),
                },
                {
                  value: true,
                  label: intl.formatMessage({ id: 'create.seedance.watermark.true', defaultMessage: '是' }),
                },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="seedanceVideoRefsRaw"
        label={
          <Space>
            <VideoCameraOutlined style={{ color: '#1890ff', fontSize: 12 }} />
            <FormattedMessage id="create.seedance2.videoRefs" defaultMessage="参考视频 URL" />
          </Space>
        }
        style={{ marginBottom: 12 }}
      >
        <TextArea
          rows={2}
          placeholder={intl.formatMessage({
            id: 'create.seedance2.videoRefs.placeholder',
            defaultMessage: '每行一个可访问的视频 URL，可选',
          })}
        />
      </Form.Item>

      <Form.Item
        name="seedanceAudioRefsRaw"
        label={
          <Space>
            <AudioOutlined style={{ color: '#1890ff', fontSize: 12 }} />
            <FormattedMessage id="create.seedance2.audioRefs" defaultMessage="参考音频 URL" />
          </Space>
        }
        style={{ marginBottom: 12 }}
      >
        <TextArea
          rows={2}
          placeholder={intl.formatMessage({
            id: 'create.seedance2.audioRefs.placeholder',
            defaultMessage: '每行一个可访问的音频 URL，可选',
          })}
        />
      </Form.Item>

      {durationField}
    </div>
  );
};

export default DoubaoSeedance20Params;
