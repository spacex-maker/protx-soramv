import React from 'react';
import styled from 'styled-components';
import AudioWaveform from '../AudioCompress/AudioWaveform';

interface AudioPlaybackPanelProps {
  audioUrl: string;
  accentColor?: string;
  waveformHeight?: number;
  audioRef?: React.Ref<HTMLAudioElement>;
  className?: string;
}

const PlaybackPanel = styled.div<{ $accent: string }>`
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8ecf1'};
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
    : 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)'};
  box-shadow: ${props => props.theme.mode === 'dark'
    ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
    : 'inset 0 1px 0 rgba(255,255,255,0.8)'};
`;

const WaveformZone = styled.div<{ $accent: string }>`
  padding: 16px 16px 8px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef2f7'};
  background: ${props => props.theme.mode === 'dark'
    ? `linear-gradient(135deg, ${props.$accent}14, transparent)`
    : `linear-gradient(135deg, ${props.$accent}0a, transparent)`};
`;

const ControlsZone = styled.div`
  padding: 12px 16px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledAudio = styled.audio`
  flex: 1;
  min-width: 0;
  height: 44px;
  border-radius: 10px;

  &::-webkit-media-controls-panel {
    border-radius: 10px;
  }
`;

const AudioPlaybackPanel: React.FC<AudioPlaybackPanelProps> = ({
  audioUrl,
  accentColor = '#0ea5e9',
  waveformHeight = 120,
  audioRef,
  className,
}) => (
  <PlaybackPanel $accent={accentColor} className={className}>
    <WaveformZone $accent={accentColor}>
      <AudioWaveform
        audioUrl={audioUrl}
        height={waveformHeight}
        barWidth={2}
        gap={1}
      />
    </WaveformZone>
    <ControlsZone>
      <StyledAudio controls src={audioUrl} ref={audioRef} preload="metadata" />
    </ControlsZone>
  </PlaybackPanel>
);

export default AudioPlaybackPanel;
