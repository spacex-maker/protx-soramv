import axios from './axios';

export const base = {
  // 获取系统支持的语言列表
  getEnabledLanguages: async () => {
    try {
      const { data } = await axios.get('/base/productx/sys-languages/enabled');
      return data;
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取语言列表失败' 
      };
    }
  },

  // 获取站点设置
  getSiteSettings: async (configKey, lang = 'zh') => {
    try {
      const { data } = await axios.get(`/base/site-settings/enabled?configKey=${configKey}&lang=${lang}`);
      return data;
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取站点设置失败' 
      };
    }
  },

  // 获取创作类型设置
  getCreationTypeSettings: async () => {
    try {
      const { data } = await axios.get('/base/site-settings/creation-type-settings');
      return data;
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取创作类型设置失败' 
      };
    }
  },

  // 根据模型类型获取启用的模型列表
  getEnabledModelsByType: async (modelType) => {
    try {
      const { data } = await axios.get(`/productx/sa-ai-models/enabled/by-type?modelType=${modelType}`);
      return data;
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取模型列表失败' 
      };
    }
  },

  // 获取官方邮箱
  getOfficialEmail: async () => {
    try {
      const { data } = await axios.get('/productx/sys-config/official-email');
      // 兼容两种响应格式：{success, data} 或 {code, data}
      if (data.success === true && data.data) {
        return {
          success: true,
          data: data.data
        };
      }
      if (data.code === 200 && data.data) {
        return {
          success: true,
          data: data.data
        };
      }
      return {
        success: false,
        message: data.message || '获取官方邮箱失败'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取官方邮箱失败'
      };
    }
  },

  // 获取启用的 KYC 国家配置列表
  getKycCountryConfigs: async () => {
    try {
      const { data } = await axios.get('/productx/kyc-country-config/enabled');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取实名认证配置失败'
      };
    }
  },

  // 获取用户隐私偏好设置
  getPrivacyPreferences: async () => {
    try {
      const { data } = await axios.get('/productx/user-privacy-preferences/get');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取隐私偏好设置失败'
      };
    }
  },

  // 更新用户隐私偏好设置
  updatePrivacyPreferences: async (preferences) => {
    try {
      const { data } = await axios.post('/productx/user-privacy-preferences/update', preferences);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存隐私偏好设置失败'
      };
    }
  },

  // 提交职位申请
  submitJobApplication: async (formData) => {
    try {
      const { data } = await axios.post('/base/productx/job-application/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '申请提交失败'
      };
    }
  },

  // 获取我的申请记录
  getMyApplications: async () => {
    try {
      const { data } = await axios.get('/productx/job-application/my-applications');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取申请记录失败'
      };
    }
  },

  // 根据国家代码获取支持的登录方式
  getLoginMethodsByCountry: async (countryCode) => {
    try {
      const { data } = await axios.get(`/base/country-login-methods/country/${countryCode}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取登录方式失败'
      };
    }
  }
}; 