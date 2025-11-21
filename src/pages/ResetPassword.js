import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { ThemeContext, keyframes } from 'styled-components';
import { message, Dropdown } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { Helmet } from 'react-helmet';
import axios from '../api/axios';
import { base } from '../api/base';
import {
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useLocale } from '../contexts/LocaleContext';

// 定义跑马灯效果
const marqueeGlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

// 添加发送验证码时的脉冲动画
const sendingPulse = keyframes`
  0% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-50%) scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
`;

// 添加发光扩散动画
const glowRipple = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

// 复用 Login 页面的样式组件
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-bg-container)' 
    : '#f5f7fa'};
`;

const TopRightControls = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 1rem;
  z-index: 10;
`;

const IconButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.06)'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.04)' 
    : '#ffffff'};
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: var(--ant-color-primary);
    border-color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-bg-container)' 
    : '#ffffff'};
`;

const ResetBox = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'transparent' 
    : '#ffffff'};
  border-radius: 1rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? 'none' 
    : '0 4px 24px rgba(0, 0, 0, 0.08)'};
`;

const Logo = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--ant-color-text);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-border)' 
    : '#e5e7eb'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.04)' 
    : '#f9fafb'};
  color: var(--ant-color-text);
  font-size: 0.875rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: var(--ant-color-primary);
  }

  &::placeholder {
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(0, 0, 0, 0.25)'};
  }
`;

const VerifyCodeButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--ant-color-primary);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s;
  z-index: 3;
  border-radius: 4px;

  &:disabled {
    color: var(--ant-color-text-disabled);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: var(--ant-color-primary-hover);
  }

  &.sending {
    animation: ${sendingPulse} 1.5s ease-in-out infinite;
    background: var(--ant-color-primary);
    color: white;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--ant-color-primary);
      animation: ${glowRipple} 1.5s ease-out infinite;
      z-index: -1;
    }
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 1.1rem;
  z-index: 3;
  
  &:hover {
    color: var(--ant-color-text);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.5rem;
  border: none;
  background: var(--ant-color-primary);
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#000000'};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;

  &:hover {
    background: var(--ant-color-primary-hover);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: var(--ant-color-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  color: var(--ant-color-text-secondary);
  font-size: 0.875rem;

  a {
    color: var(--ant-color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: var(--ant-color-primary-hover);
    }
  }
`;

// 添加发光边框效果
const BorderGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 9999px;
  pointer-events: none;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    border-radius: inherit;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      #1890ff 25%, 
      #40a9ff 50%, 
      #1890ff 75%, 
      transparent 100%
    );
    background-size: 200% 100%;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: 
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: ${marqueeGlow} 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &.active::before {
    opacity: 1;
  }
`;

const EmailSuffixButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 3;

  &:hover {
    color: var(--ant-color-text);
  }
`;

const EmailSuffixDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : '#ffffff'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-border)' 
    : '#e5e7eb'};
  border-radius: 0.5rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  display: none;
  
  &.show {
    display: block;
  }
`;

const EmailSuffixOption = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--ant-color-text);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'var(--ant-color-primary-bg)'};
    color: var(--ant-color-primary);
  }
`;

// 邮箱后缀列表
const emailSuffixes = [
  "@qq.com",
  "@gmail.com",
  "@163.com",
  "@126.com",
  "@outlook.com",
  "@hotmail.com",
  "@yahoo.com",
  "@foxmail.com"
];

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const theme = useContext(ThemeContext);
  const [isDark, setIsDark] = useState(theme.mode === 'dark');
  const { locale, changeLocale } = useLocale();
  const intl = useIntl();
  const [languages, setLanguages] = useState([]);
  
  // 添加邮箱下拉框相关状态
  const [showSuffixDropdown, setShowSuffixDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const emailSuffixButtonRef = useRef(null);
  
  // 添加输入框焦点状态
  const [emailFocused, setEmailFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [isSending, setIsSending] = useState(false);

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

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    theme.setTheme(newIsDark);
  };

  // 构建语言菜单项
  const items = languages.map(language => ({
    key: language.languageCode,
    label: language.languageNameNative
  }));

  // 处理邮箱输入
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // 只有当输入了@并且@后面有内容时才隐藏下拉框
    const atIndex = value.indexOf('@');
    if (atIndex !== -1 && value.length > atIndex + 1) {
      setShowSuffixDropdown(false);
    } else {
      setShowSuffixDropdown(true);
    }
  };

  // 处理邮箱后缀点击
  const handleSuffixClick = (suffix) => {
    const emailPrefix = email.split("@")[0];
    setEmail(emailPrefix + suffix);
    setShowSuffixDropdown(false);
  };

  // 修改邮箱后缀下拉框的处理逻辑
  const handleSuffixButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSuffixDropdown(!showSuffixDropdown);
  };

  // 处理点击文档其他地方关闭下拉框
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        emailSuffixButtonRef.current && 
        !emailSuffixButtonRef.current.contains(event.target)
      ) {
        setShowSuffixDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(300); // 5分钟 = 300秒
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email) {
      setError(intl.formatMessage({ id: 'resetPassword.error.emailRequired' }));
      return;
    }

    setIsSending(true);

    try {
      const response = await axios.post('/base/productx/user/reset-pass-send-email', {
        email
      });

      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'resetPassword.success.codeSent' }));
        startCountdown();
      } else {
        setError(response.data.message || intl.formatMessage({ id: 'resetPassword.error.sendFailed' }));
      }
    } catch (error) {
      setError(error.response?.data?.message || intl.formatMessage({ id: 'resetPassword.error.sendFailed' }));
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !code || !password) {
      if (!email) {
        setError(intl.formatMessage({ id: 'resetPassword.error.emailRequired' }));
      } else if (!code) {
        setError(intl.formatMessage({ id: 'resetPassword.error.codeRequired' }));
      } else {
        setError(intl.formatMessage({ id: 'resetPassword.error.passwordRequired' }));
      }
      return;
    }

    if (password.length < 6 || password.length > 20) {
      setError(intl.formatMessage({ id: 'resetPassword.error.passwordLength' }));
      return;
    }

    if (code.length !== 6) {
      setError(intl.formatMessage({ id: 'resetPassword.error.codeLength' }));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/base/productx/user/reset-pass', {
        email,
        code,
        password
      });

      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'resetPassword.success.reset' }));
        navigate('/login');
      } else {
        setError(response.data.message || intl.formatMessage({ id: 'resetPassword.error.resetFailed' }));
      }
    } catch (error) {
      setError(error.response?.data?.message || intl.formatMessage({ id: 'resetPassword.error.resetFailed' }));
      setError(error.response?.data?.message || '重置密码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({ id: 'resetPassword.page.title',             defaultMessage: '重置密码 - Sora MV' })}</title>
        <meta 
          name="description" 
          content={intl.formatMessage({ 
            id: 'resetPassword.page.description', 
            defaultMessage: '重置您的 Sora MV 账户密码'
          })} 
        />
      </Helmet>
      <PageContainer>
        <TopRightControls>
          <IconButton onClick={toggleTheme}>
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </IconButton>
          <Dropdown
            menu={{
              items,
              selectedKeys: [locale],
              onClick: ({ key }) => changeLocale(key),
            }}
            placement="bottomRight"
          >
            <IconButton>
              <GlobalOutlined />
            </IconButton>
          </Dropdown>
        </TopRightControls>

        <RightSection>
          <ResetBox>
            <Logo>
              <FormattedMessage id="resetPassword.title" defaultMessage="重置密码" />
            </Logo>
            <Form onSubmit={handleSubmit}>
              <FormItem>
                <InputWrapper>
                  <Input
                    type="text"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    placeholder={intl.formatMessage({ id: 'resetPassword.email.placeholder', defaultMessage: '请输入邮箱地址' })}
                    autoComplete="off"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={(e) => {
                      if (
                        emailSuffixButtonRef.current && 
                        !emailSuffixButtonRef.current.contains(e.relatedTarget)
                      ) {
                        setEmailFocused(false);
                      }
                    }}
                  />
                  <BorderGlow className={emailFocused ? "active" : ""} />
                  {!email.includes('@') && (
                    <EmailSuffixButton
                      type="button"
                      onClick={handleSuffixButtonClick}
                      ref={emailSuffixButtonRef}
                    >
                      <DownOutlined />
                    </EmailSuffixButton>
                  )}
                  <EmailSuffixDropdown 
                    ref={dropdownRef}
                    className={showSuffixDropdown ? "show" : ""}
                  >
                    {emailSuffixes.map((suffix, index) => (
                      <EmailSuffixOption
                        key={index}
                        type="button"
                        onClick={() => handleSuffixClick(suffix)}
                      >
                        {suffix}
                      </EmailSuffixOption>
                    ))}
                  </EmailSuffixDropdown>
                </InputWrapper>
              </FormItem>

              <FormItem>
                <InputWrapper>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder={intl.formatMessage({ id: 'resetPassword.code.placeholder', defaultMessage: '请输入验证码' })}
                    maxLength={6}
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                  />
                  <BorderGlow className={codeFocused ? "active" : ""} />
                  <VerifyCodeButton
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className={isSending ? 'sending' : ''}
                  >
                    {isSending 
                      ? intl.formatMessage({ id: 'resetPassword.sendCode.sending' })
                      : countdown > 0 
                        ? intl.formatMessage(
                            { id: 'resetPassword.sendCode.retry' },
                            { seconds: Math.floor(countdown) }
                          )
                        : intl.formatMessage({ id: 'resetPassword.sendCode' })
                    }
                  </VerifyCodeButton>
                </InputWrapper>
              </FormItem>

              <FormItem>
                <InputWrapper>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={intl.formatMessage({ id: 'resetPassword.password.placeholder', defaultMessage: '请输入新密码' })}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <BorderGlow className={passwordFocused ? "active" : ""} />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </PasswordToggle>
                </InputWrapper>
              </FormItem>

              {error && <ErrorText>{error}</ErrorText>}

              <SubmitButton type="submit" disabled={loading}>
                <FormattedMessage 
                  id={loading ? 'resetPassword.button.loading' : 'resetPassword.button'} 
                  defaultMessage={loading ? '重置中...' : '重置密码'}
                />
              </SubmitButton>

              <Footer>
                <Link to="/login">
                  <FormattedMessage id="resetPassword.backToLogin" defaultMessage="返回登录" />
                </Link>
              </Footer>
            </Form>
          </ResetBox>
        </RightSection>
      </PageContainer>
    </>
  );
} 