import React from 'react';
import { Button, Space, Typography, theme } from 'antd';
import { ThunderboltFilled, CrownOutlined } from '@ant-design/icons';
import type { ListingDetail } from './PromptMarketDetailModal';
import type { PromptMarketOrderType } from './UnlockConfirmModal';

const { Text } = Typography;

export interface UnlockModalConfig {
  orderType: PromptMarketOrderType;
  priceToken: number;
  confirmTitle: string;
}

interface PromptMarketPurchaseActionsProps {
  detail: ListingDetail;
  isEn?: boolean;
  block?: boolean;
  onOpenUnlock: (config: UnlockModalConfig) => void;
}

export const getUnlockModalConfig = (
  detail: ListingDetail,
  orderType: PromptMarketOrderType,
  isEn?: boolean
): UnlockModalConfig | null => {
  if (orderType === 1) {
    const price = detail.priceToken ?? 0;
    if (price <= 0) return null;
    return {
      orderType: 1,
      priceToken: price,
      confirmTitle: isEn ? 'Confirm view purchase' : '确认购买查看权',
    };
  }
  if (orderType === 2) {
    const price = detail.buyoutActive
      ? (detail.transferBuyoutEnabled ? (detail.effectiveTransferBuyoutPrice ?? 0) : 0)
      : (detail.buyoutPriceToken ?? 0);
    if (price <= 0) return null;
    return {
      orderType: 2,
      priceToken: price,
      confirmTitle: detail.buyoutActive
        ? (isEn ? 'Confirm buyout transfer' : '确认申请买断')
        : (isEn ? 'Confirm exclusive buyout' : '确认买断购买'),
    };
  }
  if (orderType === 3) {
    const price = detail.authEnabled ? (detail.effectiveAuthPrice ?? 0) : 0;
    if (price <= 0) return null;
    return {
      orderType: 3,
      priceToken: price,
      confirmTitle: isEn ? 'Confirm authorization' : '确认申请授权',
    };
  }
  return null;
};

const PromptMarketPurchaseActions: React.FC<PromptMarketPurchaseActionsProps> = ({
  detail,
  isEn,
  block,
  onOpenUnlock,
}) => {
  const { token } = theme.useToken();
  const action = detail.purchaseAction || 'NONE';

  const btnStyle = block
    ? { height: 48, borderRadius: 9999, fontSize: 15, fontWeight: 700 as const }
    : { height: 44, borderRadius: 12, fontWeight: 600 as const };

  const open = (orderType: PromptMarketOrderType) => {
    const config = getUnlockModalConfig(detail, orderType, isEn);
    if (config) onOpenUnlock(config);
  };

  if (action === 'NONE') {
    return null;
  }

  // 已被买断：转让买断 / 申请授权
  if (detail.buyoutActive && action === 'TRANSFER_BUYOUT') {
    const transferPrice = detail.effectiveTransferBuyoutPrice ?? 0;
    const authPrice = detail.effectiveAuthPrice ?? 0;
    return (
      <Space direction={block ? 'vertical' : 'horizontal'} style={{ width: block ? '100%' : undefined }} size={8}>
        {transferPrice > 0 && (
          <Button type="primary" block={block} style={btnStyle} onClick={() => open(2)}>
            {isEn ? 'Apply buyout' : '申请买断'} ({transferPrice} TOKEN)
          </Button>
        )}
        {authPrice > 0 && (
          <Button block={block} style={btnStyle} onClick={() => open(3)}>
            {isEn ? 'Apply authorization' : '申请授权'} ({authPrice} TOKEN)
          </Button>
        )}
      </Space>
    );
  }

  if (action === 'REQUEST_AUTH') {
    return (
      <Button type="primary" block={block} style={btnStyle} onClick={() => open(3)}>
        {isEn ? 'Apply authorization' : '申请授权'}
      </Button>
    );
  }

  // 未买断：根据价格展示查看权 + 买断（可同时存在）
  const showView =
    !detail.buyoutActive &&
    (detail.priceToken ?? 0) > 0 &&
    (action === 'UNLOCK_VIEW' || action === 'VIEW_AND_BUYOUT' || action === 'BUYOUT');
  const showBuyout =
    !detail.buyoutActive &&
    (detail.buyoutPriceToken ?? 0) > 0 &&
    (action === 'BUYOUT' || action === 'VIEW_AND_BUYOUT' || action === 'UNLOCK_VIEW');

  if (!showView && !showBuyout) {
    return null;
  }

  const buyoutPrice = detail.buyoutPriceToken ?? 0;

  return (
    <Space direction={block ? 'vertical' : 'horizontal'} style={{ width: block ? '100%' : undefined }} size={8}>
      {showView && (
        <Button
          type={showBuyout ? 'default' : 'primary'}
          block={block}
          style={btnStyle}
          onClick={() => open(1)}
        >
          {isEn ? 'View purchase' : '购买查看权'} ({detail.priceToken} TOKEN)
        </Button>
      )}
      {showBuyout && (
        <Button type="primary" block={block} style={btnStyle} onClick={() => open(2)}>
          <CrownOutlined />
          {isEn ? 'Exclusive buyout' : '买断购买'} ({buyoutPrice} TOKEN)
        </Button>
      )}
    </Space>
  );
};

export const PromptMarketPriceDisplay: React.FC<{ detail: ListingDetail; isEn?: boolean }> = ({ detail, isEn }) => {
  const { token } = theme.useToken();
  const viewPrice = detail.priceToken ?? 0;
  const buyoutPrice = detail.buyoutPriceToken ?? 0;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        {viewPrice === 0 && buyoutPrice === 0 ? (
          <span style={{ fontSize: 28, fontWeight: 900, color: token.colorPrimary }}>
            {isEn ? 'Free' : '免费'}
          </span>
        ) : (
          <>
            {viewPrice > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{isEn ? 'View' : '查看'}</Text>
                <ThunderboltFilled style={{ color: '#faad14', fontSize: 14 }} />
                <span style={{ fontSize: 28, fontWeight: 900, color: token.colorPrimary }}>{viewPrice}</span>
                <Text type="secondary" style={{ fontSize: 12 }}>TOKEN</Text>
              </span>
            )}
            {buyoutPrice > 0 && !detail.buyoutActive && (
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{isEn ? 'Buyout' : '买断'}</Text>
                <CrownOutlined style={{ color: '#fa8c16', fontSize: 14 }} />
                <span style={{ fontSize: 22, fontWeight: 800, color: '#fa8c16' }}>{buyoutPrice}</span>
                <Text type="secondary" style={{ fontSize: 12 }}>TOKEN</Text>
              </span>
            )}
          </>
        )}
        {detail.buyoutActive && detail.transferBuyoutEnabled && (detail.effectiveTransferBuyoutPrice ?? 0) > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isEn ? 'Transfer buyout' : '转让买断'} {detail.effectiveTransferBuyoutPrice} TOKEN
          </Text>
        )}
        {detail.buyoutActive && detail.authEnabled && (detail.effectiveAuthPrice ?? 0) > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isEn ? 'Authorization' : '授权查看'} {detail.effectiveAuthPrice} TOKEN
          </Text>
        )}
      </div>
      {detail.buyoutActive && (
        <Text type="warning" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
          {isEn ? 'This prompt has been bought out. Only holder and creator can view.' : '该作品已被买断，仅持有人与创作者可查看完整提示词。'}
        </Text>
      )}
    </div>
  );
};

export default PromptMarketPurchaseActions;
