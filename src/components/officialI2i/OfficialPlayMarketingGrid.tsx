import React, { useEffect, useMemo, useState } from 'react';
import { Empty, Modal, Spin, Typography, Button } from 'antd';
import {
  ArrowRightOutlined,
  FireOutlined,
  HeartFilled,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes, useTheme } from 'styled-components';
import {
  I2iOfficialPlay,
  resolvePlayDescription,
  resolvePlayDisplayName,
  resolveOfficialPlayImageUrl,
  OFFICIAL_PLAY_CARD_IMAGE_WIDTH,
  OFFICIAL_PLAY_PREVIEW_IMAGE_WIDTH,
} from 'pages/Workspace/Create/components/ImageToImage/officialPlayTypes';

const CARD_IMAGE_WIDTH = OFFICIAL_PLAY_CARD_IMAGE_WIDTH;
const PREVIEW_IMAGE_WIDTH = OFFICIAL_PLAY_PREVIEW_IMAGE_WIDTH;

const { Text } = Typography;

const PREVIEW_IMG_MAX_HEIGHT = 'min(88vh, 760px)';
const PREVIEW_PANEL_MAX_WIDTH = 500;
const MOBILE_BREAKPOINT = 768;

function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Grid = styled.div<{ $compact?: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ $compact }) => ($compact ? 16 : 20)}px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const PlayCard = styled.article<{ $index: number; $compact?: boolean }>`
  padding: 0;
  animation: ${fadeIn} 0.35s ease forwards;
  animation-delay: ${({ $index }) => `${Math.min($index * 0.04, 0.24)}s`};
  opacity: 0;
  background: transparent;
  border: none;
  box-shadow: none;
`;

const RefRow = styled.button<{ $previewable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 10px;
  padding: 0;
  border: none;
  text-align: inherit;
  background: transparent;
  cursor: ${({ $previewable }) => ($previewable ? 'zoom-in' : 'default')};

  img,
  .ph {
    flex: 1;
    min-width: 0;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 14px;
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
    pointer-events: none;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  &:hover img,
  &:hover .ph {
    transform: ${({ $previewable }) => ($previewable ? 'scale(1.02)' : 'none')};
    opacity: ${({ $previewable }) => ($previewable ? 0.92 : 1)};
  }

  .ph {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .arrow {
    flex-shrink: 0;
    color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#94a3b8')};
    font-size: 13px;
    pointer-events: none;
  }
`;

const CategoryTag = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#93c5fd' : '#64748b')};
`;

const CardTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#f8fafc' : '#0f172a')};
`;

const CardDesc = styled.p`
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#64748b')};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 11px;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.42)' : '#94a3b8')};
`;

const UseLink = styled.button`
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#93c5fd' : '#2563eb')};
  background: transparent;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.75;
  }
`;

const LoadingWrap = styled.div`
  text-align: center;
  padding: 64px 0;
`;

const PreviewModal = styled(Modal)<{ $isMobile?: boolean; $isDark?: boolean }>`
  .ant-modal-content {
    border-radius: ${(p) => (p.$isMobile ? 0 : 20)}px;
    overflow: hidden;
    background: ${(p) =>
      p.$isDark ? 'rgba(15, 17, 23, 0.72)' : 'rgba(255, 255, 255, 0.72)'} !important;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid
      ${(p) =>
        p.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.55)'};
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  }

  .ant-modal-header {
    background: transparent !important;
    border-bottom: 1px solid
      ${(p) =>
        p.$isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
    padding: ${(p) => (p.$isMobile ? '14px 16px 8px' : '18px 24px 10px')};

    .ant-modal-title {
      font-size: ${(p) => (p.$isMobile ? 16 : 18)}px;
      font-weight: 700;
      color: ${(p) => (p.$isDark ? '#f8fafc' : '#0f172a')};
    }
  }

  .ant-modal-body {
    padding: ${(p) => (p.$isMobile ? '12px 12px 8px' : '16px 20px 8px')};
    background: transparent;
  }

  .ant-modal-footer {
    background: transparent !important;
    border-top: 1px solid
      ${(p) =>
        p.$isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
    padding: ${(p) =>
      p.$isMobile ? '10px 16px calc(12px + env(safe-area-inset-bottom, 0px))' : '12px 24px 18px'};
  }

  .ant-modal-close {
    color: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)')};
  }
`;

const PreviewCompare = styled.div<{ $isDark: boolean; $isMobile?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(p) => (p.$isMobile ? 10 : 24)}px;
  flex-wrap: nowrap;
  padding: ${(p) => (p.$isMobile ? '4px 0 8px' : '8px 0')};

  .panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1 1 0;
    min-width: 0;
    max-width: ${(p) => (p.$isMobile ? 'none' : `${PREVIEW_PANEL_MAX_WIDTH}px`)};
    width: ${(p) => (p.$isMobile ? 'calc(50% - 8px)' : 'auto')};
  }

  .placeholder,
  img {
    width: 100%;
    max-height: ${(p) => (p.$isMobile ? 'min(62vh, 640px)' : PREVIEW_IMG_MAX_HEIGHT)};
    min-height: ${(p) => (p.$isMobile ? 200 : 280)}px;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: ${(p) => (p.$isMobile ? 12 : 16)}px;
  }

  .arrow {
    flex-shrink: 0;
    font-size: ${(p) => (p.$isMobile ? 14 : 24)}px;
    color: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8')};
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    background: ${(p) =>
      p.$isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  }

  .label {
    font-size: 12px;
    font-weight: 600;
    color: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.5)' : '#64748b')};
  }
`;

const TryButton = styled(Button)`
  && {
    border-radius: 999px;
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
  }
`;

const categoryLabel = (
  category: string | null | undefined,
  intl: ReturnType<typeof useIntl>
) => {
  const map: Record<string, string> = {
    style: intl.formatMessage({ id: 'create.i2i.official.cat.style', defaultMessage: '风格' }),
    portrait: intl.formatMessage({ id: 'create.i2i.official.cat.portrait', defaultMessage: '人像' }),
    fun: intl.formatMessage({ id: 'create.i2i.official.cat.fun', defaultMessage: '趣味' }),
    scene: intl.formatMessage({ id: 'create.i2i.official.cat.scene', defaultMessage: '场景' }),
  };
  return map[category || ''] || category || '';
};

export interface OfficialPlayMarketingGridProps {
  plays: I2iOfficialPlay[];
  loading?: boolean;
  compact?: boolean;
  limit?: number;
  showUseButton?: boolean;
  onUsePlay?: (play: I2iOfficialPlay) => void;
}

const OfficialPlayMarketingGrid: React.FC<OfficialPlayMarketingGridProps> = ({
  plays,
  loading = false,
  compact = false,
  limit,
  showUseButton = false,
  onUsePlay,
}) => {
  const intl = useIntl();
  const locale = intl.locale || 'zh';
  const styledTheme = useTheme();
  const isDark = styledTheme.mode === 'dark';
  const isMobile = useIsMobile();
  const [previewPlay, setPreviewPlay] = useState<I2iOfficialPlay | null>(null);

  const displayPlays = useMemo(
    () => (limit ? plays.slice(0, limit) : plays),
    [plays, limit]
  );

  const canPreviewPlay = (play: I2iOfficialPlay) =>
    Boolean(play.referenceBeforeImage || play.referenceAfterImage);

  const previewModal = (
    <PreviewModal
      $isMobile={isMobile}
      $isDark={isDark}
      title={
        previewPlay
          ? intl.formatMessage(
              {
                id: 'create.i2i.official.previewTitleNamed',
                defaultMessage: '效果对照 · {name}',
              },
              { name: resolvePlayDisplayName(previewPlay, locale) }
            )
          : intl.formatMessage({
              id: 'create.i2i.official.previewTitle',
              defaultMessage: '效果对照',
            })
      }
      open={!!previewPlay}
      onCancel={() => setPreviewPlay(null)}
      footer={
        previewPlay ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setPreviewPlay(null)}>
              <FormattedMessage id="common.close" defaultMessage="关闭" />
            </Button>
            {onUsePlay && (
              <TryButton
                type="primary"
                onClick={() => {
                  onUsePlay(previewPlay);
                  setPreviewPlay(null);
                }}
              >
                <FormattedMessage id="home.officialI2i.tryPlay" defaultMessage="立即体验此玩法" />
              </TryButton>
            )}
          </div>
        ) : null
      }
      width={isMobile ? '100%' : 'min(96vw, 1080px)'}
      centered={!isMobile}
      destroyOnClose
      style={
        isMobile
          ? {
              top: 0,
              maxWidth: '100vw',
              margin: 0,
              padding: 0,
            }
          : undefined
      }
      styles={{
        mask: {
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          background: isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(15, 23, 42, 0.28)',
        },
        body: {
          maxHeight: isMobile ? 'calc(100vh - 120px)' : '90vh',
          overflowY: 'auto',
        },
      }}
    >
      {previewPlay && (
        <PreviewCompare $isDark={isDark} $isMobile={isMobile}>
          <div className="panel">
            {previewPlay.referenceBeforeImage ? (
              <img
                src={resolveOfficialPlayImageUrl(previewPlay.referenceBeforeImage, PREVIEW_IMAGE_WIDTH)}
                alt="before"
              />
            ) : (
              <div className="placeholder">{previewPlay.coverEmoji || '🎨'}</div>
            )}
            <Text className="label">
              <FormattedMessage id="create.i2i.official.refBefore" defaultMessage="原图" />
            </Text>
          </div>
          <ArrowRightOutlined className="arrow" />
          <div className="panel">
            {previewPlay.referenceAfterImage ? (
              <img
                src={resolveOfficialPlayImageUrl(previewPlay.referenceAfterImage, PREVIEW_IMAGE_WIDTH)}
                alt="after"
              />
            ) : (
              <div className="placeholder" />
            )}
            <Text className="label">
              <FormattedMessage id="create.i2i.official.refAfter" defaultMessage="效果" />
            </Text>
          </div>
        </PreviewCompare>
      )}
    </PreviewModal>
  );

  if (loading) {
    return (
      <LoadingWrap>
        <Spin size="large" />
      </LoadingWrap>
    );
  }

  if (displayPlays.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <FormattedMessage id="create.i2i.official.empty" defaultMessage="暂无官方玩法" />
        }
      />
    );
  }

  return (
    <>
      <Grid $compact={compact}>
        {displayPlays.map((play, index) => {
          const hasRefs = canPreviewPlay(play);
          return (
            <PlayCard key={play.playCode} $index={index} $compact={compact}>
              {hasRefs && (
                <RefRow
                  type="button"
                  $previewable
                  onClick={() => setPreviewPlay(play)}
                  aria-label={intl.formatMessage(
                    {
                      id: 'create.i2i.official.previewTitleNamed',
                      defaultMessage: '效果对照 · {name}',
                    },
                    { name: resolvePlayDisplayName(play, locale) }
                  )}
                >
                  {play.referenceBeforeImage ? (
                    <img
                      src={resolveOfficialPlayImageUrl(play.referenceBeforeImage, CARD_IMAGE_WIDTH)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="ph">{play.coverEmoji || '🎨'}</div>
                  )}
                  <ArrowRightOutlined className="arrow" />
                  {play.referenceAfterImage ? (
                    <img
                      src={resolveOfficialPlayImageUrl(play.referenceAfterImage, CARD_IMAGE_WIDTH)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="ph" />
                  )}
                </RefRow>
              )}

            {play.category && <CategoryTag>{categoryLabel(play.category, intl)}</CategoryTag>}

            <CardTitle>
              {play.coverEmoji} {resolvePlayDisplayName(play, locale)}
            </CardTitle>
            <CardDesc>{resolvePlayDescription(play, locale)}</CardDesc>

            <StatRow>
              <span>
                <HeartFilled style={{ color: '#ff4d4f', marginRight: 4 }} />
                {play.likesCount ?? 0}
              </span>
              <span>
                <ThunderboltOutlined style={{ marginRight: 4 }} />
                {play.generationCount ?? 0}
              </span>
              {(play.generationCount ?? 0) > 100 && (
                <span>
                  <FireOutlined style={{ color: '#f97316', marginRight: 4 }} />
                  <FormattedMessage id="home.officialI2i.hot" defaultMessage="热门" />
                </span>
              )}
            </StatRow>

            {showUseButton && onUsePlay && (
              <UseLink type="button" onClick={() => onUsePlay(play)}>
                <FormattedMessage id="home.officialI2i.tryPlay" defaultMessage="立即体验此玩法" /> →
              </UseLink>
            )}
          </PlayCard>
        );
      })}
      </Grid>
      {previewModal}
    </>
  );
};

export default OfficialPlayMarketingGrid;
