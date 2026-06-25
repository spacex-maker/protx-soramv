import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar, Button, Empty, Image, Popconfirm, Spin, Tabs, Tooltip, message } from 'antd';
import Masonry from 'react-masonry-css';
import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  HeartFilled,
  HeartOutlined,
  HistoryOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import {
  clearMyViewHistory,
  listMyInteractionPosts,
  listMyViewHistory,
  removeMyViewHistory,
  uncollectPost,
  unlikePost,
} from 'api/community';
import { addTencentImageCompression, getPostCardSpecs } from './ChallengeDetailPage/utils';
import { buildPostDetailPath } from 'utils/communityPostRoutes';

const HEADER_OFFSET = 72;
const HEADER_OFFSET_MOBILE = 60;

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  padding-top: ${HEADER_OFFSET}px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#0a0a0a' : '#f5f7fa')};

  @media (max-width: 768px) {
    padding-top: ${HEADER_OFFSET_MOBILE}px;
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px 48px;

  @media (max-width: 768px) {
    padding: 16px 12px 32px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 20px;

  h1 {
    margin: 0 0 16px;
    font-size: 28px;
    font-weight: 700;
    color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#1f1f1f')};
  }

  .ant-tabs-nav {
    margin-bottom: 0 !important;
  }
`;

const MasonryGridWrap = styled.div`
  .masonry-grid {
    display: flex;
    margin-left: -16px;
    width: auto;
  }

  .masonry-grid_column {
    padding-left: 16px;
    background-clip: padding-box;
  }

  .masonry-grid_column > div {
    margin-bottom: 16px;
  }
`;

const PostCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#262626' : '#eee')};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .cover {
    position: relative;

    .ant-image,
    .ant-image-img {
      width: 100%;
      display: block;
    }
  }

  .body {
    padding: 12px 14px 14px;
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  .title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#1f1f1f')};
  }

  .spec-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .spec-chip {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 999px;
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')};
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)')};
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .user {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;

    .name {
      font-size: 12px;
      color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)')};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }

  .viewed-at {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 8px;
    font-size: 11px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)')};
  }
`;

const ActionBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;

  &.active {
    background: rgba(255, 255, 255, 0.92);
    color: ${(p) => p.$activeColor || '#ff4d4f'};
  }

  &:hover {
    transform: scale(1.05);
  }
`;

const ListToolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const breakpointColumnsObj = {
  default: 4,
  1200: 3,
  768: 2,
  480: 1,
};

const InteractionPostList = ({ interactionType }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const isCollect = interactionType === 'collect';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await listMyInteractionPosts({
        type: interactionType,
        page: pageNum,
        pageSize: 20,
      });
      setPosts((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length === 20);
    } catch (error) {
      message.error(error?.message || intl.formatMessage({ id: 'community.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [interactionType, intl]);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore || posts.length === 0) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, posts.length]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, true);
    }
  }, [page, fetchPosts]);

  const handleToggleInteraction = async (post, e) => {
    e.stopPropagation();
    try {
      if (isCollect) {
        await uncollectPost(post.id);
      } else {
        await unlikePost(post.id);
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      message.success(
        intl.formatMessage({
          id: isCollect ? 'community.myCollected.removed' : 'community.myLiked.removed',
          defaultMessage: isCollect ? '已取消收藏' : '已取消喜欢',
        })
      );
    } catch (error) {
      message.error(error?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    }
  };

  const getCoverUrl = (post) => addTencentImageCompression(post.coverUrl || post.mediaUrls?.[0], { quality: 24 });

  if (loading && posts.length === 0) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  if (posts.length === 0) {
    return (
      <Empty
        description={
          <FormattedMessage
            id={isCollect ? 'community.myCollected.empty' : 'community.myLiked.empty'}
            defaultMessage={isCollect ? '还没有收藏任何作品' : '还没有喜欢任何作品'}
          />
        }
      >
        <Button type="primary" onClick={() => navigate('/community')}>
          <FormattedMessage id="community.exploreNow" defaultMessage="去社区逛逛" />
        </Button>
      </Empty>
    );
  }

  return (
    <>
      <MasonryGridWrap>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {posts.map((post) => {
            const specs = getPostCardSpecs(post);
            return (
              <PostCard key={post.id} onClick={() => navigate(buildPostDetailPath(post))}>
                <div className="cover">
                  <Image src={getCoverUrl(post)} alt={post.title} preview={false} />
                  <Tooltip
                    title={
                      isCollect
                        ? intl.formatMessage({ id: 'community.post.uncollect', defaultMessage: '取消收藏' })
                        : intl.formatMessage({ id: 'community.myLiked.unlike', defaultMessage: '取消喜欢' })
                    }
                  >
                    <ActionBtn
                      type="button"
                      className="active"
                      $activeColor={isCollect ? '#faad14' : '#ff4d4f'}
                      onClick={(e) => handleToggleInteraction(post, e)}
                    >
                      {isCollect ? <StarFilled /> : <HeartFilled />}
                    </ActionBtn>
                  </Tooltip>
                </div>
                <div className="body">
                  <div className="title-row">
                    <h3 className="title">
                      {post.title || intl.formatMessage({ id: 'post.untitled', defaultMessage: '未命名作品' })}
                    </h3>
                    <ArrowRightOutlined style={{ fontSize: 10, flexShrink: 0, opacity: 0.45 }} />
                  </div>
                  {specs.length > 0 && (
                    <div className="spec-row">
                      {specs.map((spec) => (
                        <span key={`${post.id}-${spec.key}`} className="spec-chip">{spec.value}</span>
                      ))}
                    </div>
                  )}
                  <div className="meta">
                    <div className="user">
                      <Avatar size={20} src={post.userAvatar} icon={<UserOutlined />} />
                      <span className="name">{post.userNickname || 'Anonymous'}</span>
                    </div>
                    <div className="stats">
                      <span><HeartFilled style={{ fontSize: 10 }} /> {post.likeCount || 0}</span>
                      <span><EyeOutlined style={{ fontSize: 10 }} /> {post.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              </PostCard>
            );
          })}
        </Masonry>
      </MasonryGridWrap>
      {hasMore && (
        <>
          <div ref={loadMoreRef} style={{ height: 1 }} aria-hidden />
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            {loadingMore ? <Spin /> : (
              <Button shape="round" onClick={() => setPage((p) => p + 1)}>
                <FormattedMessage id="common.loadMore" defaultMessage="加载更多" />
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
};

const formatViewedAt = (value) => {
  if (!value) return '';
  const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const ViewHistoryPostList = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await listMyViewHistory({
        page: pageNum,
        pageSize: 20,
      });
      setPosts((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length === 20);
    } catch (error) {
      message.error(error?.message || intl.formatMessage({ id: 'community.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [intl]);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore || posts.length === 0) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, posts.length]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, true);
    }
  }, [page, fetchPosts]);

  const handleRemoveHistory = async (post, e) => {
    e.stopPropagation();
    try {
      await removeMyViewHistory(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      message.success(
        intl.formatMessage({ id: 'community.myHistory.removed', defaultMessage: '已移除浏览记录' })
      );
    } catch (error) {
      message.error(error?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearMyViewHistory();
      setPosts([]);
      setHasMore(false);
      message.success(
        intl.formatMessage({ id: 'community.myHistory.cleared', defaultMessage: '已清空浏览记录' })
      );
    } catch (error) {
      message.error(error?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setClearing(false);
    }
  };

  const getCoverUrl = (post) => addTencentImageCompression(post.coverUrl || post.mediaUrls?.[0], { quality: 24 });

  if (loading && posts.length === 0) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  if (posts.length === 0) {
    return (
      <Empty
        description={
          <FormattedMessage
            id="community.myHistory.empty"
            defaultMessage="还没有浏览记录"
          />
        }
      >
        <Button type="primary" onClick={() => navigate('/community')}>
          <FormattedMessage id="community.exploreNow" defaultMessage="去社区逛逛" />
        </Button>
      </Empty>
    );
  }

  return (
    <>
      <ListToolbar>
        <Popconfirm
          title={intl.formatMessage({
            id: 'community.myHistory.clearConfirm',
            defaultMessage: '确定清空全部浏览记录吗？',
          })}
          okText={intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' })}
          cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
          onConfirm={handleClearAll}
        >
          <Button danger loading={clearing} icon={<DeleteOutlined />}>
            <FormattedMessage id="community.myHistory.clearAll" defaultMessage="清空浏览记录" />
          </Button>
        </Popconfirm>
      </ListToolbar>
      <MasonryGridWrap>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {posts.map((post) => {
            const specs = getPostCardSpecs(post);
            return (
              <PostCard key={post.id} onClick={() => navigate(buildPostDetailPath(post))}>
                <div className="cover">
                  <Image src={getCoverUrl(post)} alt={post.title} preview={false} />
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'community.myHistory.remove',
                      defaultMessage: '移除浏览记录',
                    })}
                  >
                    <ActionBtn type="button" onClick={(e) => handleRemoveHistory(post, e)}>
                      <DeleteOutlined />
                    </ActionBtn>
                  </Tooltip>
                </div>
                <div className="body">
                  {post.viewedAt && (
                    <div className="viewed-at">
                      <ClockCircleOutlined />
                      <FormattedMessage
                        id="community.myHistory.viewedAt"
                        defaultMessage="浏览于 {time}"
                        values={{ time: formatViewedAt(post.viewedAt) }}
                      />
                    </div>
                  )}
                  <div className="title-row">
                    <h3 className="title">
                      {post.title || intl.formatMessage({ id: 'post.untitled', defaultMessage: '未命名作品' })}
                    </h3>
                    <ArrowRightOutlined style={{ fontSize: 10, flexShrink: 0, opacity: 0.45 }} />
                  </div>
                  {specs.length > 0 && (
                    <div className="spec-row">
                      {specs.map((spec) => (
                        <span key={`${post.id}-${spec.key}`} className="spec-chip">{spec.value}</span>
                      ))}
                    </div>
                  )}
                  <div className="meta">
                    <div className="user">
                      <Avatar size={20} src={post.userAvatar} icon={<UserOutlined />} />
                      <span className="name">{post.userNickname || 'Anonymous'}</span>
                    </div>
                    <div className="stats">
                      <span><HeartFilled style={{ fontSize: 10 }} /> {post.likeCount || 0}</span>
                      <span><EyeOutlined style={{ fontSize: 10 }} /> {post.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              </PostCard>
            );
          })}
        </Masonry>
      </MasonryGridWrap>
      {hasMore && (
        <>
          <div ref={loadMoreRef} style={{ height: 1 }} aria-hidden />
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            {loadingMore ? <Spin /> : (
              <Button shape="round" onClick={() => setPage((p) => p + 1)}>
                <FormattedMessage id="common.loadMore" defaultMessage="加载更多" />
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
};

const MySavedPostsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'like' ? 'like' : tabParam === 'history' ? 'history' : 'collect';

  const tabItems = [
    {
      key: 'collect',
      label: (
        <span>
          <StarOutlined style={{ marginRight: 6 }} />
          <FormattedMessage id="community.mySaved.tabCollected" defaultMessage="收藏" />
        </span>
      ),
      children: <InteractionPostList interactionType="collect" />,
    },
    {
      key: 'like',
      label: (
        <span>
          <HeartOutlined style={{ marginRight: 6 }} />
          <FormattedMessage id="community.mySaved.tabLiked" defaultMessage="喜欢" />
        </span>
      ),
      children: <InteractionPostList interactionType="like" />,
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined style={{ marginRight: 6 }} />
          <FormattedMessage id="community.mySaved.tabHistory" defaultMessage="浏览" />
        </span>
      ),
      children: <ViewHistoryPostList />,
    },
  ];

  return (
    <PageLayout>
      <SimpleHeader />
      <Container>
        <PageHeader>
          <h1>
            <FormattedMessage id="community.mySaved.title" defaultMessage="收藏 · 喜欢 · 浏览" />
          </h1>
        </PageHeader>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key }, { replace: true })}
          items={tabItems}
          destroyInactiveTabPane
        />
      </Container>
    </PageLayout>
  );
};

export default MySavedPostsPage;
