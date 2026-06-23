import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Input, Empty, Spin } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  SearchOutlined,
  TrophyFilled,
  FireFilled,
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  DrawerContainer,
  DrawerHeader,
  DrawerSearchWrapper,
  DrawerStats,
  DrawerContent,
  EmptyState
} from './styled';
import ChallengeCardItem from './ChallengeCardItem';
import { isChallengeLive, sortChallengesByPhase, calculateTotalPrize } from './utils';

const NavigationDrawer = ({
  visible,
  onClose,
  challenges,
  currentChallengeId,
  searchTerm,
  onSearchChange,
  onRefresh,
  loading,
  detailBasePath = '/community/challenge',
}) => {
  const navigate = useNavigate();
  const intl = useIntl();

  const filteredChallenges = useMemo(() => {
    const filtered = challenges.filter(c =>
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

  const handleChallengeClick = (challengeId) => {
    navigate(`${detailBasePath}/${challengeId}`);
    onClose();
  };

  return (
    <Drawer
      title={null}
      placement="right"
      onClose={onClose}
      open={visible}
      width={480}
      closable={false}
      styles={{
        body: { padding: 0 },
        mask: { backdropFilter: 'blur(4px)' }
      }}
    >
      <DrawerContainer>
        <DrawerHeader>
          <div className="header-top">
            <h2>
              <TrophyFilled style={{ color: '#faad14', marginRight: 8 }} />
              <FormattedMessage id="challenge.allChallenges" defaultMessage="All Challenges" />
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="close-btn"
                onClick={onRefresh}
                title={intl.formatMessage({ id: 'common.refresh', defaultMessage: 'Refresh' })}
              >
                <ReloadOutlined />
              </button>
              <button className="close-btn" onClick={onClose}>
                <CloseOutlined />
              </button>
            </div>
          </div>

          <DrawerSearchWrapper>
            <Input
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              placeholder={intl.formatMessage({ id: 'common.search', defaultMessage: 'Search challenges...' })}
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              allowClear
              size="large"
              className="search-input"
            />
          </DrawerSearchWrapper>

          <DrawerStats>
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">
                <FormattedMessage id="challenge.stats.total" defaultMessage="Total" />
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value active">
                <FireFilled style={{ fontSize: 14, marginRight: 4 }} />
                {stats.active}
              </div>
              <div className="stat-label">
                <FormattedMessage id="challenge.stats.active" defaultMessage="Active" />
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value prize">
                <TrophyFilled style={{ fontSize: 14, marginRight: 4 }} />
                {stats.totalPrize.toLocaleString()}
              </div>
              <div className="stat-label">
                <FormattedMessage id="challenge.stats.totalPrize" defaultMessage="Total Prize" />
              </div>
            </div>
          </DrawerStats>
        </DrawerHeader>

        <DrawerContent>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#999' }}>
                <FormattedMessage id="common.loading" defaultMessage="Loading..." />
              </div>
            </div>
          ) : filteredChallenges.length > 0 ? (
            filteredChallenges.map((item, index) => (
              <ChallengeCardItem
                key={item.id}
                challenge={item}
                isActive={item.id === currentChallengeId}
                index={index}
                onClick={() => handleChallengeClick(item.id)}
              />
            ))
          ) : (
            <EmptyState>
              <div className="empty-icon">
                <SearchOutlined />
              </div>
              <div className="empty-title">
                <FormattedMessage id="challenge.noChallenges" defaultMessage="No challenges found" />
              </div>
              <div className="empty-description">
                <FormattedMessage
                  id="challenge.noChallenges.desc"
                  defaultMessage="Try adjusting your search terms"
                />
              </div>
            </EmptyState>
          )}
        </DrawerContent>
      </DrawerContainer>
    </Drawer>
  );
};

export default NavigationDrawer;
