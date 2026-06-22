import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, Popconfirm, Space, Tag, Tooltip, Typography, message } from 'antd';
import { DeleteOutlined, SaveOutlined, SettingOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import directorApi, { DirectorScene } from 'api/director';

const { Text } = Typography;

const SceneCard = styled.div`
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);

  .dark & {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
  }
`;

const SceneNavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SceneNavActions = styled.div`
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
`;

const SceneNavItem = styled.div`
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

  &:hover ${SceneNavActions}, &[data-active='true'] ${SceneNavActions} {
    opacity: 1;
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

const SceneNoBadge = styled.div`
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  ${SceneNavItem}[data-active='true'] & {
    background: #3b82f6;
    color: #ffffff;
    border-color: #2563eb;
  }

  html.dark & {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.45);
    border-color: rgba(255, 255, 255, 0.1);
  }

  html.dark ${SceneNavItem}[data-active='true'] & {
    background: #3b82f6;
    color: #ffffff;
    border-color: #60a5fa;
  }
`;

const SceneNavMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const SceneNavTitle = styled(Text)`
  && {
    display: block;
    font-size: 13px;
    line-height: 1.35;
    color: rgba(0, 0, 0, 0.65);
    font-weight: 400;
  }

  ${SceneNavItem}[data-active='true'] & {
    color: #1d4ed8;
    font-weight: 600;
  }

  html.dark & {
    color: rgba(255, 255, 255, 0.55);
  }

  html.dark ${SceneNavItem}[data-active='true'] & {
    color: #93c5fd;
  }
`;

const SceneNavMeta = styled(Text)`
  && {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    line-height: 1.3;
    color: rgba(0, 0, 0, 0.4);
  }

  ${SceneNavItem}[data-active='true'] & {
    color: rgba(29, 78, 216, 0.72);
  }

  html.dark & {
    color: rgba(255, 255, 255, 0.35);
  }

  html.dark ${SceneNavItem}[data-active='true'] & {
    color: rgba(147, 197, 253, 0.75);
  }
`;

const SceneCardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`;

const SceneMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

const SceneMetaField = styled.div`
  flex: 1;
  min-width: 120px;
`;

const SceneMetaLabel = styled(Text)`
  && {
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
  }
`;

interface SceneDraft {
  location: string;
  timeOfDay: string;
  scriptContent: string;
}

interface SceneListProps {
  scenes: DirectorScene[];
  episodeId?: number;
  mode?: 'full' | 'nav' | 'detail';
  activeSceneId?: number | null;
  detailSceneId?: number | null;
  shotCountBySceneId?: Record<number, number>;
  hideNavAddButton?: boolean;
  onScenesChange: () => void;
  onSceneSelect?: (sceneId: number) => void;
  onOpenSceneSettings?: (sceneId: number) => void;
  onGenerateShots?: (sceneId: number) => void;
}

const toDraft = (scene: DirectorScene): SceneDraft => ({
  location: scene.location || '',
  timeOfDay: scene.timeOfDay || '',
  scriptContent: scene.scriptContent || '',
});

const isDraftDirty = (scene: DirectorScene, draft: SceneDraft) =>
  (scene.location || '') !== draft.location ||
  (scene.timeOfDay || '') !== draft.timeOfDay ||
  (scene.scriptContent || '') !== draft.scriptContent;

const SceneList: React.FC<SceneListProps> = ({
  scenes,
  episodeId,
  mode = 'full',
  activeSceneId,
  detailSceneId,
  shotCountBySceneId = {},
  hideNavAddButton = false,
  onScenesChange,
  onSceneSelect,
  onOpenSceneSettings,
  onGenerateShots,
}) => {
  const intl = useIntl();
  const [drafts, setDrafts] = useState<Record<number, SceneDraft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const next: Record<number, SceneDraft> = {};
    scenes.forEach((scene) => {
      next[scene.id] = toDraft(scene);
    });
    setDrafts(next);
  }, [scenes]);

  const dirtySceneIds = useMemo(
    () =>
      scenes
        .filter((scene) => {
          const draft = drafts[scene.id];
          return draft ? isDraftDirty(scene, draft) : false;
        })
        .map((scene) => scene.id),
    [scenes, drafts]
  );

  const updateDraft = (sceneId: number, patch: Partial<SceneDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [sceneId]: {
        ...prev[sceneId],
        ...patch,
      },
    }));
  };

  const handleSaveScene = async (scene: DirectorScene) => {
    const draft = drafts[scene.id];
    if (!draft || !isDraftDirty(scene, draft)) return;

    setSavingId(scene.id);
    try {
      const res = await directorApi.updateScene(scene.id, {
        location: draft.location.trim() || null,
        timeOfDay: draft.timeOfDay.trim() || null,
        scriptContent: draft.scriptContent,
      });
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.script.sceneSaved', defaultMessage: '场次已保存' })
        );
        onScenesChange();
      } else {
        message.error(res.message || intl.formatMessage({ id: 'director.script.sceneSaveFailed', defaultMessage: '保存失败' }));
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.script.sceneSaveFailed', defaultMessage: '保存失败' }));
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteScene = async (sceneId: number) => {
    setDeletingId(sceneId);
    try {
      const res = await directorApi.deleteScene(sceneId);
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.script.sceneDeleted', defaultMessage: '场次已删除' })
        );
        onScenesChange();
      } else {
        message.error(res.message || intl.formatMessage({ id: 'director.script.sceneDeleteFailed', defaultMessage: '删除失败' }));
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.script.sceneDeleteFailed', defaultMessage: '删除失败' }));
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddScene = async () => {
    if (!episodeId) return;
    setAdding(true);
    try {
      const res = await directorApi.createScene(episodeId, {
        sceneNo: scenes.length + 1,
        location: intl.formatMessage({ id: 'director.script.newSceneLocation', defaultMessage: '新场景' }),
        scriptContent: '',
      });
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.script.sceneAdded', defaultMessage: '场次已添加' })
        );
        onScenesChange();
      } else {
        message.error(res.message || intl.formatMessage({ id: 'director.script.sceneAddFailed', defaultMessage: '添加失败' }));
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.script.sceneAddFailed', defaultMessage: '添加失败' }));
    } finally {
      setAdding(false);
    }
  };

  const renderSceneEditor = (scene: DirectorScene) => {
    const draft = drafts[scene.id] || toDraft(scene);
    const dirty = isDraftDirty(scene, draft);

    return (
      <SceneCard key={scene.id}>
        <SceneCardHeader>
          <Text strong>
            {intl.formatMessage(
              { id: 'director.script.sceneNo', defaultMessage: '第 {no} 场' },
              { no: scene.sceneNo }
            )}
          </Text>
          <Space size={4}>
            {onGenerateShots ? (
              <Button size="small" icon={<VideoCameraOutlined />} onClick={() => onGenerateShots(scene.id)}>
                <FormattedMessage id="director.agent.splitSceneStoryboard" defaultMessage="生成分镜" />
              </Button>
            ) : null}
            <Button
              size="small"
              type="primary"
              icon={<SaveOutlined />}
              disabled={!dirty}
              loading={savingId === scene.id}
              onClick={() => handleSaveScene(scene)}
            >
              <FormattedMessage id="common.save" defaultMessage="保存" />
            </Button>
            <Popconfirm
              title={intl.formatMessage({
                id: 'director.script.deleteSceneConfirm',
                defaultMessage: '确定删除该场次？',
              })}
              okText={intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' })}
              cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
              onConfirm={() => handleDeleteScene(scene.id)}
            >
              <Button size="small" danger type="text" icon={<DeleteOutlined />} loading={deletingId === scene.id} />
            </Popconfirm>
          </Space>
        </SceneCardHeader>

        <SceneMetaRow>
          <SceneMetaField style={{ flex: 1.2, minWidth: 140 }}>
            <SceneMetaLabel type="secondary">
              <FormattedMessage id="director.script.location" defaultMessage="场景" />
            </SceneMetaLabel>
            <Input
              size="small"
              value={draft.location}
              placeholder={intl.formatMessage({
                id: 'director.script.locationPlaceholder',
                defaultMessage: '例如：学校教室、街道',
              })}
              onChange={(e) => updateDraft(scene.id, { location: e.target.value })}
            />
          </SceneMetaField>
          <SceneMetaField style={{ flex: 0.8, minWidth: 100 }}>
            <SceneMetaLabel type="secondary">
              <FormattedMessage id="director.script.timeOfDay" defaultMessage="时间" />
            </SceneMetaLabel>
            <Input
              size="small"
              value={draft.timeOfDay}
              placeholder={intl.formatMessage({
                id: 'director.script.timeOfDayPlaceholder',
                defaultMessage: '日 / 夜 / 晨',
              })}
              onChange={(e) => updateDraft(scene.id, { timeOfDay: e.target.value })}
            />
          </SceneMetaField>
        </SceneMetaRow>

        <SceneMetaLabel type="secondary">
          <FormattedMessage id="director.script.content" defaultMessage="剧本内容" />
        </SceneMetaLabel>
        <Input.TextArea
          rows={mode === 'detail' ? 8 : 5}
          value={draft.scriptContent}
          placeholder={intl.formatMessage({
            id: 'director.script.contentPlaceholder',
            defaultMessage: '场次描述、对白、动作指示…',
          })}
          onChange={(e) => updateDraft(scene.id, { scriptContent: e.target.value })}
        />
      </SceneCard>
    );
  };

  if (mode === 'nav') {
    return (
      <>
        {scenes.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({
              id: 'director.script.emptyScenes',
              defaultMessage: '暂无场次，点击右上角添加或让 Agent 生成',
            })}
            style={{ margin: '12px 0' }}
          />
        ) : (
          <SceneNavList>
            {scenes.map((scene) => {
              const location = scene.location || intl.formatMessage({ id: 'director.script.unnamedScene', defaultMessage: '未命名' });
              const shotCount = shotCountBySceneId[scene.id] ?? 0;
              const isActive = scene.id === activeSceneId;
              const metaParts = [
                scene.timeOfDay,
                intl.formatMessage(
                  { id: 'director.episode.shotCountTag', defaultMessage: '分镜 {count}' },
                  { count: shotCount }
                ),
              ].filter(Boolean);
              return (
                <SceneNavItem
                  key={scene.id}
                  data-active={isActive ? 'true' : undefined}
                  role="button"
                  tabIndex={0}
                  aria-selected={isActive}
                  onClick={() => onSceneSelect?.(scene.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSceneSelect?.(scene.id);
                    }
                  }}
                >
                  <SceneNoBadge aria-hidden>
                    {scene.sceneNo}
                  </SceneNoBadge>
                  <SceneNavMain>
                    <SceneNavTitle ellipsis={{ tooltip: location }}>
                      {location}
                    </SceneNavTitle>
                    {metaParts.length > 0 ? (
                      <SceneNavMeta ellipsis>{metaParts.join(' · ')}</SceneNavMeta>
                    ) : null}
                  </SceneNavMain>
                  {onOpenSceneSettings ? (
                    <SceneNavActions onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={intl.formatMessage({ id: 'director.scene.settings', defaultMessage: '场景设置' })}>
                        <Button
                          type="text"
                          size="small"
                          icon={<SettingOutlined />}
                          onClick={() => onOpenSceneSettings(scene.id)}
                        />
                      </Tooltip>
                    </SceneNavActions>
                  ) : null}
                </SceneNavItem>
              );
            })}
          </SceneNavList>
        )}
        {!hideNavAddButton ? (
          <Button type="dashed" block loading={adding} disabled={!episodeId} onClick={handleAddScene} style={{ marginTop: 8 }}>
            <FormattedMessage id="director.script.addScene" defaultMessage="添加场次" />
          </Button>
        ) : null}
      </>
    );
  }

  if (mode === 'detail') {
    const scene = scenes.find((item) => item.id === detailSceneId);
    if (!scene) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={intl.formatMessage({
            id: 'director.explorer.selectSceneHint',
            defaultMessage: '请从左侧列表选择一个场景',
          })}
          style={{ margin: '24px 0' }}
        />
      );
    }
    return (
      <>
        {renderSceneEditor(scene)}
        {dirtySceneIds.includes(scene.id) ? (
          <Text type="warning" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
            <FormattedMessage id="director.script.unsavedHint" defaultMessage="有未保存的场次修改，请记得保存" />
          </Text>
        ) : null}
      </>
    );
  }

  return (
    <>
      {scenes.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={intl.formatMessage({
            id: 'director.script.emptyScenes',
            defaultMessage: '暂无场次，点击下方添加或让 Agent 生成',
          })}
          style={{ margin: '12px 0 16px' }}
        />
      ) : (
        scenes.map((scene) => renderSceneEditor(scene))
      )}

      {dirtySceneIds.length > 0 ? (
        <Text type="warning" style={{ display: 'block', marginBottom: 10, fontSize: 12 }}>
          <FormattedMessage id="director.script.unsavedHint" defaultMessage="有未保存的场次修改，请记得保存" />
        </Text>
      ) : null}

      <Button type="dashed" block loading={adding} disabled={!episodeId} onClick={handleAddScene}>
        <FormattedMessage id="director.script.addScene" defaultMessage="添加场次" />
      </Button>
    </>
  );
};

export default SceneList;
