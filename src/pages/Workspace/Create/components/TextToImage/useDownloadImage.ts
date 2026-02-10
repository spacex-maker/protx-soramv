import { useCallback } from 'react';
import { message } from 'antd';
import { useIntl } from 'react-intl';

/**
 * 下载单张图片（支持 data URL 和普通 URL）
 */
export const useDownloadImage = () => {
  const intl = useIntl();

  const downloadImage = useCallback((url: string, index?: number) => {
    try {
      if (url.startsWith('data:image')) {
        const base64Data = url.split(',')[1];
        const mimeType = url.match(/data:image\/([^;]+)/)?.[1] || 'png';
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${mimeType}` });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download =
          index !== undefined
            ? `generated-${Date.now()}-${index + 1}.${mimeType}`
            : `generated-${Date.now()}.${mimeType}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download =
          index !== undefined
            ? `generated-${Date.now()}-${index + 1}.jpg`
            : `generated-${Date.now()}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('下载图片失败:', error);
      message.error(
        intl.formatMessage({
          id: 'create.download.error',
          defaultMessage: '下载失败，请重试',
        })
      );
    }
  }, [intl]);

  return { downloadImage };
};
