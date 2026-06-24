import React, { useState } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { RightOutlined, FireFilled, CrownOutlined } from '@ant-design/icons';
import { communityChannelPath } from 'utils/communityRoutes';

const getAccent = (channel) => channel.themeColor || '#6366f1';

/** 6 格循环的 Bento 拼贴尺寸 */
const BENTO_SLOTS = [
  { col: 2, row: 2, minH: 400 },
  { col: 1, row: 1, minH: 200 },
  { col: 1, row: 1, minH: 200 },
  { col: 2, row: 1, minH: 220 },
  { col: 1, row: 2, minH: 340 },
  { col: 1, row: 1, minH: 200 },
];

const getBentoSlot = (index) => BENTO_SLOTS[index % BENTO_SLOTS.length];

const Gallery = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  padding-bottom: 64px;
`;

const GalleryHeader = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px 32px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 24px 24px;
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

const BentoGrid = styled(motion.div)`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: clamp(12px, 2vw, 20px);
  perspective: 1400px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 0 24px;
    gap: 16px;
  }
`;

const Cell = styled(motion.article)`
  position: relative;
  grid-column: span ${({ $col }) => $col};
  grid-row: span ${({ $row }) => $row};
  min-height: ${({ $minH }) => $minH}px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transform-style: preserve-3d;
  will-change: transform;

  @media (max-width: 768px) {
    grid-column: span 1 !important;
    grid-row: span 1 !important;
    min-height: 240px;
  }
`;

const Cover = styled(motion.div)`
  position: absolute;
  inset: -6%;
  background-size: cover;
  background-position: center;
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
`;

const Veil = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    165deg,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.35) 55%,
    rgba(0, 0, 0, 0.88) 100%
  );
  transition: opacity 0.4s ease;
`;

const Shine = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
    circle at var(--mx, 50%) var(--my, 50%),
    ${({ $accent }) => `${$accent}35`} 0%,
    transparent 55%
  );
  transition: opacity 0.35s ease;
`;

const TopMeta = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 4;
  display: flex;
  gap: 6px;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const IndexTag = styled.span`
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 4;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.55);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  span {
    color: ${({ $accent }) => $accent};
  }
`;

const Body = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  padding: 20px 22px 24px;
  transform: translateY(4px);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: ${({ $large }) => ($large ? 'clamp(22px, 3vw, 32px)' : 'clamp(18px, 2.5vw, 22px)')};
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
`;

const Desc = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: ${({ $large }) => ($large ? 3 : 2)};
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.85;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const Enter = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $accent }) => $accent};
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s ease;
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

const springTilt = { stiffness: 180, damping: 22 };

const gridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const cellUp = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const BentoCell = ({ channel, index, total, slot, onClick, fallbackDesc }) => {
  const accent = getAccent(channel);
  const large = slot.col >= 2 || slot.row >= 2;
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, springTilt);
  const smoothRotateY = useSpring(rotateY, springTilt);
  const [hovering, setHovering] = useState(false);

  const bgStyle = channel.coverUrl
    ? { backgroundImage: `url(${channel.coverUrl})` }
    : { background: `linear-gradient(145deg, ${accent}99 0%, #0a0a0a 55%)` };

  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * 8);
    rotateY.set(x * 8);
    e.currentTarget.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  };

  const onPointerLeave = (e) => {
    setHovering(false);
    rotateX.set(0);
    rotateY.set(0);
    e.currentTarget.style.setProperty('--mx', '50%');
    e.currentTarget.style.setProperty('--my', '50%');
  };

  return (
    <Cell
      variants={cellUp}
      $col={slot.col}
      $row={slot.row}
      $minH={slot.minH}
      onClick={onClick}
      onPointerEnter={() => setHovering(true)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        borderColor: hovering ? `${accent}55` : 'rgba(255,255,255,0.08)',
        boxShadow: hovering ? `0 24px 64px ${accent}30` : 'none',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Cover
        style={{
          ...bgStyle,
          transform: hovering ? 'scale(1.1)' : 'scale(1.05)',
        }}
      />
      <Veil style={{ opacity: hovering ? 0.92 : 1 }} />
      <Shine $accent={accent} style={{ opacity: hovering ? 1 : 0 }} />

      <IndexTag $accent={accent}>
        <span>{String(index + 1).padStart(2, '0')}</span>
        {' / '}
        {String(total).padStart(2, '0')}
      </IndexTag>

      <TopMeta>
        <MetaPill>
          <FireFilled style={{ color: '#ff6b6b', fontSize: 9 }} />
          {channel.postCount || 0}
        </MetaPill>
        {channel.isVipOnly && (
          <MetaPill style={{ color: '#ffd666' }}>
            <CrownOutlined />
            VIP
          </MetaPill>
        )}
      </TopMeta>

      <Body style={{ transform: hovering ? 'translateY(0)' : 'translateY(4px)' }}>
        <Title $large={large}>{channel.name}</Title>
        <Desc $large={large}>{channel.description || fallbackDesc}</Desc>
        <Enter $accent={accent} style={{ opacity: hovering ? 1 : 0, transform: hovering ? 'translateY(0)' : 'translateY(6px)' }}>
          <FormattedMessage id="home.community.exploreChannel" defaultMessage="进入频道" />
          <RightOutlined style={{ fontSize: 10 }} />
        </Enter>
      </Body>
    </Cell>
  );
};

const ExploreChannelsBento = ({ channels, loading }) => {
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
            id="community.explore.bento.label"
            defaultMessage="Bento mosaic grid"
          />
        </GalleryLabel>
      </GalleryHeader>

      <BentoGrid variants={gridStagger} initial="hidden" animate="show">
        {channels.map((channel, index) => (
          <BentoCell
            key={channel.id}
            channel={channel}
            index={index}
            total={channels.length}
            slot={getBentoSlot(index)}
            fallbackDesc={fallbackDesc}
            onClick={() => handleChannelClick(channel)}
          />
        ))}
      </BentoGrid>
    </Gallery>
  );
};

export default ExploreChannelsBento;
export { getAccent };
