import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, Typography, Tabs, Avatar, Statistic, Skeleton, Spin, Divider, Empty, message, Drawer, Input, List, Tag
} from 'antd';
import { 
  FireFilled, ClockCircleOutlined, TrophyFilled, UserOutlined, 
  PlusOutlined, HeartFilled,
  ShareAltOutlined, InfoCircleOutlined, ThunderboltFilled,
  LeftOutlined, PictureOutlined, ReadOutlined, UnorderedListOutlined, SearchOutlined, CheckCircleFilled
} from '@ant-design/icons';
import styled from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { FormattedMessage, useIntl } from 'react-intl';
import { listPosts, getChallengeById, getCurrentChallenge, listAllChallenges } from 'api/community';

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

// ------------------- Styled Components (Big Tech Design) -------------------

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f7fa'};
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding-top: 80px;
`;

const Container = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px 60px;

  @media (max-width: 768px) {
    padding: 0 16px 40px;
  }
`;

// Hero Section with blurred background
const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 24px;
  overflow: hidden;
  margin-top: 24px;
  margin-bottom: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  background: #000;

  @media (max-width: 768px) {
    height: 240px;
    border-radius: 16px;
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  ${props => props.src ? `
    background-image: url(${props.src});
    background-size: cover;
    background-position: center;
    opacity: 0.9;
    filter: blur(8px) brightness(0.8);
    transform: scale(1.05);
  ` : `
    background: linear-gradient(135deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #4facfe 75%, 
      #00f2fe 100%
    );
    background-size: 400% 400%;
    animation: gradientShift 20s ease infinite;
    opacity: 0.95;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }
  `}
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 100px;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.1);

  &.live {
    background: rgba(82, 196, 26, 0.9);
    border-color: transparent;
  }
  
  &.ended {
    background: rgba(0, 0, 0, 0.6);
  }
`;

const ChallengeTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;

  .item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 16px;
  }
`;

// Layout Grid
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  min-width: 0;
`;

const SideColumn = styled.div`
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1100px) {
    position: static;
  }
`;

// Cards
const DetailCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  
  .card-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const PrizeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};

  &:last-child {
    border-bottom: none;
  }

  .rank {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: ${props => props.theme.mode === 'dark' ? '#222' : '#f5f5f5'};
      color: #666;
    }
    
    &.gold .icon { background: #fff1b8; color: #faad14; }
    &.silver .icon { background: #e6e6e6; color: #8c8c8c; }
    &.bronze .icon { background: #fcece3; color: #d46b08; }
  }

  .value {
    font-weight: 700;
    font-size: 16px;
  }
`;

const MasonryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const ArtCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f0f0f0'};
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  break-inside: avoid;
  border: 1px solid rgba(255,255,255,0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    
    .overlay { opacity: 1; }
  }

  &::before {
    content: '';
    display: block;
    padding-top: 100%; // Default Aspect Ratio
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 16px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 500;
    font-size: 13px;
  }

  .stats {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    padding: 4px 8px;
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
    
    &::before { border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'}; }
  }

  .ant-tabs-tab {
    padding: 12px 0;
    margin: 0 32px 0 0;
    font-size: 16px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#666'};
    
    &:hover { color: ${props => props.theme.mode === 'dark' ? '#ccc' : '#333'}; }
    
    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
      font-weight: 600;
    }
  }
`;

// ------------------- Helper Logic -------------------
const parseRewardsConfig = (rewardsConfig) => {
  try {
    const config = JSON.parse(rewardsConfig);
    return {
      first: config['1st'] || config.first || 0,
      second: config['2nd'] || config.second || 0,
      third: config['3rd'] || config.third || 0,
    };
  } catch (e) { return { first: 0, second: 0, third: 0 }; }
};

// 解析标签数组：支持数组、JSON字符串、逗号分隔字符串
const parseTags = (tags) => {
  if (!tags) return [];
  
  // 如果已经是数组，直接返回
  if (Array.isArray(tags)) {
    return tags;
  }
  
  // 如果是字符串，尝试解析
  if (typeof tags === 'string') {
    try {
      // 尝试解析 JSON 字符串
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // 如果不是 JSON，尝试按逗号分割
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
  }
  
  return [];
};

const calculateTotalPrize = (config) => {
    const r = parseRewardsConfig(config);
    return r.first + r.second + r.third;
};

const getStatusInfo = (status, intl) => {
    switch(status) {
        case 0: return { label: intl.formatMessage({ id: 'challenge.status.upcoming', defaultMessage: 'Upcoming' }), color: '#1890ff', dot: '#1890ff' };
        case 1: return { label: intl.formatMessage({ id: 'challenge.status.live', defaultMessage: 'Live Now' }), color: '#52c41a', dot: '#52c41a' };
        case 2: return { label: intl.formatMessage({ id: 'challenge.status.voting', defaultMessage: 'Voting' }), color: '#722ed1', dot: '#722ed1' };
        case 3: return { label: intl.formatMessage({ id: 'challenge.status.ended', defaultMessage: 'Ended' }), color: '#888', dot: '#888' };
        default: return { label: intl.formatMessage({ id: 'challenge.status.unknown', defaultMessage: 'Unknown' }), color: '#888', dot: '#888' };
    }
};

const DrawerItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  background: ${props => props.active ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#e6f7ff') : 'transparent'};
  border: 1px solid ${props => props.active ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bae7ff') : 'transparent'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${props => !props.active && (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')};
    transform: translateY(-2px);
  }

  .thumb-container {
    width: 100px;
    height: 72px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    background: #333;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
  }

  &:hover .thumb-container img {
      transform: scale(1.1);
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .meta-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    
    .status-badge {
       display: flex;
       align-items: center;
       gap: 6px;
       font-size: 10px;
       font-weight: 700;
       text-transform: uppercase;
       padding: 2px 8px;
       border-radius: 100px;
       background: rgba(255,255,255,0.1);
       
       .dot {
           width: 6px;
           height: 6px;
           border-radius: 50%;
       }
    }
    
    .date {
        font-size: 11px;
        color: #888;
    }
  }

  .title {
    font-weight: 600;
    font-size: 14px;
    line-height: 1.4;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta-bottom {
     display: flex;
     align-items: center;
     gap: 12px;
     font-size: 11px;
     color: #888;
     
     .tag {
         display: flex;
         align-items: center;
         gap: 4px;
         background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
         padding: 2px 8px;
         border-radius: 4px;
     }
  }
`;

const ChallengeDetailPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { challengeId } = useParams();
  
  const [activeTab, setActiveTab] = useState('entries');
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  
  const [challenge, setChallenge] = useState(null);
  const [challengePosts, setChallengePosts] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Load list of challenges for the drawer
        listAllChallenges(50).then(setAllChallenges).catch(console.error);
        
        let data;
        if (challengeId) data = await getChallengeById(Number(challengeId));
        else data = await getCurrentChallenge();
        setChallenge(data);
      } catch(e) { 
        message.error(intl.formatMessage({ id: 'community.challenge.loadFailed', defaultMessage: 'Failed to load challenge data' })); 
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [challengeId]);

  // Load Posts when Challenge is ready
  useEffect(() => {
    if(challenge?.id) {
      setPostsLoading(true);
      listPosts({ challengeId: challenge.id, page: 1, pageSize: 50, sortBy: 'latest' })
        .then(data => setChallengePosts(data))
        .catch(console.error)
        .finally(() => setPostsLoading(false));
    }
  }, [challenge?.id]);

  const handleJoin = () => {
    if (!challenge) return;
    navigate('/create', { state: { challengeId: challenge.id, prompt: challenge.title } });
  };

  if (loading || !challenge) {
    return (
      <PageWrapper>
        <SimpleHeader />
        <Container>
          <Skeleton active paragraph={{rows: 10}} style={{marginTop: 40}} />
        </Container>
      </PageWrapper>
    );
  }

  const rewards = parseRewardsConfig(challenge.rewardsConfig);
  const totalPrize = rewards.first + rewards.second + rewards.third;
  const deadline = new Date(challenge.endTime).getTime();
  const isOngoing = challenge.status === 1;
  const isEnded = challenge.status === 3;
  const isVoting = challenge.status === 2;
  const now = Date.now();
  const timeLeft = Math.max(0, deadline - now);
  
  const filteredNav = allChallenges.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <PageWrapper>
      <SimpleHeader />
      
      <Container>
        {/* Navigation Breadcrumb-ish */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/community')} style={{ marginBottom: 0, marginLeft: -16 }}>
              <FormattedMessage id="common.backToCommunity" defaultMessage="Back to Community" />
            </Button>
            <Button type="default" icon={<UnorderedListOutlined />} onClick={() => setDrawerVisible(true)}>
              <FormattedMessage id="challenge.allChallenges" defaultMessage="All Challenges" />
            </Button>
        </div>

        {/* 1. Hero Header */}
        <HeroSection>
          <HeroBackground src={challenge.coverUrl || null} />
          <HeroContent>
            <div>
              <StatusBadge className={isOngoing ? 'live' : isEnded ? 'ended' : ''}>
                 {isOngoing && <FireFilled />} 
                 {isOngoing ? (
                    <FormattedMessage id="challenge.status.live" defaultMessage="Live Now" />
                 ) : isVoting ? (
                    <FormattedMessage id="challenge.status.voting" defaultMessage="Voting Phase" />
                 ) : (
                    <FormattedMessage id="challenge.status.ended" defaultMessage="Ended" />
                 )}
              </StatusBadge>
              <ChallengeTitle>{challenge.title}</ChallengeTitle>
              <MetaRow>
                <div className="item">
                  <ClockCircleOutlined /> 
                  {new Date(challenge.startTime).toLocaleDateString()} - {new Date(challenge.endTime).toLocaleDateString()}
                </div>
                {challenge.requiredModel && (
                  <div className="item">
                    <ThunderboltFilled /> {challenge.requiredModel}
                  </div>
                )}
                <div className="item">
                   <UserOutlined /> <FormattedMessage id="challenge.entriesCount" defaultMessage="{count} Entries" values={{count: challengePosts.length}} />
                </div>
              </MetaRow>
            </div>
          </HeroContent>
        </HeroSection>

        {/* 2. Main Content Grid */}
        <ContentGrid>
          {/* LEFT: Tabs & Grid */}
          <MainColumn>
            <StyledTabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                   key: 'entries',
                   label: <span><PictureOutlined /> <FormattedMessage id="challenge.tab.submissions" defaultMessage="Submissions" /></span>,
                   children: (
                     <>
                       {postsLoading ? (
                         <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                       ) : challengePosts.length > 0 ? (
                         <MasonryGrid>
                            {challengePosts.map(post => (
                                <ArtCard key={post.id} onClick={() => navigate(`/community/post/${post.id}`)}>
                                    <img src={post.coverUrl || post.mediaUrls[0]} loading="lazy" alt={post.title} />
                                    <div className="stats">
                                        <HeartFilled /> {post.likeCount}
                                    </div>
                                    <div className="overlay">
                                        <div className="user-info">
                                            <Avatar src={post.userAvatar} size={24} />
                                            <span>{post.userNickname}</span>
                                        </div>
                                    </div>
                                </ArtCard>
                            ))}
                         </MasonryGrid>
                       ) : (
                         <Empty description={<FormattedMessage id="challenge.noEntries" defaultMessage="No entries yet. Be the first!" />} />
                       )}
                     </>
                   )
                },
                {
                   key: 'details',
                   label: <span><ReadOutlined /> <FormattedMessage id="challenge.tab.rules" defaultMessage="Rules & Info" /></span>,
                   children: (
                     <DetailCard>
                        <Title level={4}><FormattedMessage id="common.description" defaultMessage="Description" /></Title>
                        <Paragraph style={{fontSize: 16, lineHeight: 1.8, color: 'inherit'}}>
                          {challenge.description}
                        </Paragraph>
                        
                        <Divider />
                        
                        <Title level={4}><FormattedMessage id="challenge.requirements" defaultMessage="Requirements" /></Title>
                        <ul style={{ lineHeight: 2, fontSize: 15 }}>
                           <li><FormattedMessage id="challenge.req.original" defaultMessage="Original creations only." /></li>
                           {challenge.requiredModel && <li><FormattedMessage id="challenge.req.model" defaultMessage="Must use model: {model}" values={{model: <strong>{challenge.requiredModel}</strong>}} /></li>}
                           {challenge.requiredTags && (() => {
                             const tags = parseTags(challenge.requiredTags);
                             return (
                               <li style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                 <span><FormattedMessage id="challenge.req.tags" defaultMessage="Must include tags:" /></span>
                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 0 }}>
                                   {tags.map((tag, index) => (
                                     <Tag 
                                       key={index} 
                                       color="processing" 
                                       style={{ 
                                         margin: 0,
                                         borderRadius: 4,
                                         fontSize: 13,
                                         padding: '2px 8px',
                                         lineHeight: '20px'
                                       }}
                                     >
                                       {tag}
                                     </Tag>
                                   ))}
                                 </div>
                               </li>
                             );
                           })()}
                           <li><FormattedMessage id="challenge.req.resolution" defaultMessage="Resolution must be at least 1024x1024." /></li>
                           <li><FormattedMessage id="challenge.req.nsfw" defaultMessage="No NSFW content." /></li>
                        </ul>
                     </DetailCard>
                   )
                }
              ]} 
            />
          </MainColumn>

          {/* RIGHT: Sidebar */}
          <SideColumn>
             {/* Action Card */}
             <DetailCard>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                   <div style={{ fontSize: 14, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                      <FormattedMessage id="challenge.timeRemaining" defaultMessage="Time Remaining" />
                   </div>
                   {isOngoing ? (
                      <Countdown value={deadline} format="D[d] H[h] m[m] s[s]" valueStyle={{ fontSize: 32, fontWeight: 700 }} />
                   ) : (
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                          <FormattedMessage id="challenge.closed" defaultMessage="Challenge Closed" />
                      </div>
                   )}
                </div>

                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  shape="round"
                  style={{ height: 50, fontSize: 16, fontWeight: 600 }}
                  icon={<PlusOutlined />}
                  onClick={handleJoin}
                  disabled={!isOngoing}
                >
                  {isOngoing ? (
                      <FormattedMessage id="challenge.submitEntry" defaultMessage="Submit Entry" />
                  ) : (
                      <FormattedMessage id="challenge.viewWinners" defaultMessage="View Winners" />
                  )}
                </Button>
                
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                       <InfoCircleOutlined /> <FormattedMessage id="challenge.readRulesTip" defaultMessage="Read the rules before submitting" />
                    </Text>
                </div>
             </DetailCard>

             {/* Prizes Card */}
             <DetailCard>
                <div className="card-title"><TrophyFilled style={{color:'#faad14'}} /> <FormattedMessage id="challenge.prizePool" defaultMessage="Prize Pool" /></div>
                <div style={{ marginBottom: 24, textAlign: 'center', background: 'rgba(250, 173, 20, 0.1)', padding: 16, borderRadius: 12, border: '1px solid rgba(250, 173, 20, 0.2)' }}>
                    <div style={{ fontSize: 12, color: '#d48806', textTransform: 'uppercase', fontWeight: 700 }}>
                        <FormattedMessage id="challenge.totalValue" defaultMessage="Total Value" />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#d46b08' }}>{totalPrize.toLocaleString()} <span style={{fontSize:14}}>PTS</span></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                   <PrizeItem className="gold">
                      <div className="rank">
                         <div className="icon"><TrophyFilled /></div>
                         <span><FormattedMessage id="challenge.rank.1st" defaultMessage="1st Place" /></span>
                      </div>
                      <div className="value">{rewards.first}</div>
                   </PrizeItem>
                   <PrizeItem className="silver">
                      <div className="rank">
                         <div className="icon">2</div>
                         <span><FormattedMessage id="challenge.rank.2nd" defaultMessage="2nd Place" /></span>
                      </div>
                      <div className="value">{rewards.second}</div>
                   </PrizeItem>
                   <PrizeItem className="bronze">
                      <div className="rank">
                         <div className="icon">3</div>
                         <span><FormattedMessage id="challenge.rank.3rd" defaultMessage="3rd Place" /></span>
                      </div>
                      <div className="value">{rewards.third}</div>
                   </PrizeItem>
                </div>
             </DetailCard>
             
             {/* Stats/Share */}
             <DetailCard>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                     <span style={{fontWeight:600}}><FormattedMessage id="challenge.share" defaultMessage="Share Challenge" /></span>
                     <Button icon={<ShareAltOutlined />} shape="circle" />
                 </div>
             </DetailCard>

          </SideColumn>
        </ContentGrid>
      </Container>
      
      {/* Navigation Drawer */}
      <Drawer
        title={<Input prefix={<SearchOutlined />} placeholder={intl.formatMessage({ id: 'common.search', defaultMessage: 'Search...' })} bordered={false} onChange={e => setSearchTerm(e.target.value)} style={{fontSize: 16, padding: '8px 0'}} />}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={420}
        styles={{
            header: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
            body: { padding: 16 }
        }}
      >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredNav.map(item => {
                  const statusInfo = getStatusInfo(item.status, intl);
                  const totalPrize = calculateTotalPrize(item.rewardsConfig);
                  
                  return (
                      <DrawerItem key={item.id} active={item.id === challenge.id} onClick={() => { navigate(`/community/challenge/${item.id}`); setDrawerVisible(false); }}>
                          <div className="thumb-container">
                              <img src={item.coverUrl} alt={item.title} />
                          </div>
                          
                          <div className="info">
                              <div className="meta-top">
                                  <div className="status-badge" style={{color: statusInfo.color, background: `${statusInfo.color}15`}}>
                                      <div className="dot" style={{background: statusInfo.dot}} />
                                      {statusInfo.label}
                                  </div>
                                  <div className="date">
                                     {new Date(item.endTime).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                  </div>
                              </div>
                              
                              <div className="title" title={item.title}>#{item.id} {item.title}</div>
                              
                              <div className="meta-bottom">
                                  {totalPrize > 0 && (
                                      <div className="tag">
                                          <TrophyFilled style={{color:'#faad14'}} /> {totalPrize.toLocaleString()}
                                      </div>
                                  )}
                                  {item.requiredModel && (
                                      <div className="tag">
                                          <ThunderboltFilled style={{color: '#1890ff'}} /> {item.requiredModel}
                                      </div>
                                  )}
                              </div>
                          </div>
                          
                          {item.id === challenge.id && (
                              <div style={{position:'absolute', right: 12, top: '50%', transform: 'translateY(-50%)'}}>
                                  <CheckCircleFilled style={{color: '#1890ff', fontSize: 18}} />
                              </div>
                          )}
                      </DrawerItem>
                  );
              })}
              
              {filteredNav.length === 0 && (
                  <Empty description={<FormattedMessage id="challenge.noChallenges" defaultMessage="No challenges found" />} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
          </div>
      </Drawer>
    </PageWrapper>
  );
};

export default ChallengeDetailPage;
