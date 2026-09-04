import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Empty,
  Modal,
  Spin,
  Tabs,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  CloudUploadOutlined,
  LoadingOutlined,
  PictureOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
  fetchImageLibraryTasks,
  flattenTasksToImageItems,
  getImagePreviewUrl,
  type ImageLibraryItem,
  type ImageLibraryTaskType,
} from './imageGenMediaLibraryUtils';

const { Text } = Typography;
const { Dragger } = Upload;

const THEME_COLOR = '#1890ff';

const TabContent = styled.div`
  min-height: 280px;
`;

const LibraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  max-height: 420px;
  overflow-y: auto;
  padding: 4px 2px 8px;
`;

const ImageCard = styled.button<{ $disabled?: boolean }>`
  position: relative;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#eef0f3'};
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.6 : 1)};
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${THEME_COLOR};
    box-shadow: 0 6px 18px -8px rgba(24, 144, 255, 0.35);
  }
`;

const Thumb = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: ${props => props.theme.mode === 'dark' ? '#0f172a' : '#f8fafc'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardMeta = styled.div`
  padding: 8px 10px 10px;
`;

const PromptLine = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${props => props.theme.mode === 'dark' ? '#cbd5e1' : '#475569'};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  min-height: 34px;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
`;

const QuickEndFrameBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  border: none;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
  color: #fff;
  background: rgba(24, 144, 255, 0.92);
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(24, 144, 255, 1);
  }
`;

const ToolbarRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const LoadMoreWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

export type ImagePickerTarget = 'first' | 'end';

export interface ImagePickerSelection {
  remoteUrl: string;
  item?: ImageLibraryItem;
}

interface ImageGenPickerModalProps {
  open: boolean;
  target: ImagePickerTarget;
  /** 自定义标题；未传时按 first/end 使用默认文案 */
  title?: string;
  supportsEndFrame?: boolean;
  onClose: () => void;
  onSelectLocal: (file: File) => void | Promise<void>;
  onSelectRemote: (selection: ImagePickerSelection) => void | Promise<void>;
  onQuickSelectEndFrame?: (remoteUrl: string) => void | Promise<void>;
}

const ImageGenPickerModal: React.FC<ImageGenPickerModalProps> = ({
  open,
  target,
  title: titleProp,
  supportsEndFrame = false,
  onClose,
  onSelectLocal,
  onSelectRemote,
  onQuickSelectEndFrame,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<string>('local');
  const [loadingType, setLoadingType] = useState<ImageLibraryTaskType | null>(null);
  const [loadingMoreType, setLoadingMoreType] = useState<ImageLibraryTaskType | null>(null);
  const [selectingKey, setSelectingKey] = useState<string | null>(null);
  const [t2iItems, setT2iItems] = useState<ImageLibraryItem[]>([]);
  const [i2iItems, setI2iItems] = useState<ImageLibraryItem[]>([]);
  const [pagination, setPagination] = useState<Record<ImageLibraryTaskType, { current: number; total: number }>>({
    t2i: { current: 1, total: 0 },
    i2i: { current: 1, total: 0 },
  });

  const loadTasks = useCallback(async (taskType: ImageLibraryTaskType, page = 1, append = false) => {
    if (append) {
      setLoadingMoreType(taskType);
    } else {
      setLoadingType(taskType);
    }

    try {
      const { records, total } = await fetchImageLibraryTasks(taskType, page, 12);
      const items = flattenTasksToImageItems(records);
      if (taskType === 't2i') {
        setT2iItems(prev => (append ? [...prev, ...items] : items));
      } else {
        setI2iItems(prev => (append ? [...prev, ...items] : items));
      }
      setPagination(prev => ({
        ...prev,
        [taskType]: { current: page, total },
      }));
    } catch (error) {
      console.error(error);
      if (!append) {
        if (taskType === 't2i') setT2iItems([]);
        else setI2iItems([]);
      }
      message.error(intl.formatMessage({
        id: 'create.i2v.imagePicker.fetchFailed',
        defaultMessage: '加载生图记录失败',
      }));
    } finally {
      setLoadingType(null);
      setLoadingMoreType(null);
    }
  }, [intl]);

  useEffect(() => {
    if (!open) return;
    setActiveTab('local');
    loadTasks('t2i', 1, false);
    loadTasks('i2i', 1, false);
  }, [open, loadTasks]);

  const title = titleProp
    || (target === 'end'
      ? intl.formatMessage({ id: 'create.i2v.imagePicker.title.end', defaultMessage: '选择尾帧图片' })
      : intl.formatMessage({ id: 'create.i2v.imagePicker.title.first', defaultMessage: '选择起始帧图片' }));

  const uploadProps: UploadProps = {
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      void (async () => {
        try {
          await onSelectLocal(file);
          onClose();
        } catch (error) {
          console.error(error);
        }
      })();
      return false;
    },
  };

  const handleSelectRemote = async (item: ImageLibraryItem) => {
    if (selectingKey) return;
    setSelectingKey(item.key);
    try {
      await onSelectRemote({ remoteUrl: item.imageUrl, item });
      onClose();
    } catch (error) {
      console.error(error);
      message.error(intl.formatMessage({
        id: 'create.i2v.imagePicker.selectFailed',
        defaultMessage: '选用图片失败，请重试',
      }));
    } finally {
      setSelectingKey(null);
    }
  };

  const handleQuickEndFrame = async (
    e: React.MouseEvent,
    item: ImageLibraryItem,
  ) => {
    e.stopPropagation();
    if (!onQuickSelectEndFrame || selectingKey) return;
    setSelectingKey(item.key);
    try {
      await onQuickSelectEndFrame(item.imageUrl);
      message.success(intl.formatMessage({
        id: 'create.i2v.imagePicker.endFrameSet',
        defaultMessage: '已设为尾帧',
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setSelectingKey(null);
    }
  };

  const renderLibrary = (taskType: ImageLibraryTaskType, items: ImageLibraryItem[]) => {
    const loading = loadingType === taskType;
    const loadingMore = loadingMoreType === taskType;
    const pageInfo = pagination[taskType];
    const hasMore = items.length < pageInfo.total;
    const emptyId = taskType === 't2i'
      ? 'create.i2v.imagePicker.empty.t2i'
      : 'create.i2v.imagePicker.empty.i2i';
    const emptyDefault = taskType === 't2i' ? '暂无文生图记录' : '暂无图生图记录';

    return (
      <TabContent>
        <ToolbarRow>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            disabled={selectingKey != null}
            onClick={() => loadTasks(taskType, 1, false)}
          >
            <FormattedMessage id="create.history.refresh" defaultMessage="刷新" />
          </Button>
        </ToolbarRow>
        <Spin spinning={loading && items.length === 0}>
          {items.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<FormattedMessage id={emptyId} defaultMessage={emptyDefault} />}
            />
          ) : (
            <>
              <LibraryGrid>
                {items.map((item) => {
                  const isSelecting = selectingKey === item.key;
                  return (
                    <ImageCard
                      key={item.key}
                      type="button"
                      $disabled={selectingKey != null && !isSelecting}
                      disabled={selectingKey != null && !isSelecting}
                      onClick={() => handleSelectRemote(item)}
                    >
                      {supportsEndFrame && target === 'first' && onQuickSelectEndFrame && (
                        <QuickEndFrameBtn
                          type="button"
                          onClick={(e) => handleQuickEndFrame(e, item)}
                        >
                          <FormattedMessage
                            id="create.i2v.imagePicker.setAsEndFrame"
                            defaultMessage="尾帧"
                          />
                        </QuickEndFrameBtn>
                      )}
                      <Thumb>
                        {isSelecting ? (
                          <LoadingOutlined spin style={{ fontSize: 24, color: THEME_COLOR }} />
                        ) : (
                          <img
                            src={getImagePreviewUrl(item.imageUrl)}
                            alt=""
                            loading="lazy"
                          />
                        )}
                      </Thumb>
                      <CardMeta>
                        <PromptLine>
                          {item.prompt?.trim() || intl.formatMessage({
                            id: 'create.i2v.imagePicker.untitled',
                            defaultMessage: '未命名作品',
                          })}
                        </PromptLine>
                        <CardFooter>
                          <Tag bordered={false} color="blue" style={{ margin: 0, fontSize: 10 }}>
                            {taskType.toUpperCase()}
                          </Tag>
                          <span>
                            {item.createTime
                              ? dayjs(item.createTime).format('MM-DD HH:mm')
                              : '-'}
                          </span>
                        </CardFooter>
                      </CardMeta>
                    </ImageCard>
                  );
                })}
              </LibraryGrid>
              {hasMore && (
                <LoadMoreWrap>
                  <Button
                    size="small"
                    loading={loadingMore}
                    disabled={selectingKey != null}
                    onClick={() => loadTasks(taskType, pageInfo.current + 1, true)}
                  >
                    <FormattedMessage
                      id="create.i2v.imagePicker.loadMore"
                      defaultMessage="加载更多"
                    />
                  </Button>
                </LoadMoreWrap>
              )}
            </>
          )}
        </Spin>
      </TabContent>
    );
  };

  const tabItems = useMemo(() => [
    {
      key: 'local',
      label: intl.formatMessage({ id: 'create.i2v.imagePicker.tab.local', defaultMessage: '本地上传' }),
      children: (
        <TabContent>
          <Dragger {...uploadProps} style={{ padding: '12px 0' }}>
            <p className="ant-upload-drag-icon">
              <CloudUploadOutlined style={{ color: THEME_COLOR, fontSize: 42 }} />
            </p>
            <p className="ant-upload-text">
              <FormattedMessage
                id="create.i2v.upload.click"
                defaultMessage="点击或拖拽上传"
              />
            </p>
            <p className="ant-upload-hint">
              <FormattedMessage
                id="create.i2v.upload.supportedFormats"
                defaultMessage="支持 JPG, PNG, WebP"
              />
            </p>
          </Dragger>
          <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
            <FormattedMessage
              id="create.i2v.imagePicker.localHint"
              defaultMessage="也可切换到「文生图 / 图生图」标签，从已有生成记录中选用"
            />
          </Text>
        </TabContent>
      ),
    },
    {
      key: 't2i',
      label: (
        <span>
          <PictureOutlined style={{ marginRight: 6 }} />
          <FormattedMessage id="works.source.t2i" defaultMessage="文生图" />
        </span>
      ),
      children: renderLibrary('t2i', t2iItems),
    },
    {
      key: 'i2i',
      label: (
        <span>
          <PictureOutlined style={{ marginRight: 6 }} />
          <FormattedMessage id="works.source.i2i" defaultMessage="图生图" />
        </span>
      ),
      children: renderLibrary('i2i', i2iItems),
    },
  ], [
    i2iItems,
    intl,
    onQuickSelectEndFrame,
    selectingKey,
    supportsEndFrame,
    t2iItems,
    target,
    uploadProps,
  ]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnClose
      styles={{ body: { paddingTop: 8 } }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Modal>
  );
};

export default ImageGenPickerModal;
