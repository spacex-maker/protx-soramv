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
          <Title level={4}>Sora MV AI 视频生成平台</Title>
          <Paragraph>
            Sora MV 是一款基于 Sora 技术的 AI 视频生成平台，为用户提供文本生成视频、图片生成视频等功能。
            我们致力于提供高质量的 AI 视频生成服务，让创作更加便捷。
          </Paragraph>
          <List
            size="small"
            bordered
            dataSource={[
              'AI 视频生成',
              '多种 AI 模型选择',
              '高质量视频输出',
              '快速生成速度'
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
                title: 'Sora 技术',
                description: '基于先进的 Sora AI 模型，生成高质量视频内容'
              },
              {
                title: '多种生成模式',
                description: '支持文本生成视频、图片生成视频等多种模式'
              },
              {
                title: '快速生成',
                description: '优化的 AI 模型和强大的计算资源，快速完成视频生成'
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
      title="关于 Sora MV"
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