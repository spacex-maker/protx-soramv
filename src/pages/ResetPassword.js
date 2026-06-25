import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { ThemeContext, keyframes, css } from 'styled-components';
import { message, Dropdown, ConfigProvider, theme, Button } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { Helmet } from 'react-helmet';
import axios from '../api/axios';
import { base } from '../api/base';
import CaptchaField from 'components/security/CaptchaField';
import {
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DownOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import { useLocale } from '../contexts/LocaleContext';
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// 1. 动效定义
// ==========================================

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const glowAnimation = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.4), 
                0 0 10px rgba(99, 102, 241, 0.2),
                0 0 20px rgba(99, 102, 241, 0.1);
  }
  50% { 
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.6), 
                0 0 20px rgba(99, 102, 241, 0.4),
                0 0 30px rgba(99, 102, 241, 0.2);
  }
`;

// ==========================================
// 2. 样式组件
// ==========================================

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$token.colorBgLayout};
  background-image: 
    radial-gradient(at 0% 0%, ${props => props.$token.colorPrimary}15 0px, transparent 50%),
    radial-gradient(at 100% 100%, #8b5cf615 0px, transparent 50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

// 顶部控制栏 (固定在右上角)
const TopRightControls = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  gap: 12px;
  z-index: 20;
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.$token.colorBorder};
  background: ${props => props.$token.colorBgContainer};
  color: ${props => props.$token.colorTextSecondary};
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);

  &:hover {
    color: ${props => props.$token.colorPrimary};
    border-color: ${props => props.$token.colorPrimary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

// 核心卡片容器 (左右分栏布局)
const AuthCard = styled(motion.div)`
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: ${props => props.$token.colorBgContainer};
  border-radius: 32px;
  box-shadow: 
    0 20px 40px -10px rgba(0,0,0,0.1),
    0 0 0 1px ${props => props.$token.colorBorderSecondary};
  overflow: hidden;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    flex-direction: column;
    min-height: auto;
  }
`;

// 左侧视觉面板
const LeftPanel = styled.div`
  flex: 1;
  background: url("https://public-1258150206.cos.ap-nanjing.myqcloud.com/resetpassword.jpg") center center / cover no-repeat;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;

  /* 半透明遮罩层，增强文字可读性 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.6) 0%, rgba(139, 92, 246, 0.6) 100%);
  }

  @media (max-width: 768px) {
    display: none; /* 移动端隐藏左侧 */
  }
`;

const BrandIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  animation: ${floatAnimation} 6s ease-in-out infinite;
`;

const Quote = styled.div`
  position: relative;
  z-index: 1;
  
  h2 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
    color: white;
    line-height: 1.2;
  }
  
  p {
    font-size: 16px;
    opacity: 0.8;
    line-height: 1.6;
  }
`;

// 右侧表单面板
const FormPanel = styled.div`
  flex: 1.2;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${props => props.$token.colorBgContainer};

  @media (max-width: 768px) {
    padding: 40px 24px;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: ${props => props.$token.colorText};
    margin-bottom: 8px;
  }
  
  p {
    color: ${props => props.$token.colorTextSecondary};
    font-size: 15px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// 自定义输入框包装器
const InputGroup = styled.div`
  position: relative;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.$token.colorText};
  }
`;

const StyledInput = styled.input`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  padding-left: 48px; /* Space for icon */
  border-radius: 26px;
  border: 1px solid ${props => props.$token.colorBorder};
  background: ${props => props.$token.colorBgLayout};
  color: ${props => props.$token.colorText};
  font-size: 15px;
  transition: all 0.2s;
  outline: none;

  &:focus {
    border-color: ${props => props.$token.colorPrimary};
    background: ${props => props.$token.colorBgContainer};
    box-shadow: 0 0 0 4px ${props => props.$token.colorPrimaryBg};
  }

  &::placeholder {
    color: ${props => props.$token.colorTextPlaceholder};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: ${props => props.$hasLabel ? 'calc(8px + 14px + 8px + 26px)' : '26px'}; /* label height + margin + half input height */
  transform: translateY(-50%);
  color: ${props => props.$token.colorTextTertiary};
  font-size: 18px;
  pointer-events: none;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  ${StyledInput}:focus ~ & {
    color: ${props => props.$token.colorPrimary};
  }
`;

const ActionButton = styled.button`
  position: absolute;
  right: 12px;
  top: ${props => props.$hasLabel ? '38px' : '10px'};
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  
  /* 玻璃膜效果 */
  background: ${props => props.$disabled 
    ? 'rgba(128, 128, 128, 0.1)' 
    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  color: ${props => props.$disabled ? props.$token.colorTextDisabled : props.$token.colorPrimary};
  font-size: 13px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  
  /* 光晕效果 */
  ${props => !props.$disabled && !props.$noGlow && css`
    animation: ${glowAnimation} 2s ease-in-out infinite;
  `}

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
    border-color: rgba(99, 102, 241, 0.5);
    transform: scale(1.02);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5), 
                0 0 30px rgba(99, 102, 241, 0.3),
                0 0 45px rgba(99, 102, 241, 0.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &.sending {
    animation: ${pulseAnimation} 1.5s infinite, ${glowAnimation} 1s ease-in-out infinite;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  height: 52px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, ${props => props.$token.colorPrimary} 0%, #6366f1 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px ${props => props.$token.colorPrimary}40;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props => props.$token.colorPrimary}60;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SuffixDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: ${props => props.$token.colorBgElevated};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  padding: 6px;
`;

const SuffixItem = styled.div`
  padding: 10px 12px;
  font-size: 14px;
  color: ${props => props.$token.colorText};
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$token.colorFillTertiary};
    color: ${props => props.$token.colorPrimary};
  }
`;

const SuccessView = styled(motion.div)`
  text-align: center;
  padding: 40px 0;

  .icon-box {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${props => props.$token.colorSuccessBg};
    color: ${props => props.$token.colorSuccess};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin: 0 auto 24px;
  }

  h2 {
    font-size: 24px;
    color: ${props => props.$token.colorText};
    margin-bottom: 12px;
  }

  p {
    color: ${props => props.$token.colorTextSecondary};
    margin-bottom: 32px;
  }
`;

const BackToLoginLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  position: relative;
  overflow: hidden;
  background: ${props => props.$token.colorBgLayout};
  border: 1px solid ${props => props.$token.colorBorder};
  color: ${props => props.$token.colorText};
  transition: all 0.3s ease;

  /* 炫光效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmerAnimation} 2.5s ease-in-out infinite;
    pointer-events: none;
  }

  &:hover {
    transform: translateX(-4px);
    border-color: ${props => props.$token.colorPrimary};
    color: ${props => props.$token.colorPrimary};
    box-shadow: 0 4px 12px ${props => props.$token.colorPrimary}20;
  }

  .anticon {
    transition: transform 0.3s ease;
  }

  &:hover .anticon {
    transform: translateX(-3px);
  }
`;

// ==========================================
// 3. 逻辑组件
// ==========================================

const ResetPasswordContent = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  const { locale, changeLocale } = useLocale();
  
  // Contexts (User logic)
  const themeContext = useContext(ThemeContext);
  const [isDark, setIsDark] = useState(themeContext.mode === 'dark');
  
  // Form State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Dropdown State
  const [showSuffix, setShowSuffix] = useState(false);
  const dropdownRef = useRef(null);
  const captchaRefreshRef = useRef(null);
  const [languages, setLanguages] = useState([]);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');

  // Fetch Languages
  useEffect(() => {
    const fetchLangs = async () => {
      const res = await base.getEnabledLanguages();
      if (res.success) setLanguages(res.data.sort((a, b) => b.usageCount - a.usageCount));
    };
    fetchLangs();
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    themeContext.setTheme(newMode);
  };

  // Countdown Timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Email Handler
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    const atIndex = val.indexOf('@');
    // Show suffix only if @ is not present or is the last char
    if (val && (atIndex === -1 || atIndex === val.length - 1)) {
      setShowSuffix(true);
    } else {
      setShowSuffix(false);
    }
  };

  const handleSuffixClick = (suffix) => {
    const prefix = email.split('@')[0];
    setEmail(prefix + suffix);
    setShowSuffix(false);
  };

  // Click Outside Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuffix(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API Handlers
  const handleSendCode = async () => {
    if (!email) return message.error(intl.formatMessage({ id: 'resetPassword.error.emailRequired', defaultMessage: '请输入邮箱' }));
    
    setIsSending(true);
    try {
      const res = await axios.post('/base/productx/user/reset-pass-send-email', {
        email,
        captchaId,
        captchaCode,
      });
      if (res.data.success) {
        message.success(intl.formatMessage({ id: 'resetPassword.success.codeSent', defaultMessage: '验证码已发送' }));
        setCountdown(60);
        captchaRefreshRef.current?.();
      } else {
        message.error(res.data.message || intl.formatMessage({ id: 'resetPassword.error.sendFailed', defaultMessage: '发送失败' }));
        captchaRefreshRef.current?.();
      }
    } catch (err) {
      message.error(err.response?.data?.message || intl.formatMessage({ id: 'resetPassword.error.sendFailed', defaultMessage: '发送失败，请稍后重试' }));
      captchaRefreshRef.current?.();
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code || !password) return message.error(intl.formatMessage({ id: 'resetPassword.error.incomplete', defaultMessage: '请填写完整信息' }));
    if (password.length < 6) return message.error(intl.formatMessage({ id: 'resetPassword.error.passwordLength', defaultMessage: '密码长度至少6位' }));

    setLoading(true);
    try {
      const res = await axios.post('/base/productx/user/reset-pass', { email, code, password });
      if (res.data.success) {
        setIsSuccess(true);
      } else {
        message.error(res.data.message || intl.formatMessage({ id: 'resetPassword.error.resetFailed', defaultMessage: '重置失败' }));
      }
    } catch (err) {
      message.error(intl.formatMessage({ id: 'resetPassword.error.resetFailed', defaultMessage: '重置失败，请稍后重试' }));
    } finally {
      setLoading(false);
    }
  };

  const emailSuffixes = ["@qq.com", "@gmail.com", "@163.com", "@outlook.com", "@hotmail.com"];

  return (
    <PageLayout $token={token}>
      <Helmet>
        <title>{intl.formatMessage({ id: 'resetPassword.page.title', defaultMessage: 'Reset Password - AI2OBJ' })}</title>
      </Helmet>

      <TopRightControls>
        <ControlButton $token={token} onClick={toggleTheme}>
          {isDark ? <SunOutlined /> : <MoonOutlined />}
        </ControlButton>
        <Dropdown 
          menu={{ 
            items: languages.map(l => ({ key: l.languageCode, label: l.languageNameNative })),
            onClick: ({ key }) => changeLocale(key)
          }} 
          placement="bottomRight"
        >
          <ControlButton $token={token}><GlobalOutlined /></ControlButton>
        </Dropdown>
      </TopRightControls>

      <ContentContainer
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AuthCard $token={token}>
          
          {/* Left Visual Panel */}
          <LeftPanel $token={token}>
            <BrandIcon>
              <SafetyCertificateOutlined />
            </BrandIcon>
            <Quote>
              <h2><FormattedMessage id="resetPassword.promo.title" defaultMessage="Secure your account, Protect your creativity." /></h2>
              <p><FormattedMessage id="resetPassword.promo.description" defaultMessage="We implement bank-grade security protocols to ensure your data and creations remain exclusively yours." /></p>
            </Quote>
          </LeftPanel>

          {/* Right Form Panel */}
          <FormPanel $token={token}>
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormHeader $token={token}>
                    <div style={{ marginBottom: 16 }}>
                      <BackToLoginLink to="/login" $token={token}>
                        <ArrowLeftOutlined /> <FormattedMessage id="resetPassword.backToLogin" defaultMessage="返回登录" />
                      </BackToLoginLink>
                    </div>
                    <h1><FormattedMessage id="resetPassword.title" defaultMessage="重置密码" /></h1>
                    <p><FormattedMessage id="resetPassword.subtitle" defaultMessage="输入您的邮箱地址和新密码以重置账户访问权限。" /></p>
                  </FormHeader>

                  <Form onSubmit={handleSubmit} autoComplete="off">
                    {/* Email Input */}
                    <InputGroup $token={token} ref={dropdownRef}>
                      <label>{intl.formatMessage({ id: 'resetPassword.email.label', defaultMessage: '电子邮箱' })}</label>
                      <StyledInput 
                        $token={token} 
                        value={email}
                        onChange={handleEmailChange}
                        placeholder={intl.formatMessage({ id: 'resetPassword.email.placeholder', defaultMessage: 'name@example.com' })} 
                        type="email"
                      />
                      <InputIcon $token={token} $hasLabel><MailOutlined /></InputIcon>
                      <AnimatePresence>
                        {showSuffix && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <SuffixDropdown $token={token}>
                              {emailSuffixes.map(s => (
                                <SuffixItem key={s} $token={token} onMouseDown={() => handleSuffixClick(s)}>
                                  {email.split('@')[0]}{s}
                                </SuffixItem>
                              ))}
                            </SuffixDropdown>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </InputGroup>

                    <div style={{ marginBottom: 20 }}>
                      <CaptchaField
                        captchaId={captchaId}
                        captchaCode={captchaCode}
                        onCaptchaIdChange={setCaptchaId}
                        onCaptchaCodeChange={setCaptchaCode}
                        onRegisterRefresh={(fn) => { captchaRefreshRef.current = fn; }}
                      />
                    </div>

                    {/* Code Input */}
                    <InputGroup $token={token}>
                      <label>{intl.formatMessage({ id: 'resetPassword.code.label', defaultMessage: '验证码' })}</label>
                      <StyledInput 
                        $token={token} 
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder={intl.formatMessage({ id: 'resetPassword.code.placeholder', defaultMessage: '6位数字验证码' })} 
                        maxLength={6}
                        autoComplete="off"
                      />
                      <InputIcon $token={token} $hasLabel><SafetyCertificateOutlined /></InputIcon>
                      <ActionButton 
                        $token={token} 
                        $hasLabel 
                        $disabled={countdown > 0 || isSending}
                        className={isSending ? 'sending' : ''}
                        type="button"
                        onClick={handleSendCode}
                      >
                        {isSending 
                          ? intl.formatMessage({ id: 'resetPassword.sendCode.sending', defaultMessage: '发送中...' }) 
                          : countdown > 0 
                            ? intl.formatMessage({ id: 'resetPassword.sendCode.retry', defaultMessage: '{seconds}秒后重试' }, { seconds: countdown })
                            : intl.formatMessage({ id: 'resetPassword.sendCode', defaultMessage: '发送验证码' })}
                      </ActionButton>
                    </InputGroup>

                    {/* Password Input */}
                    <InputGroup $token={token}>
                      <label>{intl.formatMessage({ id: 'resetPassword.password.label', defaultMessage: '新密码' })}</label>
                      <StyledInput 
                        $token={token} 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={intl.formatMessage({ id: 'resetPassword.password.placeholder', defaultMessage: '设置新密码 (至少6位)' })} 
                        autoComplete="new-password"
                      />
                      <InputIcon $token={token} $hasLabel><LockOutlined /></InputIcon>
                      <ActionButton 
                        $token={token} 
                        $hasLabel
                        $noGlow
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          background: 'transparent', 
                          color: token.colorTextSecondary,
                          border: 'none',
                          backdropFilter: 'none',
                          boxShadow: 'none'
                        }}
                      >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </ActionButton>
                    </InputGroup>

                    <SubmitButton 
                      $token={token} 
                      type="submit" 
                      disabled={loading}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading 
                        ? intl.formatMessage({ id: 'resetPassword.button.loading', defaultMessage: '提交中...' }) 
                        : intl.formatMessage({ id: 'resetPassword.button', defaultMessage: '确认重置' })}
                    </SubmitButton>
                  </Form>
                </motion.div>
              ) : (
                <SuccessView 
                  key="success"
                  $token={token}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="icon-box"><CheckCircleFilled /></div>
                  <h2><FormattedMessage id="resetPassword.success.title" defaultMessage="重置成功" /></h2>
                  <p><FormattedMessage id="resetPassword.success.description" defaultMessage="您的密码已成功更新，现在可以使用新密码登录了。" /></p>
                  <SubmitButton $token={token} onClick={() => navigate('/login')}>
                    <FormattedMessage id="resetPassword.goToLogin" defaultMessage="立即登录" />
                  </SubmitButton>
                </SuccessView>
              )}
            </AnimatePresence>
          </FormPanel>
        </AuthCard>
      </ContentContainer>
    </PageLayout>
  );
};

// ==========================================
// 4. 根组件配置
// ==========================================

const ContentContainer = styled(motion.div)`
  width: 100%;
  max-width: 1000px;
  position: relative;
  z-index: 10;
  padding: 20px;
`;

const ResetPasswordPage = () => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.mode === 'dark';

  // 自定义主题 Token，根据暗黑模式切换
  const customTheme = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#6366f1', // Indigo 风格
      borderRadius: 10,
      fontFamily: "'Inter', sans-serif",
      controlHeight: 48,
    },
    components: {
      Button: { borderRadius: 12 },
      Input: { borderRadius: 12 }
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <ResetPasswordContent />
    </ConfigProvider>
  );
};

export default ResetPasswordPage;