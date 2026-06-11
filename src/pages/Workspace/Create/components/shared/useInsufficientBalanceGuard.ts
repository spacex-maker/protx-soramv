import { useState, useCallback } from 'react';
import { fetchTokenBalance, isInsufficientBalanceMessage } from './balanceUtils';

export function useInsufficientBalanceGuard() {
  const [open, setOpen] = useState(false);
  const [requiredTokens, setRequiredTokens] = useState(0);
  const [modalBalance, setModalBalance] = useState<number | null>(null);

  const openInsufficientModal = useCallback((required: number, balance: number) => {
    setRequiredTokens(required);
    setModalBalance(balance);
    setOpen(true);
  }, []);

  const closeInsufficientModal = useCallback(() => setOpen(false), []);

  /** 提交前校验；余额足够返回 true */
  const ensureSufficientBalance = useCallback(
    async (required: number): Promise<boolean> => {
      if (required <= 0) return true;
      const balance = await fetchTokenBalance();
      if (balance < required) {
        openInsufficientModal(required, balance);
        return false;
      }
      return true;
    },
    [openInsufficientModal],
  );

  /** 接口错误文案为余额不足时弹出对话框 */
  const tryShowFromApiError = useCallback(
    async (message: string | null | undefined): Promise<boolean> => {
      if (!isInsufficientBalanceMessage(message)) return false;
      const balance = await fetchTokenBalance();
      openInsufficientModal(0, balance);
      return true;
    },
    [openInsufficientModal],
  );

  return {
    insufficientBalanceOpen: open,
    insufficientBalanceRequired: requiredTokens,
    insufficientBalanceModalBalance: modalBalance,
    closeInsufficientBalanceModal: closeInsufficientModal,
    ensureSufficientBalance,
    tryShowFromApiError,
  };
}
