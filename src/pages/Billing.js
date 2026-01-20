import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import SimpleHeader from "components/headers/simple";
import instance from "api/axios";
import { 
  Button, 
  Table, 
  Tag, 
  ConfigProvider,
  Empty,
  DatePicker,
  Select,
  theme,
  Statistic,
  Drawer,
  Input,
  message
} from "antd";
import { 
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  BankOutlined,
  CreditCardOutlined,
  FilterOutlined,
  CheckOutlined,
  DollarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

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
    background: radial-gradient(circle, ${props => props.$token.colorSuccess}08 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }
`;

const ContentContainer = styled(motion.div)`
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  padding-bottom: 40px;
  position: relative;
  z-index: 10;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  .title-group {
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: ${props => props.$token.colorText};
      display: flex;
      align-items: center;
      gap: 12px;
    }
    p {
      color: ${props => props.$token.colorTextSecondary};
      margin: 4px 0 0 0;
      font-size: 14px;
    }
  }

  .action-group {
    display: flex;
    gap: 16px;
    align-items: center;
    
    .ant-btn {
      border-radius: 999px !important;
      height: 40px;
      padding: 0 24px;
      font-weight: 500;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    .action-group { width: 100%; gap: 12px; .ant-btn { flex: 1; } }
  }
`;

const GlassCard = styled(motion.div)`
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  overflow: hidden;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled(GlassCard)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
  transition: transform 0.2s;
  
  ${props => props.$variant === 'primary' && css`
    background: linear-gradient(135deg, ${props.$token.colorPrimary} 0%, ${props.$token.colorPrimaryActive} 100%);
    border: none;
    .ant-statistic-title, .ant-statistic-content, .anticon, .stat-label {
      color: #fff !important;
    }
    .icon-box {
      background: rgba(255,255,255,0.2) !important;
      color: #fff !important;
    }
  `}

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$token.colorFillQuaternary};
    color: ${props => props.$token.colorTextSecondary};
  }
`;

// --- 修复后的 Toolbar：解决双重边框问题 ---
const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;

  && {
    /* 1. Select 样式 */
    .ant-select {
      height: 40px !important;
      .ant-select-selector {
        border-radius: 999px !important;
        height: 40px !important;
        padding: 0 16px !important;
        align-items: center;
        
        .ant-select-selection-item, 
        .ant-select-selection-placeholder {
          line-height: 38px !important;
          display: flex;
          align-items: center;
        }
      }
    }

    /* 2. DatePicker 样式 */
    .ant-picker {
      border-radius: 999px !important;
      height: 40px !important;
      padding: 0 16px !important;
      border: 1px solid ${props => props.$token?.colorBorder || '#d9d9d9'} !important;
      
      input {
        height: 100% !important;
      }
    }

    /* 3. Input 样式修复 (关键部分) */
    
    /* 情况 A: 带 allowClear 或图标的 Input (ant-input-affix-wrapper) */
    .ant-input-affix-wrapper {
      border-radius: 999px !important;
      height: 40px !important;
      padding: 0 11px !important;
      display: flex;
      align-items: center;
      border: 1px solid ${props => props.$token?.colorBorder || '#d9d9d9'} !important;
      background: ${props => props.$token?.colorBgContainer} !important;

      /* 内部的 input 移除边框，填满容器 */
      input.ant-input {
        border: none !important;
        border-radius: 0 !important;
        height: 100% !important;
        padding: 0 4px !important;
        margin: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      /* 聚焦状态 */
      &:focus, &.ant-input-affix-wrapper-focused {
        box-shadow: 0 0 0 2px ${props => props.$token?.colorPrimaryBg || 'rgba(5, 145, 255, 0.1)'} !important;
        border-color: ${props => props.$token?.colorPrimary || '#1677ff'} !important;
      }
      
      &:hover {
        border-color: ${props => props.$token?.colorPrimary || '#1677ff'} !important;
      }
    }

    /* 情况 B: 普通无包装 Input */
    .ant-input:not(.ant-input-affix-wrapper > input) {
      border-radius: 999px !important;
      height: 40px !important;
      padding: 4px 16px !important;
      border: 1px solid ${props => props.$token?.colorBorder || '#d9d9d9'} !important;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileToolbar = styled.div`
  display: none;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileFilterButton = styled.button`
  flex: 1;
  height: 44px;
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorder};
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.$token.colorText};
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: ${props => props.$token.colorPrimary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  ${props => props.$active && css`
    border-color: ${props.$token.colorPrimary};
    color: ${props.$token.colorPrimary};
    background: ${props.$token.colorPrimaryBg};
    box-shadow: 0 2px 8px ${props.$token.colorPrimary}20;
  `}
`;

const TableContainer = styled(GlassCard)`
  .ant-table-wrapper .ant-table { background: transparent; }
  .ant-table-thead > tr > th {
    background: transparent;
    color: ${props => props.$token.colorTextSecondary};
    font-size: 13px;
    padding: 16px 24px;
  }
  .ant-table-tbody > tr > td { padding: 16px 24px; font-size: 14px; }
`;

const Amount = styled.div`
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-weight: 600;
  color: ${props => props.$income ? props.$token.colorSuccess : props.$token.colorText};
  
  .amount-sign {
    font-size: 0.75em;
    vertical-align: baseline;
  }
`;

const HoverAmount = styled.div`
  position: relative;
  cursor: pointer;
  display: inline-block;
  
  .display-value {
    transition: opacity 0.2s;
    position: relative;
    z-index: 1;
  }
  
  .full-value {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    white-space: nowrap;
    background: ${props => props.$token.colorBgElevated};
    padding: 4px 8px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 2;
    border: 1px solid ${props => props.$token.colorBorder};
    min-width: 100%;
  }
  
  &:hover {
    .display-value {
      opacity: 0;
    }
    .full-value {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const DrawerSection = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 14px;
    color: ${props => props.$token.colorTextSecondary};
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  && {
    .ant-input, .ant-picker {
      border-radius: 12px !important;
      height: 40px !important;
    }
    .ant-picker {
      width: 100% !important;
    }
  }
`;

const ChipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const FilterChip = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  background: ${props => props.$active ? props.$token.colorPrimaryBg : props.$token.colorFillQuaternary};
  color: ${props => props.$active ? props.$token.colorPrimary : props.$token.colorText};
  border: 1px solid ${props => props.$active ? props.$token.colorPrimary : 'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

// ==========================================
// 2. 逻辑组件
// ==========================================

const getChangeTypeMap = (intl) => ({
  'FROZEN': { label: intl.formatMessage({ id: 'billing.type.frozen' }), color: 'orange', icon: <BankOutlined /> },
  'AI_MODEL_FEE': { label: intl.formatMessage({ id: 'billing.type.aiModelFee' }), color: 'blue', icon: <CreditCardOutlined /> },
  'RECHARGE': { label: intl.formatMessage({ id: 'billing.type.recharge' }), color: 'green', icon: <ArrowUpOutlined /> },
  'REFUND': { label: intl.formatMessage({ id: 'billing.type.refund' }), color: 'cyan', icon: <ReloadOutlined /> },
  'REWARD': { label: intl.formatMessage({ id: 'billing.type.reward' }), color: 'gold', icon: <WalletOutlined /> },
});

const COIN_TYPE_MAP = {
  'USDT_ERC20': 'USDT',
  'CNY': 'CNY',
  'USD': 'USD',
  'TOKEN': 'TOKEN',
};

const BillingContent = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [billingRecords, setBillingRecords] = useState([]);
  
  // 筛选状态
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [changeTypeFilter, setChangeTypeFilter] = useState('all');
  const [coinTypeFilter, setCoinTypeFilter] = useState('all');
  const [remarkFilter, setRemarkFilter] = useState('');
  
  // UI 状态
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({ 
    totalIncome: 0, 
    totalExpense: 0, 
    balance: 0, 
    usdtAmount: 0, 
    usdtFrozenAmount: 0, 
    usdBalance: 0,
    tokenBalance: 0
  });

  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [tempChangeTypeFilter, setTempChangeTypeFilter] = useState(changeTypeFilter);
  const [tempCoinTypeFilter, setTempCoinTypeFilter] = useState(coinTypeFilter);
  const [tempRemarkFilter, setTempRemarkFilter] = useState(remarkFilter);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchBillingRecords();
  }, []);

  useEffect(() => {
    fetchBillingRecords();
  }, [pagination.current, pagination.pageSize, changeTypeFilter, coinTypeFilter, remarkFilter, dateRange]);

  const fetchBalance = async () => {
    try {
      const response = await instance.get('/productx/user/balance');
      if (response.data.success && response.data.data) {
        const { balance, usdtAmount, usdtFrozenAmount, usdBalance, tokenBalance } = response.data.data;
        setStats(prev => ({
          ...prev,
          balance: balance || 0,
          usdtAmount: usdtAmount || 0,
          usdtFrozenAmount: usdtFrozenAmount || 0,
          usdBalance: usdBalance || 0,
          tokenBalance: tokenBalance || 0
        }));
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: 'billing.message.fetchBalanceError' }), error);
    }
  };

  const fetchBillingRecords = async () => {
    setLoading(true);
    try {
      const params = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        orderBy: 'createTime',
        isDesc: true,
      };

      if (changeTypeFilter !== 'all') params.changeType = changeTypeFilter;
      if (coinTypeFilter !== 'all') params.coinType = coinTypeFilter;
      if (remarkFilter) params.remark = remarkFilter;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.createTimeStart = dateRange[0].format('YYYY-MM-DD HH:mm:ss');
        params.createTimeEnd = dateRange[1].format('YYYY-MM-DD HH:mm:ss');
      }

      const response = await instance.get('/productx/user-account-change-log/list', { params });
      
      if (response.data.success) {
        const { data, totalNum } = response.data.data;
        setBillingRecords(data || []);
        setPagination(prev => ({ ...prev, total: totalNum || 0 }));
        
        const income = (data || []).reduce((sum, record) => {
          return sum + (record.amount > 0 ? parseFloat(record.amount) : 0);
        }, 0);
        const expense = (data || []).reduce((sum, record) => {
          return sum + (record.amount < 0 ? Math.abs(parseFloat(record.amount)) : 0);
        }, 0);
        
        setStats(prev => ({ ...prev, totalIncome: income, totalExpense: expense }));
      } else {
        message.error(response.data.message || intl.formatMessage({ id: 'billing.message.fetchRecordsError' }));
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'billing.message.tryAgain' }));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDate = (days) => {
    const end = dayjs();
    const start = dayjs().subtract(days, 'day');
    setTempDateRange([start, end]);
  };

  const handleApplyFilter = () => {
    setDateRange(tempDateRange);
    setChangeTypeFilter(tempChangeTypeFilter);
    setCoinTypeFilter(tempCoinTypeFilter);
    setRemarkFilter(tempRemarkFilter);
    setFilterDrawerVisible(false);
    setPagination({ ...pagination, current: 1 });
  };

  const openDrawer = () => {
    setTempDateRange(dateRange);
    setTempChangeTypeFilter(changeTypeFilter);
    setTempCoinTypeFilter(coinTypeFilter);
    setTempRemarkFilter(remarkFilter);
    setFilterDrawerVisible(true);
  };

  const CHANGE_TYPE_MAP = getChangeTypeMap(intl);

  const columns = [
    {
      title: intl.formatMessage({ id: 'billing.table.type' }),
      key: 'changeType',
      width: isMobile ? 140 : 180,
      render: (_, record) => {
        const config = CHANGE_TYPE_MAP[record.changeType] || { 
          label: record.changeType, 
          color: 'default', 
          icon: <DollarOutlined /> 
        };
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 36, height: 36, borderRadius: 10, 
              background: token.colorFillQuaternary, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: token[config.color === 'default' ? 'colorText' : `color${config.color.charAt(0).toUpperCase() + config.color.slice(1)}`]
            }}>
              {config.icon}
            </div>
            <div>
              <div style={{ fontWeight: 500 }}>{config.label}</div>
              {isMobile && (
                <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                  {dayjs(record.createTime).format('MM-DD HH:mm')}
                </div>
              )}
              {!isMobile && record.remark && (
                <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}>
                  {record.remark}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    !isMobile && {
      title: intl.formatMessage({ id: 'billing.table.coinType' }),
      key: 'coinType',
      width: 100,
      render: (_, record) => (
        <Tag color="blue">{COIN_TYPE_MAP[record.coinType] || record.coinType}</Tag>
      )
    },
    !isMobile && {
      title: intl.formatMessage({ id: 'billing.table.time' }),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: text => <span style={{ color: token.colorTextSecondary }}>{text}</span>
    },
    {
      title: intl.formatMessage({ id: 'billing.table.amount' }),
      key: 'amount',
      align: 'right',
      width: isMobile ? 120 : 180,
      render: (_, record) => {
        const amount = parseFloat(record.amount);
        const isIncome = amount > 0;
        const coinType = COIN_TYPE_MAP[record.coinType] || record.coinType;
        
        return (
          <div style={{ textAlign: 'right' }}>
            <Amount $token={token} $income={isIncome}>
              {isIncome ? <span className="amount-sign">+</span> : <span className="amount-sign">-</span>}
              {Math.abs(amount).toFixed(6)} {coinType}
            </Amount>
            <div style={{ fontSize: 12, color: token.colorTextQuaternary, marginTop: 2 }}>
              {intl.formatMessage({ id: 'billing.table.balance' })} {parseFloat(record.balanceAfterChange).toLocaleString()} {coinType}
            </div>
          </div>
        );
      }
    },
    isMobile && {
      title: intl.formatMessage({ id: 'billing.table.remark' }),
      key: 'remark',
      render: (_, record) => (
        <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
          {record.remark || '-'}
        </div>
      )
    }
  ].filter(Boolean);

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader $token={token}>
          <div className="title-group">
            <h1><WalletOutlined /> {intl.formatMessage({ id: 'billing.page.title' })}</h1>
            <p>{intl.formatMessage({ id: 'billing.page.description' })}</p>
          </div>
          <div className="action-group">
            <Button icon={<ReloadOutlined />} onClick={() => {
              fetchBalance();
              fetchBillingRecords();
            }} loading={loading}>{intl.formatMessage({ id: 'billing.button.refresh' })}</Button>
            <Button type="primary" onClick={() => navigate('/recharge')}>{intl.formatMessage({ id: 'billing.button.recharge' })}</Button>
          </div>
        </PageHeader>

        <StatsGrid>
          <StatCard $token={token} $variant="primary">
            <div className="header">
              <span className="stat-label" style={{ opacity: 0.9 }}>{intl.formatMessage({ id: 'billing.balance.cny' })}</span>
              <div className="icon-box"><WalletOutlined /></div>
            </div>
            <Statistic 
              value={stats.balance} 
              precision={2} 
              suffix="CNY"
              valueStyle={{ fontSize: 30, fontWeight: 700 }} 
            />
          </StatCard>
          <StatCard $token={token}>
            <div className="header">
              <span className="stat-label" style={{ color: token.colorTextSecondary }}>{intl.formatMessage({ id: 'billing.balance.usdt' })}</span>
              <div className="icon-box" style={{ color: token.colorSuccess, background: token.colorSuccessBg }}>
                <DollarOutlined />
              </div>
            </div>
            <div>
              <HoverAmount $token={token}>
                <div className="display-value">
                  <Statistic 
                    value={stats.usdtAmount} 
                    precision={2} 
                    suffix="USDT"
                    valueStyle={{ color: token.colorSuccess, fontWeight: 600 }} 
                  />
                </div>
                <div className="full-value">
                  {stats.usdtAmount.toFixed(6)} USDT
                </div>
              </HoverAmount>
              {stats.usdtFrozenAmount > 0 && (
                <HoverAmount $token={token} style={{ marginTop: 8 }}>
                  <div className="display-value" style={{ fontSize: 12, color: token.colorTextSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <BankOutlined style={{ fontSize: 12 }} />
                    <span>{intl.formatMessage({ id: 'billing.balance.frozen' })}: {stats.usdtFrozenAmount.toFixed(2)} USDT</span>
                  </div>
                  <div className="full-value" style={{ fontSize: 12 }}>
                    <BankOutlined style={{ fontSize: 12, marginRight: 4 }} />
                    {intl.formatMessage({ id: 'billing.balance.frozen' })}: {stats.usdtFrozenAmount.toFixed(6)} USDT
                  </div>
                </HoverAmount>
              )}
            </div>
          </StatCard>
          <StatCard $token={token}>
            <div className="header">
              <span className="stat-label" style={{ color: token.colorTextSecondary }}>{intl.formatMessage({ id: 'billing.balance.usd' })}</span>
              <div className="icon-box" style={{ color: token.colorInfo, background: token.colorInfoBg }}>
                <DollarOutlined />
              </div>
            </div>
            <Statistic 
              value={stats.usdBalance} 
              precision={2} 
              suffix="USD"
              valueStyle={{ color: token.colorInfo, fontWeight: 600 }} 
            />
          </StatCard>
          <StatCard $token={token}>
            <div className="header">
              <span className="stat-label" style={{ color: token.colorTextSecondary }}>{intl.formatMessage({ id: 'billing.balance.token' })}</span>
              <div className="icon-box" style={{ color: token.colorWarning, background: token.colorWarningBg }}>
                <CreditCardOutlined />
              </div>
            </div>
            <Statistic 
              value={stats.tokenBalance} 
              precision={2} 
              suffix="Token"
              valueStyle={{ color: token.colorWarning, fontWeight: 600 }} 
            />
          </StatCard>
        </StatsGrid>

        <MobileToolbar>
          <MobileFilterButton 
            $token={token} 
            $active={changeTypeFilter !== 'all' || coinTypeFilter !== 'all' || remarkFilter || dateRange[0].diff(dayjs(), 'day') < -30}
            onClick={openDrawer}
          >
            <FilterOutlined /> {intl.formatMessage({ id: 'billing.filter.button' })}
          </MobileFilterButton>
        </MobileToolbar>

        <Toolbar $token={token}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Select 
              value={changeTypeFilter} 
              onChange={setChangeTypeFilter} 
              style={{ width: 140 }} 
              placeholder={intl.formatMessage({ id: 'billing.placeholder.changeType' })}
              options={[
                { value: 'all', label: intl.formatMessage({ id: 'billing.type.all' }) },
                { value: 'FROZEN', label: intl.formatMessage({ id: 'billing.type.frozen' }) },
                { value: 'AI_MODEL_FEE', label: intl.formatMessage({ id: 'billing.type.aiModelFee' }) },
                { value: 'RECHARGE', label: intl.formatMessage({ id: 'billing.type.recharge' }) },
                { value: 'REFUND', label: intl.formatMessage({ id: 'billing.type.refund' }) },
                { value: 'REWARD', label: intl.formatMessage({ id: 'billing.type.reward' }) },
              ]}
            />
            <Select 
              value={coinTypeFilter} 
              onChange={setCoinTypeFilter} 
              style={{ width: 120 }} 
              placeholder={intl.formatMessage({ id: 'billing.placeholder.coinType' })}
              options={[
                { value: 'all', label: intl.formatMessage({ id: 'billing.coin.all' }) },
                { value: 'USDT_ERC20', label: intl.formatMessage({ id: 'billing.coin.usdt' }) },
                { value: 'CNY', label: intl.formatMessage({ id: 'billing.coin.cny' }) },
                { value: 'TOKEN', label: intl.formatMessage({ id: 'billing.coin.token' }) },
              ]}
            />
            <Input
              placeholder={intl.formatMessage({ id: 'billing.placeholder.remark' })}
              value={remarkFilter}
              onChange={(e) => setRemarkFilter(e.target.value)}
              style={{ width: 150 }}
              allowClear
            />
            <DatePicker.RangePicker 
              value={dateRange} 
              onChange={setDateRange} 
              style={{ width: 260 }}
              allowClear={false}
            />
          </div>
        </Toolbar>

        <TableContainer $token={token}>
          <Table
            columns={columns}
            dataSource={billingRecords}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: (p, s) => setPagination({ ...pagination, current: p, pageSize: s }),
              simple: isMobile,
              showSizeChanger: !isMobile
            }}
            scroll={{ x: true }}
            locale={{ emptyText: <Empty description={intl.formatMessage({ id: 'billing.table.empty' })} /> }}
          />
        </TableContainer>

        <Drawer
          title={intl.formatMessage({ id: 'billing.filter.title' })}
          placement="bottom"
          open={filterDrawerVisible}
          onClose={() => setFilterDrawerVisible(false)}
          height="auto"
          styles={{ 
            body: { padding: '24px' },
            wrapper: { borderTopLeftRadius: 20, borderTopRightRadius: 20 }
          }}
          footer={
            <div style={{ display: 'flex', gap: 12 }}>
              <Button 
                size="large" 
                block 
                onClick={() => {
                  setTempChangeTypeFilter('all');
                  setTempCoinTypeFilter('all');
                  setTempRemarkFilter('');
                  setTempDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                }}
                style={{ borderRadius: '999px', height: '48px', fontWeight: 500 }}
              >
                {intl.formatMessage({ id: 'billing.button.reset' })}
              </Button>
              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={handleApplyFilter}
                style={{ borderRadius: '999px', height: '48px', fontWeight: 500 }}
              >
                {intl.formatMessage({ id: 'billing.button.apply' })}
              </Button>
            </div>
          }
        >
          <DrawerSection $token={token}>
            <h3>{intl.formatMessage({ id: 'billing.filter.changeType' })}</h3>
            <ChipGrid>
              {['all', 'FROZEN', 'AI_MODEL_FEE', 'RECHARGE', 'REFUND', 'REWARD'].map(type => {
                const getLabel = (t) => {
                  const labelMap = {
                    all: intl.formatMessage({ id: 'billing.type.all' }),
                    FROZEN: intl.formatMessage({ id: 'billing.type.frozen' }),
                    AI_MODEL_FEE: intl.formatMessage({ id: 'billing.type.aiModelFee' }),
                    RECHARGE: intl.formatMessage({ id: 'billing.type.recharge' }),
                    REFUND: intl.formatMessage({ id: 'billing.type.refund' }),
                    REWARD: intl.formatMessage({ id: 'billing.type.reward' })
                  };
                  return labelMap[t];
                };
                return (
                  <FilterChip 
                    key={type}
                    $token={token} 
                    $active={tempChangeTypeFilter === type}
                    onClick={() => setTempChangeTypeFilter(type)}
                  >
                    {getLabel(type)}
                    {tempChangeTypeFilter === type && <CheckOutlined style={{ marginLeft: 4, fontSize: 10 }} />}
                  </FilterChip>
                )
              })}
            </ChipGrid>
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>{intl.formatMessage({ id: 'billing.filter.coinType' })}</h3>
            <ChipGrid>
              {['all', 'USDT_ERC20', 'CNY', 'TOKEN'].map(coin => {
                const getLabel = (c) => {
                  const labelMap = {
                    all: intl.formatMessage({ id: 'billing.coin.all' }),
                    USDT_ERC20: intl.formatMessage({ id: 'billing.coin.usdt' }),
                    CNY: intl.formatMessage({ id: 'billing.coin.cny' }),
                    TOKEN: intl.formatMessage({ id: 'billing.coin.token' })
                  };
                  return labelMap[c];
                };
                return (
                  <FilterChip 
                    key={coin}
                    $token={token} 
                    $active={tempCoinTypeFilter === coin}
                    onClick={() => setTempCoinTypeFilter(coin)}
                  >
                    {getLabel(coin)}
                    {tempCoinTypeFilter === coin && <CheckOutlined style={{ marginLeft: 4, fontSize: 10 }} />}
                  </FilterChip>
                )
              })}
            </ChipGrid>
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>{intl.formatMessage({ id: 'billing.filter.remarkSearch' })}</h3>
            <Input
              placeholder={intl.formatMessage({ id: 'billing.filter.remarkPlaceholder' })}
              value={tempRemarkFilter}
              onChange={(e) => setTempRemarkFilter(e.target.value)}
              allowClear
            />
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>{intl.formatMessage({ id: 'billing.filter.dateQuick' })}</h3>
            <ChipGrid>
              <FilterChip $token={token} onClick={() => handleQuickDate(7)}>{intl.formatMessage({ id: 'billing.filter.days7' })}</FilterChip>
              <FilterChip $token={token} onClick={() => handleQuickDate(30)}>{intl.formatMessage({ id: 'billing.filter.days30' })}</FilterChip>
              <FilterChip $token={token} onClick={() => handleQuickDate(90)}>{intl.formatMessage({ id: 'billing.filter.days90' })}</FilterChip>
            </ChipGrid>
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>{intl.formatMessage({ id: 'billing.filter.dateCustom' })}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <DatePicker 
                 value={tempDateRange[0]} 
                 onChange={d => setTempDateRange([d, tempDateRange[1]])} 
                 style={{ flex: 1 }} 
                 inputReadOnly 
               />
               <span style={{ color: token.colorTextSecondary }}>{intl.formatMessage({ id: 'billing.filter.dateTo' })}</span>
               <DatePicker 
                 value={tempDateRange[1]} 
                 onChange={d => setTempDateRange([tempDateRange[0], d])} 
                 style={{ flex: 1 }} 
                 inputReadOnly 
               />
            </div>
          </DrawerSection>
        </Drawer>

      </ContentContainer>
    </PageLayout>
  );
};

const BillingPage = () => {
  const customTheme = {
    token: {
      colorPrimary: '#0070f3',
      borderRadius: 10,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { borderRadius: 8 },
      Table: { borderRadiusLG: 16 },
      Drawer: { borderRadiusLG: 20 }
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <BillingContent />
    </ConfigProvider>
  );
};

export default BillingPage;