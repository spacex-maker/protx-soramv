export interface VoiceModel {
  id: number;
  voiceCode: string;
  voiceName: string;
  voiceNameEn?: string;
  language?: string;
  gender?: string;
  style?: string;
  dialect?: string;
  ttsModel?: string;
  sampleRate?: number;
  audioFormats?: string;
  defaultFormat?: string;
  maxTextLength?: number;
  supportContextTexts?: boolean;
  supportSubtitle?: boolean;
  supportDialect?: boolean;
  tokenCost?: number;
  usageCount?: number;
  commentCount?: number;
  hotRank?: number;
  favorited?: boolean;
  previewUrl?: string;
  coverImage?: string;
  resourceId?: string;
}

export interface VoiceComment {
  id: number;
  voiceId: number;
  userId: number;
  nickname?: string;
  avatar?: string;
  content: string;
  createTime?: string;
}
