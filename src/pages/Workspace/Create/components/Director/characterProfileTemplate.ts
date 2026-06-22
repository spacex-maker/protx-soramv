export type CharacterProfileTemplateKey =
  | 'gender'
  | 'age'
  | 'role'
  | 'personality'
  | 'appearance'
  | 'clothing'
  | 'background'
  | 'goal'
  | 'speechStyle'
  | 'relationship';

export type CharacterProfileTemplateValues = Partial<Record<CharacterProfileTemplateKey, string>>;

export const CHARACTER_PROFILE_FIELD_KEYS: CharacterProfileTemplateKey[] = [
  'gender',
  'age',
  'role',
  'personality',
  'appearance',
  'clothing',
  'background',
  'goal',
  'speechStyle',
  'relationship',
];

export type CharacterProfileSectionKey = 'basic' | 'visual' | 'personality' | 'story';

export interface CharacterProfileSection {
  key: CharacterProfileSectionKey;
  fields: CharacterProfileTemplateKey[];
}

export const CHARACTER_PROFILE_SECTIONS: CharacterProfileSection[] = [
  { key: 'basic', fields: ['gender', 'age', 'role'] },
  { key: 'visual', fields: ['appearance', 'clothing'] },
  { key: 'personality', fields: ['personality', 'speechStyle'] },
  { key: 'story', fields: ['background', 'goal', 'relationship'] },
];

export type CharacterProfilePresetKey = 'protagonist' | 'supporting' | 'antagonist';

export interface CharacterProfilePreset {
  key: CharacterProfilePresetKey;
}

export const CHARACTER_PROFILE_PRESET_KEYS: CharacterProfilePresetKey[] = [
  'protagonist',
  'supporting',
  'antagonist',
];

/** 每个预设会尝试填充的字段（具体文案走 i18n） */
export const CHARACTER_PROFILE_PRESET_FIELDS: Record<
  CharacterProfilePresetKey,
  CharacterProfileTemplateKey[]
> = {
  protagonist: ['role', 'personality', 'goal'],
  supporting: ['role', 'personality', 'relationship'],
  antagonist: ['role', 'personality', 'goal'],
};

export function buildDescriptionFromTemplate(
  values: CharacterProfileTemplateValues,
  getLabel: (key: CharacterProfileTemplateKey) => string
): string {
  return CHARACTER_PROFILE_FIELD_KEYS.map((key) => {
    const value = values[key]?.trim();
    if (!value) return '';
    return `${getLabel(key)}：${value}`;
  })
    .filter(Boolean)
    .join('\n');
}

export function parseDescriptionToTemplate(
  description: string,
  getLabel: (key: CharacterProfileTemplateKey) => string
): CharacterProfileTemplateValues {
  const result: CharacterProfileTemplateValues = {};
  if (!description?.trim()) return result;

  CHARACTER_PROFILE_FIELD_KEYS.forEach((key) => {
    const label = getLabel(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?:^|\\n)\\s*${label}\\s*[：:]\\s*([^\\n]+)`, 'i');
    const match = description.match(pattern);
    if (match?.[1]) {
      result[key] = match[1].trim();
    }
  });

  return result;
}

export function buildPromptSuffixFromTemplate(values: CharacterProfileTemplateValues): string | undefined {
  const parts = [values.appearance, values.clothing].map((v) => v?.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;
  return parts.join(', ');
}

export function hasTemplateValues(values: CharacterProfileTemplateValues): boolean {
  return CHARACTER_PROFILE_FIELD_KEYS.some((key) => !!values[key]?.trim());
}

export function countFilledTemplateFields(values: CharacterProfileTemplateValues): number {
  return CHARACTER_PROFILE_FIELD_KEYS.filter((key) => !!values[key]?.trim()).length;
}
