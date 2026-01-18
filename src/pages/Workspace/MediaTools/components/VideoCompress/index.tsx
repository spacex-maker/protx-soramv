import React from 'react';
import { Typography } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import BatchVideoCompress from './BatchVideoCompress';

const { Title, Text } = Typography;

// --- 动画 ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- 样式组件 ---
const PageContainer = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
  text-align: center;
`;

// --- 主组件 ---
const VideoCompress: React.FC = () => {
  return (
    <PageContainer>
      <Header>
        <Title level={2} style={{ marginBottom: 8 }}>
          <VideoCameraOutlined style={{ marginRight: 12, color: '#8338ec' }} />
          <FormattedMessage id="videoCompress.title" defaultMessage="专业视频压缩工具" />
        </Title>
        <Text type="secondary">
          <FormattedMessage id="videoCompress.subtitle" defaultMessage="浏览器端压缩，保护隐私" />
        </Text>
      </Header>

      <BatchVideoCompress />
    </PageContainer>
  );
};

export default VideoCompress;

