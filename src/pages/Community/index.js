import React, { useEffect, useState } from 'react';
import { Row, Col, Skeleton, message, Typography, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { css, keyframes } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { listChannels } from 'api/community';
import { RightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// 动画定义
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// 炫彩渐变流动动画
const rainbowFlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? '#000000' : '#ffffff'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  display: flex;
  flex-direction: column;
  padding-top: 60px;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 60px 40px;
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

// 头部区域设计：大标题 + 引导语
const HeroSection = styled.div`
  margin-bottom: 60px;
  
  .hero-title {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 16px;
    letter-spacing: -1px;
    background: linear-gradient(
      90deg,
      #ff006e 0%,
      #8338ec 20%,
      #3a86ff 40%,
      #06ffa5 60%,
      #ffbe0b 80%,
      #ff006e 100%
    );
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${rainbowFlow} 3s ease infinite;
    filter: brightness(1.1);
  }

  .hero-subtitle {
    font-size: 18px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
    max-width: 600px;
    line-height: 1.6;
  }
`;

// 卡片容器：去除 Antd Card 默认样式，完全自定义
const StyledCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3; // 更高的卡片比例
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f0f2f5'};
  transform: translateZ(0); // 开启硬件加速
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

    .bg-image {
      transform: scale(1.08);
    }

    .arrow-icon {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

// 背景图片层
const CardBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 0;
`;

// 渐变遮罩层：保证文字可读性，同时不遮挡图片美感
const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 1;
`;

// 内容层
const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 32px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  // 无论深浅色模式，卡片内的文字永远是白色的，因为背景是深色遮罩
  color: #fff;

  .header-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .channel-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    margin-left: 12px;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .channel-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.5;
    margin-bottom: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 90%;
  }
`;

// 右上角的装饰或统计
const TopBadge = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 6px;
`;

// 悬浮时出现的箭头
const ArrowIcon = styled(RightOutlined)`
  position: absolute;
  bottom: 36px;
  right: 32px;
  font-size: 20px;
  color: #fff;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  z-index: 3;
`;

// 骨架屏样式适配
const StyledSkeleton = styled(Skeleton.Node)`
  width: 100% !important;
  height: 100% !important;
  aspect-ratio: 4 / 3;
  border-radius: 24px;
  
  .ant-skeleton-image {
    width: 100%;
    height: 100%;
    border-radius: 24px;
  }
`;

const CommunityPage = () => {
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
      // 模拟一点延迟，让骨架屏展示一下，更有质感
      const data = await listChannels();
      // await new Promise(resolve => setTimeout(resolve, 800)); 
      setChannels(data);
    } catch (error) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'community.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = (channel) => {
    // 如果是每日挑战频道，跳转到挑战页面
    if (channel.channelKey === 'daily-challenge') {
      // 可以传递当前挑战ID，如果没有则使用默认值1
      navigate(`/community/challenge/1`);
    } else {
      navigate(`/community/${channel.channelKey}`);
    }
  };

  return (
    <PageLayout>
      <SimpleHeader />
      <Container>
        {/* Hero Section */}
        <HeroSection>
          <div className="hero-title">
            <FormattedMessage id="community.explore.title" defaultMessage="Explore Communities" />
          </div>
          <div className="hero-subtitle">
            <FormattedMessage 
              id="community.explore.subtitle" 
              defaultMessage="Discover inspiration, remix workflows, and connect with thousands of AI creators." 
            />
          </div>
        </HeroSection>

        <Row gutter={[32, 32]}>
          {loading ? (
            // Loading State: 使用骨架屏代替 Spinner
            Array.from({ length: 4 }).map((_, index) => (
              <Col xs={24} sm={12} md={8} lg={8} key={index}>
                <StyledSkeleton active />
              </Col>
            ))
          ) : (
            channels.map((channel) => (
              <Col xs={24} sm={12} md={8} lg={8} key={channel.id}>
                <StyledCard onClick={() => handleChannelClick(channel)}>
                  {/* 背景图 */}
                  <CardBackground 
                    className="bg-image"
                    style={{
                      backgroundImage: channel.coverUrl 
                        ? `url(${channel.coverUrl})` 
                        : `linear-gradient(135deg, ${channel.themeColor || '#1890ff'}, #000)`
                    }} 
                  />
                  
                  {/* 渐变遮罩 */}
                  <CardOverlay />

                  {/* 右上角标签 (例如作品数) */}
                  <TopBadge>
                    <div style={{width: 6, height: 6, borderRadius: '50%', background: '#52c41a'}} />
                    <FormattedMessage 
                      id="community.posts" 
                      defaultMessage="{count} posts" 
                      values={{ count: channel.postCount || 0 }} 
                    />
                  </TopBadge>

                  {/* 底部内容 */}
                  <CardContent>
                    <div className="header-row">
                      {/* 如果有Icon，显示Avatar */}
                      {channel.iconUrl && (
                         <Avatar 
                            src={channel.iconUrl} 
                            size={40} 
                            shape="square" 
                            style={{ 
                                borderRadius: 10, 
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }} 
                         />
                      )}
                      <h3 className="channel-title">{channel.name}</h3>
                    </div>
                    
                    {channel.description && (
                      <p className="channel-desc">
                        {channel.description}
                      </p>
                    )}
                  </CardContent>

                  <ArrowIcon className="arrow-icon" />
                </StyledCard>
              </Col>
            ))
          )}
        </Row>

        {!loading && channels.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Typography.Text type="secondary" style={{ fontSize: 18 }}>
              <FormattedMessage id="community.empty" defaultMessage="暂无社区频道" />
            </Typography.Text>
          </div>
        )}
      </Container>
    </PageLayout>
  );
};

export default CommunityPage;