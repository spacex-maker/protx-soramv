import React, { useContext, useState, useEffect } from 'react';
import { Typography, Space, Spin } from 'antd';
import styled, { ThemeContext, keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { StyledButton, EnterpriseButton } from '../styles';
import { base } from '../../../api/base';
import { useLocale } from '../../../contexts/LocaleContext';
import { motion } from 'framer-motion';

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

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- 2. 样式组件 (视觉 & 交互升级) ---

const HeroContainer = styled.div`
  position: relative;
  height: 100vh;
  min-height: 800px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* 背景基色 */
  background: ${props => props.theme.mode === 'dark' ? '#020617' : '#ffffff'};
`;

// 关键修改：使用 CSS Mask 实现上下边缘淡出，而不是在图片上盖一层黑纱
// 这样图片中间部分是 100% 原色，非常清晰
const MasonryContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  
  /* 核心：上下边缘渐变透明，中间清晰 */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  
  /* 稍微放大一点，增加沉浸感 */
  transform: scale(1.05);
`;

const MasonryColumns = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  gap: 20px;
  padding: 0 20px;
  /* 限制最大宽度，防止在大屏上散太开 */
  max-width: 1920px;
  
  @media (max-width: 768px) {
    gap: 10px;
    padding: 0 10px;
  }
`;

const MasonryColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  /* 确保鼠标能穿透列之间的空隙 */
  pointer-events: none; 
`;

const ScrollTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  will-change: transform;
  animation: ${props => props.$direction === 'up' ? scrollUp : scrollDown} 
             ${props => props.$speed}s linear infinite;
  
  /* 开启鼠标交互 */
  pointer-events: auto; 

  /* 交互：鼠标悬停在这一列时，暂停滚动 */
  &:hover {
    animation-play-state: paused;
    z-index: 10; /* 悬停时层级提高 */
  }

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const ImageItem = styled.div`
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateZ(0); /* 硬件加速 */
  
  img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    /* 默认稍微降低一点点亮度，防止太刺眼，hover 时恢复 */
    filter: ${props => props.theme.mode === 'dark' ? 'brightness(0.8)' : 'brightness(0.95)'};
    transition: all 0.4s ease;
  }

  /* 交互：鼠标悬停图片放大、变亮、加阴影 */
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    z-index: 20;
    
    img {
      filter: brightness(1.1);
    }
  }
`;

// 背景光晕 (替代原来的全屏遮罩)
// 只在中心文字区域背后加一点光晕，不遮挡周围图片
const CenterGlow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  border-radius: 50%;
  z-index: 2;
  background: ${props => props.theme.mode === 'dark'
    ? 'radial-gradient(circle, rgba(2,6,23, 0.95) 0%, rgba(2,6,23, 0.4) 40%, transparent 70%)'
    : 'radial-gradient(circle, rgba(255,255,255, 0.95) 0%, rgba(255,255,255, 0.5) 40%, transparent 70%)'};
  pointer-events: none; /* 关键：让鼠标穿透光晕，摸到图片 */
`;

// 内容区域
const HeroContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 900px;
  padding: 0 20px;
  animation: ${fadeUp} 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  
  /* 关键：内容容器本身不阻挡鼠标，只有文字和按钮阻挡 */
  pointer-events: none; 

  /* 子元素恢复鼠标交互 */
  .interactive {
    pointer-events: auto;
  }

  .hero-title {
    font-size: clamp(56px, 7vw, 96px);
    font-weight: 800;
    line-height: 1.05;
    margin-bottom: 24px;
    letter-spacing: -0.03em;
    
    /* 强烈的文字阴影，确保即使背景图片划过也能看清 */
    text-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 4px 30px rgba(0,0,0,0.8)' 
      : '0 4px 30px rgba(255,255,255,0.8), 0 2px 10px rgba(0,0,0,0.1)'};
      
    /* 渐变文字 */
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(180deg, #fff 0%, #94a3b8 100%)'
      : 'linear-gradient(180deg, #1d1d1f 0%, #475569 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-description {
    font-size: clamp(20px, 2.5vw, 24px);
    margin: 0 auto 48px;
    max-width: 680px;
    color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#334155'};
    line-height: 1.5;
    font-weight: 500;
    /* 增加文字背景模糊，类似 iOS 锁屏时间 */
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }
`;

// --- 3. 工具函数 ---
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- 4. 组件逻辑 ---

const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);
  const { locale } = useLocale();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);

  // 保持原有数据获取逻辑
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

  // 保持原有列计算逻辑
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

  return (
    <HeroContainer theme={theme}>
      {loading && <Spin size="large" style={{ position: 'absolute', zIndex: 50 }} />}
      
      {/* 背景光晕：只在中心文字后面，不遮挡周围图片 */}
      <CenterGlow theme={theme} />

      {!loading && images.length > 0 && (
        <MasonryContainer>
          <MasonryColumns>
            {columns.map((column, colIndex) => {
              const isEven = colIndex % 2 === 0; 
              const direction = isEven ? 'up' : 'down';
              // 速度差异化，更有层次
              const speed = 50 + (colIndex * 8);

              return (
                <MasonryColumn key={colIndex}>
                  <ScrollTrack $direction={direction} $speed={speed}>
                    {/* 循环两遍以实现无缝滚动 */}
                    {[...column, ...column].map((item, index) => (
                      <ImageItem key={`${colIndex}-${index}`} theme={theme}>
                        <img 
                          src={item.src} 
                          alt="Showcase" 
                          loading="lazy" 
                        />
                      </ImageItem>
                    ))}
                  </ScrollTrack>
                </MasonryColumn>
              );
            })}
          </MasonryColumns>
        </MasonryContainer>
      )}

      <HeroContentWrapper 
        theme={theme}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <div className="interactive">
          <Title level={1} className="hero-title">
            Sora MV<br/>AI 驱动的视频生成平台
          </Title>
          <Paragraph className="hero-description">
            使用 Sora 技术，将您的创意文字和图片转化为惊艳的视频作品。
            不仅仅是工具，更是您创意的延伸。
          </Paragraph>
          <Space size="large">
            <EnterpriseButton size="large" onClick={() => navigate('/signup')}>
              免费开始创作
            </EnterpriseButton>
            <StyledButton size="large" onClick={() => navigate('/login')}>
              立即登录
            </StyledButton>
          </Space>
        </div>
      </HeroContentWrapper>
    </HeroContainer>
  );
};

export default HeroSection;