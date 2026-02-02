import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const HeroWrap = styled.section`
  position: relative;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
  overflow: hidden;
`;

const BgImage = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${(p) => p.src});
  background-size: cover;
  background-position: center;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${(p) => p.overlay};
  }
`;

const Content = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 800px;
`;

const BackBtn = styled.button`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  &:hover {
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.35);
  }
`;

const Region = styled.span`
  display: inline-block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${(p) => p.accent};
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 16px;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
`;

const TitleCn = styled.span`
  display: block;
  font-size: 0.45em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 6px;
`;

const Tagline = styled(motion.p)`
  font-size: clamp(16px, 2vw, 20px);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
`;

const CompanyHeroSection = ({ data, theme }) => {
  const navigate = useNavigate();
  const accent = theme?.primary || '#00d4aa';
  const overlay = theme?.heroOverlay || 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.75))';

  return (
    <HeroWrap>
      <BgImage src={data.heroImage} overlay={overlay} />
      <BackBtn type="button" onClick={() => navigate('/openrobotx')}>
        <ArrowLeftOutlined /> 返回 Open Robot X
      </BackBtn>
      <Content
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Region accent={accent}>{data.region}</Region>
        <Title>
          {data.name}
          {data.nameCn && <TitleCn>{data.nameCn}</TitleCn>}
        </Title>
        <Tagline initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {data.tagline}
        </Tagline>
      </Content>
    </HeroWrap>
  );
};

export default CompanyHeroSection;
