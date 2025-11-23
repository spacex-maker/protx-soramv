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
  }
}; 