import React from 'react';
import { Modal, Input, Typography } from 'antd';
import { useIntl } from 'react-intl';

const { Text } = Typography;

const PasswordModal = ({
  visible,
  password,
  onPasswordChange,
  onOk,
  onCancel,
  decrypting
}) => {
  const intl = useIntl();
  
  return (
    <Modal
      title={intl.formatMessage({ id: 'decrypt.password.modal.title' })}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={decrypting}
    >
      <Input.Password
        placeholder={intl.formatMessage({ id: 'decrypt.password.modal.placeholder' })}
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        style={{ marginTop: 16 }}
      />
      <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
        {intl.formatMessage({ id: 'decrypt.password.modal.hint' })}
      </Text>
    </Modal>
  );
};

export default PasswordModal; 