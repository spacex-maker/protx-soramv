import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro";
import { Link, useNavigate } from "react-router-dom";

import useAnimatedNavToggler from "../../helpers/useAnimatedNavToggler.js";
import logo from "../../images/logo.svg";
import { ReactComponent as MenuIcon } from "feather-icons/dist/icons/menu.svg";
import { ReactComponent as CloseIcon } from "feather-icons/dist/icons/x.svg";
import { ReactComponent as SunIcon } from "feather-icons/dist/icons/sun.svg";
import { ReactComponent as MoonIcon } from "feather-icons/dist/icons/moon.svg";
import { auth } from "../../api/auth.js";

const Header = styled.header`
  ${tw`
    fixed top-0 left-0 right-0
    w-full
    transition-all duration-300
    z-50
    bg-white dark:bg-gray-900
    text-gray-900 dark:text-gray-100
  `}
  background: ${props => props.isScrolled ? `rgba(255, 255, 255, 0.9)` : 'transparent'};
  backdrop-filter: ${props => props.isScrolled ? `blur(8px)` : 'none'};
  box-shadow: ${props => props.isScrolled ? `0 4px 20px rgba(0,0,0,0.05)` : 'none'};
`;

const HeaderContent = tw.div`
  flex justify-between items-center
  max-w-screen-xl mx-auto
  py-5 px-8
  bg-transparent dark:bg-transparent
`;

export const NavLinks = tw.div`inline-block`;

export const NavLink = styled(Link)`
  ${tw`
    text-sm lg:text-base 
    my-2 lg:mx-6 lg:my-0
    font-medium tracking-wide 
    transition duration-300
    text-gray-700 dark:text-gray-300
    hover:text-primary-500 dark:hover:text-primary-400
  `}
`;

export const PrimaryLink = styled(NavLink)`
  ${tw`
    lg:mx-0 
    px-6 py-2 
    rounded-full
    bg-primary-500 dark:bg-primary-600
    hover:bg-primary-600 dark:hover:bg-primary-500
    text-gray-100 dark:text-white
    hocus:text-gray-100 dark:hocus:text-white
    focus:shadow-outline
    border-b-0
  `}
`;

export const LogoLink = styled(Link)`
  ${tw`
    flex items-center 
    font-black border-b-0 
    text-2xl! ml-0!
    text-primary-500 dark:text-primary-400
  `}
  
  img {
    ${tw`w-8 h-8 mr-2`}
  }
`;

export const MobileNavLinksContainer = tw.nav`flex flex-1 items-center justify-between`;
export const NavToggle = tw.button`
  lg:hidden z-20 focus:outline-none text-white hover:text-primary-100 transition duration-300
`;

export const MobileNavLinks = motion(styled.div`
  ${tw`
    lg:hidden z-10 
    fixed top-0 inset-x-0 
    mx-4 my-6 p-8 
    border text-center 
    rounded-lg 
    text-gray-900 dark:text-gray-100
    bg-white dark:bg-gray-900
  `}
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`);

export const DesktopNavLinks = tw.nav`
  hidden lg:flex flex-1 justify-between items-center
`;

const NavGroup = tw.div`
  flex items-center space-x-6 lg:space-x-8
`;

const DarkModeButton = tw.button`
  p-2
  rounded-lg
  text-gray-600 dark:text-gray-300
  hover:bg-gray-100 dark:hover:bg-gray-700
  focus:outline-none
  transition duration-300
  ml-4
`;

const DarkModeIcon = styled.div`
  ${tw`
    w-5 h-5
    text-gray-600 dark:text-gray-300
  `}
  svg {
    ${tw`w-full h-full`}
    stroke-width: 2;
  }
`;

// 添加用户菜单样式
const UserMenu = styled.div`
  ${tw`relative inline-block`}
`;

const UserButton = styled.button`
  ${tw`
    flex items-center space-x-2
    px-3 py-2
    rounded-full
    hover:bg-gray-100 dark:hover:bg-gray-800
    transition duration-300
  `}
`;

const UserAvatar = styled.img`
  ${tw`w-8 h-8 rounded-full object-cover`}
`;

const UserName = tw.span`
  ml-2 font-medium text-gray-700 dark:text-gray-300
`;

const UserDropdown = styled.div`
  ${tw`
    absolute right-0 mt-2
    w-48
    py-2
    bg-white dark:bg-gray-900
    rounded-lg shadow-xl
    z-50
  `}
  display: ${props => props.show ? 'block' : 'none'};
`;

const UserMenuItem = styled.button`
  ${tw`
    w-full px-4 py-2 text-left
    text-sm text-gray-700 dark:text-gray-300
    hover:bg-gray-100 dark:hover:bg-gray-800
    transition duration-300
  `}
`;

export default ({ roundedHeaderButton = false, logoLink, links, className, collapseBreakpointClass = "lg" }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const toggleDarkMode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newIsDark = !isDark;
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDark(newIsDark);
    
    console.log('Theme toggled:', newIsDark ? 'dark' : 'light');
    console.log('classList:', document.documentElement.classList.toString());
  };

  const handleLogout = () => {
    auth.logout();
  };

  const defaultLinks = [
    <NavLinks key={1}>
      <NavGroup>
        <NavLink to="/">首页</NavLink>
        <NavLink to="/navigation">综合导航</NavLink>
        <NavLink to="/about">关于我们</NavLink>
        <NavLink to="/join">入驻申请</NavLink>
        {userInfo ? (
          <UserMenu>
            <UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
              <UserAvatar src={userInfo.avatar} alt={userInfo.username} />
              <UserName>{userInfo.username}</UserName>
            </UserButton>
            <UserDropdown show={showUserMenu}>
              <UserMenuItem onClick={() => {
                setShowUserMenu(false);
                navigate('/profile');
              }}>
                个人中心
              </UserMenuItem>
              <UserMenuItem onClick={handleLogout}>
                退出登录
              </UserMenuItem>
            </UserDropdown>
          </UserMenu>
        ) : (
          <>
            <NavLink to="/login">登录</NavLink>
            <PrimaryLink to="/signup">立即注册</PrimaryLink>
          </>
        )}
        <DarkModeButton 
          type="button"
          onClick={toggleDarkMode}
          aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
        >
          <DarkModeIcon>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </DarkModeIcon>
        </DarkModeButton>
      </NavGroup>
    </NavLinks>
  ];

  const { showNavLinks, animation, toggleNavbar } = useAnimatedNavToggler();
  const collapseBreakpointCss = collapseBreakPointCssMap[collapseBreakpointClass];

  const defaultLogoLink = (
    <LogoLink to="/">
      <img src={logo} alt="logo" />
      <span>ProTX</span>
    </LogoLink>
  );

  logoLink = logoLink || defaultLogoLink;
  links = links || defaultLinks;

  return (
    <Header className={className || "header-light"} isScrolled={isScrolled}>
      <HeaderContent>
        <DesktopNavLinks css={collapseBreakpointCss.desktopNavLinks}>
          {logoLink}
          {links || defaultLinks}
        </DesktopNavLinks>

        <MobileNavLinksContainer css={collapseBreakpointCss.mobileNavLinksContainer}>
          {logoLink}
          <MobileNavLinks 
            initial={{ x: "150%", display: "none" }} 
            animate={animation} 
            css={collapseBreakpointCss.mobileNavLinks}
          >
            {links || defaultLinks}
          </MobileNavLinks>
          <NavToggle 
            onClick={toggleNavbar} 
            className={showNavLinks ? "open" : "closed"}
          >
            {showNavLinks ? <CloseIcon tw="w-6 h-6" /> : <MenuIcon tw="w-6 h-6" />}
          </NavToggle>
        </MobileNavLinksContainer>
      </HeaderContent>
    </Header>
  );
};

const collapseBreakPointCssMap = {
  sm: {
    mobileNavLinks: tw`sm:hidden`,
    desktopNavLinks: tw`sm:flex`,
    mobileNavLinksContainer: tw`sm:hidden`
  },
  md: {
    mobileNavLinks: tw`md:hidden`,
    desktopNavLinks: tw`md:flex`,
    mobileNavLinksContainer: tw`md:hidden`
  },
  lg: {
    mobileNavLinks: tw`lg:hidden`,
    desktopNavLinks: tw`lg:flex`,
    mobileNavLinksContainer: tw`lg:hidden`
  },
  xl: {
    mobileNavLinks: tw`lg:hidden`,
    desktopNavLinks: tw`lg:flex`,
    mobileNavLinksContainer: tw`lg:hidden`
  }
};
