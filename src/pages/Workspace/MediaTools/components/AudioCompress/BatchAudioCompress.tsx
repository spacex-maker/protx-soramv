import React, { useState, useEffect } from 'react';
import { Button, Space, Tag, Typography, Upload, message } from 'antd';
import {
  CloudUploadOutlined,
  LockOutlined,
  ReloadOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import {
  compressAudio,
  type AudioFileItem,
  type AudioCompressOptions,
  getAudioInfo,
  createAudioPreview,
  formatSize,
} from './utils';
import AudioCompressSettings from './AudioCompressSettings';
import AudioWaveform from './AudioWaveform';
import {
  createMediaToolUsageTimer,
  getFileExtension,
  logMediaToolUsage,
} from '../../utils/mediaToolUsageLog';

const { Dragger } = Upload;
const { Text, Title } = Typography;

const THEME_COLOR = '#8338ec';
const INPUT_FORMAT_TAGS = ['MP3', 'WAV', 'AAC', 'FLAC', 'OGG', 'M4A'];

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
  background: linear-gradient(135deg, ${THEME_COLOR}, #5b21b6);
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
    border: 2px dashed ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.35)' : 'rgba(131, 56, 236, 0.25)'};
    border-radius: 16px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.06)' : 'rgba(131, 56, 236, 0.03)'};
    transition: all 0.25s ease;

    &:hover {
      border-color: ${THEME_COLOR};
      background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.12)' : 'rgba(131, 56, 236, 0.07)'};
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

const FileCard = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
`;

const FileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
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

const PreviewBlock = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8ecf1'};
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'};
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  height: 40px;
  margin-bottom: 12px;
`;

const CompareBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

interface AudioMeta {
  duration: number;
  sampleRate: number;
  originalSize: number;
  compressedSize: number;
}

const BatchAudioCompress: React.FC = () => {
  const intl = useIntl();
  const [audioFile, setAudioFile] = useState<AudioFileItem | null>(null);
  const [audioMeta, setAudioMeta] = useState<AudioMeta | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const [bitrate, setBitrate] = useState<number | undefined>(128);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<'mp3' | 'ogg' | 'aac' | 'wav'>('mp3');
  const [sampleRate, setSampleRate] = useState<number | undefined>(44100);

  const handleReset = () => {
    if (audioFile?.preview) URL.revokeObjectURL(audioFile.preview);
    if (compressedPreview) URL.revokeObjectURL(compressedPreview);
    setAudioFile(null);
    setAudioMeta(null);
    setCompressedBlob(null);
    setCompressedPreview(null);
    setCompressionProgress(0);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      message.error(intl.formatMessage({
        id: 'audioCompress.message.invalidFile',
        defaultMessage: '请选择音频文件！',
      }));
      return Upload.LIST_IGNORE;
    }

    try {
      if (audioFile?.preview) URL.revokeObjectURL(audioFile.preview);
      if (compressedPreview) URL.revokeObjectURL(compressedPreview);

      const preview = await createAudioPreview(file);
      const info = await getAudioInfo(file);

      const newFile: AudioFileItem = {
        id: Date.now().toString(),
        file,
        preview,
        status: 'pending',
        originalSize: file.size,
      };

      setAudioFile(newFile);
      setAudioMeta({
        duration: info.duration,
        sampleRate: info.sampleRate,
        originalSize: file.size,
        compressedSize: file.size,
      });
      setCompressedBlob(null);
      setCompressedPreview(null);
    } catch (error) {
      console.error('Error loading audio:', error);
      message.error(intl.formatMessage({
        id: 'audioCompress.message.loadError',
        defaultMessage: '加载音频文件失败',
      }));
    }

    return false;
  };

  const runCompress = async () => {
    if (!audioFile) return;

    setIsCompressing(true);
    setCompressionProgress(0);
    const elapsed = createMediaToolUsageTimer();

    try {
      const options: AudioCompressOptions = {
        bitrate,
        quality,
        format,
        sampleRate,
      };

      const blob = await compressAudio(audioFile.file, options, (progress) => {
        setCompressionProgress(progress);
      });

      const newPreview = URL.createObjectURL(blob);
      setCompressedBlob(blob);
      setCompressedPreview(newPreview);

      if (audioMeta) {
        setAudioMeta({
          ...audioMeta,
          compressedSize: blob.size,
        });
      }

      message.success(intl.formatMessage({
        id: 'audioCompress.message.compressed',
        defaultMessage: '压缩成功！',
      }));

      logMediaToolUsage({
        toolCode: 'audio_compress',
        action: 'process',
        inputFormat: getFileExtension(audioFile.file.name),
        outputFormat: format,
        inputSizeBytes: audioFile.file.size,
        outputSizeBytes: blob.size,
        durationMs: elapsed(),
        batchCount: 1,
        success: true,
        metadata: { bitrate, quality, sampleRate, format },
      });
    } catch (error) {
      console.error('Compression error:', error);
      logMediaToolUsage({
        toolCode: 'audio_compress',
        action: 'process',
        inputFormat: getFileExtension(audioFile.file.name),
        outputFormat: format,
        inputSizeBytes: audioFile.file.size,
        durationMs: elapsed(),
        batchCount: 1,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'compress failed',
        metadata: { bitrate, quality, sampleRate, format },
      });
      message.error(intl.formatMessage({
        id: 'audioCompress.message.failed',
        defaultMessage: '压缩失败，请重试',
      }));
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !audioFile) return;

    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audioFile.file.name.split('.')[0]}_compressed.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logMediaToolUsage({
      toolCode: 'audio_compress',
      action: 'download',
      inputFormat: getFileExtension(audioFile.file.name),
      outputFormat: format,
      inputSizeBytes: audioFile.file.size,
      outputSizeBytes: compressedBlob.size,
      batchCount: 1,
      success: true,
      metadata: { format },
    });
  };

  useEffect(() => {
    return () => {
      if (audioFile?.preview) URL.revokeObjectURL(audioFile.preview);
      if (compressedPreview) URL.revokeObjectURL(compressedPreview);
    };
  }, [audioFile, compressedPreview]);

  const singleSavings = audioMeta && audioMeta.originalSize > 0
    ? (1 - (audioMeta.compressedSize / audioMeta.originalSize)) * 100
    : 0;

  const inputExtLabel = audioFile
    ? (getFileExtension(audioFile.file.name).toUpperCase() || 'AUDIO')
    : '';
  const previewUrl = compressedPreview || audioFile?.preview;

  return (
    <PageContainer>
      <PageHeader>
        <HeaderMain>
          <HeaderIcon>
            <SoundOutlined />
          </HeaderIcon>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <FormattedMessage id="audioCompress.title" defaultMessage="音频压缩" />
            </Title>
            <Text type="secondary">
              <FormattedMessage id="audioCompress.subtitle" defaultMessage="智能压缩，保持音质" />
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
          {!audioFile ? (
            <>
              <StyledDragger
                multiple={false}
                accept="audio/*"
                beforeUpload={handleFileSelect}
                showUploadList={false}
                disabled={isCompressing}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined />
                </p>
                <p className="ant-upload-text">
                  <FormattedMessage id="audioCompress.uploadToStart" defaultMessage="拖拽音频文件到此处，或点击选择" />
                </p>
                <p className="ant-upload-hint">
                  <FormattedMessage id="audioCompress.uploadHint" defaultMessage="支持 MP3、WAV、AAC、FLAC、OGG 等格式" />
                </p>
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
                  <SoundOutlined />
                </FileIcon>
                <FileInfo>
                  <Text className="name" title={audioFile.file.name}>{audioFile.file.name}</Text>
                  <Space size={8} style={{ marginTop: 4 }}>
                    <Tag color="purple">{inputExtLabel}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatSize(audioFile.file.size)}</Text>
                    {audioMeta && (
                      <Text type="secondary" style={{ fontSize: 12 }}>{Math.floor(audioMeta.duration)}s</Text>
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
                  <FormattedMessage id="audioCompress.changeFile" defaultMessage="更换" />
                </Button>
              </FileMeta>

              <PreviewBlock>
                {compressedPreview && (
                  <CompareBadge>
                    <Tag color="default">{formatSize(audioMeta?.originalSize || 0)}</Tag>
                    <Text type="secondary">→</Text>
                    <Tag color="green">{formatSize(audioMeta?.compressedSize || 0)}</Tag>
                    {singleSavings > 0 && compressedBlob && (
                      <Tag color="success">-{singleSavings.toFixed(1)}%</Tag>
                    )}
                  </CompareBadge>
                )}

                <SectionTitle>
                  {compressedPreview
                    ? intl.formatMessage({ id: 'audioCompress.preview.compressed', defaultMessage: '压缩后预览' })
                    : intl.formatMessage({ id: 'audioCompress.preview.original', defaultMessage: '原始预览' })}
                </SectionTitle>

                {previewUrl && (
                  <>
                    <AudioPlayer controls src={previewUrl} />
                    <AudioWaveform
                      audioUrl={previewUrl}
                      height={100}
                      barWidth={2}
                      gap={1}
                    />
                  </>
                )}
              </PreviewBlock>
            </FileCard>
          )}
        </MainPanel>

        <SidePanel>
          <AudioCompressSettings
            singleSavings={singleSavings}
            singleMeta={audioMeta || { originalSize: 0, compressedSize: 0 }}
            bitrate={bitrate}
            setBitrate={setBitrate}
            quality={quality}
            setQuality={setQuality}
            format={format}
            setFormat={setFormat}
            sampleRate={sampleRate}
            setSampleRate={setSampleRate}
            isCompressing={isCompressing}
            compressionProgress={compressionProgress}
            onCompress={runCompress}
            onDownload={handleDownload}
            onReset={handleReset}
            singleFile={audioFile?.file || null}
            hasCompressedResult={!!compressedBlob}
            audioInfo={audioMeta ? {
              duration: audioMeta.duration,
              sampleRate: audioMeta.sampleRate,
            } : undefined}
          />
        </SidePanel>
      </Workspace>
    </PageContainer>
  );
};

export default BatchAudioCompress;
