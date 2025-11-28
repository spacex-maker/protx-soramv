import React, { useState, useEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SimpleHeader from "components/headers/simple";
import instance from "api/axios";
import { auth } from "api/auth";
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
  ReloadOutlined
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
  min-height: 100vh;
  width: 100%;
  background-color: ${props => props.$token?.colorBgLayout};
  /* 高级噪点纹理背景 */
  background-image: 
    radial-gradient(at 0% 0%, ${props => props.$token?.colorPrimary}15 0px, transparent 50%),
    radial-gradient(at 100% 100%, ${props => props.$token?.colorSuccess}10 0px, transparent 50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: 80px;
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
  { id: 'usdt', name: '加密货币', icon: <DollarCircleFilled style={{color:'#26a17b'}} />, desc: 'USDT (TRC20/ERC20)' },
  { id: 'bank', name: '银行转账', icon: <BankOutlined style={{color:'#722ed1'}} />, desc: '大额支付首选' },
];

// ==========================================
// 3. 逻辑组件
// ==========================================

const RechargeContent = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  
  // State
  const [coinType, setCoinType] = useState('CNY');
  const [amount, setAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [payMethod, setPayMethod] = useState('alipay');
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balance, setBalance] = useState({ cny: 0.00, usdt: 0.00, usd: 0.00 });
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchBalance();
    fetchUserInfo();
  }, []);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const response = await instance.get('/productx/user/balance');
      if (response.data.success && response.data.data) {
        const { balance: cnyBalance, usdtAmount, usdBalance } = response.data.data;
        setBalance({ 
          cny: cnyBalance || 0, 
          usdt: usdtAmount || 0,
          usd: usdBalance || 0
        });
      }
    } catch (error) {
      console.error('获取余额失败:', error);
      message.error('获取余额失败，请稍后重试');
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
      console.error('获取用户信息失败:', error);
    }
  };

  const handlePresetClick = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setCustomAmount(val);
      setAmount(null);
    }
  };

  const getCurrentAmount = () => amount || parseFloat(customAmount) || 0;
  const getSymbol = () => {
    if (coinType === 'CNY') return '¥';
    if (coinType === 'USD') return '$';
    return '$'; // USDT also uses $
  };
  const symbol = getSymbol();
  
  const getBalanceByCoinType = () => {
    if (coinType === 'CNY') return balance.cny;
    if (coinType === 'USDT') return balance.usdt;
    if (coinType === 'USD') return balance.usd;
    return 0;
  };

  const handleSubmit = async () => {
    const finalAmount = getCurrentAmount();
    if (finalAmount <= 0) return message.warning('请输入有效金额');
    
    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise(r => setTimeout(r, 1500));
      
      // 真实 API 调用
      /*
      const response = await instance.post('/productx/recharge/create', {
        coinType,
        amount: finalAmount,
        paymentMethod: payMethod,
      });

      if (response.data.success) {
        message.success('订单创建成功，即将跳转支付...');
        if (response.data.data?.payUrl) {
          window.open(response.data.data.payUrl, '_blank');
        }
      } else {
        message.error(response.data.message || '创建充值订单失败');
      }
      */
      message.success('订单创建成功，即将跳转收银台...');
    } catch (error) {
      message.error('充值请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <HeaderArea $token={token}>
          <div className="left">
            <div className="back-link" onClick={() => window.history.back()}>
              <ArrowLeftOutlined /> 返回财务中心
            </div>
            <h1>
              <span style={{ marginRight: 12 }}>⚡</span>
              账户充值
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
              账户余额
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
              <div className={`balance-item ${coinType === 'CNY' ? 'active' : ''}`}>
                <div className="coin-label">
                  <FaYenSign style={{ fontSize: 16, color: coinType === 'CNY' ? token.colorPrimary : token.colorTextSecondary }} />
                  <span>CNY</span>
                </div>
                <div className="coin-value">
                  ¥{balance.cny.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`balance-item ${coinType === 'USDT' ? 'active' : ''}`}>
                <div className="coin-label">
                  <SiTether style={{ fontSize: 16, color: coinType === 'USDT' ? token.colorPrimary : token.colorTextSecondary }} />
                  <span>USDT</span>
                </div>
                <div className="coin-value">
                  ${balance.usdt.toLocaleString('zh-CN', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                </div>
              </div>
              <div className={`balance-item ${coinType === 'USD' ? 'active' : ''}`}>
                <div className="coin-label">
                  <FaDollarSign style={{ fontSize: 16, color: coinType === 'USD' ? token.colorPrimary : token.colorTextSecondary }} />
                  <span>USD</span>
                </div>
                <div className="coin-value">
                  ${balance.usd.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <SectionTitle $token={token}>充值币种</SectionTitle>
              <CoinToggle $token={token}>
                <CoinOption 
                  $token={token} 
                  $active={coinType === 'CNY'} 
                  onClick={() => { setCoinType('CNY'); setAmount(100); }}
                >
                  <FaYenSign style={{ fontSize: 18 }} /> 人民币 (CNY)
                </CoinOption>
                <CoinOption 
                  $token={token} 
                  $active={coinType === 'USDT'}
                  onClick={() => { setCoinType('USDT'); setAmount(50); }}
                >
                  <SiTether style={{ fontSize: 18 }} /> USDT (Crypto)
                </CoinOption>
                <CoinOption 
                  $token={token} 
                  $active={coinType === 'USD'}
                  onClick={() => { setCoinType('USD'); setAmount(50); }}
                >
                  <FaDollarSign style={{ fontSize: 18 }} /> 美元 (USD)
                </CoinOption>
              </CoinToggle>
            </section>

            {/* 2. 金额选择 */}
            <section>
              <SectionTitle $token={token}>充值金额</SectionTitle>
              <AmountGrid>
                {PRESETS[coinType].map((item, i) => (
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
                ))}
              </AmountGrid>
              
              <CustomInputWrapper $token={token}>
                <Input 
                  placeholder="输入自定义金额" 
                  prefix={<span style={{color: token.colorTextTertiary}}>自定义金额</span>} 
                  suffix={<span style={{fontWeight:600}}>{symbol}</span>}
                  value={customAmount}
                  onChange={handleCustomChange}
                />
              </CustomInputWrapper>
            </section>

            {/* 3. 支付方式 */}
            <section>
              <SectionTitle $token={token}>支付方式</SectionTitle>
              <PaymentList>
                {PAY_METHODS.map(method => (
                  <PayItem 
                    key={method.id} 
                    $token={token}
                    $active={payMethod === method.id}
                    onClick={() => setPayMethod(method.id)}
                  >
                    <div className="icon-box">{method.icon}</div>
                    <div className="info">
                      <div className="title">{method.name}</div>
                      <div className="sub">{method.desc}</div>
                    </div>
                    <div className="radio-circle" />
                  </PayItem>
                ))}
              </PaymentList>
            </section>

          </MainSection>

          {/* 右侧：收银台 (Sticky) */}
          <SideSection>
            <ReceiptCard $token={token}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: token.colorText }}>订单详情</h2>
              
              <ReceiptRow $token={token}>
                <span>充值类型</span>
                <span>账户余额充值</span>
              </ReceiptRow>
              <ReceiptRow $token={token}>
                <span>充值账号</span>
                <span>{username || '加载中...'}</span>
              </ReceiptRow>
              <ReceiptRow $token={token}>
                <span>支付方式</span>
                <span>{PAY_METHODS.find(p => p.id === payMethod)?.name}</span>
              </ReceiptRow>
              
              <ReceiptRow $token={token} className="total">
                <span>应付总额</span>
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
                立即支付 <RightOutlined style={{fontSize:14}}/>
              </PayButton>

              <SecureBadge $token={token}>
                <SafetyCertificateFilled style={{ color: token.colorSuccess }} />
                SSL 安全加密传输，保障资金安全
              </SecureBadge>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: token.colorTextTertiary, lineHeight: 1.6 }}>
                点击支付即代表您同意<br/>
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
                  《充值服务协议》
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

const RechargePage = () => {
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
      <RechargeContent />
    </ConfigProvider>
  );
};

export default RechargePage;