import React, { useState, useEffect, useMemo } from "react";
import styled, { css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import SimpleHeader from "components/headers/simple";
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
  Divider
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
  FilterOutlined
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
  max-width: 800px;
  width: 95%;
  margin: 0 auto;
  padding-bottom: 60px;
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
  border: 1px solid ${props => props.$read ? 'transparent' : props.$token.colorPrimaryBorder};
  border-bottom: 1px solid ${props => props.$token.colorBorderSecondary};
  padding: 16px 20px; /* 稍微调小一点 padding */
  margin-bottom: 8px;
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;

  ${props => !props.$read && css`
    background: ${props.$token.colorPrimaryBg}40;
    &::before {
      content: '';
      position: absolute;
      top: 20px;
      right: 20px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${props.$token.colorPrimary};
    }
  `}

  &:hover {
    background: ${props => props.$token.colorBgContainer};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
    z-index: 1;
    border-color: transparent;
    
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
  padding-right: 24px;

  h4 {
    margin: 0 0 4px 0;
    font-size: 15px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
  }

  p {
    margin: 0 0 6px 0;
    font-size: 13px;
    color: ${props => props.$token.colorTextSecondary};
    line-height: 1.5;
  }

  .meta {
    font-size: 12px;
    color: ${props => props.$token.colorTextTertiary};
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.2s ease;
  background: ${props => props.$token.colorBgContainer};
  padding-left: 12px;
  
  @media (max-width: 768px) {
    position: static;
    opacity: 1;
    transform: none;
    justify-content: flex-end;
    margin-top: 8px;
    background: transparent;
    padding-left: 0;
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

const NotificationsContent = () => {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread'
  const [category, setCategory] = useState('all'); // 'success' | 'error' ...

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); 
    setNotifications(generateMockData());
    setLoading(false);
  };

  const generateMockData = () => {
    const list = [];
    const types = ['success', 'error', 'info', 'warning'];
    const now = dayjs();
    
    for (let i = 0; i < 12; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let date;
      if (i < 4) date = now.subtract(i, 'hour');
      else if (i < 8) date = now.subtract(1, 'day').subtract(i, 'hour');
      else date = now.subtract(i, 'day');

      list.push({
        id: i,
        type,
        title: `系统消息通知标题 ${i + 1}`,
        description: `这是一条测试通知的详细内容，可能包含一些重要的系统更新或操作反馈。`,
        read: i > 3,
        createTime: date.toISOString(),
      });
    }
    return list;
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    message.success("全部已读");
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    message.success("已删除");
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredList = useMemo(() => {
    return notifications.filter(n => {
      const matchRead = filterType === 'all' ? true : !n.read;
      const matchCategory = category === 'all' ? true : n.type === category;
      return matchRead && matchCategory;
    });
  }, [notifications, filterType, category]);

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

  const unreadCount = notifications.filter(n => !n.read).length;

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
            >
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <NotificationContent>
                  <IconBox $type={item.type} $token={token}>
                    {item.type === 'success' && <CheckCircleFilled />}
                    {item.type === 'error' && <CloseCircleFilled />}
                    {item.type === 'warning' && <ExclamationCircleFilled />}
                    {item.type === 'info' && <InfoCircleFilled />}
                  </IconBox>
                  <TextContent $read={item.read} $token={token}>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <div className="meta">
                      {dayjs(item.createTime).fromNow()}
                    </div>
                  </TextContent>
                </NotificationContent>
                <ActionButtons className="action-buttons" $token={token}>
                  {!item.read && (
                    <Tooltip title="标记已读">
                      <ActionButton $token={token} onClick={() => handleMarkRead(item.id)}>
                        <CheckOutlined />
                      </ActionButton>
                    </Tooltip>
                  )}
                  <Popconfirm title="确认删除?" onConfirm={() => handleDelete(item.id)}>
                    <ActionButton $token={token}>
                      <DeleteOutlined />
                    </ActionButton>
                  </Popconfirm>
                </ActionButtons>
              </div>
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
              <BellOutlined /> 通知中心
              {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 12, backgroundColor: token.colorPrimary }} />}
            </h1>
            <p>集中管理您的所有系统消息与提醒</p>
          </div>
          <div className="actions">
             <Button icon={<ReloadOutlined />} onClick={fetchNotifications} loading={loading}>刷新</Button>
          </div>
        </PageHeader>

        {/* 修复后的双层工具栏 */}
        <ToolbarContainer $token={token}>
          {/* 第一行：主要筛选 + 操作 */}
          <ToolbarTopRow>
            <Segmented
              value={filterType}
              onChange={setFilterType}
              options={[
                { label: '全部消息', value: 'all' },
                { label: '仅看未读', value: 'unread' },
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
              全部已读
            </Button>
          </ToolbarTopRow>

          <Divider style={{ margin: 0 }} />

          {/* 第二行：分类标签 (Chip) */}
          <ToolbarBottomRow>
            <FilterOutlined style={{ color: token.colorTextTertiary, marginRight: 8 }} />
            {['all', 'success', 'info', 'warning', 'error'].map(type => (
              <Chip 
                key={type} 
                $active={category === type} 
                $token={token}
                onClick={() => setCategory(type)}
              >
                {type === 'all' ? '所有类型' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Chip>
            ))}
          </ToolbarBottomRow>
        </ToolbarContainer>

        {/* 通知列表 */}
        {filteredList.length === 0 ? (
          <Empty description="暂无通知" style={{ marginTop: 60 }} />
        ) : (
          <>
            {renderGroup('今天', groupedNotifications.today)}
            {renderGroup('昨天', groupedNotifications.yesterday)}
            {renderGroup('更早', groupedNotifications.earlier)}
          </>
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