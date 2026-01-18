import React from 'react';
import { 
  Slider, InputNumber, Select, Button, 
  Typography, Switch, Tooltip, Input
} from 'antd';
import { 
  DeleteOutlined, 
  LoadingOutlined,
  CompressOutlined,
  DownloadOutlined,
  QuestionCircleOutlined
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
  onCompress: () => void;
  onDownload: () => void;
  onReset: () => void;
  singleFile: File | null;
  hasCompressedResult: boolean;
  videoInfo?: { width: number; height: number; duration: number };
}

// 预设分辨率
const PRESET_RESOLUTIONS = [
  { label: 'Original', value: '' },
  { label: '4K UHD (3840×2160)', value: '3840:2160' },
  { label: '2K QHD (2560×1440)', value: '2560:1440' },
  { label: 'Full HD (1920×1080)', value: '1920:1080' },
  { label: 'HD (1280×720)', value: '1280:720' },
  { label: 'SD (854×480)', value: '854:480' },
];

// 预设比特率
const PRESET_BITRATES = [
  { label: 'Auto (CRF)', value: '' },
  { label: 'Very High (10M)', value: '10M' },
  { label: 'High (5M)', value: '5M' },
  { label: 'Medium (2M)', value: '2M' },
  { label: 'Low (1M)', value: '1M' },
  { label: 'Very Low (500k)', value: '500k' },
];

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
  onCompress,
  onDownload,
  onReset,
  singleFile,
  hasCompressedResult,
  videoInfo
}) => {
  const intl = useIntl();

  return (
    <ControlPanel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <FormattedMessage id="videoCompress.settings" defaultMessage="设置" />
        </Title>
        <Button 
          type="text" 
          icon={<DeleteOutlined />} 
          onClick={onReset} 
          danger
          style={{ borderRadius: 999 }}
        >
          <FormattedMessage id="videoCompress.clearAll" defaultMessage="清空全部" />
        </Button>
      </div>

      <StatsGrid>
        <StatItem>
          <span className="label">
            <FormattedMessage id="videoCompress.totalSavings" defaultMessage="节省空间" />
          </span>
          <span className="value" style={{ color: singleSavings >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {singleMeta.originalSize > 0 ? `${singleSavings.toFixed(1)}%` : '-'}
          </span>
        </StatItem>
        <StatItem>
          <span className="label">
            <FormattedMessage id="videoCompress.totalSize" defaultMessage="总大小" />
          </span>
          <span className="value">
            {singleMeta.originalSize > 0 ? formatSize(singleMeta.compressedSize || singleMeta.originalSize) : '-'}
          </span>
        </StatItem>
      </StatsGrid>

      {videoInfo && (
        <PanelSection>
          <SectionTitle>
            <FormattedMessage id="videoCompress.videoInfo" defaultMessage="视频信息" />
          </SectionTitle>
          <div style={{ fontSize: 12, color: '#888' }}>
            <div>{videoInfo.width} × {videoInfo.height}</div>
            <div>{Math.floor(videoInfo.duration)}s</div>
          </div>
        </PanelSection>
      )}

      <PanelSection>
        <SectionTitle>
          <span>
            <FormattedMessage id="videoCompress.quality" defaultMessage="质量" />
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

      <PanelSection>
        <SectionTitle>
          <span>
            <FormattedMessage id="videoCompress.crf" defaultMessage="CRF (质量)" />
          </span>
          <Tooltip title={intl.formatMessage({ 
            id: 'videoCompress.crfTooltip', 
            defaultMessage: 'CRF值越小质量越好，18-28为常用范围' 
          })}>
            <QuestionCircleOutlined style={{ fontSize: 12, color: '#888', cursor: 'help', marginLeft: 4 }} />
          </Tooltip>
        </SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Slider
            style={{ flex: 1 }} min={18} max={32} step={1}
            value={crf} onChange={setCrf}
          />
          <InputNumber
            min={18} max={32} value={crf}
            onChange={(val) => setCrf(val ?? 23)}
            style={{ width: 70 }} size="small"
          />
        </div>
      </PanelSection>

      <PanelSection>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
          <div>
            <SectionTitle>
              <FormattedMessage id="videoCompress.resolution" defaultMessage="分辨率" />
            </SectionTitle>
            <Select
              value={resolution || 'original'}
              onChange={(val) => setResolution(val === 'original' ? '' : val)}
              style={{ width: '100%' }}
              options={PRESET_RESOLUTIONS.map(res => ({
                label: res.label,
                value: res.value || 'original'
              }))}
            />
          </div>
          <div>
            <SectionTitle>
              <FormattedMessage id="videoCompress.fps" defaultMessage="帧率" />
            </SectionTitle>
            <InputNumber
              value={fps}
              onChange={(val) => setFps(val || undefined)}
              placeholder={intl.formatMessage({ id: 'videoCompress.fpsPlaceholder', defaultMessage: '保持原帧率' })}
              min={1}
              max={120}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
          <div>
            <SectionTitle>
              <FormattedMessage id="videoCompress.format" defaultMessage="格式" />
            </SectionTitle>
            <Select
              value={format} onChange={setFormat} style={{ width: '100%' }}
              options={[
                { value: 'mp4', label: 'MP4 (推荐)' },
                { value: 'webm', label: 'WebM' },
                { value: 'avi', label: 'AVI' },
              ]}
            />
          </div>
          <div>
            <SectionTitle>
              <FormattedMessage id="videoCompress.bitrate" defaultMessage="比特率" />
            </SectionTitle>
            <Select
              value={bitrate || 'auto'}
              onChange={(val) => setBitrate(val === 'auto' ? '' : val)}
              style={{ width: '100%' }}
              options={PRESET_BITRATES.map(bitrate => ({
                label: bitrate.label,
                value: bitrate.value || 'auto'
              }))}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              <FormattedMessage 
                id="videoCompress.bitrateNote" 
                defaultMessage="选择比特率将覆盖CRF设置" 
              />
            </div>
          </div>
        </div>
      </PanelSection>

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
            ? intl.formatMessage({ id: 'videoCompress.compressing', defaultMessage: '压缩中...' })
            : intl.formatMessage({ id: 'videoCompress.compress', defaultMessage: '开始压缩' })
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
          <FormattedMessage id="videoCompress.download" defaultMessage="下载视频" />
        </Button>
      </ActionFooter>
    </ControlPanel>
  );
};

export default VideoCompressSettings;

