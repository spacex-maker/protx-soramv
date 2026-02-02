import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Dropdown } from 'antd';
import { GithubOutlined, GlobalOutlined, DownOutlined, UserOutlined, LogoutOutlined, MenuOutlined, AppstoreOutlined, MailOutlined } from '@ant-design/icons';
import { useLocale } from 'contexts/LocaleContext';
import { auth } from 'api/auth';
import SubscribeRulesModal from './SubscribeRulesModal';

const addImageCompressSuffix = (url, width = 100) => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(10, 14, 23, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const Logo = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  flex-shrink: 0;

  .x {
    color: #00d4aa;
  }

  &:hover {
    opacity: 0.9;
  }
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const HamburgerBtn = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #e8eaed;
  font-size: 20px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: rgba(0, 212, 170, 0.15);
    color: #00d4aa;
  }
  @media (max-width: 768px) {
    display: flex;
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 98;
  @media (max-width: 768px) {
    display: ${(p) => (p.$open ? 'block' : 'none')};
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 56px;
  right: 0;
  bottom: 0;
  width: min(280px, 85vw);
  max-width: 280px;
  background: #0a0e17;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 99;
  padding: 20px 0 24px;
  overflow-y: auto;
  transform: translateX(${(p) => (p.$open ? '0' : '100%')});
  transition: transform 0.25s ease;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.3);
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 16px;
`;

const MobileMenuUser = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0, 212, 170, 0.3);
    color: #00d4aa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .name {
    font-size: 15px;
    color: #e8eaed;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const MobileMenuAuth = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const MobileNav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
`;

const MobileNavItem = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  font-size: 15px;
  color: #e8eaed;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: rgba(0, 212, 170, 0.1);
    color: #00d4aa;
  }
`;

const MobileNavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 12px;
  font-size: 15px;
  color: #e8eaed;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: rgba(0, 212, 170, 0.1);
    color: #00d4aa;
  }
  &.active {
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.08);
  }
  &.danger:hover {
    color: #f87171;
    background: rgba(248, 113, 113, 0.1);
  }
`;

const MobileDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 12px 0;
`;

const MobileUserRow = styled.div`
  padding: 12px 16px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const NavLink = styled.a`
  color: #9aa0a6;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.08);
  }
`;

const SubscribeBtn = styled.button`
  color: #9aa0a6;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.08);
  }
  .anticon { font-size: 14px; }
`;

/** 探索下拉触发按钮 */
const ExploreBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #9aa0a6;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.08);
  }
  .anticon { font-size: 14px; }
`;

const ExplorePanel = styled.div`
  min-width: 180px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(18, 22, 32, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const ExploreItem = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #e8eaed;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #00d4aa;
  }
  &.active {
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.12);
  }
`;

const StyledNavLink = styled(NavLink)`
  ${(p) => p.$active && 'color: #00d4aa; background: rgba(0, 212, 170, 0.08);'}
`;

const LangBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #9aa0a6;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.08);
  }
  .anticon { font-size: 14px; }
  span { max-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const LoginLink = styled(Link)`
  color: #9aa0a6;
  font-size: 14px;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.08);
  }
`;

const SignupLink = styled(Link)`
  color: #00d4aa;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #00d4aa;
  background: transparent;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #0a0e17;
    background: #00d4aa;
  }
`;

const UserBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #e8eaed;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: rgba(0, 212, 170, 0.4);
    background: rgba(0, 212, 170, 0.08);
  }
  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 212, 170, 0.3);
    color: #00d4aa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .name { max-width: 96px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const LangPanel = styled.div`
  min-width: 160px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(18, 22, 32, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const LangItem = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #e8eaed;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #00d4aa;
  }
  &.selected {
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.12);
  }
`;

const UserPanel = styled.div`
  min-width: 160px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(18, 22, 32, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const UserItem = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #e8eaed;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  &.danger:hover {
    color: #f87171;
    background: rgba(248, 113, 113, 0.1);
  }
`;

const OpenRobotXHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, changeLocale } = useLocale();
  const isNews = location.pathname.startsWith('/openrobotx/news');
  const isAgiPath = location.pathname === '/openrobotx/agi-path';

  const [userInfo, setUserInfo] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const stored = localStorage.getItem('userInfo');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  /** 本站仅支持中英文 */
  const [languages] = useState([
    { languageCode: 'zh-CN', languageNameNative: '简体中文' },
    { languageCode: 'en-US', languageNameNative: 'English' },
  ]);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleAnchor = (hash) => {
    closeMenu();
    if (location.pathname !== '/openrobotx') {
      navigate('/openrobotx');
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreAnchor = (hash) => {
    setExploreOpen(false);
    if (location.pathname !== '/openrobotx') {
      navigate('/openrobotx');
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.getUserInfo().then((result) => {
        if (result?.success && result?.data) {
          setUserInfo(result.data);
          localStorage.setItem('userInfo', JSON.stringify(result.data));
        }
      }).catch(() => {});
    } else {
      setUserInfo(null);
    }
  }, []);

  const handleLogout = () => {
    auth.logout({ redirectTo: '/openrobotx/login' });
  };

  const currentLang = languages.find((l) => l.languageCode === locale);

  return (
    <>
      <Header>
        <Logo type="button" onClick={() => navigate('/openrobotx')}>
          Open Robot <span className="x">X</span>
        </Logo>
        <Nav>
          <Dropdown
            open={exploreOpen}
            onOpenChange={setExploreOpen}
            trigger={['click']}
            placement="bottomLeft"
            dropdownRender={() => (
              <ExplorePanel>
                <ExploreItem
                  type="button"
                  onClick={() => handleExploreAnchor('#robot-companies')}
                >
                  十大机器人公司
                </ExploreItem>
                <ExploreItem
                  type="button"
                  className={isNews ? 'active' : ''}
                  onClick={() => {
                    setExploreOpen(false);
                    navigate('/openrobotx/news');
                  }}
                >
                  行业资讯
                </ExploreItem>
                <ExploreItem
                  type="button"
                  className={isAgiPath ? 'active' : ''}
                  onClick={() => {
                    setExploreOpen(false);
                    navigate('/openrobotx/agi-path');
                  }}
                >
                  通往 AGI 之路
                </ExploreItem>
              </ExplorePanel>
            )}
          >
            <ExploreBtn type="button">
              <AppstoreOutlined />
              <span>探索</span>
              <DownOutlined style={{ fontSize: 10, opacity: 0.7 }} />
            </ExploreBtn>
          </Dropdown>
          <SubscribeBtn type="button" onClick={() => setSubscribeModalOpen(true)}>
            <MailOutlined /> 订阅
          </SubscribeBtn>
          <NavLink href="https://github.com/spacex-maker" target="_blank" rel="noopener noreferrer">
            <GithubOutlined /> GitHub
          </NavLink>

          <Dropdown
            open={langOpen}
            onOpenChange={setLangOpen}
            trigger={['click']}
            placement="bottomRight"
            dropdownRender={() => (
              <LangPanel>
                {languages.map((lang) => (
                  <LangItem
                    key={lang.languageCode}
                    type="button"
                    className={locale === lang.languageCode ? 'selected' : ''}
                    onClick={() => {
                      changeLocale(lang.languageCode);
                      setLangOpen(false);
                    }}
                  >
                    {lang.languageNameNative}
                  </LangItem>
                ))}
              </LangPanel>
            )}
          >
            <LangBtn type="button">
              <GlobalOutlined />
              <span>{currentLang?.languageNameNative || locale || '语言'}</span>
              <DownOutlined style={{ fontSize: 10, opacity: 0.7 }} />
            </LangBtn>
          </Dropdown>

          {userInfo ? (
            <Dropdown
              open={userOpen}
              onOpenChange={setUserOpen}
              trigger={['click']}
              placement="bottomRight"
              dropdownRender={() => (
                <UserPanel>
                  <UserItem
                    type="button"
                    onClick={() => {
                      setUserOpen(false);
                      navigate('/profile');
                    }}
                  >
                    <UserOutlined /> 个人中心
                  </UserItem>
                  <UserItem
                    type="button"
                    className="danger"
                    onClick={() => {
                      setUserOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogoutOutlined /> 退出登录
                  </UserItem>
                </UserPanel>
              )}
            >
              <UserBtn type="button">
                <span className="avatar">
                  {userInfo.avatar ? (
                    <img src={addImageCompressSuffix(userInfo.avatar, 100)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    (userInfo.nickname || userInfo.username || '?').charAt(0).toUpperCase()
                  )}
                </span>
                <span className="name">{userInfo.nickname || userInfo.username || '用户'}</span>
                <DownOutlined style={{ fontSize: 10, opacity: 0.7 }} />
              </UserBtn>
            </Dropdown>
          ) : (
            <>
              <LoginLink to={{ pathname: '/openrobotx/login', state: { from: location.pathname || '/openrobotx' } }}>登录</LoginLink>
              <SignupLink to={{ pathname: '/openrobotx/signup', state: { from: location.pathname || '/openrobotx' } }}>注册</SignupLink>
            </>
          )}
        </Nav>

        <HamburgerBtn type="button" onClick={() => setMenuOpen(true)} aria-label="打开菜单">
          <MenuOutlined />
        </HamburgerBtn>
      </Header>

      <Overlay $open={menuOpen} onClick={closeMenu} aria-hidden="true" />
      <MobileMenu $open={menuOpen} role="dialog" aria-label="导航菜单">
        <MobileMenuHeader>
          {userInfo ? (
            <MobileMenuUser>
              <span className="avatar">
                {userInfo.avatar ? (
                  <img src={addImageCompressSuffix(userInfo.avatar, 100)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  (userInfo.nickname || userInfo.username || '?').charAt(0).toUpperCase()
                )}
              </span>
              <span className="name">{userInfo.nickname || userInfo.username || '用户'}</span>
            </MobileMenuUser>
          ) : (
            <MobileMenuAuth>
              <LoginLink to={{ pathname: '/openrobotx/login', state: { from: location.pathname || '/openrobotx' } }} onClick={closeMenu}>登录</LoginLink>
              <SignupLink to={{ pathname: '/openrobotx/signup', state: { from: location.pathname || '/openrobotx' } }} onClick={closeMenu}>注册</SignupLink>
            </MobileMenuAuth>
          )}
        </MobileMenuHeader>
        <MobileNav>
          <MobileNavButton type="button" onClick={() => { handleAnchor('#robot-companies'); }}>
            十大机器人公司
          </MobileNavButton>
          <MobileNavButton
            type="button"
            className={isNews ? 'active' : ''}
            onClick={() => { closeMenu(); navigate('/openrobotx/news'); }}
          >
            行业资讯
          </MobileNavButton>
          <MobileNavButton
            type="button"
            className={isAgiPath ? 'active' : ''}
            onClick={() => { closeMenu(); navigate('/openrobotx/agi-path'); }}
          >
            通往 AGI 之路
          </MobileNavButton>
          <MobileNavButton type="button" onClick={() => { closeMenu(); setSubscribeModalOpen(true); }}>
            <MailOutlined /> 订阅
          </MobileNavButton>
          <MobileNavItem href="https://github.com/spacex-maker" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
            <GithubOutlined /> GitHub
          </MobileNavItem>
          <MobileDivider />
          {languages.map((lang) => (
            <MobileNavButton
              key={lang.languageCode}
              type="button"
              className={locale === lang.languageCode ? 'active' : ''}
              onClick={() => {
                changeLocale(lang.languageCode);
              }}
            >
              <GlobalOutlined /> {lang.languageNameNative}
            </MobileNavButton>
          ))}
        </MobileNav>
        {userInfo && (
          <MobileUserRow>
            <MobileNavButton type="button" onClick={() => { closeMenu(); navigate('/profile'); }}>
              <UserOutlined /> 个人中心
            </MobileNavButton>
            <MobileNavButton type="button" className="danger" onClick={() => { closeMenu(); handleLogout(); }}>
              <LogoutOutlined /> 退出登录
            </MobileNavButton>
          </MobileUserRow>
        )}
      </MobileMenu>
      <SubscribeRulesModal
        open={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
        onGoSubscribe={() => handleAnchor('#subscribe')}
      />
    </>
  );
};

export default OpenRobotXHeader;
