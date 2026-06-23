import React, { useState } from 'react';
import {
  ClockCircleOutlined,
  TrophyFilled,
  CheckCircleFilled,
  SettingOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useIntl } from 'react-intl';
import {
  ChallengeCard,
  ChallengeThumb,
  ChallengeInfo,
  ChallengeMeta,
  DrawerChallengeTitle,
  ChallengeTags,
  ChallengeTag,
  ActiveIndicator,
  CardSettingsButton,
  HubChallengeCard,
  HubCardCover,
  HubCardBody,
} from './styled';
import {
  getStatusInfo,
  calculateTotalPrize,
  getChallengeCoverUrl,
  generateDefaultChallengeBackground,
  addTencentImageCompression,
} from './utils';

const ChallengeImage = ({ challenge, className }) => {
  const [imageError, setImageError] = useState(false);
  const coverUrl = getChallengeCoverUrl(challenge);
  const [imageSrc, setImageSrc] = useState(() => {
    if (coverUrl.startsWith('data:image/svg')) {
      return coverUrl;
    }
    return addTencentImageCompression(coverUrl, { quality: 5 });
  });

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(generateDefaultChallengeBackground(challenge.id, 120, 80));
    }
  };

  return (
    <img
      className={className}
      src={imageSrc}
      alt={challenge.title}
      onError={handleImageError}
    />
  );
};

const HubCardLayout = ({
  challenge,
  isActive,
  onClick,
  index,
  canManage,
  onManageClick,
  intl,
  statusInfo,
  totalPrize,
}) => {
  const handleManageClick = (event) => {
    event.stopPropagation();
    onManageClick?.(challenge);
  };

  const endDate = new Date(challenge.endTime).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <HubChallengeCard
      className={statusInfo.phase === 'live' ? 'live' : undefined}
      onClick={onClick}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <HubCardCover className="hub-card-cover">
        <ChallengeImage challenge={challenge} />
        <div className="cover-gradient" aria-hidden />
        <div className="cover-top">
          <div
            className="status-badge"
            style={{
              color: statusInfo.color,
              background: `${statusInfo.color}22`,
              borderColor: `${statusInfo.color}55`,
            }}
          >
            <div className="dot" style={{ background: statusInfo.dot }} />
            {statusInfo.label}
          </div>
          <span className="challenge-id">#{challenge.id}</span>
        </div>
        <div className="cover-bottom">
          <h3 className="hub-card-title">{challenge.title}</h3>
          <div className="prize-row">
            {totalPrize > 0 ? (
              <span className="prize-pill">
                <TrophyFilled />
                {totalPrize.toLocaleString()} PTS
              </span>
            ) : (
              <span />
            )}
            <span className="cover-cta">
              {intl.formatMessage({ id: 'challenge.hub.viewDetail', defaultMessage: '查看详情' })}
              <ArrowRightOutlined style={{ marginLeft: 4, fontSize: 11 }} />
            </span>
          </div>
        </div>
      </HubCardCover>

      <HubCardBody>
        <div className="date-row">
          <ClockCircleOutlined style={{ fontSize: 13, opacity: 0.7 }} />
          <span>{endDate}</span>
        </div>
        <span className="phase-tag">{statusInfo.label}</span>
      </HubCardBody>

      {isActive && (
        <div className="active-mark" style={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1890ff',
          borderRadius: '50%',
          color: '#fff',
          fontSize: 14,
          boxShadow: '0 2px 10px rgba(24,144,255,0.45)',
          zIndex: 3,
        }}>
          <CheckCircleFilled />
        </div>
      )}

      {canManage && onManageClick && (
        <Tooltip title={intl.formatMessage({ id: 'challenge.manage.settings', defaultMessage: 'Manage challenge' })}>
          <CardSettingsButton type="button" aria-label="manage challenge" onClick={handleManageClick}>
            <SettingOutlined />
          </CardSettingsButton>
        </Tooltip>
      )}
    </HubChallengeCard>
  );
};

const DrawerCardLayout = ({
  challenge,
  isActive,
  onClick,
  index,
  canManage,
  onManageClick,
  intl,
  statusInfo,
  totalPrize,
}) => {
  const handleManageClick = (event) => {
    event.stopPropagation();
    onManageClick?.(challenge);
  };

  return (
    <ChallengeCard
      active={isActive}
      onClick={onClick}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <ChallengeThumb>
        <ChallengeImage challenge={challenge} />
        {isActive && <ActiveIndicator />}
        <div className="thumb-overlay">
          <div
            className="status-badge"
            style={{
              color: statusInfo.color,
              background: `${statusInfo.color}20`,
              borderColor: statusInfo.color,
            }}
          >
            <div className="dot" style={{ background: statusInfo.dot }} />
            {statusInfo.label}
          </div>
        </div>
      </ChallengeThumb>

      <ChallengeInfo>
        <ChallengeMeta>
          <div className="meta-left">
            <span className="challenge-id">#{challenge.id}</span>
            <ClockCircleOutlined style={{ fontSize: 12, margin: '0 4px', opacity: 0.6 }} />
            <span className="date">
              {new Date(challenge.endTime).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </ChallengeMeta>

        <DrawerChallengeTitle title={challenge.title}>
          {challenge.title}
        </DrawerChallengeTitle>

        <ChallengeTags>
          {totalPrize > 0 && (
            <ChallengeTag className="prize">
              <TrophyFilled />
              <span>{totalPrize.toLocaleString()} PTS</span>
            </ChallengeTag>
          )}
        </ChallengeTags>
      </ChallengeInfo>

      {isActive && (
        <div className="active-mark">
          <CheckCircleFilled />
        </div>
      )}

      {canManage && onManageClick && (
        <Tooltip title={intl.formatMessage({ id: 'challenge.manage.settings', defaultMessage: 'Manage challenge' })}>
          <CardSettingsButton type="button" aria-label="manage challenge" onClick={handleManageClick}>
            <SettingOutlined />
          </CardSettingsButton>
        </Tooltip>
      )}
    </ChallengeCard>
  );
};

const ChallengeCardItem = ({
  challenge,
  isActive,
  onClick,
  index = 0,
  canManage = false,
  onManageClick,
  variant = 'drawer',
}) => {
  const intl = useIntl();
  const statusInfo = getStatusInfo(challenge, intl);
  const totalPrize = calculateTotalPrize(challenge.rewardsConfig);

  const sharedProps = {
    challenge,
    isActive,
    onClick,
    index,
    canManage,
    onManageClick,
    intl,
    statusInfo,
    totalPrize,
  };

  if (variant === 'hub') {
    return <HubCardLayout {...sharedProps} />;
  }

  return <DrawerCardLayout {...sharedProps} />;
};

export default ChallengeCardItem;
