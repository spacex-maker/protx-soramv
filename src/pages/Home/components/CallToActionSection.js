import React from 'react';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ContentWrapper, Section, StyledButton } from '../styles';

const { Title, Paragraph } = Typography;

const CallToActionSection = () => {
  const navigate = useNavigate();

  return (
    <Section>
      <ContentWrapper style={{ textAlign: 'center' }}>
        <Title level={2}>开始创作您的视频</Title>
        <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
          立即注册，使用 AI 技术将您的创意转化为惊艳的视频作品
        </Paragraph>
        <StyledButton type="primary" size="large" onClick={() => navigate('/signup')}>
          免费开始创作
        </StyledButton>
      </ContentWrapper>
    </Section>
  );
};

export default CallToActionSection; 