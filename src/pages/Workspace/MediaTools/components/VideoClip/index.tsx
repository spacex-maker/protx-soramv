import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  InputNumber,
  Progress,
  Slider,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CloudUploadOutlined,
  DownloadOutlined,
  LockOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ScissorOutlined,
  StopOutlined,
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { FormattedMessage, useIntl } from 'react-intl';
import { initFFmpeg, formatSize, terminateFFmpegInstance } from '../VideoCompress/utils';
import {
  createMediaToolUsageTimer,
  getFileExtension,
  logMediaToolUsage,
} from '../../utils/mediaToolUsageLog';

const { Dragger } = Upload;
const { Text, Title } = Typography;

type VideoOutputFormat = 'mp4' | 'webm' | 'avi' | 'mov';

const THEME_COLOR = '#f97316';
const THEME_DARK = '#ea580c';

const OUTPUT_FORMATS: Array<{
  value: VideoOutputFormat;
  label: string;
  desc: string;
  codec?: string;
}> = [
  { value: 'mp4', label: 'MP4', desc: '通用兼容', codec: 'H.264 + AAC' },
  { value: 'webm', label: 'WebM', desc: '网页 / 开源', codec: 'VP9 + Opus' },
  { value: 'avi', label: 'AVI', desc: '经典容器', codec: 'H.264 + AAC' },
  { value: 'mov', label: 'MOV', desc: 'Apple / 剪辑', codec: 'H.264 + AAC' },
];

const SUPPORTED_EXTENSIONS = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'm4v'];
const INPUT_FORMAT_TAGS = ['MP4', 'WebM', 'AVI', 'MOV', 'MKV', 'M4V'];
const MIN_CLIP_SECONDS = 0.1;

const ACCEPT_TYPES = [
  '.mp4', '.webm', '.avi', '.mov', '.mkv', '.m4v',
  'video/mp4', 'video/webm', 'video/x-msvideo', 'video/quicktime',
  'video/x-matroska', 'video/x-m4v',
].join(',');

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
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
  background: linear-gradient(135deg, ${THEME_COLOR}, ${THEME_DARK});
  box-shadow: 0 8px 20px -6px rgba(249, 115, 22, 0.45);
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
    border: 2px dashed ${props => props.theme.mode === 'dark' ? 'rgba(249, 115, 22, 0.35)' : 'rgba(249, 115, 22, 0.25)'};
    border-radius: 16px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(249, 115, 22, 0.06)' : 'rgba(249, 115, 22, 0.03)'};
    transition: all 0.25s ease;

    &:hover {
      border-color: ${THEME_COLOR};
      background: ${props => props.theme.mode === 'dark' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(249, 115, 22, 0.07)'};
    }

    .ant-upload-drag-icon .anticon {
      font-size: 44px;
      color: ${THEME_COLOR};
    }
  }
`;

const FormatTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const FileCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.1)'};
  color: ${THEME_COLOR};
  font-size: 20px;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;

  .name {
    display: block;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'};
`;

const VideoPlayer = styled.video`
  width: 100%;
  max-height: 280px;
  border-radius: 12px;
  background: #000;
`;

const RangePanel = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#eef2f7'};
`;

const TimeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TimeField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const FormatChip = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${props => props.$active ? THEME_COLOR : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb'};
  background: ${props => props.$active
    ? props.theme.mode === 'dark' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(249, 115, 22, 0.08)'
    : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};
  text-align: left;
  transition: all 0.2s ease;

  .label {
    font-weight: 600;
    font-size: 13px;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#111827'};
  }

  .desc {
    font-size: 11px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
  }

  .codec {
    font-size: 10px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'};
    margin-top: 2px;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResultSection = styled.div`
  margin-top: auto;
`;

const ProgressBox = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc'};
`;

const ResultBox = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'};
`;

const EmptyResult = styled.div`
  padding: 28px 16px;
  text-align: center;
  border-radius: 12px;
  border: 1px dashed ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e5e7eb'};

  .icon {
    font-size: 28px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'};
    margin-bottom: 8px;
  }
`;

const HintAlert = styled(Alert)`
  margin-top: 16px;
`;

const isSupportedVideoFile = (file: File): boolean => {
  const ext = getFileExtension(file.name);
  if (ext && SUPPORTED_EXTENSIONS.includes(ext)) return true;
  return file.type.startsWith('video/');
};

const formatTimeLabel = (seconds: number): string => {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  const ms = Math.round((safe % 1) * 10);
  return `${m}:${String(s).padStart(2, '0')}.${ms}`;
};

const clampRange = (start: number, end: number, duration: number): [number, number] => {
  const maxEnd = Math.max(duration, MIN_CLIP_SECONDS);
  let nextStart = Math.max(0, Math.min(start, maxEnd - MIN_CLIP_SECONDS));
  let nextEnd = Math.max(nextStart + MIN_CLIP_SECONDS, Math.min(end, maxEnd));
  if (nextEnd - nextStart < MIN_CLIP_SECONDS) {
    nextEnd = Math.min(maxEnd, nextStart + MIN_CLIP_SECONDS);
  }
  return [nextStart, nextEnd];
};

const buildClipCommandArgs = (
  inputName: string,
  outputName: string,
  startSec: number,
  endSec: number,
  outputFormat: VideoOutputFormat,
): string[] => {
  const args = [
    '-i', inputName,
    '-ss', startSec.toFixed(3),
    '-to', endSec.toFixed(3),
  ];

  if (outputFormat === 'webm') {
    args.push('-c:v', 'libvpx-vp9', '-b:v', '1.2M', '-c:a', 'libopus');
  } else {
    args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac', '-b:a', '128k');
  }

  args.push(outputName);
  return args;
};

const VideoClip: React.FC = () => {
  const intl = useIntl();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState('');
  const [duration, setDuration] = useState(0);
  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [outputFormat, setOutputFormat] = useState<VideoOutputFormat>('mp4');
  const [clipProgress, setClipProgress] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState('');
  const [ffmpegHint, setFfmpegHint] = useState('');
  const [isStopRequested, setIsStopRequested] = useState(false);
  const stopRequestedRef = useRef(false);
  const activeCpuFfmpegRef = useRef<FFmpeg | null>(null);

  const cpuInfo = useMemo(() => `${navigator.hardwareConcurrency || 'N/A'} 线程`, []);
  const inputExtLabel = sourceFile ? (getFileExtension(sourceFile.name).toUpperCase() || 'VIDEO') : '';
  const clipDuration = Math.max(0, clipRange[1] - clipRange[0]);
  const outputFormatMeta = OUTPUT_FORMATS.find((f) => f.value === outputFormat);

  const resetResult = () => {
    setOutputBlob(null);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl('');
    setClipProgress(0);
  };

  const handleResetAll = () => {
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    resetResult();
    setSourceFile(null);
    setSourcePreview('');
    setDuration(0);
    setClipRange([0, 0]);
    setFfmpegHint('');
  };

  const applyDuration = (nextDuration: number) => {
    const safeDuration = Number.isFinite(nextDuration) && nextDuration > 0 ? nextDuration : 0;
    setDuration(safeDuration);
    if (safeDuration > 0) {
      setClipRange([0, safeDuration]);
    } else {
      setClipRange([0, 0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!isSupportedVideoFile(file)) {
      message.error(intl.formatMessage({
        id: 'videoClip.message.invalidFile',
        defaultMessage: '请导入支持的视频文件（MP4、WebM、AVI、MOV、MKV、M4V）',
      }));
      return Upload.LIST_IGNORE;
    }

    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    const previewUrl = URL.createObjectURL(file);
    setSourceFile(file);
    setSourcePreview(previewUrl);
    resetResult();
    setDuration(0);
    setClipRange([0, 0]);
    return false;
  };

  useEffect(() => {
    if (!sourcePreview) return undefined;

    const video = document.createElement('video');
    const handleLoaded = () => applyDuration(video.duration);
    const handleError = () => {
      message.error(intl.formatMessage({
        id: 'videoClip.message.loadError',
        defaultMessage: '加载视频时长失败',
      }));
    };

    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('error', handleError);
    video.src = sourcePreview;

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('error', handleError);
    };
  }, [sourcePreview, intl]);

  const handleRangeChange = (value: number | number[]) => {
    if (!Array.isArray(value) || value.length !== 2) return;
    setClipRange(clampRange(value[0], value[1], duration));
    resetResult();
  };

  const handleStartChange = (value: number | null) => {
    if (value == null) return;
    setClipRange(clampRange(value, clipRange[1], duration));
    resetResult();
  };

  const handleEndChange = (value: number | null) => {
    if (value == null) return;
    setClipRange(clampRange(clipRange[0], value, duration));
    resetResult();
  };

  const handlePreviewSelection = () => {
    const video = previewVideoRef.current;
    if (!video || duration <= 0) return;
    video.currentTime = clipRange[0];
    video.play().catch(() => {
      message.warning(intl.formatMessage({
        id: 'videoClip.message.previewFailed',
        defaultMessage: '无法播放预览，请检查浏览器权限',
      }));
    });
  };

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return undefined;

    const handleTimeUpdate = () => {
      if (video.currentTime >= clipRange[1]) {
        video.pause();
        video.currentTime = clipRange[0];
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [clipRange]);

  const handleClip = async () => {
    if (!sourceFile) {
      message.warning(intl.formatMessage({
        id: 'videoClip.message.noFile',
        defaultMessage: '请先导入视频文件',
      }));
      return;
    }

    if (duration <= 0 || clipDuration < MIN_CLIP_SECONDS) {
      message.warning(intl.formatMessage({
        id: 'videoClip.message.invalidRange',
        defaultMessage: '请选择有效的剪辑区间',
      }));
      return;
    }

    setIsClipping(true);
    setIsStopRequested(false);
    stopRequestedRef.current = false;
    setClipProgress(0);
    setFfmpegHint('');

    const inputExtRaw = getFileExtension(sourceFile.name) || 'mp4';
    const outputName = `output.${outputFormat}`;
    const inputName = `input.${inputExtRaw}`;
    const elapsed = createMediaToolUsageTimer();

    try {
      setFfmpegHint(
        intl.formatMessage(
          {
            id: 'videoClip.hint.processing',
            defaultMessage: '正在本地剪辑：{start} - {end}（CPU {cpu}）',
          },
          {
            start: formatTimeLabel(clipRange[0]),
            end: formatTimeLabel(clipRange[1]),
            cpu: cpuInfo,
          },
        ),
      );

      const ffmpeg: FFmpeg = await initFFmpeg((progress) => {
        setClipProgress(Math.max(1, Math.round(progress)));
      });
      activeCpuFfmpegRef.current = ffmpeg;

      await ffmpeg.writeFile(inputName, await fetchFile(sourceFile));
      await ffmpeg.exec(buildClipCommandArgs(
        inputName,
        outputName,
        clipRange[0],
        clipRange[1],
        outputFormat,
      ));

      if (stopRequestedRef.current) {
        try {
          await ffmpeg.deleteFile(inputName);
          await ffmpeg.deleteFile(outputName);
        } catch (cleanupError) {
          console.warn('Cleanup after stop failed:', cleanupError);
        }
        throw new Error('Clip stopped by user.');
      }

      const outputData = await ffmpeg.readFile(outputName);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      const mimeType = `video/${outputFormat}`;
      const blob = outputData instanceof Uint8Array
        ? new Blob([outputData.buffer as ArrayBuffer], { type: mimeType })
        : new Blob([outputData], { type: mimeType });

      const url = URL.createObjectURL(blob);
      setOutputBlob(blob);
      setOutputUrl(url);
      setClipProgress(100);
      message.success(intl.formatMessage({
        id: 'videoClip.message.clipped',
        defaultMessage: '剪辑成功！',
      }));

      logMediaToolUsage({
        toolCode: 'video_clip',
        action: 'process',
        inputFormat: inputExtRaw,
        outputFormat,
        inputSizeBytes: sourceFile.size,
        outputSizeBytes: blob.size,
        durationMs: elapsed(),
        batchCount: 1,
        success: true,
        metadata: {
          outputFormat,
          clipStartSec: clipRange[0],
          clipEndSec: clipRange[1],
          clipDurationSec: clipDuration,
        },
      });
    } catch (error) {
      if (stopRequestedRef.current || (error instanceof Error && error.message.includes('stopped by user'))) {
        message.warning(intl.formatMessage({
          id: 'videoClip.message.stopped',
          defaultMessage: '已停止剪辑',
        }));
        logMediaToolUsage({
          toolCode: 'video_clip',
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
          toolCode: 'video_clip',
          action: 'process',
          inputFormat: inputExtRaw,
          outputFormat,
          inputSizeBytes: sourceFile.size,
          durationMs: elapsed(),
          batchCount: 1,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'clip failed',
          metadata: { outputFormat },
        });
        message.error(intl.formatMessage({
          id: 'videoClip.message.failed',
          defaultMessage: '剪辑失败，请重试',
        }));
      }
    } finally {
      activeCpuFfmpegRef.current = null;
      setIsClipping(false);
      setIsStopRequested(false);
      stopRequestedRef.current = false;
    }
  };

  const handleStopClip = () => {
    if (!isClipping) return;
    setIsStopRequested(true);
    stopRequestedRef.current = true;
    if (activeCpuFfmpegRef.current) {
      terminateFFmpegInstance();
    }
    setFfmpegHint(intl.formatMessage({
      id: 'videoClip.message.cancelled',
      defaultMessage: '已取消当前剪辑任务。',
    }));
  };

  const getDownloadName = () => {
    if (!sourceFile) return `clip-${Date.now()}.${outputFormat}`;
    const baseName = sourceFile.name.replace(/\.[^.]+$/, '');
    return `${baseName}-clip.${outputFormat}`;
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderMain>
          <HeaderIcon>
            <ScissorOutlined />
          </HeaderIcon>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <FormattedMessage id="videoClip.title" defaultMessage="视频剪辑" />
            </Title>
            <Text type="secondary">
              <FormattedMessage id="videoClip.subtitle" defaultMessage="精确裁剪视频片段，浏览器本地处理" />
            </Text>
          </div>
        </HeaderMain>
        <PrivacyBadge>
          <LockOutlined />
          <FormattedMessage id="videoClip.privacy" defaultMessage="本地处理，不上传服务器" />
        </PrivacyBadge>
      </PageHeader>

      <Workspace>
        <MainPanel>
          {!sourceFile ? (
            <>
              <StyledDragger
                multiple={false}
                accept={ACCEPT_TYPES}
                beforeUpload={handleFileSelect}
                showUploadList={false}
                disabled={isClipping}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined />
                </p>
                <p className="ant-upload-text">
                  <FormattedMessage id="videoClip.uploadToStart" defaultMessage="拖拽视频文件到此处，或点击选择" />
                </p>
                <p className="ant-upload-hint">
                  <FormattedMessage id="videoClip.uploadHint" defaultMessage="支持 MP4、WebM、AVI、MOV、MKV、M4V 等格式" />
                </p>
              </StyledDragger>
              <FormatTagRow>
                {INPUT_FORMAT_TAGS.map((tag) => (
                  <Tag key={tag} color="orange" bordered={false}>{tag}</Tag>
                ))}
              </FormatTagRow>
            </>
          ) : (
            <FileCard>
              <FileMeta>
                <FileIcon>
                  <ScissorOutlined />
                </FileIcon>
                <FileInfo>
                  <Text className="name" title={sourceFile.name}>{sourceFile.name}</Text>
                  <Space size={8} style={{ marginTop: 4 }}>
                    <Tag color="orange">{inputExtLabel}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatSize(sourceFile.size)}</Text>
                    {duration > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatTimeLabel(duration)}
                      </Text>
                    )}
                  </Space>
                </FileInfo>
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  disabled={isClipping}
                  onClick={handleResetAll}
                >
                  <FormattedMessage id="videoClip.changeFile" defaultMessage="更换" />
                </Button>
              </FileMeta>

              <SectionTitle>
                <FormattedMessage id="videoClip.sourcePreview" defaultMessage="源视频预览" />
              </SectionTitle>
              {sourcePreview && (
                <VideoPlayer controls src={sourcePreview} ref={previewVideoRef} />
              )}

              {duration > 0 && (
                <RangePanel>
                  <SectionTitle style={{ marginBottom: 4 }}>
                    <FormattedMessage id="videoClip.range" defaultMessage="剪辑区间" />
                  </SectionTitle>
                  <Slider
                    range
                    min={0}
                    max={duration}
                    step={0.1}
                    value={clipRange}
                    onChange={handleRangeChange}
                    disabled={isClipping}
                    tooltip={{ formatter: (value) => formatTimeLabel(value || 0) }}
                  />
                  <TimeRow>
                    <TimeField>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <FormattedMessage id="videoClip.start" defaultMessage="开始" />
                      </Text>
                      <InputNumber
                        min={0}
                        max={Math.max(0, clipRange[1] - MIN_CLIP_SECONDS)}
                        step={0.1}
                        value={clipRange[0]}
                        onChange={handleStartChange}
                        disabled={isClipping}
                        style={{ width: '100%' }}
                      />
                    </TimeField>
                    <TimeField>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <FormattedMessage id="videoClip.end" defaultMessage="结束" />
                      </Text>
                      <InputNumber
                        min={clipRange[0] + MIN_CLIP_SECONDS}
                        max={duration}
                        step={0.1}
                        value={clipRange[1]}
                        onChange={handleEndChange}
                        disabled={isClipping}
                        style={{ width: '100%' }}
                      />
                    </TimeField>
                    <TimeField>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <FormattedMessage id="videoClip.duration" defaultMessage="片段时长" />
                      </Text>
                      <InputNumber
                        value={Number(clipDuration.toFixed(1))}
                        disabled
                        style={{ width: '100%' }}
                      />
                    </TimeField>
                  </TimeRow>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={handlePreviewSelection}
                    disabled={isClipping || clipDuration < MIN_CLIP_SECONDS}
                    style={{ marginTop: 12 }}
                  >
                    <FormattedMessage id="videoClip.previewSelection" defaultMessage="预览选区" />
                  </Button>
                </RangePanel>
              )}
            </FileCard>
          )}

          {ffmpegHint && (
            <HintAlert type="info" showIcon message={ffmpegHint} />
          )}
        </MainPanel>

        <SidePanel>
          <div>
            <SectionTitle>
              <FormattedMessage id="videoClip.outputFormat" defaultMessage="输出格式" />
            </SectionTitle>
            <FormatGrid>
              {OUTPUT_FORMATS.map((format) => (
                <FormatChip
                  key={format.value}
                  type="button"
                  $active={outputFormat === format.value}
                  $disabled={isClipping}
                  disabled={isClipping}
                  onClick={() => {
                    setOutputFormat(format.value);
                    resetResult();
                  }}
                >
                  <span className="label">{format.label}</span>
                  <span className="desc">{format.desc}</span>
                  {format.codec && <span className="codec">{format.codec}</span>}
                </FormatChip>
              ))}
            </FormatGrid>
          </div>

          <ActionGroup>
            <Button
              type="primary"
              size="large"
              icon={<ScissorOutlined />}
              loading={isClipping}
              disabled={!sourceFile || duration <= 0}
              onClick={handleClip}
              block
              style={{ height: 44, borderRadius: 10 }}
            >
              {isClipping
                ? intl.formatMessage({ id: 'videoClip.clipping', defaultMessage: '剪辑中…' })
                : intl.formatMessage({ id: 'videoClip.clip', defaultMessage: '开始剪辑' })}
            </Button>
            <Space style={{ width: '100%' }}>
              <Button
                danger
                icon={<StopOutlined />}
                disabled={!isClipping || isStopRequested}
                onClick={handleStopClip}
                block
              >
                <FormattedMessage id="videoClip.stop" defaultMessage="停止" />
              </Button>
              <Button
                icon={<ReloadOutlined />}
                disabled={isClipping}
                onClick={handleResetAll}
                block
              >
                <FormattedMessage id="videoClip.reset" defaultMessage="重置" />
              </Button>
            </Space>
          </ActionGroup>

          <ResultSection>
            <SectionTitle>
              <FormattedMessage id="videoClip.result" defaultMessage="剪辑结果" />
            </SectionTitle>

            {isClipping && (
              <ProgressBox>
                <Text style={{ display: 'block', marginBottom: 10 }}>
                  <FormattedMessage id="videoClip.processing" defaultMessage="正在剪辑，请稍候…" />
                </Text>
                <Progress percent={clipProgress} status="active" strokeColor={THEME_COLOR} />
              </ProgressBox>
            )}

            {!isClipping && outputBlob && outputUrl && (
              <ResultBox>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#22c55e' }} />
                    <Text strong>
                      <FormattedMessage id="videoClip.success" defaultMessage="剪辑成功" />
                    </Text>
                    <Tag color="orange">{outputFormatMeta?.label}</Tag>
                  </Space>
                  <VideoPlayer controls src={outputUrl} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <FormattedMessage
                      id="videoClip.fileSize"
                      defaultMessage="文件大小：{size}"
                      values={{ size: formatSize(outputBlob.size) }}
                    />
                  </Text>
                  <a
                    href={outputUrl}
                    download={getDownloadName()}
                    style={{ display: 'block' }}
                    onClick={() => {
                      if (sourceFile && outputBlob) {
                        logMediaToolUsage({
                          toolCode: 'video_clip',
                          action: 'download',
                          inputFormat: getFileExtension(sourceFile.name),
                          outputFormat,
                          inputSizeBytes: sourceFile.size,
                          outputSizeBytes: outputBlob.size,
                          batchCount: 1,
                          success: true,
                          metadata: { clipDurationSec: clipDuration },
                        });
                      }
                    }}
                  >
                    <Button type="primary" icon={<DownloadOutlined />} block style={{ borderRadius: 10 }}>
                      <FormattedMessage id="videoClip.download" defaultMessage="下载剪辑结果" />
                    </Button>
                  </a>
                </Space>
              </ResultBox>
            )}

            {!isClipping && !outputBlob && (
              <EmptyResult>
                <div className="icon"><ScissorOutlined /></div>
                <Text type="secondary">
                  <FormattedMessage id="videoClip.emptyResult" defaultMessage="完成剪辑后可在此预览并下载" />
                </Text>
              </EmptyResult>
            )}
          </ResultSection>
        </SidePanel>
      </Workspace>
    </PageContainer>
  );
};

export default VideoClip;
