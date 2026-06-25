import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled, { css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import SimpleHeader from "components/headers/simple";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "api/notifications";
import { 
  Button, 
  message, 
  Empty, 
  ConfigProvider,
  theme,
  Badge,
  Tooltip,
  Popconfirm,
  Segmented,
  Divider,
  Pagination,
  Spin,
  Tag,
} from "antd";
import { 
  BellOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleFilled,
  ExclamationCircleFilled,
  DeleteOutlined,
  CheckOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  ReadOutlined,
  FilterOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  WalletOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// ==========================================
// 1. 样式系统 (Styled System)
// ==========================================

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.$token.colorBgLayout};
  color: ${props => props.$token.colorText};
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  padding-top: 80px;
  overflow-x: hidden;
`;

const ContentContainer = styled(motion.div)`
  max-width: 860px;
  width: 95%;
  margin: 0 auto;
  padding-bottom: 60px;
`;

const StatsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;

  .stat-item {
    flex: 1;
    min-width: 120px;
    padding: 14px 16px;
    border-radius: 14px;
    background: ${(p) => p.$token.colorBgContainer};
    border: 1px solid ${(p) => p.$token.colorBorderSecondary};

    .label {
      font-size: 12px;
      color: ${(p) => p.$token.colorTextTertiary};
      margin-bottom: 4px;
    }

    .value {
      font-size: 22px;
      font-weight: 700;
      color: ${(p) => p.$token.colorText};
      line-height: 1.2;
    }
  }
`;

const ListPanel = styled.div`
  position: relative;
  min-height: 200px;
`;

const PaginationWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 28px;
  padding: 16px 0 8px;
`;

const FilterLabel = styled.span`
  font-size: 12px;
  color: ${(p) => p.$token.colorTextTertiary};
  margin-right: 4px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .title-area {
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      color: ${props => props.$token.colorText};
    }
    p {
      margin: 4px 0 0 0;
      color: ${props => props.$token.colorTextSecondary};
    }
  }
`;

// --- 新设计的工具栏容器 ---
const ToolbarContainer = styled.div`
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 16px;
  padding: 16px; /* 增加内边距，呼吸感 */
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 上下两行的间距 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;

// 第一行：分段控制器 + 操作按钮
const ToolbarTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch; /* 移动端拉伸对齐 */
    gap: 12px;
  }
`;

// 第二行：滚动筛选标签
const ToolbarBottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto; /* 允许横向滚动 */
  padding-bottom: 2px; /* 防止滚动条遮挡边框 */
  
  /* 隐藏滚动条但保留功能 */
  &::-webkit-scrollbar {
    display: none; 
  }
  scrollbar-width: none;
`;

const Chip = styled.div`
  height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap; /* 防止文字换行 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0; /* 防止被压缩 */
  
  ${props => props.$active ? css`
    background: ${props.$token.colorPrimaryText};
    color: #fff;
    box-shadow: 0 2px 4px ${props.$token.colorPrimary}40;
    border: 1px solid transparent;
  ` : css`
    background: ${props.$token.colorFillQuaternary};
    color: ${props.$token.colorTextSecondary};
    border: 1px solid transparent;
    
    &:hover {
      background: ${props.$token.colorFillTertiary};
      color: ${props.$token.colorText};
    }
  `}
`;

// ... (保留之前的 NotificationCard, TimelineGroup 等样式，这里省略以节省篇幅，逻辑不变) ...
const TimelineGroup = styled.div`
  margin-bottom: 32px;
`;

const DateHeader = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$token.colorTextTertiary};
  margin-bottom: 12px;
  padding-left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.$token.colorBorderSecondary};
    margin-left: 8px;
  }
`;

const NotificationCard = styled(motion.div)`
  position: relative;
  background: ${props => props.$read ? props.$token.colorBgContainer : props.$token.colorBgElevated};
  border: 1px solid ${props => props.$read ? props.$token.colorBorderSecondary : props.$token.colorPrimaryBorder};
  padding: 16px 18px;
  margin-bottom: 10px;
  border-radius: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;

  ${props => !props.$read && css`
    background: linear-gradient(
      135deg,
      ${props.$token.colorPrimaryBg}55 0%,
      ${props.$token.colorBgContainer} 100%
    );
    box-shadow: inset 3px 0 0 ${props.$token.colorPrimary};
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.06);
    border-color: ${props => props.$token.colorPrimaryBorder};
    z-index: 1;
    
    .action-buttons { opacity: 1; }
  }
`;

const NotificationContent = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  
  ${props => props.$type === 'success' && css`background: ${props.$token.colorSuccessBg}; color: ${props.$token.colorSuccess};`}
  ${props => props.$type === 'error' && css`background: ${props.$token.colorErrorBg}; color: ${props.$token.colorError};`}
  ${props => props.$type === 'warning' && css`background: ${props.$token.colorWarningBg}; color: ${props.$token.colorWarning};`}
  ${props => props.$type === 'info' && css`background: ${props.$token.colorInfoBg}; color: ${props.$token.colorInfo};`}
`;

const TextContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-right: 12px;

  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }

  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
  }

  p {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: ${props => props.$token.colorTextSecondary};
    line-height: 1.55;
    word-break: break-word;
  }

  .meta {
    font-size: 12px;
    color: ${props => props.$token.colorTextTertiary};
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${props => props.$token.colorBorder};
  background: transparent;
  color: ${props => props.$token.colorTextSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$token.colorFillTertiary};
    color: ${props => props.$token.colorText};
  }
`;

// ==========================================
// 2. 逻辑组件
// ==========================================

const ActionButtons = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    position: static;
    opacity: 1;
    justify-content: flex-end;
    margin-top: 10px;
  }
`;

const PAGE_SIZE_DEFAULT = 15;

const CATEGORY_ICON = {
  community: TeamOutlined,
  task: ThunderboltOutlined,
  billing: WalletOutlined,
  recharge: DollarOutlined,
};

const NotificationsContent = () => {
  const { token } = theme.useToken();
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [displayType, setDisplayType] = useState('all');
  const [bizCategory, setBizCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [totalNum, setTotalNum] = useState(0);
  const [unreadTotal, setUnreadTotal] = useState(0);

  const mapNotification = useCallback((item) => ({
    id: item.id,
    category: item.category || 'system',
    type: item.type || 'info',
    title: item.title,
    description: item.messageText || '',
    read: Boolean(item.isRead),
    createTime: item.createTime,
    actionUrl: item.actionUrl,
  }), []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      if (res?.data?.success) {
        setUnreadTotal(res.data.data?.unreadCount ?? 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchNotifications = useCallback(async (page = currentPage, size = pageSize) => {
    setLoading(true);
    try {
      const res = await getNotifications({
        currentPage: page,
        pageSize: size,
        filterType,
        type: displayType,
        category: bizCategory,
      });
      if (res?.data?.success && res.data.data?.data) {
        setNotifications(res.data.data.data.map(mapNotification));
        setTotalNum(Number(res.data.data.totalNum) || 0);
      } else {
        message.error(res?.data?.message || intl.formatMessage({ id: 'notifications.fetchFailed', defaultMessage: '加载通知失败' }));
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'notifications.fetchFailed', defaultMessage: '加载通知失败' }));
    } finally {
      setLoading(false);
    }
  }, [bizCategory, currentPage, displayType, filterType, intl, mapNotification, pageSize]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    fetchNotifications(currentPage, pageSize);
  }, [fetchNotifications, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, displayType, bizCategory]);

  const handleRefresh = () => {
    fetchUnreadCount();
    fetchNotifications(currentPage, pageSize);
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsRead();
      if (res?.data?.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadTotal(0);
        message.success(intl.formatMessage({ id: 'notifications.markAllReadSuccess', defaultMessage: '全部已读' }));
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'notifications.markAllReadFailed', defaultMessage: '操作失败' }));
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteNotification(id);
      if (res?.data?.success) {
        const deleted = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        setTotalNum(prev => Math.max(prev - 1, 0));
        if (deleted && !deleted.read) {
          setUnreadTotal(prev => Math.max(prev - 1, 0));
        }
        message.success(intl.formatMessage({ id: 'notifications.deleteSuccess', defaultMessage: '已删除' }));
        if (notifications.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else if (notifications.length === 1) {
          fetchNotifications(1, pageSize);
        }
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'notifications.deleteFailed', defaultMessage: '删除失败' }));
    }
  };

  const handleMarkRead = async (id) => {
    const wasUnread = notifications.some(n => n.id === id && !n.read);
    try {
      const res = await markNotificationRead(id);
      if (res?.data?.success) {
        if (wasUnread) {
          setUnreadTotal(count => Math.max(count - 1, 0));
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'notifications.markReadFailed', defaultMessage: '标记已读失败' }));
    }
  };

  const handleOpenNotification = async (item) => {
    if (!item.read) {
      await handleMarkRead(item.id);
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const typeLabels = {
    all: intl.formatMessage({ id: 'notifications.type.all', defaultMessage: '所有类型' }),
    success: intl.formatMessage({ id: 'notifications.type.success', defaultMessage: 'Success' }),
    info: intl.formatMessage({ id: 'notifications.type.info', defaultMessage: 'Info' }),
    warning: intl.formatMessage({ id: 'notifications.type.warning', defaultMessage: 'Warning' }),
    error: intl.formatMessage({ id: 'notifications.type.error', defaultMessage: 'Error' }),
  };

  const categoryLabels = {
    all: intl.formatMessage({ id: 'notifications.category.all', defaultMessage: '全部分类' }),
    community: intl.formatMessage({ id: 'notifications.category.community', defaultMessage: '社区' }),
    task: intl.formatMessage({ id: 'notifications.category.task', defaultMessage: '生成任务' }),
    billing: intl.formatMessage({ id: 'notifications.category.billing', defaultMessage: '账单' }),
    recharge: intl.formatMessage({ id: 'notifications.category.recharge', defaultMessage: '充值' }),
    system: intl.formatMessage({ id: 'notifications.category.system', defaultMessage: '系统' }),
  };

  const categoryColors = {
    community: 'blue',
    task: 'purple',
    billing: 'orange',
    recharge: 'green',
    system: 'default',
  };

  const renderNotificationIcon = (item) => {
    const CategoryIcon = CATEGORY_ICON[item.category];
    if (CategoryIcon) {
      return <CategoryIcon />;
    }
    if (item.type === 'success') return <CheckCircleFilled />;
    if (item.type === 'error') return <CloseCircleFilled />;
    if (item.type === 'warning') return <ExclamationCircleFilled />;
    return <InfoCircleFilled />;
  };

  const filteredList = notifications;

  const groupedNotifications = useMemo(() => {
    const groups = { today: [], yesterday: [], earlier: [] };
    const today = dayjs();
    
    filteredList.forEach(item => {
      const date = dayjs(item.createTime);
      if (date.isSame(today, 'day')) groups.today.push(item);
      else if (date.isSame(today.subtract(1, 'day'), 'day')) groups.yesterday.push(item);
      else groups.earlier.push(item);
    });
    return groups;
  }, [filteredList]);

  const unreadCount = unreadTotal;

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <TimelineGroup>
        <DateHeader $token={token}><ClockCircleOutlined /> {title}</DateHeader>
        <AnimatePresence>
          {items.map(item => (
            <NotificationCard
              key={item.id}
              $read={item.read}
              $token={token}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              layout
              onClick={() => handleOpenNotification(item)}
            >
              <NotificationContent>
                <IconBox $type={item.type} $token={token}>
                  {renderNotificationIcon(item)}
                </IconBox>
                <TextContent $token={token}>
                  <div className="head">
                    <h4>{item.title}</h4>
                    {!item.read && (
                      <Tag color="processing" style={{ margin: 0, fontSize: 11 }}>
                        {intl.formatMessage({ id: 'notifications.unreadBadge', defaultMessage: '未读' })}
                      </Tag>
                    )}
                    {item.category && item.category !== 'system' && (
                      <Tag color={categoryColors[item.category] || 'default'} style={{ margin: 0, fontSize: 11 }}>
                        {categoryLabels[item.category] || item.category}
                      </Tag>
                    )}
                  </div>
                  <p>{item.description}</p>
                  <div className="meta">
                    <span>{dayjs(item.createTime).format('YYYY-MM-DD HH:mm')}</span>
                    <span>·</span>
                    <span>{dayjs(item.createTime).fromNow()}</span>
                    {item.actionUrl && (
                      <>
                        <span>·</span>
                        <span>{intl.formatMessage({ id: 'notifications.clickToView', defaultMessage: '点击查看' })}</span>
                      </>
                    )}
                  </div>
                </TextContent>
              </NotificationContent>
              <ActionButtons className="action-buttons" $token={token}>
                {!item.read && (
                  <Tooltip title={intl.formatMessage({ id: 'notifications.markRead', defaultMessage: '标记已读' })}>
                    <ActionButton $token={token} onClick={(e) => { e.stopPropagation(); handleMarkRead(item.id); }}>
                      <CheckOutlined />
                    </ActionButton>
                  </Tooltip>
                )}
                <Popconfirm
                  title={intl.formatMessage({ id: 'notifications.deleteConfirm', defaultMessage: '确认删除?' })}
                  onConfirm={(e) => { e?.stopPropagation?.(); handleDelete(item.id); }}
                  onCancel={(e) => e?.stopPropagation?.()}
                >
                  <ActionButton $token={token} onClick={(e) => e.stopPropagation()}>
                    <DeleteOutlined />
                  </ActionButton>
                </Popconfirm>
              </ActionButtons>
            </NotificationCard>
          ))}
        </AnimatePresence>
      </TimelineGroup>
    );
  };

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      
      <ContentContainer>
        <PageHeader $token={token}>
          <div className="title-area">
            <h1>
              <BellOutlined /> {intl.formatMessage({ id: 'notifications.title', defaultMessage: '通知中心' })}
              {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 12, backgroundColor: token.colorPrimary }} />}
            </h1>
            <p>{intl.formatMessage({ id: 'notifications.subtitle', defaultMessage: '集中管理您的所有系统消息与提醒' })}</p>
          </div>
          <div className="actions">
             <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
               {intl.formatMessage({ id: 'notifications.refresh', defaultMessage: '刷新' })}
             </Button>
          </div>
        </PageHeader>

        <StatsBar $token={token}>
          <div className="stat-item">
            <div className="label">{intl.formatMessage({ id: 'notifications.statTotal', defaultMessage: '消息总数' })}</div>
            <div className="value">{totalNum}</div>
          </div>
          <div className="stat-item">
            <div className="label">{intl.formatMessage({ id: 'notifications.statUnread', defaultMessage: '未读消息' })}</div>
            <div className="value" style={{ color: unreadCount > 0 ? token.colorPrimary : undefined }}>{unreadCount}</div>
          </div>
          <div className="stat-item">
            <div className="label">{intl.formatMessage({ id: 'notifications.statPage', defaultMessage: '当前页' })}</div>
            <div className="value" style={{ fontSize: 18 }}>
              {totalNum === 0 ? '0 / 0' : `${currentPage} / ${Math.ceil(totalNum / pageSize)}`}
            </div>
          </div>
        </StatsBar>

        <ToolbarContainer $token={token}>
          <ToolbarTopRow>
            <Segmented
              value={filterType}
              onChange={setFilterType}
              options={[
                { label: intl.formatMessage({ id: 'notifications.filter.all', defaultMessage: '全部消息' }), value: 'all' },
                { label: intl.formatMessage({ id: 'notifications.filter.unread', defaultMessage: '仅看未读' }), value: 'unread' },
              ]}
              size="large"
            />
            
            <Button 
              type="text" 
              icon={<ReadOutlined />} 
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              style={{ color: token.colorTextSecondary }}
            >
              {intl.formatMessage({ id: 'notifications.markAllRead', defaultMessage: '全部已读' })}
            </Button>
          </ToolbarTopRow>

          <Divider style={{ margin: 0 }} />

          <FilterRow>
            <FilterLabel $token={token}>
              {intl.formatMessage({ id: 'notifications.categoryFilter', defaultMessage: '分类' })}
            </FilterLabel>
            {['all', 'community', 'task', 'billing', 'recharge', 'system'].map(cat => (
              <Chip
                key={cat}
                $active={bizCategory === cat}
                $token={token}
                onClick={() => setBizCategory(cat)}
              >
                {categoryLabels[cat] || cat}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow>
            <FilterOutlined style={{ color: token.colorTextTertiary, marginRight: 0 }} />
            <FilterLabel $token={token}>
              {intl.formatMessage({ id: 'notifications.typeFilter', defaultMessage: '类型' })}
            </FilterLabel>
            {['all', 'success', 'info', 'warning', 'error'].map(type => (
              <Chip 
                key={type} 
                $active={displayType === type} 
                $token={token}
                onClick={() => setDisplayType(type)}
              >
                {typeLabels[type] || type}
              </Chip>
            ))}
          </FilterRow>
        </ToolbarContainer>

        <ListPanel>
          <Spin spinning={loading}>
            {filteredList.length === 0 && !loading ? (
              <Empty description={intl.formatMessage({ id: 'notifications.empty', defaultMessage: '暂无通知' })} style={{ marginTop: 60 }} />
            ) : (
              <>
                {renderGroup(intl.formatMessage({ id: 'notifications.group.today', defaultMessage: '今天' }), groupedNotifications.today)}
                {renderGroup(intl.formatMessage({ id: 'notifications.group.yesterday', defaultMessage: '昨天' }), groupedNotifications.yesterday)}
                {renderGroup(intl.formatMessage({ id: 'notifications.group.earlier', defaultMessage: '更早' }), groupedNotifications.earlier)}
              </>
            )}
          </Spin>
        </ListPanel>

        {totalNum > 0 && (
          <PaginationWrap>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalNum}
              showSizeChanger
              pageSizeOptions={[10, 15, 20, 50]}
              disabled={loading}
              showTotal={(total) =>
                intl.formatMessage(
                  { id: 'notifications.paginationTotal', defaultMessage: '共 {total} 条' },
                  { total }
                )
              }
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size !== pageSize) {
                  setPageSize(size);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </PaginationWrap>
        )}
      </ContentContainer>
    </PageLayout>
  );
};

const NotificationsPage = () => {
  const customTheme = {
    token: {
      colorPrimary: '#0070f3', // Vercel Blue
      borderRadius: 12,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Segmented: {
        itemSelectedBg: '#0070f3',
        itemSelectedColor: '#fff',
        trackBg: 'rgba(0,0,0,0.04)'
      },
      Button: {
        borderRadius: 10,
      }
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <NotificationsContent />
    </ConfigProvider>
  );
};

export default NotificationsPage;