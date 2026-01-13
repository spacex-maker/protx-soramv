import React, { useState, useCallback } from 'react';
import { Button, Modal, message, Input, Tooltip } from 'antd';
import { 
  ShareAltOutlined, 
  LinkOutlined, 
  WechatOutlined, 
  WeiboOutlined,
  TwitterOutlined,
  FacebookOutlined,
  QrcodeOutlined,
  CopyOutlined,
  CheckOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { DetailCard, ShareButtonGrid, ShareButton, QRCodeContainer, ShareLinkInput } from './styled';

const ShareCard = ({ challenge }) => {
  const intl = useIntl();
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // 获取当前页面URL
  const getShareUrl = useCallback(() => {
    if (!challenge?.id) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/community/challenge/${challenge.id}`;
  }, [challenge?.id]);

  const shareUrl = getShareUrl();
  const shareTitle = challenge?.title || '';
  const shareDescription = challenge?.description || '';

  // 复制链接到剪贴板
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      message.success(intl.formatMessage({ 
        id: 'challenge.share.linkCopied', 
        defaultMessage: 'Link copied to clipboard!' 
      }));
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setLinkCopied(true);
        message.success(intl.formatMessage({ 
          id: 'challenge.share.linkCopied', 
          defaultMessage: 'Link copied to clipboard!' 
        }));
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err2) {
        message.error(intl.formatMessage({ 
          id: 'challenge.share.copyFailed', 
          defaultMessage: 'Failed to copy link' 
        }));
      }
      document.body.removeChild(textArea);
    }
  }, [shareUrl, intl]);

  // 分享到微信（通过二维码）
  const handleWechatShare = () => {
    setQrModalVisible(true);
  };

  // 分享到微博
  const handleWeiboShare = () => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(shareTitle);
    const pic = challenge?.coverUrl ? encodeURIComponent(challenge.coverUrl) : '';
    window.open(
      `https://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=${pic}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // 分享到Twitter
  const handleTwitterShare = () => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`${shareTitle} - ${shareDescription.substring(0, 100)}`);
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // 分享到Facebook
  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // 生成二维码URL（使用在线API）
  const getQRCodeUrl = () => {
    const url = encodeURIComponent(shareUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${url}`;
  };

  // 下载二维码
  const handleDownloadQR = () => {
    const qrUrl = getQRCodeUrl();
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `challenge-${challenge?.id || 'share'}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(intl.formatMessage({ 
      id: 'challenge.share.qrDownloaded', 
      defaultMessage: 'QR code downloaded!' 
    }));
  };

  return (
    <>
      <DetailCard>
        <div style={{ marginBottom: 20 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            marginBottom: 16
          }}>
            <ShareAltOutlined style={{ fontSize: 18, color: '#1890ff' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              <FormattedMessage id="challenge.share" defaultMessage="Share Challenge" />
            </span>
          </div>
          
          <ShareButtonGrid>
            <Tooltip title={intl.formatMessage({ id: 'challenge.share.copyLink', defaultMessage: 'Copy Link' })}>
              <ShareButton onClick={handleCopyLink} className="copy-link">
                {linkCopied ? <CheckOutlined /> : <CopyOutlined />}
                <span>
                  <FormattedMessage id="challenge.share.copy" defaultMessage="Copy" />
                </span>
              </ShareButton>
            </Tooltip>

            <Tooltip title={intl.formatMessage({ id: 'challenge.share.wechat', defaultMessage: 'Share to WeChat' })}>
              <ShareButton onClick={handleWechatShare} className="wechat">
                <WechatOutlined />
                <span>
                  <FormattedMessage id="challenge.share.wechat" defaultMessage="WeChat" />
                </span>
              </ShareButton>
            </Tooltip>

            <Tooltip title={intl.formatMessage({ id: 'challenge.share.weibo', defaultMessage: 'Share to Weibo' })}>
              <ShareButton onClick={handleWeiboShare} className="weibo">
                <WeiboOutlined />
                <span>
                  <FormattedMessage id="challenge.share.weibo" defaultMessage="Weibo" />
                </span>
              </ShareButton>
            </Tooltip>

            <Tooltip title={intl.formatMessage({ id: 'challenge.share.twitter', defaultMessage: 'Share to Twitter' })}>
              <ShareButton onClick={handleTwitterShare} className="twitter">
                <TwitterOutlined />
                <span>
                  <FormattedMessage id="challenge.share.twitter" defaultMessage="Twitter" />
                </span>
              </ShareButton>
            </Tooltip>

            <Tooltip title={intl.formatMessage({ id: 'challenge.share.facebook', defaultMessage: 'Share to Facebook' })}>
              <ShareButton onClick={handleFacebookShare} className="facebook">
                <FacebookOutlined />
                <span>
                  <FormattedMessage id="challenge.share.facebook" defaultMessage="Facebook" />
                </span>
              </ShareButton>
            </Tooltip>

            <Tooltip title={intl.formatMessage({ id: 'challenge.share.qrcode', defaultMessage: 'Show QR Code' })}>
              <ShareButton onClick={() => setQrModalVisible(true)} className="qrcode">
                <QrcodeOutlined />
                <span>
                  <FormattedMessage id="challenge.share.qr" defaultMessage="QR Code" />
                </span>
              </ShareButton>
            </Tooltip>
          </ShareButtonGrid>

          <ShareLinkInput style={{ marginTop: 16 }}>
            <Input
              value={shareUrl}
              readOnly
              prefix={<LinkOutlined />}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={linkCopied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={handleCopyLink}
                  style={{ color: linkCopied ? '#52c41a' : '#1890ff' }}
                />
              }
            />
          </ShareLinkInput>
        </div>
      </DetailCard>

      {/* 二维码模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrcodeOutlined />
            <FormattedMessage id="challenge.share.qrcode" defaultMessage="QR Code" />
          </div>
        }
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={handleDownloadQR}>
            <FormattedMessage id="challenge.share.downloadQR" defaultMessage="Download QR Code" />
          </Button>,
          <Button key="close" type="primary" onClick={() => setQrModalVisible(false)}>
            <FormattedMessage id="common.close" defaultMessage="Close" />
          </Button>
        ]}
        width={400}
        centered
      >
        <QRCodeContainer>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img 
              src={getQRCodeUrl()} 
              alt="QR Code" 
              style={{ 
                width: 300, 
                height: 300, 
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: 12,
                background: '#fff'
              }} 
            />
          </div>
          <div style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>
            <FormattedMessage 
              id="challenge.share.qrTip" 
              defaultMessage="Scan QR code to view challenge" 
            />
          </div>
          <ShareLinkInput style={{ marginTop: 16 }}>
            <Input
              value={shareUrl}
              readOnly
              prefix={<LinkOutlined />}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={linkCopied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={handleCopyLink}
                  style={{ color: linkCopied ? '#52c41a' : '#1890ff' }}
                />
              }
            />
          </ShareLinkInput>
        </QRCodeContainer>
      </Modal>
    </>
  );
};

export default ShareCard;

