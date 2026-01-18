import React from 'react';
import { 
  Slider, InputNumber, Select, Button, 
  Typography, Segmented, Switch, Tooltip, Checkbox
} from 'antd';
import { 
  DeleteOutlined, 
  ColumnHeightOutlined, 
  ColumnWidthOutlined, 
  BgColorsOutlined, 
  LoadingOutlined,
  FileImageOutlined,
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

  /* 自定义滚动条样式 */
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

export interface CompressSettingsProps {
  singleSavings: number;
  singleMeta: { originalSize: number; compressedSize: number };
  quality: number;
  setQuality: (value: number) => void;
  resizeMode: string | number;
  setResizeMode: (value: string | number) => void;
  scale: number;
  setScale: (value: number) => void;
  customWidth: number | null;
  setCustomWidth: (value: number | null) => void;
  customHeight: number | null;
  setCustomHeight: (value: number | null) => void;
  format: string;
  setFormat: (value: string) => void;
  isLossless: boolean;
  isCompressing: boolean;
  onCompress: () => void;
  onDownload: () => void;
  onReset: () => void;
  singleFile: File | null;
  hasCompressedResult: boolean;
  enableCache?: boolean;
  setEnableCache?: (value: boolean) => void;
  applyToAll?: boolean;
  setApplyToAll?: (value: boolean) => void;
  totalFilesCount?: number;
  downloadAll?: boolean;
  setDownloadAll?: (value: boolean) => void;
}

// 预设尺寸选项 - 使用函数以便支持国际化
const getPresetSizes = (intl: any) => [
  // 社交媒体 - 正方形
  { label: intl.formatMessage({ id: 'imageCompress.preset.instagramPost', defaultMessage: 'Instagram Post (1:1)' }), value: '1080x1080', width: 1080, height: 1080 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.square', defaultMessage: 'Square (1:1)' }), value: '1024x1024', width: 1024, height: 1024 },
  
  // 社交媒体 - 横向
  { label: intl.formatMessage({ id: 'imageCompress.preset.facebookCover', defaultMessage: 'Facebook Cover (16:9)' }), value: '1200x675', width: 1200, height: 675 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.twitterHeader', defaultMessage: 'Twitter Header (3:1)' }), value: '1500x500', width: 1500, height: 500 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.youtubeThumbnail', defaultMessage: 'YouTube Thumbnail (16:9)' }), value: '1280x720', width: 1280, height: 720 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.facebookPost', defaultMessage: 'Facebook Post (1.91:1)' }), value: '1200x630', width: 1200, height: 630 },
  
  // 社交媒体 - 竖向
  { label: intl.formatMessage({ id: 'imageCompress.preset.instagramStory', defaultMessage: 'Instagram Story (9:16)' }), value: '1080x1920', width: 1080, height: 1920 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.tiktok', defaultMessage: 'TikTok (9:16)' }), value: '1080x1920', width: 1080, height: 1920 },
  
  // 视频分辨率
  { label: intl.formatMessage({ id: 'imageCompress.preset.4kUHD', defaultMessage: '4K UHD (16:9)' }), value: '3840x2160', width: 3840, height: 2160 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.2kQHD', defaultMessage: '2K QHD (16:9)' }), value: '2560x1440', width: 2560, height: 1440 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.fullHD', defaultMessage: 'Full HD (16:9)' }), value: '1920x1080', width: 1920, height: 1080 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.hd', defaultMessage: 'HD (16:9)' }), value: '1280x720', width: 1280, height: 720 },
  
  // 常用比例
  { label: intl.formatMessage({ id: 'imageCompress.preset.landscape16:9', defaultMessage: '16:9 Landscape' }), value: '1920x1080_16:9', width: 1920, height: 1080 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.classic4:3', defaultMessage: '4:3 Classic' }), value: '1600x1200', width: 1600, height: 1200 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.photo3:2', defaultMessage: '3:2 Photo' }), value: '1800x1200', width: 1800, height: 1200 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.ultrawide21:9', defaultMessage: '21:9 Ultrawide' }), value: '2560x1080', width: 2560, height: 1080 },
  
  // 打印尺寸 (像素 @ 300 DPI)
  { label: intl.formatMessage({ id: 'imageCompress.preset.a4Portrait', defaultMessage: 'A4 Portrait (8.27×11.69")' }), value: '2480x3508', width: 2480, height: 3508 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.a4Landscape', defaultMessage: 'A4 Landscape (11.69×8.27")' }), value: '3508x2480', width: 3508, height: 2480 },
  { label: intl.formatMessage({ id: 'imageCompress.preset.letterPortrait', defaultMessage: 'Letter Portrait (8.5×11")' }), value: '2550x3300', width: 2550, height: 3300 },
];

const CompressSettings: React.FC<CompressSettingsProps> = ({
  singleSavings,
  singleMeta,
  quality,
  setQuality,
  resizeMode,
  setResizeMode,
  scale,
  setScale,
  customWidth,
  setCustomWidth,
  customHeight,
  setCustomHeight,
  format,
  setFormat,
  isLossless,
  isCompressing,
  onCompress,
  onDownload,
  onReset,
  singleFile,
  hasCompressedResult,
  enableCache,
  setEnableCache,
  applyToAll,
  setApplyToAll,
  totalFilesCount,
  downloadAll,
  setDownloadAll
}) => {
  const handlePresetSizeChange = (value: string) => {
    const preset = PRESET_SIZES.find(p => p.value === value);
    if (preset) {
      setCustomWidth(preset.width);
      setCustomHeight(preset.height);
    }
  };

  const intl = useIntl();
  const PRESET_SIZES = getPresetSizes(intl);
  
  // 查找当前尺寸是否匹配预设
  const getCurrentPreset = () => {
    if (!customWidth || !customHeight) return undefined;
    return PRESET_SIZES.find(p => p.width === customWidth && p.height === customHeight)?.value;
  };
  return (
    <ControlPanel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <FormattedMessage id="imageCompress.settings" defaultMessage="设置" />
        </Title>
        <Button 
          type="text" 
          icon={<DeleteOutlined />} 
          onClick={onReset} 
          danger
          style={{ borderRadius: 999 }}
        >
          <FormattedMessage id="imageCompress.clearAll" defaultMessage="清空全部" />
        </Button>
      </div>

      <StatsGrid>
        <StatItem>
          <span className="label">
            <FormattedMessage id="imageCompress.totalSavings" defaultMessage="节省空间" />
          </span>
          <span className="value" style={{ color: singleSavings >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {singleMeta.originalSize > 0 ? `${singleSavings.toFixed(1)}%` : '-'}
          </span>
        </StatItem>
        <StatItem>
          <span className="label">
            <FormattedMessage id="imageCompress.totalSize" defaultMessage="总大小" />
          </span>
          <span className="value">
            {singleMeta.originalSize > 0 ? formatSize(singleMeta.compressedSize) : '-'}
          </span>
        </StatItem>
      </StatsGrid>

      {!isLossless && (
        <PanelSection>
          <SectionTitle>
            <span>
              <FormattedMessage id="imageCompress.quality" defaultMessage="质量" />
            </span>
            <span>{Math.round(quality * 100)}%</span>
          </SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Slider
              style={{ flex: 1 }} min={0.01} max={1.0} step={0.01}
              value={quality} onChange={setQuality}
            />
            <InputNumber
              min={1} max={100} value={Math.round(quality * 100)}
              onChange={(val) => setQuality((val || 100) / 100)}
              formatter={value => `${value}%`}
              parser={value => value?.replace('%', '') as unknown as number}
              style={{ width: 70 }} size="small"
            />
          </div>
        </PanelSection>
      )}

      <PanelSection>
        <SectionTitle>
          <FormattedMessage id="imageCompress.resize" defaultMessage="尺寸调整" />
        </SectionTitle>
        <Segmented
          options={[
            { label: intl.formatMessage({ id: 'imageCompress.scalePercent', defaultMessage: '缩放百分比' }), value: 'scale', icon: <BgColorsOutlined /> },
            { label: intl.formatMessage({ id: 'imageCompress.customPx', defaultMessage: '自定义像素' }), value: 'custom', icon: <ColumnWidthOutlined /> }
          ]}
          value={resizeMode}
          onChange={setResizeMode}
          block
          style={{ marginBottom: 16 }}
        />
        {resizeMode === 'scale' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Slider
              style={{ flex: 1 }} min={10} max={100}
              value={scale} onChange={setScale}
            />
            <InputNumber
              min={10} max={100} value={scale}
              onChange={(val) => setScale(val ?? 100)}
              formatter={value => `${value}%`}
              style={{ width: 70 }} size="small"
            />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Select
              placeholder={intl.formatMessage({ id: 'imageCompress.presetSize', defaultMessage: '预设尺寸' })}
              value={getCurrentPreset()}
              onChange={handlePresetSizeChange}
              style={{ width: 200 }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ minWidth: 350 }}
              allowClear
              showSearch
              optionFilterProp="label"
              options={PRESET_SIZES.map(preset => ({
                label: `${preset.label} (${preset.width}×${preset.height})`,
                value: preset.value
              }))}
            />
            <InputNumber 
              prefix={<ColumnWidthOutlined style={{ color: '#999' }} />} 
              placeholder={intl.formatMessage({ id: 'imageCompress.width', defaultMessage: '宽度' })} 
              value={customWidth} 
              onChange={setCustomWidth} 
              style={{ width: 120 }} 
              min={1}
            />
            <InputNumber 
              prefix={<ColumnHeightOutlined style={{ color: '#999' }} />} 
              placeholder={intl.formatMessage({ id: 'imageCompress.height', defaultMessage: '高度' })} 
              value={customHeight} 
              onChange={setCustomHeight} 
              style={{ width: 120 }} 
              min={1}
            />
          </div>
        )}
      </PanelSection>

      <PanelSection>
        <SectionTitle>
          <FormattedMessage id="imageCompress.format" defaultMessage="格式" />
        </SectionTitle>
        <Select
          value={format} onChange={setFormat} style={{ width: '100%' }}
          options={[
            { value: 'auto', label: intl.formatMessage({ id: 'imageCompress.format.auto', defaultMessage: '自动（保持原格式）' }) },
            { value: 'jpeg', label: intl.formatMessage({ id: 'imageCompress.format.jpeg', defaultMessage: 'JPEG（照片）' }) },
            { value: 'png', label: intl.formatMessage({ id: 'imageCompress.format.png', defaultMessage: 'PNG（无损）' }) },
            { value: 'webp', label: intl.formatMessage({ id: 'imageCompress.format.webp', defaultMessage: 'WebP（最佳）' }) },
          ]}
        />
        {isLossless && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#faad14' }}>
            <FileImageOutlined /> <FormattedMessage id="imageCompress.pngLossless" defaultMessage="PNG 是无损格式。质量滑块已隐藏。" />
          </div>
        )}
      </PanelSection>

      {enableCache !== undefined && setEnableCache && (
        <PanelSection>
          <SectionTitle>
            <span>
              <FormattedMessage id="imageCompress.cacheSettings" defaultMessage="缓存设置" />
            </span>
            <Tooltip title={intl.formatMessage({ id: 'imageCompress.cacheTooltip', defaultMessage: '启用后，上传的图片将保存到浏览器缓存中，刷新页面后可恢复。' })}>
              <QuestionCircleOutlined style={{ fontSize: 12, color: '#888', cursor: 'help', marginLeft: 4 }} />
            </Tooltip>
          </SectionTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>
              <FormattedMessage id="imageCompress.saveToCache" defaultMessage="保存图片到浏览器缓存" />
            </span>
            <Switch checked={enableCache} onChange={setEnableCache} />
          </div>
        </PanelSection>
      )}

      {applyToAll !== undefined && setApplyToAll && totalFilesCount !== undefined && totalFilesCount > 1 && (
        <PanelSection>
          <SectionTitle>
            <span>
              <FormattedMessage id="imageCompress.batchProcessing" defaultMessage="批量处理" />
            </span>
            <Tooltip title={intl.formatMessage(
              { id: 'imageCompress.batchTooltip', defaultMessage: '启用后，将使用当前设置压缩所有 {count} 张图片。' },
              { count: totalFilesCount }
            )}>
              <QuestionCircleOutlined style={{ fontSize: 12, color: '#888', cursor: 'help', marginLeft: 4 }} />
            </Tooltip>
          </SectionTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>
              <FormattedMessage
                id="imageCompress.applyToAll"
                defaultMessage="应用设置到所有图片（{count}）"
                values={{ count: totalFilesCount }}
              />
            </span>
            <Switch checked={applyToAll} onChange={setApplyToAll} />
          </div>
        </PanelSection>
      )}

      <ActionFooter>
        <Button
          type="primary" block size="large"
          icon={isCompressing ? <LoadingOutlined /> : <CompressOutlined />}
          onClick={onCompress}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(131, 56, 236, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(131, 56, 236, 0.3)';
          }}
        >
          {isCompressing 
            ? (applyToAll && totalFilesCount 
                ? intl.formatMessage(
                    { id: 'imageCompress.compressAllProgress', defaultMessage: '正在压缩 {count} 张图片...' },
                    { count: totalFilesCount }
                  )
                : intl.formatMessage({ id: 'imageCompress.compressing', defaultMessage: '压缩中...' }))
            : (applyToAll && totalFilesCount 
                ? intl.formatMessage(
                    { id: 'imageCompress.compressAll', defaultMessage: '应用并压缩全部（{count}）' },
                    { count: totalFilesCount }
                  )
                : intl.formatMessage({ id: 'imageCompress.compress', defaultMessage: '应用并压缩' }))
          }
        </Button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {downloadAll !== undefined && setDownloadAll && totalFilesCount !== undefined && totalFilesCount > 1 && (
            <Checkbox
              checked={downloadAll}
              onChange={(e) => setDownloadAll(e.target.checked)}
              style={{ alignSelf: 'flex-start' }}
            >
              <FormattedMessage
                id="imageCompress.downloadAllCheckbox"
                defaultMessage="下载全部 {count} 张图片"
                values={{ count: totalFilesCount }}
              />
            </Checkbox>
          )}
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
            {downloadAll && totalFilesCount !== undefined && totalFilesCount > 1 
              ? intl.formatMessage(
                  { id: 'imageCompress.downloadAll', defaultMessage: '下载全部（{count}）' },
                  { count: totalFilesCount }
                )
              : intl.formatMessage({ id: 'imageCompress.download', defaultMessage: '下载图片' })}
          </Button>
        </div>
      </ActionFooter>
    </ControlPanel>
  );
};

export default CompressSettings;

