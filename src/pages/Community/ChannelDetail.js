import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Button, Typography, Empty, Select, Avatar, Tooltip, Tag } from 'antd';
import Masonry from 'react-masonry-css';
import { 
  HeartOutlined, HeartFilled, 
  StarOutlined, StarFilled, 
  EyeOutlined, UserOutlined,
  FireOutlined, ClockCircleOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes, css } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { getChannelByKey, listPosts, likePost, unlikePost, collectPost, uncollectPost, getCurrentChallenge, listChannels } from 'api/community';
import UserRoleCard from 'components/community/UserRoleCard';

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
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);

  &::before {
    content: '';
    position: absolute;
    inset: -20px;
    background-image: ${props => props.coverUrl ? `url(${props.coverUrl})` : 'none'};
    background-size: cover;
    background-position: center;
    filter: blur(3px) brightness(0.92);
    opacity: 0.9;
    transform: scale(1.05);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);
  }

  @media (max-width: 768px) {
    height: 300px;
    margin-bottom: 24px;
  }
`;

/* Hero 内部底部区域：标题 + 频道列表，与下方 Container 同宽 */
const HeroInner = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 0 max(16px, env(safe-area-inset-left)) 20px max(16px, env(safe-area-inset-right));
    gap: 16px;
  }
`;

/* 头部频道快捷列表：与帖子同宽，放在 Hero 内 */
const ChannelNavWrap = styled.div`
  margin-bottom: 0;

  @media (max-width: 768px) {
    margin-bottom: 0;
  }
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
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  overflow-y: visible;
  padding: 14px 0 14px 0;
  min-width: 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#333' : 'rgba(0,0,0,0.15)'};
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
    border-radius: 3px;
  }
`;

const ChannelNavItem = styled.div`
  flex-shrink: 0;
  width: 120px;
  height: 72px;
  border-radius: 12px;
  overflow: visible;
  cursor: pointer;
  position: relative;
  background: ${props => props.theme.mode === 'dark' ? '#222' : '#e8e8e8'};
  transition: transform 0.2s ease, box-shadow 0.2s;
  border: 2px solid transparent;
  transform-origin: center center;

  &.active {
    transform: scale(1.18);
    border-color: ${props => props.theme.mode === 'dark' ? '#1890ff' : '#1890ff'};
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.3);
    z-index: 1;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  &:hover:not(.active) {
    transform: translateY(-2px);
  }

  .cover {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transition: transform 0.3s;
    border-radius: inherit;
  }
  &:hover .cover {
    transform: scale(1.05);
  }

  .mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
    border-radius: inherit;
  }

  .name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 60px;
    border-radius: 10px;
    .name { font-size: 11px; padding: 6px 8px; }

    &.active {
      transform: scale(1.15);
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff'};
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px 16px;
    border-radius: 10px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .label {
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#aaa' : '#666'};
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    .label { font-size: 14px; margin-right: 0; }
    .ant-select { min-width: 120px !important; }
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
  border-radius: 16px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#222' : '#f0f2f5'};
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : 'transparent'};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 5;
    cursor: pointer;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
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
  height: auto;
  z-index: 1;

  img {
    width: 100%;
    height: auto;
    display: block;
    vertical-align: top;
    transition: transform 0.7s ease;
  }

  ${ModernCard}:hover & img {
    transform: scale(1.02);
  }
`;

const FloatingActions = styled.div`
  position: absolute;
  top: 12px;
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
    top: auto;
    bottom: 56px;
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
  padding: 12px 16px;

  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.28)'
    : 'rgba(255, 255, 255, 0.35)'};

  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  border-top: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(255, 255, 255, 0.18)'};

  transition: background 0.3s ease;

  ${ModernCard}:hover & {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.42)'
      : 'rgba(255, 255, 255, 0.52)'};
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  text-shadow: ${props => props.theme.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'};

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 4px;
  }
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

const ChannelDetailPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { channelKey } = useParams();
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [animatingPost, setAnimatingPost] = useState(null);
  
  // Drag state
  const [cardPosition, setCardPosition] = useState({ top: 100, right: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // 头部频道列表（快捷跳转）
  const [channelsList, setChannelsList] = useState([]);

  // 滚动到底部附近自动加载
  const loadMoreRef = useRef(null);
  const postsLoadingRef = useRef(postsLoading);
  postsLoadingRef.current = postsLoading;

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
    if (channelKey) {
      if (channelKey === 'daily-challenge') {
        const redirectToCurrentChallenge = async () => {
          try {
            const currentChallenge = await getCurrentChallenge();
            if (currentChallenge && currentChallenge.id) {
              navigate(`/community/challenge/${currentChallenge.id}`, { replace: true });
            } else {
              navigate('/community/challenge', { replace: true });
            }
          } catch (error) {
            navigate('/community/challenge', { replace: true });
          }
        };
        redirectToCurrentChallenge();
        return;
      }
      fetchChannel();
    }
  }, [channelKey, navigate]);

  useEffect(() => {
    if (channel?.id) {
      setPage(1);
      setPosts([]);
      setHasMore(true);
    }
  }, [channel?.id, sortBy]);

  useEffect(() => {
    if (!channel) return;
    listChannels()
      .then((data) => setChannelsList(data || []))
      .catch(() => setChannelsList([]));
  }, [channel?.id]);

  useEffect(() => {
    if (channel?.id) {
      fetchPosts();
    }
  }, [channel?.id, page, sortBy]);

  const fetchChannel = async () => {
    setLoading(true);
    try {
      const data = await getChannelByKey(channelKey);
      setChannel(data);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    if (!channel?.id) return;
    
    setPostsLoading(true);
    try {
      const data = await listPosts({
        channelId: channel.id,
        page,
        pageSize: 20,
        sortBy: sortBy,
      });
      
      if (page === 1) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 20);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Load failed');
    } finally {
      setPostsLoading(false);
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

  const handlePostClick = (post) => {
    navigate(`/community/post/${post.id}`);
  };

  const handleChannelClick = async (ch) => {
    if (ch.channelKey === channelKey) return;
    if (ch.channelKey === 'daily-challenge') {
      try {
        const currentChallenge = await getCurrentChallenge();
        navigate(currentChallenge?.id ? `/community/challenge/${currentChallenge.id}` : '/community/challenge');
      } catch {
        navigate('/community/challenge');
      }
    } else {
      navigate(`/community/${ch.channelKey}`);
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
          {channelsList.length > 0 && (
            <ChannelNavWrap>
              <ChannelNavLabel>
                <FormattedMessage id="community.switchChannel" defaultMessage="Switch Channel" />
              </ChannelNavLabel>
              <ChannelNavScroll>
                {channelsList.map((ch) => (
                  <ChannelNavItem
                    key={ch.id}
                    className={ch.channelKey === channelKey ? 'active' : ''}
                    onClick={() => handleChannelClick(ch)}
                  >
                    <div
                      className="cover"
                      style={{
                        backgroundImage: ch.coverUrl ? `url(${ch.coverUrl})` : 'linear-gradient(135deg, #667eea, #764ba2)',
                      }}
                    />
                    <div className="mask" />
                    <div className="name">{ch.name}</div>
                  </ChannelNavItem>
                ))}
              </ChannelNavScroll>
            </ChannelNavWrap>
          )}
        </HeroInner>
      </HeroSection>

      <Container>
        {/* Tool Bar */}
        <ToolBar>
          <ToolBarLeft>
            <Tag color={channel.themeColor || "blue"} style={{ padding: '4px 12px', fontSize: 14 }}>
              #{channelKey}
            </Tag>
            <Text type="secondary" style={{ fontSize: 'inherit' }}>
              <FormattedMessage id="community.totalPosts" defaultMessage="{count} artworks" values={{ count: <b>{channel.postCount || 0}</b> }} />
            </Text>
          </ToolBarLeft>

          <FilterGroup>
            <span className="label">
              <FormattedMessage id="community.sortBy" defaultMessage="Sort By" />
            </span>
            <Select
              value={sortBy}
              onChange={setSortBy}
              size="large"
              bordered={false}
              style={{ width: 140, background: 'rgba(0,0,0,0.04)', borderRadius: 8 }}
              options={[
                { value: 'latest', label: <><ClockCircleOutlined /> Latest</> },
                { value: 'popular', label: <><FireOutlined /> Popular</> },
              ]}
            />
          </FilterGroup>
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

              return (
                <div key={post.id}>
                  <ModernCard onClick={() => handlePostClick(post)}>
                    <CardImageWrapper>
                      <img
                        src={addTencentImageCompression(post.coverUrl || post.mediaUrls?.[0], { quality: 20 })}
                        alt={post.title}
                        loading="lazy"
                      />
                    </CardImageWrapper>

                    <FloatingActions>
                      <Tooltip title={isLiked ? "Unlike" : "Like"} placement="left">
                        <GlassBtn
                          active={isLiked}
                          activeColor="#ff4d4f"
                          animating={animatingPost === post.id}
                          onClick={(e) => handleLike(post.id, e)}
                        >
                          {isLiked ? <HeartFilled /> : <HeartOutlined />}
                        </GlassBtn>
                      </Tooltip>
                      <Tooltip title={isCollected ? "Uncollect" : "Collect"} placement="left">
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
                      <CardTitle title={post.title}>{post.title || "Untitled Artwork"}</CardTitle>
                      <MetaRow>
                        <UserInfo>
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
                          <Tooltip title="Likes">
                            <span><HeartFilled style={{ fontSize: 11 }} /> {post.likeCount || 0}</span>
                          </Tooltip>
                          <Tooltip title="Views">
                            <span><EyeOutlined style={{ fontSize: 11 }} /> {post.viewCount || 0}</span>
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
    </PageLayout>
  );
};

export default ChannelDetailPage;