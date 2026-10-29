import { useState, useEffect, useCallback } from 'react';
import { base } from 'api/base';

export function useTokenBalance() {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const refreshTokenBalance = useCallback(() => {
    setBalanceLoading(true);
    return base
      .getUserBalance()
      .then((res: { success?: boolean; data?: { tokenBalance?: number } }) => {
        if (res?.success && res?.data?.tokenBalance != null) {
          const n = Number(res.data.tokenBalance);
          setTokenBalance(Number.isFinite(n) ? n : null);
        } else {
          // 查询失败保留 null，避免页面上显示假的 0 并触发误报
          setTokenBalance(null);
        }
      })
      .catch(() => {
        setTokenBalance(null);
      })
      .finally(() => {
        setBalanceLoading(false);
      });
  }, []);

  useEffect(() => {
    refreshTokenBalance();
  }, [refreshTokenBalance]);

  return { tokenBalance, balanceLoading, refreshTokenBalance };
}
