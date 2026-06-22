export const USER_DISABLED_CODE = 'USER_DISABLED';

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

export const isUserDisabledApiResponse = (payload) => {
  const data = parseApiPayload(payload);
  return Boolean(data && data.success === false && data.code === USER_DISABLED_CODE);
};

export const extractDisabledReason = (payload) => {
  const data = parseApiPayload(payload);
  const message = data?.message || '';
  const prefix = '您的账号已被禁用，原因：';
  if (message.startsWith(prefix)) {
    return message.slice(prefix.length);
  }
  return message || '请联系客服';
};
