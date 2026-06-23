import React, { useState } from 'react';
import { ClockCircleOutlined, TrophyFilled, CheckCircleFilled, SettingOutlined } from '@ant-design/icons';
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
} from './styled';
import {
  getStatusInfo,
  calculateTotalPrize,
  getChallengeCoverUrl,
  generateDefaultChallengeBackground,
  addTencentImageCompression,
} from './utils';

const ChallengeImage = ({ challenge }) => {
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
      src={imageSrc}
      alt={challenge.title}
      onError={handleImageError}
    />
  );
};

const ChallengeCardItem = ({ challenge, isActive, onClick, index = 0, canManage = false, onManageClick }) => {
  const intl = useIntl();
  const statusInfo = getStatusInfo(challenge, intl);
  const totalPrize = calculateTotalPrize(challenge.rewardsConfig);

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

export default ChallengeCardItem;
