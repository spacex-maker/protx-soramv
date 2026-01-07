import axios from './axios';

export const resume = {
  // ========== 个人信息相关接口 ==========
  
  // 获取当前用户个人信息
  getPersonalInfo: async () => {
    try {
      const { data } = await axios.get('/productx/resume/personal-info/get');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取个人信息失败'
      };
    }
  },

  // 保存或更新个人信息
  savePersonalInfo: async (personalInfo) => {
    try {
      const { data } = await axios.post('/productx/resume/personal-info/save', personalInfo);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存个人信息失败'
      };
    }
  },

  // 删除个人信息
  deletePersonalInfo: async () => {
    try {
      const { data } = await axios.delete('/productx/resume/personal-info/delete');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除个人信息失败'
      };
    }
  },

  // ========== 技能栈相关接口 ==========
  
  // 获取当前用户技能列表
  getSkills: async () => {
    try {
      const { data } = await axios.get('/productx/resume/skills/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取技能列表失败'
      };
    }
  },

  // 批量保存技能
  saveSkills: async (skills) => {
    try {
      const { data } = await axios.post('/productx/resume/skills/save-batch', skills);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存技能失败'
      };
    }
  },

  // 更新技能
  updateSkill: async (skill) => {
    try {
      const { data } = await axios.post('/productx/resume/skills/update', skill);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新技能失败'
      };
    }
  },

  // 删除技能
  deleteSkill: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/skills/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除技能失败'
      };
    }
  },

  // ========== 教育信息相关接口 ==========
  
  // 获取当前用户教育信息列表
  getEducation: async () => {
    try {
      const { data } = await axios.get('/productx/resume/education/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取教育信息失败'
      };
    }
  },

  // 保存教育信息
  saveEducation: async (education) => {
    try {
      const { data } = await axios.post('/productx/resume/education/save', education);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存教育信息失败'
      };
    }
  },

  // 更新教育信息
  updateEducation: async (education) => {
    try {
      const { data } = await axios.post('/productx/resume/education/update', education);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新教育信息失败'
      };
    }
  },

  // 删除教育信息
  deleteEducation: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/education/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除教育信息失败'
      };
    }
  },

  // ========== 职业生涯相关接口 ==========
  
  // 获取当前用户职业生涯列表
  getCareer: async () => {
    try {
      const { data } = await axios.get('/productx/resume/career/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取职业生涯失败'
      };
    }
  },

  // 保存职业生涯
  saveCareer: async (career) => {
    try {
      const { data } = await axios.post('/productx/resume/career/save', career);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存职业生涯失败'
      };
    }
  },

  // 更新职业生涯
  updateCareer: async (career) => {
    try {
      const { data } = await axios.post('/productx/resume/career/update', career);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新职业生涯失败'
      };
    }
  },

  // 删除职业生涯
  deleteCareer: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/career/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除职业生涯失败'
      };
    }
  },

  // ========== 项目经验相关接口 ==========
  
  // 获取当前用户项目经验列表
  getProjects: async () => {
    try {
      const { data } = await axios.get('/productx/resume/projects/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取项目经验失败'
      };
    }
  },

  // 保存项目经验
  saveProject: async (project) => {
    try {
      const { data } = await axios.post('/productx/resume/projects/save', project);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存项目经验失败'
      };
    }
  },

  // 更新项目经验
  updateProject: async (project) => {
    try {
      const { data } = await axios.post('/productx/resume/projects/update', project);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新项目经验失败'
      };
    }
  },

  // 删除项目经验
  deleteProject: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/projects/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除项目经验失败'
      };
    }
  },

  // ========== 证书/资质相关接口 ==========
  
  // 获取当前用户证书列表
  getCertifications: async () => {
    try {
      const { data } = await axios.get('/productx/resume/certifications/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取证书列表失败'
      };
    }
  },

  // 保存证书
  saveCertification: async (certification) => {
    try {
      const { data } = await axios.post('/productx/resume/certifications/save', certification);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存证书失败'
      };
    }
  },

  // 更新证书
  updateCertification: async (certification) => {
    try {
      const { data } = await axios.post('/productx/resume/certifications/update', certification);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新证书失败'
      };
    }
  },

  // 删除证书
  deleteCertification: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/certifications/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除证书失败'
      };
    }
  },

  // ========== 语言能力相关接口 ==========
  
  // 获取当前用户语言能力列表
  getLanguages: async () => {
    try {
      const { data } = await axios.get('/productx/resume/languages/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取语言能力失败'
      };
    }
  },

  // 保存语言能力
  saveLanguage: async (language) => {
    try {
      const { data } = await axios.post('/productx/resume/languages/save', language);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存语言能力失败'
      };
    }
  },

  // 更新语言能力
  updateLanguage: async (language) => {
    try {
      const { data } = await axios.post('/productx/resume/languages/update', language);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新语言能力失败'
      };
    }
  },

  // 删除语言能力
  deleteLanguage: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/languages/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除语言能力失败'
      };
    }
  },

  // ========== 获奖经历相关接口 ==========
  
  // 获取当前用户获奖经历列表
  getAwards: async () => {
    try {
      const { data } = await axios.get('/productx/resume/awards/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取获奖经历失败'
      };
    }
  },

  // 保存获奖经历
  saveAward: async (award) => {
    try {
      const { data } = await axios.post('/productx/resume/awards/save', award);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存获奖经历失败'
      };
    }
  },

  // 更新获奖经历
  updateAward: async (award) => {
    try {
      const { data } = await axios.post('/productx/resume/awards/update', award);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新获奖经历失败'
      };
    }
  },

  // 删除获奖经历
  deleteAward: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/awards/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除获奖经历失败'
      };
    }
  },

  // ========== 开源贡献相关接口 ==========
  
  // 获取当前用户开源贡献列表
  getOpensource: async () => {
    try {
      const { data } = await axios.get('/productx/resume/opensource/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取开源贡献失败'
      };
    }
  },

  // 保存开源贡献
  saveOpensource: async (opensource) => {
    try {
      const { data } = await axios.post('/productx/resume/opensource/save', opensource);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存开源贡献失败'
      };
    }
  },

  // 更新开源贡献
  updateOpensource: async (opensource) => {
    try {
      const { data } = await axios.post('/productx/resume/opensource/update', opensource);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新开源贡献失败'
      };
    }
  },

  // 删除开源贡献
  deleteOpensource: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/opensource/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除开源贡献失败'
      };
    }
  },

  // ========== 作品集相关接口 ==========
  
  // 获取当前用户作品集列表
  getPortfolio: async () => {
    try {
      const { data } = await axios.get('/productx/resume/portfolio/list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取作品集失败'
      };
    }
  },

  // 保存作品
  savePortfolio: async (portfolio) => {
    try {
      const { data } = await axios.post('/productx/resume/portfolio/save', portfolio);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存作品失败'
      };
    }
  },

  // 更新作品
  updatePortfolio: async (portfolio) => {
    try {
      const { data } = await axios.post('/productx/resume/portfolio/update', portfolio);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新作品失败'
      };
    }
  },

  // 删除作品
  deletePortfolio: async (id) => {
    try {
      const { data } = await axios.delete(`/productx/resume/portfolio/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除作品失败'
      };
    }
  },

  // ========== 个人简介相关接口 ==========
  
  // 获取当前用户个人简介
  getSummary: async () => {
    try {
      const { data } = await axios.get('/productx/resume/summary/get');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取个人简介失败'
      };
    }
  },

  // 保存或更新个人简介
  saveSummary: async (summary) => {
    try {
      const { data } = await axios.post('/productx/resume/summary/save', summary);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '保存个人简介失败'
      };
    }
  },

  // 删除个人简介
  deleteSummary: async () => {
    try {
      const { data } = await axios.delete('/productx/resume/summary/delete');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除个人简介失败'
      };
    }
  }
};

