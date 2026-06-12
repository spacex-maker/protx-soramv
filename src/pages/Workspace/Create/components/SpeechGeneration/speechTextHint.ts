export interface SpeechTextProfile {
  hasHan: boolean;
  hasLatin: boolean;
  mixed: boolean;
  pureChinese: boolean;
  pureEnglish: boolean;
}

export function analyzeSpeechText(text: string): SpeechTextProfile {
  const hasHan = /[\u4e00-\u9fff]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);
  return {
    hasHan,
    hasLatin,
    mixed: hasHan && hasLatin,
    pureChinese: hasHan && !hasLatin,
    pureEnglish: hasLatin && !hasHan,
  };
}

export interface SpeechTextHint {
  type: 'info' | 'warning';
  messageId: string;
  defaultMessage: string;
}

/**
 * 火山 2.0 官方音色表：Vivi 等中文音色支持中英混读；Tim 等英文音色仅美式英语。
 */
export function getSpeechTextHint(text: string, voiceLanguage?: string): SpeechTextHint | null {
  const trimmed = text.trim();
  if (!trimmed || !voiceLanguage) {
    return null;
  }

  const profile = analyzeSpeechText(trimmed);
  const lang = voiceLanguage.toLowerCase();

  if (lang.startsWith('en') && profile.hasHan) {
    return {
      type: 'warning',
      messageId: profile.mixed
        ? 'create.speech.enVoiceChineseTextWarning'
        : 'create.speech.enVoicePureChineseWarning',
      defaultMessage: profile.mixed
        ? 'Tim 等英文音色仅支持美式英语，无法朗读中文段落；中英混合请选 Vivi 2.0 等中文音色。'
        : 'Tim 等英文音色仅支持美式英语，无法朗读纯中文；请选 Vivi 2.0 等中文音色。',
    };
  }

  if (profile.mixed) {
    return {
      type: 'info',
      messageId: 'create.speech.mixedTextInfo',
      defaultMessage: '中英混合推荐 Vivi 2.0 等中文音色；纯英文段落更自然可选 Tim。',
    };
  }

  if (profile.pureEnglish && lang.startsWith('zh')) {
    return {
      type: 'info',
      messageId: 'create.speech.pureEnglishZhVoiceInfo',
      defaultMessage: 'Vivi 等中文音色可朗读英文；纯英文更推荐 Tim 等英文音色。',
    };
  }

  return null;
}
