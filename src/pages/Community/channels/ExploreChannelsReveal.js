import React, { useRef } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RightOutlined, FireFilled, CrownOutlined } from '@ant-design/icons';
import { communityChannelPath } from 'utils/communityRoutes';

const getAccent = (channel) => channel.themeColor || '#6366f1';

const Gallery = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  padding-bottom: 64px;
`;

const GalleryHeader = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px 40px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 24px 28px;
  }
`;

const GalleryLabel = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const Grid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(24px, 4vw, 48px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 0 24px;
    gap: 40px;
  }
`;

const RevealRow = styled.article`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &.wide {
    grid-column: 1 / -1;
  }

  &.offset {
    margin-top: clamp(0px, 8vw, 72px);
  }

  @media (max-width: 900px) {
    &.offset {
      margin-top: 0;
    }
  }
`;

const ImageShell = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $tall }) => ($tall ? 'min(52vh, 520px)' : 'min(40vh, 420px)')};
  min-height: 280px;
  border-radius: 4px;
  overflow: hidden;
  background: #111;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    height: min(48vh, 400px);
    min-height: 240px;
  }
`;

const RevealMask = styled(motion.div)`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

const Cover = styled(motion.div)`
  position: absolute;
  inset: -8%;
  background-size: cover;
  background-position: center;
  will-change: transform;
`;

const Sweep = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent 0%,
    rgba(255, 255, 255, 0.22) 48%,
    transparent 100%
  );
`;

const Veil = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
`;

const FloatMeta = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  display: flex;
  gap: 8px;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const TextBlock = styled.div`
  padding: 0 4px;
`;

const IndexLine = styled(motion.div)`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  span {
    color: ${({ $accent }) => $accent};
  }
`;

const Title = styled(motion.h3)`
  margin: 0 0 10px;
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
`;

const Desc = styled(motion.p)`
  margin: 0 0 14px;
  font-size: 15px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const Enter = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $accent }) => $accent};
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const LoadingWrap = styled.div`
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const RevealCard = ({
  channel,
  index,
  total,
  wide,
  offset,
  onClick,
  fallbackDesc,
}) => {
  const ref = useRef(null);
  const accent = getAccent(channel);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 92%', 'start 38%'],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    ['inset(0 0 100% 0)', 'inset(0 0 8% 0)', 'inset(0 0 0% 0)'],
  );
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.18, 1.04]);
  const imgY = useTransform(scrollYProgress, [0, 1], ['6%', '0%']);
  const sweepX = useTransform(scrollYProgress, [0.2, 0.75], ['-120%', '120%']);
  const textY = useTransform(scrollYProgress, [0.35, 1], [28, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);
  const lineScale = useTransform(scrollYProgress, [0.4, 0.85], [0, 1]);

  const bgStyle = channel.coverUrl
    ? { backgroundImage: `url(${channel.coverUrl})` }
    : { background: `linear-gradient(145deg, ${accent}99 0%, #0a0a0a 55%)` };

  const rowClass = [wide && 'wide', offset && 'offset'].filter(Boolean).join(' ');

  return (
    <RevealRow ref={ref} className={rowClass} onClick={onClick}>
      <ImageShell $tall={wide}>
        <RevealMask style={{ clipPath }}>
          <Cover style={{ ...bgStyle, scale: imgScale, y: imgY }} />
          <Veil />
        </RevealMask>
        <Sweep style={{ x: sweepX }} />
        <FloatMeta>
          <MetaPill>
            <FireFilled style={{ color: '#ff6b6b', fontSize: 10 }} />
            {channel.postCount || 0}
          </MetaPill>
          {channel.isVipOnly && (
            <MetaPill style={{ color: '#ffd666' }}>
              <CrownOutlined />
              VIP
            </MetaPill>
          )}
        </FloatMeta>
      </ImageShell>

      <TextBlock>
        <IndexLine $accent={accent} style={{ opacity: textOpacity, y: textY }}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          {' / '}
          {String(total).padStart(2, '0')}
        </IndexLine>
        <motion.div
          style={{
            height: 2,
            maxWidth: 80,
            marginBottom: 14,
            background: accent,
            scaleX: lineScale,
            transformOrigin: 'left center',
          }}
        />
        <Title style={{ y: textY, opacity: textOpacity }}>{channel.name}</Title>
        <Desc style={{ y: textY, opacity: textOpacity }}>
          {channel.description || fallbackDesc}
        </Desc>
        <Enter $accent={accent} style={{ y: textY, opacity: textOpacity }}>
          <FormattedMessage id="home.community.exploreChannel" defaultMessage="进入频道" />
          <RightOutlined style={{ fontSize: 11 }} />
        </Enter>
      </TextBlock>
    </RevealRow>
  );
};

const ExploreChannelsReveal = ({ channels, loading }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const fallbackDesc = intl.formatMessage({
    id: 'home.community.channelFallback',
    defaultMessage: '加入频道，浏览与分享 AI 生图作品。',
  });

  const handleChannelClick = (channel) => {
    if (channel.channelKey === 'daily-challenge') {
      navigate('/community/challenge');
    } else {
      navigate(communityChannelPath(channel.channelKey));
    }
  };

  if (loading) {
    return (
      <LoadingWrap>
        <Spin size="large" />
        <FormattedMessage id="community.explore.loading" defaultMessage="Loading channels" />
      </LoadingWrap>
    );
  }

  return (
    <Gallery>
      <GalleryHeader>
        <GalleryLabel>
          <FormattedMessage
            id="community.explore.reveal.label"
            defaultMessage="Scroll-revealed gallery"
          />
        </GalleryLabel>
      </GalleryHeader>

      <Grid>
        {channels.map((channel, index) => {
          const wide = index % 3 === 0;
          const offset = index % 2 === 1;
          return (
            <RevealCard
              key={channel.id}
              channel={channel}
              index={index}
              total={channels.length}
              wide={wide}
              offset={offset}
              fallbackDesc={fallbackDesc}
              onClick={() => handleChannelClick(channel)}
            />
          );
        })}
      </Grid>
    </Gallery>
  );
};

export default ExploreChannelsReveal;
export { getAccent };
