import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Switch, Space, Tabs, Card, Tag, Button, Tooltip, Empty, Drawer } from 'antd';
import { LikeOutlined, CalendarOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import instance from 'api/axios';
import axios from 'axios';
import dayjs from 'dayjs';
import styled from 'styled-components';

const { TextArea } = Input;
const { Option } = Select;

// 移动端样式优化
const MobileRequirementCard = styled(Card)`
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  
  .ant-card-body {
    padding: 12px;
  }

  .requirement-title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--ant-color-text);
  }

  .requirement-description {
    color: var(--ant-color-text-secondary);
    margin-bottom: 12px;
    font-size: 14px;
  }

  .requirement-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--ant-color-text-secondary);
    font-size: 12px;
  }

  .requirement-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .support-button {
    width: 100%;
    margin-top: 8px;
  }
`;

const MobileFiltersContainer = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: var(--ant-color-bg-container);
  border-radius: 8px;
  
  .ant-select {
    width: 100%;
    margin-bottom: 8px;
  }
`;

const MobileFormContainer = styled.div`
  .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-form-item-label {
    padding-bottom: 8px;
    
    label {
      font-size: 15px;
      height: auto;
      color: var(--ant-color-text);
    }
  }

  .ant-input {
    font-size: 16px;
    padding: 12px;
    border-radius: 8px;
    height: auto;
  }

  .ant-input-textarea {
    textarea {
      font-size: 16px;
      padding: 12px;
      border-radius: 8px;
    }
  }

  .ant-select {
    .ant-select-selector {
      height: auto !important;
      padding: 8px 12px !important;
      border-radius: 8px !important;
      
      .ant-select-selection-item {
        font-size: 16px;
        line-height: 1.5;
        padding: 4px 0;
      }

      .ant-select-selection-placeholder {
        font-size: 16px;
        line-height: 1.5;
        padding: 4px 0;
      }
    }

    &.ant-select-open .ant-select-selector {
      border-color: var(--ant-color-primary) !important;
      box-shadow: 0 0 0 2px rgba(var(--ant-color-primary-rgb), 0.1) !important;
    }
  }

  .ant-picker {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    height: auto;
    
    input {
      font-size: 16px;
    }
  }

  .ant-switch {
    min-width: 44px;
    height: 24px;
    
    .ant-switch-handle {
      width: 20px;
      height: 20px;
    }
  }

  .ant-form-item-control-input {
    min-height: auto;
  }
`;

// 自定义下拉菜单样式
const dropdownStyles = {
  dropdown: {
    padding: '8px',
  },
  item: {
    fontSize: '16px',
    padding: '12px',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
};

const MobileDrawer = styled(Drawer)`
  .ant-drawer-header {
    padding: 16px;
    border-bottom: 1px solid var(--ant-color-split);
  }

  .ant-drawer-body {
    padding: 16px;
  }

  .ant-drawer-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--ant-color-split);
  }

  .ant-tabs-nav {
    margin-bottom: 16px;
  }

  .ant-tabs-tab {
    padding: 8px 0;
    font-size: 15px;
  }
`;

// 状态配置
const statusConfig = {
  PENDING: { color: 'gold', text: '待处理' },
  PROCESSING: { color: 'blue', text: '处理中' },
  COMPLETED: { color: 'green', text: '已完成' },
  REJECTED: { color: 'red', text: '已拒绝' }
};

const priorityConfig = {
  URGENT: { color: 'red', text: '紧急' },
  HIGH: { color: 'orange', text: '高' },
  MEDIUM: { color: 'blue', text: '中' },
  LOW: { color: 'green', text: '低' }
};

const categoryConfig = {
  FEATURE: '新功能',
  IMPROVEMENT: '功能改进',
  BUG: '问题修复',
  OTHER: '其他'
};

const MobileFeedbackModal = ({ open, onClose }) => {
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
      fetchRequirements();
    } catch (error) {
      console.error('支持失败:', error);
      message.error('支持失败: ' + (error.message || '未知错误'));
    }
  };

  // 移动端需求列表展示
  const MobileRequirementsList = () => {
    if (!requirementsList.length) {
      return <Empty description="暂无需求" />;
    }

    return requirementsList.map(requirement => (
      <MobileRequirementCard key={requirement.id}>
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
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <span>
              <UserOutlined /> {requirement.userId ? '实名用户' : '匿名用户'}
            </span>
            <span>
              <CalendarOutlined /> {dayjs(requirement.createTime).format('YYYY-MM-DD HH:mm')}
            </span>
            {requirement.expectedCompletionDate && (
              <span>
                <CalendarOutlined /> 期望完成：{requirement.expectedCompletionDate.join('-')}
              </span>
            )}
            <Button
              type="primary"
              icon={<LikeOutlined />}
              className="support-button"
              onClick={() => handleSupport(requirement.id)}
            >
              {requirement.supportCount} 支持
            </Button>
          </Space>
        </div>
      </MobileRequirementCard>
    ));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const formattedDate = values.expectedCompletionDate?.format('YYYY-MM-DD');

      const requestData = {
        title: values.title,
        description: values.description,
        priority: values.priority || 'MEDIUM',
        category: values.category,
        expectedCompletionDate: formattedDate
      };

      if (isAnonymous) {
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
        <MobileFormContainer>
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
              <span style={{ fontSize: '15px' }}>匿名提交{isAnonymous ? ' (无需登录)' : ''}</span>
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
                rows={6}
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
              <Select 
                placeholder="请选择优先级"
                popupMatchSelectWidth={false}
                dropdownStyle={{
                  padding: '8px',
                  borderRadius: '12px',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                }}
                listHeight={280}
                menuItemSelectedIcon={null}
              >
                {Object.entries(priorityConfig).map(([key, { text, color }]) => (
                  <Option key={key} value={key}>
                    <Space>
                      <Tag color={color} style={{ margin: 0, padding: '0 6px' }}>
                        {text}
                      </Tag>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label="需求类别"
            >
              <Select 
                placeholder="请选择需求类别"
                popupMatchSelectWidth={false}
                dropdownStyle={{
                  padding: '8px',
                  borderRadius: '12px',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                }}
                listHeight={280}
                menuItemSelectedIcon={null}
              >
                {Object.entries(categoryConfig).map(([key, text]) => (
                  <Option key={key} value={key}>
                    <Space>
                      {key === 'FEATURE' && <Tag color="success">新</Tag>}
                      {key === 'IMPROVEMENT' && <Tag color="processing">优</Tag>}
                      {key === 'BUG' && <Tag color="error">修</Tag>}
                      {key === 'OTHER' && <Tag>其</Tag>}
                      {text}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="expectedCompletionDate"
              label="期望完成日期"
            >
              <DatePicker 
                placeholder="请选择期望完成日期"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Form>
        </MobileFormContainer>
      )
    },
    {
      key: 'list',
      label: '需求列表',
      children: (
        <div>
          <MobileFiltersContainer>
            <Select
              placeholder="状态筛选"
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              {Object.entries(statusConfig).map(([key, { text }]) => (
                <Option key={key} value={key}>{text}</Option>
              ))}
            </Select>
            <Select
              placeholder="类别筛选"
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              {Object.entries(categoryConfig).map(([key, text]) => (
                <Option key={key} value={key}>{text}</Option>
              ))}
            </Select>
            <Select
              placeholder="排序方式"
              defaultValue="supportCount"
              onChange={(value) => setFilters(prev => ({ ...prev, sortField: value }))}
            >
              <Option value="supportCount">按支持数</Option>
              <Option value="createTime">按创建时间</Option>
            </Select>
          </MobileFiltersContainer>
          
          <MobileRequirementsList />
        </div>
      )
    }
  ];

  return (
    <MobileDrawer
      open={open}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>需求管理</span>
          <CloseOutlined onClick={onClose} style={{ fontSize: '16px' }} />
        </div>
      }
      footer={
        activeTab === 'submit' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              style={{ flex: 1, height: '44px', borderRadius: '8px' }} 
              onClick={onClose}
            >
              取消
            </Button>
            <Button 
              type="primary" 
              style={{ flex: 1, height: '44px', borderRadius: '8px' }} 
              loading={submitting}
              onClick={handleSubmit}
            >
              提交
            </Button>
          </div>
        ) : null
      }
      width="100%"
      placement="right"
      styles={{
        body: {
          padding: '16px',
          paddingBottom: '32px'
        }
      }}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={items}
        style={{ marginTop: '-16px' }}
      />
    </MobileDrawer>
  );
};

export default MobileFeedbackModal; 