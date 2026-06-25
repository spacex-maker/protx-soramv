import React, { useState } from "react";
import 'antd/dist/reset.css'; // 只需要这一个样式文件即可
import GlobalStyles from './styles/GlobalStyles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, message } from 'antd';
import { ThemeProvider } from 'styled-components';
import LoginPage from "./pages/Login";
import IpBlockedPage from "./pages/IpBlocked";
import SignupPage from "./pages/Signup";
import OpenRobotXLoginPage from "./pages/OpenRobotX/auth/OpenRobotXLoginPage";
import OpenRobotXSignupPage from "./pages/OpenRobotX/auth/OpenRobotXSignupPage";
import ResetPasswordPage from "./pages/ResetPassword";
import JoinUs from "pages/JoinUs";
import Navigation from "pages/Navigation";
import ProfilePage from "pages/Profile";
import VerificationPage from "pages/Verification";
import BillingPage from "pages/Billing";
import RechargePage from "pages/Recharge";
import RechargeSuccessPage from "pages/RechargeSuccess";
import RechargeAgreementPage from "pages/RechargeAgreement";
import PrivacyPreferencesPage from "pages/PrivacyPreferences";
import OrdersPage from "pages/Orders";
import WorksPage from "pages/Works";
import WorkSharePage from "pages/Works/WorkSharePage";
import NotificationsPage from "pages/Notifications";
import InvitePage from "pages/Invite";
import UserLevelPage from "pages/UserLevel";
import FeedbackPage from "pages/Feedback";
import HelpPage from "pages/Help";
import AboutPage from "pages/About";
import PartnerSurvey from "pages/PartnerSurvey";
import CloudDrivePage from "./pages/Workspace"; // 工作台页面组件
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import koKR from 'antd/locale/ko_KR';
import { LocaleProvider } from './contexts/LocaleContext';
import { Helmet } from 'react-helmet';
import FileDecryptPage from './pages/FileDecrypt';
import TestCrypto from './pages/TestCrypto';
import HomePage from './pages/Home';
import StorageNodes from './pages/Workspace/StorageNodes';
import UnderDevelopmentPage from './pages/UnderDevelopment';
import TermsOfServicePage from './pages/TermsOfService';
import PrivacyPolicyPage from './pages/PrivacyPolicy';
import GoogleCallback from './pages/GoogleCallback';
import CommunityPage from './pages/Community';
import {
  CommunityExplorePage,
  ChannelDetailPage,
  LegacyCommunityChannelRedirect,
} from './pages/Community/channels';
import PostDetailPage from './pages/Community/PostDetail';
import MySavedPostsPage from './pages/Community/MySavedPostsPage';
import CommunityUserProfilePage from './pages/Community/CommunityUserProfilePage';
import ChallengeDetailPage from './pages/Community/ChallengeDetailPage';
import ChallengeHubPage from './pages/Community/ChallengeHubPage';
import ResumePage from './pages/Resume';
import OpenRobotXPage from './pages/OpenRobotX';
import OpenRobotXCompanyPage from './pages/OpenRobotX/companies/CompanyPage';
import OpenRobotXRobotPage from './pages/OpenRobotX/robots/RobotPage';
import OpenRobotXNewsListPage from './pages/OpenRobotX/news/NewsListPage';
import OpenRobotXNewsDetailPage from './pages/OpenRobotX/news/NewsDetailPage';
import OpenRobotXAgiPathPage from './pages/OpenRobotX/agi/AgiPathPage';
import ImageCompress from './pages/Workspace/MediaTools/components/ImageCompress';
import MediaToolsPage from './pages/MediaToolsPage';
import SeedanceVideoPage from './pages/SeedanceVideoPage';
import SettingsPage from './pages/Settings';
import { getUserSettings } from './api/settings';
import CookieConsentBanner from './components/CookieConsentBanner';

// 语言配置映射
const localeMap = {
  zh_CN: zhCN,
  en_US: enUS,
  ja_JP: jaJP,
  ko_KR: koKR,
};

// 路由守卫组件
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // 检查用户是否已登录
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 根路径路由组件：seedance2.cn 域名下 / 直接显示 Seedance 图生视频页（不做登录鉴权），否则显示主页
const RootRoute = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'seedance2.cn') {
    return <SeedanceVideoPage />;
  }
  return <HomePage />;
};

// Seedance 页路由：seedance2.cn、本地(localhost/127.0.0.1) 不做登录鉴权，其他域名需登录
const SeedanceVideoRoute = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    const isSeedanceDomain = host === 'seedance2.cn';
    if (isLocal || isSeedanceDomain) {
      return <SeedanceVideoPage />;
    }
  }
  return (
    <PrivateRoute>
      <SeedanceVideoPage />
    </PrivateRoute>
  );
};

export default function App() {
  const [isDark, setIsDark] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // 默认使用暗黑模式：如果有保存的主题则使用保存的，否则默认暗黑模式
    return savedTheme ? savedTheme === 'dark' : true;
  });
  
  const [isThemeLoaded, setIsThemeLoaded] = React.useState(false);

  const [locale, setLocale] = useState('zh_CN');

  // 设置 message 全局配置
  message.config({
    top: 60,
    duration: 2,
    maxCount: 3,
  });

  const themeConfig = React.useMemo(() => ({
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // 主色调
      colorPrimary: '#3b82f6',
      colorPrimaryBg: isDark ? '#1d2b53' : '#eff6ff',
      colorPrimaryBgHover: isDark ? '#1e3a8a' : '#dbeafe',
      colorPrimaryBorder: isDark ? '#2563eb' : '#93c5fd',
      colorPrimaryHover: isDark ? '#60a5fa' : '#2563eb',
      colorPrimaryActive: isDark ? '#3b82f6' : '#1d4ed8',
      colorPrimaryTextHover: isDark ? '#60a5fa' : '#2563eb',
      colorPrimaryText: isDark ? '#3b82f6' : '#1d4ed8',
      colorPrimaryTextActive: isDark ? '#2563eb' : '#1e40af',

      // 成功色
      colorSuccess: '#10b981',
      colorSuccessBg: isDark ? '#064e3b' : '#ecfdf5',
      colorSuccessBorder: isDark ? '#059669' : '#6ee7b7',
      colorSuccessHover: isDark ? '#34d399' : '#059669',
      colorSuccessActive: isDark ? '#10b981' : '#047857',
      colorSuccessText: isDark ? '#10b981' : '#047857',
      colorSuccessTextHover: isDark ? '#34d399' : '#059669',
      colorSuccessTextActive: isDark ? '#059669' : '#065f46',

      // 警告色
      colorWarning: '#f59e0b',
      colorWarningBg: isDark ? '#783c00' : '#fffbeb',
      colorWarningBorder: isDark ? '#d97706' : '#fcd34d',
      colorWarningHover: isDark ? '#fbbf24' : '#d97706',
      colorWarningActive: isDark ? '#f59e0b' : '#b45309',
      colorWarningText: isDark ? '#f59e0b' : '#b45309',
      colorWarningTextHover: isDark ? '#fbbf24' : '#d97706',
      colorWarningTextActive: isDark ? '#d97706' : '#92400e',

      // 错误色
      colorError: '#ef4444',
      colorErrorBg: isDark ? '#7f1d1d' : '#fef2f2',
      colorErrorBorder: isDark ? '#dc2626' : '#fca5a5',
      colorErrorHover: isDark ? '#f87171' : '#dc2626',
      colorErrorActive: isDark ? '#ef4444' : '#b91c1c',
      colorErrorText: isDark ? '#ef4444' : '#b91c1c',
      colorErrorTextHover: isDark ? '#f87171' : '#dc2626',
      colorErrorTextActive: isDark ? '#dc2626' : '#991b1b',

      // 信息色
      colorInfo: '#3b82f6',
      colorInfoBg: isDark ? '#1e3a8a' : '#eff6ff',
      colorInfoBorder: isDark ? '#2563eb' : '#93c5fd',
      colorInfoHover: isDark ? '#60a5fa' : '#2563eb',
      colorInfoActive: isDark ? '#3b82f6' : '#1d4ed8',
      colorInfoText: isDark ? '#3b82f6' : '#1d4ed8',
      colorInfoTextHover: isDark ? '#60a5fa' : '#2563eb',
      colorInfoTextActive: isDark ? '#2563eb' : '#1e40af',

      // 中性色
      colorTextBase: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      colorBgBase: isDark ? '#141414' : '#dfe3e8',
      
      // 其他基础配置保持不变
      borderRadius: 4,
      fontSize: 14,
      fontSizeSM: 12,
      fontSizeLG: 16,
      fontSizeXL: 20,
      lineHeight: 1.5715,
      
      // 背景色系统（明亮模式：中浅灰层次，避免纯白刺眼）
      colorBgContainer: isDark ? '#1f1f1f' : '#e8eaed',
      colorBgElevated: isDark ? '#1f1f1f' : '#eceef1',
      colorBgLayout: isDark ? '#141414' : '#dfe3e8',
      colorBgSpotlight: isDark ? '#1f1f1f' : '#eceef1',
      colorBgMask: 'rgba(0, 0, 0, 0.45)',
      
      // 文字颜色系统
      colorText: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
      colorTextTertiary: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      colorTextQuaternary: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
      
      // 边框颜色系统
      colorBorder: isDark ? '#303030' : '#c9cdd4',
      colorBorderSecondary: isDark ? '#303030' : '#d8dce2',
      colorSplit: isDark ? '#303030' : '#d8dce2',
    },
    components: {
      Button: {
        borderRadius: 20,
        controlHeight: 36,
        paddingContentHorizontal: 20,
      },
      Input: {
        borderRadius: 20,
        controlHeight: 36,
        colorBgContainer: isDark ? '#1f1f1f' : '#eceef1',
      },
      Select: {
        borderRadius: 4,
        colorBgContainer: isDark ? '#1f1f1f' : '#eceef1',
      },
      Pagination: {
        borderRadius: 4,
      },
      Checkbox: {
        borderRadius: 4,
      },
      Modal: {
        borderRadius: 20,
        contentBorderRadius: 20,
        headerBg: 'var(--ant-color-bg-container)',
      },
      Drawer: {
        borderRadius: 20,
      },
      Dropdown: {
        borderRadius: 20,
      },
      Popover: {
        borderRadius: 20,
      },
      Tooltip: {
        borderRadius: 20,
      },
      Message: {
        zIndex: 1050,
      },
      Card: {
        borderRadius: 8,
        colorBgContainer: isDark ? '#1f1f1f' : '#eceef1',
      },
      Layout: {
        bodyBg: isDark ? '#141414' : '#dfe3e8',
        headerBg: isDark ? '#1f1f1f' : '#e8eaed',
        siderBg: isDark ? '#141414' : '#dfe3e8',
      },
    },
  }), [isDark]);

  // 主题切换处理函数
  const handleThemeChange = React.useCallback((dark) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  // 加载用户设置并初始化主题
  React.useEffect(() => {
    const loadUserSettings = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getUserSettings();
          if (response.data?.success && response.data?.data) {
            const userSettings = response.data.data;
            
            // 从后端数据转换为前端格式
            const themeMode = userSettings.interfaceTheme || 'auto';
            
            // 根据用户设置的主题模式设置主题
            if (themeMode === 'light') {
              handleThemeChange(false);
            } else if (themeMode === 'dark') {
              handleThemeChange(true);
            } else if (themeMode === 'auto') {
              // 自动模式：根据系统偏好
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              handleThemeChange(prefersDark);
            }
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
          // 如果加载失败，使用 localStorage 中的主题设置
        }
      }
      setIsThemeLoaded(true);
    };
    
    loadUserSettings();
  }, [handleThemeChange]);

  React.useEffect(() => {
    if (isThemeLoaded) {
      handleThemeChange(isDark);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const token = localStorage.getItem('token');
        const savedSettings = localStorage.getItem('userSettings');
        if (token && savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            // 只有在自动模式下才响应系统主题变化
            if (settings.interface?.theme === 'auto') {
              handleThemeChange(e.matches);
            }
          } catch (e) {
            console.error('Failed to parse saved settings', e);
          }
        } else if (!localStorage.getItem('theme')) {
          handleThemeChange(e.matches);
        }
      };

      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [handleThemeChange, isDark, isThemeLoaded]);

  // Manually set CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    const textColor = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)';
    root.style.setProperty('--ant-color-text', textColor);
  }, [isDark]);

  return (
    <LocaleProvider>
      <Helmet>
        <meta name="application-name" content="AI2OBJ" />
        <meta name="apple-mobile-web-app-title" content="AI2OBJ" />
      </Helmet>
      <ThemeProvider theme={{ 
        mode: isDark ? 'dark' : 'light',
        setTheme: handleThemeChange 
      }}>
        <ConfigProvider
          locale={localeMap[locale]}
          theme={themeConfig}
        >
          <GlobalStyles />
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <CookieConsentBanner />
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/media-tools" element={<MediaToolsPage />} />
              <Route path="/tools" element={<MediaToolsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/blocked" element={<IpBlockedPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/workspace" element={<Navigate to="/workspace/create/image-generation" replace />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
              <Route path="/verification/*" element={
                <PrivateRoute>
                  <VerificationPage />
                </PrivateRoute>
              } />
              <Route path="/billing" element={
                <PrivateRoute>
                  <BillingPage />
                </PrivateRoute>
              } />
              <Route path="/recharge" element={
                <PrivateRoute>
                  <RechargePage />
                </PrivateRoute>
              } />
              <Route path="/recharge/success" element={
                <PrivateRoute>
                  <RechargeSuccessPage />
                </PrivateRoute>
              } />
              <Route path="/recharge-agreement" element={<RechargeAgreementPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/privacy-preferences" element={
                <PrivateRoute>
                  <PrivacyPreferencesPage />
                </PrivateRoute>
              } />
              <Route path="/settings" element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              } />
              <Route path="/orders" element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              } />
              <Route path="/notifications" element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              } />
              <Route path="/invite" element={
                <PrivateRoute>
                  <InvitePage />
                </PrivateRoute>
              } />
              <Route path="/user-level" element={
                <PrivateRoute>
                  <UserLevelPage />
                </PrivateRoute>
              } />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/join-us" element={<JoinUs />} />
              <Route path="/works/s/:shareCode" element={<WorkSharePage />} />
              <Route path="/works" element={
                <PrivateRoute>
                  <WorksPage />
                </PrivateRoute>
              } />
              <Route path="/test-crypto" element={<TestCrypto />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/workspace/create" element={<Navigate to="/workspace/create/image-generation" replace />} />
              {/* 创作用单一路由，切换 Tab 只改 URL 不重挂载页面，已加载的 tab 内容不刷新 */}
              <Route
                path="/workspace/create/*"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route path="/seedance-video" element={<SeedanceVideoRoute />} />
              <Route
                path="/workspace/all"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/trash"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/decrypt"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/media-tools"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/prompt-market"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/channels"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/daily-challenge/:challengeId"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/daily-challenge"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/recharge"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/my-prompts"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/embedding"
                element={
                  <PrivateRoute>
                    <CloudDrivePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/storage-nodes"
                element={
                  <PrivateRoute>
                    <CloudDrivePage>
                      <StorageNodes />
                    </CloudDrivePage>
                  </PrivateRoute>
                }
              />
              {/* 社区相关路由（免登录浏览） */}
              <Route path="/community/channels" element={<CommunityExplorePage />} />
              <Route path="/community/explore" element={<Navigate to="/community/channels" replace />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/challenge" element={<ChallengeHubPage />} />
              <Route path="/community/challenge/:challengeId" element={<ChallengeDetailPage />} />
              <Route path="/community/daily-challenge" element={
                <Navigate to="/community/challenge" replace />
              } />
              <Route path="/community/user/:userId" element={<CommunityUserProfilePage />} />
              <Route path="/community/s/:shareCode" element={<PostDetailPage />} />
              <Route path="/community/post/:postId" element={<PostDetailPage />} />
              <Route path="/community/saved" element={
                <PrivateRoute>
                  <MySavedPostsPage />
                </PrivateRoute>
              } />
              <Route path="/community/collected" element={<Navigate to="/community/saved?tab=collect" replace />} />
              <Route path="/community/liked" element={<Navigate to="/community/saved?tab=like" replace />} />
              <Route path="/community/history" element={<Navigate to="/community/saved?tab=history" replace />} />
              <Route path="/community/c/:channelKey" element={<ChannelDetailPage />} />
              <Route path="/community/:channelKey" element={<LegacyCommunityChannelRedirect />} />
              {/* Open Robot X 官网落地页 */}
              <Route path="/openrobotx" element={<OpenRobotXPage />} />
              <Route path="/openrobotx/companies/:slug" element={<OpenRobotXCompanyPage />} />
              <Route path="/openrobotx/robots/:id" element={<OpenRobotXRobotPage />} />
              <Route path="/openrobotx/news" element={<OpenRobotXNewsListPage />} />
              <Route path="/openrobotx/news/:id" element={<OpenRobotXNewsDetailPage />} />
              <Route path="/openrobotx/agi-path" element={<OpenRobotXAgiPathPage />} />
              <Route path="/openrobotx/login" element={<OpenRobotXLoginPage />} />
              <Route path="/openrobotx/signup" element={<OpenRobotXSignupPage />} />
              {/* 媒体工具路由 */}
              <Route path="/workspace/media-tools/image-compress" element={
                <PrivateRoute>
                  <ImageCompress />
                </PrivateRoute>
              } />
              {/* 404 路由 - 捕获所有未匹配的路由 */}
              <Route path="*" element={<UnderDevelopmentPage />} />
            </Routes>
          </Router>
        </ConfigProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
