// 共享工具函数和类型定义

export interface BatchFileItem {
  id: string;
  file: File;
  preview: string;
  compressedPreview?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  originalSize: number;
  compressedSize?: number;
  compressedBlob?: Blob;
}

export interface CompressOptions {
  quality: number;
  resizeMode: string | number;
  scale: number;
  customWidth: number | null;
  customHeight: number | null;
  format: string;
}

export const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const compressCore = async (
  file: File, 
  img: HTMLImageElement, 
  options: CompressOptions
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const { resizeMode, scale, customWidth, customHeight, format, quality } = options;
    
    let targetWidth = img.width;
    let targetHeight = img.height;

    if (resizeMode === 'scale') {
      targetWidth = Math.round(img.width * (scale / 100));
      targetHeight = Math.round(img.height * (scale / 100));
    } else {
      if (customWidth) targetWidth = customWidth;
      if (customHeight) targetHeight = customHeight;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      if (format === 'jpeg' || (format === 'auto' && file.type === 'image/jpeg')) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      let mimeType = file.type;
      if (format !== 'auto') {
        mimeType = format === 'png' ? 'image/png' : (format === 'webp' ? 'image/webp' : 'image/jpeg');
      }

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas error'));
      }, mimeType, quality);
    } else {
      reject(new Error('Context error'));
    }
  });
};

// 缓存相关函数（使用 IndexedDB）

const DB_NAME = 'image_compress_db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// 初始化 IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// 保存图片到缓存（使用 IndexedDB）
export const saveImagesToCache = async (
  files: BatchFileItem[],
  imagesMeta: Record<string, { width: number; height: number; originalSize: number; compressedSize: number }>,
  compressedBlobs: Record<string, Blob>
): Promise<void> => {
  try {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported');
      return;
    }

    console.log('Saving images to cache:', files.length);
    
    // 先准备好所有数据（在事务外完成异步操作）
    const dataToSave = await Promise.all(
      files.map(async (item) => {
        const meta = imagesMeta[item.id];
        const compressedBlob = compressedBlobs[item.id];
        
        // 将 File 和 Blob 转换为 ArrayBuffer
        const originalBuffer = await item.file.arrayBuffer();
        const compressedBuffer = compressedBlob ? await compressedBlob.arrayBuffer() : undefined;
        
        return {
          id: item.id,
          name: item.file.name,
          type: item.file.type,
          size: item.file.size,
          originalBuffer,
          compressedBuffer,
          width: meta?.width || 0,
          height: meta?.height || 0,
          compressedSize: meta?.compressedSize || item.originalSize,
          status: item.status
        };
      })
    );

    // 在同一个事务中完成清空和保存操作
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // 先清空旧数据
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // 保存每个图片（在同一个事务中）
    await Promise.all(
      dataToSave.map((data) => {
        return new Promise<void>((resolve, reject) => {
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        });
      })
    );
    
    // 等待事务完成
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        console.log('Cache saved successfully');
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to save images to cache:', error);
  }
};

// 从缓存加载图片
export const loadImagesFromCache = async (): Promise<{
  files: BatchFileItem[];
  imagesMeta: Record<string, { width: number; height: number; originalSize: number; compressedSize: number }>;
  compressedBlobs: Record<string, Blob>;
} | null> => {
  try {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported');
      return null;
    }

    console.log('Loading images from cache...');
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    const cachedData = await new Promise<any[]>((resolve, reject) => {
      request.onsuccess = () => {
        console.log('Loaded from cache:', request.result?.length || 0, 'items');
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });

    if (!cachedData || cachedData.length === 0) {
      console.log('No cached data found');
      return null;
    }
    
    console.log('Processing cached data...');

    const files: BatchFileItem[] = [];
    const imagesMeta: Record<string, { width: number; height: number; originalSize: number; compressedSize: number }> = {};
    const compressedBlobs: Record<string, Blob> = {};

    for (const item of cachedData) {
      // 从 ArrayBuffer 创建 Blob
      const blob = new Blob([item.originalBuffer], { type: item.type });
      
      // 创建 File 对象
      const file = new File([blob], item.name, { type: item.type });
      
      // 创建预览 URL
      const preview = URL.createObjectURL(file);
      
      const batchItem: BatchFileItem = {
        id: item.id,
        file,
        preview,
        status: item.status,
        originalSize: item.size,
        compressedSize: item.compressedSize
      };

      if (item.compressedBuffer) {
        const compressedBlob = new Blob([item.compressedBuffer], { type: item.type });
        compressedBlobs[item.id] = compressedBlob;
        batchItem.compressedBlob = compressedBlob;
        batchItem.compressedPreview = URL.createObjectURL(compressedBlob);
      }

      files.push(batchItem);

      imagesMeta[item.id] = {
        width: item.width,
        height: item.height,
        originalSize: item.size,
        compressedSize: item.compressedSize || item.size
      };
    }

    console.log('Cache loaded successfully:', files.length, 'files');
    return { files, imagesMeta, compressedBlobs };
  } catch (error) {
    console.error('Failed to load images from cache:', error);
    return null;
  }
};

// 清空缓存
export const clearImageCache = async (): Promise<void> => {
  try {
    if (!window.indexedDB) return;
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

