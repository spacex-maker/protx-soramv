import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Input, Pagination, Spin, Empty } from 'antd';
import { SearchOutlined, CalendarOutlined, TagOutlined, AppstoreOutlined, UnorderedListOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { useLocale } from 'contexts/LocaleContext';
import OpenRobotXHeader from '../components/OpenRobotXHeader';
import FooterSection from '../components/FooterSection';
import { PageContainer } from '../styles';
import { getNewsList } from '../../../api/openrobotx';

const addImageCompressSuffix = (url, width = 400) => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const NEWS_TYPE_TAGS = [
  { value: null, label: '全部类型' },
  { value: 1, label: '快讯' },
  { value: 2, label: '深度文章' },
  { value: 3, label: '融资财报' },
  { value: 4, label: '发布会' },
];

const PageWrap = styled(PageContainer)`
  padding-top: 72px;
`;

const Hero = styled.section`
  padding: 64px 24px 48px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  @media (max-width: 768px) {
    padding: 48px 16px 32px;
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
  font-size: 17px;
  color: #9aa0a6;
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
  @media (max-width: 768px) {
    padding: 0 16px 48px;
  }
`;

const SectionTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
`;

const Filters = styled.div`
  flex: 1;
  min-width: 0;
`;

const LayoutToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.04);
    color: #9aa0a6;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    &:hover {
      color: #e8eaed;
      border-color: rgba(0, 212, 170, 0.4);
    }
    &.active {
      background: rgba(0, 212, 170, 0.15);
      border-color: #00d4aa;
      color: #00d4aa;
    }
  }
`;

const TypeTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const TypeTag = styled.button`
  padding: 8px 18px;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  color: #9aa0a6;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  &:hover {
    border-color: rgba(0, 212, 170, 0.5);
    color: #e8eaed;
  }
  &.active {
    background: #00d4aa;
    border-color: #00d4aa;
    color: #0a0e17;
    font-weight: 600;
  }
`;

const SearchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  .ant-input-affix-wrapper {
    border-radius: 9999px;
    max-width: 280px;
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  .ant-input-affix-wrapper-focused {
    border-color: rgba(0, 212, 170, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.1);
  }
  .ant-input {
    background: transparent !important;
    border-radius: 9999px;
    color: #e8eaed !important;
  }
  .ant-input::placeholder { color: #6b7280; }
  .ant-input-prefix { color: #9aa0a6; margin-left: 4px; }
`;

const SearchBtn = styled.button`
  padding: 8px 24px;
  border-radius: 9999px;
  background: #00d4aa;
  color: #0a0e17;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.article`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  &:hover {
    border-color: rgba(0, 212, 170, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    transform: translateY(-2px);
  }
  ${(p) =>
    p.$list &&
    `
    flex-direction: row;
    .news-card-body {
      min-width: 0;
    }
    .news-card-title {
      -webkit-line-clamp: 1;
    }
    .news-card-summary {
      -webkit-line-clamp: 2;
    }
  `}
`;

/* 用 padding-bottom 比例固定高度，避免 flex 下 aspect-ratio 不生效导致封面高度塌陷 */
const CardCover = styled.div.attrs({ className: 'news-cover-wrap' })`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 62.5%; /* 10/16 */
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.4);
  overflow: hidden;
  img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
`;

/** 列表布局专用封面：宽度固定 200px，高度随卡片拉伸填满整条左侧，背景图铺满 */
const ListCover = styled.div`
  width: 200px;
  min-width: 200px;
  flex-shrink: 0;
  align-self: stretch;
  background-color: rgba(0, 0, 0, 0.4);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const CardBody = styled.div.attrs({ className: 'news-card-body' })`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`;

const CardType = styled.span`
  display: inline-block;
  font-size: 12px;
  color: #00d4aa;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const CardSource = styled.span`
  font-size: 12px;
  color: #6b7280;
  margin-left: auto;
  flex-shrink: 0;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardTitle = styled.h2.attrs({ className: 'news-card-title' })`
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardSummary = styled.p.attrs({ className: 'news-card-summary' })`
  font-size: 14px;
  color: #9aa0a6;
  line-height: 1.55;
  margin: 0 0 14px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
  margin-top: auto;
  .anticon { font-size: 12px; }
  .card-meta-time {
    white-space: nowrap;
    flex-shrink: 0;
  }
  .card-meta-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .card-meta-right {
    margin-left: auto;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 45%;
    min-width: 0;
  }
`;

const PaginationWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 48px;
  .ant-pagination-item, .ant-pagination-prev, .ant-pagination-next {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    a { color: #e8eaed !important; }
  }
  .ant-pagination-item-active {
    border-color: #00d4aa !important;
    a { color: #00d4aa !important; }
  }
  .ant-pagination-item:hover, .ant-pagination-prev:hover, .ant-pagination-next:hover {
    border-color: rgba(0, 212, 170, 0.4) !important;
  }
  .ant-pagination-disabled a { color: #6b7280 !important; }
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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const getTypeLabel = (newsType) => {
  const o = NEWS_TYPE_TAGS.find((x) => x.value === newsType);
  return o ? o.label : '资讯';
};

/** 根据当前语言取资讯标题（中文优先 / 英文优先） */
const getNewsTitle = (item, isZh) =>
  isZh ? (item.titleCn || item.title || '') : (item.title || item.titleCn || '');
/** 根据当前语言取资讯摘要 */
const getNewsSummary = (item, isZh) =>
  isZh ? (item.summaryCn || item.summary || '') : (item.summary || item.summaryCn || '');

const NewsListPage = () => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  // 与 LocaleContext 一致：context 暴露的是短代码 'zh' | 'en'
  const isZh = !locale || locale === 'zh-CN' || String(locale).toLowerCase().startsWith('zh');
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [newsType, setNewsType] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'

  const fetchList = async (page = 1) => {
    setLoading(true);
    const res = await getNewsList({
      currentPage: page,
      pageSize,
      newsType: newsType ?? undefined,
      keyword: keyword.trim() || undefined,
    });
    setLoading(false);
    if (res.success && res.data) {
      setList(res.data.data || []);
      setTotal(res.data.totalNum || 0);
    } else {
      setList([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, newsType]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchList(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageWrap>
      <Helmet>
        <title>行业资讯 | Open Robot X</title>
        <meta name="description" content="人形机器人与具身智能行业资讯、快讯、深度文章与融资动态。" />
      </Helmet>
      <OpenRobotXHeader />
      <Hero>
        <HeroTitle>行业资讯</HeroTitle>
        <HeroSubtitle>
          人形机器人、具身智能与开源机器人领域的最新动态、深度解读与融资财报
        </HeroSubtitle>
      </Hero>
      <Section>
        <SectionTop>
          <Filters>
            <TypeTags>
              {NEWS_TYPE_TAGS.map(({ value, label }) => (
                <TypeTag
                  key={value === null ? 'all' : value}
                  type="button"
                  className={newsType === value ? 'active' : ''}
                  onClick={() => {
                    setNewsType(value);
                    setCurrentPage(1);
                  }}
                >
                  {label}
                </TypeTag>
              ))}
            </TypeTags>
            <SearchRow>
              <Input
                placeholder="搜索标题或摘要"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 240 }}
                allowClear
              />
              <SearchBtn type="button" onClick={handleSearch}>
                搜索
              </SearchBtn>
            </SearchRow>
          </Filters>
          <LayoutToggle>
            <button
              type="button"
              className={layoutMode === 'grid' ? 'active' : ''}
              onClick={() => setLayoutMode('grid')}
              title="方块布局"
              aria-label="方块布局"
            >
              <AppstoreOutlined />
            </button>
            <button
              type="button"
              className={layoutMode === 'list' ? 'active' : ''}
              onClick={() => setLayoutMode('list')}
              title="列表布局"
              aria-label="列表布局"
            >
              <UnorderedListOutlined />
            </button>
          </LayoutToggle>
        </SectionTop>

        {loading ? (
          <SpinWrap>
            <Spin size="large" />
          </SpinWrap>
        ) : list.length === 0 ? (
          <EmptyWrap>
            <Empty description="暂无资讯" />
          </EmptyWrap>
        ) : (
          <>
            {layoutMode === 'grid' ? (
              <CardGrid>
                {list.map((item) => {
                  const title = getNewsTitle(item, isZh);
                  const summary = getNewsSummary(item, isZh);
                  return (
                    <Card key={item.id} onClick={() => navigate(`/openrobotx/news/${item.id}`)}>
                      <CardCover>
                        {item.coverImage ? (
                          <img src={addImageCompressSuffix(item.coverImage, 400)} alt="" loading="lazy" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)' }} />
                        )}
                      </CardCover>
                      <CardBody>
                        <CardTopRow>
                          <CardType>{getTypeLabel(item.newsType)}</CardType>
                          {item.sourceName && <CardSource>{item.sourceName}</CardSource>}
                        </CardTopRow>
                        <CardTitle>{title}</CardTitle>
                        <CardSummary>{summary}</CardSummary>
                        <CardMeta>
                          {item.publishTime && (
                            <span className="card-meta-time"><CalendarOutlined /> {formatDate(item.publishTime)}</span>
                          )}
                          <span className="card-meta-stats">
                            <span><EyeOutlined /> {item.viewCount ?? 0}</span>
                            <span><LikeOutlined /> {item.likeCount ?? 0}</span>
                          </span>
                          {item.tags && (
                            <span className="card-meta-right"><TagOutlined /> {String(item.tags).split(',').slice(0, 2).join(', ')}</span>
                          )}
                        </CardMeta>
                      </CardBody>
                    </Card>
                  );
                })}
              </CardGrid>
            ) : (
              <CardList>
                {list.map((item) => {
                  const title = getNewsTitle(item, isZh);
                  const summary = getNewsSummary(item, isZh);
                  return (
                    <Card key={item.id} $list onClick={() => navigate(`/openrobotx/news/${item.id}`)}>
                      <ListCover
                        style={
                          item.coverImage
                            ? { backgroundImage: `url(${addImageCompressSuffix(item.coverImage, 400)})` }
                            : { background: 'linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)' }
                        }
                      />
                      <CardBody>
                      <CardTopRow>
                        <CardType>{getTypeLabel(item.newsType)}</CardType>
                        {item.sourceName && <CardSource>{item.sourceName}</CardSource>}
                      </CardTopRow>
                      <CardTitle>{title}</CardTitle>
                      <CardSummary>{summary}</CardSummary>
                      <CardMeta>
                        {item.publishTime && (
                          <span className="card-meta-time"><CalendarOutlined /> {formatDate(item.publishTime)}</span>
                        )}
                        <span className="card-meta-stats">
                          <span><EyeOutlined /> {item.viewCount ?? 0}</span>
                          <span><LikeOutlined /> {item.likeCount ?? 0}</span>
                        </span>
                        {item.tags && (
                          <span className="card-meta-right"><TagOutlined /> {String(item.tags).split(',').slice(0, 2).join(', ')}</span>
                        )}
                      </CardMeta>
                    </CardBody>
                  </Card>
                );
              })}
            </CardList>
            )}
            {total > pageSize && (
              <PaginationWrap>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(t) => `共 ${t} 条`}
                />
              </PaginationWrap>
            )}
          </>
        )}
      </Section>
      <FooterSection />
    </PageWrap>
  );
};

export default NewsListPage;
