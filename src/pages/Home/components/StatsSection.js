import React from 'react';
import { Row, Col, Statistic } from 'antd';
import styled from 'styled-components';
import { ContentWrapper, Section } from '../styles';

const StatsContainer = styled(Section)`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(180deg, #1a365d 0%, #2d3748 100%)' 
    : 'linear-gradient(180deg, #ebf8ff 0%, #e6fffa 100%)'};
`;

const StatsSection = () => {
  return (
    <StatsContainer>
      <ContentWrapper>
        <Row gutter={[48, 24]} justify="center">
          <Col xs={12} sm={6}>
            <Statistic title="注册用户" value={50000} suffix="+" />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="生成视频数" value={200000} suffix="+" />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="AI 模型数" value={10} suffix="+" />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="每日生成量" value={5000} suffix="+" />
          </Col>
        </Row>
      </ContentWrapper>
    </StatsContainer>
  );
};

export default StatsSection; 