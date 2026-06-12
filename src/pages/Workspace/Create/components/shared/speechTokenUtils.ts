/** 与后端 SpeechTokenCostUtil 一致：unit=char 时 token_cost 为每字符 Token 单价（小数，如 0.04） */

export const SPEECH_TOKEN_UNIT_CHAR = 'char';
const BILLING_SCALE = 2;

export function countSpeechCharacters(text: string): number {
  if (!text) {
    return 0;
  }
  return Array.from(text).length;
}

export function isSpeechCharUnit(unit?: string | null): boolean {
  return (unit || '').trim().toLowerCase() === SPEECH_TOKEN_UNIT_CHAR;
}

/** 向上取整到 2 位小数，与后端 RoundingMode.CEILING 一致 */
export function ceilTokenAmount(value: number): number {
  if (value <= 0) {
    return 0;
  }
  return Math.ceil(value * 10 ** BILLING_SCALE) / 10 ** BILLING_SCALE;
}

export function calcSpeechTokenCost(
  charCount: number,
  engineTokenCost?: number | null,
  voiceTokenCost?: number | null,
  unit?: string | null,
): number {
  const engineRate = engineTokenCost || 0;
  const voiceRate = voiceTokenCost || 0;

  if (isSpeechCharUnit(unit)) {
    if (charCount <= 0 || (engineRate <= 0 && voiceRate <= 0)) {
      return 0;
    }
    return ceilTokenAmount(charCount * (engineRate + voiceRate));
  }

  return ceilTokenAmount(engineRate + voiceRate);
}

export function formatSpeechTokenAmount(amount: number): string {
  if (amount <= 0) {
    return '0 Token';
  }
  const text = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(BILLING_SCALE).replace(/\.?0+$/, '');
  return `${text} Token`;
}

export function getSpeechEstimatedPrice(
  text: string,
  engineTokenCost?: number | null,
  voiceTokenCost?: number | null,
  unit?: string | null,
): string | null {
  const total = calcSpeechTokenCost(
    countSpeechCharacters(text.trim()),
    engineTokenCost,
    voiceTokenCost,
    unit,
  );
  if (total <= 0) {
    return null;
  }
  return formatSpeechTokenAmount(total);
}
