import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "styled-components";
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
  PrimaryLink
} from './styles';

const SimpleHeader = () => {
  const navigate = useNavigate();
  const theme = React.useContext(ThemeContext);
  const [isDark, setIsDark] = useState(theme.mode === 'dark');
  const [userInfo, setUserInfo] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { locale, changeLocale } = useLocale();
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 从本地存储获取用户信息
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      // 如果本地没有用户信息但有token，尝试重新获取
      const token = localStorage.getItem('token');
      if (token) {
        auth.getUserInfo().then(result => {
          if (result.success) {
            setUserInfo(result.data);
          }
        });
      }
    }
  }, []);

  const toggleDarkMode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newIsDark = !isDark;
    theme.setTheme(newIsDark);
    setIsDark(newIsDark);
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
            <UserMenu 
              userInfo={userInfo}
              isDark={isDark}
              onLogout={handleLogout}
            />
          ) : (
            <>
              <NavLink to="/login">登录</NavLink>
              <PrimaryLink to="/signup">注册</PrimaryLink>
            </>
          )}
        </RightSection>
      </HeaderContent>
    </Header>
  );
};

export default SimpleHeader; 