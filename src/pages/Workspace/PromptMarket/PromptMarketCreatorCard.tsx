import React from 'react';
import { Typography, Avatar, Button, Space } from 'antd';
import { 
  UserOutlined, UserAddOutlined, CheckOutlined, 
  CrownFilled, SafetyCertificateFilled, ShareAltOutlined 
} from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

// --- 类型定义 ---
export interface CreatorCardCreator {
  userId?: number;
  creatorName?: string;
  creatorAvatar?: string;
  creatorDescription?: string;
  creatorLevel?: number;
  creatorMemberLevel?: number;
}

export interface CreatorCardRelation {
  isFollowing?: boolean;
  isMutual?: boolean;
}

interface PromptMarketCreatorCardProps {
  creator: CreatorCardCreator;
  isDark: boolean;
  isEn: boolean;
  relation: CreatorCardRelation | null;
  followLoading: boolean;
  onFollow: () => void;
}

// --- 样式组件 ---

const CardContainer = styled.div<{ $isDark: boolean }>`
  position: relative;
  border-radius: 16px;
  padding: 12px;
  background: ${props => props.$isDark 
    ? 'linear-gradient(145deg, #1a1a1a 0%, #111 100%)' 
    : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)'};
  border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
  box-shadow: ${props => props.$isDark 
    ? '0 4px 20px rgba(0,0,0,0.4)' 
    : '0 4px 20px rgba(0,0,0,0.02)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: #6366f1;
    transform: translateY(-2px);
  }
`;

const AvatarWrapper = styled.div<{ $isDark: boolean }>`
  position: relative;
  flex-shrink: 0;
  .member-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #eab308;
    color: #fff;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    border: 2px solid ${props => props.$isDark ? '#1a1a1a' : '#fff'};
    z-index: 2;
  }
`;

const FollowBtn = styled(Button)<{ $isDark: boolean; $following?: boolean; $mutual?: boolean }>`
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  height: 36px;
  flex: 1;
  
  ${props => !props.$following && `
    background: #6366f1;
    border: none;
    color: #fff;
    &:hover { background: #4f46e5 !important; color: #fff !important; }
  `}

  ${props => props.$following && !props.$mutual && `
    background: ${props.$isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'};
    border: 1px solid ${props.$isDark ? '#333' : '#e5e7eb'};
    color: ${props.$isDark ? '#9ca3af' : '#6b7280'};
  `}

  ${props => props.$mutual && `
    background: ${props.$isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5'};
    border: 1px solid ${props.$isDark ? '#065f46' : '#a7f3d0'};
    color: #10b981;
  `}
`;

// 修复点：定义一个专门的 StyledShareBtn，正确处理属性
const StyledShareBtn = styled(Button)<{ $isDark: boolean }>`
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : '#fff'};
  border: 1px solid ${props => props.$isDark ? '#333' : '#e5e7eb'};
  color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};
`;

const LevelTag = styled.span<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#262626' : '#f1f5f9'};
  color: ${props => props.$isDark ? '#a3a3a3' : '#64748b'};
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
`;

const PromptMarketCreatorCard: React.FC<PromptMarketCreatorCardProps> = ({
  creator,
  isDark,
  isEn,
  relation,
  followLoading,
  onFollow,
}) => {
  const isFollowing = !!relation?.isFollowing;
  const isMutual = !!relation?.isMutual;

  return (
    <CardContainer $isDark={isDark}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.5px' }}>
          {isEn ? 'AUTHOR' : '发布作者'}
        </Text>
        {creator.creatorLevel != null && (
          <LevelTag $isDark={isDark}>LV.{creator.creatorLevel}</LevelTag>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <AvatarWrapper $isDark={isDark}>
          <Avatar 
            size={44} 
            src={creator.creatorAvatar} 
            icon={<UserOutlined />} 
            style={{ border: isDark ? '1px solid #333' : '1px solid #eee' }}
          />
          {creator.creatorMemberLevel != null && creator.creatorMemberLevel > 0 && (
            <div className="member-badge">
              <CrownFilled />
            </div>
          )}
        </AvatarWrapper>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Text strong style={{ fontSize: 14 }}>{creator.creatorName || 'Anakki'}</Text>
            {creator.creatorLevel && creator.creatorLevel > 5 && (
              <SafetyCertificateFilled style={{ color: '#6366f1', fontSize: 12 }} />
            )}
          </div>
          <Text 
            type="secondary" 
            style={{ fontSize: 11, display: 'block', marginTop: 2 }} 
            ellipsis={{ tooltip: creator.creatorDescription }}
          >
            {creator.creatorDescription || (isEn ? 'AI Artist' : '这个作者很懒...')}
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {creator.userId != null && (
          <FollowBtn
            $isDark={isDark}
            $following={isFollowing}
            $mutual={isMutual}
            icon={isFollowing ? <CheckOutlined /> : <UserAddOutlined />}
            onClick={onFollow}
            loading={followLoading}
            disabled={followLoading}
          >
            {isFollowing
              ? (isMutual ? (isEn ? 'Mutual' : '互相关注') : (isEn ? 'Following' : '已关注'))
              : (isEn ? 'Follow' : '关注')}
          </FollowBtn>
        )}
        {/* 修正：使用 StyledShareBtn 替代原生 Button */}
        <StyledShareBtn 
          $isDark={isDark} 
          icon={<ShareAltOutlined style={{ fontSize: 14 }} />} 
        />
      </div>
    </CardContainer>
  );
};

export default PromptMarketCreatorCard;