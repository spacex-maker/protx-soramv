import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import styled, { keyframes, css, ThemeContext } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useIntl } from "react-intl";
import SimpleHeader from "components/headers/simple";
import { getUserSettings, saveUserSettings, resetUserSettings } from "api/settings";
import { base } from "api/base";
import { useLocale } from "contexts/LocaleContext";
import { 
  ConfigProvider, 
  theme, 
  Switch, 
  Select, 
  Slider, 
  Button, 
  message,
  Divider,
  Modal,
  Input,
  Space
} from "antd";
import { 
  SettingOutlined,
  BellOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  LockOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  SoundOutlined,
  MobileOutlined,
  DesktopOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleFilled,
  ExperimentOutlined,
  RobotOutlined,
  CloudOutlined,
  SecurityScanOutlined,
  FolderOutlined,
  ApiOutlined,
  TeamOutlined,
  SafetyOutlined,
  FilterOutlined,
  FileImageOutlined,
  TagOutlined,
  CloudServerOutlined,
  MessageOutlined,
  UserAddOutlined,
  HeartOutlined,
  LoginOutlined
} from "@ant-design/icons";

// ==========================================
// 动画效果
// ==========================================

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

// ==========================================
// 样式组件
// ==========================================

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.$token.colorBgLayout};
  color: ${props => props.$token.colorText};
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
  
  /* 背景装饰 */
  &::before {
    content: '';
    position: fixed;
    top: -15%;
    right: -10%;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, ${props => props.$token.colorPrimary}08 0%, transparent 70%);
    filter: blur(100px);
    z-index: 0;
    pointer-events: none;
    animation: ${floatAnimation} 20s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: fixed;
    bottom: -20%;
    left: -5%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${props => props.$token.colorInfo}06 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
    animation: ${floatAnimation} 25s ease-in-out infinite reverse;
  }
`;

const ContentContainer = styled(motion.div)`
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  padding: 100px 16px 60px;
  position: relative;
  z-index: 10;
  
  @media (min-width: 768px) {
    padding: 120px 24px 80px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
  
  .header-content {
    display: inline-block;
    position: relative;
  }
  
  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, ${props => props.$token.colorPrimary}, ${props => props.$token.colorInfo});
    margin-bottom: 20px;
    box-shadow: 0 8px 24px ${props => props.$token.colorPrimary}30;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: ${shimmer} 2s infinite;
    }
    
    .anticon {
      font-size: 36px;
      color: #fff;
      position: relative;
      z-index: 1;
    }
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 12px;
    background: linear-gradient(135deg, ${props => props.$token.colorText}, ${props => props.$token.colorTextSecondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    @media (min-width: 768px) {
      font-size: 42px;
    }
  }
  
  p {
    font-size: 16px;
    color: ${props => props.$token.colorTextSecondary};
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SettingCard = styled(motion.div)`
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border-color: ${props => props.$token.colorPrimary}30;
    transform: translateY(-2px);
  }
  
  /* 装饰性渐变背景 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, ${props => props.$token.colorPrimary}05 0%, transparent 70%);
    pointer-events: none;
    opacity: ${props => props.$highlighted ? 1 : 0};
    transition: opacity 0.3s ease;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    
    .icon-box {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${props => props.$iconColor || props.$token.colorPrimary}15;
      color: ${props => props.$iconColor || props.$token.colorPrimary};
      font-size: 24px;
      transition: all 0.3s ease;
    }
    
    &:hover .icon-box {
      transform: scale(1.1) rotate(5deg);
    }
    
    .title-group {
      flex: 1;
      
      h3 {
        font-size: 18px;
        font-weight: 600;
        color: ${props => props.$token.colorText};
        margin: 0 0 4px;
      }
      
      p {
        font-size: 13px;
        color: ${props => props.$token.colorTextSecondary};
        margin: 0;
      }
    }
  }
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid ${props => props.$token.colorBorderSecondary};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
  
  .item-info {
    flex: 1;
    min-width: 0;
    margin-right: 16px;
    
    .label {
      font-size: 15px;
      font-weight: 500;
      color: ${props => props.$token.colorText};
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .description {
      font-size: 13px;
      color: ${props => props.$token.colorTextSecondary};
      line-height: 1.5;
    }
  }
  
  .item-control {
    flex-shrink: 0;
  }
`;

const ThemePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
`;

const ThemeOption = styled.div`
  height: 80px;
  border-radius: 12px;
  border: 2px solid ${props => props.$active ? props.$token.colorPrimary : props.$token.colorBorder};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  ${props => props.$themeType === 'light' && `
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  `}
  
  ${props => props.$themeType === 'dark' && `
    background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  `}
  
  ${props => props.$themeType === 'auto' && `
    background: linear-gradient(90deg, #ffffff 0%, #ffffff 50%, #1a1a1a 50%, #1a1a1a 100%);
  `}
  
  &:hover {
    border-color: ${props => props.$token.colorPrimary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &::after {
    content: '${props => props.$label}';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    font-weight: 600;
    color: ${props => props.$themeType === 'dark' ? '#fff' : props.$themeType === 'auto' ? props.$token.colorPrimary : '#000'};
    white-space: nowrap;
  }
  
  ${props => props.$active && `
    box-shadow: 0 0 0 2px ${props.$token.colorPrimary}30, 0 4px 12px rgba(0, 0, 0, 0.1);
    
    &::before {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${props.$token.colorPrimary};
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `}
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.$token.colorBorderSecondary};
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    .ant-btn {
      width: 100%;
    }
  }
`;

const SaveButton = styled(Button)`
  && {
    height: 44px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    background: linear-gradient(135deg, ${props => props.$token.colorPrimary}, ${props => props.$token.colorPrimaryActive});
    border: none;
    box-shadow: 0 4px 16px ${props => props.$token.colorPrimary}40;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px ${props => props.$token.colorPrimary}50;
    }
    
    &:active {
      transform: translateY(0);
    }
  }
`;

const FeatureBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => props.$token.colorPrimaryBg};
  color: ${props => props.$token.colorPrimary};
  
  ${props => props.$type === 'beta' && css`
    background: ${props.$token.colorWarningBg};
    color: ${props.$token.colorWarning};
  `}
  
  ${props => props.$type === 'new' && css`
    background: ${props.$token.colorSuccessBg};
    color: ${props.$token.colorSuccess};
    animation: ${pulseGlow} 2s ease-in-out infinite;
  `}
`;

// ==========================================
// 主组件
// ==========================================

const SettingsContent = () => {
  const { token } = theme.useToken();
  const intl = useIntl();
  const { changeLocale } = useLocale();
  
  // 语言列表状态
  const [languages, setLanguages] = useState([]);
  
  // 设置状态
  const [settings, setSettings] = useState({
    // 通知设置
    notifications: {
      email: true,
      push: true,
      desktop: false,
      sound: true,
      taskComplete: true,
      systemUpdate: true,
      communityActivity: false,
      marketing: false,
      volume: 50,
    },
    // 界面设置
    interface: {
      theme: 'auto', // 'light', 'dark', 'auto'
      language: 'zh-CN',
      fontSize: 14,
      compactMode: false,
      animationEnabled: true,
      sidebarCollapsed: false,
      showTips: true,
      accentColor: '#3b82f6',
    },
    // 隐私设置
    privacy: {
      profileVisible: true,
      showActivity: true,
      allowAnalytics: true,
      dataCollection: false,
      showWorks: true,
      allowComments: true,
      allowDownload: false,
      searchIndexing: true,
    },
    // AI 设置
    ai: {
      autoOptimize: true,
      qualityPreset: 'balanced', // 'fast', 'balanced', 'quality'
      autoSave: true,
      cloudSync: true,
      safetyFilter: true,
      watermarkEnabled: false,
      autoEnhance: true,
      promptSuggestions: true,
    },
    // 性能设置
    performance: {
      hardwareAcceleration: true,
      previewQuality: 'medium', // 'low', 'medium', 'high'
      cacheSize: 2048, // MB
      autoCleanCache: true,
      maxConcurrentTasks: 3,
      imageCompression: true,
      lazyLoading: true,
      autoSaveInterval: 60,
    },
    // 工作流设置
    workflow: {
      defaultResolution: '1024x1024',
      defaultSteps: 30,
      defaultGuidance: 7.5,
      saveHistory: true,
      autoTag: true,
      templateEnabled: true,
    },
    // 文件管理设置
    fileManagement: {
      autoBackup: true,
      backupFrequency: 'daily', // 'realtime', 'daily', 'weekly'
      maxStorage: 10240, // MB
      autoOrganize: true,
      trashAutoCleanDays: 30,
      defaultFormat: 'png', // 'png', 'jpg', 'webp'
    },
    // 社交设置
    social: {
      allowFollow: true,
      allowMessage: true,
      showFollowing: true,
      showFollowers: true,
      autoLikeNotify: true,
      mentionNotify: true,
    },
    // 安全设置
    security: {
      twoFactorEnabled: false,
      loginNotification: true,
      sessionTimeout: 7200, // 秒
      autoLogoutIdle: false,
      deviceVerification: true,
    }
  });
  
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = React.useRef(null);
  const themeContext = useContext(ThemeContext);
  
  // 自动保存函数（防抖）
  const autoSave = React.useCallback(async (settingsToSave) => {
    try {
      // 转换前端数据格式为后端格式
      const requestData = convertToBackendFormat(settingsToSave);
      
      // 调用后端 API
      const response = await saveUserSettings(requestData);
      
      if (response.data.success) {
        // 保存到 localStorage 作为本地缓存
        localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
        
        message.success({
          content: intl.formatMessage({ id: 'settings.message.autoSaved', defaultMessage: '设置已自动保存' }),
          icon: <CheckCircleFilled style={{ color: token.colorSuccess }} />,
          duration: 1.5,
        });
      }
    } catch (error) {
      console.error('自动保存设置失败:', error);
      message.error({
        content: error.response?.data?.message || intl.formatMessage({ id: 'settings.message.saveFailed', defaultMessage: '保存失败，请重试' }),
        duration: 2,
      });
    }
  }, [intl, token]);
  
  // 更新设置（带自动保存）
  const updateSetting = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    
    setSettings(newSettings);
    
    // 如果更新的是主题设置，同步更新全局主题
    if (category === 'interface' && key === 'theme' && themeContext?.setTheme) {
      if (value === 'light') {
        themeContext.setTheme(false);
      } else if (value === 'dark') {
        themeContext.setTheme(true);
      } else if (value === 'auto') {
        // 自动模式：根据系统偏好设置
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeContext.setTheme(prefersDark);
      }
    }
    
    // 如果更新的是语言设置，同步更新全局语言
    if (category === 'interface' && key === 'language' && changeLocale) {
      // 转换格式: zh-CN -> zh
      const langCode = value.split('-')[0].toLowerCase();
      changeLocale(langCode);
    }
    
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // 设置新的定时器，800ms 后自动保存
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(newSettings);
    }, 800);
  };
  
  // 重置设置
  const handleReset = () => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'settings.confirm.resetTitle', defaultMessage: '确认重置' }),
      content: intl.formatMessage({ id: 'settings.confirm.resetContent', defaultMessage: '确定要将所有设置恢复为默认值吗？' }),
      okText: intl.formatMessage({ id: 'settings.confirm.reset', defaultMessage: '重置' }),
      cancelText: intl.formatMessage({ id: 'settings.confirm.cancel', defaultMessage: '取消' }),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // 调用后端 API 重置
          const response = await resetUserSettings();
          
          if (response.data.success) {
        // 恢复默认设置
      const defaultSettings = {
        notifications: {
          email: true,
          push: true,
          desktop: false,
          sound: true,
          taskComplete: true,
          systemUpdate: true,
          communityActivity: false,
          marketing: false,
          volume: 50,
        },
        interface: {
          theme: 'auto',
          language: 'zh-CN',
          fontSize: 14,
          compactMode: false,
          animationEnabled: true,
          sidebarCollapsed: false,
          showTips: true,
          accentColor: '#3b82f6',
        },
        privacy: {
          profileVisible: true,
          showActivity: true,
          allowAnalytics: true,
          dataCollection: false,
          showWorks: true,
          allowComments: true,
          allowDownload: false,
          searchIndexing: true,
        },
        ai: {
          autoOptimize: true,
          qualityPreset: 'balanced',
          autoSave: true,
          cloudSync: true,
          safetyFilter: true,
          watermarkEnabled: false,
          autoEnhance: true,
          promptSuggestions: true,
        },
        performance: {
          hardwareAcceleration: true,
          previewQuality: 'medium',
          cacheSize: 2048,
          autoCleanCache: true,
          maxConcurrentTasks: 3,
          imageCompression: true,
          lazyLoading: true,
          autoSaveInterval: 60,
        },
        workflow: {
          defaultResolution: '1024x1024',
          defaultSteps: 30,
          defaultGuidance: 7.5,
          saveHistory: true,
          autoTag: true,
          templateEnabled: true,
        },
        fileManagement: {
          autoBackup: true,
          backupFrequency: 'daily',
          maxStorage: 10240,
          autoOrganize: true,
          trashAutoCleanDays: 30,
          defaultFormat: 'png',
        },
        social: {
          allowFollow: true,
          allowMessage: true,
          showFollowing: true,
          showFollowers: true,
          autoLikeNotify: true,
          mentionNotify: true,
        },
        security: {
          twoFactorEnabled: false,
          loginNotification: true,
          sessionTimeout: 7200,
          autoLogoutIdle: false,
          deviceVerification: true,
        }
      };
            // 转换后端返回的数据为前端格式
            const frontendSettings = convertToFrontendFormat(response.data.data);
            setSettings(frontendSettings);
            
            // 同步更新 localStorage
            localStorage.setItem('userSettings', JSON.stringify(frontendSettings));
            
            // 同步更新全局主题（默认是 auto 模式）
            if (themeContext?.setTheme) {
              const themeMode = frontendSettings.interface?.theme || 'auto';
              if (themeMode === 'light') {
                themeContext.setTheme(false);
              } else if (themeMode === 'dark') {
                themeContext.setTheme(true);
              } else if (themeMode === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                themeContext.setTheme(prefersDark);
              }
            }
            
            // 同步更新全局语言（默认是 zh-CN）
            if (changeLocale) {
              const language = frontendSettings.interface?.language || 'zh-CN';
              const langCode = language.split('-')[0].toLowerCase();
              changeLocale(langCode);
            }
            
            message.success(intl.formatMessage({ id: 'settings.message.resetSuccess', defaultMessage: '已恢复默认设置' }));
          } else {
            throw new Error(response.data.message || '重置失败');
          }
        } catch (error) {
          console.error('重置设置失败:', error);
          message.error(error.response?.data?.message || '重置失败，请重试');
        }
      }
    });
  };
  
  // 获取支持的语言列表
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const result = await base.getEnabledLanguages();
        if (result.success) {
          const sortedLanguages = result.data.sort((a, b) => b.usageCount - a.usageCount);
          setLanguages(sortedLanguages);
        }
      } catch (error) {
        console.error('获取语言列表失败:', error);
      }
    };
    fetchLanguages();
  }, []);
  
  // 加载保存的设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 优先从后端加载设置
        const response = await getUserSettings();
        
        if (response.data.success && response.data.data) {
          const frontendSettings = convertToFrontendFormat(response.data.data);
          setSettings(frontendSettings);
          
          // 同步到 localStorage
          localStorage.setItem('userSettings', JSON.stringify(frontendSettings));
        } else {
          // 如果后端没有数据，尝试从 localStorage 加载
          const savedSettings = localStorage.getItem('userSettings');
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          }
        }
      } catch (error) {
        console.error('加载设置失败:', error);
        
        // 失败时尝试从 localStorage 加载
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          try {
            setSettings(JSON.parse(savedSettings));
          } catch (e) {
            console.error('Failed to parse saved settings', e);
          }
        }
      }
    };
    
    loadSettings();
    
    // 清理定时器
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // 转换前端格式到后端格式
  const convertToBackendFormat = (frontendSettings) => {
    return {
      // 通知设置
      notificationEmailEnabled: frontendSettings.notifications.email,
      notificationPushEnabled: frontendSettings.notifications.push,
      notificationDesktopEnabled: frontendSettings.notifications.desktop,
      notificationSoundEnabled: frontendSettings.notifications.sound,
      notificationTaskComplete: frontendSettings.notifications.taskComplete,
      notificationSystemUpdate: frontendSettings.notifications.systemUpdate,
      notificationCommunityActivity: frontendSettings.notifications.communityActivity,
      notificationMarketing: frontendSettings.notifications.marketing,
      notificationVolume: frontendSettings.notifications.volume,
      
      // 界面设置
      interfaceTheme: frontendSettings.interface.theme,
      interfaceLanguage: frontendSettings.interface.language,
      interfaceFontSize: frontendSettings.interface.fontSize,
      interfaceCompactMode: frontendSettings.interface.compactMode,
      interfaceAnimationEnabled: frontendSettings.interface.animationEnabled,
      interfaceSidebarCollapsed: frontendSettings.interface.sidebarCollapsed,
      interfaceShowTips: frontendSettings.interface.showTips,
      interfaceAccentColor: frontendSettings.interface.accentColor,
      
      // AI 设置
      aiAutoOptimize: frontendSettings.ai.autoOptimize,
      aiQualityPreset: frontendSettings.ai.qualityPreset,
      aiAutoSave: frontendSettings.ai.autoSave,
      aiCloudSync: frontendSettings.ai.cloudSync,
      aiSafetyFilter: frontendSettings.ai.safetyFilter,
      aiWatermarkEnabled: frontendSettings.ai.watermarkEnabled,
      aiAutoEnhance: frontendSettings.ai.autoEnhance,
      aiPromptSuggestions: frontendSettings.ai.promptSuggestions,
      
      // 隐私设置
      privacyProfileVisible: frontendSettings.privacy.profileVisible,
      privacyShowActivity: frontendSettings.privacy.showActivity,
      privacyAllowAnalytics: frontendSettings.privacy.allowAnalytics,
      privacyDataCollection: frontendSettings.privacy.dataCollection,
      privacyShowWorks: frontendSettings.privacy.showWorks,
      privacyAllowComments: frontendSettings.privacy.allowComments,
      privacyAllowDownload: frontendSettings.privacy.allowDownload,
      privacySearchIndexing: frontendSettings.privacy.searchIndexing,
      
      // 性能设置
      performanceHardwareAcceleration: frontendSettings.performance.hardwareAcceleration,
      performancePreviewQuality: frontendSettings.performance.previewQuality,
      performanceCacheSize: frontendSettings.performance.cacheSize,
      performanceAutoCleanCache: frontendSettings.performance.autoCleanCache,
      performanceMaxConcurrentTasks: frontendSettings.performance.maxConcurrentTasks,
      performanceImageCompression: frontendSettings.performance.imageCompression,
      performanceLazyLoading: frontendSettings.performance.lazyLoading,
      performanceAutoSaveInterval: frontendSettings.performance.autoSaveInterval,
      
      // 工作流设置
      workflowDefaultResolution: frontendSettings.workflow.defaultResolution,
      workflowDefaultSteps: frontendSettings.workflow.defaultSteps,
      workflowDefaultGuidance: frontendSettings.workflow.defaultGuidance,
      workflowSaveHistory: frontendSettings.workflow.saveHistory,
      workflowAutoTag: frontendSettings.workflow.autoTag,
      workflowTemplateEnabled: frontendSettings.workflow.templateEnabled,
      
      // 文件管理设置
      fileAutoBackup: frontendSettings.fileManagement.autoBackup,
      fileBackupFrequency: frontendSettings.fileManagement.backupFrequency,
      fileMaxStorage: frontendSettings.fileManagement.maxStorage,
      fileAutoOrganize: frontendSettings.fileManagement.autoOrganize,
      fileTrashAutoCleanDays: frontendSettings.fileManagement.trashAutoCleanDays,
      fileDefaultFormat: frontendSettings.fileManagement.defaultFormat,
      
      // 社交设置
      socialAllowFollow: frontendSettings.social.allowFollow,
      socialAllowMessage: frontendSettings.social.allowMessage,
      socialShowFollowing: frontendSettings.social.showFollowing,
      socialShowFollowers: frontendSettings.social.showFollowers,
      socialAutoLikeNotify: frontendSettings.social.autoLikeNotify,
      socialMentionNotify: frontendSettings.social.mentionNotify,
      
      // 安全设置
      securityTwoFactorEnabled: frontendSettings.security.twoFactorEnabled,
      securityLoginNotification: frontendSettings.security.loginNotification,
      securitySessionTimeout: frontendSettings.security.sessionTimeout,
      securityAutoLogoutIdle: frontendSettings.security.autoLogoutIdle,
      securityDeviceVerification: frontendSettings.security.deviceVerification,
    };
  };
  
  // 转换后端格式到前端格式
  const convertToFrontendFormat = (backendData) => {
    return {
      notifications: {
        email: backendData.notificationEmailEnabled,
        push: backendData.notificationPushEnabled,
        desktop: backendData.notificationDesktopEnabled,
        sound: backendData.notificationSoundEnabled,
        taskComplete: backendData.notificationTaskComplete,
        systemUpdate: backendData.notificationSystemUpdate,
        communityActivity: backendData.notificationCommunityActivity,
        marketing: backendData.notificationMarketing,
        volume: backendData.notificationVolume,
      },
      interface: {
        theme: backendData.interfaceTheme,
        language: backendData.interfaceLanguage,
        fontSize: backendData.interfaceFontSize,
        compactMode: backendData.interfaceCompactMode,
        animationEnabled: backendData.interfaceAnimationEnabled,
        sidebarCollapsed: backendData.interfaceSidebarCollapsed,
        showTips: backendData.interfaceShowTips,
        accentColor: backendData.interfaceAccentColor,
      },
      ai: {
        autoOptimize: backendData.aiAutoOptimize,
        qualityPreset: backendData.aiQualityPreset,
        autoSave: backendData.aiAutoSave,
        cloudSync: backendData.aiCloudSync,
        safetyFilter: backendData.aiSafetyFilter,
        watermarkEnabled: backendData.aiWatermarkEnabled,
        autoEnhance: backendData.aiAutoEnhance,
        promptSuggestions: backendData.aiPromptSuggestions,
      },
      privacy: {
        profileVisible: backendData.privacyProfileVisible,
        showActivity: backendData.privacyShowActivity,
        allowAnalytics: backendData.privacyAllowAnalytics,
        dataCollection: backendData.privacyDataCollection,
        showWorks: backendData.privacyShowWorks,
        allowComments: backendData.privacyAllowComments,
        allowDownload: backendData.privacyAllowDownload,
        searchIndexing: backendData.privacySearchIndexing,
      },
      performance: {
        hardwareAcceleration: backendData.performanceHardwareAcceleration,
        previewQuality: backendData.performancePreviewQuality,
        cacheSize: backendData.performanceCacheSize,
        autoCleanCache: backendData.performanceAutoCleanCache,
        maxConcurrentTasks: backendData.performanceMaxConcurrentTasks,
        imageCompression: backendData.performanceImageCompression,
        lazyLoading: backendData.performanceLazyLoading,
        autoSaveInterval: backendData.performanceAutoSaveInterval,
      },
      workflow: {
        defaultResolution: backendData.workflowDefaultResolution,
        defaultSteps: backendData.workflowDefaultSteps,
        defaultGuidance: backendData.workflowDefaultGuidance,
        saveHistory: backendData.workflowSaveHistory,
        autoTag: backendData.workflowAutoTag,
        templateEnabled: backendData.workflowTemplateEnabled,
      },
      fileManagement: {
        autoBackup: backendData.fileAutoBackup,
        backupFrequency: backendData.fileBackupFrequency,
        maxStorage: backendData.fileMaxStorage,
        autoOrganize: backendData.fileAutoOrganize,
        trashAutoCleanDays: backendData.fileTrashAutoCleanDays,
        defaultFormat: backendData.fileDefaultFormat,
      },
      social: {
        allowFollow: backendData.socialAllowFollow,
        allowMessage: backendData.socialAllowMessage,
        showFollowing: backendData.socialShowFollowing,
        showFollowers: backendData.socialShowFollowers,
        autoLikeNotify: backendData.socialAutoLikeNotify,
        mentionNotify: backendData.socialMentionNotify,
      },
      security: {
        twoFactorEnabled: backendData.securityTwoFactorEnabled,
        loginNotification: backendData.securityLoginNotification,
        sessionTimeout: backendData.securitySessionTimeout,
        autoLogoutIdle: backendData.securityAutoLogoutIdle,
        deviceVerification: backendData.securityDeviceVerification,
      },
    };
  };
  
  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <PageHeader $token={token}>
          <div className="header-content">
            <div className="icon-wrapper">
              <SettingOutlined />
            </div>
            <h1>{intl.formatMessage({ id: 'settings.title', defaultMessage: '系统设置' })}</h1>
            <p>{intl.formatMessage({ id: 'settings.description', defaultMessage: '个性化您的 AI 生成平台体验' })}</p>
          </div>
        </PageHeader>
        
        <SettingsGrid>
          {/* 通知设置 */}
          <SettingCard
            $token={token}
            $iconColor={token.colorInfo}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="card-header">
              <div className="icon-box">
                <BellOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.notifications.title', defaultMessage: '通知设置' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.notifications.description', defaultMessage: '管理您接收通知的方式' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.notifications.email', defaultMessage: '邮件通知' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.notifications.emailDesc', defaultMessage: '接收重要更新和任务完成的邮件' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.notifications.email}
                  onChange={(checked) => updateSetting('notifications', 'email', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.notifications.push', defaultMessage: '推送通知' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.notifications.pushDesc', defaultMessage: '接收实时推送消息' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.notifications.push}
                  onChange={(checked) => updateSetting('notifications', 'push', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.notifications.sound', defaultMessage: '声音提醒' })}
                  <FeatureBadge $token={token}>
                    <SoundOutlined style={{ fontSize: 10 }} />
                    {intl.formatMessage({ id: 'settings.badge.on', defaultMessage: '开启' })}
                  </FeatureBadge>
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.notifications.soundDesc', defaultMessage: '收到通知时播放提示音' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.notifications.sound}
                  onChange={(checked) => updateSetting('notifications', 'sound', checked)}
                />
              </div>
            </SettingItem>
            
            {settings.notifications.sound && (
              <SettingItem $token={token}>
                <div className="item-info">
                  <div className="label">
                    {intl.formatMessage({ id: 'settings.notifications.volume', defaultMessage: '通知音量' })}
                  </div>
                  <div className="description">
                    {intl.formatMessage({ id: 'settings.notifications.volumeDesc', defaultMessage: '调整通知提示音的音量大小' })}
                  </div>
                </div>
                <div className="item-control" style={{ width: 200 }}>
                  <Slider
                    value={settings.notifications.volume}
                    onChange={(value) => updateSetting('notifications', 'volume', value)}
                    min={0}
                    max={100}
                    marks={{ 0: '0', 50: '50', 100: '100' }}
                  />
                </div>
              </SettingItem>
            )}
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.notifications.marketing', defaultMessage: '营销推广' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.notifications.marketingDesc', defaultMessage: '接收平台活动和优惠信息' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.notifications.marketing}
                  onChange={(checked) => updateSetting('notifications', 'marketing', checked)}
                />
              </div>
            </SettingItem>
          </SettingCard>
          
          {/* 界面设置 */}
          <SettingCard
            $token={token}
            $iconColor={token.colorWarning}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="card-header">
              <div className="icon-box">
                <BgColorsOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.interface.title', defaultMessage: '界面外观' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.interface.description', defaultMessage: '自定义界面的显示效果' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token} style={{ display: 'block' }}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.interface.theme', defaultMessage: '主题模式' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.interface.themeDesc', defaultMessage: '选择您喜欢的界面主题' })}
                </div>
              </div>
              <ThemePreview>
                <ThemeOption
                  $token={token}
                  $themeType="light"
                  $active={settings.interface.theme === 'light'}
                  $label={intl.formatMessage({ id: 'settings.theme.light', defaultMessage: '浅色' })}
                  onClick={() => updateSetting('interface', 'theme', 'light')}
                />
                <ThemeOption
                  $token={token}
                  $themeType="dark"
                  $active={settings.interface.theme === 'dark'}
                  $label={intl.formatMessage({ id: 'settings.theme.dark', defaultMessage: '深色' })}
                  onClick={() => updateSetting('interface', 'theme', 'dark')}
                />
                <ThemeOption
                  $token={token}
                  $themeType="auto"
                  $active={settings.interface.theme === 'auto'}
                  $label={intl.formatMessage({ id: 'settings.theme.auto', defaultMessage: '自动' })}
                  onClick={() => updateSetting('interface', 'theme', 'auto')}
                />
              </ThemePreview>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <GlobalOutlined />
                  {intl.formatMessage({ id: 'settings.interface.language', defaultMessage: '语言' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.interface.languageDesc', defaultMessage: '选择界面显示语言' })}
                </div>
              </div>
              <div className="item-control">
                <Select
                  value={settings.interface.language}
                  onChange={(value) => updateSetting('interface', 'language', value)}
                  style={{ width: 150 }}
                  options={languages.map(lang => ({
                    value: lang.languageCode,
                    label: lang.languageNameNative
                  }))}
                  placeholder={intl.formatMessage({ id: 'settings.interface.selectLanguage', defaultMessage: '选择语言' })}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.interface.animation', defaultMessage: '动画效果' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.interface.animationDesc', defaultMessage: '开启界面过渡动画' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.interface.animationEnabled}
                  onChange={(checked) => updateSetting('interface', 'animationEnabled', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.interface.tips', defaultMessage: '新手提示' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.interface.tipsDesc', defaultMessage: '显示功能引导和提示' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.interface.showTips}
                  onChange={(checked) => updateSetting('interface', 'showTips', checked)}
                />
              </div>
            </SettingItem>
          </SettingCard>
          
          {/* AI 设置 */}
          <SettingCard
            $token={token}
            $iconColor={token.colorSuccess}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card-header">
              <div className="icon-box">
                <RobotOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.ai.title', defaultMessage: 'AI 生成设置' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.ai.description', defaultMessage: '优化 AI 生成效果和性能' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.ai.autoOptimize', defaultMessage: '智能优化' })}
                  <FeatureBadge $token={token} $type="new">
                    <ThunderboltOutlined style={{ fontSize: 10 }} />
                    NEW
                  </FeatureBadge>
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.ai.autoOptimizeDesc', defaultMessage: 'AI 自动优化生成参数以获得最佳效果' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.ai.autoOptimize}
                  onChange={(checked) => updateSetting('ai', 'autoOptimize', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.ai.quality', defaultMessage: '生成质量' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.ai.qualityDesc', defaultMessage: '平衡速度和质量' })}
                </div>
              </div>
              <div className="item-control">
                <Select
                  value={settings.ai.qualityPreset}
                  onChange={(value) => updateSetting('ai', 'qualityPreset', value)}
                  style={{ width: 120 }}
                  options={[
                    { value: 'fast', label: intl.formatMessage({ id: 'settings.quality.fast', defaultMessage: '快速' }) },
                    { value: 'balanced', label: intl.formatMessage({ id: 'settings.quality.balanced', defaultMessage: '平衡' }) },
                    { value: 'quality', label: intl.formatMessage({ id: 'settings.quality.high', defaultMessage: '高质量' }) },
                  ]}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <CloudOutlined />
                  {intl.formatMessage({ id: 'settings.ai.cloudSync', defaultMessage: '云端同步' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.ai.cloudSyncDesc', defaultMessage: '自动同步作品到云端' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.ai.cloudSync}
                  onChange={(checked) => updateSetting('ai', 'cloudSync', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.ai.autoSave', defaultMessage: '自动保存' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.ai.autoSaveDesc', defaultMessage: '生成完成后自动保存结果' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.ai.autoSave}
                  onChange={(checked) => updateSetting('ai', 'autoSave', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <FilterOutlined />
                  {intl.formatMessage({ id: 'settings.ai.safetyFilter', defaultMessage: '内容安全过滤' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.ai.safetyFilterDesc', defaultMessage: '自动过滤不适宜内容' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.ai.safetyFilter}
                  onChange={(checked) => updateSetting('ai', 'safetyFilter', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <FileImageOutlined />
                  {intl.formatMessage({ id: 'settings.ai.watermark', defaultMessage: '添加水印' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.ai.watermarkDesc', defaultMessage: '自动为生成的作品添加水印' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.ai.watermarkEnabled}
                  onChange={(checked) => updateSetting('ai', 'watermarkEnabled', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.ai.promptSuggestions', defaultMessage: '提示词建议' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.ai.promptSuggestionsDesc', defaultMessage: '智能推荐提示词优化建议' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.ai.promptSuggestions}
                  onChange={(checked) => updateSetting('ai', 'promptSuggestions', checked)}
                />
              </div>
            </SettingItem>
          </SettingCard>
          
          {/* 隐私设置 */}
          <SettingCard
            $token={token}
            $iconColor={token.colorError}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="card-header">
              <div className="icon-box">
                <SecurityScanOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.privacy.title', defaultMessage: '隐私与安全' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.privacy.description', defaultMessage: '保护您的个人信息' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <EyeOutlined />
                  {intl.formatMessage({ id: 'settings.privacy.profile', defaultMessage: '个人资料可见性' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.privacy.profileDesc', defaultMessage: '允许其他用户查看您的个人资料' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.privacy.profileVisible}
                  onChange={(checked) => updateSetting('privacy', 'profileVisible', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.privacy.activity', defaultMessage: '显示活动状态' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.privacy.activityDesc', defaultMessage: '让好友看到您的在线状态' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.privacy.showActivity}
                  onChange={(checked) => updateSetting('privacy', 'showActivity', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.privacy.analytics', defaultMessage: '分析数据收集' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.privacy.analyticsDesc', defaultMessage: '帮助我们改进产品体验' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.privacy.allowAnalytics}
                  onChange={(checked) => updateSetting('privacy', 'allowAnalytics', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.privacy.showWorks', defaultMessage: '作品可见性' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.privacy.showWorksDesc', defaultMessage: '允许其他用户查看您的作品' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.privacy.showWorks}
                  onChange={(checked) => updateSetting('privacy', 'showWorks', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <MessageOutlined />
                  {intl.formatMessage({ id: 'settings.privacy.allowComments', defaultMessage: '允许评论' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.privacy.allowCommentsDesc', defaultMessage: '允许其他用户评论您的作品' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.privacy.allowComments}
                  onChange={(checked) => updateSetting('privacy', 'allowComments', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.privacy.allowDownload', defaultMessage: '允许下载' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.privacy.allowDownloadDesc', defaultMessage: '允许其他用户下载您的作品' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.privacy.allowDownload}
                  onChange={(checked) => updateSetting('privacy', 'allowDownload', checked)}
                />
              </div>
            </SettingItem>
          </SettingCard>
          
          {/* 性能设置 */}
          <SettingCard
            $token={token}
            $iconColor="#9333ea"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ gridColumn: '1 / -1' }}
          >
            <div className="card-header">
              <div className="icon-box">
                <ThunderboltOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.performance.title', defaultMessage: '性能优化' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.performance.description', defaultMessage: '调整系统性能和资源使用' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <DesktopOutlined />
                  {intl.formatMessage({ id: 'settings.performance.hardware', defaultMessage: '硬件加速' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.performance.hardwareDesc', defaultMessage: '使用 GPU 加速渲染' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.performance.hardwareAcceleration}
                  onChange={(checked) => updateSetting('performance', 'hardwareAcceleration', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.performance.preview', defaultMessage: '预览质量' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.performance.previewDesc', defaultMessage: '预览图像的质量级别' })}
                </div>
              </div>
              <div className="item-control">
                <Select
                  value={settings.performance.previewQuality}
                  onChange={(value) => updateSetting('performance', 'previewQuality', value)}
                  style={{ width: 100 }}
                  options={[
                    { value: 'low', label: intl.formatMessage({ id: 'settings.preview.low', defaultMessage: '低' }) },
                    { value: 'medium', label: intl.formatMessage({ id: 'settings.preview.medium', defaultMessage: '中' }) },
                    { value: 'high', label: intl.formatMessage({ id: 'settings.preview.high', defaultMessage: '高' }) },
                  ]}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.performance.autoClean', defaultMessage: '自动清理缓存' })}
                  <FeatureBadge $token={token} $type="beta">
                    BETA
                  </FeatureBadge>
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.performance.autoCleanDesc', defaultMessage: '定期清理临时文件' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.performance.autoCleanCache}
                  onChange={(checked) => updateSetting('performance', 'autoCleanCache', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.performance.imageCompression', defaultMessage: '图片压缩' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.performance.imageCompressionDesc', defaultMessage: '自动压缩上传的图片' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.performance.imageCompression}
                  onChange={(checked) => updateSetting('performance', 'imageCompression', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.performance.lazyLoading', defaultMessage: '懒加载' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.performance.lazyLoadingDesc', defaultMessage: '延迟加载页面内容' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.performance.lazyLoading}
                  onChange={(checked) => updateSetting('performance', 'lazyLoading', checked)}
                />
              </div>
            </SettingItem>
          </SettingCard>
          
          {/* 工作流设置 */}
          <SettingCard
            $token={token}
            $iconColor="#ec4899"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="card-header">
              <div className="icon-box">
                <ApiOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.workflow.title', defaultMessage: '工作流设置' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.workflow.description', defaultMessage: '自定义 AI 生成工作流' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.workflow.resolution', defaultMessage: '默认分辨率' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.workflow.resolutionDesc', defaultMessage: '图片生成的默认尺寸' })}
                </div>
              </div>
              <div className="item-control">
                <Select
                  value={settings.workflow.defaultResolution}
                  onChange={(value) => updateSetting('workflow', 'defaultResolution', value)}
                  style={{ width: 140 }}
                  options={[
                    { value: '512x512', label: '512 × 512' },
                    { value: '768x768', label: '768 × 768' },
                    { value: '1024x1024', label: '1024 × 1024' },
                    { value: '1280x720', label: '1280 × 720' },
                    { value: '1920x1080', label: '1920 × 1080' },
                  ]}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.workflow.saveHistory', defaultMessage: '保存历史记录' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.workflow.saveHistoryDesc', defaultMessage: '保存生成参数和提示词历史' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.workflow.saveHistory}
                  onChange={(checked) => updateSetting('workflow', 'saveHistory', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <TagOutlined />
                  {intl.formatMessage({ id: 'settings.workflow.autoTag', defaultMessage: '智能标签' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.workflow.autoTagDesc', defaultMessage: '自动为作品添加标签' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.workflow.autoTag}
                  onChange={(checked) => updateSetting('workflow', 'autoTag', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.workflow.template', defaultMessage: '模板功能' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.workflow.templateDesc', defaultMessage: '启用工作流模板' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.workflow.templateEnabled}
                  onChange={(checked) => updateSetting('workflow', 'templateEnabled', checked)}
                />
              </div>
            </SettingItem>
          </SettingCard>
          
          {/* 文件管理设置 */}
          <SettingCard
            $token={token}
            $iconColor="#f59e0b"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="card-header">
              <div className="icon-box">
                <FolderOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.file.title', defaultMessage: '文件管理' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.file.description', defaultMessage: '管理文件存储和备份' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <CloudServerOutlined />
                  {intl.formatMessage({ id: 'settings.file.autoBackup', defaultMessage: '自动备份' })}
                  <FeatureBadge $token={token} $type="new">
                    NEW
                  </FeatureBadge>
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.file.autoBackupDesc', defaultMessage: '自动备份重要文件' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.fileManagement.autoBackup}
                  onChange={(checked) => updateSetting('fileManagement', 'autoBackup', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.file.backupFrequency', defaultMessage: '备份频率' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.file.backupFrequencyDesc', defaultMessage: '选择备份的频率' })}
                </div>
              </div>
              <div className="item-control">
                <Select
                  value={settings.fileManagement.backupFrequency}
                  onChange={(value) => updateSetting('fileManagement', 'backupFrequency', value)}
                  style={{ width: 120 }}
                  disabled={!settings.fileManagement.autoBackup}
                  options={[
                    { value: 'realtime', label: intl.formatMessage({ id: 'settings.file.realtime', defaultMessage: '实时' }) },
                    { value: 'daily', label: intl.formatMessage({ id: 'settings.file.daily', defaultMessage: '每天' }) },
                    { value: 'weekly', label: intl.formatMessage({ id: 'settings.file.weekly', defaultMessage: '每周' }) },
                  ]}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.file.autoOrganize', defaultMessage: '智能整理' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.file.autoOrganizeDesc', defaultMessage: '自动分类整理文件' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.fileManagement.autoOrganize}
                  onChange={(checked) => updateSetting('fileManagement', 'autoOrganize', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.file.defaultFormat', defaultMessage: '默认格式' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.file.defaultFormatDesc', defaultMessage: '文件保存的默认格式' })}
                </div>
              </div>
              <div className="item-control">
                <Select
                  value={settings.fileManagement.defaultFormat}
                  onChange={(value) => updateSetting('fileManagement', 'defaultFormat', value)}
                  style={{ width: 100 }}
                  options={[
                    { value: 'png', label: 'PNG' },
                    { value: 'jpg', label: 'JPG' },
                    { value: 'webp', label: 'WebP' },
                  ]}
                />
              </div>
            </SettingItem>
          </SettingCard>
          
          {/* 社交设置 */}
          <SettingCard
            $token={token}
            $iconColor="#14b8a6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <div className="card-header">
              <div className="icon-box">
                <TeamOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.social.title', defaultMessage: '社交互动' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.social.description', defaultMessage: '管理社交功能和互动权限' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <UserAddOutlined />
                  {intl.formatMessage({ id: 'settings.social.allowFollow', defaultMessage: '允许关注' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.social.allowFollowDesc', defaultMessage: '允许其他用户关注您' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.social.allowFollow}
                  onChange={(checked) => updateSetting('social', 'allowFollow', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <MessageOutlined />
                  {intl.formatMessage({ id: 'settings.social.allowMessage', defaultMessage: '允许私信' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.social.allowMessageDesc', defaultMessage: '允许其他用户给您发私信' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.social.allowMessage}
                  onChange={(checked) => updateSetting('social', 'allowMessage', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <HeartOutlined />
                  {intl.formatMessage({ id: 'settings.social.likeNotify', defaultMessage: '点赞通知' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.social.likeNotifyDesc', defaultMessage: '作品被点赞时通知' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.social.autoLikeNotify}
                  onChange={(checked) => updateSetting('social', 'autoLikeNotify', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.social.mentionNotify', defaultMessage: '@提醒通知' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.social.mentionNotifyDesc', defaultMessage: '被@时收到通知' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.social.mentionNotify}
                  onChange={(checked) => updateSetting('social', 'mentionNotify', checked)}
                />
              </div>
            </SettingItem>
          </SettingCard>
          
          {/* 安全设置 */}
          <SettingCard
            $token={token}
            $iconColor="#dc2626"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="card-header">
              <div className="icon-box">
                <SafetyOutlined />
              </div>
              <div className="title-group">
                <h3>{intl.formatMessage({ id: 'settings.security.title', defaultMessage: '账户安全' })}</h3>
                <p>{intl.formatMessage({ id: 'settings.security.description', defaultMessage: '增强账户安全防护' })}</p>
              </div>
            </div>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <SafetyOutlined />
                  {intl.formatMessage({ id: 'settings.security.twoFactor', defaultMessage: '双因素认证' })}
                  <FeatureBadge $token={token}>
                    {intl.formatMessage({ id: 'settings.badge.recommended', defaultMessage: '推荐' })}
                  </FeatureBadge>
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.security.twoFactorDesc', defaultMessage: '增加一层安全验证' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.security.twoFactorEnabled}
                  onChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  <LoginOutlined />
                  {intl.formatMessage({ id: 'settings.security.loginNotify', defaultMessage: '登录通知' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.security.loginNotifyDesc', defaultMessage: '新设备登录时通知' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.security.loginNotification}
                  onChange={(checked) => updateSetting('security', 'loginNotification', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.security.deviceVerify', defaultMessage: '设备验证' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.security.deviceVerifyDesc', defaultMessage: '未授权设备需要验证' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.security.deviceVerification}
                  onChange={(checked) => updateSetting('security', 'deviceVerification', checked)}
                />
              </div>
            </SettingItem>
            
            <SettingItem $token={token}>
              <div className="item-info">
                <div className="label">
                  {intl.formatMessage({ id: 'settings.security.autoLogout', defaultMessage: '空闲自动登出' })}
                </div>
                <div className="description">
                  {intl.formatMessage({ id: 'settings.security.autoLogoutDesc', defaultMessage: '长时间无操作自动退出' })}
                </div>
              </div>
              <div className="item-control">
                <Switch 
                  checked={settings.security.autoLogoutIdle}
                  onChange={(checked) => updateSetting('security', 'autoLogoutIdle', checked)}
                />
              </div>
            </SettingItem>
          </SettingCard>
        </SettingsGrid>
        
        {/* 操作按钮 */}
        <ActionBar $token={token}>
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            style={{ 
              height: 44, 
              borderRadius: 12, 
              fontWeight: 600,
              fontSize: 15
            }}
          >
            {intl.formatMessage({ id: 'settings.button.reset', defaultMessage: '恢复默认' })}
          </Button>
          
          <div style={{ 
            color: token.colorTextSecondary, 
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircleFilled style={{ color: token.colorSuccess }} />
            {intl.formatMessage({ id: 'settings.autoSaveHint', defaultMessage: '设置将自动保存' })}
          </div>
        </ActionBar>
        
      </ContentContainer>
    </PageLayout>
  );
};

// ==========================================
// 导出组件
// ==========================================

const SettingsPage = () => {
  const customTheme = {
    token: {
      borderRadius: 12,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    components: {
      Switch: {
        trackHeight: 24,
        handleSize: 20,
      },
      Select: {
        borderRadius: 10,
      },
      Button: {
        borderRadius: 12,
      }
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <SettingsContent />
    </ConfigProvider>
  );
};

export default SettingsPage;
