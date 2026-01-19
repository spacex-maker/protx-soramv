import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography, Space, Spin, Button } from 'antd';
import styled, { ThemeContext, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { base } from '../../../api/base';
import { useLocale } from '../../../contexts/LocaleContext';
import { motion } from 'framer-motion';
import { PlayCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// --- 1. 动画定义 ---
const scrollUp = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`;

const scrollDown = keyframes`
  0% { transform: translateY(-50%); }
  100% { transform: translateY(0); }
`;

// --- 2. 样式组件 ---

const HeroContainer = styled.div`
  position: relative;
  height: 100vh;
  min-height: 800px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#000000' : '#ffffff'};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  
  /* 定义 CSS 变量默认值，防止 SSR 报错 */
  --mouse-x: 50%;
  --mouse-y: 50%;
`;

// 公共的瀑布流布局样式
const MasonryWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  /* 稍微放大一点，制造景深 */
  transform: scale(1.05);
`;

// 层级 1: 氛围背景层 (暗淡、模糊、去色)
const AmbientLayer = styled(MasonryWrapper)`
  z-index: 1;
  opacity: 0.3; /* 默认非常暗 */
  filter: blur(4px) grayscale(100%); /* 模糊且黑白 */
  
  /* 上下边缘渐变淡出，保持柔和 */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  
  /* 在浅色模式下，背景可以稍微亮一点，避免看起来太脏 */
  ${props => props.theme.mode !== 'dark' && `
    opacity: 0.15;
    filter: blur(6px) grayscale(100%);
  `}
`;

// 层级 2: 手电筒层 (高亮、清晰、彩色)
const FlashlightLayer = styled(MasonryWrapper)`
  z-index: 2;
  filter: none; /* 清晰，无模糊 */
  opacity: 1;
  pointer-events: none; /* 必须穿透，否则无法操作下面的层 */

  /* 核心魔法：使用径向渐变作为遮罩，位置由 CSS 变量控制 */
  -webkit-mask-image: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y), 
    black 0%, 
    transparent 100%
  );
  mask-image: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y), 
    black 0%, 
    transparent 100%
  );
  
  /* 混合模式：让高亮层看起来更像光照上去 (可选) */
  /* mix-blend-mode: hard-light; */
`;

const MasonryColumns = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  gap: 24px; 
  padding: 0 24px;
  max-width: 1920px;
`;

const MasonryColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ScrollTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  will-change: transform;
  animation: ${props => props.$direction === 'up' ? scrollUp : scrollDown} 
             ${props => props.$speed}s linear infinite;
`;

const ImageItem = styled.div`
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  /* 移除这里的 filter 和 hover，因为效果由父层控制了 */
  
  img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
`;

// 内容区域 (保持不变)
const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 980px;
  padding: 0 24px;
  margin-top: -40px;
  /* 确保文字区域能响应鼠标交互 */
  pointer-events: none;
  > * { pointer-events: auto; }
`;

const Badge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 999px;
  margin-bottom: 24px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(12px);
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
  .icon { color: #007aff; }
`;

const MainTitle = styled(motion.h1)`
  font-size: clamp(48px, 6vw, 88px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0 0 16px 0;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #FFFFFF 0%, #A5A5A5 100%)' 
    : 'linear-gradient(135deg, #1d1d1f 0%, #434344 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1d1d1f'};
`;

const SubTitle = styled(motion.p)`
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 400;
  line-height: 1.4;
  color: ${props => props.theme.mode === 'dark' ? '#86868b' : '#6e6e73'};
  max-width: 640px;
  margin: 0 auto 40px;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  @media (max-width: 576px) { flex-direction: column; width: 100%; gap: 16px; }
`;

const PrimaryButton = styled(Button)`
  height: 52px;
  padding: 0 32px;
  border-radius: 999px;
  font-size: 17px;
  font-weight: 500;
  border: none;
  background: #0071e3;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.3);
  &:hover, &:focus { background: #0077ed; transform: scale(1.02); color: #fff; }
  @media (max-width: 576px) { width: 100%; }
`;

const SecondaryButton = styled(Button)`
  height: 52px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 17px;
  font-weight: 400;
  border: none;
  background: transparent;
  color: ${props => props.theme.mode === 'dark' ? '#2997ff' : '#06c'};
  &:hover { background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}; color: ${props => props.theme.mode === 'dark' ? '#2997ff' : '#06c'}; }
  @media (max-width: 576px) { width: 100%; }
`;

// --- 3. 辅助组件：提取出来的瀑布流网格，避免重复代码 ---
const MasonryGrid = ({ columns, theme }) => (
  <MasonryColumns>
    {columns.map((column, colIndex) => {
      const isEven = colIndex % 2 === 0; 
      const direction = isEven ? 'up' : 'down';
      const speed = 60 + (colIndex * 10);
      return (
        <MasonryColumn key={colIndex}>
          <ScrollTrack $direction={direction} $speed={speed}>
            {[...column, ...column].map((item, index) => (
              <ImageItem key={`${colIndex}-${index}`} theme={theme}>
                <img src={item.src} alt="" loading="lazy" />
              </ImageItem>
            ))}
          </ScrollTrack>
        </MasonryColumn>
      );
    })}
  </MasonryColumns>
);

// --- 4. 工具函数 ---
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- 5. 主组件 ---

const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);
  const { locale } = useLocale();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 引用容器，用于更新 CSS 变量
  const containerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // 获取图片
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const lang = locale === 'zh_CN' ? 'zh' : locale.split('_')[0] || 'zh';
        const response = await base.getSiteSettings('hero.images', lang);
        
        if (response.success && response.data && response.data.length > 0) {
            const configValue = response.data[0].configValue;
            const parsed = JSON.parse(configValue);
            if (parsed.images && Array.isArray(parsed.images)) {
              setImages(shuffleArray(parsed.images));
            }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [locale]);

  // 计算列
  useEffect(() => {
    if (images.length === 0) return;
    const calculateColumns = () => {
      const width = window.innerWidth;
      let columnCount = 5; 
      if (width <= 768) columnCount = 2; 
      else if (width <= 1200) columnCount = 3; 
      const newColumns = Array.from({ length: columnCount }, () => []);
      images.forEach((img, index) => {
        newColumns[index % columnCount].push({ src: img, id: index });
      });
      setColumns(newColumns);
    };
    calculateColumns();
    window.addEventListener('resize', calculateColumns);
    return () => window.removeEventListener('resize', calculateColumns);
  }, [images]);

  // --- 鼠标移动处理 ---
  // 直接操作 DOM 样式以获得最佳 60fps 性能，避免 React 渲染
  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const { left, top } = containerRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <HeroContainer 
      theme={theme} 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
    >
      {loading && <Spin size="large" style={{ position: 'absolute', zIndex: 50 }} />}

      {!loading && images.length > 0 && (
        <>
          {/* 层级 1: 氛围背景 (始终显示，但暗淡模糊黑白) */}
          <AmbientLayer theme={theme}>
             <MasonryGrid columns={columns} theme={theme} />
          </AmbientLayer>

          {/* 层级 2: 手电筒光圈 (彩色清晰，跟随鼠标) */}
          <FlashlightLayer theme={theme}>
             <MasonryGrid columns={columns} theme={theme} />
          </FlashlightLayer>
        </>
      )}

      <ContentWrapper
        theme={theme}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Badge variants={itemVariants} theme={theme}>
          <span className="icon">✨</span>
          <FormattedMessage id="home.hero.badge" defaultMessage="Introducing the new Workflow" />
        </Badge>

        <MainTitle variants={itemVariants} theme={theme}>
          <FormattedMessage id="home.hero.title" defaultMessage="Create." />
          <br />
          <span style={{ opacity: 0.7 }}>
            <FormattedMessage id="home.hero.subtitle" defaultMessage="Like never before." />
          </span>
        </MainTitle>

        <SubTitle variants={itemVariants} theme={theme}>
          <FormattedMessage 
            id="home.hero.description" 
            defaultMessage="Unleash your creativity with our professional enterprise solutions." 
          />
        </SubTitle>

        <ButtonGroup variants={itemVariants}>
          <PrimaryButton size="large" onClick={() => navigate(isLoggedIn ? '/workspace' : '/signup')}>
            <FormattedMessage id={isLoggedIn ? "home.hero.cta.workspace" : "home.hero.cta.signup"} />
          </PrimaryButton>
          <SecondaryButton theme={theme} onClick={() => navigate('/demo')}>
            <PlayCircleOutlined />
            <FormattedMessage id="home.hero.cta.demo" defaultMessage="Watch film" />
          </SecondaryButton>
        </ButtonGroup>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default HeroSection;