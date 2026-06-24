import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { RightOutlined, FireFilled, CrownOutlined } from '@ant-design/icons';
import { communityChannelPath } from 'utils/communityRoutes';

const HEADER_OFFSET = 72;

const getAccent = (channel) => channel.themeColor || '#6366f1';

const Scroller = styled.div`
  position: relative;
`;

const ProgressNav = styled.nav`
  position: fixed;
  right: clamp(12px, 2vw, 28px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    right: 10px;
    gap: 10px;
  }
`;

const NavDot = styled(motion.button)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid ${({ $active, $accent }) => ($active ? $accent : 'rgba(255,255,255,0.28)')};
  background: ${({ $active, $accent }) => ($active ? $accent : 'transparent')};
  padding: 0;
  cursor: pointer;
  box-shadow: ${({ $active, $accent }) => ($active ? `0 0 14px ${$accent}55` : 'none')};
`;

const NavCount = styled.div`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.35);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const Section = styled.section`
  position: relative;
  min-height: calc(100vh - ${HEADER_OFFSET}px);
  scroll-snap-align: start;
  scroll-snap-stop: always;
  overflow: hidden;
  background: #000;
`;

const BgLayer = styled(motion.div)`
  position: absolute;
  inset: -6%;
  background-size: cover;
  background-position: center;
  will-change: transform;
`;

const Veil = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.12) 0%,
    rgba(0, 0, 0, 0.25) 45%,
    rgba(0, 0, 0, 0.92) 100%
  );
  pointer-events: none;
`;

const Glow = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: radial-gradient(
    ellipse 70% 55% at 30% 70%,
    ${({ $accent }) => `${$accent}28`} 0%,
    transparent 60%
  );
`;

const Stage = styled.div`
  position: relative;
  z-index: 10;
  min-height: calc(100vh - ${HEADER_OFFSET}px);
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px clamp(24px, 5vw, 64px) 56px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const IndexLine = styled(motion.div)`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  span {
    color: ${({ $accent }) => $accent};
  }
`;

const Title = styled(motion.h2)`
  margin: 0 0 16px;
  font-size: clamp(44px, 8vw, 88px);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 0.95;
  color: #f5f5f7;
  max-width: 800px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
`;

const Desc = styled(motion.p)`
  margin: 0 0 24px;
  max-width: 520px;
  font-size: clamp(17px, 2vw, 20px);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.65);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const MetaRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
`;

const Cta = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #000;
  background: #f5f5f7;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
`;

const LoadingSection = styled.div`
  min-height: 60vh;
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

const spring = { type: 'spring', stiffness: 90, damping: 22 };

const contentShow = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const ChannelSection = ({
  channel,
  index,
  total,
  isActive,
  sectionRef,
  onClick,
  fallbackDesc,
}) => {
  const localRef = useRef(null);
  const accent = getAccent(channel);

  const { scrollYProgress } = useScroll({
    target: localRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.02, 1.1]);
  const activeBrightness = useSpring(isActive ? 1 : 0.7, spring);
  const glowOpacity = useSpring(isActive ? 0.5 : 0.12, spring);
  const bgFilter = useTransform(activeBrightness, (b) => `brightness(${b})`);

  const bgStyle = channel.coverUrl
    ? { backgroundImage: `url(${channel.coverUrl})` }
    : { background: `linear-gradient(145deg, ${accent}88 0%, #0a0a0a 55%, #000 100%)` };

  const setRefs = (el) => {
    localRef.current = el;
    if (typeof sectionRef === 'function') sectionRef(el);
  };

  return (
    <Section ref={setRefs} id={`channel-apple-${index}`}>
      <BgLayer style={{ ...bgStyle, y: bgY, scale: bgScale, filter: bgFilter }} />
      <Veil />
      <Glow $accent={accent} style={{ opacity: glowOpacity }} />

      <Stage>
        <motion.div
          initial="hidden"
          animate={isActive ? 'show' : 'hidden'}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
          }}
        >
          <IndexLine $accent={accent} variants={contentShow}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {' / '}
            {String(total).padStart(2, '0')}
          </IndexLine>
          <Title variants={contentShow}>{channel.name}</Title>
          <Desc variants={contentShow}>{channel.description || fallbackDesc}</Desc>
          <MetaRow variants={contentShow}>
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
          </MetaRow>
          <Cta
            type="button"
            variants={contentShow}
            onClick={onClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <FormattedMessage id="home.community.exploreChannel" defaultMessage="进入频道" />
            <RightOutlined style={{ fontSize: 13 }} />
          </Cta>
        </motion.div>
      </Stage>
    </Section>
  );
};

const ExploreChannelsApple = ({ channels, loading }) => {
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
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateActive = useCallback(() => {
    const mid = window.innerHeight * 0.45;
    let closest = 0;
    let minDist = Infinity;
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height / 2 - mid);
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
      <LoadingSection>
        <Spin size="large" />
        <FormattedMessage id="community.explore.loading" defaultMessage="Loading channels" />
      </LoadingSection>
    );
  }

  return (
    <Scroller>
      {channels.length > 1 && (
        <ProgressNav aria-label="Channel navigation">
          {channels.map((ch, i) => (
            <NavDot
              key={ch.id}
              type="button"
              $active={i === activeIndex}
              $accent={getAccent(ch)}
              onClick={() => scrollToSection(i)}
              aria-label={`Channel ${i + 1}`}
              animate={{ scale: i === activeIndex ? 1.45 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            />
          ))}
          <NavCount>
            {String(activeIndex + 1).padStart(2, '0')}/{String(channels.length).padStart(2, '0')}
          </NavCount>
        </ProgressNav>
      )}

      {channels.map((channel, index) => (
        <ChannelSection
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
    </Scroller>
  );
};

export default ExploreChannelsApple;
export { getAccent };
