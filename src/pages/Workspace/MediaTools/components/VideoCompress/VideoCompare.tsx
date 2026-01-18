import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { formatSize } from './utils';

// 样式组件
interface OverlayVideoProps {
  $width: number;
  $containerWidth: number;
  $containerHeight: number;
}

interface SliderHandleProps {
  $left: number;
}

const CompareContainer = styled.div`
  position: relative;
  max-width: 100%;
  height: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  z-index: 1;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  background: transparent;

  video {
    width: auto;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    display: block;
    border-radius: 8px;
    object-fit: contain;
  }
`;

const OverlayVideo = styled.div<OverlayVideoProps>`
  position: absolute;
  top: 0;
  left: 0;
  height: ${props => props.$containerHeight > 0 ? `${props.$containerHeight}px` : '100%'};
  width: ${props => props.$width}%;
  overflow: hidden;
  border-right: 2px solid #fff;
  background: transparent;
  border-radius: 8px 0 0 8px;
  clip-path: inset(0 0 50px 0);
  pointer-events: none;

  video {
    width: ${props => props.$containerWidth}px;
    height: ${props => props.$containerHeight}px;
    max-width: none;
    max-height: none;
    object-fit: contain;
    display: block;
    border-radius: 8px 0 0 8px;
    pointer-events: none;
  }
`;

const SliderHandle = styled.div<SliderHandleProps>`
  position: absolute;
  top: 50%;
  left: ${props => props.$left}%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  z-index: 10;
  color: #333;

  &::after {
    content: '';
    position: absolute;
    top: -100vh;
    bottom: -100vh;
    left: 50%;
    width: 2px;
    background: rgba(255,255,255,0.5);
    transform: translateX(-50%);
    pointer-events: none;
    z-index: -1;
  }
`;

const CompareWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const LabelBadge = styled.div`
  padding: 6px 12px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 12px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  max-width: 100%;
  &.original { align-self: flex-start; }
  &.compressed { align-self: flex-end; }
  
  @media (min-width: 640px) {
    white-space: nowrap;
  }
  
  @media (max-width: 640px) {
    align-self: stretch !important;
  }
`;

export interface VideoCompareProps {
  originalVideo: string;
  compressedVideo: string | null;
  originalSize: number;
  compressedSize: number;
}

const VideoCompare: React.FC<VideoCompareProps> = ({
  originalVideo,
  compressedVideo,
  originalSize,
  compressedSize
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const [containerDim, setContainerDim] = useState({ w: 0, h: 0 });

  const updateVideoDimensions = () => {
    if (backgroundVideoRef.current) {
      const video = backgroundVideoRef.current;
      const actualWidth = video.clientWidth || video.offsetWidth || video.videoWidth;
      const actualHeight = video.clientHeight || video.offsetHeight || video.videoHeight;
      
      if (actualWidth > 0 && actualHeight > 0) {
        setContainerDim({ w: actualWidth, h: actualHeight });
      }
    }
  };

  // 同步两个视频的播放状态
  useEffect(() => {
    const bgVideo = backgroundVideoRef.current;
    const origVideo = originalVideoRef.current;
    
    if (!bgVideo || !origVideo) return;

    const syncVideos = () => {
      if (bgVideo.paused) {
        origVideo.pause();
      } else {
        origVideo.play().catch(() => {});
      }
      
      // 同步播放时间
      if (Math.abs(bgVideo.currentTime - origVideo.currentTime) > 0.1) {
        origVideo.currentTime = bgVideo.currentTime;
      }
    };

    const syncOnPlay = () => {
      origVideo.play().catch(() => {});
    };

    const syncOnPause = () => {
      origVideo.pause();
    };

    const syncOnTimeUpdate = () => {
      if (Math.abs(bgVideo.currentTime - origVideo.currentTime) > 0.1) {
        origVideo.currentTime = bgVideo.currentTime;
      }
    };

    const syncOnSeeked = () => {
      origVideo.currentTime = bgVideo.currentTime;
    };

    bgVideo.addEventListener('play', syncOnPlay);
    bgVideo.addEventListener('pause', syncOnPause);
    bgVideo.addEventListener('timeupdate', syncOnTimeUpdate);
    bgVideo.addEventListener('seeked', syncOnSeeked);

    // 定期同步
    const syncInterval = setInterval(syncVideos, 100);

    return () => {
      bgVideo.removeEventListener('play', syncOnPlay);
      bgVideo.removeEventListener('pause', syncOnPause);
      bgVideo.removeEventListener('timeupdate', syncOnTimeUpdate);
      bgVideo.removeEventListener('seeked', syncOnSeeked);
      clearInterval(syncInterval);
    };
  }, [compressedVideo]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    // 如果点击的是视频控件（controls），不触发滑动条移动
    const target = e.target as HTMLElement;
    if (target.tagName === 'VIDEO' || target.closest('video')) {
      // 检查点击位置是否在视频控件区域内（通常是底部）
      const rect = containerRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const videoRect = target.getBoundingClientRect();
      const videoHeight = videoRect.height;
      const containerHeight = rect.height;
      
      // 如果点击在视频控件区域（底部约 20%），不移动滑动条
      if (clickY > containerHeight * 0.8) {
        return;
      }
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  useEffect(() => {
    updateVideoDimensions();
    
    const handleResize = () => {
      updateVideoDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateVideoDimensions();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [originalVideo, compressedVideo]);

  // 如果没有压缩后的视频，只显示原始视频
  if (!compressedVideo) {
    return (
      <CompareWrapper>
        <LabelContainer>
          <LabelBadge className="original">
            <FormattedMessage id="videoCompress.original" defaultMessage="原视频" /> ({formatSize(originalSize)})
          </LabelBadge>
        </LabelContainer>
        <CompareContainer ref={containerRef}>
          <video
            ref={backgroundVideoRef}
            src={originalVideo}
            controls
            onLoadedMetadata={updateVideoDimensions}
            style={{ width: '100%', height: '100%' }}
          />
        </CompareContainer>
      </CompareWrapper>
    );
  }

  return (
    <CompareWrapper>
      <LabelContainer>
        <LabelBadge className="original">
          <FormattedMessage id="videoCompress.original" defaultMessage="原视频" /> ({formatSize(originalSize)})
        </LabelBadge>
        <LabelBadge className="compressed">
          <FormattedMessage id="videoCompress.compressed" defaultMessage="压缩后" /> ({formatSize(compressedSize)})
        </LabelBadge>
      </LabelContainer>
      
      <CompareContainer
        ref={containerRef}
        onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)}
        onClick={(e) => {
          // 检查点击的目标
          const target = e.target as HTMLElement;
          
          // 如果点击的是视频控件（播放按钮、进度条等），不移动滑动条
          // 视频控件的元素通常是按钮、滑块等交互元素
          if (
            target.tagName === 'BUTTON' ||
            target.tagName === 'INPUT' ||
            target.closest('button') ||
            target.closest('input[type="range"]') ||
            target.closest('.video-controls')
          ) {
            // 不阻止事件，让视频控件正常工作
            return;
          }
          
          // 如果点击在视频元素上，检查是否在控件区域
          if (target.tagName === 'VIDEO' && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            // 如果点击在视频控件区域（底部约 30%），不移动滑动条，让视频控件正常工作
            if (clickY > rect.height * 0.7) {
              return;
            }
          }
          
          handleMouseMove(e);
        }}
      >
        <video
          ref={backgroundVideoRef}
          src={compressedVideo || originalVideo}
          controls
          onLoadedMetadata={updateVideoDimensions}
        />

        <OverlayVideo
          $width={sliderPos}
          $containerWidth={containerDim.w}
          $containerHeight={containerDim.h}
        >
          <video 
            ref={originalVideoRef}
            src={originalVideo}
            muted
            onLoadedMetadata={updateVideoDimensions}
          />
        </OverlayVideo>

        <SliderHandle $left={sliderPos}>
          <ArrowLeftOutlined style={{ fontSize: 10, marginRight: 2 }} />
          <ArrowRightOutlined style={{ fontSize: 10, marginLeft: 2 }} />
        </SliderHandle>
      </CompareContainer>
    </CompareWrapper>
  );
};

export default VideoCompare;

