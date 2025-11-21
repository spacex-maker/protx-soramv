import React from 'react';
import { Typography, Row, Col, Space } from 'antd';
import {
  VideoCameraAddOutlined,
  RocketOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { ContentWrapper, Section } from '../styles';

const { Title, Text } = Typography;

const SecuritySection = () => {
  return (
    <Section style={{ background: 'var(--ant-color-bg-container-disabled)' }}>
      <ContentWrapper>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <Title level={2}>技术优势</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space>
                <VideoCameraAddOutlined style={{ fontSize: '24px', color: 'var(--ant-color-primary)' }} />
                <div>
                  <Title level={4} style={{ marginBottom: '8px' }}>高质量视频生成</Title>
                  <Text type="secondary">基于 Sora 先进 AI 技术，生成电影级质量的视频内容</Text>
                </div>
              </Space>
              <Space>
                <RocketOutlined style={{ fontSize: '24px', color: 'var(--ant-color-primary)' }} />
                <div>
                  <Title level={4} style={{ marginBottom: '8px' }}>快速生成速度</Title>
                  <Text type="secondary">优化的 AI 模型和强大的计算资源，快速完成视频生成</Text>
                </div>
              </Space>
              <Space>
                <StarOutlined style={{ fontSize: '24px', color: 'var(--ant-color-primary)' }} />
                <div>
                  <Title level={4} style={{ marginBottom: '8px' }}>多种 AI 模型</Title>
                  <Text type="secondary">提供多种 AI 模型选择，满足不同创作需求和风格偏好</Text>
                </div>
              </Space>
            </Space>
          </Col>
          <Col xs={24} lg={12}>
            <img 
              src="/images/design-illustration.svg" 
              alt="AI Technology" 
              style={{ width: '100%', maxWidth: '500px' }}
            />
          </Col>
        </Row>
      </ContentWrapper>
    </Section>
  );
};

export default SecuritySection; 