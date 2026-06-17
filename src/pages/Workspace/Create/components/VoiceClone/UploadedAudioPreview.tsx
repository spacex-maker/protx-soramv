import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Space, Typography, message } from 'antd';
import {
  DeleteOutlined,
  FileOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { RecordPanel, RecordPreview } from './styles';

const { Text } = Typography;

interface UploadedAudioPreviewProps {
  file: File;
  onRemove: () => void;
  onReplace: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const getUploadedFileFingerprint = (file: File): string =>
  `${file.name}-${file.size}-${file.lastModified}`;

const UploadedAudioPreview: React.FC<UploadedAudioPreviewProps> = ({
  file,
  onRemove,
  onReplace,
}) => {
  const intl = useIntl();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [playing, setPlaying] = useState(false);
  const fileFingerprint = getUploadedFileFingerprint(file);

  useEffect(() => {
    setPlaying(false);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileFingerprint, file]);

  const togglePreview = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      message.error(intl.formatMessage({
        id: 'create.voiceClone.uploadPreviewFailed',
        defaultMessage: '无法播放音频，请更换文件后重试',
      }));
    }
  }, [intl, playing, previewUrl]);

  const handleRemove = () => {
    audioRef.current?.pause();
    setPlaying(false);
    onRemove();
  };

  if (!previewUrl) {
    return null;
  }

  return (
    <RecordPanel>
      <Space align="start" style={{ width: '100%', marginBottom: 12 }}>
        <FileOutlined style={{ fontSize: 18, color: '#722ed1', marginTop: 2 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text strong style={{ display: 'block' }} ellipsis={{ tooltip: file.name }}>
            {file.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatFileSize(file.size)}
          </Text>
        </div>
      </Space>

      <RecordPreview>
        <audio
          ref={audioRef}
          controls
          src={previewUrl}
          preload="metadata"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          style={{ width: '100%', display: 'block' }}
        />
        <Space size={8} wrap style={{ marginTop: 10 }}>
          <Button
            icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => {
              void togglePreview();
            }}
          >
            {playing ? (
              <FormattedMessage id="create.voiceClone.recordPause" defaultMessage="暂停" />
            ) : (
              <FormattedMessage id="create.voiceClone.recordPreview" defaultMessage="试听" />
            )}
          </Button>
        </Space>
      </RecordPreview>

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
        <FormattedMessage
          id="create.voiceClone.uploadPreviewHint"
          defaultMessage="上传成功，可试听确认后再提交训练"
        />
      </Text>

      <Space wrap>
        <Button icon={<UploadOutlined />} onClick={onReplace}>
          <FormattedMessage id="create.voiceClone.uploadReplace" defaultMessage="更换文件" />
        </Button>
        <Button icon={<DeleteOutlined />} onClick={handleRemove}>
          <FormattedMessage id="create.voiceClone.uploadRemove" defaultMessage="移除" />
        </Button>
      </Space>
    </RecordPanel>
  );
};

export default UploadedAudioPreview;
