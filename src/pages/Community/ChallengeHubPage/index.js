import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty, Input, Skeleton, message } from 'antd';
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
  getChallengePhase,
} from '../ChallengeDetailPage/utils';
import {
  PageWrapper,
  Container,
  HubTopBar,
  HubTitleBlock,
  HubMetricRow,
  HubMetric,
  HubToolbar,
  HubFilterRow,
  HubFilterChip,
  HubSectionLabel,
  HubFeaturedGrid,
  HubGrid,
  EmptyState,
} from '../ChallengeDetailPage/styled';

const FILTERS = [
  { key: 'live', id: 'challenge.hub.filter.live', defaultMessage: '进行中' },
  { key: 'all', id: 'challenge.hub.filter.all', defaultMessage: '全部' },
  { key: 'ended', id: 'challenge.hub.filter.ended', defaultMessage: '已结束' },
];

const ChallengeHubPage = ({ embedInWorkspace = false }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('live');
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

  const stats = useMemo(() => {
    const total = challenges.length;
    const active = challenges.filter((c) => isChallengeLive(c)).length;
    const totalPrize = challenges.reduce((sum, c) => sum + calculateTotalPrize(c.rewardsConfig), 0);
    return { total, active, totalPrize };
  }, [challenges]);

  const filteredChallenges = useMemo(() => {
    let list = challenges.filter((c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filter === 'live') {
      list = list.filter((c) => {
        const phase = getChallengePhase(c);
        return phase === 'live' || phase === 'upcoming' || phase === 'voting';
      });
    } else if (filter === 'ended') {
      list = list.filter((c) => getChallengePhase(c) === 'ended');
    }
    return sortChallengesByPhase(list);
  }, [challenges, searchTerm, filter]);

  const featured = useMemo(
    () => filteredChallenges.filter((c) => isChallengeLive(c)).slice(0, 2),
    [filteredChallenges]
  );
  const featuredIds = useMemo(() => new Set(featured.map((c) => c.id)), [featured]);
  const gridItems = useMemo(
    () => filteredChallenges.filter((c) => !featuredIds.has(c.id)),
    [filteredChallenges, featuredIds]
  );

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
          style={{ marginLeft: -16, marginBottom: 4 }}
        >
          {embedInWorkspace ? (
            <FormattedMessage id="common.backToWorkspace" defaultMessage="Back to Workspace" />
          ) : (
            <FormattedMessage id="common.backToCommunity" defaultMessage="Back to Community" />
          )}
        </Button>

        <HubTopBar>
          <HubTitleBlock>
            <p className="eyebrow">
              <FireFilled />
              <FormattedMessage id="challenge.hub.eyebrow" defaultMessage="Creative Arena" />
            </p>
            <h1>
              <FormattedMessage id="challenge.hub.title" defaultMessage="Daily Challenges" />
            </h1>
            <p className="subtitle">
              <FormattedMessage
                id="challenge.hub.subtitle"
                defaultMessage="Browse recent challenges and tap a card to view details"
              />
            </p>
            <HubMetricRow>
              <HubMetric $tone="blue">
                <TrophyFilled />
                <strong>{stats.total}</strong>
                <span><FormattedMessage id="challenge.stats.total" defaultMessage="Total" /></span>
              </HubMetric>
              <HubMetric $tone="green">
                <FireFilled />
                <strong>{stats.active}</strong>
                <span><FormattedMessage id="challenge.stats.active" defaultMessage="Active" /></span>
              </HubMetric>
              <HubMetric $tone="gold">
                <TrophyFilled />
                <strong>{stats.totalPrize.toLocaleString()}</strong>
                <span><FormattedMessage id="challenge.stats.totalPrize" defaultMessage="Total Prize" /></span>
              </HubMetric>
            </HubMetricRow>
          </HubTitleBlock>

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
        </HubTopBar>

        <HubFilterRow>
          {FILTERS.map((item) => (
            <HubFilterChip
              key={item.key}
              type="button"
              $active={filter === item.key}
              onClick={() => setFilter(item.key)}
            >
              <FormattedMessage id={item.id} defaultMessage={item.defaultMessage} />
            </HubFilterChip>
          ))}
        </HubFilterRow>

        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 16 }} />
        ) : filteredChallenges.length > 0 ? (
          <>
            {featured.length > 0 && (
              <>
                <HubSectionLabel>
                  <FormattedMessage id="challenge.hub.featured" defaultMessage="进行中的挑战" />
                </HubSectionLabel>
                <HubFeaturedGrid>
                  {featured.map((item, index) => (
                    <ChallengeCardItem
                      key={item.id}
                      challenge={item}
                      isActive={false}
                      index={index}
                      variant="hub"
                      featured
                      canManage={canManage && !embedInWorkspace}
                      onManageClick={handleManageClick}
                      onClick={() => handleCardClick(item.id)}
                    />
                  ))}
                </HubFeaturedGrid>
              </>
            )}

            {gridItems.length > 0 && (
              <>
                <HubSectionLabel>
                  <FormattedMessage
                    id={featured.length > 0 ? 'challenge.hub.more' : 'challenge.hub.list'}
                    defaultMessage={featured.length > 0 ? '更多挑战' : '挑战列表'}
                  />
                </HubSectionLabel>
                <HubGrid>
                  {gridItems.map((item, index) => (
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
              </>
            )}
          </>
        ) : (
          <EmptyState style={{ marginTop: 40 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                searchTerm || filter !== 'all' ? (
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
