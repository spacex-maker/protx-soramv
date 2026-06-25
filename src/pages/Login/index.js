import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../../api/auth";
import { base } from "../../api/base";
import { loadRememberedLogin, saveRememberedLogin } from "../../utils/loginRemember";
import { consumeLoginRedirect, persistLoginRedirect } from "../../utils/loginRedirect";
import { message } from "antd";
import { ThemeContext } from "styled-components";
import { useLocale } from 'contexts/LocaleContext';
import { useIntl } from 'react-intl';
import SEO, { SEOConfigs } from 'components/SEO';

import { PageContainer, VersionTag } from './styles';
import { TopControls } from './components/TopControls';
import { RightSection } from './components/RightSection';
import { PhilosophyQuote, PoweredBy } from './components/Footer';
import ProductLogModal from 'components/modals/ProductLogModal';
import instance from 'api/axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = React.useContext(ThemeContext);
  const [isDark, setIsDark] = useState(theme.mode === 'dark');
  const { locale, changeLocale } = useLocale();
  const intl = useIntl();
  const [languages, setLanguages] = useState([]);
  const [productLogOpen, setProductLogOpen] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');

  const formatVersionLabel = (version) => {
    if (!version) return '';
    const trimmed = String(version).trim();
    return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
  };

  // 获取产品日志最新版本号
  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const response = await instance.get('/productx/product-update-log/list', {
          params: { currentPage: 1, pageSize: 1 },
        });
        if (response.data?.success && response.data.data?.data?.length) {
          setLatestVersion(formatVersionLabel(response.data.data.data[0].version));
        }
      } catch (error) {
        console.error('Failed to fetch latest product version:', error);
      }
    };
    fetchLatestVersion();
  }, []);

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
    const redirect = searchParams.get('redirect');
    if (redirect) {
      persistLoginRedirect(redirect);
    }
  }, [searchParams]);

  useEffect(() => {
    const saved = loadRememberedLogin();
    if (saved.remember) {
      setEmail(saved.email);
      setPassword(saved.password);
      setRememberPassword(true);
    }
  }, []);

  const handleSubmit = async (e, captcha) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await auth.login({
        email,
        password,
        captchaId: captcha?.captchaId,
        captchaCode: captcha?.captchaCode,
      });
      if (result.success) {
        saveRememberedLogin(email, password, rememberPassword);
        message.success("登录成功");
        navigate(consumeLoginRedirect('/workspace'));
      } else if (!result.isUserDisabled && !result.isIpBlocked) {
        setError(result.message || "登录失败");
        captcha?.refreshCaptcha?.();
      }
    } catch (error) {
      if (!error?.isUserDisabled && !error?.isIpBlocked) {
        setError(error.response?.data?.message || '登录失败，请稍后重试');
        captcha?.refreshCaptcha?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    theme.setTheme(newIsDark);
  };

  // 处理移动端虚拟键盘
  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty(
        '--vh',
        `${window.innerHeight * 0.01}px`
      );
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <>
      <SEO {...SEOConfigs.login}>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </SEO>
      <PageContainer>
        <VersionTag
          type="button"
          onClick={() => setProductLogOpen(true)}
          title={intl.formatMessage({
            id: 'login.version.changelog',
            defaultMessage: '查看产品更新日志',
          })}
        >
          {latestVersion || intl.formatMessage({ id: 'login.version.loading', defaultMessage: '版本加载中…' })}
        </VersionTag>

        <ProductLogModal
          open={productLogOpen}
          onClose={() => setProductLogOpen(false)}
        />
        
        <TopControls 
          isDark={isDark} 
          toggleTheme={toggleTheme}
          locale={locale}
          languages={languages}
          changeLocale={changeLocale}
        />

        <RightSection 
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          rememberPassword={rememberPassword}
          setRememberPassword={setRememberPassword}
          error={error}
          loading={loading}
          handleSubmit={handleSubmit}
          intl={intl}
          locale={locale}
        />

        <PhilosophyQuote>
          {intl.formatMessage({ id: 'common.philosophy' })}
        </PhilosophyQuote>
        
        <PoweredBy>
          © 2024 ProTX Team. All rights reserved.
        </PoweredBy>
      </PageContainer>
    </>
  );
};

export default LoginPage; 