import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Empty,
  Input,
  Spin,
  message,
} from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import dayjs from 'dayjs';
import {
  CommunityPostComment,
  createPostComment,
  deletePostComment,
  likePostComment,
  listPostComments,
  unlikePostComment,
} from 'api/community';

const { TextArea } = Input;

const Section = styled.section`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 40px 60px;

  @media (max-width: 1024px) {
    padding: 0 20px 40px;
  }

  @media (max-width: 768px) {
    padding: 0 16px 32px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
  }
`;

const Composer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-start;
`;

const ComposerInputWrap = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ComposerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  .count {
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentBlock = styled.div<{ $depth?: number }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: ${(p) => (p.$depth ? Math.min(p.$depth, 3) * 28 : 0)}px;
`;

const CommentRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const CommentBody = styled.div`
  flex: 1;
  min-width: 0;

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }

  .name {
    font-weight: 600;
    font-size: 14px;
  }

  .time {
    font-size: 12px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }

  .content {
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
    margin-bottom: 8px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)')};
  }

  .reply-to {
    color: ${(p) => (p.theme.mode === 'dark' ? '#60a5fa' : '#3b82f6')};
    margin-right: 4px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const ReplyBox = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionBtn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-size: 12px;
  color: ${(p) =>
    p.$active
      ? '#ef4444'
      : p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.55)'
        : 'rgba(0,0,0,0.55)'};

  &:hover {
    color: ${(p) => (p.$active ? '#ef4444' : '#3b82f6')};
  }
`;

interface ReplyTarget {
  commentId: number;
  userId: number;
  nickname?: string;
}

interface CommentItemProps {
  comment: CommunityPostComment;
  depth?: number;
  currentUserId?: number;
  onReply: (target: ReplyTarget) => void;
  onRefresh: () => void;
  onCommentCountChange?: (delta: number) => void;
  updateCommentTree: (
    updater: (comments: CommunityPostComment[]) => CommunityPostComment[]
  ) => void;
}

const updateTree = (
  comments: CommunityPostComment[],
  commentId: number,
  updater: (comment: CommunityPostComment) => CommunityPostComment
): CommunityPostComment[] =>
  comments.map((item) => {
    if (item.id === commentId) {
      return updater(item);
    }
    if (item.children?.length) {
      return { ...item, children: updateTree(item.children, commentId, updater) };
    }
    return item;
  });

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  currentUserId,
  onReply,
  onRefresh,
  onCommentCountChange,
  updateCommentTree,
}) => {
  const intl = useIntl();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    setLiking(true);
    try {
      if (comment.isLiked) {
        await unlikePostComment(comment.id);
        updateCommentTree((list) =>
          updateTree(list, comment.id, (c) => ({
            ...c,
            isLiked: false,
            likeCount: Math.max((c.likeCount ?? 1) - 1, 0),
          }))
        );
      } else {
        await likePostComment(comment.id);
        updateCommentTree((list) =>
          updateTree(list, comment.id, (c) => ({
            ...c,
            isLiked: true,
            likeCount: (c.likeCount ?? 0) + 1,
          }))
        );
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePostComment(comment.id);
      message.success(intl.formatMessage({ id: 'post.comment.deleteSuccess', defaultMessage: '评论已删除' }));
      onCommentCountChange?.(-1);
      onRefresh();
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    }
  };

  const handleSubmitReply = async () => {
    const content = replyText.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      await createPostComment(comment.postId, {
        content,
        parentId: comment.id,
        replyToUserId: comment.userId,
      });
      setReplyText('');
      setReplyOpen(false);
      message.success(intl.formatMessage({ id: 'post.comment.replySuccess', defaultMessage: '回复成功' }));
      onCommentCountChange?.(1);
      onRefresh();
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CommentBlock $depth={depth}>
      <CommentRow>
        <Avatar src={comment.avatar} size={depth > 0 ? 32 : 40}>
          {(comment.nickname || '?')[0]}
        </Avatar>
        <CommentBody>
          <div className="meta">
            <span className="name">{comment.nickname || `#${comment.userId}`}</span>
            <span className="time">
              {comment.createTime ? dayjs(comment.createTime).format('YYYY-MM-DD HH:mm') : ''}
            </span>
          </div>
          <div className="content">
            {comment.replyToNickname && (
              <span className="reply-to">@{comment.replyToNickname}</span>
            )}
            {comment.content}
          </div>
          <div className="actions">
            <ActionBtn type="button" $active={comment.isLiked} disabled={liking} onClick={handleLike}>
              {comment.isLiked ? <HeartFilled /> : <HeartOutlined />}
              {comment.likeCount ?? 0}
            </ActionBtn>
            <ActionBtn
              type="button"
              onClick={() => {
                setReplyOpen((v) => !v);
                onReply({ commentId: comment.id, userId: comment.userId, nickname: comment.nickname });
              }}
            >
              <MessageOutlined />
              <FormattedMessage id="post.comment.reply" defaultMessage="回复" />
            </ActionBtn>
            {currentUserId === comment.userId && (
              <ActionBtn type="button" onClick={handleDelete}>
                <DeleteOutlined />
                <FormattedMessage id="common.delete" defaultMessage="删除" />
              </ActionBtn>
            )}
          </div>
          {replyOpen && (
            <ReplyBox>
              <TextArea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={intl.formatMessage(
                  { id: 'post.comment.replyPlaceholder', defaultMessage: '回复 {name}' },
                  { name: comment.nickname || '' }
                )}
                maxLength={1000}
              />
              <ComposerFooter>
                <span className="count">{replyText.length}/1000</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="small" onClick={() => setReplyOpen(false)}>
                    <FormattedMessage id="common.cancel" defaultMessage="取消" />
                  </Button>
                  <Button size="small" type="primary" loading={submitting} onClick={handleSubmitReply}>
                    <FormattedMessage id="post.comment.sendReply" defaultMessage="发送回复" />
                  </Button>
                </div>
              </ComposerFooter>
            </ReplyBox>
          )}
        </CommentBody>
      </CommentRow>
      {comment.children?.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          depth={depth + 1}
          currentUserId={currentUserId}
          onReply={onReply}
          onRefresh={onRefresh}
          onCommentCountChange={onCommentCountChange}
          updateCommentTree={updateCommentTree}
        />
      ))}
    </CommentBlock>
  );
};

interface PostCommentSectionProps {
  postId: number;
  commentCount?: number;
  currentUserId?: number;
  onCommentCountChange?: (delta: number) => void;
}

const PostCommentSection: React.FC<PostCommentSectionProps> = ({
  postId,
  commentCount = 0,
  currentUserId,
  onCommentCountChange,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [total, setTotal] = useState(commentCount);
  const [page, setPage] = useState(1);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 20;

  const loadComments = useCallback(async (nextPage = 1, append = false) => {
    setLoading(true);
    try {
      const result = await listPostComments(postId, nextPage, pageSize);
      setComments((prev) => (append ? [...prev, ...result.data] : result.data));
      setTotal(result.totalNum ?? 0);
      setPage(nextPage);
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'post.comment.loadFailed', defaultMessage: '加载评论失败' }));
    } finally {
      setLoading(false);
    }
  }, [intl, postId]);

  useEffect(() => {
    loadComments(1, false);
  }, [loadComments]);

  const handleSubmit = async () => {
    const text = content.trim();
    if (!text) return;
    if (!currentUserId) {
      message.warning(intl.formatMessage({ id: 'post.comment.loginRequired', defaultMessage: '请先登录后再评论' }));
      return;
    }
    setSubmitting(true);
    try {
      await createPostComment(postId, { content: text, parentId: 0 });
      setContent('');
      message.success(intl.formatMessage({ id: 'post.comment.success', defaultMessage: '评论成功' }));
      onCommentCountChange?.(1);
      await loadComments(1, false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setSubmitting(false);
    }
  };

  const hasMore = comments.length < total;

  return (
    <Section>
      <SectionHeader>
        <h3>
          <FormattedMessage
            id="post.comment.title"
            defaultMessage="评论 ({count})"
            values={{ count: commentCount ?? total }}
          />
        </h3>
      </SectionHeader>

      <Composer>
        <Avatar size={40} style={{ flexShrink: 0 }}>{currentUserId ? '我' : '?'}</Avatar>
        <ComposerInputWrap>
          <TextArea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={intl.formatMessage({ id: 'post.comment.placeholder', defaultMessage: '写下你的评论…' })}
            maxLength={1000}
          />
          <ComposerFooter>
            <span className="count">{content.length}/1000</span>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              <FormattedMessage id="post.comment.submit" defaultMessage="发表评论" />
            </Button>
          </ComposerFooter>
        </ComposerInputWrap>
      </Composer>

      {loading && comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : comments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={intl.formatMessage({ id: 'post.comment.empty', defaultMessage: '暂无评论，来抢沙发吧' })}
        />
      ) : (
        <>
          <CommentList>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onReply={() => undefined}
                onRefresh={() => loadComments(1, false)}
                onCommentCountChange={onCommentCountChange}
                updateCommentTree={(updater) => setComments((prev) => updater(prev))}
              />
            ))}
          </CommentList>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button loading={loading} onClick={() => loadComments(page + 1, true)}>
                <FormattedMessage id="common.loadMore" defaultMessage="加载更多" />
              </Button>
            </div>
          )}
        </>
      )}
    </Section>
  );
};

export default PostCommentSection;
