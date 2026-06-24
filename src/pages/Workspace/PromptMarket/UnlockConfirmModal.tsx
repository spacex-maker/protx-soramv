import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Spin, Typography, Button, message, theme } from 'antd';
import {
  WalletOutlined,
  ExclamationCircleOutlined,
  ThunderboltFilled,
  CrownOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import styled, { css } from 'styled-components';
import { base } from 'api/base';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

export type PromptMarketOrderType = 1 | 2 | 3;

export interface UnlockConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  listingId: number;
  priceToken: number;
  title?: string;
  isEn?: boolean;
  orderType?: PromptMarketOrderType;
  confirmTitle?: string;
  onSuccess: () => void;
}

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
  }

  .ant-modal-close {
    top: 14px;
    right: 14px;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(0, 0, 0, 0.15);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(0, 0, 0, 0.25);
      color: #fff;
    }
  }

  .ant-modal-body {
    padding: 0;
  }
`;

const HeroBanner = styled.div<{ $variant: 'view' | 'buyout' | 'auth' }>`
  position: relative;
  padding: 28px 28px 32px;
  color: #fff;
  overflow: hidden;

  ${(p) =>
    p.$variant === 'view' &&
    css`
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 55%, #6366f1 100%);
    `}
  ${(p) =>
    p.$variant === 'buyout' &&
    css`
      background: linear-gradient(135deg, #ea580c 0%, #f59e0b 50%, #fbbf24 100%);
    `}
  ${(p) =>
    p.$variant === 'auth' &&
    css`
      background: linear-gradient(135deg, #059669 0%, #10b981 55%, #34d399 100%);
    `}

  &::after {
    content: '';
    position: absolute;
    right: -20px;
    top: -20px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }

  .hero-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 14px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .hero-title {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.35;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
  }

  .hero-sub {
    font-size: 13px;
    opacity: 0.88;
    margin: 0;
    line-height: 1.5;
  }
`;

const BodyContent = styled.div`
  padding: 24px 28px 28px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
`;

const ProductTitle = styled.div`
  margin-bottom: 20px;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1f1f1f' : '#f8fafc')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#303030' : '#e8ecf0')};

  .label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${(p) => (p.theme.mode === 'dark' ? '#8c8c8c' : '#94a3b8')};
    margin-bottom: 4px;
  }

  .name {
    font-size: 15px;
    font-weight: 600;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f0f0f0' : '#1e293b')};
    line-height: 1.45;
  }
`;

const PriceHero = styled.div`
  text-align: center;
  padding: 20px 16px;
  margin-bottom: 20px;
  border-radius: 16px;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)'
      : 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)'};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#303030' : '#e8ecf0')};

  .price-label {
    font-size: 13px;
    color: ${(p) => (p.theme.mode === 'dark' ? '#8c8c8c' : '#64748b')};
    margin-bottom: 8px;
  }

  .price-value {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 42px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.03em;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f8fafc' : '#0f172a')};

    .unit {
      font-size: 14px;
      font-weight: 700;
      color: #faad14;
      margin-top: 12px;
    }
  }
`;

const BalanceRow = styled.div<{ $sufficient?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: ${(p) =>
    p.$sufficient
      ? p.theme.mode === 'dark'
        ? 'rgba(82, 196, 26, 0.1)'
        : 'rgba(82, 196, 26, 0.08)'
      : p.theme.mode === 'dark'
        ? '#1f1f1f'
        : '#f8fafc'};
  border: 1px solid
    ${(p) =>
      p.$sufficient
        ? p.theme.mode === 'dark'
          ? 'rgba(82, 196, 26, 0.35)'
          : 'rgba(82, 196, 26, 0.35)'
        : p.theme.mode === 'dark'
          ? '#303030'
          : '#e8ecf0'};

  .balance-left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: ${(p) => (p.theme.mode === 'dark' ? '#d4d4d8' : '#475569')};
  }

  .balance-value {
    font-size: 18px;
    font-weight: 800;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f0f0f0' : '#1e293b')};
  }

  .status-icon {
    font-size: 20px;
    color: ${(p) => (p.$sufficient ? '#52c41a' : '#faad14')};
  }
`;

const WarningStrip = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 20px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: #d48806;
  background: rgba(250, 173, 20, 0.1);
  border: 1px solid rgba(250, 173, 20, 0.35);
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;

  .ant-btn {
    height: 48px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
  }

  .cancel-btn {
    flex: 0 0 auto;
    min-width: 100px;
  }

  .confirm-btn {
    flex: 1;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
  }
`;

const getOrderMeta = (orderType: PromptMarketOrderType, isEn?: boolean) => {
  if (orderType === 2) {
    return {
      variant: 'buyout' as const,
      icon: <CrownOutlined />,
      title: isEn ? 'Exclusive Buyout' : '买断购买',
      subtitle: isEn
        ? 'Gain exclusive viewing rights for this prompt'
        : '获得该提示词的独家查看权',
      priceLabel: isEn ? 'Buyout price' : '买断价格',
    };
  }
  if (orderType === 3) {
    return {
      variant: 'auth' as const,
      icon: <SafetyCertificateOutlined />,
      title: isEn ? 'Authorization' : '申请授权',
      subtitle: isEn
        ? 'Purchase view access from the current holder'
        : '向当前买断持有人购买查看授权',
      priceLabel: isEn ? 'Authorization fee' : '授权费用',
    };
  }
  return {
    variant: 'view' as const,
    icon: <EyeOutlined />,
    title: isEn ? 'Purchase View Access' : '购买查看权',
    subtitle: isEn
      ? 'Unlock the full prompt after payment'
      : '支付后即可查看完整提示词',
    priceLabel: isEn ? 'View price' : '查看价格',
  };
};

const UnlockConfirmModal: React.FC<UnlockConfirmModalProps> = ({
  visible,
  onCancel,
  listingId,
  priceToken,
  title,
  isEn,
  orderType = 1,
  confirmTitle,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { token: antToken } = theme.useToken();
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const sufficient = tokenBalance !== null && tokenBalance >= priceToken;
  const meta = useMemo(() => getOrderMeta(orderType, isEn), [orderType, isEn]);
  const displayTitle = confirmTitle || meta.title;

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
      const res: any = await base.orderPromptMarket(listingId, orderType);
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
    <StyledModal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title={null}
      width={460}
      centered
      destroyOnClose
      maskClosable={!payLoading}
    >
      <Spin spinning={balanceLoading}>
        <HeroBanner $variant={meta.variant}>
          <div className="hero-icon">{meta.icon}</div>
          <h3 className="hero-title">{displayTitle}</h3>
          <p className="hero-sub">{meta.subtitle}</p>
        </HeroBanner>

        <BodyContent>
          {title && (
            <ProductTitle>
              <div className="label">{isEn ? 'Work' : '作品'}</div>
              <div className="name">{title}</div>
            </ProductTitle>
          )}

          <PriceHero>
            <div className="price-label">{meta.priceLabel}</div>
            <div className="price-value">
              <ThunderboltFilled style={{ color: '#faad14', fontSize: 28 }} />
              {priceToken}
              <span className="unit">TOKEN</span>
            </div>
          </PriceHero>

          <BalanceRow $sufficient={sufficient}>
            <div className="balance-left">
              <WalletOutlined style={{ fontSize: 18, color: antToken.colorPrimary }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  {isEn ? 'Your balance' : '当前余额'}
                </Text>
                <span className="balance-value">
                  {tokenBalance != null ? tokenBalance : '—'}
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>TOKEN</Text>
                </span>
              </div>
            </div>
            {tokenBalance !== null && (
              sufficient
                ? <CheckCircleOutlined className="status-icon" />
                : <ExclamationCircleOutlined className="status-icon" />
            )}
          </BalanceRow>

          {tokenBalance !== null && !sufficient && (
            <WarningStrip>
              <ExclamationCircleOutlined style={{ fontSize: 16, marginTop: 2 }} />
              <span>
                {isEn
                  ? 'Insufficient balance. You will be redirected to recharge.'
                  : '余额不足，确认后将跳转至充值页面。'}
              </span>
            </WarningStrip>
          )}

          <ActionRow>
            <Button className="cancel-btn" size="large" onClick={onCancel} disabled={payLoading}>
              {isEn ? 'Cancel' : '取消'}
            </Button>
            <Button
              className="confirm-btn"
              type="primary"
              size="large"
              loading={payLoading}
              onClick={handleConfirm}
              style={
                meta.variant === 'buyout'
                  ? { boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)' }
                  : meta.variant === 'auth'
                    ? { boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)' }
                    : undefined
              }
            >
              {sufficient
                ? (isEn ? 'Confirm & Pay' : '确认支付')
                : (isEn ? 'Go Recharge' : '去充值')}
            </Button>
          </ActionRow>

          <Paragraph
            type="secondary"
            style={{ fontSize: 11, textAlign: 'center', marginTop: 16, marginBottom: 0 }}
          >
            {isEn
              ? 'Payment is final. View/buyout rights apply per marketplace rules.'
              : '支付成功后权益即时生效，请确认价格无误。'}
          </Paragraph>
        </BodyContent>
      </Spin>
    </StyledModal>
  );
};

export default UnlockConfirmModal;
