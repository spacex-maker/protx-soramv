export const LOGIN_REDIRECT_STORAGE_KEY = 'login_redirect';

/** 仅允许站内相对路径，防止开放重定向 */
export function sanitizeLoginRedirect(
  raw: string | null | undefined,
  fallback = '/workspace'
): string {
  if (!raw) return fallback;
  try {
    const decoded = decodeURIComponent(raw.trim());
    if (!decoded.startsWith('/') || decoded.startsWith('//')) {
      return fallback;
    }
    return decoded;
  } catch {
    return fallback;
  }
}

export function buildLoginPath(returnTo: string): string {
  const safe = sanitizeLoginRedirect(returnTo);
  return `/login?redirect=${encodeURIComponent(safe)}`;
}

export function persistLoginRedirect(returnTo: string): void {
  sessionStorage.setItem(
    LOGIN_REDIRECT_STORAGE_KEY,
    sanitizeLoginRedirect(returnTo)
  );
}

export function consumeLoginRedirect(fallback = '/workspace'): string {
  const fromStorage = sessionStorage.getItem(LOGIN_REDIRECT_STORAGE_KEY);
  sessionStorage.removeItem(LOGIN_REDIRECT_STORAGE_KEY);
  const fromQuery = new URLSearchParams(window.location.search).get('redirect');
  return sanitizeLoginRedirect(fromQuery || fromStorage || fallback, fallback);
}
