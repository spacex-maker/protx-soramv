import React from 'react';
import { Modal, Typography, Space, Divider, Tabs, List } from 'antd';
import {
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AboutModal = ({ open, onClose }) => {
  const items = [
    {
      key: 'product',
      label: (
        <span>
          <InfoCircleOutlined />
          <span style={{ marginLeft: 8 }}>产品介绍</span>
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
          <Title level={4}>AI2OBJ AI 生成综合平台</Title>
          <Paragraph>
            AI2OBJ 是一款综合 AI 创作平台，提供文生图、文生视频、图生图、图生视频、提示词商城与媒体工具等能力。
            我们致力于提供安全、便捷的 AI 创作服务，让创意从想法到作品一步到位。
          </Paragraph>
          <List
            size="small"
            bordered
            dataSource={[
              '文生图 / 文生视频',
              '图生图 / 图生视频',
              '提示词商城与媒体工具',
              '多模型、高质量输出'
            ]}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Space>
      )
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyCertificateOutlined />
          <span style={{ marginLeft: 8 }}>安全特性</span>
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
          <Title level={4}>技术优势</Title>
          <List
            size="small"
            bordered
            dataSource={[
              {
                title: '综合 AI 能力',
                description: '文生图、文生视频、图生图、图生视频，一站式创作'
              },
              {
                title: '多种生成模式',
                description: '支持文本/图片输入，多种模型与分辨率可选'
              },
              {
                title: '快速生成',
                description: '优化的 AI 模型与算力，快速完成图片与视频生成'
              },
              {
                title: '高质量输出',
                description: '支持多种分辨率，最高可达 4K 超高清画质'
              }
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </Space>
      )
    },
    {
      key: 'team',
      label: (
        <span>
          <TeamOutlined />
          <span style={{ marginLeft: 8 }}>关于我们</span>
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
          <Title level={4}>团队介绍</Title>
          <Paragraph>
            我们是一支充满激情的技术团队，致力于为用户提供最好的 AI 视频生成解决方案。
          </Paragraph>
          <List
            size="small"
            bordered
            dataSource={[
              '专业的技术支持团队',
              '7×24小时客户服务',
              '持续的产品创新',
              '用户至上的服务理念'
            ]}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Space>
      )
    },
    {
      key: 'version',
      label: (
        <span>
          <BookOutlined />
          <span style={{ marginLeft: 8 }}>版本信息</span>
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
          <Title level={4}>系统信息</Title>
          <List
            size="small"
            bordered
            dataSource={[
              { label: '当前版本', value: '1.0.0' },
              { label: '发布日期', value: '2024年3月' },
              { label: '技术支持', value: 'support@soramv.com' },
              { label: '官方网站', value: 'www.soramv.com' }
            ]}
            renderItem={(item) => (
              <List.Item>
                <Text strong>{item.label}：</Text> {item.value}
              </List.Item>
            )}
          />
        </Space>
      )
    }
  ];

  return (
    <Modal
      title="关于 AI2OBJ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Tabs
        defaultActiveKey="product"
        items={items}
        size="large"
        style={{ marginTop: -16 }}
      />
    </Modal>
  );
};

export default AboutModal; 