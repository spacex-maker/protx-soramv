import React from 'react';
import { Modal, Typography, Button } from 'antd';
import { ExclamationCircleOutlined, WalletOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export interface InsufficientBalanceModalProps {
  open: boolean;
  onCancel: () => void;
  /** 本次所需 Token；为 0 时仅展示通用提示（如接口返回余额不足） */
  requiredTokens?: number;
  tokenBalance: number | null;
}

const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({
  open,
  onCancel,
  requiredTokens = 0,
  tokenBalance,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const handleRecharge = () => {
    onCancel();
    navigate('/workspace/recharge');
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={intl.formatMessage({
        id: 'create.insufficientBalance.title',
        defaultMessage: 'Token 余额不足',
      })}
      width={400}
      destroyOnClose
    >
      <div style={{ marginBottom: 16, color: '#faad14', fontSize: 13 }}>
        <ExclamationCircleOutlined style={{ marginRight: 6 }} />
        {intl.formatMessage({
          id: 'create.insufficientBalance.hint',
          defaultMessage: '当前余额不足以完成本次生成，请先充值后再试。',
        })}
      </div>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">
          <WalletOutlined style={{ marginRight: 6 }} />
          {intl.formatMessage({
            id: 'create.insufficientBalance.current',
            defaultMessage: '当前余额',
          })}
          :{' '}
          <Text strong>
            {tokenBalance != null ? `${tokenBalance} Token` : '-'}
          </Text>
        </Text>
      </div>
      {requiredTokens > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            {intl.formatMessage({
              id: 'create.insufficientBalance.required',
              defaultMessage: '本次预估消耗',
            })}
            : <Text strong>{requiredTokens} Token</Text>
          </Text>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>
          {intl.formatMessage({
            id: 'create.insufficientBalance.cancel',
            defaultMessage: '取消',
          })}
        </Button>
        <Button type="primary" onClick={handleRecharge}>
          {intl.formatMessage({
            id: 'create.insufficientBalance.goRecharge',
            defaultMessage: '去充值',
          })}
        </Button>
      </div>
    </Modal>
  );
};

export default InsufficientBalanceModal;
