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

  // 获取平台名称
  getPlatformName: async () => {
    try {
      const { data } = await axios.get('/productx/sys-config/platform-name');
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
        message: data.message || '获取平台名称失败'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取平台名称失败'
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
  },

  // ========== AI工作流相关接口 ==========
  
  // 创建工作流
  createWorkflow: async (workflowData) => {
    try {
      const { data } = await axios.post('/productx/ai-workflow/create', workflowData);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '创建工作流失败'
      };
    }
  },

  // 更新工作流
  updateWorkflow: async (workflowData) => {
    try {
      const { data } = await axios.post('/productx/ai-workflow/update', workflowData);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新工作流失败'
      };
    }
  },

  // 获取工作流详情
  getWorkflowDetail: async (id) => {
    try {
      const { data } = await axios.get(`/productx/ai-workflow/detail/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取工作流详情失败'
      };
    }
  },

  // 获取我的工作流列表
  getMyWorkflowList: async (params) => {
    try {
      const { data } = await axios.get('/productx/ai-workflow/my-list', { params });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取工作流列表失败'
      };
    }
  },

  // 删除工作流
  deleteWorkflow: async (id) => {
    try {
      const { data } = await axios.post(`/productx/ai-workflow/delete/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除工作流失败'
      };
    }
  },

  // 发布工作流
  publishWorkflow: async (id) => {
    try {
      const { data } = await axios.post(`/productx/ai-workflow/publish/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '发布工作流失败'
      };
    }
  },

  // 下架工作流
  unpublishWorkflow: async (id) => {
    try {
      const { data } = await axios.post(`/productx/ai-workflow/unpublish/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '下架工作流失败'
      };
    }
  },

  // 运行工作流
  runWorkflow: async (id, inputParams) => {
    try {
      const { data } = await axios.post(`/productx/ai-workflow/run/${id}`, inputParams);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '运行工作流失败'
      };
    }
  },

  // ========== 节点配置相关 ==========
  // 获取所有启用的节点配置
  getNodeConfigList: async () => {
    try {
      const { data } = await axios.get('/productx/node-config/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取节点配置失败'
      };
    }
  },

  // 根据分类获取节点配置
  getNodeConfigByCategory: async (category) => {
    try {
      const { data } = await axios.get(`/productx/node-config/category/${category}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取节点配置失败'
      };
    }
  },

  // 根据节点Key获取节点配置
  getNodeConfigByKey: async (nodeKey) => {
    try {
      const { data } = await axios.get(`/productx/node-config/key/${nodeKey}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取节点配置失败'
      };
    }
  },

  // 上传图片到 public bucket
  uploadWorkflowImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await axios.post('/productx/node-config/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '图片上传失败'
      };
    }
  },

  // ========== 提示词标签库（C端） ==========
  // 获取所有启用的标签列表（用于搜索标签下拉）
  getPromptTagLibraryList: async () => {
    try {
      const { data } = await axios.get('/productx/prompt-tag-library/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取标签列表失败'
      };
    }
  },
  // 获取推荐标签列表
  getPromptTagLibraryRecommend: async () => {
    try {
      const { data } = await axios.get('/productx/prompt-tag-library/recommend');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取推荐标签失败'
      };
    }
  },

  // ========== 提示词商品（C端） ==========
  // 商城公开列表（分页+筛选+排序，无需登录）
  getPromptMarketListingList: async (params = {}) => {
    try {
      const { data } = await axios.get('/productx/prompt-market-listing/list', { params });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取列表失败'
      };
    }
  },
  // 作品公开详情（关联任务、卖家信息，提示词按是否公开/是否收费脱敏）
  getPromptMarketListingDetail: async (id) => {
    try {
      const { data } = await axios.get(`/productx/prompt-market-listing/detail/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取详情失败'
      };
    }
  },
  // 用户 Token 余额（用于解锁确认弹窗）
  getUserBalance: async () => {
    try {
      const { data } = await axios.get('/productx/user/balance');
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '获取余额失败', data: null };
    }
  },
  // 提示词商品下单并支付（扣 Token、转创作者）
  orderPromptMarket: async (listingId) => {
    try {
      const { data } = await axios.post('/productx/prompt-market-listing/order-pay', null, { params: { listingId } });
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '下单失败', data: null };
    }
  },
  // 上架提示词（审核中状态）
  createPromptMarketListing: async (body) => {
    try {
      const { data } = await axios.post('/productx/prompt-market-listing/create', body);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '上架失败'
      };
    }
  },
}; 