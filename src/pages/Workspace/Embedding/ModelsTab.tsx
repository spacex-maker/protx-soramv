import React, { useState, useEffect } from 'react';
import {
  Card, Tag, Space, Typography, Spin, Badge, Row, Col, theme, Empty, message,
} from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { embeddingApi } from '../../../api/embedding';

const { Title, Text, Paragraph } = Typography;

const ModelsTab: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  useEffect(() => {
    setLoading(true);
    embeddingApi.listModels().then((res) => {
      if (res.success) setModels(res.data || []);
      else message.error(res.message);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>
        <RobotOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
        已部署向量模型
      </Title>
      <Paragraph type="secondary">
        以下为私有化部署在 Ollama 上的向量模型，按 <b>1k tokens</b> 计费，从您的 Token 余额中扣除。
      </Paragraph>
      <Spin spinning={loading}>
        {models.length === 0 && !loading ? (
          <Empty description="暂无可用模型" />
        ) : (
          models.map((m) => (
            <Card
              key={m.id}
              style={{ marginBottom: 12, borderRadius: 8 }}
              bodyStyle={{ padding: '16px 20px' }}
            >
              <Row gutter={24} align="middle">
                <Col flex="auto">
                  <Space direction="vertical" size={2}>
                    <Space>
                      <Text strong style={{ fontSize: 15 }}>{m.modelName}</Text>
                      <Tag color="blue" style={{ fontFamily: 'monospace' }}>{m.modelCode}</Tag>
                      <Badge status="success" text="运行中" />
                    </Space>
                    <Text type="secondary" style={{ fontSize: 13 }}>{m.description}</Text>
                  </Space>
                </Col>
                <Col>
                  <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>上下文</Text>
                    <Text strong>{m.contextLength?.toLocaleString()} tokens</Text>
                  </Space>
                </Col>
                <Col>
                  <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>单价</Text>
                    <Text strong style={{ color: token.colorPrimary }}>
                      ¥{m.inputPrice} / {m.unit}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))
        )}
      </Spin>
    </div>
  );
};

export default ModelsTab;
