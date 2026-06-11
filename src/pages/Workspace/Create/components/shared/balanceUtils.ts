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
  return (
    message.includes('余额不足') ||
    message.includes('余额不够') ||
    message.includes('Token不足') ||
    message.includes('token不足') ||
    m.includes('insufficient') && (m.includes('balance') || m.includes('token')) ||
    m.includes('not enough') && m.includes('token')
  );
}
