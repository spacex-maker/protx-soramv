import React, { useEffect, useState } from 'react';
import { Avatar, Modal, Tag, Divider, Empty, Button, Space } from 'antd';
import { UserOutlined, CrownOutlined, StarOutlined, SafetyOutlined, EyeOutlined, TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { getMyRoles, CommunityUserRole } from 'api/community';
import RoleBadge from './RoleBadge';
import RoleApplicationModal from './RoleApplicationModal';
import MyApplicationsModal from './MyApplicationsModal';
import PostManageModal from './PostManageModal';
import dayjs from 'dayjs';

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(-10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 24px 10px 10px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.02)'};
  backdrop-filter: blur(10px);
  border-radius: 50px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: 0 4px 12px ${props => props.theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(0, 0, 0, 0.08)'};
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.theme.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.4)' 
      : 'rgba(0, 0, 0, 0.12)'};
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(0, 0, 0, 0.04)'};
  }

  @media (max-width: 768px) {
    padding: 8px;
    gap: 0;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Username = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
`;

const RoleContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledAvatar = styled(Avatar)`
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 3px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.05);
  }
`;

interface UserRoleCardProps {
  showRoles?: boolean;
  maxRoleDisplay?: number;
}

// 角色图标映射
const ROLE_ICONS: Record<string, React.ReactNode> = {
  'super_admin': <CrownOutlined />,
  'community_manager': <StarOutlined />,
  'content_curator': <SafetyOutlined />,
  'moderator': <EyeOutlined />,
  'challenge_reviewer': <TrophyOutlined />,
};

// 角色颜色映射
const ROLE_COLORS: Record<string, string> = {
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

const UserRoleCard: React.FC<UserRoleCardProps> = ({ 
  showRoles = true,
  maxRoleDisplay = 1
}) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [roles, setRoles] = useState<CommunityUserRole[]>([]);
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
    loadRoles(); // 刷新角色列表
  };

  if (loading || !userInfo) {
    return null;
  }

  return (
    <>
      <Container onClick={handleCardClick}>
        <StyledAvatar 
          src={userInfo.avatar} 
          size={48}
          icon={<UserOutlined />}
          className="user-avatar"
        >
          {!userInfo.avatar && userInfo.username?.[0]?.toUpperCase()}
        </StyledAvatar>

        <UserInfo>
          <Username title={userInfo.nickname || userInfo.username}>
            {userInfo.nickname || userInfo.username}
          </Username>
          {showRoles && roles.length > 0 && (
            <RoleContainer>
              <RoleBadge maxDisplay={maxRoleDisplay} showTooltip={false} />
            </RoleContainer>
          )}
        </UserInfo>
      </Container>

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

                // 处理权限：可能是字符串数组或JSON字符串
                let permissions: string[] = [];
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
                      {/* 社区运营官显示管理按钮 */}
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

                    {/* 过期时间 */}
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

                    {/* 权限列表 */}
                    {permissions.length > 0 && (
                      <div className="permissions">
                        <div className="permissions-label">权限 ({permissions.length})</div>
                        <div className="permission-tags">
                          {permissions.map((perm: string, index: number) => (
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

export default UserRoleCard;

