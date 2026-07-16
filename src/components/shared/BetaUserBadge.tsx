import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';

const Badge = styled.span<{ $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => (p.$compact ? '2px' : '4px')};
  padding: ${(p) => (p.$compact ? '2px 6px' : '3px 8px')};
  border-radius: 999px;
  font-size: ${(p) => (p.$compact ? '10px' : '11px')};
  font-weight: 700;
  line-height: 1.2;
  color: #08979c;
  background: linear-gradient(135deg, rgba(19, 194, 194, 0.18), rgba(24, 144, 255, 0.12));
  border: 1px solid rgba(19, 194, 194, 0.45);
  vertical-align: middle;
  flex-shrink: 0;
  white-space: nowrap;

  .beta-icon {
    font-size: ${(p) => (p.$compact ? '11px' : '12px')};
  }
`;

export function isBetaUserFlag(user: { isBetaUser?: boolean | number | null } | null | undefined): boolean {
  if (!user) return false;
  return user.isBetaUser === true || user.isBetaUser === 1;
}

export interface BetaUserBadgeProps {
  user?: { isBetaUser?: boolean | number | null } | null;
  /** 仅图标，不显示文字 */
  iconOnly?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 内测用户标识：用户菜单 / 个人中心等处展示
 */
const BetaUserBadge: React.FC<BetaUserBadgeProps> = ({
  user,
  iconOnly = false,
  compact = false,
  className,
  style,
}) => {
  const intl = useIntl();

  if (!isBetaUserFlag(user)) {
    return null;
  }

  const label = intl.formatMessage({
    id: 'user.beta.badge',
    defaultMessage: '内测用户',
  });
  const tip = intl.formatMessage({
    id: 'user.beta.tooltip',
    defaultMessage: '内测用户：火山模型使用内测 API Key',
  });

  return (
    <Tooltip title={tip}>
      <Badge $compact={compact} className={className} style={style}>
        <ExperimentOutlined className="beta-icon" />
        {!iconOnly && <span>{label}</span>}
      </Badge>
    </Tooltip>
  );
};

export default BetaUserBadge;
