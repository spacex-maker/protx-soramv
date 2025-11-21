import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const Container = styled.div`
  padding: 1rem;
`;

const Section = styled.div`
  margin-bottom: 1.25rem;
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

const PreferenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
`;

const PreferenceCard = styled(motion.div)`
  padding: 0.625rem;
  border-radius: 6px;
  background: #F8FAFC;
  border: 1px solid ${props => props.isSelected ? '#2563EB' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    background: #F1F5F9;
  }
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconWrapper = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: ${props => props.isSelected ? '#2563EB' : '#E2E8F0'};
  color: ${props => props.isSelected ? '#ffffff' : '#64748B'};

  i {
    font-size: 0.875rem;
  }
`;

const PreferenceLabel = styled.span`
  font-size: 0.875rem;
  color: #1F2937;
`;

const EnvironmentSection = styled(Section)`
  margin-top: 1.5rem;
`;

const EnvironmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
`;

const EnvironmentCard = styled(motion.div)`
  position: relative;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.isSelected ? 
    'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' : 
    '#F8FAFC'
  };
  cursor: pointer;
  border: 1px solid ${props => props.isSelected ? '#2563EB' : 'transparent'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const EnvironmentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const EnvironmentIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  background: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0'};
  color: ${props => props.isSelected ? '#ffffff' : '#2563EB'};
`;

const EnvironmentInfo = styled.div`
  flex: 1;
`;

const EnvironmentTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.isSelected ? '#ffffff' : '#1F2937'};
  margin-bottom: 0.25rem;
`;

const EnvironmentDesc = styled.p`
  font-size: 0.75rem;
  color: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.8)' : '#64748B'};
  line-height: 1.4;
`;

const WorkPreferences = ({ formData, handleChange }) => {
  const preferences = {
    "业务方向": [
      { id: "product", label: "产品规划", icon: "bi bi-lightbulb" },
      { id: "operation", label: "运营策略", icon: "bi bi-graph-up" },
      { id: "marketing", label: "市场营销", icon: "bi bi-megaphone" },
      { id: "sales", label: "销售拓展", icon: "bi bi-currency-dollar" },
      { id: "service", label: "客户服务", icon: "bi bi-headset" },
      { id: "strategy", label: "战略分析", icon: "bi bi-clipboard-data" }
    ],
    "技术方向": [
      { id: "frontend", label: "前端开发", icon: "bi bi-code-slash" },
      { id: "backend", label: "后端开发", icon: "bi bi-server" },
      { id: "fullstack", label: "全栈开发", icon: "bi bi-layers" },
      { id: "architecture", label: "架构设计", icon: "bi bi-diagram-3" },
      { id: "devops", label: "运维部署", icon: "bi bi-gear" },
      { id: "testing", label: "测试质量", icon: "bi bi-bug" }
    ],
    "数据方向": [
      { id: "analysis", label: "数据分析", icon: "bi bi-bar-chart" },
      { id: "mining", label: "数据挖掘", icon: "bi bi-search" },
      { id: "algorithm", label: "算法研究", icon: "bi bi-braces" },
      { id: "visualization", label: "数据可视化", icon: "bi bi-pie-chart" },
      { id: "bi", label: "商业智能", icon: "bi bi-graph-up-arrow" },
      { id: "machine_learning", label: "机器学习", icon: "bi bi-cpu" }
    ],
    "设计方向": [
      { id: "ui", label: "UI设计", icon: "bi bi-palette" },
      { id: "ux", label: "UX设计", icon: "bi bi-person-workspace" },
      { id: "graphic", label: "平面设计", icon: "bi bi-brush" },
      { id: "motion", label: "动效设计", icon: "bi bi-film" },
      { id: "interaction", label: "交互设计", icon: "bi bi-hand-index" },
      { id: "visual", label: "视觉设计", icon: "bi bi-eye" }
    ]
  };

  const handlePreferenceClick = (category, id) => {
    const fieldName = `${category}Preferences`;
    const currentPreferences = formData[fieldName] || [];
    const newPreferences = currentPreferences.includes(id)
      ? currentPreferences.filter(item => item !== id)
      : [...currentPreferences, id];

    handleChange({
      target: {
        name: fieldName,
        value: newPreferences
      }
    });
  };

  const environments = [
    {
      id: "office",
      title: "办公室工作",
      icon: "bi bi-building",
      description: "传统办公环境，面对面交流，团队协作"
    },
    {
      id: "remote",
      title: "远程工作",
      icon: "bi bi-laptop",
      description: "灵活办公地点，自主安排时间"
    },
    {
      id: "hybrid",
      title: "混合办公",
      icon: "bi bi-arrows-angle-contract",
      description: "线上线下结合，平衡效率与协作"
    },
    {
      id: "flexible",
      title: "弹性工作",
      icon: "bi bi-clock",
      description: "自由选择工作时间，注重结果导向"
    }
  ];

  const handleEnvironmentSelect = (environmentId) => {
    handleChange({
      target: {
        name: "workEnvironment",
        value: environmentId
      }
    });
  };

  return (
    <Container>
      {Object.entries(preferences).map(([category, items]) => (
        <Section key={category}>
          <SectionTitle>
            <i className="bi bi-bookmark-star"></i>
            {category}
          </SectionTitle>
          <PreferenceGrid>
            {items.map(item => (
              <PreferenceCard
                key={item.id}
                isSelected={(formData[`${category}Preferences`] || []).includes(item.id)}
                onClick={() => handlePreferenceClick(category, item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CardContent>
                  <IconWrapper
                    isSelected={(formData[`${category}Preferences`] || []).includes(item.id)}
                  >
                    <i className={item.icon}></i>
                  </IconWrapper>
                  <PreferenceLabel>{item.label}</PreferenceLabel>
                </CardContent>
              </PreferenceCard>
            ))}
          </PreferenceGrid>
        </Section>
      ))}

      <EnvironmentSection>
        <SectionTitle>
          <i className="bi bi-building"></i>
          工作环境偏好
        </SectionTitle>
        <EnvironmentGrid>
          {environments.map(env => (
            <EnvironmentCard
              key={env.id}
              isSelected={formData.workEnvironment === env.id}
              onClick={() => handleEnvironmentSelect(env.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <EnvironmentHeader>
                <EnvironmentIcon isSelected={formData.workEnvironment === env.id}>
                  <i className={env.icon}></i>
                </EnvironmentIcon>
                <EnvironmentInfo>
                  <EnvironmentTitle isSelected={formData.workEnvironment === env.id}>
                    {env.title}
                  </EnvironmentTitle>
                  <EnvironmentDesc isSelected={formData.workEnvironment === env.id}>
                    {env.description}
                  </EnvironmentDesc>
                </EnvironmentInfo>
              </EnvironmentHeader>
            </EnvironmentCard>
          ))}
        </EnvironmentGrid>
      </EnvironmentSection>
    </Container>
  );
};

export default WorkPreferences; 