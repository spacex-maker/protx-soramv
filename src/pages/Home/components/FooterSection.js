import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  GithubOutlined,
  MailOutlined,
  TeamOutlined,
  RightOutlined
} from '@ant-design/icons';
import { ContentWrapper } from '../styles';

// X (Twitter) 图标组件
const XIcon = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// TikTok 图标组件
const TikTokIcon = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Discord 图标组件
const DiscordIcon = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const { Text } = Typography;

const FooterContainer = styled.footer`
  padding: 80px 0 40px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)'
    : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'};
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#1e293b' : '#e2e8f0'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(90deg, transparent, rgba(41, 151, 255, 0.3), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)'};
  }
`;

const FooterContent = styled(ContentWrapper)`
  position: relative;
  z-index: 1;
`;

const FooterSection = styled.div`
  margin-bottom: 48px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
    letter-spacing: -0.01em;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      margin-bottom: 12px;
      
      a {
        color: ${props => props.theme.mode === 'dark' ? '#86868b' : '#6e6e73'};
        font-size: 14px;
        text-decoration: none;
        transition: all 0.2s ease;
        display: inline-block;
        
        &:hover {
          color: ${props => props.theme.mode === 'dark' ? '#2997ff' : '#3b82f6'};
          transform: translateX(4px);
        }
      }
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  
  a {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.05)'};
    border: 1px solid ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'};
    color: ${props => props.theme.mode === 'dark' ? '#86868b' : '#6e6e73'};
    transition: all 0.3s ease;
    font-size: 18px;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(41, 151, 255, 0.1)' 
        : 'rgba(59, 130, 246, 0.1)'};
      border-color: ${props => props.theme.mode === 'dark' ? '#2997ff' : '#3b82f6'};
      color: ${props => props.theme.mode === 'dark' ? '#2997ff' : '#3b82f6'};
      transform: translateY(-2px);
    }
  }
`;

const OpenRobotXBlock = styled.div`
  margin-bottom: 40px;
  padding: 24px 28px;
  border-radius: 16px;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(0, 212, 170, 0.08) 0%, rgba(0, 212, 170, 0.03) 100%)'
    : 'linear-gradient(135deg, rgba(0, 212, 170, 0.06) 0%, rgba(0, 212, 170, 0.02) 100%)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(0, 212, 170, 0.2)' : 'rgba(0, 212, 170, 0.25)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;

  .openrobotx-text {
    flex: 1;
    min-width: 260px;
    h4 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
    }
    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.55;
      color: ${props => props.theme.mode === 'dark' ? '#86868b' : '#6e6e73'};
    }
  }
  .openrobotx-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #00d4aa;
    background: rgba(0, 212, 170, 0.12);
    border: 1px solid rgba(0, 212, 170, 0.35);
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      color: #fff;
      background: #00d4aa;
      border-color: #00d4aa;
      transform: translateX(2px);
    }
    .anticon { font-size: 12px; }
  }
`;

const Copyright = styled.div`
  padding-top: 40px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#1e293b' : '#e2e8f0'};
  text-align: center;
  
  p {
    color: ${props => props.theme.mode === 'dark' ? '#666' : '#999'};
    font-size: 13px;
    margin: 0;
    line-height: 1.6;
  }
`;

const BrandSection = styled.div`
  p {
    color: ${props => props.theme.mode === 'dark' ? '#86868b' : '#6e6e73'};
    font-size: 14px;
    line-height: 1.6;
    max-width: 280px;
  }
`;

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(135deg, #fff 0%, #86868b 100%)'
      : 'linear-gradient(135deg, #1d1d1f 0%, #6e6e73 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
  }
`;

const JoinUsButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#fff'};
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 2px 8px rgba(102, 126, 234, 0.3)'
    : '0 2px 8px rgba(99, 102, 241, 0.25)'};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${props => props.theme.mode === 'dark'
      ? '0 6px 20px rgba(102, 126, 234, 0.4)'
      : '0 6px 20px rgba(99, 102, 241, 0.35)'};
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
  
  .icon {
    font-size: 14px;
    transition: transform 0.3s ease;
  }
  
  &:hover .icon {
    transform: scale(1.1);
  }
`;

const FooterSectionComponent = () => {
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();
  const intl = useIntl();

  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer theme={theme}>
      <FooterContent>
        <Row gutter={[48, 48]}>
          {/* 品牌介绍 */}
          <Col xs={24} sm={12} md={6}>
            <BrandSection theme={theme}>
              <BrandHeader theme={theme}>
                <h3>AI2OBJ</h3>
                <JoinUsButton 
                  theme={theme}
                  onClick={() => navigate('/join-us')}
                  aria-label={intl.formatMessage({ id: 'footer.joinUs', defaultMessage: '加入我们' })}
                >
                  <TeamOutlined className="icon" />
                  {intl.formatMessage({ id: 'footer.joinUs', defaultMessage: '加入我们' })}
                </JoinUsButton>
              </BrandHeader>
              <p>
                {intl.formatMessage({ id: 'footer.brand.description', defaultMessage: 'AI 驱动的 3D 模型生成平台，将您的创意转化为专业的 3D 模型。' })}
              </p>
              <SocialLinks theme={theme}>
                <a href="https://github.com/spacex-maker" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <GithubOutlined />
                </a>
                <a href="https://x.com/Random202445171" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                  <XIcon style={{ width: '18px', height: '18px' }} />
                </a>
                <a href="https://tiktok.com/@protx2024" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <TikTokIcon style={{ width: '18px', height: '18px' }} />
                </a>
                <a href="https://discord.gg/phZj6KWe" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                  <DiscordIcon style={{ width: '18px', height: '18px' }} />
                </a>
                <a href="mailto:support@ai2obj.com" aria-label="Email">
                  <MailOutlined />
                </a>
              </SocialLinks>
            </BrandSection>
          </Col>

          {/* 产品 */}
          <Col xs={12} sm={6} md={4}>
            <FooterSection theme={theme}>
              <h4>{intl.formatMessage({ id: 'footer.product.title', defaultMessage: '产品' })}</h4>
              <ul>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
                    {intl.formatMessage({ id: 'footer.product.signup', defaultMessage: '注册账号' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                    {intl.formatMessage({ id: 'footer.product.login', defaultMessage: '登录' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/workspace'); }}>
                    {intl.formatMessage({ id: 'footer.product.workspace', defaultMessage: '工作台' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/works'); }}>
                    {intl.formatMessage({ id: 'footer.product.works', defaultMessage: '我的作品' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>
                    {intl.formatMessage({ id: 'footer.product.community', defaultMessage: '社区' })}
                  </a>
                </li>
              </ul>
            </FooterSection>
          </Col>

          {/* 支持 */}
          <Col xs={12} sm={6} md={4}>
            <FooterSection theme={theme}>
              <h4>{intl.formatMessage({ id: 'footer.support.title', defaultMessage: '支持' })}</h4>
              <ul>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/help'); }}>
                    {intl.formatMessage({ id: 'footer.support.help', defaultMessage: '帮助中心' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>
                    {intl.formatMessage({ id: 'footer.support.about', defaultMessage: '关于我们' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/feedback'); }}>
                    {intl.formatMessage({ id: 'footer.support.feedback', defaultMessage: '意见反馈' })}
                  </a>
                </li>
                <li>
                  <a href="mailto:support@ai2obj.com">
                    {intl.formatMessage({ id: 'footer.support.contact', defaultMessage: '联系我们' })}
                  </a>
                </li>
              </ul>
            </FooterSection>
          </Col>

          {/* 法律 */}
          <Col xs={12} sm={6} md={4}>
            <FooterSection theme={theme}>
              <h4>{intl.formatMessage({ id: 'footer.legal.title', defaultMessage: '法律' })}</h4>
              <ul>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }}>
                    {intl.formatMessage({ id: 'footer.legal.privacy', defaultMessage: '隐私政策' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/terms-of-service'); }}>
                    {intl.formatMessage({ id: 'footer.legal.terms', defaultMessage: '服务条款' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/recharge-agreement'); }}>
                    {intl.formatMessage({ id: 'footer.legal.recharge', defaultMessage: '充值协议' })}
                  </a>
                </li>
              </ul>
            </FooterSection>
          </Col>

          {/* 资源 */}
          <Col xs={12} sm={6} md={6}>
            <FooterSection theme={theme}>
              <h4>{intl.formatMessage({ id: 'footer.resources.title', defaultMessage: '资源' })}</h4>
              <ul>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/invite'); }}>
                    {intl.formatMessage({ id: 'footer.resources.invite', defaultMessage: '邀请好友' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/billing'); }}>
                    {intl.formatMessage({ id: 'footer.resources.account', defaultMessage: '账户管理' })}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/orders'); }}>
                    {intl.formatMessage({ id: 'footer.resources.orders', defaultMessage: '订单中心' })}
                  </a>
                </li>
              </ul>
            </FooterSection>
          </Col>
        </Row>

        {/* Open Robot X 跳转 */}
        <OpenRobotXBlock theme={theme}>
          <div className="openrobotx-text">
            <h4>{intl.formatMessage({ id: 'footer.openRobotX.title', defaultMessage: '探索人形机器人' })}</h4>
            <p>{intl.formatMessage({ id: 'footer.openRobotX.description', defaultMessage: '对人形机器人与具身智能感兴趣？欢迎访问 Open Robot X，了解全球人形机器人公司、参数对比与行业资讯。' })}</p>
          </div>
          <a
            href="https://openrobotx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="openrobotx-cta"
          >
            {intl.formatMessage({ id: 'footer.openRobotX.visit', defaultMessage: '前往 Open Robot X' })}
            <RightOutlined />
          </a>
        </OpenRobotXBlock>

        <Copyright theme={theme}>
          <p>
            {intl.formatMessage(
              { id: 'footer.copyright', defaultMessage: '© {year} AI2OBJ. 保留所有权利。' },
              { year: currentYear }
            )}
          </p>
          <p style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {intl.formatMessage({ id: 'footer.description', defaultMessage: '本平台提供 AI 3D 模型生成服务' })}
            </Text>
          </p>
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default FooterSectionComponent;

