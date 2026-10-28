import { base } from 'api/base';

export async function fetchTokenBalance(): Promise<number> {
  try {
    const res = await base.getUserBalance();
    if (res?.success && res?.data?.tokenBalance != null) {
      return Number(res.data.tokenBalance);
    }
  } catch {
    /* ignore */
  }
  return 0;
}

export async function fetchCnyBalance(): Promise<number> {
  try {
    const res = await base.getUserBalance();
    if (res?.success && res?.data?.balance != null) {
      return Number(res.data.balance);
    }
  } catch {
    /* ignore */
  }
  return 0;
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

export function isInsufficientBalanceMessage(message: string | null | undefined): boolean {
  if (!message || !message.trim()) return false;
  const m = message.toLowerCase();

  // 上游供应商（DeepSeek / OpenAI / Volc 等）欠费也会返回 "Insufficient Balance"，
  // 不能当成「用户平台 Token 不足」去弹充值窗。
  if (
    m.includes('deepseek') ||
    m.includes('openai') ||
    m.includes('合规检查') ||
    m.includes('accountoverdue') ||
    m.includes('overdue balance') ||
    m.includes('insufficient_balance_error') ||
    m.includes('payment required')
  ) {
    return false;
  }

  // 仅匹配本平台明确的用户 Token / 余额文案
  return (
    message.includes('Token余额不足') ||
    message.includes('Token 余额不足') ||
    message.includes('token余额不足') ||
    (message.includes('余额不足') && (message.includes('Token') || message.includes('token') || message.includes('请充值'))) ||
    message.includes('余额不够') ||
    message.includes('Token不足') ||
    message.includes('token不足') ||
    (m.includes('insufficient token') || (m.includes('not enough') && m.includes('token')))
  );
}
