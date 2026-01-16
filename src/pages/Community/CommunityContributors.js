import React, { useEffect, useState } from 'react';
import { Avatar, Typography, Skeleton, Button, Empty, Tooltip } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes, css } from 'styled-components';
import { 
  TrophyFilled, 
  HeartFilled, 
  FileImageFilled, 
  UserAddOutlined, 
  ArrowRightOutlined,
  CheckCircleFilled
} from '@ant-design/icons';

const { Title, Text } = Typography;

// --- 动画与关键帧 ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// --- 布局组件 ---

const SectionContainer = styled.div`
  margin-top: 80px;
  padding: 0 24px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  animation: ${fadeInUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);

  @media (max-width: 768px) {
    margin-top: 48px;
    padding: 0 16px;
  }
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 56px;
  position: relative;
`;

const SectionTitle = styled(Title)`
  &.ant-typography {
    font-family: 'Google Sans', 'Roboto', sans-serif; // Google 字体栈
    font-size: 42px;
    font-weight: 700;
    color: ${props => props.theme.mode === 'dark' ? '#e8eaed' : '#202124'};
    margin-bottom: 12px;
    letter-spacing: -0.5px;
    
    @media (max-width: 768px) {
      font-size: 32px;
    }
  }
`;

const SectionSubtitle = styled(Text)`
  &.ant-typography {
    font-size: 18px;
    color: ${props => props.theme.mode === 'dark' ? '#9aa0a6' : '#5f6368'};
    max-width: 600px;
    display: inline-block;
    line-height: 1.6;
  }
`;

// 使用 CSS Grid 实现更现代的响应式布局
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
`;

// --- 卡片组件 ---

const CardActionArea = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 10;
`;

const CardWrapper = styled.div`
  position: relative;
  background: ${props => props.theme.mode === 'dark' ? '#292a2d' : '#ffffff'};
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); // 弹性过渡
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#3c4043' : '#dadce0'};
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: default;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.08); // 更加柔和的阴影
    border-color: transparent;

    ${CardActionArea} {
      opacity: 1;
      transform: translateY(0);
    }

    .banner-image {
      transform: scale(1.05);
    }
  }
`;

const Banner = styled.div`
  height: 100px;
  overflow: hidden;
  position: relative;
  background: ${props => props.$bgColor || '#e8f0fe'};
  
  // 抽象的 Google 风格背景图案
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%);
    opacity: 0.8;
  }

  .banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
`;

const ContentWrapper = styled.div`
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const AvatarContainer = styled.div`
  margin-top: -50px; // 负边距让头像重叠在 Banner 上
  padding: 4px;
  background: ${props => props.theme.mode === 'dark' ? '#292a2d' : '#ffffff'};
  border-radius: 50%;
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const UserInfo = styled.div`
  text-align: center;
  margin-top: 12px;
  margin-bottom: 20px;
  width: 100%;
`;

const Nickname = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#e8eaed' : '#202124'};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  .verified-icon {
    color: #1a73e8; // Google Blue
    font-size: 16px;
  }
`;

const RoleTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: ${props => props.$isMod ? 'rgba(234, 67, 53, 0.1)' : 'rgba(26, 115, 232, 0.1)'};
  color: ${props => props.$isMod ? '#d93025' : '#1a73e8'};
  margin-top: 4px;
  
  svg {
    margin-right: 4px;
    font-size: 12px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#3c4043' : '#f1f3f4'}; // Surface variant
  border-radius: 16px;
  padding: 12px;
  gap: 1px; // Gap for divider effect
  margin-top: auto; // Push to bottom
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &:first-child::after {
    content: '';
    position: absolute;
    right: 0;
    top: 10%;
    height: 80%;
    width: 1px;
    background: ${props => props.theme.mode === 'dark' ? '#5f6368' : '#dadce0'};
  }
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Google Sans', sans-serif;
  color: ${props => props.theme.mode === 'dark' ? '#e8eaed' : '#202124'};
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#9aa0a6' : '#5f6368'};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

const ActionButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
  border-radius: 100px;
  height: 40px;
  font-weight: 600;
  border: none;
  background: ${props => props.theme.mode === 'dark' ? '#8ab4f8' : '#e8f0fe'};
  color: ${props => props.theme.mode === 'dark' ? '#202124' : '#1967d2'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.mode === 'dark' ? '#aecbfa' : '#d2e3fc'} !important;
    transform: scale(1.02);
  }
`;

// --- Skeleton Loader ---
const StyledSkeletonCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#292a2d' : '#ffffff'};
  border-radius: 24px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#3c4043' : '#dadce0'};
  height: 320px;
  position: relative;
  overflow: hidden;

  // 骨架屏的高光动画
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0)
    );
    transform: skewX(-20deg);
    animation: ${shimmer} 2s infinite linear;
  }
`;

// 辅助函数：生成柔和的随机背景色
const getPastelColor = (id) => {
  const colors = [
    '#fce8e6', // Red tint
    '#e8f0fe', // Blue tint
    '#e6f4ea', // Green tint
    '#fef7e0', // Yellow tint
    '#f3e8fd', // Purple tint
    '#feefe3'  // Orange tint
  ];
  return colors[id % colors.length];
};

const mockContributors = [
  { id: 1, nickname: 'Alex Creator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', postCount: 128, likeCount: 5230, roleName: 'Admin', verified: true },
  { id: 2, nickname: 'Sarah Design', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', postCount: 89, likeCount: 3420, roleName: null, verified: false },
  { id: 3, nickname: 'Pixel Master', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pixel', postCount: 156, likeCount: 6890, roleName: 'Pro', verified: true },
  { id: 4, nickname: 'Code Ninja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', postCount: 201, likeCount: 12450, roleName: 'Dev', verified: true },
  { id: 5, nickname: 'Art Vibes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Art', postCount: 45, likeCount: 1200, roleName: null, verified: false },
];

const CommunityContributors = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setContributors(mockContributors);
      setLoading(false);
    };
    fetchContributors();
  }, []);

  return (
    <SectionContainer>
      <HeaderWrapper>
        <SectionTitle level={2}>
          <FormattedMessage id="community.contributors.title" defaultMessage="Top Contributors" />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage 
            id="community.contributors.subtitle" 
            defaultMessage="Meet the brilliant minds shaping our community with their creativity and passion." 
          />
        </SectionSubtitle>
      </HeaderWrapper>

      <GridContainer>
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
             <StyledSkeletonCard key={index}>
                <div style={{ height: '100px', background: 'rgba(0,0,0,0.05)' }} />
                <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Skeleton.Avatar active size={80} style={{ marginTop: -40 }} />
                  <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 20 }} />
                </div>
             </StyledSkeletonCard>
          ))
        ) : contributors.length > 0 ? (
          contributors.map((user) => (
            <CardWrapper key={user.id}>
              {/* 悬停时出现的快捷操作按钮 */}
              <CardActionArea>
                <Tooltip title="Follow">
                  <Button 
                    shape="circle" 
                    icon={<UserAddOutlined />} 
                    style={{ background: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  />
                </Tooltip>
              </CardActionArea>

              <Banner $bgColor={getPastelColor(user.id)}>
                {/* 可以在这里添加装饰性的背景图片或 Pattern */}
              </Banner>

              <ContentWrapper>
                <AvatarContainer>
                  <Avatar 
                    size={80} 
                    src={user.avatar} 
                    alt={user.nickname}
                    style={{ backgroundColor: '#fff' }}
                  >
                    {user.nickname?.[0]}
                  </Avatar>
                </AvatarContainer>

                <UserInfo>
                  <Nickname>
                    {user.nickname}
                    {user.verified && (
                      <Tooltip title="Verified Contributor">
                        <CheckCircleFilled className="verified-icon" />
                      </Tooltip>
                    )}
                  </Nickname>
                  
                  {user.roleName && (
                    <RoleTag $isMod={user.roleName === 'Admin'}>
                      <TrophyFilled />
                      {user.roleName}
                    </RoleTag>
                  )}
                </UserInfo>

                <StatsGrid>
                  <StatItem>
                    <StatValue>{user.postCount}</StatValue>
                    <StatLabel>
                      <FileImageFilled style={{ fontSize: '10px' }} />
                      <FormattedMessage id="posts" defaultMessage="Posts" />
                    </StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>
                      {user.likeCount > 1000 ? (user.likeCount / 1000).toFixed(1) + 'k' : user.likeCount}
                    </StatValue>
                    <StatLabel>
                      <HeartFilled style={{ fontSize: '10px', color: '#ff5252' }} />
                      <FormattedMessage id="likes" defaultMessage="Likes" />
                    </StatLabel>
                  </StatItem>
                </StatsGrid>

                <ActionButton icon={<ArrowRightOutlined />}>
                   <FormattedMessage id="view.profile" defaultMessage="View Profile" />
                </ActionButton>
              </ContentWrapper>
            </CardWrapper>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
            <Empty description="No contributors found" />
          </div>
        )}
      </GridContainer>
    </SectionContainer>
  );
};

export default CommunityContributors;