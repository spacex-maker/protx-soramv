import { ArrayBufferTarget, Muxer } from 'mp4-muxer';

export type WebCodecsOutputFormat = 'mp4';

export interface WebCodecsTranscodeOptions {
  format: WebCodecsOutputFormat;
  bitrate?: number;
  framerate?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

const DEFAULT_FRAMERATE = 30;

export const isWebCodecsAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;
};

const waitForEvent = <T extends keyof HTMLMediaElementEventMap>(
  media: HTMLMediaElement,
  eventName: T
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const onSuccess = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      const mediaError = media.error;
      const errorCode = mediaError?.code;
      const details = mediaError?.message || '';
      reject(new Error(`Failed while waiting for event: ${eventName}${errorCode ? ` (MediaError code: ${errorCode})` : ''}${details ? ` - ${details}` : ''}`));
    };
    const cleanup = () => {
      media.removeEventListener(eventName, onSuccess);
      media.removeEventListener('error', onError);
    };

    media.addEventListener(eventName, onSuccess, { once: true });
    media.addEventListener('error', onError, { once: true });
  });
};

const createVideoElement = (src: string): HTMLVideoElement => {
  const video = document.createElement('video');
  video.src = src;
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  return video;
};

export const transcodeWithWebCodecs = async (
  file: File,
  options: WebCodecsTranscodeOptions
): Promise<Blob> => {
  const ensureNotAborted = () => {
    if (options.signal?.aborted) {
      throw new Error('Conversion stopped by user.');
    }
  };

  if (!isWebCodecsAvailable()) {
    throw new Error('WebCodecs is not supported in current browser.');
  }

  if (options.format !== 'mp4') {
    throw new Error('WebCodecs path currently supports mp4 output only.');
  }

  const objectUrl = URL.createObjectURL(file);
  const video = createVideoElement(objectUrl);

  try {
    ensureNotAborted();
    // Quick capability hint before full decode path.
    const fileType = file.type || '';
    const canPlay = fileType ? video.canPlayType(fileType) : '';
    if (fileType && !canPlay) {
      throw new Error(`Browser cannot decode this source format in WebCodecs path: ${fileType}`);
    }

    await waitForEvent(video, 'loadedmetadata');
    ensureNotAborted();

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const framerate = options.framerate || DEFAULT_FRAMERATE;
    const bitrate = options.bitrate || Math.max(800_000, Math.floor(width * height * 3.2));

    const support = await VideoEncoder.isConfigSupported({
      codec: 'avc1.42001f',
      width,
      height,
      bitrate,
      framerate,
      hardwareAcceleration: 'prefer-hardware',
    });

    if (!support.supported) {
      throw new Error('Current browser does not support requested WebCodecs config.');
    }

    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      fastStart: 'in-memory',
      video: {
        codec: 'avc',
        width,
        height,
      },
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context for WebCodecs transcoding.');
    }

    const encoder = new VideoEncoder({
      output: (chunk, meta) => {
        muxer.addVideoChunk(chunk, meta);
      },
      error: (error) => {
        console.error('WebCodecs encoder error:', error);
      },
    });

    encoder.configure({
      codec: 'avc1.42001f',
      width,
      height,
      bitrate,
      framerate,
      hardwareAcceleration: 'prefer-hardware',
    });

    await video.play();
    ensureNotAborted();

    const duration = video.duration || 0;
    let frameIndex = 0;

    await new Promise<void>((resolve, reject) => {
      const handleEnded = async () => {
        try {
          await encoder.flush();
          muxer.finalize();
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          encoder.close();
        }
      };

      const renderFrame: VideoFrameRequestCallback = () => {
        try {
          ensureNotAborted();
          ctx.drawImage(video, 0, 0, width, height);
          const timestamp = Math.round(video.currentTime * 1_000_000);
          const frame = new VideoFrame(canvas, { timestamp });
          encoder.encode(frame, { keyFrame: frameIndex % (framerate * 2) === 0 });
          frame.close();
          frameIndex += 1;

          if (duration > 0 && options.onProgress) {
            const percent = Math.min(99, Math.round((video.currentTime / duration) * 100));
            options.onProgress(percent);
          }

          if (!video.ended) {
            video.requestVideoFrameCallback(renderFrame);
          }
        } catch (error) {
          reject(error);
        }
      };

      video.addEventListener('ended', handleEnded, { once: true });
      video.requestVideoFrameCallback(renderFrame);
    });

    options.onProgress?.(100);
    return new Blob([target.buffer], { type: 'video/mp4' });
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.pause();
    video.src = '';
  }
};

