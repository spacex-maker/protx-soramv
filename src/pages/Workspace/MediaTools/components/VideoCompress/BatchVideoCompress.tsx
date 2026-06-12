import React, { useState, useEffect } from 'react';
import { Button, Space, Tag, Typography, Upload, message } from 'antd';
import {
  CloudUploadOutlined,
  LockOutlined,
  ReloadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import {
  compressVideo,
  type VideoFileItem,
  type VideoCompressOptions,
  getVideoInfo,
  createVideoPreview,
  formatSize,
} from './utils';
import VideoCompare from './VideoCompare';
import VideoCompressSettings from './VideoCompressSettings';
import {
  createMediaToolUsageTimer,
  getFileExtension,
  logMediaToolUsage,
} from '../../utils/mediaToolUsageLog';

const { Dragger } = Upload;
const { Text, Title } = Typography;

const THEME_COLOR = '#1890ff';
const INPUT_FORMAT_TAGS = ['MP4', 'WebM', 'AVI', 'MOV', 'MKV', 'M4V'];

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
  background: linear-gradient(135deg, ${THEME_COLOR}, #096dd9);
  box-shadow: 0 8px 20px -6px rgba(24, 144, 255, 0.45);
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
  grid-template-columns: 1fr 360px;
  gap: 20px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
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
  display: flex;
  flex-direction: column;
`;

const SidePanel = styled(Panel)`
  display: flex;
  flex-direction: column;
`;

const StyledDragger = styled(Dragger)`
  &.ant-upload-wrapper .ant-upload-drag {
    border: 2px dashed ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.35)' : 'rgba(24, 144, 255, 0.25)'};
    border-radius: 16px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.06)' : 'rgba(24, 144, 255, 0.03)'};
    transition: all 0.25s ease;

    &:hover {
      border-color: ${THEME_COLOR};
      background: ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.12)' : 'rgba(24, 144, 255, 0.07)'};
    }

    .ant-upload-drag-icon .anticon {
      font-size: 44px;
      color: ${THEME_COLOR};
    }

    .ant-upload-text {
      font-size: 15px;
      font-weight: 500;
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

const FileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const FileIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${THEME_COLOR};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.15)' : 'rgba(24, 144, 255, 0.1)'};
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

const PreviewBlock = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8ecf1'};
  min-height: 320px;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
`;

const CompareWrapper = styled.div`
  flex: 1;
  min-height: 280px;
  max-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompareBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const PreviewHint = styled.div`
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
`;

interface VideoMeta {
  width: number;
  height: number;
  duration: number;
  originalSize: number;
  compressedSize: number;
}

const BatchVideoCompress: React.FC = () => {
  const intl = useIntl();
  const [videoFile, setVideoFile] = useState<VideoFileItem | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const [quality, setQuality] = useState(0.8);
  const [bitrate, setBitrate] = useState<string>('');
  const [resolution, setResolution] = useState<string>('');
  const [fps, setFps] = useState<number | undefined>(undefined);
  const [format, setFormat] = useState<'mp4' | 'webm' | 'avi'>('mp4');
  const [crf, setCrf] = useState(23);

  const handleReset = () => {
    if (videoFile?.preview) URL.revokeObjectURL(videoFile.preview);
    if (compressedPreview) URL.revokeObjectURL(compressedPreview);
    setVideoFile(null);
    setVideoMeta(null);
    setCompressedBlob(null);
    setCompressedPreview(null);
    setCompressionProgress(0);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      message.error(intl.formatMessage({
        id: 'videoCompress.message.invalidFile',
        defaultMessage: '请选择视频文件',
      }));
      return Upload.LIST_IGNORE;
    }

    try {
      if (videoFile?.preview) URL.revokeObjectURL(videoFile.preview);
      if (compressedPreview) URL.revokeObjectURL(compressedPreview);

      const preview = await createVideoPreview(file);
      const info = await getVideoInfo(file);

      const newVideo: VideoFileItem = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview,
        status: 'pending',
        originalSize: file.size,
      };

      setVideoFile(newVideo);
      setVideoMeta({
        ...info,
        originalSize: file.size,
        compressedSize: file.size,
      });
      setCompressedBlob(null);
      setCompressedPreview(null);
    } catch (error) {
      console.error('Failed to load video:', error);
      message.error(intl.formatMessage({
        id: 'videoCompress.message.loadFailed',
        defaultMessage: '加载视频失败',
      }));
    }

    return false;
  };

  const runCompress = async () => {
    if (!videoFile) return;

    setIsCompressing(true);
    setCompressionProgress(0);
    const elapsed = createMediaToolUsageTimer();

    try {
      const options: VideoCompressOptions = {
        quality,
        bitrate: bitrate || undefined,
        resolution: resolution || undefined,
        fps,
        format,
        crf,
      };

      const blob = await compressVideo(videoFile.file, options, (progress) => {
        setCompressionProgress(progress);
      });

      const newPreview = URL.createObjectURL(blob);
      setCompressedBlob(blob);
      setCompressedPreview(newPreview);

      if (videoMeta) {
        setVideoMeta({
          ...videoMeta,
          compressedSize: blob.size,
        });
      }

      message.success(intl.formatMessage({
        id: 'videoCompress.message.compressed',
        defaultMessage: '压缩成功！',
      }));

      logMediaToolUsage({
        toolCode: 'video_compress',
        action: 'process',
        inputFormat: getFileExtension(videoFile.file.name),
        outputFormat: format,
        inputSizeBytes: videoFile.file.size,
        outputSizeBytes: blob.size,
        durationMs: elapsed(),
        batchCount: 1,
        success: true,
        metadata: { quality, bitrate, resolution, fps, crf, format },
      });
    } catch (error) {
      console.error('Compression error:', error);
      logMediaToolUsage({
        toolCode: 'video_compress',
        action: 'process',
        inputFormat: getFileExtension(videoFile.file.name),
        outputFormat: format,
        inputSizeBytes: videoFile.file.size,
        durationMs: elapsed(),
        batchCount: 1,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'compress failed',
        metadata: { quality, bitrate, resolution, fps, crf, format },
      });
      message.error(intl.formatMessage({
        id: 'videoCompress.message.failed',
        defaultMessage: '压缩失败，请重试',
      }));
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !videoFile) return;

    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    const ext = format === 'mp4' ? 'mp4' : format === 'webm' ? 'webm' : 'avi';
    link.download = `compressed_${videoFile.file.name.split('.')[0]}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);

    message.success(intl.formatMessage({
      id: 'videoCompress.message.downloading',
      defaultMessage: '开始下载',
    }));

    logMediaToolUsage({
      toolCode: 'video_compress',
      action: 'download',
      inputFormat: getFileExtension(videoFile.file.name),
      outputFormat: format,
      inputSizeBytes: videoFile.file.size,
      outputSizeBytes: compressedBlob.size,
      batchCount: 1,
      success: true,
      metadata: { format },
    });
  };

  useEffect(() => {
    return () => {
      if (videoFile?.preview) URL.revokeObjectURL(videoFile.preview);
      if (compressedPreview) URL.revokeObjectURL(compressedPreview);
    };
  }, [videoFile, compressedPreview]);

  const singleSavings = videoMeta && videoMeta.originalSize > 0
    ? (1 - (videoMeta.compressedSize / videoMeta.originalSize)) * 100
    : 0;

  const inputExtLabel = videoFile
    ? (getFileExtension(videoFile.file.name).toUpperCase() || 'VIDEO')
    : '';

  return (
    <PageContainer>
      <PageHeader>
        <HeaderMain>
          <HeaderIcon>
            <VideoCameraOutlined />
          </HeaderIcon>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <FormattedMessage id="videoCompress.title" defaultMessage="视频压缩" />
            </Title>
            <Text type="secondary">
              <FormattedMessage id="videoCompress.subtitle" defaultMessage="浏览器端压缩，保护隐私" />
            </Text>
          </div>
        </HeaderMain>
        <PrivacyBadge>
          <LockOutlined />
          <FormattedMessage id="mediaTools.privacy.local" defaultMessage="本地处理，不上传服务器" />
        </PrivacyBadge>
      </PageHeader>

      <Workspace>
        <MainPanel>
          {!videoFile ? (
            <>
              <StyledDragger
                multiple={false}
                accept="video/*"
                beforeUpload={handleFileSelect}
                showUploadList={false}
                disabled={isCompressing}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined />
                </p>
                <p className="ant-upload-text">
                  <FormattedMessage id="videoCompress.uploadToStart" defaultMessage="拖拽视频文件到此处，或点击选择" />
                </p>
                <p className="ant-upload-hint">
                  <FormattedMessage id="videoCompress.uploadHint" defaultMessage="支持 MP4、WebM、AVI、MOV、MKV 等格式" />
                </p>
              </StyledDragger>
              <FormatTagRow>
                {INPUT_FORMAT_TAGS.map((tag) => (
                  <Tag key={tag} color="blue" bordered={false}>{tag}</Tag>
                ))}
              </FormatTagRow>
            </>
          ) : (
            <>
              <FileMeta>
                <FileIcon>
                  <VideoCameraOutlined />
                </FileIcon>
                <FileInfo>
                  <Text className="name" title={videoFile.file.name}>{videoFile.file.name}</Text>
                  <Space size={8} style={{ marginTop: 4 }}>
                    <Tag color="processing">{inputExtLabel}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatSize(videoFile.file.size)}</Text>
                    {videoMeta && (
                      <>
                        <Tag bordered={false}>{videoMeta.width}×{videoMeta.height}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>{Math.floor(videoMeta.duration)}s</Text>
                      </>
                    )}
                  </Space>
                </FileInfo>
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  disabled={isCompressing}
                  onClick={handleReset}
                >
                  <FormattedMessage id="videoCompress.changeFile" defaultMessage="更换" />
                </Button>
              </FileMeta>

              <PreviewBlock>
                {compressedPreview && videoMeta && (
                  <CompareBadge>
                    <Tag color="default">{formatSize(videoMeta.originalSize)}</Tag>
                    <Text type="secondary">→</Text>
                    <Tag color="green">{formatSize(videoMeta.compressedSize)}</Tag>
                    {singleSavings > 0 && (
                      <Tag color="success">-{singleSavings.toFixed(1)}%</Tag>
                    )}
                  </CompareBadge>
                )}

                <CompareWrapper>
                  <VideoCompare
                    originalVideo={videoFile.preview}
                    compressedVideo={compressedPreview}
                    originalSize={videoMeta?.originalSize || 0}
                    compressedSize={videoMeta?.compressedSize || 0}
                  />
                </CompareWrapper>

                {compressedPreview && (
                  <PreviewHint>
                    <FormattedMessage
                      id="videoCompress.compareHint"
                      defaultMessage="拖动滑块对比原视频与压缩后效果"
                    />
                  </PreviewHint>
                )}
              </PreviewBlock>
            </>
          )}
        </MainPanel>

        <SidePanel>
          <VideoCompressSettings
            singleSavings={singleSavings}
            singleMeta={videoMeta || { originalSize: 0, compressedSize: 0 }}
            quality={quality}
            setQuality={setQuality}
            bitrate={bitrate}
            setBitrate={setBitrate}
            resolution={resolution}
            setResolution={setResolution}
            fps={fps}
            setFps={setFps}
            format={format}
            setFormat={setFormat}
            crf={crf}
            setCrf={setCrf}
            isCompressing={isCompressing}
            compressionProgress={compressionProgress}
            onCompress={runCompress}
            onDownload={handleDownload}
            onReset={handleReset}
            singleFile={videoFile?.file || null}
            hasCompressedResult={!!compressedBlob}
            videoInfo={videoMeta ? {
              width: videoMeta.width,
              height: videoMeta.height,
              duration: videoMeta.duration,
            } : undefined}
          />
        </SidePanel>
      </Workspace>
    </PageContainer>
  );
};

export default BatchVideoCompress;
