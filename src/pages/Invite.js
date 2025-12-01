import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleHeader from "components/headers/simple";
import instance from "api/axios"; // 假设您的 axios 实例
import { 
  Button, 
  message, 
  ConfigProvider,
  theme,
  Tooltip,
  Avatar,
  Tag,
  Modal,
  Skeleton,
  Pagination,
  Select,
  InputNumber,
  Empty,
  Statistic
} from "antd";
import { 
  CopyOutlined,
  UserAddOutlined,
  TrophyFilled,
  ThunderboltFilled,
  WechatFilled,
  QqCircleFilled,
  WeiboCircleFilled,
  QrcodeOutlined,
  WalletOutlined,
  FilterOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  ArrowRightOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

// ==========================================
// 1. 样式系统 (保留并增强)
// ==========================================

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${props => props.$token.colorBgLayout};
  background-image: 
    radial-gradient(at 0% 0%, ${props => props.$token.colorPrimary}15 0px, transparent 50%),
    radial-gradient(at 100% 0%, #8b5cf615 0px, transparent 50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: 80px;
  overflow-x: hidden;
`;

const ContentContainer = styled(motion.div)`
  max-width: 1100px;
  width: 95%;
  margin: 40px auto 60px;
  position: relative;
  z-index: 10;
`;

const MainCard = styled(motion.div)`
  background: ${props => props.$token.colorBgContainer};
  border-radius: 32px;
  box-shadow: 
    0 20px 40px -10px rgba(0,0,0,0.08),
    0 0 0 1px ${props => props.$token.colorBorderSecondary};
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (min-width: 992px) {
    flex-direction: row;
    min-height: 700px; /* 增加高度以容纳列表 */
  }
`;

// 左侧面板 (保持不变，视觉重心)
const LeftPanel = styled.div`
  background: linear-gradient(135deg, ${props => props.$token.colorPrimary} 0%, #7c3aed 100%);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  position: relative;
  flex: 3; /* 调整比例 3:4 */
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  @media (max-width: 992px) {
    padding: 40px;
    flex: none;
  }
`;

const RewardSteps = styled.div`
  margin-top: 40px;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  .step-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 16px;
    border: 1px solid rgba(255,255,255,0.3);
  }

  .step-content {
    h4 { margin: 0; color: white; font-size: 16px; font-weight: 600; }
    span { font-size: 13px; opacity: 0.8; }
  }
`;

// 右侧面板 (功能增强)
const RightPanel = styled.div`
  padding: 48px;
  flex: 4;
  background: ${props => props.$token.colorBgContainer};
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const TicketBox = styled.div`
  background: ${props => props.$token.colorFillQuaternary};
  border: 2px dashed ${props => props.$token.colorBorder};
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  transition: all 0.3s;

  &:hover {
    border-color: ${props => props.$token.colorPrimary};
    background: ${props => props.$token.colorPrimaryBg};
  }

  .code {
    font-family: 'SF Mono', 'Roboto Mono', monospace;
    font-size: 42px;
    font-weight: 800;
    color: ${props => props.$token.colorText};
    letter-spacing: 4px;
    margin: 12px 0 20px;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
`;

// 增强的统计条
const StatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background: ${props => props.$token.colorBgLayout};
  border-radius: 16px;
  margin-bottom: 32px;
  border: 1px solid ${props => props.$token.colorBorderSecondary};

  .stat-item {
    text-align: center;
    flex: 1;
    position: relative;
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 10%;
      height: 80%;
      width: 1px;
      background: ${props => props.$token.colorBorderSecondary};
    }

    .val { font-size: 22px; font-weight: 700; color: ${props => props.$token.colorText}; }
    .lbl { font-size: 12px; color: ${props => props.$token.colorTextSecondary}; margin-top: 4px; }
  }
`;

// 列表头部 (含筛选)
const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: ${props => props.$token.colorText};
  }
`;

const UserRow = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${props => props.$token.colorBorderSecondary};

  &:last-child { border-bottom: none; }

  .avatar-col { margin-right: 16px; }
  .info-col { 
    flex: 1; 
    .name { font-weight: 600; font-size: 14px; color: ${props => props.$token.colorText}; }
    .date { font-size: 12px; color: ${props => props.$token.colorTextTertiary}; margin-top: 2px; }
  }
  .reward-col { 
    text-align: right; 
    .amount { font-weight: 700; font-size: 15px; color: ${props => props.$token.colorSuccess}; }
    .status { font-size: 12px; margin-top: 2px; }
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

// ==========================================
// 2. 逻辑组件 (功能增强)
// ==========================================

const InviteSystem = () => {
  const { token } = theme.useToken();
  const intl = useIntl();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [inviteHistory, setInviteHistory] = useState([]);
  
  // 分页与筛选
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, pending

  // 模态框状态
  const [qrVisible, setQrVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // 模拟初始化数据加载
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 模拟切换分页或筛选
  useEffect(() => {
    fetchHistory();
  }, [page, statusFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    // 模拟 API: 获取邀请码、统计数据
    await new Promise(r => setTimeout(r, 800));
    setInviteData({
      code: 'FLASH-888',
      link: 'https://app.productx.com/r/FLASH-888',
      stats: {
        totalInvites: 128,
        totalReward: 2560.00,
        availableReward: 320.00 // 可提现金额
      }
    });
    setLoading(false);
  };

  const fetchHistory = async () => {
    // 模拟 API: 获取历史记录
    // const res = await instance.get('/invite/history', { params: { page, status: statusFilter }});
    
    // Mock Data Logic
    const mockList = Array.from({ length: pageSize }).map((_, i) => {
      const isPending = Math.random() > 0.7;
      return {
        id: (page - 1) * pageSize + i,
        username: `User_${Math.random().toString(36).substr(2, 6)}`,
        avatar: null, // 如果有头像 URL 填这里
        date: dayjs().subtract(i * page, 'day').format('YYYY-MM-DD HH:mm'),
        status: isPending ? 'pending' : 'active',
        reward: isPending ? 0 : 20.00
      };
    });
    
    // 简单模拟筛选过滤 (在真实 API 中由后端处理)
    setInviteHistory(mockList);
    setTotal(statusFilter === 'all' ? 50 : 20);
  };

  // 操作处理
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success(intl.formatMessage({ id: 'invite.copy.success' }));
  };

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) return message.warning(intl.formatMessage({ id: 'invite.withdraw.enterAmount' }));
    if (withdrawAmount > inviteData.stats.availableReward) return message.error(intl.formatMessage({ id: 'invite.withdraw.insufficientBalance' }));

    setWithdrawLoading(true);
    // 模拟提现 API
    await new Promise(r => setTimeout(r, 1000));
    
    message.success(intl.formatMessage({ id: 'invite.withdraw.success' }, { amount: withdrawAmount }));
    setInviteData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        availableReward: prev.stats.availableReward - withdrawAmount
      }
    }));
    setWithdrawLoading(false);
    setWithdrawVisible(false);
    setWithdrawAmount(0);
  };

  // 渲染加载骨架
  if (loading || !inviteData) {
    return (
      <PageLayout $token={token}>
        <SimpleHeader />
        <ContentContainer>
          <MainCard $token={token} style={{ padding: 40 }}>
            <Skeleton active avatar paragraph={{ rows: 8 }} />
          </MainCard>
        </ContentContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <MainCard $token={token}>
          
          {/* ================= 左侧面板 (保持视觉冲击力) ================= */}
          <LeftPanel $token={token}>
            <div>
              <Tag color="gold" style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: 16 }}>
                <TrophyFilled style={{ marginRight: 6 }} /> <FormattedMessage id="invite.partnerProgram" />
              </Tag>
              <h1><FormattedMessage id="invite.title.line1" /><br/><FormattedMessage id="invite.title.line2" /></h1>
              <p style={{ marginTop: 16 }}>
                <FormattedMessage id="invite.reward.inviter" values={{ amount: <b>¥20</b> }} /><br/>
                <FormattedMessage id="invite.reward.invitee" values={{ amount: <b>¥10</b> }} />
              </p>
            </div>

            <RewardSteps>
              <StepItem>
                <div className="step-icon"><UserAddOutlined /></div>
                <div className="step-content">
                  <h4><FormattedMessage id="invite.step1.title" /></h4>
                  <span><FormattedMessage id="invite.step1.desc" /></span>
                </div>
              </StepItem>
              <StepItem>
                <div className="step-icon"><ThunderboltFilled /></div>
                <div className="step-content">
                  <h4><FormattedMessage id="invite.step2.title" /></h4>
                  <span><FormattedMessage id="invite.step2.desc" /></span>
                </div>
              </StepItem>
              <StepItem>
                <div className="step-icon"><WalletOutlined /></div>
                <div className="step-content">
                  <h4><FormattedMessage id="invite.step3.title" /></h4>
                  <span><FormattedMessage id="invite.step3.desc" /></span>
                </div>
              </StepItem>
            </RewardSteps>
          </LeftPanel>

          {/* ================= 右侧面板 (功能交互区) ================= */}
          <RightPanel $token={token}>
            
            {/* 1. 邀请码区域 */}
            <TicketBox $token={token}>
              <div style={{ fontSize: 12, color: token.colorTextTertiary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                <FormattedMessage id="invite.exclusiveCode" />
              </div>
              <div className="code">{inviteData.code}</div>
              <div className="actions">
                <Button type="primary" size="large" icon={<CopyOutlined />} onClick={() => handleCopy(inviteData.code)}>
                  <FormattedMessage id="invite.copyCode" />
                </Button>
                <Tooltip title={intl.formatMessage({ id: 'invite.viewQrcode' })}>
                  <Button size="large" icon={<QrcodeOutlined />} onClick={() => setQrVisible(true)} />
                </Tooltip>
              </div>
            </TicketBox>

            {/* 2. 增强的数据统计 (带提现功能) */}
            <StatsBar $token={token}>
              <div className="stat-item">
                <div className="val">{inviteData.stats.totalInvites}</div>
                <div className="lbl"><FormattedMessage id="invite.stats.totalInvites" /></div>
              </div>
              <div className="stat-item">
                <div className="val" style={{ color: token.colorSuccess }}>
                  ¥{inviteData.stats.availableReward.toFixed(2)}
                </div>
                <div className="lbl"><FormattedMessage id="invite.stats.availableReward" /></div>
                <Button 
                  type="link" 
                  size="small" 
                  style={{ padding: 0, height: 'auto', marginTop: 4 }}
                  onClick={() => setWithdrawVisible(true)}
                >
                  <FormattedMessage id="invite.withdrawNow" />
                </Button>
              </div>
              <div className="stat-item">
                <div className="val" style={{ color: token.colorTextTertiary }}>¥{inviteData.stats.totalReward}</div>
                <div className="lbl"><FormattedMessage id="invite.stats.totalReward" /></div>
              </div>
            </StatsBar>

            {/* 3. 邀请记录 (带筛选和分页) */}
            <ListHeader $token={token}>
              <h3><FormattedMessage id="invite.history.title" /></h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <Select 
                  defaultValue="all" 
                  size="small"
                  style={{ width: 100 }}
                  options={[
                    { value: 'all', label: intl.formatMessage({ id: 'invite.filter.all' }) },
                    { value: 'active', label: intl.formatMessage({ id: 'invite.filter.active' }) },
                    { value: 'pending', label: intl.formatMessage({ id: 'invite.filter.pending' }) },
                  ]}
                  onChange={setStatusFilter}
                />
              </div>
            </ListHeader>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {inviteHistory.length > 0 ? (
                inviteHistory.map((item, index) => (
                  <UserRow 
                    key={item.id} 
                    $token={token}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="avatar-col">
                      <Avatar style={{ backgroundColor: item.status === 'active' ? token.colorPrimaryBg : token.colorFillSecondary, color: item.status === 'active' ? token.colorPrimary : token.colorTextSecondary }}>
                        {item.username.charAt(0)}
                      </Avatar>
                    </div>
                    <div className="info-col">
                      <div className="name">{item.username}</div>
                      <div className="date">{item.date}</div>
                    </div>
                    <div className="reward-col">
                      {item.status === 'active' ? (
                        <>
                          <div className="amount">+¥{item.reward.toFixed(2)}</div>
                          <div className="status" style={{ color: token.colorSuccess }}>
                            <CheckCircleFilled style={{ fontSize: 10, marginRight: 4 }} /><FormattedMessage id="invite.status.credited" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="amount" style={{ color: token.colorTextDisabled }}>--</div>
                          <div className="status" style={{ color: token.colorWarning }}>
                            <ClockCircleFilled style={{ fontSize: 10, marginRight: 4 }} /><FormattedMessage id="invite.status.pending" />
                          </div>
                        </>
                      )}
                    </div>
                  </UserRow>
                ))
              ) : (
                <Empty description={intl.formatMessage({ id: 'invite.history.empty' })} style={{ margin: '40px 0' }} />
              )}
            </div>

            <PaginationWrapper>
              <Pagination 
                simple 
                current={page} 
                pageSize={pageSize} 
                total={total}
                onChange={setPage}
                size="small"
              />
            </PaginationWrapper>

          </RightPanel>
        </MainCard>
      </ContentContainer>

      {/* ================= 弹窗区域 ================= */}
      
      {/* 1. 提现弹窗 */}
      <Modal
        title={intl.formatMessage({ id: 'invite.withdraw.title' })}
        open={withdrawVisible}
        onCancel={() => setWithdrawVisible(false)}
        footer={[
          <Button key="back" onClick={() => setWithdrawVisible(false)}><FormattedMessage id="invite.withdraw.cancel" /></Button>,
          <Button key="submit" type="primary" loading={withdrawLoading} onClick={handleWithdraw}>
            <FormattedMessage id="invite.withdraw.confirm" />
          </Button>,
        ]}
        centered
        width={400}
      >
        <div style={{ paddingTop: 16 }}>
          <div style={{ marginBottom: 16, background: token.colorFillQuaternary, padding: 16, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: token.colorTextSecondary }}><FormattedMessage id="invite.stats.availableReward" /></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: token.colorPrimary }}>
              ¥{inviteData.stats.availableReward.toFixed(2)}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}><FormattedMessage id="invite.withdraw.amount" /></div>
          <InputNumber
            style={{ width: '100%' }}
            size="large"
            prefix="¥"
            min={1}
            max={inviteData.stats.availableReward}
            value={withdrawAmount}
            onChange={setWithdrawAmount}
          />
          <div style={{ marginTop: 12, fontSize: 12, color: token.colorTextTertiary }}>
            <FormattedMessage id="invite.withdraw.note" />
          </div>
        </div>
      </Modal>

      {/* 2. 二维码弹窗 */}
      <Modal
        open={qrVisible}
        onCancel={() => setQrVisible(false)}
        footer={null}
        centered
        width={320}
      >
        <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
          <h3 style={{ marginBottom: 24 }}><FormattedMessage id="invite.qrcode.title" /></h3>
          <div style={{ 
            background: '#fff', padding: 16, borderRadius: 16, display: 'inline-block',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: `1px solid ${token.colorBorderSecondary}`
          }}>
            <QrcodeOutlined style={{ fontSize: 160, color: '#000' }} />
          </div>
          <Button type="text" icon={<CopyOutlined />} style={{ marginTop: 16 }} onClick={() => handleCopy(inviteData.link)}>
            <FormattedMessage id="invite.copyLink" />
          </Button>
        </div>
      </Modal>

    </PageLayout>
  );
};

// ==========================================
// 3. 根组件
// ==========================================

const InvitePage = () => {
  const customTheme = {
    token: {
      colorPrimary: '#7c3aed',
      borderRadius: 12,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { borderRadius: 10 },
      Modal: { borderRadiusLG: 20 },
      Pagination: { itemActiveBg: '#f3e8ff' } // 适配紫色的分页背景
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <InviteSystem />
    </ConfigProvider>
  );
};

export default InvitePage;