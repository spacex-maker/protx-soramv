import React, { useEffect, useState } from 'react';
import { Skeleton, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RightOutlined, FireFilled, CrownOutlined } from '@ant-design/icons';
import { listChannels } from 'api/community';
import { communityChannelPath } from 'utils/communityRoutes';
import ExploreChannelsExoApe from './ExploreChannelsExoApe';
import ExploreChannelsApple from './ExploreChannelsApple';
import ExploreChannelsReveal from './ExploreChannelsReveal';
import ExploreChannelsBento from './ExploreChannelsBento';
import ExploreChannelsCoverflow from './ExploreChannelsCoverflow';
import {
  EXPLORE_VIEW_EXO_APE,
  EXPLORE_VIEW_APPLE,
  EXPLORE_VIEW_REVEAL,
  EXPLORE_VIEW_BENTO,
  EXPLORE_VIEW_COVERFLOW,
} from './exploreLayoutModes';

const getAccent = (channel) => channel.themeColor || '#6366f1';

const ChannelGrid = styled.div`
  display: grid;
  width: 100%;
  box-sizing: border-box;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StyledChannelCard = styled(motion.article)`
  position: relative;
  min-height: 280px;
  border-radius: 32px;
  overflow: hidden;
  cursor: pointer;
  background: #0a0a0f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);

  .bg-img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
    opacity: 0.85;
  }

  .content-blur {
    position: absolute;
    inset: 0;
    z-index: 3;
    background: linear-gradient(165deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.35) 40%, rgba(0, 0, 0, 0.92) 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 28px 32px;
  }

  .top-row {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 5;
  }

  .meta-tag,
  .vip-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .meta-tag {
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
  }

  .vip-badge {
    background: rgba(250, 173, 20, 0.25);
    color: #ffe58f;
    border-color: rgba(250, 173, 20, 0.4);
  }

  h3 {
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 10px;
    line-height: 1.1;
    max-width: 90%;
  }

  p {
    color: rgba(255, 255, 255, 0.78);
    font-size: 14px;
    margin: 0 0 16px;
    max-width: 85%;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .enter-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: ${({ $accent }) => $accent || '#a5b4fc'};
  }

  .arrow-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all 0.35s ease;
    margin-left: 4px;
  }

  &:hover {
    border-color: ${({ $accent }) => `${$accent}88`};
    box-shadow: 0 24px 64px ${({ $accent }) => `${$accent}33`};
    transform: translateY(-8px);

    .bg-img {
      transform: scale(1.08);
      opacity: 0.95;
    }

    .arrow-btn {
      background: #fff;
      color: #0a0a0f;
    }
  }

  @media (max-width: 768px) {
    border-radius: 20px;
    min-height: 240px;
    .content-blur { padding: 20px; }
  }
`;

const SkeletonWrapper = styled.div`
  width: 100%;
  border-radius: 28px;
  overflow: hidden;
  min-height: 240px;
`;

const ExploreChannels = ({ layout = 'default', viewMode = EXPLORE_VIEW_BENTO }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const isSciFi = layout === 'bold';

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const data = await listChannels();
      setChannels(data || []);
    } catch {
      message.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = (channel) => {
    if (channel.channelKey === 'daily-challenge') {
      navigate('/community/challenge');
    } else {
      navigate(communityChannelPath(channel.channelKey));
    }
  };

  const fallbackDesc = intl.formatMessage({
    id: 'home.community.channelFallback',
    defaultMessage: '加入频道，浏览与分享 AI 生图作品。',
  });

  if (isSciFi) {
    if (viewMode === EXPLORE_VIEW_APPLE) {
      return <ExploreChannelsApple channels={channels} loading={loading} />;
    }
    if (viewMode === EXPLORE_VIEW_REVEAL) {
      return <ExploreChannelsReveal channels={channels} loading={loading} />;
    }
    if (viewMode === EXPLORE_VIEW_BENTO) {
      return <ExploreChannelsBento channels={channels} loading={loading} />;
    }
    if (viewMode === EXPLORE_VIEW_COVERFLOW) {
      return <ExploreChannelsCoverflow channels={channels} loading={loading} />;
    }
    return <ExploreChannelsExoApe channels={channels} loading={loading} />;
  }

  const renderChannelCard = (channel) => {
    const accent = getAccent(channel);
    const coverStyle = channel.coverUrl
      ? { backgroundImage: `url(${channel.coverUrl})` }
      : { background: `linear-gradient(135deg, ${accent} 0%, #0a0a0f 100%)` };

    return (
      <StyledChannelCard
        key={channel.id}
        $accent={accent}
        onClick={() => handleChannelClick(channel)}
      >
        <div className="bg-img" style={coverStyle} />
        <div className="top-row">
          <div className="meta-tag">
            <FireFilled style={{ color: '#ff7875' }} />
            {channel.postCount || 0}
          </div>
          {channel.isVipOnly && (
            <div className="vip-badge">
              <CrownOutlined />
              VIP
            </div>
          )}
        </div>
        <div className="content-blur">
          <h3>{channel.name}</h3>
          <p>{channel.description || fallbackDesc}</p>
          <div className="enter-row">
            <FormattedMessage id="home.community.exploreChannel" defaultMessage="进入频道" />
            <span className="arrow-btn">
              <RightOutlined />
            </span>
          </div>
        </div>
      </StyledChannelCard>
    );
  };

  return (
    <ChannelGrid>
      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <SkeletonWrapper key={i}>
              <Skeleton.Node active style={{ width: '100%', height: '100%', minHeight: 240 }} />
            </SkeletonWrapper>
          ))
        : channels.map(renderChannelCard)}
    </ChannelGrid>
  );
};

export default ExploreChannels;
