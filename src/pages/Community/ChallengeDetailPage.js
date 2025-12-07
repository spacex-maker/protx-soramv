import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Typography, Tabs, Avatar, Statistic, Progress, Tag, message, Skeleton, Spin } from 'antd';
import { 
  FireFilled, 
  ClockCircleOutlined, 
  TrophyFilled, 
  UserOutlined, 
  PlusOutlined,
  CheckCircleFilled,
  HeartFilled
} from '@ant-design/icons';
import styled, { keyframes, css } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { FormattedMessage, useIntl } from 'react-intl';
import { listPosts, getChallengeById, getCurrentChallenge } from 'api/community';

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

// ------------------- Styles -------------------

const PageLayout = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f7fa'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  padding-top: 60px;
`;

// 动态背景动画
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const HeroSection = styled.div`
  position: relative;
  padding: 80px 20px 100px;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  color: #fff;
  text-align: center;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f7fa'}, transparent);
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;

  .challenge-tag {
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.4);
    color: #fff;
    padding: 4px 12px;
    border-radius: 100px;
    font-weight: 600;
    margin-bottom: 16px;
    display: inline-block;
    backdrop-filter: blur(4px);
  }

  h1 {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 16px;
    color: #fff;
    text-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .desc {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 32px;
    line-height: 1.6;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  flex-wrap: wrap;

  .stat-item {
    background: rgba(0,0,0,0.2);
    backdrop-filter: blur(10px);
    padding: 16px 32px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    min-width: 160px;

    .ant-statistic-title {
      color: rgba(255,255,255,0.7);
      margin-bottom: 4px;
    }
    .ant-statistic-content {
      color: #fff;
      font-weight: 700;
      font-size: 24px;
    }
  }
`;

const MainContainer = styled.div`
  max-width: 1200px;
  margin: -60px auto 0;
  padding: 0 20px 60px;
  position: relative;
  z-index: 2;
`;

const RulesCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#eee'};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
`;

const ActionButton = styled(Button)`
  height: 56px;
  padding: 0 40px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 28px;
  box-shadow: 0 10px 20px rgba(24, 144, 255, 0.3);
  background: #1890ff;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(24, 144, 255, 0.4);
    background: #40a9ff;
  }
`;

// 领奖台样式
const PodiumContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
  margin: 40px 0 60px;
  height: 300px;
`;

const PodiumItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 140px;
  position: relative;

  // 1st Place
  ${props => props.rank === 1 && css`
    order: 2;
    z-index: 2;
    .avatar-wrapper {
      border: 4px solid #FFD700;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
    }
    .step {
      height: 160px;
      background: linear-gradient(to bottom, #FFD700, #FDB931);
    }
    .crown {
      position: absolute;
      top: -30px;
      font-size: 32px;
      color: #FFD700;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
  `}

  // 2nd Place
  ${props => props.rank === 2 && css`
    order: 1;
    .avatar-wrapper {
      border: 4px solid #C0C0C0;
    }
    .step {
      height: 120px;
      background: linear-gradient(to bottom, #E0E0E0, #B0B0B0);
    }
  `}

  // 3rd Place
  ${props => props.rank === 3 && css`
    order: 3;
    .avatar-wrapper {
      border: 4px solid #CD7F32;
    }
    .step {
      height: 90px;
      background: linear-gradient(to bottom, #CD7F32, #A0522D);
    }
  `}

  .avatar-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 12px;
    position: relative;
    img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  }

  .step {
    width: 100%;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: center;
    padding-top: 12px;
    color: #fff;
    font-weight: 800;
    font-size: 24px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .info {
    text-align: center;
    margin-top: 8px;
    .name { font-weight: 600; font-size: 16px; }
    .score { font-size: 12px; opacity: 0.7; }
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const GalleryItem = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  transition: transform 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
  }

  .cover {
    aspect-ratio: 1;
    width: 100%;
    object-fit: cover;
  }
  
  .meta {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

// ------------------- Helper Functions -------------------

// 解析奖励配置
const parseRewardsConfig = (rewardsConfig) => {
  if (!rewardsConfig) return { first: 0, second: 0, third: 0, participation: 0 };
  try {
    const config = JSON.parse(rewardsConfig);
    return {
      first: config['1st'] || config.first || 0,
      second: config['2nd'] || config.second || 0,
      third: config['3rd'] || config.third || 0,
      participation: config.participation || 0,
    };
  } catch (e) {
    return { first: 0, second: 0, third: 0, participation: 0 };
  }
};

// 计算总奖励池
const calculatePrizePool = (rewardsConfig) => {
  const rewards = parseRewardsConfig(rewardsConfig);
  return rewards.first + rewards.second + rewards.third;
};

// ------------------- Component -------------------

const ChallengeDetailPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const [activeTab, setActiveTab] = useState('entries');
  const [loading, setLoading] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [challengePosts, setChallengePosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchChallenge();
  }, [challengeId]);

  useEffect(() => {
    if (challenge?.id) {
      fetchChallengePosts();
    }
  }, [challenge?.id, page]);

  const fetchChallenge = async () => {
    setChallengeLoading(true);
    try {
      let challengeData;
      if (challengeId) {
        challengeData = await getChallengeById(Number(challengeId));
      } else {
        challengeData = await getCurrentChallenge();
      }
      setChallenge(challengeData);
    } catch (error) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '加载挑战失败' }));
    } finally {
      setChallengeLoading(false);
    }
  };

  const fetchChallengePosts = async () => {
    if (!challenge?.id) return;
    
    setLoading(true);
    try {
      // 根据挑战ID获取参赛作品
      const data = await listPosts({
        challengeId: challenge.id,
        page,
        pageSize: 20,
        sortBy: 'latest',
      });
      
      if (page === 1) {
        setChallengePosts(data);
      } else {
        setChallengePosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 20);
    } catch (error) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!challenge) return;
    
    // 解析 requiredTags
    let prompt = '';
    try {
      if (challenge.requiredTags) {
        const tags = JSON.parse(challenge.requiredTags);
        prompt = Array.isArray(tags) ? tags.join(', ') : '';
      }
    } catch (e) {
      // 忽略解析错误
    }
    
    // 跳转到创作页，并带上 Challenge ID 和预设参数
    navigate('/create', { 
      state: { 
        challengeId: challenge.id,
        prompt: prompt || challenge.title,
        model: challenge.requiredModel || 'stable-diffusion-xl',
        referenceImage: challenge.referenceImageUrl,
      } 
    });
  };

  const handlePostClick = (post) => {
    navigate(`/community/post/${post.id}`);
  };

  if (challengeLoading) {
    return (
      <PageLayout>
        <SimpleHeader />
        <div style={{ padding: '100px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  if (!challenge) {
    return (
      <PageLayout>
        <SimpleHeader />
        <div style={{ padding: '100px', textAlign: 'center' }}>
          <Text type="secondary">
            <FormattedMessage id="community.challenge.notFound" defaultMessage="挑战不存在" />
          </Text>
        </div>
      </PageLayout>
    );
  }

  const rewards = parseRewardsConfig(challenge.rewardsConfig);
  const prizePool = calculatePrizePool(challenge.rewardsConfig);
  const deadline = new Date(challenge.endTime).getTime();
  const participants = challengePosts.length; // 简化处理，实际应该从后端获取

  return (
    <PageLayout>
      <SimpleHeader />
      
      {/* 1. 沉浸式 Hero 区域 */}
      <HeroSection style={{
        backgroundImage: challenge.coverUrl ? `url(${challenge.coverUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <HeroContent>
          <div className="challenge-tag">
            <FireFilled style={{ marginRight: 6 }} /> 
            <FormattedMessage id="community.challenge.daily" defaultMessage="每日挑战" /> #{challenge.id}
          </div>
          <Title level={1} style={{ color: '#fff', margin: 0 }}>
            {challenge.title}
          </Title>
          <Paragraph className="desc" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {challenge.description}
          </Paragraph>

          <StatsContainer>
            <div className="stat-item">
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <ClockCircleOutlined /> <FormattedMessage id="community.challenge.timeRemaining" defaultMessage="剩余时间" />
                </div>
                <Countdown 
                  value={deadline} 
                  format="D天 H时 m分 s秒"
                  valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 24 }}
                />
              </div>
            </div>
            <div className="stat-item">
              <Statistic 
                title={<><TrophyFilled /> <FormattedMessage id="community.challenge.prizePool" defaultMessage="奖励池" /></>} 
                value={prizePool} 
                suffix={<FormattedMessage id="community.challenge.tokens" defaultMessage="积分" />}
                valueStyle={{ color: '#FFD700' }}
              />
            </div>
            <div className="stat-item">
              <Statistic 
                title={<><UserOutlined /> <FormattedMessage id="community.challenge.participants" defaultMessage="参赛者" /></>} 
                value={participants} 
                valueStyle={{ color: '#fff' }}
              />
            </div>
          </StatsContainer>
        </HeroContent>
      </HeroSection>

      <MainContainer>
        {/* 2. 规则与行动卡片 */}
        <RulesCard>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ marginTop: 0 }}>
              <FormattedMessage id="community.challenge.rules" defaultMessage="🎯 挑战规则" />
            </Title>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {challenge.requiredModel && (
                <Tag icon={<CheckCircleFilled />} color="success">
                  <FormattedMessage id="community.challenge.requiredModel" defaultMessage="模型" />: {challenge.requiredModel}
                </Tag>
              )}
              {challenge.requiredTags && (() => {
                try {
                  const tags = JSON.parse(challenge.requiredTags);
                  if (Array.isArray(tags)) {
                    return tags.map((tag, idx) => (
                      <Tag key={idx} icon={<CheckCircleFilled />} color="success">{tag}</Tag>
                    ));
                  }
                } catch (e) {}
                return null;
              })()}
            </div>
            {challenge.referenceImageUrl && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                <FormattedMessage id="community.challenge.hasReference" defaultMessage="提供参考图片" />
              </div>
            )}
          </div>
          <ActionButton 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />} 
            onClick={handleJoin}
            disabled={challenge.status !== 1}
          >
            <FormattedMessage id="community.challenge.join" defaultMessage="参与挑战" />
          </ActionButton>
        </RulesCard>

        {/* 3. 内容区 Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          size="large"
          centered
          items={[
            {
              key: 'entries',
              label: <span><FireFilled /> Latest Entries</span>,
              children: (
                <>
                  {loading && challengePosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                  ) : (
                    <GalleryGrid>
                      {challengePosts.map((post) => (
                        <GalleryItem key={post.id} onClick={() => handlePostClick(post)}>
                          <img 
                            className="cover"
                            src={post.coverUrl || post.mediaUrls[0]} 
                            alt={post.title || 'Challenge Entry'} 
                          />
                          <div className="meta">
                            <div style={{display:'flex', alignItems:'center', gap: 8}}>
                              <Avatar 
                                size="small" 
                                src={post.userAvatar}
                                icon={<UserOutlined />} 
                              />
                              <Text strong style={{fontSize: 12}}>
                                {post.userNickname || 'Anonymous'}
                              </Text>
                            </div>
                            <div style={{fontSize: 12, color: '#666'}}>
                              <HeartFilled style={{color: '#ff4d4f', marginRight: 4}} /> 
                              {post.likeCount || 0}
                            </div>
                          </div>
                        </GalleryItem>
                      ))}
                    </GalleryGrid>
                  )}
                  {hasMore && !loading && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Button onClick={() => setPage(prev => prev + 1)}>
                        <FormattedMessage id="common.loadMore" defaultMessage="加载更多" />
                      </Button>
                    </div>
                  )}
                  {challengePosts.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                      <FormattedMessage id="community.noEntries" defaultMessage="暂无参赛作品" />
                    </div>
                  )}
                </>
              )
            },
            {
              key: 'leaderboard',
              label: <span><TrophyFilled /> <FormattedMessage id="community.challenge.leaderboard" defaultMessage="排行榜" /></span>,
              children: (
                <div>
                  {/* 领奖台组件 - 显示前3名 */}
                  {challengePosts.length > 0 ? (
                    <>
                      <PodiumContainer>
                        {challengePosts.slice(0, 3).map((post, index) => (
                          <PodiumItem key={post.id} rank={index + 1}>
                            {index === 0 && <div className="crown">👑</div>}
                            <div className="avatar-wrapper">
                              <img 
                                src={post.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.userId} 
                                alt={post.userNickname} 
                              />
                            </div>
                            <div className="step">{index + 1}</div>
                            <div className="info">
                              <div className="name">{post.userNickname || 'Anonymous'}</div>
                              <div className="score">{post.challengeScore || 0} pts</div>
                            </div>
                          </PodiumItem>
                        ))}
                      </PodiumContainer>
                      
                      {/* 4名及以后列表 */}
                      {challengePosts.length > 3 && (
                        <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 20 }}>
                          <div style={{ textAlign: 'center', color: '#999' }}>
                            <FormattedMessage id="community.challenge.moreEntries" defaultMessage="更多参赛作品..." />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                      <FormattedMessage id="community.challenge.noEntries" defaultMessage="暂无参赛作品" />
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </MainContainer>
    </PageLayout>
  );
};

export default ChallengeDetailPage;