import React, { useState, useEffect } from 'react';
import { Typography, Button } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import { RightOutlined, CompassOutlined } from '@ant-design/icons';
import FooterSection from 'pages/Home/components/FooterSection';
import UserStatusDock from 'components/community/UserStatusDock';

// 引入你之前设计的组件
import CommunityContributors from './CommunityContributors';
import ThePromptverse from './ThePromptverse';
import RealitySlider from './RealitySlider';
import BentoGrid from './BentoGrid';
import RecipeTimeline from './RecipeTimeline';
import MaterialLab from './MaterialLab';
import ExploreChannels from './channels/ExploreChannels';

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

  @media (max-width: 768px) {
    min-height: auto; // 移动端不强制高度，根据内容自适应
    padding-top: 40px; // 减少顶部间距
    padding-bottom: 40px; // 添加底部间距保持平衡
    margin-bottom: 40px; // 减少与下一个模块的间距
  }

  @media (max-width: 480px) {
    padding-top: 24px;
    padding-bottom: 24px;
    margin-bottom: 24px;
  }
`;

// --- 顶部用户状态栏 ---

const UserStatusDockWrapper = styled.div`
  position: fixed;
  top: ${props => props.top}px;
  right: ${props => props.right}px;
  z-index: 50;
  transition: ${props => props.isDragging ? 'none' : 'all 0.2s ease'};
  user-select: none;

  /* 拖动时禁用内部点击 */
  > *:not([data-drag-handle]) {
    pointer-events: ${props => props.isDragging ? 'none' : 'auto'};
  }

  @media (max-width: 1200px) {
    display: none;
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 32px;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  z-index: 10;
  background: ${props => props.isDragging ? 'rgba(24, 144, 255, 0.15)' : 'rgba(0,0,0,0.08)'};
  transition: all 0.2s;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  pointer-events: auto;
  
  &:hover {
    background: rgba(24, 144, 255, 0.2);
    transform: translateX(-50%) translateY(-2px);
  }
  
  &::before {
    content: '⋮⋮';
    color: ${props => props.isDragging ? '#1890ff' : 'rgba(0,0,0,0.35)'};
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 3px;
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

// --- 主页面组件 ---

const CommunityPage = () => {
  const intl = useIntl();
  
  // 用户卡片拖动状态
  const [cardPosition, setCardPosition] = useState({ top: 100, right: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // 拖动处理函数
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: e.clientX - (window.innerWidth - cardPosition.right),
      y: e.clientY - cardPosition.top,
      startX: e.clientX,
      startY: e.clientY,
    });
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = Math.abs(e.clientX - dragStart.startX);
    const deltaY = Math.abs(e.clientY - dragStart.startY);
    
    if (deltaX > 5 || deltaY > 5) {
      setHasMoved(true);
    }
    
    const newRight = window.innerWidth - e.clientX + dragStart.x;
    const newTop = e.clientY - dragStart.y;
    
    const maxRight = window.innerWidth - 100;
    const maxTop = window.innerHeight - 100;
    
    setCardPosition({
      top: Math.max(60, Math.min(newTop, maxTop)),
      right: Math.max(20, Math.min(newRight, maxRight)),
    });
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      setIsDragging(false);
      setHasMoved(false);
    }, 100);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, cardPosition]);

  return (
    <PageLayout>
      <AmbientBackground>
        <div className="orb-1" />
        <div className="orb-2" />
      </AmbientBackground>

      <SimpleHeader />

      {/* 侧边悬浮的用户信息，只在大屏显示，不干扰主视觉 */}
      <UserStatusDockWrapper 
        top={cardPosition.top} 
        right={cardPosition.right}
        isDragging={isDragging || hasMoved}
      >
        <DragHandle 
          data-drag-handle="true"
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          title="拖动以移动位置"
        />
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
          
          <ExploreChannels />
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