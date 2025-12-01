import axios from 'axios';

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
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

// 响应拦截器
instance.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    if (response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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