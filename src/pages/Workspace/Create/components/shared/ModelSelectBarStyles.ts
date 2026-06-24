import styled, { css, keyframes } from 'styled-components';
import {
  MODEL_SELECT_FIELD_HEIGHT,
  MODEL_SELECT_FIELD_BORDER_RADIUS,
  MODEL_SELECT_FIELD_BORDER_RADIUS_MOBILE,
  MODEL_SELECT_FIELD_PADDING,
  MODEL_SELECT_FIELD_HEIGHT_COMPACT,
  MODEL_SELECT_FIELD_BORDER_RADIUS_COMPACT,
  MODEL_SELECT_FIELD_PADDING_COMPACT,
} from './modelSelectFieldTokens';

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const barMetrics = (compact?: boolean) => css`
  min-height: ${compact ? MODEL_SELECT_FIELD_HEIGHT_COMPACT : MODEL_SELECT_FIELD_HEIGHT}px;
  height: ${compact ? MODEL_SELECT_FIELD_HEIGHT_COMPACT : MODEL_SELECT_FIELD_HEIGHT}px;
  padding: ${compact ? MODEL_SELECT_FIELD_PADDING_COMPACT : MODEL_SELECT_FIELD_PADDING};
  border-radius: ${compact
    ? MODEL_SELECT_FIELD_BORDER_RADIUS_COMPACT
    : MODEL_SELECT_FIELD_BORDER_RADIUS}px;

  @media (max-width: 768px) {
    border-radius: ${compact
      ? MODEL_SELECT_FIELD_BORDER_RADIUS_COMPACT
      : MODEL_SELECT_FIELD_BORDER_RADIUS_MOBILE}px;
  }
`;

const coverRadius = (compact?: boolean) => css`
  border-radius: 0 ${compact ? MODEL_SELECT_FIELD_BORDER_RADIUS_COMPACT : MODEL_SELECT_FIELD_BORDER_RADIUS}px
    ${compact ? MODEL_SELECT_FIELD_BORDER_RADIUS_COMPACT : MODEL_SELECT_FIELD_BORDER_RADIUS}px  0;

  @media (max-width: 768px) {
    border-radius: 0 ${compact
      ? MODEL_SELECT_FIELD_BORDER_RADIUS_COMPACT
      : MODEL_SELECT_FIELD_BORDER_RADIUS_MOBILE}px
      ${compact ? MODEL_SELECT_FIELD_BORDER_RADIUS_COMPACT : MODEL_SELECT_FIELD_BORDER_RADIUS_MOBILE}px 0;
  }
`;

/** 封面占据右侧比例，与文生图展示一致 */
const MODEL_SELECT_BAR_COVER_WIDTH = '50%';

const coverFadeMask = css`
  mask-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.55) 45%,
    rgba(0, 0, 0, 0.15) 75%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.55) 45%,
    rgba(0, 0, 0, 0.15) 75%,
    rgba(0, 0, 0, 0) 100%
  );
`;

/** 创作台统一：圆角长条，展示当前选中的模型 */
export const ModelSelectBarRoot = styled.div<{
  $compact?: boolean;
  $disabled?: boolean;
  $loading?: boolean;
  $hasCover?: boolean;
}>`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: ${(p) => (p.$disabled || p.$loading ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.65 : 1)};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#434343' : '#d9d9d9')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#ffffff')};
  transition: border-color 0.2s, box-shadow 0.2s;
  padding-right: 40px;
  ${(p) => barMetrics(p.$compact)}

  &:hover {
    border-color: ${(p) =>
      p.$disabled || p.$loading
        ? p.theme.mode === 'dark'
          ? '#434343'
          : '#d9d9d9'
        : '#4096ff'};
  }

  ${(p) =>
    p.$hasCover
      ? css`
          &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: ${p.theme.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.2)'
              : 'rgba(255, 255, 255, 0.3)'};
            z-index: 0;
            pointer-events: none;
          }
        `
      : ''}

  .model-select-bar-cover-media {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: ${MODEL_SELECT_BAR_COVER_WIDTH};
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    ${(p) => coverRadius(p.$compact)}
    ${coverFadeMask}
  }

  .model-select-bar-cover-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center right;
    background-repeat: no-repeat;
  }

  .model-select-bar-cover-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center right;
    display: block;
  }

  > *:not(.model-select-bar-arrow):not(.model-select-bar-cover-media) {
    position: relative;
    z-index: 1;
  }

  .model-display-content {
    display: flex;
    align-items: stretch;
    flex: 1;
    min-width: 0;
    width: 100%;
    min-height: 100%;
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    gap: 12px;
  }

  .model-display-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
  }

  .model-display-meta {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    align-self: stretch;
    margin-left: auto;
    gap: 6px;
    text-align: right;
  }

  .model-display-name {
    font-weight: 600;
    font-size: 18px;
    line-height: 1.35;
    background: linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #4facfe 75%,
      #00f2fe 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.3px;
    background-size: 200% auto;
    animation: ${gradientShift} 3s ease infinite;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .model-display-code {
    font-size: 12px;
    line-height: 1.35;
    color: #999;
    white-space: nowrap;
  }

  .model-display-price {
    display: inline-flex;
    align-items: baseline;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 4px;
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.06)'};
    flex-shrink: 0;
  }

  .model-display-price-amount {
    font-weight: 600;
    font-size: 15px;
    color: #52c41a;
    line-height: 1.2;
  }

  .model-display-price-currency,
  .model-display-price-unit {
    font-weight: 500;
    font-size: 12px;
    color: #8c8c8c;
    margin-left: 1px;
  }

  .model-display-price-unit {
    font-weight: 400;
    font-size: 11px;
    color: #bfbfbf;
    margin-left: 2px;
  }

  .model-display-free {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 4px;
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.06)'};
    font-weight: 600;
    font-size: 14px;
    color: #1890ff;
    line-height: 1.2;
    flex-shrink: 0;
  }

  .model-display-brand {
    font-size: 11px;
    font-weight: 600;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)')};
    letter-spacing: 0.5px;
    line-height: 1.2;
    white-space: nowrap;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ${(p) =>
    p.$compact &&
    css`
      .model-display-name {
        font-size: 15px;
      }

      .model-display-code {
        font-size: 11px;
      }

      .model-display-price-amount {
        font-size: 13px;
      }

      .model-display-price-currency,
      .model-display-price-unit {
        font-size: 10px;
      }

      .model-display-free {
        font-size: 12px;
      }

      .model-display-brand {
        display: none;
      }
    `}
`;

export const ModelSelectBarPlaceholder = styled.span`
  flex: 1;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.25)' : '#bfbfbf')};
  font-size: 16px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ModelSelectBarArrow = styled.span`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)')};
  font-size: 12px;
  pointer-events: none;
`;

export const ModelSelectDropdownPanel = styled.div`
  background: ${(p) => (p.theme.mode === 'dark' ? '#1f1f1f' : '#fff')};
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#303030' : '#f0f0f0')};
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
  min-width: 100%;
`;

export const ModelSelectDropdownItem = styled.div<{ $active?: boolean }>`
  cursor: pointer;
  border-radius: 8px;
  margin: 2px 0;
  transition: background 0.15s;
  background: ${(p) =>
    p.$active
      ? p.theme.mode === 'dark'
        ? 'rgba(24, 144, 255, 0.15)'
        : 'rgba(24, 144, 255, 0.08)'
      : 'transparent'};

  &:hover {
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  }
`;
