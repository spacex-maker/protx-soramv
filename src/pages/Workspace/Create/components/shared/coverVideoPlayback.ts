import { resolveCoverPlaybackUrl } from './videoModelCoverPreload';

/** 同一时间只播放一路封面视频，避免模型列表卡顿 */
let activeCoverVideo: HTMLVideoElement | null = null;

/** 记录 video 元素绑定的原始封面 URL（可能与 video.src blob 不同） */
const loadedSrcByVideo = new WeakMap<HTMLVideoElement, string>();

export function pauseActiveCoverVideo(except?: HTMLVideoElement | null) {
  if (activeCoverVideo && activeCoverVideo !== except) {
    activeCoverVideo.pause();
    activeCoverVideo = null;
  }
}

function playWhenReady(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    void video.play().catch(() => {});
    return;
  }
  const onReady = () => {
    video.removeEventListener('canplay', onReady);
    video.removeEventListener('loadeddata', onReady);
    if (activeCoverVideo === video) {
      void video.play().catch(() => {});
    }
  };
  video.addEventListener('canplay', onReady, { once: true });
  video.addEventListener('loadeddata', onReady, { once: true });
}

/** 绑定封面 src（不播放），弹窗卡片打开时展示首帧 */
export async function bindCoverVideoSource(video: HTMLVideoElement, src: string) {
  if (!src) return;
  const playbackSrc = await resolveCoverPlaybackUrl(src);
  const tracked = loadedSrcByVideo.get(video);
  if (tracked === src && video.src === playbackSrc) return;
  video.src = playbackSrc;
  loadedSrcByVideo.set(video, src);
  video.load();
}

/**
 * 悬停/展示播放：使用 Tab 预加载缓存，缓冲就绪后再 play。
 */
export async function playCoverVideo(video: HTMLVideoElement, src?: string) {
  if (!src) return;

  pauseActiveCoverVideo(video);
  activeCoverVideo = video;

  const playbackSrc = await resolveCoverPlaybackUrl(src);
  if (activeCoverVideo !== video) return;

  const tracked = loadedSrcByVideo.get(video);
  if (tracked !== src || video.src !== playbackSrc) {
    video.src = playbackSrc;
    loadedSrcByVideo.set(video, src);
    video.load();
  } else if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
    video.load();
  }

  playWhenReady(video);
}

export function pauseCoverVideo(video: HTMLVideoElement, resetTime = false) {
  video.pause();
  if (resetTime) {
    video.currentTime = 0;
  }
  if (activeCoverVideo === video) {
    activeCoverVideo = null;
  }
}

export function setGridCardVideoPlaying(
  cardRoot: HTMLElement,
  playing: boolean,
  src?: string,
) {
  const video = cardRoot.querySelector('video.card-image');
  if (!video || !(video instanceof HTMLVideoElement)) return;
  const videoSrc = src || video.dataset.src;
  if (playing) {
    void playCoverVideo(video, videoSrc);
  } else {
    pauseCoverVideo(video, false);
  }
}

export function clearCoverVideoCache() {
  activeCoverVideo = null;
}
