import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Empty,
  Image,
  Modal,
  Spin,
  theme,
  message,
} from 'antd';
import {
  CheckOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  HeartFilled,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Masonry from 'react-masonry-css';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import {
  followUser,
  getCommunityUserProfile,
  getFollowersList,
  getFollowingList,
  listUserCommunityPosts,
  unfollowUser,
} from 'api/community';
import { addTencentImageCompression, getPostCardSpecs } from './ChallengeDetailPage/utils';

const HEADER_OFFSET = 72;

const PageBackground = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${(p) => p.$token.colorBgLayout};
  color: ${(p) => p.$token.colorText};
`;

const CoverHeroSection = styled.section`
  position: relative;
  width: 100%;
  min-height: clamp(200px, 32vh, 360px);
  overflow: hidden;
  background: ${(p) =>
    p.$hasImage
      ? 'transparent'
      : `linear-gradient(135deg, ${p.$token.colorPrimaryBg} 0%, ${p.$token.colorBgLayout} 55%, ${p.$token.colorPrimaryBgHover || p.$token.colorPrimaryBg} 100%)`};

  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.08) 0%,
      rgba(0, 0, 0, 0.02) 45%,
      rgba(0, 0, 0, 0.35) 100%
    );
  }

  .bottom-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent, ${(p) => p.$token.colorBgLayout});
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: -56px auto 0;
  padding: 0 20px 48px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    margin-top: -40px;
    padding: 0 12px 32px;
  }
`;

const ProfileCard = styled.div`
  background: ${(p) => p.$token.colorBgContainer};
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 28px;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 16px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const AvatarWrap = styled.div`
  flex-shrink: 0;
  margin-top: -48px;
  border-radius: 50%;
  padding: 4px;
  background: ${(p) => p.$token.colorBgContainer};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  @media (max-width: 768px) {
    margin-top: -36px;
    align-self: flex-start;
  }
`;

const UserMeta = styled.div`
  flex: 1;
  min-width: 0;
  padding-top: 4px;

  h1 {
    margin: 0 0 6px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }

  .username {
    font-size: 14px;
    color: ${(p) => p.$token.colorTextSecondary};
    margin-bottom: 10px;
  }

  .bio {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: ${(p) => p.$token.colorTextSecondary};
    white-space: pre-wrap;
    word-break: break-word;
  }

  .location {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    font-size: 13px;
    color: ${(p) => p.$token.colorTextTertiary};
  }
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${(p) => p.$token.colorBorderSecondary};
`;

const StatItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  background: none;
  border: none;
  padding: 0;
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};
  color: inherit;
  transition: opacity 0.2s;

  &:hover {
    opacity: ${(p) => (p.$clickable ? 0.75 : 1)};
  }

  .value {
    font-size: 20px;
    font-weight: 700;
    color: ${(p) => p.$token.colorText};
  }

  .label {
    font-size: 13px;
    color: ${(p) => p.$token.colorTextSecondary};
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
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
  background: ${(p) => p.$token.colorBgContainer};
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .cover .ant-image,
  .cover .ant-image-img {
    width: 100%;
    display: block;
  }

  .body {
    padding: 12px 14px 14px;
  }

  .title {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: ${(p) => p.$token.colorTextSecondary};
  }
`;

const breakpointColumnsObj = {
  default: 4,
  1200: 3,
  768: 2,
  480: 1,
};

const CommunityUserProfilePage = () => {
  const { userId: userIdParam } = useParams();
  const userId = Number(userIdParam);
  const navigate = useNavigate();
  const intl = useIntl();
  const { token } = theme.useToken();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [relationListLoading, setRelationListLoading] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const loadProfile = useCallback(async () => {
    if (!userId || Number.isNaN(userId)) {
      setProfileError(true);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    setProfileError(false);
    try {
      const data = await getCommunityUserProfile(userId);
      setProfile(data);
    } catch (e) {
      setProfileError(true);
      message.error(e?.message || intl.formatMessage({ id: 'community.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setProfileLoading(false);
    }
  }, [userId, intl]);

  const fetchPosts = useCallback(
    async (pageNum, append = false) => {
      if (!userId || Number.isNaN(userId)) return;
      if (append) {
        setLoadingMore(true);
      } else {
        setPostsLoading(true);
      }
      try {
        const data = await listUserCommunityPosts(userId, {
          page: pageNum,
          pageSize: 20,
          sortBy: 'latest',
        });
        setPosts((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === 20);
      } catch (e) {
        message.error(e?.message || intl.formatMessage({ id: 'community.loadFailed', defaultMessage: '加载失败' }));
      } finally {
        setPostsLoading(false);
        setLoadingMore(false);
      }
    },
    [userId, intl]
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  useEffect(() => {
    if (!hasMore || postsLoading || loadingMore || posts.length === 0) return;
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
  }, [hasMore, postsLoading, loadingMore, posts.length]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, true);
    }
  }, [page, fetchPosts]);

  const loadFollowersList = async () => {
    setRelationListLoading(true);
    try {
      const list = await getFollowersList(userId);
      setFollowersList(list);
    } catch (e) {
      message.error(
        e?.message ||
          intl.formatMessage({ id: 'profile.message.loadFollowersFailed', defaultMessage: '加载粉丝列表失败' })
      );
    } finally {
      setRelationListLoading(false);
    }
  };

  const loadFollowingList = async () => {
    setRelationListLoading(true);
    try {
      const list = await getFollowingList(userId);
      setFollowingList(list);
    } catch (e) {
      message.error(
        e?.message ||
          intl.formatMessage({ id: 'profile.message.loadFollowingFailed', defaultMessage: '加载关注列表失败' })
      );
    } finally {
      setRelationListLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || profile.isSelf) return;
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setFollowLoading(true);
    try {
      const res = profile.isFollowing
        ? await unfollowUser(profile.userId)
        : await followUser(profile.userId, 'USER_PROFILE');
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: res.isFollowing,
              isMutual: res.isMutual,
              followersCount: res.followersCount ?? prev.followersCount,
            }
          : prev
      );
      message.success(
        profile.isFollowing
          ? intl.formatMessage({ id: 'profile.message.unfollowSuccess', defaultMessage: '取消关注成功' })
          : intl.formatMessage({ id: 'profile.message.followSuccess', defaultMessage: '关注成功' })
      );
    } catch (e) {
      message.error(e?.message || intl.formatMessage({ id: 'profile.message.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleFollowInModal = async (targetUserId, isFollowing) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
      } else {
        await followUser(targetUserId, 'USER_PROFILE');
      }
      if (followersModalOpen) loadFollowersList();
      if (followingModalOpen) loadFollowingList();
      loadProfile();
      message.success(
        isFollowing
          ? intl.formatMessage({ id: 'profile.message.unfollowSuccess', defaultMessage: '取消关注成功' })
          : intl.formatMessage({ id: 'profile.message.followSuccess', defaultMessage: '关注成功' })
      );
    } catch (e) {
      message.error(e?.message || intl.formatMessage({ id: 'profile.message.operationFailed', defaultMessage: '操作失败' }));
    }
  };

  const getCoverUrl = (post) =>
    addTencentImageCompression(post.coverUrl || post.mediaUrls?.[0], { quality: 24 });

  const displayName = profile?.nickname || profile?.username;
  const locationText = [profile?.city, profile?.country].filter(Boolean).join(', ');

  if (profileLoading && !profile) {
    return (
      <PageBackground $token={token}>
        <SimpleHeader />
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 160 }}>
          <Spin size="large" />
        </div>
      </PageBackground>
    );
  }

  if (profileError || !profile) {
    return (
      <PageBackground $token={token}>
        <SimpleHeader />
        <div style={{ paddingTop: 120, maxWidth: 480, margin: '0 auto' }}>
          <Empty
            description={
              <FormattedMessage id="community.userProfile.notFound" defaultMessage="用户不存在或主页不可见" />
            }
          >
            <Button type="primary" onClick={() => navigate('/community')}>
              <FormattedMessage id="community.exploreNow" defaultMessage="去社区逛逛" />
            </Button>
          </Empty>
        </div>
      </PageBackground>
    );
  }

  const renderRelationModal = (type) => {
    const isFollowers = type === 'followers';
    const list = isFollowers ? followersList : followingList;
    const open = isFollowers ? followersModalOpen : followingModalOpen;
    const setOpen = isFollowers ? setFollowersModalOpen : setFollowingModalOpen;

    return (
      <Modal
        title={intl.formatMessage({
          id: isFollowers ? 'profile.modal.followers' : 'profile.modal.followingList',
          defaultMessage: isFollowers ? '粉丝列表' : '关注列表',
        })}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={500}
        centered
      >
        <Spin spinning={relationListLoading}>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {list.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: token.colorTextSecondary }}>
                {intl.formatMessage({
                  id: isFollowers ? 'profile.modal.noFollowers' : 'profile.modal.noFollowing',
                  defaultMessage: isFollowers ? '暂无粉丝' : '暂无关注',
                })}
              </div>
            ) : (
              list.map((item) => (
                <div
                  key={item.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}
                    onClick={() => {
                      setOpen(false);
                      navigate(`/community/user/${item.userId}`);
                    }}
                  >
                    <Avatar src={item.avatar} size={40} icon={<UserOutlined />} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500 }}>{item.nickname || item.username}</div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: 12,
                            color: token.colorTextSecondary,
                            marginTop: 4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.userId !== profile.userId && isLoggedIn && (
                    <Button
                      type={item.isFollowing ? 'default' : 'primary'}
                      size="small"
                      onClick={() => handleFollowInModal(item.userId, item.isFollowing)}
                    >
                      {item.isMutual
                        ? intl.formatMessage({ id: 'profile.modal.mutual', defaultMessage: '互相关注' })
                        : item.isFollowing
                        ? intl.formatMessage({ id: 'profile.modal.following', defaultMessage: '已关注' })
                        : intl.formatMessage({ id: 'profile.modal.follow', defaultMessage: '关注' })}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Spin>
      </Modal>
    );
  };

  return (
    <PageBackground $token={token}>
      <SimpleHeader />

      <CoverHeroSection $token={token} $hasImage={Boolean(profile.coverImage)}>
        {profile.coverImage && <img className="bg" src={profile.coverImage} alt="" loading="eager" />}
        <div className="overlay" aria-hidden />
        <div className="bottom-fade" aria-hidden />
      </CoverHeroSection>

      <ContentWrapper>
        <ProfileCard $token={token}>
          <HeaderRow>
            <AvatarWrap $token={token}>
              <Avatar src={profile.avatar} size={96} icon={<UserOutlined />} />
            </AvatarWrap>

            <UserMeta $token={token}>
              <h1>{displayName || <FormattedMessage id="common.unknown" defaultMessage="未知用户" />}</h1>
              {profile.username && profile.username !== displayName && (
                <div className="username">@{profile.username}</div>
              )}
              <p className="bio">
                {profile.description ||
                  intl.formatMessage({ id: 'profile.value.noDescription', defaultMessage: '这个人很懒，什么都没写' })}
              </p>
              {locationText && (
                <div className="location">
                  <EnvironmentOutlined />
                  {locationText}
                </div>
              )}
              {profile.createTime && (
                <div className="location" style={{ marginTop: 4 }}>
                  <FormattedMessage
                    id="community.userProfile.joined"
                    defaultMessage="加入于 {date}"
                    values={{ date: new Date(profile.createTime).toLocaleDateString() }}
                  />
                </div>
              )}
            </UserMeta>

            <div style={{ flexShrink: 0, alignSelf: 'flex-start', paddingTop: 4 }}>
              {profile.isSelf ? (
                <Button type="primary" icon={<EditOutlined />} onClick={() => navigate('/profile')}>
                  <FormattedMessage id="community.userProfile.editProfile" defaultMessage="编辑资料" />
                </Button>
              ) : (
                <Button
                  type={profile.isFollowing ? 'default' : 'primary'}
                  shape="round"
                  loading={followLoading}
                  onClick={handleFollow}
                  icon={profile.isFollowing ? <CheckOutlined /> : <UserAddOutlined />}
                >
                  {profile.isFollowing ? (
                    profile.isMutual ? (
                      <FormattedMessage id="user.mutual_follow" defaultMessage="互相关注" />
                    ) : (
                      <FormattedMessage id="user.following" defaultMessage="已关注" />
                    )
                  ) : (
                    <FormattedMessage id="common.follow" defaultMessage="关注" />
                  )}
                </Button>
              )}
            </div>
          </HeaderRow>

          <StatsRow $token={token}>
            <StatItem $token={token} $clickable={false} type="button">
              <span className="value">{profile.postCount ?? 0}</span>
              <span className="label">
                <FormattedMessage id="community.userProfile.posts" defaultMessage="作品" />
              </span>
            </StatItem>
            <StatItem
              $token={token}
              $clickable
              type="button"
              onClick={() => {
                setFollowersModalOpen(true);
                loadFollowersList();
              }}
            >
              <span className="value">{profile.followersCount ?? 0}</span>
              <span className="label">
                <FormattedMessage id="community.userProfile.followers" defaultMessage="粉丝" />
              </span>
            </StatItem>
            <StatItem
              $token={token}
              $clickable
              type="button"
              onClick={() => {
                setFollowingModalOpen(true);
                loadFollowingList();
              }}
            >
              <span className="value">{profile.followingCount ?? 0}</span>
              <span className="label">
                <FormattedMessage id="community.userProfile.following" defaultMessage="关注" />
              </span>
            </StatItem>
            <StatItem $token={token} $clickable={false} type="button">
              <span className="value">{profile.totalLikeCount ?? 0}</span>
              <span className="label">
                <FormattedMessage id="community.userProfile.totalLikes" defaultMessage="获赞" />
              </span>
            </StatItem>
          </StatsRow>
        </ProfileCard>

        <SectionTitle>
          <FormattedMessage id="community.userProfile.works" defaultMessage="Ta 的作品" />
        </SectionTitle>

        {postsLoading && posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : posts.length === 0 ? (
          <Empty description={<FormattedMessage id="community.noPosts" defaultMessage="暂无帖子" />} />
        ) : (
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
                    <PostCard
                      key={post.id}
                      $token={token}
                      onClick={() => navigate(`/community/post/${post.id}`)}
                    >
                      <div className="cover">
                        <Image src={getCoverUrl(post)} alt={post.title} preview={false} />
                      </div>
                      <div className="body">
                        <h3 className="title">
                          {post.title ||
                            intl.formatMessage({ id: 'post.untitled', defaultMessage: '未命名作品' })}
                        </h3>
                        {specs.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                            {specs.slice(0, 3).map((spec) => (
                              <span
                                key={`${post.id}-${spec.key}`}
                                style={{
                                  fontSize: 11,
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  background: token.colorFillAlter,
                                  color: token.colorTextSecondary,
                                }}
                              >
                                {spec.value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="meta">
                          <span>
                            <HeartFilled style={{ marginRight: 4, fontSize: 11 }} />
                            {post.likeCount || 0}
                          </span>
                          <span>
                            <EyeOutlined style={{ marginRight: 4, fontSize: 11 }} />
                            {post.viewCount || 0}
                          </span>
                        </div>
                      </div>
                    </PostCard>
                  );
                })}
              </Masonry>
            </MasonryGridWrap>
            {hasMore && (
              <div ref={loadMoreRef} style={{ textAlign: 'center', padding: 24 }}>
                {loadingMore && <Spin />}
              </div>
            )}
          </>
        )}
      </ContentWrapper>

      {renderRelationModal('followers')}
      {renderRelationModal('following')}
    </PageBackground>
  );
};

export default CommunityUserProfilePage;
