/** Seedance 2.0 r2v：参考视频像素数下限（宽×高） */
export const SEEDANCE_REF_VIDEO_MIN_PIXELS = 409600;

/**
 * 将后端 / 火山返回的冗长错误转为用户可读文案。
 */
export function formatSeedanceUserMessage(
  raw: string | null | undefined,
  fallback = '视频生成失败'
): string {
  if (!raw || typeof raw !== 'string') return fallback;
  const text = raw.trim();
  if (!text) return fallback;

  const lower = text.toLowerCase();
  if (
    lower.includes('video pixel count') ||
    lower.includes('pixel count') ||
    text.includes('409600')
  ) {
    return '参考视频分辨率过低：宽×高像素数需 ≥ 409600（例如 854×480、640×640）。请更换更高清的参考视频后重试。';
  }
  if (lower.includes('invalidparameter') || lower.includes('invalid parameter')) {
    const m = text.match(/message"\s*:\s*"([^"]+)"/i) || text.match(/message[=:]\s*([^\n,}]+)/i);
    if (m?.[1]) return m[1].trim();
  }

  // 去掉 "400 Bad Request: " / "Seedance 视频生成异常: " 前缀，尽量抽出内层 message
  let cleaned = text
    .replace(/^Seedance\s*视频生成异常:\s*/i, '')
    .replace(/^Internal Server Error:\s*/i, '')
    .replace(/^\d{3}\s+Bad Request:\s*/i, '')
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*"error"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const inner = parsed?.error?.message || parsed?.message;
      if (typeof inner === 'string' && inner.trim()) {
        return formatSeedanceUserMessage(inner, fallback);
      }
    } catch {
      // ignore
    }
  }

  if (cleaned.length > 280) {
    cleaned = `${cleaned.slice(0, 277)}…`;
  }
  return cleaned || fallback;
}
