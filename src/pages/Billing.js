import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { motion } from "framer-motion";
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
  Radio,
  Space,
  Divider
} from "antd";
import { 
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  BankOutlined,
  CreditCardOutlined,
  FilterOutlined,
  CalendarOutlined,
  CheckOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

// ==========================================
// 1. 样式系统
// ==========================================

// 页面布局 - 修复 Header 遮挡问题
const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.$token.colorBgLayout};
  color: ${props => props.$token.colorText};
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
  
  /* 关键修复：预留 Header 高度 (假设 Header 是 64px) + 额外呼吸空间 */
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

  /* 移动端仅显示标题 */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    
    .action-group {
      width: 100%;
      display: flex;
      gap: 10px;
    }
  }
`;

// 玻璃拟态卡片
const GlassCard = styled(motion.div)`
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  overflow: hidden;
`;

// 统计卡片布局
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* 移动端单列 */
    gap: 12px;
  }
`;

const StatCard = styled(GlassCard)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 120px;
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

// 工具栏区域
const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  /* 移动端隐藏桌面工具栏 */
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.$token.colorText};
  font-weight: 500;
  
  /* 如果有激活的筛选条件 */
  ${props => props.$active && css`
    border-color: ${props.$token.colorPrimary};
    color: ${props.$token.colorPrimary};
    background: ${props.$token.colorPrimaryBg};
  `}
`;

// 表格美化
const TableContainer = styled(GlassCard)`
  .ant-table-wrapper .ant-table {
    background: transparent;
  }
  .ant-table-thead > tr > th {
    background: transparent;
    color: ${props => props.$token.colorTextSecondary};
    font-size: 13px;
    padding: 16px 24px;
  }
  .ant-table-tbody > tr > td {
    padding: 16px 24px;
    font-size: 14px;
  }
`;

const Amount = styled.div`
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-weight: 600;
  color: ${props => props.$income ? props.$token.colorSuccess : props.$token.colorText};
`;

// 抽屉内部样式
const DrawerSection = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 14px;
    color: ${props => props.$token.colorTextSecondary};
    margin-bottom: 12px;
    font-weight: 500;
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
  border-radius: 8px;
  font-size: 13px;
  background: ${props => props.$active ? props.$token.colorPrimaryBg : props.$token.colorFillQuaternary};
  color: ${props => props.$active ? props.$token.colorPrimary : props.$token.colorText};
  border: 1px solid ${props => props.$active ? props.$token.colorPrimary : 'transparent'};
  transition: all 0.2s;
  cursor: pointer;
`;

// ==========================================
// 2. 逻辑组件
// ==========================================

const BillingContent = () => {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [billingRecords, setBillingRecords] = useState([]);
  
  // 筛选状态
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [typeFilter, setTypeFilter] = useState('all');
  
  // UI 状态
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });

  // 临时状态（用于抽屉内的操作，点确定才生效）
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [tempTypeFilter, setTempTypeFilter] = useState(typeFilter);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchBillingRecords();
  }, [pagination.current, pagination.pageSize, typeFilter, dateRange]);

  const fetchBillingRecords = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
    
    const mockData = generateMockData();
    setBillingRecords(mockData.list);
    setPagination(prev => ({ ...prev, total: mockData.total }));
    setStats(mockData.stats);
    setLoading(false);
  };

  const generateMockData = () => {
    // ... (保持原有的 Mock 逻辑不变，为了节省长度省略)
    // 简化的 Mock 数据生成
    const list = [];
    const types = ['recharge', 'consume', 'refund', 'reward'];
    const typeLabels = { recharge: '充值', consume: '消费', refund: '退款', reward: '奖励' };
    
    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      if (typeFilter !== 'all' && type !== typeFilter) continue;
      list.push({
        id: i,
        type,
        typeName: typeLabels[type],
        amount: (Math.random() * 1000).toFixed(2),
        balance: 5000,
        createTime: dayjs().subtract(i, 'day').format('YYYY-MM-DD HH:mm:ss')
      });
    }
    return { 
      list, 
      total: 20, 
      stats: { totalIncome: 5000, totalExpense: 2000, balance: 3000 } 
    };
  };

  // 快捷日期选择处理
  const handleQuickDate = (days) => {
    const end = dayjs();
    const start = dayjs().subtract(days, 'day');
    setTempDateRange([start, end]);
  };

  const handleApplyFilter = () => {
    setDateRange(tempDateRange);
    setTypeFilter(tempTypeFilter);
    setFilterDrawerVisible(false);
    setPagination({ ...pagination, current: 1 }); // 重置页码
  };

  const openDrawer = () => {
    setTempDateRange(dateRange);
    setTempTypeFilter(typeFilter);
    setFilterDrawerVisible(true);
  };

  const columns = [
    {
      title: '类型',
      key: 'type',
      width: isMobile ? 120 : 150,
      render: (_, record) => {
        const config = {
          recharge: { color: 'blue', icon: <BankOutlined /> },
          consume: { color: 'default', icon: <CreditCardOutlined /> },
          refund: { color: 'green', icon: <ReloadOutlined /> },
          reward: { color: 'gold', icon: <WalletOutlined /> },
        }[record.type];
        
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
              <div style={{ fontWeight: 500 }}>{record.typeName}</div>
              {isMobile && <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{dayjs(record.createTime).format('MM-DD HH:mm')}</div>}
            </div>
          </div>
        );
      }
    },
    !isMobile && {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: text => <span style={{ color: token.colorTextSecondary }}>{text}</span>
    },
    {
      title: '金额',
      key: 'amount',
      align: 'right',
      render: (_, record) => {
        const isIncome = record.type !== 'consume';
        return (
          <div style={{ textAlign: 'right' }}>
            <Amount $token={token} $income={isIncome}>
              {isIncome ? '+' : '-'}{record.amount}
            </Amount>
            <div style={{ fontSize: 12, color: token.colorTextQuaternary, marginTop: 2 }}>
              结余 {Number(record.balance).toLocaleString()}
            </div>
          </div>
        );
      }
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
        {/* 页头 */}
        <PageHeader $token={token}>
          <div className="title-group">
            <h1><WalletOutlined /> 财务中心</h1>
            <p>管理您的资金往来与账单明细</p>
          </div>
          <div className="action-group">
            <Button icon={<ReloadOutlined />} onClick={fetchBillingRecords} loading={loading}>刷新</Button>
            <Button type="primary">充值</Button>
          </div>
        </PageHeader>

        {/* 统计卡片 */}
        <StatsGrid>
          <StatCard $token={token} $variant="primary">
            <div className="header">
              <span className="stat-label" style={{ opacity: 0.9 }}>当前余额</span>
              <div className="icon-box"><WalletOutlined /></div>
            </div>
            <Statistic value={stats.balance} precision={2} prefix="¥" valueStyle={{ fontSize: 30, fontWeight: 700 }} />
          </StatCard>
          <StatCard $token={token}>
            <div className="header">
              <span className="stat-label" style={{ color: token.colorTextSecondary }}>本期收入</span>
              <div className="icon-box" style={{ color: token.colorSuccess, background: token.colorSuccessBg }}>
                <ArrowUpOutlined />
              </div>
            </div>
            <Statistic value={stats.totalIncome} precision={2} prefix="¥" valueStyle={{ color: token.colorSuccess, fontWeight: 600 }} />
          </StatCard>
          <StatCard $token={token}>
            <div className="header">
              <span className="stat-label" style={{ color: token.colorTextSecondary }}>本期支出</span>
              <div className="icon-box" style={{ color: token.colorTextSecondary }}>
                <ArrowDownOutlined />
              </div>
            </div>
            <Statistic value={stats.totalExpense} precision={2} prefix="¥" valueStyle={{ color: token.colorText, fontWeight: 600 }} />
          </StatCard>
        </StatsGrid>

        {/* 移动端筛选按钮 (仅 Mobile 可见) */}
        <MobileToolbar>
          <MobileFilterButton 
            $token={token} 
            $active={typeFilter !== 'all' || dateRange[0].diff(dayjs(), 'day') < -30}
            onClick={openDrawer}
          >
            <FilterOutlined /> 筛选交易 & 日期
          </MobileFilterButton>
        </MobileToolbar>

        {/* 桌面端筛选栏 (仅 Desktop 可见) */}
        <Toolbar>
          <div style={{ display: 'flex', gap: 12 }}>
            <Select 
              value={typeFilter} 
              onChange={setTypeFilter} 
              style={{ width: 140 }} 
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'recharge', label: '充值' },
                { value: 'consume', label: '消费' },
                { value: 'refund', label: '退款' },
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

        {/* 交易表格 */}
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
            locale={{ emptyText: <Empty description="暂无账单" /> }}
          />
        </TableContainer>

        {/* 移动端筛选抽屉 (Bottom Sheet) */}
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
              <Button size="large" block onClick={() => {
                setTempTypeFilter('all');
                setTempDateRange([dayjs().subtract(30, 'day'), dayjs()]);
              }}>重置</Button>
              <Button type="primary" size="large" block onClick={handleApplyFilter}>确认筛选</Button>
            </div>
          }
        >
          <DrawerSection $token={token}>
            <h3>交易类型</h3>
            <ChipGrid>
              {['all', 'recharge', 'consume', 'refund', 'reward'].map(type => {
                const labels = { all: '全部', recharge: '充值', consume: '消费', refund: '退款', reward: '奖励' };
                return (
                  <FilterChip 
                    key={type}
                    $token={token} 
                    $active={tempTypeFilter === type}
                    onClick={() => setTempTypeFilter(type)}
                  >
                    {labels[type]}
                    {tempTypeFilter === type && <CheckOutlined style={{ marginLeft: 4, fontSize: 10 }} />}
                  </FilterChip>
                )
              })}
            </ChipGrid>
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
      Drawer: { borderRadiusLG: 20 } // 圆角抽屉
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <BillingContent />
    </ConfigProvider>
  );
};

export default BillingPage;