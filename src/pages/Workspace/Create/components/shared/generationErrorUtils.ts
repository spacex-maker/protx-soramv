import { isKycRequiredApiResponse } from 'utils/kycRequired';
import { showKycRequiredModal } from 'utils/kycGuard';

type ApiPayload = {
  success?: boolean;
  message?: string;
  error?: string;
  code?: string | null;
};

export const extractGenerationErrorMessage = (
  payload?: ApiPayload | string | null,
  fallback?: string,
): string | undefined => {
  if (payload == null) return fallback;
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed || fallback;
  }
  return payload.message || payload.error || fallback;
};

/** 处理生成接口 success=false 或 catch 错误；已处理 KYC/余额等时返回 true */
export async function handleGenerationApiFailure(
  payload: unknown,
  tryShowFromApiError: (message: string | null | undefined, error?: unknown) => Promise<boolean>,
  options?: {
    error?: unknown;
    fallbackMessage?: string;
  },
): Promise<boolean> {
  if (isKycRequiredApiResponse(payload)) {
    showKycRequiredModal();
    return true;
  }

  const data = payload as ApiPayload | string | null | undefined;
  const message = extractGenerationErrorMessage(data, options?.fallbackMessage);
  return tryShowFromApiError(message, options?.error);
}
