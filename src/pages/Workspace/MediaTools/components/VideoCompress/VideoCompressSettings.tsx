import React from 'react';
import {
  Button,
  InputNumber,
  Progress,
  Segmented,
  Select,
  Slider,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CompressOutlined,
  DownloadOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import { formatSize } from './utils';

const { Text } = Typography;

const THEME_COLOR = '#1890ff';

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

const StatCard = styled.div<{ $color?: string }>`
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
    color: ${props => props.$color || (props.theme.mode === 'dark' ? '#fff' : '#1f1f1f')};
  }
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
      ? props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.18)' : 'rgba(24, 144, 255, 0.08)'
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

const HintText = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  margin-top: 6px;
`;

const ProgressBox = styled.div`
  padding: 14px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.06)'};
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
  value: 'mp4' | 'webm' | 'avi';
  label: string;
  desc: string;
}> = [
  { value: 'mp4', label: 'MP4', desc: '通用推荐' },
  { value: 'webm', label: 'WebM', desc: '网页开源' },
  { value: 'avi', label: 'AVI', desc: '经典容器' },
];

const BITRATE_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: '500k', value: '500k' },
  { label: '1M', value: '1M' },
  { label: '2M', value: '2M' },
  { label: '5M', value: '5M' },
];

const RESOLUTION_OPTIONS = [
  { label: 'Original', value: 'original' },
  { label: '1080p', value: '1920:1080' },
  { label: '720p', value: '1280:720' },
  { label: '480p', value: '854:480' },
];

export interface VideoCompressSettingsProps {
  singleSavings: number;
  singleMeta: { originalSize: number; compressedSize: number };
  quality: number;
  setQuality: (value: number) => void;
  bitrate: string;
  setBitrate: (value: string) => void;
  resolution: string;
  setResolution: (value: string) => void;
  fps: number | undefined;
  setFps: (value: number | undefined) => void;
  format: 'mp4' | 'webm' | 'avi';
  setFormat: (value: 'mp4' | 'webm' | 'avi') => void;
  crf: number;
  setCrf: (value: number) => void;
  isCompressing: boolean;
  compressionProgress: number;
  onCompress: () => void;
  onDownload: () => void;
  onReset: () => void;
  singleFile: File | null;
  hasCompressedResult: boolean;
  videoInfo?: { width: number; height: number; duration: number };
}

const VideoCompressSettings: React.FC<VideoCompressSettingsProps> = ({
  singleSavings,
  singleMeta,
  quality,
  setQuality,
  bitrate,
  setBitrate,
  resolution,
  setResolution,
  fps,
  setFps,
  format,
  setFormat,
  crf,
  setCrf,
  isCompressing,
  compressionProgress,
  onCompress,
  onDownload,
  onReset,
  singleFile,
  hasCompressedResult,
  videoInfo,
}) => {
  const intl = useIntl();
  const hasFile = !!singleFile;
  const bitrateValue = bitrate || 'auto';
  const resolutionValue = resolution || 'original';

  return (
    <SidePanelInner>
      <StatsGrid>
        <StatCard $color={singleSavings >= 0 ? '#22c55e' : '#ef4444'}>
          <div className="label">
            <FormattedMessage id="videoCompress.totalSavings" defaultMessage="节省空间" />
          </div>
          <div className="value">
            {singleMeta.originalSize > 0 ? `${singleSavings.toFixed(1)}%` : '—'}
          </div>
        </StatCard>
        <StatCard>
          <div className="label">
            <FormattedMessage id="videoCompress.totalSize" defaultMessage="输出大小" />
          </div>
          <div className="value">
            {singleMeta.originalSize > 0
              ? formatSize(singleMeta.compressedSize || singleMeta.originalSize)
              : '—'}
          </div>
        </StatCard>
      </StatsGrid>

      {videoInfo && (
        <div>
          <SectionTitle>
            <FormattedMessage id="videoCompress.videoInfo" defaultMessage="视频信息" />
          </SectionTitle>
          <InfoRow>
            <Tag color="blue">{videoInfo.width} × {videoInfo.height}</Tag>
            <Tag bordered={false}>{Math.floor(videoInfo.duration)}s</Tag>
            {singleMeta.originalSize > 0 && (
              <Tag bordered={false}>{formatSize(singleMeta.originalSize)}</Tag>
            )}
          </InfoRow>
        </div>
      )}

      <div>
        <SectionTitle>
          <FormattedMessage id="videoCompress.format" defaultMessage="输出格式" />
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
              <span className="label">{item.label}</span>
              <span className="desc">{item.desc}</span>
            </FormatChip>
          ))}
        </FormatGrid>
      </div>

      <div>
        <SectionTitle>
          <FormattedMessage id="videoCompress.resolution" defaultMessage="分辨率" />
        </SectionTitle>
        <Segmented
          block
          value={resolutionValue}
          options={RESOLUTION_OPTIONS}
          onChange={(val) => setResolution(val === 'original' ? '' : String(val))}
          disabled={isCompressing}
        />
      </div>

      <div>
        <SectionTitle>
          <span>
            <FormattedMessage id="videoCompress.crf" defaultMessage="CRF 质量" />
          </span>
          <Tooltip title={intl.formatMessage({
            id: 'videoCompress.crfTooltip',
            defaultMessage: 'CRF 值越小质量越好，18-28 为常用范围',
          })}>
            <QuestionCircleOutlined style={{ fontSize: 12, cursor: 'help', textTransform: 'none' }} />
          </Tooltip>
        </SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Slider
            style={{ flex: 1 }}
            min={18}
            max={32}
            step={1}
            value={crf}
            onChange={setCrf}
            disabled={isCompressing || !!bitrate}
          />
          <InputNumber
            min={18}
            max={32}
            value={crf}
            onChange={(val) => setCrf(val ?? 23)}
            style={{ width: 70 }}
            size="small"
            disabled={isCompressing || !!bitrate}
          />
        </div>
      </div>

      <div>
        <SectionTitle>
          <FormattedMessage id="videoCompress.bitrate" defaultMessage="视频比特率" />
        </SectionTitle>
        <Segmented
          block
          value={bitrateValue}
          options={BITRATE_OPTIONS}
          onChange={(val) => setBitrate(val === 'auto' ? '' : String(val))}
          disabled={isCompressing}
        />
        <HintText>
          <FormattedMessage
            id="videoCompress.bitrateNote"
            defaultMessage="选择比特率将覆盖 CRF 设置"
          />
        </HintText>
      </div>

      <div>
        <SectionTitle>
          <span>
            <FormattedMessage id="videoCompress.quality" defaultMessage="质量系数" />
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

      <div>
        <SectionTitle>
          <FormattedMessage id="videoCompress.fps" defaultMessage="帧率" />
        </SectionTitle>
        <Select
          value={fps ?? 'auto'}
          onChange={(val) => setFps(val === 'auto' ? undefined : Number(val))}
          style={{ width: '100%' }}
          disabled={isCompressing}
          options={[
            {
              value: 'auto',
              label: intl.formatMessage({ id: 'videoCompress.fpsPlaceholder', defaultMessage: '保持原帧率' }),
            },
            { value: 24, label: '24 fps' },
            { value: 30, label: '30 fps' },
            { value: 60, label: '60 fps' },
          ]}
        />
      </div>

      {isCompressing && (
        <ProgressBox>
          <Text style={{ display: 'block', marginBottom: 10 }}>
            <FormattedMessage id="videoCompress.compressingProgress" defaultMessage="正在压缩视频，请稍候..." />
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
                <FormattedMessage id="videoCompress.message.compressed" defaultMessage="压缩成功！" />
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
            ? intl.formatMessage({ id: 'videoCompress.compressing', defaultMessage: '压缩中...' })
            : intl.formatMessage({ id: 'videoCompress.compress', defaultMessage: '开始压缩' })}
        </Button>
        <Space style={{ width: '100%' }}>
          <Button
            icon={<DownloadOutlined />}
            onClick={onDownload}
            disabled={!hasCompressedResult}
            block
          >
            <FormattedMessage id="videoCompress.download" defaultMessage="下载" />
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onReset} disabled={isCompressing} block>
            <FormattedMessage id="videoCompress.clearAll" defaultMessage="重置" />
          </Button>
        </Space>
      </ActionGroup>
    </SidePanelInner>
  );
};

export default VideoCompressSettings;
