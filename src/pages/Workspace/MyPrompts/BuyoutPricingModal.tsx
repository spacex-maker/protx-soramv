import React, { useEffect, useState } from 'react';
import { Modal, InputNumber, Switch, Button, theme } from 'antd';
import {
  SettingOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  ThunderboltFilled,
  FileTextOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { css } from 'styled-components';

const addImageCompressSuffix = (url: string | null | undefined, width = 120): string => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

export interface BuyoutPricingItem {
  listingId: number;
  title?: string;
  coverImageUrl?: string;
  priceToken?: number;
  buyoutPriceToken?: number;
  buyoutPurchasePriceToken?: number;
  transferBuyoutEnabled?: boolean;
  authEnabled?: boolean;
  transferBuyoutPriceToken?: number;
  authPriceToken?: number;
}

export interface BuyoutPricingSavePayload {
  transferBuyoutEnabled: boolean;
  transferBuyoutPriceToken: number;
  authEnabled: boolean;
  authPriceToken: number;
}

interface BuyoutPricingModalProps {
  open: boolean;
  item: BuyoutPricingItem | null;
  saving?: boolean;
  onCancel: () => void;
  onSave: (payload: BuyoutPricingSavePayload) => void;
}

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 20px;
    overflow: hidden;
    max-height: calc(100vh - 48px);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
  }

  .ant-modal-body {
    padding: 0;
    max-height: calc(100vh - 48px);
    overflow: hidden;
  }

  .ant-modal-close {
    top: 14px;
    right: 14px;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(0, 0, 0, 0.15);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(0, 0, 0, 0.28);
      color: #fff;
    }
  }
`;

const ModalScrollArea = styled.div`
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(p) => (p.theme.mode === 'dark' ? '#404040' : '#cbd5e1')};
    border-radius: 3px;
  }
`;

const HeroBanner = styled.div`
  position: relative;
  padding: 26px 28px 30px;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #818cf8 100%);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: -40px;
    bottom: -60px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    right: -30px;
    top: -30px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }

  .hero-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
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
    opacity: 0.9;
    margin: 0;
    line-height: 1.5;
    max-width: 320px;
  }
`;

const BodyContent = styled.div`
  padding: 22px 24px 24px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
`;

const ListingPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border-radius: 14px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1a1a1a' : '#f8fafc')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#303030' : '#e8ecf0')};

  .cover {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: 10px;
    overflow: hidden;
    background: ${(p) => (p.theme.mode === 'dark' ? '#262626' : '#e2e8f0')};

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(p) => (p.theme.mode === 'dark' ? '#525252' : '#94a3b8')};
    font-size: 22px;
  }

  .meta-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${(p) => (p.theme.mode === 'dark' ? '#737373' : '#94a3b8')};
    margin-bottom: 4px;
  }

  .meta-title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.4;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f5f5f5' : '#1e293b')};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const CostCard = styled.div`
  text-align: center;
  padding: 18px 16px 20px;
  margin-bottom: 16px;
  border-radius: 16px;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(250, 140, 22, 0.12) 0%, rgba(250, 140, 22, 0.04) 100%)'
      : 'linear-gradient(180deg, rgba(250, 140, 22, 0.1) 0%, rgba(250, 173, 20, 0.04) 100%)'};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(250, 140, 22, 0.28)' : 'rgba(250, 140, 22, 0.22)')};

  .cost-label {
    font-size: 13px;
    font-weight: 600;
    color: ${(p) => (p.theme.mode === 'dark' ? '#a3a3a3' : '#64748b')};
    margin-bottom: 10px;
  }

  .cost-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8px;
    font-size: 40px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.03em;
    color: #fa8c16;
  }

  .cost-unit {
    font-size: 14px;
    font-weight: 700;
    color: #faad14;
    margin-top: 8px;
  }

  .cost-hint {
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? '#737373' : '#94a3b8')};
    margin-top: 10px;
    line-height: 1.5;
  }
`;

const TipBanner = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  margin-bottom: 18px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.55;
  color: ${(p) => (p.theme.mode === 'dark' ? '#a3a3a3' : '#64748b')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#1f1f1f' : '#f1f5f9')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#303030' : '#e2e8f0')};

  .tip-icon {
    color: #6366f1;
    font-size: 15px;
    margin-top: 1px;
    flex-shrink: 0;
  }
`;

const OptionCard = styled.div<{ $active?: boolean; $variant: 'transfer' | 'auth' }>`
  border-radius: 16px;
  margin-bottom: 12px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#303030' : '#e8ecf0')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#1a1a1a' : '#fff')};
  overflow: visible;
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;

  ${(p) =>
    p.$active &&
    p.$variant === 'transfer' &&
    css`
      border-color: ${p.theme.mode === 'dark' ? 'rgba(250, 140, 22, 0.45)' : 'rgba(250, 140, 22, 0.35)'};
      background: ${p.theme.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(250, 140, 22, 0.08) 0%, #1a1a1a 100%)'
        : 'linear-gradient(180deg, rgba(250, 140, 22, 0.06) 0%, #fff 100%)'};
      box-shadow: ${p.theme.mode === 'dark'
        ? '0 8px 24px rgba(0, 0, 0, 0.2)'
        : '0 8px 24px rgba(250, 140, 22, 0.08)'};
    `}

  ${(p) =>
    p.$active &&
    p.$variant === 'auth' &&
    css`
      border-color: ${p.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.45)' : 'rgba(82, 196, 26, 0.35)'};
      background: ${p.theme.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(82, 196, 26, 0.08) 0%, #1a1a1a 100%)'
        : 'linear-gradient(180deg, rgba(82, 196, 26, 0.06) 0%, #fff 100%)'};
      box-shadow: ${p.theme.mode === 'dark'
        ? '0 8px 24px rgba(0, 0, 0, 0.2)'
        : '0 8px 24px rgba(82, 196, 26, 0.08)'};
    `}

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
  }

  .card-title-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .card-text {
    flex: 1;
    min-width: 0;
  }

  .card-switch {
    flex-shrink: 0;
    margin-top: 4px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;

    ${(p) =>
      p.$variant === 'transfer' &&
      css`
        background: rgba(250, 140, 22, 0.14);
        color: #fa8c16;
      `}
    ${(p) =>
      p.$variant === 'auth' &&
      css`
        background: rgba(82, 196, 26, 0.14);
        color: #52c41a;
      `}
  }

  .card-title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f5f5f5' : '#1e293b')};
    margin-bottom: 4px;
  }

  .card-desc {
    font-size: 12px;
    line-height: 1.6;
    color: ${(p) => (p.theme.mode === 'dark' ? '#737373' : '#64748b')};
    word-break: break-word;
  }

  .card-body {
    padding: 0 16px 16px;
    border-top: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#262626' : '#f0f0f0')};
    margin-top: 0;
    padding-top: 14px;
  }

  .price-field-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: ${(p) => (p.theme.mode === 'dark' ? '#a3a3a3' : '#64748b')};
  }

  .default-hint {
    font-size: 11px;
    color: ${(p) => (p.theme.mode === 'dark' ? '#525252' : '#94a3b8')};
  }

  .ant-input-number {
    border-radius: 10px;
  }

  .ant-input-number-group-wrapper {
    width: 100%;
  }
`;

const FooterActions = styled.div`
  display: flex;
  gap: 10px;
  padding-top: 8px;

  .ant-btn {
    flex: 1;
    height: 44px;
    border-radius: 12px;
    font-weight: 600;
  }

  .save-btn {
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  }
`;

const BuyoutPricingModal: React.FC<BuyoutPricingModalProps> = ({
  open,
  item,
  saving,
  onCancel,
  onSave,
}) => {
  const intl = useIntl();
  const { token: antToken } = theme.useToken();

  const [transferEnabled, setTransferEnabled] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [transferPrice, setTransferPrice] = useState<number | null>(null);
  const [authPrice, setAuthPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!item) return;
    setTransferEnabled(item.transferBuyoutEnabled ?? false);
    setAuthEnabled(item.authEnabled ?? false);
    setTransferPrice(item.transferBuyoutPriceToken ?? null);
    setAuthPrice(item.authPriceToken ?? null);
  }, [item]);

  const handleSave = () => {
    onSave({
      transferBuyoutEnabled: transferEnabled,
      transferBuyoutPriceToken: transferEnabled ? (transferPrice ?? 0) : 0,
      authEnabled,
      authPriceToken: authEnabled ? (authPrice ?? 0) : 0,
    });
  };

  const cover = addImageCompressSuffix(item?.coverImageUrl, 120);
  const defaultBuyout = item?.buyoutPriceToken ?? 0;
  const defaultView = item?.priceToken ?? 0;
  const buyoutCost = item?.buyoutPurchasePriceToken ?? 0;

  return (
    <StyledModal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
      destroyOnClose
      closable
    >
      <ModalScrollArea>
      <HeroBanner>
        <div className="hero-icon"><SettingOutlined /></div>
        <h3 className="hero-title">
          <FormattedMessage id="myPrompts.pricingModalTitle" defaultMessage="设置转让买断价 / 授权价" />
        </h3>
        <p className="hero-sub">
          <FormattedMessage
            id="myPrompts.pricingModalSub"
            defaultMessage="管理他人如何获取该作品的买断权或查看权"
          />
        </p>
      </HeroBanner>

      <BodyContent>
        {item && (
          <ListingPreview>
            <div className="cover">
              {cover ? (
                <img src={cover} alt={item.title || ''} />
              ) : (
                <div className="cover-placeholder"><FileTextOutlined /></div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="meta-label">
                <FormattedMessage id="myPrompts.pricingListing" defaultMessage="当前作品" />
              </div>
              <div className="meta-title">{item.title || `Listing #${item.listingId}`}</div>
            </div>
          </ListingPreview>
        )}

        {buyoutCost > 0 && (
          <CostCard>
            <div className="cost-label">
              <FormattedMessage id="myPrompts.buyoutCost" defaultMessage="您的买断购入成本" />
            </div>
            <div className="cost-value">
              <ThunderboltFilled style={{ fontSize: 28, color: '#faad14' }} />
              <span>{buyoutCost}</span>
              <span className="cost-unit">TOKEN</span>
            </div>
            <div className="cost-hint">
              <FormattedMessage
                id="myPrompts.buyoutCostHint"
                defaultMessage="获得该作品买断权时您实际支付的价格，可作为定价参考"
              />
            </div>
          </CostCard>
        )}

        <TipBanner>
          <InfoCircleOutlined className="tip-icon" />
          <span>
            <FormattedMessage
              id="myPrompts.pricingHint"
              defaultMessage="买断后转让与授权默认关闭，需主动开启。未设置价格时将沿用作品默认价。"
            />
          </span>
        </TipBanner>

        <OptionCard $active={transferEnabled} $variant="transfer">
          <div className="card-header">
            <div className="card-title-row">
              <div className="card-icon"><CrownOutlined /></div>
              <div className="card-text">
                <div className="card-title">
                  <FormattedMessage id="myPrompts.transferEnabled" defaultMessage="允许转让买断" />
                </div>
                <div className="card-desc">
                  <FormattedMessage
                    id="myPrompts.transferEnabledHint"
                    defaultMessage="开启后，其他用户可申请买断并接替您成为持有人"
                  />
                </div>
              </div>
            </div>
            <Switch
              className="card-switch"
              checked={transferEnabled}
              onChange={(checked) => {
                setTransferEnabled(checked);
                if (!checked) setTransferPrice(null);
              }}
            />
          </div>
          {transferEnabled && (
            <div className="card-body">
              <div className="price-field-label">
                <span>
                  <FormattedMessage id="myPrompts.transferPrice" defaultMessage="转让买断价" />
                </span>
                {defaultBuyout > 0 && (
                  <span className="default-hint">
                    <FormattedMessage
                      id="myPrompts.defaultBuyoutPrice"
                      defaultMessage="默认 {price} TOKEN"
                      values={{ price: defaultBuyout }}
                    />
                  </span>
                )}
              </div>
              <InputNumber
                min={0}
                max={99999}
                size="large"
                value={transferPrice}
                onChange={(v) => setTransferPrice(v)}
                addonAfter="TOKEN"
                placeholder={intl.formatMessage({
                  id: 'myPrompts.transferPricePlaceholder',
                  defaultMessage: '留空则使用作品默认买断价',
                })}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </OptionCard>

        <OptionCard $active={authEnabled} $variant="auth">
          <div className="card-header">
            <div className="card-title-row">
              <div className="card-icon"><SafetyCertificateOutlined /></div>
              <div className="card-text">
                <div className="card-title">
                  <FormattedMessage id="myPrompts.authEnabled" defaultMessage="允许授权查看" />
                </div>
                <div className="card-desc">
                  <FormattedMessage
                    id="myPrompts.authEnabledHint"
                    defaultMessage="开启后，其他用户可申请授权查看完整提示词"
                  />
                </div>
              </div>
            </div>
            <Switch
              className="card-switch"
              checked={authEnabled}
              onChange={(checked) => {
                setAuthEnabled(checked);
                if (!checked) setAuthPrice(null);
              }}
            />
          </div>
          {authEnabled && (
            <div className="card-body">
              <div className="price-field-label">
                <span>
                  <FormattedMessage id="myPrompts.authPrice" defaultMessage="授权查看价" />
                </span>
                {defaultView > 0 && (
                  <span className="default-hint">
                    <FormattedMessage
                      id="myPrompts.defaultViewPrice"
                      defaultMessage="默认 {price} TOKEN"
                      values={{ price: defaultView }}
                    />
                  </span>
                )}
              </div>
              <InputNumber
                min={0}
                max={99999}
                size="large"
                value={authPrice}
                onChange={(v) => setAuthPrice(v)}
                addonAfter="TOKEN"
                placeholder={intl.formatMessage({
                  id: 'myPrompts.authPricePlaceholder',
                  defaultMessage: '留空则使用作品默认查看价',
                })}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </OptionCard>

        <FooterActions>
          <Button size="large" onClick={onCancel}>
            <FormattedMessage id="common.cancel" defaultMessage="取消" />
          </Button>
          <Button
            type="primary"
            size="large"
            className="save-btn"
            loading={saving}
            onClick={handleSave}
            style={{ background: antToken.colorPrimary }}
          >
            <FormattedMessage id="common.save" defaultMessage="保存" />
          </Button>
        </FooterActions>
      </BodyContent>
      </ModalScrollArea>
    </StyledModal>
  );
};

export default BuyoutPricingModal;
