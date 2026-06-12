import React, { useMemo, useState } from 'react';
import {
  FireOutlined,
  InfoCircleOutlined,
  ManOutlined,
  MessageOutlined,
  StarFilled,
  StarOutlined,
  ThunderboltOutlined,
  WomanOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Empty, Segmented, Spin, Tooltip } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  GenderIconWrap,
  SectionLabel,
  VoiceCard,
  VoiceCardBody,
  VoiceCardCornerActions,
  VoiceCardMeta,
  VoiceCardName,
  VoiceCardSubtitle,
  VoiceCardTitleRow,
  VoiceCountBadge,
  VoiceDetailBtn,
  VoiceFavoriteBtn,
  VoiceGrid,
  VoiceHotBadge,
  VoiceSearchInput,
  VoiceSectionDivider,
  VoiceSectionTitle,
  VoiceTitleRow,
} from './styles';
import { VoiceModel } from './voiceTypes';

export type VoiceSortMode = 'default' | 'popular';

interface VoicePickerProps {
  voices: VoiceModel[];
  value?: string;
  loading?: boolean;
  sortMode?: VoiceSortMode;
  favoriteLoadingId?: number | null;
  onSortModeChange?: (mode: VoiceSortMode) => void;
  getVoiceName: (voice: VoiceModel) => string;
  onChange: (voiceCode: string) => void;
  onDetailClick?: (voice: VoiceModel) => void;
  onToggleFavorite?: (voice: VoiceModel, favorited: boolean) => void;
  inModal?: boolean;
}

type GenderVariant = 'male' | 'female' | 'neutral';

const resolveGenderVariant = (gender?: string): GenderVariant => {
  if (gender === 'male' || gender === 'female') {
    return gender;
  }
  return 'neutral';
};

const genderIconMap = {
  male: ManOutlined,
  female: WomanOutlined,
  neutral: UserOutlined,
} as const;

const formatCompactCount = (count: number) => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}w`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
};

const VoicePicker: React.FC<VoicePickerProps> = ({
  voices,
  value,
  loading,
  sortMode = 'default',
  favoriteLoadingId,
  onSortModeChange,
  getVoiceName,
  onChange,
  onDetailClick,
  onToggleFavorite,
  inModal,
}) => {
  const intl = useIntl();
  const [keyword, setKeyword] = useState('');

  const getGenderLabel = (gender: string) => {
    if (gender === 'male') {
      return intl.formatMessage({ id: 'create.speech.genderMale', defaultMessage: '男声' });
    }
    if (gender === 'female') {
      return intl.formatMessage({ id: 'create.speech.genderFemale', defaultMessage: '女声' });
    }
    return intl.formatMessage({ id: 'create.speech.genderNeutral', defaultMessage: '中性' });
  };

  const getHotLabel = (rank?: number) => {
    if (rank === 1) {
      return intl.formatMessage({ id: 'create.speech.hotTop1', defaultMessage: '最热' });
    }
    if (rank === 2 || rank === 3) {
      return intl.formatMessage({ id: 'create.speech.hotTop', defaultMessage: '热门' });
    }
    return '';
  };

  const getLanguageTag = (language?: string) => {
    const lang = language?.toLowerCase() || '';
    if (lang.startsWith('zh')) {
      return {
        id: 'create.speech.tagMixed',
        defaultMessage: '中英混',
      };
    }
    if (lang.startsWith('en')) {
      return {
        id: 'create.speech.tagEnOnly',
        defaultMessage: '仅英语',
      };
    }
    return null;
  };

  const sortedVoices = useMemo(() => {
    if (sortMode !== 'popular') {
      return voices;
    }
    return [...voices].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  }, [voices, sortMode]);

  const filteredVoices = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) {
      return sortedVoices;
    }
    return sortedVoices.filter(voice => {
      const name = getVoiceName(voice).toLowerCase();
      return (
        name.includes(q)
        || voice.voiceCode.toLowerCase().includes(q)
        || (voice.voiceNameEn || '').toLowerCase().includes(q)
        || (voice.style || '').toLowerCase().includes(q)
      );
    });
  }, [sortedVoices, keyword, getVoiceName]);

  const { favoriteVoices, otherVoices } = useMemo(() => ({
    favoriteVoices: filteredVoices.filter(voice => voice.favorited),
    otherVoices: filteredVoices.filter(voice => !voice.favorited),
  }), [filteredVoices]);

  const voiceCountLabel = useMemo(() => {
    const total = voices.length;
    if (total === 0) {
      return '';
    }
    const filtered = filteredVoices.length;
    const isFiltering = keyword.trim().length > 0 && filtered !== total;
    if (isFiltering) {
      return intl.formatMessage(
        { id: 'create.speech.voiceCountFiltered', defaultMessage: '{filtered}/{total}' },
        { filtered, total },
      );
    }
    return intl.formatMessage(
      { id: 'create.speech.voiceCount', defaultMessage: '{count} 个' },
      { count: total },
    );
  }, [voices.length, filteredVoices.length, keyword, intl]);

  const renderVoiceCard = (voice: VoiceModel) => {
    const genderVariant = resolveGenderVariant(voice.gender);
    const GenderIcon = genderIconMap[genderVariant];
    const hotLabel = getHotLabel(voice.hotRank);
    const languageTag = getLanguageTag(voice.language);
    const usageCount = voice.usageCount || 0;
    const commentCount = voice.commentCount || 0;

    const subtitleParts: string[] = [];
    if (voice.style) {
      subtitleParts.push(voice.style);
    }
    if (languageTag) {
      subtitleParts.push(
        intl.formatMessage({
          id: languageTag.id,
          defaultMessage: languageTag.defaultMessage,
        }),
      );
    }
    const subtitleText = subtitleParts.join(' · ');

    return (
      <VoiceCard
        key={voice.voiceCode}
        type="button"
        $selected={value === voice.voiceCode}
        onClick={() => onChange(voice.voiceCode)}
      >
        <VoiceCardCornerActions>
          {onToggleFavorite && (
            <VoiceFavoriteBtn
              type="button"
              $active={!!voice.favorited}
              disabled={favoriteLoadingId === voice.id}
              aria-label={intl.formatMessage({
                id: voice.favorited ? 'create.speech.unfavoriteVoice' : 'create.speech.favoriteVoice',
                defaultMessage: voice.favorited ? '取消收藏' : '收藏音色',
              })}
              onClick={e => {
                e.stopPropagation();
                onToggleFavorite(voice, !!voice.favorited);
              }}
            >
              {voice.favorited ? <StarFilled /> : <StarOutlined />}
            </VoiceFavoriteBtn>
          )}
          {onDetailClick && (
            <VoiceDetailBtn
              type="button"
              aria-label={intl.formatMessage({ id: 'create.speech.voiceDetail', defaultMessage: '音色详情' })}
              onClick={e => {
                e.stopPropagation();
                onDetailClick(voice);
              }}
            >
              <InfoCircleOutlined />
            </VoiceDetailBtn>
          )}
        </VoiceCardCornerActions>

        <VoiceCardBody>
          <VoiceCardTitleRow>
            <Tooltip title={getGenderLabel(voice.gender || 'neutral')}>
              <GenderIconWrap
                $variant={genderVariant}
                aria-label={getGenderLabel(voice.gender || 'neutral')}
              >
                <GenderIcon />
              </GenderIconWrap>
            </Tooltip>
            <VoiceCardName title={getVoiceName(voice)}>
              {getVoiceName(voice)}
            </VoiceCardName>
          </VoiceCardTitleRow>

          <VoiceCardSubtitle>
            {hotLabel && (
              <VoiceHotBadge $rank={voice.hotRank || 0} $compact title={hotLabel}>
                <FireOutlined />
                {hotLabel}
              </VoiceHotBadge>
            )}
            <span className="subtitle-text" title={subtitleText || undefined}>
              {subtitleText || (
                <FormattedMessage id="create.speech.voiceNoDesc" defaultMessage="通用音色" />
              )}
            </span>
          </VoiceCardSubtitle>

          <VoiceCardMeta>
            {usageCount > 0 && (
              <span
                className="meta-item"
                title={intl.formatMessage(
                  { id: 'create.speech.voiceUsageCount', defaultMessage: '{count} 次使用' },
                  { count: usageCount },
                )}
              >
                <ThunderboltOutlined />
                <FormattedMessage
                  id="create.speech.voiceUsageShort"
                  defaultMessage="{count} 次"
                  values={{ count: formatCompactCount(usageCount) }}
                />
              </span>
            )}
            {usageCount > 0 && commentCount > 0 && <span className="meta-dot">·</span>}
            {commentCount > 0 && (
              <span
                className="meta-item"
                title={intl.formatMessage(
                  { id: 'create.speech.voiceCommentShort', defaultMessage: '{count} 条评论' },
                  { count: commentCount },
                )}
              >
                <MessageOutlined />
                <FormattedMessage
                  id="create.speech.voiceCommentShort"
                  defaultMessage="{count} 条评论"
                  values={{ count: formatCompactCount(commentCount) }}
                />
              </span>
            )}
          </VoiceCardMeta>
        </VoiceCardBody>
      </VoiceCard>
    );
  };

  return (
    <div>
      <SectionLabel>
        <VoiceTitleRow>
          <FormattedMessage id="create.speech.voice" defaultMessage="音色" />
          {!loading && voices.length > 0 && (
            <VoiceCountBadge title={voiceCountLabel}>{voiceCountLabel}</VoiceCountBadge>
          )}
        </VoiceTitleRow>
        {onSortModeChange && (
          <Segmented
            size="small"
            value={sortMode}
            onChange={val => onSortModeChange(val as VoiceSortMode)}
            options={[
              {
                label: intl.formatMessage({ id: 'create.speech.voiceSortDefault', defaultMessage: '默认' }),
                value: 'default',
              },
              {
                label: intl.formatMessage({ id: 'create.speech.voiceSortPopular', defaultMessage: '最热门' }),
                value: 'popular',
              },
            ]}
          />
        )}
      </SectionLabel>
      <VoiceSearchInput
        allowClear
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder={intl.formatMessage({
          id: 'create.speech.voiceSearch',
          defaultMessage: '搜索音色名称或场景',
        })}
      />
      <Spin spinning={loading}>
        {filteredVoices.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              keyword
                ? intl.formatMessage({ id: 'create.speech.voiceSearchEmpty', defaultMessage: '无匹配音色' })
                : intl.formatMessage({ id: 'create.speech.noVoice', defaultMessage: '暂无可用音色' })
            }
          />
        ) : (
          <>
            {favoriteVoices.length > 0 && (
              <>
                <VoiceSectionTitle>
                  <StarFilled style={{ color: '#faad14', fontSize: 12 }} />
                  <FormattedMessage id="create.speech.favoriteSection" defaultMessage="我的收藏" />
                  <VoiceCountBadge style={{ marginLeft: 4 }}>{favoriteVoices.length}</VoiceCountBadge>
                </VoiceSectionTitle>
                <VoiceGrid $modal={inModal}>
                  {favoriteVoices.map(renderVoiceCard)}
                </VoiceGrid>
              </>
            )}
            {favoriteVoices.length > 0 && otherVoices.length > 0 && <VoiceSectionDivider />}
            {otherVoices.length > 0 && (
              <>
                {favoriteVoices.length > 0 && (
                  <VoiceSectionTitle>
                    <FormattedMessage id="create.speech.allVoicesSection" defaultMessage="全部音色" />
                  </VoiceSectionTitle>
                )}
                <VoiceGrid $modal={inModal}>
                  {otherVoices.map(renderVoiceCard)}
                </VoiceGrid>
              </>
            )}
          </>
        )}
      </Spin>
    </div>
  );
};

export default VoicePicker;
