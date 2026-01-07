import React from 'react';
import {
  CodeOutlined,
  ApiOutlined,
  CloudOutlined,
  ToolOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";

// 图标映射
export const iconMap = {
  CodeOutlined: CodeOutlined,
  ApiOutlined: ApiOutlined,
  CloudOutlined: CloudOutlined,
  ToolOutlined: ToolOutlined,
  DatabaseOutlined: DatabaseOutlined,
  SafetyCertificateOutlined: SafetyCertificateOutlined
};

// 获取图标组件
export const getIcon = (iconType) => {
  const IconComponent = iconMap[iconType] || CodeOutlined;
  return <IconComponent />;
};

// 根据百分比获取颜色
export const getPercentageColor = (percentage) => {
  if (percentage < 30) return '#ff7875'; // 红色 - 入门
  if (percentage < 50) return '#ffa940'; // 橙色 - 熟悉
  if (percentage < 70) return '#52c41a'; // 绿色 - 熟练
  if (percentage < 90) return '#1890ff'; // 蓝色 - 精通
  return '#722ed1'; // 紫色 - 专家
};

// 根据百分比获取熟练度等级
export const getProficiencyLevel = (percentage) => {
  if (percentage < 30) return { level: '入门', color: '#ff7875', range: '0-29%' };
  if (percentage < 50) return { level: '熟悉', color: '#ffa940', range: '30-49%' };
  if (percentage < 70) return { level: '熟练', color: '#52c41a', range: '50-69%' };
  if (percentage < 90) return { level: '精通', color: '#1890ff', range: '70-89%' };
  return { level: '专家', color: '#722ed1', range: '90-100%' };
};

// 规范化技能数据，确保有正确的 iconType
export const normalizeSkills = (skillsData, defaultSkills) => {
  const normalized = { ...skillsData };
  Object.keys(normalized).forEach(category => {
    normalized[category] = normalized[category].map(skill => {
      const { icon, ...rest } = skill; // 移除旧的 icon 属性
      // 如果已经有 iconType，保留它；否则根据类别设置默认值
      if (!rest.iconType) {
        const defaultIconTypes = {
          core: 'CodeOutlined',
          spring: 'ApiOutlined',
          microservice: 'CloudOutlined',
          rdbms: 'DatabaseOutlined',
          nosql: 'DatabaseOutlined',
          mq: 'ApiOutlined',
          cache: 'DatabaseOutlined',
          frontend: 'CodeOutlined',
          testing: 'SafetyCertificateOutlined',
          build: 'ToolOutlined',
          devops: 'ToolOutlined',
          monitoring: 'ToolOutlined',
          webserver: 'ToolOutlined',
          tools: 'ToolOutlined',
          other: 'ApiOutlined',
          // 兼容旧数据
          database: 'DatabaseOutlined',
          middleware: 'CloudOutlined'
        };
        rest.iconType = defaultIconTypes[category] || 'CodeOutlined';
      }
      return rest;
    });
  });
  return normalized;
};

// 合并默认数据和保存的数据
export const mergeSkills = (savedSkills, defaultSkills) => {
  // 从默认数据开始，确保所有分类都存在
  const merged = {};
  Object.keys(defaultSkills).forEach(key => {
    merged[key] = [...defaultSkills[key]];
  });
  
  // 如果有保存的数据，合并进去
  if (savedSkills && typeof savedSkills === 'object') {
    Object.keys(savedSkills).forEach(category => {
      if (merged[category]) {
        // 如果分类已存在，合并技能项（保留用户修改的百分比）
        const savedSkillMap = new Map();
        (savedSkills[category] || []).forEach(s => {
          if (s && s.name) {
            savedSkillMap.set(s.name, s);
          }
        });
        
        merged[category] = merged[category].map(defaultSkill => {
          const savedSkill = savedSkillMap.get(defaultSkill.name);
          if (savedSkill) {
            // 保留用户修改的百分比，但确保有iconType
            return {
              ...defaultSkill,
              percentage: savedSkill.percentage !== undefined ? savedSkill.percentage : defaultSkill.percentage,
              iconType: savedSkill.iconType || defaultSkill.iconType
            };
          }
          return defaultSkill;
        });
        
        // 添加保存数据中存在但默认数据中不存在的技能
        (savedSkills[category] || []).forEach(savedSkill => {
          if (savedSkill && savedSkill.name && !merged[category].find(s => s.name === savedSkill.name)) {
            const { icon, ...rest } = savedSkill;
            merged[category].push({
              ...rest,
              iconType: rest.iconType || defaultSkills[category]?.[0]?.iconType || 'CodeOutlined'
            });
          }
        });
      } else {
        // 如果分类不存在于默认数据中，直接添加（兼容旧数据，如database, middleware）
        if (Array.isArray(savedSkills[category])) {
          merged[category] = savedSkills[category].map(skill => {
            if (!skill || !skill.name) return null;
            const { icon, ...rest } = skill;
            return {
              ...rest,
              iconType: rest.iconType || 'CodeOutlined'
            };
          }).filter(Boolean);
        }
      }
    });
  }
  
  return normalizeSkills(merged, defaultSkills);
};

// 将后端数组格式转换为前端对象格式
export const convertBackendSkillsToFrontend = (backendSkillsArray, defaultSkills) => {
  if (!backendSkillsArray || !Array.isArray(backendSkillsArray)) {
    return defaultSkills;
  }

  // 初始化前端格式，使用默认技能作为基础
  const frontendSkills = {};
  Object.keys(defaultSkills).forEach(category => {
    frontendSkills[category] = [];
  });

  // 按分类分组后端数据
  const skillsByCategory = {};
  backendSkillsArray.forEach(skill => {
    if (skill && skill.category && skill.name) {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push({
        name: skill.name,
        percentage: skill.percentage || 0,
        iconType: skill.iconType || 'CodeOutlined',
        id: skill.id, // 保留ID用于更新
        sortOrder: skill.sortOrder || 0
      });
    }
  });

  // 按 sortOrder 排序并合并到前端格式
  Object.keys(skillsByCategory).forEach(category => {
    const sortedSkills = skillsByCategory[category].sort((a, b) => {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    
    // 如果分类存在于默认技能中，合并数据（保留用户修改的百分比）
    if (frontendSkills[category]) {
      const defaultSkillMap = new Map();
      defaultSkills[category].forEach(s => {
        if (s && s.name) {
          defaultSkillMap.set(s.name, s);
        }
      });

      // 合并：优先使用后端数据，如果后端没有则使用默认数据
      const mergedSkills = [];
      const processedNames = new Set();

      // 先处理后端数据
      sortedSkills.forEach(backendSkill => {
        const defaultSkill = defaultSkillMap.get(backendSkill.name);
        if (defaultSkill) {
          // 如果默认数据中存在，合并（保留后端的百分比）
          mergedSkills.push({
            ...defaultSkill,
            percentage: backendSkill.percentage,
            id: backendSkill.id,
            sortOrder: backendSkill.sortOrder
          });
        } else {
          // 如果默认数据中不存在，直接添加后端数据
          mergedSkills.push(backendSkill);
        }
        processedNames.add(backendSkill.name);
      });

      // 添加默认数据中存在但后端没有的技能
      defaultSkills[category].forEach(defaultSkill => {
        if (!processedNames.has(defaultSkill.name)) {
          mergedSkills.push(defaultSkill);
        }
      });

      frontendSkills[category] = mergedSkills;
    } else {
      // 如果分类不存在于默认技能中，直接使用后端数据
      frontendSkills[category] = sortedSkills;
    }
  });

  return normalizeSkills(frontendSkills, defaultSkills);
};

// 将前端对象格式转换为后端数组格式
export const convertFrontendSkillsToBackend = (frontendSkills) => {
  const backendSkillsArray = [];
  
  Object.keys(frontendSkills).forEach(category => {
    const skills = frontendSkills[category];
    if (Array.isArray(skills)) {
      skills.forEach((skill, index) => {
        if (skill && skill.name) {
          backendSkillsArray.push({
            id: skill.id || null, // 如果有ID则保留，用于更新；否则为null，用于新增
            category: category,
            name: skill.name,
            percentage: skill.percentage || 0,
            iconType: skill.iconType || 'CodeOutlined',
            sortOrder: skill.sortOrder !== undefined ? skill.sortOrder : index
          });
        }
      });
    }
  });

  return backendSkillsArray;
};

