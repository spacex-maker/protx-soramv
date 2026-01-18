// 音频压缩工具函数

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface AudioCompressOptions {
  bitrate?: number; // 比特率 (kbps)
  quality?: number; // 质量值 0-1
  format: 'mp3' | 'ogg' | 'aac' | 'wav'; // 输出格式
  sampleRate?: number; // 采样率 (Hz)
}

export interface AudioFileItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  originalSize: number;
  compressedSize?: number;
  compressedPreview?: string;
  progress?: number;
}

// 格式化文件大小
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取音频信息
export const getAudioInfo = (file: File): Promise<{ duration: number; sampleRate: number }> => {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    
    audio.onloadedmetadata = () => {
      window.URL.revokeObjectURL(audio.src);
      resolve({
        duration: audio.duration,
        sampleRate: (audio as any).sampleRate || 44100
      });
    };
    
    audio.onerror = () => {
      window.URL.revokeObjectURL(audio.src);
      reject(new Error('Failed to load audio metadata'));
    };
    
    audio.src = URL.createObjectURL(file);
  });
};

// 生成音频预览 URL
export const createAudioPreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    resolve(url);
  });
};

let ffmpegInstance: FFmpeg | null = null;
let isFFmpegLoaded = false;

// 初始化 FFmpeg
const initFFmpeg = async (onProgress?: (progress: number) => void): Promise<FFmpeg> => {
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

// 音频压缩函数
export const compressAudio = async (
  file: File,
  options: AudioCompressOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const ffmpeg = await initFFmpeg(onProgress);
  
  // 获取文件扩展名
  const inputExt = file.name.split('.').pop() || 'mp3';
  const inputFileName = `input.${inputExt}`;
  const outputFileName = `output.${options.format}`;
  
  try {
    // 写入输入文件
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));
    
    // 构建 FFmpeg 命令
    const args: string[] = [
      '-i', inputFileName,
    ];
    
    // 根据格式选择编码器
    switch (options.format) {
      case 'mp3':
        args.push('-c:a', 'libmp3lame');
        // 如果指定了比特率，使用比特率；否则使用质量参数
        if (options.bitrate) {
          args.push('-b:a', `${options.bitrate}k`);
        } else {
          // 质量设置（0-9，0最高质量）
          // quality 值 0-1，转换为 FFmpeg 质量值 0-9
          const mp3Quality = options.quality !== undefined ? Math.round((1 - options.quality) * 9) : 2;
          args.push('-q:a', String(mp3Quality));
        }
        break;
      case 'ogg':
        args.push('-c:a', 'libvorbis');
        // 比特率（kbps），如果未指定则根据质量计算
        const oggBitrate = options.bitrate || (options.quality !== undefined ? Math.round(options.quality * 320) : 128);
        args.push('-b:a', `${oggBitrate}k`);
        break;
      case 'aac':
        args.push('-c:a', 'aac');
        // 比特率（kbps），如果未指定则根据质量计算
        const aacBitrate = options.bitrate || (options.quality !== undefined ? Math.round(options.quality * 256) : 128);
        args.push('-b:a', `${aacBitrate}k`);
        break;
      case 'wav':
        // WAV 是无损格式，使用 PCM 编码
        args.push('-c:a', 'pcm_s16le');
        break;
    }
    
    // 采样率
    if (options.sampleRate) {
      args.push('-ar', String(options.sampleRate));
    }
    
    // 输出格式
    args.push(outputFileName);
    
    // 执行压缩
    await ffmpeg.exec(args);
    
    // 读取输出文件
    const data = await ffmpeg.readFile(outputFileName);
    
    // 清理临时文件
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);
    
    // 根据格式确定 MIME 类型
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      ogg: 'audio/ogg',
      aac: 'audio/aac',
      wav: 'audio/wav'
    };
    
    const mimeType = mimeTypes[options.format] || 'audio/mpeg';
    
    // 将 FileData 转换为 Blob
    if (data instanceof Uint8Array) {
      return new Blob([data.buffer as ArrayBuffer], { type: mimeType });
    } else {
      return new Blob([data], { type: mimeType });
    }
  } catch (error) {
    console.error('Audio compression error:', error);
    throw new Error('Audio compression failed. Please try again.');
  }
};

