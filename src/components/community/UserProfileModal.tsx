import React from 'react';
import { Modal, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const { Title } = Typography;

const ModalContent = styled.div`
  padding: 20px 0;
  
  .user-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    
    .avatar {
      width: 80px;
      height: 80px;
    }
    
    .username {
      font-size: 20px;
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
      margin: 0;
    }
  }
`;

interface UserProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  userId?: number;
  userNickname?: string;
  userAvatar?: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  onCancel,
  userId,
  userNickname,
  userAvatar,
}) => {
  return (
    <Modal
      title={<FormattedMessage id="user.profile" defaultMessage="用户信息" />}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
    >
      <ModalContent>
        <div className="user-header">
          <Avatar 
            src={userAvatar} 
            size={80} 
            icon={<UserOutlined />}
            className="avatar"
          />
          <Title level={4} className="username">
            {userNickname || <FormattedMessage id="common.unknown" defaultMessage="未知用户" />}
          </Title>
        </div>
        {/* 后续接口接入后，可以在这里添加更多信息 */}
      </ModalContent>
    </Modal>
  );
};

export default UserProfileModal;

