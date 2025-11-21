import React, { useState } from "react";
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

const Card = styled(motion.div)`
  background: #F8FAFC;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
`;

const Tag = styled(motion.span)`
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

const Input = styled.input`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  
  &:focus {
    outline: none;
    border-color: #2563EB;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.625rem;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const GridItem = styled(motion.div)`
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid ${props => props.isSelected ? '#2563EB' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    background: #F1F5F9;
  }
`;

const OtherInfo = ({ formData, handleChange }) => {
  const [newInterest, setNewInterest] = useState('');

  const interests = [
    { id: "reading", label: "阅读", icon: "bi bi-book" },
    { id: "sports", label: "运动", icon: "bi bi-bicycle" },
    { id: "music", label: "音乐", icon: "bi bi-music-note" },
    { id: "travel", label: "旅行", icon: "bi bi-airplane" },
    { id: "photography", label: "摄影", icon: "bi bi-camera" },
    { id: "cooking", label: "烹饪", icon: "bi bi-cup-hot" },
    { id: "gaming", label: "游戏", icon: "bi bi-controller" },
    { id: "art", label: "艺术", icon: "bi bi-palette" }
  ];

  const expectations = [
    { id: "growth", label: "职业成长", icon: "bi bi-graph-up-arrow" },
    { id: "culture", label: "企业文化", icon: "bi bi-people" },
    { id: "balance", label: "工作平衡", icon: "bi bi-yin-yang" },
    { id: "innovation", label: "创新环境", icon: "bi bi-lightbulb" },
    { id: "mentorship", label: "导师指导", icon: "bi bi-person-check" },
    { id: "benefits", label: "福利待遇", icon: "bi bi-gift" }
  ];

  const handleInterestSelect = (interestId) => {
    const currentInterests = formData.interests || [];
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId];

    handleChange({
      target: {
        name: 'interests',
        value: newInterests
      }
    });
  };

  const handleAddCustomInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim()) {
      const currentCustomInterests = formData.customInterests || [];
      handleChange({
        target: {
          name: 'customInterests',
          value: [...currentCustomInterests, newInterest.trim()]
        }
      });
      setNewInterest('');
    }
  };

  const handleExpectationSelect = (expectationId) => {
    const currentExpectations = formData.expectations || [];
    const newExpectations = currentExpectations.includes(expectationId)
      ? currentExpectations.filter(id => id !== expectationId)
      : [...currentExpectations, expectationId];

    handleChange({
      target: {
        name: 'expectations',
        value: newExpectations
      }
    });
  };

  return (
    <Container>
      <Section>
        <SectionTitle>
          <i className="bi bi-star"></i>
          兴趣爱好
        </SectionTitle>
        <Card>
          <TagsContainer>
            {interests.map(interest => (
              <Tag
                key={interest.id}
                isSelected={(formData.interests || []).includes(interest.id)}
                onClick={() => handleInterestSelect(interest.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className={interest.icon}></i>
                {interest.label}
              </Tag>
            ))}
          </TagsContainer>
          
          <form onSubmit={handleAddCustomInterest}>
            <Input
              type="text"
              placeholder="添加其他兴趣爱好..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
            />
          </form>

          {formData.customInterests?.length > 0 && (
            <TagsContainer>
              {formData.customInterests.map((interest, index) => (
                <Tag key={index} isSelected>
                  <i className="bi bi-plus-circle"></i>
                  {interest}
                </Tag>
              ))}
            </TagsContainer>
          )}
        </Card>
      </Section>

      <Section>
        <SectionTitle>
          <i className="bi bi-clipboard-check"></i>
          期望与建议
        </SectionTitle>
        <Card>
          <Grid>
            {expectations.map(exp => (
              <GridItem
                key={exp.id}
                isSelected={(formData.expectations || []).includes(exp.id)}
                onClick={() => handleExpectationSelect(exp.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className={`${exp.icon} text-blue-500`}></i>
                  <span style={{ fontSize: '0.875rem' }}>{exp.label}</span>
                </div>
              </GridItem>
            ))}
          </Grid>
          
          <TextArea
            placeholder="请详细描述您对团队的期望和建议..."
            name="expectationDetails"
            value={formData.expectationDetails || ''}
            onChange={handleChange}
          />
        </Card>
      </Section>

      <Section>
        <SectionTitle>
          <i className="bi bi-chat-dots"></i>
          其他补充
        </SectionTitle>
        <Card>
          <TextArea
            placeholder="还有什么想要补充的内容..."
            name="additionalInfo"
            value={formData.additionalInfo || ''}
            onChange={handleChange}
          />
        </Card>
      </Section>
    </Container>
  );
};

export default OtherInfo; 