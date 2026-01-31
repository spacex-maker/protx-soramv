import React, { useState, useEffect, useRef } from "react";
import styled, { css, keyframes } from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import SimpleHeader from "components/headers/simple";
import instance from "api/axios";
import { auth } from "api/auth";
import { payment } from "api/payment";
import { 
  Button, 
  ConfigProvider,
  theme,
  Statistic,
  Input,
  message,
  Tooltip,
  Spin
} from "antd";
import { 
  WalletOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  AlipayCircleFilled,
  WechatFilled,
  BankOutlined,
  DollarCircleFilled,
  SafetyCertificateFilled,
  RightOutlined,
  GiftFilled,
  ReloadOutlined,
  CreditCardOutlined
} from "@ant-design/icons";
import { 
  FaYenSign, 
  FaDollarSign
} from "react-icons/fa";
import { 
  SiTether 
} from "react-icons/si";
import dayjs from "dayjs";

// ==========================================
// 1. 样式系统 (Styled System) - 全面增加 ?. 保护
// ==========================================

const PageLayout = styled.div`
  min-height: ${props => props.$embedded ? 'auto' : '100vh'};
  width: 100%;
  background-color: ${props => props.$token?.colorBgLayout};
  /* 高级噪点纹理背景 */
  background-image: 
    radial-gradient(at 0% 0%, ${props => props.$token?.colorPrimary}15 0px, transparent 50%),
    radial-gradient(at 100% 100%, ${props => props.$token?.colorSuccess}10 0px, transparent 50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: ${props => props.$embedded ? '0' : '80px'};
  overflow-x: hidden;
  
  &::before {
    content: "";
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentContainer = styled(motion.div)`
  max-width: 1100px;
  width: 95%;
  margin: 20px auto 60px;
  position: relative;
  z-index: 10;
`;

// ==========================================
// 2. 头部组件
// ==========================================

const HeaderArea = styled.div`
  margin-bottom: 32px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  .left {
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: ${props => props.$token?.colorTextSecondary};
      margin-bottom: 12px;
      cursor: pointer;
      transition: color 0.2s;
      &:hover { color: ${props => props.$token?.colorPrimary}; }
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      color: ${props => props.$token?.colorText};
      margin: 0;
      letter-spacing: -0.5px;
    }
  }

  .balance-preview {
    text-align: right;
    .label { font-size: 12px; color: ${props => props.$token?.colorTextSecondary}; text-transform: uppercase; letter-spacing: 1px; }
    .val { font-size: 24px; font-weight: 700; color: ${props => props.$token?.colorText}; font-family: 'SF Mono', monospace; }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    .balance-preview { text-align: left; }
  }
`;

// ==========================================
// 现代化余额卡片组件
// ==========================================

const BalanceCard = styled(motion.div)`
  background: ${props => props.$token?.colorBgContainer};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border: 1px solid ${props => props.$token?.colorBorderSecondary};
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${props => props.$token?.colorPrimary} 0%, 
      ${props => props.$token?.colorSuccess} 100%);
  }

  .balance-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    
    .title {
      font-size: 14px;
      font-weight: 600;
      color: ${props => props.$token?.colorTextSecondary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .refresh-btn {
      cursor: pointer;
      color: ${props => props.$token?.colorTextTertiary};
      transition: all 0.2s;
      &:hover {
        color: ${props => props.$token?.colorPrimary};
        transform: rotate(180deg);
      }
    }
  }

  .balance-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  .balance-item {
    padding: 16px;
    border-radius: 12px;
    background: ${props => props.$token?.colorFillQuaternary};
    border: 1px solid ${props => props.$token?.colorBorder};
    transition: all 0.2s;
    
    &:hover {
      background: ${props => props.$token?.colorFillTertiary};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .coin-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: ${props => props.$token?.colorTextSecondary};
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      svg {
        transition: all 0.2s;
        flex-shrink: 0;
      }
    }

    .coin-value {
      font-size: 20px;
      font-weight: 700;
      color: ${props => props.$token?.colorText};
      font-family: 'SF Mono', monospace;
      line-height: 1.2;
    }

    &.active {
      background: ${props => props.$token?.colorPrimaryBg};
      border-color: ${props => props.$token?.colorPrimary};
      
      .coin-label {
        color: ${props => props.$token?.colorPrimary};
        
        svg {
          color: ${props => props.$token?.colorPrimary} !important;
          transform: scale(1.1);
        }
      }
      
      .coin-value {
        color: ${props => props.$token?.colorPrimary};
      }
    }
  }
`;

// ==========================================
// 3. 双栏布局系统
// ==========================================

const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const SideSection = styled.div`
  position: relative;
`;

// ==========================================
// 4. 核心组件：选择器与卡片
// ==========================================

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$token?.colorText};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 16px;
    background: ${props => props.$token?.colorPrimary};
    border-radius: 2px;
  }
`;

const CoinToggle = styled.div`
  display: flex;
  background: ${props => props.$token?.colorFillQuaternary};
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 32px;
`;

const CoinOption = styled.div`
  flex: 1;
  text-align: center;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  ${props => props.$active ? css`
    background: ${props.$token?.colorBgContainer};
    color: ${props.$token?.colorPrimary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    
    svg {
      color: ${props.$token?.colorPrimary};
      transform: scale(1.1);
    }
  ` : css`
    color: ${props.$token?.colorTextSecondary};
    
    svg {
      color: ${props.$token?.colorTextSecondary};
    }
    
    &:hover { 
      color: ${props.$token?.colorText}; 
      svg {
        color: ${props.$token?.colorText};
        transform: scale(1.05);
      }
    }
  `}
`;

const AmountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AmountCard = styled(motion.div)`
  position: relative;
  padding: 24px 16px;
  border-radius: 16px;
  background: ${props => props.$active ? props.$token?.colorPrimaryBg : props.$token?.colorBgContainer};
  border: 2px solid ${props => props.$active ? props.$token?.colorPrimary : 'transparent'};
  box-shadow: ${props => props.$active ? `0 0 0 4px ${props.$token?.colorPrimary}20` : '0 4px 20px rgba(0,0,0,0.02)'};
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
    border-color: ${props => props.$active ? props.$token?.colorPrimary : props.$token?.colorBorder};
  }

  .val-group {
    margin-bottom: 8px;
    .symbol { font-size: 16px; vertical-align: top; margin-right: 2px; }
    .num { font-size: 32px; font-weight: 800; font-family: 'SF Pro Display', sans-serif; line-height: 1; }
  }

  .bonus-badge {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.$token?.colorSuccess};
    background: ${props => props.$token?.colorSuccessBg};
    padding: 2px 8px;
    border-radius: 100px;
  }

  /* 热销标签 */
  ${props => props.$tag && css`
    &::after {
      content: '${props.$tag}';
      position: absolute;
      top: 0;
      right: 0;
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 12px;
      border-bottom-left-radius: 12px;
      box-shadow: -2px 2px 8px rgba(0,0,0,0.1);
    }
  `}
`;

const CustomInputWrapper = styled.div`
  margin-top: 16px;
  .ant-input-affix-wrapper {
    border-radius: 12px;
    padding: 12px 16px;
    border: 2px solid transparent;
    background: ${props => props.$token?.colorFillQuaternary};
    
    &:hover, &:focus-within {
      background: ${props => props.$token?.colorBgContainer};
      border-color: ${props => props.$token?.colorPrimary} !important;
      box-shadow: 0 0 0 4px ${props => props.$token?.colorPrimaryBg} !important;
    }

    input { font-size: 16px; font-weight: 600; text-align: center; background: transparent; }
  }
`;

const PaymentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PayItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 16px;
  background: ${props => props.$active ? props.$token?.colorBgContainer : props.$token?.colorBgLayout};
  border: 2px solid ${props => props.$active ? props.$token?.colorPrimary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$token?.colorBgContainer};
  }

  .icon-box {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .info {
    flex: 1;
    .title { font-size: 15px; font-weight: 600; color: ${props => props.$token?.colorText}; }
    .sub { font-size: 12px; color: ${props => props.$token?.colorTextSecondary}; }
  }

  .radio-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${props => props.$active ? props.$token?.colorPrimary : props.$token?.colorBorder};
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::after {
      content: '';
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${props => props.$token?.colorPrimary};
      opacity: ${props => props.$active ? 1 : 0};
      transform: scale(${props => props.$active ? 1 : 0});
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
`;

const ReceiptCard = styled.div`
  background: ${props => props.$token?.colorBgContainer};
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
  position: sticky;
  top: 100px;
  border: 1px solid ${props => props.$token?.colorBorderSecondary};

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 24px; right: 24px;
    height: 4px;
    background: ${props => props.$token?.colorPrimary};
    border-radius: 0 0 4px 4px;
  }
`;

const ReceiptRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  color: ${props => props.$token?.colorTextSecondary};
  
  span:last-child {
    font-weight: 600;
    color: ${props => props.$token?.colorText};
  }

  &.total {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px dashed ${props => props.$token?.colorBorder};
    font-size: 16px;
    align-items: flex-end;
    
    .total-price {
      font-size: 36px;
      font-weight: 800;
      color: ${props => props.$token?.colorPrimary};
      line-height: 1;
    }
  }
`;

const SecureBadge = styled.div`
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => props.$token?.colorSuccess};
  background: ${props => props.$token?.colorSuccessBg};
  padding: 8px;
  border-radius: 8px;
`;

// 脉冲动画
const pulseAnimation = keyframes`
  0%, 100% {
    box-shadow: 
      0 8px 24px rgba(0, 112, 243, 0.4),
      0 0 0 0 rgba(0, 112, 243, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 
      0 8px 32px rgba(0, 112, 243, 0.6),
      0 0 0 8px rgba(0, 112, 243, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

// 光效扫过动画
const shineAnimation = keyframes`
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
`;

const PayButton = styled(Button)`
  height: 56px;
  border-radius: 50px !important; /* 全圆弧 */
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 渐变背景 */
  background: linear-gradient(135deg, 
    ${props => props.$token?.colorPrimary} 0%, 
    ${props => {
      // 计算一个稍微亮一点的颜色作为渐变终点
      const primary = props.$token?.colorPrimary || '#0070f3';
      return primary;
    }} 100%
  ) !important;
  border: none !important;
  
  /* 基础阴影和光晕 */
  box-shadow: 
    0 8px 24px ${props => props.$token?.colorPrimary}40,
    0 0 0 0 ${props => props.$token?.colorPrimary}20,
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  /* 光效层 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    z-index: 1;
    pointer-events: none;
  }
  
  /* 内容层级 */
  > span {
    position: relative;
    z-index: 2;
  }
  
  /* 悬停效果 */
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 12px 32px ${props => props.$token?.colorPrimary}60,
      0 0 0 4px ${props => props.$token?.colorPrimary}20,
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    animation: ${pulseAnimation} 2s ease-in-out infinite;
    
    &::before {
      animation: ${shineAnimation} 0.6s ease-in-out;
    }
  }
  
  /* 激活/点击效果 */
  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
    box-shadow: 
      0 4px 16px ${props => props.$token?.colorPrimary}50,
      0 0 0 2px ${props => props.$token?.colorPrimary}30,
      inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* 加载状态 */
  &.ant-btn-loading {
    animation: ${pulseAnimation} 2s ease-in-out infinite;
  }
  
  /* 禁用状态 */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    animation: none !important;
  }
  
  /* 图标动画 */
  .anticon {
    transition: transform 0.3s ease;
    display: inline-flex;
    align-items: center;
  }
  
  &:hover:not(:disabled) .anticon {
    transform: translateX(4px);
  }
  
  /* 加载图标特殊处理 */
  .ant-btn-loading-icon {
    z-index: 3;
  }
`;

// ==========================================
// 2. 数据配置
// ==========================================

const PRESETS = {
  CNY: [
    { val: 50, bonus: '', tag: '' },
    { val: 100, bonus: '', tag: '' },
    { val: 200, bonus: '赠 20pts', tag: '人气' },
    { val: 500, bonus: '赠 60pts', tag: '推荐' },
    { val: 1000, bonus: '赠 150pts', tag: '超值' },
    { val: 5000, bonus: '赠 800pts', tag: '企业' }
  ],
  USDT: [
    { val: 10, bonus: '', tag: '' },
    { val: 50, bonus: '', tag: '' },
    { val: 100, bonus: '+5%', tag: 'HOT' },
    { val: 500, bonus: '+8%', tag: 'BEST' },
    { val: 1000, bonus: '+10%', tag: '' },
    { val: 5000, bonus: '+15%', tag: 'PRO' }
  ],
  USD: [
    { val: 10, bonus: '', tag: '' },
    { val: 50, bonus: '', tag: '' },
    { val: 100, bonus: '+5%', tag: 'HOT' },
    { val: 500, bonus: '+8%', tag: 'BEST' },
    { val: 1000, bonus: '+10%', tag: '' },
    { val: 5000, bonus: '+15%', tag: 'PRO' }
  ]
};

const PAY_METHODS = [
  { id: 'alipay', name: '支付宝', icon: <AlipayCircleFilled style={{color:'#1677ff'}} />, desc: '数亿用户的选择' },
  { id: 'wechat', name: '微信支付', icon: <WechatFilled style={{color:'#52c41a'}} />, desc: '国民级社交支付' },
  { id: 'creem', name: 'Creem 支付', icon: <CreditCardOutlined style={{color:'#1890ff'}} />, desc: '国际信用卡支付' },
  { id: 'usdt', name: '加密货币', icon: <DollarCircleFilled style={{color:'#26a17b'}} />, desc: 'USDT (TRC20/ERC20)' },
  { id: 'bank', name: '银行转账', icon: <BankOutlined style={{color:'#722ed1'}} />, desc: '大额支付首选' },
];

// ==========================================
// 3. 逻辑组件
// ==========================================

const RechargeContent = ({ embedded = false }) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  
  // State
  const [coinType, setCoinType] = useState('');
  const [amount, setAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balance, setBalance] = useState({ cny: 0.00, usdt: 0.00, usd: 0.00, token: 0.00 });
  const [username, setUsername] = useState('');
  const [currentOrderNo, setCurrentOrderNo] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [creemProducts, setCreemProducts] = useState([]);
  const [creemProductsLoading, setCreemProductsLoading] = useState(false);
  const [selectedCreemProduct, setSelectedCreemProduct] = useState(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);
  const orderPollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchBalance();
    fetchUserInfo();
    fetchSupportedCurrencies();
    
    // 清理轮询
    return () => {
      if (orderPollingIntervalRef.current) {
        clearInterval(orderPollingIntervalRef.current);
        orderPollingIntervalRef.current = null;
      }
    };
  }, []);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const response = await instance.get('/productx/user/balance');
      if (response.data.success && response.data.data) {
        const { balance: cnyBalance, usdtAmount, usdBalance, tokenBalance } = response.data.data;
        setBalance({ 
          cny: cnyBalance || 0, 
          usdt: usdtAmount || 0,
          usd: usdBalance || 0,
          token: tokenBalance || 0
        });
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.fetchBalanceError' }), error);
      message.error(intl.formatMessage({ id: 'recharge.message.fetchBalanceError' }));
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        setUsername(userInfo.username || '');
      } else {
        const result = await auth.getUserInfo();
        if (result.success && result.data) {
          setUsername(result.data.username || '');
        }
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.fetchUserInfoError' }), error);
    }
  };

  // 获取系统支持的货币列表
  const fetchSupportedCurrencies = async () => {
    setCurrenciesLoading(true);
    try {
      const result = await payment.getSupportedCurrencies();
      if (result.success && result.data) {
        setSupportedCurrencies(result.data);
        // 设置默认选中第一个货币
        if (result.data.length > 0 && !coinType) {
          const firstCurrency = result.data[0];
          setCoinType(firstCurrency.currencyCode);
          // 选择货币后，获取该货币支持的支付方式
          fetchPaymentMethods(firstCurrency.currencyCode);
        }
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.fetchCurrenciesError' }), error);
      message.error(intl.formatMessage({ id: 'recharge.message.fetchCurrenciesError' }));
    } finally {
      setCurrenciesLoading(false);
    }
  };

  const fetchPaymentMethods = async (currencyCode) => {
    setPaymentMethodsLoading(true);
    try {
      const result = await payment.getActivePaymentMethods(currencyCode);
      if (result.success && result.data) {
        const methods = result.data.map(method => ({
          id: method.paymentMethodCode,
          name: method.paymentMethodName,
          desc: method.descriptionZh || method.descriptionEn || '',
          iconUrl: method.iconUrl,
          method: method,
          // 根据 payment_method_code 选择对应的图标组件
          icon: getPaymentIcon(method.paymentMethodCode, method.iconUrl),
        }));
        setPaymentMethods(methods);
        // 设置默认选中第一个支付方式
        if (methods.length > 0) {
          setPayMethod(methods[0].id);
        } else {
          // 如果没有支付方式，清空所有选择
          setPayMethod('');
          setAmount(0);
          setCustomAmount('');
          setCreemProducts([]);
          setSelectedCreemProduct(null);
        }
      } else {
        // 如果请求失败或没有数据，清空所有选择
        setPaymentMethods([]);
        setPayMethod('');
        setAmount(0);
        setCustomAmount('');
        setCreemProducts([]);
        setSelectedCreemProduct(null);
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.fetchPaymentMethodsError' }), error);
      message.error(intl.formatMessage({ id: 'recharge.message.fetchPaymentMethodsError' }));
      // 出错时也清空选择
      setPaymentMethods([]);
      setPayMethod('');
      setAmount(0);
      setCustomAmount('');
      setCreemProducts([]);
      setSelectedCreemProduct(null);
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // 根据支付方式代码获取对应的图标组件
  const getPaymentIcon = (code, iconUrl) => {
    // 如果有图标URL，优先使用图片
    if (iconUrl) {
      return <img src={iconUrl} alt={code} style={{ width: 24, height: 24 }} />;
    }
    
    // 否则根据代码返回对应的图标组件
    const iconMap = {
      'alipay': <AlipayCircleFilled style={{color:'#1677ff'}} />,
      'wechat': <WechatFilled style={{color:'#52c41a'}} />,
      'creem': <CreditCardOutlined style={{color:'#1890ff'}} />,
      'usdt': <DollarCircleFilled style={{color:'#26a17b'}} />,
      'crypto_usdt': <DollarCircleFilled style={{color:'#26a17b'}} />,
      'bank': <BankOutlined style={{color:'#722ed1'}} />,
    };
    return iconMap[code] || <CreditCardOutlined style={{color:'#1890ff'}} />;
  };

  // 获取 Creem 产品列表
  const fetchCreemProducts = async (coinType) => {
    setCreemProductsLoading(true);
    try {
      const result = await payment.getCreemProducts(coinType);
      if (result.success && result.data) {
        const products = result.data.map(product => ({
          amount: parseFloat(product.amount),
          productId: product.creemProductId,
          productName: product.productName,
          baseToken: product.baseToken || 0,
          bonusToken: product.bonusToken || 0,
          totalToken: (product.baseToken || 0) + (product.bonusToken || 0),
          tag: product.tag,
          product: product,
        }));
        setCreemProducts(products);
        // 如果有产品，默认选中第一个
        if (products.length > 0) {
          setSelectedCreemProduct(products[0]);
          setAmount(products[0].amount);
          setCustomAmount('');
        }
      } else {
        setCreemProducts([]);
        message.warning(result.message || intl.formatMessage({ id: 'recharge.message.fetchCreemProductsWarning' }));
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.fetchCreemProductsError' }), error);
      setCreemProducts([]);
      message.error(intl.formatMessage({ id: 'recharge.message.fetchCreemProductsError' }));
    } finally {
      setCreemProductsLoading(false);
    }
  };

  // 监听币种变化，重新获取支付方式
  useEffect(() => {
    if (coinType) {
      fetchPaymentMethods(coinType);
      // 清空之前的选择
      setPayMethod('');
      setCreemProducts([]);
      setSelectedCreemProduct(null);
    }
  }, [coinType]);

  // 监听支付方式变化
  useEffect(() => {
    if (payMethod === 'creem' && coinType) {
      // 选择 Creem 支付时，获取产品列表
      fetchCreemProducts(coinType);
    } else {
      // 切换到其他支付方式时，清空 Creem 产品列表
      setCreemProducts([]);
      setSelectedCreemProduct(null);
    }
  }, [payMethod, coinType]);

  const handlePresetClick = (val, creemProduct = null) => {
    setAmount(val);
    setCustomAmount('');
    // 如果是 Creem 支付，保存选中的产品
    if (creemProduct) {
      setSelectedCreemProduct(creemProduct);
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setCustomAmount(val);
      setAmount(null);
    }
  };

  const getCurrentAmount = () => amount || parseFloat(customAmount) || 0;
  
  // 根据货币代码获取符号
  const getSymbol = (currencyCode) => {
    if (!currencyCode) return '';
    const currency = supportedCurrencies.find(c => c.currencyCode === currencyCode);
    return currency ? currency.symbol : '';
  };
  const symbol = getSymbol(coinType);
  
  // 根据货币代码获取图标
  const getCurrencyIcon = (code, size = 18) => {
    if (code === 'CNY') return <FaYenSign style={{ fontSize: size }} />;
    if (code === 'USDT') return <SiTether style={{ fontSize: size }} />;
    if (code === 'USD') return <FaDollarSign style={{ fontSize: size }} />;
    return <DollarCircleFilled style={{ fontSize: size }} />;
  };
  
  // 根据货币代码获取余额
  const getBalanceByCoinType = (currencyCode) => {
    if (!currencyCode) return 0;
    if (currencyCode === 'CNY') return balance.cny;
    if (currencyCode === 'USDT' || currencyCode === 'USDT_TRC20') return balance.usdt;
    if (currencyCode === 'USD') return balance.usd;
    return 0;
  };

  /**
   * 轮询订单状态
   */
  const pollOrderStatus = (orderNo) => {
    // 清除之前的轮询
    if (orderPollingIntervalRef.current) {
      clearInterval(orderPollingIntervalRef.current);
      orderPollingIntervalRef.current = null;
    }

    const interval = setInterval(async () => {
      try {
        const result = await payment.getOrderStatus(orderNo);
        if (result.success && result.data) {
          const status = result.data.status;
          
          if (status === 'PAID' || status === 'SUCCESS') {
            // 支付成功
            clearInterval(interval);
            orderPollingIntervalRef.current = null;
            setCurrentOrderNo(null);
            message.success(intl.formatMessage({ id: 'recharge.message.paymentSuccess' }));
            // 刷新余额
            fetchBalance();
            // 可选：跳转到订单页面
            // navigate('/orders');
          } else if (status === 'CANCELLED' || status === 'FAILED' || status === 'EXPIRED') {
            // 支付失败或取消
            clearInterval(interval);
            orderPollingIntervalRef.current = null;
            setCurrentOrderNo(null);
            const statusMsg = status === 'CANCELLED' ? 
              intl.formatMessage({ id: 'recharge.message.orderCancelled' }) : 
              status === 'FAILED' ? 
              intl.formatMessage({ id: 'recharge.message.paymentFailed' }) : 
              intl.formatMessage({ id: 'recharge.message.orderExpired' });
            message.warning(statusMsg);
          }
          // 其他状态（PENDING等）继续轮询
        }
      } catch (error) {
        console.error(intl.formatMessage({ id: 'recharge.message.queryOrderError' }), error);
        // 不中断轮询，继续尝试
      }
    }, 3000); // 每3秒轮询一次

    orderPollingIntervalRef.current = interval;
    
    // 5分钟后停止轮询（避免无限轮询）
    setTimeout(() => {
      if (orderPollingIntervalRef.current === interval) {
        clearInterval(interval);
        orderPollingIntervalRef.current = null;
      }
    }, 300000); // 5分钟后停止
  };

  /**
   * 处理 Creem 支付
   */
  const handleCreemPayment = async (orderNo) => {
    try {
      // 创建 Creem checkout session
      const checkoutResult = await payment.createCreemCheckout({ orderNo });
      
      if (checkoutResult.success && checkoutResult.data) {
        const { checkoutUrl, sessionId } = checkoutResult.data;
        
        if (checkoutUrl) {
          // 打开支付页面
          const paymentWindow = window.open(checkoutUrl, '_blank', 'width=800,height=600');
          
          if (paymentWindow) {
            message.info(intl.formatMessage({ id: 'recharge.message.paymentProcessing' }));
            // 开始轮询订单状态
            pollOrderStatus(orderNo);
          } else {
            message.warning(intl.formatMessage({ id: 'recharge.message.popupBlocked' }));
          }
        } else {
          message.error(intl.formatMessage({ id: 'recharge.message.paymentUrlError' }));
        }
      } else {
        message.error(checkoutResult.message || intl.formatMessage({ id: 'recharge.message.checkoutSessionError' }));
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.paymentError' }), error);
      message.error(intl.formatMessage({ id: 'recharge.message.paymentError' }));
    }
  };

  /**
   * 处理其他支付方式（支付宝、微信等）
   */
  const handleOtherPayment = (payUrl) => {
    if (payUrl) {
      window.open(payUrl, '_blank');
      message.info(intl.formatMessage({ id: 'recharge.message.redirecting' }));
    } else {
      message.error(intl.formatMessage({ id: 'recharge.message.paymentUrlFailed' }));
    }
  };

  const handleSubmit = async () => {
    const finalAmount = getCurrentAmount();
    if (finalAmount <= 0) return message.warning(intl.formatMessage({ id: 'recharge.message.invalidAmount' }));
    if (!payMethod) return message.warning(intl.formatMessage({ id: 'recharge.message.selectPaymentMethod' }));
    
    // Creem 支付需要选择产品
    if (payMethod === 'creem' && !selectedCreemProduct) {
      return message.warning(intl.formatMessage({ id: 'recharge.message.selectAmount' }));
    }
    
    setLoading(true);
    try {
      // 创建订单
      const orderResult = await payment.createRechargeOrder({
        coinType,
        amount: finalAmount,
        paymentMethod: payMethod,
        // 如果是 creem 支付，使用选中的产品ID
        ...(payMethod === 'creem' && selectedCreemProduct && {
          creemProductId: selectedCreemProduct.productId,
        }),
      });

      if (orderResult.success && orderResult.data) {
        const { orderNo, payUrl, status } = orderResult.data;
        setCurrentOrderNo(orderNo);
        
        message.success(intl.formatMessage({ id: 'recharge.message.orderCreated' }));
        
        // 根据支付方式处理
        if (payMethod === 'creem') {
          // Creem 支付需要创建 checkout session
          await handleCreemPayment(orderNo);
        } else {
          // 其他支付方式直接跳转
          handleOtherPayment(payUrl);
          
          // 如果是待支付状态，开始轮询
          if (status === 'PENDING') {
            pollOrderStatus(orderNo);
          }
        }
      } else {
        message.error(orderResult.message || intl.formatMessage({ id: 'recharge.message.orderCreateFailed' }));
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.rechargeError' }), error);
      message.error(intl.formatMessage({ id: 'recharge.message.rechargeError' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout $token={token} $embedded={embedded}>
      {!embedded && <SimpleHeader />}
      
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <HeaderArea $token={token}>
          <div className="left">
            <div className="back-link" onClick={() => embedded ? navigate('/workspace') : window.history.back()}>
              <ArrowLeftOutlined /> {embedded ? (intl.formatMessage({ id: 'recharge.page.backToWorkspace', defaultMessage: '返回工作台' }) || '返回工作台') : intl.formatMessage({ id: 'recharge.page.backLink' })}
            </div>
            <h1>
              <span style={{ marginRight: 12 }}>⚡</span>
              {intl.formatMessage({ id: 'recharge.page.title' })}
            </h1>
          </div>
        </HeaderArea>

        {/* 现代化余额卡片 */}
        <BalanceCard 
          $token={token}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="balance-header">
            <div className="title">
              <WalletOutlined style={{ marginRight: 8 }} />
              {intl.formatMessage({ id: 'recharge.balance.title' })}
            </div>
            <ReloadOutlined 
              className="refresh-btn" 
              onClick={fetchBalance}
              spin={balanceLoading}
              style={{ fontSize: 16 }}
            />
          </div>
          <Spin spinning={balanceLoading}>
            <div className="balance-grid">
              {supportedCurrencies.map((currency) => {
                const isActive = coinType === currency.currencyCode;
                const balanceValue = getBalanceByCoinType(currency.currencyCode);
                // 根据货币代码获取图标
                const getCurrencyIcon = (code) => {
                  if (code === 'CNY') return <FaYenSign style={{ fontSize: 16 }} />;
                  if (code === 'USDT' || code === 'USDT_TRC20') return <SiTether style={{ fontSize: 16 }} />;
                  if (code === 'USD') return <FaDollarSign style={{ fontSize: 16 }} />;
                  return <DollarCircleFilled style={{ fontSize: 16 }} />;
                };
                
                // 根据货币代码确定小数位数
                const getDecimalPlaces = (code) => {
                  if (code === 'USDT' || code === 'USDT_TRC20') return { min: 6, max: 6 };
                  return { min: 2, max: 2 };
                };
                
                const decimals = getDecimalPlaces(currency.currencyCode);
                const isUSDT = currency.currencyCode === 'USDT' || currency.currencyCode === 'USDT_TRC20';
                
                return (
                  <div key={currency.id} className={`balance-item ${isActive ? 'active' : ''}`}>
                    <div className="coin-label">
                      {getCurrencyIcon(currency.currencyCode)}
                      <span>{currency.currencyCode}</span>
                      {isUSDT && (
                        <span style={{ 
                          marginLeft: 6, 
                          fontSize: 10, 
                          padding: '2px 6px', 
                          background: token.colorInfo || '#1890ff', 
                          color: '#fff', 
                          borderRadius: 4,
                          fontWeight: 500
                        }}>
                          TRC20
                        </span>
                      )}
                    </div>
                    <div className="coin-value">
                      {currency.symbol}{balanceValue.toLocaleString('zh-CN', { 
                        minimumFractionDigits: decimals.min, 
                        maximumFractionDigits: decimals.max 
                      })}
                    </div>
                  </div>
                );
              })}
              {/* Token 余额显示 */}
              <div className="balance-item">
                <div className="coin-label">
                  <CreditCardOutlined style={{ fontSize: 16, color: token.colorWarning }} />
                  <span>Token</span>
                </div>
                <div className="coin-value">
                  {balance.token.toLocaleString('zh-CN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 6 
                  })}
                </div>
              </div>
            </div>
          </Spin>
        </BalanceCard>

        <SplitLayout>
          {/* 左侧：配置区 */}
          <MainSection>
            
            {/* 1. 币种选择 */}
            <section>
              <SectionTitle $token={token}>{intl.formatMessage({ id: 'recharge.section.coinType' })}</SectionTitle>
              <Spin spinning={currenciesLoading}>
                <CoinToggle $token={token}>
                  {supportedCurrencies.length > 0 ? (
                    supportedCurrencies.map((currency) => {
                      const isActive = coinType === currency.currencyCode;
                      return (
                        <CoinOption 
                          key={currency.id}
                          $token={token} 
                          $active={isActive} 
                          onClick={() => { 
                            setCoinType(currency.currencyCode);
                            // 切换币种时，如果用户输入了自定义金额，清空自定义金额
                            // 但保持预设金额的选择不变（如果用户选择了预设金额）
                            if (customAmount) {
                              setCustomAmount('');
                            }
                            // 不设置任何默认金额，保持用户已选择的金额
                          }}
                        >
                          {getCurrencyIcon(currency.currencyCode)}
                          {currency.descriptionZh || currency.currencyName} ({currency.currencyCode})
                        </CoinOption>
                      );
                    })
                  ) : (
                    <div style={{ padding: 20, textAlign: 'center', color: token.colorTextSecondary }}>
                      {intl.formatMessage({ id: 'recharge.empty.noCurrency' })}
                    </div>
                  )}
                </CoinToggle>
              </Spin>
            </section>

            {/* 2. 支付方式 */}
            <section>
              <SectionTitle $token={token}>{intl.formatMessage({ id: 'recharge.section.paymentMethod' })}</SectionTitle>
              <Spin spinning={paymentMethodsLoading}>
                {paymentMethods.length > 0 ? (
                  <PaymentList>
                    {paymentMethods.map(method => (
                      <PayItem 
                        key={method.id} 
                        $token={token}
                        $active={payMethod === method.id}
                        onClick={() => setPayMethod(method.id)}
                      >
                        <div className="icon-box">{method.icon}</div>
                        <div className="info">
                          <div className="title">
                            {method.name}
                            {method.method?.badgeText && (
                              <span style={{ 
                                marginLeft: 8, 
                                fontSize: 10, 
                                padding: '2px 6px', 
                                background: token.colorError, 
                                color: '#fff', 
                                borderRadius: 4 
                              }}>
                                {method.method.badgeText}
                              </span>
                            )}
                            {method.method?.isRecommend && (
                              <span style={{ 
                                marginLeft: 4, 
                                fontSize: 10, 
                                color: token.colorWarning 
                              }}>⭐</span>
                            )}
                          </div>
                          <div className="sub">{method.desc}</div>
                          {method.method?.feeRate && (
                            <div className="sub" style={{ fontSize: 11, marginTop: 2 }}>
                              费率: {(method.method.feeRate * 100).toFixed(2)}%
                              {method.method.feeFixed > 0 && ` + $${method.method.feeFixed}`}
                            </div>
                          )}
                        </div>
                        <div className="radio-circle" />
                      </PayItem>
                    ))}
                  </PaymentList>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', color: token.colorTextSecondary }}>
                    {coinType ? intl.formatMessage({ id: 'recharge.empty.noPaymentMethod' }, { currency: coinType }) : intl.formatMessage({ id: 'recharge.empty.pleaseSelectCurrency' })}
                  </div>
                )}
              </Spin>
            </section>

            {/* 3. 金额选择 */}
            <section>
              <SectionTitle $token={token}>{intl.formatMessage({ id: 'recharge.section.amount' })}</SectionTitle>
              {!payMethod ? (
                <div style={{ padding: 20, textAlign: 'center', color: token.colorTextSecondary }}>
                  {intl.formatMessage({ id: 'recharge.empty.pleaseSelectPayment' })}
                </div>
              ) : (
                <Spin spinning={payMethod === 'creem' && creemProductsLoading}>
                  <AmountGrid>
                    {payMethod === 'creem' ? (
                      // Creem 支付：使用产品列表
                      creemProducts.length > 0 ? (
                        creemProducts.map((product, i) => (
                          <AmountCard 
                            key={i} 
                            $token={token} 
                            $active={selectedCreemProduct?.productId === product.productId} 
                            $tag={product.tag || ''}
                            onClick={() => handlePresetClick(product.amount, product)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="val-group">
                              <span className="symbol">{symbol}</span>
                              <span className="num">{product.amount}</span>
                            </div>
                            {product.totalToken > 0 && (
                              <span className="bonus-badge">
                                <GiftFilled style={{ marginRight: 4 }} />
                                {product.totalToken.toLocaleString()} Tokens
                                {product.bonusToken > 0 && ` (+${product.bonusToken.toLocaleString()})`}
                              </span>
                            )}
                            {product.productName && (
                              <div style={{ 
                                fontSize: 11, 
                                color: token.colorTextTertiary, 
                                marginTop: 4,
                                fontWeight: 500
                              }}>
                                {product.productName}
                              </div>
                            )}
                          </AmountCard>
                        ))
                      ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: token.colorTextSecondary }}>
                          {intl.formatMessage({ id: 'recharge.empty.noProducts' })}
                        </div>
                      )
                    ) : (
                      // 其他支付方式：使用预设金额
                      (PRESETS[coinType] && PRESETS[coinType].length > 0) ? (
                        PRESETS[coinType].map((item, i) => (
                          <AmountCard 
                            key={i} 
                            $token={token} 
                            $active={amount === item.val} 
                            $tag={item.tag}
                            onClick={() => handlePresetClick(item.val)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="val-group">
                              <span className="symbol">{symbol}</span>
                              <span className="num">{item.val}</span>
                            </div>
                            {item.bonus && (
                              <span className="bonus-badge">
                                <GiftFilled style={{ marginRight: 4 }} />
                                {item.bonus}
                              </span>
                            )}
                          </AmountCard>
                        ))
                      ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: token.colorTextSecondary }}>
                          {coinType ? intl.formatMessage({ id: 'recharge.empty.noPresets' }, { currency: coinType }) : intl.formatMessage({ id: 'recharge.empty.pleaseSelectCurrency' })}
                        </div>
                      )
                    )}
                  </AmountGrid>
                </Spin>
              )}
              
              {/* Creem 支付时不显示自定义金额输入框 */}
              {payMethod && payMethod !== 'creem' && (
                <CustomInputWrapper $token={token}>
                  <Input 
                    placeholder={intl.formatMessage({ id: 'recharge.placeholder.customAmount' })} 
                    prefix={<span style={{color: token.colorTextTertiary}}>{intl.formatMessage({ id: 'recharge.button.customize' })}</span>} 
                    suffix={<span style={{fontWeight:600}}>{symbol}</span>}
                    value={customAmount}
                    onChange={handleCustomChange}
                  />
                </CustomInputWrapper>
              )}
            </section>

          </MainSection>

          {/* 右侧：收银台 (Sticky) */}
          <SideSection>
            <ReceiptCard $token={token}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: token.colorText }}>{intl.formatMessage({ id: 'recharge.order.title' })}</h2>
              
              <ReceiptRow $token={token}>
                <span>{intl.formatMessage({ id: 'recharge.order.type' })}</span>
                <span>{intl.formatMessage({ id: 'recharge.order.typeValue' })}</span>
              </ReceiptRow>
              <ReceiptRow $token={token}>
                <span>{intl.formatMessage({ id: 'recharge.order.account' })}</span>
                <span>{username || intl.formatMessage({ id: 'recharge.order.accountLoading' })}</span>
              </ReceiptRow>
              <ReceiptRow $token={token}>
                <span>{intl.formatMessage({ id: 'recharge.order.paymentMethod' })}</span>
                <span>{paymentMethods.find(p => p.id === payMethod)?.name || intl.formatMessage({ id: 'recharge.order.paymentMethodPlease' })}</span>
              </ReceiptRow>
              
              <ReceiptRow $token={token} className="total">
                <span>{intl.formatMessage({ id: 'recharge.order.total' })}</span>
                <span className="total-price">
                  <span style={{fontSize: 20, verticalAlign: 'top'}}>{symbol}</span>
                  {getCurrentAmount().toFixed(2)}
                </span>
              </ReceiptRow>

              <PayButton 
                type="primary" 
                block 
                size="large" 
                loading={loading}
                onClick={handleSubmit}
                style={{ height: 56, fontSize: 18 }}
                disabled={getCurrentAmount() <= 0}
                $token={token}
              >
                {intl.formatMessage({ id: 'recharge.button.pay' })} <RightOutlined style={{fontSize:14}}/>
              </PayButton>

              <SecureBadge $token={token}>
                <SafetyCertificateFilled style={{ color: token.colorSuccess }} />
                {intl.formatMessage({ id: 'recharge.security.ssl' })}
              </SecureBadge>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: token.colorTextTertiary, lineHeight: 1.6 }}>
                {intl.formatMessage({ id: 'recharge.security.agreement' })}<br/>
                <a 
                  href="/recharge-agreement"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/recharge-agreement');
                  }}
                  style={{ 
                    color: token.colorPrimary, 
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = token.colorPrimaryHover}
                  onMouseLeave={(e) => e.target.style.color = token.colorPrimary}
                >
                  {intl.formatMessage({ id: 'recharge.security.agreementLink' })}
                </a>
              </div>
            </ReceiptCard>
          </SideSection>

        </SplitLayout>
      </ContentContainer>
    </PageLayout>
  );
};

// ==========================================
// 4. 根组件
// ==========================================

const RechargePage = ({ embedded = false }) => {
  const customTheme = {
    token: {
      colorPrimary: '#0070f3',
      borderRadius: 12,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { borderRadius: 12 },
      Input: { borderRadius: 12 },
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <RechargeContent embedded={embedded} />
    </ConfigProvider>
  );
};

export default RechargePage;