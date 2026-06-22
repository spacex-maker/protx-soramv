import axios from './axios';

export const workOrder = {
  getPublicCategories: async () => {
    const { data } = await axios.get('/productx/work-order/public/categories');
    return data;
  },

  createPublicWorkOrder: async (payload) => {
    const { data } = await axios.post('/productx/work-order/public/create', payload);
    return data;
  },
};
