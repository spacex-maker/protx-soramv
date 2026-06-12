export const SPEECH_TONE_KEYS = [
  'natural',
  'happy',
  'sad',
  'angry',
  'gentle',
  'excited',
  'serious',
  'storytelling',
  'warm',
] as const;

export type SpeechToneKey = typeof SPEECH_TONE_KEYS[number];

const ZH_INSTRUCTIONS: Record<Exclude<SpeechToneKey, 'natural'>, string> = {
  happy: '用开心愉快的语气朗读',
  sad: '用低沉悲伤的语气朗读',
  angry: '用愤怒有力的语气朗读',
  gentle: '用温柔自然的语气朗读',
  excited: '用激动兴奋的语气朗读',
  serious: '用严肃正式的语气朗读',
  storytelling: '用讲故事般娓娓道来的语气朗读',
  warm: '用温暖亲切的语气朗读',
};

const EN_INSTRUCTIONS: Record<Exclude<SpeechToneKey, 'natural'>, string> = {
  happy: 'Read in a cheerful, happy tone',
  sad: 'Read in a low, sad tone',
  angry: 'Read in an angry, forceful tone',
  gentle: 'Read in a gentle, natural tone',
  excited: 'Read in an excited, energetic tone',
  serious: 'Read in a serious, formal tone',
  storytelling: 'Read in a storytelling, narrative tone',
  warm: 'Read in a warm, friendly tone',
};

const isEnglishVoice = (language?: string) => language?.toLowerCase().startsWith('en') ?? false;

export const resolveSpeechContextInstruction = (
  tone: SpeechToneKey | undefined,
  customInstruction?: string,
  voiceLanguage?: string,
): string | undefined => {
  const custom = customInstruction?.trim();
  if (custom) {
    return custom;
  }
  if (!tone || tone === 'natural') {
    return undefined;
  }
  const instructions = isEnglishVoice(voiceLanguage) ? EN_INSTRUCTIONS : ZH_INSTRUCTIONS;
  return instructions[tone];
};
