import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal, Spin, Typography, Tag, Image, message, theme, Button, Space, Divider
} from 'antd';
import {
  UserOutlined, FireOutlined, ThunderboltFilled,
  CopyOutlined, SafetyCertificateOutlined, 
  EyeOutlined, HistoryOutlined, RocketOutlined, TagOutlined, LockOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { base } from 'api/base';
import { followUser, unfollowUser, getRelationStatus } from 'api/community';
import PromptMarketCreatorCard from './PromptMarketCreatorCard';
import UnlockConfirmModal from './UnlockConfirmModal';
import PromptMarketPurchaseActions, { PromptMarketPriceDisplay, UnlockModalConfig } from './PromptMarketPurchaseActions';
import CreatorPromptHiddenHint from './CreatorPromptHiddenHint';

const { Title, Text, Paragraph } = Typography;

// --- 接口定义 ---
export interface ListingDetail {
  id: number;
  title?: string;
  description?: string;
  coverImageUrl?: string;
  previewImages?: string;
  priceToken: number;
  originalPriceToken?: number;
  buyoutPriceToken?: number;
  buyoutActive?: boolean;
  effectiveTransferBuyoutPrice?: number;
  effectiveAuthPrice?: number;
  transferBuyoutEnabled?: boolean;
  authEnabled?: boolean;
  purchaseAction?: string;
  licenseType?: number;
  licenseTypeName?: string;
  viewCount?: number;
  salesCount?: number;
  prompt?: string;
  taskModelCode?: string;
  modelType?: string;
  tags?: string; 
  createTime?: string;
  updateTime?: string;
  /** 创作者用户ID（用于关注） */
  userId?: number;
  creatorName?: string;
  creatorAvatar?: string;
  creatorDescription?: string;
  /** 创作者等级 */
  creatorLevel?: number;
  /** 创作者会员等级 */
  creatorMemberLevel?: number;
  /** 是否完整公开提示词：false 时需付费解锁 */
  promptFullVisible?: boolean;
  isPromptHidden?: number;
  viewerIsCreator?: boolean;
}

interface PromptMarketDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  listingId: number | null;
  locale?: any; 
}

// --- 样式定义 ---

const StyledModal = styled(Modal)`
  .ant-modal-wrap { padding-top: 12vh; }
  .ant-modal-content { padding: 0; border-radius: 20px; background: transparent; overflow: hidden; }
  .ant-modal-close {
    background: rgba(0,0,0,0.2); backdrop-filter: blur(8px); color: #fff;
    border-radius: 50%; top: 12px; right: 12px; width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
  }
`;

const DetailWrapper = styled.div<{ $isDark: boolean }>`
  display: flex; background: ${props => props.$isDark ? '#0d0d0d' : '#fff'};
  border-radius: 20px; overflow: hidden; height: 70vh; min-height: 480px;
  @media (max-width: 992px) { flex-direction: column; height: auto; }
`;

const LeftColumn = styled.div<{ $isDark: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: ${(p) => (p.$isDark ? '#0d0d0d' : '#fff')};
`;

const HeroGallery = styled.div<{ $isDark: boolean }>`
  position: relative;
  flex-shrink: 0;
  background: ${(p) => (p.$isDark ? '#111' : '#f0f0f2')};
`;

const HeroStage = styled.div`
  position: relative;
`;

const HeroImageWrap = styled.div`
  width: 100%;
  height: min(44vh, 380px);
  min-height: 240px;
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

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px 24px 18px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.82) 0%,
    rgba(0, 0, 0, 0.45) 42%,
    rgba(0, 0, 0, 0.08) 72%,
    transparent 100%
  );
  pointer-events: none;

  .overlay-inner {
    pointer-events: auto;
  }
`;

const OverlayTag = styled(Tag)`
  && {
    margin: 0;
    border: none;
    background: rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 11px;
  }
  .anticon {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const OverlayModelTag = styled(OverlayTag)`
  && {
    background: rgba(250, 173, 20, 0.35);
  }
`;

const OverlayTitle = styled(Title)`
  && {
    margin: 10px 0 0;
    color: #fff !important;
    font-weight: 800;
    font-size: 22px !important;
    line-height: 1.35;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
  }
`;

const ThumbnailStrip = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
  gap: 6px;
  padding: 8px 12px 10px;
  background: ${(p) => (p.$isDark ? '#141414' : '#fafafa')};
  border-top: 1px solid ${(p) => (p.$isDark ? '#262626' : '#eee')};
`;

const ThumbItem = styled.div`
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a1a;
  cursor: zoom-in;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }

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

const ScrollContent = styled.div<{ $isDark: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 20px 28px 24px;
  background: ${(p) => (p.$isDark ? '#0d0d0d' : '#fff')};
  border-top: 1px solid ${(p) => (p.$isDark ? '#1f1f1f' : '#f0f0f0')};

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 10px; }
`;

const ContentSection = styled.div<{ $isDark: boolean }>`
  margin-bottom: 20px;
`;

const StatsRow = styled.div`
  flex-shrink: 0;
  padding-top: 4px;
  display: flex;
  gap: 16px;
  font-size: 12px;
`;

const ActionPanel = styled.div<{ $isDark: boolean }>`
  width: 290px; background: ${props => props.$isDark ? '#141414' : '#fcfcfd'};
  border-left: 1px solid ${props => props.$isDark ? '#262626' : '#f0f0f0'};
  padding: 24px 16px 24px; display: flex; flex-direction: column; justify-content: space-between;
`;

const PromptWrapper = styled.div<{ $isDark: boolean; $locked: boolean }>`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  ${props => props.$locked && `
    .prompt-content { filter: blur(6px); user-select: none; pointer-events: none; }
    .prompt-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: ${props.$isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)'};
      color: ${props.$isDark ? '#fff' : '#434343'};
      font-size: 14px; gap: 8px;
    }
  `}
`;

const PromptContainer = styled.div<{ $isDark: boolean }>`
  background: ${(p) => (p.$isDark ? '#141414' : '#f5f5f7')};
  border: 1px solid ${(p) => (p.$isDark ? '#262626' : '#e8e8e8')};
  border-radius: 12px;
  padding: 16px;
  pre {
    margin: 0; font-family: 'SF Mono', monospace; font-size: 13px; line-height: 1.6;
    color: ${(p) => (p.$isDark ? '#d1d1d6' : '#434343')}; white-space: pre-wrap; word-break: break-all;
  }
`;

const PromptMarketDetailModal: React.FC<PromptMarketDetailModalProps> = ({ 
  visible, onCancel, listingId, locale 
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#000' || token.colorBgBase.includes('141414');
  const isEn = locale === 'en' || locale === 'en-US';

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [relation, setRelation] = useState<{ isFollowing?: boolean; isMutual?: boolean } | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [unlockConfig, setUnlockConfig] = useState<UnlockModalConfig | null>(null);

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
    } catch(e) {
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
    <StyledModal open={visible} onCancel={onCancel} footer={null} width={920} centered destroyOnClose>
      <Spin spinning={loading}>
        {detail && (
          <DetailWrapper $isDark={isDark}>
            <LeftColumn $isDark={isDark}>
              {heroImage && (
                <HeroGallery $isDark={isDark}>
                  <Image.PreviewGroup>
                    <HeroStage>
                      <HeroImageWrap>
                        <Image src={heroImage} alt={detail.title || 'cover'} />
                      </HeroImageWrap>
                      <HeroOverlay>
                        <div className="overlay-inner">
                          <Space size={[6, 6]} wrap>
                            <OverlayModelTag icon={<RocketOutlined />}>
                              {parsedInfo.modelCode || detail.modelType}
                            </OverlayModelTag>
                            {parsedInfo.tags.map((tag: string) => (
                              <OverlayTag key={tag} icon={<TagOutlined />}>{tag}</OverlayTag>
                            ))}
                          </Space>
                          <OverlayTitle level={3}>{detail.title}</OverlayTitle>
                        </div>
                      </HeroOverlay>
                    </HeroStage>
                    {thumbImages.length > 0 && (
                      <ThumbnailStrip $isDark={isDark}>
                        {thumbImages.map((url, index) => (
                          <ThumbItem key={`${url}-${index}`}>
                            <Image src={url} alt={`preview-${index + 2}`} />
                          </ThumbItem>
                        ))}
                      </ThumbnailStrip>
                    )}
                  </Image.PreviewGroup>
                </HeroGallery>
              )}

              <ScrollContent $isDark={isDark}>
                <div style={{ flex: 1 }}>
                  <ContentSection $isDark={isDark}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 13 }}>
                        <ThunderboltFilled style={{ color: '#faad14', marginRight: 4 }} />
                        {isEn ? 'Prompt Parameters' : '提示词参数'}
                      </Text>
                      {!promptLocked && (
                        <Button type="link" size="small" icon={<CopyOutlined />} onClick={copyPrompt}>Copy</Button>
                      )}
                    </div>
                    <CreatorPromptHiddenHint detail={detail} isEn={isEn} />
                    <PromptWrapper $isDark={isDark} $locked={promptLocked}>
                      <div className="prompt-content">
                        <PromptContainer $isDark={isDark}>
                          <pre>{parsedInfo.prompt || (isEn ? 'Unlock after purchase' : '付费解锁后可见')}</pre>
                        </PromptContainer>
                      </div>
                      {promptLocked && (
                        <div className="prompt-overlay">
                          <LockOutlined style={{ fontSize: 18 }} />
                          <span>
                            {detail.buyoutActive
                              ? (isEn ? 'Buyout active — apply for buyout or authorization' : '作品已买断，请申请买断或授权后查看')
                              : (isEn ? 'Unlock after purchase to view full prompt' : '付费解锁后可查看完整提示词')}
                          </span>
                        </div>
                      )}
                    </PromptWrapper>
                  </ContentSection>

                  <ContentSection $isDark={isDark}>
                    <Title level={5} style={{ fontSize: 14, marginBottom: 8, marginTop: 0 }}>
                      {isEn ? 'Description' : '作品简介'}
                    </Title>
                    <Paragraph type="secondary" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>
                      {detail.description}
                    </Paragraph>
                  </ContentSection>
                </div>

                <StatsRow>
                  <Text type="secondary"><EyeOutlined /> {isEn ? 'Views' : '浏览'} {detail.viewCount || 0}</Text>
                  <Text type="secondary"><FireOutlined /> {isEn ? 'Sales' : '已售'} {detail.salesCount || 0}</Text>
                </StatsRow>
              </ScrollContent>
            </LeftColumn>

            <ActionPanel $isDark={isDark}>
              <div>
                <PromptMarketCreatorCard
                  creator={{
                    userId: detail.userId,
                    creatorName: detail.creatorName,
                    creatorAvatar: detail.creatorAvatar,
                    creatorDescription: detail.creatorDescription,
                    creatorLevel: detail.creatorLevel,
                    creatorMemberLevel: detail.creatorMemberLevel,
                  }}
                  isDark={isDark}
                  isEn={isEn}
                  relation={relation}
                  followLoading={followLoading}
                  onFollow={handleFollow}
                />
              </div>

              <div style={{ marginTop: 'auto' }}>
                <PromptMarketPriceDisplay detail={detail} isEn={isEn} />

                <PromptMarketPurchaseActions
                  detail={detail}
                  isEn={isEn}
                  block
                  onOpenUnlock={(config) => {
                    setUnlockConfig(config);
                    setUnlockModalVisible(true);
                  }}
                />

                <Divider style={{ margin: '24px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
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
              </div>
            </ActionPanel>
          </DetailWrapper>
        )}
      </Spin>
      <UnlockConfirmModal
        visible={unlockModalVisible}
        onCancel={() => { setUnlockModalVisible(false); setUnlockConfig(null); }}
        listingId={detail?.id ?? 0}
        priceToken={unlockConfig?.priceToken ?? detail?.priceToken ?? 0}
        orderType={unlockConfig?.orderType ?? 1}
        confirmTitle={unlockConfig?.confirmTitle}
        title={detail?.title}
        isEn={isEn}
        onSuccess={refreshDetail}
      />
    </StyledModal>
  );
};

export default PromptMarketDetailModal;