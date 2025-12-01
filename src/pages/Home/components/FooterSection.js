import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  GithubOutlined,
  TwitterOutlined,
  WeiboOutlined,
  MailOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { ContentWrapper } from '../styles';

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
                <h3>Sora MV</h3>
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
                {intl.formatMessage({ id: 'footer.brand.description', defaultMessage: 'AI 驱动的视频生成平台，使用 Sora 技术将您的创意转化为惊艳的视频作品。' })}
              </p>
              <SocialLinks theme={theme}>
                <a href="https://github.com/spacex-maker" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <GithubOutlined />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <TwitterOutlined />
                </a>
                <a href="https://weibo.com" target="_blank" rel="noopener noreferrer" aria-label="Weibo">
                  <WeiboOutlined />
                </a>
                <a href="mailto:support@soramv.com" aria-label="Email">
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
                  <a href="mailto:support@soramv.com">
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

        <Copyright theme={theme}>
          <p>
            {intl.formatMessage(
              { id: 'footer.copyright', defaultMessage: '© {year} Sora MV. 保留所有权利。' },
              { year: currentYear }
            )}
          </p>
          <p style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {intl.formatMessage({ id: 'footer.description', defaultMessage: '本平台使用 Sora 技术提供 AI 视频生成服务' })}
            </Text>
          </p>
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default FooterSectionComponent;

