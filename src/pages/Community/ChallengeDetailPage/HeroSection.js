import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { FireFilled, ClockCircleOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { HeroSection as StyledHeroSection, HeroBackground, HeroContent, StatusBadge, ChallengeTitle, MetaRow } from './styled';
import { getChallengeCoverUrl, generateDefaultChallengeBackground } from './utils';

const HeroSection = ({ challenge, challengePosts, isNotStarted, isOngoing, isVoting, isEnded }) => {
  const [bgError, setBgError] = useState(false);
  const [bgSrc, setBgSrc] = useState(() => getChallengeCoverUrl(challenge));
  
  // 检测背景图加载失败
  useEffect(() => {
    const initialSrc = getChallengeCoverUrl(challenge);
    setBgSrc(initialSrc);
    setBgError(false);
    
    // 如果是外部URL，检测加载失败
    if (initialSrc && !initialSrc.startsWith('data:') && challenge?.coverUrl) {
      const img = new Image();
      img.onerror = () => {
        setBgError(true);
        setBgSrc(generateDefaultChallengeBackground(challenge.id, 800, 320));
      };
      img.onload = () => {
        // 图片加载成功，保持原URL
      };
      img.src = initialSrc;
    }
  }, [challenge?.id, challenge?.coverUrl]);
  
  return (
    <StyledHeroSection>
      <HeroBackground src={bgSrc} />
      <HeroContent>
        <div>
          <StatusBadge className={isOngoing ? 'live' : isEnded ? 'ended' : ''}>
            {isOngoing && <FireFilled />} 
            {isNotStarted ? (
              <FormattedMessage id="challenge.status.upcoming" defaultMessage="Upcoming" />
            ) : isOngoing ? (
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
            <div className="item">
              <UserOutlined /> <FormattedMessage id="challenge.entriesCount" defaultMessage="{count} Entries" values={{count: challengePosts.length}} />
            </div>
            <div className="item">
              <EyeOutlined /> <FormattedMessage 
                id="challenge.viewCount" 
                defaultMessage="{count} Views" 
                values={{count: (challenge.viewCount || 0).toLocaleString()}} 
              />
            </div>
          </MetaRow>
        </div>
      </HeroContent>
    </StyledHeroSection>
  );
};

export default HeroSection;

