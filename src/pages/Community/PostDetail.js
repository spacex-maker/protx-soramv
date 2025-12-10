import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Spin, message, Button, Typography, Tag, Row, Col, Avatar, Tooltip, Divider, Space 
} from 'antd';
import { 
  HeartOutlined, HeartFilled, StarOutlined, StarFilled, 
  EyeOutlined, ArrowLeftOutlined, CopyOutlined, ShareAltOutlined,
  ThunderboltFilled, DownloadOutlined, UserAddOutlined, CheckOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { getPostDetail, likePost, unlikePost, collectPost, uncollectPost, getPostInteractionStatus, followUser, unfollowUser, getRelationStatus } from 'api/community';

const { Title, Text, Paragraph } = Typography;

// --- Styled Components ---

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0a' : '#ffffff'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  padding-top: 60px;
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
    padding: 16px 20px;
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
`;

// 左侧：媒体展示区
const MediaSection = styled.div`
  flex: 1;
  min-width: 0; // 防止 flex 子项溢出
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ImageContainer = styled.div`
  width: 100%;
  border-radius: 24px; // 大圆角，更柔和
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f8f8f8'};
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  position: relative;
  
  img {
    width: 100%;
    height: auto;
    display: block;
    // 增加一点过渡效果
    transition: transform 0.3s;
  }
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

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .name {
      font-size: 16px;
      font-weight: 700;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    }
    .date {
      font-size: 12px;
      color: #888;
    }
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
    font-family: 'JetBrains Mono', 'Menlo', monospace; // 编程字体
    font-size: 14px;
    line-height: 1.6;
    color: ${props => props.theme.mode === 'dark' ? '#ccc' : '#444'};
    word-break: break-all;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden; // 防止水平滚动
    width: 100%;
    box-sizing: border-box;
  }
`;

// 核心操作按钮组 (Remix / Like / Collect)
const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;

  .main-btn {
    flex: 2;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  }

  .icon-btn {
    flex: 1;
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

    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};
      transform: translateY(-2px);
    }
    
    &.active {
      border-color: transparent;
      // 激活状态的特定颜色处理在 JSX 中完成
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

  useEffect(() => {
    if (postId) fetchPostDetailData();
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

  const handleRemix = () => {
    // 跳转到创作页并带参数
    navigate('/create', { 
        state: { 
            importedParams: {
                prompt: post.prompt,
                negativePrompt: post.negativePrompt,
                model: post.modelKey
                // ...其他参数
            } 
        } 
    });
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
          style={{ fontSize: 16, paddingLeft: 0 }}
        >
          <FormattedMessage id="common.back" defaultMessage="返回" />
        </Button>
        <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<ShareAltOutlined />} shape="circle" />
            <Button icon={<DownloadOutlined />} shape="circle" />
        </div>
      </NavBar>

      <MainContainer>
        {/* 左侧：图片瀑布流展示 */}
        <MediaSection>
          {post.mediaUrls.map((url, index) => (
            <ImageContainer key={index}>
              <img src={url} alt={`Creation ${index}`} loading="lazy" />
            </ImageContainer>
          ))}
        </MediaSection>

        {/* 右侧：详情 Sticky Sidebar */}
        <SidebarSection>
            {/* 1. 标题与操作 */}
            <Title level={2} style={{ marginBottom: 24, fontSize: 28 }}>
                {post.title || <FormattedMessage id="post.untitled" defaultMessage="Untitled Creation" />}
            </Title>

            <UserCard>
                <div className="user-info">
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
                <Button 
                    type="primary" 
                    className="main-btn" 
                    icon={<ThunderboltFilled />}
                    onClick={handleRemix}
                >
                    <FormattedMessage id="post.remix" defaultMessage="Remix / Try this" />
                </Button>
                
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

            {/* 2. 核心资产：Prompt */}
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

            {/* 3. 参数与标签 */}
            <div style={{ marginBottom: 24 }}>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 12 }}>
                    <FormattedMessage id="post.details" defaultMessage="Details" />
                </Text>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.model" defaultMessage="Model" /></Text>
                        <GlowModelName>{post.modelKey || 'SDXL 1.0'}</GlowModelName>
                    </Col>
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.resolution" defaultMessage="Resolution" /></Text>
                        <div style={{ fontWeight: 500 }}>1024 x 1024</div>
                    </Col>
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.steps" defaultMessage="Steps" /></Text>
                        <div style={{ fontWeight: 500 }}>30</div>
                    </Col>
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}><FormattedMessage id="post.cfgScale" defaultMessage="Guidance Scale" /></Text>
                        <div style={{ fontWeight: 500 }}>7.0</div>
                    </Col>
                </Row>
            </div>

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
    </PageLayout>
  );
};

export default PostDetailPage;