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

