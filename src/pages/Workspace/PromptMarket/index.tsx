import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Layout, Row, Col, Typography, Input, Button, 
  Tabs, Tag, Avatar, Space, theme, Pagination, message, Spin, Empty 
} from 'antd';
import { 
  SearchOutlined, FireOutlined, HeartFilled, 
  UserOutlined, PlusOutlined, PlayCircleFilled,
  PictureFilled, AudioFilled, ThunderboltFilled
} from '@ant-design/icons';
import styled, { css } from 'styled-components';
import { base } from 'api/base';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import PromptMarketListingCreateFormModel from './PromptMarketListingCreateFormModel';
import PromptMarketDetailModal from './PromptMarketDetailModal';
import PromptMarketDetailMobile from './PromptMarketDetailMobile';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

/** 从 tagNameI18n JSON 解析显示名：中文环境用 zh，否则用 en */
const parseTagLabel = (
  tagNameI18n: string | Record<string, string> | undefined,
  lang?: string
): string => {
  if (!tagNameI18n) return '';
  try {
    const o = typeof tagNameI18n === 'string' ? JSON.parse(tagNameI18n) : tagNameI18n;
    const isZh = lang === 'zh';
    return (isZh ? (o?.zh || o?.en || o?.label) : (o?.en || o?.zh || o?.label)) || '';
  } catch {
    return String(tagNameI18n);
  }
};

const addImageCompressSuffix = (url: string | null | undefined, width = 600): string => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

// --- Styled Components (C端现代化风格) ---

const PageWrapper = styled(Content)`
  min-height: 100vh;
  background: ${props => props.theme.mode === 'dark' ? '#000' : '#f8fafc'};
  overflow-x: hidden;
`;

// 1. Hero 区域：渐变背景 + 居中搜索
const HeroSection = styled.div`
  position: relative;
  padding: 80px 24px 60px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1f1f1f 0%, #000 100%)' 
    : 'linear-gradient(135deg, #eef2f3 0%, #8e9eab 100%)'}; // 示例渐变，可根据品牌色调整
  /* 或者使用更干净的白色背景配合大字体 */
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
  text-align: center;
  margin-bottom: 40px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 100px;
    background: linear-gradient(to top, ${props => props.theme.mode === 'dark' ? '#000' : '#f8fafc'} 0%, transparent 100%);
    pointer-events: none;
  }
`;

const SearchBox = styled.div`
  max-width: 600px;
  margin: 32px auto 0;
  position: relative;
  z-index: 10;

  .ant-input-affix-wrapper {
    padding: 12px 24px;
    border-radius: 50px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    border: 1px solid transparent;
    transition: all 0.3s;
    
    &:hover, &:focus-within {
      box-shadow: 0 15px 40px rgba(0,0,0,0.12);
      border-color: var(--ant-primary-color);
    }
    input { font-size: 16px; }
  }
`;

// 2. 内容容器：限制最大宽度，保持在大屏下的阅读体验
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 60px;
`;

// 3. 筛选栏：胶囊风格
const FilterSection = styled.div`
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CategoryTabs = styled(Tabs)`
  .ant-tabs-nav { margin: 0 !important; }
  .ant-tabs-nav::before { display: none; } /* 去掉底部灰线 */
  .ant-tabs-ink-bar { display: none !important; } /* 去掉选中时的蓝色横线，用胶囊背景表示选中 */
  
  .ant-tabs-tab {
    padding: 8px 20px;
    border-radius: 20px;
    background: transparent;
    transition: all 0.3s;
    margin: 0 8px 0 0;
    font-weight: 500;
    
    &:hover { background: rgba(0,0,0,0.03); }
    
    &.ant-tabs-tab-active {
      background: #000; // 选中态黑色背景 (Light Mode)
      .ant-tabs-tab-btn { color: #fff !important; }
    }
  }
  
  /* Dark Mode 适配 */
  ${props => props.theme.mode === 'dark' && css`
    .ant-tabs-tab.ant-tabs-tab-active {
      background: #fff;
      .ant-tabs-tab-btn { color: #000 !important; }
    }
  `}
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag-item {
    cursor: pointer;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 13px;
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#e2e8f0'};
    color: ${props => props.theme.mode === 'dark' ? '#aaa' : '#64748b'};
    transition: all 0.2s;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }

    &.active {
      background: rgba(24, 144, 255, 0.1);
      border-color: #1890ff;
      color: #1890ff;
      font-weight: 600;
    }
  }
`;

// 4. 卡片设计：无边框，强阴影，沉浸式
const MarketCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    
    .cover-img { transform: scale(1.05); }
    .overlay-actions { opacity: 1; }
  }
`;

const CoverArea = styled.div`
  width: 100%;
  padding-top: 100%; // 1:1 方形封面，或者改为 75% (4:3)
  position: relative;
  overflow: hidden;
  background: #f0f0f0;

  .cover-img {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
`;

const TypeBadge = styled.div`
  position: absolute; top: 12px; left: 12px;
  background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px);
  color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
  display: flex; align-items: center; gap: 4px; z-index: 2;
`;

// 价格标签：悬浮在图片右下角
const PriceFloat = styled.div<{ $isFree: boolean }>`
  position: absolute; bottom: 12px; right: 12px;
  background: ${props => props.$isFree ? 'rgba(82, 196, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.$isFree ? '#fff' : '#000'};
  padding: 6px 12px; border-radius: 30px; font-weight: 700; font-size: 13px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15); z-index: 2;
  display: flex; align-items: center; gap: 4px;
`;

const CardInfo = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TitleRow = styled.div`
  margin-bottom: 8px;
  
  h4 {
    font-size: 15px; font-weight: 600; margin: 0; line-height: 1.4;
    overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f2937'};
  }
`;

const FooterRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-top: auto;
  
  .author {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: ${props => props.theme.mode === 'dark' ? '#888' : '#64748b'};
    
    span { max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }

  .stats {
    display: flex; gap: 12px; font-size: 12px; color: ${props => props.theme.mode === 'dark' ? '#666' : '#94a3b8'};
    div { display: flex; align-items: center; gap: 4px; }
  }
`;

const SortButton = styled(Button)<{ $active?: boolean; $primary?: string }>`
  color: ${props => props.$active ? props.$primary : 'inherit'} !important;
  font-weight: ${props => props.$active ? '600' : '400'};
  
  &:hover { color: ${props => props.$primary} !important; }
`;

// --- Main Component ---

const PromptMarket: React.FC = () => {
  const { token } = theme.useToken();
  const intl = useIntl();
  const { locale } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  
  // Filters
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  /** 选中的标签 tagCode，null 表示「全部」 */
  const [selectedTagCode, setSelectedTagCode] = useState<string | null>(null);
  const [sort, setSort] = useState('latest');
  
  // 热门标签（从后端获取，按当前语言显示）
  const [hotTags, setHotTags] = useState<{ tagCode: string; label: string }[]>([]);
  
  // Data
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const lang = locale || 'zh';
  const allLabel = intl.formatMessage({ id: 'promptMarket.all', defaultMessage: '全部' });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const listingIdParam = searchParams.get('listingId');
    if (!listingIdParam) return;
    const id = Number(listingIdParam);
    if (!Number.isFinite(id) || id <= 0) return;
    setSelectedListingId(id);
    setDetailModalVisible(true);
    const next = new URLSearchParams(searchParams);
    next.delete('listingId');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // 页面加载时拉取热门标签，按当前语言显示
  useEffect(() => {
    const load = async () => {
      const res = await base.getPromptTagLibraryRecommend();
      if (res?.success && Array.isArray(res?.data)) {
        const items = res.data
          .map((item: { id?: number; tagCode?: string; tagNameI18n?: string }) => ({
            tagCode: item.tagCode != null ? String(item.tagCode) : String(item.id ?? ''),
            label: parseTagLabel(item.tagNameI18n, lang) || item.tagCode || String(item.id ?? ''),
          }))
          .filter((o: { tagCode: string; label: string }) => o.tagCode && o.label);
        setHotTags(items);
      }
    };
    load();
  }, [lang]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const params: Record<string, any> = {
      currentPage,
      pageSize,
      sort: sort === 'hot' ? 'hot' : sort === 'sales' ? 'sales' : 'latest',
    };
    if (activeTab && activeTab !== 'ALL') params.listingType = activeTab;
    if (keyword) params.title = keyword;
    if (selectedTagCode) params.tag = selectedTagCode;
    
    try {
      const res = await base.getPromptMarketListingList(params);
      if (res?.success && res?.data) {
        setList(res.data.data || []);
        setTotal(res.data.totalNum ?? 0);
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'promptMarket.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeTab, keyword, selectedTagCode, sort]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearch = () => {
    setKeyword(searchInput.trim());
    setCurrentPage(1);
  };

  const handleCreate = async (values: any) => {
    const priceToken = Number(values.priceToken) ?? 0;
    const isPromptHidden = priceToken === 0 ? false : (values.isPromptHidden !== false);
    // 仅传后端 PromptMarketListingCreateRequest 支持的字段，避免 status/auditStatus/userId 等导致 JSON parse error
    const payload = {
      originalTaskId: values.originalTaskId ? Number(values.originalTaskId) : undefined,
      listingType: values.listingType,
      title: values.title,
      description: values.description,
      coverImageUrl: values.coverImageUrl,
      previewImages: values.previewImages,
      priceToken,
      originalPriceToken: values.originalPriceToken != null ? Number(values.originalPriceToken) : undefined,
      licenseType: values.licenseType,
      parameterSnapshot: values.parameterSnapshot,
      isPromptHidden: isPromptHidden ? 1 : 0,
      modelType: values.modelType,
      baseModelVersion: values.baseModelVersion,
      tags: typeof values.tags === 'string' ? values.tags : JSON.stringify(values.tags || []),
    };
    const res = await base.createPromptMarketListing(payload);
    if (res?.success) {
      message.success(intl.formatMessage({ id: 'promptMarket.listSuccess', defaultMessage: '上架成功' }));
      setCreateModalVisible(false);
      fetchList();
    } else {
      message.error(res?.message || intl.formatMessage({ id: 'promptMarket.listFailed', defaultMessage: '上架失败' }));
    }
  };

  return (
    <PageWrapper>
      {/* 1. Hero Area */}
      <HeroSection>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Title level={1} style={{ fontSize: '3rem', margin: '0 0 16px' }}>
            <FormattedMessage id="promptMarket.title" defaultMessage="Prompt Market" />
          </Title>
          <Paragraph style={{ fontSize: '18px', color: token.colorTextSecondary, maxWidth: 600, margin: '0 auto' }}>
            <FormattedMessage id="promptMarket.subtitle" defaultMessage="探索顶级创作者的 AI 灵感配方，释放无限创意潜能" />
          </Paragraph>
          
          <SearchBox>
            <Input 
              prefix={<SearchOutlined style={{ fontSize: 18, color: '#999', marginRight: 8 }} />} 
              placeholder={intl.formatMessage({ id: 'promptMarket.searchPlaceholder', defaultMessage: '搜索 Prompt、风格、模型...' })}
              size="large"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              suffix={
                <Button type="primary" shape="round" onClick={handleSearch}>
                  <FormattedMessage id="promptMarket.search" defaultMessage="搜索" />
                </Button>
              }
            />
          </SearchBox>
        </div>
      </HeroSection>

      <Container>
        {/* 2. Controls & Filters */}
        <FilterSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <CategoryTabs 
              activeKey={activeTab} 
              onChange={(k) => { setActiveTab(k); setCurrentPage(1); }}
              items={[
                { key: 'ALL', label: <FormattedMessage id="promptMarket.tabAll" defaultMessage="全部推荐" /> },
                { key: 'IMAGE', label: <span><PictureFilled /> <FormattedMessage id="promptMarket.tabImage" defaultMessage="文生图" /></span> },
                { key: 'VIDEO', label: <span><PlayCircleFilled /> <FormattedMessage id="promptMarket.tabVideo" defaultMessage="文生视频" /></span> },
                { key: 'AUDIO', label: <span><AudioFilled /> <FormattedMessage id="promptMarket.tabAudio" defaultMessage="文生音乐" /></span> },
              ]}
            />
            
            <Space size={16}>
              <Space size={4}>
                <SortButton type="text" $primary={token.colorPrimary} $active={sort === 'latest'} onClick={() => setSort('latest')}><FormattedMessage id="promptMarket.sortLatest" defaultMessage="最新上架" /></SortButton>
                <SortButton type="text" $primary={token.colorPrimary} $active={sort === 'hot'} onClick={() => setSort('hot')}><FormattedMessage id="promptMarket.sortHot" defaultMessage="热门收藏" /></SortButton>
                <SortButton type="text" $primary={token.colorPrimary} $active={sort === 'sales'} onClick={() => setSort('sales')}><FormattedMessage id="promptMarket.sortSales" defaultMessage="销量榜" /></SortButton>
              </Space>
              <Button type="primary" shape="round" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} size="large">
                <FormattedMessage id="promptMarket.publish" defaultMessage="发布作品" />
              </Button>
            </Space>
          </div>

          <TagList>
            <div
              key="all"
              className={`tag-item ${selectedTagCode === null ? 'active' : ''}`}
              onClick={() => { setSelectedTagCode(null); setCurrentPage(1); }}
            >
              {allLabel}
            </div>
            {hotTags.map((t) => (
              <div
                key={t.tagCode}
                className={`tag-item ${selectedTagCode === t.tagCode ? 'active' : ''}`}
                onClick={() => { setSelectedTagCode(t.tagCode); setCurrentPage(1); }}
              >
                {t.label}
              </div>
            ))}
          </TagList>
        </FilterSection>

        {/* 3. Card Grid */}
        <Spin spinning={loading} size="large" style={{ minHeight: 300 }}>
          {list.length === 0 && !loading ? (
            <Empty description={intl.formatMessage({ id: 'promptMarket.empty', defaultMessage: '暂无相关商品，快来发布第一个吧！' })} style={{ padding: '60px 0' }} />
          ) : (
            <Row gutter={[24, 24]}>
              {list.map((item) => {
                const coverUrl = addImageCompressSuffix(item.coverImageUrl, 600);
                const type = item.listingType || 'IMAGE';
                
                return (
                  <Col xs={24} sm={12} md={8} lg={6} xl={6} key={item.id}>
                    <MarketCard onClick={() => { setSelectedListingId(item.id); setDetailModalVisible(true); }}>
                      <CoverArea>
                        <img className="cover-img" src={coverUrl} alt={item.title} loading="lazy" />
                        
                        <TypeBadge>
                          {type === 'VIDEO' ? <PlayCircleFilled /> : <PictureFilled />}
                          {type}
                        </TypeBadge>
                        
                        <PriceFloat $isFree={item.priceToken === 0}>
                          {item.priceToken === 0
                            ? <FormattedMessage id="promptMarket.free" defaultMessage="免费" />
                            : (
                            <>
                              <ThunderboltFilled style={{ color: '#faad14' }} />
                              {item.priceToken} <FormattedMessage id="promptMarket.token" defaultMessage="TOKEN" />
                            </>
                          )}
                        </PriceFloat>
                      </CoverArea>

                      <CardInfo>
                        <TitleRow>
                          <h4>{item.title}</h4>
                        </TitleRow>
                        
                        <FooterRow>
                          <div className="author">
                            <Avatar size={22} src={item.creatorAvatar} icon={<UserOutlined />} />
                            <span>{item.creatorName || `User_${item.userId}`}</span>
                          </div>
                          <div className="stats">
                            <div><HeartFilled style={{ color: item.favoriteCount > 0 ? '#ff4d4f' : 'inherit' }} /> {item.favoriteCount || 0}</div>
                            <div><FireOutlined /> {item.salesCount || 0}</div>
                          </div>
                        </FooterRow>
                      </CardInfo>
                    </MarketCard>
                  </Col>
                );
              })}
            </Row>
          )}
        </Spin>

        {/* 4. Pagination */}
        {total > 0 && (
          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <Pagination 
              current={currentPage} 
              total={total} 
              pageSize={pageSize}
              showSizeChanger={false}
              onChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>
        )}
      </Container>

      <PromptMarketListingCreateFormModel
        isVisible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onFinish={handleCreate}
        t={(id: string, defaultMessage?: string) => intl.formatMessage({ id, defaultMessage: defaultMessage ?? id })}
      />

      {isMobile ? (
        <PromptMarketDetailMobile
          visible={detailModalVisible}
          onCancel={() => { setDetailModalVisible(false); setSelectedListingId(null); }}
          listingId={selectedListingId}
          locale={lang}
        />
      ) : (
        <PromptMarketDetailModal
          visible={detailModalVisible}
          onCancel={() => { setDetailModalVisible(false); setSelectedListingId(null); }}
          listingId={selectedListingId}
          locale={lang}
        />
      )}
    </PageWrapper>
  );
};

export default PromptMarket;