import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import { Spin } from 'antd';
import { useLocale } from 'contexts/LocaleContext';
import OpenRobotXHeader from '../components/OpenRobotXHeader';
import FooterSection from '../components/FooterSection';
import { PageContainer } from '../styles';
import { getHistoryEventList } from '../../../api/openrobotx';

const addImageCompressSuffix = (url, width = 400) => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const PageWrap = styled(PageContainer)`
  padding-top: 72px;
`;

const Hero = styled.section`
  padding: 56px 24px 40px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  @media (max-width: 768px) {
    padding: 40px 16px 32px;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fff;
  margin: 0 0 12px;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: 16px;
  color: #9aa0a6;
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TimelineSection = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 80px;
  position: relative;
  @media (max-width: 768px) {
    padding: 16px 12px 64px;
  }
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent, rgba(0, 212, 170, 0.4) 10%, rgba(0, 212, 170, 0.6) 50%, rgba(0, 212, 170, 0.4) 90%, transparent);
  transform: translateX(-50%);
  @media (max-width: 768px) {
    left: 20px;
    transform: none;
  }
`;

/** 时间轴跑马灯：光带沿轴线从顶流到底，循环 */
const TimelineMarquee = styled.div`
  position: absolute;
  left: 50%;
  top: -80px;
  width: 10px;
  height: 80px;
  margin-left: -5px;
  border-radius: 5px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 212, 170, 0.5) 15%,
    rgba(0, 212, 170, 1) 50%,
    rgba(0, 212, 170, 0.5) 85%,
    transparent 100%
  );
  box-shadow:
    0 0 24px rgba(0, 212, 170, 0.8),
    0 0 48px rgba(0, 212, 170, 0.4);
  animation: timelineMarqueeRun 3s linear infinite;
  pointer-events: none;
  z-index: 0;
  @keyframes timelineMarqueeRun {
    0% { top: -80px; }
    100% { top: 100%; }
  }
  @media (max-width: 768px) {
    left: 20px;
    margin-left: -5px;
  }
`;

const TimelineList = styled.div`
  position: relative;
  z-index: 1;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  margin-bottom: 40px;
  min-height: 80px;
  &:nth-child(even) {
    flex-direction: row-reverse;
  }
  @media (max-width: 768px) {
    flex-direction: row !important;
    justify-content: flex-start;
    margin-bottom: 32px;
    padding-left: 44px;
  }
`;

/** 仅中心一列的占位，用于年份刻度行 */
const ItemContentEmpty = styled.div`
  width: calc(50% - 40px);
  max-width: 520px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    display: none;
  }
`;

/** 年份刻度：仅中心线上一格，无卡片 */
const YearTick = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: rgba(0, 212, 170, 0.7);
  white-space: nowrap;
  letter-spacing: -0.02em;
  padding: 4px 0;
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TimelineCenterTick = styled.div`
  flex-shrink: 0;
  width: 120px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  @media (max-width: 768px) {
    position: absolute;
    left: 0;
    width: auto;
    min-width: 44px;
    justify-content: flex-start;
  }
`;

const TickMark = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 212, 170, 0.5);
  flex-shrink: 0;
  margin-right: 10px;
  @media (max-width: 768px) {
    width: 6px;
    height: 6px;
    margin-right: 8px;
  }
`;

const ItemContent = styled.div`
  width: calc(50% - 40px);
  max-width: 520px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: 100%;
    max-width: none;
  }
`;

/** 悬停时整卡玻璃层（用真实 div 保证 backdrop-filter 生效） */
const CardGlassLayer = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 1.5;
  pointer-events: none;
`;

const ItemCard = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 260px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
  &:hover {
    border-color: rgba(0, 212, 170, 0.4);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 212, 170, 0.15);
    transform: translateY(-2px);
  }
  &:hover ${CardGlassLayer} {
    opacity: 1;
  }
  ${(p) => p.$milestone && `
    border-color: rgba(0, 212, 170, 0.25);
    box-shadow: 0 0 24px rgba(0, 212, 170, 0.1);
  `}
`;

const CardBgLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CardBgOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.45) 45%,
    rgba(0, 0, 0, 0.85) 100%
  );
  z-index: 1;
`;

const CardBody = styled.div`
  position: relative;
  z-index: 2;
  padding: 20px 22px;
  ${(p) => p.$hasCover && 'margin-top: auto;'}
  background: transparent;
`;

const CardTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.35;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const CardSummary = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.55;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const MilestoneBadge = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #00d4aa;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(0, 212, 170, 0.2);
  border: 1px solid rgba(0, 212, 170, 0.35);
  margin-bottom: 8px;
`;

const TimelineCenter = styled.div`
  flex-shrink: 0;
  width: 120px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-top: 4px;
  ${(p) => p.$labelLeft && 'flex-direction: row-reverse;'}
  @media (max-width: 768px) {
    position: absolute;
    left: 0;
    width: auto;
    min-width: 44px;
    padding-top: 0;
    justify-content: flex-start;
    gap: 8px;
    ${(p) => p.$labelLeft && 'flex-direction: row;'}
  }
`;

const TimeDot = styled.div`
  width: ${(p) => (p.$milestone ? 16 : 12)}px;
  height: ${(p) => (p.$milestone ? 16 : 12)}px;
  border-radius: 50%;
  background: ${(p) => (p.$milestone ? '#00d4aa' : 'rgba(0, 212, 170, 0.6)')};
  border: 2px solid rgba(0, 212, 170, 0.9);
  box-shadow: 0 0 12px ${(p) => (p.$milestone ? 'rgba(0, 212, 170, 0.5)' : 'transparent')};
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: ${(p) => (p.$milestone ? 14 : 10)}px;
    height: ${(p) => (p.$milestone ? 14 : 10)}px;
  }
`;

const TimeLabel = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #00d4aa;
  white-space: nowrap;
  letter-spacing: -0.02em;
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const SpinWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
`;

const EmptyWrap = styled.div`
  padding: 64px 24px;
  text-align: center;
  color: #9aa0a6;
`;

const getEventTitle = (item, isZh) =>
  isZh ? (item.title || item.titleEn || '') : (item.titleEn || item.title || '');
const getEventSummary = (item, isZh) =>
  isZh ? (item.summary || item.summaryEn || '') : (item.summaryEn || item.summary || '');

const formatTimeLabel = (item) => {
  if (item.displayTimeText) return item.displayTimeText;
  if (item.eventYear == null) return '';
  if (item.eventMonth != null && item.eventMonth > 0) {
    return `${item.eventYear}/${item.eventMonth}`;
  }
  return String(item.eventYear);
};

/** 根据事件年份范围生成合适的刻度年份（降序，与列表顺序一致） */
const getTickYears = (minYear, maxYear) => {
  if (minYear == null || maxYear == null || maxYear < minYear) return [];
  const range = maxYear - minYear;
  const step =
    range > 80 ? 20 : range > 40 ? 10 : range > 15 ? 5 : range > 5 ? 2 : 1;
  const ticks = [];
  const start = Math.floor(maxYear / step) * step;
  for (let y = start; y >= minYear; y -= step) {
    ticks.push(y);
  }
  if (ticks.length === 0) ticks.push(maxYear);
  return ticks;
};

/** 将事件列表与年份刻度合并，用于渲染时间轴 */
const buildTimelineEntries = (events) => {
  if (!events || events.length === 0) return [];
  const years = events.map((e) => e.eventYear).filter((y) => y != null);
  if (years.length === 0) return events.map((e) => ({ type: 'event', event: e }));
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const tickYears = getTickYears(minYear, maxYear);
  const combined = [];
  let tickIndex = 0;
  for (const event of events) {
    const y = event.eventYear != null ? event.eventYear : maxYear;
    while (tickIndex < tickYears.length && y <= tickYears[tickIndex]) {
      combined.push({ type: 'year', year: tickYears[tickIndex] });
      tickIndex += 1;
    }
    combined.push({ type: 'event', event });
  }
  while (tickIndex < tickYears.length) {
    combined.push({ type: 'year', year: tickYears[tickIndex] });
    tickIndex += 1;
  }
  return combined;
};

const AgiPathPage = () => {
  const { locale } = useLocale();
  const isZh = !locale || locale === 'zh-CN' || String(locale).toLowerCase().startsWith('zh');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getHistoryEventList({ currentPage: 1, pageSize: 100 })
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data?.data) {
          setList(res.data.data);
        } else {
          setList([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <PageWrap>
      <Helmet>
        <title>通往 AGI 之路 | Open Robot X</title>
        <meta name="description" content="机器人进化史时间轴：人形机器人、具身智能与 AGI 路上的关键事件与里程碑。" />
      </Helmet>
      <OpenRobotXHeader />
      <Hero>
        <HeroTitle>通往 AGI 之路</HeroTitle>
        <HeroSubtitle>
          人形机器人、具身智能与通用人工智能路上的关键事件与里程碑
        </HeroSubtitle>
      </Hero>
      <TimelineSection>
        <TimelineLine />
        {!loading && list.length > 0 && <TimelineMarquee aria-hidden="true" />}
        {loading ? (
          <SpinWrap>
            <Spin size="large" />
          </SpinWrap>
        ) : list.length === 0 ? (
          <EmptyWrap>暂无编年史事件，敬请期待。</EmptyWrap>
        ) : (
          <TimelineList>
            {buildTimelineEntries(list).map((entry, index) => {
              if (entry.type === 'year') {
                return (
                  <TimelineItem key={`year-${entry.year}`}>
                    <ItemContentEmpty aria-hidden="true" />
                    <TimelineCenterTick>
                      <TickMark />
                      <YearTick>{entry.year}</YearTick>
                    </TimelineCenterTick>
                    <ItemContentEmpty aria-hidden="true" />
                  </TimelineItem>
                );
              }
              const item = entry.event;
              const eventIndex = list.indexOf(item);
              const title = getEventTitle(item, isZh);
              const summary = getEventSummary(item, isZh);
              const timeLabel = formatTimeLabel(item);
              const milestone = (item.importanceLevel || 0) >= 4;
              return (
                <TimelineItem key={item.id}>
                  <ItemContent>
                    <ItemCard $milestone={milestone} $hasCover={!!item.coverImageUrl}>
                      {item.coverImageUrl && (
                        <>
                          <CardBgLayer>
                            <img src={addImageCompressSuffix(item.coverImageUrl, 520)} alt="" loading="lazy" />
                          </CardBgLayer>
                          <CardBgOverlay />
                        </>
                      )}
                      <CardGlassLayer aria-hidden="true" />
                      <CardBody $hasCover={!!item.coverImageUrl}>
                        {milestone && <MilestoneBadge>里程碑</MilestoneBadge>}
                        <CardTitle>{title}</CardTitle>
                        {summary && <CardSummary>{summary}</CardSummary>}
                        <CardMeta>
                          {item.relatedCompanyName && <span>{item.relatedCompanyName}</span>}
                          {item.country && <span>· {item.country}</span>}
                        </CardMeta>
                      </CardBody>
                    </ItemCard>
                  </ItemContent>
                  <TimelineCenter $labelLeft={eventIndex % 2 === 1}>
                    <TimeDot $milestone={milestone} />
                    <TimeLabel>{timeLabel}</TimeLabel>
                  </TimelineCenter>
                  <ItemContent style={{ visibility: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
                    <div />
                  </ItemContent>
                </TimelineItem>
              );
            })}
          </TimelineList>
        )}
      </TimelineSection>
      <FooterSection />
    </PageWrap>
  );
};

export default AgiPathPage;
