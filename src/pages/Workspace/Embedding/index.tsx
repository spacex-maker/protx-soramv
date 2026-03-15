import React from 'react';
import { Tabs, Typography, Space, theme } from 'antd';
import {
  RobotOutlined, ThunderboltOutlined, KeyOutlined,
  BookOutlined, BarChartOutlined, CodeOutlined,
} from '@ant-design/icons';
import ModelsTab  from './ModelsTab';
import TestTab    from './TestTab';
import ApiKeyTab  from './ApiKeyTab';
import DocsTab    from './DocsTab';
import BillingTab from './BillingTab';

const { Title, Text } = Typography;

const TAB_ITEMS = [
  {
    key: 'models',
    label: <span><RobotOutlined style={{ marginRight: 4 }} />向量模型</span>,
    children: <ModelsTab />,
  },
  {
    key: 'test',
    label: <span><ThunderboltOutlined style={{ marginRight: 4 }} />在线测试</span>,
    children: <TestTab />,
  },
  {
    key: 'apikey',
    label: <span><KeyOutlined style={{ marginRight: 4 }} />API Key</span>,
    children: <ApiKeyTab />,
  },
  {
    key: 'docs',
    label: <span><BookOutlined style={{ marginRight: 4 }} />API 文档</span>,
    children: <DocsTab />,
  },
  {
    key: 'billing',
    label: <span><BarChartOutlined style={{ marginRight: 4 }} />费用统计</span>,
    children: <BillingTab />,
  },
];

const EmbeddingPage: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div style={{ padding: 24, minHeight: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 20 }}>
        <Space align="center">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${token.colorPrimary}, #8b5cf6)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CodeOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>向量模型 API</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              私有化部署 · Ollama 驱动 · 按量计费
            </Text>
          </div>
        </Space>
      </div>

      <Tabs
        items={TAB_ITEMS}
        defaultActiveKey="models"
        style={{
          background: token.colorBgContainer,
          borderRadius: 10,
          padding: '0 16px 16px',
          boxShadow: token.boxShadowTertiary,
        }}
      />
    </div>
  );
};

export default EmbeddingPage;
