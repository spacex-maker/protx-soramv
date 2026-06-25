import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Button, Typography, message } from 'antd';
import { DownloadOutlined, LinkOutlined, ShareAltOutlined } from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { generatePostShareImage } from 'utils/generatePostShareImage';
import { downloadFile } from 'utils/file';
import { isPostPromptMarketLocked } from 'utils/communityPostPrompt';
import { recordPostShare } from 'api/community';

const { Text, Paragraph } = Typography;

const PreviewCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
`;

const PreviewInner = styled.div`
  padding: 12px;
`;

const PreviewHeader = styled.div`
  margin-bottom: 8px;

  .brand {
    font-size: 14px;
    font-weight: 700;
  }

  .sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.55);
  }
`;

const PreviewCover = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1.05;
  border-radius: 10px;
  overflow: hidden;
  background: #111827;
  margin-bottom: 10px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const PromptBlock = styled.div`
  margin-bottom: 10px;

  .label {
    font-size: 11px;
    font-weight: 600;
    color: #60a5fa;
    margin-bottom: 4px;
  }

  .content {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.88);
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 32px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

const PreviewFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  .qr-wrap {
    padding: 6px;
    background: #fff;
    border-radius: 10px;
    flex-shrink: 0;
  }

  .hint {
    min-width: 0;

    .title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .url {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.55);
      word-break: break-all;
    }
  }
`;

const HiddenQr = styled.div`
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
`;

interface PostShareCardModalProps {
  open: boolean;
  onClose: () => void;
  post: {
    id: number;
    title?: string;
    prompt?: string;
    userNickname?: string;
    coverUrl?: string;
    isPromptHidden?: boolean;
    promptMarketListingId?: number;
  };
  coverUrl?: string;
  onShareRecorded?: (shareCount: number) => void;
}

const PostShareCardModal: React.FC<PostShareCardModalProps> = ({
  open,
  onClose,
  post,
  coverUrl,
  onShareRecorded,
}) => {
  const intl = useIntl();
  const qrRef = useRef<HTMLCanvasElement>(null);
  const shareNotifiedRef = useRef(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) {
      shareNotifiedRef.current = false;
    }
  }, [open]);

  const notifyPostShared = () => {
    if (shareNotifiedRef.current || !post?.id) return;
    shareNotifiedRef.current = true;
    recordPostShare(post.id)
      .then((shareCount) => {
        if (typeof shareCount === 'number') {
          onShareRecorded?.(shareCount);
        }
      })
      .catch(() => {});
  };

  const shareUrl = useMemo(() => {
    if (!post?.id) return '';
    return `${window.location.origin}/community/post/${post.id}`;
  }, [post?.id]);

  const promptLocked = isPostPromptMarketLocked(post);

  const promptText = useMemo(() => {
    if (promptLocked) {
      return intl.formatMessage({
        id: 'post.shareCard.promptLocked',
        defaultMessage: '完整提示词已在提示词商城上架，扫码进入帖子查看详情。',
      });
    }
    if (post.prompt?.trim()) {
      return post.prompt.trim();
    }
    return intl.formatMessage({
      id: 'post.shareCard.noPrompt',
      defaultMessage: '扫码查看作品详情与生成参数。',
    });
  }, [intl, post.prompt, promptLocked]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      notifyPostShared();
      message.success(intl.formatMessage({ id: 'post.share.linkCopied', defaultMessage: '链接已复制，快去分享吧' }));
    } catch {
      message.error(intl.formatMessage({ id: 'post.share.failed', defaultMessage: '分享失败，请稍后重试' }));
    }
  };

  const handleDownloadImage = async () => {
    if (!qrRef.current) return;
    setExporting(true);
    try {
      const blob = await generatePostShareImage({
        coverUrl,
        promptText,
        promptLabel: intl.formatMessage({ id: 'post.prompt', defaultMessage: '提示词' }),
        shareUrl,
        title: post.title,
        authorName: post.userNickname,
        brandName: 'AI2OBJ',
        scanHint: intl.formatMessage({ id: 'post.shareCard.scanHint', defaultMessage: '扫码查看作品' }),
        qrCanvas: qrRef.current,
      });
      downloadFile(blob, `post-${post.id}-share.png`);
      notifyPostShared();
      message.success(intl.formatMessage({ id: 'post.shareCard.downloadSuccess', defaultMessage: '分享图已保存' }));
    } catch {
      message.error(intl.formatMessage({ id: 'post.shareCard.downloadFailed', defaultMessage: '生成分享图失败，请稍后重试' }));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      destroyOnClose
      title={
        <span>
          <ShareAltOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
          <FormattedMessage id="post.shareCard.title" defaultMessage="生成分享图" />
        </span>
      }
    >
      <Paragraph type="secondary" style={{ marginTop: -8, marginBottom: 16, fontSize: 13 }}>
        <FormattedMessage
          id="post.shareCard.desc"
          defaultMessage="分享图包含作品预览、提示词与二维码，好友扫码即可打开此帖子。"
        />
      </Paragraph>

      <PreviewCard>
        <PreviewInner>
          <PreviewHeader>
            <div className="brand">AI2OBJ</div>
            <div className="sub">Community</div>
          </PreviewHeader>

          <PreviewCover>
            {coverUrl ? <img src={coverUrl} alt="" crossOrigin="anonymous" /> : null}
          </PreviewCover>

          {post.title && (
            <Text
              strong
              style={{
                color: '#fff',
                display: 'block',
                marginBottom: 4,
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {post.title}
            </Text>
          )}

          {post.userNickname && (
            <Text style={{ color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 8, fontSize: 12 }}>
              @{post.userNickname}
            </Text>
          )}

          <PromptBlock>
            <div className="label">
              <FormattedMessage id="post.prompt" defaultMessage="提示词" />
            </div>
            <div className="content">{promptText}</div>
          </PromptBlock>

          <PreviewFooter>
            <div className="qr-wrap">
              <QRCodeCanvas value={shareUrl} size={88} level="M" includeMargin={false} />
            </div>
            <div className="hint">
              <div className="title">
                <FormattedMessage id="post.shareCard.scanHint" defaultMessage="扫码查看作品" />
              </div>
              <div className="url">{shareUrl.replace(/^https?:\/\//, '')}</div>
            </div>
          </PreviewFooter>
        </PreviewInner>
      </PreviewCard>

      <HiddenQr>
        <QRCodeCanvas ref={qrRef} value={shareUrl} size={120} level="M" includeMargin={false} />
      </HiddenQr>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Button icon={<LinkOutlined />} onClick={handleCopyLink} style={{ flex: 1 }}>
          <FormattedMessage id="post.shareCard.copyLink" defaultMessage="复制链接" />
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleDownloadImage}
          style={{ flex: 1 }}
        >
          <FormattedMessage id="post.shareCard.download" defaultMessage="保存分享图" />
        </Button>
      </div>
    </Modal>
  );
};

export default PostShareCardModal;
