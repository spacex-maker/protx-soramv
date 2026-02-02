import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, LinkOutlined, UserOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { useLocale } from 'contexts/LocaleContext';
import OpenRobotXHeader from '../components/OpenRobotXHeader';
import FooterSection from '../components/FooterSection';
import { getNewsById, likeNews } from '../../../api/openrobotx';

const addImageCompressSuffix = (url, width = 1200) => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const PageWrap = styled.div`
  min-height: 100vh;
  background: #0a0e17;
  color: #e8eaed;
  padding-top: 72px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ContentWrap = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 80px;
  @media (max-width: 768px) {
    padding: 32px 16px 64px;
  }
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  padding: 8px 0;
  font-size: 14px;
  color: #9aa0a6;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #00d4aa;
  }
`;

const Article = styled.article`
  .news-cover {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 32px;
    background: rgba(0, 0, 0, 0.3);
    img {
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: cover;
      display: block;
    }
  }
  .news-type {
    display: inline-block;
    font-size: 12px;
    color: #00d4aa;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 12px;
  }
  .news-title {
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.3;
    color: #fff;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
  }
  .news-meta-top {
    font-size: 14px;
    color: #9aa0a6;
    margin-bottom: 12px;
    line-height: 1.5;
    .anticon { margin-right: 4px; opacity: 0.8; }
    .meta-sep { margin: 0 10px; color: rgba(255,255,255,0.2); user-select: none; }
  }
  .news-meta-source {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #00d4aa;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  }
  .news-body {
    font-size: 17px;
    line-height: 1.75;
    color: #e8eaed;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
    overflow-x: hidden;
  }
  .news-body p, .news-body li, .news-body div, .news-body span, .news-body blockquote {
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  }
  .news-body h1, .news-body h2, .news-body h3 {
    color: #fff;
    margin-top: 28px;
    margin-bottom: 12px;
    font-weight: 600;
  }
  .news-body p { margin-bottom: 16px; }
  .news-body ul, .news-body ol {
    margin-bottom: 16px;
    padding-left: 1.5em;
  }
  .news-body img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }
  .news-body a {
    color: #00d4aa;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
  .news-body blockquote {
    margin: 20px 0;
    padding: 12px 20px;
    border-left: 4px solid #00d4aa;
    background: rgba(0, 212, 170, 0.06);
    color: #9aa0a6;
    border-radius: 0 8px 8px 0;
  }
  .news-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 14px;
    color: #9aa0a6;
    .anticon { margin-right: 6px; opacity: 0.8; }
    .news-like-btn {
      padding: 8px 20px;
      font-size: 14px;
      border-radius: 9999px;
      border: 1px solid #00d4aa;
      background: rgba(0, 212, 170, 0.1);
      color: #00d4aa;
      cursor: pointer;
      transition: background 0.2s, opacity 0.2s;
    }
    .news-like-btn:hover:not(:disabled) {
      background: rgba(0, 212, 170, 0.2);
    }
    .news-like-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
`;

const SpinWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const NEWS_TYPE_LABELS = { 1: '快讯', 2: '深度文章', 3: '融资财报', 4: '发布会' };

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

/** 根据当前语言取资讯标题 / 摘要 / 正文 */
const getNewsTitle = (item, isZh) =>
  isZh ? (item.titleCn || item.title || '') : (item.title || item.titleCn || '');
const getNewsSummary = (item, isZh) =>
  isZh ? (item.summaryCn || item.summary || '') : (item.summary || item.summaryCn || '');
const getNewsContent = (item, isZh) =>
  isZh ? (item.contentCn || item.content || '') : (item.content || item.contentCn || '');

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { locale } = useLocale();
  const isZh = !locale || locale === 'zh-CN' || String(locale).toLowerCase().startsWith('zh');
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const res = await getNewsById(id);
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) {
        setNews(res.data);
      } else {
        setNotFound(true);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [id]);

  const handleLike = async () => {
    if (!news?.id || hasLiked || likeLoading) return;
    setLikeLoading(true);
    const res = await likeNews(news.id);
    setLikeLoading(false);
    if (res.success) {
      setHasLiked(true);
      setNews((prev) => prev ? { ...prev, likeCount: (prev.likeCount ?? 0) + 1 } : null);
    }
  };

  if (notFound) return <Navigate to="/openrobotx/news" replace />;
  if (loading) {
    return (
      <PageWrap>
        <OpenRobotXHeader />
        <SpinWrap><Spin size="large" /></SpinWrap>
      </PageWrap>
    );
  }
  if (!news) return null;

  const title = getNewsTitle(news, isZh) || '资讯';
  const summary = getNewsSummary(news, isZh);
  const bodyHtml = getNewsContent(news, isZh);
  const typeLabel = NEWS_TYPE_LABELS[news.newsType] || '资讯';

  return (
    <PageWrap>
      <Helmet>
        <title>{title} | Open Robot X 行业资讯</title>
        <meta name="description" content={summary} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={summary} />
        <meta property="og:type" content="article" />
      </Helmet>
      <OpenRobotXHeader />
      <ContentWrap>
        <BackBtn type="button" onClick={() => navigate('/openrobotx/news')}>
          <ArrowLeftOutlined /> 返回资讯列表
        </BackBtn>
        <Article>
          {news.coverImage && (
            <div className="news-cover">
              <img src={addImageCompressSuffix(news.coverImage, 1200)} alt="" />
            </div>
          )}
          <span className="news-type">{typeLabel}</span>
          <h1 className="news-title">{title}</h1>
          <div className="news-meta-top">
            {news.publishTime && (
              <>
                <span><CalendarOutlined /> {formatDate(news.publishTime)}</span>
                {(news.sourceName || news.author || news.relatedCompany) && <span className="meta-sep">|</span>}
              </>
            )}
            {news.sourceName && <span>{news.sourceName}</span>}
            {news.sourceName && news.author && <span className="meta-sep">|</span>}
            {news.author && (
              <span><UserOutlined /> {news.author}</span>
            )}
            {news.relatedCompany && (
              <>
                {(news.sourceName || news.author) && <span className="meta-sep">|</span>}
                <span>{news.relatedCompany}</span>
              </>
            )}
          </div>
          {news.sourceUrl && (
            <div className="news-meta-source">
              <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer">
                <LinkOutlined /> 阅读原文
              </a>
            </div>
          )}
          <div
            className="news-body"
            dangerouslySetInnerHTML={{ __html: bodyHtml || `<p>${summary || '暂无正文'}</p>` }}
          />
          <div className="news-footer">
            <span>
              <EyeOutlined /> {news.viewCount ?? 0} 次浏览
              <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.2)' }}>·</span>
              <LikeOutlined /> {news.likeCount ?? 0} 点赞
            </span>
            <button
              type="button"
              className="news-like-btn"
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              disabled={hasLiked || likeLoading}
            >
              <LikeOutlined /> {hasLiked ? '已点赞' : (likeLoading ? '...' : '点赞')}
            </button>
          </div>
        </Article>
      </ContentWrap>
      <FooterSection />
    </PageWrap>
  );
};

export default NewsDetailPage;
