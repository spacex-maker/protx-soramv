import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty, Input, Skeleton, Spin, message } from 'antd';
import {
  LeftOutlined,
  FireFilled,
  ReloadOutlined,
  SearchOutlined,
  TrophyFilled,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import SimpleHeader from 'components/headers/simple';
import { listAllChallenges, getMyRoles } from 'api/community';
import ChallengeManageModal from 'components/community/ChallengeManageModal';
import ChallengeCardItem from '../ChallengeDetailPage/ChallengeCardItem';
import { canManageDailyChallenge } from 'utils/communityRoles';
import {
  cleanChallengeData,
  isChallengeLive,
  sortChallengesByPhase,
  calculateTotalPrize,
} from '../ChallengeDetailPage/utils';
import {
  PageWrapper,
  Container,
  HubHero,
  HubStatsGrid,
  HubStatCard,
  HubToolbar,
  HubGrid,
  EmptyState,
} from '../ChallengeDetailPage/styled';

const ChallengeHubPage = ({ embedInWorkspace = false }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [canManage, setCanManage] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

  const detailBasePath = embedInWorkspace ? '/workspace/daily-challenge' : '/community/challenge';
  const backPath = embedInWorkspace ? '/workspace' : '/community';

  const loadChallenges = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await listAllChallenges(50);
      const cleaned = Array.isArray(data) ? data.map(cleanChallengeData).filter(Boolean) : [];
      setChallenges(cleaned);
      if (isRefresh) {
        message.success(intl.formatMessage({ id: 'common.refreshSuccess', defaultMessage: 'Refreshed successfully' }));
      }
    } catch {
      message.error(intl.formatMessage({ id: 'community.challenge.loadFailed', defaultMessage: 'Failed to load challenge data' }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChallenges();
    if (localStorage.getItem('token')) {
      getMyRoles()
        .then((roles) => setCanManage(canManageDailyChallenge(roles || [])))
        .catch(() => setCanManage(false));
    }
  }, []);

  const filteredChallenges = useMemo(() => {
    const filtered = challenges.filter((c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortChallengesByPhase(filtered);
  }, [challenges, searchTerm]);

  const stats = useMemo(() => {
    const total = challenges.length;
    const active = challenges.filter((c) => isChallengeLive(c)).length;
    const totalPrize = challenges.reduce((sum, c) => sum + calculateTotalPrize(c.rewardsConfig), 0);
    return { total, active, totalPrize };
  }, [challenges]);

  const handleCardClick = (challengeId) => {
    navigate(`${detailBasePath}/${challengeId}`);
  };

  const handleManageClick = (challenge) => {
    setEditingChallenge(challenge);
    setManageModalOpen(true);
  };

  const handleManageSuccess = (updated) => {
    const cleaned = cleanChallengeData(updated);
    if (cleaned) {
      setChallenges((prev) => prev.map((item) => (item.id === cleaned.id ? cleaned : item)));
    }
    setManageModalOpen(false);
    setEditingChallenge(null);
  };

  return (
    <PageWrapper style={embedInWorkspace ? { paddingTop: 0, background: 'transparent', minHeight: 'auto' } : undefined}>
      {!embedInWorkspace && <SimpleHeader />}

      <Container>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate(backPath)}
          style={{ marginLeft: -16, marginBottom: 8 }}
        >
          {embedInWorkspace ? (
            <FormattedMessage id="common.backToWorkspace" defaultMessage="Back to Workspace" />
          ) : (
            <FormattedMessage id="common.backToCommunity" defaultMessage="Back to Community" />
          )}
        </Button>

        <HubHero>
          <div className="hero-glow" aria-hidden />
          <div className="hero-glow-2" aria-hidden />
          <div className="hero-content">
            <div className="hero-icon-wrap">
              <TrophyFilled />
            </div>
            <div className="hero-text">
              <div className="hero-eyebrow">
                <FireFilled style={{ fontSize: 11 }} />
                <FormattedMessage id="challenge.hub.eyebrow" defaultMessage="Creative Arena" />
              </div>
              <h1>
                <FormattedMessage id="challenge.hub.title" defaultMessage="Daily Challenges" />
              </h1>
              <p>
                <FormattedMessage
                  id="challenge.hub.subtitle"
                  defaultMessage="Browse recent challenges and tap a card to view details"
                />
              </p>
            </div>
          </div>
        </HubHero>

        <HubStatsGrid>
          <HubStatCard
            $accent="linear-gradient(90deg, #3b82f6, #60a5fa)"
            $iconBg="rgba(59, 130, 246, 0.12)"
            $iconColor="#3b82f6"
          >
            <div className="stat-icon">
              <TrophyFilled />
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">
              <FormattedMessage id="challenge.stats.total" defaultMessage="Total" />
            </div>
          </HubStatCard>
          <HubStatCard
            $accent="linear-gradient(90deg, #52c41a, #95de64)"
            $iconBg="rgba(82, 196, 26, 0.12)"
            $iconColor="#52c41a"
          >
            <div className="stat-icon">
              <FireFilled />
            </div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">
              <FormattedMessage id="challenge.stats.active" defaultMessage="Active" />
            </div>
          </HubStatCard>
          <HubStatCard
            $accent="linear-gradient(90deg, #faad14, #ffd666)"
            $iconBg="rgba(250, 173, 20, 0.12)"
            $iconColor="#faad14"
          >
            <div className="stat-icon">
              <TrophyFilled />
            </div>
            <div className="stat-value">{stats.totalPrize.toLocaleString()}</div>
            <div className="stat-label">
              <FormattedMessage id="challenge.stats.totalPrize" defaultMessage="Total Prize" />
            </div>
          </HubStatCard>
        </HubStatsGrid>

        <HubToolbar>
          <Input
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            placeholder={intl.formatMessage({ id: 'common.search', defaultMessage: 'Search' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
          />
          <Button icon={<ReloadOutlined />} loading={refreshing} onClick={() => loadChallenges(true)}>
            <FormattedMessage id="common.refresh" defaultMessage="Refresh" />
          </Button>
        </HubToolbar>

        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
        ) : filteredChallenges.length > 0 ? (
          <HubGrid>
            {filteredChallenges.map((item, index) => (
              <ChallengeCardItem
                key={item.id}
                challenge={item}
                isActive={false}
                index={index}
                variant="hub"
                canManage={canManage && !embedInWorkspace}
                onManageClick={handleManageClick}
                onClick={() => handleCardClick(item.id)}
              />
            ))}
          </HubGrid>
        ) : (
          <EmptyState style={{ marginTop: 40 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                searchTerm ? (
                  <FormattedMessage
                    id="challenge.noChallenges.desc"
                    defaultMessage="Try adjusting your search terms"
                  />
                ) : (
                  <FormattedMessage id="challenge.noChallenges" defaultMessage="No challenges found" />
                )
              }
            />
          </EmptyState>
        )}

        {refreshing && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Spin />
          </div>
        )}
      </Container>

      <ChallengeManageModal
        open={manageModalOpen}
        challenge={editingChallenge}
        onCancel={() => {
          setManageModalOpen(false);
          setEditingChallenge(null);
        }}
        onSuccess={handleManageSuccess}
      />
    </PageWrapper>
  );
};

export default ChallengeHubPage;
