import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import SimpleHeader from "components/headers/simple";
import instance from "api/axios";
import { auth } from "api/auth";
import { getFollowersList, getFollowingList, getRelationStatus, followUser, unfollowUser } from "api/community";
import { 
  Button, 
  Input, 
  message, 
  Modal, 
  Tabs, 
  Avatar as AntAvatar,
  ConfigProvider,
  Spin,
  Upload,
  theme, // 引入 theme
  Tooltip
} from "antd";
import { 
  UserOutlined, 
  EditOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined
} from "@ant-design/icons";

// ==========================================
// 样式组件 (接收 $token 作为 props)
// ==========================================

const PageBackground = styled.div`
  min-height: 100vh;
  width: 100%;
  /* 直接使用 Token 颜色 */
  background: ${props => props.$token.colorBgLayout};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  color: ${props => props.$token.colorText};
  overflow-x: hidden;
`;

const ConstructionBanner = styled.div`
  background: ${props => props.$token.colorWarningBg};
  border-bottom: 1px solid ${props => props.$token.colorWarningBorder};
  color: ${props => props.$token.colorWarning};
  padding: 10px 16px;
  text-align: center;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 50;
`;

const ContentWrapper = styled.div`
  flex: 1;
  position: relative;
  padding-bottom: 40px;
  width: 100%;
  
  /* 背景装饰 */
  &::before {
    content: '';
    position: fixed;
    top: -100px;
    right: -100px;
    width: 600px;
    height: 600px;
    /* 使用 Token 中的 primary 颜色 */
    background: radial-gradient(circle, ${props => props.$token.colorPrimaryBg} 0%, transparent 70%);
    opacity: 0.4;
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  }
`;

const MainContainer = styled(motion.div)`
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    padding: 32px 24px;
  }
`;

const CoverSection = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  background-color: ${props => props.$token.colorBgContainerDisabled};
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.2) 100%);
    pointer-events: none;
  }

  @media (min-width: 768px) {
    height: 280px;
  }
`;

// 核心修复：ProfileCard
const ProfileCard = styled.div`
  /* 使用 colorBgElevated (浮层背景色)，在暗黑模式下比纯黑稍微浅一点，有区分度 */
  background: ${props => props.$token.colorBgElevated}; 
  border-radius: 20px;
  /* 增加边框，确保在暗黑模式下边缘清晰 */
  border: 1px solid ${props => props.$token.colorBorder};
  /* 添加阴影 */
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.15);
  
  margin-top: -60px; 
  margin-left: 12px;
  margin-right: 12px;
  padding: 0 24px 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;

  @media (min-width: 768px) {
    margin-left: 40px;
    margin-right: 40px;
    margin-top: -80px;
    padding: 0 40px 40px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`;

const UserInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  position: relative;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
    gap: 24px;
    padding-bottom: 10px;
  }
`;

const AvatarWrapper = styled(motion.div)`
  position: relative;
  margin-top: -50px; 
  padding: 4px;
  /* 这里的背景要和卡片背景一致，看起来才自然 */
  background: ${props => props.$token.colorBgElevated};
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  z-index: 3;
  
  .avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    /* 内圈边框 */
    border: 4px solid ${props => props.$token.colorBgElevated};
    background: ${props => props.$token.colorBgLayout};
    display: flex;
    align-items: center;
    justify-content: center;
    
    img { width: 100%; height: 100%; object-fit: cover; }
    .fallback { font-size: 40px; color: ${props => props.$token.colorPrimary}; font-weight: 600; }
  }

  @media (min-width: 768px) {
    width: 140px;
    height: 140px;
    margin-top: -60px;
  }
`;

const UserMeta = styled.div`
  padding-top: 4px;
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: ${props => props.$token.colorText};
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  p {
    color: ${props => props.$token.colorTextSecondary};
    font-size: 14px;
    margin: 0;
    max-width: 400px;
    line-height: 1.5;
  }

  @media (min-width: 768px) {
    padding-top: 30px;
    h1 { font-size: 28px; }
  }
`;

const VerificationIcon = styled.div`
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    transform: scale(1.1);
  }
  
  .verified {
    color: ${props => props.$token.colorSuccess};
  }
  
  .unverified {
    color: ${props => props.$token.colorWarning};
  }
`;

const RainbowText = styled(motion.h1)`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  background: linear-gradient(
    135deg,
    ${props => props.$token.colorPrimary} 0%,
    #8b5cf6 50%,
    ${props => props.$token.colorPrimary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 24px 0;
  border-bottom: 1px solid ${props => props.$token.colorBorderSecondary};
  margin-bottom: 24px;
  width: 100%;

  @media (min-width: 768px) {
    gap: 60px;
    justify-content: flex-start;
    display: flex;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  /* 手机端稍微给点背景区分 */
  background: ${props => props.$token.colorBgLayout}; 
  min-width: 80px;
  
  @media (min-width: 768px) {
    min-width: 120px;
    background: transparent;
    align-items: flex-start;
    padding: 0;
  }

  .value {
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.$token.colorText};
    @media (min-width: 768px) { font-size: 22px; }
  }
  .label {
    font-size: 12px;
    color: ${props => props.$token.colorTextSecondary};
    margin-top: 4px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
`;

const InfoCard = styled(motion.div)`
  /* 使用 colorBgContainer，通常比 Elevated 稍微深/浅一点，视主题而定 */
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);

  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
    
    .anticon { color: ${props => props.$token.colorPrimary}; font-size: 18px; }
  }
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.$token.colorBorderSecondary};
  
  &:last-child { border-bottom: none; }
  
  .label { font-size: 14px; color: ${props => props.$token.colorTextSecondary}; }
  .value { font-size: 14px; font-weight: 500; color: ${props => props.$token.colorText}; text-align: right; }
`;

const USDTBox = styled.div`
  background: ${props => props.$token.colorFillAlter}; /* 使用填充色 */
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  word-break: break-all;
  color: ${props => props.$token.colorPrimaryText};
  font-size: 13px;
  border: 1px dashed ${props => props.$token.colorPrimaryBorder};
  text-align: center;
  font-family: monospace;
`;

// 模态框样式
const FormSection = styled.div`
  margin-bottom: 24px;
  h3 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
    color: ${props => props.$token.colorText};
  }
`;

const FormLabel = styled.div`
  margin-bottom: 6px; 
  font-size: 13px; 
  color: ${props => props.$token.colorTextSecondary};
`;

// ==========================================
// 逻辑组件 (ProfileContent)
// 为了使用 Token，我们需要把内容拆分出来，或者在内部使用
// ==========================================

const ProfileContent = () => {
  // 1. 获取 Ant Design 真实的 Token (Hex 颜色值)
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  
  const [userInfo, setUserInfo] = useState(null);
  const [realnameInfo, setRealnameInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [avatarFile, setAvatarFile] = useState(null); // 保存选中的头像文件对象
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // 是否已实名认证：后端定义 2 为已通过
  const isVerified = realnameInfo?.realnameStatus === 2;

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
    } else {
      setUserInfo({
        username: "GuestUser",
        nickname: "Guest",
        description: intl.formatMessage({ id: 'profile.value.noDescription', defaultMessage: '这个人很懒，什么都没写' }),
        email: "guest@example.com",
        phoneNumber: intl.formatMessage({ id: 'profile.value.notBound', defaultMessage: '未绑定' }),
        avatar: "",
        creditScore: 0,
        level: 1,
        balance: 0,
        usdtAddress: "暂无地址",
        usdtAmount: 0,
        usdtFrozenAmount: 0,
        createTime: "2024-01-01",
        isActive: true,
        fullName: ""
      });
    }
  }, []);

  // 获取实名认证信息
  useEffect(() => {
    const fetchRealnameInfo = async () => {
      try {
        const result = await auth.getUserRealnameInfo();
        if (result.success && result.data) {
          setRealnameInfo(result.data);
        }
      } catch (e) {
        console.error('获取实名认证信息失败', e);
      }
    };
    fetchRealnameInfo();
  }, []);

  // 获取关注和粉丝数
  useEffect(() => {
    const fetchRelationStats = async () => {
      const userId = userInfo?.id || userInfo?.userId;
      if (!userId) return;
      try {
        const status = await getRelationStatus(userId);
        setFollowersCount(status.followersCount || 0);
        setFollowingCount(status.followingCount || 0);
      } catch (e) {
        console.error('获取关注统计失败', e);
      }
    };
    const userId = userInfo?.id || userInfo?.userId;
    if (userId) {
      fetchRelationStats();
    }
  }, [userInfo?.id, userInfo?.userId]);

  // 加载粉丝列表
  const loadFollowersList = async () => {
    const userId = userInfo?.id || userInfo?.userId;
    if (!userId) return;
    setLoadingFollowers(true);
    try {
      const list = await getFollowersList(userId);
      setFollowersList(list);
    } catch (e) {
      message.error(e.message || intl.formatMessage({ id: 'profile.message.loadFollowersFailed', defaultMessage: '加载粉丝列表失败' }));
    } finally {
      setLoadingFollowers(false);
    }
  };

  // 加载关注列表
  const loadFollowingList = async () => {
    const userId = userInfo?.id || userInfo?.userId;
    if (!userId) return;
    setLoadingFollowers(true);
    try {
      const list = await getFollowingList(userId);
      setFollowingList(list);
    } catch (e) {
      message.error(e.message || intl.formatMessage({ id: 'profile.message.loadFollowingFailed', defaultMessage: '加载关注列表失败' }));
    } finally {
      setLoadingFollowers(false);
    }
  };

  // 处理关注/取消关注
  const handleFollowInModal = async (targetUserId, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
      } else {
        await followUser(targetUserId, 'PROFILE');
      }
      // 刷新列表
      if (followersModalOpen) {
        loadFollowersList();
      }
      if (followingModalOpen) {
        loadFollowingList();
      }
      // 刷新统计
      const userId = userInfo?.id || userInfo?.userId;
      if (userId) {
        const status = await getRelationStatus(userId);
        setFollowersCount(status.followersCount || 0);
        setFollowingCount(status.followingCount || 0);
      }
      message.success(isFollowing 
        ? intl.formatMessage({ id: 'profile.message.unfollowSuccess', defaultMessage: '取消关注成功' })
        : intl.formatMessage({ id: 'profile.message.followSuccess', defaultMessage: '关注成功' }));
    } catch (e) {
      message.error(e.message || intl.formatMessage({ id: 'profile.message.operationFailed', defaultMessage: '操作失败' }));
    }
  };


  const handleEditClick = () => {
    setEditedInfo({
      username: userInfo?.username || '',
      nickname: userInfo?.nickname || '',
      description: userInfo?.description || '',
      email: userInfo?.email || '',
      phoneNumber: userInfo?.phoneNumber || '',
      avatar: userInfo?.avatar || ''
    });
    setAvatarFile(null); // 重置文件对象
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalAvatarUrl = editedInfo.avatar || userInfo?.avatar;
      
      // 如果有新头像文件，先上传头像
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        
        try {
          const uploadResponse = await instance.post('/productx/user/avatar', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          if (uploadResponse.data.success) {
            message.success(intl.formatMessage({ id: 'profile.message.avatarUploadSuccess', defaultMessage: '头像上传成功' }));
            // 上传成功后，重新获取用户信息以获取最新的头像 URL
            const userInfoResult = await auth.getUserInfo();
            if (userInfoResult.success) {
              finalAvatarUrl = userInfoResult.data.avatar || finalAvatarUrl;
              // 更新 editedInfo 中的 avatar 为最新的头像 URL
              setEditedInfo(prev => ({ ...prev, avatar: finalAvatarUrl }));
            }
          } else {
            message.error(uploadResponse.data.message || intl.formatMessage({ id: 'profile.message.uploadAvatarFailed', defaultMessage: '头像上传失败' }));
            setLoading(false);
            return;
          }
        } catch (uploadError) {
          message.error(uploadError.response?.data?.message || intl.formatMessage({ id: 'profile.message.uploadAvatarFailed', defaultMessage: '头像上传失败' }));
          setLoading(false);
          return;
        }
      }
      
      // 调用用户信息更新接口
      const updateData = {
        nickname: editedInfo.nickname || userInfo?.nickname,
        description: editedInfo.description || userInfo?.description,
        avatar: finalAvatarUrl,
        // 如果 editedInfo 中有其他字段，也可以包含进来
        address: editedInfo.address || userInfo?.address,
        city: editedInfo.city || userInfo?.city,
        state: editedInfo.state || userInfo?.state,
        postalCode: editedInfo.postalCode || userInfo?.postalCode,
      };
      
      try {
        const updateResponse = await instance.post('/productx/user/update', updateData);
        
        if (updateResponse.data.success) {
          // 更新成功后，重新获取用户信息
          const userInfoResult = await auth.getUserInfo();
          if (userInfoResult.success) {
            setUserInfo(userInfoResult.data);
            localStorage.setItem('userInfo', JSON.stringify(userInfoResult.data));
          }
          message.success(intl.formatMessage({ id: 'profile.message.saveSuccess', defaultMessage: '保存成功' }));
          setIsModalOpen(false);
          setAvatarFile(null); // 清空文件对象
        } else {
          message.error(updateResponse.data.message || intl.formatMessage({ id: 'profile.message.saveFailed', defaultMessage: '保存失败' }));
        }
      } catch (updateError) {
        message.error(updateError.response?.data?.message || intl.formatMessage({ id: 'profile.message.saveFailed', defaultMessage: '保存失败' }));
      }
    } catch (error) {
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'profile.message.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100, background: token.colorBgLayout, minHeight: '100vh' }}>
      <Spin size="large" />
    </div>
  );

  return (
    // 2. 将 token 传给所有的 Styled Components
    <PageBackground $token={token}>
      <SimpleHeader />
      
      <ConstructionBanner $token={token}>
        <ToolOutlined /> {intl.formatMessage({ id: 'profile.banner.construction', defaultMessage: '本页面正在建设中...' })}
      </ConstructionBanner>

      <ContentWrapper $token={token}>
        <MainContainer
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CoverSection $token={token}>
              <img 
                src={userInfo.cover || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80"} 
                alt="Cover Background" 
              />
          </CoverSection>

          <ProfileCard $token={token}>
            <HeaderRow>
              <UserInfoSection>
                <AvatarWrapper whileHover={{ scale: 1.05 }} $token={token}>
                  <div className="avatar-inner">
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt="Avatar" />
                    ) : (
                      <div className="fallback">{userInfo.username?.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                </AvatarWrapper>
                
                <UserMeta $token={token}>
                  <RainbowText
                    $token={token}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}
                  >
                    <span>{userInfo.nickname || userInfo.username}</span>
                    <VerificationIcon 
                      $token={token}
                      onClick={() => navigate('/verification')}
                    >
                      <Tooltip title={isVerified ? intl.formatMessage({ id: 'profile.tooltip.verified', defaultMessage: '已实名认证' }) : intl.formatMessage({ id: 'profile.tooltip.unverified', defaultMessage: '去实名认证' })}>
                        {isVerified ? (
                          <CheckCircleFilled className="verified" style={{ fontSize: 20 }} />
                        ) : (
                          <ExclamationCircleOutlined className="unverified" style={{ fontSize: 20 }} />
                        )}
                      </Tooltip>
                    </VerificationIcon>
                  </RainbowText>
                  <p>{userInfo.description || intl.formatMessage({ id: 'profile.value.noDescription', defaultMessage: '这个人很懒，什么都没写' })}</p>
                </UserMeta>
              </UserInfoSection>

              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={handleEditClick}
                size="large"
              >
                {intl.formatMessage({ id: 'profile.editProfile', defaultMessage: '编辑资料' })}
              </Button>
            </HeaderRow>

            <StatsGrid $token={token}>
              <StatItem $token={token}>
                <span className="value">{userInfo.creditScore || 0}</span>
                <span className="label">{intl.formatMessage({ id: 'profile.creditScore', defaultMessage: '信用分' })}</span>
              </StatItem>
              <StatItem $token={token}>
                <span className="value">{userInfo.level || 1}</span>
                <span className="label">{intl.formatMessage({ id: 'profile.level', defaultMessage: '等级' })}</span>
              </StatItem>
              <StatItem $token={token}>
                <span className="value">¥ {(userInfo.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="label">{intl.formatMessage({ id: 'profile.balance', defaultMessage: '余额' })}</span>
              </StatItem>
              <StatItem 
                $token={token} 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setFollowersModalOpen(true);
                  loadFollowersList();
                }}
              >
                <span className="value">{followersCount}</span>
                <span className="label">{intl.formatMessage({ id: 'profile.followers', defaultMessage: '粉丝' })}</span>
              </StatItem>
              <StatItem 
                $token={token}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setFollowingModalOpen(true);
                  loadFollowingList();
                }}
              >
                <span className="value">{followingCount}</span>
                <span className="label">{intl.formatMessage({ id: 'profile.following', defaultMessage: '关注' })}</span>
              </StatItem>
            </StatsGrid>

            <Tabs
              defaultActiveKey="basic"
              items={[
                {
                  key: 'basic',
                  label: <span><UserOutlined /> {intl.formatMessage({ id: 'profile.tab.basic', defaultMessage: '基本信息' })}</span>,
                  children: (
                    <ContentGrid>
                      <InfoCard $token={token}>
                        <div className="header"><IdcardOutlined /> {intl.formatMessage({ id: 'profile.section.personal', defaultMessage: '个人资料' })}</div>
                        <DetailItem $token={token}>
                          <span className="label">{intl.formatMessage({ id: 'profile.label.username', defaultMessage: '用户名' })}</span>
                          <span className="value">{userInfo.username}</span>
                        </DetailItem>
                        <DetailItem $token={token}>
                          <span className="label">{intl.formatMessage({ id: 'profile.label.realName', defaultMessage: '真实姓名' })}</span>
                          <span className="value">
                            {realnameInfo?.realName || userInfo.fullName || intl.formatMessage({ id: 'profile.value.notVerified', defaultMessage: '未认证' })}
                          </span>
                        </DetailItem>
                        <DetailItem $token={token}>
                          <span className="label">{intl.formatMessage({ id: 'profile.label.accountStatus', defaultMessage: '账户状态' })}</span>
                          <span className="value" style={{ color: userInfo.isActive ? token.colorSuccess : token.colorError }}>
                            {userInfo.isActive ? intl.formatMessage({ id: 'profile.status.normal', defaultMessage: '正常' }) : intl.formatMessage({ id: 'profile.status.disabled', defaultMessage: '已禁用' })}
                          </span>
                        </DetailItem>
                      </InfoCard>

                      <InfoCard $token={token}>
                        <div className="header"><PhoneOutlined /> {intl.formatMessage({ id: 'profile.section.contact', defaultMessage: '联系方式' })}</div>
                        <DetailItem $token={token}>
                          <span className="label">{intl.formatMessage({ id: 'profile.label.phone', defaultMessage: '手机号码' })}</span>
                          <span className="value">{userInfo.phoneNumber || intl.formatMessage({ id: 'profile.value.notBound', defaultMessage: '未绑定' })}</span>
                        </DetailItem>
                        <DetailItem $token={token}>
                          <span className="label">{intl.formatMessage({ id: 'profile.label.email', defaultMessage: '电子邮箱' })}</span>
                          <span className="value">{userInfo.email || intl.formatMessage({ id: 'profile.value.notBound', defaultMessage: '未绑定' })}</span>
                        </DetailItem>
                        <DetailItem $token={token}>
                          <span className="label">{intl.formatMessage({ id: 'profile.label.registerTime', defaultMessage: '注册时间' })}</span>
                          <span className="value">{userInfo.createTime}</span>
                        </DetailItem>
                      </InfoCard>
                    </ContentGrid>
                  )
                },
                {
                  key: 'account',
                  label: <span><WalletOutlined /> {intl.formatMessage({ id: 'profile.tab.account', defaultMessage: '账户资产' })}</span>,
                  children: (
                    <ContentGrid>
                      <InfoCard $token={token}>
                        <div className="header"><SafetyCertificateOutlined /> {intl.formatMessage({ id: 'profile.section.wallet', defaultMessage: 'USDT 钱包' })}</div>
                        <USDTBox $token={token}>
                          {userInfo.usdtAddress || intl.formatMessage({ id: 'profile.value.noAddress', defaultMessage: '暂无 TRC20 地址' })}
                        </USDTBox>
                        <DetailItem $token={token}>
                          <span className="label">{intl.formatMessage({ id: 'profile.label.availableBalance', defaultMessage: '可用余额' })}</span>
                          <span className="value" style={{ color: token.colorSuccess, fontWeight: 'bold' }}>
                            {(userInfo.usdtAmount || 0).toFixed(6)} USDT
                          </span>
                        </DetailItem>
                        <DetailItem $token={token}>
                          <span className="label">{intl.formatMessage({ id: 'profile.label.frozenAmount', defaultMessage: '冻结金额' })}</span>
                          <span className="value">
                            {(userInfo.usdtFrozenAmount || 0).toFixed(6)} USDT
                          </span>
                        </DetailItem>
                      </InfoCard>
                    </ContentGrid>
                  )
                }
              ]}
            />
          </ProfileCard>
        </MainContainer>
      </ContentWrapper>

      {/* 编辑弹窗 */}
      <Modal
        title={intl.formatMessage({ id: 'profile.modal.title', defaultMessage: '编辑个人资料' })}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>{intl.formatMessage({ id: 'profile.modal.cancel', defaultMessage: '取消' })}</Button>,
          <Button key="save" type="primary" onClick={handleSave} loading={loading}>{intl.formatMessage({ id: 'profile.modal.save', defaultMessage: '保存更改' })}</Button>
        ]}
        width={500}
        centered
      >
        <FormSection $token={token}>
          <h3>{intl.formatMessage({ id: 'profile.modal.avatarSection', defaultMessage: '头像设置' })}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <AntAvatar src={editedInfo.avatar} size={72} icon={<UserOutlined />} />
            <div style={{ flex: 1 }}>
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  // 阻止自动上传，我们会在保存时手动上传
                  if (file.size > 2 * 1024 * 1024) {
                    message.error(intl.formatMessage({ id: 'profile.message.avatarSizeLimit', defaultMessage: '图片大小不能超过 2MB' }));
                    return false;
                  }
                  // 保存文件对象用于上传
                  setAvatarFile(file);
                  // 生成预览图
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setEditedInfo(prev => ({ ...prev, avatar: reader.result }));
                  };
                  reader.readAsDataURL(file);
                  return false; // 阻止自动上传
                }}
                accept="image/*"
              >
                <Button icon={<CloudUploadOutlined />}>
                  {intl.formatMessage({ id: 'profile.modal.changeAvatar', defaultMessage: '更换头像' })}
                </Button>
              </Upload>
              <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
                {intl.formatMessage({ id: 'profile.modal.avatarHint', defaultMessage: '支持 JPG, PNG 格式，大小不超过 2MB' })}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection $token={token}>
          <h3>{intl.formatMessage({ id: 'profile.modal.basicSection', defaultMessage: '基本信息' })}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <FormLabel $token={token}>{intl.formatMessage({ id: 'profile.modal.nickname', defaultMessage: '昵称' })}</FormLabel>
              <Input
                value={editedInfo.nickname}
                onChange={(e) => setEditedInfo({ ...editedInfo, nickname: e.target.value })}
                placeholder={intl.formatMessage({ id: 'profile.modal.nicknamePlaceholder', defaultMessage: '请输入您的昵称' })}
              />
            </div>
            <div>
              <FormLabel $token={token}>{intl.formatMessage({ id: 'profile.modal.description', defaultMessage: '个人简介' })}</FormLabel>
              <Input.TextArea
                value={editedInfo.description}
                onChange={(e) => setEditedInfo({ ...editedInfo, description: e.target.value })}
                placeholder={intl.formatMessage({ id: 'profile.modal.descriptionPlaceholder', defaultMessage: '一句话介绍自己...' })}
                rows={3}
                showCount
                maxLength={100}
              />
            </div>
          </div>
        </FormSection>

        <FormSection $token={token}>
          <h3>{intl.formatMessage({ id: 'profile.modal.contactSection', defaultMessage: '联系方式' })}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <FormLabel $token={token}>{intl.formatMessage({ id: 'profile.modal.phone', defaultMessage: '手机号' })}</FormLabel>
              <Input
                value={editedInfo.phoneNumber}
                onChange={(e) => setEditedInfo({ ...editedInfo, phoneNumber: e.target.value })}
              />
            </div>
            <div>
              <FormLabel $token={token}>{intl.formatMessage({ id: 'profile.modal.email', defaultMessage: '邮箱' })}</FormLabel>
              <Input
                value={editedInfo.email}
                onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
              />
            </div>
          </div>
        </FormSection>
      </Modal>

      {/* 粉丝列表模态框 */}
      <Modal
        title={intl.formatMessage({ id: 'profile.modal.followers', defaultMessage: '粉丝列表' })}
        open={followersModalOpen}
        onCancel={() => setFollowersModalOpen(false)}
        footer={null}
        width={500}
        centered
      >
        <Spin spinning={loadingFollowers}>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {followersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: token.colorTextSecondary }}>
                {intl.formatMessage({ id: 'profile.modal.noFollowers', defaultMessage: '暂无粉丝' })}
              </div>
            ) : (
              followersList.map((follower) => (
                <div
                  key={follower.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <AntAvatar src={follower.avatar} size={40} icon={<UserOutlined />} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: token.colorText }}>
                        {follower.nickname || follower.username}
                      </div>
                      {follower.description && (
                        <div style={{ fontSize: '12px', color: token.colorTextSecondary, marginTop: '4px' }}>
                          {follower.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type={follower.isFollowing ? 'default' : 'primary'}
                    size="small"
                    onClick={() => handleFollowInModal(follower.userId, follower.isFollowing)}
                  >
                    {follower.isMutual
                      ? intl.formatMessage({ id: 'profile.modal.mutual', defaultMessage: '互相关注' })
                      : follower.isFollowing
                      ? intl.formatMessage({ id: 'profile.modal.following', defaultMessage: '已关注' })
                      : intl.formatMessage({ id: 'profile.modal.follow', defaultMessage: '关注' })}
                  </Button>
                </div>
              ))
            )}
          </div>
        </Spin>
      </Modal>

      {/* 关注列表模态框 */}
      <Modal
        title={intl.formatMessage({ id: 'profile.modal.followingList', defaultMessage: '关注列表' })}
        open={followingModalOpen}
        onCancel={() => setFollowingModalOpen(false)}
        footer={null}
        width={500}
        centered
      >
        <Spin spinning={loadingFollowers}>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {followingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: token.colorTextSecondary }}>
                {intl.formatMessage({ id: 'profile.modal.noFollowing', defaultMessage: '暂无关注' })}
              </div>
            ) : (
              followingList.map((following) => (
                <div
                  key={following.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <AntAvatar src={following.avatar} size={40} icon={<UserOutlined />} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: token.colorText }}>
                        {following.nickname || following.username}
                      </div>
                      {following.description && (
                        <div style={{ fontSize: '12px', color: token.colorTextSecondary, marginTop: '4px' }}>
                          {following.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => handleFollowInModal(following.userId, true)}
                  >
                    {intl.formatMessage({ id: 'profile.modal.unfollow', defaultMessage: '取消关注' })}
                  </Button>
                </div>
              ))
            )}
          </div>
        </Spin>
      </Modal>
    </PageBackground>
  );
};

// 主组件：提供 ConfigProvider，确保 useToken 能工作
const ProfilePage = () => {
  const customTheme = {
    token: {
      borderRadius: 8,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { borderRadius: 8, boxShadow: 'none' },
      Modal: { borderRadiusLG: 16 }
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <ProfileContent />
    </ConfigProvider>
  );
};

export default ProfilePage;