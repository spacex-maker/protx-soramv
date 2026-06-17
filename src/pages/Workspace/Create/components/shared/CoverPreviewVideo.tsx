import React, { useEffect, useRef } from 'react';
import { pauseCoverVideo, playCoverVideo } from './coverVideoPlayback';
import { resolveCoverPlaybackUrl } from './videoModelCoverPreload';

interface CoverPreviewVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  /** always: 进入视口时播放；hover: 由父级 hover 触发 */
  playMode?: 'always' | 'hover';
  lazy?: boolean;
}

const CoverPreviewVideo: React.FC<CoverPreviewVideoProps> = ({
  src,
  className,
  style,
  playMode = 'always',
  lazy = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const srcRef = useRef(src);
  srcRef.current = src;

  useEffect(() => {
    if (playMode !== 'always') return;
    const el = videoRef.current;
    if (!el) return;

    let cancelled = false;

    const bindSource = async () => {
      if (lazy) return;
      const playbackSrc = await resolveCoverPlaybackUrl(srcRef.current);
      if (cancelled || !videoRef.current) return;
      videoRef.current.src = playbackSrc;
    };

    void bindSource();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoRef.current) return;
          if (entry.isIntersecting) {
            void playCoverVideo(videoRef.current, srcRef.current);
          } else {
            pauseCoverVideo(videoRef.current, false);
          }
        });
      },
      { threshold: 0.2, rootMargin: '40px' },
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
      if (videoRef.current) {
        pauseCoverVideo(videoRef.current, false);
      }
    };
  }, [playMode, lazy, src]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      loop
      muted
      playsInline
      preload={lazy ? 'none' : 'auto'}
      disablePictureInPicture
      disableRemotePlayback
    />
  );
};

export default CoverPreviewVideo;
