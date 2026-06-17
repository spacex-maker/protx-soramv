import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Typography } from 'antd';
import {
  AudioOutlined,
  DownloadOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import AudioSpectrumVisualizer from './AudioSpectrumVisualizer';
import {
  HiddenAudio,
  ResultActions,
  ResultArea,
  ResultEmptyHint,
  ResultEmptyIcon,
  ResultEmptyState,
  ResultFormatTag,
  ResultLoadingRing,
  ResultLoadingState,
  ResultLoadingText,
  ResultMeta,
  ResultPlayButton,
  ResultPlayRow,
  ResultPlayStatus,
  ResultPlayerCard,
  ResultProgressFill,
  ResultProgressTrack,
  ResultTimeRow,
  ResultVoiceName,
  SpectrumVisualizerWrap,
} from './styles';

const { Text } = Typography;

interface AudioResultPanelProps {
  loading: boolean;
  audioUrl: string | null;
  voiceName?: string;
  outputFormat?: string;
  generatingTip: string;
  playTick?: number;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioResultPanel: React.FC<AudioResultPanelProps> = ({
  loading,
  audioUrl,
  voiceName,
  outputFormat,
  generatingTip,
  playTick = 0,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const resetPlaybackState = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    resetPlaybackState();
  }, [audioUrl, resetPlaybackState]);

  useEffect(() => {
    if (!audioUrl || playTick <= 0) {
      return;
    }
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.load();
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // 浏览器可能拦截自动播放，用户仍可使用播放按钮手动播放
      });
    }
  }, [audioUrl, playTick]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    void audio.play();
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatLabel = outputFormat?.trim().toUpperCase() || 'MP3';

  return (
    <ResultArea>
      {loading ? (
        <ResultLoadingState>
          <ResultLoadingRing>
            <LoadingOutlined spin />
          </ResultLoadingRing>
          <ResultLoadingText>{generatingTip}</ResultLoadingText>
          <SpectrumVisualizerWrap aria-hidden style={{ opacity: 0.45 }} />
        </ResultLoadingState>
      ) : audioUrl ? (
        <ResultPlayerCard>
          <HiddenAudio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            crossOrigin="anonymous"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          />

          <ResultPlayRow>
            <ResultPlayButton
              type="button"
              $playing={playing}
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            </ResultPlayButton>
            <ResultMeta>
              <ResultVoiceName title={voiceName}>
                {voiceName || <FormattedMessage id="create.speech.untitled" defaultMessage="未命名语音" />}
                <ResultFormatTag>{formatLabel}</ResultFormatTag>
              </ResultVoiceName>
              <ResultPlayStatus $playing={playing}>
                {playing ? (
                  <FormattedMessage id="create.speech.resultPlaying" defaultMessage="播放中" />
                ) : (
                  <FormattedMessage id="create.speech.resultIdle" defaultMessage="点击播放预览" />
                )}
              </ResultPlayStatus>
            </ResultMeta>
          </ResultPlayRow>

          <AudioSpectrumVisualizer
            audioRef={audioRef}
            audioUrl={audioUrl}
            playing={playing}
          />

          <ResultProgressTrack onClick={handleProgressClick}>
            <ResultProgressFill $percent={progressPercent} />
          </ResultProgressTrack>
          <ResultTimeRow>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </ResultTimeRow>

          <ResultActions>
            <Button icon={<RedoOutlined />} onClick={handleReplay}>
              <FormattedMessage id="create.speech.replay" defaultMessage="重新播放" />
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              href={audioUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage id="common.download" defaultMessage="下载" />
            </Button>
          </ResultActions>
        </ResultPlayerCard>
      ) : (
        <ResultEmptyState>
          <ResultEmptyIcon>
            <SoundOutlined />
          </ResultEmptyIcon>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>
            <FormattedMessage id="create.speech.resultEmpty" defaultMessage="生成的语音将显示在这里" />
          </Text>
          <ResultEmptyHint>
            <FormattedMessage
              id="create.speech.resultEmptyHint"
              defaultMessage="选择音色、输入文本后，点击「生成语音」即可在此预览与下载"
            />
          </ResultEmptyHint>
          <ResultEmptyHint style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12 }}>
            <AudioOutlined />
            <FormattedMessage id="create.speech.resultEmptyTip" defaultMessage="支持 MP3 / PCM / OGG 等格式" />
          </ResultEmptyHint>
        </ResultEmptyState>
      )}
    </ResultArea>
  );
};

export default AudioResultPanel;
