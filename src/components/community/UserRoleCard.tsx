import React, { useEffect, useState } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { Modal } from 'antd';
import { getMyRoles, CommunityUserRole } from 'api/community';
import RoleBadge from './RoleBadge';
import RoleApplicationModal from './RoleApplicationModal';
import MyApplicationsModal from './MyApplicationsModal';
import PostManageModal from './PostManageModal';
import UserRoleModalContent from './UserRoleModalContent';
import { communityModalMobileCss } from './communityModalStyled';
import { mergeUserRoleModalStyles } from './communityRoleModalStyles';
import { useCommunityModalProps } from './useCommunityModalProps';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 24px 10px 10px;
  max-width: min(280px, calc(100vw - 24px));
  box-sizing: border-box;
  background: ${(props) =>
    props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  backdrop-filter: blur(10px);
  border-radius: 50px;
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: 0 4px 12px
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)'};
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px
      ${(props) =>
        props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.12)'};
    background: ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'};
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
  color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#1f1f1f')};
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
  border: 3px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.05);
  }
`;

const RoleModal = styled(Modal)`
  ${communityModalMobileCss}

  .ant-modal-content {
    padding: 0;
    overflow: hidden;
  }

  .ant-modal-header {
    position: absolute !important;
    top: 0;
    right: 0;
    left: 0;
    z-index: 20;
    background: transparent !important;
    border-bottom: none !important;
    margin-bottom: 0 !important;
    padding: 14px 16px !important;
  }

  .ant-modal-close {
    color: rgba(255, 255, 255, 0.92) !important;

    &:hover {
      color: #fff !important;
      background: rgba(255, 255, 255, 0.15) !important;
    }
  }

  .ant-modal-body {
    padding: 0 !important;
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'};
      border-radius: 3px;
    }
  }

  @media (max-width: 768px) {
    .ant-modal-body {
      padding: 0 !important;
    }
  }
`;

interface UserRoleCardProps {
  showRoles?: boolean;
  maxRoleDisplay?: number;
}

const UserRoleCard: React.FC<UserRoleCardProps> = ({
  showRoles = true,
  maxRoleDisplay = 1,
}) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [roles, setRoles] = useState<CommunityUserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applicationsModalVisible, setApplicationsModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const { styles: baseModalStyles, ...roleModalRest } = useCommunityModalProps(840, {
    bodyMaxHeight: 'min(80vh, 720px)',
  });

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

  const handleApplySuccess = () => {
    setApplyModalVisible(false);
    loadRoles();
    setModalVisible(true);
  };

  const openApplyModal = () => {
    setModalVisible(false);
    setApplyModalVisible(true);
  };

  const openApplicationsModal = () => {
    setModalVisible(false);
    setApplicationsModalVisible(true);
  };

  const openManageModal = () => {
    setModalVisible(false);
    setManageModalVisible(true);
  };

  if (loading || !userInfo) {
    return null;
  }

  return (
    <>
      <Container onClick={() => setModalVisible(true)}>
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

      <RoleModal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        styles={mergeUserRoleModalStyles(baseModalStyles)}
        {...roleModalRest}
      >
        <UserRoleModalContent
          userInfo={userInfo}
          roles={roles}
          onApply={openApplyModal}
          onApplications={openApplicationsModal}
          onManage={openManageModal}
        />
      </RoleModal>

      <RoleApplicationModal
        visible={applyModalVisible}
        onCancel={() => {
          setApplyModalVisible(false);
          setModalVisible(true);
        }}
        onSuccess={handleApplySuccess}
      />

      <MyApplicationsModal
        visible={applicationsModalVisible}
        onCancel={() => {
          setApplicationsModalVisible(false);
          setModalVisible(true);
        }}
      />

      <PostManageModal
        visible={manageModalVisible}
        onCancel={() => {
          setManageModalVisible(false);
          setModalVisible(true);
        }}
      />
    </>
  );
};

export default UserRoleCard;
