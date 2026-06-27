import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  ArrowRightOutlined,
  EyeOutlined,
  PictureOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';
import OfficialPlayMarketingGrid from 'components/officialI2i/OfficialPlayMarketingGrid';
import { useOfficialPlays } from 'components/officialI2i/useOfficialPlays';

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StyledSection = styled(Section)`
  position: relative;
  overflow: hidden;
  background: ${(props) =>
    props.theme.mode === 'dark'
      ? 'linear-gradient(180deg, #050508 0%, #0a1220 50%, #050508 100%)'
      : 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 50%, #faf5ff 100%)'};

  &::before {
    content: '';
    position: absolute;
    top: 15%;
    left: -5%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, transparent 68%);
    filter: blur(70px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: -5%;
    width: 460px;
    height: 460px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 68%);
    filter: blur(70px);
    pointer-events: none;
  }
`;

const SectionTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(168, 85, 247, 0.16));
  color: ${(props) => (props.theme.mode === 'dark' ? '#93c5fd' : '#2563eb')};
  border: 1px solid rgba(59, 130, 246, 0.35);
`;

const HighlightRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  padding: 0 8px;

  .icon {
    font-size: 20px;
    color: ${(props) => (props.theme.mode === 'dark' ? '#93c5fd' : '#3b82f6')};
    margin-bottom: 8px;
  }

  h4 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    color: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.52)' : '#64748b')};
  }
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 36px;
  position: relative;
  z-index: 1;
`;

const PrimaryBtn = styled(Button)`
  && {
    height: 48px;
    padding: 0 28px;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #6366f1, #a855f7);
    background-size: 200% 200%;
    animation: ${gradientFlow} 4s ease infinite;
    box-shadow: 0 10px 28px rgba(59, 130, 246, 0.35);
  }

  &&:hover {
    color: #fff !important;
    transform: translateY(-2px);
  }
`;

const GhostBtn = styled(Button)`
  && {
    height: 48px;
    padding: 0 28px;
    border-radius: 999px;
    font-weight: 600;
    border: none;
    background: transparent;
    color: ${(props) => (props.theme.mode === 'dark' ? '#93c5fd' : '#2563eb')};
  }

  &&:hover {
    background: transparent !important;
    opacity: 0.75;
    color: ${(props) => (props.theme.mode === 'dark' ? '#93c5fd' : '#2563eb')} !important;
  }
`;

const OfficialI2iPlaySection = () => {
  const navigate = useNavigate();
  const { plays, loading } = useOfficialPlays('likes');

  const goCreate = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/workspace/create/image-to-image' : '/signup');
  };

  const highlights = [
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
      icon: <RocketOutlined />,
      titleId: 'home.officialI2i.feature.curated.title',
      titleDefault: '精选模板，持续更新',
      descId: 'home.officialI2i.feature.curated.desc',
      descDefault: '赛博朋克、吉卜力、皮克斯 3D、古典油画……风格库不断扩充，热门玩法一目了然。',
    },
  ];

  return (
    <StyledSection id="official-i2i-play">
      <ContentWrapper>
        <div style={{ textAlign: 'center' }}>
          <SectionTag>
            <PictureOutlined />{' '}
            <FormattedMessage id="home.officialI2i.tag" defaultMessage="图生图 · 官方玩法" />
          </SectionTag>
          <SectionTitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <FormattedMessage
              id="home.officialI2i.title"
              defaultMessage="一张图，秒变大片。官方玩法，零提示词上手。"
            />
          </SectionTitle>
          <SectionSubtitle
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FormattedMessage
              id="home.officialI2i.subtitle"
              defaultMessage="上传参考图，选择官方预设风格——专业提示词由平台托管，你只管看对照、选效果、一键生成。无需登录即可浏览全部玩法。"
            />
          </SectionSubtitle>
        </div>

        <HighlightRow>
          {highlights.map((item) => (
            <HighlightCard key={item.titleId}>
              <div className="icon">{item.icon}</div>
              <h4>
                <FormattedMessage id={item.titleId} defaultMessage={item.titleDefault} />
              </h4>
              <p>
                <FormattedMessage id={item.descId} defaultMessage={item.descDefault} />
              </p>
            </HighlightCard>
          ))}
        </HighlightRow>

        <OfficialPlayMarketingGrid plays={plays} loading={loading} compact limit={6} />

        <ActionRow>
          <PrimaryBtn type="primary" icon={<RocketOutlined />} onClick={goCreate}>
            <FormattedMessage id="home.officialI2i.ctaStart" defaultMessage="免费开始创作" />
          </PrimaryBtn>
          <GhostBtn icon={<ArrowRightOutlined />} onClick={() => navigate('/official-i2i-play')}>
            <FormattedMessage id="home.officialI2i.viewAll" defaultMessage="查看全部官方玩法" />
          </GhostBtn>
        </ActionRow>
      </ContentWrapper>
    </StyledSection>
  );
};

export default OfficialI2iPlaySection;
