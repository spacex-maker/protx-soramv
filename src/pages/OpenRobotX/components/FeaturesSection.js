import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RobotOutlined, GlobalOutlined, BookOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Section, SectionTitle, SectionSubtitle } from '../styles';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-top: 48px;
`;

const Card = styled(motion.div)`
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(0, 212, 170, 0.25);
  }
`;

const IconWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0, 212, 170, 0.15);
  color: #00d4aa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
`;

const CardDesc = styled.p`
  font-size: 14px;
  color: #9aa0a6;
  line-height: 1.5;
  margin: 0;
`;

const features = [
  {
    icon: <RobotOutlined />,
    title: '开源机器人',
    desc: '聚焦 Humanoid、Embodied AI 与 ROS，聚合项目、教程与社区资源。',
  },
  {
    icon: <GlobalOutlined />,
    title: '社区与内容',
    desc: '新闻、教程、项目分享，助力开发者与爱好者紧跟 2026 机器人浪潮。',
  },
  {
    icon: <BookOutlined />,
    title: '教育与资源',
    desc: '免费/开源学习资源、ROS2、模拟器与入门指南，降低上手门槛。',
  },
  {
    icon: <ThunderboltOutlined />,
    title: '开放协作',
    desc: '与 ObotX 等开源项目友好差异化，专注软件与社区，欢迎合作。',
  },
];

const FeaturesSection = () => {
  return (
    <Section>
      <SectionTitle
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        我们在做什么
      </SectionTitle>
      <SectionSubtitle
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
      >
        Open Robot X 面向开源具身智能与机器人生态，从社区与内容起步，逐步拓展教育与协作。
      </SectionSubtitle>
      <Grid>
        {features.map((item, i) => (
          <Card
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <IconWrap>{item.icon}</IconWrap>
            <CardTitle>{item.title}</CardTitle>
            <CardDesc>{item.desc}</CardDesc>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default FeaturesSection;
