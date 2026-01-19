import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Skeleton, message } from 'antd';
import { LeftOutlined, UnorderedListOutlined, PictureOutlined, ReadOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import SimpleHeader from 'components/headers/simple';
import { listPosts, getChallengeById, getCurrentChallenge, listAllChallenges } from 'api/community';
import SubmitChallengeModal from '../SubmitChallengeModal';
import HeroSection from './HeroSection';
import SubmissionGrid from './SubmissionGrid';
import RulesTab from './RulesTab';
import ActionCard from './ActionCard';
import PrizeCard from './PrizeCard';
import ShareCard from './ShareCard';
import NavigationDrawer from './NavigationDrawer';
import { PageWrapper, Container, ContentGrid, MainColumn, SideColumn, DetailCard, StyledTabs } from './styled';
import { cleanChallengeData, cleanPostData } from './utils';

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
  const [challengesLoading, setChallengesLoading] = useState(false);
  
  // 提交作品模态框状态
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  
  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Load list of challenges for the drawer
        listAllChallenges(50)
          .then(challenges => {
            const cleanedChallenges = Array.isArray(challenges) 
              ? challenges.map(cleanChallengeData) 
              : [];
            setAllChallenges(cleanedChallenges);
          })
          .catch(console.error);
        
        let data;
        if (challengeId) data = await getChallengeById(Number(challengeId));
        else data = await getCurrentChallenge();
        
        setChallenge(cleanChallengeData(data));
      } catch(e) { 
        message.error(intl.formatMessage({ id: 'community.challenge.loadFailed', defaultMessage: 'Failed to load challenge data' })); 
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [challengeId, intl]);

  // Load Posts when Challenge is ready
  useEffect(() => {
    if(challenge?.id) {
      setPostsLoading(true);
      listPosts({ challengeId: challenge.id, page: 1, pageSize: 50, sortBy: 'latest' })
        .then(data => {
          const posts = Array.isArray(data) ? data : [];
          const cleanedPosts = posts.map(cleanPostData);
          setChallengePosts(cleanedPosts);
        })
        .catch(console.error)
        .finally(() => setPostsLoading(false));
    }
  }, [challenge?.id]);

  const handleJoin = () => {
    if (!challenge) return;
    setSubmitModalVisible(true);
  };

  const handleSubmitSuccess = () => {
    // 提交成功后，重新加载帖子列表
    if (challenge?.id) {
      setPostsLoading(true);
      listPosts({ challengeId: challenge.id, page: 1, pageSize: 50, sortBy: 'latest' })
        .then(data => {
          const posts = Array.isArray(data) ? data : [];
          const cleanedPosts = posts.map(cleanPostData);
          setChallengePosts(cleanedPosts);
        })
        .catch(console.error)
        .finally(() => setPostsLoading(false));
    }
  };

  const handleRefreshChallenges = async () => {
    setChallengesLoading(true);
    try {
      const challenges = await listAllChallenges(50);
      const cleanedChallenges = Array.isArray(challenges) 
        ? challenges.map(cleanChallengeData) 
        : [];
      setAllChallenges(cleanedChallenges);
      message.success(intl.formatMessage({ id: 'common.refreshSuccess', defaultMessage: 'Refreshed successfully' }));
    } catch (error) {
      message.error(intl.formatMessage({ id: 'common.refreshFailed', defaultMessage: 'Refresh failed' }));
    } finally {
      setChallengesLoading(false);
    }
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

  const deadline = new Date(challenge.endTime).getTime();
  const startTime = new Date(challenge.startTime).getTime();
  const votingEndTime = challenge.votingEndTime ? new Date(challenge.votingEndTime).getTime() : deadline;
  const now = Date.now();
  
  // 状态判断：优先使用时间判断，如果时间符合就不判断status字段
  // 0=未开始, 1=进行中, 2=评审中, 3=已结束
  const isNotStarted = now < startTime;
  const isOngoing = now >= startTime && now < deadline;
  const isVoting = now >= deadline && now < votingEndTime;
  const isEnded = now >= votingEndTime;

  return (
    <PageWrapper>
      <SimpleHeader />
      
      <Container>
        {/* Navigation Breadcrumb-ish */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={() => navigate('/community')} 
            style={{ marginBottom: 0, marginLeft: -16 }}
          >
            <FormattedMessage id="common.backToCommunity" defaultMessage="Back to Community" />
          </Button>
          <Button 
            type="default" 
            icon={<UnorderedListOutlined />} 
            onClick={() => setDrawerVisible(true)}
          >
            <FormattedMessage id="challenge.allChallenges" defaultMessage="All Challenges" />
          </Button>
        </div>

        {/* 1. Hero Header */}
        <HeroSection 
          challenge={challenge}
          challengePosts={challengePosts}
          isNotStarted={isNotStarted}
          isOngoing={isOngoing}
          isVoting={isVoting}
          isEnded={isEnded}
        />

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
                  label: (
                    <span>
                      <PictureOutlined /> <FormattedMessage id="challenge.tab.submissions" defaultMessage="Submissions" />
                    </span>
                  ),
                  children: <SubmissionGrid posts={challengePosts} loading={postsLoading} />
                },
                {
                  key: 'details',
                  label: (
                    <span>
                      <ReadOutlined /> <FormattedMessage id="challenge.tab.rules" defaultMessage="Rules & Info" />
                    </span>
                  ),
                  children: <RulesTab challenge={challenge} />
                }
              ]} 
            />
          </MainColumn>

          {/* RIGHT: Sidebar */}
          <SideColumn>
            {/* Action Card */}
            <ActionCard
              isNotStarted={isNotStarted}
              isOngoing={isOngoing}
              startTime={startTime}
              deadline={deadline}
              onJoin={handleJoin}
            />

            {/* Prizes Card */}
            <PrizeCard rewardsConfig={challenge.rewardsConfig} />
            
            {/* Share Card */}
            <ShareCard challenge={challenge} />
          </SideColumn>
        </ContentGrid>
      </Container>
      
      {/* Navigation Drawer */}
      <NavigationDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        challenges={allChallenges}
        currentChallengeId={challenge.id}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefreshChallenges}
        loading={challengesLoading}
      />

      {/* 提交作品模态框 */}
      <SubmitChallengeModal
        open={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        onSuccess={handleSubmitSuccess}
        challenge={challenge}
      />
    </PageWrapper>
  );
};

export default ChallengeDetailPage;

