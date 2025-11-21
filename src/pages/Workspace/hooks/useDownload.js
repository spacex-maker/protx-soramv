import { useState } from 'react';
import { message, Modal, Alert } from 'antd';

export const useDownload = () => {
  const [downloadTasks, setDownloadTasks] = useState([]);
  const [downloadManagerVisible, setDownloadManagerVisible] = useState(true);

  const startDownload = async (file) => {
    try {
      if (!file.downloadUrl) {
        throw new Error('下载链接不存在');
      }

      const xhr = new XMLHttpRequest();
      const downloadId = Date.now().toString();

      const newTask = {
        id: downloadId,
        filename: file.name,
        size: Number(file.size) || 0,
        progress: 0,
        speed: 0,
        status: 'downloading',
        xhr: xhr,
        totalBytes: Number(file.size) || 0,
        loadedBytes: 0
      };

      setDownloadManagerVisible(true);
      setDownloadTasks(prev => [...prev, newTask]);

      xhr.open('GET', file.downloadUrl, true);
      xhr.responseType = 'blob';

      let lastLoaded = 0;
      let lastTime = Date.now();

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const now = Date.now();
          const timeElapsed = (now - lastTime) / 1000;
          const loadedDiff = event.loaded - lastLoaded;
          const speed = timeElapsed > 0 ? loadedDiff / timeElapsed : 0;
          const totalBytes = Number(event.total) || Number(file.size) || 0;
          const loadedBytes = Number(event.loaded) || 0;

          setDownloadTasks(prev => 
            prev.map(task => 
              task.id === downloadId
                ? {
                    ...task,
                    progress: Math.round((loadedBytes / totalBytes) * 100),
                    speed: speed,
                    totalBytes: totalBytes,
                    loadedBytes: loadedBytes
                  }
                : task
            )
          );

          lastLoaded = loadedBytes;
          lastTime = now;
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          
          if (file.name.endsWith('.encrypted')) {
            Modal.info({
              title: '文件下载完成',
              content: (
                <div>
                  <p>加密文件将保存到下载目录：</p>
                  <p><strong style={{ wordBreak: 'break-all' }}>~/Downloads/{file.name}</strong></p>
                  <br />
                  <Alert
                    message="解密提示"
                    description={
                      <div>
                        <p>此文件已加密，您可以：</p>
                        <p>1. 使用我们的在线解密工具：<a href="/decrypt" target="_blank">打开解密工具</a></p>
                        <p>2. 使用加密时设置的密码进行解密</p>
                      </div>
                    }
                    type="info"
                    showIcon
                  />
                </div>
              ),
              width: 500,
              okText: '知道了'
            });
          } else {
            message.success(
              <span>
                文件将保存到下载目录：<br />
                <strong style={{ wordBreak: 'break-all' }}>~/Downloads/{file.name}</strong>
              </span>,
              4
            );
          }
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setDownloadTasks(prev =>
            prev.map(task =>
              task.id === downloadId
                ? { ...task, status: 'completed', progress: 100, speed: 0 }
                : task
            )
          );

          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
        } else {
          throw new Error('下载失败');
        }
      };

      xhr.onerror = () => {
        setDownloadTasks(prev =>
          prev.map(task =>
            task.id === downloadId
              ? { ...task, status: 'error', progress: 0, speed: 0 }
              : task
          )
        );
      };

      xhr.send();
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败: ' + (error.message || '未知错误'));
    }
  };

  const handleCancelDownload = (downloadId) => {
    setDownloadTasks(prev => {
      const task = prev.find(t => t.id === downloadId);
      if (task && task.xhr) {
        task.xhr.abort();
      }
      return prev.map(t =>
        t.id === downloadId
          ? { ...t, status: 'error', progress: 0, speed: 0 }
          : t
      );
    });
  };

  const handleClearDownloads = () => {
    setDownloadTasks(prev => prev.filter(task => task.status === 'downloading'));
  };

  const handleBatchDownload = async (selectedItems) => {
    if (selectedItems.length === 0) {
      message.error('没有可下载的文件');
      return;
    }

    setDownloadManagerVisible(true);
    selectedItems.forEach(file => {
      startDownload(file);
    });
  };

  return {
    downloadTasks,
    downloadManagerVisible,
    setDownloadManagerVisible,
    startDownload,
    handleCancelDownload,
    handleClearDownloads,
    handleBatchDownload
  };
}; 