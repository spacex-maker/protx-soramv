import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  App,
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
  TimePicker,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileImageOutlined,
  HistoryOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
  CopyOutlined,
  UserOutlined,
  CameraOutlined,
  LoadingOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SendOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import dayjs, { Dayjs } from 'dayjs';
import {
  CommunityAiOperator,
  CommunityAiOperatorPostRecord,
  CommunityAiOperatorPostRecordStats,
  getAiOperatorPostRecordStats,
  listAiOperatorPostRecords,
  listChannelAiOperators,
  listTextToImageModels,
  TextToImageModel,
  updateChannelAiOperator,
  uploadAiOperatorAvatar,
  getChannelAiOperatorBudget,
  AiOperatorBudgetStatus,
  getAiOperatorRuntimeStatus,
  setAiOperatorRuntimeEnabled,
} from 'api/communityAiOperator';
import { CommunityChannel, listChannels } from 'api/community';
import AiOperatorTriggerPostModal from './AiOperatorTriggerPostModal';
import ChannelAiOperatorBudgetPanel from './ChannelAiOperatorBudgetPanel';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: min(78vh, 760px);
  overflow: hidden;
`;

const SplitLayout = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const OperatorSidebar = styled.div`
  width: 268px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 640px) {
    width: 100%;
    max-height: 220px;
  }
`;

const OperatorList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 2px;
`;

const OperatorListItem = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${(p) =>
    p.$active
      ? '#3b82f6'
      : p.theme.mode === 'dark'
        ? '#2a2a2a'
        : '#e8e8e8'};
  background: ${(p) =>
    p.$active
      ? p.theme.mode === 'dark'
        ? 'rgba(59,130,246,0.12)'
        : 'rgba(59,130,246,0.06)'
      : p.theme.mode === 'dark'
        ? '#141414'
        : '#fff'};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
  }

  .avatar-wrap {
    flex-shrink: 0;
  }

  .body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .name {
    flex: 1;
    font-size: 13px;
    font-weight: ${(p) => (p.$active ? 600 : 500)};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f0f0f0' : '#1f1f1f')};
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }
`;

const MainPanel = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const BudgetBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1a1a1a' : '#f0f7ff')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#d6e8ff')};
  font-size: 12px;
`;

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const GlobalRuntimeBar = styled.div<{ $paused?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${(p) =>
    p.$paused
      ? p.theme.mode === 'dark'
        ? 'rgba(239,68,68,0.12)'
        : '#fef2f2'
      : p.theme.mode === 'dark'
        ? 'rgba(34,197,94,0.1)'
        : '#f0fdf4'};
  border: 1px solid ${(p) =>
    p.$paused
      ? p.theme.mode === 'dark'
        ? 'rgba(239,68,68,0.35)'
        : '#fecaca'
      : p.theme.mode === 'dark'
        ? 'rgba(34,197,94,0.3)'
        : '#bbf7d0'};

  .runtime-main {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .runtime-title {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
  }

  .runtime-desc {
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)')};
    line-height: 1.35;
  }
`;

const ChannelOptionWrap = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 6px 2px;
  min-width: 300px;
  max-width: 420px;
`;

const ChannelThumb = styled.div<{ $color?: string; $cover?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  background: ${(p) =>
    p.$cover
      ? `url(${p.$cover}) center/cover no-repeat`
      : `linear-gradient(135deg, ${p.$color || '#3b82f6'} 0%, ${p.$color || '#6366f1'}99 100%)`};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')};
`;

const ChannelMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`;

const SelectedChannelLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 2px 0;

  .name {
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .key {
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
    white-space: nowrap;
  }
`;

const PillChannelSelect = styled(Select)`
  &.ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    height: auto !important;
    min-height: 46px;
    padding: 6px 18px !important;
    border-radius: 9999px !important;
    display: flex;
    align-items: center;
  }

  &.ant-select-single .ant-select-selection-item {
    line-height: 1.4;
    padding-inline-end: 28px;
  }

  &.ant-select-single .ant-select-selection-search-input {
    height: 32px !important;
  }
` as typeof Select;

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

const AvatarEditWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .avatar-trigger {
    position: relative;
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
    line-height: 0;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }
  }

  .avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 18px;
  }

  .avatar-trigger:hover .avatar-overlay,
  .avatar-trigger:focus-visible .avatar-overlay {
    opacity: 1;
  }

  .avatar-fields {
    flex: 1;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
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

const RecordStatsPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#f0f0f0')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#111' : '#fafbfc')};
`;

const StatCard = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#eee')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};

  .label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
    margin-bottom: 4px;
  }

  .value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f0f0f0' : '#1f1f1f')};
  }

  .sub {
    margin-top: 4px;
    font-size: 11px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }
`;

const RecordTimelineWrap = styled.div`
  padding: 16px;

  .ant-timeline-item-content {
    min-width: 0;
  }
`;

const ImageCountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  width: 100%;
`;

const ImageCountChip = styled.button<{ $active?: boolean }>`
  height: 32px;
  border-radius: 8px;
  border: 1px solid
    ${(p) =>
      p.$active
        ? '#3b82f6'
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
  color: ${(p) => (p.$active ? '#3b82f6' : p.theme.mode === 'dark' ? '#f0f0f0' : '#1f1f1f')};
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #3b82f6;
  }
`;

const ActiveTimeWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
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

const POST_SOURCE_LABEL: Record<string, string> = {
  AI_GENERATE: 'AI 生图',
  STOCK_POOL: '素材库',
};

const POST_SOURCE_OPTIONS = [
  { value: 'AI_GENERATE', label: 'AI 生图发帖' },
  { value: 'STOCK_POOL', label: '素材库发帖' },
];

const getPostSourceLabel = (type?: string) => POST_SOURCE_LABEL[type || ''] || type || '-';

const CHANNEL_TYPE_LABEL: Record<string, string> = {
  SYSTEM: '系统',
  TAG: '标签',
  MANUAL: '手动',
};

const LAYOUT_MODE_LABEL: Record<string, string> = {
  MASONRY: '瀑布流',
  GRID: '网格',
  FEED: '信息流',
};

const filterChannelOption = (input: string, ch: CommunityChannel) => {
  const q = input.trim().toLowerCase();
  if (!q) return true;
  return [ch.name, ch.channelKey, ch.description, ch.type, ch.layoutMode].some(
    (v) => v && String(v).toLowerCase().includes(q)
  );
};

interface RichChannelSelectProps {
  channels: CommunityChannel[];
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  operatorCount?: number;
}

const RichChannelSelect: React.FC<RichChannelSelectProps> = ({
  channels,
  value,
  onChange,
  placeholder,
  className,
  style,
  operatorCount,
}) => {
  const intl = useIntl();

  const renderOption = (ch: CommunityChannel, count?: number) => (
    <ChannelOptionWrap>
      <ChannelThumb $color={ch.themeColor} $cover={ch.iconUrl || ch.coverUrl}>
        {!ch.iconUrl && !ch.coverUrl ? (ch.name?.[0] || '#') : null}
      </ChannelThumb>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text strong style={{ fontSize: 13 }}>{ch.name}</Text>
          {ch.isVipOnly && (
            <Tag icon={<CrownOutlined />} color="gold" style={{ margin: 0, fontSize: 10 }}>
              VIP
            </Tag>
          )}
          {count != null && count > 0 && (
            <Tag icon={<RobotOutlined />} color="processing" style={{ margin: 0, fontSize: 10 }}>
              {count} {intl.formatMessage({ id: 'community.aiOperator.channel.aiOps', defaultMessage: 'AI运营' })}
            </Tag>
          )}
        </div>
        <Text type="secondary" style={{ fontSize: 11 }}>
          /{ch.channelKey}
        </Text>
        {ch.description && (
          <Text
            type="secondary"
            ellipsis
            style={{ fontSize: 11, display: 'block', marginTop: 2, lineHeight: 1.4 }}
          >
            {ch.description}
          </Text>
        )}
        <ChannelMetaRow>
          {ch.type && (
            <Tag style={{ margin: 0, fontSize: 10 }}>
              {CHANNEL_TYPE_LABEL[ch.type] || ch.type}
            </Tag>
          )}
          {ch.layoutMode && (
            <Tag style={{ margin: 0, fontSize: 10 }}>
              {LAYOUT_MODE_LABEL[ch.layoutMode] || ch.layoutMode}
            </Tag>
          )}
          {ch.postCount != null && ch.postCount >= 0 && (
            <Tag style={{ margin: 0, fontSize: 10 }}>
              {intl.formatMessage(
                { id: 'community.aiOperator.channel.postCount', defaultMessage: '{count} 帖' },
                { count: ch.postCount }
              )}
            </Tag>
          )}
          {ch.allowUserPost === false && (
            <Tag style={{ margin: 0, fontSize: 10 }}>
              {intl.formatMessage({ id: 'community.aiOperator.channel.noUserPost', defaultMessage: '禁用户发帖' })}
            </Tag>
          )}
        </ChannelMetaRow>
      </div>
    </ChannelOptionWrap>
  );

  const selectedChannel = channels.find((ch) => ch.id === value);

  return (
    <PillChannelSelect
      className={className}
      style={style}
      showSearch
      value={value}
      placeholder={placeholder}
      popupMatchSelectWidth={false}
      styles={{ popup: { root: { minWidth: 340 } } }}
      optionLabelProp="label"
      onChange={onChange}
      filterOption={(input, option) => {
        const data = option as { channel?: CommunityChannel; data?: { channel?: CommunityChannel } };
        const ch = data.channel ?? data.data?.channel;
        return ch ? filterChannelOption(input, ch) : false;
      }}
      labelRender={() => {
        if (!selectedChannel) return null;
        return (
          <SelectedChannelLabel>
            <Avatar
              size={32}
              src={selectedChannel.iconUrl}
              style={{ backgroundColor: selectedChannel.themeColor || '#3b82f6', flexShrink: 0 }}
            >
              {selectedChannel.name?.[0]}
            </Avatar>
            <span className="name">{selectedChannel.name}</span>
            <span className="key">/{selectedChannel.channelKey}</span>
            {selectedChannel.isVipOnly && (
              <Tag color="gold" style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>VIP</Tag>
            )}
          </SelectedChannelLabel>
        );
      }}
      options={channels.map((ch) => ({
        value: ch.id,
        label: ch.name || ch.channelKey,
        channel: ch,
      }))}
      optionRender={(option) => {
        const data = option.data as { channel?: CommunityChannel } | undefined;
        const ch = data?.channel ?? channels.find((c) => c.id === option.value);
        if (!ch) return null;
        const count = ch.id === value ? operatorCount : undefined;
        return renderOption(ch, count);
      }}
    />
  );
};

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

const ACTIVE_TIME_PRESETS = [
  { key: 'allDay', value: '' },
  { key: 'daytime', value: '09:00-18:00' },
  { key: 'business', value: '09:00-22:00' },
  { key: 'evening', value: '19:00-23:00' },
  { key: 'night', value: '22:00-06:00' },
] as const;

const parseActiveTimeRange = (value?: string): [Dayjs, Dayjs] | null => {
  if (!value?.trim()) return null;
  const parts = value.split('-');
  if (parts.length !== 2) return null;
  const start = dayjs(parts[0].trim(), 'HH:mm', true);
  const end = dayjs(parts[1].trim(), 'HH:mm', true);
  if (!start.isValid() || !end.isValid()) return null;
  return [start, end];
};

const formatActiveTimeRange = (range: [Dayjs, Dayjs] | null): string => {
  if (!range) return '';
  return `${range[0].format('HH:mm')}-${range[1].format('HH:mm')}`;
};

interface ActiveTimeRangeFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

const ActiveTimeRangeField: React.FC<ActiveTimeRangeFieldProps> = ({ value, onChange }) => {
  const intl = useIntl();
  const normalized = value?.trim() || '';
  const parsed = useMemo(() => parseActiveTimeRange(normalized), [normalized]);
  const isAllDay = !normalized;

  return (
    <ActiveTimeWrap>
      <Space wrap size={[6, 6]}>
        {ACTIVE_TIME_PRESETS.map((preset) => (
          <Tag.CheckableTag
            key={preset.key}
            checked={preset.value === normalized}
            onChange={() => onChange(preset.value)}
          >
            {intl.formatMessage({
              id: `community.aiOperator.activeTimePreset.${preset.key}`,
              defaultMessage: preset.key,
            })}
          </Tag.CheckableTag>
        ))}
      </Space>
      <TimePicker.RangePicker
        format="HH:mm"
        minuteStep={15}
        needConfirm={false}
        placeholder={[
          intl.formatMessage({ id: 'community.aiOperator.activeTimeStart', defaultMessage: '开始时间' }),
          intl.formatMessage({ id: 'community.aiOperator.activeTimeEnd', defaultMessage: '结束时间' }),
        ]}
        value={parsed}
        onChange={(times) => onChange(formatActiveTimeRange(times as [Dayjs, Dayjs] | null))}
        style={{ width: '100%' }}
      />
      <Text type="secondary" style={{ fontSize: 11 }}>
        {isAllDay
          ? intl.formatMessage({ id: 'community.aiOperator.activeTimeAllDayHint', defaultMessage: '全天活跃，不限时段' })
          : intl.formatMessage(
              { id: 'community.aiOperator.activeTimeCustomHint', defaultMessage: '当前时段：{range}' },
              { range: normalized }
            )}
      </Text>
    </ActiveTimeWrap>
  );
};

interface ImageCountQuickSelectProps {
  value: number;
  onChange: (value: number) => void;
}

const ImageCountQuickSelect: React.FC<ImageCountQuickSelectProps> = ({ value, onChange }) => (
  <ImageCountGrid>
    {Array.from({ length: 15 }, (_, index) => index + 1).map((count) => (
      <ImageCountChip
        key={count}
        type="button"
        $active={value === count}
        onClick={() => onChange(count)}
      >
        {count}
      </ImageCountChip>
    ))}
  </ImageCountGrid>
);

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

const RecordTimelineContent: React.FC<{
  record: CommunityAiOperatorPostRecord;
  postStatus: { color: string; label: string } | null;
  isSuccess: boolean;
  intl: ReturnType<typeof useIntl>;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ record, postStatus, isSuccess, intl, navigate }) => (
  <RecordItem style={{ marginTop: 4 }}>
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

const OperatorPostRecords: React.FC<OperatorPostRecordsProps> = ({ operatorId }) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<RecordFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<CommunityAiOperatorPostRecordStats | null>(null);
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

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getAiOperatorPostRecordStats(operatorId);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [operatorId]);

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

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStats(), loadRecords(1, false)]);
  }, [loadStats, loadRecords]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadRecords(1, false);
  }, [loadRecords]);

  const hasMore = records.length < total;

  return (
    <SectionCard>
      <RecordStatsPanel>
        <StatCard>
          <div className="label">
            <SendOutlined />
            <FormattedMessage id="community.aiOperator.record.statPosts" defaultMessage="发帖" />
          </div>
          <div className="value">{statsLoading ? '—' : (stats?.totalPosts ?? 0)}</div>
          <div className="sub">
            <FormattedMessage
              id="community.aiOperator.record.statSuccessFailed"
              defaultMessage="成功 {success} · 失败 {failed}"
              values={{ success: stats?.postSuccess ?? 0, failed: stats?.postFailed ?? 0 }}
            />
          </div>
        </StatCard>
        <StatCard>
          <div className="label">
            <FileImageOutlined />
            <FormattedMessage id="community.aiOperator.record.statGenerates" defaultMessage="生图" />
          </div>
          <div className="value">{statsLoading ? '—' : (stats?.totalGenerates ?? 0)}</div>
          <div className="sub">
            <FormattedMessage
              id="community.aiOperator.record.statSuccessFailed"
              defaultMessage="成功 {success} · 失败 {failed}"
              values={{ success: stats?.generateSuccess ?? 0, failed: stats?.generateFailed ?? 0 }}
            />
          </div>
        </StatCard>
        <StatCard>
          <div className="label">
            <HistoryOutlined />
            <FormattedMessage id="community.aiOperator.record.statTotal" defaultMessage="总行为" />
          </div>
          <div className="value">{statsLoading ? '—' : (stats?.totalActions ?? 0)}</div>
          <div className="sub">
            {stats?.firstActionTime && stats?.lastActionTime ? (
              <FormattedMessage
                id="community.aiOperator.record.statRange"
                defaultMessage="{first} ~ {last}"
                values={{
                  first: dayjs(stats.firstActionTime).format('MM-DD HH:mm'),
                  last: dayjs(stats.lastActionTime).format('MM-DD HH:mm'),
                }}
              />
            ) : (
              <FormattedMessage id="community.aiOperator.record.statNoRange" defaultMessage="暂无时间范围" />
            )}
          </div>
        </StatCard>
      </RecordStatsPanel>

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
        <Button size="small" icon={<ReloadOutlined />} loading={loading || statsLoading} onClick={refreshAll}>
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
          <RecordTimelineWrap>
            <Timeline
              mode="left"
              items={records.map((record) => {
                const postStatus = getPostStatus(record.postStatus);
                const isSuccess = record.actionResult === 'SUCCESS';
                const isPost = record.actionType === 'POST_PUBLISH';
                return {
                  key: record.id,
                  color: isSuccess ? 'green' : 'red',
                  dot: isPost ? <SendOutlined /> : <FileImageOutlined />,
                  label: (
                    <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {record.createTime ? dayjs(record.createTime).format('MM-DD HH:mm') : '—'}
                    </Text>
                  ),
                  children: (
                    <RecordTimelineContent
                      record={record}
                      postStatus={postStatus}
                      isSuccess={isSuccess}
                      intl={intl}
                      navigate={navigate}
                    />
                  ),
                };
              })}
            />
          </RecordTimelineWrap>
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
  const { message } = App.useApp();
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
        </InfoBlock>

        {operator.userDescription && (
          <InfoBlock>
            <span className="title">
              <FormattedMessage id="community.aiOperator.userDescription" defaultMessage="个人介绍" />
            </span>
            <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.6 }}>
              {operator.userDescription}
            </Text>
          </InfoBlock>
        )}

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
  channels: CommunityChannel[];
  saving: boolean;
  runtimeEnabled: boolean;
  onDraftChange: (patch: Partial<CommunityAiOperator>) => void;
  onSave: () => void;
  onTrigger: () => void;
}

const OperatorConfigPanel: React.FC<OperatorConfigPanelProps> = ({
  draft,
  modelOptions,
  channels,
  saving,
  runtimeEnabled,
  onDraftChange,
  onSave,
  onTrigger,
}) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const isAiGenerate = draft.postSourceType === 'AI_GENERATE';
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !draft.id) return;

    if (!file.type.startsWith('image/')) {
      message.error(intl.formatMessage({ id: 'profile.message.coverTypeInvalid', defaultMessage: '只能上传图片文件' }));
      return;
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error(intl.formatMessage({ id: 'profile.message.coverSizeLimit', defaultMessage: '背景图大小不能超过 5MB' }));
      return;
    }

    setAvatarUploading(true);
    try {
      const avatarUrl = await uploadAiOperatorAvatar(draft.id, file);
      onDraftChange({ avatar: avatarUrl });
      message.success(intl.formatMessage({ id: 'profile.message.avatarUploadSuccess', defaultMessage: '头像上传成功' }));
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'profile.message.uploadAvatarFailed', defaultMessage: '头像上传失败' }));
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <SectionCard>
      <FieldList>
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.avatar" defaultMessage="头像" />
          </span>
          <AvatarEditWrap className="control">
            <button
              type="button"
              className="avatar-trigger"
              disabled={avatarUploading || !draft.id}
              onClick={() => avatarInputRef.current?.click()}
            >
              <Avatar src={draft.avatar} size={56} icon={<UserOutlined />} />
              <span className="avatar-overlay">
                {avatarUploading ? <LoadingOutlined spin /> : <CameraOutlined />}
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarFileChange}
            />
            <div className="avatar-fields">
              <Input
                value={draft.avatar || ''}
                placeholder={intl.formatMessage({
                  id: 'community.aiOperator.avatarUrlPlaceholder',
                  defaultMessage: '头像链接，或点击左侧上传',
                })}
                onChange={(event) => onDraftChange({ avatar: event.target.value })}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                <FormattedMessage
                  id="community.aiOperator.avatarHint"
                  defaultMessage="保存后同步至社区个人主页，普通用户可见"
                />
              </Text>
            </div>
          </AvatarEditWrap>
        </FieldRow>
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.nickname" defaultMessage="用户昵称" />
          </span>
          <Input
            className="control"
            value={draft.nickname || ''}
            maxLength={32}
            placeholder={intl.formatMessage({
              id: 'community.aiOperator.nicknamePlaceholder',
              defaultMessage: '社区展示昵称',
            })}
            onChange={(event) => onDraftChange({ nickname: event.target.value })}
          />
        </FieldRow>
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.userDescription" defaultMessage="个人介绍" />
          </span>
          <TextArea
            className="control"
            value={draft.userDescription || ''}
            maxLength={200}
            showCount
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder={intl.formatMessage({
              id: 'community.aiOperator.userDescriptionPlaceholder',
              defaultMessage: '像普通用户一样写一句自我介绍，避免模型名、频道名等运营话术',
            })}
            onChange={(event) => onDraftChange({ userDescription: event.target.value })}
          />
        </FieldRow>
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.channel" defaultMessage="发帖频道" />
          </span>
          <RichChannelSelect
            className="control"
            channels={channels}
            value={draft.channelId}
            placeholder={intl.formatMessage({
              id: 'community.aiOperator.channelPlaceholder',
              defaultMessage: '选择发帖频道',
            })}
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
            <div className="control">
              <ImageCountQuickSelect
                value={draft.generationImageCount ?? 1}
                onChange={(count) => onDraftChange({ generationImageCount: count })}
              />
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
                <FormattedMessage
                  id="community.aiOperator.generationImageCountHint"
                  defaultMessage="每次发帖 AI 生成的图片数量（1-15 张）"
                />
              </Text>
            </div>
          </FieldRow>
        )}
        <FieldRow>
          <span className="label">
            <FormattedMessage id="community.aiOperator.activeTime" defaultMessage="活跃时段" />
          </span>
          <div className="control">
            <ActiveTimeRangeField
              value={draft.activeTimeRange || ''}
              onChange={(activeTimeRange) => onDraftChange({ activeTimeRange })}
            />
          </div>
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
            !runtimeEnabled
              ? intl.formatMessage({
                  id: 'community.aiOperator.runtime.pausedHint',
                  defaultMessage: '已暂停全部自动调度与手动触发，开启后恢复',
                })
              : !draft.canPost
              ? intl.formatMessage({ id: 'community.aiOperator.needCanPost', defaultMessage: '请先开启「允许发帖」' })
              : intl.formatMessage({
                  id: 'community.aiOperator.triggerHint',
                  defaultMessage: '可勾选同时发布到提示词商城',
                })
          }
        >
          <Button
            icon={<PlayCircleOutlined />}
            disabled={!draft.canPost || !runtimeEnabled}
            onClick={onTrigger}
          >
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
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<CommunityAiOperator[]>([]);
  const [models, setModels] = useState<TextToImageModel[]>([]);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [triggerOperatorId, setTriggerOperatorId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [contentTab, setContentTab] = useState('config');
  const [activeChannelId, setActiveChannelId] = useState<number | undefined>(channelId);
  const [budgetStatus, setBudgetStatus] = useState<AiOperatorBudgetStatus | null>(null);
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);
  const [runtimeEnabled, setRuntimeEnabled] = useState(true);
  const [runtimeSwitching, setRuntimeSwitching] = useState(false);

  const loadRuntimeStatus = useCallback(async () => {
    try {
      const status = await getAiOperatorRuntimeStatus();
      setRuntimeEnabled(Boolean(status.runtimeEnabled));
    } catch {
      setRuntimeEnabled(true);
    }
  }, []);

  const handleRuntimeToggle = async (enabled: boolean) => {
    setRuntimeSwitching(true);
    try {
      const status = await setAiOperatorRuntimeEnabled(enabled);
      setRuntimeEnabled(Boolean(status.runtimeEnabled));
      message.success(
        enabled
          ? intl.formatMessage({
              id: 'community.aiOperator.runtime.enabled',
              defaultMessage: 'AI 运营已全局开启',
            })
          : intl.formatMessage({
              id: 'community.aiOperator.runtime.paused',
              defaultMessage: 'AI 运营已全局暂停',
            })
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'common.failed', defaultMessage: '操作失败' }));
    } finally {
      setRuntimeSwitching(false);
    }
  };

  const loadData = useCallback(async (targetChannelId?: number) => {
    const cid = targetChannelId ?? activeChannelId;
    if (!cid) return;
    setLoading(true);
    try {
      const [operatorList, modelList, channelList, budget] = await Promise.all([
        listChannelAiOperators(cid),
        listTextToImageModels().catch(() => []),
        listChannels().catch(() => []),
        getChannelAiOperatorBudget(cid).catch(() => null),
      ]);
      setOperators(operatorList);
      setModels(modelList);
      setChannels(channelList.filter((ch) => ch.channelKey !== 'daily-challenge'));
      setBudgetStatus(budget);
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
  }, [activeChannelId, intl]);

  useEffect(() => {
    if (open) {
      loadRuntimeStatus();
    }
  }, [open, loadRuntimeStatus]);

  useEffect(() => {
    if (open && channelId) {
      setActiveChannelId(channelId);
    }
  }, [open, channelId]);

  useEffect(() => {
    if (open && activeChannelId) {
      loadData(activeChannelId);
      setContentTab('config');
    }
  }, [open, activeChannelId, loadData]);

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
        avatar: currentDraft.avatar?.trim() || '',
        userDescription: currentDraft.userDescription?.trim() ?? '',
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

      const transferred = updated.channelId != null && updated.channelId !== activeChannelId;
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
    await loadData(activeChannelId);
    setBudgetRefreshKey((k) => k + 1);
  };

  const activeChannelName = useMemo(() => {
    if (activeChannelId === channelId && channelName) return channelName;
    return channels.find((ch) => ch.id === activeChannelId)?.name;
  }, [activeChannelId, channelId, channelName, channels]);

  const renderOperatorMeta = (op: CommunityAiOperator) => {
    const d = drafts[op.id] || op;
    const modelLabel = modelOptions.find((m) => m.value === d.generationModelCode)?.label
      || d.generationModelCode
      || '-';
    return (
      <>
        <span>{getPostSourceLabel(d.postSourceType)} · {modelLabel}</span>
        {d.lastActionTime && (
          <span><ClockCircleOutlined style={{ marginRight: 4 }} />{d.lastActionTime}</span>
        )}
        {d.periodUsedTokens != null && d.periodUsedTokens > 0 && (
          <span>{d.periodUsedTokens} Token {intl.formatMessage({ id: 'community.aiOperator.budget.usedToday', defaultMessage: '今日' })}</span>
        )}
      </>
    );
  };

  const triggerOperator = useMemo(
    () => operators.find((op) => op.id === triggerOperatorId) || null,
    [operators, triggerOperatorId]
  );

  const modelOptions = models.map((m) => ({
    value: m.modelCode,
    label: m.modelName || m.modelNameEn || m.modelCode,
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
          {activeChannelName && <Text type="secondary">· {activeChannelName}</Text>}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      width="min(960px, calc(100vw - 32px))"
      styles={{
        body: { paddingTop: 12, overflow: 'hidden' },
      }}
    >
      <ModalBody>
        <GlobalRuntimeBar $paused={!runtimeEnabled}>
          <div className="runtime-main">
            {runtimeEnabled ? (
              <RobotOutlined style={{ fontSize: 18, color: '#16a34a' }} />
            ) : (
              <PauseCircleOutlined style={{ fontSize: 18, color: '#ef4444' }} />
            )}
            <div>
              <div className="runtime-title">
                <FormattedMessage
                  id="community.aiOperator.runtime.title"
                  defaultMessage="全局运行开关"
                />
              </div>
              <div className="runtime-desc">
                {runtimeEnabled ? (
                  <FormattedMessage
                    id="community.aiOperator.runtime.runningHint"
                    defaultMessage="所有 AI 运营账号将按计划自动发帖、互动"
                  />
                ) : (
                  <FormattedMessage
                    id="community.aiOperator.runtime.pausedHint"
                    defaultMessage="已暂停全部自动调度与手动触发，开启后恢复"
                  />
                )}
              </div>
            </div>
          </div>
          <Switch
            checked={runtimeEnabled}
            loading={runtimeSwitching}
            onChange={handleRuntimeToggle}
            checkedChildren={intl.formatMessage({ id: 'community.aiOperator.runtime.on', defaultMessage: '运行' })}
            unCheckedChildren={intl.formatMessage({ id: 'community.aiOperator.runtime.off', defaultMessage: '暂停' })}
          />
        </GlobalRuntimeBar>

        <ToolbarRow>
          <RichChannelSelect
            style={{ minWidth: 240, flex: 1, maxWidth: 400 }}
            channels={channels}
            value={activeChannelId}
            operatorCount={operators.length}
            onChange={(value) => {
              setActiveChannelId(value);
              setSelectedId(null);
            }}
            placeholder={intl.formatMessage({ id: 'community.aiOperator.channelPlaceholder', defaultMessage: '选择频道' })}
          />
          <Button size="small" icon={<ReloadOutlined />} onClick={() => loadData(activeChannelId)} loading={loading}>
            <FormattedMessage id="common.refresh" defaultMessage="刷新" />
          </Button>
        </ToolbarRow>

        {budgetStatus?.enabled && (budgetStatus.budgetLimit ?? 0) > 0 && (
          <BudgetBar>
            <WalletOutlined />
            <Text style={{ fontSize: 12 }}>
              <FormattedMessage id="community.aiOperator.budget.today" defaultMessage="今日预算" />
              : {budgetStatus.usedTokens ?? 0} / {budgetStatus.budgetLimit} Token
            </Text>
            {budgetStatus.exceeded && (
              <Tag color="error" style={{ margin: 0 }}>
                <FormattedMessage id="community.aiOperator.budget.exceeded" defaultMessage="已超额" />
              </Tag>
            )}
            {budgetStatus.warning && !budgetStatus.exceeded && (
              <Tag color="warning" style={{ margin: 0 }}>
                <FormattedMessage id="community.aiOperator.budget.warning" defaultMessage="接近上限" />
              </Tag>
            )}
          </BudgetBar>
        )}

        {loading && operators.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div>
        ) : operators.length === 0 ? (
          <Empty description={<FormattedMessage id="community.aiOperator.empty" defaultMessage="当前频道暂无 AI 运营配置" />} />
        ) : (
          <SplitLayout>
            <OperatorSidebar>
              <Text type="secondary" style={{ fontSize: 12, padding: '0 4px' }}>
                <FormattedMessage id="community.aiOperator.operatorList" defaultMessage="AI 运营 ({count})" values={{ count: operators.length }} />
              </Text>
              <OperatorList>
                {operators.map((op) => {
                  const d = drafts[op.id] || op;
                  const name = getDisplayName(op);
                  return (
                    <OperatorListItem
                      key={op.id}
                      type="button"
                      $active={selectedId === op.id}
                      onClick={() => setSelectedId(op.id)}
                    >
                      <div className="avatar-wrap">
                        <Avatar src={d.avatar} size={40} icon={<RobotOutlined />} />
                      </div>
                      <div className="body">
                        <div className="head">
                          <span className="name">{name}</span>
                          <Tag color={d.status ? 'green' : 'default'} style={{ margin: 0, fontSize: 10 }}>
                            {d.status ? 'ON' : 'OFF'}
                          </Tag>
                        </div>
                        <div className="meta">{renderOperatorMeta(op)}</div>
                      </div>
                    </OperatorListItem>
                  );
                })}
              </OperatorList>
            </OperatorSidebar>

            <MainPanel>
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
                              channels={channels}
                              saving={savingId === selectedId}
                              runtimeEnabled={runtimeEnabled}
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
                      {
                        key: 'budget',
                        label: (
                          <Space size={4}>
                            <WalletOutlined />
                            <FormattedMessage id="community.aiOperator.tab.budget" defaultMessage="频道预算" />
                          </Space>
                        ),
                        children: (
                          <ChannelAiOperatorBudgetPanel
                            channelId={activeChannelId}
                            refreshKey={budgetRefreshKey}
                            onUpdated={() => {
                              loadData(activeChannelId);
                              setBudgetRefreshKey((k) => k + 1);
                            }}
                          />
                        ),
                      },
                    ]}
                  />
                </ScrollArea>
              )}
            </MainPanel>
          </SplitLayout>
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
