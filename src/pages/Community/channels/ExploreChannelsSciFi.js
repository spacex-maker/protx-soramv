import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import { motion, useSpring } from 'framer-motion';
import ChannelPageSection, { getAccent } from './ChannelPageSection';
import { communityChannelPath } from 'utils/communityRoutes';

const ChannelScroller = styled.div`
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

  @media (max-width: 768px) {
    right: 10px;
  }
`;

const NavTrack = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.08);
  left: 50%;
  transform: translateX(-50%);
`;

const NavFill = styled(motion.div)`
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #22d3ee, #a855f7);
  transform-origin: top;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
`;

const NavDots = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
`;

const NavDot = styled(motion.button)`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid ${({ $accent }) => $accent || 'rgba(255,255,255,0.3)'};
  background: ${({ $active, $accent }) => ($active ? $accent || '#22d3ee' : 'transparent')};
  cursor: pointer;
  padding: 0;
  box-shadow: ${({ $active, $accent }) => ($active ? `0 0 16px ${$accent || '#22d3ee'}` : 'none')};
`;

const NavCounter = styled(motion.div)`
  margin-top: 12px;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(34, 211, 238, 0.55);
  writing-mode: vertical-rl;
`;

const LoadingSection = styled.section`
  min-height: 100vh;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #22d3ee;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 12px;
  letter-spacing: 0.2em;
`;

const ExploreChannelsSciFi = ({ channels, loading }) => {
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

  const navProgress = channels.length > 1 ? activeIndex / (channels.length - 1) : 1;
  const smoothProgress = useSpring(navProgress, { stiffness: 120, damping: 22 });

  if (loading) {
    return (
      <LoadingSection>
        <Spin size="large" />
        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
          SCANNING CHANNELS...
        </motion.span>
      </LoadingSection>
    );
  }

  return (
    <ChannelScroller>
      {channels.length > 1 && (
        <ProgressNav aria-label="Channel navigation">
          <NavTrack>
            <NavFill style={{ scaleY: smoothProgress }} />
          </NavTrack>
          <NavDots>
            {channels.map((ch, i) => (
              <NavDot
                key={ch.id}
                type="button"
                $active={i === activeIndex}
                $accent={getAccent(ch)}
                onClick={() => scrollToSection(i)}
                aria-label={`Channel ${i + 1}`}
                animate={{ scale: i === activeIndex ? 1.35 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                whileHover={{ scale: 1.25 }}
              />
            ))}
          </NavDots>
          <NavCounter key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {String(activeIndex + 1).padStart(2, '0')}/{String(channels.length).padStart(2, '0')}
          </NavCounter>
        </ProgressNav>
      )}

      {channels.map((channel, index) => (
        <ChannelPageSection
          key={channel.id}
          channel={channel}
          index={index}
          total={channels.length}
          isActive={index === activeIndex}
          sectionRef={(el) => {
            sectionRefs.current[index] = el;
          }}
          fallbackDesc={fallbackDesc}
          onClick={() => handleChannelClick(channel)}
        />
      ))}
    </ChannelScroller>
  );
};

export default ExploreChannelsSciFi;
