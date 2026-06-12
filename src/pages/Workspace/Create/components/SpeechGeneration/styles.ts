import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Card, Input } from 'antd';

export const GlobalSpeechStyles = createGlobalStyle`
  .speech-generation-page {
    .ant-form-item-control-input,
    .ant-form-item-control-input-content {
      width: 100%;
    }

    .ant-select .ant-select-selector {
      border-radius: 12px !important;
    }
    .speech-engine-select {
      width: 100% !important;
      margin-bottom: 0 !important;

      &.ant-select {
        width: 100% !important;
      }

      .ant-select-selector {
        width: 100% !important;
        padding: 0 !important;
        min-height: 75px !important;
        display: flex !important;
        align-items: stretch !important;
        border-radius: 12px !important;
        overflow: hidden !important;
      }

      &.ant-select-focused .ant-select-selector,
      &:hover .ant-select-selector {
        border-radius: 12px !important;
        overflow: hidden !important;
      }

      .ant-select-selection-wrap,
      .ant-select-selection-search {
        width: 100% !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }

      .ant-select-selection-item {
        padding: 0 !important;
        height: auto !important;
        min-height: 75px !important;
        line-height: normal !important;
        display: flex !important;
        align-items: stretch !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow: visible !important;
        flex: 1 1 auto !important;
      }

      .ant-select-selection-item > * {
        width: 100% !important;
        max-width: 100% !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }

      .ant-select-selection-placeholder {
        padding: 0 16px !important;
        line-height: 75px !important;
      }

      .ant-select-arrow {
        inset-inline-end: 12px;
      }
    }
    .ant-input,
    .ant-input-affix-wrapper,
    .ant-input-textarea textarea {
      border-radius: 12px !important;
    }
    .ant-collapse {
      border-radius: 12px !important;
      overflow: hidden;
      background: transparent;
      border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#eee'};
    }
    .ant-collapse-header {
      border-radius: 12px !important;
    }
  }
`;

export const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  min-height: 0;
  padding-bottom: 8px;
`;

export const TitleSection = styled.div`
  margin-bottom: 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  flex: 1;
  min-height: 0;
  align-items: start;

  @media (max-width: 991px) {
    grid-template-columns: 1fr;
  }
`;

export const FormColumn = styled.div`
  min-height: 0;
`;

export const ResultColumn = styled.div`
  position: sticky;
  top: 0;

  @media (max-width: 991px) {
    position: static;
  }
`;

export const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#f0f0f0'};

  .ant-card-head {
    border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#f0f0f0'};
    min-height: 48px;
  }

  .ant-card-body {
    padding: 20px 24px;
  }
`;

export const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.mode === 'dark' ? '#e8e8e8' : '#262626'};
`;

export const VoiceTitleRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const VoiceCountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: ${props => props.theme.mode === 'dark' ? '#91caff' : '#1677ff'};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(22, 119, 255, 0.15)' : 'rgba(22, 119, 255, 0.1)'};
`;

export const VoiceSearchInput = styled(Input)`
  margin-bottom: 12px;

  &.ant-input-affix-wrapper {
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 12px;

    .ant-input {
      font-size: 14px;
    }
  }
`;

export const EngineSelectWrap = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

export const EngineSelectTrigger = styled.div`
  width: 100%;
  cursor: pointer;

  &[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

export const TextAreaWrap = styled.div`
  margin-bottom: 8px;

  .ant-input-textarea-show-count::after {
    font-size: 12px;
  }
`;

export const AdvancedCollapseWrap = styled.div`
  .ant-collapse {
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#eef2f6'};
    background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fafbfc'};
  }

  .ant-collapse-header {
    padding: 10px 14px !important;
    font-size: 13px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#e8e8e8' : '#434343'};
  }

  .ant-collapse-content-box {
    padding: 12px 14px 14px !important;
  }
`;

export const AdvancedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

export const AdvancedFullRow = styled.div`
  grid-column: 1 / -1;
`;

export const CompactFormItem = styled.div`
  .ant-form-item {
    margin-bottom: 0;
  }

  .ant-form-item-label {
    padding-bottom: 4px !important;

    > label {
      font-size: 12px;
      height: 20px;
      color: ${props => props.theme.mode === 'dark' ? '#a3a3a3' : '#8c8c8c'};
    }
  }

  .ant-select-selector,
  .ant-input {
    min-height: 36px !important;
  }

  .ant-select-selection-item,
  .ant-select-selection-placeholder {
    line-height: 34px !important;
  }
`;

export const SliderPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed ${props => props.theme.mode === 'dark' ? '#303030' : '#e8edf2'};

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

export const CompactSliderItem = styled.div`
  .ant-form-item {
    margin-bottom: 0;
  }

  .ant-form-item-label {
    padding-bottom: 2px !important;

    > label {
      font-size: 12px;
      height: 18px;
      color: ${props => props.theme.mode === 'dark' ? '#a3a3a3' : '#8c8c8c'};
    }
  }

  .ant-slider {
    margin: 6px 4px 2px;
  }

  .ant-slider-rail,
  .ant-slider-track,
  .ant-slider-step {
    height: 4px;
  }

  .ant-slider-handle {
    width: 12px;
    height: 12px;
    inset-block-start: -1px;
  }
`;

export const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 0 2px;

  .switch-label {
    font-size: 12px;
    color: ${props => props.theme.mode === 'dark' ? '#a3a3a3' : '#8c8c8c'};
  }
`;

export const AdvancedHint = styled.div`
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.45;
  color: ${props => props.theme.mode === 'dark' ? '#737373' : '#999'};
`;

export const GenerateButton = styled.div`
  margin-top: 16px;

  .ant-btn {
    height: 48px;
    border-radius: 12px;
    font-weight: 600;
    border: none;
    background: linear-gradient(135deg, #13c2c2 0%, #1890ff 100%);
    box-shadow: 0 8px 20px rgba(19, 194, 194, 0.25);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #36cfc9 0%, #40a9ff 100%) !important;
      transform: translateY(-1px);
    }
  }
`;

const wavePulse = keyframes`
  0%, 100% { transform: scaleY(0.35); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
`;

const resultGlow = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.04); }
`;

export const ResultArea = styled.div`
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(165deg, #111827 0%, #0f172a 55%, #134e4a 100%)'
    : 'linear-gradient(165deg, #f8fffe 0%, #ecfeff 55%, #e0f2fe 100%)'};
  border-radius: 14px;
  padding: 20px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#334155' : '#bae6fd'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 85% 15%, rgba(19, 194, 194, 0.14), transparent 42%),
      radial-gradient(circle at 10% 90%, rgba(59, 130, 246, 0.08), transparent 40%);
    pointer-events: none;
  }
`;

export const ResultEmptyState = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 28px 16px;
  gap: 10px;
`;

export const ResultEmptyIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(19, 194, 194, 0.12)'
    : 'rgba(255, 255, 255, 0.85)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#334155' : '#bae6fd'};
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 8px 24px rgba(0, 0, 0, 0.25)'
    : '0 8px 24px rgba(14, 165, 233, 0.08)'};

  .anticon {
    font-size: 32px;
    color: #13c2c2;
  }
`;

export const ResultEmptyHint = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: ${props => props.theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  max-width: 280px;
`;

export const ResultLoadingState = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 36px 16px;
`;

export const ResultLoadingRing = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(19, 194, 194, 0.12)'
    : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#334155' : '#bae6fd'};
  animation: ${resultGlow} 1.6s ease-in-out infinite;

  .anticon {
    font-size: 28px;
    color: #13c2c2;
  }
`;

export const ResultLoadingText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? '#cbd5e1' : '#475569'};
`;

export const ResultPlayerCard = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  border-radius: 14px;
  padding: 16px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.92)'
    : 'rgba(255, 255, 255, 0.92)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 12px 32px rgba(0, 0, 0, 0.28)'
    : '0 12px 32px rgba(15, 23, 42, 0.06)'};
  backdrop-filter: blur(8px);
`;

export const ResultStatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#334155' : '#f1f5f9'};
`;

export const ResultStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#5eead4' : '#0f766e'};

  .anticon {
    font-size: 15px;
  }
`;

export const ResultFormatTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${props => props.theme.mode === 'dark' ? '#7dd3fc' : '#0369a1'};
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(56, 189, 248, 0.12)'
    : 'rgba(224, 242, 254, 0.95)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#334155' : '#bae6fd'};
`;

export const ResultPlayRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
`;

export const ResultPlayButton = styled.button<{ $playing?: boolean }>`
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #13c2c2 0%, #0891b2 100%);
  box-shadow: ${props => props.$playing
    ? '0 0 0 6px rgba(19, 194, 194, 0.18), 0 8px 20px rgba(8, 145, 178, 0.35)'
    : '0 8px 20px rgba(8, 145, 178, 0.25)'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  .anticon {
    font-size: 26px;
  }

  &:hover {
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ResultMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ResultVoiceName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#f1f5f9' : '#0f172a'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ResultPlayStatus = styled.div<{ $playing?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  color: ${props => props.$playing
    ? (props.theme.mode === 'dark' ? '#5eead4' : '#0d9488')
    : (props.theme.mode === 'dark' ? '#94a3b8' : '#64748b')};
`;

export const WaveBars = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: 24px;
  margin-bottom: 12px;
  opacity: ${props => (props.$active ? 1 : 0.25)};
  transition: opacity 0.25s ease;

  span {
    width: 3px;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(180deg, #36cfc9, #1890ff);
    transform-origin: bottom;
    animation: ${props => (props.$active ? wavePulse : 'none')} 0.9s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.1s; }
    &:nth-child(3) { animation-delay: 0.2s; }
    &:nth-child(4) { animation-delay: 0.15s; }
    &:nth-child(5) { animation-delay: 0.25s; }
    &:nth-child(6) { animation-delay: 0.05s; }
    &:nth-child(7) { animation-delay: 0.18s; }
  }
`;

export const ResultProgressTrack = styled.div`
  position: relative;
  height: 6px;
  border-radius: 999px;
  cursor: pointer;
  background: ${props => props.theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
  overflow: hidden;
`;

export const ResultProgressFill = styled.div<{ $percent: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => Math.min(100, Math.max(0, props.$percent))}%;
  border-radius: inherit;
  background: linear-gradient(90deg, #13c2c2, #3b82f6);
  transition: width 0.08s linear;
`;

export const ResultTimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: ${props => props.theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
`;

export const HiddenAudio = styled.audio`
  display: none;
`;

export const ResultActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;

  .ant-btn {
    flex: 1;
    min-width: 120px;
    border-radius: 10px;
    height: 38px;
  }
`;

export const GenderIconWrap = styled.span<{ $variant: 'male' | 'female' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex-shrink: 0;
  color: ${props => {
    if (props.$variant === 'male') return '#2563eb';
    if (props.$variant === 'female') return '#db2777';
    return props.theme.mode === 'dark' ? '#a3a3a3' : '#737373';
  }};
  background: ${props => {
    if (props.$variant === 'male') {
      return props.theme.mode === 'dark' ? 'rgba(37, 99, 235, 0.16)' : '#eff6ff';
    }
    if (props.$variant === 'female') {
      return props.theme.mode === 'dark' ? 'rgba(219, 39, 119, 0.16)' : '#fdf2f8';
    }
    return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5';
  }};

  .anticon {
    font-size: 13px;
    line-height: 1;
  }
`;

export const VoiceGrid = styled.div<{ $modal?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 10px;
  max-height: ${props => (props.$modal ? '52vh' : '360px')};
  overflow-y: auto;
  padding: 2px;
  margin-bottom: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
    border-radius: 3px;
  }
`;

export const VoiceCard = styled.button<{ $selected?: boolean }>`
  appearance: none;
  border: 1.5px solid ${props => props.$selected
    ? '#13c2c2'
    : props.theme.mode === 'dark' ? '#334155' : '#e8e8e8'};
  background: ${props => props.$selected
    ? props.theme.mode === 'dark'
      ? 'linear-gradient(165deg, rgba(19, 194, 194, 0.16) 0%, rgba(15, 23, 42, 0.95) 100%)'
      : 'linear-gradient(165deg, rgba(19, 194, 194, 0.1) 0%, #ffffff 100%)'
    : props.theme.mode === 'dark' ? '#141414' : '#fff'};
  border-radius: 14px;
  padding: 10px 10px 10px 12px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  min-height: 92px;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${props => props.$selected
    ? '0 8px 20px rgba(19, 194, 194, 0.12)'
    : props.theme.mode === 'dark' ? 'none' : '0 2px 8px rgba(15, 23, 42, 0.04)'};

  ${props => props.$selected && `
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, #36cfc9, #13c2c2);
      border-radius: 14px 0 0 14px;
    }
  `}

  &:hover {
    border-color: #36cfc9;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(19, 194, 194, 0.1);
  }
`;

export const VoiceCardCornerActions = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

export const VoiceCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
  padding-right: 46px;
`;

export const VoiceCardTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  min-width: 0;
`;

export const VoiceCardName = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  color: ${props => props.theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const VoiceCardSubtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 16px;
  min-width: 0;
  font-size: 11px;
  line-height: 1.35;
  color: ${props => props.theme.mode === 'dark' ? '#94a3b8' : '#64748b'};

  .subtitle-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const VoiceCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 14px;
  margin-top: auto;
  padding-top: 2px;
  font-size: 10px;
  line-height: 1;
  color: ${props => props.theme.mode === 'dark' ? '#64748b' : '#94a3b8'};

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
  }

  .meta-dot {
    opacity: 0.45;
    user-select: none;
  }

  .anticon {
    font-size: 10px;
    color: ${props => props.theme.mode === 'dark' ? '#475569' : '#cbd5e1'};
  }
`;

export const VoiceHotBadge = styled.span<{ $rank: number; $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => (props.$compact ? '2px' : '3px')};
  padding: ${props => (props.$compact ? '0 5px' : '1px 6px')};
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: ${props => (props.$compact ? '14px' : '16px')};
  flex-shrink: 0;
  color: ${props => (props.$rank === 1 ? '#fff' : props.theme.mode === 'dark' ? '#ffd666' : '#d48806')};
  background: ${props => (props.$rank === 1
    ? 'linear-gradient(135deg, #ff7a45, #ff4d4f)'
    : props.theme.mode === 'dark' ? 'rgba(250, 173, 20, 0.18)' : '#fff7e6')};
  border: 1px solid ${props => (props.$rank === 1 ? 'transparent' : props.theme.mode === 'dark' ? '#613400' : '#ffe7ba')};

  .anticon {
    font-size: 10px;
  }
`;

export const VoiceDetailBtn = styled.button`
  appearance: none;
  border: none;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
  color: ${props => props.theme.mode === 'dark' ? '#bfbfbf' : '#8c8c8c'};
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #13c2c2;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(19,194,194,0.15)' : 'rgba(19,194,194,0.1)'};
  }
`;

export const VoiceFavoriteBtn = styled.button<{ $active?: boolean }>`
  appearance: none;
  border: none;
  background: ${props => props.$active
    ? props.theme.mode === 'dark' ? 'rgba(250, 173, 20, 0.18)' : '#fff7e6'
    : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
  color: ${props => (props.$active ? '#faad14' : props.theme.mode === 'dark' ? '#bfbfbf' : '#8c8c8c')};
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #faad14;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(250, 173, 20, 0.18)' : '#fff7e6'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const VoiceSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#a3a3a3' : '#8c8c8c'};

  &:first-of-type {
    margin-top: 0;
  }
`;

export const VoiceSectionDivider = styled.div`
  height: 1px;
  margin: 14px 0 4px;
  background: ${props => props.theme.mode === 'dark' ? '#303030' : '#f0f0f0'};
`;

export const VoiceUsageText = styled.div`
  margin-top: 6px;
  font-size: 11px;
  color: ${props => props.theme.mode === 'dark' ? '#737373' : '#999'};
`;

export const SelectorTrigger = styled.button`
  width: 100%;
  appearance: none;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#434343' : '#d9d9d9'};
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &:hover {
    border-color: #36cfc9;
  }

  .trigger-main {
    min-width: 0;
    flex: 1;
  }

  .trigger-label {
    font-size: 12px;
    color: ${props => props.theme.mode === 'dark' ? '#8c8c8c' : '#999'};
    margin-bottom: 4px;
  }

  .trigger-value {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#262626'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trigger-meta {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .trigger-action {
    color: #13c2c2;
    font-size: 13px;
    flex-shrink: 0;
  }
`;

export const SettingsTrigger = styled(SelectorTrigger)`
  margin-top: 12px;
`;

export const SpeechModalBody = styled.div`
  .ant-spin-container > div > div:last-child > div {
    max-height: 52vh;
    overflow-y: auto;
  }
`;

export const VoiceDetailHeader = styled.div`
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
`;

export const VoiceDetailAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(19, 194, 194, 0.18), rgba(24, 144, 255, 0.12));
  color: #13c2c2;
  font-size: 24px;
`;

export const VoiceDetailMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  margin-bottom: 16px;

  .meta-item {
    font-size: 12px;
    color: ${props => props.theme.mode === 'dark' ? '#a3a3a3' : '#666'};

    strong {
      display: block;
      font-size: 11px;
      font-weight: 500;
      color: ${props => props.theme.mode === 'dark' ? '#737373' : '#999'};
      margin-bottom: 2px;
    }
  }
`;

export const CommentSection = styled.div`
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#f0f0f0'};
  padding-top: 14px;
  margin-top: 4px;

  .comment-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: ${props => props.theme.mode === 'dark' ? '#e8e8e8' : '#262626'};
  }
`;

export const CommentList = styled.div`
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
`;

export const CommentItem = styled.div`
  display: flex;
  gap: 10px;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${props => props.theme.mode === 'dark' ? '#303030' : '#f5f5f5'};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: #13c2c2;
    font-size: 14px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .body {
    flex: 1;
    min-width: 0;
  }

  .name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 2px;
  }

  .name {
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#e8e8e8' : '#434343'};
  }

  .time {
    font-size: 11px;
    color: ${props => props.theme.mode === 'dark' ? '#737373' : '#999'};
  }

  .content {
    font-size: 13px;
    line-height: 1.5;
    color: ${props => props.theme.mode === 'dark' ? '#bfbfbf' : '#595959'};
    word-break: break-word;
  }
`;

export const HistoryContainer = styled.div`
  margin-top: 8px;
`;

export const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
`;

export const HistoryTitleGroup = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#111'};
  }
`;

export const HistoryQuickLinks = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
`;

export const HistoryQuickLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(19, 194, 194, 0.35)' : 'rgba(19, 194, 194, 0.25)'};
  border-radius: 999px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(19, 194, 194, 0.08)' : 'rgba(19, 194, 194, 0.06)'};
  color: #13c2c2;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #36cfc9;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(19, 194, 194, 0.16)' : 'rgba(19, 194, 194, 0.12)'};
    color: #08979c;
  }

  .anticon {
    font-size: 12px;
  }
`;

export const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
`;

export const HistoryCard = styled.div<{ $active?: boolean }>`
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid ${props => props.$active
    ? '#13c2c2'
    : props.theme.mode === 'dark' ? '#333' : '#eee'};
  background: ${props => props.$active
    ? props.theme.mode === 'dark' ? 'rgba(19, 194, 194, 0.1)' : 'rgba(19, 194, 194, 0.06)'
    : props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};

  &:hover {
    border-color: #36cfc9;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .card-body {
    flex: 1;
    min-width: 0;
  }

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(19, 194, 194, 0.2), rgba(24, 144, 255, 0.15));
    color: #13c2c2;
    font-size: 18px;
  }

  .prompt {
    font-size: 13px;
    line-height: 1.5;
    color: ${props => props.theme.mode === 'dark' ? '#d9d9d9' : '#434343'};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-width: 0;
  }

  .voice-row {
    margin-top: 8px;
  }

  .voice-tag {
    margin: 0;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    border-radius: 999px;
    border: none;
    padding: 2px 8px 2px 6px;
    font-size: 11px;
    line-height: 1.4;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(19, 194, 194, 0.12)' : 'rgba(19, 194, 194, 0.08)'};
    color: ${props => props.theme.mode === 'dark' ? '#8ee8e8' : '#08979c'};

    .anticon {
      font-size: 11px;
    }
  }

  .voice-label {
    flex-shrink: 0;
    opacity: 0.85;
  }

  .voice-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }

  .meta {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#999'};
  }

  .card-actions {
    display: flex;
    gap: 4px;
    align-items: center;

    .ant-btn-dangerous:hover {
      color: #ff4d4f;
      background: rgba(255, 77, 79, 0.08);
    }
  }
`;
