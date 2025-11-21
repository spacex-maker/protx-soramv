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
  }
}; 