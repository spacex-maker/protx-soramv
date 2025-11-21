import React from 'react';
import { Typography, Row, Col, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ContentWrapper, Section, PriceCard, StyledButton } from '../styles';
import GradientButton from 'components/buttons/GradientButton';

const { Title, Text } = Typography;

const plans = [
  {
    title: '免费版',
    price: '0',
    credits: '5次/月',
    features: [
      '每月 5 次视频生成',
      '基础 AI 模型',
      '标准视频质量（720p）',
      '基础技术支持',
      '作品保存 30 天'
    ]
  },
  {
    title: '专业版',
    price: '29',
    credits: '100次/月',
    popular: true,
    features: [
      '每月 100 次视频生成',
      '所有 AI 模型',
      '高清视频质量（1080p）',
      '优先技术支持',
      '作品永久保存',
      '批量生成功能'
    ]
  },
  {
    title: '企业版',
    price: '99',
    credits: '无限',
    features: [
      '无限次视频生成',
      '所有 AI 模型 + 定制模型',
      '超高清视频质量（4K）',
      '24/7 专属支持',
      'API 接口访问',
      '团队协作功能',
      '自定义水印和品牌'
    ]
  }
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <Section>
      <ContentWrapper>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          价格方案
        </Title>
        <Row gutter={[24, 24]}>
          {plans.map((plan, index) => (
            <Col xs={24} sm={8} key={index}>
              <PriceCard popular={plan.popular}>
                <Title level={3}>{plan.title}</Title>
                <div className="price">
                  <span className="currency">¥</span>
                  {plan.price}
                  <span className="period">/月</span>
                </div>
                {plan.credits && (
                  <Text type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '14px' }}>
                    {plan.credits}
                  </Text>
                )}
                <List
                  dataSource={plan.features}
                  renderItem={item => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
                {plan.title === '企业版' ? (
                  <GradientButton
                    size="large"
                    style={{ marginTop: '24px', width: '100%' }}
                    onClick={() => navigate('/signup')}
                  >
                    开始使用
                  </GradientButton>
                ) : (
                  <StyledButton
                    type={plan.popular ? 'primary' : 'default'}
                    size="large"
                    style={{ marginTop: '24px', width: '100%' }}
                    onClick={() => navigate('/signup')}
                  >
                    开始使用
                  </StyledButton>
                )}
              </PriceCard>
            </Col>
          ))}
        </Row>
      </ContentWrapper>
    </Section>
  );
};

export default PricingSection; 