import axios from './axios';

export const embeddingApi = {

  // ========== 向量模型 ==========

  /** 获取所有已启用的向量模型列表 */
  listModels: async () => {
    try {
      const { data } = await axios.get('/productx/embedding/models');
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '获取模型列表失败' };
    }
  },

  /** 生成向量（JWT 鉴权） */
  generateEmbedding: async (payload) => {
    try {
      const { data } = await axios.post('/productx/embedding/generate', payload);
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '向量生成失败' };
    }
  },

  /** 通过 API Key 生成向量 */
  generateEmbeddingByApiKey: async (apiKey, payload) => {
    try {
      const { data } = await axios.post('/productx/embedding/v1/embeddings', payload, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '向量生成失败' };
    }
  },

  // ========== API Key 管理 ==========

  /** 创建新 API Key */
  createApiKey: async (payload) => {
    try {
      const { data } = await axios.post('/productx/embedding/api-key/create', payload);
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '创建失败' };
    }
  },

  /** 获取当前用户 API Key 列表 */
  listApiKeys: async () => {
    try {
      const { data } = await axios.get('/productx/embedding/api-key/list');
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '获取列表失败' };
    }
  },

  /** 停用 API Key */
  revokeApiKey: async (id) => {
    try {
      const { data } = await axios.post(`/productx/embedding/api-key/${id}/revoke`);
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '停用失败' };
    }
  },

  /** 删除 API Key */
  deleteApiKey: async (id) => {
    try {
      const { data } = await axios.post(`/productx/embedding/api-key/${id}/delete`);
      return data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '删除失败' };
    }
  },
};
