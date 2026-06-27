import React, { useCallback, useEffect, useState } from 'react';
import {
  Empty,
  Modal,
  Spin,
  Typography,
  Button,
  message,
} from 'antd';
import {
  HeartFilled,
  HeartOutlined,
  StarFilled,
  StarOutlined,
  ArrowRightOutlined,
  ZoomInOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes, useTheme } from 'styled-components';
import instance from 'api/axios';
import {
  I2iOfficialPlay,
  I2iOfficialPlaySortBy,
  resolvePlayDescription,
  resolvePlayDisplayName,
  resolveOfficialPlayImageUrl,
  OFFICIAL_PLAY_THUMB_IMAGE_WIDTH,
  OFFICIAL_PLAY_PREVIEW_IMAGE_WIDTH,
} from './officialPlayTypes';
import OfficialPlayMobileView from './OfficialPlayMobileView';

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

const { Text } = Typography;

const REF_IMG_WIDTH = 140;
const PREVIEW_IMG_MAX_HEIGHT = 'min(88vh, 760px)';
const PREVIEW_PANEL_MAX_WIDTH = 500;

const fadeInUp = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
`;

const refThumbStyle = `
  width: ${REF_IMG_WIDTH}px;
  aspect-ratio: 3 / 4;
  height: auto;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 14px;
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0;
  }

  .ant-modal-header,
  .ant-modal-footer {
    display: none;
  }

  .ant-modal-body {
    padding: 0;
  }

  .ant-modal-close {
    display: none;
  }
`;

const PreviewStyledModal = styled(Modal)<{ $isMobile?: boolean; $isDark?: boolean }>`
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

const ModalShell = styled.div<{ $isDark: boolean }>`
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  background: ${(p) =>
    p.$isDark
      ? 'linear-gradient(165deg, #0f1117 0%, #141824 45%, #0a0d14 100%)'
      : 'linear-gradient(165deg, #ffffff 0%, #f4f7ff 55%, #eef2ff 100%)'};
  box-shadow: ${(p) =>
    p.$isDark
      ? '0 32px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.06)'
      : '0 32px 80px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(59, 130, 246, 0.08)'};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: ${(p) =>
      p.$isDark
        ? 'linear-gradient(135deg, rgba(96,165,250,0.35), rgba(167,139,250,0.2), rgba(59,130,246,0.15))'
        : 'linear-gradient(135deg, rgba(59,130,246,0.45), rgba(147,197,253,0.35), rgba(99,102,241,0.2))'};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`;

const AmbientOrb = styled.div<{ $isDark: boolean }>`
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;

  &.orb-a {
    top: -80px;
    right: -40px;
    background: ${(p) =>
      p.$isDark ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.18)'};
    animation: ${pulseGlow} 4s ease-in-out infinite;
  }

  &.orb-b {
    bottom: -100px;
    left: -60px;
    background: ${(p) =>
      p.$isDark ? 'rgba(167, 139, 250, 0.16)' : 'rgba(147, 197, 253, 0.28)'};
    animation: ${pulseGlow} 5s ease-in-out infinite reverse;
  }
`;

const ModalInner = styled.div`
  position: relative;
  z-index: 1;
  padding: 28px 28px 24px;

  @media (max-width: 900px) {
    padding: 20px 16px 16px;
  }
`;

const HeroHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
`;

const HeroText = styled.div`
  flex: 1;
  min-width: 0;
`;

const Eyebrow = styled.div<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: ${(p) => (p.$isDark ? '#93c5fd' : '#2563eb')};
  background: ${(p) =>
    p.$isDark ? 'rgba(59, 130, 246, 0.14)' : 'rgba(59, 130, 246, 0.1)'};
  border: 1px solid
    ${(p) => (p.$isDark ? 'rgba(147, 197, 253, 0.25)' : 'rgba(59, 130, 246, 0.2)')};
`;

const HeroTitle = styled.h2<{ $isDark: boolean }>`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  background: ${(p) =>
    p.$isDark
      ? 'linear-gradient(135deg, #ffffff 0%, #93c5fd 55%, #c4b5fd 100%)'
      : 'linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #6366f1 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroHint = styled.p<{ $isDark: boolean }>`
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)')};
  max-width: 420px;
`;

const ClosePill = styled.button<{ $isDark: boolean }>`
  border: none;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  color: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.85)' : '#334155')};
  background: ${(p) =>
    p.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)'};
  border: 1px solid
    ${(p) => (p.$isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.25)')};
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.04);
    background: ${(p) =>
      p.$isDark ? 'rgba(255,255,255,0.14)' : '#ffffff'};
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
`;

const SortPills = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FavoritesPill = styled.button<{ $active?: boolean; $isDark: boolean }>`
  border: 1px solid
    ${(p) =>
      p.$active
        ? 'transparent'
        : p.$isDark
          ? 'rgba(250, 173, 20, 0.35)'
          : 'rgba(250, 173, 20, 0.45)'};
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  color: ${(p) =>
    p.$active ? '#fff' : p.$isDark ? '#fcd34d' : '#d97706'};
  background: ${(p) =>
    p.$active
      ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
      : p.$isDark
        ? 'rgba(250, 173, 20, 0.1)'
        : 'rgba(254, 243, 199, 0.85)'};
  box-shadow: ${(p) =>
    p.$active ? '0 8px 24px rgba(245, 158, 11, 0.35)' : 'none'};

  &:hover {
    transform: translateY(-1px);
    border-color: ${(p) => (p.$active ? 'transparent' : 'rgba(245, 158, 11, 0.55)')};
  }
`;

const SortPill = styled.button<{ $active?: boolean; $isDark: boolean }>`
  border: 1px solid
    ${(p) =>
      p.$active
        ? 'transparent'
        : p.$isDark
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(148,163,184,0.25)'};
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  color: ${(p) =>
    p.$active
      ? '#fff'
      : p.$isDark
        ? 'rgba(255,255,255,0.65)'
        : '#64748b'};
  background: ${(p) =>
    p.$active
      ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
      : p.$isDark
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(255,255,255,0.7)'};
  box-shadow: ${(p) =>
    p.$active ? '0 8px 24px rgba(59, 130, 246, 0.35)' : 'none'};

  &:hover {
    transform: translateY(-1px);
    border-color: ${(p) => (p.$active ? 'transparent' : 'rgba(59,130,246,0.35)')};
  }
`;

const PlayList = styled.div`
  max-height: min(58vh, 560px);
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 6px;

  @media (max-width: 900px) {
    max-height: min(52vh, 480px);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(59,130,246,0.2)')};
    border-radius: 999px;
  }
`;

const PlayCard = styled.div<{ $selected?: boolean; $index: number; $isDark: boolean }>`
  display: block;
  width: 100%;
  box-sizing: border-box;
  animation: ${fadeInUp} 0.35s ease forwards;
  animation-delay: ${(p) => `${Math.min(p.$index * 0.04, 0.28)}s`};
  border-radius: 22px;
  padding: 14px;
  position: relative;
  margin-bottom: 14px;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  border: 1px solid
    ${(p) =>
      p.$selected
        ? 'rgba(59, 130, 246, 0.65)'
        : p.$isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(148, 163, 184, 0.18)'};
  background: ${(p) =>
    p.$selected
      ? p.$isDark
        ? 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.1) 100%)'
        : 'linear-gradient(135deg, rgba(239,246,255,0.95) 0%, rgba(238,242,255,0.9) 100%)'
      : p.$isDark
        ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%)'};
  box-shadow: ${(p) =>
    p.$selected
      ? '0 16px 40px rgba(59, 130, 246, 0.22), inset 0 1px 0 rgba(255,255,255,0.08)'
      : p.$isDark
        ? '0 8px 24px rgba(0,0,0,0.25)'
        : '0 8px 24px rgba(15, 23, 42, 0.06)'};

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: rgba(59, 130, 246, 0.45);
    box-shadow: 0 20px 48px rgba(59, 130, 246, 0.16);
  }

  ${(p) =>
    p.$selected &&
    `
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(59,130,246,0.35), rgba(167,139,250,0.15), transparent 60%);
      pointer-events: none;
      opacity: 0.8;
      z-index: 0;
    }
  `}
`;

const CardBody = styled.div`
  display: flex;
  gap: 16px;
  align-items: stretch;
  position: relative;
  z-index: 1;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PlayContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: auto;
  padding-top: 4px;
`;

const UseButton = styled(Button)`
  && {
    border: none;
    border-radius: 999px;
    height: 36px;
    padding: 0 24px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 52%, #818cf8 100%);
    box-shadow: 0 0 18px rgba(59, 130, 246, 0.5), 0 8px 20px rgba(79, 70, 229, 0.28);
    position: relative;
    overflow: hidden;
    isolation: isolate;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  &&::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%);
    transform: translateX(-120%);
    animation: officialPlayUseShine 2.8s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  && > span {
    position: relative;
    z-index: 1;
  }

  &&:hover,
  &&:focus {
    background: linear-gradient(135deg, #4f8ff7 0%, #6366f1 52%, #a5b4fc 100%) !important;
    box-shadow: 0 0 26px rgba(59, 130, 246, 0.65), 0 10px 24px rgba(79, 70, 229, 0.35);
    transform: translateY(-2px) scale(1.02);
  }

  @keyframes officialPlayUseShine {
    0%, 72%, 100% { transform: translateX(-120%); }
    86% { transform: translateX(120%); }
  }
`;

const RefFrame = styled.div<{ $previewable?: boolean; $isDark: boolean }>`
  position: relative;
  flex-shrink: 0;
  padding: 3px;
  border-radius: 18px;
  background: ${(p) =>
    p.$isDark
      ? 'linear-gradient(135deg, rgba(96,165,250,0.35), rgba(167,139,250,0.2))'
      : 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(147,197,253,0.25))'};
  cursor: ${(p) => (p.$previewable ? 'zoom-in' : 'default')};
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  @media (max-width: 900px) {
    align-self: center;
    width: 100%;
    max-width: 360px;
  }

  &:hover {
    transform: scale(${(p) => (p.$previewable ? 1.02 : 1)});
    box-shadow: ${(p) =>
      p.$previewable ? '0 12px 32px rgba(59, 130, 246, 0.25)' : 'none'};
  }

  &:hover .zoom-hint {
    opacity: 1;
  }
`;

const RefImages = styled.div<{ $isDark: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 15px;
  background: ${(p) =>
    p.$isDark ? 'rgba(10, 12, 18, 0.85)' : 'rgba(255, 255, 255, 0.92)'};

  @media (max-width: 900px) {
    width: 100%;
    justify-content: center;
    gap: 10px;
  }

  img,
  .ref-ph {
    ${refThumbStyle}
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    transition: opacity 0.2s ease;
  }

  @media (max-width: 900px) {
    img,
    .ref-ph {
      width: calc(50% - 18px);
      max-width: 168px;
      flex: 1;
      min-width: 0;
    }
  }

  .arrow {
    color: ${(p) =>
      p.$isDark ? 'rgba(147, 197, 253, 0.75)' : '#3b82f6'};
    font-size: 16px;
    pointer-events: none;
  }

  .zoom-hint {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    color: #fff;
    font-size: 24px;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
    z-index: 2;
  }
`;

const RefPlaceholder = styled.div<{ $withEmoji?: boolean; $isDark: boolean }>`
  ${refThumbStyle}
  display: ${(p) => (p.$withEmoji ? 'flex' : 'block')};
  align-items: center;
  justify-content: center;
  font-size: ${(p) => (p.$withEmoji ? '36px' : '0')};
  background: ${(p) =>
    p.$isDark ? 'rgba(255,255,255,0.06)' : 'linear-gradient(180deg, #f8fafc, #eef2ff)'};
  pointer-events: none;
`;

const PlayInfo = styled.div<{ $isDark: boolean }>`
  flex: 1;
  min-width: 0;

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }

  .title {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${(p) => (p.$isDark ? '#f8fafc' : '#0f172a')};
  }

  .desc {
    font-size: 13px;
    color: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.58)' : '#64748b')};
    line-height: 1.55;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const StatChip = styled.span<{ $isDark: boolean; $accent?: 'hot' | 'gold' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: ${(p) => {
    if (p.$accent === 'hot') return p.$isDark ? '#fca5a5' : '#dc2626';
    if (p.$accent === 'gold') return p.$isDark ? '#fcd34d' : '#b45309';
    return p.$isDark ? 'rgba(255,255,255,0.72)' : '#475569';
  }};
  background: ${(p) => {
    if (p.$accent === 'hot') return p.$isDark ? 'rgba(239,68,68,0.12)' : 'rgba(254,226,226,0.9)';
    if (p.$accent === 'gold') return p.$isDark ? 'rgba(245,158,11,0.12)' : 'rgba(254,243,199,0.95)';
    return p.$isDark ? 'rgba(255,255,255,0.06)' : 'rgba(241,245,249,0.95)';
  }};
  border: 1px solid
    ${(p) => {
      if (p.$accent === 'hot') return p.$isDark ? 'rgba(248,113,113,0.2)' : 'rgba(252,165,165,0.5)';
      if (p.$accent === 'gold') return p.$isDark ? 'rgba(251,191,36,0.2)' : 'rgba(253,224,71,0.45)';
      return p.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.18)';
    }};
`;

const CategoryBadge = styled.span<{ $isDark: boolean }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  color: ${(p) => (p.$isDark ? '#c4b5fd' : '#6366f1')};
  background: ${(p) => (p.$isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)')};
`;

const ActionCol = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 4px;

  @media (max-width: 900px) {
    flex-direction: row;
    justify-content: flex-end;
    padding-top: 0;
  }

  .ant-btn {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)')};
    border: 1px solid
      ${(p) => (p.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.2)')};

    &:hover {
      background: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.12)' : '#fff')} !important;
      transform: scale(1.06);
    }
  }
`;

const PreviewCompare = styled.div<{ $isDark: boolean; $isMobile?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(p) => (p.$isMobile ? 10 : 28)}px;
  flex-wrap: nowrap;
  padding: ${(p) => (p.$isMobile ? '4px 0 8px' : '4px 0 12px')};
  min-height: ${(p) => (p.$isMobile ? 'auto' : 'min(72vh, 680px)')};
  background: ${(p) =>
    p.$isDark
      ? 'radial-gradient(circle at center, rgba(59,130,246,0.08) 0%, transparent 70%)'
      : 'radial-gradient(circle at center, rgba(59,130,246,0.06) 0%, transparent 70%)'};

  .panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    flex: 1 1 0;
    min-width: 0;
    max-width: ${(p) => (p.$isMobile ? 'none' : `${PREVIEW_PANEL_MAX_WIDTH}px`)};
    width: ${(p) => (p.$isMobile ? 'calc(50% - 8px)' : 'auto')};
  }

  .placeholder,
  img {
    width: 100%;
    max-height: ${(p) =>
      p.$isMobile ? 'min(62vh, 640px)' : PREVIEW_IMG_MAX_HEIGHT};
    min-height: ${(p) => (p.$isMobile ? 200 : 320)}px;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: ${(p) => (p.$isMobile ? 14 : 20)}px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
  }

  .arrow {
    flex-shrink: 0;
    font-size: ${(p) => (p.$isMobile ? 16 : 36)}px;
    color: ${(p) => (p.$isDark ? '#93c5fd' : '#3b82f6')};
    filter: drop-shadow(0 0 16px rgba(59, 130, 246, 0.4));
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
    background: ${(p) =>
      p.$isDark ? 'rgba(255,255,255,0.06)' : 'linear-gradient(180deg, #f8fafc, #eef2ff)'};
    border: 1px solid
      ${(p) => (p.$isDark ? 'rgba(255,255,255,0.1)' : 'rgba(59,130,246,0.15)')};
  }

  img {
    border: 2px solid
      ${(p) => (p.$isDark ? 'rgba(147,197,253,0.25)' : 'rgba(59,130,246,0.2)')};
  }

  .label {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => (p.$isDark ? 'rgba(255,255,255,0.55)' : '#64748b')};
  }
`;

const categoryLabel = (category: string | null | undefined, intl: ReturnType<typeof useIntl>) => {
  const map: Record<string, string> = {
    style: intl.formatMessage({ id: 'create.i2i.official.cat.style', defaultMessage: '风格' }),
    portrait: intl.formatMessage({ id: 'create.i2i.official.cat.portrait', defaultMessage: '人像' }),
    fun: intl.formatMessage({ id: 'create.i2i.official.cat.fun', defaultMessage: '趣味' }),
    scene: intl.formatMessage({ id: 'create.i2i.official.cat.scene', defaultMessage: '场景' }),
  };
  return map[category || ''] || category || '';
};

export interface OfficialPlaySelectionModalProps {
  open: boolean;
  onClose: () => void;
  selectedPlayCode: string | null;
  onSelectPlay: (play: I2iOfficialPlay) => void;
  onPlaysChange?: (plays: I2iOfficialPlay[]) => void;
}

const OfficialPlaySelectionModal: React.FC<OfficialPlaySelectionModalProps> = ({
  open,
  onClose,
  selectedPlayCode,
  onSelectPlay,
  onPlaysChange,
}) => {
  const intl = useIntl();
  const locale = intl.locale || 'zh';
  const styledTheme = useTheme();
  const isDark = styledTheme.mode === 'dark';
  const isMobile = useIsMobile();

  const [sortBy, setSortBy] = useState<I2iOfficialPlaySortBy>('sort');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [plays, setPlays] = useState<I2iOfficialPlay[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingCode, setActionLoadingCode] = useState<string | null>(null);
  const [previewPlay, setPreviewPlay] = useState<I2iOfficialPlay | null>(null);

  const fetchPlays = useCallback(
    async (sort: I2iOfficialPlaySortBy) => {
      setLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/image/i2i/official-plays', {
          params: { sortBy: sort },
        });
        if (response.data.success && Array.isArray(response.data.data)) {
          setPlays(response.data.data);
          onPlaysChange?.(response.data.data);
        }
      } catch (error) {
        console.error('获取官方玩法失败:', error);
        message.error(
          intl.formatMessage({
            id: 'create.i2i.official.loadFailed',
            defaultMessage: '加载官方玩法失败',
          })
        );
      } finally {
        setLoading(false);
      }
    },
    [intl, onPlaysChange]
  );

  useEffect(() => {
    if (open) {
      fetchPlays(sortBy);
    } else {
      setPreviewPlay(null);
      setFavoritesOnly(false);
    }
  }, [open, sortBy, fetchPlays]);

  const displayPlays = favoritesOnly ? plays.filter((p) => p.isFavorited) : plays;

  const updatePlayInList = (playCode: string, patch: Partial<I2iOfficialPlay>) => {
    setPlays((prev) => {
      const next = prev.map((p) => (p.playCode === playCode ? { ...p, ...patch } : p));
      onPlaysChange?.(next);
      return next;
    });
  };

  const handleInteraction = async (
    e: React.MouseEvent,
    playCode: string,
    action: 'like' | 'unlike' | 'favorite' | 'unfavorite'
  ) => {
    e.stopPropagation();
    setActionLoadingCode(playCode);
    try {
      const response = await instance.post(
        `/productx/sa-ai-models/image/i2i/official-plays/${playCode}/${action}`
      );
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        updatePlayInList(playCode, {
          likesCount: data.likesCount,
          favoritesCount: data.favoritesCount,
          isLiked: data.isLiked,
          isFavorited: data.isFavorited,
        });
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'create.i2i.official.actionFailed',
          defaultMessage: '操作失败，请重试',
        })
      );
    } finally {
      setActionLoadingCode(null);
    }
  };

  const handleUsePlay = (play: I2iOfficialPlay) => {
    onSelectPlay(play);
    onClose();
  };

  const canPreviewPlay = (play: I2iOfficialPlay) =>
    Boolean(play.referenceBeforeImage || play.referenceAfterImage);

  const handleOpenPreview = (e: React.MouseEvent, play: I2iOfficialPlay) => {
    e.stopPropagation();
    if (!canPreviewPlay(play)) return;
    setPreviewPlay(play);
  };

  const sortOptions: { label: string; value: I2iOfficialPlaySortBy; icon: React.ReactNode }[] = [
    {
      label: intl.formatMessage({ id: 'create.i2i.official.sort.default', defaultMessage: '推荐' }),
      value: 'sort',
      icon: <CrownOutlined />,
    },
    {
      label: intl.formatMessage({ id: 'create.i2i.official.sort.likes', defaultMessage: '点赞量' }),
      value: 'likes',
      icon: <FireOutlined />,
    },
    {
      label: intl.formatMessage({
        id: 'create.i2i.official.sort.generations',
        defaultMessage: '生成量',
      }),
      value: 'generations',
      icon: <ThunderboltOutlined />,
    },
  ];

  const previewModal = (
    <PreviewStyledModal
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
            <UseButton
              type="primary"
              onClick={() => {
                handleUsePlay(previewPlay);
                setPreviewPlay(null);
              }}
            >
              <FormattedMessage id="create.i2i.official.use" defaultMessage="使用" />
            </UseButton>
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
        wrapper: isMobile ? { overflow: 'hidden' } : undefined,
      }}
    >
      {previewPlay && (
        <PreviewCompare $isDark={isDark} $isMobile={isMobile}>
          <div className="panel">
            {previewPlay.referenceBeforeImage ? (
              <img
                src={resolveOfficialPlayImageUrl(
                  previewPlay.referenceBeforeImage,
                  OFFICIAL_PLAY_PREVIEW_IMAGE_WIDTH
                )}
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
                src={resolveOfficialPlayImageUrl(
                  previewPlay.referenceAfterImage,
                  OFFICIAL_PLAY_PREVIEW_IMAGE_WIDTH
                )}
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
    </PreviewStyledModal>
  );

  if (isMobile) {
    return (
      <>
        <OfficialPlayMobileView
          open={open}
          onClose={onClose}
          isDark={isDark}
          loading={loading}
          plays={displayPlays}
          favoritesOnly={favoritesOnly}
          onFavoritesOnlyChange={setFavoritesOnly}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={sortOptions}
          selectedPlayCode={selectedPlayCode}
          onUsePlay={handleUsePlay}
          onOpenPreview={(play) => setPreviewPlay(play)}
          canPreviewPlay={canPreviewPlay}
          onInteraction={handleInteraction}
          actionLoadingCode={actionLoadingCode}
        />
        {previewModal}
      </>
    );
  }

  return (
    <>
      <StyledModal
        open={open}
        onCancel={onClose}
        width={900}
        centered
        closeIcon={null}
        footer={null}
        destroyOnClose
        styles={{
          mask: {
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            background: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(15, 23, 42, 0.45)',
          },
        }}
      >
        <ModalShell $isDark={isDark}>
          <AmbientOrb $isDark={isDark} className="orb-a" />
          <AmbientOrb $isDark={isDark} className="orb-b" />

          <ModalInner>
            <HeroHeader>
              <HeroText>
                <Eyebrow $isDark={isDark}>
                  <ThunderboltOutlined /> Official Play
                </Eyebrow>
                <HeroTitle $isDark={isDark}>
                  <FormattedMessage id="create.i2i.official.modalTitle" defaultMessage="官方玩法" />
                </HeroTitle>
                <HeroHint $isDark={isDark}>
                  <FormattedMessage
                    id="create.i2i.official.modalHint"
                    defaultMessage="选择玩法后上传参考图即可生成，提示词由平台托管"
                  />
                </HeroHint>
              </HeroText>
              <ClosePill $isDark={isDark} type="button" onClick={onClose}>
                ✕ {intl.formatMessage({ id: 'common.close', defaultMessage: '关闭' })}
              </ClosePill>
            </HeroHeader>

            <Toolbar>
              <Text style={{ fontSize: 12, fontWeight: 600, opacity: 0.55 }}>
                {displayPlays.length > 0
                  ? intl.formatMessage(
                      {
                        id: favoritesOnly
                          ? 'create.i2i.official.favoritesCount'
                          : 'create.i2i.official.playCount',
                        defaultMessage: favoritesOnly ? '{count} 个收藏' : '{count} 种玩法',
                      },
                      { count: displayPlays.length }
                    )
                  : ''}
              </Text>
              <SortPills>
                <FavoritesPill
                  type="button"
                  $active={favoritesOnly}
                  $isDark={isDark}
                  onClick={() => setFavoritesOnly((v) => !v)}
                >
                  {favoritesOnly ? <StarFilled /> : <StarOutlined />}{' '}
                  <FormattedMessage
                    id="create.i2i.official.myFavorites"
                    defaultMessage="我的收藏"
                  />
                </FavoritesPill>
                {sortOptions.map((opt) => (
                  <SortPill
                    key={opt.value}
                    type="button"
                    $active={!favoritesOnly && sortBy === opt.value}
                    $isDark={isDark}
                    onClick={() => {
                      setFavoritesOnly(false);
                      setSortBy(opt.value);
                    }}
                  >
                    {opt.icon} {opt.label}
                  </SortPill>
                ))}
              </SortPills>
            </Toolbar>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <Spin size="large" />
              </div>
            ) : displayPlays.length === 0 ? (
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
              <PlayList>
                {displayPlays.map((play, index) => (
                  <PlayCard
                    key={play.playCode}
                    $selected={selectedPlayCode === play.playCode}
                    $index={index}
                    $isDark={isDark}
                  >
                    <CardBody>
                      <RefFrame
                        $previewable={canPreviewPlay(play)}
                        $isDark={isDark}
                        onClick={(e) => handleOpenPreview(e, play)}
                        role={canPreviewPlay(play) ? 'button' : undefined}
                        tabIndex={canPreviewPlay(play) ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (canPreviewPlay(play) && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            setPreviewPlay(play);
                          }
                        }}
                      >
                        <RefImages $isDark={isDark}>
                          {canPreviewPlay(play) && (
                            <ZoomInOutlined className="zoom-hint" aria-hidden />
                          )}
                          {play.referenceBeforeImage ? (
                            <img
                              src={resolveOfficialPlayImageUrl(
                                play.referenceBeforeImage,
                                OFFICIAL_PLAY_THUMB_IMAGE_WIDTH
                              )}
                              alt="before"
                            />
                          ) : (
                            <RefPlaceholder $withEmoji $isDark={isDark}>
                              {play.coverEmoji || '🎨'}
                            </RefPlaceholder>
                          )}
                          <ArrowRightOutlined className="arrow" />
                          {play.referenceAfterImage ? (
                            <img
                              src={resolveOfficialPlayImageUrl(
                                play.referenceAfterImage,
                                OFFICIAL_PLAY_THUMB_IMAGE_WIDTH
                              )}
                              alt="after"
                            />
                          ) : (
                            <RefPlaceholder $isDark={isDark} />
                          )}
                        </RefImages>
                      </RefFrame>

                      <PlayContent>
                        <PlayInfo $isDark={isDark}>
                          <div className="title-row">
                            <div className="title">
                              <span>{play.coverEmoji}</span>
                              <span>{resolvePlayDisplayName(play, locale)}</span>
                            </div>
                            {play.category && (
                              <CategoryBadge $isDark={isDark}>
                                {categoryLabel(play.category, intl)}
                              </CategoryBadge>
                            )}
                          </div>
                          <div className="desc">{resolvePlayDescription(play, locale)}</div>
                          <div className="stats">
                            <StatChip $isDark={isDark} $accent="hot">
                              <HeartFilled style={{ fontSize: 10 }} />
                              {play.likesCount ?? 0}
                            </StatChip>
                            <StatChip $isDark={isDark}>
                              <ThunderboltOutlined style={{ fontSize: 10 }} />
                              <FormattedMessage
                                id="create.i2i.official.generationsCount"
                                defaultMessage="{count} 次生成"
                                values={{ count: play.generationCount ?? 0 }}
                              />
                            </StatChip>
                            {(play.userGenerationCount ?? 0) > 0 && (
                              <StatChip $isDark={isDark} $accent="gold">
                                <FormattedMessage
                                  id="create.i2i.official.myGenerations"
                                  defaultMessage="我已生成 {count} 次"
                                  values={{ count: play.userGenerationCount }}
                                />
                              </StatChip>
                            )}
                          </div>
                        </PlayInfo>

                        <CardFooter>
                          <UseButton type="primary" size="small" onClick={() => handleUsePlay(play)}>
                            <FormattedMessage id="create.i2i.official.use" defaultMessage="使用" />
                          </UseButton>
                        </CardFooter>
                      </PlayContent>

                      <ActionCol $isDark={isDark}>
                        <Button
                          type="text"
                          size="small"
                          loading={actionLoadingCode === play.playCode}
                          icon={
                            play.isLiked ? (
                              <HeartFilled style={{ color: '#ff4d4f' }} />
                            ) : (
                              <HeartOutlined />
                            )
                          }
                          onClick={(e) =>
                            handleInteraction(e, play.playCode, play.isLiked ? 'unlike' : 'like')
                          }
                        />
                        <Button
                          type="text"
                          size="small"
                          loading={actionLoadingCode === play.playCode}
                          icon={
                            play.isFavorited ? (
                              <StarFilled style={{ color: '#faad14' }} />
                            ) : (
                              <StarOutlined />
                            )
                          }
                          onClick={(e) =>
                            handleInteraction(
                              e,
                              play.playCode,
                              play.isFavorited ? 'unfavorite' : 'favorite'
                            )
                          }
                        />
                      </ActionCol>
                    </CardBody>
                  </PlayCard>
                ))}
              </PlayList>
            )}
          </ModalInner>
        </ModalShell>
      </StyledModal>

      {previewModal}
    </>
  );
};

export default OfficialPlaySelectionModal;
