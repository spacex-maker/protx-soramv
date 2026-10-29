import { useState, useCallback } from 'react';
import { message as antdMessage } from 'antd';
import {
  fetchTokenBalance,
  isInsufficientBalanceMessage,
  isUpstreamProviderBalanceMessage,
} from './balanceUtils';
import { isKycRequiredApiResponse } from 'utils/kycRequired';
import { isIpBlockedApiResponse } from 'utils/ipBlocked';
import { isUserDisabledApiResponse } from 'utils/userDisabled';
import { ensureKycForModels, showKycRequiredModal } from 'utils/kycGuard';

export function useInsufficientBalanceGuard(knownBalance?: number | null) {
  const [open, setOpen] = useState(false);
  const [requiredTokens, setRequiredTokens] = useState(0);
  const [modalBalance, setModalBalance] = useState<number | null>(null);

  const openInsufficientModal = useCallback((required: number, balance: number) => {
    setRequiredTokens(required);
    setModalBalance(balance);
    setOpen(true);
  }, []);

  const closeInsufficientModal = useCallback(() => setOpen(false), []);

  /** 提交前校验；余额足够返回 true。查余额失败时不误报 0，放行给后端校验。 */
  const ensureSufficientBalance = useCallback(
    async (required: number): Promise<boolean> => {
      if (required <= 0) return true;
      const fetched = await fetchTokenBalance();
      const balance =
        fetched != null
          ? fetched
          : knownBalance != null && Number.isFinite(knownBalance)
            ? knownBalance
            : null;

      if (balance == null) {
        // 查不到余额时不要当成 0 弹充值窗，交给后端扣费逻辑
        return true;
      }
      if (balance < required) {
        openInsufficientModal(required, balance);
        return false;
      }
      return true;
    },
    [openInsufficientModal, knownBalance],
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
    async (errMessage: string | null | undefined, error?: unknown): Promise<boolean> => {
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

      if (isUpstreamProviderBalanceMessage(errMessage)) {
        antdMessage.error(
          errMessage?.trim() ||
            '上游服务商账户余额不足或欠费，请联系管理员处理（不是您的 Token 余额问题）',
        );
        return true;
      }

      if (!isInsufficientBalanceMessage(errMessage)) return false;
      const balance = (await fetchTokenBalance()) ?? knownBalance ?? 0;
      openInsufficientModal(0, balance);
      return true;
    },
    [openInsufficientModal, knownBalance],
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
