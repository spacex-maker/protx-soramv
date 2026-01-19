import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Empty,
  Spin,
  Image,
  Pagination,
  message,
} from 'antd';
import {
  HistoryOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  EyeOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';
import { GenerationTask, GenerationTaskPageResponse } from './types';
import { addTencentImageCompression } from 'pages/Community/ChallengeDetailPage/utils';
import {
  HistorySection as HistorySectionWrapper,
  HistoryTitle,
  HistoryGrid,
  HistoryCard,
  HistoryImageWrapper,
  HistoryStatusBadge,
  HistoryInfo,
  HistoryModelName,
  HistoryTime,
  HistoryActions,
  HistoryEmpty,
} from './styles';

const { Title } = Typography;

interface HistorySectionProps {
  refreshTrigger?: number; // 用于触发刷新的计数器
  onTaskDetailClick?: (taskId: number) => void; // 点击任务详情的回调
  downloadImage: (url: string, index?: number) => void; // 下载图片的方法
}

const normalizeImageSource = (image: string): string => {
  if (!image) {
    return '';
  }
  const trimmed = image.trim();

  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//') && typeof window !== 'undefined') {
    return `${window.location.protocol}${trimmed}`;
  }

  if (trimmed.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${trimmed}`;
  }

  return `data:image/png;base64,${trimmed}`;
};

const HistorySection: React.FC<HistorySectionProps> = ({
  refreshTrigger,
  onTaskDetailClick,
  downloadImage,
}) => {
  const intl = useIntl();
  const [historyTasks, setHistoryTasks] = useState<GenerationTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取生成记录
  const fetchHistoryTasks = async (page: number = 1, pageSize: number = 10) => {
    setHistoryLoading(true);
    try {
      const response = await instance.get<{
        success: boolean;
        data: GenerationTaskPageResponse;
      }>('/productx/sa-ai-gen-task/my-tasks/page', {
        params: {
          currentPage: page,
          pageSize: pageSize,
          taskType: 't2i', // 通过 taskType 参数查询文本生成图片类型的任务
        },
      });

      if (response.data.success && response.data.data) {
        setHistoryTasks(response.data.data.records);
        setHistoryPagination({
          current: response.data.data.current,
          pageSize: response.data.data.size,
          total: response.data.data.total,
        });
      }
    } catch (error: any) {
      console.error('获取生成记录失败:', error);
      // 不显示错误提示，避免干扰用户体验
    } finally {
      setHistoryLoading(false);
    }
  };

  // 组件加载时获取生成记录
  useEffect(() => {
    fetchHistoryTasks();
  }, []);

  // 当 refreshTrigger 变化时刷新记录
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
    }
  }, [refreshTrigger]);

  // 处理分页变化
  const handleHistoryPageChange = (page: number, pageSize: number) => {
    fetchHistoryTasks(page, pageSize);
  };

  // 获取状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return intl.formatMessage({
          id: 'create.history.status.queued',
          defaultMessage: '排队',
        });
      case 1:
        return intl.formatMessage({
          id: 'create.history.status.processing',
          defaultMessage: '进行中',
        });
      case 2:
        return intl.formatMessage({
          id: 'create.history.status.success',
          defaultMessage: '成功',
        });
      case 3:
        return intl.formatMessage({
          id: 'create.history.status.failed',
          defaultMessage: '失败',
        });
      case 4:
        return intl.formatMessage({
          id: 'create.history.status.timeout',
          defaultMessage: '超时',
        });
      default:
        return '';
    }
  };

  // 计算生成时间（秒）
  const calculateGenerationTime = (startTime: string | null, endTime: string | null): number | null => {
    if (!startTime || !endTime) {
      return null;
    }
    try {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      if (isNaN(start) || isNaN(end) || end < start) {
        return null;
      }
      return Math.round((end - start) / 1000); // 转换为秒
    } catch (error) {
      console.error('计算生成时间失败:', error);
      return null;
    }
  };

  return (
    <HistorySectionWrapper>
      <HistoryTitle>
        <Title
          level={4}
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <HistoryOutlined style={{ color: '#1890ff' }} />
          <FormattedMessage
            id="create.history.title"
            defaultMessage="生成记录"
          />
        </Title>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => fetchHistoryTasks(historyPagination.current, historyPagination.pageSize)}
          loading={historyLoading}
        >
          <FormattedMessage
            id="create.history.refresh"
            defaultMessage="刷新"
          />
        </Button>
      </HistoryTitle>

      {historyLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : historyTasks.length > 0 ? (
        <>
          <Image.PreviewGroup>
            <HistoryGrid>
              {historyTasks.map((task) => {
                // 处理所有图片URL
                const imageUrls = task.resultUrls && task.resultUrls.length > 0
                  ? task.resultUrls.map((url) => normalizeImageSource(url))
                  : [];
                const rawThumbnailUrl = task.thumbnailUrl
                  ? normalizeImageSource(task.thumbnailUrl)
                  : imageUrls.length > 0 ? imageUrls[0] : null;
                // 为缩略图添加压缩参数（原图2MB压缩到15KB左右）
                const thumbnailUrl = rawThumbnailUrl 
                  ? addTencentImageCompression(rawThumbnailUrl, { quality: 60, width: 400 })
                  : null;
                const imageCount = imageUrls.length;

                return (
                  <HistoryCard key={task.id}>
                    <HistoryImageWrapper>
                      {thumbnailUrl ? (
                        <>
                          {/* 显示第一张图片作为缩略图 */}
                          <Image
                            src={thumbnailUrl}
                            alt={task.modelName}
                            width="100%"
                            height="100%"
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            preview={{
                              mask: <EyeOutlined style={{ fontSize: 16 }} />,
                              src: rawThumbnailUrl ? addTencentImageCompression(rawThumbnailUrl, { quality: 85, width: 1200 }) : undefined,
                            }}
                          />
                          {/* 隐藏的其他图片，用于预览组 */}
                          {imageUrls.length > 1 && imageUrls.slice(1).map((url, index) => (
                            <Image
                              key={`${task.id}-${index + 1}`}
                              src={addTencentImageCompression(url, { quality: 60, width: 400 })}
                              alt={`${task.modelName} - ${index + 2}`}
                              style={{ display: 'none' }}
                              preview={{
                                src: addTencentImageCompression(url, { quality: 85, width: 1200 })
                              }}
                            />
                          ))}
                        </>
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: (task.status === 3 || task.status === 4) ? '#ff4d4f' : '#8c8c8c',
                            padding: '16px',
                          }}
                        >
                          {(task.status === 3 || task.status === 4) ? (
                            <>
                              <PictureOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                              <div style={{ fontSize: 11, textAlign: 'center' }}>
                                <FormattedMessage
                                  id="create.history.failed.noImage"
                                  defaultMessage="生成失败"
                                />
                              </div>
                            </>
                          ) : (
                            <PictureOutlined style={{ fontSize: 32 }} />
                          )}
                        </div>
                      )}
                      <HistoryStatusBadge status={task.status}>
                        {getStatusText(task.status)}
                      </HistoryStatusBadge>
                      {/* 图片数量指示器 */}
                      {task.status === 2 && imageCount > 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            padding: '4px 8px',
                            borderRadius: 12,
                            background: 'rgba(0, 0, 0, 0.6)',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                          }}
                        >
                          <PictureOutlined style={{ fontSize: 12 }} />
                          <span>{imageCount}</span>
                        </div>
                      )}
                    </HistoryImageWrapper>
                    <HistoryInfo>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <HistoryModelName>{task.modelName}</HistoryModelName>
                        {(task.status === 3 || task.status === 4) && task.errorMessage && (
                          <div
                            style={{
                              fontSize: 11,
                              color: '#ff4d4f',
                              marginTop: 4,
                              marginBottom: 4,
                              lineHeight: 1.4,
                              wordBreak: 'break-word',
                              padding: '4px 8px',
                              background: 'rgba(255, 77, 79, 0.1)',
                              borderRadius: 4,
                              border: '1px solid rgba(255, 77, 79, 0.2)',
                            }}
                          >
                            {task.errorMessage}
                          </div>
                        )}
                        <HistoryTime>
                          <ClockCircleOutlined style={{ fontSize: 11 }} />
                          {new Date(task.createTime).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {(() => {
                            const duration = calculateGenerationTime(task.startTime, task.endTime);
                            if (duration !== null) {
                              return (
                                <span style={{ marginLeft: 8, color: '#1890ff' }}>
                                  · {duration}s
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </HistoryTime>
                      </div>
                      <HistoryActions>
                        {/* 详情按钮 - 始终显示在右下角 */}
                        <Button
                          shape="circle"
                          size="small"
                          icon={<InfoCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskDetailClick?.(task.id);
                          }}
                          style={{
                            color: '#1890ff',
                            background: 'rgba(24, 144, 255, 0.1)',
                            border: '1px solid rgba(24, 144, 255, 0.3)',
                          }}
                          title={intl.formatMessage({
                            id: 'create.history.detail.tooltip',
                            defaultMessage: '查看详情',
                          })}
                        />
                        {/* 下载按钮 - 仅在成功且有图片时显示 */}
                        {task.status === 2 && imageUrls.length > 0 && (
                          <Button
                            shape="circle"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (imageUrls.length === 1) {
                                downloadImage(imageUrls[0]);
                              } else {
                                // 下载所有图片
                                imageUrls.forEach((url, index) => {
                                  setTimeout(() => {
                                    downloadImage(url, index);
                                  }, index * 300);
                                });
                                message.success(
                                  intl.formatMessage(
                                    {
                                      id: 'create.history.downloadAll.start',
                                      defaultMessage: '开始下载 {count} 张图片',
                                    },
                                    { count: imageUrls.length }
                                  )
                                );
                              }
                            }}
                            style={{
                              color: '#52c41a',
                              background: 'rgba(82, 196, 26, 0.1)',
                              border: '1px solid rgba(82, 196, 26, 0.3)',
                            }}
                            title={
                              imageUrls.length > 1
                                ? intl.formatMessage(
                                    {
                                      id: 'create.history.downloadAll.tooltip',
                                      defaultMessage: '下载全部 {count} 张图片',
                                    },
                                    { count: imageUrls.length }
                                  )
                                : intl.formatMessage({
                                    id: 'create.history.download.tooltip',
                                    defaultMessage: '下载图片',
                                  })
                            }
                          />
                        )}
                      </HistoryActions>
                    </HistoryInfo>
                  </HistoryCard>
                );
              })}
            </HistoryGrid>
          </Image.PreviewGroup>
          {historyPagination.total > historyPagination.pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <Pagination
                current={historyPagination.current}
                pageSize={historyPagination.pageSize}
                total={historyPagination.total}
                onChange={handleHistoryPageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total) =>
                  intl.formatMessage(
                    {
                      id: 'create.history.total',
                      defaultMessage: '共 {total} 条记录',
                    },
                    { total }
                  )
                }
              />
            </div>
          )}
        </>
      ) : (
        <HistoryEmpty>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <FormattedMessage
                id="create.history.empty"
                defaultMessage="暂无生成记录"
              />
            }
          />
        </HistoryEmpty>
      )}
    </HistorySectionWrapper>
  );
};

export default HistorySection;
