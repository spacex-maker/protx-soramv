import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Section, SectionTitle, SectionSubtitle } from '../styles';
import { GlobalOutlined, RightOutlined, CalendarOutlined, TeamOutlined, DollarOutlined, LinkOutlined } from '@ant-design/icons';
import { Spin, Empty, Alert } from 'antd';
import { getCompanyList } from '../../../api/openrobotx';
import { apiCompanyToCard } from '../companies/companyAdapter';

// --- 3D 滚轮配置 ---
const CARD_HEIGHT = 260; // 单张卡片高度
const ITEM_GAP = 20;     // 卡片间距
const ITEM_SIZE = CARD_HEIGHT + ITEM_GAP; // 单元总高度
const VISIBLE_ITEMS = 6.5; // 视口内显示的卡片数量（越大上下越高）
const CONTAINER_HEIGHT = ITEM_SIZE * VISIBLE_ITEMS; // 容器总高度
const WHEEL_PADDING_Y = Math.max(ITEM_SIZE / 2, CONTAINER_HEIGHT / 2 - CARD_HEIGHT / 2); // 上下留白，让首尾卡片能滚到正中变平

// --- Styled Components ---

/* 板块：左右内边距尽量小，避免挤压倾斜卡片；独立堆叠层避免被挡 */
const TallSection = styled(Section)`
  min-height: 90vh;
  max-width: 1400px;
  padding-top: 100px;
  padding-bottom: 100px;
  padding-left: 0;
  padding-right: 0;
  overflow-x: visible;
  overflow-y: visible;
  position: relative;
  z-index: 1;
  @media (max-width: 768px) {
    min-height: 85vh;
    padding-top: 64px;
    padding-bottom: 64px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

/* 倾斜角被挡原因：overflow-y:auto 时 overflow-x 会变成 auto 并裁切。做法：内容区比卡片列宽，中间放卡片，左右留空给倾斜角 */
const WHEEL_PADDING_X = 180;
const WHEEL_BUFFER_X = 120;   /* 内容区左右各留空，给 rotateX 投影 */
const CARD_ROW_WIDTH = 1900;  /* 公司卡片行的实际宽度（扣除左右 buffer 后） */
const CARD_COLUMN_MAX = CARD_ROW_WIDTH + WHEEL_BUFFER_X * 2;
const WheelContainer = styled.div`
  margin-top: 48px;
  width: 100%;
  max-width: ${CARD_COLUMN_MAX + WHEEL_PADDING_X * 2 + WHEEL_BUFFER_X * 2}px;
  margin-left: auto;
  margin-right: auto;
  height: ${CONTAINER_HEIGHT}px;
  overflow-y: auto;
  overflow-x: hidden;
  perspective: 1000px;
  scroll-snap-type: y mandatory;
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  padding: ${WHEEL_PADDING_Y}px ${WHEEL_PADDING_X}px;
  
  &::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
  scrollbar-width: none;
`;

const WheelInner = styled.div`
  max-width: ${CARD_COLUMN_MAX}px;
  margin: 0 auto;
  padding: 0 ${WHEEL_BUFFER_X}px;
  box-sizing: border-box;
  transform-style: preserve-3d;
`;

// 单个 3D 包装器
const WheelItemWrapper = styled(motion.div)`
  height: ${CARD_HEIGHT}px;
  margin-bottom: ${ITEM_GAP}px;
  width: 100%;
  transform-style: preserve-3d;
  scroll-snap-align: center; /* 吸附对齐点 */
  display: flex; 
  /* 硬件加速优化 */
  will-change: transform, opacity, filter;
`;

// --- 以下完全保留您原有的卡片样式 ---

const ListRow = styled(Link)`
  display: flex;
  align-items: stretch;
  width: 100%; 
  height: ${CARD_HEIGHT}px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${(p) => p.$accent}40;

    .row-arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 320px;
  }
`;

const Thumb = styled.div`
  flex-shrink: 0;
  width: 320px;
  height: 100%;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: ${CARD_HEIGHT}px;

    img {
      height: ${CARD_HEIGHT}px;
      object-fit: cover;
    }
  }
`;

const ContentWrap = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 28px 20px 28px;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: -72px;
    padding: 20px 16px 20px;
    background: rgba(10, 14, 23, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 16px 16px 0 0;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: none;
    gap: 12px;
  }
`;

const OfficialBtnWrap = styled.div`
  position: absolute;
  top: 20px;
  right: 28px;
  z-index: 1;

  @media (max-width: 768px) {
    top: 20px;
    right: 16px;
  }
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const RowHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
`;

const RowRegion = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  font-size: 10px;
  color: ${(p) => p.$accent};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: ${(p) => p.$accent}18;
  border-radius: 6px;
  flex-shrink: 0;
`;

const RowName = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const RowNameCn = styled.span`
  font-size: 13px;
  color: #9aa0a6;
  display: block;
  margin-top: 2px;
`;

const RowDesc = styled.p`
  font-size: 13px;
  color: #b0b5ba;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RowMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
  font-size: 12px;
  color: #8b9096;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  span + span::before {
    content: '·';
    margin: 0 10px;
    color: rgba(255, 255, 255, 0.2);
  }
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 768px) {
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
`;

const SideMeta = styled.div`
  font-size: 12px;
  color: #8b9096;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  @media (max-width: 768px) {
    gap: 8px 16px;
  }
`;

const BtnGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const OfficialBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #b0b5ba;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s, background 0.2s;

  &:hover {
    color: #e8eaed;
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.05);
  }
`;

const EnterLink = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.$accent};
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .row-arrow {
    opacity: 0.85;
    transition: opacity 0.2s, transform 0.2s;
  }
`;

const SpinWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 24px;
`;

const EmptyWrap = styled.div`
  padding: 48px 24px;
  text-align: center;
`;

// --- 3D 特效逻辑组件 ---
// 以「这个板块」的高度为基准：卡片中心在板块正中时最平（0=从下方进入，0.5=正中最平，1=从上方离开）
function computeProgress(sectionEl, cardEl, cardHeight) {
  if (!sectionEl || !cardEl) return 0.5;
  const sr = sectionEl.getBoundingClientRect();
  const cardr = cardEl.getBoundingClientRect();
  const sectionCenterY = sr.top + sr.height / 2;
  const cardCenterY = cardr.top + cardr.height / 2;
  const delta = cardCenterY - sectionCenterY;
  const range = Math.max(1, sr.height - cardHeight);
  const progress = 0.5 - delta / range;
  return Math.max(0, Math.min(1, progress));
}

const WheelItem = ({ children, containerRef, sectionRef }) => {
  const ref = useRef(null);
  const progress = useMotionValue(0.5);
  const smoothProgress = useSpring(progress, { damping: 22, stiffness: 200 });

  const updateProgress = useCallback(() => {
    const section = sectionRef?.current;
    const card = ref.current;
    if (!section || !card) return;
    const p = computeProgress(section, card, CARD_HEIGHT);
    progress.set(p);
  }, [sectionRef, progress]);

  useEffect(() => {
    const container = containerRef?.current;
    const section = sectionRef?.current;
    if (!container || !section) return;
    updateProgress();
    container.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    const ro = new ResizeObserver(updateProgress);
    ro.observe(section);
    return () => {
      container.removeEventListener('scroll', updateProgress);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      ro.disconnect();
    };
  }, [containerRef, sectionRef, updateProgress]);

  // 环小：只有正中一小段最平，其余更斜；倾斜角加大，更多卡片斜着更好看
  /* 只有正中一张是平的：平坦区收窄到 0.49–0.51 */
  const rotateX = useTransform(progress, [0, 0.49, 0.5, 0.51, 1], [72, 0, 0, 0, -72]);
  const scale = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [0.82, 1, 1, 0.82]);
  const opacity = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [0.45, 1, 1, 0.45]);
  const blurValue = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [5, 0, 0, 5]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);

  return (
    <WheelItemWrapper
      ref={ref}
      style={{
        rotateX,
        scale,
        opacity,
        filter,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </WheelItemWrapper>
  );
};

// --- 主组件 ---

const RobotCompaniesSection = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const wheelHandlerRef = useRef(null);

  // 回调 ref：轮盘挂载时绑定滚轮穿透，到顶/底时驱动主页面滚动
  const setContainerRef = useCallback((node) => {
    if (containerRef.current && wheelHandlerRef.current) {
      containerRef.current.removeEventListener('wheel', wheelHandlerRef.current, { capture: true });
      wheelHandlerRef.current = null;
    }
    containerRef.current = node;
    if (!node || list.length === 0) return;
    const onWheel = (e) => {
      const el = containerRef.current;
      if (!el || !el.contains(e.target)) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      // 放宽阈值（约 20px），避免 subpixel/scroll-snap 下无法触发“到底”导致滚轮不传给页面
      const threshold = 20;
      const atTop = scrollTop <= threshold;
      const atBottom = scrollTop >= scrollHeight - clientHeight - threshold;
      const dy = e.deltaY;
      if (atTop && dy < 0) {
        e.preventDefault();
        window.scrollBy(0, dy);
        return;
      }
      if (atBottom && dy > 0) {
        // 只有页面下方还有可滚动空间时才接管滚轮，否则不阻止默认（避免“卡死”感）
        const pageScrollMax = document.documentElement.scrollHeight - window.innerHeight;
        const canScrollPageDown = (document.documentElement.scrollTop ?? 0) < pageScrollMax - 2;
        if (canScrollPageDown) {
          e.preventDefault();
          window.scrollBy(0, dy);
        }
      }
    };
    wheelHandlerRef.current = onWheel;
    node.addEventListener('wheel', onWheel, { passive: false, capture: true });
  }, [list.length]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCompanyList({ currentPage: 1, pageSize: 50, companyStatus: 'active' })
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data?.data) {
          const cards = res.data.data.map(apiCompanyToCard).filter(Boolean);
          setList(cards);
        } else {
          setError(res.message || '加载失败');
          setList([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || '加载失败');
          setList([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <TallSection id="robot-companies" ref={sectionRef}>
      <SectionTitle
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        全球十大机器人公司
      </SectionTitle>
      <SectionSubtitle
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
      >
        滚动浏览最具影响力的企业（2025–2026）
      </SectionSubtitle>

      {loading && (
        <SpinWrap>
          <Spin size="large" />
        </SpinWrap>
      )}

      {!loading && error && (
        <EmptyWrap>
          <Alert type="warning" message={error} showIcon />
        </EmptyWrap>
      )}

      {!loading && !error && list.length === 0 && (
        <EmptyWrap>
          <Empty description="暂无公司数据" />
        </EmptyWrap>
      )}

      {!loading && !error && list.length > 0 && (
        <WheelContainer ref={setContainerRef}>
          <WheelInner>
          {list.map((company, i) => {
            const accent = company.theme?.primary || '#00d4aa';
            
            // 使用 WheelItem 包裹原有的 ListRow
            return (
              <WheelItem key={company.slug || i} containerRef={containerRef} sectionRef={sectionRef}>
                <ListRow
                  to={`/openrobotx/companies/${company.slug}`}
                  $accent={accent}
                  // 移除之前的 motion 属性，由外层 Wrapper 接管动画
                >
                  <Thumb>
                    {company.heroImage ? (
                      <img src={company.heroImage} alt={company.name} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'rgba(0,212,170,0.12)' }} />
                    )}
                  </Thumb>
                  <ContentWrap>
                    {company.officialUrl && (
                      <OfficialBtnWrap>
                        <OfficialBtn
                          href={company.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkOutlined /> 官网
                        </OfficialBtn>
                      </OfficialBtnWrap>
                    )}
                    <Main>
                      <RowHeader>
                        <RowRegion $accent={accent}>
                          <GlobalOutlined /> {company.region || '—'}
                        </RowRegion>
                        <RowName>{company.name}</RowName>
                      </RowHeader>
                      {company.nameCn && <RowNameCn>{company.nameCn}</RowNameCn>}
                      {(company.description || company.tagline) && (
                        <RowDesc>{company.description || company.tagline}</RowDesc>
                      )}
                      <RowMeta>
                        {company.foundedYear && (
                          <span>
                            <CalendarOutlined /> {company.foundedYear} 年成立
                          </span>
                        )}
                        {(company.employeeCount || company.employeeRange) && (
                          <span>
                            <TeamOutlined /> {company.employeeCount || company.employeeRange}
                          </span>
                        )}
                        {company.headquarters && <span>{company.headquarters}</span>}
                        {company.ceo && <span>{company.ceo}</span>}
                      </RowMeta>
                    </Main>
                    <BottomRow>
                      <SideMeta>
                        {company.companyValuationUsd && (
                          <span>
                            <DollarOutlined /> 估值 {company.companyValuationUsd}
                          </span>
                        )}
                        {company.totalFinancingUsd && (
                          <span>融资 {company.totalFinancingUsd}</span>
                        )}
                        {company.latestRound && (
                          <span>{company.latestRound}</span>
                        )}
                      </SideMeta>
                      <BtnGroup>
                        <EnterLink $accent={accent}>
                          进入详情
                          <RightOutlined className="row-arrow" />
                        </EnterLink>
                      </BtnGroup>
                    </BottomRow>
                  </ContentWrap>
                </ListRow>
              </WheelItem>
            );
          })}
          </WheelInner>
        </WheelContainer>
      )}
    </TallSection>
  );
};

export default RobotCompaniesSection;