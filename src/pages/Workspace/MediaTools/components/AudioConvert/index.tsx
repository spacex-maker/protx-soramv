import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Progress,
  Segmented,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  ArrowRightOutlined,
  CloudUploadOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  LockOutlined,
  ReloadOutlined,
  RetweetOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { initFFmpeg, formatSize, terminateFFmpegInstance } from '../VideoCompress/utils';
import {
  createMediaToolUsageTimer,
  logMediaToolUsage,
} from '../../utils/mediaToolUsageLog';
import SpeechGenerationMediaLibrary from '../shared/SpeechGenerationMediaLibrary';
import AudioWaveform from '../AudioCompress/AudioWaveform';

const { Dragger } = Upload;
const { Text, Title } = Typography;

type AudioBitrate = '128' | '192' | '256' | '320';
type AudioOutputFormat = 'mp3' | 'wav' | 'aac' | 'ogg' | 'flac';

const BITRATE_OPTIONS = [
  { label: '128k', value: '128' as AudioBitrate },
  { label: '192k', value: '192' as AudioBitrate },
  { label: '256k', value: '256' as AudioBitrate },
  { label: '320k', value: '320' as AudioBitrate },
];

const OUTPUT_FORMATS: Array<{
  value: AudioOutputFormat;
  label: string;
  desc: string;
  lossless?: boolean;
}> = [
  { value: 'mp3', label: 'MP3', desc: '通用兼容' },
  { value: 'wav', label: 'WAV', desc: '无损 PCM', lossless: true },
  { value: 'aac', label: 'AAC', desc: 'Apple / 流媒体' },
  { value: 'ogg', label: 'OGG', desc: '开源压缩' },
  { value: 'flac', label: 'FLAC', desc: '无损压缩', lossless: true },
];

const OUTPUT_EXT: Record<AudioOutputFormat, string> = {
  mp3: 'mp3',
  wav: 'wav',
  aac: 'm4a',
  ogg: 'ogg',
  flac: 'flac',
};

const OUTPUT_MIME: Record<AudioOutputFormat, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/mp4',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
};

const LOSSY_FORMATS: AudioOutputFormat[] = ['mp3', 'aac', 'ogg'];
const SUPPORTED_EXTENSIONS = ['flac', 'mp3', 'wav', 'aac', 'm4a', 'ogg', 'oga'];
const INPUT_FORMAT_TAGS = ['FLAC', 'MP3', 'WAV', 'AAC', 'M4A', 'OGG'];

const ACCEPT_TYPES = [
  '.flac', '.mp3', '.wav', '.aac', '.m4a', '.ogg', '.oga',
  'audio/flac', 'audio/x-flac', 'audio/mpeg', 'audio/mp3',
  'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4',
  'audio/ogg', 'audio/vorbis',
].join(',');

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.45s ease-out;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const HeaderMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const HeaderIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  background: linear-gradient(135deg, #8338ec, #5b21b6);
  box-shadow: 0 8px 20px -6px rgba(131, 56, 236, 0.45);
  flex-shrink: 0;
`;

const PrivacyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#86efac' : '#15803d'};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.1)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.2)'};
`;

const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Panel = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#eef0f3'};
  border-radius: 18px;
  padding: 20px;
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 4px 24px rgba(0, 0, 0, 0.2)'
    : '0 4px 24px rgba(15, 23, 42, 0.04)'};
`;

const MainPanel = styled(Panel)`
  min-height: 420px;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const SidePanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledDragger = styled(Dragger)`
  &.ant-upload-wrapper .ant-upload-drag {
    border: 2px dashed ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.35)' : 'rgba(131, 56, 236, 0.25)'};
    border-radius: 16px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.06)' : 'rgba(131, 56, 236, 0.03)'};
    transition: all 0.25s ease;

    &:hover {
      border-color: #8338ec;
      background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.12)' : 'rgba(131, 56, 236, 0.07)'};
    }

    .ant-upload-drag-icon {
      margin-bottom: 8px;

      .anticon {
        font-size: 44px;
        color: #8338ec;
      }
    }

    .ant-upload-text {
      font-size: 15px;
      font-weight: 500;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)'};
    }

    .ant-upload-hint {
      font-size: 13px;
    }
  }
`;

const FormatTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  justify-content: center;
`;

const FileCard = styled.div`
  margin-top: 20px;
  padding: 16px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8ecf1'};
  animation: ${fadeIn} 0.3s ease-out;
`;

const FileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
`;

const FileIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #8338ec;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.15)' : 'rgba(131, 56, 236, 0.1)'};
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;

  .name {
    display: block;
    font-weight: 600;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ConvertFlow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 16px 0 4px;
  padding: 12px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.08)' : 'rgba(24, 144, 255, 0.06)'};
  animation: ${fadeIn} 0.3s ease-out;
`;

const FlowArrow = styled.span`
  color: #8338ec;
  font-size: 16px;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  height: 40px;
  margin-bottom: 12px;
  border-radius: 8px;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'};
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
      ? '#8338ec'
      : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
  background: ${props =>
    props.$active
      ? props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.18)' : 'rgba(131, 56, 236, 0.08)'
      : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #8338ec;
  }

  .label {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$active ? '#8338ec' : 'inherit'};
  }

  .desc {
    font-size: 11px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
  }
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResultSection = styled.div`
  padding-top: 4px;
  border-top: 1px dashed ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
`;

const ResultBox = styled.div`
  padding: 14px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'};
  animation: ${fadeIn} 0.35s ease-out;
`;

const EmptyResult = styled.div`
  text-align: center;
  padding: 28px 16px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'};

  .icon {
    font-size: 36px;
    margin-bottom: 10px;
    opacity: 0.5;
  }
`;

const ProgressBox = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.08)' : 'rgba(24, 144, 255, 0.05)'};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const HintAlert = styled(Alert)`
  margin-top: 16px;
  border-radius: 12px;
`;

const getFileExtension = (file: File): string => {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

const normalizeExtension = (ext: string): string => {
  if (ext === 'm4a' || ext === 'aac') return 'aac';
  if (ext === 'oga') return 'ogg';
  return ext;
};

const isSupportedAudioFile = (file: File): boolean => {
  const ext = getFileExtension(file);
  if (SUPPORTED_EXTENSIONS.includes(ext)) return true;
  return file.type.startsWith('audio/');
};

const buildCommandArgs = (
  inputName: string,
  outputName: string,
  outputFormat: AudioOutputFormat,
  bitrate: AudioBitrate,
): string[] => {
  const args = ['-i', inputName];

  switch (outputFormat) {
    case 'mp3':
      args.push('-c:a', 'libmp3lame', '-b:a', `${bitrate}k`);
      break;
    case 'wav':
      args.push('-c:a', 'pcm_s16le');
      break;
    case 'aac':
      args.push('-c:a', 'aac', '-b:a', `${bitrate}k`);
      break;
    case 'ogg':
      args.push('-c:a', 'libvorbis', '-b:a', `${bitrate}k`);
      break;
    case 'flac':
      args.push('-c:a', 'flac');
      break;
  }

  args.push(outputName);
  return args;
};

const AudioConvert: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<AudioOutputFormat>('mp3');
  const [audioBitrate, setAudioBitrate] = useState<AudioBitrate>('192');
  const [convertProgress, setConvertProgress] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string>('');
  const [ffmpegHint, setFfmpegHint] = useState<string>('');
  const [isStopRequested, setIsStopRequested] = useState(false);
  const stopRequestedRef = useRef(false);
  const activeCpuFfmpegRef = useRef<FFmpeg | null>(null);

  const cpuInfo = useMemo(() => `${navigator.hardwareConcurrency || 'N/A'} 线程`, []);
  const showBitrateOption = LOSSY_FORMATS.includes(outputFormat);
  const inputExtLabel = sourceFile ? getFileExtension(sourceFile).toUpperCase() || 'AUDIO' : '';
  const outputExtLabel = OUTPUT_EXT[outputFormat].toUpperCase();

  const resetResult = () => {
    setOutputBlob(null);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl('');
    setConvertProgress(0);
  };

  const handleResetAll = () => {
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    resetResult();
    setSourceFile(null);
    setSourcePreview('');
    setFfmpegHint('');
  };

  const handleFileSelect = (file: File) => {
    if (!isSupportedAudioFile(file)) {
      message.error('请导入支持的音频文件（FLAC、MP3、WAV、AAC/M4A、OGG）');
      return Upload.LIST_IGNORE;
    }

    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    const previewUrl = URL.createObjectURL(file);
    setSourceFile(file);
    setSourcePreview(previewUrl);
    resetResult();
    return false;
  };

  const handleConvert = async () => {
    if (!sourceFile) {
      message.warning('请先导入音频文件');
      return;
    }

    const inputExt = normalizeExtension(getFileExtension(sourceFile));
    const targetExt = normalizeExtension(OUTPUT_EXT[outputFormat]);
    if (inputExt === targetExt) {
      message.warning('源文件与目标格式相同，无需转换');
      return;
    }

    setIsConverting(true);
    setIsStopRequested(false);
    stopRequestedRef.current = false;
    setConvertProgress(0);
    setFfmpegHint('');

    const inputExtRaw = getFileExtension(sourceFile) || 'audio';
    const outputExt = OUTPUT_EXT[outputFormat];
    const inputName = `input.${inputExtRaw}`;
    const outputName = `output.${outputExt}`;
    const elapsed = createMediaToolUsageTimer();

    try {
      setFfmpegHint(`正在本地转换：${inputExtRaw.toUpperCase()} → ${outputExt.toUpperCase()}（CPU ${cpuInfo}）`);
      const ffmpeg: FFmpeg = await initFFmpeg((progress) => {
        setConvertProgress(Math.max(1, Math.round(progress)));
      });
      activeCpuFfmpegRef.current = ffmpeg;

      await ffmpeg.writeFile(inputName, await fetchFile(sourceFile));
      await ffmpeg.exec(buildCommandArgs(inputName, outputName, outputFormat, audioBitrate));

      if (stopRequestedRef.current) {
        try {
          await ffmpeg.deleteFile(inputName);
          await ffmpeg.deleteFile(outputName);
        } catch (cleanupError) {
          console.warn('Cleanup after stop failed:', cleanupError);
        }
        throw new Error('Conversion stopped by user.');
      }

      const outputData = await ffmpeg.readFile(outputName);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      const mimeType = OUTPUT_MIME[outputFormat];
      const blob = outputData instanceof Uint8Array
        ? new Blob([outputData.buffer as ArrayBuffer], { type: mimeType })
        : new Blob([outputData], { type: mimeType });

      const url = URL.createObjectURL(blob);
      setOutputBlob(blob);
      setOutputUrl(url);
      setConvertProgress(100);
      message.success('音频转换完成');

      logMediaToolUsage({
        toolCode: 'audio_convert',
        action: 'process',
        inputFormat: inputExtRaw,
        outputFormat,
        inputSizeBytes: sourceFile.size,
        outputSizeBytes: blob.size,
        durationMs: elapsed(),
        batchCount: 1,
        success: true,
        metadata: { audioBitrate, outputExt },
      });
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('stopped by user'))) {
        console.error(error);
      }
      if (stopRequestedRef.current || (error instanceof Error && error.message.includes('stopped by user'))) {
        message.warning('已停止转换');
        logMediaToolUsage({
          toolCode: 'audio_convert',
          action: 'cancel',
          inputFormat: inputExtRaw,
          outputFormat,
          inputSizeBytes: sourceFile.size,
          durationMs: elapsed(),
          batchCount: 1,
          success: false,
          errorMessage: 'stopped by user',
        });
      } else {
        logMediaToolUsage({
          toolCode: 'audio_convert',
          action: 'process',
          inputFormat: inputExtRaw,
          outputFormat,
          inputSizeBytes: sourceFile.size,
          durationMs: elapsed(),
          batchCount: 1,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'convert failed',
          metadata: { audioBitrate, outputExt },
        });
        message.error(error instanceof Error ? error.message : '音频转换失败，请重试');
      }
    } finally {
      activeCpuFfmpegRef.current = null;
      setIsConverting(false);
      setIsStopRequested(false);
      stopRequestedRef.current = false;
    }
  };

  const handleStopConvert = () => {
    if (!isConverting) return;
    setIsStopRequested(true);
    stopRequestedRef.current = true;
    if (activeCpuFfmpegRef.current) {
      terminateFFmpegInstance();
    }
    setFfmpegHint('已取消当前转换任务。');
  };

  const getDownloadName = () => {
    const ext = OUTPUT_EXT[outputFormat];
    if (!sourceFile) return `converted-${Date.now()}.${ext}`;
    const baseName = sourceFile.name.replace(/\.[^.]+$/, '');
    return `${baseName}.${ext}`;
  };

  const outputFormatMeta = OUTPUT_FORMATS.find((f) => f.value === outputFormat);

  return (
    <PageContainer>
      <PageHeader>
        <HeaderMain>
          <HeaderIcon>
            <CustomerServiceOutlined />
          </HeaderIcon>
          <div>
            <Title level={4} style={{ margin: 0 }}>音频格式转换</Title>
            <Text type="secondary">浏览器内 FFmpeg 转码，支持多种常用格式互转</Text>
          </div>
        </HeaderMain>
        <PrivacyBadge>
          <LockOutlined />
          本地处理，不上传服务器
        </PrivacyBadge>
      </PageHeader>

      <Workspace>
        <MainPanel>
          <SpeechGenerationMediaLibrary
            disabled={isConverting}
            showOrUploadDivider={!sourceFile}
            onSelect={(file) => {
              handleFileSelect(file);
            }}
          />
          {!sourceFile ? (
            <>
              <StyledDragger
                multiple={false}
                accept={ACCEPT_TYPES}
                beforeUpload={handleFileSelect}
                showUploadList={false}
                disabled={isConverting}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined />
                </p>
                <p className="ant-upload-text">拖拽音频文件到此处，或点击选择</p>
                <p className="ant-upload-hint">单文件转换，最大受浏览器内存限制</p>
              </StyledDragger>
              <FormatTagRow>
                {INPUT_FORMAT_TAGS.map((tag) => (
                  <Tag key={tag} color="purple" bordered={false}>{tag}</Tag>
                ))}
              </FormatTagRow>
            </>
          ) : (
            <FileCard>
              <FileMeta>
                <FileIcon>
                  <CustomerServiceOutlined />
                </FileIcon>
                <FileInfo>
                  <Text className="name" title={sourceFile.name}>{sourceFile.name}</Text>
                  <Space size={8} style={{ marginTop: 4 }}>
                    <Tag color="blue">{inputExtLabel}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatSize(sourceFile.size)}</Text>
                  </Space>
                </FileInfo>
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  disabled={isConverting}
                  onClick={handleResetAll}
                >
                  更换
                </Button>
              </FileMeta>

              <ConvertFlow>
                <Tag color="processing">{inputExtLabel}</Tag>
                <FlowArrow><ArrowRightOutlined /></FlowArrow>
                <Tag color="purple">{outputExtLabel}</Tag>
              </ConvertFlow>

              <SectionTitle style={{ marginTop: 8 }}>源文件预览</SectionTitle>
              {sourcePreview && (
                <>
                  <AudioPlayer controls src={sourcePreview} />
                  <AudioWaveform
                    audioUrl={sourcePreview}
                    height={100}
                    barWidth={2}
                    gap={1}
                  />
                </>
              )}
            </FileCard>
          )}

          {ffmpegHint && (
            <HintAlert type="info" showIcon message={ffmpegHint} />
          )}
        </MainPanel>

        <SidePanel>
          <div>
            <SectionTitle>目标格式</SectionTitle>
            <FormatGrid>
              {OUTPUT_FORMATS.map((format) => (
                <FormatChip
                  key={format.value}
                  type="button"
                  $active={outputFormat === format.value}
                  $disabled={isConverting}
                  disabled={isConverting}
                  onClick={() => {
                    setOutputFormat(format.value);
                    resetResult();
                  }}
                >
                  <span className="label">
                    {format.label}
                    {format.lossless && (
                      <Tag color="green" bordered={false} style={{ marginLeft: 6, fontSize: 10, padding: '0 4px' }}>
                        无损
                      </Tag>
                    )}
                  </span>
                  <span className="desc">{format.desc}</span>
                </FormatChip>
              ))}
            </FormatGrid>
          </div>

          {showBitrateOption && (
            <div>
              <SectionTitle>音频比特率</SectionTitle>
              <Segmented
                block
                value={audioBitrate}
                options={BITRATE_OPTIONS}
                onChange={(value) => setAudioBitrate(value as AudioBitrate)}
                disabled={isConverting}
              />
            </div>
          )}

          <ActionGroup>
            <Button
              type="primary"
              size="large"
              icon={<RetweetOutlined />}
              loading={isConverting}
              disabled={!sourceFile}
              onClick={handleConvert}
              block
              style={{ height: 44, borderRadius: 10 }}
            >
              {isConverting ? '转换中…' : '开始转换'}
            </Button>
            <Space style={{ width: '100%' }}>
              <Button
                danger
                icon={<StopOutlined />}
                disabled={!isConverting || isStopRequested}
                onClick={handleStopConvert}
                block
              >
                停止
              </Button>
              <Button
                icon={<ReloadOutlined />}
                disabled={isConverting}
                onClick={handleResetAll}
                block
              >
                重置
              </Button>
            </Space>
          </ActionGroup>

          <ResultSection>
            <SectionTitle>转换结果</SectionTitle>

            {isConverting && (
              <ProgressBox>
                <Text style={{ display: 'block', marginBottom: 10 }}>正在转换，请稍候…</Text>
                <Progress percent={convertProgress} status="active" strokeColor="#8338ec" />
              </ProgressBox>
            )}

            {!isConverting && outputBlob && outputUrl && (
              <ResultBox>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#22c55e' }} />
                    <Text strong>转换成功</Text>
                    <Tag color="purple">{outputFormatMeta?.label}</Tag>
                  </Space>
                  <AudioPlayer controls src={outputUrl} />
                  <AudioWaveform
                    audioUrl={outputUrl}
                    height={100}
                    barWidth={2}
                    gap={1}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    文件大小：{formatSize(outputBlob.size)}
                  </Text>
                  <a href={outputUrl} download={getDownloadName()} style={{ display: 'block' }} onClick={() => {
                    if (sourceFile && outputBlob) {
                      logMediaToolUsage({
                        toolCode: 'audio_convert',
                        action: 'download',
                        inputFormat: getFileExtension(sourceFile),
                        outputFormat,
                        inputSizeBytes: sourceFile.size,
                        outputSizeBytes: outputBlob.size,
                        batchCount: 1,
                        success: true,
                        metadata: { audioBitrate },
                      });
                    }
                  }}>
                    <Button type="primary" icon={<DownloadOutlined />} block style={{ borderRadius: 10 }}>
                      下载 {outputFormatMeta?.label} 文件
                    </Button>
                  </a>
                </Space>
              </ResultBox>
            )}

            {!isConverting && !outputBlob && (
              <EmptyResult>
                <div className="icon"><RetweetOutlined /></div>
                <Text type="secondary">完成转换后可在此预览并下载</Text>
              </EmptyResult>
            )}
          </ResultSection>
        </SidePanel>
      </Workspace>
    </PageContainer>
  );
};

export default AudioConvert;
