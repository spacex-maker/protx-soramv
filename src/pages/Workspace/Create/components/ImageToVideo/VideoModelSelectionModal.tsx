/**
 * 图生视频专用模型卡片弹窗（从文生图 UI 复制并独立维护；支持封面视频播放，不修改 TextToImage）
 */
import React, { useMemo, useState } from 'react';
import { Modal, Empty, Tooltip, theme, Input, Select, Tag } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  EyeOutlined,
  CheckCircleFilled,
  CrownFilled,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import styled, { css, keyframes } from 'styled-components';
import dayjs from 'dayjs';

import { isFree } from '../TextToImage/utils';
import { isVideoUrl, modelCoverUrl } from './utils';

const addImageCompressSuffix = (url: string | null | undefined, width = 600): string => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/85/thumbnail/${width}x`;
};

/** 网格内多路同时 autoPlay 会卡：仅悬停时播放 */
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

const isNewModel = (dateStr: string) => {
  if (!dateStr) return false;
  return dayjs(dateStr).isAfter(dayjs().subtract(30, 'day'));
};

// --- 动画 ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: transparent !important; /* 核心：让 Modal 背景透明 */
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

// 1. 顶部全圆弧独立区域
const HeaderSection = styled.div<{ $bg: string }>`
  padding: 24px 32px;
  background: ${props => props.$bg};
  border-radius: 32px; /* 全圆弧设计 */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
  margin-bottom: 20px; /* 与下方内容产生物理间隔 */
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

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

// 2. 底部模型列表区域：背景透明
const ScrollableContent = styled.div<{ $scrollbar: string }>`
  flex: 1;
  overflow-y: auto;
  padding: 10px 4px 40px 4px; /* 侧边留空防止阴影被切断 */
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
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ModelTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
`;

const PriceTag = styled.span<{ $isFree?: boolean }>`
  color: ${props => props.$isFree ? '#52c41a' : '#ffd700'};
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

// --- 主组件 ---

interface VideoModelSelectionModalProps {
  open: boolean;
  onClose: () => void;
  type?: 'family' | 'style';
  title: string;
  models: any[];
  selectedModel: any | null;
  onSelect: (model: any) => void;
  onShowDetail?: (model: any) => void;
  loading?: boolean;
}

const VideoModelSelectionModal: React.FC<VideoModelSelectionModalProps> = ({
  open,
  onClose,
  type,
  title,
  models,
  selectedModel,
  onSelect,
  onShowDetail,
  loading = false,
}) => {
  const { token } = theme.useToken();
  const intl = useIntl();
  const [searchText, setSearchText] = useState('');
  const [baseModelFilter, setBaseModelFilter] = useState<'all' | 'SDXL' | 'v1.5'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const filteredModels = useMemo(() => {
    return models.filter(m => {
      if (baseModelFilter === 'SDXL' && m.modelLevel !== 1) return false;
      if (baseModelFilter === 'v1.5' && m.modelLevel === 1) return false;
      if (searchText && !m.modelName.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (type === 'family' && priceFilter !== 'all') {
        const free = isFree(m.outputPrice, m.currency, m.tokenCost);
        if (priceFilter === 'free' && !free) return false;
        if (priceFilter === 'paid' && free) return false;
      }
      return true;
    });
  }, [models, searchText, baseModelFilter, type, priceFilter]);

  const renderModelCard = (model: any, index: number, token: any) => {
    const isSelected = selectedModel?.id === model.id;
    const isOfficial = model.companyCode === 'stability' || model.companyId === 13;
    const tokenCost = model.tokenCost ?? 0;
    const isFreeModel = isFree(model.outputPrice, model.currency, model.tokenCost);
    const cover = modelCoverUrl(model);
    const isCoverVideo = Boolean(cover && isVideoUrl(cover));

    return (
      <CardContainer
        key={model.id}
        $selected={isSelected}
        $bgContainer={token.colorBgContainer}
        $primary={token.colorPrimary}
        style={{ animationDelay: `${index * 0.05}s` }}
        onMouseEnter={(e) => setGridCardVideoPlaying(e.currentTarget, true)}
        onMouseLeave={(e) => setGridCardVideoPlaying(e.currentTarget, false)}
        onClick={() => {
          onSelect(model);
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
            <GlassButton onClick={(e) => {
              e.stopPropagation();
              onShowDetail(model);
            }}>
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
                  { count: tokenCost }
                )
              )}
            </PriceTag>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              {model.companyName || (model.modelName === 'Nano Banana Pro' ? 'Google' : (model.modelLevel == 1 ? 'SDXL' : model.modelLevel == 2 ? 'LORA' : 'V1.5'))}
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
      {/* 1. 顶部全圆弧控制面板 */}
      <HeaderSection $bg={token.colorBgContainer}>
        <HeaderTitleRow>
          <h2 style={{ color: token.colorTextHeading }}>{title}</h2>
          <CloseButton 
            $hoverBg={token.colorFillSecondary} 
            onClick={onClose}
          >
            ✕ 关闭
          </CloseButton>
        </HeaderTitleRow>

        <FilterBar>
          <Input 
            prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
            placeholder="搜索模型..." 
            variant="filled"
            allowClear
            style={{ width: 280, borderRadius: '14px', height: '42px' }}
            onChange={e => setSearchText(e.target.value)}
          />

          {type === 'family' ? (
            <Select
              value={priceFilter}
              variant="filled"
              style={{ width: 160, height: '42px' }}
              onChange={val => setPriceFilter(val as 'all' | 'free' | 'paid')}
              options={[
                { value: 'all', label: intl.formatMessage({ id: 'create.model.filter.all', defaultMessage: '全部' }) },
                { value: 'free', label: intl.formatMessage({ id: 'create.model.free', defaultMessage: '免费' }) },
                { value: 'paid', label: intl.formatMessage({ id: 'create.model.filter.other', defaultMessage: '其他' }) },
              ]}
            />
          ) : (
            <Select
              value={baseModelFilter}
              variant="filled"
              style={{ width: 160, height: '42px' }}
              onChange={val => setBaseModelFilter(val as any)}
              options={[
                { value: 'all', label: '所有引擎' },
                { value: 'SDXL', label: 'SDXL' },
                { value: 'v1.5', label: 'SD v1.5' },
              ]}
            />
          )}
        </FilterBar>
      </HeaderSection>

      {/* 2. 透明滚动内容流 */}
      <ScrollableContent $scrollbar={token.colorPrimary}>
        {filteredModels.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '100px 0' }}>
            <Empty description={<span style={{ color: '#fff' }}>未找到相关模型</span>} />
          </div>
        ) : (
          filteredModels.map((model, index) => renderModelCard(model, index, token))
        )}
      </ScrollableContent>
    </StyledModal>
  );
};

export default VideoModelSelectionModal;