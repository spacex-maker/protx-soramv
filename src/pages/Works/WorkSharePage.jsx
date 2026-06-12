import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Button, Spin, Tag, message } from 'antd';
import {
  EyeOutlined,
  CopyOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import SimpleHeader from 'components/headers/simple';
import SEO from 'components/SEO';
import { buildWorkShareUrl, fetchPublicWorkShare } from 'api/genTaskShare';
import { isVideoUrl } from './genTaskWorksUtils';

const pulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
`;

const PageWrap = styled.div`
  min-height: 100vh;
  background: #050508;
  color: #fff;
  padding-top: 72px;
  padding-bottom: 48px;
`;

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
`;

const HeroCard = styled.div`
  border-radius: 24px;
  overflow: hidden;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
`;

const MediaStage = styled.div`
  position: relative;
  background: #000;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;

  img, video, audio {
    max-width: 100%;
    max-height: min(70vh, 640px);
    display: block;
  }

  video {
    width: 100%;
    background: #000;
  }

  .audio-wrap {
    width: 100%;
    padding: 48px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .audio-icon {
    width: 88px;
    height: 88px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    background: linear-gradient(135deg, rgba(19, 194, 194, 0.25), rgba(131, 56, 236, 0.25));
    animation: ${pulse} 2s ease-in-out infinite;
  }

  audio {
    width: min(100%, 520px);
  }
`;

const InfoSection = styled.div`
  padding: 24px 28px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const Title = styled.h1`
  margin: 0 0 16px;
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 700;
  line-height: 1.4;
  color: #fff;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 120px 20px;
  color: rgba(255, 255, 255, 0.55);
`;

const WorkSharePage = () => {
  const { shareCode } = useParams();
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [work, setWork] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchPublicWorkShare(shareCode);
        if (cancelled) return;
        if (res.success && res.data) {
          setWork(res.data);
        } else {
          setError(res.message || intl.formatMessage({ id: 'works.share.notFound', defaultMessage: '分享作品不存在或已失效' }));
        }
      } catch (e) {
        if (!cancelled) {
          setError(intl.formatMessage({ id: 'works.share.loadFailed', defaultMessage: '加载分享作品失败' }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (shareCode) {
      load();
    } else {
      setLoading(false);
      setError(intl.formatMessage({ id: 'works.share.invalid', defaultMessage: '分享链接无效' }));
    }
    return () => { cancelled = true; };
  }, [shareCode, intl]);

  const handleCopyLink = useCallback(async () => {
    const url = buildWorkShareUrl(shareCode);
    try {
      await navigator.clipboard.writeText(url);
      message.success(intl.formatMessage({ id: 'works.linkCopied', defaultMessage: '链接已复制' }));
    } catch {
      message.info(url);
    }
  }, [shareCode, intl]);

  const mediaUrl = work?.resultUrls?.[0] || '';
  const mediaType = work?.mediaType || 'image';
  const isVideo = mediaType === 'video' || isVideoUrl(mediaUrl);
  const isAudio = mediaType === 'audio';

  return (
    <PageWrap>
      <SEO
        title={work?.title || intl.formatMessage({ id: 'works.share.pageTitle', defaultMessage: '作品分享' })}
        description={work?.title || 'AI creation shared on AI2OBJ'}
      />
      <SimpleHeader />

      <Container>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px 0' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <EmptyState>
            <p style={{ fontSize: 18, marginBottom: 24 }}>{error}</p>
            <Link to="/">
              <Button type="primary" icon={<HomeOutlined />}>
                <FormattedMessage id="works.share.backHome" defaultMessage="返回首页" />
              </Button>
            </Link>
          </EmptyState>
        ) : work && (
          <HeroCard>
            <MediaStage>
              {isAudio && mediaUrl ? (
                <div className="audio-wrap">
                  <div className="audio-icon"><SoundOutlined /></div>
                  <audio controls autoPlay src={mediaUrl} />
                </div>
              ) : isVideo && mediaUrl ? (
                <video controls autoPlay playsInline src={mediaUrl} poster={work.thumbnailUrl || undefined} />
              ) : mediaUrl ? (
                <img src={mediaUrl} alt={work.title} />
              ) : (
                <div style={{ padding: 48, color: 'rgba(255,255,255,0.4)' }}>
                  <FormattedMessage id="works.share.noMedia" defaultMessage="暂无可播放内容" />
                </div>
              )}
            </MediaStage>

            <InfoSection>
              <Title>{work.title}</Title>
              <MetaRow>
                {work.taskType && (
                  <Tag color="blue">{work.taskType.toUpperCase()}</Tag>
                )}
                {work.modelName && <Tag>{work.modelName}</Tag>}
                {work.voiceName && (
                  <Tag icon={<SoundOutlined />} color="purple">{work.voiceName}</Tag>
                )}
                {work.creatorName && (
                  <Tag color="cyan">
                    <FormattedMessage id="works.share.byCreator" defaultMessage="创作者：{name}" values={{ name: work.creatorName }} />
                  </Tag>
                )}
                <Tag icon={<EyeOutlined />} color="gold">
                  <FormattedMessage
                    id="works.share.viewCount"
                    defaultMessage="{count} 次播放"
                    values={{ count: work.viewCount ?? 0 }}
                  />
                </Tag>
              </MetaRow>

              <ActionRow>
                <Button type="primary" icon={<CopyOutlined />} onClick={handleCopyLink}>
                  <FormattedMessage id="works.share.copyLink" defaultMessage="复制分享链接" />
                </Button>
                <Link to="/signup">
                  <Button icon={<PlayCircleOutlined />}>
                    <FormattedMessage id="works.share.createYours" defaultMessage="我也要创作" />
                  </Button>
                </Link>
              </ActionRow>
            </InfoSection>
          </HeroCard>
        )}
      </Container>
    </PageWrap>
  );
};

export default WorkSharePage;
