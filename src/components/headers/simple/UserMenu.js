import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, theme, Tag, Divider } from "antd";
import { useIntl } from 'react-intl';
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
  ThunderboltOutlined
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

const MenuHeader = styled.div`
  padding: 20px;
  background: ${props => props.$token.colorFillQuaternary};
  border-bottom: 1px solid ${props => props.$token.colorBorderSecondary};
  display: flex;
  align-items: center;
  gap: 16px;
  
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
    }
    
    p {
      margin: 2px 0 0;
      font-size: 12px;
      color: ${props => props.$token.colorTextSecondary};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
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

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.5); }
`;

const RechargeButton = styled.button`
  position: relative;
  width: 100%;
  height: 32px;
  margin-top: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  z-index: 1;
  padding: 0 12px;
  
  /* 渐变背景 */
  background: linear-gradient(
    135deg,
    #3b82f6 0%,
    #8b5cf6 25%,
    #ec4899 50%,
    #f59e0b 75%,
    #3b82f6 100%
  );
  background-size: 300% 300%;
  animation: ${gradientShift} 3s ease infinite;
  
  /* 发光效果 */
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.4), 0 0 24px rgba(139, 92, 246, 0.2);
  animation: ${gradientShift} 3s ease infinite, ${glowPulse} 2s ease-in-out infinite;
  
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
      rgba(255, 255, 255, 0.25),
      transparent
    );
    animation: ${shimmer} 2s infinite;
  }
  
  /* 悬停效果 */
  &:hover {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 0 18px rgba(59, 130, 246, 0.6), 0 0 36px rgba(139, 92, 246, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0) scale(0.99);
  }
  
  /* 图标动画 */
  .icon {
    font-size: 14px;
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
// 3. 逻辑组件
// ==========================================

const UserMenu = ({ userInfo, onLogout }) => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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
        { label: intl.formatMessage({ id: 'userMenu.item.privacy', defaultMessage: '隐私偏好' }), icon: <LockOutlined />, path: '/privacy' },
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
              <Avatar 
                size={48} 
                src={userInfo?.avatar} 
                icon={<UserOutlined />}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <div className="user-info">
                <h4>{userInfo?.nickname || userInfo?.username}</h4>
                <p>{userInfo?.email || intl.formatMessage({ id: 'userMenu.email.notBound', defaultMessage: '未绑定邮箱' })}</p>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                   <Tag color={userInfo?.isActive ? "success" : "default"} style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>
                     {userInfo?.isActive 
                       ? intl.formatMessage({ id: 'userMenu.status.verified', defaultMessage: '已认证' })
                       : intl.formatMessage({ id: 'userMenu.status.guest', defaultMessage: '游客' })}
                   </Tag>
                </div>
                <RechargeButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('/recharge');
                  }}
                >
                  <ThunderboltOutlined className="icon" />
                  <span className="text">{intl.formatMessage({ id: 'userMenu.recharge', defaultMessage: '立即充值' })}</span>
                </RechargeButton>
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
                      <span className="label">{item.label}</span>
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
    </UserMenuContainer>
  );
};

export default UserMenu;