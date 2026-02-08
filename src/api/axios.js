import axios from 'axios';
import { Modal } from 'antd';
import zh_CN from '../locales/zh_CN';
import en_US from '../locales/en_US';
import ja_JP from '../locales/ja_JP';
import ko_KR from '../locales/ko_KR';
import fr_FR from '../locales/fr_FR';
import de_DE from '../locales/de_DE';
import es_ES from '../locales/es_ES';
import it_IT from '../locales/it_IT';
import pt_PT from '../locales/pt_PT';
import ru_RU from '../locales/ru_RU';
import ar_SA from '../locales/ar_SA';

const AUTH_MODAL_LOCALES = {
  zh: zh_CN,
  en: en_US,
  ja: ja_JP,
  ko: ko_KR,
  fr: fr_FR,
  de: de_DE,
  es: es_ES,
  it: it_IT,
  pt: pt_PT,
  ru: ru_RU,
  ar: ar_SA,
};

// 按当前语言取 401 弹窗文案（与 LocaleContext 的 locale 存储一致：localStorage 为 zh/en 等短码）
const getAuthModalMessages = () => {
  const locale = (typeof localStorage !== 'undefined' && localStorage.getItem('locale')) || '';
  const key = String(locale).toLowerCase().split('-')[0];
  const t = AUTH_MODAL_LOCALES[key] || en_US;
  return {
    title: t['auth.modal.title'] || 'Login Required',
    content: t['auth.modal.content'] || 'Your session has expired or you are not logged in. Please log in to continue.',
    okText: t['auth.modal.ok'] || 'Go to Login',
    cancelText: t['auth.modal.cancel'] || 'Later',
  };
};

// 获取基础URL：根据前端域名判断使用哪个后端
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  // 判断是否为本地开发环境
  const isLocalhost = hostname === 'localhost' || 
                      hostname === '127.0.0.1' ||
                      hostname === '';
  
  if (isLocalhost) {
    return process.env.REACT_APP_API_URL || 'http://localhost:8080';
  }
  
  // 如果前端域名是 ai2obj.com，使用国际版后端
  if (hostname.includes('ai2obj.com')) {
    return 'https://api.ai2obj.com';
  }
  
  // 其他情况（中国用户，anakkix.cn域名），使用中国版后端
  return 'https://app.anakkix.cn';
};

// 创建 axios 实例
const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 0, // 0 表示不设置超时限制
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 防止重复弹框的标记
let isShowingModal = false;

// 处理401/403提示：使用主题色、居中、主按钮强调
const handle401Error = () => {
  if (isShowingModal) return;
  isShowingModal = true;

  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');

  const msg = getAuthModalMessages();
  Modal.confirm({
    type: 'info',
    title: msg.title,
    content: msg.content,
    okText: msg.okText,
    okType: 'primary',
    cancelText: msg.cancelText,
    centered: true,
    maskClosable: false,
    closable: true,
    width: 400,
    styles: {
      body: { paddingTop: 8 },
      footer: { marginTop: 16 },
    },
    onOk: () => {
      isShowingModal = false;
      window.location.href = '/login';
    },
    onCancel: () => {
      isShowingModal = false;
    },
  });
};

// 响应拦截器
instance.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // 只有在明确收到 401 或 403 状态码时才提示登录过期
    if (response?.status === 401 || response?.status === 403) {
      handle401Error();
    }
    
    return Promise.reject(error);
  }
);

// 添加请求测试方法
export const testConnection = async () => {
  try {
    const response = await instance.get('/health-check');
    return response.status === 200;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export default instance; 