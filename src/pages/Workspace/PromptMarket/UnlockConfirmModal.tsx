import React, { useEffect, useState } from 'react';
import { Modal, Spin, Typography, Button, message } from 'antd';
import { WalletOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { base } from 'api/base';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export interface UnlockConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  listingId: number;
  priceToken: number;
  title?: string;
  isEn?: boolean;
  onSuccess: () => void;
}

const UnlockConfirmModal: React.FC<UnlockConfirmModalProps> = ({
  visible,
  onCancel,
  listingId,
  priceToken,
  title,
  isEn,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const sufficient = tokenBalance !== null && tokenBalance >= priceToken;

  useEffect(() => {
    if (visible) {
      setTokenBalance(null);
      setBalanceLoading(true);
      base.getUserBalance().then((res: any) => {
        setBalanceLoading(false);
        if (res?.success && res?.data?.tokenBalance != null) {
          setTokenBalance(Number(res.data.tokenBalance));
        } else {
          setTokenBalance(0);
        }
      }).catch(() => {
        setBalanceLoading(false);
        setTokenBalance(0);
      });
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!sufficient) {
      onCancel();
      navigate('/workspace/recharge');
      return;
    }
    setPayLoading(true);
    try {
      const res: any = await base.orderPromptMarket(listingId);
      if (res?.success) {
        message.success(isEn ? 'Purchase successful' : '购买成功');
        onCancel();
        onSuccess();
      } else {
        message.error(res?.message || (isEn ? 'Purchase failed' : '购买失败'));
      }
    } catch (e: any) {
      message.error(e?.message || (isEn ? 'Purchase failed' : '购买失败'));
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title={isEn ? 'Unlock confirmation' : '确认解锁'}
      width={400}
      destroyOnClose
    >
      <Spin spinning={balanceLoading}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            <WalletOutlined style={{ marginRight: 6 }} />
            {isEn ? 'Current balance' : '当前余额'}:{' '}
            <Text strong>{tokenBalance != null ? `${tokenBalance} TOKEN` : '-'}</Text>
          </Text>
        </div>
        <div style={{ marginBottom: 16 }}>
          {isEn ? 'Price' : '所需'}: <Text strong>{priceToken} TOKEN</Text>
          {title && <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 4 }}>{title}</div>}
        </div>
        {tokenBalance !== null && tokenBalance < priceToken && (
          <div style={{ marginBottom: 16, color: '#faad14', fontSize: 13 }}>
            <ExclamationCircleOutlined style={{ marginRight: 6 }} />
            {isEn ? 'Insufficient balance. Please recharge first.' : '余额不足，请先充值后再购买。'}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>{isEn ? 'Cancel' : '取消'}</Button>
          <Button
            type="primary"
            loading={payLoading}
            onClick={handleConfirm}
          >
            {sufficient ? (isEn ? 'Confirm order' : '确定下单') : (isEn ? 'Go recharge' : '去充值')}
          </Button>
        </div>
      </Spin>
    </Modal>
  );
};

export default UnlockConfirmModal;
