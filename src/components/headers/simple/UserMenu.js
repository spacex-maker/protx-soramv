import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, theme, Tag, Divider, Badge } from "antd";
import { useIntl } from 'react-intl';
import { getUnreadNotificationCount } from 'api/notifications';
import AchievementModal from 'components/modals/AchievementModal';
import MemberLevelModal from 'components/modals/MemberLevelModal';
import { 
  UserOutlined, 
  SettingOutlined, 
  SafetyCertificateOutlined, 
  LockOutlined,
  WalletOutlined,
  ContainerOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  UserAddOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  RightOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  CrownOutlined,
  TrophyOutlined,
  StarFilled,
  HeartOutlined,
} from "@ant-design/icons";

// ==========================================
// 1. 恢复您原本的按钮样式 (及动画)
// ==========================================

const marqueeGlow = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const pulseEffect = keyframes`
  0% { transform: scale(0.97); opacity: 0.8; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.97); opacity: 0.8; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const UserMenuContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 1.5rem;
  z-index: 100;
`;

const UserButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border-radius: 50px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0.25rem;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    justify-content: center;
  }
`;

const ButtonGlow = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50px;
  z-index: -1;
  overflow: hidden;
  
  @media (max-width: 768px) {
    border-radius: 50%;
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50px;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      ${props => props.$token.colorPrimary} 25%, 
      ${props => props.$token.colorInfo} 50%, 
      ${props => props.$token.colorPrimary} 75%, 
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${marqueeGlow} 3s linear infinite;
    
    @media (max-width: 768px) {
      border-radius: 50%;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 48px;
    /* 适配背景色 */
    background: ${props => props.$token.colorBgContainer};
    z-index: 0;
    
    @media (max-width: 768px) {
      border-radius: 50%;
    }
  }
`;

const GlowOverlay = styled.div`
  position: absolute;
  inset: -2px;
  border-radius: 50px;
  box-shadow: 0 0 8px 2px ${props => props.$token.colorPrimary}4D; /* 30% opacity */
  opacity: 0.7;
  z-index: -1;
  animation: ${pulseEffect} 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    border-radius: 50%;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 10px;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const UserAvatar = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  border: 2px solid transparent;
  box-sizing: border-box;
`;

const AvatarFallback = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: ${props => props.$token.colorPrimary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  position: relative;
  z-index: 2;
  border: 2px solid transparent;
  box-sizing: border-box;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #52c41a;
  border: 2px solid ${props => props.$token.colorBgContainer};
  z-index: 3;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left; /* 确保文字左对齐 */

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.$token.colorText};
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserEmail = styled.span`
  font-size: 0.75rem;
  color: ${props => props.$token.colorTextSecondary};
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// ==========================================
// 2. 新的现代化下拉菜单样式
// ==========================================

const DropdownPanel = styled(motion.div)`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 280px;
  background: ${props => props.$token.colorBgElevated};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 16px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 12px 32px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  overflow: hidden;
  transform-origin: top right;
  cursor: default;
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  
  .verified-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(25%, 25%);
    z-index: 10;
  }
`;

const RainbowText = styled.span`
  background: linear-gradient(
    90deg,
    #ff6b6b 0%,
    #4ecdc4 25%,
    #45b7d1 50%,
    #96ceb4 75%,
    #ffeaa7 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 3s ease infinite;
  font-weight: 700;
  display: inline-block;
`;

const MenuHeader = styled.div`
  padding: 16px;
  background: ${props => props.$token.colorFillQuaternary};
  border-bottom: 1px solid ${props => props.$token.colorBorderSecondary};
  
  .user-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .user-info {
      flex: 1;
      min-width: 0;
      text-align: left;
      
      h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: ${props => props.$token.colorText};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      p {
        margin: 2px 0 0;
        font-size: 12px;
        color: ${props => props.$token.colorTextSecondary};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .level-section {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
        flex-wrap: wrap;
      }
    }
  }
  
  .buttons-section {
    display: flex;
    gap: 8px;
  }
`;

const ScrollArea = styled.div`
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.$token.colorFillSecondary};
    border-radius: 2px;
  }
`;

const GroupTitle = styled.div`
  padding: 12px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.$token.colorTextTertiary};
  text-align: left;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin: 2px 0;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.$isDanger ? props.$token.colorError : props.$token.colorText};
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    background: ${props => props.$isDanger ? props.$token.colorErrorBg : props.$token.colorFillTertiary};
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 16px;
    color: ${props => props.$isDanger ? props.$token.colorError : props.$token.colorTextSecondary};
  }

  .label {
    flex: 1;
    text-align: left;
  }

  .arrow {
    font-size: 10px;
    color: ${props => props.$token.colorTextQuaternary};
  }
`;

// ==========================================
// 炫彩充值按钮样式
// ==========================================

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.5); }
`;

const ActionButton = styled.button`
  position: relative;
  flex: 1;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  font-weight: 600;
  font-size: 11px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s ease;
  z-index: 1;
  padding: 0 10px;
  
  /* 渐变背景 */
  background: ${props => props.$variant === 'community' 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #10b981 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #3b82f6 100%)'
  };
  background-size: ${props => props.$variant === 'community' ? '200% 200%' : '300% 300%'};
  animation: ${gradientShift} ${props => props.$variant === 'community' ? '2s' : '3s'} ease infinite;
  
  /* 发光效果 */
  box-shadow: ${props => props.$variant === 'community'
    ? '0 0 8px rgba(16, 185, 129, 0.4), 0 0 16px rgba(5, 150, 105, 0.2)'
    : '0 0 8px rgba(59, 130, 246, 0.4), 0 0 16px rgba(139, 92, 246, 0.2)'
  };
  
  /* 光泽效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${shimmer} 2s infinite;
  }
  
  /* 悬停效果 */
  &:hover {
    transform: translateY(-1px) scale(1.01);
    box-shadow: ${props => props.$variant === 'community'
      ? '0 0 12px rgba(16, 185, 129, 0.6), 0 0 24px rgba(5, 150, 105, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)'
      : '0 0 12px rgba(59, 130, 246, 0.6), 0 0 24px rgba(139, 92, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  }
  
  &:active {
    transform: translateY(0) scale(0.99);
  }
  
  /* 图标动画 */
  .icon {
    font-size: 12px;
    animation: ${pulseEffect} 1.5s ease-in-out infinite;
  }
  
  /* 文字渐变效果 */
  .text {
    background: linear-gradient(90deg, #fff, #f0f9ff, #fff);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${gradientShift} 2s ease infinite;
  }
`;

// ==========================================
// VIP 徽标和等级显示样式
// ==========================================

const vipShine = keyframes`
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
`;

const vipPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6), 0 0 16px rgba(255, 215, 0, 0.4);
  }
  50% { 
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.8), 0 0 24px rgba(255, 215, 0, 0.6);
  }
`;

const VipBadge = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  background: ${props => {
    const level = props.$memberLevel || 1;
    // 后端会员等级：1=普通会员, 2=白银, 3=黄金, 4=钻石, 5=至尊
    if (level >= 5) {
      // 至尊会员 - 红色/粉色渐变
      return 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #f43f5e 100%)';
    } else if (level >= 4) {
      // 钻石会员 - 蓝色渐变
      return 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #38bdf8 100%)';
    } else if (level >= 3) {
      // 黄金会员 - 金色渐变
      return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)';
    } else if (level >= 2) {
      // 白银会员 - 银色渐变
      return 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)';
    } else {
      // 普通会员 - 灰色渐变
      return 'linear-gradient(135deg, #a1a1aa 0%, #d4d4d8 50%, #a1a1aa 100%)';
    }
  }};
  background-size: 200% 200%;
  animation: ${gradientShift} 3s ease infinite;
  color: ${props => {
    const level = props.$memberLevel || 1;
    // 金色和蓝色背景用深色文字，其他用白色文字
    return (level >= 3 && level < 5) ? '#1a1a1a' : '#fff';
  }};
  overflow: hidden;
  box-shadow: ${props => {
    const level = props.$memberLevel || 1;
    if (level >= 3) {
      // 黄金及以上等级有光晕效果
      return '0 0 8px rgba(255, 215, 0, 0.4), 0 0 16px rgba(255, 215, 0, 0.2)';
    }
    return '0 2px 4px rgba(0, 0, 0, 0.1)';
  }};
  animation: ${props => (props.$memberLevel || 1) >= 3 ? vipPulse : 'none'} 2s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
    );
    animation: ${props => (props.$memberLevel || 1) >= 3 ? vipShine : 'none'} 3s infinite;
  }
  
  .vip-icon {
    font-size: 12px;
    filter: ${props => {
      const level = props.$memberLevel || 1;
      // 黄金及以上等级有阴影效果
      return level >= 3 ? 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' : 'none';
    }};
  }
  
  .vip-text {
    position: relative;
    z-index: 1;
    text-shadow: ${props => {
      const level = props.$memberLevel || 1;
      // 黄金及以上等级有文字阴影
      return level >= 3 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none';
    }};
  }
`;

const LevelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  background: ${props => props.$token.colorPrimary}15;
  color: ${props => props.$token.colorPrimary};
  border: 1px solid ${props => props.$token.colorPrimary}40;
  
  .level-icon {
    font-size: 11px;
  }
`;

// ==========================================
// 3. 逻辑组件
// ==========================================

const UserMenu = ({ userInfo, onLogout }) => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [memberLevelModalOpen, setMemberLevelModalOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchUnreadCount = async () => {
      try {
        const res = await getUnreadNotificationCount();
        if (mounted && res?.data?.success) {
          setUnreadNotificationCount(Number(res.data.data?.unreadCount || 0));
        }
      } catch (error) {
        // ignore unread badge errors
      }
    };
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 60000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const getInitial = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  const menuGroups = [
    {
      title: intl.formatMessage({ id: 'userMenu.group.account', defaultMessage: '账户设置' }),
      items: [
        { label: intl.formatMessage({ id: 'userMenu.item.profile', defaultMessage: '个人中心' }), icon: <UserOutlined />, path: '/profile' },
        { label: intl.formatMessage({ id: 'userMenu.item.settings', defaultMessage: '系统设置' }), icon: <SettingOutlined />, path: '/settings' },
        { label: intl.formatMessage({ id: 'userMenu.item.security', defaultMessage: '安全设置' }), icon: <SafetyCertificateOutlined />, path: '/security' },
        { label: intl.formatMessage({ id: 'userMenu.item.privacy', defaultMessage: '隐私偏好' }), icon: <LockOutlined />, path: '/privacy-preferences' },
      ]
    },
    {
      title: intl.formatMessage({ id: 'userMenu.group.assets', defaultMessage: '资产与订单' }),
      items: [
        { label: intl.formatMessage({ id: 'userMenu.item.wallet', defaultMessage: '我的钱包' }), icon: <WalletOutlined />, path: '/billing' },
        { label: intl.formatMessage({ id: 'userMenu.item.subscription', defaultMessage: '订阅管理' }), icon: <CreditCardOutlined />, path: '/subscription' },
        { label: intl.formatMessage({ id: 'userMenu.item.orders', defaultMessage: '订单记录' }), icon: <FileTextOutlined />, path: '/orders' },
      ]
    },
    {
      title: intl.formatMessage({ id: 'userMenu.group.workspace', defaultMessage: '工作台' }),
      items: [
        { label: intl.formatMessage({ id: 'userMenu.item.works', defaultMessage: '我的作品' }), icon: <ContainerOutlined />, path: '/works' },
        { label: intl.formatMessage({ id: 'userMenu.item.saved', defaultMessage: '收藏与喜欢' }), icon: <HeartOutlined />, path: '/community/saved' },
        { label: intl.formatMessage({ id: 'userMenu.item.community', defaultMessage: '社区' }), icon: <TeamOutlined />, path: '/community' },
        { label: intl.formatMessage({ id: 'userMenu.item.notifications', defaultMessage: '消息通知' }), icon: <BellOutlined />, path: '/notifications' },
      ]
    },
    {
      title: intl.formatMessage({ id: 'userMenu.group.support', defaultMessage: '支持' }),
      items: [
        { label: intl.formatMessage({ id: 'userMenu.item.help', defaultMessage: '帮助中心' }), icon: <QuestionCircleOutlined />, path: '/help' },
        { label: intl.formatMessage({ id: 'userMenu.item.invite', defaultMessage: '邀请好友' }), icon: <UserAddOutlined />, path: '/invite' },
        { label: intl.formatMessage({ id: 'userMenu.item.feedback', defaultMessage: '反馈建议' }), icon: <MessageOutlined />, path: '/feedback' },
        { label: intl.formatMessage({ id: 'userMenu.item.about', defaultMessage: '关于我们' }), icon: <InfoCircleOutlined />, path: '/about' },
      ]
    }
  ];

  return (
    <UserMenuContainer ref={menuRef}>
      {/* 恢复的 UserButton，作为触发器 */}
      <UserButton onClick={() => setIsOpen(!isOpen)}>
        <ButtonGlow $token={token} />
        <GlowOverlay $token={token} />
        
        <AvatarContainer>
          {userInfo.avatar ? (
            <UserAvatar 
              src={userInfo.avatar} 
              alt={userInfo.username} 
            />
          ) : (
            <AvatarFallback $token={token}>
              {getInitial(userInfo.username)}
            </AvatarFallback>
          )}
          <StatusIndicator $token={token} />
        </AvatarContainer>

        <UserInfo>
          <UserName $token={token}>{userInfo.username}</UserName>
          <UserEmail $token={token}>{userInfo.email}</UserEmail>
        </UserInfo>
      </UserButton>

      {/* 新的下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <DropdownPanel
            $token={token}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* 1. 详细头部 */}
            <MenuHeader $token={token}>
              <div className="user-section">
                <AvatarWrapper>
                  <Avatar 
                    size={64} 
                    src={userInfo?.avatar} 
                    icon={<UserOutlined />}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  {/* KYC 状态徽章：0=未认证 1=审核中 2=已通过 3=审核失败 */}
                  {userInfo?.kycStatus === 2 && (
                    <Tag 
                      color="success" 
                      className="verified-badge"
                      style={{ 
                        margin: 0, 
                        fontSize: 9, 
                        lineHeight: '14px',
                        padding: '0 4px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {intl.formatMessage({ id: 'userMenu.status.verified', defaultMessage: '已认证' })}
                    </Tag>
                  )}
                  {userInfo?.kycStatus === 1 && (
                    <Tag 
                      color="processing" 
                      className="verified-badge"
                      style={{ 
                        margin: 0, 
                        fontSize: 9, 
                        lineHeight: '14px',
                        padding: '0 4px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {intl.formatMessage({ id: 'userMenu.status.reviewing', defaultMessage: '审核中' })}
                    </Tag>
                  )}
                  {userInfo?.kycStatus === 3 && (
                    <Tag 
                      color="error" 
                      className="verified-badge"
                      style={{ 
                        margin: 0, 
                        fontSize: 9, 
                        lineHeight: '14px',
                        padding: '0 4px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {intl.formatMessage({ id: 'userMenu.status.rejected', defaultMessage: '未通过' })}
                    </Tag>
                  )}
                </AvatarWrapper>
                <div className="user-info">
                  <h4>
                    <RainbowText>
                      {userInfo?.nickname || userInfo?.username}
                    </RainbowText>
                  </h4>
                  <p>{userInfo?.email || intl.formatMessage({ id: 'userMenu.email.notBound', defaultMessage: '未绑定邮箱' })}</p>
                  <div className="level-section">
                    {userInfo?.level && (
                      <LevelBadge 
                        $token={token}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAchievementModalOpen(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <TrophyOutlined className="level-icon" />
                        <span>{intl.formatMessage({ id: 'userMenu.level', defaultMessage: '等级' })} {userInfo.level}</span>
                      </LevelBadge>
                    )}
                    {userInfo?.memberLevel >= 1 && (
                      <VipBadge 
                        $memberLevel={userInfo.memberLevel}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMemberLevelModalOpen(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <CrownOutlined className="vip-icon" />
                        <span className="vip-text">
                          {userInfo.memberLevel >= 5 ? intl.formatMessage({ id: 'userMenu.member.vip5', defaultMessage: '至尊会员' }) :
                           userInfo.memberLevel >= 4 ? intl.formatMessage({ id: 'userMenu.member.vip4', defaultMessage: '钻石会员' }) :
                           userInfo.memberLevel >= 3 ? intl.formatMessage({ id: 'userMenu.member.vip3', defaultMessage: '黄金会员' }) :
                           userInfo.memberLevel >= 2 ? intl.formatMessage({ id: 'userMenu.member.vip2', defaultMessage: '白银会员' }) :
                           intl.formatMessage({ id: 'userMenu.member.vip1', defaultMessage: '普通会员' })}
                        </span>
                      </VipBadge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="buttons-section">
                <ActionButton 
                  $variant="recharge"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('/recharge');
                  }}
                >
                  <ThunderboltOutlined className="icon" />
                  <span className="text">{intl.formatMessage({ id: 'userMenu.recharge', defaultMessage: '立即充值' })}</span>
                </ActionButton>
                <ActionButton 
                  $variant="community"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('/community');
                  }}
                >
                  <TeamOutlined className="icon" />
                  <span className="text">{intl.formatMessage({ id: 'userMenu.community', defaultMessage: '社区' })}</span>
                </ActionButton>
              </div>
            </MenuHeader>

            {/* 2. 菜单列表 */}
            <ScrollArea $token={token}>
              {menuGroups.map((group, index) => (
                <div key={group.title}>
                  <GroupTitle $token={token}>{group.title}</GroupTitle>
                  {group.items.map(item => (
                    <MenuItem 
                      key={item.path} 
                      $token={token}
                      onClick={() => handleNavigate(item.path)}
                    >
                      <div className="icon-wrapper">{item.icon}</div>
                      <span className="label">
                        {item.label}
                        {item.path === '/notifications' && unreadNotificationCount > 0 && (
                          <Badge
                            count={unreadNotificationCount}
                            size="small"
                            style={{ marginLeft: 8 }}
                          />
                        )}
                      </span>
                      <RightOutlined className="arrow" />
                    </MenuItem>
                  ))}
                  {index < menuGroups.length - 1 && (
                    <Divider style={{ margin: '8px 0', borderColor: token.colorBorderSecondary }} />
                  )}
                </div>
              ))}

              <Divider style={{ margin: '8px 0', borderColor: token.colorBorderSecondary }} />
              
              <MenuItem 
                $token={token} 
                $isDanger 
                onClick={handleLogout}
              >
                <div className="icon-wrapper"><LogoutOutlined /></div>
                <span className="label">{intl.formatMessage({ id: 'userMenu.logout', defaultMessage: '退出登录' })}</span>
              </MenuItem>
            </ScrollArea>
          </DropdownPanel>
        )}
      </AnimatePresence>
      
      {/* 成就系统模态框 */}
      <AchievementModal
        open={achievementModalOpen}
        onClose={() => setAchievementModalOpen(false)}
        userInfo={userInfo}
      />
      
      {/* 会员等级模态框 */}
      <MemberLevelModal
        open={memberLevelModalOpen}
        onClose={() => setMemberLevelModalOpen(false)}
        userInfo={userInfo}
      />
    </UserMenuContainer>
  );
};

export default UserMenu;