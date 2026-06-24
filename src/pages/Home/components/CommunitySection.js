import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { motion } from 'framer-motion';
import { useIntl, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import {
  ArrowRightOutlined,
  CompassOutlined,
  FireOutlined,
  PictureOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { listChannels } from 'api/community';
import { COMMUNITY_CHANNELS_PATH, communityChannelPath } from 'utils/communityRoutes';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';

const HOME_CHANNEL_LIMIT = 6;
const HIDDEN_CHANNEL_KEYS = new Set(['daily-challenge']);

const StyledSection = styled(Section)`
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(180deg, #0a0a0a 0%, #111118 100%)'
      : 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)'};
  position: relative;
  overflow: hidden;
  padding: 100px 24px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 420px;
    background: radial-gradient(
      circle at 50% 0%,
      ${(p) => (p.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.07)')},
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const IntroBlock = styled(motion.div)`
  text-align: center;
  position: relative;
  z-index: 1;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  margin-bottom: 18px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: ${(p) => (p.theme.mode === 'dark' ? '#a5b4fc' : '#4f46e5')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.14)' : 'rgba(99, 102, 241, 0.08)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(129, 140, 248, 0.28)' : 'rgba(99, 102, 241, 0.14)')};
`;

const Highlights = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 20px;
  margin-top: 28px;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.55)')};
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6366f1;
    flex-shrink: 0;
  }
`;

const SectionCTA = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(99, 102, 241, 0.45);
  }

  @media (max-width: 768px) {
    margin-top: 20px;
    padding: 12px 22px;
    font-size: 14px;
  }
`;

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;
  z-index: 1;
  margin-top: 56px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 36px;
  }
`;

const SkeletonCard = styled.div`
  height: 320px;
  border-radius: 24px;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 260px;
    border-radius: 20px;
  }
`;

const ChannelCard = styled(motion.article)`
  position: relative;
  min-height: 320px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  background: #111;
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 56px rgba(0, 0, 0, 0.22);
    border-color: ${(p) => p.$accent || '#6366f1'}66;

    .cover {
      transform: scale(1.06);
      opacity: 0.72;
    }

    .arrow-btn {
      background: #fff;
      color: #111;
      width: 44px;
      height: 44px;
    }
  }

  .cover {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transition: transform 0.55s ease, opacity 0.35s ease;
    opacity: 0.88;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.92) 0%,
      rgba(0, 0, 0, 0.45) 42%,
      rgba(0, 0, 0, 0.12) 100%
    );
  }

  .content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 28px;
    z-index: 2;
  }

  .badge-row {
    position: absolute;
    top: 18px;
    left: 18px;
    right: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    z-index: 3;
  }

  .post-badge,
  .vip-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .post-badge {
    background: rgba(0, 0, 0, 0.42);
    color: #fff;
  }

  .vip-badge {
    background: rgba(250, 173, 20, 0.22);
    color: #ffe58f;
    border-color: rgba(250, 173, 20, 0.35);
  }

  h3 {
    margin: 0 0 10px;
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.78);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 92%;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
    gap: 12px;
  }

  .explore-label {
    font-size: 14px;
    font-weight: 600;
    color: ${(p) => p.$accent || '#a5b4fc'};
  }

  .arrow-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    min-height: 260px;
    border-radius: 20px;

    .content {
      padding: 20px;
    }

    h3 {
      font-size: 20px;
    }

    p {
      font-size: 13px;
      -webkit-line-clamp: 2;
    }
  }
`;

const EmptyHint = styled.p`
  text-align: center;
  margin: 40px 0 0;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)')};
`;

const getChannelAccent = (channel) => channel.themeColor || '#6366f1';

const getChannelCover = (channel) =>
  channel.coverUrl ||
  `linear-gradient(135deg, ${getChannelAccent(channel)} 0%, #111827 100%)`;

const CommunitySection = () => {
  const theme = useContext(ThemeContext);
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const data = await listChannels();
        if (!cancelled) {
          setChannels(data || []);
        }
      } catch {
        if (!cancelled) {
          setChannels([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchChannels();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayChannels = useMemo(
    () =>
      channels
        .filter((ch) => !HIDDEN_CHANNEL_KEYS.has(ch.channelKey))
        .slice(0, HOME_CHANNEL_LIMIT),
    [channels]
  );

  const handleChannelClick = (channel) => {
    if (channel.channelKey === 'daily-challenge') {
      navigate('/community/challenge');
      return;
    }
    navigate(communityChannelPath(channel.channelKey));
  };

  return (
    <StyledSection theme={theme}>
      <ContentWrapper>
        <IntroBlock
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Eyebrow theme={theme}>
            <PictureOutlined />
            <FormattedMessage id="home.community.eyebrow" defaultMessage="AI 生图频道" />
          </Eyebrow>
          <SectionTitle theme={theme}>
            <FormattedMessage
              id="home.community.title"
              defaultMessage="探索专业 AI 生图频道"
            />
          </SectionTitle>
          <SectionSubtitle theme={theme}>
            <FormattedMessage
              id="home.community.subtitle"
              defaultMessage="写实人像、动漫插画、商业海报、时尚影像……按风格与场景划分的官方策展频道，发现灵感、学习提示词、一键生成同款。"
            />
          </SectionSubtitle>
          <Highlights theme={theme}>
            <span>
              <span className="dot" />
              <FormattedMessage
                id="home.community.highlight.curated"
                defaultMessage="官方策展，按风格精准分流"
              />
            </span>
            <span>
              <span className="dot" />
              <FormattedMessage
                id="home.community.highlight.prompts"
                defaultMessage="优质作品与提示词开放浏览"
              />
            </span>
            <span>
              <span className="dot" />
              <FormattedMessage
                id="home.community.highlight.remix"
                defaultMessage="支持一键生成同款"
              />
            </span>
          </Highlights>
          <SectionCTA type="button" onClick={() => navigate(COMMUNITY_CHANNELS_PATH)}>
            <CompassOutlined />
            <FormattedMessage id="home.community.enterChannels" defaultMessage="浏览全部频道" />
            <ArrowRightOutlined />
          </SectionCTA>
        </IntroBlock>

        <ChannelGrid>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i}>
                  <Skeleton.Node active style={{ width: '100%', height: '100%' }} />
                </SkeletonCard>
              ))
            : displayChannels.map((channel, index) => {
                const accent = getChannelAccent(channel);
                const cover = getChannelCover(channel);
                const coverStyle = channel.coverUrl
                  ? { backgroundImage: `url(${channel.coverUrl})` }
                  : { background: cover };

                return (
                  <ChannelCard
                    key={channel.id}
                    theme={theme}
                    $accent={accent}
                    onClick={() => handleChannelClick(channel)}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                  >
                    <div className="cover" style={coverStyle} />
                    <div className="overlay" />
                    <div className="badge-row">
                      <div className="post-badge">
                        <FireOutlined style={{ color: '#ff7875' }} />
                        <FormattedMessage
                          id="home.community.posts"
                          defaultMessage="{count} 个作品"
                          values={{ count: channel.postCount || 0 }}
                        />
                      </div>
                      {channel.isVipOnly && (
                        <div className="vip-badge">
                          <FormattedMessage id="home.community.vipOnly" defaultMessage="VIP 专属" />
                        </div>
                      )}
                    </div>
                    <div className="content">
                      <h3>{channel.name}</h3>
                      <p>
                        {channel.description ||
                          intl.formatMessage({
                            id: 'home.community.channelFallback',
                            defaultMessage: '加入频道，浏览与分享 AI 生图作品。',
                          })}
                      </p>
                      <div className="footer">
                        <span className="explore-label" style={{ color: accent }}>
                          <FormattedMessage
                            id="home.community.exploreChannel"
                            defaultMessage="进入频道"
                          />
                        </span>
                        <div className="arrow-btn">
                          <RightOutlined />
                        </div>
                      </div>
                    </div>
                  </ChannelCard>
                );
              })}
        </ChannelGrid>

        {!loading && displayChannels.length === 0 && (
          <EmptyHint theme={theme}>
            <FormattedMessage
              id="home.community.empty"
              defaultMessage="频道筹备中，敬请期待"
            />
          </EmptyHint>
        )}
      </ContentWrapper>
    </StyledSection>
  );
};

export default CommunitySection;
