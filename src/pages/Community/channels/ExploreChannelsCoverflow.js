import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  RightOutlined,
  LeftOutlined,
  FireFilled,
  CrownOutlined,
} from '@ant-design/icons';
import { communityChannelPath } from 'utils/communityRoutes';

const CARD_WIDTH = 520;
const CARD_GAP = 24;

const getAccent = (channel) => channel.themeColor || '#6366f1';

const Gallery = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  padding-bottom: 48px;
`;

const GalleryHeader = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 24px 16px;
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

const CarouselWrap = styled.div`
  position: relative;
  width: 100%;
`;

const Scroller = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 24px 0 16px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Track = styled.div`
  display: flex;
  align-items: center;
  gap: ${CARD_GAP}px;
  padding-left: max(24px, calc(50vw - ${CARD_WIDTH / 2}px));
  padding-right: max(24px, calc(50vw - ${CARD_WIDTH / 2}px));
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding-left: max(16px, calc(50vw - 42vw));
    padding-right: max(16px, calc(50vw - 42vw));
  }
`;

const Card = styled(motion.article)`
  flex: 0 0 min(70vw, ${CARD_WIDTH}px);
  height: min(62vh, 560px);
  min-height: 320px;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.45);
`;

const Cover = styled.div`
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
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.5) 55%, rgba(0, 0, 0, 0.9) 100%);
`;

const CardMeta = styled.div`
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

const Body = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 28px 28px 32px;
`;

const IndexLine = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  span {
    color: ${({ $accent }) => $accent};
  }
`;

const Title = styled.h3`
  margin: 0 0 10px;
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
`;

const Desc = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.65);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
`;

const Enter = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
`;

const NavBar = styled.div`
  max-width: 1280px;
  margin: 20px auto 0;
  padding: 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 24px;
  }
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavBtn = styled(motion.button)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #f5f5f7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`;

const Counter = styled.div`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.45);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;

  span {
    color: ${({ $accent }) => $accent};
  }
`;

const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.button`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ $active, $accent }) => ($active ? $accent : 'rgba(255,255,255,0.25)')};
  box-shadow: ${({ $active, $accent }) => ($active ? `0 0 10px ${$accent}66` : 'none')};
  transition: transform 0.25s ease, background 0.25s ease;
  transform: scale(${({ $active }) => ($active ? 1.35 : 1)});
`;

const LoadingWrap = styled.div`
  min-height: 55vh;
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

const ExploreChannelsCoverflow = ({ channels, loading }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const count = channels.length;
  const activeAccent = channels[activeIndex] ? getAccent(channels[activeIndex]) : '#6366f1';

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

  const syncActiveIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || count === 0) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActiveIndex(closest);
  }, [count]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => syncActiveIndex();
    scroller.addEventListener('scroll', onScroll, { passive: true });

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaY;
      }
    };
    scroller.addEventListener('wheel', onWheel, { passive: false });

    syncActiveIndex();
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('wheel', onWheel);
    };
  }, [syncActiveIndex, count]);

  const scrollToIndex = (index) => {
    const el = cardRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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

  if (count === 0) {
    return null;
  }

  return (
    <Gallery>
      <GalleryHeader>
        <GalleryLabel>
          <FormattedMessage
            id="community.explore.coverflow.label"
            defaultMessage="Center-focus carousel"
          />
        </GalleryLabel>
      </GalleryHeader>

      <CarouselWrap>
        <Scroller ref={scrollerRef}>
          <Track>
            {channels.map((channel, index) => {
              const accent = getAccent(channel);
              const isActive = index === activeIndex;
              const bgStyle = channel.coverUrl
                ? { backgroundImage: `url(${channel.coverUrl})` }
                : { background: `linear-gradient(145deg, ${accent}99 0%, #0a0a0a 55%)` };

              return (
                <Card
                  key={channel.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  onClick={() => handleChannelClick(channel)}
                  animate={{
                    scale: isActive ? 1 : 0.88,
                    opacity: isActive ? 1 : 0.45,
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                  style={{
                    borderColor: isActive ? `${accent}55` : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 40px 100px ${accent}35` : '0 16px 48px rgba(0,0,0,0.35)',
                  }}
                >
                  <Cover
                    style={{
                      ...bgStyle,
                      transform: isActive ? 'scale(1.06)' : 'scale(1.12)',
                    }}
                  />
                  <Veil />
                  <CardMeta>
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
                  </CardMeta>
                  <Body>
                    <IndexLine $accent={accent}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {' / '}
                      {String(count).padStart(2, '0')}
                    </IndexLine>
                    <Title>{channel.name}</Title>
                    <Desc>{channel.description || fallbackDesc}</Desc>
                    <Enter>
                      <FormattedMessage id="home.community.exploreChannel" defaultMessage="进入频道" />
                      <RightOutlined style={{ fontSize: 11 }} />
                    </Enter>
                  </Body>
                </Card>
              );
            })}
          </Track>
        </Scroller>
      </CarouselWrap>

      <NavBar>
        <NavGroup>
          <NavBtn
            type="button"
            disabled={activeIndex <= 0}
            onClick={() => scrollToIndex(activeIndex - 1)}
            whileTap={{ scale: 0.92 }}
          >
            <LeftOutlined />
          </NavBtn>
          <NavBtn
            type="button"
            disabled={activeIndex >= count - 1}
            onClick={() => scrollToIndex(activeIndex + 1)}
            whileTap={{ scale: 0.92 }}
          >
            <RightOutlined />
          </NavBtn>
        </NavGroup>

        <Counter $accent={activeAccent}>
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          {' / '}
          {String(count).padStart(2, '0')}
        </Counter>

        <Dots>
          {channels.map((ch, i) => (
            <Dot
              key={ch.id}
              type="button"
              $active={i === activeIndex}
              $accent={getAccent(ch)}
              onClick={() => scrollToIndex(i)}
              aria-label={`Channel ${i + 1}`}
            />
          ))}
        </Dots>
      </NavBar>
    </Gallery>
  );
};

export default ExploreChannelsCoverflow;
export { getAccent };
