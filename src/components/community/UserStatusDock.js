import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Avatar, Tooltip, Badge, Progress, Modal, Tag, Button, Space, Empty } from 'antd';
import { 
  ThunderboltFilled, 
  TrophyFilled, 
  UserOutlined, 
  PlusCircleFilled,
  FireFilled,
  SettingOutlined,
  CrownOutlined,
  StarOutlined,
  SafetyOutlined,
  EyeOutlined,
  PlusOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { getMyRoles } from 'api/community';
import RoleBadge from './RoleBadge';
import RoleApplicationModal from './RoleApplicationModal';
import MyApplicationsModal from './MyApplicationsModal';
import PostManageModal from './PostManageModal';
import dayjs from 'dayjs';

// --- 动画定义 ---
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(131, 56, 236, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(131, 56, 236, 0); }
  100% { box-shadow: 0 0 0 0 rgba(131, 56, 236, 0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

// --- 样式组件 ---
const DockWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  animation: ${float} 6s ease-in-out infinite;
`;

// 能量胶囊 (展示代币/算力)
const EnergyCapsule = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
  padding: 4px 6px 4px 16px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  border-radius: 100px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(131, 56, 236, 0.25);
    border-color: rgba(131, 56, 236, 0.5);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: #ffd700; // 金色/闪电色
    font-size: 16px;
    margin-right: 8px;
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6));

    ${props => props.$animate && css`
      animation: ${pulse} 2s infinite;
    `}
  }

  .value {
    font-family: 'JetBrains Mono', monospace; // 等宽字体更有科技感
    font-weight: 700;
    font-size: 15px;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    margin-right: 12px;
  }

  .add-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8338ec 0%, #3a86ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    transition: transform 0.2s;
    &:hover {
      transform: rotate(90deg);
    }
  }
`;

// 身份主卡片
const IdentityCard = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 6px 16px 6px 6px; // 左侧留给头像
  min-height: 56px;
  max-width: 320px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.9)'};
  backdrop-filter: blur(20px);
  border-radius: 100px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 50px rgba(0,0,0,0.2);
    padding-right: 20px;
  }
`;

// 动态头像容器
const AvatarWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  margin-right: 12px;
  flex-shrink: 0;

  // 旋转的等级光环
  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #06ffa5; // 亮绿色进度
    border-right-color: #06ffa5;
    animation: ${spin} 3s linear infinite;
    opacity: 0.8;
  }

  // 静态底环
  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
    z-index: 0;
  }
`;

const StyledAvatar = styled(Avatar)`
  position: relative;
  z-index: 2;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#000' : '#fff'};
`;

const LevelBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -6px;
  background: #3a86ff;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 8px;
  z-index: 3;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#000' : '#fff'};
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
  gap: 2px;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
`;

const UserStatus = styled.div`
  font-size: 10px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-wrap: wrap;
  line-height: 1.4;
`;

// 连续签到火焰
const StreakFire = styled(FireFilled)`
  color: #ff5252;
  font-size: 12px;
  filter: drop-shadow(0 0 4px rgba(255, 82, 82, 0.4));
`;

// 角色图标映射
const ROLE_ICONS = {
  'super_admin': <CrownOutlined />,
  'community_manager': <StarOutlined />,
  'content_curator': <SafetyOutlined />,
  'moderator': <EyeOutlined />,
  'challenge_reviewer': <TrophyFilled />,
};

// 角色颜色映射
const ROLE_COLORS = {
  'super_admin': '#ff4d4f',
  'community_manager': '#faad14',
  'content_curator': '#1890ff',
  'moderator': '#52c41a',
  'challenge_reviewer': '#722ed1',
};

const ModalContent = styled.div`
  .user-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(0, 0, 0, 0.02)'};
    border-radius: 12px;
    margin-bottom: 24px;

    .user-avatar {
      border: 3px solid ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.1)'};
    }

    .user-details {
      flex: 1;
      
      .name {
        font-size: 18px;
        font-weight: 600;
        color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
        margin-bottom: 4px;
      }

      .username {
        font-size: 14px;
        color: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.45)' 
          : 'rgba(0, 0, 0, 0.45)'};
      }
    }
  }

  .roles-section {
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .role-card {
      padding: 16px;
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.03)' 
        : 'rgba(0, 0, 0, 0.02)'};
      border: 1px solid ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.06)'};
      border-radius: 12px;
      margin-bottom: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.04)'};
        border-color: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(0, 0, 0, 0.12)'};
      }

      .role-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .role-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          .role-icon {
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: rgba(24, 144, 255, 0.1);
          }

          .role-details {
            flex: 1;
            
            .role-name {
              font-size: 16px;
              font-weight: 600;
              color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
              margin-bottom: 2px;
            }

            .role-code {
              font-size: 12px;
              color: ${props => props.theme.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.45)' 
                : 'rgba(0, 0, 0, 0.45)'};
              font-family: 'Monaco', 'Consolas', monospace;
            }
          }
        }

        .role-actions {
          flex-shrink: 0;
        }
      }

      .role-time {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.65)' 
          : 'rgba(0, 0, 0, 0.65)'};
        margin-top: 8px;

        &.expired {
          color: #ff4d4f;
        }

        &.permanent {
          color: #52c41a;
        }
      }

      .permissions {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.06)'};

        .permissions-label {
          font-size: 12px;
          color: ${props => props.theme.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.45)' 
            : 'rgba(0, 0, 0, 0.45)'};
          margin-bottom: 8px;
        }

        .permission-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
      }
    }
  }
`;

const RoleTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  font-weight: 600;
  
  /* 缩小 RoleBadge 的显示 */
  .ant-badge {
    font-size: 9px;
  }
  
  .ant-tag {
    margin: 0;
    padding: 0 4px;
    font-size: 9px;
    line-height: 16px;
    height: 16px;
    border-radius: 4px;
  }
`;

// --- 组件本体 ---
const UserStatusDock = ({ showRoles = true }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applicationsModalVisible, setApplicationsModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);

  useEffect(() => {
    loadUserInfo();
    if (showRoles) {
      loadRoles();
    }
  }, [showRoles]);

  const loadUserInfo = () => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const data = await getMyRoles();
      setRoles(data);
    } catch (error) {
      console.debug('Failed to fetch roles:', error);
    }
  };

  const handleCardClick = () => {
    setModalVisible(true);
  };

  const handleApplySuccess = () => {
    setApplyModalVisible(false);
    loadRoles();
  };

  if (loading || !userInfo) {
    return null;
  }

  // 使用真实用户数据
  const user = {
    name: userInfo.nickname || userInfo.username || "User",
    level: 12, // 可以从 API 获取
    credits: 2450, // 可以从 API 获取
    streak: 5, // 可以从 API 获取
    avatar: userInfo.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (userInfo.username || "User")
  };

  return (
    <>
      <DockWrapper>
        {/* 身份卡片 */}
        <IdentityCard onClick={handleCardClick}>
          <AvatarWrapper>
            <StyledAvatar size={48} src={user.avatar} icon={<UserOutlined />} />
            <LevelBadge>LV.{user.level}</LevelBadge>
          </AvatarWrapper>
          
          <InfoColumn>
            <UserName>{user.name}</UserName>
            <UserStatus>
              {showRoles && roles.length > 0 && (
                <RoleTag>
                  <RoleBadge maxDisplay={1} showTooltip={false} />
                </RoleTag>
              )}
              {showRoles && roles.length > 0 && (
                <span style={{width: 1, height: 8, background: 'currentColor', opacity: 0.3, margin: '0 2px'}} />
              )}
              <Tooltip title={`${user.streak} days streak`}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, cursor: 'help' }}>
                  <StreakFire /> {user.streak}
                </span>
              </Tooltip>
            </UserStatus>
          </InfoColumn>
          <div style={{ marginLeft: 16, opacity: 0.5, cursor: 'pointer' }}>
             <SettingOutlined />
          </div>
        </IdentityCard>
      </DockWrapper>

      {/* 角色详情 Modal */}
      <Modal
        title="我的社区角色"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        <ModalContent>
          {/* 用户信息 */}
          <div className="user-header">
            <Avatar 
              src={userInfo.avatar} 
              size={64}
              icon={<UserOutlined />}
              className="user-avatar"
            >
              {!userInfo.avatar && userInfo.username?.[0]?.toUpperCase()}
            </Avatar>
            <div className="user-details">
              <div className="name">{userInfo.nickname || userInfo.username}</div>
              <div className="username">@{userInfo.username}</div>
            </div>
          </div>

          {/* 操作按钮 */}
          <Space style={{ marginBottom: 16, width: '100%' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setApplyModalVisible(true)}
            >
              申请角色
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setApplicationsModalVisible(true)}
            >
              我的申请记录
            </Button>
          </Space>

          {/* 角色列表 */}
          <div className="roles-section">
            <div className="section-title">
              <CrownOutlined />
              我的社区角色 ({roles.length})
            </div>

            {roles.length === 0 ? (
              <Empty 
                description="暂无社区角色，点击上方按钮申请角色"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              roles.map((role) => {
                const icon = ROLE_ICONS[role.roleCode] || <StarOutlined />;
                const color = ROLE_COLORS[role.roleCode] || '#1890ff';
                const isExpired = role.expiredTime && dayjs(role.expiredTime).isBefore(dayjs());
                const isPermanent = !role.expiredTime;

                // 处理权限
                let permissions = [];
                if (role.permissions) {
                  if (Array.isArray(role.permissions)) {
                    permissions = role.permissions;
                  } else if (typeof role.permissions === 'string') {
                    try {
                      permissions = JSON.parse(role.permissions);
                    } catch (e) {
                      console.error('Failed to parse permissions:', e);
                    }
                  }
                }

                return (
                  <div key={role.id} className="role-card">
                    <div className="role-header">
                      <div className="role-info">
                        <div className="role-icon" style={{ color }}>
                          {icon}
                        </div>
                        <div className="role-details">
                          <div className="role-name">
                            {role.roleName}
                            {role.isOfficial && (
                              <Tag color="gold" style={{ marginLeft: 8 }}>官方</Tag>
                            )}
                          </div>
                          <div className="role-code">{role.roleCode}</div>
                        </div>
                      </div>
                      {role.roleCode === 'community_manager' && !isExpired && (
                        <div className="role-actions">
                          <Button
                            type="primary"
                            size="small"
                            icon={<SettingOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalVisible(false);
                              setManageModalVisible(true);
                            }}
                          >
                            管理
                          </Button>
                        </div>
                      )}
                    </div>

                    {isPermanent ? (
                      <div className="role-time permanent">
                        <CheckCircleOutlined />
                        永久有效
                      </div>
                    ) : (
                      <div className={`role-time ${isExpired ? 'expired' : ''}`}>
                        <ClockCircleOutlined />
                        {isExpired ? '已过期' : '有效期至'}: {dayjs(role.expiredTime).format('YYYY-MM-DD HH:mm')}
                      </div>
                    )}

                    {permissions.length > 0 && (
                      <div className="permissions">
                        <div className="permissions-label">权限 ({permissions.length})</div>
                        <div className="permission-tags">
                          {permissions.map((perm, index) => (
                            <Tag key={index} color="blue" style={{ margin: 0 }}>
                              {perm}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ModalContent>
      </Modal>

      {/* 申请角色模态框 */}
      <RoleApplicationModal
        visible={applyModalVisible}
        onCancel={() => setApplyModalVisible(false)}
        onSuccess={handleApplySuccess}
      />

      {/* 申请记录模态框 */}
      <MyApplicationsModal
        visible={applicationsModalVisible}
        onCancel={() => setApplicationsModalVisible(false)}
      />

      {/* 帖子管理模态框 */}
      <PostManageModal
        visible={manageModalVisible}
        onCancel={() => setManageModalVisible(false)}
      />
    </>
  );
};

export default UserStatusDock;

