import React, { useEffect, useState } from 'react';
import { Row, Col, Skeleton, message, Typography, Avatar, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { css, keyframes } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { listChannels, getCurrentChallenge } from 'api/community';
import { RightOutlined, FireFilled, CompassOutlined } from '@ant-design/icons';
import FooterSection from 'pages/Home/components/FooterSection';
import UserStatusDock from 'components/community/UserStatusDock';

// 引入你之前设计的组件
import CommunityContributors from './CommunityContributors';
import ThePromptverse from './ThePromptverse';
import RealitySlider from './RealitySlider';
import BentoGrid from './BentoGrid';
import RecipeTimeline from './RecipeTimeline';
import MaterialLab from './MaterialLab';

const { Title, Paragraph, Text } = Typography;

// --- 动效定义 ---

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const ambientPulse = keyframes`
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
  100% { opacity: 0.3; transform: scale(1); }
`;

// --- 全局容器与背景 ---

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  // 深色模式下使用深灰偏蓝的底色，更有科技感
  background: ${props => props.theme.mode === 'dark' ? '#0a0a0b' : '#f5f7fa'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  position: relative;
  overflow-x: hidden;
`;

// 环境光背景层 (Atmosphere Layer)
const AmbientBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  // 噪点纹理，增加胶片质感
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: ${props => props.theme.mode === 'dark' ? 0.07 : 0.4};
    z-index: 1;
  }

  // 左上角光晕
  .orb-1 {
    position: absolute;
    top: -10%;
    left: -10%;
    width: 50vw;
    height: 50vw;
    background: radial-gradient(circle, rgba(131, 56, 236, 0.15) 0%, transparent 70%);
    filter: blur(80px);
    animation: ${ambientPulse} 10s infinite ease-in-out;
  }

  // 右下角光晕
  .orb-2 {
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 60vw;
    height: 60vw;
    background: radial-gradient(circle, rgba(58, 134, 255, 0.1) 0%, transparent 70%);
    filter: blur(100px);
    animation: ${ambientPulse} 15s infinite ease-in-out reverse;
  }
`;

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1600px; // 更宽的容器，显得更开阔
  margin: 0 auto;
  padding: 0 40px;
  padding-bottom: 120px;

  @media (max-width: 768px) {
    padding: 0 20px;
    padding-bottom: 80px;
  }
`;

// --- 板块分割与布局 ---

// 通用板块容器，控制垂直节奏
const SectionWrapper = styled.section`
  margin-bottom: 140px; // 巨大的间距是“大气”的关键
  position: relative;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-fill-mode: both;

  // 可以在这里给每个板块添加 subtle 的分割线或背景装饰
  &:nth-child(even) {
     // 偶数板块可以有一些特殊的装饰，比如背景侧边的光
  }

  @media (max-width: 768px) {
    margin-bottom: 80px;
  }
`;

// 专门用于 Hero 区域的容器
const HeroWrapper = styled.div`
  min-height: 90vh; // 占据第一屏的大部分
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding-top: 80px;
  margin-bottom: 60px;
`;

// --- 顶部用户状态栏 ---

const UserStatusDockWrapper = styled.div`
  position: fixed;
  top: 100px;
  right: 40px;
  z-index: 50;
  transition: all 0.3s ease;

  @media (max-width: 1200px) {
    display: none; // 小屏幕时隐藏悬浮，依靠 Header
  }
`;

// --- 标题组件 ---

const SectionHeader = styled.div`
  margin-bottom: 60px;
  text-align: ${props => props.$center ? 'center' : 'left'};
  position: relative;

  .subtitle-badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 100px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
    color: ${props => props.theme.mode === 'dark' ? '#8338ec' : '#6200ea'};
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.3)' : 'rgba(98, 0, 234, 0.1)'};
  }

  h2 {
    font-size: 42px;
    font-weight: 800;
    margin: 0 0 16px 0;
    letter-spacing: -1px;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#111'};
  }

  p {
    font-size: 18px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#666'};
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    ${props => !props.$center && 'margin: 0;'}
  }

  @media (max-width: 768px) {
    h2 { font-size: 32px; }
    margin-bottom: 40px;
  }
`;

// --- 频道卡片 (保持你的逻辑但增强样式) ---

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;
  width: 100%;
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
      backdrop-filter: blur(0px); // 悬停时清晰
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
    }

    .arrow-btn {
      width: 48px;
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
`;

// --- 主页面组件 ---

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
      // 模拟一点延迟以展示骨架屏
      await new Promise(resolve => setTimeout(resolve, 600)); 
      const data = await listChannels();
      setChannels(data);
    } catch (error) {
      message.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = async (channel) => {
    if (channel.channelKey === 'daily-challenge') {
      try {
        const currentChallenge = await getCurrentChallenge();
        navigate(currentChallenge?.id ? `/community/challenge/${currentChallenge.id}` : `/community/challenge`);
      } catch (error) {
        navigate(`/community/challenge`);
      }
    } else {
      navigate(`/community/${channel.channelKey}`);
    }
  };

  return (
    <PageLayout>
      <AmbientBackground>
        <div className="orb-1" />
        <div className="orb-2" />
      </AmbientBackground>

      <SimpleHeader />

      {/* 侧边悬浮的用户信息，只在大屏显示，不干扰主视觉 */}
      <UserStatusDockWrapper>
        <UserStatusDock />
      </UserStatusDockWrapper>

      <MainContent>
        
        {/* 1. Hero Area: Promptverse (整合了标题和输入) */}
        <HeroWrapper>
          <ThePromptverse />
        </HeroWrapper>

        {/* 2. Bento Grid: 热门内容橱窗 */}
        <SectionWrapper>
          <SectionHeader $center>
            <span className="subtitle-badge">Trending Now</span>
            <h2>Discover Inspiration</h2>
            <p>Dive into the most popular creations generated by the community this week.</p>
          </SectionHeader>
          <BentoGrid />
        </SectionWrapper>

        {/* 3. Reality Slider: 虚实对比 (核心差异点) */}
        <SectionWrapper>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40 }}>
              <SectionHeader style={{ margin: 0 }}>
                <span className="subtitle-badge">From Bits to Atoms</span>
                <h2>Virtual to Reality</h2>
              </SectionHeader>
              <Button type="text" icon={<RightOutlined />}>View Production Gallery</Button>
           </div>
           <RealitySlider />
        </SectionWrapper>

        {/* 4. Channels List: 社区频道 */}
        <SectionWrapper>
          <SectionHeader>
             <span className="subtitle-badge"><CompassOutlined /> Communities</span>
             <h2>Explore Channels</h2>
          </SectionHeader>
          
          <ChannelGrid>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton.Node key={i} active style={{ width: '100%', height: 280, borderRadius: 32 }} />
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
        </SectionWrapper>

        {/* 5. Recipe Timeline: 教程流 */}
        <SectionWrapper>
          <SectionHeader $center>
            <span className="subtitle-badge">Workflows</span>
            <h2>How It's Made</h2>
          </SectionHeader>
          <RecipeTimeline />
        </SectionWrapper>

        {/* 6. Material Lab: 商业转化 */}
        <SectionWrapper>
          <MaterialLab />
        </SectionWrapper>

        {/* 7. Contributors: 底部致谢 */}
        <SectionWrapper style={{ marginBottom: 40 }}>
          <SectionHeader $center>
             <h2>Top Contributors</h2>
          </SectionHeader>
          <CommunityContributors />
        </SectionWrapper>

      </MainContent>

      {/* Footer */}
      <FooterSection />
    </PageLayout>
  );
};

export default CommunityPage;