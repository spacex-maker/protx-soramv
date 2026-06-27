import React from 'react';
import { Button, Layout } from 'antd';
import {
  ArrowRightOutlined,
  EyeOutlined,
  HeartOutlined,
  PictureOutlined,
  RocketOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import SimpleHeader from 'components/headers/simple';
import SEO, { SEOConfigs } from 'components/SEO';
import OfficialPlayMarketingGrid from 'components/officialI2i/OfficialPlayMarketingGrid';
import { useOfficialPlays } from 'components/officialI2i/useOfficialPlays';
import FooterSection from 'pages/Home/components/FooterSection';
import { I2iOfficialPlay } from 'pages/Workspace/Create/components/ImageToImage/officialPlayTypes';

const { Content } = Layout;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const PageRoot = styled.div`
  min-height: 100vh;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(180deg, #030308 0%, #0a0f1a 40%, #050508 100%)'
      : 'linear-gradient(180deg, #eff6ff 0%, #ffffff 35%, #f5f3ff 100%)'};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#fff' : '#1d1d1f')};
  overflow-x: hidden;
`;

const Main = styled(Content)`
  margin-top: 64px;
  padding-bottom: 0;
`;

const Hero = styled.section`
  position: relative;
  padding: 72px 24px 56px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -5%;
    width: 560px;
    height: 560px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 68%);
    filter: blur(70px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -8%;
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, transparent 68%);
    filter: blur(70px);
    pointer-events: none;
  }
`;

const HeroInner = styled.div`
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const HeroTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(168, 85, 247, 0.18));
  color: ${({ theme }) => (theme.mode === 'dark' ? '#93c5fd' : '#2563eb')};
  border: 1px solid rgba(59, 130, 246, 0.35);
`;

const HeroTitle = styled.h1`
  margin: 0 0 20px;
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.03em;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #ffffff 0%, #93c5fd 45%, #c4b5fd 100%)'
      : 'linear-gradient(135deg, #0f172a 0%, #2563eb 45%, #7c3aed 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled.p`
  margin: 0 auto 32px;
  max-width: 720px;
  font-size: clamp(16px, 2.2vw, 20px);
  line-height: 1.7;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.62)' : '#475569')};
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
`;

const PrimaryCta = styled(Button)`
  && {
    height: 52px;
    padding: 0 32px;
    border: none;
    border-radius: 999px;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #6366f1, #a855f7);
    background-size: 200% 200%;
    animation: ${gradientFlow} 4s ease infinite;
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.38);
  }

  &&:hover {
    color: #fff !important;
    filter: brightness(1.06);
    transform: translateY(-2px);
  }
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 64px;
`;

const SectionHeading = styled.h2`
  margin: 0 0 12px;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  text-align: center;
  letter-spacing: -0.02em;
`;

const SectionDesc = styled.p`
  margin: 0 auto 40px;
  max-width: 680px;
  text-align: center;
  font-size: 16px;
  line-height: 1.65;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.58)' : '#64748b')};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 56px;
`;

const FeatureCard = styled.div`
  padding: 24px;
  border-radius: 20px;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.2)'};
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.88)'};

  .icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 14px;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  }

  h3 {
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 800;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.58)' : '#64748b')};
  }
`;

const StepsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 56px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.div`
  text-align: center;
  padding: 28px 20px;
  border-radius: 20px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(59,130,246,0.12), rgba(99,102,241,0.06))'
      : 'linear-gradient(180deg, rgba(239,246,255,0.95), rgba(238,242,255,0.8))'};
  border: 1px solid rgba(59, 130, 246, 0.2);

  .num {
    width: 40px;
    height: 40px;
    margin: 0 auto 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
  }

  h4 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 800;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : '#64748b')};
  }
`;

const BottomCta = styled.div`
  text-align: center;
  padding: 48px 24px 80px;
  max-width: 720px;
  margin: 0 auto;

  h2 {
    margin: 0 0 12px;
    font-size: clamp(26px, 4vw, 36px);
    font-weight: 800;
  }

  p {
    margin: 0 0 28px;
    font-size: 16px;
    line-height: 1.65;
    color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.58)' : '#64748b')};
  }
`;

const OfficialI2iPlayPage: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { plays, loading } = useOfficialPlays('sort');

  const goCreate = (play?: I2iOfficialPlay) => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/workspace/create/image-to-image', {
        state: play ? { officialPlayCode: play.playCode } : undefined,
      });
    } else {
      navigate('/signup');
    }
  };

  const features = [
    {
      icon: <EyeOutlined />,
      titleId: 'home.officialI2i.feature.preview.title',
      titleDefault: '前后对照，所见即所得',
      descId: 'home.officialI2i.feature.preview.desc',
      descDefault: '每个玩法都配有原图与效果参考，选之前就知道会是什么样子，告别盲盒式生成。',
    },
    {
      icon: <ThunderboltOutlined />,
      titleId: 'home.officialI2i.feature.zeroPrompt.title',
      titleDefault: '零门槛，不写提示词',
      descId: 'home.officialI2i.feature.zeroPrompt.desc',
      descDefault: '官方托管专业 Prompt 模板，上传图片、点选玩法即可生成，小白也能做出大片质感。',
    },
    {
      icon: <StarOutlined />,
      titleId: 'home.officialI2i.feature.curated.title',
      titleDefault: '精选模板，持续更新',
      descId: 'home.officialI2i.feature.curated.desc',
      descDefault: '赛博朋克、吉卜力、皮克斯 3D、古典油画……风格库不断扩充，热门玩法一目了然。',
    },
    {
      icon: <HeartOutlined />,
      titleId: 'home.officialI2i.feature.social.title',
      titleDefault: '点赞收藏，发现热门',
      descId: 'home.officialI2i.feature.social.desc',
      descDefault: '查看全站点赞与生成数据，发现最受欢迎的玩法；登录后可收藏，下次创作一键选用。',
    },
  ];

  const steps = [
    {
      num: 1,
      titleId: 'home.officialI2i.step1.title',
      titleDefault: '上传参考图',
      descId: 'home.officialI2i.step1.desc',
      descDefault: '支持 JPG / PNG / WebP，人物、风景、产品图均可作为起点。',
    },
    {
      num: 2,
      titleId: 'home.officialI2i.step2.title',
      titleDefault: '选择官方玩法',
      descId: 'home.officialI2i.step2.desc',
      descDefault: '浏览效果对照，挑选心仪风格——无需编写或调整提示词。',
    },
    {
      num: 3,
      titleId: 'home.officialI2i.step3.title',
      titleDefault: '一键生成大片',
      descId: 'home.officialI2i.step3.desc',
      descDefault: '平台自动调用最优模型与提示词，数秒至数分钟即可收获惊艳效果。',
    },
  ];

  return (
    <PageRoot>
      <SEO {...SEOConfigs.officialI2iPlay} />
      <SimpleHeader />
      <Main>
        <Hero>
          <HeroInner>
            <HeroTag>
              <RocketOutlined />{' '}
              <FormattedMessage id="home.officialI2i.tag" defaultMessage="图生图 · 官方玩法" />
            </HeroTag>
            <HeroTitle>
              <FormattedMessage
                id="home.officialI2i.pageTitle"
                defaultMessage="一张图，秒变大片"
              />
            </HeroTitle>
            <HeroSubtitle>
              <FormattedMessage
                id="home.officialI2i.pageSubtitle"
                defaultMessage="上传图片，挑选官方预设风格——赛博朋克、吉卜力动画、皮克斯 3D、古典油画……专业提示词由平台托管，你只管选效果、看对照、一键生成。"
              />
            </HeroSubtitle>
            <HeroActions>
              <PrimaryCta type="primary" size="large" icon={<PictureOutlined />} onClick={() => goCreate()}>
                <FormattedMessage id="home.officialI2i.ctaStart" defaultMessage="免费开始创作" />
              </PrimaryCta>
            </HeroActions>
          </HeroInner>
        </Hero>

        <Section>
          <SectionHeading>
            <FormattedMessage id="home.officialI2i.whyTitle" defaultMessage="为什么选择官方玩法？" />
          </SectionHeading>
          <SectionDesc>
            <FormattedMessage
              id="home.officialI2i.whyDesc"
              defaultMessage="把复杂的 AI 提示词工程交给平台，把简单的选择权留给你——看对照、选风格、出大片。"
            />
          </SectionDesc>
          <FeatureGrid>
            {features.map((f) => (
              <FeatureCard key={f.titleId}>
                <div className="icon">{f.icon}</div>
                <h3>
                  <FormattedMessage id={f.titleId} defaultMessage={f.titleDefault} />
                </h3>
                <p>
                  <FormattedMessage id={f.descId} defaultMessage={f.descDefault} />
                </p>
              </FeatureCard>
            ))}
          </FeatureGrid>

          <SectionHeading>
            <FormattedMessage id="home.officialI2i.howTitle" defaultMessage="三步，从原图到惊艳效果" />
          </SectionHeading>
          <StepsRow>
            {steps.map((s) => (
              <StepCard key={s.num}>
                <div className="num">{s.num}</div>
                <h4>
                  <FormattedMessage id={s.titleId} defaultMessage={s.titleDefault} />
                </h4>
                <p>
                  <FormattedMessage id={s.descId} defaultMessage={s.descDefault} />
                </p>
              </StepCard>
            ))}
          </StepsRow>

          <SectionHeading>
            <FormattedMessage id="home.officialI2i.catalogTitle" defaultMessage="全部官方玩法" />
          </SectionHeading>
          <SectionDesc>
            <FormattedMessage
              id="home.officialI2i.catalogDesc"
              defaultMessage="以下玩法均可免登录浏览。注册登录后即可上传图片，一键体验同款效果。"
            />
          </SectionDesc>

          <OfficialPlayMarketingGrid
            plays={plays}
            loading={loading}
            showUseButton
            onUsePlay={goCreate}
          />
        </Section>

        <BottomCta>
          <h2>
            <FormattedMessage
              id="home.officialI2i.bottomTitle"
              defaultMessage="准备好，让你的图片脱胎换骨了吗？"
            />
          </h2>
          <p>
            <FormattedMessage
              id="home.officialI2i.bottomDesc"
              defaultMessage="加入 AI2OBJ，免费体验图生图官方玩法。无需学习提示词，选中即生成。"
            />
          </p>
          <PrimaryCta type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => goCreate()}>
            <FormattedMessage id="home.officialI2i.ctaStart" defaultMessage="免费开始创作" />
          </PrimaryCta>
        </BottomCta>
      </Main>
      <FooterSection />
    </PageRoot>
  );
};

export default OfficialI2iPlayPage;
