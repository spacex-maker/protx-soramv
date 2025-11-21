import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const Container = styled.div`
  padding: 1rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    color: #2563EB;
    font-size: 0.875rem;
  }
`;

const GoalCard = styled(motion.div)`
  background: #F8FAFC;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
`;

const TimelineLabel = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: ${props => props.active ? '#2563EB' : '#E2E8F0'};
  color: ${props => props.active ? 'white' : '#64748B'};
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  cursor: pointer;

  i {
    font-size: 0.75rem;
    margin-right: 0.375rem;
  }
`;

const GoalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const GoalItem = styled(motion.div)`
  padding: 0.625rem;
  background: white;
  border-radius: 6px;
  border: 1px solid ${props => props.isSelected ? '#2563EB' : 'transparent'};
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background: #F1F5F9;
  }

  i {
    font-size: 0.875rem;
  }
`;

const CategoryTitle = styled.h4`
  font-size: 0.875rem;
  color: #4B5563;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const GoalText = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  resize: vertical;
  font-size: 0.875rem;
  line-height: 1.4;
  
  &:focus {
    outline: none;
    border-color: #2563EB;
  }
`;

const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
`;

const SkillTag = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: ${props => props.isSelected ? '#2563EB' : '#E2E8F0'};
  color: ${props => props.isSelected ? 'white' : '#64748B'};
  border-radius: 16px;
  font-size: 0.75rem;
  cursor: pointer;
  
  i {
    margin-right: 0.375rem;
    font-size: 0.75rem;
  }
`;

const CareerGoals = ({ formData, handleChange }) => {
  const [activeTimeline, setActiveTimeline] = useState('short');

  const careerPaths = {
    "管理方向": [
      { id: "team_lead", label: "团队负责人", icon: "bi bi-people" },
      { id: "project_manager", label: "项目经理", icon: "bi bi-kanban" },
      { id: "department_head", label: "部门主管", icon: "bi bi-diagram-3" },
      { id: "executive", label: "高级管理者", icon: "bi bi-trophy" }
    ],
    "专业方向": [
      { id: "tech_expert", label: "技术专家", icon: "bi bi-code-square" },
      { id: "product_expert", label: "产品专家", icon: "bi bi-box" },
      { id: "design_expert", label: "设计专家", icon: "bi bi-palette" },
      { id: "data_expert", label: "数据专家", icon: "bi bi-graph-up" }
    ],
    "创业方向": [
      { id: "startup_founder", label: "创业创始人", icon: "bi bi-rocket" },
      { id: "independent_dev", label: "独立开发者", icon: "bi bi-laptop" },
      { id: "consultant", label: "行业顾问", icon: "bi bi-chat-dots" },
      { id: "investor", label: "投资人", icon: "bi bi-cash-coin" }
    ]
  };

  const skillsToImprove = [
    { id: "leadership", label: "领导力", icon: "bi bi-star" },
    { id: "communication", label: "沟通能力", icon: "bi bi-chat" },
    { id: "innovation", label: "创新思维", icon: "bi bi-lightbulb" },
    { id: "strategy", label: "战略思维", icon: "bi bi-graph-up-arrow" },
    { id: "execution", label: "执行力", icon: "bi bi-check2-circle" },
    { id: "learning", label: "学习能力", icon: "bi bi-book" },
    { id: "teamwork", label: "团队协作", icon: "bi bi-people" },
    { id: "problem_solving", label: "问题解决", icon: "bi bi-tools" }
  ];

  const handleGoalSelect = (category, id) => {
    const fieldName = `${activeTimeline}TermGoals`;
    const currentGoals = formData[fieldName] || [];
    const newGoals = currentGoals.includes(id)
      ? currentGoals.filter(item => item !== id)
      : [...currentGoals, id];

    handleChange({
      target: {
        name: fieldName,
        value: newGoals
      }
    });
  };

  const handleSkillSelect = (skillId) => {
    const currentSkills = formData.skillsToImprove || [];
    const newSkills = currentSkills.includes(skillId)
      ? currentSkills.filter(id => id !== skillId)
      : [...currentSkills, skillId];

    handleChange({
      target: {
        name: 'skillsToImprove',
        value: newSkills
      }
    });
  };

  return (
    <Container>
      <Section>
        <SectionTitle>
          <i className="bi bi-flag"></i>
          职业发展目标
        </SectionTitle>
        
        <div style={{ marginBottom: '0.75rem' }}>
          <TimelineLabel 
            active={activeTimeline === 'short'}
            onClick={() => setActiveTimeline('short')}
          >
            <i className="bi bi-calendar-event"></i>
            短期目标 (1-3年)
          </TimelineLabel>
          {' '}
          <TimelineLabel 
            active={activeTimeline === 'long'}
            onClick={() => setActiveTimeline('long')}
          >
            <i className="bi bi-calendar4-range"></i>
            长期目标 (3-5年)
          </TimelineLabel>
        </div>

        <GoalCard>
          {Object.entries(careerPaths).map(([category, paths]) => (
            <div key={category} style={{ marginBottom: '1rem' }}>
              <CategoryTitle>{category}</CategoryTitle>
              <GoalGrid>
                {paths.map(path => (
                  <GoalItem
                    key={path.id}
                    isSelected={(formData[`${activeTimeline}TermGoals`] || []).includes(path.id)}
                    onClick={() => handleGoalSelect(category, path.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <i className={`${path.icon} text-blue-500`}></i>
                      <span>{path.label}</span>
                    </div>
                  </GoalItem>
                ))}
              </GoalGrid>
            </div>
          ))}

          <GoalText
            placeholder={`请描述您的${activeTimeline === 'short' ? '短期' : '长期'}职业目标...`}
            name={`${activeTimeline}TermGoalsDetail`}
            value={formData[`${activeTimeline}TermGoalsDetail`] || ''}
            onChange={handleChange}
          />
        </GoalCard>
      </Section>

      <Section>
        <SectionTitle>
          <i className="bi bi-arrow-up-circle"></i>
          需要提升的能力
        </SectionTitle>
        <SkillsGrid>
          {skillsToImprove.map(skill => (
            <SkillTag
              key={skill.id}
              isSelected={(formData.skillsToImprove || []).includes(skill.id)}
              onClick={() => handleSkillSelect(skill.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className={skill.icon}></i>
              {skill.label}
            </SkillTag>
          ))}
        </SkillsGrid>
      </Section>
    </Container>
  );
};

export default CareerGoals; 