import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { RightOutlined, FireFilled, CrownOutlined } from '@ant-design/icons';
import { communityChannelPath } from 'utils/communityRoutes';

const getAccent = (channel) => channel.themeColor || '#6366f1';

const Gallery = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;

const GalleryHeader = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px 48px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 24px 32px;
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

const ProgressRail = styled.nav`
  position: fixed;
  left: clamp(16px, 2vw, 32px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const RailDot = styled(motion.button)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid ${({ $active, $accent }) => ($active ? $accent : 'rgba(255,255,255,0.25)')};
  background: ${({ $active, $accent }) => ($active ? $accent : 'transparent')};
  padding: 0;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  box-shadow: ${({ $active, $accent }) => ($active ? `0 0 12px ${$accent}66` : 'none')};
`;

const RailCount = styled.div`
  margin-top: 8px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.35);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const Section = styled.section`
  position: relative;
  padding: 48px 0 80px;

  @media (max-width: 768px) {
    padding: 32px 0 56px;
  }
`;

const SectionInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 32px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 24px;
  }
`;

const IndexCol = styled(motion.div)`
  padding-top: 24px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.35);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  span {
    color: ${({ $accent }) => $accent};
  }

  @media (max-width: 900px) {
    padding-top: 0;
  }
`;

const ContentCol = styled.div`
  min-width: 0;
`;

const ImageFrame = styled(motion.div)`
  position: relative;
  width: 100%;
  height: min(72vh, 720px);
  min-height: 320px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #111;
  transform-origin: center center;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.05) 0%,
      rgba(0, 0, 0, 0.15) 50%,
      rgba(0, 0, 0, 0.55) 100%
    );
    pointer-events: none;
    z-index: 2;
  }

  @media (max-width: 768px) {
    height: 52vh;
    min-height: 260px;
    border-radius: 3px;
  }
`;

const CoverLayer = styled(motion.div)`
  position: absolute;
  inset: -6%;
  background-size: cover;
  background-position: center;
  will-change: transform;
`;

const MetaFloat = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
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
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const TextBlock = styled(motion.div)`
  padding: 36px 0 0;
  max-width: 720px;

  @media (max-width: 768px) {
    padding-top: 24px;
  }
`;

const Title = styled(motion.h2)`
  margin: 0 0 16px;
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.02;
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
`;

const AccentRule = styled(motion.div)`
  height: 2px;
  margin-bottom: 20px;
  background: ${({ $accent }) => $accent};
  transform-origin: left center;
  max-width: 120px;
`;

const Desc = styled(motion.p)`
  margin: 0 0 28px;
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.55);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const EnterLink = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  .circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.35s ease, border-color 0.35s ease, color 0.35s ease;
  }

  &:hover .circle {
    background: #f5f5f7;
    border-color: #f5f5f7;
    color: #000;
  }
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

const ChannelSlide = ({
  channel,
  index,
  total,
  isActive,
  onClick,
  fallbackDesc,
  sectionRef,
}) => {
  const localRef = useRef(null);
  const accent = getAccent(channel);

  const { scrollYProgress } = useScroll({
    target: localRef,
    offset: ['start end', 'end start'],
  });

  const frameScale = useTransform(scrollYProgress, [0, 0.35, 0.55, 1], [0.9, 1, 1, 0.94]);
  const coverY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const coverScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.02, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [48, 0, 0, -24]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.4]);
  const ruleScale = useTransform(scrollYProgress, [0.08, 0.35], [0, 1]);

  const smoothScale = useSpring(frameScale, { stiffness: 80, damping: 22 });

  const bgStyle = channel.coverUrl
    ? { backgroundImage: `url(${channel.coverUrl})` }
    : { background: `linear-gradient(145deg, ${accent}99 0%, #0a0a0a 60%)` };

  const setRefs = (el) => {
    localRef.current = el;
    if (typeof sectionRef === 'function') sectionRef(el);
  };

  return (
    <Section ref={setRefs} id={`channel-exo-${index}`}>
      <SectionInner>
        <IndexCol $accent={accent}>
          <motion.span
            animate={{ opacity: isActive ? 1 : 0.45 }}
            transition={{ duration: 0.4 }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {' — '}
            {String(total).padStart(2, '0')}
          </motion.span>
        </IndexCol>

        <ContentCol>
          <ImageFrame style={{ scale: smoothScale }} onClick={onClick}>
            <CoverLayer style={{ ...bgStyle, y: coverY, scale: coverScale }} />
            <MetaFloat>
              <MetaPill>
                <FireFilled style={{ color: '#ff6b6b', fontSize: 11 }} />
                {channel.postCount || 0}
              </MetaPill>
              {channel.isVipOnly && (
                <MetaPill style={{ color: '#ffd666' }}>
                  <CrownOutlined />
                  VIP
                </MetaPill>
              )}
            </MetaFloat>
          </ImageFrame>

          <TextBlock style={{ y: textY, opacity: textOpacity }}>
            <Title>{channel.name}</Title>
            <AccentRule $accent={accent} style={{ scaleX: ruleScale }} />
            <Desc>{channel.description || fallbackDesc}</Desc>
            <EnterLink type="button" onClick={onClick}>
              <FormattedMessage id="home.community.exploreChannel" defaultMessage="进入频道" />
              <span className="circle">
                <RightOutlined style={{ fontSize: 14 }} />
              </span>
            </EnterLink>
          </TextBlock>
        </ContentCol>
      </SectionInner>
    </Section>
  );
};

const ExploreChannelsExoApe = ({ channels, loading }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const sectionRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const scrollToSection = (index) => {
    const el = sectionRefs.current[index];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const updateActive = useCallback(() => {
    const mid = window.innerHeight * 0.42;
    let closest = 0;
    let minDist = Infinity;
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height * 0.35 - mid);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [updateActive, channels.length]);

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
      {channels.length > 1 && (
        <ProgressRail aria-label="Channel progress">
          {channels.map((ch, i) => (
            <RailDot
              key={ch.id}
              type="button"
              $active={i === activeIndex}
              $accent={getAccent(ch)}
              onClick={() => scrollToSection(i)}
              aria-label={`Channel ${i + 1}`}
              animate={{ scale: i === activeIndex ? 1.4 : 1 }}
            />
          ))}
          <RailCount>
            {String(activeIndex + 1).padStart(2, '0')}/{String(channels.length).padStart(2, '0')}
          </RailCount>
        </ProgressRail>
      )}

      <GalleryHeader>
        <GalleryLabel>
          <FormattedMessage
            id="community.explore.exoApe.works"
            defaultMessage="Selected channels — scroll to explore"
          />
        </GalleryLabel>
      </GalleryHeader>

      {channels.map((channel, index) => (
        <ChannelSlide
          key={channel.id}
          channel={channel}
          index={index}
          total={channels.length}
          isActive={index === activeIndex}
          fallbackDesc={fallbackDesc}
          onClick={() => handleChannelClick(channel)}
          sectionRef={(el) => {
            sectionRefs.current[index] = el;
          }}
        />
      ))}
    </Gallery>
  );
};

export default ExploreChannelsExoApe;
export { getAccent };
