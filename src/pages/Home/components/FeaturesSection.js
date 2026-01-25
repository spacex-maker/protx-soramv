import React, { useContext, useState, useEffect, useRef } from 'react';
import styled, { ThemeContext, keyframes, css } from 'styled-components';
import { motion } from 'framer-motion'; 
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';
import { PlayCircleFilled, ThunderboltFilled, AppstoreFilled, BulbOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
// 请确保路径正确，或替换为你自己的图片路径
import qualityBgImageSrc from '../../../images/function/compressed_ea498956-92c2-4afc-98f4-53136fbcf47c (1).jpg';

// ==========================================
// 1. 样式定义 (Style Definitions)
// ==========================================

// 黑色噪点背景容器
const StyledSection = styled(Section)`
  background-color: #050505; /* 接近纯黑 */
  position: relative;
  overflow: hidden;
  padding: 100px 24px;
  
  /* 背景噪点纹理 */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  /* 顶部氛围光 */
  &::after {
    content: "";
    position: absolute;
    top: -150px;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 500px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.12) 0%, transparent 60%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }

  /* 移动端调整 padding */
  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

// 修复后的网格布局
const Grid = styled.div`
  display: grid;
  /* PC端：3列 */
  grid-template-columns: repeat(3, 1fr);
  /* 自动行高，最小高度 450px */
  grid-auto-rows: minmax(450px, auto); 
  gap: 24px;
  position: relative;
  z-index: 1;

  /* 平板端：2列 */
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 手机端：1列 */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(380px, auto); 
    gap: 16px;

    /* ！！！关键修复：强制让第一个卡片（演示卡片）变高，防止内容重叠 */
    & > div:first-child {
      min-height: 520px; 
    }
  }
`;

// 聚光灯卡片容器
const CardWrapper = styled(motion.div)`
  position: relative;
  border-radius: 24px; 
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
  
  /* 解决 Grid Span 问题 */
  grid-column: ${props => props.$span || 'span 1'};

  /* 响应式 Span 重置：手机端强制占1列 */
  @media (max-width: 1024px) {
    grid-column: ${props => props.$span === 'span 2' ? 'span 2' : 'span 1'};
  }
  @media (max-width: 768px) {
    grid-column: span 1 !important;
  }

  /* 鼠标移动时的光晕层 */
  &::before {
    content: "";
    position: absolute;
    inset: -1px;
    z-index: -1;
    background: radial-gradient(
      600px circle at var(--mouse-x) var(--mouse-y),
      rgba(255, 255, 255, 0.08),
      transparent 40%
    );
    opacity: 0;
    transition: opacity 0.5s;
    border-radius: inherit;
  }

  &:hover::before {
    opacity: 1;
  }

  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease, border-color 0.4s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
    border-color: rgba(255,255,255,0.15);
  }
`;

// 卡片内容区域
const CardContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 36px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: none;

  h3 {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #fff;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    
    @media (max-width: 768px) {
      font-size: 22px;
    }
  }

  p {
    font-size: 15px;
    color: rgba(255,255,255,0.7);
    line-height: 1.6;
    margin: 0;
    max-width: 90%;
    
    @media (max-width: 768px) {
      font-size: 14px;
    }
  }

  .icon-bg {
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 160px;
    opacity: 0.03;
    transform: rotate(15deg);
    color: #fff;
    transition: all 0.6s ease;
    
    @media (max-width: 768px) {
      font-size: 100px;
      top: 0;
    }
  }

  ${CardWrapper}:hover & .icon-bg {
    transform: rotate(0deg) scale(1.1);
    opacity: 0.08;
    color: #667eea;
  }
  
  /* 移动端 Padding 调整 */
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

// 背景媒体（图片/视频）
const MediaBackground = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5; /* 默认暗一点，突出文字 */
    transition: transform 0.8s ease, opacity 0.5s ease;
  }

  ${CardWrapper}:hover & img, 
  ${CardWrapper}:hover & video {
    transform: scale(1.08);
    opacity: 0.8;
  }

  /* 渐变遮罩 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
  }
`;

// ==========================================
// 2. Demo 动画相关样式
// ==========================================

const blink = keyframes`0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; }`;
const loadingDots = keyframes`0%, 20% { content: '.'; } 40% { content: '..'; } 60%, 100% { content: '...'; }`;

const DemoContainer = styled.div`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  max-width: 460px;
  z-index: 5;

  /* ！！！移动端关键修复：上移并调整大小 */
  @media (max-width: 768px) {
    top: 38%;
    width: 90%;
    transform: translate(-50%, -45%);
  }
`;

const MockTextArea = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  min-height: 130px;
  font-size: 15px;
  color: #fff;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
  transition: border-color 0.3s;

  ${CardWrapper}:hover & {
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    padding: 16px;
    min-height: 110px;
    font-size: 13px;
    border-radius: 12px;
  }
`;

const Cursor = styled.span`
  display: ${props => props.$show ? 'inline-block' : 'none'};
  width: 2px;
  height: 18px;
  background: #667eea;
  margin-left: 2px;
  animation: ${blink} 1s infinite;
  vertical-align: text-bottom;
  
  @media (max-width: 768px) {
    height: 15px;
  }
`;

const MockButtonContainer = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    margin-top: 12px;
  }
`;

const MockButton = styled.div`
  padding: 10px 24px;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.$active 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.1)'};
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'};
  
  /* 点击缩放效果 */
  transform: ${props => props.$clicking ? 'scale(0.95)' : 'scale(1)'};

  ${props => props.$loading && css`
    &::after {
      content: '';
      animation: ${loadingDots} 1.5s infinite;
    }
  `}

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 12px;
  }
`;

const AIThinking = styled.div`
  position: absolute;
  top: -40px;
  right: 0;
  background: #6366f1;
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(10px)'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #6366f1;
  }
`;

// ==========================================
// 3. 逻辑组件 (Logic Components)
// ==========================================

// Spotlight Card 组件逻辑
const SpotlightCard = ({ children, className, style, span, ...props }) => {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <CardWrapper
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={className}
      style={style}
      $span={span} // 传递 span 属性给 styled-component
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      {...props}
    >
      {children}
    </CardWrapper>
  );
};

// AI 演示组件
const AIPromptDemo = () => {
  const intl = useIntl();
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isClicking, setIsClicking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showAIThinking, setShowAIThinking] = useState(false);

  // 获取多语言文本
  const promptExamples = {
    userInput: intl.formatMessage({ id: 'home.features.demo.userInput', defaultMessage: '一只猫' }),
    aiResult: intl.formatMessage({ id: 'home.features.demo.aiResult', defaultMessage: '一只优雅的波斯猫，柔软蓬松的白色长毛，琥珀色的大眼睛，坐在洒满阳光的窗台上。背景是淡蓝色的天空和飘动的白色窗帘。4K高清，电影级光影。' }),
    buttonText: intl.formatMessage({ id: 'home.features.demo.buttonText', defaultMessage: 'AI 生成提示词' }),
    buttonLoading: intl.formatMessage({ id: 'home.features.demo.buttonLoading', defaultMessage: 'AI 生成中' }),
    thinkingText: intl.formatMessage({ id: 'home.features.demo.thinkingText', defaultMessage: 'AI 正在创作✨' })
  };

  useEffect(() => {
    let isMounted = true;
    
    const runDemo = async () => {
      if (!isMounted) return;
      
      // 1. 输入阶段
      setDisplayText('');
      setShowCursor(true);
      for (let i = 0; i <= promptExamples.userInput.length; i++) {
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 150));
        setDisplayText(promptExamples.userInput.slice(0, i));
      }
      await new Promise(r => setTimeout(r, 800));

      // 2. 点击阶段
      if (!isMounted) return;
      setIsClicking(true);
      await new Promise(r => setTimeout(r, 300));
      if (!isMounted) return;
      setIsClicking(false);

      // 3. 思考阶段
      if (!isMounted) return;
      setIsThinking(true);
      setShowAIThinking(true);
      await new Promise(r => setTimeout(r, 1500));
      if (!isMounted) return;
      setIsThinking(false);
      setShowAIThinking(false);

      // 4. 输出阶段
      setDisplayText('');
      for (let i = 0; i <= promptExamples.aiResult.length; i++) {
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 30));
        setDisplayText(promptExamples.aiResult.slice(0, i));
      }
      setShowCursor(false);

      // 5. 暂停循环
      await new Promise(r => setTimeout(r, 4000));
      if (isMounted) runDemo();
    };

    runDemo();
    return () => { isMounted = false; };
  }, [promptExamples.userInput, promptExamples.aiResult]);

  return (
    <DemoContainer>
      <MockTextArea>
        {displayText}
        <Cursor $show={showCursor} />
      </MockTextArea>
      <MockButtonContainer>
        <MockButton $active={true} $loading={isThinking} $clicking={isClicking}>
          <AIThinking $show={showAIThinking}>{promptExamples.thinkingText}</AIThinking>
          <BulbOutlined />
          {isThinking ? promptExamples.buttonLoading : promptExamples.buttonText}
        </MockButton>
      </MockButtonContainer>
    </DemoContainer>
  );
};

// ==========================================
// 4. 主组件 (Main Layout)
// ==========================================

const FeaturesSection = () => {
  const theme = useContext(ThemeContext);
  const intl = useIntl();
  const [videoUrl, setVideoUrl] = useState('https://files.catbox.moe/z4w7ez.mp4');

  const handleVideoError = () => {
    console.log('Video load failed, using fallback.');
    setVideoUrl('https://public-1258150206.cos.ap-nanjing.myqcloud.com/home/generated_video%20%281%29.mp4');
  };

  return (
    <StyledSection>
      <ContentWrapper>
        {/* 标题部分 */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <SectionTitle theme={theme} style={{ textAlign: 'center', color: '#fff' }}>
            {intl.formatMessage({ id: 'home.features.title', defaultMessage: '全能创作工坊。' })}
          </SectionTitle>
          <SectionSubtitle theme={theme} style={{ textAlign: 'center', marginBottom: 60, color: 'rgba(255,255,255,0.6)' }}>
            {intl.formatMessage({ id: 'home.features.subtitle', defaultMessage: '不仅仅是生成视频，更是对创意的全方位赋能。' })}
          </SectionSubtitle>
        </motion.div>
        
        {/* 卡片网格 */}
        <Grid>
          {/* 1. AI Prompt Demo (占2列) */}
          <SpotlightCard span="span 2">
            <AIPromptDemo />
            <CardContent>
              <ThunderboltFilled className="icon-bg" />
              <h3>{intl.formatMessage({ id: 'home.features.aiPrompt.title', defaultMessage: 'AI 提示词润色' })}</h3>
              <p>{intl.formatMessage({ id: 'home.features.aiPrompt.description', defaultMessage: '完全没灵感？一键让 AI 帮你写。' })}</p>
            </CardContent>
          </SpotlightCard>

          {/* 2. 画质卡片 (图片背景) */}
          <SpotlightCard>
            <MediaBackground>
              <img src={qualityBgImageSrc} alt="4K Quality" />
            </MediaBackground>
            <CardContent>
              <h3>{intl.formatMessage({ id: 'home.features.quality.title', defaultMessage: '电影级画质' })}</h3>
              <p>{intl.formatMessage({ id: 'home.features.quality.description', defaultMessage: '原生支持 4K 分辨率输出。' })}</p>
            </CardContent>
          </SpotlightCard>

          {/* 3. 视频卡片 (视频背景) */}
          <SpotlightCard>
            <MediaBackground>
              <video 
                src={videoUrl} 
                autoPlay loop muted playsInline 
                onError={handleVideoError}
              />
            </MediaBackground>
            <CardContent>
              <PlayCircleFilled className="icon-bg" style={{ fontSize: 130 }} />
              <h3>{intl.formatMessage({ id: 'home.features.imageToVideo.title', defaultMessage: '图生视频' })}</h3>
              <p>{intl.formatMessage({ id: 'home.features.imageToVideo.description', defaultMessage: '理解物理规律，自动推演动态。' })}</p>
            </CardContent>
          </SpotlightCard>

          {/* 4. 多模态 (占2列, 自定义背景色) */}
          <SpotlightCard span="span 2" style={{ background: 'linear-gradient(145deg, rgba(30,30,40,0.8), rgba(10,10,10,0.9))' }}>
            <CardContent>
              <AppstoreFilled className="icon-bg" />
              <h3>{intl.formatMessage({ id: 'home.features.multimodal.title', defaultMessage: '多模态生态' })}</h3>
              <p>{intl.formatMessage({ id: 'home.features.multimodal.description', defaultMessage: '集成 Stable Diffusion、Midjourney 与 ElevenLabs。' })}</p>
            </CardContent>
          </SpotlightCard>

        </Grid>
      </ContentWrapper>
    </StyledSection>
  );
};

export default FeaturesSection;