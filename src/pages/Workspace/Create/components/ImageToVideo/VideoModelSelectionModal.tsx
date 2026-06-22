/**
 * 图生视频专用模型卡片弹窗（从文生图 UI 复制并独立维护；支持封面视频播放，不修改 TextToImage）
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Empty, Input, Select, theme } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { SearchOutlined } from '@ant-design/icons';

import { isFree } from '../TextToImage/utils';
import { clearCoverVideoCache, pauseActiveCoverVideo } from '../shared/coverVideoPlayback';
import { preloadVideoModelCovers } from '../shared/videoModelCoverPreload';
import ModelSelectionCard from './ModelSelectionCard';
import {
  CloseButton,
  FilterBar,
  HeaderSection,
  HeaderTitleRow,
  ScrollableContent,
  StyledModal,
} from './VideoModelSelectionModal.styles';

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
  zIndex?: number;
  getContainer?: () => HTMLElement;
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
  zIndex,
  getContainer,
}) => {
  const { token } = theme.useToken();
  const intl = useIntl();
  const [searchText, setSearchText] = useState('');
  const [baseModelFilter, setBaseModelFilter] = useState<'all' | 'SDXL' | 'v1.5'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    if (!open) {
      pauseActiveCoverVideo();
      clearCoverVideoCache();
      return;
    }
    if (models.length > 0) {
      preloadVideoModelCovers(models, { priorityModelId: selectedModel?.id ?? undefined });
    }
  }, [open, models, selectedModel?.id]);

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

  const handleSelect = useCallback(
    (model: any) => {
      onSelect(model);
      onClose();
    },
    [onClose, onSelect],
  );

  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      width={1100}
      centered
      closeIcon={null}
      footer={null}
      destroyOnClose={false}
      zIndex={zIndex}
      getContainer={getContainer}
      styles={{
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
        },
      }}
    >
      <HeaderSection $bg={token.colorBgContainer}>
        <HeaderTitleRow>
          <h2 style={{ color: token.colorTextHeading }}>{title}</h2>
          <CloseButton $hoverBg={token.colorFillSecondary} onClick={onClose}>
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
              onChange={val => setBaseModelFilter(val as 'all' | 'SDXL' | 'v1.5')}
              options={[
                { value: 'all', label: '所有引擎' },
                { value: 'SDXL', label: 'SDXL' },
                { value: 'v1.5', label: 'SD v1.5' },
              ]}
            />
          )}
        </FilterBar>
      </HeaderSection>

      <ScrollableContent $scrollbar={token.colorPrimary}>
        {filteredModels.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '100px 0' }}>
            <Empty description={<span style={{ color: '#fff' }}>未找到相关模型</span>} />
          </div>
        ) : (
          filteredModels.map((model, index) => (
            <ModelSelectionCard
              key={model.id}
              model={model}
              index={index}
              isSelected={selectedModel?.id === model.id}
              modalOpen={open}
              token={token}
              onSelect={handleSelect}
              onShowDetail={onShowDetail}
            />
          ))
        )}
      </ScrollableContent>
    </StyledModal>
  );
};

export default VideoModelSelectionModal;
