import { DirectorCharacter, DirectorScene } from 'api/director';
import { normalizeCameraMotion, normalizeShotSize } from './shotProductionEnums';

export interface AgentStoryboardItem {
  shotNo?: number | string;
  sceneNo?: number | string;
  description?: string;
  prompt?: string;
  dialogue?: string;
  durationSec?: number;
  shotSize?: string;
  cameraMotion?: string;
  characterNames?: string[] | string;
}

export interface AgentSceneItem {
  sceneNo?: number | string;
  location?: string;
  timeOfDay?: string;
  scriptContent?: string;
}

export interface ApplyStoryboardShotPayload {
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
}

export interface ApplyScenePayload {
  sceneNo?: number;
  location?: string;
  timeOfDay?: string;
  scriptContent?: string;
  sortOrder?: number;
}

const toInteger = (value: unknown): number | undefined => {
  if (value == null || value === '') return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toStringValue = (value: unknown): string | undefined => {
  if (value == null) return undefined;
  const str = String(value).trim();
  return str || undefined;
};

export const extractJsonArrayText = (text: string): string | null => {
  if (!text?.trim()) return null;
  let trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, '');
    const end = trimmed.lastIndexOf('```');
    if (end >= 0) {
      trimmed = trimmed.slice(0, end).trim();
    }
  }
  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start < 0 || end <= start) return null;
  return trimmed.slice(start, end + 1);
};

export const parseStoryboardJson = (text: string): AgentStoryboardItem[] | null => {
  const jsonText = extractJsonArrayText(text);
  if (!jsonText) return null;
  try {
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? (parsed as AgentStoryboardItem[]) : null;
  } catch {
    return null;
  }
};

export const parseScenesJson = (text: string): AgentSceneItem[] | null => {
  const jsonText = extractJsonArrayText(text);
  if (!jsonText) return null;
  try {
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? (parsed as AgentSceneItem[]) : null;
  } catch {
    return null;
  }
};

export const buildApplyScenesPayload = (items: AgentSceneItem[]): ApplyScenePayload[] =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => ({
      sceneNo: toInteger(item.sceneNo) ?? index + 1,
      location: toStringValue(item.location),
      timeOfDay: toStringValue(item.timeOfDay),
      scriptContent: toStringValue(item.scriptContent),
      sortOrder: index,
    }));

export const buildApplyStoryboardPayload = (
  items: AgentStoryboardItem[],
  scenes: DirectorScene[],
  characters: DirectorCharacter[],
  options?: { sceneId?: number; sceneNo?: number }
): ApplyStoryboardShotPayload[] => {
  const sceneIdByNo = new Map<number, number>();
  scenes.forEach((scene) => {
    if (scene.sceneNo != null) {
      sceneIdByNo.set(scene.sceneNo, scene.id);
    }
  });

  const fixedSceneId = options?.sceneId;
  const fixedSceneNo = options?.sceneNo ?? (fixedSceneId
    ? scenes.find((scene) => scene.id === fixedSceneId)?.sceneNo
    : undefined);

  const characterIdByName = new Map<string, number>();
  characters.forEach((character) => {
    if (character.name) {
      characterIdByName.set(character.name.trim(), character.id);
    }
  });

  return items
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const sceneNo = toInteger(item.sceneNo) ?? fixedSceneNo;
      const shotNo = toInteger(item.shotNo) ?? index + 1;
      const shotNoLabel = sceneNo != null ? `${sceneNo}-${shotNo}` : String(shotNo);

      const rawNames = item.characterNames;
      const names: string[] = Array.isArray(rawNames)
        ? rawNames.map((name) => String(name).trim()).filter(Boolean)
        : typeof rawNames === 'string' && rawNames.trim()
          ? [rawNames.trim()]
          : [];

      const characterIds = names
        .map((name) => characterIdByName.get(name))
        .filter((id): id is number => id != null);

      return {
        shotNo: shotNoLabel,
        sceneId: fixedSceneId ?? (sceneNo != null ? sceneIdByNo.get(sceneNo) : undefined),
        description: toStringValue(item.description),
        prompt: toStringValue(item.prompt),
        dialogue: toStringValue(item.dialogue),
        durationSec: toInteger(item.durationSec) ?? 5,
        shotSize: normalizeShotSize(toStringValue(item.shotSize)),
        cameraMotion: normalizeCameraMotion(toStringValue(item.cameraMotion)) ?? 'none',
        characterIds: characterIds.length ? characterIds : undefined,
        sortOrder: index,
      };
    });
};

export type AgentPendingPreview =
  | { type: 'scenes'; items: ApplyScenePayload[]; rawReply: string }
  | { type: 'shots'; items: ApplyStoryboardShotPayload[]; rawReply: string; sceneId?: number }
  | { type: 'sceneDraft'; item: ApplyScenePayload; rawReply: string }
  | { type: 'shotDraft'; item: Partial<ApplyStoryboardShotPayload>; rawReply: string };

export const extractJsonObjectText = (text: string): string | null => {
  if (!text?.trim()) return null;
  let trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, '');
    const end = trimmed.lastIndexOf('```');
    if (end >= 0) trimmed = trimmed.slice(0, end).trim();
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  return trimmed.slice(start, end + 1);
};

export const parseSceneDraftJson = (text: string): AgentSceneItem | null => {
  const arrayText = extractJsonArrayText(text);
  if (arrayText) {
    try {
      const parsed = JSON.parse(arrayText);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0] as AgentSceneItem;
    } catch {
      // fall through
    }
  }
  const objectText = extractJsonObjectText(text);
  if (!objectText) return null;
  try {
    return JSON.parse(objectText) as AgentSceneItem;
  } catch {
    return null;
  }
};

export const parseShotDraftJson = (text: string): AgentStoryboardItem | null => {
  const arrayText = extractJsonArrayText(text);
  if (arrayText) {
    try {
      const parsed = JSON.parse(arrayText);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0] as AgentStoryboardItem;
    } catch {
      // fall through
    }
  }
  const objectText = extractJsonObjectText(text);
  if (!objectText) return null;
  try {
    return JSON.parse(objectText) as AgentStoryboardItem;
  } catch {
    return null;
  }
};

export const buildPendingPreview = (
  action: string,
  reply: string,
  scenes: DirectorScene[],
  characters: DirectorCharacter[],
  sceneId?: number
): AgentPendingPreview | null => {
  if (action === 'write_scenes') {
    const parsed = parseScenesJson(reply);
    if (!parsed?.length) return null;
    const items = buildApplyScenesPayload(parsed);
    return items.length ? { type: 'scenes', items, rawReply: reply } : null;
  }
  if (action === 'split_storyboard') {
    const parsed = parseStoryboardJson(reply);
    if (!parsed?.length) return null;
    const targetScene = sceneId ? scenes.find((scene) => scene.id === sceneId) : undefined;
    const items = buildApplyStoryboardPayload(parsed, scenes, characters, {
      sceneId,
      sceneNo: targetScene?.sceneNo,
    });
    return items.length ? { type: 'shots', items, rawReply: reply, sceneId } : null;
  }
  if (action === 'refine_scene') {
    const parsed = parseSceneDraftJson(reply);
    if (!parsed) return null;
    const items = buildApplyScenesPayload([parsed]);
    return items.length ? { type: 'sceneDraft', item: items[0], rawReply: reply } : null;
  }
  if (action === 'refine_shot') {
    const parsed = parseShotDraftJson(reply);
    if (!parsed) return null;
    const items = buildApplyStoryboardPayload([parsed], scenes, characters, { sceneId });
    const item = items[0];
    return item
      ? {
          type: 'shotDraft',
          item: {
            description: item.description,
            prompt: item.prompt,
            dialogue: item.dialogue,
            durationSec: item.durationSec,
            shotSize: item.shotSize,
            cameraMotion: item.cameraMotion,
          },
          rawReply: reply,
        }
      : null;
  }
  return null;
};
