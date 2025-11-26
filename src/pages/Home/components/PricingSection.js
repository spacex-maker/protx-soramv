import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Row, Col, List } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Section, ContentWrapper, SectionTitle, BentoCard, StyledButton } from '../styles';

const PricingCard = styled(BentoCard)`
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: ${props => props.$popular ? '2px solid #2997ff' : '1px solid rgba(255,255,255,0.1)'};
  transform: ${props => props.$popular ? 'scale(1.05)' : 'scale(1)'};
  z-index: ${props => props.$popular ? '2' : '1'};
  
  @media (max-width: 768px) {
    transform: scale(1);
    margin-bottom: 24px;
  }

  .price {
    font-size: 56px;
    font-weight: 800;
    margin: 24px 0;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
    
    span { font-size: 18px; font-weight: 500; color: #86868b; }
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    color: ${props => props.$popular ? '#2997ff' : 'inherit'};
  }
`;

const PricingSection = () => {
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();

  const plans = [
    { title: '基础版', price: '0', features: ['每月 5 次生成', '720P 分辨率', '标准队列'] },
    { title: '专业版', price: '29', popular: true, features: ['每月 100 次生成', '1080P 高清', '优先极速模式', '商业授权'] },
    { title: '团队版', price: '99', features: ['无限量生成', '4K 超清画质', '专属客服支持', 'API 访问权限'] }
  ];

  return (
    <Section>
      <ContentWrapper>
        <SectionTitle theme={theme}>选择适合您的方案。</SectionTitle>
        
        <Row gutter={[24, 24]} align="middle" style={{ marginTop: 60 }}>
          {plans.map((plan, i) => (
            <Col xs={24} md={8} key={i}>
              <PricingCard theme={theme} $popular={plan.popular}>
                <div className="title">{plan.title}</div>
                <div className="price">¥{plan.price}<span>/月</span></div>
                <List
                  dataSource={plan.features}
                  renderItem={item => (
                    <List.Item style={{ border: 'none', justifyContent: 'center', padding: '8px 0' }}>
                      <CheckCircleFilled style={{ color: '#2997ff', marginRight: 8 }} />
                      <span style={{ color: theme.mode === 'dark' ? '#f5f5f7' : '#1d1d1f' }}>{item}</span>
                    </List.Item>
                  )}
                  style={{ marginBottom: 32, width: '100%' }}
                />
                <StyledButton 
                  type={plan.popular ? "primary" : "default"} 
                  size="large" 
                  block
                  onClick={() => navigate('/signup')}
                >
                  {plan.popular ? '立即订阅' : '选择此方案'}
                </StyledButton>
              </PricingCard>
            </Col>
          ))}
        </Row>
      </ContentWrapper>
    </Section>
  );
};

export default PricingSection;