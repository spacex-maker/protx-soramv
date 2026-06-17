/** 格式化字节为 B / KB / MB / GB */
export const formatFileSize = (bytes?: number | null): string => {
  if (bytes == null || bytes <= 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / Math.pow(k, i);
  return `${i === 0 ? value.toFixed(0) : value.toFixed(i >= 2 ? 2 : 1)} ${sizes[i]}`;
};
