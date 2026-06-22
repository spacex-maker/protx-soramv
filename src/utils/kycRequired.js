export const KYC_REQUIRED_CODE = 'KYC_REQUIRED';

export const parseApiPayload = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
  return payload;
};

export const isKycRequiredApiResponse = (payload) => {
  const data = parseApiPayload(payload);
  return Boolean(data && data.success === false && data.code === KYC_REQUIRED_CODE);
};
