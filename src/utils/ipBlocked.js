export const IP_BLOCKED_CODE = 'IP_BLOCKED';
export const IP_BLOCK_REASON_KEY = 'ipBlockReason';

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

export const isIpBlockedApiResponse = (payload) => {
  const data = parseApiPayload(payload);
  return Boolean(data && data.success === false && data.code === IP_BLOCKED_CODE);
};

export const extractIpBlockReason = (payload) => {
  const data = parseApiPayload(payload);
  const message = data?.message || '';
  const prefix = '您的访问已被限制，原因：';
  if (message.startsWith(prefix)) {
    return message.slice(prefix.length);
  }
  return message || '请联系客服';
};

export const saveIpBlockReason = (reason) => {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(IP_BLOCK_REASON_KEY, reason || '');
};

export const loadIpBlockReason = () => {
  if (typeof sessionStorage === 'undefined') return '';
  return sessionStorage.getItem(IP_BLOCK_REASON_KEY) || '';
};

export const redirectToIpBlockedPage = (reason) => {
  saveIpBlockReason(reason);
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  if (typeof window !== 'undefined' && window.location.pathname !== '/blocked') {
    window.location.href = '/blocked';
  }
};
