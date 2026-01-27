import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ThemeContext } from "styled-components";
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { auth } from "../../../api/auth.js";
import { base } from "../../../api/base.js";
import { useLocale } from 'contexts/LocaleContext';
import Logo from './Logo';
import DarkModeToggle from './DarkModeToggle';
import LanguageSelector from './LanguageSelector';
import UserMenu from './UserMenu';
import {
  Header,
  HeaderContent,
  LeftSection,
  RightSection,
  NavLink,
  PrimaryLink,
  IconNavLink
} from './styles';

const SimpleHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = React.useContext(ThemeContext);
  const intl = useIntl();
  // 使用 theme.mode 而不是内部状态，确保与全局主题同步
  const isDark = theme.mode === 'dark';
  // 先从 localStorage 加载旧的用户信息，避免页面刷新时闪烁
  const [userInfo, setUserInfo] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          return JSON.parse(storedUserInfo);
        } catch (e) {
          console.error("Failed to parse stored user info", e);
        }
      }
    }
    return null;
  });
  const [scrolled, setScrolled] = useState(false);
  const { locale, changeLocale } = useLocale();
  const [languages, setLanguages] = useState([]);

  // 检测当前路由
  const isHomePage = location.pathname === '/';
  const isWorkspace = location.pathname.startsWith('/workspace');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 页面刷新时，如果有 token，异步获取最新的用户信息
    const token = localStorage.getItem('token');
    if (token) {
      // 异步获取最新数据，更新到 state 和 localStorage
      auth.getUserInfo().then(result => {
        if (result.success) {
          const newUserInfo = result.data;
          setUserInfo(newUserInfo);
          // 保存到 localStorage，供下次刷新使用
          localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
        } else {
          // 如果获取失败，保留旧数据（已经在 state 中了，无需处理）
          console.warn("Failed to fetch latest user info, using cached data");
        }
      }).catch(error => {
        // 网络错误等情况，保留旧数据
        console.error("Error fetching user info:", error);
      });
    } else {
      // 如果没有 token，清除用户信息
      setUserInfo(null);
      localStorage.removeItem('userInfo');
    }
  }, []);

  const toggleDarkMode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newIsDark = !isDark;
    theme.setTheme(newIsDark);
    
    // 同时更新用户设置中的主题（如果用户已登录）
    const token = localStorage.getItem('token');
    if (token) {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          settings.interface = settings.interface || {};
          // 手动切换时设置为对应的主题模式（而不是 auto）
          settings.interface.theme = newIsDark ? 'dark' : 'light';
          localStorage.setItem('userSettings', JSON.stringify(settings));
        } catch (e) {
          console.error('Failed to update settings', e);
        }
      }
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  // 获取支持的语言列表
  useEffect(() => {
    const fetchLanguages = async () => {
      const result = await base.getEnabledLanguages();
      if (result.success) {
        const sortedLanguages = result.data.sort((a, b) => b.usageCount - a.usageCount);
        setLanguages(sortedLanguages);
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    // 从CSS变量中提取主题色RGB值
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ant-color-primary')
      .trim();
    
    const bgContainerColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ant-color-bg-container')
      .trim();
      
    const borderColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ant-color-border')
      .trim();
      
    const errorColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ant-color-error')
      .trim();
    
    // 将十六进制颜色转换为RGB
    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '255, 255, 255'; // 默认白色
    };
    
    // 设置RGB变量
    document.documentElement.style.setProperty(
      '--ant-primary-rgb', 
      hexToRgb(primaryColor)
    );
    
    document.documentElement.style.setProperty(
      '--ant-bg-container-rgb', 
      hexToRgb(bgContainerColor)
    );
    
    document.documentElement.style.setProperty(
      '--ant-border-rgb', 
      hexToRgb(borderColor)
    );
    
    document.documentElement.style.setProperty(
      '--ant-error-rgb', 
      hexToRgb(errorColor)
    );
  }, [isDark]); // 当主题切换时重新计算

  return (
    <Header scrolled={scrolled}>
      <HeaderContent>
        <LeftSection>
          <Logo />
        </LeftSection>

        <RightSection>
          <IconNavLink 
            to="/" 
            $active={isHomePage}
            title={intl.formatMessage({ id: 'header.homepage', defaultMessage: '返回官网' })}
          >
            <HomeOutlined />
          </IconNavLink>

          <LanguageSelector 
            locale={locale}
            languages={languages}
            onLanguageChange={changeLocale}
          />

          <DarkModeToggle 
            isDark={isDark}
            toggleDarkMode={toggleDarkMode}
          />
          
          {userInfo ? (
            <>
              <IconNavLink 
                to="/workspace" 
                $active={isWorkspace}
                title={intl.formatMessage({ id: 'header.workspace', defaultMessage: '工作空间' })}
              >
                <AppstoreOutlined />
              </IconNavLink>
              <UserMenu 
                userInfo={userInfo}
                isDark={isDark}
                onLogout={handleLogout}
              />
            </>
          ) : (
            <>
              <NavLink to="/login">
                <FormattedMessage id="login.button" defaultMessage="登录" />
              </NavLink>
              <PrimaryLink to="/signup">
                <FormattedMessage id="signup.button" defaultMessage="注册" />
              </PrimaryLink>
            </>
          )}
        </RightSection>
      </HeaderContent>
    </Header>
  );
};

export default SimpleHeader; 