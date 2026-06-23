import React, { useEffect, useState, useMemo } from 'react';
import {
  Drawer, Spin, Typography, Tag, Image, message, theme, Button, Space, Avatar
} from 'antd';
import {
  ArrowLeftOutlined, UserOutlined, FireOutlined, ThunderboltFilled,
  CopyOutlined, SafetyCertificateOutlined, EyeOutlined, HistoryOutlined,
  RocketOutlined, TagOutlined, LockOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { base } from 'api/base';
import { followUser, unfollowUser, getRelationStatus } from 'api/community';
import type { ListingDetail } from './PromptMarketDetailModal';
import UnlockConfirmModal from './UnlockConfirmModal';

const addImageCompressSuffix = (url: string | null | undefined, width = 800): string => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const { Title, Text, Paragraph } = Typography;

export interface PromptMarketDetailMobileProps {
  visible: boolean;
  onCancel: () => void;
  listingId: number | null;
  locale?: string;
}

// --- 移动端专用样式 ---

const MobileHeader = styled.div<{ $isDark: boolean }>`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.$isDark ? '#0d0d0d' : '#fff'};
  border-bottom: 1px solid ${props => props.$isDark ? '#262626' : '#f0f0f0'};
`;

const BackBtn = styled(Button)`
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  border: none !important;
  flex-shrink: 0;
  background: ${props => props.theme?.mode === 'dark' ? '#262626' : '#f5f5f5'} !important;
  color: inherit;
  .anticon { margin: 0 !important; }
`;

const ScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  padding-bottom: 100px;
  position: relative;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.2);
    border-radius: 4px;
  }
`;

const CoverBlock = styled.div<{ $isDark: boolean }>`
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  background: ${(p) => (p.$isDark ? '#111' : '#f0f0f2')};
`;

const MobileHeroImage = styled.div`
  width: 100%;
  height: min(52vw, 340px);
  min-height: 220px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .ant-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ant-image-img {
    width: auto !important;
    max-width: 100%;
    height: auto !important;
    max-height: 100%;
    object-fit: contain;
    object-position: center center;
  }
`;

const MobileHeroStage = styled.div`
  position: relative;
`;

const MobileHeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.4) 45%,
    transparent 100%
  );
  pointer-events: none;

  .overlay-inner {
    pointer-events: auto;
  }
`;

const MobileOverlayTag = styled(Tag)`
  && {
    margin: 0;
    border: none;
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    font-size: 11px;
  }
`;

const MobileThumbStrip = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 6px;
  padding: 8px 10px;
  background: ${(p) => (p.$isDark ? '#141414' : '#fafafa')};
  border-top: 1px solid ${(p) => (p.$isDark ? '#262626' : '#eee')};
`;

const MobileThumbItem = styled.div`
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #222;

  .ant-image {
    width: 100%;
    height: 100%;
    display: block;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CreatorRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${(p) => (p.$isDark ? '#262626' : '#f0f0f0')};
  margin-bottom: 16px;
`;

const PromptBlock = styled.div<{ $isDark: boolean; $locked: boolean }>`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  ${(p) => p.$locked && `
    .prompt-content { filter: blur(6px); user-select: none; pointer-events: none; }
    .prompt-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: ${p.$isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)'};
      color: ${p.$isDark ? '#fff' : '#434343'};
      font-size: 13px; gap: 8px; padding: 16px;
    }
  `}
`;

const PromptBox = styled.div<{ $isDark: boolean }>`
  background: ${(p) => (p.$isDark ? '#141414' : '#f5f5f7')};
  border: 1px solid ${(p) => (p.$isDark ? '#262626' : '#e8e8e8')};
  border-radius: 12px;
  padding: 14px;
  pre {
    margin: 0;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: ${(p) => (p.$isDark ? '#d1d1d6' : '#434343')};
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

const BottomBar = styled.div<{ $isDark: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
  background: ${props => props.$isDark ? '#0d0d0d' : '#fff'};
  border-top: 1px solid ${props => props.$isDark ? '#262626' : '#f0f0f0'};
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
`;

const PriceArea = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
  .price-num {
    font-size: 24px;
    font-weight: 800;
  }
`;

/** 关注按钮：更大 + 炫彩渐变（未关注时） */
const FollowBtnWrap = styled.div<{ $isFollowing: boolean }>`
  display: inline-block;
  border-radius: 9999px;
  padding: ${props => props.$isFollowing ? '0' : '2px'};
  background: ${props => props.$isFollowing
    ? 'transparent'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 35%, #f093fb 70%, #f5576c 100%)'};
  background-size: 200% 200%;
  box-shadow: ${props => props.$isFollowing ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'};
  animation: ${props => props.$isFollowing ? 'none' : 'gradientShift 4s ease infinite'};

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .ant-btn {
    height: 40px !important;
    padding: 0 22px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-radius: 9999px !important;
    border: none !important;
  }
  .ant-btn-primary {
    background: transparent !important;
    color: #fff !important;
  }
`;

const PromptMarketDetailMobile: React.FC<PromptMarketDetailMobileProps> = ({
  visible,
  onCancel,
  listingId,
  locale,
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#000' || String(token.colorBgBase).includes('141414');
  const isEn = locale === 'en' || locale === 'en-US';

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [relation, setRelation] = useState<{ isFollowing?: boolean; isMutual?: boolean } | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);

  useEffect(() => {
    if (visible && listingId) {
      setLoading(true);
      setRelation(null);
      base.getPromptMarketListingDetail(listingId).then((res: any) => {
        if (res?.success) setDetail(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
    if (!visible) setRelation(null);
  }, [visible, listingId]);

  useEffect(() => {
    if (detail?.userId) {
      getRelationStatus(detail.userId).then(setRelation).catch(() => {});
    }
  }, [detail?.userId]);

  const handleFollow = async () => {
    if (!detail?.userId) return;
    setFollowLoading(true);
    try {
      const isFollowing = relation?.isFollowing;
      const res = isFollowing
        ? await unfollowUser(detail.userId)
        : await followUser(detail.userId, 'PROMPT_MARKET');
      setRelation(res);
      message.success(isFollowing
        ? (isEn ? 'Unfollowed successfully' : '已取消关注')
        : (isEn ? 'Followed successfully' : '关注成功'));
    } catch (e: any) {
      message.error(e?.message || (isEn ? 'Operation failed' : '操作失败'));
    } finally {
      setFollowLoading(false);
    }
  };

  const parsedInfo = useMemo(() => {
    if (!detail) return { prompt: '', modelCode: '', tags: [] as string[] };
    const prompt = detail.prompt ?? '';
    const modelCode = detail.taskModelCode ?? detail.modelType ?? '';
    let tags: string[] = [];
    try {
      tags = JSON.parse(detail.tags || '[]');
    } catch (e) {}
    return { prompt, modelCode, tags };
  }, [detail]);

  const mediaList = useMemo(() => {
    if (!detail) return [] as string[];
    try {
      const previews = JSON.parse(detail.previewImages || '[]');
      return Array.from(new Set([detail.coverImageUrl, ...previews])).filter(Boolean).slice(0, 8) as string[];
    } catch (e) {
      return [detail.coverImageUrl].filter(Boolean) as string[];
    }
  }, [detail]);

  const heroImage = mediaList[0];
  const thumbImages = mediaList.slice(1);

  const promptLocked = detail?.promptFullVisible === false;

  const refreshDetail = () => {
    if (listingId) {
      base.getPromptMarketListingDetail(listingId).then((res: any) => {
        if (res?.success) setDetail(res.data);
      });
    }
  };

  const copyPrompt = () => {
    if (promptLocked) return;
    if (parsedInfo.prompt) {
      navigator.clipboard.writeText(parsedInfo.prompt);
      message.success(isEn ? 'Prompt Copied' : '提示词已复制');
    }
  };

  return (
    <Drawer
      open={visible}
      onClose={onCancel}
      placement="right"
      width="100%"
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      closable={false}
      destroyOnClose
    >
      <Spin spinning={loading} style={{ minHeight: 200 }}>
        {detail && (
          <>
            <MobileHeader $isDark={isDark}>
              <BackBtn type="text" shape="circle" icon={<ArrowLeftOutlined />} onClick={onCancel} />
              <Text strong ellipsis style={{ flex: 1, textAlign: 'center', margin: '0 8px' }}>
                {detail.title}
              </Text>
              <div style={{ width: 40 }} />
            </MobileHeader>

            <ScrollBody>
              {/* 顶部：主图 + 标签标题浮层 + 缩略图 */}
              {heroImage && (
                <CoverBlock $isDark={isDark}>
                  <Image.PreviewGroup>
                    <MobileHeroStage>
                      <MobileHeroImage>
                        <Image src={addImageCompressSuffix(heroImage, 900)} alt={detail.title || 'cover'} />
                      </MobileHeroImage>
                      <MobileHeroOverlay>
                        <div className="overlay-inner">
                          <Space size={[6, 6]} wrap>
                            <MobileOverlayTag color="orange" icon={<RocketOutlined />}>
                              {parsedInfo.modelCode || detail.modelType}
                            </MobileOverlayTag>
                            {parsedInfo.tags.map((tag: string) => (
                              <MobileOverlayTag key={tag} icon={<TagOutlined />}>{tag}</MobileOverlayTag>
                            ))}
                          </Space>
                          <Title level={4} style={{ margin: '10px 0 0', color: '#fff', fontWeight: 800 }}>
                            {detail.title}
                          </Title>
                        </div>
                      </MobileHeroOverlay>
                    </MobileHeroStage>
                    {thumbImages.length > 0 && (
                      <MobileThumbStrip $isDark={isDark}>
                        {thumbImages.map((url, index) => (
                          <MobileThumbItem key={`${url}-${index}`}>
                            <Image src={addImageCompressSuffix(url, 400)} alt={`preview-${index + 2}`} />
                          </MobileThumbItem>
                        ))}
                      </MobileThumbStrip>
                    )}
                  </Image.PreviewGroup>
                </CoverBlock>
              )}

              <CreatorRow $isDark={isDark} style={{ marginTop: 0 }}>
                <Space size={12}>
                  <Avatar
                    size={44}
                    src={detail.creatorAvatar ? addImageCompressSuffix(detail.creatorAvatar, 100) : undefined}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: 14 }}>
                      {detail.creatorName || `User_${detail.userId}`}
                    </Text>
                    {detail.creatorDescription && (
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: detail.creatorDescription }}>
                        {detail.creatorDescription}
                      </Text>
                    )}
                  </div>
                </Space>
                <FollowBtnWrap $isFollowing={!!relation?.isFollowing}>
                  <Button
                    type={relation?.isFollowing ? 'default' : 'primary'}
                    size="middle"
                    shape="round"
                    loading={followLoading}
                    onClick={handleFollow}
                  >
                    {relation?.isFollowing ? (isEn ? 'Unfollow' : '已关注') : (isEn ? 'Follow' : '关注')}
                  </Button>
                </FollowBtnWrap>
              </CreatorRow>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 13 }}>
                    <ThunderboltFilled style={{ color: '#faad14', marginRight: 4 }} />
                    {isEn ? 'Prompt' : '提示词'}
                  </Text>
                  {!promptLocked && (
                    <Button type="link" size="small" icon={<CopyOutlined />} onClick={copyPrompt}>
                      {isEn ? 'Copy' : '复制'}
                    </Button>
                  )}
                </div>
                <PromptBlock $isDark={isDark} $locked={promptLocked}>
                  <div className="prompt-content">
                    <PromptBox $isDark={isDark}>
                      <pre>
                        {parsedInfo.prompt || (isEn ? 'Unlock after purchase' : '付费解锁后可见')}
                      </pre>
                    </PromptBox>
                  </div>
                  {promptLocked && (
                    <div className="prompt-overlay">
                      <LockOutlined style={{ fontSize: 18 }} />
                      <span>{isEn ? 'Unlock to view full prompt' : '付费解锁后可查看完整提示词'}</span>
                    </div>
                  )}
                </PromptBlock>
              </div>

              <Title level={5} style={{ fontSize: 13, marginBottom: 6 }}>{isEn ? 'Description' : '作品简介'}</Title>
              <Paragraph type="secondary" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                {detail.description}
              </Paragraph>

              <Space size={16} style={{ fontSize: 12 }}>
                <Text type="secondary"><EyeOutlined /> {isEn ? 'Views' : '浏览'} {detail.viewCount || 0}</Text>
                <Text type="secondary"><FireOutlined /> {isEn ? 'Sales' : '已售'} {detail.salesCount || 0}</Text>
                <Text type="secondary">
                  <HistoryOutlined /> {detail.updateTime?.split(' ')[0] || '-'}
                </Text>
              </Space>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 12 }}>
                <Text type="secondary"><SafetyCertificateOutlined /> {isEn ? 'License' : '授权'}</Text>
                <Text strong>
                  {detail.licenseType === 1
                    ? (isEn ? 'Personal use only' : '仅个人学习')
                    : detail.licenseType === 2
                      ? (isEn ? 'Commercial use' : '可商用')
                      : detail.licenseType === 3
                        ? (isEn ? 'Exclusive buyout' : '买断')
                        : (detail.licenseTypeName ?? '-')}
                </Text>
              </div>
            </ScrollBody>

            <BottomBar $isDark={isDark}>
              <PriceArea>
                {detail.priceToken === 0 ? (
                  <span className="price-num" style={{ color: token.colorPrimary }}>{isEn ? 'Free' : '免费'}</span>
                ) : (
                  <>
                    <span className="price-num" style={{ color: token.colorPrimary }}>{detail.priceToken}</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>TOKEN</Text>
                  </>
                )}
                {detail.originalPriceToken != null && detail.originalPriceToken > detail.priceToken && (
                  <Text delete type="secondary" style={{ fontSize: 12 }}>{detail.originalPriceToken} TOKEN</Text>
                )}
              </PriceArea>
              {detail.priceToken > 0 && (
                <Button
                  type="primary"
                  block
                  style={{ flex: 1, maxWidth: 200, height: 44, borderRadius: 12, fontWeight: 600 }}
                  onClick={() => setUnlockModalVisible(true)}
                >
                  {isEn ? 'Unlock Prompt' : '立即解锁作品'}
                </Button>
              )}
            </BottomBar>
            <UnlockConfirmModal
              visible={unlockModalVisible}
              onCancel={() => setUnlockModalVisible(false)}
              listingId={detail?.id ?? 0}
              priceToken={detail?.priceToken ?? 0}
              title={detail?.title}
              isEn={isEn}
              onSuccess={refreshDetail}
            />
          </>
        )}
      </Spin>
    </Drawer>
  );
};

export default PromptMarketDetailMobile;
