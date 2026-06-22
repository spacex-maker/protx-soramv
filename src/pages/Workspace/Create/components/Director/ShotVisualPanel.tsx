import React, { useMemo, useState } from 'react';
import { Button, Collapse, Image, Typography, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import directorApi, { DirectorShot } from 'api/director';
import { uploadImageToServer } from '../ImageToImage/utils';
import { normalizeUrl } from '../ImageToVideo/utils';
import TextToImage from '../TextToImage/TextToImage';
import type { TextToImageEmbedConfig } from '../TextToImage/embedTypes';
import {
  FrameActions,
  FrameEmpty,
  FrameMedia,
  FramePreviewGrid,
  FrameSlotLabel,
  StudioSection,
  StudioSectionTitle,
  isDisplayableImageUrl,
  toCssAspectRatio,
} from './shotStudioShared';

const { Text } = Typography;

export interface ShotVisualPanelProps {
  shot: DirectorShot;
  aspectRatio?: string;
  keyframePrompt: string;
  defaultT2iModelCode?: string | null;
  active: boolean;
  onSaved: () => void;
}

const ShotVisualPanel: React.FC<ShotVisualPanelProps> = ({
  shot,
  aspectRatio = '16:9',
  keyframePrompt,
  defaultT2iModelCode,
  active,
  onSaved,
}) => {
  const intl = useIntl();
  const cssAspectRatio = useMemo(() => toCssAspectRatio(aspectRatio), [aspectRatio]);
  const [uploadingStartFrame, setUploadingStartFrame] = useState(false);
  const [removingStartFrame, setRemovingStartFrame] = useState(false);
  const [uploadingEndFrame, setUploadingEndFrame] = useState(false);
  const [removingEndFrame, setRemovingEndFrame] = useState(false);
  const [applyingImageUrl, setApplyingImageUrl] = useState<string | null>(null);
  const [t2iOpen, setT2iOpen] = useState(false);

  const embedConfig = useMemo<TextToImageEmbedConfig>(
    () => ({
      initialPrompt: keyframePrompt,
      initialAspectRatio: aspectRatio,
      preferredModelCode: defaultT2iModelCode || undefined,
      hideHistory: true,
      hideHeader: true,
      excludeFreeModels: true,
      initialBatchSize: 1,
      applyingImageUrl,
      applyButtonLabel: (
        <FormattedMessage id="director.shot.applyStartFrame" defaultMessage="设为首帧" />
      ),
      onApplyImage: async (imageUrl: string) => {
        setApplyingImageUrl(imageUrl);
        try {
          const res = await directorApi.updateShot(shot.id, { keyframeImageUrl: imageUrl });
          if (res.success) {
            message.success(
              intl.formatMessage({ id: 'director.shot.startFrameApplied', defaultMessage: '首帧已设置' })
            );
            onSaved();
            setT2iOpen(false);
          } else {
            message.error(res.message);
          }
        } catch (e: unknown) {
          if (e instanceof Error && e.message) message.error(e.message);
        } finally {
          setApplyingImageUrl(null);
        }
      },
    }),
    [applyingImageUrl, aspectRatio, defaultT2iModelCode, intl, keyframePrompt, onSaved, shot.id]
  );

  const handleStartFrameUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setUploadingStartFrame(true);
    try {
      const url = await uploadImageToServer(file as File);
      const res = await directorApi.updateShot(shot.id, { keyframeImageUrl: url });
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.shot.startFrameUploaded', defaultMessage: '首帧已上传' })
        );
        onSaved();
        onSuccess?.(url);
      } else {
        message.error(res.message);
        onError?.(new Error(res.message));
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error('Upload failed');
      message.error(err.message);
      onError?.(err);
    } finally {
      setUploadingStartFrame(false);
    }
  };

  const handleRemoveStartFrame = async () => {
    setRemovingStartFrame(true);
    try {
      const res = await directorApi.updateShot(shot.id, { keyframeImageUrl: '' });
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.shot.startFrameRemoved', defaultMessage: '首帧已移除' })
        );
        onSaved();
      } else {
        message.error(res.message);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message) message.error(e.message);
    } finally {
      setRemovingStartFrame(false);
    }
  };

  const handleEndFrameUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setUploadingEndFrame(true);
    try {
      const url = await uploadImageToServer(file as File);
      const res = await directorApi.updateShot(shot.id, { endFrameImageUrl: url });
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.shot.endFrameUploaded', defaultMessage: '尾帧已上传' })
        );
        onSaved();
        onSuccess?.(url);
      } else {
        message.error(res.message);
        onError?.(new Error(res.message));
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error('Upload failed');
      message.error(err.message);
      onError?.(err);
    } finally {
      setUploadingEndFrame(false);
    }
  };

  const handleRemoveEndFrame = async () => {
    setRemovingEndFrame(true);
    try {
      const res = await directorApi.updateShot(shot.id, { endFrameImageUrl: '' });
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.shot.endFrameRemoved', defaultMessage: '尾帧已移除' })
        );
        onSaved();
      } else {
        message.error(res.message);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message) message.error(e.message);
    } finally {
      setRemovingEndFrame(false);
    }
  };

  return (
    <div>
      <StudioSection>
        <StudioSectionTitle>
          <FormattedMessage id="director.shot.section.frames" defaultMessage="首尾帧" />
        </StudioSectionTitle>
        <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 12 }}>
          <FormattedMessage
            id="director.shot.visual.framesHint"
            defaultMessage="在此统一管理首帧与尾帧，生视频时将自动读取"
          />
        </Text>
        <FramePreviewGrid>
          <div>
            <FrameSlotLabel>
              <FormattedMessage id="director.shot.startFrame" defaultMessage="首帧" />
            </FrameSlotLabel>
            <FrameMedia $aspectRatio={cssAspectRatio}>
              {isDisplayableImageUrl(shot.keyframeImageUrl) ? (
                <Image
                  src={normalizeUrl(shot.keyframeImageUrl)}
                  alt={intl.formatMessage({ id: 'director.shot.startFrame', defaultMessage: '首帧' })}
                  preview
                />
              ) : (
                <FrameEmpty>
                  <PictureOutlined style={{ fontSize: 22, color: 'rgba(0,0,0,0.25)' }} />
                  <Text type="secondary" style={{ display: 'block', marginTop: 6, fontSize: 12 }}>
                    <FormattedMessage id="director.shot.startFrameEmpty" defaultMessage="尚未生成或上传首帧" />
                  </Text>
                </FrameEmpty>
              )}
            </FrameMedia>
            <FrameActions>
              <Button size="small" onClick={() => setT2iOpen((v) => !v)}>
                <FormattedMessage id="director.shot.generateStartFrame" defaultMessage="文生图" />
              </Button>
              <Upload accept="image/*" showUploadList={false} customRequest={handleStartFrameUpload}>
                <Button size="small" icon={<UploadOutlined />} loading={uploadingStartFrame}>
                  <FormattedMessage id="director.shot.uploadStartFrame" defaultMessage="上传" />
                </Button>
              </Upload>
              {isDisplayableImageUrl(shot.keyframeImageUrl) ? (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={removingStartFrame}
                  onClick={handleRemoveStartFrame}
                >
                  <FormattedMessage id="director.shot.removeStartFrame" defaultMessage="移除" />
                </Button>
              ) : null}
            </FrameActions>
          </div>

          <div>
            <FrameSlotLabel>
              <FormattedMessage id="director.shot.endFrame" defaultMessage="尾帧" />
            </FrameSlotLabel>
            <FrameMedia $aspectRatio={cssAspectRatio}>
              {isDisplayableImageUrl(shot.endFrameImageUrl) ? (
                <Image
                  src={normalizeUrl(shot.endFrameImageUrl)}
                  alt={intl.formatMessage({ id: 'director.shot.endFrame', defaultMessage: '尾帧' })}
                  preview
                />
              ) : (
                <FrameEmpty>
                  <PictureOutlined style={{ fontSize: 22, color: 'rgba(0,0,0,0.25)' }} />
                  <Text type="secondary" style={{ display: 'block', marginTop: 6, fontSize: 12 }}>
                    <FormattedMessage id="director.shot.endFrameEmpty" defaultMessage="可选，用于约束结束画面" />
                  </Text>
                </FrameEmpty>
              )}
            </FrameMedia>
            <FrameActions>
              <Upload accept="image/*" showUploadList={false} customRequest={handleEndFrameUpload}>
                <Button size="small" icon={<UploadOutlined />} loading={uploadingEndFrame}>
                  <FormattedMessage id="director.shot.uploadEndFrame" defaultMessage="上传尾帧" />
                </Button>
              </Upload>
              {isDisplayableImageUrl(shot.endFrameImageUrl) ? (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={removingEndFrame}
                  onClick={handleRemoveEndFrame}
                >
                  <FormattedMessage id="director.shot.removeEndFrame" defaultMessage="移除" />
                </Button>
              ) : null}
            </FrameActions>
          </div>
        </FramePreviewGrid>
      </StudioSection>

      <Collapse
        activeKey={t2iOpen ? ['t2i'] : []}
        onChange={(keys) => setT2iOpen(keys.includes('t2i'))}
        items={[
          {
            key: 't2i',
            label: intl.formatMessage({
              id: 'director.shot.visual.t2iPanel',
              defaultMessage: '文生图生成首帧',
            }),
            children: (
              <div style={{ maxHeight: 'min(70vh, 720px)', overflow: 'auto' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                  <FormattedMessage
                    id="director.shot.keyframeGenerateHint"
                    defaultMessage="使用文生图生成画面，确认后设为本镜首帧"
                  />
                </Text>
                <TextToImage variant="embed" embedActive={active && t2iOpen} embedConfig={embedConfig} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ShotVisualPanel;
