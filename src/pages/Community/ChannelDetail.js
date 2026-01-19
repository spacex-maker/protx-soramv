import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message, Button, Typography, Empty, Select, Avatar, Tooltip, Tag } from 'antd';
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
import { getChannelByKey, listPosts, likePost, unlikePost, collectPost, uncollectPost, getCurrentChallenge } from 'api/community';
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

// --- Styled Components (Layout) ---

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#f8f9fa'};
  display: flex;
  flex-direction: column;
  padding-top: 60px;
  position: relative;
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
  height: 320px;
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
    background-image: url(${props => props.coverUrl});
    background-size: cover;
    background-position: center;
    filter: blur(10px) brightness(0.8);
    opacity: 0.8;
    transform: scale(1.1);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 60px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media (max-width: 768px) {
    padding: 0 20px 40px;
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
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 40px 60px;
  flex: 1;

  @media (max-width: 768px) {
    padding: 0 20px 40px;
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
`;

// --- NEW Glassmorphism Card Design ---

const ModernCard = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio (Square) - Adjust to 75% for 4:3 if preferred */
  border-radius: 16px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#222' : '#f0f2f5'};
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#333' : 'transparent'};

  /* Clickable overlay */
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
`;

const CardImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s ease;
  }

  ${ModernCard}:hover & img {
    transform: scale(1.08);
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
    bottom: 70px; /* Adjust based on Glass Height */
    right: 12px;
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
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  padding: 12px 16px;
  
  /* Glassmorphism Logic */
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.65)' 
    : 'rgba(255, 255, 255, 0.75)'};
    
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  border-top: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.4)'};
    
  transition: background 0.3s ease;
  
  ${ModernCard}:hover & {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)'};
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
  /* Optional: Text shadow for better contrast */
  text-shadow: ${props => props.theme.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'};
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .name {
    font-size: 13px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : '#444'};
    font-weight: 500;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StatsInfo = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#666'};

  span {
    display: flex;
    align-items: center;
    gap: 4px;
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

      {/* Hero Banner */}
      <HeroSection bgColor={channel.themeColor} coverUrl={channel.coverUrl}>
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
      </HeroSection>

      <Container>
        {/* Tool Bar */}
        <ToolBar>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
             <Tag color={channel.themeColor || "blue"} style={{ padding: '4px 12px', fontSize: 14 }}>
               #{channelKey}
             </Tag>
             <Text type="secondary">
               <FormattedMessage id="community.totalPosts" defaultMessage="{count} artworks" values={{ count: <b>{channel.postCount || 0}</b> }} />
             </Text>
          </div>

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

        {/* --- Art Grid --- */}
        <Row gutter={[24, 24]}>
          {posts.map((post) => {
            const isLiked = post.isLiked || false;
            const isCollected = post.isCollected || false;

            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={post.id}>
                <ModernCard onClick={() => handlePostClick(post)}>
                  
                  {/* Background Image Layer */}
                  <CardImageWrapper>
                    <img 
                      src={addTencentImageCompression(post.coverUrl || post.mediaUrls?.[0], { quality: 20 })} 
                      alt={post.title} 
                      loading="lazy"
                    />
                  </CardImageWrapper>

                  {/* Floating Action Buttons */}
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

                  {/* Glassmorphism Info Bar at Bottom */}
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
              </Col>
            );
          })}
        </Row>

        {/* Loading & Empty States */}
        {postsLoading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        )}

        {hasMore && !postsLoading && posts.length > 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Button size="large" shape="round" onClick={() => setPage(p => p + 1)} style={{ padding: '0 40px' }}>
              <FormattedMessage id="common.loadMore" defaultMessage="Explore More" />
            </Button>
          </div>
        )}

        {posts.length === 0 && !postsLoading && (
          <div style={{ padding: '60px 0' }}>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={intl.formatMessage({ id: 'community.noPosts', defaultMessage: 'No masterpieces here yet. Be the first to create!' })} 
            />
          </div>
        )}
      </Container>
    </PageLayout>
  );
};

export default ChannelDetailPage;