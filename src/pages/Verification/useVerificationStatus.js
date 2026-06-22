import { useCallback, useEffect, useState } from 'react';
import { auth } from 'api/auth';

export const useVerificationStatus = (autoFetch = true) => {
  const [loading, setLoading] = useState(autoFetch);
  const [realnameInfo, setRealnameInfo] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await auth.getUserRealnameInfo();
      if (result.success && result.data) {
        setRealnameInfo(result.data);
      } else {
        setRealnameInfo(null);
      }
    } catch (error) {
      console.error('获取实名认证状态失败:', error);
      setRealnameInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  const kycStatus = realnameInfo?.kycStatus ?? 0;

  return { loading, realnameInfo, kycStatus, refresh };
};
