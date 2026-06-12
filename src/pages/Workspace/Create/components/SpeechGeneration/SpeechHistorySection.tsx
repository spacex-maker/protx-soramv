import React from 'react';
import { Button, Empty, Modal, Pagination, Spin, Tag, Tooltip, message } from 'antd';
import {
  CustomerServiceOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SoundOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import instance from 'api/axios';
import {
  HistoryCard,
  HistoryContainer,
  HistoryGrid,
  HistoryHeader,
  HistoryQuickLink,
  HistoryQuickLinks,
  HistoryTitleGroup,
} from './styles';

export interface SpeechHistoryTask {
  id: number;
  prompt?: string;
  resultUrls?: string[];
  createTime?: string;
  modelName?: string;
  voiceCode?: string;
  voiceName?: string;
  voiceNameEn?: string;
}

interface SpeechHistorySectionProps {
  tasks: SpeechHistoryTask[];
  loading: boolean;
  activeUrl?: string | null;
  pagination: { current: number; pageSize: number; total: number };
  getVoiceName?: (task: SpeechHistoryTask) => string | undefined;
  onPlay: (url: string) => void;
  onRefresh: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  onDeleted?: (task: SpeechHistoryTask) => void;
}

const SpeechHistorySection: React.FC<SpeechHistorySectionProps> = ({
  tasks,
  loading,
  activeUrl,
  pagination,
  getVoiceName,
  onPlay,
  onRefresh,
  onPageChange,
  onDeleted,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const goToMediaTool = (tab: 'audioConvert' | 'audioCompress') => {
    navigate(`/workspace/media-tools?tab=${tab}`);
  };

  const handleDelete = (e: React.MouseEvent, task: SpeechHistoryTask) => {
    e.stopPropagation();
    Modal.confirm({
      title: intl.formatMessage({ id: 'create.history.deleteConfirm.title', defaultMessage: '确认删除' }),
      content: intl.formatMessage({
        id: 'create.history.deleteConfirm.content',
        defaultMessage: '确定要删除这个任务吗？删除后将无法恢复。',
      }),
      okText: intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' }),
      cancelText: intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' }),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await instance.delete(`/productx/sa-ai-gen-task/${task.id}`);
          if (response.data?.success) {
            message.success(intl.formatMessage({ id: 'create.history.deleteSuccess', defaultMessage: '删除成功' }));
            onDeleted?.(task);
            onRefresh();
          } else {
            message.error(
              response.data?.message
              || intl.formatMessage({ id: 'create.history.deleteFailed', defaultMessage: '删除失败' }),
            );
          }
        } catch (error: any) {
          message.error(
            error?.response?.data?.message
            || intl.formatMessage({ id: 'create.history.deleteFailed', defaultMessage: '删除失败' }),
          );
        }
      },
    });
  };

  const resolveVoiceLabel = (task: SpeechHistoryTask) => {
    const label = getVoiceName?.(task)?.trim();
    if (label) return label;
    return task.voiceName || task.voiceNameEn || task.voiceCode;
  };

  return (
    <HistoryContainer>
      <HistoryHeader>
        <HistoryTitleGroup>
          <h3>
            <FormattedMessage id="create.speech.history" defaultMessage="生成记录" />
            {pagination.total > 0 && (
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, opacity: 0.55 }}>
                {pagination.total}
              </span>
            )}
          </h3>
          <HistoryQuickLinks>
            <HistoryQuickLink type="button" onClick={() => goToMediaTool('audioConvert')}>
              <CustomerServiceOutlined />
              <FormattedMessage id="mediaTools.tab.audioConvert" defaultMessage="音频转换" />
            </HistoryQuickLink>
            <HistoryQuickLink type="button" onClick={() => goToMediaTool('audioCompress')}>
              <SoundOutlined />
              <FormattedMessage id="mediaTools.tab.audioCompress" defaultMessage="音频压缩" />
            </HistoryQuickLink>
          </HistoryQuickLinks>
        </HistoryTitleGroup>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
        >
          <FormattedMessage id="create.history.refresh" defaultMessage="刷新" />
        </Button>
      </HistoryHeader>

      <Spin spinning={loading}>
        {tasks.length === 0 ? (
          <Empty description={<FormattedMessage id="create.speech.historyEmpty" defaultMessage="暂无记录" />} />
        ) : (
          <>
            <HistoryGrid>
              {tasks.map(task => {
                const url = task.resultUrls?.[0];
                const isActive = !!url && url === activeUrl;
                const voiceLabel = resolveVoiceLabel(task);
                return (
                  <HistoryCard
                    key={task.id}
                    $active={isActive}
                    onClick={() => url && onPlay(url)}
                  >
                    <div className="card-top">
                      <div className="icon-box">
                        <SoundOutlined />
                      </div>
                      <div className="card-body">
                        <div className="prompt">
                          {task.prompt?.trim() || intl.formatMessage({ id: 'create.speech.untitled', defaultMessage: '未命名语音' })}
                        </div>
                        {voiceLabel && (
                          <div className="voice-row">
                            <Tag className="voice-tag" icon={<UserOutlined />}>
                              <span className="voice-label">
                                <FormattedMessage id="create.speech.voice" defaultMessage="音色" />
                                ：
                              </span>
                              <span className="voice-name" title={voiceLabel}>{voiceLabel}</span>
                            </Tag>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="meta">
                      <span>{task.createTime ? dayjs(task.createTime).format('MM-DD HH:mm') : '-'}</span>
                      <div className="card-actions" onClick={e => e.stopPropagation()}>
                        {url && (
                          <>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlayCircleOutlined />}
                              onClick={() => onPlay(url)}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<DownloadOutlined />}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          </>
                        )}
                        <Tooltip title={intl.formatMessage({ id: 'create.history.delete', defaultMessage: '删除' })}>
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => handleDelete(e, task)}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </HistoryCard>
                );
              })}
            </HistoryGrid>
            {pagination.total > pagination.pageSize && (
              <Pagination
                style={{ marginTop: 16, textAlign: 'right' }}
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={onPageChange}
                size="small"
                showSizeChanger={false}
              />
            )}
          </>
        )}
      </Spin>
    </HistoryContainer>
  );
};

export default SpeechHistorySection;
