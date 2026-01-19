import axios from 'axios';
import { Modal } from 'antd';

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
  timeout: 30000,
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

// 处理401提示的函数
const handle401Error = () => {
  // 防止重复弹框
  if (isShowingModal) {
    return;
  }
  
  isShowingModal = true;
  
  // 清除本地存储的 token 和用户信息
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  
  // 显示弹框提示
  Modal.warning({
    title: '登录已过期',
    content: '您的登录已过期，请重新登录',
    okText: '去登录',
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
    const { response, code, message: errorMessage } = error;
    
    // 判断是否为401
    // 1. 正常情况：response.status === 401
    // 2. CORS拦截情况：response 为 undefined 但错误信息包含 401 或网络错误
    const is401 = response?.status === 401 || 
                  (code === 'ERR_NETWORK' && errorMessage?.includes('401')) ||
                  (code === 'ERR_NETWORK' && !response && errorMessage === 'Network Error');
    
    // 如果是网络错误且没有响应，可能是 CORS 拦截的 401
    // 检查是否有 token，如果没有 token 很可能是 401
    if (code === 'ERR_NETWORK' && !response) {
      const token = localStorage.getItem('token');
      if (!token) {
        // 没有 token 且网络错误，很可能是 401 被 CORS 拦截
        handle401Error();
        return Promise.reject(error);
      }
    }
    
    if (is401) {
      // 显示弹框提示
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