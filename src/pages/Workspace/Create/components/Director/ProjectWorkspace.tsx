import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Segmented,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocale } from 'contexts/LocaleContext';
import directorApi, {
  DirectorBuilding,
  DirectorCharacter,
  DirectorEpisode,
  DirectorProjectDetail,
  DirectorProp,
  DirectorScene,
  DirectorShot,
} from 'api/director';
import instance from 'api/axios';
import VideoModelSelectionModal from '../ImageToVideo/VideoModelSelectionModal';
import VideoModelSelectField from '../ImageToVideo/VideoModelSelectField';
import VideoModelDetailModal from '../ImageToVideo/ModelDetailModal';
import { GlobalSelectStyles } from '../ImageToVideo/styles';
import { Model as VideoModel } from '../ImageToVideo/types';
import T2iModelSelectField from '../TextToImage/T2iModelSelectField';
import T2iModelSelectionModal from '../TextToImage/ModelSelectionModal';
import { ModelFamily } from '../TextToImage/types';
import { isFree } from '../TextToImage/utils';
import ModelDetailModal, { ModelDetail } from '../ModelDetailModal';
import { preloadVideoModelCovers } from '../shared/videoModelCoverPreload';
import EpisodeManager from './EpisodeManager';
import AssetManager from './AssetManager';
import CoverImageUpload, { resolveCoverDisplayUrl } from './CoverImageUpload';

type T2iPriceFields = Pick<ModelFamily, 'outputPrice' | 'currency' | 'tokenCost'>;

/** 导演模块文生图仅展示收费模型（排除 SD 等免费 LOCAL 模型） */
const isPaidT2iModel = (model: T2iPriceFields) =>
  !isFree(model.outputPrice, model.currency, model.tokenCost);

const filterPaidT2iModels = (models: ModelFamily[]) => models.filter(isPaidT2iModel);

const { Title, Text, Paragraph } = Typography;

const WorkspaceRoot = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
`;

const WorkspaceTabBar = styled.div`
  margin-bottom: 20px;

  .ant-segmented {
    width: 100%;
    padding: 4px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.04);
  }

  .dark & .ant-segmented {
    background: rgba(255, 255, 255, 0.06);
  }

  @media (max-width: 576px) {
    .ant-segmented-item-label {
      padding-inline: 8px;
      font-size: 13px;
    }
  }
`;

const WorkspaceBody = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
`;

const ProjectHero = styled.div<{ $hasCover: boolean }>`
  position: relative;
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  min-height: ${({ $hasCover }) => ($hasCover ? '200px' : '152px')};
  background: ${({ $hasCover }) =>
    $hasCover
      ? 'transparent'
      : 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 55%, #6366f1 100%)'};
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.12);

  .dark & {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
    background: ${({ $hasCover }) =>
      $hasCover
        ? 'transparent'
        : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #312e81 100%)'};
  }
`;

const ProjectHeroOverlay = styled.div<{ $hasCover: boolean }>`
  position: absolute;
  inset: 0;
  background: ${({ $hasCover }) =>
    $hasCover
      ? 'linear-gradient(105deg, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.5) 42%, rgba(0, 0, 0, 0.18) 100%)'
      : 'linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.28) 100%)'};
  pointer-events: none;
`;

const ProjectHeroContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 18px 22px 20px;
  min-height: 152px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
`;

const ProjectHeroTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const ProjectHeroBottom = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const ProjectHeroMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProjectHeroTitle = styled(Title)`
  && {
    margin: 0 0 8px;
    color: #fff !important;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  }
`;

const ProjectHeroSynopsis = styled(Paragraph)`
  && {
    margin: 0;
    max-width: 720px;
    color: rgba(255, 255, 255, 0.82) !important;
    font-size: 13px;
    line-height: 1.6;
  }
`;

const ProjectHeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const HeroGhostButton = styled(Button)`
  && {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.08);

    &:hover {
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.55) !important;
      background: rgba(255, 255, 255, 0.16) !important;
    }
  }
`;

const HeroStatTag = styled(Tag)`
  margin: 0;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  backdrop-filter: blur(4px);
`;

const ContentCard = styled(Card)`
  border-radius: 12px;
  width: 100%;

  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .dark & .ant-card-head {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }
`;

/** 导演设置：图生视频 / 文生图模型选择框等高（紧凑模式由 ModelSelectBar compact 控制） */
const DirectorModelSettingsRow = styled(Row)``;

const SettingsFormFooter = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);

  .dark & {
    border-top-color: rgba(255, 255, 255, 0.08);
  }
`;

type WorkspaceTab = 'overview' | 'episodes' | 'assets';

interface EpisodeWorkspaceState {
  scenes: DirectorScene[];
  shots: DirectorShot[];
  activeSceneId: number | null;
  loaded: boolean;
}

const createEmptyEpisodeState = (): EpisodeWorkspaceState => ({
  scenes: [],
  shots: [],
  activeSceneId: null,
  loaded: false,
});

interface ProjectWorkspaceProps {
  projectId: string;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId }) => {
  const intl = useIntl();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const pid = Number(projectId);

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<DirectorProjectDetail | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<number | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [episodeDataLoading, setEpisodeDataLoading] = useState(false);
  const [episodeStates, setEpisodeStates] = useState<Record<number, EpisodeWorkspaceState>>({});

  const [scenes, setScenes] = useState<DirectorScene[]>([]);
  const [shots, setShots] = useState<DirectorShot[]>([]);
  const [characters, setCharacters] = useState<DirectorCharacter[]>([]);
  const [props, setProps] = useState<DirectorProp[]>([]);
  const [buildings, setBuildings] = useState<DirectorBuilding[]>([]);
  const [characterPropMap, setCharacterPropMap] = useState<Record<number, number[]>>({});

  const [i2vModels, setI2vModels] = useState<VideoModel[]>([]);
  const [selectedI2vModel, setSelectedI2vModel] = useState<VideoModel | null>(null);
  const [i2vModelsLoading, setI2vModelsLoading] = useState(false);
  const [i2vModelPickerVisible, setI2vModelPickerVisible] = useState(false);
  const [i2vModelDetailVisible, setI2vModelDetailVisible] = useState(false);
  const [selectedI2vModelForDetail, setSelectedI2vModelForDetail] = useState<VideoModel | null>(null);
  const [t2iModels, setT2iModels] = useState<ModelFamily[]>([]);
  const [selectedT2iModel, setSelectedT2iModel] = useState<ModelFamily | null>(null);
  const [t2iModelsLoading, setT2iModelsLoading] = useState(false);
  const [t2iModelPickerVisible, setT2iModelPickerVisible] = useState(false);
  const [t2iModelDetailVisible, setT2iModelDetailVisible] = useState(false);
  const [selectedT2iModelForDetail, setSelectedT2iModelForDetail] = useState<ModelDetail | null>(null);
  const [settingsForm] = Form.useForm();
  const [addingEpisode, setAddingEpisode] = useState(false);
  const episodeStatesRef = useRef<Record<number, EpisodeWorkspaceState>>({});
  const activeEpisodeIdRef = useRef<number | null>(null);

  useEffect(() => {
    episodeStatesRef.current = episodeStates;
  }, [episodeStates]);

  useEffect(() => {
    activeEpisodeIdRef.current = activeEpisodeId;
  }, [activeEpisodeId]);

  const activeEpisode = useMemo(
    () => project?.episodes?.find((e: DirectorEpisode) => e.id === activeEpisodeId) || project?.episodes?.[0],
    [project, activeEpisodeId]
  );

  const watchedCoverUrl = Form.useWatch('coverUrl', settingsForm);
  const headerCoverUrl = useMemo(
    () => resolveCoverDisplayUrl(watchedCoverUrl ?? project?.coverUrl),
    [watchedCoverUrl, project?.coverUrl]
  );
  const episodeCount = project?.episodes?.length ?? 0;
  const characterCount = characters.length;
  const propCount = props.length;
  const buildingCount = buildings.length;

  const propCharacterMap = useMemo(() => {
    const map: Record<number, number[]> = {};
    Object.entries(characterPropMap).forEach(([characterId, propIds]) => {
      propIds.forEach((propId) => {
        if (!map[propId]) map[propId] = [];
        map[propId].push(Number(characterId));
      });
    });
    return map;
  }, [characterPropMap]);

  const loadCharacterPropBindings = useCallback(async (chars: DirectorCharacter[]) => {
    if (chars.length === 0) {
      setCharacterPropMap({});
      return;
    }
    const entries = await Promise.all(
      chars.map(async (character) => {
        try {
          const res = await directorApi.listCharacterProps(character.id);
          const propIds = res.success ? (res.data || []).map((item: DirectorProp) => item.id) : [];
          return [character.id, propIds] as const;
        } catch {
          return [character.id, []] as const;
        }
      })
    );
    setCharacterPropMap(Object.fromEntries(entries));
  }, []);

  const loadEpisodeData = useCallback(async (episodeId: number, agentState?: Partial<EpisodeWorkspaceState>) => {
    setEpisodeDataLoading(true);
    try {
      const [sceneRes, shotRes] = await Promise.all([
        directorApi.listScenes(episodeId),
        directorApi.listShots(episodeId),
      ]);
      const newScenes = sceneRes.success ? sceneRes.data || [] : [];
      const newShots = shotRes.success ? shotRes.data || [] : [];
      setScenes(newScenes);
      setShots(newShots);
      setEpisodeStates((prev) => ({
        ...prev,
        [episodeId]: {
          ...(prev[episodeId] || createEmptyEpisodeState()),
          ...(agentState || {}),
          scenes: newScenes,
          shots: newShots,
          loaded: true,
        },
      }));
    } finally {
      setEpisodeDataLoading(false);
    }
  }, []);

  const applyEpisodeState = useCallback((state: EpisodeWorkspaceState) => {
    setScenes(state.scenes);
    setShots(state.shots);
    setActiveSceneId(state.activeSceneId);
  }, []);

  useEffect(() => {
    if (scenes.length === 0) {
      if (activeSceneId !== null) {
        setActiveSceneId(null);
      }
      return;
    }
    if (!activeSceneId || !scenes.some((scene) => scene.id === activeSceneId)) {
      setActiveSceneId(scenes[0].id);
    }
  }, [scenes, activeSceneId]);

  const loadProject = useCallback(
    async (options?: { silent?: boolean; selectEpisodeId?: number }) => {
      if (!pid) return;
      if (!options?.silent) {
        setLoading(true);
      }
      try {
        const [res, propsRes, buildingsRes] = await Promise.all([
          directorApi.getProject(pid),
          directorApi.listProps(pid),
          directorApi.listBuildings(pid),
        ]);
        if (res.success) {
          setProject(res.data);
          let nextEpisodeId = options?.selectEpisodeId ?? null;
          if (!nextEpisodeId) {
            const prev = activeEpisodeIdRef.current;
            if (prev && res.data.episodes?.some((e: DirectorEpisode) => e.id === prev)) {
              nextEpisodeId = prev;
            } else {
              nextEpisodeId = res.data.episodes?.[0]?.id ?? null;
            }
          }
          setActiveEpisodeId(nextEpisodeId);
          if (res.data.characters) {
            setCharacters(res.data.characters);
          }
          if (propsRes.success) {
            setProps(propsRes.data || []);
          } else if (res.data.props) {
            setProps(res.data.props);
          }
          if (buildingsRes.success) {
            setBuildings(buildingsRes.data || []);
          } else if (res.data.buildings) {
            setBuildings(res.data.buildings);
          }
          settingsForm.setFieldsValue({
            stylePrompt: res.data.stylePrompt,
            coverUrl: res.data.coverUrl || undefined,
          });
          if (!options?.silent && nextEpisodeId) {
            const cached = episodeStatesRef.current[nextEpisodeId];
            if (cached?.loaded) {
              applyEpisodeState(cached);
            } else {
              const freshAgentState = createEmptyEpisodeState();
              applyEpisodeState(freshAgentState);
              await loadEpisodeData(nextEpisodeId, freshAgentState);
            }
          }
        } else {
          message.error(res.message || '加载失败');
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [pid, settingsForm, applyEpisodeState, loadEpisodeData]
  );

  const snapshotCurrentEpisodeState = useCallback((): EpisodeWorkspaceState => ({
    scenes,
    shots,
    activeSceneId,
    loaded: true,
  }), [scenes, shots, activeSceneId]);

  const handleEpisodeChange = useCallback(
    async (newEpisodeId: number) => {
      if (newEpisodeId === activeEpisodeId) return;

      if (activeEpisodeId) {
        setEpisodeStates((prev) => ({
          ...prev,
          [activeEpisodeId]: snapshotCurrentEpisodeState(),
        }));
      }

      setActiveEpisodeId(newEpisodeId);

      const cached = episodeStatesRef.current[newEpisodeId];
      if (cached?.loaded) {
        applyEpisodeState(cached);
        return;
      }

      const freshAgentState = createEmptyEpisodeState();
      applyEpisodeState(freshAgentState);
      await loadEpisodeData(newEpisodeId, freshAgentState);
    },
    [activeEpisodeId, applyEpisodeState, loadEpisodeData, snapshotCurrentEpisodeState]
  );

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (project?.characters) {
      setCharacters(project.characters);
    }
    if (project?.props) {
      setProps(project.props);
    }
    if (project?.buildings) {
      setBuildings(project.buildings);
    }
  }, [project?.characters, project?.props, project?.buildings]);

  useEffect(() => {
    loadCharacterPropBindings(characters);
  }, [characters, loadCharacterPropBindings]);

  const refreshAssetBindings = useCallback(() => {
    loadCharacterPropBindings(characters);
  }, [characters, loadCharacterPropBindings]);

  useEffect(() => {
    const fetchI2vModels = async () => {
      setI2vModelsLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
          params: { modelType: 'i2v' },
        });
        if (response.data.success && response.data.data?.length) {
          const list = response.data.data as VideoModel[];
          setI2vModels(list);
          preloadVideoModelCovers(list);
        } else {
          setI2vModels([]);
        }
      } catch {
        message.error(
          intl.formatMessage({ id: 'create.model.loadFailed', defaultMessage: '加载模型列表失败' })
        );
      } finally {
        setI2vModelsLoading(false);
      }
    };

    const fetchT2iModels = async () => {
      setT2iModelsLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/image/families', {
          params: { lang: locale || 'en' },
        });
        if (response.data.success && response.data.data?.length) {
          setT2iModels(filterPaidT2iModels(response.data.data));
        } else {
          setT2iModels([]);
        }
      } catch {
        message.error(
          intl.formatMessage({
            id: 'create.model.loadFailed',
            defaultMessage: '加载模型列表失败',
          })
        );
      } finally {
        setT2iModelsLoading(false);
      }
    };

    fetchI2vModels();
    fetchT2iModels();
  }, [intl, locale]);

  useEffect(() => {
    if (!project || i2vModels.length === 0) return;

    const matched = project.defaultI2vModelCode
      ? i2vModels.find((m) => m.modelCode === project.defaultI2vModelCode)
      : undefined;
    const model = matched || i2vModels[0];
    if (!model) return;

    setSelectedI2vModel(model);
    settingsForm.setFieldsValue({ defaultI2vModelId: model.id });
    preloadVideoModelCovers(i2vModels, { priorityModelId: model.id });
  }, [project, project?.defaultI2vModelCode, i2vModels, settingsForm]);

  useEffect(() => {
    if (!project || t2iModels.length === 0) return;

    const matched = project.defaultT2iModelCode
      ? t2iModels.find((m) => m.modelCode === project.defaultT2iModelCode)
      : undefined;
    const model = matched || t2iModels[0];
    if (!model) return;

    setSelectedT2iModel(model);
    settingsForm.setFieldsValue({ defaultT2iModelId: model.id });
  }, [project, project?.defaultT2iModelCode, t2iModels, settingsForm]);

  const applySelectedI2vModel = (model: VideoModel) => {
    setSelectedI2vModel(model);
    settingsForm.setFieldsValue({ defaultI2vModelId: model.id });
    setI2vModelPickerVisible(false);
  };

  const applySelectedT2iModel = (model: ModelFamily) => {
    setSelectedT2iModel(model);
    settingsForm.setFieldsValue({ defaultT2iModelId: model.id });
    setT2iModelPickerVisible(false);
  };

  const saveSettings = async () => {
    const values = await settingsForm.validateFields();
    const {
      defaultI2vModelId: _i2vModelId,
      defaultT2iModelId: _t2iModelId,
      ...rest
    } = values;
    const res = await directorApi.updateProject(pid, {
      ...rest,
      coverUrl: values.coverUrl || '',
      defaultI2vModelCode: selectedI2vModel?.modelCode,
      defaultT2iModelCode: selectedT2iModel?.modelCode,
    });
    if (res.success) {
      message.success(intl.formatMessage({ id: 'director.settings.saved', defaultMessage: '设置已保存' }));
      loadProject({ silent: true });
    } else {
      message.error(res.message);
    }
  };

  const handleSyncShot = async (shotId: number) => {
    const res = await directorApi.syncShotTask(shotId);
    if (res.success && activeEpisode?.id) {
      loadEpisodeData(activeEpisode.id);
    }
  };

  const handleCreateEpisode = async (body: {
    title: string;
    synopsis?: string;
    coverUrl?: string;
  }): Promise<number | null> => {
    setAddingEpisode(true);
    try {
      const res = await directorApi.createEpisode(pid, {
        title: body.title.trim(),
        synopsis: body.synopsis?.trim() || undefined,
      });
      if (res.success && res.data?.id) {
        const episodeId = res.data.id as number;
        if (body.coverUrl?.trim()) {
          await directorApi.updateEpisode(episodeId, {
            title: body.title.trim(),
            synopsis: body.synopsis?.trim(),
            coverUrl: body.coverUrl.trim(),
          });
        }
        message.success(
          intl.formatMessage({ id: 'director.episode.added', defaultMessage: '新集已创建' })
        );
        await loadProject({ silent: true, selectEpisodeId: episodeId });
        const freshAgentState = createEmptyEpisodeState();
        applyEpisodeState(freshAgentState);
        await loadEpisodeData(episodeId, freshAgentState);
        setActiveTab('episodes');
        return episodeId;
      }
      message.error(res.message || intl.formatMessage({ id: 'director.episode.addFailed', defaultMessage: '创建失败' }));
      return null;
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.episode.addFailed', defaultMessage: '创建失败' }));
      return null;
    } finally {
      setAddingEpisode(false);
    }
  };

  const handleUpdateEpisode = async (
    episodeId: number,
    body: { title: string; synopsis?: string; coverUrl?: string | null }
  ): Promise<boolean> => {
    const res = await directorApi.updateEpisode(episodeId, body);
    if (res.success) {
      await loadProject({ silent: true });
      return true;
    }
    message.error(res.message || intl.formatMessage({ id: 'director.episode.saveFailed', defaultMessage: '保存失败' }));
    return false;
  };

  const handleEpisodeClick = async (episodeId: number) => {
    await handleEpisodeChange(episodeId);
  };

  const handleSceneSelect = (sceneId: number | null) => {
    setActiveSceneId(sceneId);
  };

  const persistProjectCover = useCallback(
    async (url?: string) => {
      try {
        const res = await directorApi.updateProject(pid, { coverUrl: url || '' });
        if (res.success) {
          await loadProject({ silent: true });
        } else {
          message.error(res.message || intl.formatMessage({ id: 'director.cover.uploadFailed', defaultMessage: '封面上传失败' }));
        }
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.cover.uploadFailed', defaultMessage: '封面上传失败' }));
      }
    },
    [pid, loadProject, intl]
  );

  if (loading || !project) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <WorkspaceRoot>
      <ProjectHero
        $hasCover={Boolean(headerCoverUrl)}
        style={headerCoverUrl ? { backgroundImage: `url("${headerCoverUrl}")` } : undefined}
      >
        <ProjectHeroOverlay $hasCover={Boolean(headerCoverUrl)} />
        <ProjectHeroContent>
          <ProjectHeroTop>
            <HeroGhostButton icon={<ArrowLeftOutlined />} onClick={() => navigate('/workspace/create/director')}>
              <FormattedMessage id="director.back" defaultMessage="返回列表" />
            </HeroGhostButton>
            <Form form={settingsForm} component={false}>
              <Form.Item name="coverUrl" noStyle>
                <CoverImageUpload
                  aspectRatio={project.aspectRatio}
                  hidePreview
                  compactTrigger
                  onUploaded={persistProjectCover}
                  onClear={() => persistProjectCover('')}
                />
              </Form.Item>
            </Form>
          </ProjectHeroTop>
          <ProjectHeroBottom>
            <ProjectHeroMain>
              <ProjectHeroTitle level={3}>{project.title}</ProjectHeroTitle>
              {project.stylePrompt ? (
                <ProjectHeroSynopsis ellipsis={{ rows: 2, expandable: false }}>
                  {project.stylePrompt}
                </ProjectHeroSynopsis>
              ) : null}
              <ProjectHeroMeta style={{ marginTop: project.stylePrompt ? 10 : 0 }}>
                <HeroStatTag>{project.aspectRatio}</HeroStatTag>
                <HeroStatTag>
                  {intl.formatMessage(
                    { id: 'director.project.episodeCountTag', defaultMessage: '{count} 集' },
                    { count: episodeCount }
                  )}
                </HeroStatTag>
                <HeroStatTag>
                  {intl.formatMessage(
                    { id: 'director.project.characterCountTag', defaultMessage: '{count} 角色' },
                    { count: characterCount }
                  )}
                </HeroStatTag>
                <HeroStatTag>
                  {intl.formatMessage(
                    { id: 'director.project.propCountTag', defaultMessage: '{count} 道具' },
                    { count: propCount }
                  )}
                </HeroStatTag>
                <HeroStatTag>
                  {intl.formatMessage(
                    { id: 'director.project.buildingCountTag', defaultMessage: '{count} 建筑' },
                    { count: buildingCount }
                  )}
                </HeroStatTag>
              </ProjectHeroMeta>
            </ProjectHeroMain>
          </ProjectHeroBottom>
        </ProjectHeroContent>
      </ProjectHero>

      <WorkspaceTabBar>
        <Segmented
          block
          value={activeTab}
          onChange={(value) => setActiveTab(value as WorkspaceTab)}
          options={[
            {
              value: 'overview',
              label: (
                <Space size={6}>
                  <VideoCameraOutlined />
                  <span>{intl.formatMessage({ id: 'director.tab.overview', defaultMessage: '项目概览' })}</span>
                </Space>
              ),
            },
            {
              value: 'episodes',
              label: (
                <Space size={6}>
                  <OrderedListOutlined />
                  <span>{intl.formatMessage({ id: 'director.tab.episodes', defaultMessage: '剧集管理' })}</span>
                </Space>
              ),
            },
            {
              value: 'assets',
              label: (
                <Space size={6}>
                  <AppstoreOutlined />
                  <span>{intl.formatMessage({ id: 'director.tab.assets', defaultMessage: '资产管理' })}</span>
                </Space>
              ),
            },
          ]}
        />
      </WorkspaceTabBar>

      <WorkspaceBody>
          <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
            <ContentCard title={intl.formatMessage({ id: 'director.settings.title', defaultMessage: '项目设置' })}>
              <GlobalSelectStyles />
              <Form form={settingsForm} layout="vertical" onFinish={saveSettings}>
                <DirectorModelSettingsRow gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <VideoModelSelectField
                      formItemName="defaultI2vModelId"
                      label={intl.formatMessage({
                        id: 'director.settings.i2vModel',
                        defaultMessage: '默认图生视频模型',
                      })}
                      selectedModel={selectedI2vModel}
                      modelsLoading={i2vModelsLoading}
                      onOpenModal={() => setI2vModelPickerVisible(true)}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <T2iModelSelectField
                      formItemName="defaultT2iModelId"
                      label={intl.formatMessage({
                        id: 'director.settings.t2iModel',
                        defaultMessage: '默认文生图模型',
                      })}
                      selectedModel={selectedT2iModel}
                      modelsLoading={t2iModelsLoading}
                      onOpenModal={() => setT2iModelPickerVisible(true)}
                    />
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="stylePrompt"
                      label={intl.formatMessage({ id: 'director.project.style', defaultMessage: '全局画风' })}
                    >
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Col>
                </DirectorModelSettingsRow>
                <SettingsFormFooter>
                  <Button type="primary" htmlType="submit">
                    <FormattedMessage id="director.settings.save" defaultMessage="保存设置" />
                  </Button>
                </SettingsFormFooter>
              </Form>
            </ContentCard>
          </div>

          <div style={{ display: activeTab === 'episodes' ? 'block' : 'none' }}>
            <EpisodeManager
              episodes={project.episodes || []}
              characters={characters}
              props={props}
              characterPropMap={characterPropMap}
              scenes={scenes}
              shots={shots}
              activeEpisodeId={activeEpisodeId}
              activeSceneId={activeSceneId}
              episodeDataLoading={episodeDataLoading}
              addingEpisode={addingEpisode}
              onCreateEpisode={handleCreateEpisode}
              onUpdateEpisode={handleUpdateEpisode}
              onEpisodeClick={handleEpisodeClick}
              onSceneSelect={handleSceneSelect}
              onReloadEpisodeData={() => {
                if (activeEpisode?.id) loadEpisodeData(activeEpisode.id);
              }}
              onSyncShot={handleSyncShot}
              aspectRatio={project.aspectRatio}
              stylePrompt={project.stylePrompt}
              defaultT2iModelCode={project.defaultT2iModelCode}
              defaultI2vModelCode={project.defaultI2vModelCode}
              onEpisodeDataChange={() => loadProject({ silent: true })}
            />
          </div>

          <div style={{ display: activeTab === 'assets' ? 'block' : 'none' }}>
            <AssetManager
              projectId={pid}
              characters={characters}
              props={props}
              buildings={buildings}
              characterPropMap={characterPropMap}
              propCharacterMap={propCharacterMap}
              onCharactersChange={() => loadProject({ silent: true })}
              onPropsChange={() => loadProject({ silent: true })}
              onBuildingsChange={() => loadProject({ silent: true })}
              onBindingsChange={refreshAssetBindings}
            />
          </div>
      </WorkspaceBody>

      <VideoModelSelectionModal
        open={i2vModelPickerVisible}
        onClose={() => setI2vModelPickerVisible(false)}
        type="family"
        title={intl.formatMessage({ id: 'create.model.select', defaultMessage: '选择模型' })}
        models={i2vModels}
        selectedModel={selectedI2vModel}
        onSelect={(m) => applySelectedI2vModel(m as VideoModel)}
        onShowDetail={(m) => {
          setSelectedI2vModelForDetail(m as VideoModel);
          setI2vModelDetailVisible(true);
        }}
        loading={i2vModelsLoading}
      />

      <VideoModelDetailModal
        open={i2vModelDetailVisible}
        onClose={() => {
          setI2vModelDetailVisible(false);
          setSelectedI2vModelForDetail(null);
        }}
        model={selectedI2vModelForDetail}
      />

      <T2iModelSelectionModal
        open={t2iModelPickerVisible}
        onClose={() => setT2iModelPickerVisible(false)}
        type="family"
        title={intl.formatMessage({ id: 'create.model.select', defaultMessage: '选择模型' })}
        models={t2iModels}
        selectedModel={selectedT2iModel}
        onSelect={(model) => applySelectedT2iModel(model as ModelFamily)}
        onShowDetail={(model) => {
          setSelectedT2iModelForDetail(model as ModelDetail);
          setT2iModelDetailVisible(true);
        }}
        loading={t2iModelsLoading}
      />

      <ModelDetailModal
        open={t2iModelDetailVisible}
        onClose={() => {
          setT2iModelDetailVisible(false);
          setSelectedT2iModelForDetail(null);
        }}
        model={selectedT2iModelForDetail}
      />
    </WorkspaceRoot>
  );
};

export default ProjectWorkspace;
