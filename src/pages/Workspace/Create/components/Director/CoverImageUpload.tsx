import React, { useState } from 'react';
import { Button, Space, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components';
import { uploadImageToServer } from '../ImageToImage/utils';
import { normalizeUrl } from '../ImageToVideo/utils';

/** 与 Director 内 CharacterThumb、BindCharacterRow 等保持一致 */
export const COVER_BORDER_RADIUS = '10px';

/** 通用竖版海报比例（2:3，如 750×1125、1000×1500） */
export const POSTER_ASPECT_RATIO = '2:3';
export const POSTER_RECOMMENDED_SIZE = '750×1125';

const coverRadiusStyle = css`
  border-radius: ${COVER_BORDER_RADIUS};
`;

const CoverFrame = styled.div<{ $aspectRatio: string; $maxWidth?: number }>`
  width: 100%;
  max-width: ${({ $maxWidth }) => ($maxWidth ? `${$maxWidth}px` : 'none')};
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
  ${coverRadiusStyle}
  display: flex;
  flex-direction: column;

  .dark & {
    background: rgba(255, 255, 255, 0.06);
  }

  /* ImgCrop 外层 */
  & > .cover-crop-root {
    flex: 1;
    width: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .ant-upload-wrapper {
    flex: 1;
    width: 100%;
    min-height: 0;
    display: flex !important;
    flex-direction: column;
  }

  .ant-upload.ant-upload-drag {
    flex: 1;
    width: 100%;
    min-height: 0;
    margin: 0;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px dashed rgba(0, 0, 0, 0.15) !important;
    background: transparent !important;
    ${coverRadiusStyle}

    .ant-upload-btn {
      padding: 0;
    }
  }

  .dark & .ant-upload.ant-upload-drag {
    border-color: rgba(255, 255, 255, 0.15) !important;
  }

  .cover-upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
    color: rgba(0, 0, 0, 0.45);
    pointer-events: none;

    .ant-upload-drag-icon {
      margin: 0;
      font-size: 36px;
      color: #3b82f6;
      line-height: 1;
    }

    .cover-upload-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      max-width: 220px;
    }

    .dark & {
      color: rgba(255, 255, 255, 0.45);
    }
  }
`;

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const isDisplayableImageUrl = (url?: string | null): url is string => {
  if (!url?.trim()) return false;
  const u = url.trim();
  return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:') || u.startsWith('//');
};

export const resolveCoverDisplayUrl = (url?: string | null): string =>
  isDisplayableImageUrl(url) ? normalizeUrl(url) : '';

export const toCssAspectRatio = (ratio?: string) => {
  if (!ratio) return '2 / 3';
  const parts = ratio.split(':');
  if (parts.length === 2) return `${parts[0]} / ${parts[1]}`;
  return '2 / 3';
};

export const parseAspectNumber = (ratio?: string) => {
  if (!ratio) return 2 / 3;
  const parts = ratio.split(':');
  if (parts.length === 2) {
    const w = Number(parts[0]);
    const h = Number(parts[1]);
    if (w > 0 && h > 0) return w / h;
  }
  return 2 / 3;
};

const resolveUploadFile = (file: unknown): File | null => {
  if (file instanceof File) return file;
  if (file && typeof file === 'object' && 'originFileObj' in file) {
    const origin = (file as { originFileObj?: File }).originFileObj;
    return origin instanceof File ? origin : null;
  }
  return null;
};

export interface CoverImageUploadProps {
  value?: string;
  onChange?: (url?: string) => void;
  aspectRatio?: string;
  maxWidth?: number;
  /** 铺满父容器宽度 */
  fullWidth?: boolean;
  /** 上传前客户端裁剪（固定 aspectRatio） */
  enableCrop?: boolean;
  /** 不展示本地预览（由外部如项目头图展示） */
  hidePreview?: boolean;
  /** 紧凑按钮上传（用于项目头图栏） */
  compactTrigger?: boolean;
  /** 上传成功后的额外回调（如项目封面即时保存） */
  onUploaded?: (url: string) => void;
  /** 移除封面后的额外回调 */
  onClear?: () => void;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  value,
  onChange,
  aspectRatio = POSTER_ASPECT_RATIO,
  maxWidth,
  fullWidth = false,
  enableCrop = false,
  hidePreview = false,
  compactTrigger = false,
  onUploaded,
  onClear,
}) => {
  const intl = useIntl();
  const [uploading, setUploading] = useState(false);
  const cssAspectRatio = toCssAspectRatio(aspectRatio);
  const aspectNumber = parseAspectNumber(aspectRatio);
  const previewUrl = isDisplayableImageUrl(value) ? normalizeUrl(value) : '';
  const frameMaxWidth = fullWidth ? undefined : maxWidth ?? 280;

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const uploadFile = resolveUploadFile(options.file);
    if (!uploadFile) {
      options.onError?.(new Error('invalid file'));
      return;
    }
    if (!uploadFile.type.startsWith('image/')) {
      message.error(
        intl.formatMessage({
          id: 'director.cover.uploadInvalidType',
          defaultMessage: '请选择图片文件',
        })
      );
      options.onError?.(new Error('invalid type'));
      return;
    }
    if (uploadFile.size > 30 * 1024 * 1024) {
      message.error(
        intl.formatMessage({
          id: 'director.cover.uploadTooLarge',
          defaultMessage: '图片大小不能超过 30MB',
        })
      );
      options.onError?.(new Error('too large'));
      return;
    }

    setUploading(true);
    const hideLoading = message.loading(
      intl.formatMessage({ id: 'director.cover.uploading', defaultMessage: '上传中…' }),
      0
    );
    try {
      const url = await uploadImageToServer(uploadFile);
      onChange?.(url);
      if (url) onUploaded?.(url);
      options.onSuccess?.(url);
      message.success(
        intl.formatMessage({ id: 'director.cover.uploadSuccess', defaultMessage: '封面上传成功' })
      );
    } catch (e: unknown) {
      options.onError?.(e as Error);
      message.error(
        e instanceof Error
          ? e.message
          : intl.formatMessage({ id: 'director.cover.uploadFailed', defaultMessage: '封面上传失败' })
      );
    } finally {
      hideLoading();
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    accept: 'image/*',
    showUploadList: false,
    customRequest: handleUpload,
    disabled: uploading,
  };

  const renderCropWrapper = (node: React.ReactElement) =>
    enableCrop ? (
      <div className="cover-crop-root">
        <ImgCrop
          aspect={aspectNumber}
          quality={0.92}
          rotationSlider
          showGrid
          showReset
          modalTitle={intl.formatMessage({ id: 'director.cover.cropTitle', defaultMessage: '裁剪封面' })}
          modalOk={intl.formatMessage({ id: 'director.cover.cropConfirm', defaultMessage: '确认裁剪' })}
          modalCancel={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
          resetText={intl.formatMessage({ id: 'director.cover.cropReset', defaultMessage: '重置' })}
        >
          {node}
        </ImgCrop>
      </div>
    ) : (
      node
    );

  const uploadPlaceholder = (
    <div className="cover-upload-placeholder">
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="cover-upload-text">
        {intl.formatMessage({
          id: 'director.cover.uploadHint',
          defaultMessage: '点击或拖拽上传',
        })}
      </p>
    </div>
  );

  const renderEmptyUpload = () => {
    const dragger = (
      <Upload.Dragger {...uploadProps}>{uploadPlaceholder}</Upload.Dragger>
    );

    return (
      <CoverFrame $aspectRatio={cssAspectRatio} $maxWidth={frameMaxWidth}>
        {enableCrop ? renderCropWrapper(dragger) : dragger}
      </CoverFrame>
    );
  };

  const renderActionButtons = (ghost = false) => (
    <Space wrap size={8}>
      {renderCropWrapper(
        <Upload {...uploadProps}>
          <Button
            size="small"
            icon={<UploadOutlined />}
            loading={uploading}
            ghost={ghost}
            style={
              ghost
                ? { color: '#fff', borderColor: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.08)' }
                : undefined
            }
          >
            {previewUrl
              ? intl.formatMessage({ id: 'director.cover.replace', defaultMessage: '更换封面' })
              : intl.formatMessage({ id: 'director.project.uploadCover', defaultMessage: '上传封面' })}
          </Button>
        </Upload>
      )}
      {previewUrl ? (
        <Button
          size="small"
          danger={!ghost}
          ghost={ghost}
          onClick={() => {
            onChange?.('');
            onClear?.();
          }}
          disabled={uploading}
          style={ghost ? { color: '#fecaca', borderColor: 'rgba(254,202,202,0.45)' } : undefined}
        >
          {intl.formatMessage({ id: 'director.cover.remove', defaultMessage: '移除封面' })}
        </Button>
      ) : null}
    </Space>
  );

  if (hidePreview && compactTrigger) {
    return renderActionButtons(true);
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={8}>
      {previewUrl && hidePreview ? (
        renderActionButtons(false)
      ) : previewUrl ? (
        <>
          <CoverFrame $aspectRatio={cssAspectRatio} $maxWidth={frameMaxWidth}>
            <CoverImage src={previewUrl} alt="cover" />
          </CoverFrame>
          <Space wrap size={8}>
            {renderCropWrapper(
              <Upload {...uploadProps}>
                <Button size="small" icon={<UploadOutlined />} loading={uploading}>
                  {intl.formatMessage({ id: 'director.cover.replace', defaultMessage: '更换封面' })}
                </Button>
              </Upload>
            )}
            <Button
              size="small"
              danger
              onClick={() => {
                onChange?.('');
                onClear?.();
              }}
              disabled={uploading}
            >
              {intl.formatMessage({ id: 'director.cover.remove', defaultMessage: '移除封面' })}
            </Button>
          </Space>
        </>
      ) : (
        renderEmptyUpload()
      )}
    </Space>
  );
};

/** 列表缩略图、卡片等场景复用相同圆角 */
export const getCoverBorderRadius = () => COVER_BORDER_RADIUS;

export default CoverImageUpload;
