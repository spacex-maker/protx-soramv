/**
 * 工作台 - 生成频道
 * 复用社区频道模块内容，仅做工作台内展示入口
 */
import React from 'react';
import { Typography, theme, Button, Space } from 'antd';
import { CompassOutlined, HomeOutlined, BulbOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ExploreChannels from '../../Community/channels/ExploreChannels';

const { Title, Paragraph, Text } = Typography;

const Channels = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: 24,
        overflow: 'auto',
        height: '100%',
        boxSizing: 'border-box',
        background: token.colorBgContainer,
      }}
    >
      {/* 页面标题区 */}
      <div
        style={{
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CompassOutlined style={{ color: token.colorPrimary }} />
          生成频道
        </Title>
        <Paragraph
          style={{
            margin: '8px 0 0',
            fontSize: 15,
            color: token.colorTextSecondary,
            maxWidth: 560,
          }}
        >
          发现社区中的精彩频道，参与讨论、分享创作，与同好一起玩转 AI 生成
        </Paragraph>
      </div>

      {/* 频道网格（复用社区模块） */}
      <div style={{ marginBottom: 8, fontSize: 13, color: token.colorTextSecondary }}>
        选择频道进入
      </div>
      <ExploreChannels />

      {/* 底部板块：说明 + 快捷入口 */}
      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <Text style={{ fontSize: 13, color: token.colorTextSecondary }}>
            <BulbOutlined style={{ marginRight: 6, color: token.colorWarning }} />
            点击卡片进入对应频道，可发帖、评论、收藏，与创作者互动
          </Text>
          <Space size="middle">
            <Button
              type="link"
              size="small"
              icon={<HomeOutlined />}
              onClick={() => navigate('/community')}
              style={{ padding: 0, fontSize: 13 }}
            >
              前往社区首页
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Channels;
