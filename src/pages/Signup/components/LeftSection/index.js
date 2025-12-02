import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { 
  LeftSection as StyledLeftSection, 
  WelcomeText, 
  Description,
  AuroraContainer,
  AuroraBeam,
  Stars,
  Star,
  ContentWrapper,
  FeatureTags,
  FeatureTag,
  DecorativeLine
} from './styles';

// AI 图标
const AIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

// 视频图标
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

// 闪电图标 (快速)
const FastIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

// 星星图标 (创意)
const CreativeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// 生成随机星星
const generateStars = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`
    });
  }
  return stars;
};

const starData = generateStars(30);

export const LeftSection = () => {
  const intl = useIntl();

  return (
    <StyledLeftSection>
      {/* 极光效果背景 */}
      <AuroraContainer>
        <AuroraBeam variant={1} />
        <AuroraBeam variant={2} />
        <AuroraBeam variant={3} />
        <AuroraBeam variant={4} />
        
        {/* 星星粒子 */}
        <Stars>
          {starData.map(star => (
            <Star
              key={star.id}
              top={star.top}
              left={star.left}
              size={star.size}
              duration={star.duration}
              delay={star.delay}
            />
          ))}
        </Stars>
      </AuroraContainer>

      {/* 主内容区 */}
      <ContentWrapper>
        <WelcomeText>
          <h1>
            <FormattedMessage id="signup.welcome" />
          </h1>
        </WelcomeText>

        <DecorativeLine />

        <Description>
          <FormattedMessage id="signup.description" />
        </Description>

        {/* 特性标签 */}
        <FeatureTags>
          <FeatureTag>
            <AIIcon />
            <span>{intl.formatMessage({ id: 'signup.feature.ai', defaultMessage: 'AI 驱动' })}</span>
          </FeatureTag>
          <FeatureTag>
            <VideoIcon />
            <span>{intl.formatMessage({ id: 'signup.feature.video', defaultMessage: '视频创作' })}</span>
          </FeatureTag>
          <FeatureTag>
            <FastIcon />
            <span>{intl.formatMessage({ id: 'signup.feature.fast', defaultMessage: '极速生成' })}</span>
          </FeatureTag>
          <FeatureTag>
            <CreativeIcon />
            <span>{intl.formatMessage({ id: 'signup.feature.creative', defaultMessage: '无限创意' })}</span>
          </FeatureTag>
        </FeatureTags>
      </ContentWrapper>

    </StyledLeftSection>
  );
};
