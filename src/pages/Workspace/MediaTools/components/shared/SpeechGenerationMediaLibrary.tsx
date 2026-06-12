import React, { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Spin, Tag, Typography, message } from 'antd';
import {
  LoadingOutlined,
  ReloadOutlined,
  SoundOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { useLocale } from 'contexts/LocaleContext';
import {
  fetchSpeechAudioAsFile,
  fetchSpeechLibraryTasks,
  resolveSpeechVoiceLabel,
  type SpeechLibraryTask,
} from '../../utils/speechMediaLibraryUtils';

const { Text } = Typography;

const THEME_COLOR = '#8338ec';

const LibraryWrap = styled.div`
  margin-bottom: 20px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
`;

const LibraryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const LibraryTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  }
`;

const LibraryContent = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;

  .ant-spin-nested-loading,
  .ant-spin-container {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
`;

const LibraryScroll = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 4px 2px 6px;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.12)'};
    border-radius: 999px;
  }
`;

const LibraryCard = styled.button<{ $loading?: boolean; $disabled?: boolean }>`
  flex: 0 0 220px;
  width: 220px;
  text-align: left;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#eef0f3'};
  border-radius: 14px;
  padding: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'};
  cursor: ${props => (props.$disabled || props.$loading ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.55 : 1)};
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${THEME_COLOR};
    box-shadow: 0 6px 18px -8px rgba(131, 56, 236, 0.35);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const CardTop = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
`;

const IconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${THEME_COLOR};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.15)' : 'rgba(131, 56, 236, 0.1)'};
  font-size: 16px;
`;

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const PromptText = styled.div`
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#334155'};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
`;

const VoiceTag = styled(Tag)`
  margin-top: 6px !important;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px !important;
`;

const DividerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 16px;
  color: ${props => props.theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  font-size: 12px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#eef0f3'};
  }
`;

const LoadMoreWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

interface SpeechGenerationMediaLibraryProps {
  onSelect: (file: File) => void | Promise<void>;
  disabled?: boolean;
  showOrUploadDivider?: boolean;
}

const SpeechGenerationMediaLibrary: React.FC<SpeechGenerationMediaLibraryProps> = ({
  onSelect,
  disabled = false,
  showOrUploadDivider = true,
}) => {
  const intl = useIntl();
  const { locale } = useLocale();
  const [tasks, setTasks] = useState<SpeechLibraryTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });

  const loadTasks = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const { records, total } = await fetchSpeechLibraryTasks(page, pagination.pageSize);
      setTasks(prev => (append ? [...prev, ...records] : records));
      setPagination(prev => ({ ...prev, current: page, total }));
    } catch (error) {
      console.error(error);
      if (!append) {
        setTasks([]);
      }
      message.error(intl.formatMessage({
        id: 'mediaTools.speechLibrary.fetchFailed',
        defaultMessage: '加载语音记录失败',
      }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [intl, pagination.pageSize]);

  useEffect(() => {
    loadTasks(1, false);
  }, [loadTasks]);

  const handleSelect = async (task: SpeechLibraryTask) => {
    const url = task.resultUrls[0];
    if (!url || disabled || selectingId != null) return;

    setSelectingId(task.id);
    try {
      const file = await fetchSpeechAudioAsFile(url, task);
      await onSelect(file);
    } catch (error) {
      console.error(error);
      message.error(intl.formatMessage({
        id: 'mediaTools.speechLibrary.selectFailed',
        defaultMessage: '选用音频失败，请重试',
      }));
    } finally {
      setSelectingId(null);
    }
  };

  const hasMore = tasks.length < pagination.total;

  return (
    <LibraryWrap>
      <LibraryHeader>
        <LibraryTitle>
          <h4>
            <FormattedMessage id="mediaTools.speechLibrary.title" defaultMessage="媒体库" />
          </h4>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <FormattedMessage
              id="mediaTools.speechLibrary.subtitle"
              defaultMessage="来自语音生成记录，点击即可选用"
            />
          </Text>
        </LibraryTitle>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          loading={loading}
          disabled={disabled || selectingId != null}
          onClick={() => loadTasks(1, false)}
        >
          <FormattedMessage id="create.history.refresh" defaultMessage="刷新" />
        </Button>
      </LibraryHeader>

      <LibraryContent>
        <Spin spinning={loading && tasks.length === 0}>
        {tasks.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={(
              <FormattedMessage
                id="mediaTools.speechLibrary.empty"
                defaultMessage="暂无语音生成记录"
              />
            )}
            style={{ margin: '8px 0 4px' }}
          />
        ) : (
          <>
            <LibraryScroll>
              {tasks.map(task => {
                const voiceLabel = resolveSpeechVoiceLabel(task, locale);
                const isSelecting = selectingId === task.id;
                return (
                  <LibraryCard
                    key={task.id}
                    type="button"
                    $loading={isSelecting}
                    $disabled={disabled}
                    disabled={disabled || (selectingId != null && !isSelecting)}
                    onClick={() => handleSelect(task)}
                  >
                    <CardTop>
                      <IconBox>
                        {isSelecting ? <LoadingOutlined spin /> : <SoundOutlined />}
                      </IconBox>
                      <CardBody>
                        <PromptText>
                          {task.prompt?.trim() || intl.formatMessage({
                            id: 'create.speech.untitled',
                            defaultMessage: '未命名语音',
                          })}
                        </PromptText>
                        {voiceLabel && (
                          <VoiceTag icon={<UserOutlined />} bordered={false} color="purple">
                            {voiceLabel}
                          </VoiceTag>
                        )}
                      </CardBody>
                    </CardTop>
                    <CardMeta>
                      <span>
                        {task.createTime
                          ? dayjs(task.createTime).format('MM-DD HH:mm')
                          : '-'}
                      </span>
                      {isSelecting && (
                        <span>
                          <FormattedMessage
                            id="mediaTools.speechLibrary.selecting"
                            defaultMessage="加载中..."
                          />
                        </span>
                      )}
                    </CardMeta>
                  </LibraryCard>
                );
              })}
            </LibraryScroll>

            {hasMore && (
              <LoadMoreWrap>
                <Button
                  size="small"
                  loading={loadingMore}
                  disabled={disabled || selectingId != null}
                  onClick={() => loadTasks(pagination.current + 1, true)}
                >
                  <FormattedMessage
                    id="mediaTools.speechLibrary.loadMore"
                    defaultMessage="加载更多"
                  />
                </Button>
              </LoadMoreWrap>
            )}
          </>
        )}
        </Spin>
      </LibraryContent>

      {showOrUploadDivider && (
        <DividerRow>
          <FormattedMessage
            id="mediaTools.speechLibrary.orUpload"
            defaultMessage="或从本地上传"
          />
        </DividerRow>
      )}
    </LibraryWrap>
  );
};

export default SpeechGenerationMediaLibrary;
