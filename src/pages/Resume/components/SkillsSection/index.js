import React, { useState } from 'react';
import { CodeOutlined, EditOutlined, SaveOutlined, DashboardOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  SkillsSection,
  SkillsTabs,
  SectionHeader,
  SectionTitle,
  SkillCategory,
  SkillItem,
  SkillHeader,
  SkillName,
  SkillPercentage,
  ProgressContainer,
  CustomProgress,
  CustomSlider,
  EditButton
} from '../../styles';
import { skillCategories } from '../../constants';
import { getIcon, getPercentageColor } from '../../utils';
import SkillsDashboard from '../SkillsDashboard';

export default function SkillsSectionComponent({
  token,
  skills,
  isEditing,
  activeSkillTab,
  onTabChange,
  onEditToggle,
  onSave,
  onSkillPercentageChange,
  variants
}) {
  const [dashboardVisible, setDashboardVisible] = useState(false);
  // 渲染技能分类的通用函数
  const renderSkillCategory = (category, defaultIconType = 'CodeOutlined') => {
    if (!skills[category] || skills[category].length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无技能数据
        </div>
      );
    }
    
    return (
      <SkillCategory>
        {skills[category].map((skill, index) => {
          const color = getPercentageColor(skill.percentage);
          return (
            <SkillItem
              key={skill.name}
              $token={token}
              variants={variants}
              whileHover={{ scale: 1.01 }}
            >
              <SkillHeader>
                <SkillName $token={token}>
                  {getIcon(skill.iconType || defaultIconType)}
                  {skill.name}
                </SkillName>
                <SkillPercentage $color={color}>
                  {skill.percentage}%
                </SkillPercentage>
              </SkillHeader>
              <ProgressContainer>
                {isEditing ? (
                  <CustomSlider
                    $token={token}
                    $color={color}
                    value={skill.percentage}
                    onChange={(value) => onSkillPercentageChange(category, index, value)}
                    min={0}
                    max={100}
                    step={1}
                    tooltip={{ formatter: (value) => `${value}%` }}
                  />
                ) : (
                  <CustomProgress
                    $token={token}
                    $color={color}
                    percent={skill.percentage}
                    showInfo={false}
                  />
                )}
              </ProgressContainer>
            </SkillItem>
          );
        })}
      </SkillCategory>
    );
  };

  return (
    <>
      <SkillsSection $token={token} variants={variants}>
        <SectionHeader $token={token}>
          <SectionTitle level={2} $token={token}>
            <CodeOutlined className="icon" />
            技术栈
          </SectionTitle>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isEditing && (
              <EditButton
                $token={token}
                type="default"
                icon={<DashboardOutlined />}
                onClick={() => setDashboardVisible(true)}
              >
                看板
              </EditButton>
            )}
            {!isEditing ? (
              <EditButton
                $token={token}
                type="primary"
                icon={<EditOutlined />}
                onClick={onEditToggle}
              >
                编辑技能
              </EditButton>
            ) : (
              <EditButton
                $token={token}
                type="primary"
                icon={<SaveOutlined />}
                onClick={onSave}
              >
                保存更改
              </EditButton>
            )}
          </div>
        </SectionHeader>

      <SkillsTabs
        $token={token}
        activeKey={activeSkillTab}
        onChange={onTabChange}
        items={skillCategories.map(category => ({
          key: category.key,
          label: (
            <span>
              {category.icon}
              {category.title}
            </span>
          ),
          children: renderSkillCategory(category.key, category.defaultIconType)
        }))}
      />
      </SkillsSection>
      
      <SkillsDashboard
        visible={dashboardVisible}
        onClose={() => setDashboardVisible(false)}
        skills={skills}
        token={token}
      />
    </>
  );
}

