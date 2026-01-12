import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin, message, Button, Image, Typography, Empty } from 'antd';
import { HeartOutlined, HeartFilled, StarOutlined, StarFilled, EyeOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { getChannelByKey, listPosts, CommunityPost, getCurrentChallenge } from 'api/community';
import { likePost, unlikePost, collectPost, uncollectPost, getPostInteractionStatus } from 'api/community';
import UserRoleCard from 'components/community/UserRoleCard';

const { Title, Text } = Typography;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#f5f5f5'};
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  position: relative;
`;

const UserCardWrapper = styled.div`
  position: fixed;
  top: 90px;
  right: 40px;
  z-index: 100;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    top: 70px;
    right: 20px;
  }
`;

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
`;

const ChannelHeader = styled.div`
  margin-bottom: 40px;
  padding: 40px;
  border-radius: 16px;
  background: ${props => props.bgColor || '#1890ff'};
  color: #fff;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(${props => props.coverUrl});
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    filter: blur(20px);
  }
  
  .content {
    position: relative;
    z-index: 1;
  }
`;

const PostCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .ant-card-cover {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    &:hover .overlay {
      opacity: 1;
    }
  }
  
  .ant-card-body {
    padding: 16px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  
  .stat-item {
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
  const [interactions, setInteractions] = useState({});

  useEffect(() => {
    if (channelKey) {
      // 如果是每日挑战频道，重定向到挑战页面
      if (channelKey === 'daily-challenge') {
        const redirectToCurrentChallenge = async () => {
          try {
            // 获取当前挑战，然后跳转到对应的挑战页面
            const currentChallenge = await getCurrentChallenge();
            if (currentChallenge && currentChallenge.id) {
              navigate(`/community/challenge/${currentChallenge.id}`, { replace: true });
            } else {
              // 如果没有当前挑战，跳转到最新挑战
              navigate('/community/challenge', { replace: true });
            }
          } catch (error) {
            // 如果获取失败，跳转到最新挑战（不带ID，让页面自己处理）
            navigate('/community/challenge', { replace: true });
          }
        };
        redirectToCurrentChallenge();
        return;
      }
      fetchChannel();
    }
  }, [channelKey, navigate]);

  // 当频道加载完成后，重置分页并加载第一页
  useEffect(() => {
    if (channel?.id) {
      setPage(1);
      setPosts([]);
      setHasMore(true);
    }
  }, [channel?.id]);

  // 当频道或页码变化时，加载帖子列表
  useEffect(() => {
    if (channel?.id) {
      fetchPosts();
    }
  }, [channel?.id, page]);

  const fetchChannel = async () => {
    setLoading(true);
    try {
      const data = await getChannelByKey(channelKey);
      setChannel(data);
    } catch (error) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: 'Load failed' }));
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    // 确保频道已加载
    if (!channel?.id) {
      return;
    }
    
    setPostsLoading(true);
    try {
      const data = await listPosts({
        channelId: channel.id,
        page,
        pageSize: 20,
        sortBy: 'latest',
      });
      
      if (page === 1) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 20);
      
      // 加载交互状态
      data.forEach(post => {
        loadInteractionStatus(post.id);
      });
    } catch (error) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: 'Load failed' }));
    } finally {
      setPostsLoading(false);
    }
  };

  const loadInteractionStatus = async (postId) => {
    try {
      const status = await getPostInteractionStatus(postId);
      setInteractions(prev => ({
        ...prev,
        [postId]: status,
      }));
    } catch (error) {
      // 忽略错误，可能是未登录
    }
  };

  const handleLike = async (postId) => {
    try {
      const interaction = interactions[postId];
      const response = interaction?.isLiked
        ? await unlikePost(postId)
        : await likePost(postId);
      
      setInteractions(prev => ({
        ...prev,
        [postId]: response,
      }));
      
      // 更新本地状态
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likeCount: response.likesCount,
            isLiked: response.isLiked,
          };
        }
        return post;
      }));
    } catch (error) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: 'Operation failed' }));
    }
  };

  const handleCollect = async (postId) => {
    try {
      const interaction = interactions[postId];
      const response = interaction?.isCollected
        ? await uncollectPost(postId)
        : await collectPost(postId);
      
      setInteractions(prev => ({
        ...prev,
        [postId]: response,
      }));
      
      // 更新本地状态
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            collectCount: response.collectsCount,
            isCollected: response.isCollected,
          };
        }
        return post;
      }));
    } catch (error) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: 'Operation failed' }));
    }
  };

  const handlePostClick = (post) => {
    navigate(`/community/post/${post.id}`);
  };

  const handleLoadMore = () => {
    if (hasMore && !postsLoading) {
      setPage(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <SimpleHeader />
        <Container>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (!channel) {
    return (
      <PageLayout>
        <SimpleHeader />
        <Container>
          <Empty description={intl.formatMessage({ id: 'common.notFound', defaultMessage: '频道不存在' })} />
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SimpleHeader />

      <Container>
        {/* 用户信息卡片 - 浮动在右上角 */}
        <UserCardWrapper>
          <UserRoleCard showRoles={true} maxRoleDisplay={1} />
        </UserCardWrapper>

        <ChannelHeader bgColor={channel.themeColor} coverUrl={channel.coverUrl}>
          <div className="content">
            <Title level={1} style={{ color: '#fff', marginBottom: 12 }}>
              {channel.name}
            </Title>
            {channel.description && (
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                {channel.description}
              </Text>
            )}
          </div>
        </ChannelHeader>

      <Row gutter={[24, 24]}>
        {posts.map((post) => {
          const interaction = interactions[post.id] || {};
          const isLiked = interaction.isLiked || post.isLiked;
          const isCollected = interaction.isCollected || post.isCollected;
          const likeCount = interaction.likesCount ?? post.likeCount;
          const collectCount = interaction.collectsCount ?? post.collectCount;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
              <PostCard
                cover={
                  <div onClick={() => handlePostClick(post)}>
                    <img src={post.coverUrl || post.mediaUrls[0]} alt={post.title} />
                    <div className="overlay">
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePostClick(post);
                        }}
                      />
                    </div>
                  </div>
                }
              >
                {post.title && (
                  <Title level={5} ellipsis style={{ marginBottom: 8 }}>
                    {post.title}
                  </Title>
                )}
                <StatsRow>
                  <div className="stat-item">
                    <Button
                      type="text"
                      size="small"
                      icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                      onClick={() => handleLike(post.id)}
                    >
                      {likeCount}
                    </Button>
                  </div>
                  <div className="stat-item">
                    <Button
                      type="text"
                      size="small"
                      icon={isCollected ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={() => handleCollect(post.id)}
                    >
                      {collectCount}
                    </Button>
                  </div>
                  <div className="stat-item">
                    <EyeOutlined /> {post.viewCount}
                  </div>
                </StatsRow>
              </PostCard>
            </Col>
          );
        })}
      </Row>

      {postsLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      )}

      {hasMore && !postsLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Button onClick={handleLoadMore}>
            <FormattedMessage id="common.loadMore" defaultMessage="Load More" />
          </Button>
        </div>
      )}

      {posts.length === 0 && !postsLoading && (
        <Empty description={intl.formatMessage({ id: 'community.noPosts', defaultMessage: 'No posts yet' })} />
      )}
      </Container>
    </PageLayout>
  );
};

export default ChannelDetailPage;

