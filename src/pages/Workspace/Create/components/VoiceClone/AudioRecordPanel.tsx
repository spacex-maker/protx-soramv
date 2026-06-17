import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Space, Typography, message } from 'antd';
import {
  AudioOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  WavStreamRecorder,
  fileToBase64,
  formatRecordDuration,
  getRecordingErrorMessageId,
  isRecordingSupported,
} from './voiceCloneAudioUtils';
import {
  RecordPanel,
  RecordTimer,
  RecordWaveDot,
  RecordPreview,
  RecordActions,
} from './styles';

const { Text } = Typography;

export interface RecordedTrainingAudio {
  blob: Blob;
  format: string;
  previewUrl: string;
  durationSec: number;
  base64: string;
}

export interface AudioRecordPanelProps {
  value: RecordedTrainingAudio | null;
  onChange: (value: RecordedTrainingAudio | null) => void;
  maxDurationSec?: number;
  minDurationSec?: number;
}

const AudioRecordPanel: React.FC<AudioRecordPanelProps> = ({
  value,
  onChange,
  maxDurationSec = 60,
  minDurationSec = 3,
}) => {
  const intl = useIntl();
  const recorderRef = useRef<WavStreamRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const elapsedSecRef = useRef(0);
  const previewRef = useRef<HTMLAudioElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const revokePreviewUrl = useCallback((url?: string | null) => {
    const target = url ?? previewUrlRef.current;
    if (target) {
      URL.revokeObjectURL(target);
      if (previewUrlRef.current === target) {
        previewUrlRef.current = null;
      }
    }
  }, []);

  const resetRecordingSession = useCallback(() => {
    clearTimer();
    recorderRef.current?.cancel();
    recorderRef.current = null;
    elapsedSecRef.current = 0;
    setRecording(false);
    setElapsedSec(0);
  }, [clearTimer]);

  const handleClear = useCallback(() => {
    revokePreviewUrl(value?.previewUrl);
    resetRecordingSession();
    onChange(null);
    setPreviewPlaying(false);
  }, [onChange, resetRecordingSession, revokePreviewUrl, value?.previewUrl]);

  const finalizeRecording = useCallback(async (result: { blob: Blob; durationSec: number }) => {
    const { blob, durationSec } = result;

    if (durationSec < minDurationSec) {
      message.warning(
        intl.formatMessage(
          { id: 'create.voiceClone.recordTooShort', defaultMessage: '录音至少 {seconds} 秒' },
          { seconds: minDurationSec },
        ),
      );
      return;
    }

    if (blob.size <= 44) {
      message.warning(intl.formatMessage({ id: 'create.voiceClone.recordEmpty', defaultMessage: '未录到有效音频' }));
      return;
    }

    setProcessing(true);
    try {
      const previewUrl = URL.createObjectURL(blob);
      const base64 = await fileToBase64(blob);

      revokePreviewUrl(value?.previewUrl);
      previewUrlRef.current = previewUrl;

      onChange({
        blob,
        format: 'wav',
        previewUrl,
        durationSec,
        base64,
      });
      message.success(intl.formatMessage({ id: 'create.voiceClone.recordReady', defaultMessage: '录音已完成，可试听或提交训练' }));
    } catch {
      message.error(intl.formatMessage({ id: 'create.voiceClone.recordProcessFailed', defaultMessage: '录音处理失败，请重试' }));
    } finally {
      setProcessing(false);
      resetRecordingSession();
    }
  }, [intl, minDurationSec, onChange, resetRecordingSession, revokePreviewUrl, value?.previewUrl]);

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) {
      return;
    }

    clearTimer();
    setRecording(false);

    try {
      const result = await recorder.stop();
      recorderRef.current = null;
      await finalizeRecording(result);
    } catch {
      message.error(intl.formatMessage({ id: 'create.voiceClone.recordProcessFailed', defaultMessage: '录音处理失败，请重试' }));
      resetRecordingSession();
    }
  }, [clearTimer, finalizeRecording, intl, resetRecordingSession]);

  const startRecording = useCallback(async () => {
    if (!isRecordingSupported()) {
      message.error(
        intl.formatMessage({
          id: window.isSecureContext
            ? 'create.voiceClone.recordNotSupported'
            : 'create.voiceClone.recordInsecureContext',
          defaultMessage: window.isSecureContext
            ? '当前浏览器不支持录音'
            : '录音需要在 HTTPS 或 localhost 环境下使用',
        }),
      );
      return;
    }

    if (recording || processing) {
      return;
    }

    revokePreviewUrl(value?.previewUrl);
    onChange(null);
    setPreviewPlaying(false);
    resetRecordingSession();

    try {
      const recorder = new WavStreamRecorder();
      recorderRef.current = recorder;
      await recorder.start();

      setRecording(true);
      elapsedSecRef.current = 0;
      setElapsedSec(0);

      timerRef.current = window.setInterval(() => {
        elapsedSecRef.current += 1;
        const next = elapsedSecRef.current;
        setElapsedSec(next);
        if (next >= maxDurationSec) {
          void stopRecording();
        }
      }, 1000);
    } catch (error) {
      resetRecordingSession();
      const messageId = getRecordingErrorMessageId(error);
      message.error(intl.formatMessage({
        id: messageId,
        defaultMessage: messageId === 'create.voiceClone.recordInsecureContext'
          ? '录音需要在 HTTPS 或 localhost 环境下使用'
          : messageId === 'create.voiceClone.recordNoDevice'
            ? '未检测到可用麦克风设备'
            : messageId === 'create.voiceClone.recordPermissionDenied'
              ? '无法访问麦克风，请允许浏览器使用麦克风'
              : '开始录音失败',
      }));
    }
  }, [
    intl,
    maxDurationSec,
    onChange,
    processing,
    recording,
    resetRecordingSession,
    revokePreviewUrl,
    stopRecording,
    value?.previewUrl,
  ]);

  const togglePreview = useCallback(async () => {
    const audio = previewRef.current;
    if (!audio || !value?.previewUrl) return;
    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPreviewPlaying(true);
    } catch {
      message.error(intl.formatMessage({ id: 'create.voiceClone.recordPreviewFailed', defaultMessage: '无法播放录音' }));
    }
  }, [intl, previewPlaying, value?.previewUrl]);

  useEffect(() => () => {
    clearTimer();
    recorderRef.current?.cancel();
    revokePreviewUrl();
  }, [clearTimer, revokePreviewUrl]);

  return (
    <RecordPanel $recording={recording}>
      <RecordTimer $recording={recording}>
        {recording && <RecordWaveDot />}
        <span>{formatRecordDuration(recording ? elapsedSec : value?.durationSec || 0)}</span>
        <Text type="secondary" style={{ fontSize: 12 }}>
          / {formatRecordDuration(maxDurationSec)}
        </Text>
      </RecordTimer>

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
        {recording ? (
          <FormattedMessage id="create.voiceClone.recordingHint" defaultMessage="正在录音，请朗读参考文本..." />
        ) : value ? (
          <FormattedMessage id="create.voiceClone.recordDoneHint" defaultMessage="录音已就绪，可试听或重新录制" />
        ) : (
          <FormattedMessage id="create.voiceClone.recordIdleHint" defaultMessage="点击开始录音，建议 10–30 秒清晰人声" />
        )}
      </Text>

      {value?.previewUrl && (
        <RecordPreview>
          <audio
            ref={previewRef}
            src={value.previewUrl}
            onEnded={() => setPreviewPlaying(false)}
            onPause={() => setPreviewPlaying(false)}
          />
          <Space size={8} wrap>
            <Button
              icon={previewPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={togglePreview}
            >
              {previewPlaying ? (
                <FormattedMessage id="create.voiceClone.recordPause" defaultMessage="暂停" />
              ) : (
                <FormattedMessage id="create.voiceClone.recordPreview" defaultMessage="试听" />
              )}
            </Button>
            <Button icon={<RedoOutlined />} onClick={handleClear} disabled={recording || processing}>
              <FormattedMessage id="create.voiceClone.recordAgain" defaultMessage="重录" />
            </Button>
          </Space>
        </RecordPreview>
      )}

      <RecordActions>
        {!recording ? (
          <Button
            type="primary"
            icon={<AudioOutlined />}
            loading={processing}
            onClick={() => {
              void startRecording();
            }}
            block
          >
            {value ? (
              <FormattedMessage id="create.voiceClone.recordNew" defaultMessage="重新录音" />
            ) : (
              <FormattedMessage id="create.voiceClone.startRecord" defaultMessage="开始录音" />
            )}
          </Button>
        ) : (
          <Button
            danger
            type="primary"
            onClick={() => {
              void stopRecording();
            }}
            block
          >
            <FormattedMessage id="create.voiceClone.stopRecord" defaultMessage="停止录音" />
          </Button>
        )}
      </RecordActions>
    </RecordPanel>
  );
};

export default AudioRecordPanel;
