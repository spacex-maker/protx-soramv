import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface VideoCompressOptions {
  quality: number; // 0-1, 质量值
  bitrate?: string; // 比特率，如 '1M', '500k'
  resolution?: string; // 分辨率，如 '1920x1080', '1280x720'
  fps?: number; // 帧率
  format: 'mp4' | 'webm' | 'avi'; // 输出格式
  crf?: number; // CRF值 (0-51, 越小质量越好，18-28常用)
}

export interface VideoFileItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  originalSize: number;
  compressedSize?: number;
  compressedPreview?: string;
  progress?: number;
}

let ffmpegInstance: FFmpeg | null = null;
let isFFmpegLoaded = false;

// 强制终止当前 FFmpeg 实例（用于“取消转换”）
export const terminateFFmpegInstance = () => {
  if (!ffmpegInstance) return;
  try {
    const anyInstance = ffmpegInstance as unknown as { terminate?: () => void };
    if (typeof anyInstance.terminate === 'function') {
      anyInstance.terminate();
    }
  } catch (error) {
    console.warn('Terminate FFmpeg instance failed:', error);
  } finally {
    ffmpegInstance = null;
    isFFmpegLoaded = false;
  }
};

// 初始化 FFmpeg
export const initFFmpeg = async (onProgress?: (progress: number) => void): Promise<FFmpeg> => {
  if (ffmpegInstance && isFFmpegLoaded) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();
  
  // 监听进度
  ffmpeg.on('progress', ({ progress }) => {
    if (onProgress) {
      onProgress(progress * 100);
    }
  });

  // 监听日志（可选，用于调试）
  ffmpeg.on('log', ({ message }) => {
    console.log('FFmpeg:', message);
  });

  // 加载 FFmpeg
  // 使用 UMD 版本而不是 ESM 版本，避免 blob URL 作为模块导入的问题
  // UMD 版本更适合在浏览器环境中使用
  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
  
  try {
    // 使用 toBlobURL 将远程文件转换为 blob URL（避免 CORS 问题）
    // UMD 版本不需要 import.meta，更适合在浏览器环境中使用
    // 注意：首次加载需要下载大文件（~30MB），可能需要一些时间
    console.log('开始加载 FFmpeg core 文件...', `${baseURL}/ffmpeg-core.js`);
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
    console.log('FFmpeg core 文件加载完成，blob URL:', coreURL);
    console.log('开始加载 WASM 文件...', `${baseURL}/ffmpeg-core.wasm`);
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
    console.log('FFmpeg WASM 文件加载完成，blob URL:', wasmURL);
    console.log('正在初始化 FFmpeg...');
    
    await ffmpeg.load({
      coreURL,
      wasmURL,
    });
    console.log('FFmpeg 初始化完成');
    
    ffmpegInstance = ffmpeg;
    isFFmpegLoaded = true;
    
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    // 重置状态，允许重试
    ffmpegInstance = null;
    isFFmpegLoaded = false;
    throw new Error(`Failed to initialize FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}. Please refresh the page and try again.`);
  }
};

// 格式化文件大小
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取视频信息
export const getVideoInfo = (file: File): Promise<{ width: number; height: number; duration: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      });
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// 核心压缩函数
export const compressVideo = async (
  file: File,
  options: VideoCompressOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const ffmpeg = await initFFmpeg(onProgress);
  
  const inputFileName = 'input.' + file.name.split('.').pop();
  const outputFileName = `output.${options.format}`;
  
  try {
    // 写入输入文件
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));
    
    // 构建 FFmpeg 命令
    const args: string[] = [
      '-i', inputFileName,
      '-c:v', 'libx264', // 视频编码器
      '-preset', 'medium', // 编码速度预设
      '-crf', String(options.crf || 23), // CRF值，控制质量
    ];
    
    // 如果指定了比特率，使用比特率而不是CRF
    if (options.bitrate) {
      args.push('-b:v', options.bitrate);
      // 移除 CRF，因为比特率和CRF不能同时使用
      const crfIndex = args.indexOf('-crf');
      if (crfIndex !== -1) {
        args.splice(crfIndex, 2);
      }
    }
    
    // 分辨率
    if (options.resolution) {
      args.push('-vf', `scale=${options.resolution}`);
    }
    
    // 帧率
    if (options.fps) {
      args.push('-r', String(options.fps));
    }
    
    // 音频编码
    args.push('-c:a', 'aac', '-b:a', '128k');
    
    // 输出格式
    args.push(outputFileName);
    
    // 执行压缩
    await ffmpeg.exec(args);
    
    // 读取输出文件
    const data = await ffmpeg.readFile(outputFileName);
    
    // 清理临时文件
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);
    
    // 将 FileData 转换为 Blob
    // FileData 可能是 Uint8Array 或 string
    if (data instanceof Uint8Array) {
      // 如果是 Uint8Array，直接使用
      return new Blob([data.buffer as ArrayBuffer], { type: `video/${options.format}` });
    } else {
      // 如果是 string，转换为 Blob
      return new Blob([data], { type: `video/${options.format}` });
    }
  } catch (error) {
    console.error('Video compression error:', error);
    throw new Error('Video compression failed. Please try again.');
  }
};

// 生成视频预览
export const createVideoPreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const url = URL.createObjectURL(file);
      resolve(url);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to create video preview'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

