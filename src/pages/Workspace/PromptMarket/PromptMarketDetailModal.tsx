import React, { useEffect, useState, ReactNode, useMemo } from 'react';
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
import { motion, HTMLMotionProps } from 'framer-motion';
import PromptMarketCreatorCard from './PromptMarketCreatorCard';

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

const ScrollContent = styled.div`
  flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 24px 32px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 10px; }
`;

const ActionPanel = styled.div<{ $isDark: boolean }>`
  width: 290px; background: ${props => props.$isDark ? '#141414' : '#fcfcfd'};
  border-left: 1px solid ${props => props.$isDark ? '#262626' : '#f0f0f0'};
  padding: 24px 16px 24px; display: flex; flex-direction: column; justify-content: space-between;
`;

const CompactGallery = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 8px; margin-bottom: 20px;
`;

// 修复 TS2769: 明确指定 children 属于 ReactNode
interface IGalleryItemProps extends HTMLMotionProps<"div"> {
  $isMain?: boolean;
  children?: ReactNode;
}

const GalleryItem = styled(motion.div)<IGalleryItemProps>`
  grid-column: ${props => props.$isMain ? 'span 4' : 'span 1'};
  border-radius: 12px; overflow: hidden; background: #1a1a1a;
  height: ${props => props.$isMain ? '320px' : '80px'};
  .ant-image { width: 100%; height: 100%; }
  img { width: 100%; height: 100%; object-fit: cover; }
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
  background: ${props => props.$isDark ? '#000' : '#f5f5f7'};
  border: 1px solid ${props => props.$isDark ? '#262626' : '#e8e8e8'};
  border-radius: 12px; padding: 16px;
  pre {
    margin: 0; font-family: 'SF Mono', monospace; font-size: 13px; line-height: 1.6;
    color: ${props => props.$isDark ? '#d1d1d6' : '#434343'}; white-space: pre-wrap; word-break: break-all;
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
    if (!detail) return [];
    try {
      const previews = JSON.parse(detail.previewImages || '[]');
      return Array.from(new Set([detail.coverImageUrl, ...previews])).filter(Boolean).slice(0, 5);
    } catch(e) {
      return [detail.coverImageUrl].filter(Boolean);
    }
  }, [detail]);

  const promptLocked = detail?.promptFullVisible === false;

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
            <ScrollContent>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 20 }}>
                  <Space size={6} wrap style={{ marginBottom: 10 }}>
                    <Tag bordered={false} color="orange" icon={<RocketOutlined />}>{parsedInfo.modelCode || detail.modelType}</Tag>
                    {/* 修复 TS7006: 显式指定 tag: string */}
                    {parsedInfo.tags.map((tag: string) => (
                      <Tag key={tag} bordered={false} icon={<TagOutlined />}>{tag}</Tag>
                    ))}
                  </Space>
                  <Title level={3} style={{ margin: 0, fontWeight: 800 }}>{detail.title}</Title>
                </div>

                <CompactGallery>
                  <Image.PreviewGroup>
                    {mediaList.map((url: any, index: number) => (
                      <GalleryItem key={index} $isMain={index === 0}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}
                      >
                        <Image src={url} alt="preview" />
                      </GalleryItem>
                    ))}
                  </Image.PreviewGroup>
                </CompactGallery>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 13 }}>
                      <ThunderboltFilled style={{ color: '#faad14', marginRight: 4 }} />
                      {isEn ? 'Prompt Parameters' : '提示词参数'}
                    </Text>
                    {!promptLocked && (
                      <Button type="link" size="small" icon={<CopyOutlined />} onClick={copyPrompt}>Copy</Button>
                    )}
                  </div>
                  <PromptWrapper $isDark={isDark} $locked={promptLocked}>
                    <div className="prompt-content">
                      <PromptContainer $isDark={isDark}>
                        <pre>{parsedInfo.prompt || (isEn ? 'Unlock after purchase' : '付费解锁后可见')}</pre>
                      </PromptContainer>
                    </div>
                    {promptLocked && (
                      <div className="prompt-overlay">
                        <LockOutlined style={{ fontSize: 18 }} />
                        <span>{isEn ? 'Unlock after purchase to view full prompt' : '付费解锁后可查看完整提示词'}</span>
                      </div>
                    )}
                  </PromptWrapper>
                </div>

                <Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>{isEn ? 'Description' : '作品简介'}</Title>
                <Paragraph type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {detail.description}
                </Paragraph>
              </div>

              <div style={{ flexShrink: 0, paddingTop: 16, display: 'flex', gap: 16, fontSize: 12 }}>
                <Text type="secondary"><EyeOutlined /> {isEn ? 'Views' : '浏览'} {detail.viewCount || 0}</Text>
                <Text type="secondary"><FireOutlined /> {isEn ? 'Sales' : '已售'} {detail.salesCount || 0}</Text>
              </div>
            </ScrollContent>

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
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    {detail.priceToken === 0 ? (
                      <span style={{ fontSize: 36, fontWeight: 900, color: token.colorPrimary }}>{isEn ? 'Free' : '免费'}</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 36, fontWeight: 900, color: token.colorPrimary }}>{detail.priceToken}</span>
                        <Text type="secondary" style={{ fontSize: 12 }}>TOKEN</Text>
                      </>
                    )}
                    {detail.originalPriceToken! > detail.priceToken && (
                      <Text delete type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>{detail.originalPriceToken} TOKEN</Text>
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <HistoryOutlined /> {isEn ? 'Last update' : '最后更新'}: {detail.updateTime?.split(' ')[0] || 'Recently'}
                  </Text>
                </div>

                {detail.priceToken > 0 && (
                  <Button type="primary" block style={{ height: 48, borderRadius: 9999, fontSize: 15, fontWeight: 700 }}>
                    {isEn ? 'Unlock Prompt' : '立即解锁作品'}
                  </Button>
                )}

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
    </StyledModal>
  );
};

export default PromptMarketDetailModal;