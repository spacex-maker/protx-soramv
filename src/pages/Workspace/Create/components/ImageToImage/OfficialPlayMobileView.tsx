import React from 'react';
import { Empty, Spin, Button, Typography } from 'antd';
import {
  HeartFilled,
  HeartOutlined,
  StarFilled,
  StarOutlined,
  ArrowRightOutlined,
  ZoomInOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  I2iOfficialPlay,
  I2iOfficialPlaySortBy,
  resolvePlayDescription,
  resolvePlayDisplayName,
  resolveOfficialPlayImageUrl,
  OFFICIAL_PLAY_CARD_IMAGE_WIDTH,
} from './officialPlayTypes';

const { Text } = Typography;

const PageRoot = styled.div<{ $isDark: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  background: ${(p) =>
    p.$isDark
      ? 'linear-gradient(180deg, #0f1117 0%, #141824 100%)'
      : 'linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)'};
`;

const StickyHeader = styled.div<{ $isDark: boolean }>`
  flex-shrink: 0;
  padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 12px;
  border-bottom: 1px solid
    ${(p) => (p.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.2)')};
  background: ${(p) =>
    p.$isDark ? 'rgba(15, 17, 23, 0.92)' : 'rgba(255, 255, 255, 0.92)'};
  backdrop-filter: blur(12px);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const Title = styled.h1<{ $isDark: boolean }>`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: ${(p) => (p.$isDark ? '#f8fafc' : '#0f172a')};
`;

const CloseBtn = styled.button<{ $isDark: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: ${(p) => (p.$isDark ? '#e2e8f0' : '#334155')};
  background: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.08)' : '#fff')};
`;

const SortScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FavoritesChip = styled.button<{ $active?: boolean; $isDark: boolean }>`
  flex-shrink: 0;
  border: 1px solid
    ${(p) =>
      p.$active
        ? 'transparent'
        : p.$isDark
          ? 'rgba(250, 173, 20, 0.35)'
          : 'rgba(250, 173, 20, 0.45)'};
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: ${(p) => (p.$active ? '#fff' : p.$isDark ? '#fcd34d' : '#d97706')};
  background: ${(p) =>
    p.$active
      ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
      : p.$isDark
        ? 'rgba(250, 173, 20, 0.1)'
        : 'rgba(254, 243, 199, 0.85)'};
`;

const SortChip = styled.button<{ $active?: boolean; $isDark: boolean }>`
  flex-shrink: 0;
  border: 1px solid
    ${(p) =>
      p.$active
        ? 'transparent'
        : p.$isDark
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(148,163,184,0.25)'};
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: ${(p) => (p.$active ? '#fff' : p.$isDark ? 'rgba(255,255,255,0.7)' : '#64748b')};
  background: ${(p) =>
    p.$active
      ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
      : p.$isDark
        ? 'rgba(255,255,255,0.05)'
        : '#fff'};
`;

const ScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  -webkit-overflow-scrolling: touch;
`;

const MobileCard = styled.div<{ $selected?: boolean; $isDark: boolean }>`
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 14px;
  border: 1px solid
    ${(p) =>
      p.$selected
        ? 'rgba(59, 130, 246, 0.65)'
        : p.$isDark
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(148,163,184,0.2)'};
  background: ${(p) =>
    p.$isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)'};
  box-shadow: ${(p) =>
    p.$isDark ? '0 8px 24px rgba(0,0,0,0.25)' : '0 8px 24px rgba(15,23,42,0.06)'};
`;

const MobileRefRow = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: stretch;
  gap: 8px;
  width: 100%;
  min-height: min(52vw, 240px);
  border: none;
  padding: 6px;
  margin-bottom: 12px;
  border-radius: 16px;
  cursor: pointer;
  background: ${(p) =>
    p.$isDark ? 'rgba(10, 12, 18, 0.85)' : 'rgba(241, 245, 249, 0.9)'};

  img,
  .ph {
    flex: 1;
    min-width: 0;
    width: 100%;
    min-height: min(52vw, 240px);
    max-height: min(58vw, 280px);
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 12px;
    background: ${(p) =>
      p.$isDark ? 'rgba(255,255,255,0.06)' : 'linear-gradient(180deg, #f8fafc, #eef2ff)'};
  }

  .ph {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  .arrow {
    flex-shrink: 0;
    color: ${(p) => (p.$isDark ? '#93c5fd' : '#3b82f6')};
  }
`;

const CardTitle = styled.div<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 6px;
  color: ${(p) => (p.$isDark ? '#f8fafc' : '#0f172a')};
`;

const CardDesc = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 10px;
  color: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.58)' : '#64748b')};
`;

const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MobileUseBtn = styled(Button)`
  && {
    flex: 1;
    height: 42px;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
  }
`;

export interface OfficialPlayMobileViewProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  loading: boolean;
  plays: I2iOfficialPlay[];
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  sortBy: I2iOfficialPlaySortBy;
  onSortChange: (sort: I2iOfficialPlaySortBy) => void;
  sortOptions: { label: string; value: I2iOfficialPlaySortBy; icon: React.ReactNode }[];
  selectedPlayCode: string | null;
  onUsePlay: (play: I2iOfficialPlay) => void;
  onOpenPreview: (play: I2iOfficialPlay) => void;
  canPreviewPlay: (play: I2iOfficialPlay) => boolean;
  onInteraction: (
    e: React.MouseEvent,
    playCode: string,
    action: 'like' | 'unlike' | 'favorite' | 'unfavorite'
  ) => void;
  actionLoadingCode: string | null;
}

const OfficialPlayMobileView: React.FC<OfficialPlayMobileViewProps> = ({
  open,
  onClose,
  isDark,
  loading,
  plays,
  favoritesOnly,
  onFavoritesOnlyChange,
  sortBy,
  onSortChange,
  sortOptions,
  selectedPlayCode,
  onUsePlay,
  onOpenPreview,
  canPreviewPlay,
  onInteraction,
  actionLoadingCode,
}) => {
  const intl = useIntl();
  const locale = intl.locale || 'zh';

  if (!open) return null;

  return (
    <PageRoot $isDark={isDark}>
      <StickyHeader $isDark={isDark}>
        <HeaderRow>
          <Title $isDark={isDark}>
            <FormattedMessage id="create.i2i.official.modalTitle" defaultMessage="官方玩法" />
          </Title>
          <CloseBtn $isDark={isDark} type="button" onClick={onClose}>
            ✕
          </CloseBtn>
        </HeaderRow>
        <SortScroll>
          <FavoritesChip
            type="button"
            $active={favoritesOnly}
            $isDark={isDark}
            onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
          >
            {favoritesOnly ? <StarFilled /> : <StarOutlined />}{' '}
            <FormattedMessage id="create.i2i.official.myFavorites" defaultMessage="我的收藏" />
          </FavoritesChip>
          {sortOptions.map((opt) => (
            <SortChip
              key={opt.value}
              type="button"
              $active={!favoritesOnly && sortBy === opt.value}
              $isDark={isDark}
              onClick={() => {
                onFavoritesOnlyChange(false);
                onSortChange(opt.value);
              }}
            >
              {opt.icon} {opt.label}
            </SortChip>
          ))}
        </SortScroll>
      </StickyHeader>

      <ScrollBody>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size="large" />
          </div>
        ) : plays.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              favoritesOnly ? (
                <FormattedMessage
                  id="create.i2i.official.favoritesEmpty"
                  defaultMessage="暂无收藏的玩法"
                />
              ) : (
                <FormattedMessage id="create.i2i.official.empty" defaultMessage="暂无官方玩法" />
              )
            }
          />
        ) : (
          plays.map((play) => (
            <MobileCard
              key={play.playCode}
              $selected={selectedPlayCode === play.playCode}
              $isDark={isDark}
            >
              {canPreviewPlay(play) ? (
                <MobileRefRow
                  $isDark={isDark}
                  type="button"
                  onClick={() => onOpenPreview(play)}
                >
                  {play.referenceBeforeImage ? (
                    <img
                      src={resolveOfficialPlayImageUrl(
                        play.referenceBeforeImage,
                        OFFICIAL_PLAY_CARD_IMAGE_WIDTH
                      )}
                      alt="before"
                    />
                  ) : (
                    <div className="ph">{play.coverEmoji || '🎨'}</div>
                  )}
                  <ArrowRightOutlined className="arrow" />
                  {play.referenceAfterImage ? (
                    <img
                      src={resolveOfficialPlayImageUrl(
                        play.referenceAfterImage,
                        OFFICIAL_PLAY_CARD_IMAGE_WIDTH
                      )}
                      alt="after"
                    />
                  ) : (
                    <div className="ph" />
                  )}
                </MobileRefRow>
              ) : null}

              <CardTitle $isDark={isDark}>
                {play.coverEmoji} {resolvePlayDisplayName(play, locale)}
              </CardTitle>
              <CardDesc $isDark={isDark}>{resolvePlayDescription(play, locale)}</CardDesc>
              <StatRow>
                <span>
                  <HeartFilled style={{ color: '#ff4d4f', marginRight: 4 }} />
                  {play.likesCount ?? 0}
                </span>
                <span>
                  <ThunderboltOutlined style={{ marginRight: 4 }} />
                  {play.generationCount ?? 0}
                </span>
                {(play.userGenerationCount ?? 0) > 0 && (
                  <span>
                    <FormattedMessage
                      id="create.i2i.official.myGenerations"
                      defaultMessage="我已生成 {count} 次"
                      values={{ count: play.userGenerationCount }}
                    />
                  </span>
                )}
              </StatRow>

              <ActionRow>
                <Button
                  shape="circle"
                  loading={actionLoadingCode === play.playCode}
                  icon={play.isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={(e) => onInteraction(e, play.playCode, play.isLiked ? 'unlike' : 'like')}
                />
                <Button
                  shape="circle"
                  loading={actionLoadingCode === play.playCode}
                  icon={
                    play.isFavorited ? (
                      <StarFilled style={{ color: '#faad14' }} />
                    ) : (
                      <StarOutlined />
                    )
                  }
                  onClick={(e) =>
                    onInteraction(e, play.playCode, play.isFavorited ? 'unfavorite' : 'favorite')
                  }
                />
                {canPreviewPlay(play) && (
                  <Button shape="circle" icon={<ZoomInOutlined />} onClick={() => onOpenPreview(play)} />
                )}
                <MobileUseBtn type="primary" onClick={() => onUsePlay(play)}>
                  <FormattedMessage id="create.i2i.official.use" defaultMessage="使用" />
                </MobileUseBtn>
              </ActionRow>
            </MobileCard>
          ))
        )}
      </ScrollBody>
    </PageRoot>
  );
};

export default OfficialPlayMobileView;
