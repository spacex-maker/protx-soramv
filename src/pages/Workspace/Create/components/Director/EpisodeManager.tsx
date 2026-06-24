import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import directorApi, { DirectorCharacter, DirectorEpisode, DirectorProp, DirectorScene, DirectorShot } from 'api/director';
import { normalizeUrl } from '../ImageToVideo/utils';
import CoverImageUpload, {
  getCoverBorderRadius,
  POSTER_ASPECT_RATIO,
} from './CoverImageUpload';
import SceneList from './SceneList';
import SceneSettingsModal from './SceneSettingsModal';
import ShotSettingsModal from './ShotSettingsModal';
import type { ShotStudioTab } from './shotStudioShared';

const { Text } = Typography;

const EpisodeSectionCard = styled(Card)`
  border-radius: 12px;
  width: 100%;

  .ant-card-body {
    width: 100%;
    min-width: 0;
    padding: 16px;
  }
`;

const ExplorerLayout = styled.div`
  display: flex;
  gap: 0;
  min-height: 520px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  overflow: hidden;

  .dark & {
    border-color: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 992px) {
    flex-direction: column;
    min-height: auto;
  }
`;

const ExplorerColumn = styled.div<{ $width?: number; $flex?: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: ${({ $flex, $width }) => ($flex ? 'auto' : `${$width ?? 240}px`)};
  flex: ${({ $flex }) => ($flex ? '1 1 0' : '0 0 auto')};
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.015);

  &:last-child {
    border-right: none;
  }

  .dark & {
    border-right-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  @media (max-width: 992px) {
    width: 100% !important;
    flex: none !important;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    &:last-child {
      border-bottom: none;
    }

    .dark & {
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }
  }
`;

const ExplorerColumnHeader = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);

  .dark & {
    border-bottom-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
  }
`;

const ExplorerColumnTitle = styled(Text)`
  && {
    flex: 1;
    min-width: 0;
    font-size: 13px;
  }
`;

const ExplorerAddButton = styled(Button)`
  && {
    border-radius: 999px;
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
    flex-shrink: 0;
    box-shadow: none;
  }
`;

const ExplorerColumnBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
`;

const EpisodeNavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const EpisodeNavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: transparent;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.1);
  }

  &[data-active='true'] {
    padding-left: 8px;
    border-color: rgba(59, 130, 246, 0.55);
    border-left-width: 3px;
    border-left-style: solid;
    border-left-color: #3b82f6;
    background: rgba(59, 130, 246, 0.12);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);

    &:hover {
      border-color: rgba(59, 130, 246, 0.65);
      background: rgba(59, 130, 246, 0.16);
    }
  }

  html.dark & {
    border-color: rgba(255, 255, 255, 0.1);
    background: transparent;

    &:hover:not([data-active='true']) {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.14);
    }

    &[data-active='true'] {
      border-color: rgba(96, 165, 250, 0.65);
      border-left-color: #60a5fa;
      background: rgba(59, 130, 246, 0.22);
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);

      &:hover {
        border-color: rgba(96, 165, 250, 0.8);
        background: rgba(59, 130, 246, 0.28);
      }
    }
  }
`;

const EpisodeNavTitle = styled(Text)`
  && {
    display: block;
    font-size: 13px;
    line-height: 1.35;
    color: rgba(0, 0, 0, 0.65);
    font-weight: 400;
  }

  ${EpisodeNavItem}[data-active='true'] & {
    color: #1d4ed8;
    font-weight: 600;
  }

  html.dark & {
    color: rgba(255, 255, 255, 0.55);
  }

  html.dark ${EpisodeNavItem}[data-active='true'] & {
    color: #93c5fd;
  }
`;

const EpisodeNavBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const EpisodeNavActions = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: 2px;
`;

const BindCharacterRow = styled.label`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: rgba(59, 130, 246, 0.35);
    background: rgba(59, 130, 246, 0.04);
  }

  .dark & {
    border-color: rgba(255, 255, 255, 0.08);

    &:hover {
      border-color: rgba(59, 130, 246, 0.45);
      background: rgba(59, 130, 246, 0.08);
    }
  }
`;

const CharacterThumb = styled.div`
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .dark & {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const EpisodeCoverThumb = styled.div`
  width: 48px;
  height: 64px;
  border-radius: ${getCoverBorderRadius()};
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.35);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${EpisodeNavItem}[data-active='true'] & {
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.45);
  }

  html.dark & {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.35);
  }

  html.dark ${EpisodeNavItem}[data-active='true'] & {
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.65);
  }
`;

const EpisodeEditRow = styled(Row)`
  align-items: flex-start;
`;

const EpisodeEditCoverCol = styled.div`
  width: 100%;

  .director-episode-cover-form-item {
    margin-bottom: 0;

    .ant-form-item-label {
      padding-bottom: 8px;
    }

    .ant-form-item-control-input {
      width: 100%;
    }
  }
`;

const EpisodeEditMeta = styled.div`
  margin-bottom: 16px;
`;

const isDisplayableImageUrl = (url?: string | null): url is string => {
  if (!url?.trim()) return false;
  const u = url.trim();
  return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:') || u.startsWith('//');
};

const compareShotNo = (left: string, right: string): number => {
  const parse = (value: string): [number, number, string] => {
    const match = value.trim().match(/^(\d+)\s*[-_.]\s*(\d+)$/);
    if (match) {
      return [Number(match[1]), Number(match[2]), value];
    }
    const num = Number(value);
    if (!Number.isNaN(num)) return [num, 0, value];
    return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, value];
  };
  const [leftMajor, leftMinor, leftRaw] = parse(left);
  const [rightMajor, rightMinor, rightRaw] = parse(right);
  if (leftMajor !== rightMajor) return leftMajor - rightMajor;
  if (leftMinor !== rightMinor) return leftMinor - rightMinor;
  return leftRaw.localeCompare(rightRaw, undefined, { numeric: true });
};

const sortShotsByShotNo = (list: DirectorShot[]): DirectorShot[] =>
  [...list].sort((left, right) => {
    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return compareShotNo(left.shotNo, right.shotNo);
  });

export interface EpisodeManagerProps {
  episodes: DirectorEpisode[];
  characters: DirectorCharacter[];
  props?: DirectorProp[];
  characterPropMap?: Record<number, number[]>;
  scenes: DirectorScene[];
  shots: DirectorShot[];
  activeEpisodeId: number | null;
  activeSceneId: number | null;
  episodeDataLoading?: boolean;
  addingEpisode: boolean;
  onCreateEpisode: (body: {
    title: string;
    synopsis?: string;
    coverUrl?: string;
  }) => Promise<number | null>;
  onUpdateEpisode: (
    episodeId: number,
    body: { title: string; synopsis?: string; coverUrl?: string | null }
  ) => Promise<boolean>;
  onEpisodeClick: (episodeId: number) => void;
  onSceneSelect: (sceneId: number | null) => void;
  onReloadEpisodeData: () => void;
  onSyncShot: (shotId: number) => void;
  aspectRatio?: string;
  stylePrompt?: string | null;
  defaultT2iModelCode?: string | null;
  defaultI2vModelCode?: string | null;
  onEpisodeDataChange?: () => void;
}

const EpisodeManager: React.FC<EpisodeManagerProps> = ({
  episodes,
  characters,
  props = [],
  characterPropMap = {},
  scenes,
  shots,
  activeEpisodeId,
  activeSceneId,
  episodeDataLoading,
  addingEpisode,
  onCreateEpisode,
  onUpdateEpisode,
  onEpisodeClick,
  onSceneSelect,
  onReloadEpisodeData,
  onSyncShot,
  aspectRatio = '16:9',
  stylePrompt,
  defaultT2iModelCode,
  defaultI2vModelCode,
  onEpisodeDataChange,
}) => {
  const intl = useIntl();
  const [shotSettingsId, setShotSettingsId] = useState<number | null>(null);
  const [shotStudioTab, setShotStudioTab] = useState<ShotStudioTab>('script');
  const [shotCreateSceneId, setShotCreateSceneId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<DirectorEpisode | null>(null);
  const [saving, setSaving] = useState(false);
  const [createForm] = Form.useForm();
  const [form] = Form.useForm();

  const openShotStudio = useCallback((target: DirectorShot, tab: ShotStudioTab = 'script') => {
    setShotCreateSceneId(null);
    setShotStudioTab(tab);
    setShotSettingsId(target.id);
  }, []);

  const nextEpisodeNo = useMemo(() => {
    if (episodes.length === 0) return 1;
    return Math.max(...episodes.map((e) => e.episodeNo)) + 1;
  }, [episodes]);

  const [bindOpen, setBindOpen] = useState(false);
  const [bindingEpisode, setBindingEpisode] = useState<DirectorEpisode | null>(null);
  const [bindLoading, setBindLoading] = useState(false);
  const [bindSaving, setBindSaving] = useState(false);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>([]);
  const [sceneSettingsId, setSceneSettingsId] = useState<number | null>(null);
  const [addingScene, setAddingScene] = useState(false);

  useEffect(() => {
    if (episodes.length > 0 && activeEpisodeId == null) {
      onEpisodeClick(episodes[0].id);
    }
  }, [episodes, activeEpisodeId, onEpisodeClick]);

  const openCreate = () => {
    createForm.resetFields();
    setCreateOpen(true);
  };

  const handleAddScene = async () => {
    if (!activeEpisodeId) return;
    setAddingScene(true);
    try {
      const res = await directorApi.createScene(activeEpisodeId, {
        sceneNo: scenes.length + 1,
        location: intl.formatMessage({ id: 'director.script.newSceneLocation', defaultMessage: '新场景' }),
        scriptContent: '',
      });
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.script.sceneAdded', defaultMessage: '场次已添加' })
        );
        onReloadEpisodeData();
      } else {
        message.error(res.message || intl.formatMessage({ id: 'director.script.sceneAddFailed', defaultMessage: '添加失败' }));
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.script.sceneAddFailed', defaultMessage: '添加失败' }));
    } finally {
      setAddingScene(false);
    }
  };

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    const episodeId = await onCreateEpisode({
      title: values.title,
      synopsis: values.synopsis,
      coverUrl: values.coverUrl,
    });
    if (episodeId) {
      setCreateOpen(false);
      createForm.resetFields();
    }
  };

  const openEdit = (episode: DirectorEpisode) => {
    setEditingEpisode(episode);
    form.setFieldsValue({
      title: episode.title || `第${episode.episodeNo}集`,
      synopsis: episode.synopsis || '',
      coverUrl: episode.coverUrl || undefined,
    });
    setEditOpen(true);
  };

  const openBindCharacters = async (episode: DirectorEpisode) => {
    setBindingEpisode(episode);
    setBindOpen(true);
    setBindLoading(true);
    setSelectedCharacterIds([]);
    try {
      const res = await directorApi.listEpisodeCharacters(episode.id);
      if (res.success) {
        setSelectedCharacterIds((res.data || []).map((c: DirectorCharacter) => c.id));
      } else {
        message.error(res.message || intl.formatMessage({ id: 'director.episode.charactersLoadFailed', defaultMessage: '加载出场角色失败' }));
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.episode.charactersLoadFailed', defaultMessage: '加载出场角色失败' }));
    } finally {
      setBindLoading(false);
    }
  };

  const handleSaveBind = async () => {
    if (!bindingEpisode) return;
    setBindSaving(true);
    try {
      const res = await directorApi.bindEpisodeCharacters(bindingEpisode.id, {
        characterIds: selectedCharacterIds,
      });
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.episode.charactersSaved', defaultMessage: '出场角色已保存' })
        );
        setBindOpen(false);
        setBindingEpisode(null);
        onEpisodeDataChange?.();
      } else {
        message.error(res.message || intl.formatMessage({ id: 'director.episode.charactersSaveFailed', defaultMessage: '保存失败' }));
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.episode.charactersSaveFailed', defaultMessage: '保存失败' }));
    } finally {
      setBindSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editingEpisode) return;
    const values = await form.validateFields();
    setSaving(true);
    try {
      const ok = await onUpdateEpisode(editingEpisode.id, {
        title: values.title,
        synopsis: values.synopsis,
        coverUrl: values.coverUrl || '',
      });
      if (ok) {
        message.success(
          intl.formatMessage({ id: 'director.episode.saved', defaultMessage: '集信息已保存' })
        );
        setEditOpen(false);
        setEditingEpisode(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const statusTag = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      draft: { color: 'default', label: intl.formatMessage({ id: 'director.episode.status.draft', defaultMessage: '草稿' }) },
      active: { color: 'processing', label: intl.formatMessage({ id: 'director.episode.status.active', defaultMessage: '进行中' }) },
      archived: { color: 'success', label: intl.formatMessage({ id: 'director.episode.status.archived', defaultMessage: '已完成' }) },
    };
    const item = map[status] || { color: 'default', label: status };
    return <Tag color={item.color}>{item.label}</Tag>;
  };

  const renderEpisodeFormFields = () => (
    <EpisodeEditRow gutter={[24, 16]}>
      <Col xs={24} sm={9} md={8}>
        <EpisodeEditCoverCol>
          <Form.Item
            className="director-episode-cover-form-item"
            name="coverUrl"
            label={intl.formatMessage({ id: 'director.episode.cover', defaultMessage: '本集封面' })}
            extra={intl.formatMessage({
              id: 'director.episode.coverHint',
              defaultMessage: '2:3 竖版海报，上传时可裁剪',
            })}
          >
            <CoverImageUpload aspectRatio={POSTER_ASPECT_RATIO} enableCrop fullWidth />
          </Form.Item>
        </EpisodeEditCoverCol>
      </Col>
      <Col xs={24} sm={15} md={16}>
        <Form.Item
          name="title"
          label={intl.formatMessage({ id: 'director.episode.title', defaultMessage: '标题' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'director.episode.titleRequired',
                defaultMessage: '请输入标题',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'director.episode.titlePlaceholder',
              defaultMessage: '例如：命运的转折点',
            })}
            maxLength={200}
          />
        </Form.Item>
        <Form.Item
          name="synopsis"
          label={intl.formatMessage({ id: 'director.episode.synopsis', defaultMessage: '简介' })}
          extra={intl.formatMessage({
            id: 'director.episode.synopsisHint',
            defaultMessage: '本集剧情概要，供 Agent 与分镜参考',
          })}
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea
            rows={5}
            placeholder={intl.formatMessage({
              id: 'director.episode.synopsisPlaceholder',
              defaultMessage: '本集剧情概要、创作备注…',
            })}
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Col>
    </EpisodeEditRow>
  );

  const shotCountBySceneId = useMemo(() => {
    const map: Record<number, number> = {};
    shots.forEach((shot) => {
      if (shot.sceneId != null) {
        map[shot.sceneId] = (map[shot.sceneId] ?? 0) + 1;
      }
    });
    return map;
  }, [shots]);

  const sceneShots = useMemo(() => {
    if (!activeSceneId) return [];
    return sortShotsByShotNo(shots.filter((shot) => shot.sceneId === activeSceneId));
  }, [shots, activeSceneId]);

  const createShotNoSuggestion = useMemo(() => {
    if (!shotCreateSceneId) return '';
    const scene = scenes.find((item) => item.id === shotCreateSceneId);
    if (!scene) return '';
    const sceneShotCount = shots.filter((shot) => shot.sceneId === shotCreateSceneId).length;
    return scene.sceneNo != null ? `${scene.sceneNo}-${sceneShotCount + 1}` : String(sceneShotCount + 1);
  }, [shotCreateSceneId, scenes, shots]);

  const shotCreateScene = useMemo(
    () => (shotCreateSceneId ? scenes.find((scene) => scene.id === shotCreateSceneId) || null : null),
    [shotCreateSceneId, scenes]
  );

  const activeEpisode = useMemo(
    () => episodes.find((episode) => episode.id === activeEpisodeId),
    [episodes, activeEpisodeId]
  );

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId),
    [scenes, activeSceneId]
  );

  const sceneSettingsTarget = useMemo(
    () => scenes.find((scene) => scene.id === sceneSettingsId) || null,
    [scenes, sceneSettingsId]
  );

  const shotSettingsTarget = useMemo(
    () => shots.find((shot) => shot.id === shotSettingsId) || null,
    [shots, shotSettingsId]
  );

  const shotSettingsScene = useMemo(() => {
    if (!shotSettingsTarget?.sceneId) return activeScene || null;
    return scenes.find((scene) => scene.id === shotSettingsTarget.sceneId) || null;
  }, [shotSettingsTarget, scenes, activeScene]);

  const shotColumns = [
    { title: intl.formatMessage({ id: 'director.shot.no', defaultMessage: '镜号' }), dataIndex: 'shotNo', width: 72 },
    {
      title: intl.formatMessage({ id: 'director.shot.status', defaultMessage: '状态' }),
      dataIndex: 'status',
      width: 88,
      render: (s: string) => {
        const color = s === 'approved' ? 'success' : s === 'generating' ? 'processing' : s === 'failed' ? 'error' : 'default';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    { title: 'Prompt', dataIndex: 'prompt', ellipsis: true },
    {
      title: intl.formatMessage({ id: 'director.shot.keyframe', defaultMessage: '关键帧' }),
      dataIndex: 'keyframeImageUrl',
      width: 72,
      render: (url: string) =>
        url ? (
          <Tag color="blue">
            <FormattedMessage id="director.shot.hasKeyframe" defaultMessage="有" />
          </Tag>
        ) : (
          <Tag>
            <FormattedMessage id="director.shot.noKeyframe" defaultMessage="无" />
          </Tag>
        ),
    },
    {
      title: intl.formatMessage({ id: 'director.shot.actions', defaultMessage: '操作' }),
      key: 'actions',
      width: 220,
      render: (_: unknown, record: DirectorShot) => (
        <Space wrap size={4}>
          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => openShotStudio(record, 'script')}
          >
            <FormattedMessage id="director.shot.studio" defaultMessage="分镜" />
          </Button>
          {record.status === 'generating' ? (
            <Button size="small" onClick={() => onSyncShot(record.id)}>
              <FormattedMessage id="director.shot.sync" defaultMessage="同步" />
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <>
      <EpisodeSectionCard
        title={intl.formatMessage({ id: 'director.episodes.title', defaultMessage: '剧集管理' })}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          <FormattedMessage
            id="director.episodes.hint"
            defaultMessage="左侧选集，中间选场景，右侧看分镜；点击设置图标编辑场景或分镜。"
          />
        </Text>
        <ExplorerLayout>
          <ExplorerColumn $width={248}>
            <ExplorerColumnHeader>
              <ExplorerColumnTitle strong ellipsis>
                <FormattedMessage id="director.explorer.episodes" defaultMessage="剧集" />
              </ExplorerColumnTitle>
              <ExplorerAddButton type="primary" size="small" icon={<PlusOutlined />} onClick={openCreate}>
                <FormattedMessage id="director.episode.add" defaultMessage="添加集" />
              </ExplorerAddButton>
            </ExplorerColumnHeader>
            <ExplorerColumnBody>
              {episodes.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.formatMessage({
                    id: 'director.episodes.empty',
                    defaultMessage: '暂无剧集，点击右上角添加',
                  })}
                  style={{ margin: '24px 0' }}
                />
              ) : (
                <EpisodeNavList>
                  {episodes.map((record) => {
                    const title = record.title || `第${record.episodeNo}集`;
                    const isActive = record.id === activeEpisodeId;
                    return (
                      <EpisodeNavItem
                        key={record.id}
                        data-active={isActive ? 'true' : undefined}
                        role="button"
                        tabIndex={0}
                        aria-selected={isActive}
                        onClick={() => onEpisodeClick(record.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onEpisodeClick(record.id);
                          }
                        }}
                      >
                        <EpisodeCoverThumb>
                          {isDisplayableImageUrl(record.coverUrl) ? (
                            <img src={normalizeUrl(record.coverUrl)} alt={title} />
                          ) : (
                            '—'
                          )}
                        </EpisodeCoverThumb>
                        <EpisodeNavBody>
                          <EpisodeNavTitle strong ellipsis={{ tooltip: title }}>
                            {title}
                          </EpisodeNavTitle>
                          <Space size={4} wrap style={{ marginTop: 4 }}>
                            <Tag color={isActive ? 'blue' : 'default'} style={{ margin: 0 }}>
                              {intl.formatMessage(
                                { id: 'director.episode.noTag', defaultMessage: '第 {no} 集' },
                                { no: record.episodeNo }
                              )}
                            </Tag>
                            {statusTag(record.status)}
                          </Space>
                        </EpisodeNavBody>
                        <EpisodeNavActions onClick={(e) => e.stopPropagation()}>
                          <Tooltip title={intl.formatMessage({ id: 'director.episode.edit', defaultMessage: '编辑' })}>
                            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                          </Tooltip>
                          <Tooltip
                            title={intl.formatMessage({
                              id: 'director.episode.bindCharacters',
                              defaultMessage: '绑定角色',
                            })}
                          >
                            <Button type="text" size="small" icon={<TeamOutlined />} onClick={() => openBindCharacters(record)} />
                          </Tooltip>
                        </EpisodeNavActions>
                      </EpisodeNavItem>
                    );
                  })}
                </EpisodeNavList>
              )}
            </ExplorerColumnBody>
          </ExplorerColumn>

          <ExplorerColumn $width={320}>
            <ExplorerColumnHeader>
              <ExplorerColumnTitle strong ellipsis>
                {activeEpisode
                  ? intl.formatMessage(
                      { id: 'director.explorer.scenesFor', defaultMessage: '场景 · {title}' },
                      { title: activeEpisode.title || `第${activeEpisode.episodeNo}集` }
                    )
                  : intl.formatMessage({ id: 'director.explorer.scenes', defaultMessage: '场景' })}
              </ExplorerColumnTitle>
              <ExplorerAddButton
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                loading={addingScene}
                disabled={!activeEpisodeId}
                onClick={handleAddScene}
              >
                <FormattedMessage id="director.script.addScene" defaultMessage="添加场次" />
              </ExplorerAddButton>
            </ExplorerColumnHeader>
            <ExplorerColumnBody>
              {!activeEpisodeId ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.formatMessage({
                    id: 'director.explorer.selectEpisodeHint',
                    defaultMessage: '请先选择一集',
                  })}
                  style={{ margin: '40px 0' }}
                />
              ) : episodeDataLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : (
                <SceneList
                  mode="nav"
                  scenes={scenes}
                  episodeId={activeEpisodeId}
                  activeSceneId={activeSceneId}
                  shotCountBySceneId={shotCountBySceneId}
                  hideNavAddButton
                  onSceneSelect={onSceneSelect}
                  onOpenSceneSettings={(sceneId) => {
                    onSceneSelect(sceneId);
                    setSceneSettingsId(sceneId);
                  }}
                  onScenesChange={onReloadEpisodeData}
                />
              )}
            </ExplorerColumnBody>
          </ExplorerColumn>

          <ExplorerColumn $flex>
            <ExplorerColumnHeader>
              <ExplorerColumnTitle strong ellipsis>
                {activeScene
                  ? intl.formatMessage(
                      { id: 'director.explorer.shotsFor', defaultMessage: '分镜 · 第 {no} 场' },
                      { no: activeScene.sceneNo }
                    )
                  : intl.formatMessage({ id: 'director.storyboard.title', defaultMessage: '分镜板' })}
              </ExplorerColumnTitle>
              <ExplorerAddButton
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                disabled={!activeSceneId}
                onClick={() => {
                  if (!activeSceneId) return;
                  setShotSettingsId(null);
                  setShotCreateSceneId(activeSceneId);
                }}
              >
                <FormattedMessage id="director.shot.add" defaultMessage="添加镜头" />
              </ExplorerAddButton>
            </ExplorerColumnHeader>
            <ExplorerColumnBody>
              {!activeEpisodeId ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.formatMessage({
                    id: 'director.explorer.selectEpisodeHint',
                    defaultMessage: '请先选择一集',
                  })}
                  style={{ margin: '40px 0' }}
                />
              ) : !activeSceneId ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.formatMessage({
                    id: 'director.explorer.selectSceneHint',
                    defaultMessage: '请选择场景以查看分镜',
                  })}
                  style={{ margin: '40px 0' }}
                />
              ) : (
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={sceneShots}
                  columns={shotColumns}
                  locale={{
                    emptyText: intl.formatMessage({
                      id: 'director.explorer.emptyShots',
                      defaultMessage: '该场景暂无分镜，点击右上角添加',
                    }),
                  }}
                />
              )}
            </ExplorerColumnBody>
          </ExplorerColumn>
        </ExplorerLayout>
      </EpisodeSectionCard>

      <Modal
        title={intl.formatMessage({ id: 'director.episode.createTitle', defaultMessage: '添加新集' })}
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreate}
        confirmLoading={addingEpisode}
        destroyOnClose
        centered
        width={640}
        okText={intl.formatMessage({ id: 'director.episode.createConfirm', defaultMessage: '创建' })}
        cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
      >
        <EpisodeEditMeta>
          <Space wrap size={8}>
            <Tag color="blue">
              {intl.formatMessage(
                { id: 'director.episode.createNoTag', defaultMessage: '将创建第 {no} 集' },
                { no: nextEpisodeNo }
              )}
            </Tag>
            {statusTag('draft')}
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
            <FormattedMessage
              id="director.episode.createHint"
              defaultMessage="请先填写本集基本信息，创建后再进入剧本与分镜创作。"
            />
          </Text>
        </EpisodeEditMeta>
        <Form form={createForm} layout="vertical" requiredMark={false}>
          {renderEpisodeFormFields()}
        </Form>
      </Modal>

      <Modal
        title={intl.formatMessage({ id: 'director.episode.editTitle', defaultMessage: '编辑集信息' })}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditingEpisode(null);
        }}
        onOk={handleSave}
        confirmLoading={saving}
        destroyOnClose
        centered
        width={640}
        okText={intl.formatMessage({ id: 'common.save', defaultMessage: '保存' })}
        cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
      >
        {editingEpisode ? (
          <EpisodeEditMeta>
            <Space wrap size={8}>
              <Tag color="blue">
                {intl.formatMessage(
                  { id: 'director.episode.noTag', defaultMessage: '第 {no} 集' },
                  { no: editingEpisode.episodeNo }
                )}
              </Tag>
              {statusTag(editingEpisode.status)}
            </Space>
          </EpisodeEditMeta>
        ) : null}
        <Form form={form} layout="vertical" requiredMark={false}>
          {renderEpisodeFormFields()}
        </Form>
      </Modal>

      <Modal
        title={
          bindingEpisode
            ? intl.formatMessage(
                { id: 'director.episode.bindCharactersTitle', defaultMessage: '绑定出场角色 · {title}' },
                { title: bindingEpisode.title || `第${bindingEpisode.episodeNo}集` }
              )
            : intl.formatMessage({ id: 'director.episode.bindCharacters', defaultMessage: '绑定角色' })
        }
        open={bindOpen}
        onCancel={() => {
          setBindOpen(false);
          setBindingEpisode(null);
        }}
        onOk={handleSaveBind}
        confirmLoading={bindSaving}
        destroyOnClose
        width={640}
      >
        {bindLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : characters.length === 0 ? (
          <Empty
            description={intl.formatMessage({
              id: 'director.episode.noCharactersHint',
              defaultMessage: '请先在「资产管理」中创建角色',
            })}
          />
        ) : (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              <FormattedMessage
                id="director.episode.bindCharactersHint"
                defaultMessage="勾选本集出场的角色，Agent 与分镜创作时可参考该列表。"
              />
            </Text>
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedCharacterIds}
              onChange={(vals) => setSelectedCharacterIds(vals as number[])}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={10}>
                {characters.map((c) => (
                  <BindCharacterRow key={c.id} htmlFor={`bind-char-${c.id}`}>
                    <Checkbox id={`bind-char-${c.id}`} value={c.id} />
                    <CharacterThumb>
                      {isDisplayableImageUrl(c.referenceImageUrl) ? (
                        <img src={normalizeUrl(c.referenceImageUrl)} alt={c.name} />
                      ) : (
                        <Avatar size={48} style={{ backgroundColor: '#3b82f6' }}>
                          {c.name?.charAt(0)}
                        </Avatar>
                      )}
                    </CharacterThumb>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>
                        {c.name}
                      </Text>
                      {c.description ? (
                        <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: c.description }}>
                          {c.description}
                        </Text>
                      ) : null}
                    </div>
                  </BindCharacterRow>
                ))}
              </Space>
            </Checkbox.Group>
          </>
        )}
      </Modal>

      <SceneSettingsModal
        open={sceneSettingsId != null}
        scene={sceneSettingsTarget}
        episode={activeEpisode || null}
        scenes={scenes}
        characters={characters}
        shotCount={sceneSettingsTarget ? shotCountBySceneId[sceneSettingsTarget.id] ?? 0 : 0}
        onClose={() => setSceneSettingsId(null)}
        onSaved={onReloadEpisodeData}
      />

      <ShotSettingsModal
        open={shotSettingsId != null || shotCreateSceneId != null}
        mode={shotCreateSceneId != null ? 'create' : 'edit'}
        shot={shotSettingsTarget}
        scene={shotCreateSceneId != null ? shotCreateScene : shotSettingsScene}
        episode={activeEpisode || null}
        scenes={scenes}
        characters={characters}
        props={props}
        characterPropMap={characterPropMap}
        shotCountForScene={
          (shotCreateSceneId != null ? shotCreateScene : shotSettingsScene)
            ? shotCountBySceneId[(shotCreateSceneId != null ? shotCreateScene : shotSettingsScene)!.id] ?? 0
            : 0
        }
        defaultShotNo={createShotNoSuggestion}
        aspectRatio={aspectRatio}
        stylePrompt={stylePrompt}
        initialTab={shotStudioTab}
        defaultT2iModelCode={defaultT2iModelCode}
        defaultI2vModelCode={defaultI2vModelCode}
        onClose={() => {
          setShotSettingsId(null);
          setShotCreateSceneId(null);
          setShotStudioTab('script');
        }}
        onSaved={onReloadEpisodeData}
      />
    </>
  );
};

export default EpisodeManager;
