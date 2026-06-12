import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import VoicePicker, { VoiceSortMode } from './VoicePicker';
import { SpeechModalBody } from './styles';
import { VoiceModel } from './voiceTypes';

interface VoiceSelectModalProps {
  open: boolean;
  voices: VoiceModel[];
  value?: string;
  loading?: boolean;
  favoriteLoadingId?: number | null;
  getVoiceName: (voice: VoiceModel) => string;
  onClose: () => void;
  onConfirm: (voiceCode: string) => void;
  onDetailClick: (voice: VoiceModel) => void;
  onToggleFavorite: (voice: VoiceModel, favorited: boolean) => void;
}

const VoiceSelectModal: React.FC<VoiceSelectModalProps> = ({
  open,
  voices,
  value,
  loading,
  favoriteLoadingId,
  getVoiceName,
  onClose,
  onConfirm,
  onDetailClick,
  onToggleFavorite,
}) => {
  const [pendingCode, setPendingCode] = useState(value);
  const [sortMode, setSortMode] = useState<VoiceSortMode>('default');

  useEffect(() => {
    if (open) {
      setPendingCode(value);
    }
  }, [open, value]);

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setPendingCode(value);
      setSortMode('default');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      title={<FormattedMessage id="create.speech.selectVoice" defaultMessage="选择音色" />}
      open={open}
      onCancel={() => handleOpen(false)}
      width={760}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose}>
          <FormattedMessage id="common.cancel" defaultMessage="取消" />
        </Button>,
        <Button
          key="ok"
          type="primary"
          disabled={!pendingCode}
          onClick={() => pendingCode && onConfirm(pendingCode)}
        >
          <FormattedMessage id="common.confirm" defaultMessage="确定" />
        </Button>,
      ]}
    >
      <SpeechModalBody>
        <VoicePicker
          inModal
          voices={voices}
          value={pendingCode}
          loading={loading}
          sortMode={sortMode}
          favoriteLoadingId={favoriteLoadingId}
          onSortModeChange={setSortMode}
          getVoiceName={getVoiceName}
          onChange={setPendingCode}
          onDetailClick={onDetailClick}
          onToggleFavorite={onToggleFavorite}
        />
      </SpeechModalBody>
    </Modal>
  );
};

export default VoiceSelectModal;
