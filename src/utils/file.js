/**
 * 读取文件内容为 ArrayBuffer
 * @param {File} file - 文件对象
 * @returns {Promise<ArrayBuffer>} 文件内容
 */
export const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 下载文件
 * @param {Blob} blob - 文件内容
 * @param {string} fileName - 文件名
 */
export const downloadFile = (blob, fileName) => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载文件错误:', error);
    throw new Error('文件下载失败');
  }
};

/**
 * 获取推荐的文件大小限制
 * @returns {number} 推荐的文件大小限制（字节）
 */
export const getRecommendedFileSize = () => {
  // 默认最大 1GB
  let maxSize = 1024;

  try {
    // 检查 navigator.hardwareConcurrency 是否可用
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      const cores = navigator.hardwareConcurrency;
      
      // 根据 CPU 核心数调整
      if (cores >= 8) {
        maxSize = 2048; // 8核及以上，推荐最大 2GB
      } else if (cores >= 4) {
        maxSize = 1024; // 4-8核，推荐最大 1GB
      } else {
        maxSize = 512; // 4核以下，推荐最大 512MB
      }
    }
  } catch (error) {
    console.warn('无法获取CPU核心数信息:', error);
  }

  return maxSize * 1024 * 1024; // 转换为字节
}; 