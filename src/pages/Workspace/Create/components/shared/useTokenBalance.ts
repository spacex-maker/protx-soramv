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
          setTokenBalance(Number(res.data.tokenBalance));
        } else {
          setTokenBalance(0);
        }
      })
      .catch(() => {
        setTokenBalance(0);
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
