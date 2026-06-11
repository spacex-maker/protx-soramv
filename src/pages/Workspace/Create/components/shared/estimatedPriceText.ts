import type { IntlShape } from 'react-intl';

/** 时长滑块等 tooltip：时长 + 预估 + 余额 */
export function formatDurationEstimatedTooltip(
  intl: IntlShape,
  duration: number,
  estimatedPrice: string,
  tokenBalance: number | null,
  balanceLoading: boolean,
): string {
  const durationText = intl.formatMessage(
    { id: 'create.duration.format', defaultMessage: '{duration}s' },
    { duration },
  );
  const estimatedText = intl.formatMessage(
    { id: 'create.estimated.price', defaultMessage: '预估: {price}' },
    { price: estimatedPrice },
  );
  const balanceText = balanceLoading
    ? '...'
    : intl.formatMessage(
        { id: 'create.token.balance', defaultMessage: '余额: {balance} Token' },
        { balance: tokenBalance ?? '-' },
      );
  return `${durationText} | ${estimatedText} · ${balanceText}`;
}

export function formatTokenAmount(amount: number): string {
  return `${amount} Token`;
}

/** 文生图 / 图生图：按张数（batchSize）估算 */
export function getImageRequiredTokens(
  tokenCost: number | null | undefined,
  batchSize: number = 1,
  multiplyBatch = true,
): number {
  if (tokenCost == null || tokenCost === undefined || tokenCost <= 0) {
    return 0;
  }
  return multiplyBatch ? tokenCost * Math.max(1, batchSize) : tokenCost;
}

export function getImageEstimatedPrice(
  tokenCost: number | null | undefined,
  batchSize: number = 1,
  multiplyBatch = true,
): string | null {
  const total = getImageRequiredTokens(tokenCost, batchSize, multiplyBatch);
  if (total <= 0) return null;
  return formatTokenAmount(total);
}
