import React, { useState } from 'react';
import { Modal, Form, Input, Button, Space, Image, Tag, message, Avatar, Divider, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined, ClockCircleOutlined, FileImageOutlined, VideoCameraOutlined, CrownOutlined, InfoCircleOutlined, TrophyOutlined, TagsOutlined } from '@ant-design/icons';
import styled, { keyframes, useTheme } from 'styled-components';
import dayjs from 'dayjs';
import { reviewPost, ReviewPost, PostReviewRequest } from 'api/community';

const { TextArea } = Input;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
    padding: 0;
  }

  .ant-modal-header {
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    padding: 24px 32px;
    border-bottom: none;
    margin-bottom: 0;
    
    .ant-modal-title {
      color: #fff;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .ant-modal-close {
    color: #fff;
    top: 20px;
    inset-inline-end: 20px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .ant-modal-body {
    padding: 0;
    max-height: 75vh;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)'};
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.2)'};
      border-radius: 3px;
      
      &:hover {
        background: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(0, 0, 0, 0.3)'};
      }
    }
  }

  .ant-modal-footer {
    padding: 20px 32px;
    border-top: 1px solid ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.06)'};
  }
`;

const ContentWrapper = styled.div`
  padding: 32px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.06)'};

  .user-avatar {
    flex-shrink: 0;
  }

  .post-meta {
    flex: 1;
    
    .title {
      font-size: 18px;
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 8px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.65)' 
          : 'rgba(0, 0, 0, 0.65)'};
      }
    }
  }
`;

const InfoSection = styled.div`
  margin-bottom: 24px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.85)' 
      : 'rgba(0, 0, 0, 0.85)'};
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .info-card {
    padding: 16px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(0, 0, 0, 0.02)'};
    border-radius: 8px;
    border: 1px solid ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.06)'};

    .info-row {
      display: flex;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }

      .label {
        min-width: 80px;
        font-size: 13px;
        color: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.45)' 
          : 'rgba(0, 0, 0, 0.45)'};
      }

      .value {
        flex: 1;
        font-size: 13px;
        color: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.85)' 
          : 'rgba(0, 0, 0, 0.85)'};
        word-break: break-word;
      }
    }
  }
`;

const ImageGallery = styled.div`
  margin-bottom: 24px;
  
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
    
    .image-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.02);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .no-image {
    width: 100%;
    height: 200px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)'};
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(0, 0, 0, 0.25)'};
    border: 2px dashed ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'};
      
    .icon {
      font-size: 48px;
      margin-bottom: 8px;
    }
  }
`;

const ReviewSection = styled.div`
  padding: 20px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(76, 175, 80, 0.1)' 
    : 'rgba(76, 175, 80, 0.05)'};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(76, 175, 80, 0.3)' 
    : 'rgba(76, 175, 80, 0.2)'};
  margin-bottom: 24px;

  .review-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #4caf50;
  }

  .review-row {
    display: flex;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }

    .label {
      min-width: 80px;
      font-size: 13px;
      color: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.65)' 
        : 'rgba(0, 0, 0, 0.65)'};
    }

    .value {
      flex: 1;
      font-size: 13px;
      color: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.85)' 
        : 'rgba(0, 0, 0, 0.85)'};
    }
  }
`;

const FormSection = styled.div`
  .form-label {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.85)' 
      : 'rgba(0, 0, 0, 0.85)'};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-hint {
    font-size: 12px;
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.45)' 
      : 'rgba(0, 0, 0, 0.45)'};
    margin-top: 8px;
  }
`;

const StyledTextArea = styled(TextArea)`
  border-radius: 8px;
  
  &:focus, &:hover {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;

interface PostReviewModalProps {
  visible: boolean;
  post: ReviewPost | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const PostReviewModal: React.FC<PostReviewModalProps> = ({
  visible,
  post,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const theme = useTheme() as any;
  const isDark = theme?.mode === 'dark';
  const [submitting, setSubmitting] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    if (!post) return;
    
    setReviewAction('approve');
    setSubmitting(true);
    
    try {
      const request: PostReviewRequest = {
        postId: post.id,
        status: 1, // 通过
        reviewComment: form.getFieldValue('reviewComment') || '审核通过',
      };
      
      await reviewPost(request);
      message.success('审核通过');
      onSuccess();
    } catch (error: any) {
      message.error(error?.response?.data?.message || '审核失败');
    } finally {
      setSubmitting(false);
      setReviewAction(null);
    }
  };

  const handleReject = async () => {
    if (!post) return;
    
    try {
      const values = await form.validateFields(['reviewComment']);
      
      if (!values.reviewComment || values.reviewComment.trim() === '') {
        message.warning('请填写拒绝原因');
        return;
      }
      
      setReviewAction('reject');
      setSubmitting(true);
      
      const request: PostReviewRequest = {
        postId: post.id,
        status: 9, // 拒绝
        reviewComment: values.reviewComment,
      };
      
      await reviewPost(request);
      message.success('已拒绝该帖子');
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error?.response?.data?.message || '操作失败');
    } finally {
      setSubmitting(false);
      setReviewAction(null);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="orange">待审核</Tag>;
      case 1:
        return <Tag color="green">已通过</Tag>;
      case 9:
        return <Tag color="red">已拒绝</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const isReviewed = post && post.status !== 0;

  const renderChallengeTags = (tagsStr: string) => {
    try {
      const tags = JSON.parse(tagsStr);
      if (Array.isArray(tags)) {
        return (
          <Space size={[0, 4]} wrap>
            {tags.map((tag: string, i: number) => (
              <Tag key={i} icon={<TagsOutlined />} color="volcano">{tag}</Tag>
            ))}
          </Space>
        );
      }
    } catch (e) {
      return <span>{tagsStr}</span>;
    }
    return null;
  };

  return (
    <StyledModal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isReviewed ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
          <span>{isReviewed ? '查看审核详情' : '审核帖子'}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={
        isReviewed ? (
          <Button size="large" onClick={onCancel} style={{ borderRadius: 32 }}>关闭</Button>
        ) : (
          <Space size={12}>
            <Button size="large" onClick={onCancel} style={{ borderRadius: 32 }}>取消</Button>
            <Button
              size="large"
              danger
              icon={<CloseCircleOutlined />}
              loading={submitting && reviewAction === 'reject'}
              onClick={handleReject}
              style={{ 
                minWidth: 100,
                borderRadius: 32,
                fontWeight: 500
              }}
            >
              拒绝
            </Button>
            <Button
              size="large"
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={submitting && reviewAction === 'approve'}
              onClick={handleApprove}
              style={{ 
                minWidth: 100,
                borderRadius: 32,
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              通过
            </Button>
          </Space>
        )
      }
      width={800}
      centered
      destroyOnClose
    >
      {post && (
        <ContentWrapper>
          {/* 帖子头部信息 */}
          <PostHeader>
            <Avatar 
              size={56} 
              src={post.userAvatar} 
              icon={<UserOutlined />}
              className="user-avatar"
            >
              {!post.userAvatar && post.username?.[0]?.toUpperCase()}
            </Avatar>
            <div className="post-meta">
              <div className="title">
                {post.title || '无标题作品'}
              </div>
              <div className="meta-row">
                <div className="meta-item">
                  <UserOutlined />
                  <span>{post.userNickname || post.username || '未知用户'}</span>
                </div>
                <div className="meta-item">
                  <ClockCircleOutlined />
                  <span>{dayjs(post.createTime).format('YYYY-MM-DD HH:mm')}</span>
                </div>
                <div className="meta-item">
                  {getStatusTag(post.status)}
                </div>
              </div>
            </div>
          </PostHeader>

          {/* 图片/视频展示 */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <ImageGallery>
              <div className="gallery-grid">
                {post.mediaUrls.map((url, index) => (
                  <Image.PreviewGroup key={index}>
                    <div className="image-item">
                      <Image
                        src={url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </Image.PreviewGroup>
                ))}
              </div>
            </ImageGallery>
          )}
          {(!post.mediaUrls || post.mediaUrls.length === 0) && (
            <ImageGallery>
              <div className="no-image">
                <div className="icon">
                  {post.mediaType === 'VIDEO' ? <VideoCameraOutlined /> : <FileImageOutlined />}
                </div>
                <span>暂无{post.mediaType === 'VIDEO' ? '视频' : '图片'}预览</span>
              </div>
            </ImageGallery>
          )}

          {/* 频道信息 */}
          {post.channel && (
            <InfoSection>
              <div className="section-title">
                <CrownOutlined style={{ color: '#faad14' }} />
                所属频道
              </div>
              <div className="info-card">
                <div className="info-row">
                  <div className="label">频道名称</div>
                  <div className="value">{post.channel.name}</div>
                </div>
                {post.channel.description && (
                  <div className="info-row">
                    <div className="label">频道描述</div>
                    <div className="value">{post.channel.description}</div>
                  </div>
                )}
                <div className="info-row">
                  <div className="label">频道标识</div>
                  <div className="value">
                    <Tag color="blue">{post.channel.channelKey}</Tag>
                  </div>
                </div>
              </div>
            </InfoSection>
          )}

          {/* 挑战信息 */}
          {post.challenge && (
            <InfoSection>
              <div className="section-title">
                <TrophyOutlined style={{ color: '#ff4d4f' }} />
                关联挑战详情
              </div>
              <div className="info-card" style={{ 
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.1) 0%, rgba(255, 122, 69, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 122, 69, 0.05) 100%)',
                borderColor: 'rgba(255, 77, 79, 0.2)'
              }}>
                <div className="info-row">
                  <div className="label">挑战主题</div>
                  <div className="value" style={{ fontWeight: 600, color: '#ff4d4f' }}>
                    {post.challenge.title}
                  </div>
                </div>
                {post.challenge.description && (
                  <div className="info-row">
                    <div className="label">规则描述</div>
                    <div className="value">{post.challenge.description}</div>
                  </div>
                )}
                {post.challenge.requiredTags && (
                  <div className="info-row">
                    <div className="label">必备标签</div>
                    <div className="value">
                      {renderChallengeTags(post.challenge.requiredTags)}
                    </div>
                  </div>
                )}
                {post.challenge.requiredModel && (
                  <div className="info-row">
                    <div className="label">限定模型</div>
                    <div className="value">
                      <Tag color="magenta">{post.challenge.requiredModel}</Tag>
                    </div>
                  </div>
                )}
                <div className="info-row">
                  <div className="label">参赛时间</div>
                  <div className="value">
                    {dayjs(post.challenge.startTime).format('MM-DD HH:mm')} ~ {dayjs(post.challenge.endTime).format('MM-DD HH:mm')}
                    {dayjs().isAfter(dayjs(post.challenge.endTime)) && (
                      <Tag color="error" style={{ marginLeft: 8, borderRadius: 4 }}>
                        投稿已截止
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </InfoSection>
          )}

          {/* AI生成信息 */}
          {(post.prompt || post.modelKey) && (
            <InfoSection>
              <div className="section-title">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                AI 生成信息
              </div>
              <div className="info-card">
                {post.prompt && (
                  <div className="info-row">
                    <div className="label">提示词</div>
                    <div className="value">{post.prompt}</div>
                  </div>
                )}
                {post.negativePrompt && (
                  <div className="info-row">
                    <div className="label">负向提示词</div>
                    <div className="value">{post.negativePrompt}</div>
                  </div>
                )}
                {post.modelKey && (
                  <div className="info-row">
                    <div className="label">使用模型</div>
                    <div className="value">
                      <Tag color="purple">{post.modelKey}</Tag>
                    </div>
                  </div>
                )}
              </div>
            </InfoSection>
          )}

          {/* 已审核信息 */}
          {isReviewed && post.reviewTime && (
            <ReviewSection>
              <div className="review-header">
                <CheckCircleOutlined />
                审核信息
              </div>
              <div className="review-row">
                <div className="label">审核结果</div>
                <div className="value">{getStatusTag(post.status)}</div>
              </div>
              <div className="review-row">
                <div className="label">审核官</div>
                <div className="value">{post.reviewerNickname || '未知'}</div>
              </div>
              <div className="review-row">
                <div className="label">审核时间</div>
                <div className="value">{dayjs(post.reviewTime).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>
              {post.reviewComment && (
                <div className="review-row">
                  <div className="label">审核意见</div>
                  <div className="value">{post.reviewComment}</div>
                </div>
              )}
            </ReviewSection>
          )}

          {/* 审核表单 */}
          {!isReviewed && (
            <FormSection>
              <Divider style={{ margin: '24px 0' }} />
              <Form form={form} layout="vertical">
                <Form.Item
                  name="reviewComment"
                  rules={[{ max: 500, message: '审核意见最多500字' }]}
                >
                  <div>
                    <div className="form-label">
                      <InfoCircleOutlined />
                      审核意见
                    </div>
                    <StyledTextArea
                      rows={4}
                      placeholder="请填写审核意见（拒绝时必填，通过时可选填）&#10;&#10;例如：&#10;✓ 内容符合社区规范，作品质量优秀&#10;✗ 作品包含不当内容，不符合频道主题"
                      showCount
                      maxLength={500}
                    />
                    <div className="form-hint">
                      💡 提示：拒绝审核时必须填写具体原因，帮助创作者改进
                    </div>
                  </div>
                </Form.Item>
              </Form>
            </FormSection>
          )}
        </ContentWrapper>
      )}
    </StyledModal>
  );
};

export default PostReviewModal;

