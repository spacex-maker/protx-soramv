import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const Wrap = styled.section`
  padding: 80px 24px;
  max-width: 560px;
  margin: 0 auto;
`;

const Title = styled(motion.h2)`
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  text-align: center;
  color: #fff;
  margin-bottom: 12px;
`;

const Subtitle = styled(motion.p)`
  font-size: 16px;
  color: #9aa0a6;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 16px;
  }
  .ant-input-affix-wrapper {
    border-radius: 100px;
    padding: 14px 24px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  .ant-input {
    background: transparent !important;
    color: #e8eaed;
  }
  .ant-btn-primary {
    height: 48px;
    border-radius: 100px;
    font-weight: 600;
    background: linear-gradient(135deg, #00d4aa, #00a8cc) !important;
    border: none !important;
  }
`;

const SubscribeSection = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 此处可对接后端或第三方邮件服务（如 Mailchimp、ConvertKit）
      console.log('Subscribe:', values.email);
      message.success('订阅成功！我们会通过邮件与你保持联系。');
      form.resetFields();
    } catch (e) {
      message.error('订阅失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrap id="subscribe">
      <Title
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        订阅动态
      </Title>
      <Subtitle
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
      >
        获取开源机器人、具身智能与 Humanoid 的最新资讯与社区动态。
      </Subtitle>
      <StyledForm
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{}}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效邮箱' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#9aa0a6' }} />}
            placeholder="your@email.com"
            size="large"
            disabled={loading}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            订阅
          </Button>
        </Form.Item>
      </StyledForm>
    </Wrap>
  );
};

export default SubscribeSection;
