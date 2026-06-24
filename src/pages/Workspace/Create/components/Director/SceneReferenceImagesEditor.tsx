import React, { useCallback, useState } from 'react';
import { Button, Image, Input, Space, Spin, Typography, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { DeleteOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { DirectorSceneReferenceImage } from 'api/director';
import { uploadImageToServer } from '../ImageToImage/utils';
import { normalizeUrl } from '../ImageToVideo/utils';
import { isDisplayableImageUrl } from './directorAssetUtils';

const { Text } = Typography;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);

  .dark & {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
  }
`;

const ImagePreview = styled.div`
  aspect-ratio: 4 / 3;
  background: rgba(0, 0, 0, 0.04);

  .ant-image,
  .ant-image-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageMeta = styled.div`
  padding: 8px;
`;

const RemoveBtn = styled(Button)`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
`;

const UploadBox = styled.div`
  .ant-upload-drag {
    border-radius: 12px !important;
  }
`;

export interface SceneReferenceImagesEditorProps {
  value: DirectorSceneReferenceImage[];
  onChange: (images: DirectorSceneReferenceImage[]) => void;
  disabled?: boolean;
  compact?: boolean;
}

const createLocalKey = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const SceneReferenceImagesEditor: React.FC<SceneReferenceImagesEditorProps> = ({
  value,
  onChange,
  disabled = false,
  compact = false,
}) => {
  const intl = useIntl();
  const [uploading, setUploading] = useState(false);

  const updateCaption = (index: number, caption: string) => {
    const next = value.map((item, i) => (i === index ? { ...item, caption } : item));
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(
      value
        .filter((_, i) => i !== index)
        .map((item, sortOrder) => ({ ...item, sortOrder }))
    );
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const uploadFile = file instanceof File ? file : null;
    if (!uploadFile) {
      onError?.(new Error('invalid file'));
      return;
    }
    if (!uploadFile.type.startsWith('image/')) {
      message.error(
        intl.formatMessage({ id: 'director.scene.referenceImages.invalidType', defaultMessage: '请选择图片文件' })
      );
      onError?.(new Error('invalid type'));
      return;
    }

    setUploading(true);
    const hideLoading = message.loading(
      intl.formatMessage({ id: 'director.scene.referenceImages.uploading', defaultMessage: '上传中…' }),
      0
    );
    try {
      const url = await uploadImageToServer(uploadFile);
      const nextItem: DirectorSceneReferenceImage = {
        localKey: createLocalKey(),
        imageUrl: url,
        caption: '',
        sortOrder: value.length,
      };
      onChange([...value, nextItem]);
      onSuccess?.(url);
      message.success(
        intl.formatMessage({ id: 'director.scene.referenceImages.uploadSuccess', defaultMessage: '参考图上传成功' })
      );
    } catch (e: unknown) {
      onError?.(e as Error);
      message.error(
        e instanceof Error
          ? e.message
          : intl.formatMessage({ id: 'director.scene.referenceImages.uploadFailed', defaultMessage: '参考图上传失败' })
      );
    } finally {
      hideLoading();
      setUploading(false);
    }
  };

  const resolveImageSrc = useCallback((url?: string | null) => {
    if (!isDisplayableImageUrl(url)) return undefined;
    return normalizeUrl(url);
  }, []);

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
        <FormattedMessage
          id="director.scene.referenceImagesHint"
          defaultMessage="上传场景氛围、布景或环境参考，便于分镜与视频生成时引用"
        />
      </Text>

      {value.length > 0 ? (
        <Grid style={{ marginBottom: 12 }}>
          {value.map((item, index) => (
            <ImageCard key={item.id ?? item.localKey ?? index}>
              {!disabled ? (
                <RemoveBtn
                  size="small"
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  onClick={() => removeAt(index)}
                />
              ) : null}
              <ImagePreview>
                <Image
                  src={resolveImageSrc(item.imageUrl)}
                  alt={item.caption || `ref-${index + 1}`}
                  preview
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </ImagePreview>
              <ImageMeta>
                <Input
                  size="small"
                  value={item.caption || ''}
                  disabled={disabled}
                  placeholder={intl.formatMessage({
                    id: 'director.scene.referenceImages.captionPlaceholder',
                    defaultMessage: '说明（可选）',
                  })}
                  onChange={(e) => updateCaption(index, e.target.value)}
                />
              </ImageMeta>
            </ImageCard>
          ))}
        </Grid>
      ) : null}

      {!disabled ? (
        <UploadBox>
          <Upload.Dragger
            accept="image/*"
            multiple
            showUploadList={false}
            customRequest={handleUpload}
            disabled={uploading}
            style={{ padding: compact ? 8 : undefined }}
          >
            {uploading ? (
              <Spin />
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  <FormattedMessage
                    id="director.scene.referenceImages.uploadHint"
                    defaultMessage="点击或拖拽上传参考图，可多张"
                  />
                </p>
                <p className="ant-upload-hint">
                  <Space size={4}>
                    <PlusOutlined />
                    <FormattedMessage id="director.scene.referenceImages.add" defaultMessage="添加参考图" />
                  </Space>
                </p>
              </>
            )}
          </Upload.Dragger>
        </UploadBox>
      ) : null}
    </div>
  );
};

export default SceneReferenceImagesEditor;
