import React, { useState, useEffect } from 'react';
import { Typography, message, Button, Progress } from 'antd';
import { InboxOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { 
  compressVideo, 
  type VideoFileItem, 
  type VideoCompressOptions,
  getVideoInfo,
  createVideoPreview,
  formatSize
} from './utils';
import VideoCompare from './VideoCompare';
import VideoCompressSettings from './VideoCompressSettings';

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
  height: 500px;
  max-height: 500px;
  width: 100%;
  padding-top: 0;
  flex-shrink: 0;
`;

const ProgressContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f8f9fa'};
  border-radius: 12px;
  width: 100%;
  flex-shrink: 0;
  z-index: 10;
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
  
  // 压缩设置
  const [quality, setQuality] = useState(0.8);
  const [bitrate, setBitrate] = useState<string>('');
  const [resolution, setResolution] = useState<string>('');
  const [fps, setFps] = useState<number | undefined>(undefined);
  const [format, setFormat] = useState<'mp4' | 'webm' | 'avi'>('mp4');
  const [crf, setCrf] = useState(23);

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      message.error(intl.formatMessage({ 
        id: 'videoCompress.message.invalidFile', 
        defaultMessage: '请选择视频文件' 
      }));
      return;
    }

    try {
      // 创建预览
      const preview = await createVideoPreview(file);
      
      // 获取视频信息
      const info = await getVideoInfo(file);
      
      const newVideo: VideoFileItem = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview,
        status: 'pending',
        originalSize: file.size
      };

      setVideoFile(newVideo);
      setVideoMeta({
        ...info,
        originalSize: file.size,
        compressedSize: file.size
      });
      setCompressedBlob(null);
      setCompressedPreview(null);
    } catch (error) {
      console.error('Failed to load video:', error);
      message.error(intl.formatMessage({ 
        id: 'videoCompress.message.loadFailed', 
        defaultMessage: '加载视频失败' 
      }));
    }

    // 重置 input
    e.target.value = '';
  };

  // 执行压缩
  const runCompress = async () => {
    if (!videoFile) return;

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const options: VideoCompressOptions = {
        quality,
        bitrate: bitrate || undefined,
        resolution: resolution || undefined,
        fps,
        format,
        crf
      };

      const blob = await compressVideo(
        videoFile.file,
        options,
        (progress) => {
          setCompressionProgress(progress);
        }
      );

      const newPreview = URL.createObjectURL(blob);
      
      setCompressedBlob(blob);
      setCompressedPreview(newPreview);
      
      if (videoMeta) {
        setVideoMeta({
          ...videoMeta,
          compressedSize: blob.size
        });
      }

      message.success(intl.formatMessage({ 
        id: 'videoCompress.message.compressed', 
        defaultMessage: '压缩成功！' 
      }));
    } catch (error) {
      console.error('Compression error:', error);
      message.error(intl.formatMessage({ 
        id: 'videoCompress.message.failed', 
        defaultMessage: '压缩失败，请重试' 
      }));
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  // 下载压缩后的视频
  const handleDownload = () => {
    if (!compressedBlob || !videoFile) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    const ext = format === 'mp4' ? 'mp4' : format === 'webm' ? 'webm' : 'avi';
    link.download = `compressed_${videoFile.file.name.split('.')[0]}.${ext}`;
    link.click();
    
    message.success(intl.formatMessage({ 
      id: 'videoCompress.message.downloading', 
      defaultMessage: '开始下载' 
    }));
  };

  // 重置
  const handleReset = () => {
    if (videoFile?.preview) {
      URL.revokeObjectURL(videoFile.preview);
    }
    if (compressedPreview) {
      URL.revokeObjectURL(compressedPreview);
    }
    setVideoFile(null);
    setVideoMeta(null);
    setCompressedBlob(null);
    setCompressedPreview(null);
    setCompressionProgress(0);
  };

  const singleSavings = videoMeta && videoMeta.originalSize > 0
    ? (1 - (videoMeta.compressedSize / videoMeta.originalSize)) * 100
    : 0;

  return (
    <Workspace>
      <LargePreviewArea>
        <UploadArea style={{ minHeight: videoFile ? '120px' : '200px', marginBottom: videoFile ? '16px' : '24px' }}>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
          />
          <InboxOutlined className="upload-icon" style={{ fontSize: videoFile ? '32px' : '48px' }} />
          <span className="upload-text" style={{ fontSize: videoFile ? '14px' : '16px' }}>
            {videoFile ? (
              <FormattedMessage id="videoCompress.uploadNew" defaultMessage="点击上传新视频" />
            ) : (
              <FormattedMessage id="videoCompress.uploadToStart" defaultMessage="上传视频开始压缩" />
            )}
          </span>
        </UploadArea>
        
        {videoFile && (
          <>
            <PreviewContent>
              <VideoCompare
                originalVideo={videoFile.preview}
                compressedVideo={compressedPreview}
                originalSize={videoMeta?.originalSize || 0}
                compressedSize={videoMeta?.compressedSize || 0}
              />
            </PreviewContent>
            
            {isCompressing && (
              <ProgressContainer>
                <Progress 
                  percent={compressionProgress} 
                  status="active"
                  format={(percent) => `${Math.round(percent || 0)}%`}
                />
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                  <FormattedMessage 
                    id="videoCompress.compressingProgress" 
                    defaultMessage="正在压缩视频，请稍候..." 
                  />
                </Text>
              </ProgressContainer>
            )}
          </>
        )}
      </LargePreviewArea>

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
        onCompress={runCompress}
        onDownload={handleDownload}
        onReset={handleReset}
        singleFile={videoFile?.file || null}
        hasCompressedResult={!!compressedBlob}
        videoInfo={videoMeta ? {
          width: videoMeta.width,
          height: videoMeta.height,
          duration: videoMeta.duration
        } : undefined}
      />
    </Workspace>
  );
};

export default BatchVideoCompress;

