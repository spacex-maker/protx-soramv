import React, { useState, useEffect } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Position } from '@xyflow/react';
import { VideoPreviewSection, VideoCard, ResizeHandle, StyledHandle } from '../styles';
import { VideoResult, TaskItem } from '../types';

interface VideoPreviewProps {
  id: string;
  waitingTasks: TaskItem[];
  generatedVideo: VideoResult | null;
  videoCardSize: { width: number; height?: number };
  videoCardRef: React.RefObject<HTMLDivElement | null>;
  isResizing?: boolean;
  onResizeStart: (e: React.PointerEvent) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  id,
  waitingTasks,
  generatedVideo,
  videoCardSize,
  videoCardRef,
  isResizing = false,
  onResizeStart,
}) => {
  const [videoCardHeight, setVideoCardHeight] = useState<number>(videoCardSize.height || 200);

  // 监听视频卡片实际高度变化
  useEffect(() => {
    if (videoCardSize.height) {
      setVideoCardHeight(videoCardSize.height);
    } else if (videoCardRef.current) {
      // 如果没有设置高度，使用实际渲染高度
      const updateHeight = () => {
        if (videoCardRef.current) {
          const height = videoCardRef.current.offsetHeight;
          if (height > 0) {
            setVideoCardHeight(height);
          }
        }
      };
      
      updateHeight();
      
      // 监听视频加载完成
      const video = videoCardRef.current.querySelector('video');
      if (video) {
        video.addEventListener('loadedmetadata', updateHeight);
        return () => {
          video.removeEventListener('loadedmetadata', updateHeight);
        };
      }
    }
  }, [videoCardSize.height, videoCardSize.width, generatedVideo, videoCardRef]);

  if (waitingTasks.length === 0 && !generatedVideo) {
    return null;
  }

  // 计算视频卡片的位置和尺寸
  const videoCardTop = waitingTasks.length > 0 ? waitingTasks.length * 128 + 8 : 0;
  const videoCardCenterY = videoCardTop + videoCardHeight / 2;

  return (
    <VideoPreviewSection>
      {/* 显示生成的视频卡片 */}
      {generatedVideo && (
        <>
          <div style={{ 
            position: 'relative', 
            display: 'inline-block',
            marginTop: waitingTasks.length > 0 ? 8 : 0,
          }}>
            <VideoCard 
              ref={videoCardRef}
              className="nodrag"
              $width={videoCardSize.width}
              $height={videoCardSize.height}
              style={{ 
                position: 'relative',
                zIndex: waitingTasks.length,
              }}
            >
              <video
                src={generatedVideo.url}
                poster={generatedVideo.thumbnail}
                controls
                style={{ width: '100%', height: videoCardSize.height ? `${videoCardSize.height}px` : 'auto' }}
              />
            </VideoCard>
            <ResizeHandle
              onPointerDown={onResizeStart}
              $isResizing={isResizing}
              className="nodrag"
            />
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              href={generatedVideo.url}
              download="generated_video.mp4"
              className="nodrag"
              style={{ 
                position: 'absolute',
                left: 0,
                bottom: -28,
                fontSize: 11,
                color: '#1890ff',
                padding: '2px 6px',
                height: 'auto',
                pointerEvents: 'auto',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              下载
            </Button>
          </div>
          {/* 为视频卡片添加 Handle - 定位在视频卡片右侧边缘，Handle 中心对齐卡片右边缘 */}
          <StyledHandle
            type="source"
            position={Position.Right}
            id={`${id}-video`}
            style={{
              left: `${videoCardSize.width - 10}px`, // Handle 宽度 20px，中心在右边缘
              right: 'auto', // 覆盖样式中的 right: -6px
              top: `${videoCardCenterY}px`,
              transform: 'translateY(-50%)',
              zIndex: 10000,
              pointerEvents: 'auto',
            }}
          />
        </>
      )}
    </VideoPreviewSection>
  );
};

