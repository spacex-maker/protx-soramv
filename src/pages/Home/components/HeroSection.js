import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography, Space, Spin } from 'antd';
import styled, { ThemeContext, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ContentWrapper, StyledButton } from '../styles';
import { base } from '../../../api/base';
import { useLocale } from '../../../contexts/LocaleContext';

const { Title, Paragraph } = Typography;

// --- 动画定义 ---

const gradientAnimation = keyframes`
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
`;

const floatingAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

// 向上滚动：从 0 到 -50%
const scrollUp = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`;

// 向下滚动：从 -50% 到 0
const scrollDown = keyframes`
  0% { transform: translateY(-50%); }
  100% { transform: translateY(0); }
`;

const hoverTransition = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

// --- 样式组件 ---

const HeroContainer = styled.div`
  position: relative;
  height: 100vh;
  min-height: 600px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  /* 这里必须 hidden，防止无限滚动的图片跑出屏幕上下方 */
  overflow: hidden; 
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(-45deg, #000428, #004e92, #2a5298)'
    : 'linear-gradient(-45deg, #89f7fe, #66a6ff, #764ba2)'};
  background-size: 300% 300%;
  animation: ${gradientAnimation} 30s ease infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .hero-title {
    font-size: 56px;
    font-weight: 800;
    margin-bottom: 24px;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'} !important;
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }
  
  .hero-description {
    font-size: 20px;
    margin-bottom: 48px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(45,55,72,0.9)'};
    text-shadow: 0 1px 5px rgba(0,0,0,0.1);
  }
  
  .ant-btn { margin: 0 10px; }
`;

const ContentWrapperWithBg = styled.div`
  position: relative;
  z-index: 20; /* 确保文字在所有图片之上 */
  animation: ${floatingAnimation} 6s ease-in-out infinite;
  pointer-events: none;
  
  * { pointer-events: auto; }
  
  /* 添加渐变透明背景，从中心到边缘逐渐透明，左右边界完全透明 */
  &::before {
    content: '';
    position: absolute;
    top: -60px;
    left: -200px;
    right: -200px;
    bottom: -60px;
    /* 使用线性渐变：从中心到左右边界逐渐变透明，边缘完全透明 */
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.1) 15%, rgba(0, 0, 0, 0.2) 30%, rgba(0, 0, 0, 0.35) 50%, rgba(0, 0, 0, 0.2) 70%, rgba(0, 0, 0, 0.1) 85%, transparent 100%)'
      : 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.15) 15%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 70%, rgba(255, 255, 255, 0.15) 85%, transparent 100%)'};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 30px;
    z-index: -1;
    pointer-events: none;
  }
`;

const MasonryContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: auto; 
  /* 移除了 mask-image，不再模糊边缘 */
  /* 这里保留 hidden 只是为了保险，主要靠 HeroContainer 裁剪 */
  overflow: hidden; 
  display: flex;
  justify-content: center;
`;

const MasonryColumns = styled.div`
  display: flex;
  /* 关键调整：宽度 100%，限制最大宽度，保证5列即使在大屏也不散太开 */
  width: 100%;
  max-width: 1600px; 
  height: 100%;
  /* 左右留白，避免图片贴着浏览器边缘 */
  padding: 0 40px; 
  gap: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 10px;
    gap: 10px;
  }
`;

const MasonryColumn = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  
  /* 关键修复：移除 overflow: hidden 
     这样 ImageItem 在 Hover 放大时，才不会被列的边缘切断
     同时 z-index 才能生效盖住旁边的列
  */
`;

const ScrollTrack = styled.div`
  display: flex;
  flex-direction: column;
  /* 默认状态下使用 GPU 加速 */
  will-change: transform;
  animation: ${props => props.$direction === 'up' ? scrollUp : scrollDown} 
             ${props => props.$speed || 40}s linear infinite;
  
  /* 鼠标悬停在这一列时，暂停滚动，方便点击 */
  &:hover {
    animation-play-state: paused;
    /* 关键修复：悬停时提高整个轨道的层级 
      这确保了当前列的图片放大时，会盖住旁边还在滚动的列
    */
    z-index: 10; 
  }
`;

const ImageItem = styled.div`
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden; 
  /* 保持间距 */
  margin-bottom: 20px; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  /* 优化过渡效果 */
  transition: all 0.4s ${hoverTransition};
  cursor: pointer;
  transform: translateZ(0); /* 开启硬件加速，防止抖动 */

  img {
    width: 100%;
    height: auto;
    display: block;
    /* 默认稍微暗一点，突出文字 */
    filter: ${props => props.theme.mode === 'dark' ? 'brightness(0.7)' : 'brightness(0.9)'};
    transition: transform 0.4s ${hoverTransition}, filter 0.4s ease;
  }

  /* Hover 效果 */
  &:hover {
    /* 放大比例增加，看起来更明显 */
    transform: scale(1.08);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    /* 这里不再需要 z-index，因为 ScrollTrack 已经处理了层级。
       如果在同一列内需要覆盖上下图片，可以加 z-index: 2 
    */
    z-index: 2;

    img {
      /* 图片内部轻微缩放 */
      transform: scale(1.1);
      /* 恢复亮度 */
      filter: brightness(1.05);
    }
  }
`;

// --- 工具函数 ---
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- 组件逻辑 ---

const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);
  const { locale } = useLocale();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);

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

  useEffect(() => {
    if (images.length === 0) return;

    const calculateColumns = () => {
      const width = window.innerWidth;
      let columnCount = 5; // 默认桌面端 5 列
      
      if (width <= 768) {
        columnCount = 2; 
      } else if (width <= 1200) {
        columnCount = 3; 
      } else {
        columnCount = 5; // 保持 5 列
      }

      // 分配图片到各列
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
      
      {!loading && images.length > 0 && (
        <MasonryContainer>
          <MasonryColumns>
            {columns.map((column, colIndex) => {
              // 蛇形滚动逻辑：偶数向上，奇数向下
              const isEven = colIndex % 2 === 0; 
              const direction = isEven ? 'up' : 'down';
              // 随机速度，让滚动看起来不那么机械
              const speed = 50 + (colIndex * 8); 

              return (
                <MasonryColumn key={colIndex}>
                  <ScrollTrack $direction={direction} $speed={speed}>
                    {/* 复制一份数据实现无缝循环 */}
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

      <ContentWrapperWithBg theme={theme}>
        <ContentWrapper>
          <Title level={1} className="hero-title">
            Sora MV - AI 驱动的视频生成平台
          </Title>
          <Paragraph className="hero-description">
            使用 Sora 技术，将您的创意文字和图片转化为惊艳的视频作品
          </Paragraph>
          <Space size="large">
            <StyledButton type="primary" size="large" ghost onClick={() => navigate('/signup')}>
              开始创作
            </StyledButton>
            <StyledButton size="large" onClick={() => navigate('/login')}>
              立即登录
            </StyledButton>
          </Space>
        </ContentWrapper>
      </ContentWrapperWithBg>
    </HeroContainer>
  );
};

export default HeroSection;