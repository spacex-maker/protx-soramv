import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SimpleHeader from "components/headers/simple";
import { ConfigProvider, theme, Button } from "antd";
import { FileTextOutlined, ArrowLeftOutlined, WalletOutlined } from "@ant-design/icons";
import { useIntl } from 'react-intl';

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

const AgreementCard = styled.div`
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

const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid ${props => props.$token.colorBorderSecondary};
  }
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
    margin: 24px 0 12px 0;
  }
  
  p {
    font-size: 14px;
    line-height: 1.8;
    color: ${props => props.$token.colorTextSecondary};
    margin: 0 0 12px 0;
  }
  
  ul, ol {
    margin: 12px 0;
    padding-left: 24px;
    
    li {
      font-size: 14px;
      line-height: 1.8;
      color: ${props => props.$token.colorTextSecondary};
      margin-bottom: 8px;
    }
  }
  
  .highlight {
    background: ${props => props.$token.colorWarningBg};
    border-left: 3px solid ${props => props.$token.colorWarning};
    padding: 12px 16px;
    border-radius: 8px;
    margin: 16px 0;
    font-size: 14px;
    color: ${props => props.$token.colorText};
  }
  
  .important {
    background: ${props => props.$token.colorErrorBg};
    border-left: 3px solid ${props => props.$token.colorError};
    padding: 12px 16px;
    border-radius: 8px;
    margin: 16px 0;
    font-size: 14px;
    color: ${props => props.$token.colorText};
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

  .primary-button {
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

const RechargeAgreementContent = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();

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
            <ArrowLeftOutlined /> {intl.formatMessage({ id: 'rechargeAgreement.back', defaultMessage: '返回' })}
          </div>
          <h1>
            <FileTextOutlined style={{ color: token.colorPrimary }} />
            {intl.formatMessage({ id: 'rechargeAgreement.title', defaultMessage: '充值服务协议' })}
          </h1>
          <p className="meta">
            {intl.formatMessage({ id: 'rechargeAgreement.lastUpdated', defaultMessage: '最后更新：' })}
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </HeaderArea>

        <AgreementCard $token={token}>
          <Section $token={token}>
            <h2>{intl.formatMessage({ id: 'rechargeAgreement.section1.title', defaultMessage: '一、协议范围' })}</h2>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section1.content1', 
                defaultMessage: '本协议是您与平台之间关于充值服务的法律协议。在使用充值服务前，请您仔细阅读本协议的全部内容。如您不同意本协议的任何内容，或者无法准确理解相关条款的含义，请不要进行充值操作。' 
              })}
            </p>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section1.content2', 
                defaultMessage: '当您点击"同意"或进行充值操作时，即表示您已充分阅读、理解并同意接受本协议的全部内容。' 
              })}
            </p>
          </Section>

          <Section $token={token}>
            <h2>{intl.formatMessage({ id: 'rechargeAgreement.section2.title', defaultMessage: '二、充值说明' })}</h2>
            <h3>{intl.formatMessage({ id: 'rechargeAgreement.section2.subtitle1', defaultMessage: '2.1 充值方式' })}</h3>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section2.content1', 
                defaultMessage: '平台支持以下充值方式：' 
              })}
            </p>
            <ul>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section2.method1', defaultMessage: '支付宝支付' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section2.method2', defaultMessage: '微信支付' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section2.method3', defaultMessage: '银行卡支付（银联、Visa、MasterCard）' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section2.method4', defaultMessage: 'USDT 加密货币支付（ERC20/TRC20）' })}</li>
            </ul>
            
            <h3>{intl.formatMessage({ id: 'rechargeAgreement.section2.subtitle2', defaultMessage: '2.2 充值币种' })}</h3>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section2.content2', 
                defaultMessage: '平台支持以下币种充值：人民币（CNY）、美元（USD）、USDT。不同币种之间可能存在汇率转换，具体汇率以充值时的实时汇率为准。' 
              })}
            </p>
            
            <h3>{intl.formatMessage({ id: 'rechargeAgreement.section2.subtitle3', defaultMessage: '2.3 充值限额' })}</h3>
            <ul>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section2.limit1', defaultMessage: '单次最低充值金额：1 元（或等值其他币种）' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section2.limit2', defaultMessage: '单次最高充值金额：50,000 元（或等值其他币种）' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section2.limit3', defaultMessage: '每日累计充值限额：100,000 元（或等值其他币种）' })}</li>
            </ul>
            
            <div className="highlight">
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section2.note', 
                defaultMessage: '注意：充值限额可能因支付方式、账户等级等因素而有所不同，具体以充值页面显示为准。' 
              })}
            </div>
          </Section>

          <Section $token={token}>
            <h2>{intl.formatMessage({ id: 'rechargeAgreement.section3.title', defaultMessage: '三、充值到账' })}</h2>
            <h3>{intl.formatMessage({ id: 'rechargeAgreement.section3.subtitle1', defaultMessage: '3.1 到账时间' })}</h3>
            <ul>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section3.time1', defaultMessage: '支付宝、微信支付：实时到账' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section3.time2', defaultMessage: '银行卡支付：1-3 个工作日到账' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section3.time3', defaultMessage: 'USDT 支付：根据区块链确认时间，通常 10-30 分钟到账' })}</li>
            </ul>
            
            <h3>{intl.formatMessage({ id: 'rechargeAgreement.section3.subtitle2', defaultMessage: '3.2 异常处理' })}</h3>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section3.content1', 
                defaultMessage: '如充值后未及时到账，请保留支付凭证，并及时联系客服处理。平台将在核实后尽快处理您的充值问题。' 
              })}
            </p>
          </Section>

          <Section $token={token}>
            <h2>{intl.formatMessage({ id: 'rechargeAgreement.section4.title', defaultMessage: '四、退款政策' })}</h2>
            <div className="important">
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section4.important', 
                defaultMessage: '重要提示：充值成功后，账户余额不支持直接退款。余额仅可用于平台内服务消费。' 
              })}
            </div>
            
            <h3>{intl.formatMessage({ id: 'rechargeAgreement.section4.subtitle1', defaultMessage: '4.1 退款条件' })}</h3>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section4.content1', 
                defaultMessage: '在以下情况下，您可以申请退款：' 
              })}
            </p>
            <ul>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section4.refund1', defaultMessage: '因平台系统故障导致重复充值' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section4.refund2', defaultMessage: '因平台原因导致服务无法正常使用，且账户余额未消费' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section4.refund3', defaultMessage: '其他经平台审核同意的特殊情况' })}</li>
            </ul>
            
            <h3>{intl.formatMessage({ id: 'rechargeAgreement.section4.subtitle2', defaultMessage: '4.2 退款流程' })}</h3>
            <ol>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section4.process1', defaultMessage: '提交退款申请，说明退款原因' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section4.process2', defaultMessage: '平台审核（通常 3-7 个工作日）' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section4.process3', defaultMessage: '审核通过后，退款将原路返回到您的支付账户' })}</li>
            </ol>
          </Section>

          <Section $token={token}>
            <h2>{intl.formatMessage({ id: 'rechargeAgreement.section5.title', defaultMessage: '五、账户安全' })}</h2>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section5.content1', 
                defaultMessage: '您有责任妥善保管账户信息及密码，因您自身原因导致账户被盗用或密码泄露造成的损失，平台不承担责任。' 
              })}
            </p>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section5.content2', 
                defaultMessage: '如发现账户异常，请立即联系客服并修改密码。平台将协助您处理相关问题。' 
              })}
            </p>
          </Section>

          <Section $token={token}>
            <h2>{intl.formatMessage({ id: 'rechargeAgreement.section6.title', defaultMessage: '六、免责声明' })}</h2>
            <ul>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section6.disclaimer1', defaultMessage: '因不可抗力（如自然灾害、战争、政府行为等）导致的服务中断，平台不承担责任' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section6.disclaimer2', defaultMessage: '因第三方支付平台故障导致的充值问题，平台将协助处理，但不承担直接责任' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section6.disclaimer3', defaultMessage: '因用户违反本协议或相关法律法规导致的损失，由用户自行承担' })}</li>
            </ul>
          </Section>

          <Section $token={token}>
            <h2>{intl.formatMessage({ id: 'rechargeAgreement.section7.title', defaultMessage: '七、协议修改' })}</h2>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section7.content1', 
                defaultMessage: '平台有权根据业务发展需要修改本协议。协议修改后，将在平台显著位置公示。如您继续使用充值服务，视为接受修改后的协议。' 
              })}
            </p>
          </Section>

          <Section $token={token}>
            <h2>{intl.formatMessage({ id: 'rechargeAgreement.section8.title', defaultMessage: '八、联系方式' })}</h2>
            <p>
              {intl.formatMessage({ 
                id: 'rechargeAgreement.section8.content1', 
                defaultMessage: '如您对本协议有任何疑问，或需要申请退款、处理充值问题，请通过以下方式联系我们：' 
              })}
            </p>
            <ul>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section8.contact1', defaultMessage: '客服邮箱：support@example.com' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section8.contact2', defaultMessage: '在线客服：工作日 9:00-18:00' })}</li>
              <li>{intl.formatMessage({ id: 'rechargeAgreement.section8.contact3', defaultMessage: '帮助中心：查看常见问题' })}</li>
            </ul>
          </Section>
        </AgreementCard>

        <FooterActions $token={token}>
          <div className="actions-wrapper">
            <div className="back-link" onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
              {intl.formatMessage({ id: 'rechargeAgreement.back', defaultMessage: '返回' })}
            </div>
            <Button 
              type="primary"
              className="primary-button"
              size="large"
              onClick={() => navigate('/recharge')}
            >
              <WalletOutlined style={{ marginRight: 6 }} />
              {intl.formatMessage({ id: 'rechargeAgreement.goRecharge', defaultMessage: '前往充值' })}
            </Button>
          </div>
        </FooterActions>

      </ContentContainer>
    </PageLayout>
  );
};

const RechargeAgreementPage = () => {
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
      <RechargeAgreementContent />
    </ConfigProvider>
  );
};

export default RechargeAgreementPage;

