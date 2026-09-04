import React, { useState } from 'react';
import { Button, Space, Typography, message } from 'antd';
import { PictureOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { uploadImageToServer } from '../ImageToImage/utils';
import { normalizeUrl } from '../ImageToVideo/utils';
import ImageGenPickerModal from '../shared/ImageGenPickerModal';
import { isDisplayableImageUrl } from './directorAssetUtils';

const { Text } = Typography;

const PreviewWrap = styled.div`
  width: 100%;
`;

const PreviewImg = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 12px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc')};
`;

const EmptyPicker = styled.button`
  width: 100%;
  border: 1px dashed ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : '#d9d9d9')};
  border-radius: 12px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fafafa')};
  padding: 28px 16px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  text-align: center;

  &:hover {
    border-color: #1890ff;
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(24,144,255,0.08)' : '#f0f7ff')};
  }
`;

export interface DirectorReferenceImageFieldProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  hint?: string;
}

/**
 * 导演资产参考图：支持本地上传，或从文生图 / 图生图生成记录中选用。
 */
const DirectorReferenceImageField: React.FC<DirectorReferenceImageFieldProps> = ({
  value,
  onChange,
  hint,
}) => {
  const intl = useIntl();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewUrl = isDisplayableImageUrl(value) ? normalizeUrl(value) : '';

  const applyUrl = (url: string) => {
    onChange(url);
  };

  const handleSelectLocal = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error(
        intl.formatMessage({
          id: 'director.referenceImage.invalidType',
          defaultMessage: '请选择图片文件',
        })
      );
      throw new Error('invalid type');
    }
    if (file.size > 30 * 1024 * 1024) {
      message.error(
        intl.formatMessage({
          id: 'director.referenceImage.tooLarge',
          defaultMessage: '图片大小不能超过 30MB',
        })
      );
      throw new Error('too large');
    }
    setUploading(true);
    const hideLoading = message.loading(
      intl.formatMessage({ id: 'director.referenceImage.uploading', defaultMessage: '上传中…' }),
      0
    );
    try {
      const url = await uploadImageToServer(file);
      applyUrl(url);
      message.success(
        intl.formatMessage({
          id: 'director.referenceImage.uploadSuccess',
          defaultMessage: '参考图上传成功',
        })
      );
    } catch (e: unknown) {
      message.error(
        e instanceof Error
          ? e.message
          : intl.formatMessage({
              id: 'director.referenceImage.uploadFailed',
              defaultMessage: '参考图上传失败',
            })
      );
      throw e;
    } finally {
      hideLoading();
      setUploading(false);
    }
  };

  const handleSelectRemote = async ({ remoteUrl }: { remoteUrl: string }) => {
    if (!remoteUrl?.trim()) {
      message.error(
        intl.formatMessage({
          id: 'director.referenceImage.selectFailed',
          defaultMessage: '选用图片失败，请重试',
        })
      );
      throw new Error('empty url');
    }
    applyUrl(remoteUrl.trim());
    message.success(
      intl.formatMessage({
        id: 'director.referenceImage.selectSuccess',
        defaultMessage: '已选用生成记录图片',
      })
    );
  };

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {previewUrl ? (
          <PreviewWrap>
            <PreviewImg src={previewUrl} alt="reference" />
            <Space style={{ marginTop: 8 }} wrap>
              <Button size="small" icon={<PictureOutlined />} onClick={() => setPickerOpen(true)} disabled={uploading}>
                <FormattedMessage id="director.referenceImage.reselect" defaultMessage="重新选择" />
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onChange(undefined)} disabled={uploading}>
                <FormattedMessage id="director.referenceImage.remove" defaultMessage="移除图片" />
              </Button>
            </Space>
          </PreviewWrap>
        ) : (
          <EmptyPicker type="button" onClick={() => setPickerOpen(true)} disabled={uploading}>
            <PictureOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            <div style={{ marginTop: 10, fontWeight: 600 }}>
              <FormattedMessage
                id="director.referenceImage.pick"
                defaultMessage="选择参考图"
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
              <FormattedMessage
                id="director.referenceImage.pickHint"
                defaultMessage="本地上传，或从文生图 / 图生图记录中选用"
              />
            </Text>
          </EmptyPicker>
        )}
        {hint ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {hint}
          </Text>
        ) : null}
      </Space>

      <ImageGenPickerModal
        open={pickerOpen}
        target="first"
        title={intl.formatMessage({
          id: 'director.referenceImage.pickerTitle',
          defaultMessage: '选择参考图',
        })}
        onClose={() => setPickerOpen(false)}
        onSelectLocal={handleSelectLocal}
        onSelectRemote={handleSelectRemote}
      />
    </>
  );
};

export default DirectorReferenceImageField;
