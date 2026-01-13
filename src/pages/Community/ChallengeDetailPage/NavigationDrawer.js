import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Input, Empty, Badge } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { 
  SearchOutlined, 
  TrophyFilled, 
  ThunderboltFilled, 
  CheckCircleFilled,
  FireFilled,
  ClockCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { 
  DrawerContainer,
  DrawerHeader,
  DrawerSearchWrapper,
  DrawerStats,
  DrawerContent,
  ChallengeCard,
  ChallengeThumb,
  ChallengeInfo,
  ChallengeMeta,
  DrawerChallengeTitle,
  ChallengeTags,
  ChallengeTag,
  ActiveIndicator,
  EmptyState
} from './styled';
import { getStatusInfo, calculateTotalPrize, getChallengeCoverUrl, generateDefaultChallengeBackground } from './utils';

// 挑战图片组件，处理加载失败
const ChallengeImage = ({ challenge }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => getChallengeCoverUrl(challenge));
  
  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(generateDefaultChallengeBackground(challenge.id, 120, 80));
    }
  };
  
  return (
    <img 
      src={imageSrc} 
      alt={challenge.title}
      onError={handleImageError}
    />
  );
};

const NavigationDrawer = ({ visible, onClose, challenges, currentChallengeId, searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const intl = useIntl();

  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [challenges, searchTerm]);

  const stats = useMemo(() => {
    const total = challenges.length;
    const active = challenges.filter(c => {
      const statusInfo = getStatusInfo(c.status, intl);
      return statusInfo.label === intl.formatMessage({ id: 'challenge.status.live', defaultMessage: 'Live Now' });
    }).length;
    const totalPrize = challenges.reduce((sum, c) => sum + calculateTotalPrize(c.rewardsConfig), 0);
    return { total, active, totalPrize };
  }, [challenges, intl]);

  const handleChallengeClick = (challengeId) => {
    navigate(`/community/challenge/${challengeId}`);
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
            <button className="close-btn" onClick={onClose}>
              <CloseOutlined />
            </button>
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
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((item, index) => {
              const statusInfo = getStatusInfo(item.status, intl);
              const totalPrize = calculateTotalPrize(item.rewardsConfig);
              const isActive = item.id === currentChallengeId;
              
              return (
                <ChallengeCard
                  key={item.id}
                  active={isActive}
                  onClick={() => handleChallengeClick(item.id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ChallengeThumb>
                    <ChallengeImage challenge={item} />
                    {isActive && <ActiveIndicator />}
                    <div className="thumb-overlay">
                      <div className="status-badge" style={{ 
                        color: statusInfo.color, 
                        background: `${statusInfo.color}20`,
                        borderColor: statusInfo.color
                      }}>
                        <div className="dot" style={{ background: statusInfo.dot }} />
                        {statusInfo.label}
                      </div>
                    </div>
                  </ChallengeThumb>
                  
                  <ChallengeInfo>
                    <ChallengeMeta>
                      <div className="meta-left">
                        <span className="challenge-id">#{item.id}</span>
                        <ClockCircleOutlined style={{ fontSize: 12, margin: '0 4px', opacity: 0.6 }} />
                        <span className="date">
                          {new Date(item.endTime).toLocaleDateString(undefined, {
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </ChallengeMeta>
                    
                    <DrawerChallengeTitle title={item.title}>
                      {item.title}
                    </DrawerChallengeTitle>
                    
                    <ChallengeTags>
                      {totalPrize > 0 && (
                        <ChallengeTag className="prize">
                          <TrophyFilled />
                          <span>{totalPrize.toLocaleString()} PTS</span>
                        </ChallengeTag>
                      )}
                      {item.requiredModel && (
                        <ChallengeTag className="model" title={item.requiredModel}>
                          <ThunderboltFilled />
                          <span>{item.requiredModel}</span>
                        </ChallengeTag>
                      )}
                    </ChallengeTags>
                  </ChallengeInfo>
                  
                  {isActive && (
                    <div className="active-mark">
                      <CheckCircleFilled />
                    </div>
                  )}
                </ChallengeCard>
              );
            })
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

