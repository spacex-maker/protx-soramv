import React from 'react';
import {
  Button,
  InputNumber,
  Progress,
  Segmented,
  Slider,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  CompressOutlined,
  DownloadOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import { formatSize } from './utils';

const { Text } = Typography;

const THEME_COLOR = '#8338ec';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`;

const SidePanelInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'};
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const StatCard = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8ecf1'};

  .label {
    font-size: 11px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
    margin-bottom: 4px;
  }

  .value {
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.color || (props.theme.mode === 'dark' ? '#fff' : '#1f1f1f')};
  }
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const FormatChip = styled.button<{ $active: boolean; $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  border: 1.5px solid ${props =>
    props.$active
      ? THEME_COLOR
      : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
  background: ${props =>
    props.$active
      ? props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.18)' : 'rgba(131, 56, 236, 0.08)'
      : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${THEME_COLOR};
  }

  .label {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$active ? THEME_COLOR : 'inherit'};
  }

  .desc {
    font-size: 11px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
  }
`;

const InfoRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ProgressBox = styled.div`
  padding: 14px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.1)' : 'rgba(131, 56, 236, 0.06)'};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ResultBox = styled.div`
  padding: 14px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'};
  animation: ${fadeIn} 0.35s ease-out;
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px dashed ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
`;

const OUTPUT_FORMATS: Array<{
  value: 'mp3' | 'ogg' | 'aac' | 'wav';
  label: string;
  desc: string;
  lossless?: boolean;
}> = [
  { value: 'mp3', label: 'MP3', desc: '通用推荐' },
  { value: 'ogg', label: 'OGG', desc: '开源压缩' },
  { value: 'aac', label: 'AAC', desc: '流媒体' },
  { value: 'wav', label: 'WAV', desc: '无损 PCM', lossless: true },
];

const BITRATE_SEGMENT_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: '320k', value: '320' },
  { label: '192k', value: '192' },
  { label: '128k', value: '128' },
  { label: '64k', value: '64' },
];

const SAMPLE_RATE_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: '48k', value: '48000' },
  { label: '44.1k', value: '44100' },
  { label: '32k', value: '32000' },
  { label: '22k', value: '22050' },
];

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
  audioInfo,
}) => {
  const intl = useIntl();
  const hasFile = !!singleFile;
  const bitrateSegmentValue = bitrate ? String(bitrate) : 'auto';
  const sampleRateSegmentValue = sampleRate ? String(sampleRate) : 'auto';

  return (
    <SidePanelInner>
      <StatsGrid>
        <StatCard color={singleSavings >= 0 ? '#22c55e' : '#ef4444'}>
          <div className="label">
            <FormattedMessage id="audioCompress.totalSavings" defaultMessage="节省空间" />
          </div>
          <div className="value">
            {singleMeta.originalSize > 0 ? `${singleSavings.toFixed(1)}%` : '—'}
          </div>
        </StatCard>
        <StatCard>
          <div className="label">
            <FormattedMessage id="audioCompress.totalSize" defaultMessage="输出大小" />
          </div>
          <div className="value">
            {singleMeta.originalSize > 0
              ? formatSize(singleMeta.compressedSize || singleMeta.originalSize)
              : '—'}
          </div>
        </StatCard>
      </StatsGrid>

      {audioInfo && (
        <div>
          <SectionTitle>
            <FormattedMessage id="audioCompress.audioInfo" defaultMessage="音频信息" />
          </SectionTitle>
          <InfoRow>
            <Tag color="purple">{Math.floor(audioInfo.duration)}s</Tag>
            <Tag bordered={false}>{audioInfo.sampleRate} Hz</Tag>
            {singleMeta.originalSize > 0 && (
              <Tag bordered={false}>{formatSize(singleMeta.originalSize)}</Tag>
            )}
          </InfoRow>
        </div>
      )}

      <div>
        <SectionTitle>
          <FormattedMessage id="audioCompress.format" defaultMessage="输出格式" />
        </SectionTitle>
        <FormatGrid>
          {OUTPUT_FORMATS.map((item) => (
            <FormatChip
              key={item.value}
              type="button"
              $active={format === item.value}
              $disabled={isCompressing}
              disabled={isCompressing}
              onClick={() => setFormat(item.value)}
            >
              <span className="label">
                {item.label}
                {item.lossless && (
                  <Tag color="green" bordered={false} style={{ marginLeft: 6, fontSize: 10, padding: '0 4px' }}>
                    无损
                  </Tag>
                )}
              </span>
              <span className="desc">{item.desc}</span>
            </FormatChip>
          ))}
        </FormatGrid>
      </div>

      <div>
        <SectionTitle>
          <FormattedMessage id="audioCompress.bitrate" defaultMessage="比特率" />
        </SectionTitle>
        <Segmented
          block
          value={bitrateSegmentValue}
          options={BITRATE_SEGMENT_OPTIONS}
          onChange={(val) => {
            if (val === 'auto') {
              setBitrate(undefined);
            } else {
              setBitrate(Number(val));
            }
          }}
          disabled={isCompressing}
        />
      </div>

      {!bitrate && format !== 'wav' && (
        <div>
          <SectionTitle>
            <span>
              <FormattedMessage id="audioCompress.quality" defaultMessage="质量" />
            </span>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'none', letterSpacing: 0 }}>
              {Math.round(quality * 100)}%
            </Text>
          </SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Slider
              style={{ flex: 1 }}
              min={0.1}
              max={1.0}
              step={0.05}
              value={quality}
              onChange={setQuality}
              disabled={isCompressing}
            />
            <InputNumber
              min={10}
              max={100}
              value={Math.round(quality * 100)}
              onChange={(val) => setQuality((val || 100) / 100)}
              formatter={(value) => `${value}%`}
              parser={(value) => value?.replace('%', '') as unknown as number}
              style={{ width: 70 }}
              size="small"
              disabled={isCompressing}
            />
          </div>
        </div>
      )}

      <div>
        <SectionTitle>
          <FormattedMessage id="audioCompress.sampleRate" defaultMessage="采样率" />
        </SectionTitle>
        <Segmented
          block
          value={sampleRateSegmentValue}
          options={SAMPLE_RATE_OPTIONS}
          onChange={(val) => {
            if (val === 'auto') {
              setSampleRate(undefined);
            } else {
              setSampleRate(Number(val));
            }
          }}
          disabled={isCompressing}
        />
      </div>

      {isCompressing && (
        <ProgressBox>
          <Text style={{ display: 'block', marginBottom: 10 }}>
            <FormattedMessage id="audioCompress.compressing" defaultMessage="压缩中..." />
          </Text>
          <Progress percent={compressionProgress} status="active" strokeColor={THEME_COLOR} />
        </ProgressBox>
      )}

      {hasCompressedResult && !isCompressing && (
        <ResultBox>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Space>
              <SafetyCertificateOutlined style={{ color: '#22c55e' }} />
              <Text strong>
                <FormattedMessage id="audioCompress.message.compressed" defaultMessage="压缩成功！" />
              </Text>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatSize(singleMeta.originalSize)} → {formatSize(singleMeta.compressedSize)}
              {singleSavings > 0 && ` · 节省 ${singleSavings.toFixed(1)}%`}
            </Text>
          </Space>
        </ResultBox>
      )}

      <ActionGroup>
        <Button
          type="primary"
          size="large"
          block
          icon={isCompressing ? <LoadingOutlined /> : <CompressOutlined />}
          onClick={onCompress}
          disabled={isCompressing || !hasFile}
          style={{ height: 44, borderRadius: 10 }}
        >
          {isCompressing
            ? intl.formatMessage({ id: 'audioCompress.compressing', defaultMessage: '压缩中...' })
            : intl.formatMessage({ id: 'audioCompress.compress', defaultMessage: '开始压缩' })}
        </Button>
        <Space style={{ width: '100%' }}>
          <Button
            icon={<DownloadOutlined />}
            onClick={onDownload}
            disabled={!hasCompressedResult}
            block
          >
            <FormattedMessage id="audioCompress.download" defaultMessage="下载" />
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onReset} disabled={isCompressing} block>
            <FormattedMessage id="audioCompress.clearAll" defaultMessage="重置" />
          </Button>
        </Space>
      </ActionGroup>
    </SidePanelInner>
  );
};

export default AudioCompressSettings;
