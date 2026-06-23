import { useState, useCallback } from 'react';
import { fetchTokenBalance, isInsufficientBalanceMessage } from './balanceUtils';
import { isKycRequiredApiResponse } from 'utils/kycRequired';
import { isIpBlockedApiResponse } from 'utils/ipBlocked';
import { isUserDisabledApiResponse } from 'utils/userDisabled';
import { ensureKycForModels, showKycRequiredModal } from 'utils/kycGuard';

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

  /** 所选模型需要实名且用户未完成认证时弹出引导 */
  const ensureKycForModel = useCallback(
    (...models: Array<{ requireKyc?: boolean | null } | null | undefined>): Promise<boolean> => {
      return Promise.resolve(ensureKycForModels(...models));
    },
    [],
  );

  /** 接口错误文案为余额不足时弹出对话框；实名认证错误弹出认证引导 */
  const tryShowFromApiError = useCallback(
    async (message: string | null | undefined, error?: unknown): Promise<boolean> => {
      if (error && typeof error === 'object') {
        const err = error as {
          isKycRequired?: boolean;
          isUserDisabled?: boolean;
          isIpBlocked?: boolean;
          response?: { data?: unknown };
        };
        if (err.isKycRequired || isKycRequiredApiResponse(err.response?.data)) {
          showKycRequiredModal();
          return true;
        }
        if (err.isIpBlocked || isIpBlockedApiResponse(err.response?.data)) {
          return true;
        }
        if (err.isUserDisabled || isUserDisabledApiResponse(err.response?.data)) {
          return true;
        }
      }
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
    ensureKycForModel,
    tryShowFromApiError,
  };
}
