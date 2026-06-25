import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Spin, message, Button, Typography, Empty, Avatar, Tooltip, Tag, Image, Space } from 'antd';
import Masonry from 'react-masonry-css';
import { 
  HeartOutlined, HeartFilled, 
  StarOutlined, StarFilled, 
  EyeOutlined, UserOutlined,
  FireOutlined, ClockCircleOutlined,
  ShareAltOutlined, DownloadOutlined,
  PictureOutlined, RobotOutlined,
  ArrowRightOutlined,
  FilterOutlined,
  LockOutlined,
  UnlockOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes, css } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { getChannelByKey, listPosts, likePost, unlikePost, collectPost, uncollectPost, listChannels, incrementPostView, checkReviewPermission, getCachedChannelId } from 'api/community';
import { checkAiOperatorManagePermission } from 'api/communityAiOperator';
import UserRoleCard from 'components/community/UserRoleCard';
import ChannelAiOperatorModal from 'components/community/ChannelAiOperatorModal';
import PostShelfToggle from 'components/community/PostShelfToggle';
import { isPostDelisted } from 'utils/communityPostStatus';
import { communityChannelPath } from 'utils/communityRoutes';
import PostStackImagePreview from 'components/community/PostStackImagePreview';
import { getPostCardSpecs, getPostMediaUrls } from '../ChallengeDetailPage/utils';
import { getPostPromptAccessType } from 'utils/communityPostPrompt';

const { Text } = Typography;

// --- Helper Functions ---

/**
 * 为腾讯云图片URL添加压缩参数
 * @param {string} url - 原始图片URL
 * @param {object} options - 压缩选项
 * @returns {string} - 添加了压缩参数的URL
 */
const addTencentImageCompression = (url, options = {}) => {
  if (!url) return '';
  
  // 默认压缩参数
  const {
    format = 'webp',      // 图片格式：webp, jpg, png
    quality = 20,         // 图片质量：1-100
    width = null,         // 限制宽度
    height = null,        // 限制高度
  } = options;
  
  // 检查是否已经包含压缩参数
  if (url.includes('imageMogr2') || url.includes('imageView2')) {
    return url;
  }
  
  // 构建压缩参数
  let params = `imageMogr2/format/${format}/quality/${quality}`;
  
  if (width) params += `/thumbnail/${width}x`;
  if (height && !width) params += `/thumbnail/x${height}`;
  if (width && height) params += `/thumbnail/${width}x${height}`;
  
  // 判断URL是否已有查询参数
  const separator = url.includes('?') ? '&' : '?';
  
  return `${url}${separator}${params}`;
};

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const ringRotate = keyframes`
  to { transform: rotate(360deg); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
`;

// --- Styled Components (Layout) ---

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f8f9fa'};
  display: flex;
  flex-direction: column;
  padding-top: 60px;
  position: relative;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding-top: 56px;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
`;

const UserCardWrapper = styled.div`
  position: fixed;
  top: ${props => props.top}px;
  right: ${props => props.right}px;
  z-index: 100;
  animation: ${fadeInUp} 0.8s ease-out;
  transition: ${props => props.isDragging ? 'none' : 'all 0.2s ease'};
  user-select: none;
  
  > *:not([data-drag-handle]) {
    pointer-events: ${props => props.isDragging ? 'none' : 'auto'};
  }
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 32px;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  z-index: 10;
  background: ${props => props.isDragging ? 'rgba(24, 144, 255, 0.15)' : 'rgba(0,0,0,0.08)'};
  transition: all 0.2s;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  pointer-events: auto;
  
  &:hover {
    background: rgba(24, 144, 255, 0.2);
    transform: translateX(-50%) translateY(-2px);
  }
  
  &::before {
    content: '⋮⋮';
    color: ${props => props.isDragging ? '#1890ff' : 'rgba(0,0,0,0.35)'};
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 3px;
  }
`;

const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 460px;
  margin-bottom: 40px;
  background-color: ${props => props.bgColor || '#1890ff'};
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);

  @media (min-width: 1200px) {
    height: 540px;
  }

  @media (min-width: 1600px) {
    height: 620px;
  }

  @media (min-width: 1920px) {
    height: 680px;
  }

  @media (hover: hover) and (pointer: fine) {
    transition: height 1.5s cubic-bezier(0.22, 1, 0.36, 1);

    &:hover {
      height: min(56vh, 560px);
    }

    @media (min-width: 1200px) {
      &:hover {
        height: min(58vh, 640px);
      }
    }

    @media (min-width: 1600px) {
      &:hover {
        height: min(62vh, 720px);
      }
    }

    @media (min-width: 1920px) {
      &:hover {
        height: min(65vh, 800px);
      }
    }
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.52) 100%);
    transition: background 1.5s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover::after {
      background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.38) 100%);
    }
  }

  @media (max-width: 768px) {
    height: 300px;
    margin-bottom: 24px;
  }
`;

const HeroBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 36%;
    transform: scale(1.14);
    filter: blur(5px) brightness(0.9) saturate(0.96);
    will-change: transform, filter;
    transition:
      transform 1.5s cubic-bezier(0.22, 1, 0.36, 1),
      filter 1.5s cubic-bezier(0.22, 1, 0.36, 1),
      object-position 1.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    ${HeroSection}:hover & img {
      transform: scale(1.02);
      filter: blur(0) brightness(1) saturate(1);
      object-position: center center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transform: none;
      filter: none;
      transition: none;
    }
  }
`;

/* Hero 内部：标题区域（限宽居中） */
const HeroInner = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: 768px) {
    padding: 0 max(16px, env(safe-area-inset-left)) 0 max(16px, env(safe-area-inset-right));
  }
`;

/* 频道切换：横向铺满视口两端 */
const ChannelNavSection = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: 20px;
  padding-bottom: 8px;
  overflow: visible;

  @media (max-width: 768px) {
    margin-top: 16px;
    padding-bottom: 4px;
  }
`;

const ChannelNavLabelRow = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;

  @media (max-width: 768px) {
    padding: 0 max(16px, env(safe-area-inset-left)) 0 max(16px, env(safe-area-inset-right));
  }
`;

/* 头部频道快捷列表 */
const ChannelNavWrap = styled.div`
  margin-bottom: 0;
`;

const ChannelNavLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#888' : '#666'};
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  /* Hero 内时使用浅色以在背景上可读 */
  .hero-inner & {
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

const ChannelNavScroll = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  box-sizing: border-box;
  /* 预留 hover 上移、放大与阴影空间（transform 不参与布局高度计算） */
  padding: 68px max(24px, env(safe-area-inset-right)) 80px max(24px, env(safe-area-inset-left));
  min-height: 114px;
  min-width: 0;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: ${props => props.$dragging ? 'grabbing' : 'grab'};
  user-select: ${props => props.$dragging ? 'none' : 'auto'};

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  @media (min-width: 1200px) {
    min-height: 126px;
  }

  @media (min-width: 1600px) {
    min-height: 140px;
  }

  @media (max-width: 768px) {
    align-items: center;
    padding: 16px max(16px, env(safe-area-inset-right)) 20px max(16px, env(safe-area-inset-left));
    min-height: 84px;
    cursor: auto;
    user-select: auto;
    touch-action: auto;
  }
`;

const ChannelNavItem = styled.div`
  flex-shrink: 0;
  width: 200px;
  height: 114px;
  border-radius: 16px;
  overflow: visible;
  cursor: ${props => props.$navDragging ? 'grabbing' : 'grab'};
  position: relative;
  background: ${props => props.theme.mode === 'dark' ? '#222' : '#e8e8e8'};
  transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.38s ease;
  border: 2px solid transparent;
  transform-origin: center center;
  z-index: 1;

  @media (min-width: 1200px) {
    width: 224px;
    height: 126px;
  }

  @media (min-width: 1600px) {
    width: 248px;
    height: 140px;
  }

  &.active {
    transform: scale(1.14);
    border-color: #1890ff;
    box-shadow: 0 8px 28px rgba(24, 144, 255, 0.35);
    z-index: 2;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      z-index: 6;
      box-shadow: 0 24px 56px rgba(0, 0, 0, 0.45);
    }

    &:hover:not(.active) {
      transform: translateY(-20px) scale(1.32);
    }

    &.active:hover {
      transform: translateY(-18px) scale(1.34);
    }
  }

  .media {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
    transform-origin: center center;
  }

  .cover {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    border-radius: inherit;
    transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover .cover {
      transform: scale(1.12);
    }
  }

  .mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.28) 52%, transparent 100%);
    border-radius: inherit;
    pointer-events: none;
    transition: opacity 0.35s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover .mask {
      opacity: 0;
    }

    &:hover .info {
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.85);
    }

    &:hover .name,
    &:hover .meta,
    &:hover .desc {
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.85);
    }
  }

  .info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: 12px 14px;
    pointer-events: none;
  }

  .name {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.55);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.35s ease, opacity 0.3s ease, margin-top 0.35s ease;
  }

  .tag {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 100px;
    background: rgba(255, 255, 255, 0.22);
    color: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.28);
    line-height: 1.4;
  }

  .posts {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.4;
  }

  .vip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 100px;
    background: rgba(250, 173, 20, 0.28);
    color: #ffe58f;
    border: 1px solid rgba(250, 173, 20, 0.45);
    line-height: 1.4;
  }

  .desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.88);
    line-height: 1.45;
    margin-top: 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    transition: max-height 0.35s ease, opacity 0.3s ease, margin-top 0.35s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover .meta,
    &.active .meta {
      margin-top: 5px;
      max-height: 28px;
      opacity: 1;
    }

    &:hover .desc,
    &.active .desc {
      margin-top: 6px;
      max-height: 34px;
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    width: 148px;
    height: 84px;
    border-radius: 12px;
    cursor: pointer;

    .info { padding: 8px 10px; }
    .name { font-size: 12px; }

    &.active {
      transform: scale(1.06);
    }

    .meta {
      margin-top: 3px;
      max-height: 22px;
      opacity: 1;
    }

    .desc {
      display: none;
    }
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0 0 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TitleWrapper = styled.div`
  animation: ${fadeInUp} 0.6s ease-out;

  h1 {
    margin: 0;
    font-size: 48px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -1px;
    text-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .desc {
    margin-top: 12px;
    color: rgba(255,255,255,0.9);
    font-size: 16px;
    max-width: 600px;
    line-height: 1.6;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 24px;
      gap: 10px;
    }
    .desc {
      margin-top: 8px;
      font-size: 14px;
      max-width: 100%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 40px 60px;
  flex: 1;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 max(16px, env(safe-area-inset-left)) 32px max(16px, env(safe-area-inset-right));
  }
`;

const ToolBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 32px;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)'};
  padding: 18px 22px 20px;
  border-radius: 16px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 8px 32px rgba(0,0,0,0.24)'
    : '0 4px 20px rgba(0,0,0,0.04)'};
  backdrop-filter: blur(12px);

  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 14px 14px 16px;
    border-radius: 14px;
  }
`;

const ToolBarMain = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    padding-top: 14px;
    margin-top: 14px;
  }
`;

const FilterBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const FilterBlockLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 72px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)'};
  white-space: nowrap;

  .anticon {
    font-size: 13px;
    opacity: 0.85;
  }
`;

const SegmentGroup = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.04)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'};
  gap: 4px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SegmentButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
  white-space: nowrap;
  color: ${props => (props.$active
    ? (props.theme.mode === 'dark' ? '#fff' : '#111827')
    : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.52)'))};
  background: ${props => (props.$active
    ? (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#fff')
    : 'transparent')};
  box-shadow: ${props => (props.$active ? '0 2px 10px rgba(0,0,0,0.08)' : 'none')};

  .anticon {
    font-size: 14px;
  }

  &:hover {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#111827'};
    background: ${props => (props.$active
      ? (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#fff')
      : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)'))};
  }

  &:active {
    transform: scale(0.98);
  }

  ${props => props.$variant === 'free' && props.$active && css`
    color: #389e0d;
    background: ${props.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.18)' : 'rgba(246, 255, 237, 0.98)'};
    box-shadow: 0 2px 10px rgba(82, 196, 26, 0.12);
  `}

  ${props => props.$variant === 'paid' && props.$active && css`
    color: #7c3aed;
    background: ${props.theme.mode === 'dark' ? 'rgba(124, 58, 237, 0.18)' : 'rgba(245, 243, 255, 0.98)'};
    box-shadow: 0 2px 10px rgba(124, 58, 237, 0.12);
  `}

  @media (max-width: 768px) {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    font-size: 12px;
  }
`;

const FilterDivider = styled.div`
  width: 1px;
  align-self: stretch;
  min-height: 28px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'};
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const FilterBarActions = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;

    .ant-btn {
      width: 100%;
    }
  }
`;

const ToolBarLeft = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 12px;
    width: 100%;
  }
`;

/* 基于 JS 的瀑布流：新加载帖子严格出现在底部 */
const breakpointColumnsObj = {
  default: 4,
  1200: 3,
  768: 2,
};

const MasonryGridWrap = styled.div`
  .masonry-grid {
    display: flex;
    margin-left: -20px;
    width: auto;
  }
  .masonry-grid_column {
    padding-left: 20px;
    background-clip: padding-box;
  }
  .masonry-grid_column > div {
    margin-bottom: 20px;
  }

  @media (max-width: 1200px) {
    .masonry-grid { margin-left: -16px; }
    .masonry-grid_column { padding-left: 16px; }
    .masonry-grid_column > div { margin-bottom: 16px; }
  }

  @media (max-width: 768px) {
    .masonry-grid { margin-left: -6px; }
    .masonry-grid_column { padding-left: 6px; }
    .masonry-grid_column > div { margin-bottom: 6px; }
  }
`;

const BlockSection = styled.div`
  text-align: center;
  padding: ${props => props.padding || '60px 0'};

  @media (max-width: 768px) {
    padding: ${props => props.mobilePadding || '32px 0'};
  }
`;

// --- 酷炫加载态 ---
const SkeletonGridWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
`;

const SkeletonCard = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#e8e8e8'};
  padding-top: ${props => props.ratio || '100'}%;

  @media (max-width: 768px) {
    border-radius: 12px;
    padding-top: ${props => props.mobileRatio || props.ratio || '100'}%;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'} 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.8s ease-in-out infinite;
    pointer-events: none;
  }
`;

const LoadMoreLoaderWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  min-height: 60px;
`;

const GradientRing = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  position: relative;
  background: conic-gradient(
    from 0deg,
    #667eea 0deg,
    #764ba2 90deg,
    #f093fb 180deg,
    #4facfe 270deg,
    #667eea 360deg
  );
  animation: ${ringRotate} 0.9s linear infinite;
  box-shadow: 0 0 24px rgba(102, 126, 234, 0.35);

  &::before {
    content: '';
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f8f9fa'};
  }
`;

const BounceDots = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    box-shadow: 0 0 12px rgba(102, 126, 234, 0.5);
    animation: ${dotBounce} 0.8s ease-in-out infinite both;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
`;

// --- NEW Glassmorphism Card Design ---

const ModernCard = styled.div`
  position: relative;
  width: 100%;
  padding-top: 0;
  height: auto;
  min-height: 360px;
  border-radius: 16px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#222' : '#f0f2f5'};
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : 'transparent'};

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    min-height: 300px;
    border-radius: 12px;
    &:hover {
      transform: translateY(-2px);
    }
    &:active {
      transform: scale(0.98);
    }
  }
`;

const CardImageWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 360px;
  height: auto;
  z-index: 1;
  cursor: default;

  .ant-image {
    width: 100%;
    display: block;
    min-height: inherit;
  }

  .ant-image-img {
    width: 100%;
    min-height: 360px;
    height: auto;
    display: block;
    vertical-align: top;
    object-fit: cover;
    object-position: center;
    transition: transform 0.7s ease, filter 0.3s ease, opacity 0.3s ease;
  }

  ${ModernCard}:hover & .ant-image-img {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    min-height: 300px;

    .ant-image-img {
      min-height: 300px;
    }
  }

  ${(props) => props.$delisted && css`
    .ant-image-img {
      filter: grayscale(100%);
      opacity: 0.55;
    }

    ${ModernCard}:hover & .ant-image-img {
      transform: none;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.12);
      pointer-events: none;
      z-index: 2;
    }
  `}
`;

const FloatingActions = styled.div`
  position: absolute;
  top: 52px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;

  ${ModernCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }

  @media (max-width: 768px) {
    opacity: 1;
    transform: translateX(0);
    flex-direction: row;
    top: 48px;
    bottom: auto;
    right: 10px;
    gap: 6px;
  }
`;

const GlassBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  color: ${props => props.active ? props.activeColor : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    color: ${props => props.activeColor || '#333'};
    transform: scale(1.1);
  }

  svg {
    animation: ${props => props.animating ? css`${pulse} 0.4s` : 'none'};
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    -webkit-tap-highlight-color: transparent;
  }
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  box-sizing: border-box;
  min-height: 108px;
  padding: 12px 16px;

  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.28)'
    : 'rgba(255, 255, 255, 0.35)'};

  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  border-top: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(255, 255, 255, 0.18)'};

  transition: opacity 0.3s ease, transform 0.3s ease, background 0.3s ease;

  @media (hover: hover) and (pointer: fine) {
    opacity: 0;
    transform: translateY(10px);
    pointer-events: none;

    ${ModernCard}:hover & {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
      background: ${props => props.theme.mode === 'dark'
        ? 'rgba(0, 0, 0, 0.42)'
        : 'rgba(255, 255, 255, 0.52)'};
    }
  }

  @media (hover: none), (pointer: coarse) {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.42)'
      : 'rgba(255, 255, 255, 0.52)'};
  }

  @media (max-width: 768px) {
    min-height: 96px;
    padding: 10px 12px;
  }
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  text-shadow: ${props => props.theme.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'};

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  min-width: 0;

  @media (max-width: 768px) {
    margin-bottom: 4px;
  }
`;

const CardCenterActions = styled.div`
  position: absolute;
  inset: 0;
  z-index: 18;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease, background 0.3s ease;
  background: rgba(0, 0, 0, 0);

  ${ModernCard}:hover & {
    opacity: 1;
    background: rgba(0, 0, 0, 0.32);
    pointer-events: auto;
  }

  @media (hover: none), (pointer: coarse) {
    opacity: 1;
    background: rgba(0, 0, 0, 0.22);
    pointer-events: auto;
  }
`;

const CardGlassActionBtn = styled.button`
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.96);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  pointer-events: auto;

  &:hover {
    background: rgba(0, 0, 0, 0.55);
    border-color: rgba(255, 255, 255, 0.48);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 12px;
  }
`;

const CardSpecRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
  min-width: 0;
`;

const SpecChip = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.75)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;

  .name {
    font-size: 13px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : '#444'};
    font-weight: 500;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .name { max-width: 80px; font-size: 12px; }
  }
`;

const StatsInfo = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#666'};
  flex-shrink: 0;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  @media (max-width: 768px) {
    gap: 8px;
    font-size: 11px;
  }
`;

const MultiImageBadge = styled.div`
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 15;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  pointer-events: none;
`;

const PromptAccessBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 16;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 15px;
  cursor: default;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  pointer-events: auto;

  ${({ $type, theme }) => $type === 'free' && `
    color: #52c41a;
    background: ${theme.mode === 'dark' ? 'rgba(22, 48, 16, 0.88)' : 'rgba(246, 255, 237, 0.92)'};
  `}

  ${({ $type, theme }) => $type === 'paid' && `
    color: #a78bfa;
    background: ${theme.mode === 'dark' ? 'rgba(46, 36, 86, 0.88)' : 'rgba(245, 243, 255, 0.92)'};
  `}

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 13px;
    border-radius: 8px;
  }
`;

const ChannelDetailPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { channelKey } = useParams();
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [promptAccess, setPromptAccess] = useState('all');
  const [animatingPost, setAnimatingPost] = useState(null);
  const viewedPreviewRef = useRef(new Set());
  const [stackPreviewPost, setStackPreviewPost] = useState(null);
  const [stackPreviewIndex, setStackPreviewIndex] = useState(0);
  const [stackPreviewShowOriginal, setStackPreviewShowOriginal] = useState(false);
  const previewRestoreRef = useRef(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Drag state
  const [cardPosition, setCardPosition] = useState({ top: 100, right: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // 头部频道列表（快捷跳转）
  const [channelsList, setChannelsList] = useState([]);
  const channelNavScrollRef = useRef(null);
  const navDragRef = useRef({ active: false, dragging: false, startX: 0, scrollLeft: 0, moved: false });
  const [isNavDragging, setIsNavDragging] = useState(false);

  // AI 运营管理（超级管理员 / 社区运营官）
  const [canManageAiOperator, setCanManageAiOperator] = useState(false);
  const [aiOperatorModalOpen, setAiOperatorModalOpen] = useState(false);

  // 帖子审核上架/下架（超级管理员 / 社区运营官）
  const [canModeratePosts, setCanModeratePosts] = useState(false);

  // 滚动到底部附近自动加载
  const loadMoreRef = useRef(null);
  const postsLoadingRef = useRef(postsLoading);
  postsLoadingRef.current = postsLoading;
  const postsFetchSeqRef = useRef(0);
  const channelRef = useRef(null);
  const channelKeyRef = useRef(channelKey);
  const prevFiltersRef = useRef({ sortBy, promptAccess });
  const isInitialChannelLoadRef = useRef(true);
  channelRef.current = channel;

  const buildPostListParams = (pageNum, channelId) => ({
    channelId,
    page: pageNum,
    pageSize: 20,
    sortBy,
    ...(promptAccess !== 'all' ? { promptAccess } : {}),
  });

  useEffect(() => {
    listChannels().catch(() => undefined);
  }, []);

  useEffect(() => {
    previewRestoreRef.current = false;
  }, [channelKey]);

  useEffect(() => {
    if (!hasMore || postsLoading || posts.length === 0) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (postsLoadingRef.current) return;
        setPage((p) => p + 1);
      },
      { root: null, rootMargin: '0px 0px 200px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, postsLoading, posts.length]);

  useEffect(() => {
    if (!channelKey) return;
    if (channelKey === 'daily-challenge') {
      navigate('/community/challenge', { replace: true });
      return;
    }

    const channelKeyChanged = channelKeyRef.current !== channelKey;
    if (channelKeyChanged) {
      channelKeyRef.current = channelKey;
      isInitialChannelLoadRef.current = true;
      channelRef.current = null;
      setChannel(null);
      prevFiltersRef.current = { sortBy, promptAccess };
      if (page !== 1) {
        setPage(1);
        return;
      }
      setPosts([]);
      setHasMore(true);
    }

    const filtersChanged =
      prevFiltersRef.current.sortBy !== sortBy
      || prevFiltersRef.current.promptAccess !== promptAccess;

    if (filtersChanged) {
      prevFiltersRef.current = { sortBy, promptAccess };
      if (page !== 1) {
        setPage(1);
        return;
      }
      setPosts([]);
      setHasMore(true);
    }

    const seq = ++postsFetchSeqRef.current;
    let cancelled = false;

    const loadPosts = async () => {
      const isFirstPage = page === 1;

      if (isInitialChannelLoadRef.current && isFirstPage) {
        setLoading(true);
      }
      setPostsLoading(true);

      try {
        if (isInitialChannelLoadRef.current && isFirstPage) {
          const cachedChannelId = getCachedChannelId(channelKey);
          const initialPostParams = cachedChannelId
            ? buildPostListParams(1, cachedChannelId)
            : {
                channelKey,
                page: 1,
                pageSize: 20,
                sortBy,
                ...(promptAccess !== 'all' ? { promptAccess } : {}),
              };

          const [channelData, postsDataOrNull] = await Promise.all([
            getChannelByKey(channelKey),
            listPosts(initialPostParams).catch(() => null),
          ]);

          if (cancelled || seq !== postsFetchSeqRef.current) return;

          channelRef.current = channelData;
          setChannel(channelData);
          isInitialChannelLoadRef.current = false;

          let postsData = postsDataOrNull;
          if (!postsData) {
            postsData = await listPosts(buildPostListParams(1, channelData.id));
          }

          if (cancelled || seq !== postsFetchSeqRef.current) return;

          setPosts(postsData || []);
          setHasMore((postsData || []).length === 20);
          return;
        }

        const activeChannel = channelRef.current;
        if (!activeChannel?.id) return;

        const postsData = await listPosts(buildPostListParams(page, activeChannel.id));
        if (cancelled || seq !== postsFetchSeqRef.current) return;

        if (isFirstPage) {
          setPosts(postsData || []);
        } else {
          setPosts((prev) => [...prev, ...(postsData || [])]);
        }
        setHasMore((postsData || []).length === 20);
      } catch (error) {
        if (!cancelled) {
          message.error(error?.response?.data?.message || 'Load failed');
        }
      } finally {
        if (!cancelled && seq === postsFetchSeqRef.current) {
          setPostsLoading(false);
          setLoading(false);
        }
      }
    };

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [channelKey, page, sortBy, promptAccess, navigate]);

  useEffect(() => {
    if (!channel?.id) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      listChannels()
        .then((data) => {
          if (!cancelled) setChannelsList(data || []);
        })
        .catch(() => {
          if (!cancelled) setChannelsList([]);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [channel?.id]);

  useEffect(() => {
    const el = channelNavScrollRef.current;
    if (!el || channelsList.length === 0) return;

    const onWheel = (event) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [channelsList.length]);

  const handleNavPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.pointerType === 'mouse' && window.matchMedia('(max-width: 768px)').matches) return;

    const el = channelNavScrollRef.current;
    if (!el) return;

    navDragRef.current = {
      active: true,
      dragging: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handleNavPointerMove = (e) => {
    if (!navDragRef.current.active || e.pointerId !== navDragRef.current.pointerId) return;

    const el = channelNavScrollRef.current;
    if (!el) return;

    const dx = e.clientX - navDragRef.current.startX;
    if (!navDragRef.current.dragging) {
      if (Math.abs(dx) <= 5) return;
      navDragRef.current.dragging = true;
      navDragRef.current.moved = true;
      setIsNavDragging(true);
      if (!el.hasPointerCapture(e.pointerId)) {
        el.setPointerCapture(e.pointerId);
      }
    }

    el.scrollLeft = navDragRef.current.scrollLeft - dx;
    e.preventDefault();
  };

  const endNavPointerDrag = (e) => {
    if (!navDragRef.current.active || e.pointerId !== navDragRef.current.pointerId) return;

    const el = channelNavScrollRef.current;
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    navDragRef.current.active = false;
    navDragRef.current.dragging = false;
    setIsNavDragging(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCanManageAiOperator(false);
      setCanModeratePosts(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      Promise.all([
        checkAiOperatorManagePermission().catch(() => false),
        checkReviewPermission().catch(() => false),
      ]).then(([canManageAi, canModerate]) => {
        if (cancelled) return;
        setCanManageAiOperator(canManageAi);
        setCanModeratePosts(canModerate);
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [channel?.id]);

  const reloadPosts = async () => {
    if (!channelRef.current?.id) return;

    const seq = ++postsFetchSeqRef.current;
    setPostsLoading(true);
    try {
      const data = await listPosts(buildPostListParams(1, channelRef.current.id));
      if (seq !== postsFetchSeqRef.current) return;
      setPage(1);
      setPosts(data || []);
      setHasMore((data || []).length === 20);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Load failed');
    } finally {
      if (seq === postsFetchSeqRef.current) {
        setPostsLoading(false);
      }
    }
  };

  const handleLike = async (postId, e) => {
    e?.stopPropagation(); 
    e?.preventDefault();

    setAnimatingPost(postId);
    setTimeout(() => setAnimatingPost(null), 400);

    try {
      const post = posts.find(p => p.id === postId);
      const response = post?.isLiked
        ? await unlikePost(postId)
        : await likePost(postId);
      
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likeCount: response.likesCount,
            isLiked: response.isLiked,
          };
        }
        return p;
      }));
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleCollect = async (postId, e) => {
    e?.stopPropagation();
    e?.preventDefault();

    try {
      const post = posts.find(p => p.id === postId);
      const response = post?.isCollected
        ? await uncollectPost(postId)
        : await collectPost(postId);
      
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            collectCount: response.collectsCount,
            isCollected: response.isCollected,
          };
        }
        return p;
      }));
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handlePostDetailClick = (post, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    navigate(`/community/post/${post.id}`);
  };

  const handlePostPreviewClick = (post, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    handleOpenStackPreview(post);
  };

  const handlePostShelfStatusChange = (postId, newStatus) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p)));
  };

  const handlePreviewVisibleChange = async (post, visible) => {
    if (!visible) {
      return;
    }
    if (viewedPreviewRef.current.has(post.id)) {
      return;
    }
    viewedPreviewRef.current.add(post.id);
    try {
      const viewCount = await incrementPostView(post.id);
      if (typeof viewCount === 'number') {
        setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, viewCount } : p)));
      }
    } catch (error) {
      viewedPreviewRef.current.delete(post.id);
    }
  };

  const getPostImageUrl = (post, options = {}) => addTencentImageCompression(
    post.coverUrl || post.mediaUrls?.[0],
    options
  );

  const getPostPreviewUrls = (post, options = {}) => {
    return getPostMediaUrls(post).map((url) => addTencentImageCompression(url, options));
  };

  const handleOpenStackPreview = (post) => {
    const urls = getPostMediaUrls(post);
    if (urls.length === 0) return;
    setStackPreviewIndex(0);
    setStackPreviewShowOriginal(false);
    setStackPreviewPost(post);
    handlePreviewVisibleChange(post, true);
  };

  const buildPreviewLoginReturnTo = useCallback((post, index) => {
    const params = new URLSearchParams({
      previewPost: String(post.id),
      previewIndex: String(index),
      viewOriginal: '1',
    });
    return `${location.pathname}?${params.toString()}`;
  }, [location.pathname]);

  const handleCloseStackPreview = () => {
    if (stackPreviewPost) {
      handlePreviewVisibleChange(stackPreviewPost, false);
    }
    setStackPreviewPost(null);
    setStackPreviewIndex(0);
    setStackPreviewShowOriginal(false);
  };

  useEffect(() => {
    if (previewRestoreRef.current || postsLoading) return;
    const previewPostId = searchParams.get('previewPost');
    if (!previewPostId) return;

    const previewIndex = Math.max(0, Number(searchParams.get('previewIndex') || 0));
    const viewOriginal = searchParams.get('viewOriginal') === '1';
    const post = posts.find((p) => String(p.id) === previewPostId);
    if (!post) return;

    previewRestoreRef.current = true;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('previewPost');
    nextParams.delete('previewIndex');
    nextParams.delete('viewOriginal');
    setSearchParams(nextParams, { replace: true });

    setStackPreviewIndex(previewIndex);
    setStackPreviewShowOriginal(viewOriginal && Boolean(localStorage.getItem('token')));
    setStackPreviewPost(post);
    handlePreviewVisibleChange(post, true);
  }, [posts, postsLoading, searchParams, setSearchParams]);

  const handleChannelClick = (ch) => {
    if (ch.channelKey === channelKey) return;
    if (ch.channelKey === 'daily-challenge') {
      navigate('/community/challenge');
    } else {
      navigate(communityChannelPath(ch.channelKey));
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: e.clientX - (window.innerWidth - cardPosition.right),
      y: e.clientY - cardPosition.top,
      startX: e.clientX,
      startY: e.clientY,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = Math.abs(e.clientX - dragStart.startX);
    const deltaY = Math.abs(e.clientY - dragStart.startY);
    if (deltaX > 5 || deltaY > 5) setHasMoved(true);
    
    const newRight = window.innerWidth - e.clientX + dragStart.x;
    const newTop = e.clientY - dragStart.y;
    
    setCardPosition({
      top: Math.max(60, Math.min(newTop, window.innerHeight - 100)),
      right: Math.max(20, Math.min(newRight, window.innerWidth - 100)),
    });
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      setIsDragging(false);
      setHasMoved(false);
    }, 100);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, cardPosition]);

  if (loading) {
    return (
      <PageLayout>
        <SimpleHeader />
        <Container style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
          <Spin size="large" tip="Loading Channel..." />
        </Container>
      </PageLayout>
    );
  }

  if (!channel) {
    return (
      <PageLayout>
        <SimpleHeader />
        <Container style={{ paddingTop: 100 }}>
          <Empty description="Channel not found" />
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SimpleHeader />

      <UserCardWrapper 
        top={cardPosition.top} 
        right={cardPosition.right}
        isDragging={isDragging || hasMoved}
      >
        <DragHandle 
          data-drag-handle="true"
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          title="Drag to move"
        />
        <UserRoleCard showRoles={true} maxRoleDisplay={1} />
      </UserCardWrapper>

      {/* Hero Banner：标题 + Switch Channel 均在内部 */}
      <HeroSection bgColor={channel.themeColor} coverUrl={channel.coverUrl}>
        {channel.coverUrl && (
          <HeroBackdrop aria-hidden>
            <img src={channel.coverUrl} alt="" draggable={false} />
          </HeroBackdrop>
        )}
        <HeroInner className="hero-inner">
          <HeroContent>
            <TitleWrapper>
              <h1>
                <PictureOutlined />
                {channel.name}
              </h1>
              <div className="desc">
                {channel.description || <FormattedMessage id="community.defaultDesc" defaultMessage="Explore amazing AI-generated art in this channel." />}
              </div>
            </TitleWrapper>
          </HeroContent>
        </HeroInner>
        {channelsList.length > 0 && (
          <ChannelNavSection>
            <ChannelNavLabelRow>
              <ChannelNavWrap>
                <ChannelNavLabel>
                  <FormattedMessage id="community.switchChannel" defaultMessage="Switch Channel" />
                </ChannelNavLabel>
              </ChannelNavWrap>
            </ChannelNavLabelRow>
            <ChannelNavScroll
              ref={channelNavScrollRef}
              $dragging={isNavDragging}
              onPointerDown={handleNavPointerDown}
              onPointerMove={handleNavPointerMove}
              onPointerUp={endNavPointerDrag}
              onPointerCancel={endNavPointerDrag}
            >
              {channelsList.map((ch) => (
                <ChannelNavItem
                  key={ch.id}
                  className={ch.channelKey === channelKey ? 'active' : ''}
                  $navDragging={isNavDragging}
                  onClick={() => {
                    if (navDragRef.current.moved) {
                      navDragRef.current.moved = false;
                      return;
                    }
                    handleChannelClick(ch);
                  }}
                >
                  <div className="media">
                    <div
                      className="cover"
                      style={{
                        backgroundImage: ch.coverUrl
                          ? `url(${ch.coverUrl})`
                          : `linear-gradient(135deg, ${ch.themeColor || '#667eea'}, #764ba2)`,
                      }}
                    />
                    <div className="mask" />
                  </div>
                  <div className="info">
                    <div className="name">{ch.name}</div>
                    <div className="meta">
                      <span className="tag">#{ch.channelKey}</span>
                      <span className="posts">
                        {intl.formatMessage(
                          { id: 'community.posts', defaultMessage: '{count} posts' },
                          { count: ch.postCount || 0 }
                        )}
                      </span>
                      {ch.isVipOnly && (
                        <span className="vip">
                          <LockOutlined />
                          <FormattedMessage id="community.channel.vip" defaultMessage="VIP" />
                        </span>
                      )}
                    </div>
                    {ch.description && (
                      <div className="desc">{ch.description}</div>
                    )}
                  </div>
                </ChannelNavItem>
              ))}
            </ChannelNavScroll>
          </ChannelNavSection>
        )}
      </HeroSection>

      <Container>
        {/* Tool Bar */}
        <ToolBar>
          <ToolBarMain>
            <ToolBarLeft>
              <Tag color={channel.themeColor || 'blue'} style={{ padding: '4px 12px', fontSize: 14, margin: 0 }}>
                #{channelKey}
              </Tag>
              <Text type="secondary" style={{ fontSize: 'inherit' }}>
                <FormattedMessage id="community.totalPosts" defaultMessage="{count} artworks" values={{ count: <b>{channel.postCount || 0}</b> }} />
              </Text>
              {canManageAiOperator && (
                <Button
                  type="default"
                  icon={<RobotOutlined />}
                  onClick={() => setAiOperatorModalOpen(true)}
                >
                  <FormattedMessage id="community.aiOperator.manageButton" defaultMessage="AI 运营" />
                </Button>
              )}
            </ToolBarLeft>
          </ToolBarMain>

          <FilterBar>
            <FilterBlock>
              <FilterBlockLabel>
                <ClockCircleOutlined />
                <FormattedMessage id="community.sortBy" defaultMessage="Sort By" />
              </FilterBlockLabel>
              <SegmentGroup role="tablist" aria-label={intl.formatMessage({ id: 'community.sortBy', defaultMessage: 'Sort By' })}>
                <SegmentButton
                  type="button"
                  role="tab"
                  aria-selected={sortBy === 'latest'}
                  $active={sortBy === 'latest'}
                  onClick={() => setSortBy('latest')}
                >
                  <ClockCircleOutlined />
                  <FormattedMessage id="community.sort.latest" defaultMessage="Latest" />
                </SegmentButton>
                <SegmentButton
                  type="button"
                  role="tab"
                  aria-selected={sortBy === 'popular'}
                  $active={sortBy === 'popular'}
                  onClick={() => setSortBy('popular')}
                >
                  <FireOutlined />
                  <FormattedMessage id="community.sort.popular" defaultMessage="Popular" />
                </SegmentButton>
                <SegmentButton
                  type="button"
                  role="tab"
                  aria-selected={sortBy === 'shared'}
                  $active={sortBy === 'shared'}
                  onClick={() => setSortBy('shared')}
                >
                  <ShareAltOutlined />
                  <FormattedMessage id="community.sort.shared" defaultMessage="Most shared" />
                </SegmentButton>
                <SegmentButton
                  type="button"
                  role="tab"
                  aria-selected={sortBy === 'downloaded'}
                  $active={sortBy === 'downloaded'}
                  onClick={() => setSortBy('downloaded')}
                >
                  <DownloadOutlined />
                  <FormattedMessage id="community.sort.downloaded" defaultMessage="Most downloaded" />
                </SegmentButton>
              </SegmentGroup>
            </FilterBlock>

            <FilterDivider aria-hidden />

            <FilterBlock>
              <FilterBlockLabel>
                <FilterOutlined />
                <FormattedMessage id="community.advancedFilter" defaultMessage="Advanced filters" />
              </FilterBlockLabel>
              <SegmentGroup role="tablist" aria-label={intl.formatMessage({ id: 'community.advancedFilter', defaultMessage: 'Advanced filters' })}>
                <SegmentButton
                  type="button"
                  role="tab"
                  aria-selected={promptAccess === 'all'}
                  $active={promptAccess === 'all'}
                  onClick={() => setPromptAccess('all')}
                >
                  <FormattedMessage id="community.promptAccess.all" defaultMessage="All prompts" />
                </SegmentButton>
                <SegmentButton
                  type="button"
                  role="tab"
                  aria-selected={promptAccess === 'free'}
                  $active={promptAccess === 'free'}
                  $variant="free"
                  onClick={() => setPromptAccess('free')}
                >
                  <UnlockOutlined />
                  <FormattedMessage id="community.promptAccess.free" defaultMessage="Free access" />
                </SegmentButton>
                <SegmentButton
                  type="button"
                  role="tab"
                  aria-selected={promptAccess === 'paid'}
                  $active={promptAccess === 'paid'}
                  $variant="paid"
                  onClick={() => setPromptAccess('paid')}
                >
                  <LockOutlined />
                  <FormattedMessage id="community.promptAccess.paid" defaultMessage="Purchase required" />
                </SegmentButton>
              </SegmentGroup>
            </FilterBlock>

            <FilterBarActions>
              <Button
                type="primary"
                shape="round"
                icon={<PlusOutlined />}
                onClick={() => navigate('/workspace/create/text-to-image')}
              >
                <FormattedMessage id="community.publish" defaultMessage="Publish artwork" />
              </Button>
            </FilterBarActions>
          </FilterBar>
        </ToolBar>

        {/* --- Art Grid：JS 瀑布流，新帖子严格出现在底部 --- */}
        <MasonryGridWrap>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {posts.map((post) => {
              const isLiked = post.isLiked || false;
              const isCollected = post.isCollected || false;
              const cardSpecs = getPostCardSpecs(post);
              const delisted = isPostDelisted(post.status);
              const mediaUrls = getPostMediaUrls(post);
              const hasMultipleImages = mediaUrls.length > 1;
              const promptAccessType = getPostPromptAccessType(post);

              return (
                <div key={post.id}>
                  <ModernCard>
                    <CardImageWrapper $delisted={delisted}>
                      <Image
                        src={getPostImageUrl(post, { quality: 20 })}
                        alt={post.title}
                        preview={false}
                      />
                      {hasMultipleImages && (
                        <MultiImageBadge>
                          <PictureOutlined />
                          {mediaUrls.length}
                        </MultiImageBadge>
                      )}
                      {promptAccessType !== 'none' && (
                        <Tooltip
                          title={
                            promptAccessType === 'free'
                              ? intl.formatMessage({
                                  id: 'community.promptAccess.freeHint',
                                  defaultMessage: '提供完整提示词，可直接查看与生成同款',
                                })
                              : intl.formatMessage({
                                  id: 'community.promptAccess.paidHint',
                                  defaultMessage: '提示词已隐藏，需前往提示词商城购买',
                                })
                          }
                        >
                          <PromptAccessBadge $type={promptAccessType}>
                            {promptAccessType === 'free' ? <FileTextOutlined /> : <LockOutlined />}
                          </PromptAccessBadge>
                        </Tooltip>
                      )}
                      {canModeratePosts && (
                        <PostShelfToggle
                          postId={post.id}
                          status={post.status}
                          onStatusChange={handlePostShelfStatusChange}
                        />
                      )}
                      <CardCenterActions>
                        <CardGlassActionBtn
                          type="button"
                          onClick={(e) => handlePostPreviewClick(post, e)}
                        >
                          <EyeOutlined />
                          <FormattedMessage id="post.preview" defaultMessage="Preview" />
                        </CardGlassActionBtn>
                        <CardGlassActionBtn
                          type="button"
                          onClick={(e) => handlePostDetailClick(post, e)}
                        >
                          <FormattedMessage id="post.viewDetail" defaultMessage="Details" />
                          <ArrowRightOutlined style={{ fontSize: 10 }} />
                        </CardGlassActionBtn>
                      </CardCenterActions>
                    </CardImageWrapper>

                    <FloatingActions>
                      <Tooltip
                        title={
                          isLiked
                            ? intl.formatMessage({ id: 'community.post.unlike', defaultMessage: '取消喜欢' })
                            : intl.formatMessage({ id: 'community.post.like', defaultMessage: '喜欢' })
                        }
                        placement="left"
                      >
                        <GlassBtn
                          active={isLiked}
                          activeColor="#ff4d4f"
                          animating={animatingPost === post.id}
                          onClick={(e) => handleLike(post.id, e)}
                        >
                          {isLiked ? <HeartFilled /> : <HeartOutlined />}
                        </GlassBtn>
                      </Tooltip>
                      <Tooltip
                        title={
                          isCollected
                            ? intl.formatMessage({ id: 'community.post.uncollect', defaultMessage: '取消收藏' })
                            : intl.formatMessage({ id: 'community.post.collect', defaultMessage: '收藏' })
                        }
                        placement="left"
                      >
                        <GlassBtn
                          active={isCollected}
                          activeColor="#faad14"
                          onClick={(e) => handleCollect(post.id, e)}
                        >
                          {isCollected ? <StarFilled /> : <StarOutlined />}
                        </GlassBtn>
                      </Tooltip>
                    </FloatingActions>

                    <CardContent>
                      <CardTitleRow>
                        <CardTitle title={post.title}>{post.title || intl.formatMessage({ id: 'post.untitled', defaultMessage: 'Untitled Creation' })}</CardTitle>
                      </CardTitleRow>
                      {cardSpecs.length > 0 && (
                        <CardSpecRow>
                          {cardSpecs.map((spec) => (
                            <Tooltip
                              key={`${post.id}-${spec.key}`}
                              title={`${intl.formatMessage({ id: spec.labelId, defaultMessage: spec.key })}: ${spec.value}`}
                            >
                              <SpecChip>{spec.value}</SpecChip>
                            </Tooltip>
                          ))}
                        </CardSpecRow>
                      )}
                      <MetaRow>
                        <UserInfo
                          onClick={(e) => {
                            if (post.userId) {
                              e.stopPropagation();
                              navigate(`/community/user/${post.userId}`);
                            }
                          }}
                          style={{ cursor: post.userId ? 'pointer' : 'default' }}
                        >
                          <Avatar
                            size={22}
                            src={post.userAvatar}
                            icon={<UserOutlined />}
                            style={{
                              flexShrink: 0,
                              border: '1px solid rgba(255,255,255,0.4)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          />
                          <span className="name">{post.userNickname || 'Anonymous'}</span>
                        </UserInfo>
                        <StatsInfo>
                          <Tooltip title={intl.formatMessage({ id: 'community.post.likesTooltip', defaultMessage: '点赞数' })}>
                            <span><HeartFilled style={{ fontSize: 11 }} /> {post.likeCount || 0}</span>
                          </Tooltip>
                          <Tooltip title={intl.formatMessage({ id: 'community.post.viewsTooltip', defaultMessage: '浏览数' })}>
                            <span><EyeOutlined style={{ fontSize: 11 }} /> {post.viewCount || 0}</span>
                          </Tooltip>
                          <Tooltip title={intl.formatMessage({ id: 'community.post.sharesTooltip', defaultMessage: '分享数' })}>
                            <span><ShareAltOutlined style={{ fontSize: 11 }} /> {post.shareCount || 0}</span>
                          </Tooltip>
                          <Tooltip title={intl.formatMessage({ id: 'community.post.downloadsTooltip', defaultMessage: '下载数' })}>
                            <span><DownloadOutlined style={{ fontSize: 11 }} /> {post.downloadCount || 0}</span>
                          </Tooltip>
                        </StatsInfo>
                      </MetaRow>
                    </CardContent>
                  </ModernCard>
                </div>
              );
            })}
          </Masonry>
        </MasonryGridWrap>

        {/* 初次加载：骨架屏 + 流光动画 */}
        {postsLoading && posts.length === 0 && (
          <SkeletonGridWrap>
            {[100, 85, 120, 95, 110, 90, 100, 80].map((ratio, i) => (
              <SkeletonCard key={i} ratio={`${ratio}%`} mobileRatio={`${ratio < 100 ? ratio + 15 : ratio}%`} />
            ))}
          </SkeletonGridWrap>
        )}

        {hasMore && posts.length > 0 && (
          <>
            <div ref={loadMoreRef} style={{ height: 1, marginTop: -1 }} aria-hidden />
            <BlockSection padding="40px 0" mobilePadding="24px 0">
              {postsLoading ? (
                <LoadMoreLoaderWrap>
                  <GradientRing />
                </LoadMoreLoaderWrap>
              ) : (
                <Button size="large" shape="round" onClick={() => setPage(p => p + 1)} style={{ padding: '0 40px', minHeight: 44 }}>
                  <FormattedMessage id="common.loadMore" defaultMessage="Explore More" />
                </Button>
              )}
            </BlockSection>
          </>
        )}

        {posts.length === 0 && !postsLoading && (
          <BlockSection padding="60px 0" mobilePadding="40px 16px">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({ id: 'community.noPosts', defaultMessage: 'No masterpieces here yet. Be the first to create!' })}
            />
          </BlockSection>
        )}
      </Container>

      <ChannelAiOperatorModal
        open={aiOperatorModalOpen}
        channelId={channel?.id}
        channelName={channel?.name}
        onClose={() => setAiOperatorModalOpen(false)}
        onPostTriggered={reloadPosts}
      />

      <PostStackImagePreview
        open={Boolean(stackPreviewPost)}
        images={stackPreviewPost ? getPostPreviewUrls(stackPreviewPost, { quality: 90, width: 1920 }) : []}
        originalImages={stackPreviewPost ? getPostMediaUrls(stackPreviewPost) : []}
        currentIndex={stackPreviewIndex}
        onChange={setStackPreviewIndex}
        onClose={handleCloseStackPreview}
        loginReturnTo={stackPreviewPost ? buildPreviewLoginReturnTo(stackPreviewPost, stackPreviewIndex) : undefined}
        initialShowOriginal={stackPreviewShowOriginal}
      />
    </PageLayout>
  );
};

export default ChannelDetailPage;