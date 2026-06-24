import React from 'react';
import { theme } from 'antd';
import { EyeInvisibleOutlined } from '@ant-design/icons';
import type { ListingDetail } from './PromptMarketDetailModal';

export const isPromptHiddenFromOthers = (detail: ListingDetail): boolean => {
  if (!detail) return false;
  if (detail.buyoutActive) return true;
  if (detail.isPromptHidden === 1) return true;
  return (detail.priceToken ?? 0) > 0 || (detail.buyoutPriceToken ?? 0) > 0;
};

interface CreatorPromptHiddenHintProps {
  detail: ListingDetail | null;
  isEn?: boolean;
}

const CreatorPromptHiddenHint: React.FC<CreatorPromptHiddenHintProps> = ({ detail, isEn }) => {
  const { token } = theme.useToken();

  if (!detail?.viewerIsCreator || !isPromptHiddenFromOthers(detail)) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 10,
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.5,
        color: token.colorWarning,
        background: token.colorWarningBg,
        border: `1px solid ${token.colorWarningBorder}`,
      }}
    >
      <EyeInvisibleOutlined style={{ marginTop: 2, flexShrink: 0 }} />
      <span>
        {isEn
          ? 'Only you can see the full prompt. Other users cannot view it until they purchase or get authorization.'
          : '仅您可见完整提示词，其他用户无法查看（需购买或授权后才可见）。'}
      </span>
    </div>
  );
};

export default CreatorPromptHiddenHint;
