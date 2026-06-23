import React, { useEffect, useState } from 'react';
import { Skeleton, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import { RightOutlined, FireFilled, CompassOutlined } from '@ant-design/icons';
import { listChannels } from 'api/community';

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;
  width: 100%;
  padding: 0 env(safe-area-inset-right) 0 env(safe-area-inset-left);
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 max(16px, env(safe-area-inset-left)) 0 max(16px, env(safe-area-inset-right));
  }
`;

const SkeletonWrapper = styled.div`
  width: 100%;
  height: 280px;
  border-radius: 32px;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 200px;
    border-radius: 20px;
  }
`;

const StyledChannelCard = styled.div`
  position: relative;
  height: 280px;
  border-radius: 32px;
  overflow: hidden;
  cursor: pointer;
  background: #000;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1px solid rgba(255,255,255,0.1);

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    border-color: rgba(255,255,255,0.3);

    .bg-img {
      transform: scale(1.1);
      opacity: 0.6;
    }

    .content-blur {
      backdrop-filter: blur(0px);
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
    }

    .arrow-btn {
      width: 48px;
      height: 48px;
      background: #fff;
      color: #000;
    }
  }

  .bg-img {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-size: cover;
    background-position: center;
    transition: all 0.6s ease;
    opacity: 0.8;
  }

  .content-blur {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 32px;
    transition: all 0.4s ease;
  }

  .meta-tag {
    position: absolute;
    top: 24px;
    right: 24px;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
    padding: 6px 12px;
    border-radius: 100px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid rgba(255,255,255,0.2);
  }

  h3 {
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px 0;
    text-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }

  p {
    color: rgba(255,255,255,0.8);
    font-size: 14px;
    margin: 0;
    max-width: 80%;
    line-height: 1.5;
  }

  .arrow-btn {
    position: absolute;
    bottom: 32px;
    right: 32px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    height: 200px;
    border-radius: 20px;

    &:hover {
      transform: translateY(-4px);
    }

    &:active {
      transform: scale(0.98);
    }

    .content-blur {
      padding: 20px;
    }

    .meta-tag {
      top: 16px;
      right: 16px;
      padding: 5px 10px;
      font-size: 11px;
    }

    h3 {
      font-size: 20px;
      margin-bottom: 4px;
    }

    p {
      font-size: 13px;
      max-width: 85%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .arrow-btn {
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      font-size: 14px;
    }

    &:hover .arrow-btn {
      width: 40px;
      height: 40px;
    }
  }
`;

const ExploreChannels = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); 
      const data = await listChannels();
      setChannels(data);
    } catch (error) {
      message.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = (channel) => {
    if (channel.channelKey === 'daily-challenge') {
      navigate('/community/challenge');
    } else {
      navigate(`/community/${channel.channelKey}`);
    }
  };

  return (
    <ChannelGrid>
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <SkeletonWrapper key={i}>
            <Skeleton.Node active style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
          </SkeletonWrapper>
        ))
      ) : (
        channels.map(channel => (
          <StyledChannelCard key={channel.id} onClick={() => handleChannelClick(channel)}>
            <div 
              className="bg-img" 
              style={{ backgroundImage: channel.coverUrl ? `url(${channel.coverUrl})` : 'linear-gradient(45deg, #111, #333)' }} 
            />
            <div className="content-blur">
              <h3>{channel.name}</h3>
              <p>{channel.description || 'Join the discussion and share your creations.'}</p>
            </div>
            <div className="meta-tag">
               <FireFilled style={{ color: '#ff4d4f', marginRight: 4 }} />
               {channel.postCount || 0}
            </div>
            <div className="arrow-btn">
              <RightOutlined />
            </div>
          </StyledChannelCard>
        ))
      )}
    </ChannelGrid>
  );
};

export default ExploreChannels;
