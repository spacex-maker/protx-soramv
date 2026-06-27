/** 腾讯云万象图片压缩后缀（展示用） */
export function addImageCompressSuffix(
  url: string | null | undefined,
  width = 480
): string {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
}
