import instance from './axios';

export interface DirectorProject {
  id: number;
  title: string;
  aspectRatio: string;
  stylePrompt?: string | null;
  status: string;
  coverUrl?: string | null;
  episodeCount?: number;
  defaultI2vModelCode?: string | null;
  defaultT2iModelCode?: string | null;
  defaultTtsModelCode?: string | null;
  defaultLlmModelCode?: string | null;
  createTime?: string;
  updateTime?: string;
}

export interface DirectorEpisode {
  id: number;
  projectId: number;
  episodeNo: number;
  title?: string | null;
  synopsis?: string | null;
  coverUrl?: string | null;
  status: string;
  shotCount?: number;
  characterCount?: number;
}

export interface DirectorCharacter {
  id: number;
  projectId: number;
  name: string;
  description?: string | null;
  referenceImageUrl?: string | null;
  promptSuffix?: string | null;
  sortOrder?: number;
  propCount?: number;
}

export interface DirectorProp {
  id: number;
  projectId: number;
  name: string;
  description?: string | null;
  referenceImageUrl?: string | null;
  promptSuffix?: string | null;
  category?: string | null;
  sortOrder?: number;
  characterCount?: number;
}

export interface DirectorSceneReferenceImage {
  id?: number;
  sceneId?: number;
  /** 客户端临时 key，保存前无 id 时使用 */
  localKey?: string;
  imageUrl: string;
  caption?: string | null;
  sortOrder?: number;
}

export interface DirectorScene {
  id: number;
  episodeId: number;
  sceneNo: number;
  location?: string | null;
  timeOfDay?: string | null;
  scriptContent?: string | null;
  referenceImages?: DirectorSceneReferenceImage[];
  referenceImageCount?: number;
}

export interface DirectorShot {
  id: number;
  episodeId: number;
  sceneId?: number | null;
  shotNo: string;
  description?: string | null;
  prompt?: string | null;
  dialogue?: string | null;
  durationSec?: number;
  shotSize?: string | null;
  cameraMotion?: string | null;
  keyframeImageUrl?: string | null;
  endFrameImageUrl?: string | null;
  characterIds?: number[];
  propIds?: number[];
  status: string;
  genTaskId?: number | null;
  sortOrder?: number;
}

export interface DirectorProjectDetail extends DirectorProject {
  episodes?: DirectorEpisode[];
  characters?: DirectorCharacter[];
  characterCount?: number;
  props?: DirectorProp[];
  propCount?: number;
}

export interface DirectorAgentChatResult {
  sessionId: number;
  reply: string;
  modelCode: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  tokenDeducted?: number;
}

export interface DirectorProductionResult {
  shotId: number;
  status: string;
  genTaskId?: number | null;
  fileUrl?: string | null;
  videoGeneration?: { id?: string; status?: string; videoUrl?: string; error?: string };
}

const directorApi = {
  listProjects: () =>
    instance.get('/productx/director/projects').then((r) => r.data),

  getProject: (projectId: number) =>
    instance.get(`/productx/director/projects/${projectId}`).then((r) => r.data),

  createProject: (body: { title: string; aspectRatio?: string; stylePrompt?: string; defaultI2vModelCode?: string; defaultT2iModelCode?: string }) =>
    instance.post('/productx/director/projects', body).then((r) => r.data),

  updateProject: (projectId: number, body: Record<string, unknown>) =>
    instance.put(`/productx/director/projects/${projectId}`, body).then((r) => r.data),

  deleteProject: (projectId: number) =>
    instance.delete(`/productx/director/projects/${projectId}`).then((r) => r.data),

  listEpisodes: (projectId: number) =>
    instance.get(`/productx/director/projects/${projectId}/episodes`).then((r) => r.data),

  createEpisode: (
    projectId: number,
    body?: { episodeNo?: number; title?: string; synopsis?: string; coverUrl?: string }
  ) => instance.post(`/productx/director/projects/${projectId}/episodes`, body || {}).then((r) => r.data),

  updateEpisode: (
    episodeId: number,
    body: { title?: string; synopsis?: string; status?: string; coverUrl?: string | null }
  ) => instance.put(`/productx/director/episodes/${episodeId}`, body).then((r) => r.data),

  listEpisodeCharacters: (episodeId: number) =>
    instance.get(`/productx/director/episodes/${episodeId}/characters`).then((r) => r.data),

  bindEpisodeCharacters: (episodeId: number, body: { characterIds: number[] }) =>
    instance.put(`/productx/director/episodes/${episodeId}/characters`, body).then((r) => r.data),

  listCharacters: (projectId: number) =>
    instance.get(`/productx/director/projects/${projectId}/characters`).then((r) => r.data),

  createCharacter: (
    projectId: number,
    body: {
      name: string;
      description?: string;
      referenceImageUrl?: string;
      promptSuffix?: string;
      sortOrder?: number;
    }
  ) => instance.post(`/productx/director/projects/${projectId}/characters`, body).then((r) => r.data),

  updateCharacter: (characterId: number, body: Record<string, unknown>) =>
    instance.put(`/productx/director/characters/${characterId}`, body).then((r) => r.data),

  deleteCharacter: (characterId: number) =>
    instance.delete(`/productx/director/characters/${characterId}`).then((r) => r.data),

  listCharacterProps: (characterId: number) =>
    instance.get(`/productx/director/characters/${characterId}/props`).then((r) => r.data),

  bindCharacterProps: (characterId: number, body: { propIds: number[] }) =>
    instance.put(`/productx/director/characters/${characterId}/props`, body).then((r) => r.data),

  listProps: (projectId: number) =>
    instance.get(`/productx/director/projects/${projectId}/props`).then((r) => r.data),

  createProp: (
    projectId: number,
    body: {
      name: string;
      description?: string;
      referenceImageUrl?: string;
      promptSuffix?: string;
      category?: string;
      sortOrder?: number;
    }
  ) => instance.post(`/productx/director/projects/${projectId}/props`, body).then((r) => r.data),

  updateProp: (propId: number, body: Record<string, unknown>) =>
    instance.put(`/productx/director/props/${propId}`, body).then((r) => r.data),

  deleteProp: (propId: number) =>
    instance.delete(`/productx/director/props/${propId}`).then((r) => r.data),

  listPropCharacters: (propId: number) =>
    instance.get(`/productx/director/props/${propId}/characters`).then((r) => r.data),

  bindPropCharacters: (propId: number, body: { characterIds: number[] }) =>
    instance.put(`/productx/director/props/${propId}/characters`, body).then((r) => r.data),

  listScenes: (episodeId: number) =>
    instance.get(`/productx/director/episodes/${episodeId}/scenes`).then((r) => r.data),

  createScene: (episodeId: number, body: { sceneNo?: number; location?: string; scriptContent?: string }) =>
    instance.post(`/productx/director/episodes/${episodeId}/scenes`, body).then((r) => r.data),

  updateScene: (sceneId: number, body: Record<string, unknown>) =>
    instance.put(`/productx/director/scenes/${sceneId}`, body).then((r) => r.data),

  deleteScene: (sceneId: number) =>
    instance.delete(`/productx/director/scenes/${sceneId}`).then((r) => r.data),

  listSceneReferenceImages: (sceneId: number) =>
    instance.get(`/productx/director/scenes/${sceneId}/reference-images`).then((r) => r.data),

  replaceSceneReferenceImages: (
    sceneId: number,
    body: { images: Array<{ imageUrl: string; caption?: string; sortOrder?: number }> }
  ) => instance.put(`/productx/director/scenes/${sceneId}/reference-images`, body).then((r) => r.data),

  listShots: (episodeId: number) =>
    instance.get(`/productx/director/episodes/${episodeId}/shots`).then((r) => r.data),

  createShot: (episodeId: number, body: Partial<DirectorShot>) =>
    instance.post(`/productx/director/episodes/${episodeId}/shots`, body).then((r) => r.data),

  updateShot: (shotId: number, body: Record<string, unknown>) =>
    instance.put(`/productx/director/shots/${shotId}`, body).then((r) => r.data),

  deleteShot: (shotId: number) =>
    instance.delete(`/productx/director/shots/${shotId}`).then((r) => r.data),

  agentChat: (body: {
    episodeId: number;
    message: string;
    action?: string;
    useProModel?: boolean;
    sessionId?: number;
    sceneId?: number;
  }) => instance.post('/productx/director/agent/chat', body).then((r) => r.data),

  applyScenes: (body: {
    episodeId: number;
    replaceExisting?: boolean;
    scenes: Array<{
      sceneNo?: number;
      location?: string;
      timeOfDay?: string;
      scriptContent?: string;
      sortOrder?: number;
    }>;
  }) => instance.post('/productx/director/scenes/apply', body).then((r) => r.data),

  applyStoryboard: (body: {
    episodeId: number;
    sceneId?: number;
    replaceExisting?: boolean;
    shots: Array<{
      shotNo: string;
      sceneId?: number;
      description?: string;
      prompt?: string;
      dialogue?: string;
      durationSec?: number;
      shotSize?: string;
      cameraMotion?: string;
      characterIds?: number[];
      sortOrder?: number;
    }>;
  }) => instance.post('/productx/director/storyboard/apply', body).then((r) => r.data),

  generateKeyframe: (shotId: number, body?: { modelCode?: string; prompt?: string }) =>
    instance.post(`/productx/director/shots/${shotId}/generate-keyframe`, body || {}).then((r) => r.data),

  generateVideo: (shotId: number, body?: { modelCode?: string; seconds?: number }) =>
    instance.post(`/productx/director/shots/${shotId}/generate-video`, body || {}).then((r) => r.data),

  syncShotTask: (shotId: number) =>
    instance.post(`/productx/director/shots/${shotId}/sync-task`).then((r) => r.data),
};

export default directorApi;
