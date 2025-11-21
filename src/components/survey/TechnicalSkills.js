import React, { useState } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const Container = styled.div`
  padding: 1rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2563EB;
  margin-bottom: 0.25rem;
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 1rem;
`;

const Sidebar = styled.div`
  width: 200px;
  flex-shrink: 0;
`;

const CategoryButton = styled.button`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: ${props => props.isActive ? '#2563EB' : 'transparent'};
  color: ${props => props.isActive ? '#ffffff' : '#64748B'};
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  i {
    font-size: 1rem;
  }

  &:hover {
    background: ${props => props.isActive ? '#2563EB' : '#F3F4F6'};
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
`;

const SkillCard = styled(motion.div)`
  background: #F8FAFC;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  border: 1px solid ${props => props.isSelected ? '#2563EB' : 'transparent'};
  position: relative;
  overflow: visible;

  &:hover {
    background: #F1F5F9;
  }
`;

const SkillHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const SkillInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SkillName = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F2937;
`;

const SkillContent = styled.div`
  margin-right: ${props => props.showBadge ? '80px' : '0'};
  transition: margin 0.3s ease;
`;

const LevelIndicator = styled.div`
  position: relative;
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => (props.level / 3) * 100}%;
    background: ${props => {
      if (props.level === 1) return '#60A5FA';
      if (props.level === 2) return '#34D399';
      if (props.level === 3) return '#F472B6';
      return 'transparent';
    }};
    transition: all 0.3s ease;
  }
`;

const LevelBadge = styled(motion.span)`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.level === 1) return '#DBEAFE';
    if (props.level === 2) return '#D1FAE5';
    if (props.level === 3) return '#FCE7F3';
    return '#F3F4F6';
  }};
  color: ${props => {
    if (props.level === 1) return '#2563EB';
    if (props.level === 2) return '#059669';
    if (props.level === 3) return '#BE185D';
    return '#6B7280';
  }};
  white-space: nowrap;
  z-index: 1;
`;

const TechnicalSkills = ({ formData, handleChange }) => {
  const [activeCategory, setActiveCategory] = useState("前端开发");
  const [selectedSkills, setSelectedSkills] = useState(formData?.skills || {});
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const categories = [
    { id: "前端开发", icon: "bi bi-code-slash" },
    { id: "后端开发", icon: "bi bi-server" },
    { id: "数据库", icon: "bi bi-database" },
    { id: "DevOps", icon: "bi bi-gear" },
    { id: "移动开发", icon: "bi bi-phone" },
    { id: "大数据", icon: "bi bi-graph-up" }
  ];

  const skillsByCategory = {
    "前端开发": [
      "React", 
      "Vue", 
      "Angular", 
      "TypeScript",
      "Next.js",
      "Webpack",
      "Vite",
      "TailwindCSS",
      "Redux",
      "GraphQL",
      "Sass/Less",
      "Jest"
    ],
    "后端开发": [
      "Node.js",
      "Python",
      "Java",
      "Go",
      "Spring Boot",
      "Express",
      "Django",
      "FastAPI",
      "NestJS",
      "Laravel",
      "Ruby on Rails",
      "Microservices"
    ],
    "数据库": [
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Elasticsearch",
      "Oracle",
      "SQLite",
      "DynamoDB",
      "Cassandra",
      "Neo4j",
      "Firebase",
      "GraphQL"
    ],
    "DevOps": [
      "Docker",
      "Kubernetes",
      "AWS",
      "Jenkins",
      "GitLab CI",
      "GitHub Actions",
      "Terraform",
      "Ansible",
      "Prometheus",
      "Grafana",
      "ELK Stack",
      "Nginx"
    ],
    "移动开发": [
      "React Native",
      "Flutter",
      "iOS/Swift",
      "Android/Kotlin",
      "Ionic",
      "Xamarin",
      "PWA",
      "Capacitor",
      "Unity",
      "小程序开发",
      "Objective-C",
      "Java Mobile"
    ],
    "大数据": [
      "Hadoop",
      "Spark",
      "Flink",
      "Hive",
      "Kafka",
      "Storm",
      "HBase",
      "Zookeeper",
      "TensorFlow",
      "PyTorch",
      "Tableau",
      "Power BI"
    ]
  };

  const skillLevels = ['未掌握', '入门', '熟练', '精通'];

  const handleSkillLevel = (skill, level) => {
    const updatedSkills = {
      ...selectedSkills,
      [skill]: level
    };
    
    setSelectedSkills(updatedSkills);
    
    if (handleChange) {
      handleChange({
        target: {
          name: 'skills',
          value: updatedSkills
        }
      });
    }
  };

  const getNextLevel = (currentLevel) => {
    return (currentLevel + 1) % 4;
  };

  return (
    <Container>
      <Header>
        <Title>技术技能评估</Title>
      </Header>

      <ContentLayout>
        <Sidebar>
          {categories.map(category => (
            <CategoryButton
              key={category.id}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              <i className={category.icon}></i>
              {category.id}
            </CategoryButton>
          ))}
        </Sidebar>

        <MainContent>
          <SkillGrid>
            {skillsByCategory[activeCategory].map(skill => (
              <SkillCard
                key={skill}
                isSelected={selectedSkills[skill] > 0}
                onClick={() => handleSkillLevel(skill, getNextLevel(selectedSkills[skill] || 0))}
                onMouseEnter={() => setHoveredSkill(skill)}
                onMouseLeave={() => setHoveredSkill(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SkillContent showBadge={hoveredSkill === skill || selectedSkills[skill] > 0}>
                  <SkillHeader>
                    <SkillInfo>
                      <i className="bi bi-code-square text-blue-500"></i>
                      <SkillName>{skill}</SkillName>
                    </SkillInfo>
                  </SkillHeader>
                  <LevelIndicator level={selectedSkills[skill] || 0} />
                </SkillContent>
                
                <LevelBadge 
                  level={selectedSkills[skill] || 0}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: hoveredSkill === skill || selectedSkills[skill] > 0 ? 1 : 0,
                    x: hoveredSkill === skill || selectedSkills[skill] > 0 ? 0 : 20
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {skillLevels[selectedSkills[skill] || 0]}
                </LevelBadge>
              </SkillCard>
            ))}
          </SkillGrid>
        </MainContent>
      </ContentLayout>
    </Container>
  );
};

export default TechnicalSkills; 