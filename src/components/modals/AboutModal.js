import React, { useState } from 'react';
import { Modal } from 'antd';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  PictureOutlined,
  SoundOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ToolOutlined,
  ApiOutlined,
  BgColorsOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  MailOutlined,
  CalendarOutlined,
  SyncOutlined,
  RocketOutlined,
  CheckCircleFilled,
  AppstoreOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import logoLight from 'images/logo-light.svg';

const shimmer = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const floatOrb = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(12px, -18px) scale(1.05); }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
    box-shadow: ${(p) =>
      p.theme.mode === 'dark'
        ? '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
        : '0 32px 64px rgba(15,23,42,0.12), 0 8px 24px rgba(15,23,42,0.06)'};
    background: ${(p) =>
      p.theme.mode === 'dark' ? '#0f1117' : '#f4f5f7'};
  }

  .ant-modal-header {
    display: none;
  }

  .ant-modal-close {
    top: 18px;
    right: 18px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);
    transition: all 0.25s ease;
    z-index: 20;

    &:hover {
      background: rgba(255, 255, 255, 0.22);
      color: #fff;
      transform: rotate(90deg);
    }
  }

  .ant-modal-body {
    padding: 0;
  }
`;

const Shell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  min-height: 520px;
`;

const Hero = styled.div`
  position: relative;
  padding: 36px 32px 28px;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 45%, #831843 100%)'
      : 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #8b5cf6 100%)'};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%);
    pointer-events: none;
  }
`;

const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.45;
  animation: ${floatOrb} 8s ease-in-out infinite;
  pointer-events: none;

  &.orb1 {
    width: 180px;
    height: 180px;
    top: -60px;
    right: -40px;
    background: #ec4899;
    animation-delay: 0s;
  }

  &.orb2 {
    width: 120px;
    height: 120px;
    bottom: -30px;
    left: 10%;
    background: #38bdf8;
    animation-delay: -3s;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const LogoWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
`;

const HeroText = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeroTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.55;
  max-width: 520px;
`;

const ShimmerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.25), rgba(255,255,255,0.15));
  background-size: 200% auto;
  animation: ${shimmer} 4s linear infinite;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 24px 0;
  background: ${(p) =>
    p.theme.mode === 'dark' ? '#0f1117' : '#f4f5f7'};
  flex-wrap: wrap;
`;

const TabPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  white-space: nowrap;

  ${(p) =>
    p.$active
      ? css`
          background: ${p.theme.mode === 'dark'
            ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
            : 'linear-gradient(135deg, #2563eb, #6366f1)'};
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
        `
      : css`
          background: ${p.theme.mode === 'dark'
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.04)'};
          color: ${p.theme.mode === 'dark'
            ? 'rgba(255,255,255,0.65)'
            : 'rgba(0,0,0,0.55)'};
          border-color: ${p.theme.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.06)'};

          &:hover {
            background: ${p.theme.mode === 'dark'
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.06)'};
            color: ${p.theme.mode === 'dark'
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(0,0,0,0.75)'};
          }
        `}
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 28px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? '#0f1117' : '#f4f5f7'};

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(p) =>
      p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.15)'
        : 'rgba(0,0,0,0.12)'};
    border-radius: 4px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'};
  letter-spacing: -0.02em;
`;

const SectionDesc = styled.p`
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.65;
  color: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureChip = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff'};
  border: 1px solid ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.25)'};
    box-shadow: ${(p) =>
      p.theme.mode === 'dark'
        ? '0 4px 20px rgba(59,130,246,0.08)'
        : '0 4px 20px rgba(59,130,246,0.06)'};
  }
`;

const IconBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  color: #fff;
  background: ${(p) => p.$gradient};
`;

const ChipText = styled.span`
  font-size: 13px;
  line-height: 1.5;
  color: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.72)'};
`;

const CapabilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const CapabilityCard = styled(motion.div)`
  padding: 18px;
  border-radius: 16px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff'};
  border: 1px solid ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(p) =>
      p.theme.mode === 'dark'
        ? '0 12px 32px rgba(0,0,0,0.3)'
        : '0 12px 32px rgba(15,23,42,0.08)'};
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'};
`;

const CardDesc = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
`;

const VisionCard = styled.div`
  padding: 20px 22px;
  border-radius: 16px;
  margin-bottom: 16px;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 100%)'
      : 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(139,92,246,0.08) 100%)'};
  border: 1px solid ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'};
`;

const CheckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CheckItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff'};
  border: 1px solid ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'};

  .anticon {
    color: #3b82f6;
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    line-height: 1.55;
    color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'};
  }
`;

const VersionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const VersionCard = styled(motion.div)`
  padding: 20px;
  border-radius: 16px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff'};
  border: 1px solid ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const VersionLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const VersionValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'};

  a {
    color: #3b82f6;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #6366f1;
    }
  }
`;

const VersionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #3b82f6;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)'};
`;

const contentVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const AboutModal = ({ open, onClose }) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('product');

  const productFeatures = [
    {
      icon: <PictureOutlined />,
      gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      text: intl.formatMessage({ id: 'aboutModal.product.feature1', defaultMessage: '文生图 / 图生图 / 文生视频 / 图生视频' }),
    },
    {
      icon: <SoundOutlined />,
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
      text: intl.formatMessage({ id: 'aboutModal.product.feature2', defaultMessage: '语音合成、声音克隆与 AI 导演工作流' }),
    },
    {
      icon: <ShoppingOutlined />,
      gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)',
      text: intl.formatMessage({ id: 'aboutModal.product.feature3', defaultMessage: '提示词商城（买断转让、授权查看、我的提示词）' }),
    },
    {
      icon: <TeamOutlined />,
      gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
      text: intl.formatMessage({ id: 'aboutModal.product.feature4', defaultMessage: '创作社区、生成频道与每日挑战' }),
    },
    {
      icon: <ToolOutlined />,
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      text: intl.formatMessage({ id: 'aboutModal.product.feature5', defaultMessage: '图片 / 视频 / 音频在线媒体工具' }),
    },
    {
      icon: <ApiOutlined />,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      text: intl.formatMessage({ id: 'aboutModal.product.feature6', defaultMessage: '向量模型检索与多模型灵活切换' }),
    },
  ];

  const capabilityItems = [
    {
      icon: <BgColorsOutlined />,
      color: '#3b82f6',
      title: intl.formatMessage({ id: 'aboutModal.capabilities.item1.title', defaultMessage: '多模态创作' }),
      description: intl.formatMessage({ id: 'aboutModal.capabilities.item1.desc', defaultMessage: '图像、视频、语音一站式生成，支持参考图输入与生成参数精细调节' }),
    },
    {
      icon: <ShoppingOutlined />,
      color: '#f59e0b',
      title: intl.formatMessage({ id: 'aboutModal.capabilities.item2.title', defaultMessage: '提示词经济' }),
      description: intl.formatMessage({ id: 'aboutModal.capabilities.item2.desc', defaultMessage: '上架售卖、买断转让与授权查看，持有者可自主设置转让价与授权价' }),
    },
    {
      icon: <HeartOutlined />,
      color: '#ec4899',
      title: intl.formatMessage({ id: 'aboutModal.capabilities.item3.title', defaultMessage: '社区生态' }),
      description: intl.formatMessage({ id: 'aboutModal.capabilities.item3.desc', defaultMessage: '发布作品、浏览频道、参与每日挑战，支持点赞、收藏与互动' }),
    },
    {
      icon: <ToolOutlined />,
      color: '#10b981',
      title: intl.formatMessage({ id: 'aboutModal.capabilities.item4.title', defaultMessage: '媒体工具箱' }),
      description: intl.formatMessage({ id: 'aboutModal.capabilities.item4.desc', defaultMessage: '图片 / 视频 / 音频压缩、格式转换与剪辑，浏览器内完成无需安装' }),
    },
    {
      icon: <ThunderboltOutlined />,
      color: '#8b5cf6',
      title: intl.formatMessage({ id: 'aboutModal.capabilities.item5.title', defaultMessage: '弹性算力' }),
      description: intl.formatMessage({ id: 'aboutModal.capabilities.item5.desc', defaultMessage: 'Token 充值按需消费，多模型可选，创作任务历史可追溯管理' }),
    },
    {
      icon: <SafetyCertificateOutlined />,
      color: '#06b6d4',
      title: intl.formatMessage({ id: 'aboutModal.capabilities.item6.title', defaultMessage: '安全合规' }),
      description: intl.formatMessage({ id: 'aboutModal.capabilities.item6.desc', defaultMessage: '账户鉴权、敏感数据加密传输，遵循隐私保护与内容安全规范' }),
    },
  ];

  const ecosystemItems = [
    intl.formatMessage({ id: 'aboutModal.ecosystem.item1', defaultMessage: '持续接入 Sora 级视频与前沿图像 / 语音模型' }),
    intl.formatMessage({ id: 'aboutModal.ecosystem.item2', defaultMessage: '开放社区与生成频道，激发创作交流与灵感碰撞' }),
    intl.formatMessage({ id: 'aboutModal.ecosystem.item3', defaultMessage: '提示词商城连接创作者与购买者，赋能灵感变现' }),
    intl.formatMessage({ id: 'aboutModal.ecosystem.item4', defaultMessage: '欢迎通过「提交需求」反馈建议，共建产品体验' }),
  ];

  const tabs = [
    { key: 'product', icon: <RocketOutlined />, labelId: 'aboutModal.tab.product', defaultMessage: '产品介绍' },
    { key: 'capabilities', icon: <AppstoreOutlined />, labelId: 'aboutModal.tab.capabilities', defaultMessage: '核心能力' },
    { key: 'ecosystem', icon: <TeamOutlined />, labelId: 'aboutModal.tab.ecosystem', defaultMessage: '生态与愿景' },
    { key: 'version', icon: <GlobalOutlined />, labelId: 'aboutModal.tab.version', defaultMessage: '版本信息' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'product':
        return (
          <motion.div key="product" variants={contentVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
            <SectionTitle>
              <FormattedMessage id="aboutModal.product.title" defaultMessage="AI2OBJ — 一站式 AI 创作与社区平台" />
            </SectionTitle>
            <SectionDesc>
              <FormattedMessage
                id="aboutModal.product.description"
                defaultMessage="AI2OBJ 是面向创作者与开发者的综合 AI 平台，覆盖图像、视频、语音生成，提示词交易与社区互动。工作台集成多模型创作、媒体处理与向量检索能力，让从灵感到作品、从作品到变现的链路更顺畅。"
              />
            </SectionDesc>
            <FeatureGrid>
              {productFeatures.map((item, i) => (
                <FeatureChip
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <IconBadge $gradient={item.gradient}>{item.icon}</IconBadge>
                  <ChipText>{item.text}</ChipText>
                </FeatureChip>
              ))}
            </FeatureGrid>
          </motion.div>
        );

      case 'capabilities':
        return (
          <motion.div key="capabilities" variants={contentVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
            <SectionTitle>
              <FormattedMessage id="aboutModal.capabilities.title" defaultMessage="平台核心能力" />
            </SectionTitle>
            <SectionDesc>
              <FormattedMessage
                id="aboutModal.capabilities.subtitle"
                defaultMessage="从创作到交易、从工具到社区，全链路能力一站集成。"
              />
            </SectionDesc>
            <CapabilityGrid>
              {capabilityItems.map((item, i) => (
                <CapabilityCard
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CardTitle>
                    <IconBadge $gradient={`linear-gradient(135deg, ${item.color}, ${item.color}cc)`} style={{ width: 32, height: 32, fontSize: 14 }}>
                      {item.icon}
                    </IconBadge>
                    {item.title}
                  </CardTitle>
                  <CardDesc>{item.description}</CardDesc>
                </CapabilityCard>
              ))}
            </CapabilityGrid>
          </motion.div>
        );

      case 'ecosystem':
        return (
          <motion.div key="ecosystem" variants={contentVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
            <SectionTitle>
              <FormattedMessage id="aboutModal.ecosystem.title" defaultMessage="关于 AI2OBJ" />
            </SectionTitle>
            <VisionCard>
              <SectionDesc style={{ margin: 0 }}>
                <FormattedMessage
                  id="aboutModal.ecosystem.description"
                  defaultMessage="AI2OBJ 团队致力于将前沿生成式 AI 能力产品化，连接创作者、开发者与模型生态。我们持续迭代模型接入、社区玩法与提示词交易机制，为每一位用户提供更专业、更开放的创作环境。"
                />
              </SectionDesc>
            </VisionCard>
            <CheckList>
              {ecosystemItems.map((text, i) => (
                <CheckItem
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <CheckCircleFilled />
                  <span>{text}</span>
                </CheckItem>
              ))}
            </CheckList>
          </motion.div>
        );

      case 'version':
        return (
          <motion.div key="version" variants={contentVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
            <SectionTitle>
              <FormattedMessage id="aboutModal.version.title" defaultMessage="系统信息" />
            </SectionTitle>
            <SectionDesc>
              <FormattedMessage
                id="aboutModal.version.subtitle"
                defaultMessage="平台持续演进，详细更新记录请查看「产品日志」。"
              />
            </SectionDesc>
            <VersionGrid>
              <VersionCard initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0 }}>
                <VersionIcon><SyncOutlined /></VersionIcon>
                <VersionLabel>
                  <FormattedMessage id="aboutModal.version.current" defaultMessage="当前版本" />
                </VersionLabel>
                <VersionValue>
                  <FormattedMessage id="aboutModal.version.currentValue" defaultMessage="持续迭代" />
                </VersionValue>
              </VersionCard>
              <VersionCard initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
                <VersionIcon><CalendarOutlined /></VersionIcon>
                <VersionLabel>
                  <FormattedMessage id="aboutModal.version.releaseDate" defaultMessage="最近更新" />
                </VersionLabel>
                <VersionValue>
                  <FormattedMessage id="aboutModal.version.releaseDateValue" defaultMessage="2026 年 6 月" />
                </VersionValue>
              </VersionCard>
              <VersionCard initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <VersionIcon><MailOutlined /></VersionIcon>
                <VersionLabel>
                  <FormattedMessage id="aboutModal.version.support" defaultMessage="技术支持" />
                </VersionLabel>
                <VersionValue>
                  <a href="mailto:support@soramv.com">support@soramv.com</a>
                </VersionValue>
              </VersionCard>
              <VersionCard initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                <VersionIcon><GlobalOutlined /></VersionIcon>
                <VersionLabel>
                  <FormattedMessage id="aboutModal.version.website" defaultMessage="官方网站" />
                </VersionLabel>
                <VersionValue>
                  <a href="https://ai2obj.com" target="_blank" rel="noopener noreferrer">ai2obj.com</a>
                </VersionValue>
              </VersionCard>
            </VersionGrid>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnClose
      centered
    >
      <Shell>
        <Hero>
          <Orb className="orb1" />
          <Orb className="orb2" />
          <HeroInner>
            <LogoWrap>
              <img src={logoLight} alt="AI2OBJ" />
            </LogoWrap>
            <HeroText>
              <HeroTitle>
                <FormattedMessage id="aboutModal.title" defaultMessage="关于 AI2OBJ" />
              </HeroTitle>
              <HeroSubtitle>
                <FormattedMessage
                  id="aboutModal.hero.subtitle"
                  defaultMessage="连接灵感与作品，赋能每一位创作者"
                />
              </HeroSubtitle>
              <ShimmerBadge>
                <RocketOutlined />
                <FormattedMessage id="aboutModal.hero.badge" defaultMessage="AI 创作 · 社区 · 提示词经济" />
              </ShimmerBadge>
            </HeroText>
          </HeroInner>
        </Hero>

        <TabBar>
          {tabs.map((tab) => (
            <TabPill
              key={tab.key}
              type="button"
              $active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <FormattedMessage id={tab.labelId} defaultMessage={tab.defaultMessage} />
            </TabPill>
          ))}
        </TabBar>

        <ContentArea>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </ContentArea>
      </Shell>
    </StyledModal>
  );
};

export default AboutModal;
