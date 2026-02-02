import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import { message } from 'antd';
import { MailOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { auth } from '../../../api/auth';
import { base } from '../../../api/base';
import GoogleGIcon from '../../Login/components/RightSection/GoogleGIcon';
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
  margin: 0 0 28px;
  font-size: 14px;
  color: #9aa0a6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const InputWrap = styled.div`
  position: relative;
  .ant-input-affix-wrapper {
    width: 100%;
    padding: 14px 16px 14px 44px;
    font-size: 15px;
    color: #e8eaed;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ant-input-affix-wrapper:hover,
  .ant-input-affix-wrapper-focused {
    border-color: rgba(0, 212, 170, 0.4);
    box-shadow: 0 0 0 1px rgba(0, 212, 170, 0.2);
  }
  .ant-input {
    background: transparent !important;
    color: #e8eaed;
  }
  .ant-input::placeholder {
    color: #6b7280;
  }
  .prefix-icon {
    color: #6b7280;
    font-size: 18px;
    margin-right: 4px;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
  span {
    font-size: 12px;
    color: #6b7280;
  }
`;

const SocialWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const SocialBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #e8eaed;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  &:hover {
    border-color: rgba(0, 212, 170, 0.4);
    background: rgba(0, 212, 170, 0.08);
    color: #00d4aa;
  }
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
  .forgot {
    display: block;
    margin-top: 8px;
    font-size: 13px;
  }
`;

const OpenRobotXLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/openrobotx';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethods, setLoginMethods] = useState([]);

  useEffect(() => {
    const fetchMethods = async () => {
      const result = await base.getLoginMethodsByCountry('CN');
      if (result.success && result.data) {
        setLoginMethods(result.data.filter((m) => m.code === 'google'));
      }
    };
    fetchMethods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      const result = await auth.login({ email: email.trim(), password });
      if (result.success) {
        message.success('登录成功');
        navigate(from, { replace: true });
      } else {
        setError(result.message || '登录失败');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await auth.getGoogleAuthUrl();
    if (result.success && result.data) {
      window.location.href = result.data;
    } else {
      message.error(result.message || '获取授权链接失败');
    }
  };

  return (
    <PageWrap>
      <Helmet>
        <title>登录 | Open Robot X</title>
        <meta name="description" content="登录 Open Robot X，探索人形机器人与具身智能" />
      </Helmet>
      <OpenRobotXHeader />
      <BackLink to="/openrobotx">← 返回 Open Robot X</BackLink>

      <Card>
        <Logo>Open Robot<span className="x">X</span></Logo>
        <Subtitle>登录以同步你的偏好与收藏</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputWrap>
            <input
              type="text"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                fontSize: 15,
                color: '#e8eaed',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0, 212, 170, 0.4)';
                e.target.style.boxShadow = '0 0 0 1px rgba(0, 212, 170, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
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

          <InputWrap style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '14px 44px 14px 44px',
                fontSize: 15,
                color: '#e8eaed',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0, 212, 170, 0.4)';
                e.target.style.boxShadow = '0 0 0 1px rgba(0, 212, 170, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
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

          {error && <ErrorText>{error}</ErrorText>}

          <SubmitBtn type="submit" disabled={loading}>
            {loading ? '登录中…' : '登录'}
          </SubmitBtn>
        </Form>

        {loginMethods.some((m) => m.code === 'google') && (
          <>
            <Divider><span>或</span></Divider>
            <SocialWrap>
              <SocialBtn type="button" onClick={handleGoogleLogin} title="Google 登录">
                <GoogleGIcon size={22} />
              </SocialBtn>
            </SocialWrap>
          </>
        )}

        <FooterLinks>
          <Link to="/reset-password" className="forgot">忘记密码？</Link>
          还没有账号？<Link to={{ pathname: '/openrobotx/signup', state: { from } }}>注册</Link>
        </FooterLinks>
      </Card>
    </PageWrap>
  );
};

export default OpenRobotXLoginPage;
