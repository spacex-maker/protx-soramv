import React, { useRef } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useIntl } from "react-intl";
import SimpleHeader from "components/headers/simple";
import FooterSection from "./Home/components/FooterSection";
import { Button, ConfigProvider, theme, Space, Tag } from "antd";
import { RightOutlined, ApiOutlined, CodeFilled, BranchesOutlined } from "@ant-design/icons";
import SEO, { SEOConfigs } from 'components/SEO';

// ==========================================
// 0. 资源配置 (更新为更具技术感的图)
// ==========================================
const images = {
  heroBg: "https://images.unsplash.com/photo-1614726365723-49cfae9c0fc6?q=80&w=2826&auto=format&fit=crop", // 抽象神经网络/节点
  manifestoBg: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2787&auto=format&fit=crop", // 光纤/连接
  // Bento Grid - Tech focus
  techComfy: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2940&auto=format&fit=crop", // 节点/连接/网格
  techOpenSource: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop", // 矩阵/代码
  techVideo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop", // 流体/动态
  techAudio: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=2874&auto=format&fit=crop", // 声波
  // Scope
  scopeSD: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop", // 艺术生成
  scopeVideoGen: "https://images.unsplash.com/photo-1535016120720-40c6874c3b13?q=80&w=2864&auto=format&fit=crop", // 电影感
  scopeImg2Img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop", // 转换/映射
};

// ==========================================
// 1. 全局样式
// ==========================================

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #050507; /* Deep Black/Blue */
    color: #f5f5f7;
    overflow-x: hidden;
  }
  html { scroll-behavior: smooth; }
  ::selection { background: rgba(41, 151, 255, 0.3); color: #fff; }
`;

const PageWrapper = styled.div`
  background-color: #050507;
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
  padding-top: 60px;
  position: relative;
`;

const GradientText = styled(motion.span)`
  background: linear-gradient(to bottom right, #fff 30%, #86868b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
`;

// ==========================================
// 2. Hero Section
// ==========================================

const HeroContainer = styled.section`
  height: 95vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const ParallaxBg = styled(motion.div)`
  position: absolute;
  top: -10%;
  left: 0;
  width: 100%;
  height: 120%;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  filter: brightness(0.4) saturate(0) contrast(1.2); /* 黑白高对比技术感 */
  z-index: 0;
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 10;
  padding: 0 20px;
  mix-blend-mode: normal;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(64px, 10vw, 120px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  margin-bottom: 32px;
  text-shadow: 0 20px 60px rgba(0,0,0,0.8);
`;

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.5;
  
  .tech-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    font-size: 0.8em;
    margin: 0 6px;
    vertical-align: middle;
    backdrop-filter: blur(10px);
  }
`;

// ==========================================
// 3. Tech Stack Marquee (技术栈滚动条)
// ==========================================
// 新增：类似芯片参数的滚动条，强调硬核技术
const TechStackBar = styled.div`
  width: 100%;
  padding: 24px 0;
  background: #0a0a0c;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 150px;
    height: 100%;
    z-index: 2;
  }
  &::before { left: 0; background: linear-gradient(to right, #0a0a0c, transparent); }
  &::after { right: 0; background: linear-gradient(to left, #0a0a0c, transparent); }
`;

const scrollText = css`
  display: inline-block;
  animation: scroll 30s linear infinite;
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

const TechText = styled.div`
  ${scrollText}
  
  span {
    font-family: "SF Mono", "Roboto Mono", monospace;
    font-size: 14px;
    color: #666;
    margin: 0 30px;
    text-transform: uppercase;
    letter-spacing: 1px;
    
    b { color: #fff; font-weight: 600; }
  }
`;

// ==========================================
// 4. Bento Grid (技术哲学)
// ==========================================

const PhilosophySection = styled.section`
  padding: 140px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled(motion.div)`
  margin-bottom: 100px;
  text-align: left;
  
  h2 {
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    margin-bottom: 20px;
    background: linear-gradient(to right, #fff, #888);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 24px;
    color: #86868b;
    max-width: 700px;
    line-height: 1.4;
  }
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 480px);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const BentoCard = styled(motion.div)`
  border-radius: 32px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  background-color: #111;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  &.large {
    grid-column: span 2;
    @media (max-width: 768px) { grid-column: span 1; }
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 60%, #000 100%);
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 2;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 100px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    font-size: 12px;
    color: #fff;
    margin-bottom: 16px;
    font-family: "SF Mono", monospace;
  }

  h3 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #fff;
  }

  p {
    font-size: 17px;
    color: rgba(255,255,255,0.7);
    line-height: 1.5;
  }

  &:hover {
    transform: scale(1.01);
    border-color: rgba(255,255,255,0.2);
    .overlay { opacity: 0.9; }
  }
`;

// ==========================================
// 5. 核心技术栈展示 (Vertical Stack)
// ==========================================

const TechSection = styled.section`
  padding: 160px 20px;
  background: #000;
  position: relative;
`;

const TechCard = styled(motion.div)`
  max-width: 1000px;
  margin: 0 auto 120px;
  display: flex;
  align-items: center;
  gap: 60px;
  
  &:nth-child(even) {
    flex-direction: row-reverse;
  }

  @media (max-width: 900px) {
    flex-direction: column !important;
    gap: 30px;
    margin-bottom: 80px;
  }
`;

const TechVisual = styled.div`
  flex: 1.2;
  height: 500px;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
  
  /* 模拟软件界面的 UI 装饰 */
  &::after {
    content: 'WORKFLOW_NODE_GRAPH';
    position: absolute;
    top: 20px;
    left: 20px;
    font-family: monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    padding: 4px 8px;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 4px;
  }

  @media (max-width: 900px) {
    width: 100%;
    height: 300px;
  }
`;

const TechInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 40px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #fff;
  }
  
  .desc {
    font-size: 18px;
    color: #86868b;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .specs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .spec-item {
    h4 { font-size: 14px; color: #fff; margin-bottom: 4px; font-weight: 600; }
    span { font-size: 13px; color: #666; font-family: monospace; }
  }
`;

// ==========================================
// 6. CTA Section
// ==========================================

const CTASection = styled.section`
  padding: 120px 20px 160px;
  text-align: center;
  background: #000;
  position: relative;
  overflow: hidden;

  /* 极光背景效果 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse at center, #2997ff20 0%, transparent 70%);
    filter: blur(100px);
    pointer-events: none;
  }
`;

const AppleButton = styled(Button)`
  height: 60px;
  padding: 0 48px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 500;
  border: none;
  background: #fff;
  color: #000;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0;
    transform: scale(1.02);
    color: #000;
  }
`;

// ==========================================
// 逻辑组件
// ==========================================

const AboutContent = () => {
  const { token } = theme.useToken();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const intl = useIntl();

  const techStackItems = [
    "Stable Diffusion XL", "ComfyUI Nodes", "ControlNet", "IP-Adapter", 
    "AnimateDiff", "SVD 1.1", "PyTorch", "CUDA Accelerated", "Open Source Core",
    "Stable Diffusion XL", "ComfyUI Nodes", "ControlNet", "IP-Adapter", 
  ];

  return (
    <PageWrapper>
      <SEO {...SEOConfigs.about} />
      <GlobalStyle />
      <SimpleHeader />

      {/* 1. Hero: 极客与艺术的结合 */}
      <HeroContainer>
        <ParallaxBg $bg={images.heroBg} style={{ y: heroY }} />
        <HeroContent
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <HeroTitle>
            <GradientText>{intl.formatMessage({ id: 'about.hero.title1', defaultMessage: '开源内核。' })}</GradientText><br />
            <span style={{ color: '#fff' }}>{intl.formatMessage({ id: 'about.hero.title2', defaultMessage: '无限可能。' })}</span>
          </HeroTitle>
          <HeroSubtitle>
            {intl.formatMessage({ id: 'about.hero.subtitle1', defaultMessage: '基于' })} <span className="tech-tag">Stable Diffusion</span> {intl.formatMessage({ id: 'about.hero.subtitle2', defaultMessage: '与' })} <span className="tech-tag">ComfyUI</span> {intl.formatMessage({ id: 'about.hero.subtitle3', defaultMessage: '生态。' })}<br/>
            {intl.formatMessage({ id: 'about.hero.description', defaultMessage: '我们将最前沿的 2025 生成式 AI 技术栈，封装进极致的交互体验中。' })}
          </HeroSubtitle>
        </HeroContent>
      </HeroContainer>

      {/* 2. Tech Marquee: 硬核参数展示 */}
      <TechStackBar>
        <TechText>
          {techStackItems.map((item, i) => (
            <span key={i}>{intl.formatMessage({ id: 'about.tech.poweredBy', defaultMessage: 'Powered by' })} <b>{item}</b></span>
          ))}
        </TechText>
      </TechStackBar>

      {/* 3. Bento Grid: 核心能力 */}
      <PhilosophySection>
        <SectionHeader
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>{intl.formatMessage({ id: 'about.philosophy.title1', defaultMessage: '不仅仅是生成。' })}<br/>{intl.formatMessage({ id: 'about.philosophy.title2', defaultMessage: '这是全流程的' })}<span style={{color: '#fff'}}>{intl.formatMessage({ id: 'about.philosophy.title3', defaultMessage: '创造力引擎。' })}</span></h2>
          <p>{intl.formatMessage({ id: 'about.philosophy.description', defaultMessage: '从文生图的精准控制，到视频生成的物理模拟，我们追求技术的极限。' })}</p>
        </SectionHeader>

        <BentoGrid>
          {/* 文生图卡片 */}
          <BentoCard className="large" $bg={images.techComfy}>
            <div className="overlay" />
            <div className="content">
              <div className="tag"><ApiOutlined /> ComfyUI Workflow</div>
              <h3>{intl.formatMessage({ id: 'about.bento.comfy.title', defaultMessage: '节点级精准控制。' })}</h3>
              <p>{intl.formatMessage({ id: 'about.bento.comfy.description', defaultMessage: '底层采用 ComfyUI 节点式架构，支持 ControlNet 姿态控制、IP-Adapter 风格迁移。我们把复杂的节点逻辑封装为直觉化的滑块，让每一次生成都如你所愿。' })}</p>
            </div>
          </BentoCard>

          {/* 开源精神 */}
          <BentoCard $bg={images.techOpenSource}>
            <div className="overlay" />
            <div className="content">
              <div className="tag"><BranchesOutlined /> Open Source</div>
              <h3>{intl.formatMessage({ id: 'about.bento.opensource.title', defaultMessage: '拥抱开源生态。' })}</h3>
              <p>{intl.formatMessage({ id: 'about.bento.opensource.description', defaultMessage: '基于 Stable Diffusion 3.5 & XL Turbo。不仅生成速度飞快，更拥有社区海量 LoRA 模型支持。' })}</p>
            </div>
          </BentoCard>

          {/* 视频生成 */}
          <BentoCard $bg={images.techVideo}>
            <div className="overlay" />
            <div className="content">
              <div className="tag">2025 Tech Stack</div>
              <h3>{intl.formatMessage({ id: 'about.bento.video.title', defaultMessage: 'DiT 视频架构。' })}</h3>
              <p>{intl.formatMessage({ id: 'about.bento.video.description', defaultMessage: '引入 Diffusion Transformer (DiT) 与时空注意力机制，实现 SORA 级别的物理世界模拟。' })}</p>
            </div>
          </BentoCard>

          {/* 音频与多模态 */}
          <BentoCard className="large" $bg={images.techAudio}>
            <div className="overlay" />
            <div className="content">
              <div className="tag">Multi-Modal</div>
              <h3>{intl.formatMessage({ id: 'about.bento.audio.title', defaultMessage: '音画同步，感官觉醒。' })}</h3>
              <p>{intl.formatMessage({ id: 'about.bento.audio.description', defaultMessage: '不仅仅是视觉。集成最新的音频生成模型，支持 Text-to-Audio 与视频画面的自动对齐。从视觉到听觉，构建完整的沉浸式体验。' })}</p>
            </div>
          </BentoCard>
        </BentoGrid>
      </PhilosophySection>

      {/* 4. 深度技术解析 (Vertical Stack) */}
      <TechSection>
        <SectionHeader style={{ maxWidth: 1000, margin: '0 auto 100px', textAlign: 'center' }}>
          <h2>{intl.formatMessage({ id: 'about.techSection.title', defaultMessage: '技术架构解析。' })}</h2>
          <p>{intl.formatMessage({ id: 'about.techSection.description', defaultMessage: '深入了解驱动 ProductX 的核心引擎。' })}</p>
        </SectionHeader>

        <TechCard
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <TechVisual $bg={images.scopeSD} />
          <TechInfo>
            <h3>{intl.formatMessage({ id: 'about.techCard.sd.title', defaultMessage: '生成式绘画的基石。' })}</h3>
            <p className="desc">
              {intl.formatMessage({ id: 'about.techCard.sd.description', defaultMessage: '我们深度集成了 Stable Diffusion 最新的生成模型。通过自定义的 VAE 和优化的采样器（Sampler），我们在保证画质细腻的同时，将生成速度提升了 300%。' })}
            </p>
            <div className="specs">
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.baseModel', defaultMessage: 'Base Model' })}</h4>
                <span>SDXL Turbo / SD 3.5</span>
              </div>
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.resolution', defaultMessage: 'Resolution' })}</h4>
                <span>{intl.formatMessage({ id: 'about.techCard.spec.resolution.value', defaultMessage: 'Up to 4K Upscaling' })}</span>
              </div>
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.control', defaultMessage: 'Control' })}</h4>
                <span>Multi-ControlNet</span>
              </div>
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.speed', defaultMessage: 'Speed' })}</h4>
                <span>{intl.formatMessage({ id: 'about.techCard.spec.speed.value', defaultMessage: '< 1s (Turbo Mode)' })}</span>
              </div>
            </div>
          </TechInfo>
        </TechCard>

        <TechCard
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <TechVisual $bg={images.scopeVideoGen} />
          <TechInfo>
            <h3>{intl.formatMessage({ id: 'about.techCard.video.title', defaultMessage: '下一代视频物理引擎。' })}</h3>
            <p className="desc">
              {intl.formatMessage({ id: 'about.techCard.video.description', defaultMessage: '摒弃传统的 2D 动画逻辑，采用 2025 最新的 DiT (Diffusion Transformer) 架构。模型理解光影、重力与物体运动规律，生成的不仅仅是视频，而是符合物理逻辑的动态世界。' })}
            </p>
            <div className="specs">
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.architecture', defaultMessage: 'Architecture' })}</h4>
                <span>DiT + Spatio-Temporal</span>
              </div>
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.frameRate', defaultMessage: 'Frame Rate' })}</h4>
                <span>{intl.formatMessage({ id: 'about.techCard.spec.frameRate.value', defaultMessage: '24 / 60 FPS Interpolation' })}</span>
              </div>
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.consistency', defaultMessage: 'Consistency' })}</h4>
                <span>{intl.formatMessage({ id: 'about.techCard.spec.consistency.value', defaultMessage: 'High Temporal Stability' })}</span>
              </div>
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.length', defaultMessage: 'Length' })}</h4>
                <span>{intl.formatMessage({ id: 'about.techCard.spec.length.value', defaultMessage: 'Infinite Loop Extension' })}</span>
              </div>
            </div>
          </TechInfo>
        </TechCard>

        <TechCard
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <TechVisual $bg={images.scopeImg2Img} />
          <TechInfo>
            <h3>{intl.formatMessage({ id: 'about.techCard.img2img.title', defaultMessage: '图生图与风格迁移。' })}</h3>
            <p className="desc">
              {intl.formatMessage({ id: 'about.techCard.img2img.description', defaultMessage: '利用 IP-Adapter 和 T2I-Adapter 技术，我们实现了零样本（Zero-shot）风格迁移。上传一张参考图，即可瞬间复刻其构图、光影与艺术风格，让创意无限裂变。' })}
            </p>
            <div className="specs">
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.technology', defaultMessage: 'Technology' })}</h4>
                <span>IP-Adapter Plus</span>
              </div>
              <div className="spec-item">
                <h4>{intl.formatMessage({ id: 'about.techCard.spec.precision', defaultMessage: 'Precision' })}</h4>
                <span>{intl.formatMessage({ id: 'about.techCard.spec.precision.value', defaultMessage: 'Pixel-Perfect Inpainting' })}</span>
              </div>
            </div>
          </TechInfo>
        </TechCard>
      </TechSection>

      {/* 5. Footer CTA */}
      <CTASection>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, marginBottom: '24px', color: '#fff' }}>
            {intl.formatMessage({ id: 'about.cta.title', defaultMessage: '准备好体验未来了吗？' })}
          </h2>
          <p style={{ fontSize: '20px', color: '#86868b', marginBottom: '48px' }}>
            {intl.formatMessage({ id: 'about.cta.description', defaultMessage: '加入专业创作者的行列，释放 AI 的极致潜能。' })}
          </p>
          <Space size="large">
            <AppleButton onClick={() => window.location.href = '/signup'}>
              {intl.formatMessage({ id: 'about.cta.button.start', defaultMessage: '立即开始' })}
            </AppleButton>
            <Button 
              type="text" 
              size="large" 
              style={{ color: '#fff', fontSize: 18 }} 
              onClick={() => window.location.href = '/docs'}
            >
              {intl.formatMessage({ id: 'about.cta.button.docs', defaultMessage: '阅读技术文档' })} <RightOutlined />
            </Button>
          </Space>
        </motion.div>
      </CTASection>

      <FooterSection />
    </PageWrapper>
  );
};

const AboutPage = () => {
  const customTheme = {
    token: {
      colorPrimary: '#2997ff', 
      borderRadius: 16,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <AboutContent />
    </ConfigProvider>
  );
};

export default AboutPage;