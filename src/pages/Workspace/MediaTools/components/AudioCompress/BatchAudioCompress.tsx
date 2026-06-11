import React, { useState, useEffect } from 'react';
import { Typography, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { 
  compressAudio, 
  type AudioFileItem, 
  type AudioCompressOptions,
  getAudioInfo,
  createAudioPreview,
  formatSize
} from './utils';
import AudioCompressSettings from './AudioCompressSettings';
import AudioWaveform from './AudioWaveform';
import {
  createMediaToolUsageTimer,
  getFileExtension,
  logMediaToolUsage,
} from '../../utils/mediaToolUsageLog';

const { Text } = Typography;

const Workspace = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  width: 100%;
  height: calc(100vh - 240px);
  min-height: 650px;
  max-height: 900px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 380px;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
    max-height: none;
  }
`;

const LargePreviewArea = styled.div`
  position: relative;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#f0f2f5'};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 500px;
  height: 100%;
  
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
    min-height: 400px;
    margin-bottom: 24px;
  }
`;

const UploadArea = styled.label`
  width: 100%;
  min-height: 200px;
  border: 2px dashed ${props => props.theme.mode === 'dark' ? '#555' : '#d9d9d9'};
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fafafa'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
  
  &:hover {
    border-color: #8338ec;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.1)' : 'rgba(131, 56, 236, 0.05)'};
  }

  input {
    display: none;
  }

  .upload-icon {
    font-size: 48px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#999'};
    margin-bottom: 16px;
  }

  .upload-text {
    font-size: 16px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#999'};
  }
`;

const PreviewContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 300px;
  width: 100%;
  padding-top: 0;
  flex-shrink: 0;
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
  
  // 压缩设置状态
  const [bitrate, setBitrate] = useState<number | undefined>(128);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<'mp3' | 'ogg' | 'aac' | 'wav'>('mp3');
  const [sampleRate, setSampleRate] = useState<number | undefined>(44100);

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      message.error(intl.formatMessage({ 
        id: 'audioCompress.message.invalidFile', 
        defaultMessage: '请选择音频文件！' 
      }));
      return;
    }

    try {
      const preview = await createAudioPreview(file);
      const info = await getAudioInfo(file);
      
      const newFile: AudioFileItem = {
        id: Date.now().toString(),
        file,
        preview,
        status: 'pending',
        originalSize: file.size
      };

      setAudioFile(newFile);
      setAudioMeta({
        duration: info.duration,
        sampleRate: info.sampleRate,
        originalSize: file.size,
        compressedSize: file.size
      });
      setCompressedBlob(null);
      setCompressedPreview(null);
    } catch (error) {
      console.error('Error loading audio:', error);
      message.error(intl.formatMessage({ 
        id: 'audioCompress.message.loadError', 
        defaultMessage: '加载音频文件失败' 
      }));
    }
  };

  // 执行压缩
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
        sampleRate
      };

      const blob = await compressAudio(
        audioFile.file,
        options,
        (progress) => {
          setCompressionProgress(progress);
        }
      );

      const newPreview = URL.createObjectURL(blob);
      
      setCompressedBlob(blob);
      setCompressedPreview(newPreview);
      
      if (audioMeta) {
        setAudioMeta({
          ...audioMeta,
          compressedSize: blob.size
        });
      }

      message.success(intl.formatMessage({ 
        id: 'audioCompress.message.compressed', 
        defaultMessage: '压缩成功！' 
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
        defaultMessage: '压缩失败，请重试' 
      }));
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  // 下载压缩后的文件
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

  // 重置
  const handleReset = () => {
    setAudioFile(null);
    setAudioMeta(null);
    setCompressedBlob(null);
    if (compressedPreview) {
      URL.revokeObjectURL(compressedPreview);
    }
    setCompressedPreview(null);
    setCompressionProgress(0);
  };

  // 清理预览 URL
  useEffect(() => {
    return () => {
      if (audioFile?.preview) {
        URL.revokeObjectURL(audioFile.preview);
      }
      if (compressedPreview) {
        URL.revokeObjectURL(compressedPreview);
      }
    };
  }, [audioFile, compressedPreview]);

  const singleSavings = audioMeta && audioMeta.originalSize > 0
    ? (1 - (audioMeta.compressedSize / audioMeta.originalSize)) * 100
    : 0;

  return (
    <Workspace>
      <LargePreviewArea>
        <UploadArea style={{ minHeight: audioFile ? '120px' : '200px', marginBottom: audioFile ? '16px' : '24px' }}>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
          />
          <InboxOutlined className="upload-icon" style={{ fontSize: audioFile ? '32px' : '48px' }} />
          <span className="upload-text" style={{ fontSize: audioFile ? '14px' : '16px' }}>
            {audioFile ? (
              <FormattedMessage id="audioCompress.uploadNew" defaultMessage="点击上传新音频" />
            ) : (
              <FormattedMessage id="audioCompress.uploadToStart" defaultMessage="上传音频开始压缩" />
            )}
          </span>
        </UploadArea>
        
        {audioFile && (
          <PreviewContent>
            <div style={{ width: '100%' }}>
              <audio
                controls
                src={compressedPreview || audioFile.preview}
                style={{ width: '100%', maxWidth: '100%', marginBottom: 16 }}
              />
              <div style={{ marginBottom: 16 }}>
                <AudioWaveform
                  audioUrl={compressedPreview || audioFile.preview}
                  height={120}
                  barWidth={2}
                  gap={1}
                />
              </div>
              <div style={{ textAlign: 'center', fontSize: 14, color: '#888' }}>
                <Text>
                  {audioFile.file.name} · {formatSize(audioFile.file.size)}
                  {audioMeta && ` · ${Math.floor(audioMeta.duration)}s`}
                </Text>
              </div>
            </div>
          </PreviewContent>
        )}
      </LargePreviewArea>

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
          sampleRate: audioMeta.sampleRate
        } : undefined}
      />
    </Workspace>
  );
};

export default BatchAudioCompress;

