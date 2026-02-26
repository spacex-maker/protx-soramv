import React from 'react';
import { Typography, Collapse, Table, Tag, theme } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const DocsTab: React.FC = () => {
  const { token } = theme.useToken();

  const codeStyle: React.CSSProperties = {
    background: token.colorFillQuaternary,
    borderRadius: 6,
    padding: '12px 16px',
    fontFamily: 'monospace',
    fontSize: 13,
    overflowX: 'auto',
    whiteSpace: 'pre',
    display: 'block',
    marginTop: 8,
  };

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>
        <BookOutlined style={{ marginRight: 8, color: token.colorSuccess }} />
        API 调用文档
      </Title>

      <Collapse defaultActiveKey={['1', '2', '3']} style={{ borderRadius: 8 }}>
        <Panel header="快速开始" key="1">
          <Paragraph>
            向量模型 API 基于 Ollama 标准协议，私有化部署在内部服务器。您有两种鉴权方式：
          </Paragraph>
          <ul>
            <li><Text strong>JWT Token</Text>：登录后通过网页端调用（适合测试）</li>
            <li><Text strong>API Key</Text>：在"API Key 管理"中创建，适合服务端程序调用</li>
          </ul>
        </Panel>

        <Panel header="POST /productx/embedding/generate（JWT 鉴权）" key="2">
          <Paragraph>需要在 Header 中携带登录 Token。</Paragraph>
          <Text strong>请求体：</Text>
          <code style={codeStyle}>{`POST /productx/embedding/generate
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "modelCode": "bge-m3",
  "input": [
    "第一段文本",
    "第二段文本"
  ]
}`}</code>
          <Text strong style={{ marginTop: 12, display: 'block' }}>响应体：</Text>
          <code style={codeStyle}>{`{
  "success": true,
  "message": "向量生成成功",
  "data": {
    "model": "bge-m3",
    "embeddings": [[0.012, -0.034, ...], [...]],
    "totalTokens": 18,
    "cost": 0.000180,
    "durationMs": 342
  }
}`}</code>
        </Panel>

        <Panel header="POST /productx/embedding/v1/embeddings（API Key 鉴权）" key="3">
          <Paragraph>
            无需登录，在 <Text code>Authorization</Text> 请求头中传入 API Key，格式：
            <Text code>Bearer emb_sk_xxxxx</Text>
          </Paragraph>
          <Text strong>请求体：</Text>
          <code style={codeStyle}>{`POST /productx/embedding/v1/embeddings
Authorization: Bearer emb_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "modelCode": "nomic-embed-text",
  "input": ["搜索关键词", "文档内容"]
}`}</code>
          <Text strong style={{ marginTop: 12, display: 'block' }}>Python 调用示例：</Text>
          <code style={codeStyle}>{`import requests

API_KEY = "emb_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
BASE_URL = "https://app.anakkix.cn"

resp = requests.post(
    f"{BASE_URL}/productx/embedding/v1/embeddings",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "modelCode": "bge-m3",
        "input": ["你好世界", "Hello World"]
    }
)
data = resp.json()
embeddings = data["data"]["embeddings"]
print(f"向量维度：{len(embeddings[0])}，消耗：{data['data']['totalTokens']} tokens")`}</code>
        </Panel>

        <Panel header="GET /productx/embedding/models（获取模型列表）" key="4">
          <Paragraph>无需鉴权，返回所有已启用的向量模型。</Paragraph>
          <code style={codeStyle}>{`GET /productx/embedding/models

响应：
{
  "success": true,
  "data": [
    {
      "modelCode": "bge-m3",
      "modelName": "BGE-M3 多语种全能向量",
      "contextLength": 8192,
      "inputPrice": 0.01,
      "unit": "1k tokens"
    },
    ...
  ]
}`}</code>
        </Panel>

        <Panel header="支持的模型" key="5">
          <Table
            size="small"
            pagination={false}
            dataSource={[
              { key: 'bge-m3',  code: 'bge-m3',            name: 'BGE-M3',        ctx: '8192', price: '¥0.01',  note: '多语种，中文最优' },
              { key: 'nomic',   code: 'nomic-embed-text',   name: 'Nomic v1.5',    ctx: '8192', price: '¥0.01',  note: '超长文本，RAG 专用' },
              { key: 'minilm',  code: 'all-minilm',         name: 'All-MiniLM L6', ctx: '512',  price: '¥0.005', note: '极速，短文本匹配' },
              { key: 'mxbai',   code: 'mxbai-embed-large',  name: 'MXBAI Large',   ctx: '512',  price: '¥0.01',  note: '英文最优' },
            ]}
            columns={[
              { title: 'modelCode', dataIndex: 'code',  render: (v: string) => <Tag color="blue">{v}</Tag> },
              { title: '模型',      dataIndex: 'name' },
              { title: '上下文',    dataIndex: 'ctx',   render: (v: string) => `${v} tokens` },
              { title: '单价',      dataIndex: 'price', render: (v: string) => `${v} / 1k tokens` },
              { title: '适用场景',  dataIndex: 'note' },
            ]}
          />
        </Panel>
      </Collapse>
    </div>
  );
};

export default DocsTab;
