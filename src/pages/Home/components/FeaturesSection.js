import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle, BentoCard } from '../styles';
import { PlayCircleFilled, ThunderboltFilled, AppstoreFilled } from '@ant-design/icons';

// 网格布局
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 500px 400px;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`;

// 卡片内容样式
const CardContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  h3 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
    background: linear-gradient(to right, #fff, #ccc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 17px;
    color: rgba(255,255,255,0.7);
    line-height: 1.5;
  }

  .icon-bg {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 200px;
    opacity: 0.05;
    transform: rotate(-15deg);
  }
`;

// 特定卡片背景
const LargeCard = styled(BentoCard)`
  grid-column: span 2;
  background: radial-gradient(circle at top right, #1e1e24, #000);
  
  @media (max-width: 1024px) { grid-column: span 1; }
`;

const MediaCard = styled(BentoCard)`
  background-image: url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800');
  background-size: cover;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  }
`;

const FeaturesSection = () => {
  const theme = useContext(ThemeContext);

  return (
    <Section>
      <ContentWrapper>
        <SectionTitle theme={theme}>全能创作工坊。</SectionTitle>
        <SectionSubtitle theme={theme}>不仅仅是生成视频，更是对创意的全方位赋能。</SectionSubtitle>
        
        <Grid>
          {/* 大卡片 1 */}
          <LargeCard theme={theme}>
            <CardContent>
              <ThunderboltFilled className="icon-bg" />
              <h3>实时渲染引擎</h3>
              <p>告别漫长的等待。依托分布式 GPU 集群与优化的 DiT 架构，我们实现了近乎实时的视频生成体验。所见即所得，灵感不掉线。</p>
            </CardContent>
          </LargeCard>

          {/* 视觉卡片 */}
          <MediaCard theme={theme}>
            <CardContent>
              <h3>电影级画质</h3>
              <p>原生支持 4K 分辨率输出，每一帧都细腻如画。</p>
            </CardContent>
          </MediaCard>

          {/* 普通卡片 */}
          <BentoCard theme={theme}>
            <CardContent>
              <PlayCircleFilled className="icon-bg" style={{ fontSize: 150 }} />
              <h3>图生视频</h3>
              <p>上传一张静态图片，AI 将理解画面中的光影与物理关系，自动推演后续动态，让照片活过来。</p>
            </CardContent>
          </BentoCard>

          {/* 大卡片 2 */}
          <LargeCard theme={theme} style={{ background: 'radial-gradient(circle at bottom left, #2a2a35, #000)' }}>
            <CardContent>
              <AppstoreFilled className="icon-bg" />
              <h3>多模态生态</h3>
              <p>不仅支持 Stable Diffusion 文生图，更集成了 Midjourney 风格迁移与 ElevenLabs 音频合成。在一个工作流中完成所有创作。</p>
            </CardContent>
          </LargeCard>
        </Grid>
      </ContentWrapper>
    </Section>
  );
};

export default FeaturesSection;