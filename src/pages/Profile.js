import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import SimpleHeader from "components/headers/simple";
import { ReactComponent as EditIcon } from "feather-icons/dist/icons/edit-2.svg";
import { ReactComponent as SaveIcon } from "feather-icons/dist/icons/check.svg";
import { ReactComponent as CancelIcon } from "feather-icons/dist/icons/x.svg";
import { Modal } from 'antd';
import { motion } from "framer-motion";
import tw from "twin.macro";
import { Button, Input } from "antd";
import { UserOutlined, CloudUploadOutlined, ProfileOutlined, ContactsOutlined, ToolOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { message } from "antd";

const PageWrapper = styled.div`
  ${tw`
    w-full
    h-screen  // 改为固定高度
    flex
    flex-col
    overflow-hidden  // 防止整体滚动
  `}
`;

const Container = styled.div`
  ${tw`
    relative 
    w-full
    flex-grow
  `}
  background: var(--ant-color-bg-container);
`;

const Content = styled.div`
  ${tw`
    mx-auto 
    w-full
    h-full
  `}
  height: calc(100vh - 64px);
  overflow: auto;
  margin-top: 64px;
  padding: 24px;
  max-width: 1000px;  // 限制最大宽度
`;

// 定义跑马灯效果
const marqueeGlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

// 定义脉冲效果
const pulseEffect = keyframes`
  0% {
    transform: scale(0.97);
    opacity: 0.8;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.97);
    opacity: 0.8;
  }
`;

const ProfileHeader = styled(motion.div)`
  background: var(--ant-color-bg-container);
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  position: relative;  // 为绝对定位的编辑按钮做准备

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: 1px solid var(--ant-color-border);
    pointer-events: none;
  }
`;

const AvatarSection = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AvatarGlow = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 16px;
  z-index: 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      #1890ff 25%, 
      #40a9ff 50%, 
      #1890ff 75%, 
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${marqueeGlow} 3s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border-radius: 14px;
    background: ${props => props.isDark ? '#141414' : '#ffffff'};
    z-index: 0;
  }
`;

const GlowOverlay = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 16px;
  box-shadow: 0 0 8px 2px rgba(24, 144, 255, 0.3);
  opacity: 0.7;
  z-index: 0;
  animation: ${pulseEffect} 2s ease-in-out infinite;
`;

const Avatar = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 12px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
`;

const AvatarFallback = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 12px;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 2.5rem;
  position: relative;
  z-index: 1;
`;

const UserInfo = styled.div`
  flex-grow: 1;
`;

const Username = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--ant-color-text);
  margin-bottom: 8px;
`;

const UserDescription = styled.p`
  font-size: 14px;
  color: var(--ant-color-text-secondary);
  margin-bottom: 16px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid var(--ant-color-border);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  background: var(--ant-color-bg-elevated);
  border-radius: 8px;
  border: 1px solid var(--ant-color-border);
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--ant-color-text);
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: var(--ant-color-text-secondary);
`;

const TabsContainer = styled.div`
  background: var(--ant-color-bg-container);
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  width: 100%;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: 1px solid var(--ant-color-border);
    pointer-events: none;
  }
`;

const TabList = styled.div`
  display: flex;
  padding: 16px 24px;
  gap: 8px;
  border-bottom: 1px solid var(--ant-color-border);
`;

const Tab = styled.button`
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? 'var(--ant-color-primary)' : 'var(--ant-color-text-secondary)'};
  background: ${props => props.active ? 'var(--ant-color-primary-bg)' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
  }
`;

const InfoSection = styled.div`
  padding: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);  // 固定两列
  gap: 20px;
`;

const InfoItem = styled.div`
  padding: 20px;
  background: var(--ant-color-bg-container);
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    border: 1px solid var(--ant-color-border);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const Label = styled.div`
  font-size: 13px;
  color: var(--ant-color-text-secondary);
  margin-bottom: 8px;
`;

const Value = styled.div`
  font-size: 15px;
  color: var(--ant-color-text);
  font-weight: 500;
`;

const StyledButton = styled.button`
  ${tw`
    px-6 py-3 
    rounded-xl 
    font-medium 
    transition duration-200 
    flex items-center gap-2
  `}
  ${props => props.primary 
    ? tw`
      bg-primary-500 text-white 
      hover:bg-primary-600 
      dark:bg-primary-600 dark:hover:bg-primary-500
      transform hover:scale-105
      shadow-md hover:shadow-lg
    ` 
    : tw`
      bg-gray-200 text-gray-700 
      hover:bg-gray-300 
      dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
      transform hover:scale-105
    `}
`;

const EditButton = styled.button`
  position: absolute;
  right: 32px;
  top: 32px;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--ant-color-bg-container);
  color: var(--ant-color-text);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--ant-color-border);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      rgba(24, 144, 255, 0.1) 25%, 
      rgba(64, 169, 255, 0.2) 50%, 
      rgba(24, 144, 255, 0.1) 75%, 
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${marqueeGlow} 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: var(--ant-color-primary);
    border-color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
    
    &::before {
      opacity: 1;
    }
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 16px;
    padding: 0;
    background: ${props => props.theme.mode === 'dark' ? '#1c1c1e' : '#ffffff'};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .ant-modal-header {
    padding: 24px 32px;
    border-bottom: none;
    margin: 0;
    
    .ant-modal-title {
      font-size: 24px;
      font-weight: 500;
      color: var(--ant-color-text);
    }
  }

  .ant-modal-body {
    padding: 0 32px 32px;
  }

  .ant-modal-footer {
    margin: 0;
    padding: 20px 32px;
    border-top: 1px solid var(--ant-color-border);
  }
`;

const FormSection = styled.div`
  margin-bottom: 40px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  margin-bottom: 20px;

  h3 {
    font-size: 17px;
    font-weight: 500;
    color: var(--ant-color-text);
    margin: 0;
  }

  p {
    font-size: 13px;
    color: var(--ant-color-text-secondary);
    margin: 4px 0 0 0;
    line-height: 1.5;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormItem = styled.div`
  flex: 1;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 13px;
  color: var(--ant-color-text-secondary);
  margin-bottom: 8px;
`;

const StyledInput = styled(Input)`
  border-radius: 8px;
  border: 1px solid var(--ant-color-border);
  padding: 8px 12px;
  font-size: 15px;
  transition: all 0.2s;

  &:hover, &:focus {
    border-color: var(--ant-color-primary);
  }
`;

const StyledTextArea = styled(Input.TextArea)`
  border-radius: 8px;
  border: 1px solid var(--ant-color-border);
  padding: 8px 12px;
  font-size: 15px;
  min-height: 100px;
  transition: all 0.2s;

  &:hover, &:focus {
    border-color: var(--ant-color-primary);
  }
`;

const AvatarUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: var(--ant-color-bg-elevated);
  border-radius: 12px;
`;

const AvatarPreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UploadInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 15px;
    font-weight: 500;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 13px;
    color: var(--ant-color-text-secondary);
    margin: 0 0 12px 0;
  }
`;

// 添加样式组件
const ConstructionBanner = styled.div`
  position: fixed;
  top: 64px;  // SimpleHeader 的高度
  left: 0;
  right: 0;
  background: var(--ant-color-warning-bg);
  padding: 8px;
  text-align: center;
  font-size: 14px;
  color: var(--ant-color-warning);
  border-bottom: 1px solid var(--ant-color-warning-border);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [afterOpen, setAfterOpen] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedInfo);
      setEditedInfo(parsedInfo);
    }
  }, []);

  const handleEditClick = () => {
    setEditedInfo({
      username: userInfo?.username || '',
      nickname: userInfo?.nickname || '',
      bio: userInfo?.bio || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
      avatar: userInfo?.avatar || ''
    });
    setIsModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        message.error('图片大小不能超过 2MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 处理保存逻辑
      // TODO: 实现实际的保存功能
      
      message.success('保存成功');
      setIsModalOpen(false);
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAfterOpen = () => {
    requestAnimationFrame(() => {
      setAfterOpen(true);
    });
  };

  const currentModalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: afterOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)'
    },
    content: {
      position: 'relative',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      maxWidth: '600px',
      width: '90%',
      margin: '20px',
      padding: 0,
      border: 'none',
      borderRadius: '1.25rem',
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1F2937' : '#ffffff',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      transform: afterOpen ? 'translateY(0)' : 'translateY(20px)',
      opacity: afterOpen ? 1 : 0,
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  };

  if (!userInfo) return <div>加载中...</div>;

  return (
    <PageWrapper>
      <SimpleHeader />
      <ConstructionBanner>
        <ToolOutlined /> 本页面正在建设中...
      </ConstructionBanner>
      <Container>
        <Content>
          <ProfileHeader
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AvatarSection>
              <AvatarGlow isDark={document.documentElement.getAttribute('data-theme') === 'dark'} />
              <GlowOverlay />
              {userInfo.avatar ? (
                <Avatar src={userInfo.avatar} />
              ) : (
                <AvatarFallback>{userInfo.username.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </AvatarSection>
            
            <UserInfo>
              <Username>{userInfo.username}</Username>
              <UserDescription>
                {userInfo.description || '这个用户很懒，还没有填写简介'}
              </UserDescription>
              <Stats>
                <StatItem>
                  <StatValue>{userInfo.creditScore || 0}</StatValue>
                  <StatLabel>信用分</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{userInfo.level || 1}</StatValue>
                  <StatLabel>等级</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{(userInfo.balance || 0).toFixed(2)}</StatValue>
                  <StatLabel>余额</StatLabel>
                </StatItem>
              </Stats>
            </UserInfo>
            
            <EditButton onClick={handleEditClick}>
              <EditIcon />
              编辑资料
            </EditButton>
          </ProfileHeader>

          <TabsContainer>
            <TabList>
              <Tab 
                active={activeTab === 'basic'} 
                onClick={() => setActiveTab('basic')}
              >
                基本信息
              </Tab>
              <Tab 
                active={activeTab === 'account'} 
                onClick={() => setActiveTab('account')}
              >
                账户信息
              </Tab>
            </TabList>

            {activeTab === 'basic' && (
              <InfoSection>
                <Grid>
                  <InfoItem>
                    <Label>昵称</Label>
                    <Value>{userInfo.nickname || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>邮箱</Label>
                    <Value>{userInfo.email}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>手机号码</Label>
                    <Value>{userInfo.phoneNumber || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>真实姓名</Label>
                    <Value>{userInfo.fullName || '未设置'}</Value>
                  </InfoItem>
                </Grid>
              </InfoSection>
            )}

            {activeTab === 'account' && (
              <InfoSection>
                <Grid>
                  <InfoItem>
                    <Label>USDT 地址</Label>
                    <Value>{userInfo.usdtAddress || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>USDT 余额</Label>
                    <Value>{(userInfo.usdtAmount || 0).toFixed(6)}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>USDT 冻结金额</Label>
                    <Value>{(userInfo.usdtFrozenAmount || 0).toFixed(6)}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>注册时间</Label>
                    <Value>{userInfo.createTime || '未知'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>账户状态</Label>
                    <Value>{userInfo.isActive ? '正常' : '已禁用'}</Value>
                  </InfoItem>
                </Grid>
              </InfoSection>
            )}
          </TabsContainer>
        </Content>
      </Container>
      <StyledModal
        title="编辑个人资料"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSave}
            loading={loading}
          >
            保存
          </Button>
        ]}
      >
        <FormSection>
          <SectionTitle>
            <h3>头像</h3>
          </SectionTitle>
          <AvatarUpload>
            <AvatarPreview>
              <img src={editedInfo.avatar || userInfo?.avatar} alt="Avatar" />
            </AvatarPreview>
            <UploadInfo>
              <Button icon={<CloudUploadOutlined />}>
                更换头像
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </Button>
            </UploadInfo>
          </AvatarUpload>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <h3>基本信息</h3>
          </SectionTitle>
          <FormRow>
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <StyledInput
                value={editedInfo.username || ''}
                onChange={(e) => setEditedInfo({...editedInfo, username: e.target.value})}
                placeholder="请输入用户名"
              />
            </FormItem>
            <FormItem>
              <FormLabel>昵称</FormLabel>
              <StyledInput
                value={editedInfo.nickname || ''}
                onChange={(e) => setEditedInfo({...editedInfo, nickname: e.target.value})}
                placeholder="请输入昵称"
              />
            </FormItem>
          </FormRow>
          <FormItem>
            <FormLabel>个人简介</FormLabel>
            <StyledTextArea
              value={editedInfo.bio || ''}
              onChange={(e) => setEditedInfo({...editedInfo, bio: e.target.value})}
              placeholder="介绍一下自己..."
            />
          </FormItem>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <h3>联系方式</h3>
          </SectionTitle>
          <FormRow>
            <FormItem>
              <FormLabel>电子邮箱</FormLabel>
              <StyledInput
                value={editedInfo.email || ''}
                onChange={(e) => setEditedInfo({...editedInfo, email: e.target.value})}
                placeholder="请输入邮箱"
              />
            </FormItem>
            <FormItem>
              <FormLabel>手机号码</FormLabel>
              <StyledInput
                value={editedInfo.phone || ''}
                onChange={(e) => setEditedInfo({...editedInfo, phone: e.target.value})}
                placeholder="请输入手机号"
              />
            </FormItem>
          </FormRow>
        </FormSection>
      </StyledModal>
    </PageWrapper>
  );
};

export default ProfilePage; 