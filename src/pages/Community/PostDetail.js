import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Spin, message, Button, Typography, Tag, Row, Col, Avatar, Tooltip, Divider, Space, Image 
} from 'antd';
import { 
  HeartOutlined, HeartFilled, StarOutlined, StarFilled, 
  EyeOutlined, ArrowLeftOutlined, CopyOutlined, ShareAltOutlined,
  ThunderboltFilled, DownloadOutlined, UserAddOutlined, CheckOutlined,
  ShopOutlined, LockOutlined, ArrowRightOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { getPostDetail, likePost, unlikePost, collectPost, uncollectPost, getPostInteractionStatus, followUser, unfollowUser, getRelationStatus, checkReviewPermission } from 'api/community';
import UserProfileModal from 'components/community/UserProfileModal';
import PostShelfToggle from 'components/community/PostShelfToggle';
import { isPostDelisted } from 'utils/communityPostStatus';
import { addTencentImageCompression, parsePostGenerationDetails } from './ChallengeDetailPage/utils';
import { buildT2iImportFromPost, persistT2iImportPayload } from 'utils/postT2iImport';
import { isPostPromptMarketLocked } from 'utils/communityPostPrompt';

const { Title, Text, Paragraph } = Typography;

// --- Styled Components ---

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#ffffff'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  padding-top: 60px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding-top: 56px;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
`;

// 顶部导航栏，极简风格
const NavBar = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 12px 16px;
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  }
`;

const MainContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 40px 60px;
  display: flex;
  gap: 60px;
  position: relative;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 0 20px 40px;
    gap: 30px;
  }

  @media (max-width: 768px) {
    padding: 0 16px 32px;
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
    gap: 20px;
  }
`;

// 左侧：媒体展示区
const MediaSection = styled.div`
  flex: 1;
  min-width: 0; // 防止 flex 子项溢出
`;

const ImageContainer = styled.div`
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f8f8f8'};
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  position: relative;

  @media (max-width: 768px) {
    border-radius: 16px;
  }
  
  .ant-image {
    width: 100%;
    display: block;
  }
  
  .ant-image-img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s, filter 0.3s ease, opacity 0.3s ease;
  }

  ${(props) => props.$delisted && `
    .ant-image-img {
      filter: grayscale(100%);
      opacity: 0.55;
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

// 右侧：信息与操作区 (Sticky Sidebar)
const SidebarSection = styled.div`
  width: 400px;
  max-width: 400px;
  min-width: 0;
  flex-shrink: 0;
  
  // 核心：粘性定位
  position: sticky;
  top: 100px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden; // 防止水平滚动条
  
  // 隐藏滚动条但保留功能
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 3px;
  }

  @media (max-width: 1024px) {
    width: 100%;
    max-width: 100%;
    position: static;
    max-height: none;
  }
`;

// 作者卡片
const UserCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 12px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: opacity 0.2s;
    min-width: 0;
    flex: 1;

    &:hover {
      opacity: 0.8;
    }

    .ant-avatar {
      cursor: pointer;
      flex-shrink: 0;
    }

    .name {
      font-size: 16px;
      font-weight: 700;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .date {
      font-size: 12px;
      color: #888;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
    .user-info .name { font-size: 15px; }
    .user-info .date { font-size: 11px; }
  }
`;

// 优化后的关注按钮
const FollowButton = styled(Button)`
  min-width: 90px;
  height: 36px;
  border-radius: 18px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 768px) {
    min-width: 72px;
    height: 36px;
    padding: 0 14px;
    font-size: 13px;
  }

  &.follow-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
    }
  }
  
  &.follow-btn-following {
    background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#f5f5f5'};
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
    color: ${props => props.theme.mode === 'dark' ? '#ccc' : '#666'};
    
    &:hover:not(:disabled) {
      background: ${props => props.theme.mode === 'dark' ? '#333' : '#ebebeb'};
      border-color: ${props => props.theme.mode === 'dark' ? '#555' : '#d0d0d0'};
    }
  }
  
  &.follow-btn-mutual {
    background: ${props => props.theme.mode === 'dark' ? '#1a3a2a' : '#e6f7f0'};
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#2d5a3d' : '#91d5b3'};
    color: ${props => props.theme.mode === 'dark' ? '#6cd4a0' : '#52c41a'};
    
    &:hover:not(:disabled) {
      background: ${props => props.theme.mode === 'dark' ? '#1f4a35' : '#d4f4e6'};
      border-color: ${props => props.theme.mode === 'dark' ? '#3d6a4d' : '#73d19d'};
    }
  }
  
  .anticon {
    margin-right: 4px;
    font-size: 14px;
  }
`;

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const PromptMarketCta = styled.div`
  position: relative;
  margin-bottom: 24px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.22)'};
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(145deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.98) 55%, rgba(23, 37, 84, 0.6) 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f5f7ff 48%, #eef2ff 100%)'};
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
    : '0 8px 32px rgba(99, 102, 241, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7, #6366f1);
    background-size: 200% 100%;
    animation: ${shimmer} 6s linear infinite;
  }

  @media (max-width: 768px) {
    margin-bottom: 16px;
    border-radius: 14px;
  }
`;

const PromptMarketCtaInner = styled.div`
  padding: 22px 22px 20px;

  @media (max-width: 768px) {
    padding: 16px 16px 14px;
  }
`;

const PromptMarketHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
`;

const PromptMarketIcon = styled.div`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    border-radius: 10px;
  }
`;

const PromptMarketHeaderText = styled.div`
  flex: 1;
  min-width: 0;

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px;
    margin-bottom: 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: ${props => props.theme.mode === 'dark' ? '#c7d2fe' : '#4338ca'};
    background: ${props => props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(129, 140, 248, 0.35)' : 'rgba(99, 102, 241, 0.2)'};
  }

  h4 {
    margin: 0 0 6px;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.35;
    color: ${props => props.theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.65;
    color: ${props => props.theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  }

  @media (max-width: 768px) {
    h4 { font-size: 15px; }
    p { font-size: 12px; }
  }
`;

const PromptLockedPreview = styled.div`
  position: relative;
  border-radius: 12px;
  padding: 16px 16px 14px;
  margin-bottom: 16px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.72)'};
  border: 1px dashed ${props => props.theme.mode === 'dark' ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.45)'};

  .label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${props => props.theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
    margin-bottom: 10px;
  }

  .lines {
    display: flex;
    flex-direction: column;
    gap: 8px;
    filter: blur(5px);
    user-select: none;
    pointer-events: none;
    opacity: 0.55;
  }

  .line {
    height: 10px;
    border-radius: 6px;
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(90deg, #334155 0%, #475569 100%)'
      : 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)'};
  }

  .line:nth-child(1) { width: 92%; }
  .line:nth-child(2) { width: 78%; }
  .line:nth-child(3) { width: 65%; }
  .line:nth-child(4) { width: 84%; }

  .lock-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.55)'
      : 'rgba(248, 250, 252, 0.65)'};
    backdrop-filter: blur(2px);

    .lock-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #6366f1;
      background: ${props => props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#fff'};
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }

    span {
      font-size: 12px;
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? '#cbd5e1' : '#475569'};
    }
  }
`;

const PromptMarketFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;

  .feature {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.theme.mode === 'dark' ? '#c7d2fe' : '#4338ca'};
    background: ${props => props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(238, 242, 255, 0.9)'};
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(199, 210, 254, 0.8)'};

    .anticon {
      font-size: 12px;
      color: #6366f1;
    }
  }
`;

const PromptMarketAction = styled(Button)`
  && {
    width: 100%;
    height: 46px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(99, 102, 241, 0.42);
    }

    @media (max-width: 768px) {
      height: 44px;
      font-size: 14px;
      border-radius: 10px;
    }
  }
`;

// 提示词盒子：模仿代码块风格
const PromptBox = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f5f7fa'};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : 'transparent'};
  position: relative;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  }

  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
    }
  }

  .content {
    font-family: 'JetBrains Mono', 'Menlo', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: ${props => props.theme.mode === 'dark' ? '#ccc' : '#444'};
    word-break: break-all;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    padding: 14px 16px;
    margin-bottom: 16px;
    border-radius: 12px;

    .content {
      font-size: 13px;
      max-height: 160px;
    }
  }
`;

// 核心操作按钮组 (Remix / Like / Collect)
const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;

  .main-btn {
    flex: 2;
    min-width: 0;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  }

  .icon-btn {
    flex: 1;
    min-width: 48px;
    height: 48px;
    border-radius: 24px;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    background: transparent;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};
      transform: translateY(-2px);
    }

    &.active {
      border-color: transparent;
    }
  }

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 24px;

    .main-btn {
      height: 44px;
      font-size: 14px;
      border-radius: 22px;
    }

    .icon-btn {
      min-width: 44px;
      height: 44px;
      border-radius: 22px;
      font-size: 16px;
    }
  }
`;

// 标签组
const StyledTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .ant-tag {
    margin: 0;
    padding: 6px 12px;
    border-radius: 100px;
    border: none;
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f0f0f0'};
    color: ${props => props.theme.mode === 'dark' ? '#aaa' : '#666'};
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#333' : '#e6e6e6'};
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
    }
  }

  @media (max-width: 768px) {
    gap: 6px;
    .ant-tag { padding: 5px 10px; font-size: 12px; }
  }
`;

// 页面标题，移动端缩小字号
const PageTitle = styled(Title)`
  margin-bottom: 24px !important;
  font-size: 28px !important;
  line-height: 1.3 !important;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 20px !important;
    margin-bottom: 16px !important;
  }
`;

// 底部统计区，移动端换行
const StatsRow = styled(Space)`
  flex-wrap: wrap;
  row-gap: 8px;
`;

// 炫光效果模型名称
const GlowModelName = styled.div`
  font-weight: 500;
  background: linear-gradient(
    90deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #667eea 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
  position: relative;
  display: block;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  
  @keyframes shimmer {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 200% center;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: shine 2s ease-in-out infinite;
    pointer-events: none;
  }
  
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const PostDetailPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState(null);
  const [interaction, setInteraction] = useState(null);
  const [relation, setRelation] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [userProfileModalVisible, setUserProfileModalVisible] = useState(false);
  const [canModeratePosts, setCanModeratePosts] = useState(false);

  useEffect(() => {
    if (postId) fetchPostDetailData();
  }, [postId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCanModeratePosts(false);
      return;
    }
    checkReviewPermission()
      .then(setCanModeratePosts)
      .catch(() => setCanModeratePosts(false));
  }, [postId]);

  const fetchPostDetailData = async () => {
    setLoading(true);
    try {
      const data = await getPostDetail(Number(postId));
      setPost(data);
      loadInteractionStatus(Number(postId));
      if (data.userId) {
        loadRelationStatus(data.userId);
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'common.loadFailed', defaultMessage: 'Load failed' }));
    } finally {
      setLoading(false);
    }
  };

  const loadInteractionStatus = async (id) => {
    try {
      const status = await getPostInteractionStatus(id);
      setInteraction(status);
    } catch (e) { /* ignore */ }
  };

  const loadRelationStatus = async (targetUserId) => {
    try {
      const status = await getRelationStatus(targetUserId);
      setRelation(status);
    } catch (e) { /* ignore */ }
  };

  // 处理点赞/收藏逻辑 (保持原有逻辑，仅展示 UI 变化)
  const handleLike = async () => {
    if (!post) return;
    try {
      const isLiked = interaction?.isLiked;
      const res = isLiked ? await unlikePost(post.id) : await likePost(post.id);
      setInteraction(prev => ({ ...prev, isLiked: res.isLiked, likesCount: res.likesCount }));
      setPost(prev => ({ ...prev, likeCount: res.likesCount })); // 更新本地显示
    } catch (e) { message.error(intl.formatMessage({ id: 'common.operationFailed', defaultMessage: 'Operation failed' })); }
  };

  const handleCollect = async () => {
    if (!post) return;
    try {
      const isCollected = interaction?.isCollected;
      const res = isCollected ? await uncollectPost(post.id) : await collectPost(post.id);
      setInteraction(prev => ({ ...prev, isCollected: res.isCollected, collectsCount: res.collectsCount }));
      setPost(prev => ({ ...prev, collectCount: res.collectsCount }));
    } catch (e) { message.error(intl.formatMessage({ id: 'common.operationFailed', defaultMessage: 'Operation failed' })); }
  };

  const handleFollow = async () => {
    if (!post || !post.userId) return;
    setFollowLoading(true);
    try {
      const isFollowing = relation?.isFollowing;
      const res = isFollowing ? await unfollowUser(post.userId) : await followUser(post.userId, 'WORK_DETAIL');
      setRelation(res);
      message.success(isFollowing 
        ? intl.formatMessage({ id: 'user.unfollowSuccess', defaultMessage: 'Unfollowed successfully' })
        : intl.formatMessage({ id: 'user.followSuccess', defaultMessage: 'Followed successfully' })
      );
    } catch (e) { 
      const errorMessage = e.message || e.response?.data?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: 'Operation failed' });
      message.error(errorMessage); 
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success(intl.formatMessage({ id: 'common.copied', defaultMessage: '已复制' }));
  };

  const t2iImportPayload = useMemo(() => buildT2iImportFromPost(post), [post]);
  const canGenerateSameStyle = Boolean(t2iImportPayload);

  const handleRemix = () => {
    if (!t2iImportPayload) {
      if (isPostPromptMarketLocked(post)) {
        navigate(`/workspace/prompt-market?listingId=${post.promptMarketListingId}`);
        return;
      }
      message.warning(
        intl.formatMessage({
          id: 'post.remixUnavailable',
          defaultMessage: '当前帖子暂无法生成同款',
        })
      );
      return;
    }
    persistT2iImportPayload(t2iImportPayload);
    navigate('/workspace/create/text-to-image', { state: { t2iImport: t2iImportPayload } });
  };

  if (loading || !post) {
    return (
      <PageLayout>
        <SimpleHeader />
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  const isLiked = interaction?.isLiked || post.isLiked;
  const isCollected = interaction?.isCollected || post.isCollected;
  const likeCount = interaction?.likesCount ?? post.likeCount;
  const collectCount = interaction?.collectsCount ?? post.collectCount;

  return (
    <PageLayout>
      <SimpleHeader />
      
      {/* 顶部简易导航 / 面包屑 */}
      <NavBar>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ fontSize: 16, paddingLeft: 0, minHeight: 44, minWidth: 44 }}
          className="nav-back-btn"
        >
          <FormattedMessage id="common.back" defaultMessage="返回" />
        </Button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button icon={<ShareAltOutlined />} shape="circle" style={{ minWidth: 44, minHeight: 44 }} />
          <Button icon={<DownloadOutlined />} shape="circle" style={{ minWidth: 44, minHeight: 44 }} />
        </div>
      </NavBar>

      <MainContainer>
        {/* 左侧：图片展示，多图时至少一行两张 */}
        <MediaSection>
          <Row gutter={[16, 16]}>
            {post.mediaUrls.map((url, index) => (
              <Col key={index} xs={post.mediaUrls.length > 1 ? 12 : 24} sm={12}>
                <ImageContainer $delisted={isPostDelisted(post.status)}>
                  <Image
                    src={addTencentImageCompression(url, { quality: 30 })}
                    alt={`Creation ${index + 1}`}
                    loading="lazy"
                    style={{ width: '100%', height: 'auto' }}
                    preview={{
                      src: url,
                      mask: <div style={{ padding: '8px', color: '#fff', fontSize: '14px' }}>查看原图</div>
                    }}
                  />
                  {canModeratePosts && index === 0 && (
                    <PostShelfToggle
                      postId={post.id}
                      status={post.status}
                      onStatusChange={(_postId, newStatus) => {
                        setPost((prev) => (prev ? { ...prev, status: newStatus } : prev));
                      }}
                    />
                  )}
                </ImageContainer>
              </Col>
            ))}
          </Row>
        </MediaSection>

        {/* 右侧：详情 Sticky Sidebar */}
        <SidebarSection>
            {/* 1. 标题与操作 */}
            <Title level={2} style={{ marginBottom: 24, fontSize: 28 }}>
                {post.title || <FormattedMessage id="post.untitled" defaultMessage="Untitled Creation" />}
            </Title>

            <UserCard>
                <div className="user-info" onClick={() => setUserProfileModalVisible(true)}>
                    <Avatar src={post.userAvatar} size={48} icon={<EyeOutlined />} />
                    <div>
                        <div className="name">{post.userNickname || <FormattedMessage id="common.creator" defaultMessage="Creator" />}</div>
                        <div className="date">{new Date(post.createTime).toLocaleDateString()}</div>
                    </div>
                </div>
                <FollowButton 
                    className={
                        relation?.isFollowing 
                            ? (relation?.isMutual ? 'follow-btn-mutual' : 'follow-btn-following')
                            : 'follow-btn-primary'
                    }
                    size="small" 
                    shape="round"
                    onClick={handleFollow}
                    loading={followLoading}
                    disabled={followLoading}
                >
                    {followLoading ? (
                        <FormattedMessage id="common.processing" defaultMessage="Processing..." />
                    ) : relation?.isFollowing ? (
                        <>
                            <CheckOutlined />
                            {relation?.isMutual ? (
                                <FormattedMessage id="user.mutual_follow" defaultMessage="Mutual" />
                            ) : (
                                <FormattedMessage id="user.following" defaultMessage="Following" />
                            )}
                        </>
                    ) : (
                        <>
                            <UserAddOutlined />
                            <FormattedMessage id="common.follow" defaultMessage="Follow" />
                        </>
                    )}
                </FollowButton>
            </UserCard>

            <ActionGroup>
                {canGenerateSameStyle && (
                <Button 
                    type="primary" 
                    className="main-btn" 
                    icon={<ThunderboltFilled />}
                    onClick={handleRemix}
                >
                    <FormattedMessage id="post.remix" defaultMessage="生成同款" />
                </Button>
                )}
                
                <Tooltip title={isLiked ? intl.formatMessage({id: 'common.unlike', defaultMessage: 'Unlike'}) : intl.formatMessage({id: 'common.like', defaultMessage: 'Like'})}>
                    <button 
                        className={`icon-btn ${isLiked ? 'active' : ''}`} 
                        onClick={handleLike}
                        style={isLiked ? { background: '#fff1f0', color: '#ff4d4f' } : {}}
                    >
                        {isLiked ? <HeartFilled /> : <HeartOutlined />}
                        <span style={{ marginLeft: 6, fontSize: 14 }}>{likeCount}</span>
                    </button>
                </Tooltip>

                <Tooltip title={isCollected ? intl.formatMessage({id: 'common.unsave', defaultMessage: 'Unsave'}) : intl.formatMessage({id: 'common.save', defaultMessage: 'Save'})}>
                    <button 
                        className={`icon-btn ${isCollected ? 'active' : ''}`} 
                        onClick={handleCollect}
                        style={isCollected ? { background: '#fffbe6', color: '#faad14' } : {}}
                    >
                        {isCollected ? <StarFilled /> : <StarOutlined />}
                    </button>
                </Tooltip>
            </ActionGroup>

            <Divider />

            {/* 2. 核心资产：Prompt / 提示词商城引导 */}
            {isPostPromptMarketLocked(post) ? (
                <PromptMarketCta>
                  <PromptMarketCtaInner>
                    <PromptMarketHeader>
                      <PromptMarketIcon>
                        <ShopOutlined />
                      </PromptMarketIcon>
                      <PromptMarketHeaderText>
                        <span className="badge">
                          <FormattedMessage id="post.promptHiddenBadge" defaultMessage="提示词商城" />
                        </span>
                        <h4>
                          <FormattedMessage
                            id="post.promptHiddenTitle"
                            defaultMessage="完整提示词已在提示词商城上架"
                          />
                        </h4>
                        <p>
                          <FormattedMessage
                            id="post.promptHiddenDesc"
                            defaultMessage="社区展示版已隐藏提示词与参数。购买后可解锁完整 Prompt，并支持一键生成同款。"
                          />
                        </p>
                      </PromptMarketHeaderText>
                    </PromptMarketHeader>

                    <PromptLockedPreview>
                      <div className="label">Prompt</div>
                      <div className="lines" aria-hidden>
                        <div className="line" />
                        <div className="line" />
                        <div className="line" />
                        <div className="line" />
                      </div>
                      <div className="lock-overlay">
                        <div className="lock-icon">
                          <LockOutlined />
                        </div>
                        <span>
                          <FormattedMessage id="post.promptHiddenLocked" defaultMessage="提示词与参数已隐藏" />
                        </span>
                      </div>
                    </PromptLockedPreview>

                    <PromptMarketFeatures>
                      <span className="feature">
                        <CheckCircleFilled />
                        <FormattedMessage id="post.promptHiddenFeaturePrompt" defaultMessage="完整 Prompt" />
                      </span>
                      <span className="feature">
                        <CheckCircleFilled />
                        <FormattedMessage id="post.promptHiddenFeatureParams" defaultMessage="生成参数" />
                      </span>
                      <span className="feature">
                        <CheckCircleFilled />
                        <FormattedMessage id="post.promptHiddenFeatureRemix" defaultMessage="生成同款" />
                      </span>
                    </PromptMarketFeatures>

                    <PromptMarketAction
                      type="primary"
                      size="large"
                      icon={<ShopOutlined />}
                      onClick={() => navigate(`/workspace/prompt-market?listingId=${post.promptMarketListingId}`)}
                    >
                      <FormattedMessage id="post.goPromptMarket" defaultMessage="前往提示词商城购买" />
                      <ArrowRightOutlined style={{ marginLeft: 6, fontSize: 13 }} />
                    </PromptMarketAction>
                  </PromptMarketCtaInner>
                </PromptMarketCta>
            ) : (
                <>
            {post.prompt && (
                <PromptBox>
                    <div className="box-header">
                        <span className="label"><FormattedMessage id="post.prompt" defaultMessage="Prompt" /></span>
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<CopyOutlined />} 
                            onClick={() => handleCopy(post.prompt)}
                        >
                            <FormattedMessage id="common.copy" defaultMessage="Copy" />
                        </Button>
                    </div>
                    <div className="content">
                        {post.prompt}
                    </div>
                </PromptBox>
            )}

            {post.negativePrompt && (
                <PromptBox>
                    <div className="box-header">
                        <span className="label"><FormattedMessage id="post.negativePrompt" defaultMessage="Negative Prompt" /></span>
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<CopyOutlined />} 
                            onClick={() => handleCopy(post.negativePrompt)}
                        >
                            <FormattedMessage id="common.copy" defaultMessage="Copy" />
                        </Button>
                    </div>
                    <div className="content" style={{ color: '#ff7875' }}>
                        {post.negativePrompt}
                    </div>
                </PromptBox>
            )}
                </>
            )}

            {/* 3. 参数与标签 */}
            {(() => {
              if (isPostPromptMarketLocked(post)) return null;
              const gen = parsePostGenerationDetails(post);
              const hasDetails = gen.modelLabel || gen.resolution || gen.steps != null || gen.cfgScale != null || gen.seed != null;
              if (!hasDetails) return null;
              return (
            <div style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 12 }}>
                    <FormattedMessage id="post.details" defaultMessage="Details" />
                </Text>
                <Row gutter={[16, 16]}>
                    {gen.modelLabel && (
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.model" defaultMessage="Model" /></Text>
                        <GlowModelName>{gen.modelLabel}</GlowModelName>
                    </Col>
                    )}
                    {gen.resolution && (
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.resolution" defaultMessage="Resolution" /></Text>
                        <div style={{ fontWeight: 500 }}>{gen.resolution}</div>
                    </Col>
                    )}
                    {gen.steps != null && (
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.steps" defaultMessage="Steps" /></Text>
                        <div style={{ fontWeight: 500 }}>{gen.steps}</div>
                    </Col>
                    )}
                    {gen.cfgScale != null && (
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.cfgScale" defaultMessage="Guidance Scale" /></Text>
                        <div style={{ fontWeight: 500 }}>{gen.cfgScale}</div>
                    </Col>
                    )}
                    {gen.seed != null && (
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.seed" defaultMessage="Seed" /></Text>
                        <div style={{ fontWeight: 500 }}>{gen.seed}</div>
                    </Col>
                    )}
                </Row>
            </div>
              );
            })()}

            {post.tags && post.tags.length > 0 && (
                <div style={{ marginTop: 24 }}>
                     <StyledTags>
                        {post.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                     </StyledTags>
                </div>
            )}
            
            <Divider />
            
            {/* 4. 统计信息 */}
            <Space size="large" style={{ color: '#888' }}>
                <span><EyeOutlined /> <FormattedMessage id="common.viewCount" defaultMessage="{count} Views" values={{count: post.viewCount}} /></span>
                <span>{new Date(post.createTime).toLocaleDateString()}</span>
            </Space>

        </SidebarSection>
      </MainContainer>
      
      <UserProfileModal
        visible={userProfileModalVisible}
        onCancel={() => setUserProfileModalVisible(false)}
        userId={post.userId}
        userNickname={post.userNickname}
        userAvatar={post.userAvatar}
      />
    </PageLayout>
  );
};

export default PostDetailPage;