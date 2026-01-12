import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Card, Tag, Space, Steps, Alert } from 'antd';
import { CrownOutlined, FileTextOutlined, TrophyOutlined, PhoneOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { getAvailableRoles, applyForRole, CommunityRole, RoleApplicationRequest } from 'api/community';

const { TextArea } = Input;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-body {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)'};
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.2)'};
      border-radius: 3px;
      
      &:hover {
        background: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(0, 0, 0, 0.3)'};
      }
    }
  }
`;

const RoleCard = styled(Card)<{ selected: boolean }>`
  margin-bottom: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.3s ease-out;
  border: 2px solid ${props => props.selected 
    ? '#1890ff' 
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.06)'};
  background: ${props => props.selected 
    ? props.theme.mode === 'dark'
      ? 'rgba(24, 144, 255, 0.1)'
      : 'rgba(24, 144, 255, 0.05)'
    : props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : '#ffffff'};
  
  &:hover {
    border-color: #1890ff;
    box-shadow: 0 4px 12px ${props => props.theme.mode === 'dark' 
      ? 'rgba(24, 144, 255, 0.3)' 
      : 'rgba(24, 144, 255, 0.15)'};
    transform: translateY(-2px);
  }
  
  .ant-card-body {
    padding: 16px;
  }
`;

const RoleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .role-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(24, 144, 255, 0.2)' 
      : 'rgba(24, 144, 255, 0.1)'};
    color: #1890ff;
    flex-shrink: 0;
  }
  
  .role-info {
    flex: 1;
    
    .role-name {
      font-size: 16px;
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .role-description {
      font-size: 13px;
      color: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.65)' 
        : 'rgba(0, 0, 0, 0.65)'};
      line-height: 1.5;
    }
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  
  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .icon {
      font-size: 18px;
      color: #1890ff;
    }
  }
  
  .section-description {
    font-size: 13px;
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.45)' 
      : 'rgba(0, 0, 0, 0.45)'};
    margin-bottom: 12px;
    line-height: 1.6;
  }
`;

const StyledTextArea = styled(TextArea)`
  border-radius: 8px;
  
  &:focus, &:hover {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
`;

const StyledInput = styled(Input)`
  border-radius: 8px;
  
  &:focus, &:hover {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
`;

interface RoleApplicationModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const RoleApplicationModal: React.FC<RoleApplicationModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<CommunityRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (visible) {
      loadRoles();
      form.resetFields();
      setSelectedRole(null);
      setCurrentStep(0);
    }
  }, [visible, form]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await getAvailableRoles();
      setRoles(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || '获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleId: number) => {
    setSelectedRole(roleId);
    form.setFieldValue('roleId', roleId);
    setTimeout(() => setCurrentStep(1), 300);
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      message.warning('请先选择要申请的角色');
      setCurrentStep(0);
      return;
    }

    try {
      const values = await form.validateFields(['applyReason', 'experienceDescription', 'contactInfo']);
      setSubmitting(true);

      const request: RoleApplicationRequest = {
        roleId: selectedRole,
        applyReason: values.applyReason,
        experienceDescription: values.experienceDescription,
        contactInfo: values.contactInfo,
      };

      await applyForRole(request);
      message.success('🎉 申请提交成功！我们会尽快审核您的申请');
      onSuccess();
      onCancel();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.errorFields) {
        message.warning('请完善必填信息');
        return;
      } else {
        message.error('申请提交失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoleInfo = roles.find(r => r.id === selectedRole);

  return (
    <StyledModal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SendOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <span>申请社区角色</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={
        <span>
          <CheckCircleOutlined /> 提交申请
        </span>
      }
      cancelText="取消"
      width={700}
      destroyOnClose
    >
      <Steps
        current={currentStep}
        style={{ marginBottom: 32 }}
        items={[
          { title: '选择角色', icon: <CrownOutlined /> },
          { title: '填写信息', icon: <FileTextOutlined /> },
        ]}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <CrownOutlined spin style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <div>加载角色列表中...</div>
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="roleId" hidden>
            <Input />
          </Form.Item>

          {/* 步骤1: 选择角色 */}
          <FormSection style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <div className="section-title">
              <CrownOutlined className="icon" />
              <span>选择您要申请的角色</span>
            </div>
            <div className="section-description">
              请仔细阅读角色描述，选择最适合您的角色
            </div>

            {roles.length === 0 ? (
              <Alert
                message="暂无可申请的角色"
                description="请联系管理员了解详情"
                type="info"
                showIcon
              />
            ) : (
              roles.map((role) => (
                <RoleCard
                  key={role.id}
                  selected={selectedRole === role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  hoverable
                >
                  <RoleHeader>
                    <div className="role-icon">
                      <CrownOutlined />
                    </div>
                    <div className="role-info">
                      <div className="role-name">
                        {role.roleName}
                        {role.isOfficial && (
                          <Tag color="gold" icon={<TrophyOutlined />}>
                            官方认证
                          </Tag>
                        )}
                      </div>
                      <div className="role-description">
                        {role.description || '暂无描述'}
                      </div>
                    </div>
                    {selectedRole === role.id && (
                      <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    )}
                  </RoleHeader>
                </RoleCard>
              ))
            )}
          </FormSection>

          {/* 步骤2: 填写信息 */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            {selectedRoleInfo && (
              <Alert
                message={
                  <Space>
                    <span>申请角色:</span>
                    <Tag color="blue" icon={<CrownOutlined />}>
                      {selectedRoleInfo.roleName}
                    </Tag>
                  </Space>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
                action={
                  <a onClick={() => setCurrentStep(0)}>重新选择</a>
                }
              />
            )}

            <FormSection>
              <div className="section-title">
                <FileTextOutlined className="icon" />
                <span>申请理由 <span style={{ color: '#ff4d4f' }}>*</span></span>
              </div>
              <div className="section-description">
                请详细说明您申请该角色的理由和动机（至少20字）
              </div>
              <Form.Item
                name="applyReason"
                rules={[
                  { required: true, message: '请填写申请理由' },
                  { min: 20, message: '申请理由至少20字' },
                  { max: 500, message: '申请理由最多500字' },
                ]}
              >
                <StyledTextArea
                  rows={5}
                  placeholder="例如：我热爱社区建设，有丰富的社区管理经验..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </FormSection>

            <FormSection>
              <div className="section-title">
                <TrophyOutlined className="icon" />
                <span>相关经验（选填）</span>
              </div>
              <div className="section-description">
                如果您有相关领域的经验，请在这里详细描述
              </div>
              <Form.Item
                name="experienceDescription"
                rules={[{ max: 1000, message: '经验描述最多1000字' }]}
              >
                <StyledTextArea
                  rows={4}
                  placeholder="例如：曾在XX社区担任管理员，负责日常内容审核..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
            </FormSection>

            <FormSection>
              <div className="section-title">
                <PhoneOutlined className="icon" />
                <span>联系方式（选填）</span>
              </div>
              <div className="section-description">
                如需补充联系方式，请填写（如微信、QQ、邮箱等）
              </div>
              <Form.Item
                name="contactInfo"
                rules={[{ max: 200, message: '联系方式最多200字' }]}
              >
                <StyledInput
                  placeholder="微信: xxx / QQ: xxx / 邮箱: xxx@example.com"
                  maxLength={200}
                  prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                />
              </Form.Item>
            </FormSection>

            <Alert
              message="温馨提示"
              description="提交申请后，管理员将在 1-3 个工作日内完成审核。您可以在「我的申请记录」中查看审核进度。"
              type="success"
              showIcon
            />
          </div>
        </Form>
      )}
    </StyledModal>
  );
};

export default RoleApplicationModal;

