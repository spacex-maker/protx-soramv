import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Empty,
  Input,
  Modal,
  Spin,
  Tag,
  message,
} from 'antd';
import { FireOutlined, StarFilled, StarOutlined, UserOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import dayjs from 'dayjs';
import instance from 'api/axios';
import {
  CommentItem,
  CommentList,
  CommentSection,
  VoiceDetailAvatar,
  VoiceDetailHeader,
  VoiceDetailMetaGrid,
  VoiceHotBadge,
} from './styles';
import { VoiceComment, VoiceModel } from './voiceTypes';

interface VoiceDetailModalProps {
  open: boolean;
  voice: VoiceModel | null;
  favoriteLoadingId?: number | null;
  getVoiceName: (voice: VoiceModel) => string;
  onClose: () => void;
  onSelect?: (voiceCode: string) => void;
  onToggleFavorite?: (voice: VoiceModel, favorited: boolean) => void;
}

const VoiceDetailModal: React.FC<VoiceDetailModalProps> = ({
  open,
  voice,
  favoriteLoadingId,
  getVoiceName,
  onClose,
  onSelect,
  onToggleFavorite,
}) => {
  const intl = useIntl();
  const [detail, setDetail] = useState<VoiceModel | null>(null);
  const [comments, setComments] = useState<VoiceComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');

  const fetchDetail = useCallback(async (voiceId: number) => {
    setLoading(true);
    try {
      const response = await instance.get(`/productx/sa-ai-speech/voices/${voiceId}`);
      if (response.data.success) {
        setDetail(response.data.data as VoiceModel);
      }
    } catch {
      message.error(intl.formatMessage({ id: 'create.speech.voiceDetailLoadFailed', defaultMessage: '加载音色详情失败' }));
    } finally {
      setLoading(false);
    }
  }, [intl]);

  const fetchComments = useCallback(async (voiceId: number) => {
    setCommentLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-speech/voices/comments/page', {
        params: { voiceId, currentPage: 1, pageSize: 20 },
      });
      if (response.data.success && response.data.data) {
        setComments(response.data.data.records || []);
      }
    } catch {
      message.error(intl.formatMessage({ id: 'create.speech.commentLoadFailed', defaultMessage: '加载评论失败' }));
    } finally {
      setCommentLoading(false);
    }
  }, [intl]);

  useEffect(() => {
    if (open && voice?.id) {
      setCommentText('');
      fetchDetail(voice.id);
      fetchComments(voice.id);
    } else {
      setDetail(null);
      setComments([]);
    }
  }, [open, voice?.id, fetchDetail, fetchComments]);

  const handleSubmitComment = async () => {
    if (!voice?.id || !commentText.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      const response = await instance.post('/productx/sa-ai-speech/voices/comments/create', {
        voiceId: voice.id,
        content: commentText.trim(),
      });
      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'create.speech.commentSuccess', defaultMessage: '评论发表成功' }));
        setCommentText('');
        fetchComments(voice.id);
        fetchDetail(voice.id);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'create.speech.commentFailed', defaultMessage: '评论发表失败' }));
    } finally {
      setSubmitting(false);
    }
  };

  const displayVoice = detail || voice;
  if (!displayVoice) {
    return null;
  }

  const hotLabel = displayVoice.hotRank === 1
    ? intl.formatMessage({ id: 'create.speech.hotTop1', defaultMessage: '最热' })
    : (displayVoice.hotRank === 2 || displayVoice.hotRank === 3)
      ? intl.formatMessage({ id: 'create.speech.hotTop', defaultMessage: '热门' })
      : '';

  return (
    <Modal
      title={<FormattedMessage id="create.speech.voiceDetail" defaultMessage="音色详情" />}
      open={open}
      onCancel={onClose}
      width={560}
      destroyOnClose
      footer={onSelect ? [
        <Button key="close" onClick={onClose}>
          <FormattedMessage id="common.close" defaultMessage="关闭" />
        </Button>,
        <Button key="select" type="primary" onClick={() => onSelect(displayVoice.voiceCode)}>
          <FormattedMessage id="create.speech.useThisVoice" defaultMessage="使用此音色" />
        </Button>,
      ] : [
        <Button key="close" type="primary" onClick={onClose}>
          <FormattedMessage id="common.close" defaultMessage="关闭" />
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <VoiceDetailHeader>
          <VoiceDetailAvatar>
            {displayVoice.coverImage ? (
              <img src={displayVoice.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
            ) : (
              <UserOutlined />
            )}
          </VoiceDetailAvatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{getVoiceName(displayVoice)}</span>
              {hotLabel && (
                <VoiceHotBadge $rank={displayVoice.hotRank || 0}>
                  <FireOutlined />
                  {hotLabel}
                </VoiceHotBadge>
              )}
              {onToggleFavorite && (
                <Button
                  type="text"
                  size="small"
                  loading={favoriteLoadingId === displayVoice.id}
                  icon={displayVoice.favorited ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={() => onToggleFavorite(displayVoice, !!displayVoice.favorited)}
                >
                  {displayVoice.favorited
                    ? intl.formatMessage({ id: 'create.speech.unfavoriteVoice', defaultMessage: '取消收藏' })
                    : intl.formatMessage({ id: 'create.speech.favoriteVoice', defaultMessage: '收藏音色' })}
                </Button>
              )}
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {displayVoice.style && <Tag>{displayVoice.style}</Tag>}
              {displayVoice.gender && <Tag>{displayVoice.gender}</Tag>}
              {displayVoice.language && <Tag>{displayVoice.language}</Tag>}
            </div>
          </div>
        </VoiceDetailHeader>

        <VoiceDetailMetaGrid>
          <div className="meta-item">
            <strong><FormattedMessage id="create.speech.voiceCode" defaultMessage="Voice Code" /></strong>
            {displayVoice.voiceCode}
          </div>
          <div className="meta-item">
            <strong><FormattedMessage id="create.speech.usageStat" defaultMessage="使用次数" /></strong>
            {displayVoice.usageCount || 0}
          </div>
          <div className="meta-item">
            <strong><FormattedMessage id="create.speech.commentCount" defaultMessage="评论数" /></strong>
            {displayVoice.commentCount || 0}
          </div>
          {displayVoice.ttsModel && (
            <div className="meta-item">
              <strong><FormattedMessage id="create.speech.ttsModel" defaultMessage="TTS 模型" /></strong>
              {displayVoice.ttsModel}
            </div>
          )}
        </VoiceDetailMetaGrid>
      </Spin>

      <CommentSection>
        <div className="comment-title">
          <FormattedMessage id="create.speech.comments" defaultMessage="用户评论" />
        </div>
        <Input.TextArea
          rows={2}
          maxLength={1000}
          showCount
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder={intl.formatMessage({ id: 'create.speech.commentPlaceholder', defaultMessage: '分享你对这个音色的听感或使用体验…' })}
        />
        <div style={{ marginTop: 8, marginBottom: 12, textAlign: 'right' }}>
          <Button type="primary" size="small" loading={submitting} onClick={handleSubmitComment}>
            <FormattedMessage id="create.speech.postComment" defaultMessage="发表评论" />
          </Button>
        </div>
        <Spin spinning={commentLoading}>
          {comments.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<FormattedMessage id="create.speech.commentEmpty" defaultMessage="暂无评论，来抢沙发吧" />} />
          ) : (
            <CommentList>
              {comments.map(comment => (
                <CommentItem key={comment.id}>
                  <div className="avatar">
                    {comment.avatar ? (
                      <img src={comment.avatar} alt="" />
                    ) : (
                      <UserOutlined />
                    )}
                  </div>
                  <div className="body">
                    <div className="name-row">
                      <span className="name">{comment.nickname || intl.formatMessage({ id: 'create.speech.anonymousUser', defaultMessage: '用户' })}</span>
                      <span className="time">
                        {comment.createTime ? dayjs(comment.createTime).format('YYYY-MM-DD HH:mm') : ''}
                      </span>
                    </div>
                    <div className="content">{comment.content}</div>
                  </div>
                </CommentItem>
              ))}
            </CommentList>
          )}
        </Spin>
      </CommentSection>
    </Modal>
  );
};

export default VoiceDetailModal;
