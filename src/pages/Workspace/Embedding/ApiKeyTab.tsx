import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Tag, Space, Typography, Tooltip, Modal,
  Form, Input, message, Spin, Badge, Alert, theme,
} from 'antd';
import {
  KeyOutlined, PlusOutlined, CopyOutlined, DeleteOutlined,
  StopOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { embeddingApi } from '../../../api/embedding';

const { Title, Text } = Typography;

const ApiKeyTab: React.FC = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [form] = Form.useForm();
  const { token } = theme.useToken();

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    const res = await embeddingApi.listApiKeys();
    if (res.success) setKeys(res.data || []);
    else message.error(res.message);
    setLoading(false);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    const res = await embeddingApi.createApiKey(values);
    if (res.success) {
      message.success('API Key 已创建');
      setNewKey(res.data?.apiKey);
      form.resetFields();
      setCreateVisible(false);
      fetchKeys();
    } else {
      message.error(res.message);
    }
  };

  const handleRevoke = (id: number) => {
    Modal.confirm({
      title: '确认停用',
      content: '停用后该 Key 将无法使用。',
      okType: 'danger',
      onOk: async () => {
        const res = await embeddingApi.revokeApiKey(id);
        if (res.success) { message.success('已停用'); fetchKeys(); }
        else message.error(res.message);
      },
    });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，绑定该 Key 的应用将立即失效。',
      okType: 'danger',
      onOk: async () => {
        const res = await embeddingApi.deleteApiKey(id);
        if (res.success) { message.success('已删除'); fetchKeys(); }
        else message.error(res.message);
      },
    });
  };

  const columns = [
    {
      title: 'Key 名称',
      dataIndex: 'keyName',
      key: 'keyName',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'API Key（已脱敏）',
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{v}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: boolean) =>
        v ? <Badge status="success" text="启用" /> : <Badge status="error" text="停用" />,
    },
    {
      title: '累计 Token',
      dataIndex: 'totalTokensUsed',
      key: 'totalTokensUsed',
      render: (v: number) => <Text>{(v || 0).toLocaleString()}</Text>,
    },
    {
      title: '累计费用',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (v: number) => <Text>¥{Number(v || 0).toFixed(4)}</Text>,
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedTime',
      key: 'lastUsedTime',
      render: (v: string) =>
        v ? <Text type="secondary">{v}</Text> : <Text type="secondary">从未使用</Text>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (v: string) => <Text type="secondary">{v || '-'}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {record.status && (
            <Tooltip title="停用">
              <Button size="small" icon={<StopOutlined />} danger onClick={() => handleRevoke(record.id)} />
            </Tooltip>
          )}
          <Tooltip title="删除">
            <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            <KeyOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
            API Key 管理
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            生成 API Key 后可在服务端直接调用向量接口，无需用户登录。
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchKeys} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
            创建 API Key
          </Button>
        </Space>
      </div>

      {newKey && (
        <Alert
          type="success"
          style={{ marginBottom: 16, borderRadius: 8 }}
          message="API Key 创建成功！请立即复制保存，此后不再显示完整 Key。"
          description={
            <Space style={{ marginTop: 8 }}>
              <Text
                style={{
                  fontFamily: 'monospace',
                  fontSize: 14,
                  background: token.colorFillSecondary,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {newKey}
              </Text>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => { navigator.clipboard.writeText(newKey); message.success('已复制'); }}
              >
                复制
              </Button>
              <Button size="small" onClick={() => setNewKey(null)}>知道了</Button>
            </Space>
          }
          closable
          onClose={() => setNewKey(null)}
        />
      )}

      <Spin spinning={loading}>
        <Table
          dataSource={keys}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
          locale={{ emptyText: '暂无 API Key，点击右上角创建' }}
        />
      </Spin>

      <Modal
        title="创建 API Key"
        open={createVisible}
        onOk={handleCreate}
        onCancel={() => { setCreateVisible(false); form.resetFields(); }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Key 名称"
            name="keyName"
            rules={[{ required: true, message: '请输入 Key 名称' }]}
          >
            <Input placeholder="例如：我的 RAG 应用" maxLength={100} />
          </Form.Item>
          <Form.Item label="备注（可选）" name="remark">
            <Input.TextArea rows={2} placeholder="说明该 Key 的用途" maxLength={255} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiKeyTab;
