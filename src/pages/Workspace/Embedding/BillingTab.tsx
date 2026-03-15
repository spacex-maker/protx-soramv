import React, { useState, useEffect } from 'react';
import {
  Card, Table, Typography, Spin, Statistic, Row, Col, Badge, theme,
} from 'antd';
import { BarChartOutlined, KeyOutlined, DollarOutlined } from '@ant-design/icons';
import { embeddingApi } from '../../../api/embedding';

const { Title, Text } = Typography;

const BillingTab: React.FC = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  useEffect(() => {
    setLoading(true);
    embeddingApi.listApiKeys().then((res) => {
      if (res.success) setKeys(res.data || []);
      setLoading(false);
    });
  }, []);

  const totalTokens = keys.reduce((s, k) => s + (k.totalTokensUsed || 0), 0);
  const totalCost   = keys.reduce((s, k) => s + Number(k.totalCost || 0), 0);

  const columns = [
    {
      title: 'Key 名称',
      dataIndex: 'keyName',
      key: 'keyName',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: boolean) =>
        v ? <Badge status="success" text="启用" /> : <Badge status="default" text="停用" />,
    },
    {
      title: '累计 Token',
      dataIndex: 'totalTokensUsed',
      key: 'totalTokensUsed',
      render: (v: number) => (v || 0).toLocaleString(),
    },
    {
      title: '累计费用',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (v: number) => `¥${Number(v || 0).toFixed(4)}`,
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedTime',
      key: 'lastUsedTime',
      render: (v: string) => v || '从未使用',
    },
  ];

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>
        <BarChartOutlined style={{ marginRight: 8, color: token.colorWarning }} />
        费用统计
      </Title>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 8, textAlign: 'center' }}>
            <Statistic title="API Key 总数" value={keys.length} prefix={<KeyOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 8, textAlign: 'center' }}>
            <Statistic title="累计消耗 Tokens" value={totalTokens} suffix="tokens" />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 8, textAlign: 'center' }}>
            <Statistic
              title="累计 API Key 消费"
              value={totalCost.toFixed(4)}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          dataSource={keys}
          columns={columns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无数据，创建 API Key 后开始统计' }}
        />
      </Spin>
    </div>
  );
};

export default BillingTab;
