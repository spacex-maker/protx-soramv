import axios from './axios';

export const inviteApi = {
  getDashboard: async () => {
    const response = await axios.get('/productx/invite/dashboard');
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await axios.get('/productx/invite/history', { params });
    return response.data;
  },

  claimRewards: async () => {
    const response = await axios.post('/productx/invite/claim');
    return response.data;
  },

  validateInviteCode: async (inviteCode) => {
    const response = await axios.get('/productx/invite/validate', {
      params: { inviteCode },
    });
    return response.data;
  },
};

export default inviteApi;
