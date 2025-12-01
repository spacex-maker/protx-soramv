import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SimpleHeader from "components/headers/simple";
import { ConfigProvider, theme, Button, Switch, Divider, message, Spin } from "antd";
import { 
  ArrowLeftOutlined, 
  SafetyOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { useIntl } from 'react-intl';
import { base } from '../api';

// ==========================================
// 1. 样式系统 (Styled System)
// ==========================================

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.$token.colorBgLayout};
  color: ${props => props.$token.colorText};
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
  padding-top: 80px; 

  &::before {
    content: '';
    position: fixed;
    top: -10%;
    left: 20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${props => props.$token.colorPrimary}08 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }
`;

const ContentContainer = styled(motion.div)`
  max-width: 900px;
  width: 95%;
  margin: 0 auto;
  padding-bottom: 60px;
  position: relative;
  z-index: 10;
`;

const HeaderArea = styled.div`
  margin-bottom: 32px;
  
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.$token.colorTextSecondary};
    cursor: pointer;
    margin-bottom: 16px;
    transition: color 0.2s;
    font-size: 14px;
    &:hover { 
      color: ${props => props.$token.colorText}; 
    }
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: ${props => props.$token.colorText};
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .meta {
    font-size: 14px;
    color: ${props => props.$token.colorTextSecondary};
    margin: 0;
  }
`;

const PreferencesCard = styled.div`
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  padding: 40px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const PreferenceSection = styled.div`
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: ${props => props.$token.colorText};
      margin: 0;
    }
  }
  
  .section-description {
    font-size: 14px;
    line-height: 1.6;
    color: ${props => props.$token.colorTextSecondary};
    margin-bottom: 24px;
  }
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  margin-bottom: 12px;
  background: ${props => props.$token.colorBgLayout};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.$token.colorPrimary}40;
    background: ${props => props.$token.colorPrimary}05;
  }
  
  .item-content {
    flex: 1;
    margin-right: 16px;
    
    .item-title {
      font-size: 15px;
      font-weight: 600;
      color: ${props => props.$token.colorText};
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .item-description {
      font-size: 13px;
      line-height: 1.6;
      color: ${props => props.$token.colorTextSecondary};
    }
    
    .item-required {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: ${props => props.$token.colorWarning};
      margin-top: 6px;
    }
  }
  
  .item-switch {
    flex-shrink: 0;
  }
  
  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .item-switch {
      pointer-events: none;
    }
  }
`;

const InfoBox = styled.div`
  background: ${props => props.$token.colorInfoBg || props.$token.colorPrimary}10;
  border: 1px solid ${props => props.$token.colorInfoBorder || props.$token.colorPrimary}30;
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
  display: flex;
  gap: 12px;
  
  .info-icon {
    color: ${props => props.$token.colorInfo || props.$token.colorPrimary};
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .info-content {
    flex: 1;
    font-size: 13px;
    line-height: 1.6;
    color: ${props => props.$token.colorTextSecondary};
  }
`;

const FooterActions = styled.div`
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid ${props => props.$token.colorBorderSecondary};
  
  .actions-wrapper {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    
    @media (max-width: 768px) {
      flex-direction: column-reverse;
      gap: 12px;
    }
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    color: ${props => props.$token.colorTextSecondary};
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    text-decoration: none;
    
    &:hover {
      color: ${props => props.$token.colorPrimary};
      background: ${props => props.$token.colorPrimary}0a;
    }
  }

  .save-button {
    min-width: 160px;
    height: 48px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 15px;
    border: none;
    background: ${props => props.$token.colorPrimary};
    color: #fff;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px ${props => props.$token.colorPrimary}30;
    
    &:hover {
      background: ${props => props.$token.colorPrimary}dd;
      box-shadow: 0 4px 12px ${props => props.$token.colorPrimary}50;
      transform: translateY(-1px);
      color: #fff;
    }
    
    &:active {
      transform: translateY(0);
    }
    
    @media (max-width: 768px) {
      width: 100%;
    }
  }
`;

// ==========================================
// 2. 主组件
// ==========================================

const PrivacyPreferencesContent = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 隐私偏好状态
  const [preferences, setPreferences] = useState({
    // Cookie 偏好
    cookiesEssential: true, // 必需 Cookie（不可关闭）
    cookiesFunctional: true, // 功能 Cookie
    cookiesAnalytics: true, // 分析 Cookie
    cookiesMarketing: false, // 营销 Cookie
    
    // 数据收集偏好
    dataCollection: true, // 数据收集
    dataAnalytics: true, // 数据分析
    dataPersonalization: false, // 个性化推荐
    
    // 营销偏好
    marketingEmails: false, // 营销邮件
    marketingSms: false, // 营销短信
    marketingPush: false, // 推送通知
    
    // 第三方共享
    thirdPartySharing: false, // 第三方数据共享
  });

  // 从服务器或 localStorage 加载保存的偏好设置
  useEffect(() => {
    const loadPreferences = async () => {
      const userToken = localStorage.getItem('token');
      setIsLoggedIn(!!userToken);
      
      if (userToken) {
        // 用户已登录，从服务器加载
        try {
          const response = await base.getPrivacyPreferences();
          if (response.success && response.data) {
            const serverData = response.data;
            setPreferences({
              cookiesEssential: true, // 始终为 true
              cookiesFunctional: serverData.cookiesFunctional ?? true,
              cookiesAnalytics: serverData.cookiesAnalytics ?? true,
              cookiesMarketing: serverData.cookiesMarketing ?? false,
              dataCollection: serverData.dataCollection ?? true,
              dataAnalytics: serverData.dataAnalytics ?? true,
              dataPersonalization: serverData.dataPersonalization ?? false,
              marketingEmails: serverData.marketingEmails ?? false,
              marketingSms: serverData.marketingSms ?? false,
              marketingPush: serverData.marketingPush ?? false,
              thirdPartySharing: serverData.thirdPartySharing ?? false,
            });
          }
        } catch (e) {
          console.error('Failed to load privacy preferences from server:', e);
          // 如果服务器获取失败，尝试从 localStorage 加载
          loadFromLocalStorage();
        }
      } else {
        // 用户未登录，从 localStorage 加载
        loadFromLocalStorage();
      }
      setInitialLoading(false);
    };

    const loadFromLocalStorage = () => {
      const saved = localStorage.getItem('privacyPreferences');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferences(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to load privacy preferences from localStorage:', e);
        }
      }
    };

    loadPreferences();
  }, []);

  // 处理偏好设置变更
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 保存偏好设置
  const handleSave = async () => {
    setLoading(true);
    try {
      // 始终保存到 localStorage（作为备份）
      localStorage.setItem('privacyPreferences', JSON.stringify(preferences));
      
      // 如果用户已登录，同时保存到服务器
      if (isLoggedIn) {
        const response = await base.updatePrivacyPreferences({
          cookiesFunctional: preferences.cookiesFunctional,
          cookiesAnalytics: preferences.cookiesAnalytics,
          cookiesMarketing: preferences.cookiesMarketing,
          dataCollection: preferences.dataCollection,
          dataAnalytics: preferences.dataAnalytics,
          dataPersonalization: preferences.dataPersonalization,
          marketingEmails: preferences.marketingEmails,
          marketingSms: preferences.marketingSms,
          marketingPush: preferences.marketingPush,
          thirdPartySharing: preferences.thirdPartySharing,
        });
        
        if (!response.success) {
          throw new Error(response.message || '保存失败');
        }
      }
      
      message.success(intl.formatMessage({ 
        id: 'privacyPreferences.saveSuccess', 
        defaultMessage: '隐私偏好设置已保存' 
      }));
      
      // 延迟一下再关闭 loading，让用户看到成功提示
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error(intl.formatMessage({ 
        id: 'privacyPreferences.saveError', 
        defaultMessage: '保存失败，请稍后重试' 
      }));
      setLoading(false);
    }
  };

  // 加载状态显示
  if (initialLoading) {
    return (
      <PageLayout $token={token}>
        <SimpleHeader />
        <ContentContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: token.colorPrimary }} spin />} />
        </ContentContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeaderArea $token={token}>
          <div className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined /> {intl.formatMessage({ id: 'privacyPreferences.back', defaultMessage: '返回' })}
          </div>
          <h1>
            <SafetyOutlined style={{ color: token.colorPrimary }} />
            {intl.formatMessage({ id: 'privacyPreferences.title', defaultMessage: '隐私偏好设置' })}
          </h1>
          <p className="meta">
            {intl.formatMessage({ id: 'privacyPreferences.description', defaultMessage: '管理您的隐私设置，控制我们如何收集和使用您的数据' })}
          </p>
        </HeaderArea>

        <PreferencesCard $token={token}>
          {/* Cookie 偏好 */}
          <PreferenceSection $token={token}>
            <div className="section-header">
              <h2>{intl.formatMessage({ id: 'privacyPreferences.cookies.title', defaultMessage: 'Cookie 偏好' })}</h2>
            </div>
            <p className="section-description">
              {intl.formatMessage({ 
                id: 'privacyPreferences.cookies.description', 
                defaultMessage: 'Cookie 帮助我们提供更好的服务体验。您可以选择接受或拒绝某些类型的 Cookie。' 
              })}
            </p>
            
            <PreferenceItem $token={token} className="disabled">
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.cookies.essential', defaultMessage: '必需 Cookie' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.cookies.essential.desc', 
                    defaultMessage: '这些 Cookie 是网站正常运行所必需的，无法关闭。它们通常用于安全、登录和基本功能。' 
                  })}
                </div>
                <div className="item-required">
                  <InfoCircleOutlined />
                  {intl.formatMessage({ id: 'privacyPreferences.required', defaultMessage: '必需' })}
                </div>
              </div>
              <div className="item-switch">
                <Switch checked={preferences.cookiesEssential} disabled />
              </div>
            </PreferenceItem>

            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.cookies.functional', defaultMessage: '功能 Cookie' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.cookies.functional.desc', 
                    defaultMessage: '这些 Cookie 允许网站记住您的选择，提供增强的功能和个性化体验。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.cookiesFunctional}
                  onChange={(checked) => handlePreferenceChange('cookiesFunctional', checked)}
                />
              </div>
            </PreferenceItem>

            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.cookies.analytics', defaultMessage: '分析 Cookie' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.cookies.analytics.desc', 
                    defaultMessage: '这些 Cookie 帮助我们了解访问者如何使用网站，以便我们改进服务。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.cookiesAnalytics}
                  onChange={(checked) => handlePreferenceChange('cookiesAnalytics', checked)}
                />
              </div>
            </PreferenceItem>

            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.cookies.marketing', defaultMessage: '营销 Cookie' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.cookies.marketing.desc', 
                    defaultMessage: '这些 Cookie 用于跟踪您的浏览活动，以便向您展示相关广告和内容。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.cookiesMarketing}
                  onChange={(checked) => handlePreferenceChange('cookiesMarketing', checked)}
                />
              </div>
            </PreferenceItem>
          </PreferenceSection>

          <Divider />

          {/* 数据收集偏好 */}
          <PreferenceSection $token={token}>
            <div className="section-header">
              <h2>{intl.formatMessage({ id: 'privacyPreferences.data.title', defaultMessage: '数据收集偏好' })}</h2>
            </div>
            <p className="section-description">
              {intl.formatMessage({ 
                id: 'privacyPreferences.data.description', 
                defaultMessage: '控制我们如何收集和使用您的数据来改善服务体验。' 
              })}
            </p>
            
            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.data.collection', defaultMessage: '数据收集' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.data.collection.desc', 
                    defaultMessage: '允许我们收集必要的使用数据以提供和改进服务。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.dataCollection}
                  onChange={(checked) => handlePreferenceChange('dataCollection', checked)}
                />
              </div>
            </PreferenceItem>

            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.data.analytics', defaultMessage: '数据分析' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.data.analytics.desc', 
                    defaultMessage: '允许我们分析您的使用模式以优化服务性能和用户体验。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.dataAnalytics}
                  onChange={(checked) => handlePreferenceChange('dataAnalytics', checked)}
                />
              </div>
            </PreferenceItem>

            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.data.personalization', defaultMessage: '个性化推荐' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.data.personalization.desc', 
                    defaultMessage: '允许我们根据您的偏好和使用习惯提供个性化内容和推荐。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.dataPersonalization}
                  onChange={(checked) => handlePreferenceChange('dataPersonalization', checked)}
                />
              </div>
            </PreferenceItem>
          </PreferenceSection>

          <Divider />

          {/* 营销偏好 */}
          <PreferenceSection $token={token}>
            <div className="section-header">
              <h2>{intl.formatMessage({ id: 'privacyPreferences.marketing.title', defaultMessage: '营销偏好' })}</h2>
            </div>
            <p className="section-description">
              {intl.formatMessage({ 
                id: 'privacyPreferences.marketing.description', 
                defaultMessage: '选择您希望接收的营销信息类型。' 
              })}
            </p>
            
            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.marketing.emails', defaultMessage: '营销邮件' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.marketing.emails.desc', 
                    defaultMessage: '接收产品更新、促销活动和特别优惠的邮件通知。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.marketingEmails}
                  onChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                />
              </div>
            </PreferenceItem>

            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.marketing.sms', defaultMessage: '营销短信' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.marketing.sms.desc', 
                    defaultMessage: '接收重要更新和促销活动的短信通知。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.marketingSms}
                  onChange={(checked) => handlePreferenceChange('marketingSms', checked)}
                />
              </div>
            </PreferenceItem>

            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.marketing.push', defaultMessage: '推送通知' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.marketing.push.desc', 
                    defaultMessage: '接收浏览器推送通知，包括产品更新和重要消息。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.marketingPush}
                  onChange={(checked) => handlePreferenceChange('marketingPush', checked)}
                />
              </div>
            </PreferenceItem>
          </PreferenceSection>

          <Divider />

          {/* 第三方共享 */}
          <PreferenceSection $token={token}>
            <div className="section-header">
              <h2>{intl.formatMessage({ id: 'privacyPreferences.thirdParty.title', defaultMessage: '第三方数据共享' })}</h2>
            </div>
            <p className="section-description">
              {intl.formatMessage({ 
                id: 'privacyPreferences.thirdParty.description', 
                defaultMessage: '控制是否允许与第三方服务提供商共享您的数据。' 
              })}
            </p>
            
            <PreferenceItem $token={token}>
              <div className="item-content">
                <div className="item-title">
                  {intl.formatMessage({ id: 'privacyPreferences.thirdParty.sharing', defaultMessage: '第三方数据共享' })}
                </div>
                <div className="item-description">
                  {intl.formatMessage({ 
                    id: 'privacyPreferences.thirdParty.sharing.desc', 
                    defaultMessage: '允许我们与可信的第三方服务提供商共享匿名化的使用数据，以改善服务。' 
                  })}
                </div>
              </div>
              <div className="item-switch">
                <Switch 
                  checked={preferences.thirdPartySharing}
                  onChange={(checked) => handlePreferenceChange('thirdPartySharing', checked)}
                />
              </div>
            </PreferenceItem>
          </PreferenceSection>

          <InfoBox $token={token}>
            <InfoCircleOutlined className="info-icon" />
            <div className="info-content">
              {isLoggedIn 
                ? intl.formatMessage({ 
                    id: 'privacyPreferences.info.loggedIn', 
                    defaultMessage: '您的隐私偏好设置将保存到您的账户中，并在所有设备上同步。您随时可以返回此页面修改这些设置。' 
                  })
                : intl.formatMessage({ 
                    id: 'privacyPreferences.info', 
                    defaultMessage: '您的隐私偏好设置将保存在本地，并会在您下次访问时自动应用。登录后可将设置同步到云端。' 
                  })
              }
            </div>
          </InfoBox>
        </PreferencesCard>

        <FooterActions $token={token}>
          <div className="actions-wrapper">
            <div className="back-link" onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
              {intl.formatMessage({ id: 'privacyPreferences.back', defaultMessage: '返回' })}
            </div>
            <Button 
              type="primary"
              className="save-button"
              size="large"
              loading={loading}
              onClick={handleSave}
              icon={<CheckCircleOutlined />}
            >
              {intl.formatMessage({ id: 'privacyPreferences.save', defaultMessage: '保存设置' })}
            </Button>
          </div>
        </FooterActions>

      </ContentContainer>
    </PageLayout>
  );
};

const PrivacyPreferencesPage = () => {
  const customTheme = {
    token: {
      colorPrimary: '#0070f3',
      borderRadius: 12,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { borderRadius: 12 },
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <PrivacyPreferencesContent />
    </ConfigProvider>
  );
};

export default PrivacyPreferencesPage;

