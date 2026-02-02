import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import { GithubOutlined, RobotOutlined } from '@ant-design/icons';

const glow = keyframes`
  0%, 100% { opacity: 0.4; filter: blur(60px); }
  50% { opacity: 0.7; filter: blur(80px); }
`;

const HeroWrap = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  position: relative;
  overflow: hidden;
`;

const GlowBg = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4aa 0%, #00a8cc 50%, #0066ff 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ${glow} 6s ease-in-out infinite;
  pointer-events: none;
`;

const Content = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 720px;
`;

const Badge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 212, 170, 0.12);
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 100px;
  font-size: 14px;
  color: #00d4aa;
  margin-bottom: 24px;
`;

const Title = styled(motion.h1)`
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0 0 20px;
  color: #fff;

  .x {
    background: linear-gradient(90deg, #00d4aa, #00a8cc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(16px, 2.2vw, 20px);
  color: #9aa0a6;
  line-height: 1.6;
  margin: 0 0 40px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
`;

const CtaGroup = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  align-items: center;

  .ant-btn {
    height: 48px;
    padding: 0 28px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 100px;
  }
`;

const PrimaryBtn = styled(Button)`
  background: linear-gradient(135deg, #00d4aa, #00a8cc) !important;
  border: none !important;
  color: #0a0e17 !important;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const SecondaryBtn = styled(Button)`
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #e8eaed !important;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(0, 212, 170, 0.4) !important;
    color: #00d4aa !important;
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HeroSection = () => {
  return (
    <HeroWrap>
      <GlowBg />
      <Content variants={containerVariants} initial="hidden" animate="visible">
        <Badge variants={itemVariants}>
          <RobotOutlined /> 开源 · 具身智能 · 人形机器人
        </Badge>
        <Title variants={itemVariants}>
          Open Robot <span className="x">X</span>
        </Title>
        <Subtitle variants={itemVariants}>
          开源具身智能社区。聚焦 Humanoid、Embodied AI、ROS 与开源机器人，连接开发者与爱好者，一起推动下一代机器人技术。
        </Subtitle>
        <CtaGroup variants={itemVariants}>
          <PrimaryBtn
            type="primary"
            size="large"
            icon={<GithubOutlined />}
            href="https://github.com/spacex-maker"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </PrimaryBtn>
          <SecondaryBtn size="large" href="#subscribe">
            订阅动态
          </SecondaryBtn>
        </CtaGroup>
      </Content>
    </HeroWrap>
  );
};

export default HeroSection;
