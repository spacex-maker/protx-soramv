import React, { useState, useEffect } from "react";
import { ConfigProvider, theme, message } from "antd";
import SimpleHeader from "components/headers/simple";
import dayjs from 'dayjs';
import { resume as resumeApi } from '../../api/resume';

// 组件
import PersonalInfo from './components/PersonalInfo';
import SkillsSection from './components/SkillsSection';
import EducationSection from './components/EducationSection';
import CareerSection from './components/CareerSection';
import ProjectsSection from './components/ProjectsSection';
import CertificationsSection from './components/CertificationsSection';
import LanguagesSection from './components/LanguagesSection';
import AwardsSection from './components/AwardsSection';
import OpenSourceSection from './components/OpenSourceSection';
import PortfolioSection from './components/PortfolioSection';
import SummarySection from './components/SummarySection';
import ProficiencyRuler from './components/ProficiencyRuler';

// 样式
import {
  PageBackground,
  ContentWrapper,
  MainContainer,
  ResumeGlobalStyles
} from './styles';

// 常量和工具
import { 
  defaultSkills, 
  defaultPersonalInfo, 
  defaultEducation,
  defaultCareer,
  defaultProjects,
  defaultCertifications,
  defaultLanguages,
  defaultAwards,
  defaultOpenSource,
  defaultPortfolio,
  defaultSummary
} from './constants';
import { mergeSkills, convertBackendSkillsToFrontend, convertFrontendSkillsToBackend } from './utils';

export default function Resume() {
  const { token } = theme.useToken();
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState(defaultSkills);
  const [activeSkillTab, setActiveSkillTab] = useState('core');
  const [personalInfo, setPersonalInfo] = useState(defaultPersonalInfo);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [isEditingCareer, setIsEditingCareer] = useState(false);
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [isEditingCertifications, setIsEditingCertifications] = useState(false);
  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [isEditingAwards, setIsEditingAwards] = useState(false);
  const [isEditingOpenSource, setIsEditingOpenSource] = useState(false);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [education, setEducation] = useState(defaultEducation);
  const [career, setCareer] = useState(defaultCareer);
  const [projects, setProjects] = useState(defaultProjects);
  const [certifications, setCertifications] = useState(defaultCertifications);
  const [languages, setLanguages] = useState(defaultLanguages);
  const [awards, setAwards] = useState(defaultAwards);
  const [openSource, setOpenSource] = useState(defaultOpenSource);
  const [portfolio, setPortfolio] = useState(defaultPortfolio);
  const [summary, setSummary] = useState(defaultSummary);

  // 数据加载
  useEffect(() => {
    // 加载个人信息 - 从后端 API 获取
    const loadPersonalInfo = async () => {
      try {
        const response = await resumeApi.getPersonalInfo();
        if (response.success && response.data) {
          // 将后端返回的数据映射到前端格式
          const backendData = response.data;
          setPersonalInfo({
            name: backendData.name || '',
            title: backendData.title || '',
            age: backendData.age || '',
            gender: backendData.gender || '',
            location: backendData.location || '',
            experience: backendData.experience || '',
            email: backendData.email || '',
            phone: backendData.phone || '',
            wechat: backendData.wechat || '',
            github: backendData.github || '',
            linkedin: backendData.linkedin || '',
            blog: backendData.blog || '',
            website: backendData.website || '',
            address: backendData.address || '',
            expectedSalary: backendData.expectedSalary || '',
            availability: backendData.availability || ''
          });
        } else {
          // 如果后端没有数据，使用默认值
          setPersonalInfo(defaultPersonalInfo);
        }
      } catch (error) {
        console.error('Failed to load personal info:', error);
        // 出错时使用默认值
        setPersonalInfo(defaultPersonalInfo);
      }
    };

    loadPersonalInfo();

    // 加载技能栈 - 从后端 API 获取
    const loadSkills = async () => {
      try {
        const response = await resumeApi.getSkills();
        if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
          // 将后端返回的数组格式转换为前端对象格式
          const frontendSkills = convertBackendSkillsToFrontend(response.data, defaultSkills);
          setSkills(frontendSkills);
        } else {
          // 如果后端没有数据，使用默认值
          setSkills(defaultSkills);
        }
      } catch (error) {
        console.error('Failed to load skills:', error);
        // 出错时使用默认值
        setSkills(defaultSkills);
      }
    };

    loadSkills();

    // 加载教育经历 - 从后端 API 获取
    const loadEducation = async () => {
      try {
        const response = await resumeApi.getEducation();
        if (response.success && response.data && Array.isArray(response.data)) {
          // 将后端返回的数据转换为前端格式
          const frontendEducation = response.data.map(item => ({
            id: item.id,
            degree: item.degree || '',
            major: item.major || '',
            school: item.school || '',
            startDate: item.startDate || '',
            endDate: item.endDate || '',
            description: item.description || ''
          }));
          // 如果后端有数据就使用，没有数据就使用空数组（不使用默认数据，因为默认数据的ID在后端不存在）
          setEducation(frontendEducation);
        } else {
          // 如果后端没有数据，使用空数组（不使用默认数据）
          setEducation([]);
        }
      } catch (error) {
        console.error('Failed to load education:', error);
        // 出错时使用空数组（不使用默认数据）
        setEducation([]);
      }
    };

    loadEducation();

    // 加载职业生涯 - 从后端 API 获取
    const loadCareer = async () => {
      try {
        const response = await resumeApi.getCareer();
        if (response.success && response.data && Array.isArray(response.data)) {
          // 将后端返回的数据转换为前端格式
          const frontendCareer = response.data.map(item => ({
            id: item.id,
            company: item.company || '',
            position: item.position || '',
            location: item.location || '',
            department: item.department || '',
            startDate: item.startDate || '',
            endDate: item.endDate || '',
            description: item.description || '',
            responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
            achievements: Array.isArray(item.achievements) ? item.achievements : [],
            technologies: Array.isArray(item.technologies) ? item.technologies : []
          }));
          setCareer(frontendCareer);
        } else {
          // 如果后端没有数据，使用空数组
          setCareer([]);
        }
      } catch (error) {
        console.error('Failed to load career:', error);
        // 出错时使用空数组
        setCareer([]);
      }
    };

    loadCareer();

    // 加载项目经验 - 从后端 API 获取
    const loadProjects = async () => {
      try {
        const response = await resumeApi.getProjects();
        if (response.success && response.data && Array.isArray(response.data)) {
          // 将后端返回的数据转换为前端格式
          const frontendProjects = response.data.map(item => ({
            id: item.id,
            name: item.name || '',
            description: item.description || '',
            role: item.role || '',
            startDate: item.startDate || '',
            endDate: item.endDate || '',
            technologies: Array.isArray(item.technologies) ? item.technologies : [],
            highlights: Array.isArray(item.highlights) ? item.highlights : [],
            link: item.link || '',
            demo: item.demo || ''
          }));
          setProjects(frontendProjects);
        } else {
          // 如果后端没有数据，使用空数组
          setProjects([]);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        // 出错时使用空数组
        setProjects([]);
      }
    };

    loadProjects();

    // 其他模块仍从 localStorage 加载（后续会改为 API）
    const savedProjects = localStorage.getItem('resume-projects');
    const savedCertifications = localStorage.getItem('resume-certifications');
    const savedLanguages = localStorage.getItem('resume-languages');
    const savedAwards = localStorage.getItem('resume-awards');
    const savedOpenSource = localStorage.getItem('resume-opensource');
    const savedPortfolio = localStorage.getItem('resume-portfolio');
    const savedSummary = localStorage.getItem('resume-summary');
    
    if (savedCertifications) {
      try {
        setCertifications(JSON.parse(savedCertifications));
      } catch (e) {
        console.error('Failed to parse saved certifications:', e);
      }
    }

    if (savedLanguages) {
      try {
        setLanguages(JSON.parse(savedLanguages));
      } catch (e) {
        console.error('Failed to parse saved languages:', e);
      }
    }

    if (savedAwards) {
      try {
        setAwards(JSON.parse(savedAwards));
      } catch (e) {
        console.error('Failed to parse saved awards:', e);
      }
    }

    if (savedOpenSource) {
      try {
        setOpenSource(JSON.parse(savedOpenSource));
      } catch (e) {
        console.error('Failed to parse saved opensource:', e);
      }
    }

    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (e) {
        console.error('Failed to parse saved portfolio:', e);
      }
    }

    if (savedSummary) {
      try {
        setSummary(savedSummary);
      } catch (e) {
        console.error('Failed to parse saved summary:', e);
      }
    }
  }, []);

  // 保存数据
  const handleSave = () => {
    localStorage.setItem('resume-skills', JSON.stringify(skills));
    localStorage.setItem('resume-info', JSON.stringify(personalInfo));
    localStorage.setItem('resume-education', JSON.stringify(education));
    localStorage.setItem('resume-career', JSON.stringify(career));
    localStorage.setItem('resume-projects', JSON.stringify(projects));
    localStorage.setItem('resume-certifications', JSON.stringify(certifications));
    localStorage.setItem('resume-languages', JSON.stringify(languages));
    localStorage.setItem('resume-awards', JSON.stringify(awards));
    localStorage.setItem('resume-opensource', JSON.stringify(openSource));
    localStorage.setItem('resume-portfolio', JSON.stringify(portfolio));
    localStorage.setItem('resume-summary', summary);
    setIsEditing(false);
    setIsEditingInfo(false);
    setIsEditingEducation(false);
    setIsEditingCareer(false);
    setIsEditingProjects(false);
    setIsEditingCertifications(false);
    setIsEditingLanguages(false);
    setIsEditingAwards(false);
    setIsEditingOpenSource(false);
    setIsEditingPortfolio(false);
    setIsEditingSummary(false);
    message.success('简历已保存！');
  };

  // 个人信息处理
  const handleInfoChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 保存个人信息到后端
  const handleSavePersonalInfo = async () => {
    try {
      const response = await resumeApi.savePersonalInfo(personalInfo);
      if (response.success) {
        setIsEditingInfo(false);
        message.success('个人信息已保存！');
      } else {
        message.error(response.message || '保存个人信息失败');
      }
    } catch (error) {
      console.error('Failed to save personal info:', error);
      message.error('保存个人信息失败，请稍后重试');
    }
  };

  // 技能处理
  const handleSkillPercentageChange = (category, index, percentage) => {
    const newSkills = { ...skills };
    newSkills[category][index].percentage = percentage;
    setSkills(newSkills);
  };

  // 保存技能栈到后端
  const handleSaveSkills = async () => {
    try {
      // 将前端对象格式转换为后端数组格式
      const backendSkillsArray = convertFrontendSkillsToBackend(skills);
      
      const response = await resumeApi.saveSkills(backendSkillsArray);
      if (response.success) {
        setIsEditing(false);
        message.success('技能栈已保存！');
        
        // 保存成功后，重新加载技能数据以获取最新的ID等信息
        try {
          const reloadResponse = await resumeApi.getSkills();
          if (reloadResponse.success && reloadResponse.data && Array.isArray(reloadResponse.data) && reloadResponse.data.length > 0) {
            const frontendSkills = convertBackendSkillsToFrontend(reloadResponse.data, defaultSkills);
            setSkills(frontendSkills);
          }
        } catch (reloadError) {
          console.error('Failed to reload skills after save:', reloadError);
        }
      } else {
        message.error(response.message || '保存技能栈失败');
      }
    } catch (error) {
      console.error('Failed to save skills:', error);
      message.error('保存技能栈失败，请稍后重试');
    }
  };

  // 教育信息处理
  const handleEducationChange = (id, field, value) => {
    setEducation(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddEducation = () => {
    // 使用负数作为临时ID，用于区分新增项
    const existingIds = education.map(e => typeof e.id === 'number' ? e.id : 0);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newTempId = maxId > 0 ? -Math.abs(maxId) - 1 : -1;
    
    setEducation(prev => [
      {
        id: newTempId,
        degree: '本科',
        major: '',
        school: '',
        startDate: dayjs().format('YYYY-MM'),
        endDate: dayjs().format('YYYY-MM'),
        description: ''
      },
      ...prev
    ]);
  };

  // 删除教育经历
  const handleDeleteEducation = async (id) => {
    // 如果是临时ID（负数），直接从本地删除
    if (typeof id === 'number' && id < 0) {
      setEducation(prev => prev.filter(item => item.id !== id));
      message.success('教育经历已删除');
      return;
    }

    // 如果是真实ID，调用后端API删除
    try {
      const response = await resumeApi.deleteEducation(id);
      if (response.success) {
        setEducation(prev => prev.filter(item => item.id !== id));
        message.success('教育经历已删除');
      } else {
        message.error(response.message || '删除教育经历失败');
      }
    } catch (error) {
      console.error('Failed to delete education:', error);
      message.error('删除教育经历失败，请稍后重试');
    }
  };

  // 保存教育经历到后端
  const handleSaveEducation = async () => {
    try {
      // 如果没有教育经历，直接返回
      if (!education || education.length === 0) {
        setIsEditingEducation(false);
        message.success('教育经历已保存！');
        return;
      }

      // 区分新增和更新
      // 注意：只有ID是正数且大于0的才认为是已存在的记录，需要更新
      // 负数ID或0/null/undefined都认为是新记录，需要新增
      const savePromises = education.map(async (item) => {
        // 判断是否为已存在的记录：ID必须是正数且大于0
        const isExisting = typeof item.id === 'number' && item.id > 0;
        
        const requestData = {
          degree: item.degree || '',
          major: item.major || '',
          school: item.school || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          description: item.description || ''
        };

        if (isExisting) {
          // 更新已存在的记录
          requestData.id = item.id;
          return await resumeApi.updateEducation(requestData);
        } else {
          // 新增记录（包括负数ID、0、null、undefined等情况）
          return await resumeApi.saveEducation(requestData);
        }
      });

      const results = await Promise.all(savePromises);
      
      // 检查是否所有操作都成功
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        setIsEditingEducation(false);
        message.success('教育经历已保存！');
        
        // 保存成功后，重新加载教育数据以获取最新的ID等信息
        try {
          const reloadResponse = await resumeApi.getEducation();
          if (reloadResponse.success && reloadResponse.data && Array.isArray(reloadResponse.data)) {
            const frontendEducation = reloadResponse.data.map(item => ({
              id: item.id,
              degree: item.degree || '',
              major: item.major || '',
              school: item.school || '',
              startDate: item.startDate || '',
              endDate: item.endDate || '',
              description: item.description || ''
            }));
            setEducation(frontendEducation);
          }
        } catch (reloadError) {
          console.error('Failed to reload education after save:', reloadError);
        }
      } else {
        const failedResults = results.filter(result => !result.success);
        message.error(failedResults[0]?.message || '保存教育经历失败');
      }
    } catch (error) {
      console.error('Failed to save education:', error);
      message.error('保存教育经历失败，请稍后重试');
    }
  };

  // 职业生涯处理
  const handleCareerChange = (id, field, value) => {
    setCareer(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddCareer = () => {
    // 使用负数作为临时ID，用于区分新增项
    const existingIds = career.map(c => typeof c.id === 'number' ? c.id : 0);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newTempId = maxId > 0 ? -Math.abs(maxId) - 1 : -1;
    
    setCareer(prev => [
      {
        id: newTempId,
        company: '',
        position: '',
        location: '',
        department: '',
        startDate: dayjs().format('YYYY-MM'),
        endDate: '至今',
        description: '',
        responsibilities: [],
        achievements: [],
        technologies: []
      },
      ...prev
    ]);
  };

  // 删除职业生涯
  const handleDeleteCareer = async (id) => {
    // 如果是临时ID（负数），直接从本地删除
    if (typeof id === 'number' && id < 0) {
      setCareer(prev => prev.filter(item => item.id !== id));
      message.success('工作经历已删除');
      return;
    }

    // 如果是真实ID，调用后端API删除
    try {
      const response = await resumeApi.deleteCareer(id);
      if (response.success) {
        setCareer(prev => prev.filter(item => item.id !== id));
        message.success('工作经历已删除');
      } else {
        message.error(response.message || '删除工作经历失败');
      }
    } catch (error) {
      console.error('Failed to delete career:', error);
      message.error('删除工作经历失败，请稍后重试');
    }
  };

  // 保存职业生涯到后端
  const handleSaveCareer = async () => {
    try {
      // 如果没有职业生涯，直接返回
      if (!career || career.length === 0) {
        setIsEditingCareer(false);
        message.success('职业生涯已保存！');
        return;
      }

      // 区分新增和更新
      // 注意：只有ID是正数且大于0的才认为是已存在的记录，需要更新
      // 负数ID或0/null/undefined都认为是新记录，需要新增
      const savePromises = career.map(async (item) => {
        // 判断是否为已存在的记录：ID必须是正数且大于0
        const isExisting = typeof item.id === 'number' && item.id > 0;
        
        const requestData = {
          company: item.company || '',
          position: item.position || '',
          location: item.location || '',
          department: item.department || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          description: item.description || '',
          responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
          achievements: Array.isArray(item.achievements) ? item.achievements : [],
          technologies: Array.isArray(item.technologies) ? item.technologies : []
        };

        if (isExisting) {
          // 更新已存在的记录
          requestData.id = item.id;
          return await resumeApi.updateCareer(requestData);
        } else {
          // 新增记录（包括负数ID、0、null、undefined等情况）
          return await resumeApi.saveCareer(requestData);
        }
      });

      const results = await Promise.all(savePromises);
      
      // 检查是否所有操作都成功
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        setIsEditingCareer(false);
        message.success('职业生涯已保存！');
        
        // 保存成功后，重新加载职业生涯数据以获取最新的ID等信息
        try {
          const reloadResponse = await resumeApi.getCareer();
          if (reloadResponse.success && reloadResponse.data && Array.isArray(reloadResponse.data)) {
            const frontendCareer = reloadResponse.data.map(item => ({
              id: item.id,
              company: item.company || '',
              position: item.position || '',
              location: item.location || '',
              department: item.department || '',
              startDate: item.startDate || '',
              endDate: item.endDate || '',
              description: item.description || '',
              responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
              achievements: Array.isArray(item.achievements) ? item.achievements : [],
              technologies: Array.isArray(item.technologies) ? item.technologies : []
            }));
            setCareer(frontendCareer);
          }
        } catch (reloadError) {
          console.error('Failed to reload career after save:', reloadError);
        }
      } else {
        const failedResults = results.filter(result => !result.success);
        message.error(failedResults[0]?.message || '保存职业生涯失败');
      }
    } catch (error) {
      console.error('Failed to save career:', error);
      message.error('保存职业生涯失败，请稍后重试');
    }
  };

  // 项目经验处理
  const handleProjectChange = (id, field, value) => {
    setProjects(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddProject = () => {
    // 使用负数作为临时ID，用于区分新增项
    const existingIds = projects.map(p => typeof p.id === 'number' ? p.id : 0);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newTempId = maxId > 0 ? -Math.abs(maxId) - 1 : -1;
    
    setProjects(prev => [
      {
        id: newTempId,
        name: '',
        description: '',
        role: '',
        startDate: dayjs().format('YYYY-MM'),
        endDate: '至今',
        technologies: [],
        highlights: [],
        link: '',
        demo: ''
      },
      ...prev
    ]);
  };

  // 删除项目经验
  const handleDeleteProject = async (id) => {
    // 如果是临时ID（负数），直接从本地删除
    if (typeof id === 'number' && id < 0) {
      setProjects(prev => prev.filter(item => item.id !== id));
      message.success('项目已删除');
      return;
    }

    // 如果是真实ID，调用后端API删除
    try {
      const response = await resumeApi.deleteProject(id);
      if (response.success) {
        setProjects(prev => prev.filter(item => item.id !== id));
        message.success('项目已删除');
      } else {
        message.error(response.message || '删除项目失败');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      message.error('删除项目失败，请稍后重试');
    }
  };

  // 保存项目经验到后端
  const handleSaveProjects = async () => {
    try {
      // 如果没有项目经验，直接返回
      if (!projects || projects.length === 0) {
        setIsEditingProjects(false);
        message.success('项目经验已保存！');
        return;
      }

      // 区分新增和更新
      // 注意：只有ID是正数且大于0的才认为是已存在的记录，需要更新
      // 负数ID或0/null/undefined都认为是新记录，需要新增
      const savePromises = projects.map(async (item) => {
        // 判断是否为已存在的记录：ID必须是正数且大于0
        const isExisting = typeof item.id === 'number' && item.id > 0;
        
        const requestData = {
          name: item.name || '',
          description: item.description || '',
          role: item.role || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          technologies: Array.isArray(item.technologies) ? item.technologies : [],
          highlights: Array.isArray(item.highlights) ? item.highlights : [],
          link: item.link || '',
          demo: item.demo || ''
        };

        if (isExisting) {
          // 更新已存在的记录
          requestData.id = item.id;
          return await resumeApi.updateProject(requestData);
        } else {
          // 新增记录（包括负数ID、0、null、undefined等情况）
          return await resumeApi.saveProject(requestData);
        }
      });

      const results = await Promise.all(savePromises);
      
      // 检查是否所有操作都成功
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        setIsEditingProjects(false);
        message.success('项目经验已保存！');
        
        // 保存成功后，重新加载项目经验数据以获取最新的ID等信息
        try {
          const reloadResponse = await resumeApi.getProjects();
          if (reloadResponse.success && reloadResponse.data && Array.isArray(reloadResponse.data)) {
            const frontendProjects = reloadResponse.data.map(item => ({
              id: item.id,
              name: item.name || '',
              description: item.description || '',
              role: item.role || '',
              startDate: item.startDate || '',
              endDate: item.endDate || '',
              technologies: Array.isArray(item.technologies) ? item.technologies : [],
              highlights: Array.isArray(item.highlights) ? item.highlights : [],
              link: item.link || '',
              demo: item.demo || ''
            }));
            setProjects(frontendProjects);
          }
        } catch (reloadError) {
          console.error('Failed to reload projects after save:', reloadError);
        }
      } else {
        const failedResults = results.filter(result => !result.success);
        message.error(failedResults[0]?.message || '保存项目经验失败');
      }
    } catch (error) {
      console.error('Failed to save projects:', error);
      message.error('保存项目经验失败，请稍后重试');
    }
  };

  // 证书处理
  const handleCertificationChange = (id, field, value) => {
    setCertifications(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddCertification = () => {
    const newId = Math.max(...certifications.map(c => c.id), 0) + 1;
    setCertifications(prev => [
      {
        id: newId,
        name: '',
        issuer: '',
        issueDate: dayjs().format('YYYY-MM'),
        expiryDate: '',
        credentialId: '',
        description: ''
      },
      ...prev
    ]);
  };

  const handleDeleteCertification = (id) => {
    setCertifications(prev => prev.filter(item => item.id !== id));
    message.success('证书已删除');
  };

  // 语言能力处理
  const handleLanguageChange = (id, field, value) => {
    setLanguages(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddLanguage = () => {
    const newId = Math.max(...languages.map(l => l.id), 0) + 1;
    setLanguages(prev => [
      {
        id: newId,
        language: '',
        listening: '基础',
        speaking: '基础',
        reading: '基础',
        writing: '基础',
        certificate: ''
      },
      ...prev
    ]);
  };

  const handleDeleteLanguage = (id) => {
    setLanguages(prev => prev.filter(item => item.id !== id));
    message.success('语言已删除');
  };

  // 获奖经历处理
  const handleAwardChange = (id, field, value) => {
    setAwards(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddAward = () => {
    const newId = Math.max(...awards.map(a => a.id), 0) + 1;
    setAwards(prev => [
      {
        id: newId,
        name: '',
        issuer: '',
        date: dayjs().format('YYYY-MM'),
        level: '公司级',
        description: ''
      },
      ...prev
    ]);
  };

  const handleDeleteAward = (id) => {
    setAwards(prev => prev.filter(item => item.id !== id));
    message.success('奖项已删除');
  };

  // 开源贡献处理
  const handleOpenSourceChange = (id, field, value) => {
    setOpenSource(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddOpenSource = () => {
    const newId = Math.max(...openSource.map(o => o.id), 0) + 1;
    setOpenSource(prev => [
      {
        id: newId,
        name: '',
        description: '',
        link: '',
        contributions: [],
        stars: 0,
        role: 'Contributor'
      },
      ...prev
    ]);
  };

  const handleDeleteOpenSource = (id) => {
    setOpenSource(prev => prev.filter(item => item.id !== id));
    message.success('开源项目已删除');
  };

  // 作品集处理
  const handlePortfolioChange = (id, field, value) => {
    setPortfolio(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddPortfolio = () => {
    const newId = Math.max(...portfolio.map(p => p.id), 0) + 1;
    setPortfolio(prev => [
      {
        id: newId,
        name: '',
        description: '',
        technologies: [],
        link: '',
        demo: '',
        screenshot: '',
        category: 'Web应用'
      },
      ...prev
    ]);
  };

  const handleDeletePortfolio = (id) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
    message.success('作品已删除');
  };

  // 个人简介处理
  const handleSummaryChange = (value) => {
    setSummary(value);
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <ConfigProvider theme={{ token }}>
      <ResumeGlobalStyles />
      <PageBackground $token={token}>
        <SimpleHeader />
        <ProficiencyRuler token={token} />
        <ContentWrapper $token={token}>
          <MainContainer
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 个人信息 */}
            <PersonalInfo
              token={token}
              personalInfo={personalInfo}
              isEditingInfo={isEditingInfo}
              onEditToggle={setIsEditingInfo}
              onInfoChange={handleInfoChange}
              onSave={handleSavePersonalInfo}
              variants={itemVariants}
            />

            {/* 技能栈 */}
            <SkillsSection
              token={token}
              skills={skills}
              isEditing={isEditing}
              activeSkillTab={activeSkillTab}
              onTabChange={setActiveSkillTab}
              onEditToggle={setIsEditing}
              onSave={handleSaveSkills}
              onSkillPercentageChange={handleSkillPercentageChange}
              variants={itemVariants}
            />

            {/* 教育信息 */}
            <EducationSection
              token={token}
              education={education}
              isEditingEducation={isEditingEducation}
              onEditToggle={setIsEditingEducation}
              onSave={handleSaveEducation}
              onEducationChange={handleEducationChange}
              onAddEducation={handleAddEducation}
              onDeleteEducation={handleDeleteEducation}
              variants={itemVariants}
            />

            {/* 职业生涯 */}
            <CareerSection
              token={token}
              career={career}
              isEditingCareer={isEditingCareer}
              onEditToggle={setIsEditingCareer}
              onSave={handleSaveCareer}
              onCareerChange={handleCareerChange}
              onAddCareer={handleAddCareer}
              onDeleteCareer={handleDeleteCareer}
              variants={itemVariants}
            />

            {/* 项目经验 */}
            <ProjectsSection
              token={token}
              projects={projects}
              isEditingProjects={isEditingProjects}
              onEditToggle={setIsEditingProjects}
              onSave={handleSaveProjects}
              onProjectChange={handleProjectChange}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
              variants={itemVariants}
            />

            {/* 证书/资质 */}
            <CertificationsSection
              token={token}
              certifications={certifications}
              isEditingCertifications={isEditingCertifications}
              onEditToggle={setIsEditingCertifications}
              onSave={handleSave}
              onCertificationChange={handleCertificationChange}
              onAddCertification={handleAddCertification}
              onDeleteCertification={handleDeleteCertification}
              variants={itemVariants}
            />

            {/* 语言能力 */}
            <LanguagesSection
              token={token}
              languages={languages}
              isEditingLanguages={isEditingLanguages}
              onEditToggle={setIsEditingLanguages}
              onSave={handleSave}
              onLanguageChange={handleLanguageChange}
              onAddLanguage={handleAddLanguage}
              onDeleteLanguage={handleDeleteLanguage}
              variants={itemVariants}
            />

            {/* 获奖经历 */}
            <AwardsSection
              token={token}
              awards={awards}
              isEditingAwards={isEditingAwards}
              onEditToggle={setIsEditingAwards}
              onSave={handleSave}
              onAwardChange={handleAwardChange}
              onAddAward={handleAddAward}
              onDeleteAward={handleDeleteAward}
              variants={itemVariants}
            />

            {/* 开源贡献 */}
            <OpenSourceSection
              token={token}
              openSource={openSource}
              isEditingOpenSource={isEditingOpenSource}
              onEditToggle={setIsEditingOpenSource}
              onSave={handleSave}
              onOpenSourceChange={handleOpenSourceChange}
              onAddOpenSource={handleAddOpenSource}
              onDeleteOpenSource={handleDeleteOpenSource}
              variants={itemVariants}
            />

            {/* 作品集 */}
            <PortfolioSection
              token={token}
              portfolio={portfolio}
              isEditingPortfolio={isEditingPortfolio}
              onEditToggle={setIsEditingPortfolio}
              onSave={handleSave}
              onPortfolioChange={handlePortfolioChange}
              onAddPortfolio={handleAddPortfolio}
              onDeletePortfolio={handleDeletePortfolio}
              variants={itemVariants}
            />

            {/* 个人简介 */}
            <SummarySection
              token={token}
              summary={summary}
              isEditingSummary={isEditingSummary}
              onEditToggle={setIsEditingSummary}
              onSave={handleSave}
              onSummaryChange={handleSummaryChange}
              variants={itemVariants}
            />
          </MainContainer>
        </ContentWrapper>
      </PageBackground>
    </ConfigProvider>
  );
}

