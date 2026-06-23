import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  VideoCameraOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  PartitionOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  ArrowRightOutlined,
  BookOutlined,
  AppstoreOutlined,
  CameraOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';

const shimmer = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
`;

const StyledSection = styled(Section)`
  position: relative;
  overflow: hidden;
  background: ${(props) =>
    props.theme.mode === 'dark'
      ? 'linear-gradient(180deg, #030308 0%, #0c0818 45%, #050508 100%)'
      : 'linear-gradient(180deg, #faf5ff 0%, #ffffff 50%, #f0f9ff 100%)'};

  &::before {
    content: '';
    position: absolute;
    top: 10%;
    right: -5%;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.14) 0%, transparent 68%);
    filter: blur(70px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 5%;
    left: -5%;
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.16) 0%, transparent 68%);
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
  text-transform: uppercase;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(124, 58, 237, 0.18));
  color: ${(props) => (props.theme.mode === 'dark' ? '#f9a8d4' : '#be185d')};
  border: 1px solid rgba(236, 72, 153, 0.35);
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: stretch;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

const DemoPanel = styled(motion.div)`
  background: ${(props) =>
    props.theme.mode === 'dark' ? 'rgba(14, 10, 24, 0.92)' : 'rgba(255, 255, 255, 0.92)'};
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(167, 139, 250, 0.22)' : 'rgba(124, 58, 237, 0.14)'};
  border-radius: 28px;
  padding: 28px;
  backdrop-filter: blur(20px);
  box-shadow: ${(props) =>
    props.theme.mode === 'dark'
      ? '0 32px 64px -16px rgba(0, 0, 0, 0.55)'
      : '0 32px 64px -16px rgba(124, 58, 237, 0.12)'};
`;

const DemoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ProjectBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(124, 58, 237, 0.15));
  color: ${(props) => (props.theme.mode === 'dark' ? '#e9d5ff' : '#7c3aed')};
  border: 1px solid rgba(124, 58, 237, 0.25);
`;

const ExplorerMock = styled.div`
  display: grid;
  grid-template-columns: 0.9fr 1fr 1.2fr;
  gap: 12px;
  min-height: 280px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const ExplorerColumn = styled.div`
  border-radius: 16px;
  padding: 14px;
  background: ${(props) =>
    props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(124, 58, 237, 0.04)'};
  border: 1px solid
    ${(props) =>
      props.$active
        ? 'rgba(236, 72, 153, 0.45)'
        : props.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(124, 58, 237, 0.08)'};
`;

const ColumnTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${(props) => (props.theme.mode === 'dark' ? '#a78bfa' : '#7c3aed')};
  margin-bottom: 12px;
`;

const MockItem = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  color: ${(props) =>
    props.$active
      ? props.theme.mode === 'dark'
        ? '#fff'
        : '#1d1d1f'
      : props.theme.mode === 'dark'
        ? '#a1a1aa'
        : '#6e6e73'};
  background: ${(props) =>
    props.$active
      ? props.theme.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(236,72,153,0.22), rgba(124,58,237,0.18))'
        : 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(124,58,237,0.1))'
      : 'transparent'};
  border: 1px solid
    ${(props) => (props.$active ? 'rgba(236, 72, 153, 0.35)' : 'transparent')};
`;

const ShotRow = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  background: ${(props) =>
    props.$active
      ? props.theme.mode === 'dark'
        ? 'rgba(236, 72, 153, 0.12)'
        : 'rgba(236, 72, 153, 0.08)'
      : props.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.02)'
        : 'rgba(0,0,0,0.02)'};
  border: 1px solid
    ${(props) => (props.$active ? 'rgba(236, 72, 153, 0.3)' : 'transparent')};
`;

const ShotThumb = styled.div`
  width: 48px;
  height: 36px;
  border-radius: 8px;
  background: ${(props) =>
    props.$filled
      ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
      : props.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(124, 58, 237, 0.08)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$filled ? '#fff' : props.theme.mode === 'dark' ? '#71717a' : '#a1a1aa')};
  font-size: 12px;
`;

const ShotMeta = styled.div`
  font-size: 12px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#71717a' : '#86868b')};
`;

const StudioTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const StudioTab = styled.div`
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
      : props.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(124, 58, 237, 0.06)'};
  color: ${(props) => (props.$active ? '#fff' : props.theme.mode === 'dark' ? '#a1a1aa' : '#6e6e73')};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  padding: 20px;
  border-radius: 18px;
  background: ${(props) =>
    props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)'};
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124, 58, 237, 0.1)'};
  transition: transform 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(236, 72, 153, 0.35);
  }
`;

const FeatureIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 14px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(124, 58, 237, 0.15));
  color: ${(props) => (props.theme.mode === 'dark' ? '#f9a8d4' : '#be185d')};
`;

const FeatureTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#1d1d1f')};
`;

const FeatureDesc = styled.p`
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
  color: ${(props) => (props.theme.mode === 'dark' ? '#a1a1aa' : '#6e6e73')};
`;

const WorkflowStrip = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 56px;
  position: relative;
  z-index: 1;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const WorkflowStep = styled.div`
  padding: 24px 20px;
  border-radius: 20px;
  text-align: center;
  background: ${(props) =>
    props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)'};
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124, 58, 237, 0.1)'};
`;

const StepNumber = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  box-shadow: 0 8px 20px rgba(236, 72, 153, 0.35);
`;

const StepTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#1d1d1f')};
`;

const StepDesc = styled.div`
  font-size: 13px;
  line-height: 1.55;
  color: ${(props) => (props.theme.mode === 'dark' ? '#a1a1aa' : '#6e6e73')};
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
  margin-top: 48px;
  position: relative;
  z-index: 1;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  background: linear-gradient(135deg, #ec4899, #8b5cf6, #6366f1);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 4s linear infinite;
`;

const StatLabel = styled.div`
  font-size: 13px;
  margin-top: 6px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#a1a1aa' : '#6e6e73')};
`;

const CTAButton = styled(Button)`
  && {
    height: 52px;
    padding: 0 36px;
    border-radius: 100px;
    font-size: 16px;
    font-weight: 700;
    border: none;
    margin-top: 40px;
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%);
    background-size: 200% auto;
    animation: ${shimmer} 3s linear infinite;
    box-shadow: 0 12px 32px rgba(236, 72, 153, 0.35);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(236, 72, 153, 0.45);
      background: linear-gradient(135deg, #db2777 0%, #7c3aed 50%, #4f46e5 100%);
    }
  }
`;

const CTAWrap = styled.div`
  text-align: center;
  position: relative;
  z-index: 1;
`;

const PulseIconWrap = styled.span`
  display: inline-flex;
  font-size: 22px;
  color: #ec4899;
  animation: ${pulse} 2s ease infinite;
`;

const FEATURE_KEYS = [
  { icon: <PartitionOutlined />, titleKey: 'home.director.feature1.title', descKey: 'home.director.feature1.desc' },
  { icon: <RobotOutlined />, titleKey: 'home.director.feature2.title', descKey: 'home.director.feature2.desc' },
  { icon: <TeamOutlined />, titleKey: 'home.director.feature3.title', descKey: 'home.director.feature3.desc' },
  { icon: <CameraOutlined />, titleKey: 'home.director.feature4.title', descKey: 'home.director.feature4.desc' },
  { icon: <VideoCameraOutlined />, titleKey: 'home.director.feature5.title', descKey: 'home.director.feature5.desc' },
  { icon: <AppstoreOutlined />, titleKey: 'home.director.feature6.title', descKey: 'home.director.feature6.desc' },
];

const WORKFLOW_KEYS = [
  { titleKey: 'home.director.workflow.step1.title', descKey: 'home.director.workflow.step1.desc' },
  { titleKey: 'home.director.workflow.step2.title', descKey: 'home.director.workflow.step2.desc' },
  { titleKey: 'home.director.workflow.step3.title', descKey: 'home.director.workflow.step3.desc' },
  { titleKey: 'home.director.workflow.step4.title', descKey: 'home.director.workflow.step4.desc' },
];

const DirectorStudioSection = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const handleCTA = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/workspace/create/director' : '/signup');
  };

  const t = (id, defaultMessage) => intl.formatMessage({ id, defaultMessage });

  return (
    <StyledSection id="director-studio">
      <ContentWrapper>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <SectionTag>
            <ThunderboltOutlined />
            {t('home.director.tag', '全新功能')}
          </SectionTag>
          <SectionTitle>{t('home.director.title', '导演系统 — 一站式 AI 漫剧创作')}</SectionTitle>
          <SectionSubtitle style={{ marginBottom: 0 }}>
            {t(
              'home.director.subtitle',
              '从剧本、角色设定到分镜画面与图生视频，集 → 场 → 镜专业结构，AI Agent 全程辅助。竖屏漫剧、连载短剧，一个工作台全搞定。'
            )}
          </SectionSubtitle>
        </motion.div>

        <LayoutGrid>
          <DemoPanel
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <DemoHeader>
              <ProjectBadge>
                <BookOutlined />
                {t('home.director.demo.badge', 'AI 漫剧工作台')}
              </ProjectBadge>
              <PulseIconWrap>
                <PlayCircleOutlined />
              </PulseIconWrap>
            </DemoHeader>

            <ExplorerMock>
              <ExplorerColumn $active>
                <ColumnTitle>{t('home.director.demo.episodes', '选集')}</ColumnTitle>
                <MockItem $active>{t('home.director.demo.ep1', '第 1 集 · 初遇')}</MockItem>
                <MockItem>{t('home.director.demo.ep2', '第 2 集 · 转折')}</MockItem>
                <MockItem>{t('home.director.demo.ep3', '第 3 集 · 高潮')}</MockItem>
              </ExplorerColumn>

              <ExplorerColumn $active>
                <ColumnTitle>{t('home.director.demo.scenes', '选场')}</ColumnTitle>
                <MockItem $active>{t('home.director.demo.scene1', '第 1 场 · 教室')}</MockItem>
                <MockItem>{t('home.director.demo.scene2', '第 2 场 · 街道')}</MockItem>
              </ExplorerColumn>

              <ExplorerColumn $active>
                <ColumnTitle>{t('home.director.demo.shots', '分镜')}</ColumnTitle>
                <ShotRow $active>
                  <ShotThumb $filled>1-1</ShotThumb>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t('home.director.demo.shot1', '特写 · 主角回眸')}</div>
                    <ShotMeta>{t('home.director.demo.shot1Meta', '已有关键帧 · 4s')}</ShotMeta>
                  </div>
                  <FieldTimeOutlined style={{ color: '#ec4899' }} />
                </ShotRow>
                <ShotRow>
                  <ShotThumb>1-2</ShotThumb>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t('home.director.demo.shot2', '全景 · 校园外景')}</div>
                    <ShotMeta>{t('home.director.demo.shot2Meta', '待生成画面')}</ShotMeta>
                  </div>
                </ShotRow>
              </ExplorerColumn>
            </ExplorerMock>

            <StudioTabs>
              <StudioTab $active>{t('home.director.demo.tabScript', '脚本')}</StudioTab>
              <StudioTab>{t('home.director.demo.tabVisual', '画面')}</StudioTab>
              <StudioTab>{t('home.director.demo.tabVideo', '视频')}</StudioTab>
            </StudioTabs>
          </DemoPanel>

          <FeatureGrid>
            {FEATURE_KEYS.map((feature, index) => (
              <FeatureCard
                key={feature.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.08 * index }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{t(feature.titleKey, '')}</FeatureTitle>
                <FeatureDesc>{t(feature.descKey, '')}</FeatureDesc>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </LayoutGrid>

        <WorkflowStrip
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {WORKFLOW_KEYS.map((step, index) => (
            <WorkflowStep key={step.titleKey}>
              <StepNumber>{index + 1}</StepNumber>
              <StepTitle>{t(step.titleKey, '')}</StepTitle>
              <StepDesc>{t(step.descKey, '')}</StepDesc>
            </WorkflowStep>
          ))}
        </WorkflowStrip>

        <StatsRow>
          <StatItem>
            <StatValue>{t('home.director.stat1.value', '集/场/镜')}</StatValue>
            <StatLabel>{t('home.director.stat1.label', '专业三级结构')}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{t('home.director.stat2.value', 'AI Agent')}</StatValue>
            <StatLabel>{t('home.director.stat2.label', '剧本与分镜协同')}</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{t('home.director.stat3.value', '9:16')}</StatValue>
            <StatLabel>{t('home.director.stat3.label', '竖屏漫剧友好')}</StatLabel>
          </StatItem>
        </StatsRow>

        <CTAWrap>
          <CTAButton type="primary" size="large" onClick={handleCTA}>
            {t('home.director.cta', '立即创作 AI 漫剧')}
            <ArrowRightOutlined style={{ marginLeft: 8 }} />
          </CTAButton>
        </CTAWrap>
      </ContentWrapper>
    </StyledSection>
  );
};

export default DirectorStudioSection;
