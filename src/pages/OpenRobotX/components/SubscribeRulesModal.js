import React from 'react';
import { Modal, Typography, Button, Space, Divider } from 'antd';
import { MailOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, SafetyOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Paragraph } = Typography;

const ModalContent = styled.div`
  .ant-typography { color: rgba(255, 255, 255, 0.88); }
  .ant-typography.ant-typography-secondary { color: #9aa0a6; }
  .rule-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }
  .rule-item .icon {
    color: #00d4aa;
    font-size: 18px;
    margin-top: 2px;
  }
  .rule-item .label {
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
  }
  .rule-item .desc {
    color: #9aa0a6;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const rules = [
  {
    icon: <MailOutlined className="icon" />,
    label: '订阅内容',
    desc: '您将收到 Open Robot X 的精选动态：开源人形机器人、具身智能与 Humanoid 行业资讯、新产品与里程碑事件、社区活动与直播预告。',
  },
  {
    icon: <ClockCircleOutlined className="icon" />,
    label: '发送频率',
    desc: '我们通常每周发送 1–2 封邮件，重要节点可能增加一期。不会进行垃圾轰炸，您可随时退订。',
  },
  {
    icon: <StopOutlined className="icon" />,
    label: '退订方式',
    desc: '每封邮件底部均提供「退订」链接，点击即可一键取消订阅，无需额外步骤。',
  },
  {
    icon: <SafetyOutlined className="icon" />,
    label: '隐私与数据',
    desc: '我们仅使用您填写的邮箱用于发送订阅内容，不会向第三方出售或共享。退订后将不再向该邮箱发送邮件。',
  },
];

const SubscribeRulesModal = ({ open, onClose, onGoSubscribe }) => {
  const handleGoSubscribe = () => {
    onClose?.();
    onGoSubscribe?.();
  };

  return (
    <Modal
      title={
        <Space>
          <MailOutlined style={{ color: '#00d4aa' }} />
          <span>订阅规则</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button key="go" type="primary" icon={<CheckCircleOutlined />} onClick={handleGoSubscribe}>
          去订阅
        </Button>,
      ]}
      width={520}
      centered
      destroyOnClose
      styles={{
        header: { borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0f1419', color: '#fff' },
        body: { paddingTop: 16, background: '#0f1419', color: 'rgba(255,255,255,0.88)' },
        footer: { borderTop: '1px solid rgba(255,255,255,0.08)', background: '#0f1419' },
        content: { backgroundColor: '#0f1419', borderRadius: 16 },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      <ModalContent>
        <Paragraph type="secondary" style={{ marginBottom: 20 }}>
          订阅前请知悉以下规则与说明，以便您更好地使用邮件订阅服务。
        </Paragraph>
        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />
        {rules.map((r, i) => (
          <div key={i} className="rule-item">
            <span className="icon">{r.icon}</span>
            <div>
              <div className="label">{r.label}</div>
              <div className="desc">{r.desc}</div>
            </div>
          </div>
        ))}
      </ModalContent>
    </Modal>
  );
};

export default SubscribeRulesModal;
