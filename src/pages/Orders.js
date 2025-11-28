import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SimpleHeader from "components/headers/simple";
import instance from "api/axios";
import { payment } from "api/payment";
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
  message,
  Space,
  Popconfirm
} from "antd";
import { 
  FileTextOutlined,
  ReloadOutlined,
  FilterOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  SearchOutlined
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
    background: radial-gradient(circle, ${props => props.$token.colorPrimary}08 0%, transparent 70%);
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

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
  padding: 0 24px;
  padding-top: 24px;

  && {
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

    .ant-picker {
      border-radius: 999px !important;
      height: 40px !important;
      padding: 0 16px !important;
      border: 1px solid ${props => props.$token?.colorBorder || '#d9d9d9'} !important;
      
      input {
        height: 100% !important;
      }
    }

    .ant-input-affix-wrapper {
      border-radius: 999px !important;
      height: 40px !important;
      padding: 0 11px !important;
      display: flex;
      align-items: center;
      border: 1px solid ${props => props.$token?.colorBorder || '#d9d9d9'} !important;
      background: ${props => props.$token?.colorBgContainer} !important;

      input.ant-input {
        border: none !important;
        border-radius: 0 !important;
        height: 100% !important;
        padding: 0 4px !important;
        margin: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      &:focus, &.ant-input-affix-wrapper-focused {
        box-shadow: 0 0 0 2px ${props => props.$token?.colorPrimaryBg || 'rgba(5, 145, 255, 0.1)'} !important;
        border-color: ${props => props.$token?.colorPrimary || '#1677ff'} !important;
      }
      
      &:hover {
        border-color: ${props => props.$token?.colorPrimary || '#1677ff'} !important;
      }
    }

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
// 2. 常量定义
// ==========================================

const ORDER_STATUS_MAP = {
  'PENDING': { label: '待支付', color: 'orange', icon: <ClockCircleOutlined /> },
  'PAID': { label: '已支付', color: 'green', icon: <CheckCircleOutlined /> },
  'SUCCESS': { label: '已完成', color: 'green', icon: <CheckCircleOutlined /> },
  'CANCELLED': { label: '已取消', color: 'default', icon: <CloseCircleOutlined /> },
  'FAILED': { label: '支付失败', color: 'red', icon: <CloseCircleOutlined /> },
  'EXPIRED': { label: '已过期', color: 'default', icon: <CloseCircleOutlined /> },
};

const PAYMENT_METHOD_MAP = {
  'alipay': { label: '支付宝', color: 'blue' },
  'wechat': { label: '微信支付', color: 'green' },
  'bank': { label: '银行卡', color: 'purple' },
  'usdt': { label: 'USDT', color: 'orange' },
  'creem': { label: 'Creem', color: 'purple' },
};

const COIN_TYPE_MAP = {
  'CNY': 'CNY',
  'USD': 'USD',
  'USDT': 'USDT',
};

// ==========================================
// 3. 主组件
// ==========================================

const OrdersContent = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // 筛选状态
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [coinTypeFilter, setCoinTypeFilter] = useState('all');
  const [orderNoFilter, setOrderNoFilter] = useState('');
  
  // UI 状态
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({ 
    total: 0,
    pending: 0,
    paid: 0,
    totalAmount: 0
  });

  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [tempStatusFilter, setTempStatusFilter] = useState(statusFilter);
  const [tempPaymentMethodFilter, setTempPaymentMethodFilter] = useState(paymentMethodFilter);
  const [tempCoinTypeFilter, setTempCoinTypeFilter] = useState(coinTypeFilter);
  const [tempOrderNoFilter, setTempOrderNoFilter] = useState(orderNoFilter);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize, statusFilter, paymentMethodFilter, coinTypeFilter, orderNoFilter, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentMethodFilter !== 'all') params.paymentMethod = paymentMethodFilter;
      if (coinTypeFilter !== 'all') params.coinType = coinTypeFilter;
      if (orderNoFilter) params.orderNo = orderNoFilter;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.createTimeStart = dateRange[0].format('YYYY-MM-DD HH:mm:ss');
        params.createTimeEnd = dateRange[1].format('YYYY-MM-DD HH:mm:ss');
      }

      const response = await payment.listUserOrders(params);
      
      if (response.success) {
        const { data, totalNum } = response.data || {};
        setOrders(data || []);
        setPagination(prev => ({ ...prev, total: totalNum || 0 }));
      } else {
        message.error(response.message || '获取订单记录失败');
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await payment.getUserOrderStatistics();
      if (response.success) {
        const statsData = response.data || {};
        setStats({
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          paid: statsData.paid || 0,
          totalAmount: parseFloat(statsData.totalAmount || 0),
        });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const handleQuickDate = (days) => {
    const end = dayjs();
    const start = dayjs().subtract(days, 'day');
    setTempDateRange([start, end]);
  };

  const handleApplyFilter = () => {
    setDateRange(tempDateRange);
    setStatusFilter(tempStatusFilter);
    setPaymentMethodFilter(tempPaymentMethodFilter);
    setCoinTypeFilter(tempCoinTypeFilter);
    setOrderNoFilter(tempOrderNoFilter);
    setFilterDrawerVisible(false);
    setPagination({ ...pagination, current: 1 });
  };

  const openDrawer = () => {
    setTempDateRange(dateRange);
    setTempStatusFilter(statusFilter);
    setTempPaymentMethodFilter(paymentMethodFilter);
    setTempCoinTypeFilter(coinTypeFilter);
    setTempOrderNoFilter(orderNoFilter);
    setFilterDrawerVisible(true);
  };

  const handleViewDetail = (order) => {
    // TODO: 跳转到订单详情页或显示详情弹窗
    message.info(`订单号: ${order.orderNo}`);
  };

  const handleCancelOrder = async (order) => {
    try {
      const response = await payment.cancelOrder(order.orderNo);
      if (response.success) {
        message.success('订单已取消');
        fetchOrders();
        fetchStatistics();
      } else {
        message.error(response.message || '取消订单失败');
      }
    } catch (error) {
      message.error('取消订单失败，请稍后重试');
    }
  };

  const columns = [
    {
      title: '订单号',
      key: 'orderNo',
      width: isMobile ? 120 : 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>{record.orderNo}</div>
          {isMobile && (
            <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 4 }}>
              {dayjs(record.createTime).format('MM-DD HH:mm')}
            </div>
          )}
        </div>
      )
    },
    !isMobile && {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: text => {
        if (!text) return '-';
        const date = dayjs(text);
        return <span style={{ color: token.colorTextSecondary }}>{date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : text}</span>;
      }
    },
    {
      title: '金额',
      key: 'amount',
      align: 'right',
      width: isMobile ? 100 : 150,
      render: (_, record) => {
        const coinType = COIN_TYPE_MAP[record.coinType] || record.coinType;
        const symbol = record.coinType === 'CNY' ? '¥' : record.coinType === 'USD' ? '$' : '';
        return (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {symbol}{parseFloat(record.amount || 0).toFixed(2)} {coinType}
            </div>
          </div>
        );
      }
    },
    {
      title: '支付方式',
      key: 'paymentMethod',
      width: isMobile ? 100 : 120,
      render: (_, record) => {
        const method = PAYMENT_METHOD_MAP[record.paymentMethod] || { label: record.paymentMethod, color: 'default' };
        return <Tag color={method.color}>{method.label}</Tag>;
      }
    },
    {
      title: '状态',
      key: 'status',
      width: isMobile ? 100 : 120,
      render: (_, record) => {
        const status = ORDER_STATUS_MAP[record.status] || { 
          label: record.status, 
          color: 'default', 
          icon: <ClockCircleOutlined /> 
        };
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.label}
          </Tag>
        );
      }
    },
    !isMobile && {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 'PENDING' && (
            <Popconfirm
              title="确定要取消这个订单吗？"
              onConfirm={() => handleCancelOrder(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
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
            <h1><FileTextOutlined /> 订单记录</h1>
            <p>查看您的所有充值订单记录和状态</p>
          </div>
          <div className="action-group">
            <Button icon={<ReloadOutlined />} onClick={() => { fetchOrders(); fetchStatistics(); }} loading={loading}>
              刷新
            </Button>
            <Button type="primary" onClick={() => navigate('/recharge')}>
              去充值
            </Button>
          </div>
        </PageHeader>

        <StatsGrid>
          <StatCard $token={token} $variant="primary">
            <div className="header">
              <span className="stat-label" style={{ opacity: 0.9 }}>总订单数</span>
              <div className="icon-box"><FileTextOutlined /></div>
            </div>
            <Statistic 
              value={stats.total} 
              valueStyle={{ fontSize: 30, fontWeight: 700, color: '#fff' }} 
            />
          </StatCard>
          <StatCard $token={token}>
            <div className="header">
              <span className="stat-label" style={{ color: token.colorTextSecondary }}>待支付</span>
              <div className="icon-box" style={{ color: token.colorWarning, background: token.colorWarningBg }}>
                <ClockCircleOutlined />
              </div>
            </div>
            <Statistic 
              value={stats.pending} 
              valueStyle={{ color: token.colorWarning, fontWeight: 600 }} 
            />
          </StatCard>
          <StatCard $token={token}>
            <div className="header">
              <span className="stat-label" style={{ color: token.colorTextSecondary }}>已支付</span>
              <div className="icon-box" style={{ color: token.colorSuccess, background: token.colorSuccessBg }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <Statistic 
              value={stats.paid} 
              valueStyle={{ color: token.colorSuccess, fontWeight: 600 }} 
            />
          </StatCard>
          <StatCard $token={token}>
            <div className="header">
              <span className="stat-label" style={{ color: token.colorTextSecondary }}>总充值金额</span>
              <div className="icon-box" style={{ color: token.colorInfo, background: token.colorInfoBg }}>
                <FileTextOutlined />
              </div>
            </div>
            <Statistic 
              value={stats.totalAmount} 
              precision={2}
              prefix="¥"
              valueStyle={{ color: token.colorInfo, fontWeight: 600 }} 
            />
          </StatCard>
        </StatsGrid>

        <MobileToolbar>
          <MobileFilterButton 
            $token={token} 
            $active={statusFilter !== 'all' || paymentMethodFilter !== 'all' || coinTypeFilter !== 'all' || orderNoFilter || dateRange[0].diff(dayjs(), 'day') < -30}
            onClick={openDrawer}
          >
            <FilterOutlined /> 筛选订单
          </MobileFilterButton>
        </MobileToolbar>

        <GlassCard $token={token}>
          <Toolbar $token={token}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Input
                placeholder="搜索订单号"
                value={orderNoFilter}
                onChange={(e) => setOrderNoFilter(e.target.value)}
                style={{ width: 200 }}
                allowClear
                prefix={<SearchOutlined />}
              />
              <Select 
                value={statusFilter} 
                onChange={setStatusFilter} 
                style={{ width: 140 }} 
                placeholder="订单状态"
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'PENDING', label: '待支付' },
                  { value: 'PAID', label: '已支付' },
                  { value: 'SUCCESS', label: '已完成' },
                  { value: 'CANCELLED', label: '已取消' },
                  { value: 'FAILED', label: '支付失败' },
                  { value: 'EXPIRED', label: '已过期' },
                ]}
              />
              <Select 
                value={paymentMethodFilter} 
                onChange={setPaymentMethodFilter} 
                style={{ width: 140 }} 
                placeholder="支付方式"
                options={[
                  { value: 'all', label: '全部方式' },
                  { value: 'alipay', label: '支付宝' },
                  { value: 'wechat', label: '微信支付' },
                  { value: 'bank', label: '银行卡' },
                  { value: 'usdt', label: 'USDT' },
                  { value: 'creem', label: 'Creem' },
                ]}
              />
              <Select 
                value={coinTypeFilter} 
                onChange={setCoinTypeFilter} 
                style={{ width: 120 }} 
                placeholder="币种"
                options={[
                  { value: 'all', label: '全部币种' },
                  { value: 'CNY', label: 'CNY' },
                  { value: 'USD', label: 'USD' },
                  { value: 'USDT', label: 'USDT' },
                ]}
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
              dataSource={orders}
              rowKey="orderNo"
              loading={loading}
              pagination={{
                ...pagination,
                onChange: (p, s) => setPagination({ ...pagination, current: p, pageSize: s }),
                simple: isMobile,
                showSizeChanger: !isMobile
              }}
              scroll={{ x: true }}
              locale={{ emptyText: <Empty description="暂无订单记录" /> }}
            />
          </TableContainer>
        </GlassCard>

        <Drawer
          title="筛选条件"
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
                  setTempStatusFilter('all');
                  setTempPaymentMethodFilter('all');
                  setTempCoinTypeFilter('all');
                  setTempOrderNoFilter('');
                  setTempDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                }}
                style={{ borderRadius: '999px', height: '48px', fontWeight: 500 }}
              >
                重置
              </Button>
              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={handleApplyFilter}
                style={{ borderRadius: '999px', height: '48px', fontWeight: 500 }}
              >
                确认筛选
              </Button>
            </div>
          }
        >
          <DrawerSection $token={token}>
            <h3>订单状态</h3>
            <ChipGrid>
              {['all', 'PENDING', 'PAID', 'SUCCESS', 'CANCELLED', 'FAILED', 'EXPIRED'].map(status => {
                const labels = { 
                  all: '全部', 
                  PENDING: '待支付', 
                  PAID: '已支付', 
                  SUCCESS: '已完成',
                  CANCELLED: '已取消', 
                  FAILED: '支付失败', 
                  EXPIRED: '已过期' 
                };
                return (
                  <FilterChip 
                    key={status}
                    $token={token} 
                    $active={tempStatusFilter === status}
                    onClick={() => setTempStatusFilter(status)}
                  >
                    {labels[status]}
                    {tempStatusFilter === status && <CheckOutlined style={{ marginLeft: 4, fontSize: 10 }} />}
                  </FilterChip>
                )
              })}
            </ChipGrid>
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>支付方式</h3>
            <ChipGrid>
              {['all', 'alipay', 'wechat', 'bank', 'usdt', 'creem'].map(method => {
                const labels = { all: '全部', alipay: '支付宝', wechat: '微信支付', bank: '银行卡', usdt: 'USDT', creem: 'Creem' };
                return (
                  <FilterChip 
                    key={method}
                    $token={token} 
                    $active={tempPaymentMethodFilter === method}
                    onClick={() => setTempPaymentMethodFilter(method)}
                  >
                    {labels[method]}
                    {tempPaymentMethodFilter === method && <CheckOutlined style={{ marginLeft: 4, fontSize: 10 }} />}
                  </FilterChip>
                )
              })}
            </ChipGrid>
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>币种类型</h3>
            <ChipGrid>
              {['all', 'CNY', 'USD', 'USDT'].map(coin => {
                const labels = { all: '全部币种', CNY: 'CNY', USD: 'USD', USDT: 'USDT' };
                return (
                  <FilterChip 
                    key={coin}
                    $token={token} 
                    $active={tempCoinTypeFilter === coin}
                    onClick={() => setTempCoinTypeFilter(coin)}
                  >
                    {labels[coin]}
                    {tempCoinTypeFilter === coin && <CheckOutlined style={{ marginLeft: 4, fontSize: 10 }} />}
                  </FilterChip>
                )
              })}
            </ChipGrid>
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>订单号搜索</h3>
            <Input
              placeholder="输入订单号"
              value={tempOrderNoFilter}
              onChange={(e) => setTempOrderNoFilter(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>快捷时间</h3>
            <ChipGrid>
              <FilterChip $token={token} onClick={() => handleQuickDate(7)}>近7天</FilterChip>
              <FilterChip $token={token} onClick={() => handleQuickDate(30)}>近30天</FilterChip>
              <FilterChip $token={token} onClick={() => handleQuickDate(90)}>近3个月</FilterChip>
            </ChipGrid>
          </DrawerSection>

          <DrawerSection $token={token}>
            <h3>自定义日期</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <DatePicker 
                 value={tempDateRange[0]} 
                 onChange={d => setTempDateRange([d, tempDateRange[1]])} 
                 style={{ flex: 1 }} 
                 inputReadOnly 
               />
               <span style={{ color: token.colorTextSecondary }}>至</span>
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

const OrdersPage = () => {
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
      <OrdersContent />
    </ConfigProvider>
  );
};

export default OrdersPage;

