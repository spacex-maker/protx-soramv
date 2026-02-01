import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { 
  GithubOutlined, 
  AppleOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DownOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import GoogleGIcon from './GoogleGIcon';
import { 
  SiWechat, 
  SiTencentqq, 
  SiSinaweibo, 
  SiAlipay 
} from 'react-icons/si';
import { message } from 'antd';
import { base } from '../../../../api/base';
import { auth } from '../../../../api/auth';

import {
  RightSectionWrapper,
  LoginBox,
  Logo,
  Form,
  FormItem,
  InputWrapper,
  Input,
  BorderGlow,
  EmailSuffixButton,
  EmailSuffixDropdown,
  EmailSuffixOption,
  PasswordToggle,
  SubmitButton,
  Divider,
  SocialLogin,
  SocialButton,
  Footer,
  ErrorText,
  ForgotPasswordLink
} from './styles';

// 登录方式编码到图标的映射（Google 使用最新四色 G 图标，见 GoogleGIcon）
const LOGIN_METHOD_ICONS = {
  phone_sms: PhoneOutlined,
  wechat: SiWechat,
  qq: SiTencentqq,
  weibo: SiSinaweibo,
  alipay: SiAlipay,
  google: null,
  github: GithubOutlined,
  apple: AppleOutlined,
  facebook: FacebookOutlined,
  twitter: TwitterOutlined,
  linkedin: LinkedinOutlined,
  email: MailOutlined,
  password: LockOutlined,
};

// 暂时隐藏前 N 个登录方式（恢复时改为 0）
const HIDE_FIRST_LOGIN_METHODS = 3;

const emailSuffixes = [
  "@qq.com",
  "@gmail.com",
  "@163.com",
  "@126.com",
  "@outlook.com",
  "@hotmail.com",
  "@yahoo.com",
  "@foxmail.com",
  "@sina.com",
  "@sohu.com"
];

export const RightSection = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  handleSubmit,
  intl,
  locale
}) => {
  const [showSuffixDropdown, setShowSuffixDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loginMethods, setLoginMethods] = useState([]);
  const dropdownRef = useRef(null);
  const emailSuffixButtonRef = useRef(null);
  const inputWrapperRef = useRef(null);

  // 检测是否能访问谷歌
  const checkGoogleAccess = () => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      img.src = 'https://www.google.com/favicon.ico?' + Date.now();
    });
  };

  // 根据 locale 获取对应国家的登录方式，如果能访问谷歌则额外添加
  useEffect(() => {
    const fetchLoginMethods = async () => {
      // 中文使用中国(CN)的登录方式，其他使用美国(US)的登录方式
      const countryCode = locale === 'zh' ? 'CN' : 'US';
      const result = await base.getLoginMethodsByCountry(countryCode);
      if (result.success && result.data) {
        let methods = result.data;
        
        // 检测是否能访问谷歌，如果能且列表中没有谷歌，则添加
        const canAccessGoogle = await checkGoogleAccess();
        const hasGoogle = methods.some(m => m.code === 'google');
        
        if (canAccessGoogle && !hasGoogle) {
          methods = [...methods, {
            code: 'google',
            name: '{"zh":"Google","en":"Google"}',
            iconUrl: null,
            isDefault: false,
            sort: 99
          }];
        }
        
        setLoginMethods(methods);
      }
    };
    fetchLoginMethods();
  }, [locale]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(event.target) &&
        !emailSuffixButtonRef.current?.contains(event.target)
      ) {
        setShowSuffixDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    const atIndex = value.indexOf('@');
    if (atIndex !== -1 && value.length > atIndex + 1) {
      setShowSuffixDropdown(false);
    } else {
      setShowSuffixDropdown(true);
    }
  };

  const handleSuffixClick = (suffix) => {
    const emailPrefix = email.split("@")[0];
    setEmail(emailPrefix + suffix);
    setShowSuffixDropdown(false);
  };

  // 处理社交登录按钮点击
  const handleSocialLogin = async (methodCode) => {
    if (methodCode === 'google') {
      // 谷歌登录
      const result = await auth.getGoogleAuthUrl();
      if (result.success && result.data) {
        window.location.href = result.data;
      } else {
        message.error(result.message || '获取谷歌授权链接失败');
      }
    } else {
      // 其他登录方式暂未实现
      message.info('该登录方式正在开发中');
    }
  };

  const handleSuffixButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSuffixDropdown(!showSuffixDropdown);
  };

  return (
    <RightSectionWrapper>
      <LoginBox>
        <Logo>
          <FormattedMessage id="login.title" />
        </Logo>
        <Form onSubmit={handleSubmit} autoComplete="off">
          <FormItem>
            <InputWrapper ref={inputWrapperRef}>
              <Input
                type="text"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder={intl.formatMessage({ id: 'login.email.placeholder' })}
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={intl.formatMessage({ id: 'login.password.placeholder' })}
                autoComplete="new-password"
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
            <ForgotPasswordLink to="/reset-password">
              <FormattedMessage id="login.forgotPassword" defaultMessage="忘记密码？" />
            </ForgotPasswordLink>
          </FormItem>

          {error && <ErrorText>{error}</ErrorText>}

          <SubmitButton type="submit" disabled={loading}>
            <FormattedMessage 
              id={loading ? 'login.loading' : 'login.button'} 
            />
          </SubmitButton>

          <Divider>
            <span>
              <FormattedMessage id="login.divider" />
            </span>
          </Divider>

          <SocialLogin>
            {loginMethods
              .filter((_, i) => i >= HIDE_FIRST_LOGIN_METHODS)
              .map((method, index) => {
              const IconComponent = LOGIN_METHOD_ICONS[method.code];
              const isGoogle = method.code === 'google';
              const hasIcon = isGoogle || IconComponent;
              // 解析多语言名称，获取当前语言的名称
              let methodName = method.code;
              try {
                const nameObj = JSON.parse(method.name);
                methodName = nameObj[locale] || nameObj['en'] || method.code;
              } catch {
                methodName = method.name || method.code;
              }
              
              // 将 phone_sms 映射为 phone 类型以匹配样式
              const socialType = method.code === 'phone_sms' ? 'phone' : method.code;
              
              return hasIcon ? (
                <SocialButton 
                  key={method.code}
                  type="button" 
                  socialType={socialType} 
                  index={index} 
                  title={methodName}
                  onClick={() => handleSocialLogin(method.code)}
                >
                  {isGoogle ? <GoogleGIcon size={20} /> : <IconComponent />}
                </SocialButton>
              ) : null;
            })}
          </SocialLogin>

          <Footer>
            <div>
              <FormattedMessage id="login.signup" />{' '}
              <Link to="/signup">
                <FormattedMessage id="login.signup.link" />
              </Link>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}>
              <Link to="/terms-of-service" style={{ marginRight: '1rem' }}>
                <FormattedMessage id="footer.legal.terms" />
              </Link>
              <Link to="/privacy-policy">
                <FormattedMessage id="footer.legal.privacy" />
              </Link>
            </div>
          </Footer>
        </Form>
      </LoginBox>
    </RightSectionWrapper>
  );
}; 