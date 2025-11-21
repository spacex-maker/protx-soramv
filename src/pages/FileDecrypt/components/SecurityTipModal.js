import React from 'react';
import { Modal, Space } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'decrypt.security.modal.title',
    defaultMessage: '安全提示'
  },
  description: {
    id: 'decrypt.security.modal.description',
    defaultMessage: '所有解密操作均在本地完成，您的密码和文件内容不会上传到服务器'
  },
  vipTitle: {
    id: 'decrypt.security.modal.vip.title',
    defaultMessage: '尊敬的会员用户，您可以：'
  },
  vipFeature1: {
    id: 'decrypt.security.modal.vip.feature1',
    defaultMessage: '解密任意大小的文件'
  },
  vipFeature2: {
    id: 'decrypt.security.modal.vip.feature2',
    defaultMessage: '使用智能分块解密功能，更高效且节省内存'
  },
  vipFeature3: {
    id: 'decrypt.security.modal.vip.feature3',
    defaultMessage: '支持批量解密多个大文件'
  },
  freeTitle: {
    id: 'decrypt.security.modal.free.title',
    defaultMessage: '重要提示：解密过程需要在浏览器内存中进行，实际内存占用约为文件大小的3倍。'
  },
  freeFeature1: {
    id: 'decrypt.security.modal.free.feature1',
    defaultMessage: '非会员用户单个文件大小限制为4GB'
  },
  freeFeature2: {
    id: 'decrypt.security.modal.free.feature2',
    defaultMessage: '开通会员后可解密任意大小文件，并支持分块解密'
  },
  freeFeature3: {
    id: 'decrypt.security.modal.free.feature3',
    defaultMessage: '如果出现浏览器崩溃，建议开通会员使用分块解密功能'
  }
});

const SecurityTipModal = ({ visible, onClose, isVipUser }) => {
  const intl = useIntl();
  
  const vipFeatures = [
    intl.formatMessage(messages.vipFeature1),
    intl.formatMessage(messages.vipFeature2),
    intl.formatMessage(messages.vipFeature3)
  ];

  const freeFeatures = [
    intl.formatMessage(messages.freeFeature1),
    intl.formatMessage(messages.freeFeature2),
    intl.formatMessage(messages.freeFeature3)
  ];
  
  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined />
          <span>{intl.formatMessage(messages.title)}</span>
        </Space>
      }
      open={visible}
      onOk={onClose}
      onCancel={onClose}
      width={600}
    >
      <div style={{ padding: '8px 0' }}>
        <p>{intl.formatMessage(messages.description)}</p>
        {isVipUser ? (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#52c41a', fontWeight: 500 }}>
              {intl.formatMessage(messages.vipTitle)}
            </p>
            <ul style={{ color: '#52c41a', marginTop: 8, paddingLeft: 16 }}>
              {vipFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#ff4d4f', fontWeight: 500 }}>
              {intl.formatMessage(messages.freeTitle)}
            </p>
            <ul style={{ color: '#ff4d4f', marginTop: 8, paddingLeft: 16 }}>
              {freeFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SecurityTipModal; 