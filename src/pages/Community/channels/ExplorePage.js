import React, { useRef, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { HomeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import SimpleHeader from 'components/headers/simple';
import FooterSection from 'pages/Home/components/FooterSection';
import ExploreChannels from './ExploreChannels';
import ExploreLayoutSwitch from './ExploreLayoutSwitch';
import {
  getStoredExploreView,
  storeExploreView,
  EXPLORE_VIEW_APPLE,
  EXPLORE_VIEW_REVEAL,
  EXPLORE_VIEW_BENTO,
  EXPLORE_VIEW_COVERFLOW,
} from './exploreLayoutModes';
import { COMMUNITY_PLAZA_PATH } from 'utils/communityRoutes';

const scrollBounce = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(6px); opacity: 1; }
`;

const scrollPulse = keyframes`
  0%, 100% { transform: translateX(0); opacity: 0.5; }
  50% { transform: translateX(6px); opacity: 1; }
`;

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #0a0a0a;
  color: #f5f5f7;
  position: relative;
  overflow-x: hidden;
`;

const Grain = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
`;

const ScrollProgress = styled(motion.div)`
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  height: 1px;
  z-index: 200;
  transform-origin: left;
  background: rgba(255, 255, 255, 0.5);
`;

const Hero = styled.section`
  position: relative;
  z-index: 1;
  padding: 120px 48px 64px;
  max-width: 1280px;
  margin: 0 auto;
  box-sizing: border-box;
  scroll-snap-align: start;
  scroll-snap-stop: always;

  &.snap-hero {
    min-height: calc(100vh - 72px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-bottom: 48px;
  }

  @media (max-width: 768px) {
    padding: 100px 24px 40px;

    &.snap-hero {
      min-height: calc(100vh - 72px);
    }
  }
`;

const BackBtn = styled(Button)`
  && {
    margin-bottom: 40px;
    margin-left: -8px;
    color: rgba(255, 255, 255, 0.45);
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
    font-size: 13px;

    &:hover {
      color: #f5f5f7 !important;
      background: rgba(255, 255, 255, 0.06) !important;
    }
  }
`;

const Eyebrow = styled(motion.p)`
  margin: 0 0 24px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const Title = styled(motion.h1)`
  margin: 0 0 28px;
  font-size: clamp(48px, 10vw, 112px);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 0.95;
  color: #f5f5f7;
  max-width: 900px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
`;

const Subtitle = styled(motion.p)`
  margin: 0;
  max-width: 480px;
  font-size: clamp(17px, 2vw, 20px);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.45);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const ScrollCue = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 48px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  .line {
    width: 48px;
    height: 1px;
    background: rgba(255, 255, 255, 0.25);
    animation: ${scrollBounce} 2.4s ease infinite;
  }

  .line-h {
    width: 48px;
    height: 1px;
    background: rgba(255, 255, 255, 0.25);
    animation: ${scrollPulse} 2.4s ease infinite;
  }
`;

const FooterWrap = styled.div`
  position: relative;
  z-index: 1;
  scroll-snap-align: end;
`;

const ChannelsWrap = styled(motion.div)`
  position: relative;
  z-index: 1;
`;

const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

const CommunityExplorePage = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [viewMode, setViewMode] = useState(getStoredExploreView);

  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] });
  const smoothPageProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0.85]);
  const heroY = useTransform(scrollYProgress, [0, 0.12], [0, -24]);

  const isApple = viewMode === EXPLORE_VIEW_APPLE;
  const isReveal = viewMode === EXPLORE_VIEW_REVEAL;
  const isBento = viewMode === EXPLORE_VIEW_BENTO;
  const isCoverflow = viewMode === EXPLORE_VIEW_COVERFLOW;

  useEffect(() => {
    const html = document.documentElement;
    if (isApple) {
      html.style.scrollSnapType = 'y mandatory';
      html.style.scrollPaddingTop = '72px';
    } else {
      html.style.scrollSnapType = '';
      html.style.scrollPaddingTop = '';
    }
    return () => {
      html.style.scrollSnapType = '';
      html.style.scrollPaddingTop = '';
    };
  }, [isApple]);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    storeExploreView(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout ref={pageRef}>
      <Grain />
      <ScrollProgress style={{ scaleX: smoothPageProgress }} />

      <SimpleHeader />
      <ExploreLayoutSwitch value={viewMode} onChange={handleViewChange} />

      <Hero id="explore-hero" className={isApple ? 'snap-hero' : ''}>
        <motion.div style={{ opacity: heroOpacity, y: heroY }}>
          <motion.div variants={heroStagger} initial="hidden" animate="visible">
            <motion.div variants={heroItem}>
              <BackBtn type="text" icon={<HomeOutlined />} onClick={() => navigate(COMMUNITY_PLAZA_PATH)}>
                <FormattedMessage id="community.plaza.title" defaultMessage="Community Plaza" />
              </BackBtn>
            </motion.div>

            <Eyebrow variants={heroItem}>
              <FormattedMessage id="community.explore.eyebrow" defaultMessage="Communities" />
            </Eyebrow>

            <Title variants={heroItem}>
              {isApple ? (
                <FormattedMessage id="community.explore.apple.hero" defaultMessage="Immersive channels" />
              ) : isReveal ? (
                <FormattedMessage id="community.explore.reveal.hero" defaultMessage="Revealed gallery" />
              ) : isBento ? (
                <FormattedMessage id="community.explore.bento.hero" defaultMessage="Bento mosaic" />
              ) : isCoverflow ? (
                <FormattedMessage id="community.explore.coverflow.hero" defaultMessage="Focus carousel" />
              ) : (
                <FormattedMessage id="community.explore.exoApe.hero" defaultMessage="Explore channels" />
              )}
            </Title>

            <Subtitle variants={heroItem}>
              <FormattedMessage
                id="community.explore.subtitle"
                defaultMessage="Discover inspiration, explore curated works, and connect with thousands of AI creators."
              />
            </Subtitle>

            <ScrollCue variants={heroItem}>
              {isCoverflow ? (
                <>
                  <span className="line-h" />
                  <FormattedMessage id="community.explore.scrollHint" defaultMessage="横向滑动浏览频道" />
                </>
              ) : (
                <>
                  <span className="line" />
                  <FormattedMessage id="community.explore.scrollDown" defaultMessage="向下滚动浏览频道" />
                </>
              )}
            </ScrollCue>
          </motion.div>
        </motion.div>
      </Hero>

      <AnimatePresence mode="wait">
        <ChannelsWrap
          key={viewMode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <ExploreChannels layout="bold" viewMode={viewMode} />
        </ChannelsWrap>
      </AnimatePresence>

      <FooterWrap>
        <FooterSection />
      </FooterWrap>
    </PageLayout>
  );
};

export default CommunityExplorePage;
