import axios from './axios';

export const auth = {
  // 登录
  login: async ({ email, password }) => {
    try {
      const { data } = await axios.post('/productx/user/login', { 
        username: email, 
        password 
      });
      
      if (data.success) {
        const token = data.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // 登录成功后立即获取用户信息
        const userInfoResult = await auth.getUserInfo();
        if (!userInfoResult.success) {
          return { success: false, message: '获取用户信息失败' };
        }
        
        return { success: true };
      }
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '登录失败' };
    }
  },

  // 注册
  register: async (data) => {
    try {
      const response = await axios.post('/productx/user/cos-register', data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '注册失败'
      };
    }
  },

  // 发送验证码
  sendVerificationCode: (email) => {
    return axios.post('/auth/verification-code', { email });
  },

  // 验证邮箱验证码
  verifyCode: (email, code) => {
    return axios.post('/auth/verify-code', { email, code });
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  },

  // 获取用户信息
  getUserInfo: async () => {
    try {
      const { data } = await axios.get('/productx/user/user-detail');
      if (data.success) {
        localStorage.setItem('userInfo', JSON.stringify(data.data));
      }
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '获取用户信息失败' };
    }
  },

  // 刷新 token
  refreshToken: () => {
    return axios.post('/auth/refresh-token');
  }
}; 