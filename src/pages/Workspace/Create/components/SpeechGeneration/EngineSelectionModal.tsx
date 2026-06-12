import React, { useMemo, useState } from 'react';
import { Modal, Empty, Tooltip, theme, Input, Spin } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  EyeOutlined,
  CheckCircleFilled,
  SoundOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import styled, { css, keyframes } from 'styled-components';
import { EngineModel } from './engineTypes';
import {
  formatEngineTokenCost,
  getEngineDisplayName,
  getEngineDescription,
  isPerCharUnit,
  isVideoUrl,
  modelCoverUrl,
} from './engineUtils';

const addImageCompressSuffix = (url: string | null | undefined, width = 600): string => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/85/thumbnail/${width}x`;
};

function setGridCardVideoPlaying(cardRoot: HTMLElement, playing: boolean) {
  const v = cardRoot.querySelector('video.card-image');
  if (!v || !(v instanceof HTMLVideoElement)) return;
  if (playing) {
    void v.play().catch(() => {});
  } else {
    v.pause();
    v.currentTime = 0;
  }
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0;
    height: 85vh;
    display: flex;
    flex-direction: column;
  }

  .ant-modal-header, .ant-modal-footer {
    display: none;
  }

  .ant-modal-body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

const HeaderSection = styled.div<{ $bg: string }>`
  padding: 24px 32px;
  background: ${props => props.$bg};
  border-radius: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
  margin-bottom: 20px;
`;

const HeaderTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
`;

const CloseButton = styled.div<{ $hoverBg: string }>`
  cursor: pointer;
  padding: 8px 18px;
  background: ${props => props.$hoverBg}88;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$hoverBg};
    transform: scale(1.05);
  }
`;

const ScrollableContent = styled.div<{ $scrollbar: string }>`
  flex: 1;
  overflow-y: auto;
  padding: 10px 4px 40px 4px;
  background: transparent;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 24px;
  align-content: start;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.$scrollbar}66;
    border-radius: 10px;
  }
`;

const CardContainer = styled.div<{ $selected?: boolean; $bgContainer: string; $primary: string }>`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  background: ${props => props.$bgContainer};
  aspect-ratio: 3 / 4.2;
  border: 3px solid transparent;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${fadeInUp} 0.5s ease-out backwards;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
    border-color: ${props => props.$primary}66;

    .card-image { transform: scale(1.1); }
    video.card-image { transform: none; }
    .detail-btn { opacity: 1; transform: translate(-50%, -50%); }
  }

  ${props => props.$selected && css`
    border-color: ${props.$primary};
    transform: translateY(-4px);
    box-shadow: 0 10px 25px ${props.$primary}44;
  `}
`;

const CardImageLayer = styled.div<{ $url: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$url});
  background-size: cover;
  background-position: center;
  transition: transform 0.6s ease;
`;

const CardPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(19, 194, 194, 0.25), rgba(131, 56, 236, 0.25));
  font-size: 48px;
  color: rgba(255, 255, 255, 0.6);
`;

const TopBadges = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
  pointer-events: none;
`;

const TagBadge = styled.div<{ $bg?: string; $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  background: ${props => props.$bg || 'rgba(0,0,0,0.6)'};
  color: ${props => props.$color || '#fff'};
`;

const SelectIndicator = styled.div<{ $primary: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.$primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid #fff;
`;

const CardContentGlass = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 2;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ModelTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PriceTag = styled.span`
  color: #ffd700;
  font-weight: 800;
  font-size: 12px;
`;

const DetailButtonOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -40%);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 3;
`;

const GlassButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;

  &:hover { background: rgba(255, 255, 255, 0.35); }
`;

interface EngineSelectionModalProps {
  open: boolean;
  onClose: () => void;
  engines: EngineModel[];
  selectedEngine: EngineModel | null;
  locale: string;
  onSelect: (engine: EngineModel) => void;
  onShowDetail?: (engine: EngineModel) => void;
  loading?: boolean;
}

const EngineSelectionModal: React.FC<EngineSelectionModalProps> = ({
  open,
  onClose,
  engines,
  selectedEngine,
  locale,
  onSelect,
  onShowDetail,
  loading = false,
}) => {
  const { token } = theme.useToken();
  const intl = useIntl();
  const [searchText, setSearchText] = useState('');

  const filteredEngines = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return engines;
    return engines.filter(e => {
      const name = getEngineDisplayName(e, locale).toLowerCase();
      const code = (e.modelCode || '').toLowerCase();
      const desc = (getEngineDescription(e, locale) || '').toLowerCase();
      return name.includes(q) || code.includes(q) || desc.includes(q);
    });
  }, [engines, searchText, locale]);

  const renderPriceLabel = (engine: EngineModel) => {
    const cost = formatEngineTokenCost(engine);
    const unitLabel = isPerCharUnit(engine.unit)
      ? intl.formatMessage({ id: 'create.model.price.perChar', defaultMessage: '/字' })
      : intl.formatMessage({ id: 'create.model.price.perSecond', defaultMessage: '/秒' });
    return `${cost} Token${unitLabel}`;
  };

  const renderEngineCard = (engine: EngineModel, index: number) => {
    const isSelected = selectedEngine?.id === engine.id;
    const cover = modelCoverUrl(engine);
    const isCoverVideo = Boolean(cover && isVideoUrl(cover));
    const displayName = getEngineDisplayName(engine, locale);

    return (
      <CardContainer
        key={engine.id}
        $selected={isSelected}
        $bgContainer={token.colorBgContainer}
        $primary={token.colorPrimary}
        style={{ animationDelay: `${index * 0.05}s` }}
        onMouseEnter={(e) => setGridCardVideoPlaying(e.currentTarget, true)}
        onMouseLeave={(e) => setGridCardVideoPlaying(e.currentTarget, false)}
        onClick={() => {
          onSelect(engine);
          onClose();
        }}
      >
        {isCoverVideo && cover ? (
          <video
            className="card-image"
            src={cover}
            loop
            muted
            playsInline
            preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : cover ? (
          <CardImageLayer
            className="card-image"
            $url={addImageCompressSuffix(cover, 400)}
          />
        ) : (
          <CardPlaceholder className="card-image">
            <SoundOutlined />
          </CardPlaceholder>
        )}

        <TopBadges>
          <TagBadge $bg="rgba(19, 194, 194, 0.85)" $color="#fff">
            <SoundOutlined /> TTS
          </TagBadge>
          {isSelected && (
            <SelectIndicator $primary={token.colorPrimary}>
              <CheckCircleFilled />
            </SelectIndicator>
          )}
        </TopBadges>

        {onShowDetail && (
          <DetailButtonOverlay className="detail-btn">
            <GlassButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetail(engine);
              }}
            >
              <EyeOutlined />
              <FormattedMessage id="create.speech.engineDetail" defaultMessage="查看详情" />
            </GlassButton>
          </DetailButtonOverlay>
        )}

        <CardContentGlass>
          <Tooltip title={displayName}>
            <ModelTitle>{displayName}</ModelTitle>
          </Tooltip>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <PriceTag>{renderPriceLabel(engine)}</PriceTag>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, flexShrink: 0 }}>
              {engine.companyName || engine.modelCode}
            </span>
          </div>
        </CardContentGlass>
      </CardContainer>
    );
  };

  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      width={1100}
      centered
      closeIcon={null}
      footer={null}
      styles={{
        mask: {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
      }}
    >
      <HeaderSection $bg={token.colorBgContainer}>
        <HeaderTitleRow>
          <h2 style={{ color: token.colorTextHeading }}>
            <FormattedMessage id="create.speech.selectEngine" defaultMessage="选择 TTS 引擎" />
          </h2>
          <CloseButton $hoverBg={token.colorFillSecondary} onClick={onClose}>
            ✕ <FormattedMessage id="common.close" defaultMessage="关闭" />
          </CloseButton>
        </HeaderTitleRow>

        <Input
          prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
          placeholder={intl.formatMessage({
            id: 'create.speech.engineSearch',
            defaultMessage: '搜索引擎名称或描述...',
          })}
          variant="filled"
          allowClear
          style={{ width: '100%', maxWidth: 360, borderRadius: '14px', height: '42px' }}
          onChange={e => setSearchText(e.target.value)}
        />
      </HeaderSection>

      <ScrollableContent $scrollbar={token.colorPrimary}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', padding: '100px 0', textAlign: 'center' }}>
            <Spin />
          </div>
        ) : filteredEngines.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '100px 0' }}>
            <Empty description={intl.formatMessage({ id: 'create.speech.engineSearchEmpty', defaultMessage: '未找到匹配的引擎' })} />
          </div>
        ) : (
          filteredEngines.map((engine, index) => renderEngineCard(engine, index))
        )}
      </ScrollableContent>
    </StyledModal>
  );
};

export default EngineSelectionModal;
