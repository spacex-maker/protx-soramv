import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Empty,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
  CopyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  CommunityAiOperator,
  CommunityAiOperatorPostRecord,
  listAiOperatorPostRecords,
  listChannelAiOperators,
  listTextToImageModels,
  TextToImageModel,
  updateChannelAiOperator,
} from 'api/communityAiOperator';
import { CommunityChannel, listChannels } from 'api/community';
import AiOperatorTriggerPostModal from './AiOperatorTriggerPostModal';

const { Text, Paragraph } = Typography;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: min(72vh, 720px);
  overflow: hidden;
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 4px;
`;

const OperatorBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1a1a1a' : '#f5f7fa')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#eee')};
`;

const OperatorChip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid
    ${(p) =>
      p.$active
        ? p.theme.mode === 'dark'
          ? '#3b82f6'
          : '#3b82f6'
        : p.theme.mode === 'dark'
          ? '#333'
          : '#d9d9d9'};
  background: ${(p) =>
    p.$active
      ? p.theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(59, 130, 246, 0.08)'
      : p.theme.mode === 'dark'
        ? '#141414'
        : '#fff'};
  color: ${(p) => (p.theme.mode === 'dark' ? '#f0f0f0' : '#1f1f1f')};
  cursor: pointer;
  transition: all 0.2s;

  .name {
    font-size: 13px;
    font-weight: ${(p) => (p.$active ? 600 : 400)};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }

  &:hover {
    border-color: #3b82f6;
  }
`;

const SectionCard = styled.div`
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#eee')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
  overflow: hidden;
`;

const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
`;

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  .label {
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }

  .control {
    width: 100%;
    min-width: 0;
  }
`;

const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa')};

  .label {
    font-size: 13px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)')};
  }
`;

const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 16px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#f0f0f0')};
`;

const ProfileBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  .title {
    font-size: 12px;
    font-weight: 600;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }

  .content {
    font-size: 13px;
    line-height: 1.6;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)')};
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const PromptBox = styled(Input.TextArea)`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px !important;
  line-height: 1.55 !important;
  resize: vertical !important;
`;

const ConfigStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RecordsToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#f0f0f0')};
`;

const RecordList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px 16px;
`;

const RecordItem = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#eee')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa')};
  min-width: 0;
`;

const RecordThumb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: ${(p) => (p.theme.mode === 'dark' ? '#222' : '#eee')};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RecordMeta = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 4px;
  }

  .time {
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }

  .desc {
    font-size: 13px;
    margin-top: 4px;
    word-break: break-word;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)')};
  }

  .params {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin-top: 6px;
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)')};
  }

  .param-item {
    white-space: nowrap;
  }

  .prompt {
    font-size: 12px;
    margin: 4px 0 0 !important;
    word-break: break-word;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)')};
  }

  .error {
    font-size: 12px;
    color: #ff4d4f;
    margin-top: 4px;
    word-break: break-word;
  }
`;

interface ChannelAiOperatorModalProps {
  open: boolean;
  channelId?: number;
  channelName?: string;
  onClose: () => void;
  onPostTriggered?: () => void;
}

type DraftMap = Record<number, Partial<CommunityAiOperator>>;
type RecordFilter = 'ALL' | 'POST_PUBLISH' | 'GENERATE_IMAGE';

const POST_SOURCE_OPTIONS = [
  { value: 'AI_GENERATE', label: 'AI 生图发帖' },
  { value: 'STOCK_POOL', label: '素材库发帖' },
];

const ACTION_TYPE_LABEL: Record<string, string> = {
  POST_PUBLISH: '发帖',
  GENERATE_IMAGE: '生图',
};

const PUBLISH_STATUS_LABEL: Record<string, string> = {
  PUBLISHED: '已发布',
  FAILED: '发布失败',
  STOCK_SAVED: '已入库',
  SKIPPED: '未自动发布',
  ALREADY_PUBLISHED: '已发布过',
};

const renderSizeLabel = (record: CommunityAiOperatorPostRecord) => {
  if (record.size) return record.size;
  if (record.width && record.height) return `${record.width}×${record.height}`;
  return null;
};

const renderGenerationParamItems = (
  record: CommunityAiOperatorPostRecord,
  intl: ReturnType<typeof useIntl>
) => {
  const items: string[] = [];
  const size = renderSizeLabel(record);
  if (size) {
    items.push(`${intl.formatMessage({ id: 'community.aiOperator.record.size', defaultMessage: '尺寸' })}: ${size}`);
  }
  if (record.taskId) {
    items.push(`${intl.formatMessage({ id: 'community.aiOperator.record.taskId', defaultMessage: '任务' })}: #${record.taskId}`);
  }
  if (record.stockId) {
    items.push(`${intl.formatMessage({ id: 'community.aiOperator.record.stockId', defaultMessage: '素材' })}: #${record.stockId}`);
  }
  if (record.channelId) {
    items.push(`${intl.formatMessage({ id: 'community.aiOperator.record.channelId', defaultMessage: '频道' })}: #${record.channelId}`);
  }
  if (record.publishStatus) {
    items.push(`${intl.formatMessage({ id: 'community.aiOperator.record.publishStatus', defaultMessage: '发布状态' })}: ${PUBLISH_STATUS_LABEL[record.publishStatus] || record.publishStatus}`);
  }
  if (record.syncCompleted != null) {
    items.push(`${intl.formatMessage({ id: 'community.aiOperator.record.syncCompleted', defaultMessage: '同步完成' })}: ${record.syncCompleted ? '是' : '否'}`);
  }
  return items;
};

interface OperatorPostRecordsProps {
  operatorId: number;
}

const OperatorPostRecords: React.FC<OperatorPostRecordsProps> = ({ operatorId }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<RecordFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<CommunityAiOperatorPostRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 8;

  const getPostStatus = (status?: number) => {
    if (status == null) return null;
    const map: Record<number, { color: string; label: string }> = {
      0: { color: 'orange', label: intl.formatMessage({ id: 'community.aiOperator.postStatus.pending', defaultMessage: '审核中' }) },
      1: { color: 'green', label: intl.formatMessage({ id: 'community.aiOperator.postStatus.published', defaultMessage: '已发布' }) },
      2: { color: 'default', label: intl.formatMessage({ id: 'community.aiOperator.postStatus.private', defaultMessage: '私有' }) },
      9: { color: 'red', label: intl.formatMessage({ id: 'community.aiOperator.postStatus.violation', defaultMessage: '违规' }) },
    };
    return map[status] || null;
  };

  const loadRecords = useCallback(async (nextPage = 1, append = false) => {
    setLoading(true);
    try {
      const actionType = filter === 'ALL' ? undefined : filter;
      const result = await listAiOperatorPostRecords(operatorId, nextPage, pageSize, actionType);
      setRecords((prev) => (append ? [...prev, ...result.data] : result.data));
      setTotal(result.totalNum || 0);
      setPage(nextPage);
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'community.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  }, [filter, intl, operatorId]);

  useEffect(() => {
    loadRecords(1, false);
  }, [loadRecords]);

  const hasMore = records.length < total;

  return (
    <SectionCard>
      <RecordsToolbar>
        <Radio.Group
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="ALL">
            {intl.formatMessage({ id: 'community.aiOperator.record.all', defaultMessage: '全部' })}
          </Radio.Button>
          <Radio.Button value="POST_PUBLISH">
            {intl.formatMessage({ id: 'community.aiOperator.record.post', defaultMessage: '发帖' })}
          </Radio.Button>
          <Radio.Button value="GENERATE_IMAGE">
            {intl.formatMessage({ id: 'community.aiOperator.record.generate', defaultMessage: '生图' })}
          </Radio.Button>
        </Radio.Group>
        <Button size="small" icon={<ReloadOutlined />} loading={loading} onClick={() => loadRecords(1, false)}>
          <FormattedMessage id="common.refresh" defaultMessage="刷新" />
        </Button>
      </RecordsToolbar>

      {loading && records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : records.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={intl.formatMessage({ id: 'community.aiOperator.record.empty', defaultMessage: '暂无发帖记录' })}
          style={{ padding: '24px 0' }}
        />
      ) : (
        <>
          <RecordList>
            {records.map((record) => {
              const postStatus = getPostStatus(record.postStatus);
              const isSuccess = record.actionResult === 'SUCCESS';
              return (
                <RecordItem key={record.id}>
                  <RecordThumb>
                    {record.imageUrl ? (
                      <img src={record.imageUrl} alt="" />
                    ) : (
                      <RobotOutlined style={{ fontSize: 18, opacity: 0.35 }} />
                    )}
                  </RecordThumb>
                  <RecordMeta>
                    <div className="tags">
                      <Tag style={{ margin: 0 }}>{ACTION_TYPE_LABEL[record.actionType] || record.actionType}</Tag>
                      <Tag
                        style={{ margin: 0 }}
                        icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        color={isSuccess ? 'success' : 'error'}
                      >
                        {isSuccess
                          ? intl.formatMessage({ id: 'community.aiOperator.record.success', defaultMessage: '成功' })
                          : intl.formatMessage({ id: 'community.aiOperator.record.failed', defaultMessage: '失败' })}
                      </Tag>
                      {postStatus && <Tag style={{ margin: 0 }} color={postStatus.color}>{postStatus.label}</Tag>}
                      {record.postId != null && <Tag style={{ margin: 0 }} color="blue">#{record.postId}</Tag>}
                    </div>
                    <div className="time">{record.createTime}</div>
                    {record.actionDescription && <div className="desc">{record.actionDescription}</div>}
                    {record.modelCode && (
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        {intl.formatMessage({ id: 'community.aiOperator.model', defaultMessage: '生图模型' })}: {record.modelCode}
                      </Text>
                    )}
                    {renderGenerationParamItems(record, intl).length > 0 && (
                      <div className="params">
                        {renderGenerationParamItems(record, intl).map((item) => (
                          <span key={item} className="param-item">{item}</span>
                        ))}
                      </div>
                    )}
                    {record.negativePrompt && (
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                        {intl.formatMessage({ id: 'community.aiOperator.record.negativePrompt', defaultMessage: '负向提示词' })}: {record.negativePrompt}
                      </Text>
                    )}
                    {record.prompt && (
                      <Paragraph className="prompt" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                        {record.prompt}
                      </Paragraph>
                    )}
                    {record.postLikeCount != null && record.postViewCount != null && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {intl.formatMessage(
                          { id: 'community.aiOperator.record.stats', defaultMessage: '浏览 {views} · 点赞 {likes}' },
                          { views: record.postViewCount, likes: record.postLikeCount }
                        )}
                      </Text>
                    )}
                    {(record.errorMessage || record.publishError) && (
                      <div className="error">{record.publishError || record.errorMessage}</div>
                    )}
                    {record.postId && (
                      <Button
                        type="link"
                        size="small"
                        icon={<LinkOutlined />}
                        style={{ padding: 0, height: 'auto', marginTop: 4 }}
                        onClick={() => navigate(`/community/post/${record.postId}`)}
                      >
                        <FormattedMessage id="community.aiOperator.record.viewPost" defaultMessage="查看帖子" />
                      </Button>
                    )}
                  </RecordMeta>
                </RecordItem>
              );
            })}
          </RecordList>
          {hasMore && (
            <div style={{ textAlign: 'center', paddingBottom: 16 }}>
              <Button loading={loading} onClick={() => loadRecords(page + 1, true)}>
                <FormattedMessage id="common.loadMore" defaultMessage="加载更多" />
              </Button>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
};

const LANGUAGE_STYLE_LABELS: Record<string, string> = {
  PROFESSIONAL: '专业',
  CASUAL: '轻松',
  FRIENDLY: '友好',
  FORMAL: '正式',
};

const isMeaningfulTemplate = (value?: string) => {
  const trimmed = value?.trim();
  return Boolean(trimmed && trimmed !== '{}');
};

interface OperatorProfilePanelProps {
  operator: Partial<CommunityAiOperator>;
}

const OperatorProfilePanel: React.FC<OperatorProfilePanelProps> = ({ operator }) => {
  const intl = useIntl();
  const displayName = operator.nickname || operator.internalName || operator.username || `#${operator.userId}`;

  const handleCopyPrompt = async (text?: string) => {
    if (!text?.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      message.success(intl.formatMessage({ id: 'common.copied', defaultMessage: '已复制到剪贴板' }));
    } catch {
      message.error(intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    }
  };

  const languageLabel = operator.languageStyle
    ? LANGUAGE_STYLE_LABELS[operator.languageStyle] || operator.languageStyle
    : null;

  return (
    <SectionCard>
      <ProfileHeader>
        <Avatar src={operator.avatar} size={48} icon={<UserOutlined />} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: 15 }}>{displayName}</Text>
          {operator.internalName && operator.internalName !== displayName && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{operator.internalName}</Text>
            </div>
          )}
          {operator.username && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>@{operator.username}</Text>
            </div>
          )}
        </div>
      </ProfileHeader>
      <ProfileBody>
        <InfoBlock>
          <span className="title">
            <FormattedMessage id="community.aiOperator.expertise" defaultMessage="擅长领域" />
          </span>
          {operator.personaPreset ? (
            <span className="content">{operator.personaPreset}</span>
          ) : (
            <Text type="secondary">
              <FormattedMessage id="community.aiOperator.expertiseEmpty" defaultMessage="未配置擅长领域" />
            </Text>
          )}
          {operator.userDescription && (
            <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.6 }}>
              {operator.userDescription}
            </Text>
          )}
        </InfoBlock>

        {(operator.interestedTags?.length || operator.excludeTags?.length || languageLabel) ? (
          <InfoBlock>
            <span className="title">
              <FormattedMessage id="community.aiOperator.tags" defaultMessage="标签与风格" />
            </span>
            {languageLabel && (
              <TagRow>
                <Tag color="blue">
                  <FormattedMessage id="community.aiOperator.languageStyle" defaultMessage="语言风格" />
                  : {languageLabel}
                </Tag>
              </TagRow>
            )}
            {operator.interestedTags && operator.interestedTags.length > 0 && (
              <TagRow>
                {operator.interestedTags.map((tag) => (
                  <Tag key={`in-${tag}`} color="processing">{tag}</Tag>
                ))}
              </TagRow>
            )}
            {operator.excludeTags && operator.excludeTags.length > 0 && (
              <TagRow>
                {operator.excludeTags.map((tag) => (
                  <Tag key={`ex-${tag}`} color="default">
                    <FormattedMessage id="community.aiOperator.excludeTag" defaultMessage="避雷" />: {tag}
                  </Tag>
                ))}
              </TagRow>
            )}
          </InfoBlock>
        ) : null}

        <InfoBlock>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <span className="title">
              <FormattedMessage id="community.aiOperator.systemPrompt" defaultMessage="系统提示词" />
            </span>
            {operator.generationSystemPrompt && (
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopyPrompt(operator.generationSystemPrompt)}
                style={{ padding: 0, height: 'auto' }}
              >
                <FormattedMessage id="common.copy" defaultMessage="复制" />
              </Button>
            )}
          </Space>
          {operator.generationSystemPrompt ? (
            <PromptBox
              readOnly
              value={operator.generationSystemPrompt}
              autoSize={{ minRows: 6, maxRows: 14 }}
            />
          ) : (
            <Text type="secondary">
              <FormattedMessage id="community.aiOperator.systemPromptEmpty" defaultMessage="暂无系统提示词" />
            </Text>
          )}
          <Text type="secondary" style={{ fontSize: 11 }}>
            <FormattedMessage
              id="community.aiOperator.systemPromptHint"
              defaultMessage="发帖时 DeepSeek 使用此系统提示词生成作品标题与英文生图提示词"
            />
          </Text>
        </InfoBlock>

        {isMeaningfulTemplate(operator.postPromptTemplate) && (
          <InfoBlock>
            <span className="title">
              <FormattedMessage id="community.aiOperator.promptTemplate" defaultMessage="提示词模板（兜底）" />
            </span>
            <PromptBox
              readOnly
              value={operator.postPromptTemplate}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </InfoBlock>
        )}
      </ProfileBody>
    </SectionCard>
  );
};

interface OperatorConfigPanelProps {
  draft: Partial<CommunityAiOperator>;
  modelOptions: { value: string; label: string }[];
  channelOptions: { value: number; label: string }[];
  saving: boolean;
  onDraftChange: (patch: Partial<CommunityAiOperator>) => void;
  onSave: () => void;
  onTrigger: () => void;
}

const OperatorConfigPanel: React.FC<OperatorConfigPanelProps> = ({
  draft,
  modelOptions,
  channelOptions,
  saving,
  onDraftChange,
  onSave,
  onTrigger,
}) => {
  const intl = useIntl();
  const isAiGenerate = draft.postSourceType === 'AI_GENERATE';

  return (
    <SectionCard>
      <FieldList>
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.channel" defaultMessage="发帖频道" />
          </span>
          <Select
            showSearch
            optionFilterProp="label"
            className="control"
            placeholder={intl.formatMessage({
              id: 'community.aiOperator.channelPlaceholder',
              defaultMessage: '选择发帖频道',
            })}
            value={draft.channelId}
            options={channelOptions}
            onChange={(value) => onDraftChange({ channelId: value })}
          />
        </FieldRow>
        <SwitchRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.status" defaultMessage="运行状态" />
          </span>
          <Switch checked={Boolean(draft.status)} onChange={(checked) => onDraftChange({ status: checked })} />
        </SwitchRow>
        <SwitchRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.canPost" defaultMessage="允许发帖" />
          </span>
          <Switch checked={Boolean(draft.canPost)} onChange={(checked) => onDraftChange({ canPost: checked })} />
        </SwitchRow>
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.postSource" defaultMessage="发帖来源" />
          </span>
          <Select
            className="control"
            value={draft.postSourceType || 'STOCK_POOL'}
            options={POST_SOURCE_OPTIONS}
            onChange={(value) => onDraftChange({ postSourceType: value })}
          />
        </FieldRow>
        {isAiGenerate && (
          <FieldRow>
            <span className="label">
              <FormattedMessage id="community.aiOperator.model" defaultMessage="生图模型" />
            </span>
            <Select
              showSearch
              optionFilterProp="label"
              className="control"
              placeholder={intl.formatMessage({ id: 'community.aiOperator.modelPlaceholder', defaultMessage: '选择生图模型' })}
              value={draft.generationModelCode}
              options={modelOptions}
              onChange={(value) => onDraftChange({ generationModelCode: value })}
            />
          </FieldRow>
        )}
        {isAiGenerate && (
          <FieldRow>
            <span className="label">
              <FormattedMessage id="community.aiOperator.generationImageCount" defaultMessage="生图数量" />
            </span>
            <InputNumber
              className="control"
              style={{ width: '100%' }}
              min={1}
              max={4}
              value={draft.generationImageCount ?? 1}
              onChange={(value) => onDraftChange({ generationImageCount: value ?? 1 })}
            />
          </FieldRow>
        )}
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.activeTime" defaultMessage="活跃时段" />
          </span>
          <Input
            className="control"
            value={draft.activeTimeRange || ''}
            placeholder="09:00-22:00"
            onChange={(e) => onDraftChange({ activeTimeRange: e.target.value })}
          />
        </FieldRow>
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.actionsPerDay" defaultMessage="日互动上限" />
          </span>
          <InputNumber
            className="control"
            style={{ width: '100%' }}
            min={1}
            max={999}
            value={draft.actionsPerDay}
            onChange={(value) => onDraftChange({ actionsPerDay: value ?? undefined })}
          />
        </FieldRow>
        {draft.lastActionTime && (
          <FieldRow>
            <span className="label">
              <FormattedMessage id="community.aiOperator.lastAction" defaultMessage="上次行为" />
            </span>
            <Text type="secondary">{draft.lastActionTime}</Text>
          </FieldRow>
        )}
      </FieldList>
      <ActionBar>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>
          <FormattedMessage id="common.save" defaultMessage="保存" />
        </Button>
        <Tooltip
          title={
            !draft.canPost
              ? intl.formatMessage({ id: 'community.aiOperator.needCanPost', defaultMessage: '请先开启「允许发帖」' })
              : intl.formatMessage({
                  id: 'community.aiOperator.triggerHint',
                  defaultMessage: '可勾选同时发布到提示词商城',
                })
          }
        >
          <Button icon={<PlayCircleOutlined />} disabled={!draft.canPost} onClick={onTrigger}>
            <FormattedMessage id="community.aiOperator.triggerPost" defaultMessage="立即发帖" />
          </Button>
        </Tooltip>
      </ActionBar>
    </SectionCard>
  );
};

const ChannelAiOperatorModal: React.FC<ChannelAiOperatorModalProps> = ({
  open,
  channelId,
  channelName,
  onClose,
  onPostTriggered,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<CommunityAiOperator[]>([]);
  const [models, setModels] = useState<TextToImageModel[]>([]);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [triggerOperatorId, setTriggerOperatorId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [contentTab, setContentTab] = useState('config');

  const loadData = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const [operatorList, modelList, channelList] = await Promise.all([
        listChannelAiOperators(channelId),
        listTextToImageModels().catch(() => []),
        listChannels().catch(() => []),
      ]);
      setOperators(operatorList);
      setModels(modelList);
      setChannels(channelList.filter((ch) => ch.channelKey !== 'daily-challenge'));
      const initialDrafts: DraftMap = {};
      operatorList.forEach((op) => {
        initialDrafts[op.id] = { ...op };
      });
      setDrafts(initialDrafts);
      if (operatorList.length > 0) {
        setSelectedId((prev) => (prev && operatorList.some((o) => o.id === prev) ? prev : operatorList[0].id));
      } else {
        setSelectedId(null);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'community.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  }, [channelId, intl]);

  useEffect(() => {
    if (open && channelId) {
      loadData();
      setContentTab('config');
    }
  }, [open, channelId, loadData]);

  const selectedOperator = useMemo(
    () => operators.find((op) => op.id === selectedId) || null,
    [operators, selectedId]
  );

  const draft = selectedId ? drafts[selectedId] : undefined;

  const updateDraft = (id: number, patch: Partial<CommunityAiOperator>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const handleSave = async (operatorId: number) => {
    const currentDraft = drafts[operatorId];
    if (!currentDraft) return;
    setSavingId(operatorId);
    try {
      const updated = await updateChannelAiOperator({
        id: operatorId,
        nickname: currentDraft.nickname?.trim() || undefined,
        channelId: currentDraft.channelId,
        canPost: currentDraft.canPost,
        postSourceType: currentDraft.postSourceType,
        generationModelCode: currentDraft.generationModelCode,
        generationImageCount: currentDraft.generationImageCount ?? 1,
        generationMediaType: currentDraft.generationMediaType || 'IMAGE',
        status: currentDraft.status,
        activeTimeRange: currentDraft.activeTimeRange,
        actionsPerDay: currentDraft.actionsPerDay,
        postFrequencyDays: currentDraft.postFrequencyDays,
      });

      const transferred = updated.channelId != null && updated.channelId !== channelId;
      if (transferred) {
        setOperators((prev) => {
          const remaining = prev.filter((op) => op.id !== operatorId);
          setSelectedId((selected) => {
            if (remaining.length === 0) return null;
            if (selected === operatorId) return remaining[0].id;
            return selected;
          });
          return remaining;
        });
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[operatorId];
          return next;
        });
        const targetName = channels.find((ch) => ch.id === updated.channelId)?.name;
        message.success(
          intl.formatMessage(
            {
              id: 'community.aiOperator.transferSuccess',
              defaultMessage: '已转移至频道「{channel}」',
            },
            { channel: targetName || updated.channelId }
          )
        );
      } else {
        setOperators((prev) => prev.map((op) => (op.id === operatorId ? updated : op)));
        setDrafts((prev) => ({ ...prev, [operatorId]: { ...updated } }));
        message.success(intl.formatMessage({ id: 'community.aiOperator.saveSuccess', defaultMessage: '配置已保存' }));
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setSavingId(null);
    }
  };

  const handleOpenTriggerModal = (operatorId: number) => {
    if (!drafts[operatorId]?.canPost) return;
    setTriggerOperatorId(operatorId);
  };

  const handleTriggerSuccess = async () => {
    onPostTriggered?.();
    await loadData();
  };

  const triggerOperator = useMemo(
    () => operators.find((op) => op.id === triggerOperatorId) || null,
    [operators, triggerOperatorId]
  );

  const modelOptions = models.map((m) => ({
    value: m.modelCode,
    label: m.modelName || m.modelNameEn || m.modelCode,
  }));

  const channelOptions = channels.map((ch) => ({
    value: ch.id,
    label: ch.name || ch.channelKey,
  }));

  const getDisplayName = (op: CommunityAiOperator) => {
    const d = drafts[op.id] || op;
    return d.nickname || d.internalName || d.username || `#${op.userId}`;
  };

  return (
    <>
    <Modal
      title={
        <Space wrap>
          <RobotOutlined />
          <FormattedMessage id="community.aiOperator.title" defaultMessage="AI 运营管理" />
          {channelName && <Text type="secondary">· {channelName}</Text>}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      width="min(820px, calc(100vw - 32px))"
      styles={{
        body: { paddingTop: 12, overflow: 'hidden' },
      }}
    >
      <ModalBody>
        <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button size="small" icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            <FormattedMessage id="common.refresh" defaultMessage="刷新" />
          </Button>
        </Space>

        {loading && operators.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div>
        ) : operators.length === 0 ? (
          <Empty description={<FormattedMessage id="community.aiOperator.empty" defaultMessage="当前频道暂无 AI 运营配置" />} />
        ) : (
          <>
            <OperatorBar>
              {operators.length > 4 ? (
                <Select
                  style={{ width: '100%' }}
                  value={selectedId ?? undefined}
                  onChange={setSelectedId}
                  optionLabelProp="label"
                  options={operators.map((op) => {
                    const d = drafts[op.id] || op;
                    const name = getDisplayName(op);
                    return {
                      value: op.id,
                      label: (
                        <Space>
                          <Avatar src={d.avatar} size={20} icon={<RobotOutlined />} />
                          <span>{name}</span>
                          <Tag color={d.status ? 'green' : 'default'} style={{ margin: 0 }}>
                            {d.status
                              ? intl.formatMessage({ id: 'community.aiOperator.running', defaultMessage: '运行中' })
                              : intl.formatMessage({ id: 'community.aiOperator.paused', defaultMessage: '已暂停' })}
                          </Tag>
                        </Space>
                      ),
                    };
                  })}
                />
              ) : (
                operators.map((op) => {
                  const d = drafts[op.id] || op;
                  const name = getDisplayName(op);
                  return (
                    <OperatorChip
                      key={op.id}
                      type="button"
                      $active={selectedId === op.id}
                      onClick={() => setSelectedId(op.id)}
                    >
                      <Avatar src={d.avatar} size={24} icon={<RobotOutlined />} />
                      <span className="name">{name}</span>
                      {d.status ? (
                        <Tag color="green" style={{ margin: 0, fontSize: 11 }}>ON</Tag>
                      ) : (
                        <Tag style={{ margin: 0, fontSize: 11 }}>OFF</Tag>
                      )}
                    </OperatorChip>
                  );
                })
              )}
            </OperatorBar>

            {selectedOperator && draft && selectedId && (
              <ScrollArea>
                <Tabs
                  activeKey={contentTab}
                  onChange={setContentTab}
                  items={[
                    {
                      key: 'config',
                      label: (
                        <Space size={4}>
                          <SettingOutlined />
                          <FormattedMessage id="community.aiOperator.tab.config" defaultMessage="配置" />
                        </Space>
                      ),
                      children: (
                        <ConfigStack>
                          <OperatorProfilePanel operator={draft} />
                          <OperatorConfigPanel
                            draft={draft}
                            modelOptions={modelOptions}
                            channelOptions={channelOptions}
                            saving={savingId === selectedId}
                            onDraftChange={(patch) => updateDraft(selectedId, patch)}
                            onSave={() => handleSave(selectedId)}
                            onTrigger={() => handleOpenTriggerModal(selectedId)}
                          />
                        </ConfigStack>
                      ),
                    },
                    {
                      key: 'records',
                      label: (
                        <Space size={4}>
                          <HistoryOutlined />
                          <FormattedMessage id="community.aiOperator.tab.records" defaultMessage="发帖记录" />
                        </Space>
                      ),
                      children: <OperatorPostRecords operatorId={selectedId} />,
                    },
                  ]}
                />
              </ScrollArea>
            )}
          </>
        )}
      </ModalBody>
    </Modal>
    <AiOperatorTriggerPostModal
      open={triggerOperatorId != null}
      operatorId={triggerOperatorId}
      operatorName={triggerOperator?.nickname || triggerOperator?.internalName}
      onCancel={() => setTriggerOperatorId(null)}
      onSuccess={handleTriggerSuccess}
    />
    </>
  );
};

export default ChannelAiOperatorModal;
