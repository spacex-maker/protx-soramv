import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'protx_login_remember';
const SECRET = 'protx-soramv-login-remember-v1';

export const loadRememberedLogin = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { remember: false, email: '', password: '' };
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.remember) {
      return { remember: false, email: '', password: '' };
    }

    const email = typeof parsed.email === 'string' ? parsed.email : '';
    let password = '';

    if (typeof parsed.password === 'string' && parsed.password) {
      const bytes = CryptoJS.AES.decrypt(parsed.password, SECRET);
      password = bytes.toString(CryptoJS.enc.Utf8) || '';
    }

    return { remember: true, email, password };
  } catch {
    return { remember: false, email: '', password: '' };
  }
};

export const saveRememberedLogin = (email, password, remember) => {
  if (!remember) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const encrypted = CryptoJS.AES.encrypt(password, SECRET).toString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    remember: true,
    email,
    password: encrypted,
  }));
};

export const clearRememberedLogin = () => {
  localStorage.removeItem(STORAGE_KEY);
};
