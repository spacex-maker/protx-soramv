import React, { useState, useEffect, useRef } from "react";
import styled, { css, keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { useLocale } from "contexts/LocaleContext";
import SimpleHeader from "components/headers/simple";
import instance from "api/axios";
import { auth } from "api/auth";
import { payment } from "api/payment";
import {
  Button,
  ConfigProvider,
  theme,
  Input,
  message,
  Spin,
  Badge,
  Tag,
  Modal
} from "antd";
import {
  WalletOutlined,
  ArrowLeftOutlined,
  AlipayCircleFilled,
  WechatFilled,
  BankOutlined,
  DollarCircleFilled,
  SafetyCertificateFilled,
  RightOutlined,
  GiftFilled,
  ReloadOutlined,
  CreditCardOutlined,
  CheckCircleFilled
} from "@ant-design/icons";
import {
  FaYenSign,
  FaDollarSign
} from "react-icons/fa";
import {
  SiTether
} from "react-icons/si";

// ==========================================
// 1. 样式系统 (Design System)
// ==========================================

const PageLayout = styled.div`
  min-height: ${props => props.$embedded ? 'auto' : '100vh'};
  width: 100%;
  background-color: ${props => props.$token?.colorBgLayout};
  color: ${props => props.$token?.colorText};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding-top: ${props => props.$embedded ? '0' : '80px'};
  overflow-x: hidden;

  /* 极简背景纹理 */
  background-image: radial-gradient(${props => props.$token?.colorFillSecondary} 1px, transparent 1px);
  background-size: 40px 40px;
`;

const ContentContainer = styled(motion.div)`
  max-width: 1200px;
  width: 95%;
  margin: 24px auto 60px;
  position: relative;
  z-index: 10;
`;

// ------------------------------------------
// 头部区域
// ------------------------------------------

const HeaderArea = styled.div`
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left-content {
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: ${props => props.$token?.colorPrimary};
      margin-bottom: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 8px 14px;
      border-radius: 10px;
      background: ${props => props.$token?.colorPrimaryBg};
      border: 1px solid ${props => props.$token?.colorPrimaryBorder};

      &:hover {
        background: ${props => props.$token?.colorPrimary}15;
        color: ${props => props.$token?.colorPrimaryActive};
        border-color: ${props => props.$token?.colorPrimary};
        transform: translateX(-2px);
      }
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
      color: ${props => props.$token?.colorText};
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

// ------------------------------------------
// 布局结构
// ------------------------------------------

const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 32px;
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

// ------------------------------------------
// 通用区块标题
// ------------------------------------------

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$token?.colorText};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.$token?.colorBorderSecondary};
    opacity: 0.6;
  }
`;

// ------------------------------------------
// 1. 币种切换器 (Segmented Control 风格)
// ------------------------------------------

const CoinSwitchContainer = styled.div`
  background: ${props => props.$token?.colorFillQuaternary};
  padding: 4px;
  border-radius: 12px;
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const CoinTab = styled.button`
  border: none;
  background: ${props => props.$active ? props.$token?.colorBgContainer : 'transparent'};
  color: ${props => props.$active ? props.$token?.colorText : props.$token?.colorTextSecondary};
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};

  &:hover {
    color: ${props => props.$token?.colorText};
  }

  svg {
    color: ${props => props.$active ? props.$token?.colorPrimary : 'inherit'};
  }
`;

// ------------------------------------------
// 2. 支付方式 (Grid 风格)
// ------------------------------------------

const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const PayMethodCard = styled.div`
  position: relative;
  border: 2px solid ${props => props.$active ? props.$token?.colorPrimary : props.$token?.colorBorderSecondary};
  background: ${props => props.$active ? props.$token?.colorPrimaryBg : props.$token?.colorBgContainer};
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;

  &:hover {
    border-color: ${props => props.$active ? props.$token?.colorPrimary : props.$token?.colorPrimaryBorder};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    flex-shrink: 0;

    img {
      width: 100%; height: 100%; object-fit: cover; border-radius: 10px;
    }
  }

  .content {
    flex: 1;
    min-width: 0;
    .name-row {
      display: flex; align-items: center; gap: 6px;
      font-weight: 600;
      color: ${props => props.$token?.colorText};
      margin-bottom: 2px;
    }
    .desc {
      font-size: 12px;
      color: ${props => props.$token?.colorTextSecondary};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .check-mark {
    position: absolute;
    top: -1px; right: -1px;
    width: 24px; height: 24px;
    background: ${props => props.$token?.colorPrimary};
    border-bottom-left-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    font-size: 12px;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.2s;
  }
`;

// ------------------------------------------
// 3. 金额选择 (Modern Grid)
// ------------------------------------------

const AmountWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AmountOption = styled(motion.div)`
  border-radius: 16px;
  background: ${props => props.$active
    ? `linear-gradient(135deg, ${props.$token?.colorPrimary} 0%, ${props.$token?.colorPrimary}e6 100%)`
    : props.$token?.colorBgContainer};
  border: 1px solid ${props => props.$active ? 'transparent' : props.$token?.colorBorderSecondary};
  padding: 20px 12px;
  text-align: center;
  cursor: pointer;
  position: relative;
  box-shadow: ${props => props.$active
    ? `0 8px 20px -4px ${props.$token?.colorPrimary}66`
    : '0 2px 4px rgba(0,0,0,0.02)'};
  color: ${props => props.$active ? '#fff' : props.$token?.colorText};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.$active ? 'transparent' : props.$token?.colorPrimary};
  }

  .amount-val {
    font-size: 28px;
    font-weight: 800;
    font-family: 'SF Pro Display', sans-serif;
    line-height: 1;
    margin-bottom: 4px;
    
    small { font-size: 16px; font-weight: 600; margin-right: 2px; }
  }

  .bonus-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    background: ${props => props.$active ? 'rgba(255,255,255,0.2)' : props.$token?.colorSuccessBg};
    color: ${props => props.$active ? '#fff' : props.$token?.colorSuccess};
  }

  .bonus-tag.token-breakdown {
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 11px;
    white-space: normal;
    line-height: 1.35;
  }
  
  .corner-badge {
    position: absolute;
    top: 0; right: 0;
    background: #ff4d4f;
    color: #fff;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 0 14px 0 10px;
    font-weight: 700;
  }
`;

const CustomInputArea = styled.div`
  margin-top: 16px;
  .ant-input-affix-wrapper {
    padding: 12px 16px;
    border-radius: 12px;
    border-color: ${props => props.$token?.colorBorderSecondary};
    background: ${props => props.$token?.colorBgContainer};
    &:hover, &:focus-within {
      border-color: ${props => props.$token?.colorPrimary};
    }
  }
  input { font-size: 16px; font-weight: 600; text-align: right; }
`;

// ------------------------------------------
// 4. 右侧收银台 (Floating Panel) + 账户余额
// ------------------------------------------

const BalanceSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.$token?.colorBorderSecondary};

  .balance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .balance-title {
      font-size: 13px;
      font-weight: 600;
      color: ${props => props.$token?.colorTextSecondary};
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .refresh-btn {
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: ${props => props.$token?.colorFillQuaternary};
      color: ${props => props.$token?.colorTextTertiary};
      cursor: pointer;
      transition: all 0.2s;
      font-size: 12px;

      &:hover {
        background: ${props => props.$token?.colorFillTertiary};
        color: ${props => props.$token?.colorPrimary};
        transform: rotate(180deg);
      }
    }
  }

  .balance-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
`;

const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${props => props.$active ? props.$token?.colorPrimaryBg : props.$token?.colorFillQuaternary};
  border: 1px solid ${props => props.$active ? props.$token?.colorPrimaryBorder : 'transparent'};
  margin-bottom: 6px;
  transition: all 0.2s;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.$active ? props.$token?.colorPrimary : props.$token?.colorTextSecondary};
  }

  .value {
    font-size: 15px;
    font-weight: 700;
    font-family: 'SF Mono', 'Consolas', monospace;
    color: ${props => props.$active ? props.$token?.colorPrimary : props.$token?.colorText};
    font-variant-numeric: tabular-nums;
  }

  &.token-item .value {
    color: ${props => props.$token?.colorWarning};
  }

  &.token-item .label {
    color: ${props => props.$token?.colorWarning};
  }
`;

const ReceiptPanel = styled.div`
  background: ${props => props.$token?.colorBgContainer};
  border-radius: 24px;
  padding: 32px 24px;
  border: 1px solid ${props => props.$token?.colorBorderSecondary};
  box-shadow: 
    0 20px 40px -10px rgba(0,0,0,0.08),
    0 0 0 1px rgba(0,0,0,0.02);
  position: sticky;
  top: 100px;

  .header-row {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid ${props => props.$token?.colorBorderSecondary};
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: ${props => props.$token?.colorTextSecondary};
  
  &.main {
    color: ${props => props.$token?.colorText};
    font-weight: 500;
  }

  &.total-row {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 2px dashed ${props => props.$token?.colorBorderSecondary};
    align-items: baseline;
    
    .label { font-size: 16px; font-weight: 600; }
    .val { 
      font-size: 36px; 
      font-weight: 800; 
      color: ${props => props.$token?.colorPrimary};
      line-height: 1;
      
      small { font-size: 20px; font-weight: 600; }
    }
  }
`;

// 动画按钮
const shine = keyframes`
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
`;

const PayButton = styled(Button)`
  height: 56px;
  border-radius: 14px !important;
  font-size: 18px;
  font-weight: 700;
  margin-top: 24px;
  border: none;
  background: linear-gradient(135deg, ${props => props.$token?.colorPrimary}, ${props => props.$token?.colorPrimary}dd) !important;
  box-shadow: 0 8px 24px ${props => props.$token?.colorPrimary}40;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px ${props => props.$token?.colorPrimary}60;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 50%; height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
    transform: skewX(-20deg);
    animation: ${shine} 3s infinite;
  }
  
  &:disabled {
    background: ${props => props.$token?.colorBgContainerDisabled} !important;
    color: ${props => props.$token?.colorTextDisabled} !important;
    box-shadow: none;
    &::after { display: none; }
  }
`;

const TrustBadge = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => props.$token?.colorSuccess};
  background: ${props => props.$token?.colorSuccessBg};
  padding: 10px;
  border-radius: 8px;
  
  svg { font-size: 14px; }
`;

// ==========================================
// 2. 逻辑部分 (保持原样，仅整合样式)
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

const RechargeContent = ({ embedded = false }) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  const { locale } = useLocale();

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
  const [cnyPackages, setCnyPackages] = useState([]);
  const [cnyPackagesLoading, setCnyPackagesLoading] = useState(false);
  const [selectedCnyPackage, setSelectedCnyPackage] = useState(null);
  const [wechatQrUrl, setWechatQrUrl] = useState('');
  const [wechatPayModalVisible, setWechatPayModalVisible] = useState(false);
  const orderPollingIntervalRef = useRef(null);

  // --- 保持所有业务逻辑 Effect 和 Function 不变 ---

  useEffect(() => {
    fetchBalance();
    fetchUserInfo();
    fetchSupportedCurrencies();
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

  const fetchSupportedCurrencies = async () => {
    setCurrenciesLoading(true);
    try {
      const result = await payment.getSupportedCurrencies();
      if (result.success && result.data) {
        setSupportedCurrencies(result.data);
        if (result.data.length > 0 && !coinType) {
          const firstCurrency = result.data[0];
          setCoinType(firstCurrency.currencyCode);
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
          icon: getPaymentIcon(method.paymentMethodCode, method.iconUrl),
        }));
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setPayMethod(methods[0].id);
        } else {
          setPayMethod('');
          setAmount(0);
          setCustomAmount('');
          setCreemProducts([]);
          setSelectedCreemProduct(null);
        }
      } else {
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
      setPaymentMethods([]);
      setPayMethod('');
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  const getPaymentIcon = (code, iconUrl) => {
    if (iconUrl) return <img src={iconUrl} alt={code} />;
    const iconMap = {
      'alipay': <AlipayCircleFilled style={{color:'#1677ff'}} />,
      'wechat': <WechatFilled style={{color:'#52c41a'}} />,
      'wechat_pay_xunhu': <WechatFilled style={{color:'#52c41a'}} />,
      'creem': <CreditCardOutlined style={{color:'#1890ff'}} />,
      'usdt': <DollarCircleFilled style={{color:'#26a17b'}} />,
      'crypto_usdt': <DollarCircleFilled style={{color:'#26a17b'}} />,
      'bank': <BankOutlined style={{color:'#722ed1'}} />,
    };
    return iconMap[code] || <CreditCardOutlined style={{color:'#1890ff'}} />;
  };

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

  useEffect(() => {
    if (coinType) {
      fetchPaymentMethods(coinType);
      setPayMethod('');
      setCreemProducts([]);
      setSelectedCreemProduct(null);
      setSelectedCnyPackage(null);
      if (coinType === 'CNY') {
        fetchCnyRechargePackages();
      } else {
        setCnyPackages([]);
      }
    }
  }, [coinType]);

  const fetchCnyRechargePackages = async () => {
    setCnyPackagesLoading(true);
    try {
      const result = await payment.getCnyRechargePackages();
      if (result.success && Array.isArray(result.data)) {
        setCnyPackages(result.data);
        if (result.data.length > 0) {
          setSelectedCnyPackage(result.data[0]);
          setAmount(Number(result.data[0].price));
          setCustomAmount('');
        }
      } else {
        setCnyPackages([]);
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.fetchBalanceError' }), error);
      setCnyPackages([]);
    } finally {
      setCnyPackagesLoading(false);
    }
  };

  useEffect(() => {
    if (payMethod === 'creem' && coinType) {
      fetchCreemProducts(coinType);
    } else {
      setCreemProducts([]);
      setSelectedCreemProduct(null);
    }
  }, [payMethod, coinType]);

  const handlePresetClick = (val, creemProduct = null, cnyPackage = null) => {
    setAmount(val);
    setCustomAmount('');
    if (creemProduct) setSelectedCreemProduct(creemProduct);
    if (cnyPackage) setSelectedCnyPackage(cnyPackage);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setCustomAmount(val);
      setAmount(null);
    }
  };

  const getCurrentAmount = () => {
    if (coinType === 'CNY' && selectedCnyPackage) return Number(selectedCnyPackage.price);
    return amount || parseFloat(customAmount) || 0;
  };

  const getSymbol = (currencyCode) => {
    if (!currencyCode) return '';
    const currency = supportedCurrencies.find(c => c.currencyCode === currencyCode);
    return currency ? currency.symbol : '';
  };
  const symbol = getSymbol(coinType);

  const getCurrencyIcon = (code, size = 16) => {
    if (code === 'CNY') return <FaYenSign style={{ fontSize: size }} />;
    if (code === 'USDT') return <SiTether style={{ fontSize: size }} />;
    if (code === 'USD') return <FaDollarSign style={{ fontSize: size }} />;
    return <DollarCircleFilled style={{ fontSize: size }} />;
  };

  const getBalanceByCoinType = (currencyCode) => {
    if (!currencyCode) return 0;
    if (currencyCode === 'CNY') return balance.cny;
    if (currencyCode === 'USDT' || currencyCode === 'USDT_TRC20') return balance.usdt;
    if (currencyCode === 'USD') return balance.usd;
    return 0;
  };

  const pollOrderStatus = (orderNo) => {
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
            clearInterval(interval);
            orderPollingIntervalRef.current = null;
            setCurrentOrderNo(null);
            setWechatPayModalVisible(false);
            message.success(intl.formatMessage({ id: 'recharge.message.paymentSuccess' }));
            fetchBalance();
          } else if (status === 'CANCELLED' || status === 'FAILED' || status === 'EXPIRED') {
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
        }
      } catch (error) {
        console.error(intl.formatMessage({ id: 'recharge.message.queryOrderError' }), error);
      }
    }, 3000);
    orderPollingIntervalRef.current = interval;
    setTimeout(() => {
      if (orderPollingIntervalRef.current === interval) {
        clearInterval(interval);
        orderPollingIntervalRef.current = null;
      }
    }, 300000);
  };

  const handleCreemPayment = async (orderNo) => {
    try {
      const checkoutResult = await payment.createCreemCheckout({ orderNo });
      if (checkoutResult.success && checkoutResult.data) {
        const { checkoutUrl } = checkoutResult.data;
        if (checkoutUrl) {
          const paymentWindow = window.open(checkoutUrl, '_blank', 'width=800,height=600');
          if (paymentWindow) {
            message.info(intl.formatMessage({ id: 'recharge.message.paymentProcessing' }));
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

  const handleWechatPayment = async (orderNo) => {
    try {
      const result = await payment.createWechatCheckout({ orderNo });
      if (!result.success || !result.data) {
        message.error(result.message || intl.formatMessage({ id: 'recharge.message.paymentUrlError' }));
        return;
      }
      const { url, urlQrcode } = result.data;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      if (isMobile && url) {
        window.location.href = url;
        message.info(intl.formatMessage({ id: 'recharge.message.paymentProcessing' }));
        pollOrderStatus(orderNo);
      } else if (urlQrcode) {
        setWechatQrUrl(urlQrcode);
        setWechatPayModalVisible(true);
        message.info(intl.formatMessage({ id: 'recharge.message.scanQRToPay' }) || '请使用微信扫描二维码完成支付');
        pollOrderStatus(orderNo);
      } else if (url) {
        window.open(url, '_blank');
        message.info(intl.formatMessage({ id: 'recharge.message.paymentProcessing' }));
        pollOrderStatus(orderNo);
      } else {
        message.error(intl.formatMessage({ id: 'recharge.message.paymentUrlError' }));
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'recharge.message.paymentError' }), error);
      message.error(intl.formatMessage({ id: 'recharge.message.paymentError' }));
    }
  };

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
    if (payMethod === 'creem' && !selectedCreemProduct) {
      return message.warning(intl.formatMessage({ id: 'recharge.message.selectAmount' }));
    }
    if (payMethod === 'wechat_pay_xunhu' && coinType === 'CNY' && !selectedCnyPackage) {
      return message.warning(intl.formatMessage({ id: 'recharge.message.selectAmount' }));
    }

    setLoading(true);
    try {
      const orderParams = {
        coinType,
        amount: finalAmount,
        paymentMethod: payMethod,
      };
      if (payMethod === 'creem' && selectedCreemProduct) {
        orderParams.creemProductId = selectedCreemProduct.productId;
      }
      if (payMethod === 'wechat_pay_xunhu' && selectedCnyPackage) {
        orderParams.skuCode = selectedCnyPackage.skuCode ?? selectedCnyPackage.sku_code;
      }
      const orderResult = await payment.createRechargeOrder(orderParams);

      if (orderResult.success && orderResult.data) {
        const { orderNo, payUrl, status } = orderResult.data;
        setCurrentOrderNo(orderNo);
        message.success(intl.formatMessage({ id: 'recharge.message.orderCreated' }));
        if (payMethod === 'creem') {
          await handleCreemPayment(orderNo);
        } else if (payMethod === 'wechat_pay_xunhu') {
          await handleWechatPayment(orderNo);
        } else {
          handleOtherPayment(payUrl);
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

  // ==========================================
  // 3. 渲染视图
  // ==========================================

  return (
      <PageLayout $token={token} $embedded={embedded}>
        {!embedded && <SimpleHeader />}

        <ContentContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <HeaderArea $token={token}>
            <div className="left-content">
              <button className="back-btn" onClick={() => embedded ? navigate('/workspace') : navigate('/billing')}>
                <ArrowLeftOutlined />
                {embedded
                    ? (intl.formatMessage({ id: 'recharge.page.backToWorkspace', defaultMessage: '返回工作台' }) || '返回工作台')
                    : intl.formatMessage({ id: 'recharge.page.backLink', defaultMessage: '返回财务中心' })}
              </button>
              <h1>
                <span style={{ fontSize: '1.2em' }}>⚡</span>
                {intl.formatMessage({ id: 'recharge.page.title' })}
              </h1>
            </div>
          </HeaderArea>

          <SplitLayout>
            {/* 左侧主要操作区 */}
            <MainSection>

              {/* 1. 币种选择 */}
              <section>
                <SectionTitle $token={token}>{intl.formatMessage({ id: 'recharge.section.coinType' })}</SectionTitle>
                <Spin spinning={currenciesLoading}>
                  <CoinSwitchContainer $token={token}>
                    {supportedCurrencies.length > 0 ? (
                        supportedCurrencies.map(c => (
                            <CoinTab
                                key={c.id}
                                $token={token}
                                $active={coinType === c.currencyCode}
                                onClick={() => {
                                  setCoinType(c.currencyCode);
                                  if (customAmount) setCustomAmount('');
                                }}
                            >
                              {getCurrencyIcon(c.currencyCode)}
                              {(locale && String(locale).toLowerCase().startsWith('zh') && (c.currencyNameZh || c.descriptionZh)) ? (c.currencyNameZh || c.descriptionZh) : (c.currencyName || c.currencyCode)}
                            </CoinTab>
                        ))
                    ) : (
                        <div style={{ padding: '10px 20px', color: token.colorTextSecondary }}>
                          {intl.formatMessage({ id: 'recharge.empty.noCurrency' })}
                        </div>
                    )}
                  </CoinSwitchContainer>
                </Spin>
              </section>

              {/* 2. 支付方式 */}
              <section>
                <SectionTitle $token={token}>{intl.formatMessage({ id: 'recharge.section.paymentMethod' })}</SectionTitle>
                <Spin spinning={paymentMethodsLoading}>
                  {paymentMethods.length > 0 ? (
                      <PaymentGrid>
                        {paymentMethods.map(method => (
                            <PayMethodCard
                                key={method.id}
                                $token={token}
                                $active={payMethod === method.id}
                                onClick={() => setPayMethod(method.id)}
                            >
                              <div className="icon-wrapper">
                                {method.icon}
                              </div>
                              <div className="content">
                                <div className="name-row">
                                  {method.name}
                                  {method.method?.isRecommend && <Badge status="processing" color={token.colorWarning} />}
                                </div>
                                <div className="desc">
                                  {(locale && String(locale).toLowerCase().startsWith('zh'))
                                      ? (method.method?.descriptionZh || method.method?.descriptionEn || method.desc)
                                      : (method.method?.descriptionEn || method.method?.descriptionZh || method.desc)}
                                </div>
                              </div>
                              <div className="check-mark"><CheckCircleFilled /></div>
                            </PayMethodCard>
                        ))}
                      </PaymentGrid>
                  ) : (
                      <div style={{ padding: 24, textAlign: 'center', background: token.colorFillQuaternary, borderRadius: 12 }}>
                        {intl.formatMessage({ id: coinType ? 'recharge.empty.noPaymentMethod' : 'recharge.empty.pleaseSelectCurrency' }, { currency: coinType })}
                      </div>
                  )}
                </Spin>
              </section>

              {/* 3. 金额选择 */}
              <section>
                <SectionTitle $token={token}>{intl.formatMessage({ id: 'recharge.section.amount' })}</SectionTitle>
                {!payMethod ? (
                    <div style={{ padding: 24, textAlign: 'center', background: token.colorFillQuaternary, borderRadius: 12 }}>
                      {intl.formatMessage({ id: 'recharge.empty.pleaseSelectPayment' })}
                    </div>
                ) : (
                    <Spin spinning={(payMethod === 'creem' && creemProductsLoading) || (coinType === 'CNY' && cnyPackagesLoading)}>
                      <AmountWrapper>
                        {payMethod === 'creem' ? (
                            // Creem Products
                            creemProducts.length > 0 ? (
                                creemProducts.map((product, i) => (
                                    <AmountOption
                                        key={i}
                                        $token={token}
                                        $active={selectedCreemProduct?.productId === product.productId}
                                        onClick={() => handlePresetClick(product.amount, product)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                      {product.tag && <div className="corner-badge">{product.tag}</div>}
                                      <div className="amount-val"><small>{symbol}</small>{product.amount}</div>
                                      {product.totalToken > 0 && (
                                          <div className="bonus-tag token-breakdown">
                                            <GiftFilled />
                                            {product.bonusToken > 0 ? (
                                                <span>
                                                  {(product.baseToken || 0).toLocaleString()} {intl.formatMessage({ id: 'recharge.token.base', defaultMessage: '基础' })} + {product.bonusToken.toLocaleString()} {intl.formatMessage({ id: 'recharge.token.gift', defaultMessage: '赠送' })} Token
                                                </span>
                                            ) : (
                                                <span>{(product.baseToken || 0).toLocaleString()} Token</span>
                                            )}
                                          </div>
                                      )}
                                    </AmountOption>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: token.colorTextSecondary }}>
                                  {intl.formatMessage({ id: 'recharge.empty.noProducts' })}
                                </div>
                            )
                        ) : coinType === 'CNY' && cnyPackages.length > 0 ? (
                            // CNY Packages
                            cnyPackages.map((pkg) => {
                              const isZh = locale && String(locale).toLowerCase().startsWith('zh');
                              const name = isZh ? (pkg.name || pkg.nameEn) : (pkg.nameEn || pkg.name);
                              const tag = isZh ? (pkg.tagText || pkg.tagTextEn) : (pkg.tagTextEn || pkg.tagText);
                              const basePoints = pkg.points || 0;
                              const giftPoints = pkg.giftPoints || 0;
                              const totalToken = basePoints + giftPoints;
                              return (
                                  <AmountOption
                                      key={pkg.id}
                                      $token={token}
                                      $active={selectedCnyPackage?.id === pkg.id}
                                      onClick={() => handlePresetClick(Number(pkg.price), null, pkg)}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                  >
                                    {tag && <div className="corner-badge">{tag}</div>}
                                    <div className="amount-val"><small>{symbol}</small>{Number(pkg.price)}</div>
                                    <div style={{fontSize: 13, marginBottom: 4, fontWeight: 500}}>{name}</div>
                                    {totalToken > 0 && (
                                        <div className="bonus-tag token-breakdown">
                                          <GiftFilled />
                                          {giftPoints > 0 ? (
                                              <span>
                                                {basePoints.toLocaleString()} {intl.formatMessage({ id: 'recharge.token.base', defaultMessage: '基础' })} + {giftPoints.toLocaleString()} {intl.formatMessage({ id: 'recharge.token.gift', defaultMessage: '赠送' })} Token
                                              </span>
                                          ) : (
                                              <span>{basePoints.toLocaleString()} Token</span>
                                          )}
                                        </div>
                                    )}
                                  </AmountOption>
                              );
                            })
                        ) : (
                            // Presets
                            (PRESETS[coinType] || []).map((item, i) => (
                                <AmountOption
                                    key={i}
                                    $token={token}
                                    $active={amount === item.val}
                                    onClick={() => handlePresetClick(item.val)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                  {item.tag && <div className="corner-badge">{item.tag}</div>}
                                  <div className="amount-val"><small>{symbol}</small>{item.val}</div>
                                  {item.bonus && <div className="bonus-tag">{item.bonus}</div>}
                                </AmountOption>
                            ))
                        )}
                      </AmountWrapper>

                      {/* 自定义金额输入 */}
                      {payMethod && payMethod !== 'creem' && !(coinType === 'CNY' && cnyPackages.length > 0) && (
                          <CustomInputArea $token={token}>
                            <Input
                                placeholder={intl.formatMessage({ id: 'recharge.placeholder.customAmount' })}
                                prefix={<span style={{color: token.colorTextSecondary}}>自定义</span>}
                                suffix={<span style={{fontWeight:800, color: token.colorText}}>{symbol}</span>}
                                value={customAmount}
                                onChange={handleCustomChange}
                                size="large"
                            />
                          </CustomInputArea>
                      )}
                    </Spin>
                )}
              </section>
            </MainSection>

            {/* 右侧：收银台 + 账户余额 */}
            <SideSection>
              <ReceiptPanel $token={token}>
                {/* 账户余额 */}
                <BalanceSection $token={token}>
                  <div className="balance-header">
                    <div className="balance-title">
                      <WalletOutlined /> {intl.formatMessage({ id: 'recharge.balance.title' })}
                    </div>
                    <div className="refresh-btn" onClick={fetchBalance}>
                      <ReloadOutlined spin={balanceLoading} />
                    </div>
                  </div>
                  <Spin spinning={balanceLoading}>
                    <div className="balance-list">
                      {supportedCurrencies.map((currency) => {
                        const isActive = coinType === currency.currencyCode;
                        const balanceValue = getBalanceByCoinType(currency.currencyCode);
                        const decimals = (currency.currencyCode === 'USDT' || currency.currencyCode === 'USDT_TRC20') ? 6 : 2;
                        const displayName = (locale && String(locale).toLowerCase().startsWith('zh') && (currency.currencyNameZh || currency.descriptionZh)) ? (currency.currencyNameZh || currency.descriptionZh) : (currency.currencyName || currency.currencyCode);
                        return (
                            <BalanceItem key={currency.id} $token={token} $active={isActive}>
                              <div className="label">
                                {getCurrencyIcon(currency.currencyCode)}
                                {displayName}
                              </div>
                              <div className="value">
                                {currency.symbol}{balanceValue.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                              </div>
                            </BalanceItem>
                        );
                      })}
                      <BalanceItem $token={token} className="token-item">
                        <div className="label">
                          <GiftFilled />
                          Tokens
                        </div>
                        <div className="value">
                          {balance.token.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                        </div>
                      </BalanceItem>
                    </div>
                  </Spin>
                </BalanceSection>

                <div className="header-row">
                  {intl.formatMessage({ id: 'recharge.order.title' })}
                </div>

                <DetailRow $token={token}>
                  <span>{intl.formatMessage({ id: 'recharge.order.account' })}</span>
                  <span className="main">{username || '...'}</span>
                </DetailRow>
                <DetailRow $token={token}>
                  <span>{intl.formatMessage({ id: 'recharge.order.paymentMethod' })}</span>
                  <span className="main">{paymentMethods.find(p => p.id === payMethod)?.name || '-'}</span>
                </DetailRow>

                <DetailRow className="total-row" $token={token}>
                  <span className="label">{intl.formatMessage({ id: 'recharge.order.total' })}</span>
                  <span className="val">
                  <small>{symbol}</small>{getCurrentAmount().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                </DetailRow>

                <PayButton
                    type="primary"
                    block
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={getCurrentAmount() <= 0}
                    $token={token}
                >
                  {intl.formatMessage({ id: 'recharge.button.pay' })} <RightOutlined />
                </PayButton>

                <TrustBadge $token={token}>
                  <SafetyCertificateFilled />
                  <span>{intl.formatMessage({ id: 'recharge.security.ssl' })} | 256-bit Secure Payment</span>
                </TrustBadge>

                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: token.colorTextTertiary }}>
                  {intl.formatMessage({ id: 'recharge.security.agreement' })}{' '}
                  <a href="/recharge-agreement" onClick={(e) => { e.preventDefault(); navigate('/recharge-agreement'); }} style={{ color: token.colorPrimary }}>
                    {intl.formatMessage({ id: 'recharge.security.agreementLink' })}
                  </a>
                </div>
              </ReceiptPanel>
            </SideSection>
          </SplitLayout>
        </ContentContainer>

        <Modal
          title={intl.formatMessage({ id: 'recharge.wechat.qrTitle', defaultMessage: '微信扫码支付' })}
          open={wechatPayModalVisible}
          onCancel={() => setWechatPayModalVisible(false)}
          maskClosable={false}
          footer={
            <div style={{ textAlign: 'center' }}>
              <Button onClick={() => setWechatPayModalVisible(false)}>
                {intl.formatMessage({ id: 'recharge.wechat.close', defaultMessage: '关闭' })}
              </Button>
            </div>
          }
          width={360}
          centered
        >
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            {wechatQrUrl && (
              <img src={wechatQrUrl} alt="微信支付二维码" style={{ width: 240, height: 240, display: 'block', margin: '0 auto 16px' }} />
            )}
            <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
              {intl.formatMessage({ id: 'recharge.wechat.qrTip', defaultMessage: '请使用微信扫描二维码完成支付' })}
            </span>
          </div>
        </Modal>
      </PageLayout>
  );
};

const RechargePage = ({ embedded = false }) => {
  const customTheme = {
    token: {
      colorPrimary: '#0070f3', // 极客蓝
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