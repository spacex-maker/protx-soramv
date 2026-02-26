import React, { useState, useEffect } from 'react';
import {
  Card, Button, Typography, Spin, Statistic, Row, Col, Select,
  Form, Input, Divider, theme, message,
} from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { embeddingApi } from '../../../api/embedding';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TestTab: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [modelCode, setModelCode] = useState('bge-m3');
  const [inputText, setInputText] = useState('你好，世界！\nHello, World!');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  useEffect(() => {
    embeddingApi.listModels().then((res) => {
      if (res.success) setModels(res.data || []);
    });
  }, []);

  const handleGenerate = async () => {
    const lines = inputText.split('\n').map((s) => s.trim()).filter(Boolean);
    if (lines.length === 0) {
      message.warning('请输入至少一行文本');
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await embeddingApi.generateEmbedding({ modelCode, input: lines });
    setLoading(false);
    if (res.success) {
      setResult(res.data);
      message.success('向量生成成功');
    } else {
      message.error(res.message);
    }
  };

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>
        <ThunderboltOutlined style={{ marginRight: 8, color: token.colorWarning }} />
        在线测试
      </Title>
      <Paragraph type="secondary">
        在此测试向量生成效果，每次调用会从您的 Token 余额中扣除实际费用。
      </Paragraph>

      <Card style={{ borderRadius: 8, marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="选择模型">
            <Select
              value={modelCode}
              onChange={setModelCode}
              style={{ width: '100%' }}
              options={models.map((m) => ({
                label: `${m.modelName} (${m.modelCode})`,
                value: m.modelCode,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="输入文本（每行一条，最多 64 条）"
            extra="换行分隔多条文本"
          >
            <TextArea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="每行输入一条文本..."
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleGenerate}
              loading={loading}
            >
              生成向量
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {result && (
        <Card style={{ borderRadius: 8 }} title="生成结果">
          <Row gutter={24} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic title="消耗 Tokens" value={result.totalTokens} />
            </Col>
            <Col span={8}>
              <Statistic title="本次费用" value={result.cost} prefix="¥" precision={6} />
            </Col>
            <Col span={8}>
              <Statistic title="耗时" value={result.durationMs} suffix="ms" />
            </Col>
          </Row>
          <Divider style={{ margin: '12px 0' }} />
          {result.embeddings?.map((vec: number[], idx: number) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                第 {idx + 1} 条向量（维度 {vec.length}）：
              </Text>
              <div
                style={{
                  background: token.colorFillQuaternary,
                  borderRadius: 4,
                  padding: '6px 10px',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  maxHeight: 80,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                [{vec.slice(0, 8).join(', ')}... ]
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default TestTab;
