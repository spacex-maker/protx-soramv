import React from 'react';
import { 
  Slider, InputNumber, Select, Button, 
  Typography, Progress
} from 'antd';
import { 
  DeleteOutlined, 
  LoadingOutlined,
  CompressOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { formatSize } from './utils';

const { Title } = Typography;

const ControlPanel = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  overflow-y: auto;
  max-height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
    border-radius: 3px;

    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#555' : '#bfbfbf'};
    }
  }

  @media (max-width: 1024px) {
    max-height: none;
  }
`;

const PanelSection = styled.div`
  margin-bottom: 24px;
  &:last-child { margin-bottom: 0; }
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${props => props.theme.mode === 'dark' ? '#888' : '#999'};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#f8f9fa'};
  padding: 20px;
  border-radius: 16px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#e9ecef'};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  .label { font-size: 12px; color: #888; margin-bottom: 4px; }
  .value { font-size: 16px; font-weight: 600; color: ${props => props.theme.mode === 'dark' ? '#e8eaed' : '#1f1f1f'}; }
`;

const ActionFooter = styled.div`
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export interface AudioCompressSettingsProps {
  singleSavings: number;
  singleMeta: { originalSize: number; compressedSize: number };
  bitrate: number | undefined;
  setBitrate: (value: number | undefined) => void;
  quality: number;
  setQuality: (value: number) => void;
  format: 'mp3' | 'ogg' | 'aac' | 'wav';
  setFormat: (value: 'mp3' | 'ogg' | 'aac' | 'wav') => void;
  sampleRate: number | undefined;
  setSampleRate: (value: number | undefined) => void;
  isCompressing: boolean;
  compressionProgress: number;
  onCompress: () => void;
  onDownload: () => void;
  onReset: () => void;
  singleFile: File | null;
  hasCompressedResult: boolean;
  audioInfo?: { duration: number; sampleRate: number };
}

// 预设比特率（将在组件中使用 intl 动态生成）
const PRESET_BITRATE_VALUES = [
  { key: 'auto', value: undefined },
  { key: '320', value: 320 },
  { key: '256', value: 256 },
  { key: '192', value: 192 },
  { key: '128', value: 128 },
  { key: '96', value: 96 },
  { key: '64', value: 64 },
];

// 预设采样率（将在组件中使用 intl 动态生成）
const PRESET_SAMPLE_RATE_VALUES = [
  { key: 'auto', value: undefined },
  { key: '48000', value: 48000 },
  { key: '44100', value: 44100 },
  { key: '32000', value: 32000 },
  { key: '22050', value: 22050 },
  { key: '16000', value: 16000 },
];

const AudioCompressSettings: React.FC<AudioCompressSettingsProps> = ({
  singleSavings,
  singleMeta,
  bitrate,
  setBitrate,
  quality,
  setQuality,
  format,
  setFormat,
  sampleRate,
  setSampleRate,
  isCompressing,
  compressionProgress,
  onCompress,
  onDownload,
  onReset,
  singleFile,
  hasCompressedResult,
  audioInfo
}) => {
  const intl = useIntl();

  // 动态生成比特率选项
  const PRESET_BITRATES = PRESET_BITRATE_VALUES.map(item => ({
    label: item.key === 'auto' 
      ? 'Auto'
      : intl.formatMessage({ 
          id: `audioCompress.bitrate.${item.key}`, 
          defaultMessage: `${item.value} kbps` 
        }),
    value: item.value
  }));

  // 动态生成采样率选项
  const PRESET_SAMPLE_RATES = PRESET_SAMPLE_RATE_VALUES.map(item => ({
    label: item.key === 'auto'
      ? 'Auto'
      : intl.formatMessage({ 
          id: `audioCompress.sampleRate.${item.key}`, 
          defaultMessage: `${item.value} Hz` 
        }),
    value: item.value
  }));

  return (
    <ControlPanel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <FormattedMessage id="audioCompress.settings" defaultMessage="设置" />
        </Title>
        <Button 
          type="text" 
          icon={<DeleteOutlined />} 
          onClick={onReset} 
          danger
          style={{ borderRadius: 999 }}
        >
          <FormattedMessage id="audioCompress.clearAll" defaultMessage="清空全部" />
        </Button>
      </div>

      <StatsGrid>
        <StatItem>
          <span className="label">
            <FormattedMessage id="audioCompress.totalSavings" defaultMessage="节省空间" />
          </span>
          <span className="value" style={{ color: singleSavings >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {singleMeta.originalSize > 0 ? `${singleSavings.toFixed(1)}%` : '-'}
          </span>
        </StatItem>
        <StatItem>
          <span className="label">
            <FormattedMessage id="audioCompress.totalSize" defaultMessage="总大小" />
          </span>
          <span className="value">
            {singleMeta.originalSize > 0 ? formatSize(singleMeta.compressedSize || singleMeta.originalSize) : '-'}
          </span>
        </StatItem>
      </StatsGrid>

      {audioInfo && (
        <PanelSection>
          <SectionTitle>
            <FormattedMessage id="audioCompress.audioInfo" defaultMessage="音频信息" />
          </SectionTitle>
          <div style={{ fontSize: 12, color: '#888' }}>
            <div>{Math.floor(audioInfo.duration)}s</div>
            <div>{audioInfo.sampleRate} Hz</div>
          </div>
        </PanelSection>
      )}

      <PanelSection>
        <SectionTitle>
          <FormattedMessage id="audioCompress.bitrate" defaultMessage="比特率" />
        </SectionTitle>
        <Select
          value={bitrate || 'auto'}
          onChange={(val) => {
            if (val === 'auto' || val === undefined) {
              setBitrate(undefined);
            } else {
              setBitrate(typeof val === 'number' ? val : Number(val));
            }
          }}
          style={{ width: '100%' }}
          options={PRESET_BITRATES.map(bitrate => ({
            label: bitrate.label,
            value: bitrate.value ?? 'auto'
          }))}
        />
      </PanelSection>

      {!bitrate && (
        <PanelSection>
          <SectionTitle>
            <span>
              <FormattedMessage id="audioCompress.quality" defaultMessage="质量" />
            </span>
            <span>{Math.round(quality * 100)}%</span>
          </SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Slider
              style={{ flex: 1 }} min={0.1} max={1.0} step={0.05}
              value={quality} onChange={setQuality}
            />
            <InputNumber
              min={10} max={100} value={Math.round(quality * 100)}
              onChange={(val) => setQuality((val || 100) / 100)}
              formatter={value => `${value}%`}
              parser={value => value?.replace('%', '') as unknown as number}
              style={{ width: 70 }} size="small"
            />
          </div>
        </PanelSection>
      )}

      <PanelSection>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <SectionTitle>
              <FormattedMessage id="audioCompress.format" defaultMessage="格式" />
            </SectionTitle>
            <Select
              value={format} onChange={setFormat} style={{ width: '100%' }}
              options={[
                { 
                  value: 'mp3', 
                  label: intl.formatMessage({ 
                    id: 'audioCompress.format.mp3', 
                    defaultMessage: 'MP3 (推荐)' 
                  }) 
                },
                { 
                  value: 'ogg', 
                  label: intl.formatMessage({ 
                    id: 'audioCompress.format.ogg', 
                    defaultMessage: 'OGG' 
                  }) 
                },
                { 
                  value: 'aac', 
                  label: intl.formatMessage({ 
                    id: 'audioCompress.format.aac', 
                    defaultMessage: 'AAC' 
                  }) 
                },
                { 
                  value: 'wav', 
                  label: intl.formatMessage({ 
                    id: 'audioCompress.format.wav', 
                    defaultMessage: 'WAV' 
                  }) 
                },
              ]}
            />
          </div>
          <div>
            <SectionTitle>
              <FormattedMessage id="audioCompress.sampleRate" defaultMessage="采样率" />
            </SectionTitle>
            <Select
              value={sampleRate || 'auto'}
              onChange={(val) => {
                if (val === 'auto' || val === undefined) {
                  setSampleRate(undefined);
                } else {
                  setSampleRate(typeof val === 'number' ? val : Number(val));
                }
              }}
              style={{ width: '100%' }}
              options={PRESET_SAMPLE_RATES.map(rate => ({
                label: rate.label,
                value: rate.value ?? 'auto'
              }))}
            />
          </div>
        </div>
      </PanelSection>

      {isCompressing && (
        <PanelSection>
          <Progress 
            percent={compressionProgress} 
            status="active"
            format={(percent) => `${Math.round(percent || 0)}%`}
          />
        </PanelSection>
      )}

      <ActionFooter>
        <Button
          type="primary" block size="large"
          icon={isCompressing ? <LoadingOutlined /> : <CompressOutlined />}
          onClick={onCompress}
          disabled={isCompressing || !singleFile}
          style={{
            height: 50, 
            borderRadius: 999,
            background: 'linear-gradient(135deg, #8338ec 0%, #3a86ff 100%)',
            border: 'none', 
            fontSize: 16, 
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(131, 56, 236, 0.3)',
            transition: 'all 0.3s'
          }}
        >
          {isCompressing 
            ? intl.formatMessage({ id: 'audioCompress.compressing', defaultMessage: '压缩中...' })
            : intl.formatMessage({ id: 'audioCompress.compress', defaultMessage: '开始压缩' })
          }
        </Button>
        <Button
          block size="large" 
          icon={<DownloadOutlined />}
          onClick={onDownload}
          disabled={!hasCompressedResult}
          style={{ 
            height: 50, 
            borderRadius: 999, 
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
        >
          <FormattedMessage id="audioCompress.download" defaultMessage="下载音频" />
        </Button>
      </ActionFooter>
    </ControlPanel>
  );
};

export default AudioCompressSettings;

