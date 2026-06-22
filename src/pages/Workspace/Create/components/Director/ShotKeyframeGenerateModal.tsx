import React, { useMemo } from 'react';
import { Modal, Typography, message } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import directorApi, { DirectorShot } from 'api/director';
import TextToImage from '../TextToImage/TextToImage';
import type { TextToImageEmbedConfig } from '../TextToImage/embedTypes';

const { Text } = Typography;

const ModalBody = styled.div`
  max-height: min(80vh, 860px);
  overflow-y: auto;
  padding: 4px 8px 8px 4px;
`;

export interface ShotKeyframeGenerateModalProps {
  open: boolean;
  shot?: DirectorShot | null;
  initialPrompt?: string;
  aspectRatio?: string;
  defaultT2iModelCode?: string | null;
  onClose: () => void;
  onApplied: () => void;
}

const ShotKeyframeGenerateModal: React.FC<ShotKeyframeGenerateModalProps> = ({
  open,
  shot,
  initialPrompt = '',
  aspectRatio = '16:9',
  defaultT2iModelCode,
  onClose,
  onApplied,
}) => {
  const intl = useIntl();
  const [applyingImageUrl, setApplyingImageUrl] = React.useState<string | null>(null);

  const embedConfig = useMemo<TextToImageEmbedConfig>(
    () => ({
      initialPrompt,
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
        if (!shot) return;
        setApplyingImageUrl(imageUrl);
        try {
          const res = await directorApi.updateShot(shot.id, { keyframeImageUrl: imageUrl });
          if (res.success) {
            message.success(
              intl.formatMessage({ id: 'director.shot.startFrameApplied', defaultMessage: '首帧已设置' })
            );
            onApplied();
            onClose();
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
    [applyingImageUrl, aspectRatio, defaultT2iModelCode, initialPrompt, intl, onApplied, onClose, shot]
  );

  return (
    <Modal
      title={
        <div>
          <div>
            <FormattedMessage id="director.shot.keyframeGenerateTitle" defaultMessage="生成首帧" />
            {shot?.shotNo ? ` · ${shot.shotNo}` : ''}
          </div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            <FormattedMessage
              id="director.shot.keyframeGenerateHint"
              defaultMessage="使用文生图生成画面，确认后设为本镜首帧"
            />
          </Text>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1320}
      destroyOnClose
      zIndex={2000}
      styles={{ body: { paddingTop: 16, paddingBottom: 16 } }}
    >
      <ModalBody>
        <TextToImage variant="embed" embedActive={open} embedConfig={embedConfig} />
      </ModalBody>
    </Modal>
  );
};

export default ShotKeyframeGenerateModal;
