import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  EyeOutlined,
  CheckCircleFilled,
  CrownFilled,
  UserOutlined,
} from '@ant-design/icons';

import { isFree } from '../TextToImage/utils';
import { bindCoverVideoSource, playCoverVideo, setGridCardVideoPlaying } from '../shared/coverVideoPlayback';
import { isVideoUrl, modelCoverUrl } from './utils';
import {
  CardContainer,
  CardImageLayer,
  CardContentGlass,
  CardVideo,
  DetailButtonOverlay,
  GlassButton,
  ModelTitle,
  PriceTag,
  SelectIndicator,
  TagBadge,
  TopBadges,
} from './VideoModelSelectionModal.styles';

const addImageCompressSuffix = (url: string | null | undefined, width = 600): string => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/85/thumbnail/${width}x`;
};

export interface ModelSelectionCardProps {
  model: any;
  index: number;
  isSelected: boolean;
  modalOpen: boolean;
  token: { colorBgContainer: string; colorPrimary: string };
  onSelect: (model: any) => void;
  onShowDetail?: (model: any) => void;
}

const ModelSelectionCard: React.FC<ModelSelectionCardProps> = ({
  model,
  index,
  isSelected,
  modalOpen,
  token,
  onSelect,
  onShowDetail,
}) => {
  const intl = useIntl();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isOfficial = model.companyCode === 'stability' || model.companyId === 13;
  const tokenCost = model.tokenCost ?? 0;
  const isFreeModel = isFree(model.outputPrice, model.currency, model.tokenCost);
  const cover = modelCoverUrl(model);
  const isCoverVideo = Boolean(cover && isVideoUrl(cover));

  // 弹窗打开即绑定封面（复用 Tab 预加载 blob），默认显示首帧；悬停再 play
  useEffect(() => {
    if (!modalOpen || !isCoverVideo || !cover) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    void bindCoverVideoSource(video, cover).then(() => {
      if (cancelled || !videoRef.current) return;
      if (isSelected) {
        void playCoverVideo(videoRef.current, cover);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [modalOpen, isCoverVideo, cover, isSelected]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isCoverVideo && cover) {
        setGridCardVideoPlaying(e.currentTarget, true, cover);
      }
    },
    [cover, isCoverVideo],
  );

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isSelected && isCoverVideo) return;
    setGridCardVideoPlaying(e.currentTarget, false);
  }, [isSelected, isCoverVideo]);

  const handleClick = useCallback(() => {
    onSelect(model);
  }, [model, onSelect]);

  const handleDetailClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onShowDetail?.(model);
    },
    [model, onShowDetail],
  );

  return (
    <CardContainer
      data-model-card
      data-model-selected={isSelected ? 'true' : undefined}
      $selected={isSelected}
      $bgContainer={token.colorBgContainer}
      $primary={token.colorPrimary}
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {isCoverVideo && cover ? (
        <CardVideo
          ref={videoRef}
          className="card-image"
          data-src={cover}
          preload="metadata"
          playsInline
          muted
          loop
        />
      ) : (
        <CardImageLayer
          className="card-image"
          $url={cover ? addImageCompressSuffix(cover, 400) : ''}
        />
      )}
      <TopBadges>
        <div style={{ display: 'flex', gap: 6 }}>
          {isOfficial ? (
            <TagBadge $bg="rgba(255, 215, 0, 0.9)" $color="#000">
              <CrownFilled /> OFFICIAL
            </TagBadge>
          ) : (
            <TagBadge $bg="rgba(255, 255, 255, 0.2)">
              <UserOutlined /> COMMUNITY
            </TagBadge>
          )}
        </div>
        {isSelected && (
          <SelectIndicator $primary={token.colorPrimary}>
            <CheckCircleFilled />
          </SelectIndicator>
        )}
      </TopBadges>
      {onShowDetail && (
        <DetailButtonOverlay className="detail-btn">
          <GlassButton type="button" onClick={handleDetailClick}>
            <EyeOutlined /> 预览详情
          </GlassButton>
        </DetailButtonOverlay>
      )}
      <CardContentGlass>
        <Tooltip title={model.modelName}>
          <ModelTitle>{model.modelName}</ModelTitle>
        </Tooltip>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <PriceTag $isFree={isFreeModel}>
            {isFreeModel ? (
              <FormattedMessage id="create.model.free" defaultMessage="免费" />
            ) : (
              intl.formatMessage(
                { id: 'create.model.tokenCost.display', defaultMessage: '{count} token' },
                { count: tokenCost },
              )
            )}
          </PriceTag>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            {model.companyName ||
              (model.modelName === 'Nano Banana Pro'
                ? 'Google'
                : model.modelLevel == 1
                  ? 'SDXL'
                  : model.modelLevel == 2
                    ? 'LORA'
                    : 'V1.5')}
          </span>
        </div>
      </CardContentGlass>
    </CardContainer>
  );
};

export default memo(ModelSelectionCard);
