import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Switch, Space, Tabs, Card, Tag, Button, Tooltip, Empty } from 'antd';
import { LikeOutlined, LikeFilled, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import instance from 'api/axios';
import axios from 'axios';
import dayjs from 'dayjs';
import styled from 'styled-components';

const { TextArea } = Input;
const { Option } = Select;

// Styled Components
const RequirementCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  .ant-card-body {
    padding: 16px;
  }

  .requirement-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--ant-color-text);
  }

  .requirement-description {
    color: var(--ant-color-text-secondary);
    margin-bottom: 16px;
  }

  .requirement-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--ant-color-text-secondary);
    font-size: 13px;
  }

  .requirement-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .support-button {
    transition: all 0.3s;
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const FiltersContainer = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: var(--ant-color-bg-container);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

// 状态对应的标签颜色和文本
const statusConfig = {
  PENDING: { color: 'gold', text: '待处理' },
  PROCESSING: { color: 'blue', text: '处理中' },
  COMPLETED: { color: 'green', text: '已完成' },
  REJECTED: { color: 'red', text: '已拒绝' }
};

// 优先级对应的标签颜色和文本
const priorityConfig = {
  URGENT: { color: 'red', text: '紧急' },
  HIGH: { color: 'orange', text: '高' },
  MEDIUM: { color: 'blue', text: '中' },
  LOW: { color: 'green', text: '低' }
};

// 需求类别对应的文本
const categoryConfig = {
  FEATURE: '新功能',
  IMPROVEMENT: '功能改进',
  BUG: '问题修复',
  OTHER: '其他'
};

const FeedbackModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const [requirementsList, setRequirementsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: undefined,
    category: undefined,
    sortField: 'supportCount'
  });

  // 获取需求列表
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await instance.get('/productx/user-requirements/list', {
        params: filters
      });
      setRequirementsList(response.data.data.records);
    } catch (error) {
      console.error('获取需求列表失败:', error);
      message.error('获取需求列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchRequirements();
    }
  }, [activeTab, filters]);

  // 添加支持功能
  const handleSupport = async (id) => {
    try {
      await instance.post(`/productx/user-requirements/${id}/support`);
      message.success('支持成功');
      // 刷新列表
      fetchRequirements();
    } catch (error) {
      console.error('支持失败:', error);
      message.error('支持失败: ' + (error.message || '未知错误'));
    }
  };

  // 修改需求列表展示部分
  const RequirementsList = () => {
    if (!requirementsList.length) {
      return <Empty description="暂无需求" />;
    }

    return requirementsList.map(requirement => (
      <RequirementCard key={requirement.id}>
        <div className="requirement-title">{requirement.title}</div>
        
        <div className="requirement-tags">
          <Tag color={statusConfig[requirement.status]?.color}>
            {statusConfig[requirement.status]?.text}
          </Tag>
          <Tag color={priorityConfig[requirement.priority]?.color}>
            {priorityConfig[requirement.priority]?.text}
          </Tag>
          <Tag>{categoryConfig[requirement.category]}</Tag>
        </div>
        
        <div className="requirement-description">
          {requirement.description}
        </div>
        
        <div className="requirement-meta">
          <Space size={16}>
            <span>
              <UserOutlined /> {requirement.userId ? '实名用户' : '匿名用户'}
            </span>
            <span>
              <CalendarOutlined /> {dayjs(requirement.createTime).format('YYYY-MM-DD HH:mm')}
            </span>
            {requirement.expectedCompletionDate && (
              <Tooltip title="期望完成日期">
                <span>
                  <CalendarOutlined /> {requirement.expectedCompletionDate.join('-')}
                </span>
              </Tooltip>
            )}
          </Space>
          
          <Button
            type="text"
            icon={<LikeOutlined />}
            className="support-button"
            onClick={() => handleSupport(requirement.id)}
          >
            {requirement.supportCount} 支持
          </Button>
        </div>
      </RequirementCard>
    ));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // 转换日期格式
      const formattedDate = values.expectedCompletionDate?.format('YYYY-MM-DD');

      const requestData = {
        title: values.title,
        description: values.description,
        priority: values.priority || 'MEDIUM', // 设置默认值为 MEDIUM
        category: values.category,
        expectedCompletionDate: formattedDate
      };

      if (isAnonymous) {
        // 匿名提交使用 axios 但带上相同的 baseURL
        await axios({
          method: 'post',
          url: '/base/productx/user/user-requirements/create-anonymous',
          baseURL: instance.defaults.baseURL,
          data: requestData,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        // 非匿名提交使用带 token 的 instance
        await instance.post('/productx/user-requirements/create', requestData);
      }

      message.success('需求提交成功！');
      form.resetFields();
      onClose();
    } catch (error) {
      if (error.name !== 'ValidationError') {
        console.error('提交需求失败:', error);
        message.error('提交需求失败: ' + (error.message || '未知错误'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const items = [
    {
      key: 'submit',
      label: '提交需求',
      children: (
        <Form
          form={form}
          layout="vertical"
          initialValues={{ priority: 'MEDIUM' }}
        >
          <Space style={{ marginBottom: 16 }}>
            <Switch 
              checked={isAnonymous}
              onChange={setIsAnonymous}
            />
            <span>匿名提交{isAnonymous ? ' (无需登录)' : ''}</span>
          </Space>

          <Form.Item
            name="title"
            label="需求标题"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="请输入需求标题" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="description"
            label="需求描述"
            rules={[{ required: true, message: '请输入需求描述' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述您的需求..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            initialValue="MEDIUM"
          >
            <Select placeholder="请选择优先级">
              <Option value="URGENT">紧急</Option>
              <Option value="HIGH">高</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="LOW">低</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="需求类别"
          >
            <Select placeholder="请选择需求类别">
              <Option value="FEATURE">新功能</Option>
              <Option value="IMPROVEMENT">功能改进</Option>
              <Option value="BUG">问题修复</Option>
              <Option value="OTHER">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expectedCompletionDate"
            label="期望完成日期"
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="请选择期望完成日期"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'list',
      label: '需求列表',
      children: (
        <div>
          <FiltersContainer>
            <Space size={16}>
              <Select
                placeholder="状态筛选"
                allowClear
                style={{ width: 120 }}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                {Object.entries(statusConfig).map(([key, { text }]) => (
                  <Option key={key} value={key}>{text}</Option>
                ))}
              </Select>
              <Select
                placeholder="类别筛选"
                allowClear
                style={{ width: 120 }}
                onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                {Object.entries(categoryConfig).map(([key, text]) => (
                  <Option key={key} value={key}>{text}</Option>
                ))}
              </Select>
              <Select
                placeholder="排序方式"
                style={{ width: 120 }}
                defaultValue="supportCount"
                onChange={(value) => setFilters(prev => ({ ...prev, sortField: value }))}
              >
                <Option value="supportCount">按支持数</Option>
                <Option value="createTime">按创建时间</Option>
              </Select>
            </Space>
          </FiltersContainer>
          
          <RequirementsList />
        </div>
      )
    }
  ];

  return (
    <Modal
      title="需求管理"
      open={open}
      onCancel={onClose}
      onOk={() => activeTab === 'submit' ? handleSubmit() : onClose()}
      okText={activeTab === 'submit' ? "提交" : "关闭"}
      cancelText="取消"
      confirmLoading={submitting}
      width={800}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={items}
      />
    </Modal>
  );
};

export default FeedbackModal; 