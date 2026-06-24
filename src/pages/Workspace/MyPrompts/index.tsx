import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Spin, Typography, Input, Button, message, Empty, Pagination, Tooltip,
} from 'antd';
import {
  FileTextOutlined,
  SearchOutlined,
  SettingOutlined,
  CopyOutlined,
  ThunderboltFilled,
  CrownOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { base } from 'api/base';
import BuyoutPricingModal, { type BuyoutPricingSavePayload } from './BuyoutPricingModal';

const { Title, Text, Paragraph } = Typography;

const addImageCompressSuffix = (url: string | null | undefined, width = 480): string => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const PageWrapper = styled.div`
  min-height: 100%;
  background: ${(p) => (p.theme.mode === 'dark' ? '#0a0a0a' : '#f8fafc')};
`;

const HeroSection = styled.div`
  position: relative;
  padding: 48px 24px 36px;
  text-align: center;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)'
      : 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)'};
  border-bottom: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#1f1f1f' : '#e8ecf0')};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.12), transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(250, 173, 20, 0.08), transparent 45%);
    pointer-events: none;
  }
`;

const HeroIcon = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
`;

const SearchBox = styled.div`
  max-width: 520px;
  margin: 24px auto 0;
  position: relative;
  z-index: 1;

  .ant-input-affix-wrapper {
    padding: 10px 20px;
    border-radius: 999px;
    box-shadow: ${(p) =>
      p.theme.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.06)'};
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#303030' : '#e2e8f0')};
    background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
    transition: all 0.25s;

    &:hover,
    &:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
    }
  }
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px 48px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 28px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div<{ $accent?: string }>`
  padding: 16px 18px;
  border-radius: 14px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#262626' : '#e8ecf0')};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(p) =>
      p.theme.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(0,0,0,0.06)'};
  }

  .stat-value {
    font-size: 26px;
    font-weight: 800;
    line-height: 1.2;
    color: ${(p) => p.$accent || (p.theme.mode === 'dark' ? '#f0f0f0' : '#1f2937')};
  }

  .stat-label {
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? '#8c8c8c' : '#64748b')};
    margin-top: 4px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
`;

const FilterPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterPill = styled.button<{ $active?: boolean }>`
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  cursor: pointer;
  border: 1px solid
    ${(p) =>
      p.$active
        ? '#3b82f6'
        : p.theme.mode === 'dark'
          ? '#333'
          : '#e2e8f0'};
  background: ${(p) =>
    p.$active
      ? p.theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(59, 130, 246, 0.08)'
      : p.theme.mode === 'dark'
        ? '#141414'
        : '#fff'};
  color: ${(p) =>
    p.$active ? '#3b82f6' : p.theme.mode === 'dark' ? '#a3a3a3' : '#64748b'};
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const PromptListCard = styled.article`
  display: flex;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#262626' : '#e8ecf0')};
  transition: box-shadow 0.25s, transform 0.25s;

  &:hover {
    box-shadow: ${(p) =>
      p.theme.mode === 'dark' ? '0 12px 40px rgba(0,0,0,0.35)' : '0 12px 40px rgba(0,0,0,0.08)'};
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const CoverSide = styled.div`
  width: 200px;
  min-height: 180px;
  flex-shrink: 0;
  position: relative;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1a1a1a' : '#f1f5f9')};

  img {
    width: 100%;
    height: 100%;
    min-height: 180px;
    object-fit: cover;
  }

  @media (max-width: 640px) {
    width: 100%;
    min-height: 160px;
  }
`;

const CoverPlaceholder = styled.div`
  width: 100%;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => (p.theme.mode === 'dark' ? '#404040' : '#94a3b8')};
  font-size: 40px;
`;

const ContentSide = styled.div`
  flex: 1;
  padding: 20px 22px;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
`;

const TypeChip = styled.span<{ $variant: 'buyout' | 'view' | 'auth' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;

  ${(p) =>
    p.$variant === 'buyout' &&
    css`
      background: rgba(250, 140, 22, 0.12);
      color: #fa8c16;
      border: 1px solid rgba(250, 140, 22, 0.25);
    `}
  ${(p) =>
    p.$variant === 'view' &&
    css`
      background: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.25);
    `}
  ${(p) =>
    p.$variant === 'auth' &&
    css`
      background: rgba(82, 196, 26, 0.12);
      color: #52c41a;
      border: 1px solid rgba(82, 196, 26, 0.25);
    `}
`;

const PromptCode = styled.pre`
  margin: 12px 0 0;
  padding: 14px 16px;
  max-height: 140px;
  overflow: auto;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#0d0d0d' : '#f8fafc')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#262626' : '#e2e8f0')};
  color: ${(p) => (p.theme.mode === 'dark' ? '#d4d4d8' : '#475569')};
`;

const CardFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#262626' : '#f0f0f0')};
`;

const PricingStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const PriceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1f1f1f' : '#f1f5f9')};
  color: ${(p) => (p.theme.mode === 'dark' ? '#d4d4d8' : '#475569')};

  .token {
    color: #faad14;
  }
`;

type FilterType = 'ALL' | 'BUYOUT' | 'VIEW' | 'AUTH';

interface AcquiredItem {
  listingId: number;
  title?: string;
  coverImageUrl?: string;
  priceToken?: number;
  buyoutPriceToken?: number;
  isBuyoutHolder?: boolean;
  hasViewPurchase?: boolean;
  hasAuthPurchase?: boolean;
  buyoutActive?: boolean;
  transferBuyoutPriceToken?: number;
  authPriceToken?: number;
  transferBuyoutEnabled?: boolean;
  authEnabled?: boolean;
  buyoutPurchasePriceToken?: number;
  effectiveTransferBuyoutPrice?: number;
  effectiveAuthPrice?: number;
  prompt?: string;
  creatorName?: string;
  acquiredTime?: string;
}

const MyPromptsPage: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<AcquiredItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [pricingModal, setPricingModal] = useState<AcquiredItem | null>(null);
  const [pricingSaving, setPricingSaving] = useState(false);

  const pageSize = 10;

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await base.getMyAcquiredPrompts({
        currentPage: page,
        pageSize,
        title: keyword || undefined,
      });
      if (res?.success) {
        setList(res.data?.data || []);
        setTotal(res.data?.totalNum || 0);
      } else {
        message.error(res?.message || intl.formatMessage({ id: 'myPrompts.loadFailed', defaultMessage: '加载失败' }));
      }
    } finally {
      setLoading(false);
    }
  }, [page, keyword, intl]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filteredList = useMemo(() => {
    if (filter === 'ALL') return list;
    if (filter === 'BUYOUT') return list.filter((i) => i.isBuyoutHolder);
    if (filter === 'VIEW') return list.filter((i) => i.hasViewPurchase);
    if (filter === 'AUTH') return list.filter((i) => i.hasAuthPurchase);
    return list;
  }, [list, filter]);

  const stats = useMemo(() => ({
    total: total,
    buyout: list.filter((i) => i.isBuyoutHolder).length,
    view: list.filter((i) => i.hasViewPurchase).length,
    auth: list.filter((i) => i.hasAuthPurchase).length,
  }), [list, total]);

  const openPricing = (item: AcquiredItem) => {
    setPricingModal(item);
  };

  const savePricing = async (payload: BuyoutPricingSavePayload) => {
    if (!pricingModal) return;
    setPricingSaving(true);
    try {
      const res: any = await base.updatePromptMarketBuyoutPricing({
        listingId: pricingModal.listingId,
        ...payload,
      });
      if (res?.success) {
        message.success(intl.formatMessage({ id: 'myPrompts.pricingSaved', defaultMessage: '定价已保存' }));
        setPricingModal(null);
        fetchList();
      } else {
        message.error(res?.message || intl.formatMessage({ id: 'myPrompts.pricingFailed', defaultMessage: '保存失败' }));
      }
    } finally {
      setPricingSaving(false);
    }
  };

  const copyPrompt = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success(intl.formatMessage({ id: 'myPrompts.copied', defaultMessage: '提示词已复制' }));
  };

  const handleSearch = () => {
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: intl.formatMessage({ id: 'myPrompts.filterAll', defaultMessage: '全部' }) },
    { key: 'BUYOUT', label: intl.formatMessage({ id: 'myPrompts.filterBuyout', defaultMessage: '买断持有' }) },
    { key: 'VIEW', label: intl.formatMessage({ id: 'myPrompts.filterView', defaultMessage: '已购查看' }) },
    { key: 'AUTH', label: intl.formatMessage({ id: 'myPrompts.filterAuth', defaultMessage: '已获授权' }) },
  ];

  return (
    <PageWrapper>
      <HeroSection>
        <HeroIcon><FileTextOutlined /></HeroIcon>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
          <FormattedMessage id="myPrompts.title" defaultMessage="我的提示词" />
        </Title>
        <Paragraph type="secondary" style={{ maxWidth: 520, margin: '10px auto 0', fontSize: 14 }}>
          <FormattedMessage
            id="myPrompts.subtitle"
            defaultMessage="查看您已购买或买断的提示词作品。买断持有人可主动开启转让买断与授权查看，并设置相应价格。"
          />
        </Paragraph>
        <SearchBox>
          <Input
            size="large"
            placeholder={intl.formatMessage({ id: 'myPrompts.searchPlaceholder', defaultMessage: '搜索作品标题' })}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            suffix={
              <Button type="primary" size="small" shape="round" onClick={handleSearch}>
                <FormattedMessage id="common.search" defaultMessage="搜索" />
              </Button>
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
        </SearchBox>
      </HeroSection>

      <Container>
        <StatsRow>
          <StatCard $accent="#3b82f6">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">
              <FormattedMessage id="myPrompts.statTotal" defaultMessage="已拥有作品" />
            </div>
          </StatCard>
          <StatCard $accent="#fa8c16">
            <div className="stat-value">{stats.buyout}</div>
            <div className="stat-label">
              <FormattedMessage id="myPrompts.statBuyout" defaultMessage="买断持有" />
            </div>
          </StatCard>
          <StatCard $accent="#3b82f6">
            <div className="stat-value">{stats.view}</div>
            <div className="stat-label">
              <FormattedMessage id="myPrompts.statView" defaultMessage="已购查看" />
            </div>
          </StatCard>
          <StatCard $accent="#52c41a">
            <div className="stat-value">{stats.auth}</div>
            <div className="stat-label">
              <FormattedMessage id="myPrompts.statAuth" defaultMessage="已获授权" />
            </div>
          </StatCard>
        </StatsRow>

        <FilterBar>
          <FilterPills>
            {filterOptions.map((opt) => (
              <FilterPill
                key={opt.key}
                type="button"
                $active={filter === opt.key}
                onClick={() => setFilter(opt.key)}
              >
                {opt.label}
              </FilterPill>
            ))}
          </FilterPills>
          <Button
            type="default"
            shape="round"
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/workspace/prompt-market')}
          >
            <FormattedMessage id="myPrompts.goMarket" defaultMessage="去提示词商城" />
          </Button>
        </FilterBar>

        <Spin spinning={loading}>
          {filteredList.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({ id: 'myPrompts.empty', defaultMessage: '暂无已购提示词' })}
              style={{ padding: '48px 0' }}
            >
              <Button type="primary" shape="round" onClick={() => navigate('/workspace/prompt-market')}>
                <FormattedMessage id="myPrompts.browseMarket" defaultMessage="浏览提示词商城" />
              </Button>
            </Empty>
          ) : (
            <>
              {filteredList.map((item) => {
                const cover = addImageCompressSuffix(item.coverImageUrl, 400);
                return (
                  <PromptListCard key={item.listingId}>
                    <CoverSide>
                      {cover ? (
                        <img src={cover} alt={item.title || ''} loading="lazy" />
                      ) : (
                        <CoverPlaceholder><FileTextOutlined /></CoverPlaceholder>
                      )}
                    </CoverSide>
                    <ContentSide>
                      <TagRow>
                        {item.isBuyoutHolder && (
                          <TypeChip $variant="buyout">
                            <CrownOutlined /> {intl.formatMessage({ id: 'myPrompts.tagBuyoutHolder', defaultMessage: '买断持有' })}
                          </TypeChip>
                        )}
                        {item.hasViewPurchase && (
                          <TypeChip $variant="view">
                            <EyeOutlined /> {intl.formatMessage({ id: 'myPrompts.tagViewPurchase', defaultMessage: '已购查看' })}
                          </TypeChip>
                        )}
                        {item.hasAuthPurchase && (
                          <TypeChip $variant="auth">
                            <SafetyCertificateOutlined /> {intl.formatMessage({ id: 'myPrompts.tagAuth', defaultMessage: '已获授权' })}
                          </TypeChip>
                        )}
                      </TagRow>

                      <Title level={5} style={{ margin: 0, fontSize: 17, fontWeight: 700 }} ellipsis={{ rows: 2 }}>
                        {item.title || `Listing #${item.listingId}`}
                      </Title>

                      {item.creatorName && (
                        <Text type="secondary" style={{ fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <UserOutlined /> {item.creatorName}
                          {item.acquiredTime && (
                            <span style={{ opacity: 0.7 }}> · {item.acquiredTime.split(' ')[0]}</span>
                          )}
                        </Text>
                      )}

                      <PromptCode>
                        {item.prompt
                          || (item.buyoutActive && !item.isBuyoutHolder
                            ? intl.formatMessage({
                                id: 'myPrompts.promptLostBuyout',
                                defaultMessage: '买断权已转让给他人，完整提示词不再可见。可在商城申请授权或买断。',
                              })
                            : '-')}
                      </PromptCode>

                      {item.isBuyoutHolder && (
                        <PricingStrip>
                          <PriceBadge>
                            <FormattedMessage id="myPrompts.transferPrice" defaultMessage="转让买断" />:
                            {item.transferBuyoutEnabled ? (
                              <>
                                <ThunderboltFilled className="token" />
                                {item.effectiveTransferBuyoutPrice ?? '-'}
                              </>
                            ) : (
                              <span style={{ color: '#94a3b8', fontWeight: 500 }}>
                                <FormattedMessage id="myPrompts.transferDisabled" defaultMessage="未开启" />
                              </span>
                            )}
                          </PriceBadge>
                          <PriceBadge>
                            <FormattedMessage id="myPrompts.authPrice" defaultMessage="授权" />:
                            {item.authEnabled ? (
                              <>
                                <ThunderboltFilled className="token" />
                                {item.effectiveAuthPrice ?? '-'}
                              </>
                            ) : (
                              <span style={{ color: '#94a3b8', fontWeight: 500 }}>
                                <FormattedMessage id="myPrompts.authDisabled" defaultMessage="未开启" />
                              </span>
                            )}
                          </PriceBadge>
                        </PricingStrip>
                      )}

                      <CardFooter>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Tooltip title={intl.formatMessage({ id: 'myPrompts.copy', defaultMessage: '复制提示词' })}>
                            <Button
                              size="small"
                              shape="round"
                              icon={<CopyOutlined />}
                              disabled={!item.prompt}
                              onClick={() => copyPrompt(item.prompt)}
                            >
                              <FormattedMessage id="myPrompts.copy" defaultMessage="复制" />
                            </Button>
                          </Tooltip>
                          {item.isBuyoutHolder && (
                            <Button
                              size="small"
                              shape="round"
                              type="primary"
                              ghost
                              icon={<SettingOutlined />}
                              onClick={() => openPricing(item)}
                            >
                              <FormattedMessage id="myPrompts.setPricing" defaultMessage="设置定价" />
                            </Button>
                          )}
                        </div>
                        {(item.priceToken ?? 0) > 0 && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <FormattedMessage id="myPrompts.viewPrice" defaultMessage="查看价" />: {item.priceToken} TOKEN
                          </Text>
                        )}
                      </CardFooter>
                    </ContentSide>
                  </PromptListCard>
                );
              })}
            </>
          )}

          {total > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                showTotal={(t) => intl.formatMessage({ id: 'myPrompts.totalCount', defaultMessage: '共 {count} 项' }, { count: t })}
              />
            </div>
          )}
        </Spin>
      </Container>

      <BuyoutPricingModal
        open={pricingModal != null}
        item={pricingModal}
        saving={pricingSaving}
        onCancel={() => setPricingModal(null)}
        onSave={savePricing}
      />
    </PageWrapper>
  );
};

export default MyPromptsPage;
