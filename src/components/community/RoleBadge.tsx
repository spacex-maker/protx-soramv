import React, { useEffect, useState } from 'react';
import { Tag, Tooltip, Space } from 'antd';
import { CrownOutlined, StarOutlined, SafetyOutlined, EyeOutlined, TrophyOutlined } from '@ant-design/icons';
import styled, { keyframes, css } from 'styled-components';
import { getMyRoles, CommunityUserRole } from 'api/community';

// 角色配置：不同角色对应不同的颜色和图标
const ROLE_CONFIG: Record<string, {
  color: string;
  icon: React.ReactNode;
  gradient: string;
}> = {
  'super_admin': {
    color: '#ff4d4f',
    icon: <CrownOutlined />,
    gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  },
  'community_manager': {
    color: '#faad14',
    icon: <StarOutlined />,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  'content_curator': {
    color: '#1890ff',
    icon: <SafetyOutlined />,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  'moderator': {
    color: '#52c41a',
    icon: <EyeOutlined />,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  'challenge_reviewer': {
    color: '#722ed1',
    icon: <TrophyOutlined />,
    gradient: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
  },
};

// 闪光动画
const shine = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const RoleBadgeContainer = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
`;

const StyledBadge = styled.div<{ gradient: string; isOfficial: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${props => props.gradient};
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  ${props => props.isOfficial && css`
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: ${shine} 3s infinite;
    }
  `}

  .icon {
    font-size: 14px;
    display: flex;
    align-items: center;
  }

  .official-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    margin-left: 4px;
    font-size: 10px;
  }
`;

interface RoleBadgeProps {
  maxDisplay?: number;
  showTooltip?: boolean;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  maxDisplay = 2, 
  showTooltip = true 
}) => {
  const [roles, setRoles] = useState<CommunityUserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await getMyRoles();
      setRoles(data);
    } catch (error) {
      // 静默失败，用户可能未登录或没有角色
      console.debug('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || roles.length === 0) {
    return null;
  }

  // 只显示前N个角色
  const displayRoles = roles.slice(0, maxDisplay);
  const hiddenCount = roles.length - maxDisplay;

  const renderBadge = (role: CommunityUserRole) => {
    const config = ROLE_CONFIG[role.roleCode] || {
      color: '#722ed1',
      icon: <StarOutlined />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };

    const badge = (
      <StyledBadge 
        key={role.id} 
        gradient={config.gradient}
        isOfficial={role.isOfficial}
      >
        <span className="icon">{config.icon}</span>
        <span>{role.roleName}</span>
        {role.isOfficial && (
          <span className="official-badge">✓</span>
        )}
      </StyledBadge>
    );

    if (showTooltip && role.description) {
      return (
        <Tooltip 
          key={role.id}
          title={
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {role.roleName}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {role.description}
              </div>
              {role.expiredTime && !role.expired && (
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                  过期时间: {new Date(role.expiredTime).toLocaleString('zh-CN')}
                </div>
              )}
            </div>
          }
          color="#2d2d2d"
        >
          {badge}
        </Tooltip>
      );
    }

    return badge;
  };

  return (
    <RoleBadgeContainer>
      <Space size={8}>
        {displayRoles.map(role => renderBadge(role))}
        {hiddenCount > 0 && (
          <Tooltip
            title={
              <div>
                {roles.slice(maxDisplay).map(role => (
                  <div key={role.id} style={{ padding: '4px 0' }}>
                    {role.roleName}
                  </div>
                ))}
              </div>
            }
          >
            <Tag 
              style={{ 
                cursor: 'pointer',
                borderRadius: 20,
                border: 'none',
                background: 'rgba(0,0,0,0.1)',
                color: '#666'
              }}
            >
              +{hiddenCount}
            </Tag>
          </Tooltip>
        )}
      </Space>
    </RoleBadgeContainer>
  );
};

export default RoleBadge;

