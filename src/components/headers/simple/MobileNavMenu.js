import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, Avatar, Divider } from 'antd';
import {
  MenuOutlined,
  HomeOutlined,
  AppstoreOutlined,
  CompassOutlined,
  UserOutlined,
  SettingOutlined,
  ContainerOutlined,
  BellOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { COMMUNITY_CHANNELS_PATH } from 'utils/communityRoutes';

const ToggleButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'};
  color: var(--ant-color-text);
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.15)'
      : 'rgba(59, 130, 246, 0.08)'};
    color: var(--ant-color-primary);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 0;
  }
`;

const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
`;

const UserMeta = styled.div`
  flex: 1;
  min-width: 0;

  .username {
    font-size: 15px;
    font-weight: 600;
    color: var(--ant-color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .email {
    font-size: 12px;
    color: var(--ant-color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const MenuSection = styled.div`
  padding: 8px 12px;
`;

const SectionLabel = styled.div`
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ant-color-text-secondary);
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: ${props => props.$active
    ? props.theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.15)'
      : 'rgba(59, 130, 246, 0.08)'
    : 'transparent'};
  color: ${props => props.$active ? 'var(--ant-color-primary)' : 'var(--ant-color-text)'};
  font-size: 14px;
  font-weight: ${props => props.$active ? 600 : 500};
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  .anticon {
    font-size: 16px;
  }

  &:hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const LanguageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 12px 8px;
`;

const LanguageChip = styled.button`
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid ${props => props.$active
    ? 'var(--ant-color-primary)'
    : 'var(--ant-color-border)'};
  background: ${props => props.$active
    ? props.theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.15)'
      : 'rgba(59, 130, 246, 0.08)'
    : 'transparent'};
  color: ${props => props.$active ? 'var(--ant-color-primary)' : 'var(--ant-color-text)'};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--ant-color-primary);
    color: var(--ant-color-primary);
  }
`;

const ThemeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 12px;
`;

const ThemeToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--ant-color-border);
  background: transparent;
  color: var(--ant-color-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--ant-color-primary);
    color: var(--ant-color-primary);
  }
`;

const LogoutItem = styled(MenuItem)`
  color: var(--ant-color-error);

  &:hover {
    background: rgba(var(--ant-error-rgb), 0.08);
    color: var(--ant-color-error);
  }
`;

const getInitial = (username) => {
  if (!username) return '?';
  return username.charAt(0).toUpperCase();
};

const MobileNavMenu = ({
  userInfo,
  isDark,
  toggleDarkMode,
  onLogout,
  locale,
  languages,
  onLanguageChange,
  isHomePage,
  isWorkspace,
  isCommunityChannels,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const closeAndNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  const handleThemeToggle = (e) => {
    toggleDarkMode(e);
  };

  return (
    <>
      <ToggleButton
        type="button"
        onClick={() => setOpen(true)}
        aria-label={intl.formatMessage({ id: 'header.menu.open', defaultMessage: '打开菜单' })}
      >
        <MenuOutlined />
      </ToggleButton>

      <StyledDrawer
        title={<FormattedMessage id="header.menu.title" defaultMessage="菜单" />}
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={Math.min(320, window.innerWidth * 0.85)}
        styles={{ body: { padding: 0 } }}
      >
        <DrawerContent>
          {userInfo ? (
            <>
              <UserSection>
                <Avatar
                  size={44}
                  src={userInfo.avatar}
                  icon={!userInfo.avatar && <UserOutlined />}
                >
                  {!userInfo.avatar && getInitial(userInfo.username)}
                </Avatar>
                <UserMeta>
                  <div className="username">{userInfo.username}</div>
                  {userInfo.email && <div className="email">{userInfo.email}</div>}
                </UserMeta>
              </UserSection>
              <Divider style={{ margin: 0 }} />
            </>
          ) : null}

          <MenuSection>
            <MenuItem
              type="button"
              $active={isHomePage}
              onClick={() => closeAndNavigate('/')}
            >
              <HomeOutlined />
              <FormattedMessage id="header.homepage" defaultMessage="返回官网" />
            </MenuItem>

            <MenuItem
              type="button"
              $active={isCommunityChannels}
              onClick={() => closeAndNavigate(COMMUNITY_CHANNELS_PATH)}
            >
              <CompassOutlined />
              <FormattedMessage id="header.communityChannels" defaultMessage="社区频道" />
            </MenuItem>

            {userInfo ? (
              <>
                <MenuItem
                  type="button"
                  $active={isWorkspace}
                  onClick={() => closeAndNavigate('/workspace')}
                >
                  <AppstoreOutlined />
                  <FormattedMessage id="header.workspace" defaultMessage="工作空间" />
                </MenuItem>
                <Divider style={{ margin: '8px 0' }} />
                <MenuItem type="button" onClick={() => closeAndNavigate('/profile')}>
                  <UserOutlined />
                  <FormattedMessage id="userMenu.item.profile" defaultMessage="个人中心" />
                </MenuItem>
                <MenuItem type="button" onClick={() => closeAndNavigate('/works')}>
                  <ContainerOutlined />
                  <FormattedMessage id="userMenu.item.works" defaultMessage="我的作品" />
                </MenuItem>
                <MenuItem type="button" onClick={() => closeAndNavigate('/notifications')}>
                  <BellOutlined />
                  <FormattedMessage id="userMenu.item.notifications" defaultMessage="消息通知" />
                </MenuItem>
                <MenuItem type="button" onClick={() => closeAndNavigate('/settings')}>
                  <SettingOutlined />
                  <FormattedMessage id="userMenu.item.settings" defaultMessage="系统设置" />
                </MenuItem>
                <LogoutItem type="button" onClick={handleLogout}>
                  <LogoutOutlined />
                  <FormattedMessage id="userMenu.logout" defaultMessage="退出登录" />
                </LogoutItem>
              </>
            ) : (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <MenuItem type="button" onClick={() => closeAndNavigate('/login')}>
                  <UserOutlined />
                  <FormattedMessage id="login.button" defaultMessage="登录" />
                </MenuItem>
                <MenuItem type="button" onClick={() => closeAndNavigate('/signup')}>
                  <UserOutlined />
                  <FormattedMessage id="signup.button" defaultMessage="注册" />
                </MenuItem>
              </>
            )}
          </MenuSection>

          <Divider style={{ margin: '8px 0' }} />

          <SectionLabel>
            <FormattedMessage id="header.menu.language" defaultMessage="语言" />
          </SectionLabel>
          <LanguageGrid>
            {languages.map((language) => (
              <LanguageChip
                key={language.languageCode}
                type="button"
                $active={locale === language.languageCode}
                onClick={() => onLanguageChange(language.languageCode)}
              >
                {language.languageNameNative}
              </LanguageChip>
            ))}
          </LanguageGrid>

          <SectionLabel>
            <FormattedMessage id="header.menu.theme" defaultMessage="主题模式" />
          </SectionLabel>
          <ThemeRow>
            <span style={{ fontSize: 13, color: 'var(--ant-color-text-secondary)' }}>
              {isDark
                ? intl.formatMessage({ id: 'header.menu.darkMode', defaultMessage: '深色模式' })
                : intl.formatMessage({ id: 'header.menu.lightMode', defaultMessage: '浅色模式' })}
            </span>
            <ThemeToggle type="button" onClick={handleThemeToggle}>
              {isDark ? <SunOutlined /> : <MoonOutlined />}
              {isDark ? (
                <FormattedMessage id="header.menu.switchLight" defaultMessage="切换浅色" />
              ) : (
                <FormattedMessage id="header.menu.switchDark" defaultMessage="切换深色" />
              )}
            </ThemeToggle>
          </ThemeRow>
        </DrawerContent>
      </StyledDrawer>
    </>
  );
};

export default MobileNavMenu;
