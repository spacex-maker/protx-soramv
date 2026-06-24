import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import { RightOutlined, FireFilled, CrownOutlined } from '@ant-design/icons';
import { getChannelLayout } from './channelLayoutVariants';
import { getSpotlight } from './channelCenterSpotlights';
import {
  CinematicStage,
  EditorialStageView,
  MonumentStage,
  PrismStage,
  OrbitStage,
  PeelStageView,
  HorizonStage,
  PortalStageView,
  StackStage,
  GlitchStage,
  SweepStage,
  MagnetStageView,
} from './channelLayoutStages';

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const getAccent = (channel) => channel.themeColor || '#6366f1';

const Section = styled.section`
  position: relative;
  min-height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  overflow: hidden;
  background: #000;
`;

const ImageLayer = styled(motion.div)`
  position: absolute;
  inset: -4%;
  background-size: cover;
  background-position: center;
  will-change: transform;
`;

const VEIL_STYLES = {
  cinematic: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.92) 100%)',
  editorial: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.15) 100%)',
  prism: 'linear-gradient(105deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%)',
  bottom: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)',
  radial: 'radial-gradient(circle at 50% 42%, transparent 22%, rgba(0,0,0,0.88) 68%)',
  peel: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.6) 100%)',
  horizon: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.9) 100%)',
  portal: 'radial-gradient(circle at 50% 45%, transparent 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.88) 72%)',
  stack: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)',
  glitch: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
  sweep: 'linear-gradient(115deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 48%, rgba(0,0,0,0.2) 100%)',
  magnet: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.88) 100%)',
};

const ImageVeil = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: ${({ $veil }) => VEIL_STYLES[$veil] || VEIL_STYLES.bottom};
`;

const AccentGlow = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: radial-gradient(ellipse 80% 60% at ${({ $x }) => $x}% ${({ $y }) => $y}%,
    ${({ $accent }) => `${$accent}30`} 0%, transparent 58%);
`;

const Specular = styled.div`
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  overflow: hidden;
  opacity: ${({ $on }) => ($on ? 1 : 0.4)};

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.06), transparent);
    animation: ${shimmer} 8s ease-in-out infinite;
  }
`;

const IndexLine = styled(motion.div)`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  span {
    color: ${({ $accent }) => $accent};
  }
`;

const AccentLine = styled(motion.div)`
  height: 2px;
  margin-bottom: 20px;
  background: ${({ $accent }) => $accent};
  transform-origin: left center;
  max-width: 160px;
`;

const DisplayTitle = styled(motion.h2)`
  margin: 0 0 20px;
  font-size: clamp(48px, 8vw, 88px);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 0.95;
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
`;

const Lead = styled(motion.p)`
  margin: 0 0 32px;
  font-size: clamp(17px, 2.2vw, 21px);
  line-height: 1.55;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  max-width: 520px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const MetaRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 36px;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
`;

const PrimaryBtn = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border: none;
  border-radius: 100px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #000;
  background: #f5f5f7;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);

  .anticon {
    font-size: 14px;
  }
`;

const LayoutBadge = styled(motion.span)`
  display: inline-block;
  margin-left: 12px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: ${({ $accent }) => $accent};
  background: ${({ $accent }) => `${$accent}18`};
  border: 1px solid ${({ $accent }) => `${$accent}35`};
  vertical-align: middle;
`;

const FlashPulse = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12), transparent 65%);
`;

const spring = { type: 'spring', stiffness: 90, damping: 22, mass: 0.8 };

const contentStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const itemUp = {
  hidden: { opacity: 0, y: 32, filter: 'blur(12px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

function mergeRefs(refs) {
  return (el) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    });
  };
}

const ChannelContent = ({
  channel,
  index,
  total,
  accent,
  layout,
  isActive,
  fallbackDesc,
  onClick,
  spotlight,
}) => (
  <motion.div variants={contentStagger} initial="hidden" animate={isActive ? 'show' : 'hidden'}>
    <IndexLine $accent={accent} variants={itemUp}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      {' / '}
      {String(total).padStart(2, '0')}
      <LayoutBadge $accent={accent} variants={itemUp}>
        {layout.label}
      </LayoutBadge>
    </IndexLine>

    <AccentLine
      $accent={accent}
      initial={spotlight.line.idle}
      animate={isActive ? spotlight.line.active : spotlight.line.idle}
      transition={spotlight.line.transition}
    />

    <DisplayTitle
      initial={spotlight.title.idle}
      animate={isActive ? spotlight.title.active : spotlight.title.idle}
      transition={spotlight.title.transition}
    >
      {channel.name}
    </DisplayTitle>

    <MetaRow variants={itemUp}>
      <MetaPill>
        <FireFilled style={{ color: '#ff6b6b', fontSize: 12 }} />
        {channel.postCount || 0}
      </MetaPill>
      {channel.isVipOnly && (
        <MetaPill style={{ color: '#ffd666' }}>
          <CrownOutlined />
          VIP
        </MetaPill>
      )}
    </MetaRow>

    <Lead variants={itemUp}>{channel.description || fallbackDesc}</Lead>

    <PrimaryBtn
      type="button"
      variants={itemUp}
      onClick={onClick}
      whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(255,255,255,0.2)' }}
      whileTap={{ scale: 0.98 }}
    >
      <FormattedMessage id="home.community.exploreChannel" defaultMessage="进入频道" />
      <motion.span animate={isActive ? { x: [0, 4, 0] } : {}} transition={{ duration: 1.4, repeat: Infinity }}>
        <RightOutlined />
      </motion.span>
    </PrimaryBtn>
  </motion.div>
);

const STAGE_MAP = {
  cinematic: CinematicStage,
  editorial: EditorialStageView,
  monument: MonumentStage,
  prism: PrismStage,
  orbit: OrbitStage,
  peel: PeelStageView,
  horizon: HorizonStage,
  portal: PortalStageView,
  stack: StackStage,
  glitch: GlitchStage,
  sweep: SweepStage,
  magnet: MagnetStageView,
};

const ChannelPageSection = ({ channel, index, total, sectionRef, onClick, fallbackDesc, isActive }) => {
  const localRef = useRef(null);
  const accent = getAccent(channel);
  const layout = getChannelLayout(index);
  const spotlight = getSpotlight(index);
  const [pulse, setPulse] = useState(0);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: localRef,
    offset: ['start end', 'end start'],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);
  const imgScaleScroll = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);
  const panX = useTransform(scrollYProgress, [0, 1], ['-14%', '14%']);

  const tiltRotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [10, -10]), spring);
  const tiltRotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), spring);
  const magnetX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-28, 28]), spring);
  const magnetY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-20, 20]), spring);

  const activeScale = useSpring(isActive ? 1 : 1.06, spring);
  const activeBrightness = useSpring(isActive ? 1 : 0.72, spring);
  const glowOpacity = useSpring(isActive ? 0.55 : 0.15, spring);

  useEffect(() => {
    if (isActive) setPulse((p) => p + 1);
    else {
      pointerX.set(0);
      pointerY.set(0);
    }
  }, [isActive, pointerX, pointerY]);

  const handlePointerMove = (e) => {
    if (!isActive) return;
    const rect = localRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const bgStyle = channel.coverUrl
    ? { backgroundImage: `url(${channel.coverUrl})` }
    : { background: `linear-gradient(145deg, ${accent}88 0%, #0a0a12 50%, #000 100%)` };

  const imgFilter = useTransform(activeBrightness, (b) => `brightness(${b})`);
  const imageStyle = { ...bgStyle, filter: imgFilter };

  const contentBlock = (
    <ChannelContent
      channel={channel}
      index={index}
      total={total}
      accent={accent}
      layout={layout}
      isActive={isActive}
      fallbackDesc={fallbackDesc}
      onClick={onClick}
      spotlight={spotlight}
    />
  );

  const stageProps = {
    contentBlock,
    isActive,
    imageStyle,
    activeScale,
    imgY,
    imgScaleScroll,
    panX,
    pulse,
    spotlight,
    accent,
    tiltRotateX,
    tiltRotateY,
    magnetX,
    magnetY,
  };

  const StageComponent = STAGE_MAP[layout.id] || CinematicStage;
  const showFullBleed = layout.imageMode === 'fullbleed';

  return (
    <Section
      ref={mergeRefs([localRef, sectionRef])}
      id={`channel-section-${index}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      {showFullBleed && (
        <ImageLayer
          initial={spotlight.bg.idle}
          animate={isActive ? spotlight.bg.active : spotlight.bg.idle}
          transition={spotlight.bg.transition}
          style={{ ...imageStyle, y: imgY, scale: imgScaleScroll }}
        />
      )}

      <ImageVeil $veil={layout.veil} />
      <AccentGlow
        $accent={accent}
        $x={layout.glow.x}
        $y={layout.glow.y}
        style={{ opacity: glowOpacity }}
      />
      <Specular $on={isActive} />

      {spotlight.flash && isActive && (
        <FlashPulse
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      <StageComponent {...stageProps} />
    </Section>
  );
};

export default ChannelPageSection;
export { getAccent };
