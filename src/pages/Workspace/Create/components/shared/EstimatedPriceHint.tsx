import React from 'react';
import { Typography, Spin } from 'antd';
import { useIntl } from 'react-intl';

const { Text } = Typography;

export interface EstimatedPriceHintProps {
  /** 预估价格文案，如 "120 Token"；为空则不渲染 */
  price: string | null | undefined;
  tokenBalance: number | null;
  balanceLoading?: boolean;
  style?: React.CSSProperties;
}

const EstimatedPriceHint: React.FC<EstimatedPriceHintProps> = ({
  price,
  tokenBalance,
  balanceLoading = false,
  style,
}) => {
  const intl = useIntl();

  if (!price) {
    return null;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: 8, ...style }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {intl.formatMessage(
          { id: 'create.estimated.price', defaultMessage: '预估: {price}' },
          { price },
        )}
        <span style={{ margin: '0 6px' }}>·</span>
        {balanceLoading ? (
          <Spin size="small" />
        ) : (
          intl.formatMessage(
            { id: 'create.token.balance', defaultMessage: '余额: {balance} Token' },
            { balance: tokenBalance ?? '-' },
          )
        )}
      </Text>
    </div>
  );
};

export default EstimatedPriceHint;
