import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, Typography, Tabs, Avatar, Statistic, Skeleton, Spin, Divider, Empty, message, Drawer, Input, List, Tag
} from 'antd';
import { 
  FireFilled, ClockCircleOutlined, TrophyFilled, UserOutlined, 
  PlusOutlined, HeartFilled,
  ShareAltOutlined, InfoCircleOutlined, ThunderboltFilled,
  LeftOutlined, PictureOutlined, ReadOutlined, UnorderedListOutlined, SearchOutlined, CheckCircleFilled
} from '@ant-design/icons';
import styled from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { FormattedMessage, useIntl } from 'react-intl';
import { listPosts, getChallengeById, getCurrentChallenge, listAllChallenges } from 'api/community';
import SubmitChallengeModal from './SubmitChallengeModal';

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

// ------------------- Styled Components (Big Tech Design) -------------------

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f7fa'};
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding-top: 80px;
`;

const Container = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px 60px;

  @media (max-width: 768px) {
    padding: 0 16px 40px;
  }
`;

// Hero Section with blurred background
const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 24px;
  overflow: hidden;
  margin-top: 24px;
  margin-bottom: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  background: #000;

  @media (max-width: 768px) {
    height: 240px;
    border-radius: 16px;
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  
  /* 默认渐变背景 */
  background: linear-gradient(135deg, 
    #ff6b6b 0%,
    #ee5a6f 15%,
    #c44569 30%,
    #8b2f5b 45%,
    #6a1b9a 60%,
    #4a148c 75%,
    #1a237e 90%,
    #0d47a1 100%
  );
  background-size: 300% 300%;
  animation: gradientShift 15s ease infinite;
  
  /* 如果有图片，则覆盖渐变背景 */
  ${props => props.src ? `
    background-image: url(${props.src});
    background-size: cover;
    background-position: center;
    opacity: 0.9;
    filter: blur(8px) brightness(0.8);
    transform: scale(1.05);
    animation: none;
  ` : ''}
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(255, 107, 107, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 60%);
    pointer-events: none;
    animation: shimmer 10s ease-in-out infinite;
    ${props => props.src ? 'display: none;' : ''}
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.03) 50%,
      transparent 70%
    );
    background-size: 200% 200%;
    animation: shine 8s linear infinite;
    pointer-events: none;
    ${props => props.src ? 'display: none;' : ''}
  }
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  @keyframes shine {
    0% { background-position: -200% -200%; }
    100% { background-position: 200% 200%; }
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 100px;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.1);

  &.live {
    background: rgba(82, 196, 26, 0.9);
    border-color: transparent;
  }
  
  &.ended {
    background: rgba(0, 0, 0, 0.6);
  }
`;

const ChallengeTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;

  .item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 16px;
  }
`;

// Layout Grid
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  min-width: 0;
`;

const SideColumn = styled.div`
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1100px) {
    position: static;
  }
`;

// Cards
const DetailCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  
  .card-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const MarkdownContent = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  word-break: break-word;
  
  p {
    margin: 8px 0;
  }
  
  strong {
    font-weight: 700;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  }
  
  ul {
    margin: 12px 0 16px 0;
    padding-left: 28px;
    list-style: disc;
    
    li {
      margin: 6px 0;
      color: inherit;
    }
  }
`;

const PrizeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};

  &:last-child {
    border-bottom: none;
  }

  .rank {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: ${props => props.theme.mode === 'dark' ? '#222' : '#f5f5f5'};
      color: #666;
    }
    
    &.gold .icon { background: #fff1b8; color: #faad14; }
    &.silver .icon { background: #e6e6e6; color: #8c8c8c; }
    &.bronze .icon { background: #fcece3; color: #d46b08; }
  }

  .value {
    font-weight: 700;
    font-size: 16px;
  }
`;

const MasonryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const ArtCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f0f0f0'};
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  break-inside: avoid;
  border: 1px solid rgba(255,255,255,0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    
    .overlay { opacity: 1; }
  }

  &::before {
    content: '';
    display: block;
    padding-top: 100%; // Default Aspect Ratio
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 16px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 500;
    font-size: 13px;
  }

  .stats {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    padding: 4px 8px;
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
    
    &::before { border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : '#e0e0e0'}; }
  }

  .ant-tabs-tab {
    padding: 12px 0;
    margin: 0 32px 0 0;
    font-size: 16px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#666'};
    
    &:hover { color: ${props => props.theme.mode === 'dark' ? '#ccc' : '#333'}; }
    
    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
      font-weight: 600;
    }
  }
`;

// ------------------- Helper Logic -------------------
const parseRewardsConfig = (rewardsConfig) => {
  try {
    const config = JSON.parse(rewardsConfig);
    
    // 辅助函数：提取奖励值（支持数字或 {badge, tokens} 对象）
    const extractValue = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'object' && value !== null && 'tokens' in value) {
        return Number(value.tokens) || 0;
      }
      return 0;
    };
    
    return {
      first: extractValue(config['1st'] || config.first),
      second: extractValue(config['2nd'] || config.second),
      third: extractValue(config['3rd'] || config.third),
    };
  } catch (e) { 
    return { first: 0, second: 0, third: 0 }; 
  }
};

// 解析标签数组：支持数组、JSON字符串、逗号分隔字符串
const parseTags = (tags) => {
  if (!tags) return [];
  
  // 如果已经是数组，直接返回
  if (Array.isArray(tags)) {
    return tags;
  }
  
  // 如果是字符串，尝试解析
  if (typeof tags === 'string') {
    try {
      // 尝试解析 JSON 字符串
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // 如果不是 JSON，尝试按逗号分割
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
  }
  
  return [];
};

// 简单的 Markdown 转 HTML 渲染器
const renderMarkdown = (text) => {
  if (!text) return '';
  
  // 按行处理
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  let listItems = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // 检查是否是列表项（数字或星号开头）
    const isListItem = /^\s*(\d+\.|\*)\s+/.test(line);
    
    if (isListItem) {
      // 移除列表标记，处理粗体
      const content = line.replace(/^\s*(\d+\.|\*)\s+/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      listItems.push(`<li>${content}</li>`);
      inList = true;
    } else {
      // 如果之前在列表中，现在结束列表
      if (inList && listItems.length > 0) {
        result.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      
      // 处理普通行
      if (line.trim()) {
        // 处理粗体
        line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        result.push(`<p>${line}</p>`);
      } else if (result.length > 0) {
        // 空行作为段落分隔
        result.push('<br>');
      }
    }
  }
  
  // 如果最后还有未闭合的列表
  if (inList && listItems.length > 0) {
    result.push(`<ul>${listItems.join('')}</ul>`);
  }
  
  return result.join('');
};

const calculateTotalPrize = (config) => {
    const r = parseRewardsConfig(config);
    return r.first + r.second + r.third;
};

const getStatusInfo = (status, intl) => {
    switch(status) {
        case 0: return { label: intl.formatMessage({ id: 'challenge.status.upcoming', defaultMessage: 'Upcoming' }), color: '#1890ff', dot: '#1890ff' };
        case 1: return { label: intl.formatMessage({ id: 'challenge.status.live', defaultMessage: 'Live Now' }), color: '#52c41a', dot: '#52c41a' };
        case 2: return { label: intl.formatMessage({ id: 'challenge.status.voting', defaultMessage: 'Voting' }), color: '#722ed1', dot: '#722ed1' };
        case 3: return { label: intl.formatMessage({ id: 'challenge.status.ended', defaultMessage: 'Ended' }), color: '#888', dot: '#888' };
        default: return { label: intl.formatMessage({ id: 'challenge.status.unknown', defaultMessage: 'Unknown' }), color: '#888', dot: '#888' };
    }
};

const DrawerItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  background: ${props => props.active ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#e6f7ff') : 'transparent'};
  border: 1px solid ${props => props.active ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bae7ff') : 'transparent'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${props => !props.active && (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')};
    transform: translateY(-2px);
  }

  .thumb-container {
    width: 100px;
    height: 72px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    background: #333;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
  }

  &:hover .thumb-container img {
      transform: scale(1.1);
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .meta-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    
    .status-badge {
       display: flex;
       align-items: center;
       gap: 6px;
       font-size: 10px;
       font-weight: 700;
       text-transform: uppercase;
       padding: 2px 8px;
       border-radius: 100px;
       background: rgba(255,255,255,0.1);
       
       .dot {
           width: 6px;
           height: 6px;
           border-radius: 50%;
       }
    }
    
    .date {
        font-size: 11px;
        color: #888;
    }
  }

  .title {
    font-weight: 600;
    font-size: 14px;
    line-height: 1.4;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta-bottom {
     display: flex;
     align-items: center;
     gap: 12px;
     font-size: 11px;
     color: #888;
     
     .tag {
         display: flex;
         align-items: center;
         gap: 4px;
         background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
         padding: 2px 8px;
         border-radius: 4px;
     }
  }
`;

const ChallengeDetailPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { challengeId } = useParams();
  
  const [activeTab, setActiveTab] = useState('entries');
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  
  const [challenge, setChallenge] = useState(null);
  const [challengePosts, setChallengePosts] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 提交作品模态框状态
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  
  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Load list of challenges for the drawer
        listAllChallenges(50)
          .then(challenges => {
            // 清理 challenges 数据，确保没有对象字段被直接渲染
            const cleanedChallenges = Array.isArray(challenges) ? challenges.map(item => ({
              id: item.id,
              title: typeof item.title === 'string' ? item.title : '',
              description: typeof item.description === 'string' ? item.description : undefined,
              coverUrl: typeof item.coverUrl === 'string' ? item.coverUrl : undefined,
              requiredTags: typeof item.requiredTags === 'string' ? item.requiredTags : undefined,
              requiredModel: typeof item.requiredModel === 'string' ? item.requiredModel : undefined,
              referenceImageUrl: typeof item.referenceImageUrl === 'string' ? item.referenceImageUrl : undefined,
              startTime: typeof item.startTime === 'string' ? item.startTime : '',
              endTime: typeof item.endTime === 'string' ? item.endTime : '',
              votingEndTime: typeof item.votingEndTime === 'string' ? item.votingEndTime : '',
              rewardsConfig: typeof item.rewardsConfig === 'string' ? item.rewardsConfig : undefined,
              status: Number(item.status) || 0,
              createTime: typeof item.createTime === 'string' ? item.createTime : '',
            })) : [];
            setAllChallenges(cleanedChallenges);
          })
          .catch(console.error);
        
        let data;
        if (challengeId) data = await getChallengeById(Number(challengeId));
        else data = await getCurrentChallenge();
        
        // 清理 challenge 数据，确保没有对象字段被直接渲染
        if (data) {
          const cleanedChallenge = {
            id: data.id,
            title: typeof data.title === 'string' ? data.title : '',
            description: typeof data.description === 'string' ? data.description : undefined,
            coverUrl: typeof data.coverUrl === 'string' ? data.coverUrl : undefined,
            requiredTags: typeof data.requiredTags === 'string' ? data.requiredTags : undefined,
            requiredModel: typeof data.requiredModel === 'string' ? data.requiredModel : undefined,
            referenceImageUrl: typeof data.referenceImageUrl === 'string' ? data.referenceImageUrl : undefined,
            startTime: typeof data.startTime === 'string' ? data.startTime : '',
            endTime: typeof data.endTime === 'string' ? data.endTime : '',
            votingEndTime: typeof data.votingEndTime === 'string' ? data.votingEndTime : '',
            rewardsConfig: typeof data.rewardsConfig === 'string' ? data.rewardsConfig : undefined,
            status: Number(data.status) || 0,
            createTime: typeof data.createTime === 'string' ? data.createTime : '',
          };
          setChallenge(cleanedChallenge);
        } else {
          setChallenge(null);
        }
      } catch(e) { 
        message.error(intl.formatMessage({ id: 'community.challenge.loadFailed', defaultMessage: 'Failed to load challenge data' })); 
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [challengeId]);

  // Load Posts when Challenge is ready
  useEffect(() => {
    if(challenge?.id) {
      setPostsLoading(true);
      listPosts({ challengeId: challenge.id, page: 1, pageSize: 50, sortBy: 'latest' })
        .then(data => {
          // 确保返回的是数组，并清理数据
          const posts = Array.isArray(data) ? data : [];
          // 确保每个 post 的 mediaUrls 是数组，并清理所有对象字段
          const cleanedPosts = posts.map(post => {
            let mediaUrls = [];
            if (Array.isArray(post.mediaUrls)) {
              mediaUrls = post.mediaUrls;
            } else if (typeof post.mediaUrls === 'string') {
              try {
                const parsed = JSON.parse(post.mediaUrls);
                mediaUrls = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                mediaUrls = [];
              }
            }
            
            // 清理所有可能包含对象的字段，确保它们不会被直接渲染
            const cleanedPost = {
              id: post.id,
              userId: post.userId,
              userNickname: typeof post.userNickname === 'string' ? post.userNickname : '',
              userAvatar: typeof post.userAvatar === 'string' ? post.userAvatar : undefined,
              title: typeof post.title === 'string' ? post.title : '',
              mediaType: post.mediaType,
              mediaUrls,
              coverUrl: typeof post.coverUrl === 'string' ? post.coverUrl : undefined,
              prompt: typeof post.prompt === 'string' ? post.prompt : undefined,
              negativePrompt: typeof post.negativePrompt === 'string' ? post.negativePrompt : undefined,
              modelKey: typeof post.modelKey === 'string' ? post.modelKey : undefined,
              generationParams: typeof post.generationParams === 'string' ? post.generationParams : undefined,
              viewCount: Number(post.viewCount) || 0,
              likeCount: Number(post.likeCount) || 0,
              commentCount: Number(post.commentCount) || 0,
              collectCount: Number(post.collectCount) || 0,
              status: Number(post.status) || 0,
              isFeatured: Boolean(post.isFeatured),
              channelId: post.channelId,
              channelName: typeof post.channelName === 'string' ? post.channelName : undefined,
              isChallengeEntry: Boolean(post.isChallengeEntry),
              challengeId: post.challengeId,
              challengeScore: post.challengeScore ? Number(post.challengeScore) : undefined,
              isLiked: Boolean(post.isLiked),
              isCollected: Boolean(post.isCollected),
              tags: Array.isArray(post.tags) ? post.tags : [],
              createTime: typeof post.createTime === 'string' ? post.createTime : '',
            };
            
            return cleanedPost;
          });
          setChallengePosts(cleanedPosts);
        })
        .catch(console.error)
        .finally(() => setPostsLoading(false));
    }
  }, [challenge?.id]);

  const handleJoin = () => {
    if (!challenge) return;
    setSubmitModalVisible(true);
  };

  const handleSubmitSuccess = () => {
    // 提交成功后，重新加载帖子列表
    if (challenge?.id) {
      setPostsLoading(true);
      listPosts({ challengeId: challenge.id, page: 1, pageSize: 50, sortBy: 'latest' })
        .then(data => {
          const posts = Array.isArray(data) ? data : [];
          const cleanedPosts = posts.map(post => {
            let mediaUrls = [];
            if (Array.isArray(post.mediaUrls)) {
              mediaUrls = post.mediaUrls;
            } else if (typeof post.mediaUrls === 'string') {
              try {
                const parsed = JSON.parse(post.mediaUrls);
                mediaUrls = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                mediaUrls = [];
              }
            }
            
            const cleanedPost = {
              id: post.id,
              userId: post.userId,
              userNickname: typeof post.userNickname === 'string' ? post.userNickname : '',
              userAvatar: typeof post.userAvatar === 'string' ? post.userAvatar : undefined,
              title: typeof post.title === 'string' ? post.title : '',
              mediaType: post.mediaType,
              mediaUrls,
              coverUrl: typeof post.coverUrl === 'string' ? post.coverUrl : undefined,
              prompt: typeof post.prompt === 'string' ? post.prompt : undefined,
              negativePrompt: typeof post.negativePrompt === 'string' ? post.negativePrompt : undefined,
              modelKey: typeof post.modelKey === 'string' ? post.modelKey : undefined,
              generationParams: typeof post.generationParams === 'string' ? post.generationParams : undefined,
              viewCount: Number(post.viewCount) || 0,
              likeCount: Number(post.likeCount) || 0,
              commentCount: Number(post.commentCount) || 0,
              collectCount: Number(post.collectCount) || 0,
              status: Number(post.status) || 0,
              isFeatured: Boolean(post.isFeatured),
              channelId: post.channelId,
              channelName: typeof post.channelName === 'string' ? post.channelName : undefined,
              isChallengeEntry: Boolean(post.isChallengeEntry),
              challengeId: post.challengeId,
              challengeScore: post.challengeScore ? Number(post.challengeScore) : undefined,
              isLiked: Boolean(post.isLiked),
              isCollected: Boolean(post.isCollected),
              tags: Array.isArray(post.tags) ? post.tags : [],
              createTime: typeof post.createTime === 'string' ? post.createTime : '',
            };
            
            return cleanedPost;
          });
          setChallengePosts(cleanedPosts);
        })
        .catch(console.error)
        .finally(() => setPostsLoading(false));
    }
  };

  if (loading || !challenge) {
    return (
      <PageWrapper>
        <SimpleHeader />
        <Container>
          <Skeleton active paragraph={{rows: 10}} style={{marginTop: 40}} />
        </Container>
      </PageWrapper>
    );
  }

  const rewards = parseRewardsConfig(challenge.rewardsConfig);
  const totalPrize = rewards.first + rewards.second + rewards.third;
  const deadline = new Date(challenge.endTime).getTime();
  const startTime = new Date(challenge.startTime).getTime();
  const votingEndTime = challenge.votingEndTime ? new Date(challenge.votingEndTime).getTime() : deadline;
  const now = Date.now();
  
  // 状态判断：优先使用时间判断，如果时间符合就不判断status字段
  // 0=未开始, 1=进行中, 2=评审中, 3=已结束
  const isNotStarted = now < startTime;
  const isOngoing = now >= startTime && now < deadline;
  const isVoting = now >= deadline && now < votingEndTime;
  const isEnded = now >= votingEndTime;
  const timeLeft = Math.max(0, deadline - now);
  
  const filteredNav = allChallenges.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <PageWrapper>
      <SimpleHeader />
      
      <Container>
        {/* Navigation Breadcrumb-ish */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/community')} style={{ marginBottom: 0, marginLeft: -16 }}>
              <FormattedMessage id="common.backToCommunity" defaultMessage="Back to Community" />
            </Button>
            <Button type="default" icon={<UnorderedListOutlined />} onClick={() => setDrawerVisible(true)}>
              <FormattedMessage id="challenge.allChallenges" defaultMessage="All Challenges" />
            </Button>
        </div>

        {/* 1. Hero Header */}
        <HeroSection>
          <HeroBackground src={challenge.coverUrl} />
          <HeroContent>
            <div>
              <StatusBadge className={isOngoing ? 'live' : isEnded ? 'ended' : ''}>
                 {isOngoing && <FireFilled />} 
                 {isNotStarted ? (
                    <FormattedMessage id="challenge.status.upcoming" defaultMessage="Upcoming" />
                 ) : isOngoing ? (
                    <FormattedMessage id="challenge.status.live" defaultMessage="Live Now" />
                 ) : isVoting ? (
                    <FormattedMessage id="challenge.status.voting" defaultMessage="Voting Phase" />
                 ) : (
                    <FormattedMessage id="challenge.status.ended" defaultMessage="Ended" />
                 )}
              </StatusBadge>
              <ChallengeTitle>{challenge.title}</ChallengeTitle>
              <MetaRow>
                <div className="item">
                  <ClockCircleOutlined /> 
                  {new Date(challenge.startTime).toLocaleDateString()} - {new Date(challenge.endTime).toLocaleDateString()}
                </div>
                {challenge.requiredModel && (
                  <div className="item">
                    <ThunderboltFilled /> {challenge.requiredModel}
                  </div>
                )}
                <div className="item">
                   <UserOutlined /> <FormattedMessage id="challenge.entriesCount" defaultMessage="{count} Entries" values={{count: challengePosts.length}} />
                </div>
              </MetaRow>
            </div>
          </HeroContent>
        </HeroSection>

        {/* 2. Main Content Grid */}
        <ContentGrid>
          {/* LEFT: Tabs & Grid */}
          <MainColumn>
            <StyledTabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                   key: 'entries',
                   label: <span><PictureOutlined /> <FormattedMessage id="challenge.tab.submissions" defaultMessage="Submissions" /></span>,
                   children: (
                     <>
                       {postsLoading ? (
                         <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                       ) : challengePosts.length > 0 ? (
                         <MasonryGrid>
                            {challengePosts.map(post => {
                                // 安全获取图片URL
                                const imageUrl = post.coverUrl || (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 ? post.mediaUrls[0] : '');
                                const likeCount = post.likeCount || 0;
                                
                                return (
                                    <ArtCard key={post.id} onClick={() => navigate(`/community/post/${post.id}`)}>
                                        {imageUrl && <img src={imageUrl} loading="lazy" alt={post.title || ''} />}
                                        <div className="stats">
                                            <HeartFilled /> {likeCount}
                                        </div>
                                        <div className="overlay">
                                            <div className="user-info">
                                                <Avatar src={post.userAvatar} size={24} />
                                                <span>{post.userNickname || ''}</span>
                                            </div>
                                        </div>
                                    </ArtCard>
                                );
                            })}
                         </MasonryGrid>
                       ) : (
                         <Empty description={<FormattedMessage id="challenge.noEntries" defaultMessage="No entries yet. Be the first!" />} />
                       )}
                     </>
                   )
                },
                {
                   key: 'details',
                   label: <span><ReadOutlined /> <FormattedMessage id="challenge.tab.rules" defaultMessage="Rules & Info" /></span>,
                   children: (
                     <DetailCard>
                        <Title level={4}><FormattedMessage id="common.description" defaultMessage="Description" /></Title>
                        <MarkdownContent dangerouslySetInnerHTML={{ __html: renderMarkdown(challenge.description) }} />
                        
                        <Divider />
                        
                        <Title level={4}><FormattedMessage id="challenge.requirements" defaultMessage="Requirements" /></Title>
                        <ul style={{ lineHeight: 2, fontSize: 15 }}>
                           <li><FormattedMessage id="challenge.req.original" defaultMessage="Original creations only." /></li>
                           {challenge.requiredModel && <li><FormattedMessage id="challenge.req.model" defaultMessage="Must use model: {model}" values={{model: <strong>{challenge.requiredModel}</strong>}} /></li>}
                           {challenge.requiredTags && (() => {
                             const tags = parseTags(challenge.requiredTags);
                             return (
                               <li style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                 <span><FormattedMessage id="challenge.req.tags" defaultMessage="Must include tags:" /></span>
                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 0 }}>
                                   {tags.map((tag, index) => (
                                     <Tag 
                                       key={index} 
                                       color="processing" 
                                       style={{ 
                                         margin: 0,
                                         borderRadius: 4,
                                         fontSize: 13,
                                         padding: '2px 8px',
                                         lineHeight: '20px'
                                       }}
                                     >
                                       {tag}
                                     </Tag>
                                   ))}
                                 </div>
                               </li>
                             );
                           })()}
                           <li><FormattedMessage id="challenge.req.resolution" defaultMessage="Resolution must be at least 1024x1024." /></li>
                           <li><FormattedMessage id="challenge.req.nsfw" defaultMessage="No NSFW content." /></li>
                        </ul>
                     </DetailCard>
                   )
                }
              ]} 
            />
          </MainColumn>

          {/* RIGHT: Sidebar */}
          <SideColumn>
             {/* Action Card */}
             <DetailCard>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                   <div style={{ fontSize: 14, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                      {isNotStarted ? (
                          <FormattedMessage id="challenge.startsIn" defaultMessage="Starts In" />
                      ) : (
                          <FormattedMessage id="challenge.timeRemaining" defaultMessage="Time Remaining" />
                      )}
                   </div>
                   {isNotStarted ? (
                      <Countdown value={startTime} format="D[d] H[h] m[m] s[s]" valueStyle={{ fontSize: 32, fontWeight: 700 }} />
                   ) : isOngoing ? (
                      <Countdown value={deadline} format="D[d] H[h] m[m] s[s]" valueStyle={{ fontSize: 32, fontWeight: 700 }} />
                   ) : (
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                          <FormattedMessage id="challenge.closed" defaultMessage="Challenge Closed" />
                      </div>
                   )}
                </div>

                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  shape="round"
                  style={{ height: 50, fontSize: 16, fontWeight: 600 }}
                  icon={<PlusOutlined />}
                  onClick={handleJoin}
                  disabled={!isOngoing || isNotStarted}
                >
                  {isNotStarted ? (
                      <FormattedMessage id="challenge.notStarted" defaultMessage="Challenge Not Started" />
                  ) : isOngoing ? (
                      <FormattedMessage id="challenge.submitEntry" defaultMessage="Submit Entry" />
                  ) : (
                      <FormattedMessage id="challenge.viewWinners" defaultMessage="View Winners" />
                  )}
                </Button>
                
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                       <InfoCircleOutlined /> <FormattedMessage id="challenge.readRulesTip" defaultMessage="Read the rules before submitting" />
                    </Text>
                </div>
             </DetailCard>

             {/* Prizes Card */}
             <DetailCard>
                <div className="card-title"><TrophyFilled style={{color:'#faad14'}} /> <FormattedMessage id="challenge.prizePool" defaultMessage="Prize Pool" /></div>
                <div style={{ marginBottom: 24, textAlign: 'center', background: 'rgba(250, 173, 20, 0.1)', padding: 16, borderRadius: 12, border: '1px solid rgba(250, 173, 20, 0.2)' }}>
                    <div style={{ fontSize: 12, color: '#d48806', textTransform: 'uppercase', fontWeight: 700 }}>
                        <FormattedMessage id="challenge.totalValue" defaultMessage="Total Value" />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#d46b08' }}>{totalPrize.toLocaleString()} <span style={{fontSize:14}}>PTS</span></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                   <PrizeItem className="gold">
                      <div className="rank">
                         <div className="icon"><TrophyFilled /></div>
                         <span><FormattedMessage id="challenge.rank.1st" defaultMessage="1st Place" /></span>
                      </div>
                      <div className="value">{rewards.first}</div>
                   </PrizeItem>
                   <PrizeItem className="silver">
                      <div className="rank">
                         <div className="icon">2</div>
                         <span><FormattedMessage id="challenge.rank.2nd" defaultMessage="2nd Place" /></span>
                      </div>
                      <div className="value">{rewards.second}</div>
                   </PrizeItem>
                   <PrizeItem className="bronze">
                      <div className="rank">
                         <div className="icon">3</div>
                         <span><FormattedMessage id="challenge.rank.3rd" defaultMessage="3rd Place" /></span>
                      </div>
                      <div className="value">{rewards.third}</div>
                   </PrizeItem>
                </div>
             </DetailCard>
             
             {/* Stats/Share */}
             <DetailCard>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                     <span style={{fontWeight:600}}><FormattedMessage id="challenge.share" defaultMessage="Share Challenge" /></span>
                     <Button icon={<ShareAltOutlined />} shape="circle" />
                 </div>
             </DetailCard>

          </SideColumn>
        </ContentGrid>
      </Container>
      
      {/* Navigation Drawer */}
      <Drawer
        title={<Input prefix={<SearchOutlined />} placeholder={intl.formatMessage({ id: 'common.search', defaultMessage: 'Search...' })} bordered={false} onChange={e => setSearchTerm(e.target.value)} style={{fontSize: 16, padding: '8px 0'}} />}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={420}
        styles={{
            header: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
            body: { padding: 16 }
        }}
      >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredNav.map(item => {
                  const statusInfo = getStatusInfo(item.status, intl);
                  const totalPrize = calculateTotalPrize(item.rewardsConfig);
                  
                  return (
                      <DrawerItem key={item.id} active={item.id === challenge.id} onClick={() => { navigate(`/community/challenge/${item.id}`); setDrawerVisible(false); }}>
                          <div className="thumb-container">
                              <img src={item.coverUrl} alt={item.title} />
                          </div>
                          
                          <div className="info">
                              <div className="meta-top">
                                  <div className="status-badge" style={{color: statusInfo.color, background: `${statusInfo.color}15`}}>
                                      <div className="dot" style={{background: statusInfo.dot}} />
                                      {statusInfo.label}
                                  </div>
                                  <div className="date">
                                     {new Date(item.endTime).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                  </div>
                              </div>
                              
                              <div className="title" title={item.title}>#{item.id} {item.title}</div>
                              
                              <div className="meta-bottom">
                                  {totalPrize > 0 && (
                                      <div className="tag">
                                          <TrophyFilled style={{color:'#faad14'}} /> {totalPrize.toLocaleString()}
                                      </div>
                                  )}
                                  {item.requiredModel && (
                                      <div className="tag">
                                          <ThunderboltFilled style={{color: '#1890ff'}} /> {item.requiredModel}
                                      </div>
                                  )}
                              </div>
                          </div>
                          
                          {item.id === challenge.id && (
                              <div style={{position:'absolute', right: 12, top: '50%', transform: 'translateY(-50%)'}}>
                                  <CheckCircleFilled style={{color: '#1890ff', fontSize: 18}} />
                              </div>
                          )}
                      </DrawerItem>
                  );
              })}
              
              {filteredNav.length === 0 && (
                  <Empty description={<FormattedMessage id="challenge.noChallenges" defaultMessage="No challenges found" />} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
          </div>
      </Drawer>

      {/* 提交作品模态框 */}
      <SubmitChallengeModal
        open={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        onSuccess={handleSubmitSuccess}
        challenge={challenge}
      />
    </PageWrapper>
  );
};

export default ChallengeDetailPage;
