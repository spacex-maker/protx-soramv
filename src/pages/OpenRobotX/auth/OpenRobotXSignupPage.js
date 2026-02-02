import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import { message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { auth } from '../../../api/auth';
import axios from '../../../api/axios';
import { useLocale } from '../../../contexts/LocaleContext';
import OpenRobotXHeader from '../components/OpenRobotXHeader';

const PageWrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(160deg, #0a0e17 0%, #0f1623 50%, #0a0e17 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72px 24px 24px 16px;
  @media (max-width: 768px) {
    padding: 72px 16px 24px;
  }
`;

const BackLink = styled(Link)`
  position: absolute;
  top: 88px;
  left: 24px;
  color: #9aa0a6;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s;
  &:hover {
    color: #00d4aa;
  }
  @media (max-width: 768px) {
    top: 80px;
    left: 16px;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px 36px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const Logo = styled.h1`
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  .x { color: #00d4aa; }
`;

const Subtitle = styled.p`
  margin: 0 0 24px;
  font-size: 14px;
  color: #9aa0a6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const inputBaseStyle = {
  width: '100%',
  padding: '12px 16px 12px 44px',
  fontSize: 15,
  color: '#e8eaed',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  outline: 'none',
};
const inputFocus = (e) => {
  e.target.style.borderColor = 'rgba(0, 212, 170, 0.4)';
  e.target.style.boxShadow = '0 0 0 1px rgba(0, 212, 170, 0.2)';
};
const inputBlur = (e) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
  e.target.style.boxShadow = 'none';
};

const InputWrap = styled.div`
  position: relative;
  width: 100%;
`;

/** 自定义国家选择器：触发框 + 下拉列表，与页面样式一致 */
const CountrySelectTrigger = styled.button`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 40px 0 44px;
  font-size: 15px;
  color: #e8eaed;
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }
  &:focus,
  &.open {
    border-color: rgba(0, 212, 170, 0.4);
    box-shadow: 0 0 0 1px rgba(0, 212, 170, 0.2);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .chevron {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-size: 12px;
    transition: transform 0.2s;
  }
  &.open .chevron {
    transform: translateY(-50%) rotate(180deg);
  }
`;

const CountryDropdown = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  max-height: 240px;
  overflow-y: auto;
  background: rgba(18, 22, 32, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  z-index: 10;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
`;

const CountryOption = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  color: #e8eaed;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: rgba(0, 212, 170, 0.1);
    color: #00d4aa;
  }
  &.selected {
    background: rgba(0, 212, 170, 0.12);
    color: #00d4aa;
  }
`;

const CodeRow = styled.div`
  display: flex;
  gap: 10px;
  input {
    flex: 1;
  }
`;

const SendCodeBtn = styled.button`
  flex-shrink: 0;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #00d4aa;
  background: rgba(0, 212, 170, 0.12);
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s, background 0.2s;
  &:hover:not(:disabled) {
    background: rgba(0, 212, 170, 0.2);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0a0e17;
  background: linear-gradient(135deg, #00d4aa, #00a8cc);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.02s;
  &:hover:not(:disabled) {
    opacity: 0.95;
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: #f87171;
  margin-top: -4px;
`;

const FooterLinks = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
  font-size: 14px;
  color: #9aa0a6;
  a {
    color: #00d4aa;
    text-decoration: none;
    margin-left: 4px;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const OpenRobotXSignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useLocale();
  const from = location.state?.from || '/openrobotx';

  const [countryCode, setCountryCode] = useState('CN');
  const [countries, setCountries] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countrySelectRef = useRef(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get('/base/countries/list-all-enable');
        if (res.data?.success && res.data?.data) {
          let list = res.data.data;
          const preferred = locale?.startsWith('zh') ? 'CN' : 'US';
          list = list.sort((a, b) => (a.code === preferred ? -1 : b.code === preferred ? 1 : 0));
          setCountries(list);
          if (list.length && (!countryCode || !list.some((c) => c.code === countryCode))) {
            setCountryCode(list[0].code);
          }
        }
      } catch (e) {
        message.error('获取国家列表失败');
      }
    };
    fetchCountries();
  }, [locale]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countrySelectRef.current && !countrySelectRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startCountdown = () => {
    setCountdown(300);
    const t = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('请先输入邮箱');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效邮箱');
      return;
    }
    setError('');
    setIsSending(true);
    try {
      const res = await axios.post('/base/productx/user/register-send-email', {
        email: email.trim(),
        locale: locale || 'zh_CN',
      });
      if (res.data?.success) {
        message.success('验证码已发送');
        startCountdown();
      } else {
        setError(res.data?.message || '发送失败');
      }
    } catch (err) {
      setError(err.response?.data?.message || '发送验证码失败');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !email.trim() || !code.trim() || !password || !confirmPassword) {
      setError('请填写全部字段');
      return;
    }
    if (username.length < 4 || username.length > 10) {
      setError('用户名长度为 4～10 个字符');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('用户名仅支持字母、数字、下划线、短横线');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效邮箱');
      return;
    }
    if (code.length !== 6) {
      setError('验证码为 6 位数字');
      return;
    }
    if (password.length < 6 || password.length > 20) {
      setError('密码长度为 6～20 个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const result = await auth.register({
        username: username.trim(),
        email: email.trim(),
        password,
        countryCode,
        code: code.trim(),
      });
      if (result.success) {
        message.success('注册成功，请登录');
        navigate('/openrobotx/login', { state: { from }, replace: true });
      } else {
        setError(result.message || '注册失败');
      }
    } catch (err) {
      setError(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrap>
      <Helmet>
        <title>注册 | Open Robot X</title>
        <meta name="description" content="注册 Open Robot X，探索人形机器人与具身智能" />
      </Helmet>
      <OpenRobotXHeader />
      <BackLink to="/openrobotx">← 返回 Open Robot X</BackLink>

      <Card>
        <Logo>Open Robot<span className="x">X</span></Logo>
        <Subtitle>创建账号，同步你的偏好与收藏</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputWrap ref={countrySelectRef}>
            <CountrySelectTrigger
              type="button"
              className={countryDropdownOpen ? 'open' : ''}
              onClick={() => countries.length > 0 && setCountryDropdownOpen((v) => !v)}
              disabled={!countries.length}
            >
              <GlobalOutlined
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 15,
                  color: '#6b7280',
                  fontSize: 18,
                  pointerEvents: 'none',
                }}
              />
              <span>
                {countries.length
                  ? (countries.find((c) => c.code === countryCode)?.localName || countryCode || '请选择国家/地区')
                  : '加载中…'}
              </span>
              <DownOutlined className="chevron" />
            </CountrySelectTrigger>
            {countryDropdownOpen && countries.length > 0 && (
              <CountryDropdown>
                {countries.map((c) => (
                  <CountryOption
                    key={c.code}
                    type="button"
                    className={countryCode === c.code ? 'selected' : ''}
                    onClick={() => {
                      setCountryCode(c.code);
                      setCountryDropdownOpen(false);
                    }}
                  >
                    {c.localName || c.code}
                  </CountryOption>
                ))}
              </CountryDropdown>
            )}
          </InputWrap>

          <InputWrap>
            <input
              type="text"
              placeholder="用户名（4～10 位，字母/数字/下划线/短横线）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              style={inputBaseStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
            <UserOutlined
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: 18,
              }}
            />
          </InputWrap>

          <InputWrap>
            <input
              type="text"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={inputBaseStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
            <MailOutlined
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: 18,
              }}
            />
          </InputWrap>

          <CodeRow>
            <InputWrap style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="邮箱验证码（6 位）"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoComplete="one-time-code"
                style={inputBaseStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
              <SafetyCertificateOutlined
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  fontSize: 18,
                }}
              />
            </InputWrap>
            <SendCodeBtn type="button" onClick={handleSendCode} disabled={countdown > 0 || isSending}>
              {isSending ? '发送中…' : countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
            </SendCodeBtn>
          </CodeRow>

          <InputWrap style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="密码（6～20 位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={inputBaseStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
            <LockOutlined
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: 18,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: 4,
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </InputWrap>

          <InputWrap style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              style={inputBaseStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
            <LockOutlined
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: 18,
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: 4,
              }}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </InputWrap>

          {error && <ErrorText>{error}</ErrorText>}

          <SubmitBtn type="submit" disabled={loading}>
            {loading ? '注册中…' : '注册'}
          </SubmitBtn>
        </Form>

        <FooterLinks>
          已有账号？<Link to={{ pathname: '/openrobotx/login', state: { from } }}>登录</Link>
        </FooterLinks>
      </Card>
    </PageWrap>
  );
};

export default OpenRobotXSignupPage;
