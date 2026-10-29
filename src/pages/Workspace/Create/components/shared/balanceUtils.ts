import { base } from 'api/base';

/** 成功返回余额；接口失败返回 null（禁止当成 0，避免误弹充值窗） */
export async function fetchTokenBalance(): Promise<number | null> {
  try {
    const res = await base.getUserBalance();
    if (res?.success && res?.data?.tokenBalance != null) {
      const n = Number(res.data.tokenBalance);
      return Number.isFinite(n) ? n : null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchCnyBalance(): Promise<number | null> {
  try {
    const res = await base.getUserBalance();
    if (res?.success && res?.data?.balance != null) {
      const n = Number(res.data.balance);
      return Number.isFinite(n) ? n : null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** 从 "120 Token" 等文案解析数量 */
export function parseTokenAmountFromPrice(price: string | null | undefined): number {
  if (!price) return 0;
  const match = price.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

export function getVideoRequiredTokens(
  tokenCost: number | null | undefined,
  duration: number,
): number {
  if (tokenCost == null || tokenCost === undefined || tokenCost <= 0) {
    return 0;
  }
  return tokenCost * Math.max(1, duration);
}

/**
 * 是否为本平台「用户 Token 余额不足」。
 * 上游供应商欠费常见文案是 Insufficient Balance / 402 / payment required，
 * 绝不能当成用户去充值。
 */
export function isInsufficientBalanceMessage(message: string | null | undefined): boolean {
  if (!message || !message.trim()) return false;
  const m = message.toLowerCase();

  // 上游供应商欠费 / 鉴权 / 合规旁路 —— 一律不当作用户 Token 不足
  if (
    /\binsufficient\s+balance\b/.test(m) ||
    m.includes('insufficient_balance') ||
    m.includes('accountoverdue') ||
    m.includes('overdue balance') ||
    m.includes('payment required') ||
    m.includes('供应商') ||
    m.includes('上游') ||
    m.includes('deepseek') ||
    m.includes('openai') ||
    m.includes('合规检查') ||
    m.includes('volc') ||
    m.includes('ark.') ||
    m.includes('comfy') ||
    /\b402\b/.test(m)
  ) {
    return false;
  }

  // 仅匹配本平台明确的用户 Token 文案（中英文）
  return (
    message.includes('Token余额不足') ||
    message.includes('Token 余额不足') ||
    message.includes('token余额不足') ||
    message.includes('Insufficient Token balance') ||
    message.includes('Insufficient Token Balance') ||
    m.includes('insufficient token balance') ||
    m.includes('insufficient token') ||
    (message.includes('余额不够') && (message.includes('Token') || message.includes('token'))) ||
    (message.includes('Token不足') || message.includes('token不足'))
  );
}

/** 是否像上游/服务商欠费，应提示运维而非引导用户充值 */
export function isUpstreamProviderBalanceMessage(message: string | null | undefined): boolean {
  if (!message || !message.trim()) return false;
  const m = message.toLowerCase();
  if (isInsufficientBalanceMessage(message)) return false;
  return (
    /\binsufficient\s+balance\b/.test(m) ||
    m.includes('insufficient_balance') ||
    m.includes('accountoverdue') ||
    m.includes('overdue balance') ||
    m.includes('payment required') ||
    (m.includes('上游') && (m.includes('余额') || m.includes('欠费'))) ||
    (m.includes('供应商') && (m.includes('余额') || m.includes('欠费'))) ||
    /\b402\b/.test(m)
  );
}
