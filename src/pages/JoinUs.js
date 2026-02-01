import React, { useRef, useState, useEffect } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import SimpleHeader from "components/headers/simple";
import FooterSection from "./Home/components/FooterSection";
import { ConfigProvider, Button, Modal, Form, Input, Select, Upload, message, Spin, Alert } from "antd";
import { useNavigate } from 'react-router-dom';
import { 
  RightOutlined, 
  EnvironmentOutlined, 
  TeamOutlined,
  RocketOutlined,
  HeartOutlined,
  TrophyOutlined,
  CoffeeOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  FilePdfOutlined,
  MessageOutlined,
  DownloadOutlined
} from "@ant-design/icons";
import { useIntl } from 'react-intl';
import SEO from 'components/SEO';
import { base } from 'api/base';

// ==========================================
// 0. 资源配置
// ==========================================
const images = {
  heroBg: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
  culture: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
  team: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop",
  office: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop",
  mission: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
};

// ==========================================
// 1. 全局样式
// ==========================================
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #000;
    overflow-x: hidden;
  }
  html { scroll-behavior: smooth; }
  ::selection { background: rgba(0, 122, 255, 0.3); color: #fff; }
`;

const PageWrapper = styled.div`
  background: #000;
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

// ==========================================
// 2. Hero Section - Apple Style
// ==========================================
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 120px 24px 80px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, 
      rgba(0, 0, 0, 0.3) 0%, 
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 1;
  }
`;

const HeroVideo = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url(${images.heroBg}) center/cover no-repeat;
  filter: brightness(0.6) saturate(1.2);
  transform: scale(1.1);
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 1000px;
`;

const HeroEyebrow = styled(motion.div)`
  font-size: 17px;
  font-weight: 600;
  color: #0071e3;
  letter-spacing: 0.02em;
  margin-bottom: 16px;
  text-transform: uppercase;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0 0 24px;
  background: linear-gradient(to bottom, #fff 20%, #a1a1a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(21px, 3vw, 28px);
  font-weight: 400;
  line-height: 1.4;
  color: #a1a1a6;
  max-width: 680px;
  margin: 0 auto 40px;
`;

const HeroButtons = styled(motion.div)`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(motion.button)`
  background: #0071e3;
  color: #fff;
  border: none;
  border-radius: 980px;
  padding: 18px 36px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: #0077ed;
    transform: scale(1.02);
  }
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: #0071e3;
  border: none;
  border-radius: 980px;
  padding: 18px 36px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    color: #0077ed;
    text-decoration: underline;
  }
`;

// ==========================================
// 3. Values Section - Bento Grid
// ==========================================
const SectionWrapper = styled.section`
  padding: 120px 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 80px;
`;

const SectionEyebrow = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0071e3;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #f5f5f7;
  margin: 0 0 20px;
`;

const SectionSubtitle = styled.p`
  font-size: 21px;
  font-weight: 400;
  color: #86868b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 320px);
  gap: 16px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 280px);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 240px);
  }
`;

const ValueCard = styled(motion.div)`
  background: #1d1d1f;
  border-radius: 24px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.02);
    background: #2d2d2f;
  }
  
  &.featured {
    grid-column: span 2;
    background: linear-gradient(135deg, #1d1d1f 0%, #0d47a1 100%);
    
    @media (max-width: 640px) {
      grid-column: span 1;
    }
  }
  
  .icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #0071e3;
    margin-bottom: 24px;
  }
  
  h3 {
    font-size: 28px;
    font-weight: 600;
    color: #f5f5f7;
    margin: 0 0 12px;
    line-height: 1.2;
  }
  
  p {
    font-size: 17px;
    color: #86868b;
    line-height: 1.5;
    margin: 0;
  }
`;

// ==========================================
// 3.5 My Applications Section
// ==========================================
const MyApplicationsSection = styled.section`
  padding: 80px 24px;
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
`;

const MyApplicationsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const ApplicationCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  .info {
    flex: 1;
    
    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #f5f5f7;
      margin: 0 0 8px;
    }
    
    .meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      
      span {
        font-size: 13px;
        color: #86868b;
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }
  
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .view-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0, 113, 227, 0.1);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #0071e3;
    font-size: 16px;
    
    &:hover {
      background: rgba(0, 113, 227, 0.2);
      transform: scale(1.1);
    }
  }
  
  .status {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    
    &.pending {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
    }
    &.reviewing {
      background: rgba(33, 150, 243, 0.15);
      color: #2196f3;
    }
    &.interview {
      background: rgba(156, 39, 176, 0.15);
      color: #9c27b0;
    }
    &.accepted {
      background: rgba(76, 175, 80, 0.15);
      color: #4caf50;
    }
    &.rejected {
      background: rgba(244, 67, 54, 0.15);
      color: #f44336;
    }
  }
`;

// 申请详情弹窗样式
const ApplicationDetailModal = styled(Modal)`
  .ant-modal-content {
    background: #1d1d1f;
    border-radius: 20px;
    overflow: hidden;
  }
  
  .ant-modal-header {
    background: #1d1d1f;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px 24px;
    
    .ant-modal-title {
      color: #f5f5f7;
      font-size: 20px;
      font-weight: 600;
    }
  }
  
  .ant-modal-close {
    color: #86868b;
    
    &:hover {
      color: #f5f5f7;
    }
  }
  
  .ant-modal-body {
    padding: 24px;
  }
`;

const DetailSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    font-size: 12px;
    font-weight: 600;
    color: #0071e3;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 12px;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  
  .icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #86868b;
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .content {
    flex: 1;
    min-width: 0;
    
    .label {
      font-size: 12px;
      color: #86868b;
      margin-bottom: 2px;
    }
    
    .value {
      font-size: 15px;
      color: #f5f5f7;
      word-break: break-word;
    }
  }
`;

const MessageBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  
  p {
    font-size: 14px;
    color: #a1a1a6;
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
  }
`;

const ResumeLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 113, 227, 0.1);
  border: 1px solid rgba(0, 113, 227, 0.2);
  border-radius: 10px;
  color: #0071e3;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 113, 227, 0.2);
    border-color: rgba(0, 113, 227, 0.3);
    color: #0071e3;
  }
  
  .icon {
    font-size: 18px;
  }
`;

const EmptyApplications = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
`;

// ==========================================
// 4. Positions Section
// ==========================================
const PositionsSection = styled.section`
  padding: 120px 24px;
  background: #f5f5f7;
`;

const PositionsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const PositionCategory = styled.div`
  margin-bottom: 64px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h3`
  font-size: 32px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d2d2d7;
`;

const PositionCard = styled(motion.div)`
  background: #fff;
  border-radius: 18px;
  padding: 28px 32px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  .info {
    flex: 1;
    
    h4 {
      font-size: 21px;
      font-weight: 600;
      color: #1d1d1f;
      margin: 0 0 8px;
    }
    
    .meta {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      
      span {
        font-size: 14px;
        color: #86868b;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }
  
  .arrow {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #f5f5f7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1d1d1f;
    font-size: 18px;
    transition: all 0.3s ease;
  }
  
  &:hover .arrow {
    background: #0071e3;
    color: #fff;
  }
`;

// ==========================================
// 5. Benefits Section
// ==========================================
const BenefitsSection = styled.section`
  padding: 120px 24px;
  background: #000;
`;

const BenefitsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitCard = styled(motion.div)`
  text-align: center;
  padding: 48px 24px;
  
  .icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0071e3 0%, #00c7be 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #fff;
  }
  
  h4 {
    font-size: 21px;
    font-weight: 600;
    color: #f5f5f7;
    margin: 0 0 12px;
  }
  
  p {
    font-size: 15px;
    color: #86868b;
    line-height: 1.6;
    margin: 0;
  }
`;

// ==========================================
// 6. CTA Section
// ==========================================
const CTASection = styled.section`
  padding: 160px 24px;
  text-align: center;
  background: linear-gradient(180deg, #000 0%, #1d1d1f 100%);
`;

const CTATitle = styled(motion.h2)`
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #f5f5f7;
  margin: 0 0 24px;
`;

const CTASubtitle = styled(motion.p)`
  font-size: 21px;
  color: #86868b;
  max-width: 600px;
  margin: 0 auto 48px;
  line-height: 1.5;
`;

// ==========================================
// 7. Application Modal
// ==========================================
const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 24px;
    overflow: hidden;
  }
  
  .ant-modal-header {
    padding: 32px 32px 0;
    border-bottom: none;
  }
  
  .ant-modal-title {
    font-size: 28px;
    font-weight: 600;
  }
  
  .ant-modal-body {
    padding: 24px 32px 32px;
  }
`;

// ==========================================
// 8. 动画配置
// ==========================================
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 }
  }
};

// ==========================================
// 9. 主组件
// ==========================================
const JoinUsPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [form] = Form.useForm();
  
  // 检查用户是否已登录
  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };
  
  const heroRef = useRef(null);
  const valuesRef = useRef(null);
  const positionsRef = useRef(null);
  const benefitsRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" });
  const positionsInView = useInView(positionsRef, { once: true, margin: "-100px" });
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });

  const values = [
    { 
      icon: <RocketOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.values.innovation.title', defaultMessage: '创新驱动' }),
      desc: intl.formatMessage({ id: 'joinUs.values.innovation.desc', defaultMessage: '我们相信创新是改变世界的力量，鼓励每一个突破性的想法。' }),
      featured: true
    },
    { 
      icon: <TeamOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.values.collaboration.title', defaultMessage: '协作共赢' }),
      desc: intl.formatMessage({ id: 'joinUs.values.collaboration.desc', defaultMessage: '跨团队协作，共同创造非凡成果。' })
    },
    { 
      icon: <ThunderboltOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.values.excellence.title', defaultMessage: '追求卓越' }),
      desc: intl.formatMessage({ id: 'joinUs.values.excellence.desc', defaultMessage: '不断突破自我，追求极致体验。' })
    },
    { 
      icon: <HeartOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.values.passion.title', defaultMessage: '热爱与专注' }),
      desc: intl.formatMessage({ id: 'joinUs.values.passion.desc', defaultMessage: '对技术的热爱，对产品的专注。' })
    },
    { 
      icon: <GlobalOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.values.impact.title', defaultMessage: '影响力' }),
      desc: intl.formatMessage({ id: 'joinUs.values.impact.desc', defaultMessage: '让 AI 技术赋能每一个人的创意表达。' }),
      featured: true
    },
  ];

  const positions = {
    engineering: [
      { 
        title: intl.formatMessage({ id: 'joinUs.position.seniorFrontend', defaultMessage: '高级前端工程师' }), 
        location: intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }), 
        type: intl.formatMessage({ id: 'joinUs.type.parttime', defaultMessage: '兼职' })
      },
      { 
        title: intl.formatMessage({ id: 'joinUs.position.backendEngineer', defaultMessage: '后端开发工程师' }), 
        location: intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }), 
        type: intl.formatMessage({ id: 'joinUs.type.parttime', defaultMessage: '兼职' })
      },
      { 
        title: intl.formatMessage({ id: 'joinUs.position.mlEngineer', defaultMessage: 'AI/ML 算法工程师' }), 
        location: intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }), 
        type: intl.formatMessage({ id: 'joinUs.type.parttime', defaultMessage: '兼职' })
      },
    ],
    product: [
      { 
        title: intl.formatMessage({ id: 'joinUs.position.productManager', defaultMessage: '产品经理' }), 
        location: intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }), 
        type: intl.formatMessage({ id: 'joinUs.type.parttime', defaultMessage: '兼职' })
      },
      { 
        title: intl.formatMessage({ id: 'joinUs.position.uxDesigner', defaultMessage: 'UX 设计师' }), 
        location: intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }), 
        type: intl.formatMessage({ id: 'joinUs.type.parttime', defaultMessage: '兼职' })
      },
    ],
    operations: [
      { 
        title: intl.formatMessage({ id: 'joinUs.position.communityManager', defaultMessage: '社区运营经理' }), 
        location: intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }), 
        type: intl.formatMessage({ id: 'joinUs.type.parttime', defaultMessage: '兼职' })
      },
      { 
        title: intl.formatMessage({ id: 'joinUs.position.contentCreator', defaultMessage: '内容创作者' }), 
        location: intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }), 
        type: intl.formatMessage({ id: 'joinUs.type.parttime', defaultMessage: '兼职' })
      },
    ],
  };

  const benefits = [
    { 
      icon: <CoffeeOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.benefit.flexible.title', defaultMessage: '弹性工作' }),
      desc: intl.formatMessage({ id: 'joinUs.benefit.flexible.desc', defaultMessage: '灵活的工作时间与远程办公选择' })
    },
    { 
      icon: <TrophyOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.benefit.equity.title', defaultMessage: '期权激励' }),
      desc: intl.formatMessage({ id: 'joinUs.benefit.equity.desc', defaultMessage: '与公司共同成长，分享发展成果' })
    },
    { 
      icon: <HeartOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.benefit.health.title', defaultMessage: '健康保障' }),
      desc: intl.formatMessage({ id: 'joinUs.benefit.health.desc', defaultMessage: '全面的医疗保险与健康福利' })
    },
    { 
      icon: <RocketOutlined />, 
      title: intl.formatMessage({ id: 'joinUs.benefit.growth.title', defaultMessage: '职业发展' }),
      desc: intl.formatMessage({ id: 'joinUs.benefit.growth.desc', defaultMessage: '持续学习与成长的培训机会' })
    },
  ];

  const [submitting, setSubmitting] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // 获取我的申请记录
  useEffect(() => {
    const fetchMyApplications = async () => {
      if (!isLoggedIn()) return;
      
      setLoadingApplications(true);
      try {
        const response = await base.getMyApplications();
        if (response.success && response.data) {
          setMyApplications(response.data);
        }
      } catch (error) {
        console.error('获取申请记录失败:', error);
      } finally {
        setLoadingApplications(false);
      }
    };
    
    fetchMyApplications();
  }, []);

  // 获取状态显示文本
  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': intl.formatMessage({ id: 'joinUs.status.pending', defaultMessage: '待处理' }),
      'REVIEWING': intl.formatMessage({ id: 'joinUs.status.reviewing', defaultMessage: '审核中' }),
      'INTERVIEW': intl.formatMessage({ id: 'joinUs.status.interview', defaultMessage: '面试中' }),
      'ACCEPTED': intl.formatMessage({ id: 'joinUs.status.accepted', defaultMessage: '已录用' }),
      'REJECTED': intl.formatMessage({ id: 'joinUs.status.rejected', defaultMessage: '已拒绝' }),
    };
    return statusMap[status] || status;
  };

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const handlePositionClick = (position) => {
    setSelectedPosition(position);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // 构建 FormData
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      if (values.phone) formData.append('phone', values.phone);
      formData.append('experience', values.experience || '0-2');
      if (values.message) formData.append('message', values.message);
      formData.append('position', selectedPosition?.title || '');
      formData.append('category', selectedPosition?.category || 'engineering');
      formData.append('location', 'remote');
      formData.append('jobType', 'parttime');
      
      // 处理简历文件
      if (values.resume?.fileList?.length > 0) {
        const file = values.resume.fileList[0].originFileObj;
        if (file) {
          formData.append('resume', file);
        }
      }

      const response = await base.submitJobApplication(formData);
      
      if (response.success) {
        message.success(intl.formatMessage({ id: 'joinUs.apply.success', defaultMessage: '申请已提交，我们会尽快与您联系！' }));
        setModalOpen(false);
        form.resetFields();
      } else {
        message.error(response.message || '申请提交失败，请稍后重试');
      }
    } catch (error) {
      console.error('Submit error:', error);
      message.error('申请提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToPositions = () => {
    positionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 查看申请详情
  const handleViewDetail = (application) => {
    setSelectedApplication(application);
    setDetailModalOpen(true);
  };

  // 获取分类显示文本
  const getCategoryText = (category) => {
    const categoryMap = {
      'engineering': intl.formatMessage({ id: 'joinUs.category.engineering', defaultMessage: '工程技术' }),
      'product': intl.formatMessage({ id: 'joinUs.category.product', defaultMessage: '产品设计' }),
      'operations': intl.formatMessage({ id: 'joinUs.category.operations', defaultMessage: '运营市场' }),
    };
    return categoryMap[category] || category;
  };

  // 获取经验显示文本
  const getExperienceText = (exp) => {
    const expMap = {
      '0-2': intl.formatMessage({ id: 'joinUs.form.experience.0-2', defaultMessage: '0-2年' }),
      '3-5': intl.formatMessage({ id: 'joinUs.form.experience.3-5', defaultMessage: '3-5年' }),
      '5-10': intl.formatMessage({ id: 'joinUs.form.experience.5-10', defaultMessage: '5-10年' }),
      '10+': intl.formatMessage({ id: 'joinUs.form.experience.10+', defaultMessage: '10年以上' }),
    };
    return expMap[exp] || exp;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0071e3',
          borderRadius: 12,
        },
      }}
    >
      <GlobalStyle />
      <SEO 
        title={intl.formatMessage({ id: 'joinUs.seo.title', defaultMessage: '加入我们 - AI2OBJ' })}
        description={intl.formatMessage({ id: 'joinUs.seo.description', defaultMessage: '加入 AI2OBJ 团队，一起用 AI 改变创作的未来' })}
      />
      <PageWrapper>
        <SimpleHeader />
        
        {/* Hero Section */}
        <HeroSection ref={heroRef}>
          <HeroVideo />
          <HeroContent
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <HeroEyebrow variants={fadeInUp}>
              {intl.formatMessage({ id: 'joinUs.hero.eyebrow', defaultMessage: 'JOIN OUR TEAM' })}
            </HeroEyebrow>
            <HeroTitle variants={fadeInUp}>
              {intl.formatMessage({ id: 'joinUs.hero.title', defaultMessage: '与我们一起' })}
              <br />
              {intl.formatMessage({ id: 'joinUs.hero.title2', defaultMessage: '定义 AI 视频的未来' })}
            </HeroTitle>
            <HeroSubtitle variants={fadeInUp}>
              {intl.formatMessage({ 
                id: 'joinUs.hero.subtitle', 
                defaultMessage: '我们正在寻找充满激情的人才，一起打造下一代 AI 视频创作平台，让每个人都能轻松创造专业级视频内容。' 
              })}
            </HeroSubtitle>
            <HeroButtons variants={fadeInUp}>
              <PrimaryButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToPositions}
              >
                {intl.formatMessage({ id: 'joinUs.hero.cta', defaultMessage: '查看开放职位' })}
                <ArrowRightOutlined />
              </PrimaryButton>
              <SecondaryButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayCircleOutlined />
                {intl.formatMessage({ id: 'joinUs.hero.video', defaultMessage: '观看团队故事' })}
              </SecondaryButton>
            </HeroButtons>
          </HeroContent>
        </HeroSection>

        {/* My Applications Section - 仅登录用户显示 */}
        {isLoggedIn() && (
          <MyApplicationsSection>
            <MyApplicationsContainer>
              <SectionHeader
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                style={{ marginBottom: 40 }}
              >
                <SectionEyebrow>
                  {intl.formatMessage({ id: 'joinUs.myApplications.eyebrow', defaultMessage: 'MY APPLICATIONS' })}
                </SectionEyebrow>
                <SectionTitle style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                  {intl.formatMessage({ id: 'joinUs.myApplications.title', defaultMessage: '我的申请' })}
                </SectionTitle>
              </SectionHeader>

              {loadingApplications ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#0071e3' }} spin />} />
                </div>
              ) : myApplications.length > 0 ? (
                myApplications.map((app, index) => (
                  <ApplicationCard
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="info">
                      <h4>{app.position}</h4>
                      <div className="meta">
                        <span><CalendarOutlined /> {formatDate(app.createTime)}</span>
                        <span><EnvironmentOutlined /> {app.location === 'remote' ? intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }) : app.location}</span>
                        <span><ClockCircleOutlined /> {app.jobType === 'parttime' ? intl.formatMessage({ id: 'joinUs.type.parttime', defaultMessage: '兼职' }) : intl.formatMessage({ id: 'joinUs.type.fulltime', defaultMessage: '全职' })}</span>
                      </div>
                    </div>
                    <div className="actions">
                      <button 
                        className="view-btn" 
                        onClick={() => handleViewDetail(app)}
                        title={intl.formatMessage({ id: 'joinUs.myApplications.viewDetail', defaultMessage: '查看详情' })}
                      >
                        <EyeOutlined />
                      </button>
                      <div className={`status ${app.status?.toLowerCase()}`}>
                        {getStatusText(app.status)}
                      </div>
                    </div>
                  </ApplicationCard>
                ))
              ) : (
                <EmptyApplications>
                  <FileTextOutlined className="icon" />
                  <p>{intl.formatMessage({ id: 'joinUs.myApplications.empty', defaultMessage: '暂无申请记录' })}</p>
                </EmptyApplications>
              )}
            </MyApplicationsContainer>
          </MyApplicationsSection>
        )}

        {/* Values Section */}
        <SectionWrapper ref={valuesRef}>
          <SectionHeader
            initial="hidden"
            animate={valuesInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <SectionEyebrow>
              {intl.formatMessage({ id: 'joinUs.values.eyebrow', defaultMessage: 'OUR VALUES' })}
            </SectionEyebrow>
            <SectionTitle>
              {intl.formatMessage({ id: 'joinUs.values.title', defaultMessage: '我们的价值观' })}
            </SectionTitle>
            <SectionSubtitle>
              {intl.formatMessage({ 
                id: 'joinUs.values.subtitle', 
                defaultMessage: '这些核心价值观定义了我们是谁，以及我们如何共同工作' 
              })}
            </SectionSubtitle>
          </SectionHeader>
          
          <ValuesGrid>
            {values.map((value, index) => (
              <ValueCard
                key={index}
                className={value.featured ? 'featured' : ''}
                initial={{ opacity: 0, y: 40 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="icon">{value.icon}</div>
                <div>
                  <h3>{value.title}</h3>
                  <p>{value.desc}</p>
                </div>
              </ValueCard>
            ))}
          </ValuesGrid>
        </SectionWrapper>

        {/* Positions Section */}
        <PositionsSection ref={positionsRef}>
          <PositionsContainer>
            <SectionHeader
              initial="hidden"
              animate={positionsInView ? "visible" : "hidden"}
              variants={fadeInUp}
              style={{ marginBottom: 64 }}
            >
              <SectionEyebrow style={{ color: '#0071e3' }}>
                {intl.formatMessage({ id: 'joinUs.positions.eyebrow', defaultMessage: 'OPEN POSITIONS' })}
              </SectionEyebrow>
              <SectionTitle style={{ color: '#1d1d1f' }}>
                {intl.formatMessage({ id: 'joinUs.positions.title', defaultMessage: '开放职位' })}
              </SectionTitle>
              <SectionSubtitle style={{ color: '#86868b' }}>
                {intl.formatMessage({ 
                  id: 'joinUs.positions.subtitle', 
                  defaultMessage: '找到适合你的角色，开启新的职业旅程' 
                })}
              </SectionSubtitle>
            </SectionHeader>

            <PositionCategory>
              <CategoryTitle>
                {intl.formatMessage({ id: 'joinUs.category.engineering', defaultMessage: '工程技术' })}
              </CategoryTitle>
              {positions.engineering.map((pos, index) => (
                <PositionCard
                  key={index}
                  onClick={() => handlePositionClick({ ...pos, category: 'engineering' })}
                  initial={{ opacity: 0, x: -20 }}
                  animate={positionsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="info">
                    <h4>{pos.title}</h4>
                    <div className="meta">
                      <span><EnvironmentOutlined /> {pos.location}</span>
                      <span><TeamOutlined /> {pos.type}</span>
                    </div>
                  </div>
                  <div className="arrow">
                    <RightOutlined />
                  </div>
                </PositionCard>
              ))}
            </PositionCategory>

            <PositionCategory>
              <CategoryTitle>
                {intl.formatMessage({ id: 'joinUs.category.product', defaultMessage: '产品设计' })}
              </CategoryTitle>
              {positions.product.map((pos, index) => (
                <PositionCard
                  key={index}
                  onClick={() => handlePositionClick({ ...pos, category: 'product' })}
                  initial={{ opacity: 0, x: -20 }}
                  animate={positionsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="info">
                    <h4>{pos.title}</h4>
                    <div className="meta">
                      <span><EnvironmentOutlined /> {pos.location}</span>
                      <span><TeamOutlined /> {pos.type}</span>
                    </div>
                  </div>
                  <div className="arrow">
                    <RightOutlined />
                  </div>
                </PositionCard>
              ))}
            </PositionCategory>

            <PositionCategory>
              <CategoryTitle>
                {intl.formatMessage({ id: 'joinUs.category.operations', defaultMessage: '运营市场' })}
              </CategoryTitle>
              {positions.operations.map((pos, index) => (
                <PositionCard
                  key={index}
                  onClick={() => handlePositionClick({ ...pos, category: 'operations' })}
                  initial={{ opacity: 0, x: -20 }}
                  animate={positionsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="info">
                    <h4>{pos.title}</h4>
                    <div className="meta">
                      <span><EnvironmentOutlined /> {pos.location}</span>
                      <span><TeamOutlined /> {pos.type}</span>
                    </div>
                  </div>
                  <div className="arrow">
                    <RightOutlined />
                  </div>
                </PositionCard>
              ))}
            </PositionCategory>
          </PositionsContainer>
        </PositionsSection>

        {/* Benefits Section */}
        <BenefitsSection ref={benefitsRef}>
          <SectionHeader
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
            variants={fadeInUp}
            style={{ maxWidth: 1200, margin: '0 auto 80px' }}
          >
            <SectionEyebrow>
              {intl.formatMessage({ id: 'joinUs.benefits.eyebrow', defaultMessage: 'BENEFITS' })}
            </SectionEyebrow>
            <SectionTitle>
              {intl.formatMessage({ id: 'joinUs.benefits.title', defaultMessage: '我们提供的福利' })}
            </SectionTitle>
            <SectionSubtitle>
              {intl.formatMessage({ 
                id: 'joinUs.benefits.subtitle', 
                defaultMessage: '加入我们，享受全面的福利与支持' 
              })}
            </SectionSubtitle>
          </SectionHeader>
          
          <BenefitsGrid>
            {benefits.map((benefit, index) => (
              <BenefitCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15 }}
              >
                <div className="icon">{benefit.icon}</div>
                <h4>{benefit.title}</h4>
                <p>{benefit.desc}</p>
              </BenefitCard>
            ))}
          </BenefitsGrid>
        </BenefitsSection>

        {/* CTA Section */}
        <CTASection>
          <CTATitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {intl.formatMessage({ id: 'joinUs.cta.title', defaultMessage: '准备好开始了吗？' })}
          </CTATitle>
          <CTASubtitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {intl.formatMessage({ 
              id: 'joinUs.cta.subtitle', 
              defaultMessage: '如果你对我们的使命充满热情，我们期待收到你的申请' 
            })}
          </CTASubtitle>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <PrimaryButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={scrollToPositions}
            >
              {intl.formatMessage({ id: 'joinUs.cta.button', defaultMessage: '立即申请' })}
              <ArrowRightOutlined />
            </PrimaryButton>
          </motion.div>
        </CTASection>

        <FooterSection />

        {/* Application Modal */}
        <StyledModal
          title={selectedPosition?.title || intl.formatMessage({ id: 'joinUs.modal.title', defaultMessage: '职位申请' })}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={600}
          centered
        >
          {/* 登录提示 */}
          {!isLoggedIn() && (
            <Alert
              message={intl.formatMessage({ id: 'joinUs.form.loginTip', defaultMessage: '登录后提交可查看申请记录' })}
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16, borderRadius: 8 }}
              action={
                <Button 
                  size="small" 
                  type="link" 
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                  style={{ padding: 0 }}
                >
                  {intl.formatMessage({ id: 'joinUs.form.goLogin', defaultMessage: '去登录' })}
                </Button>
              }
            />
          )}
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginTop: isLoggedIn() ? 24 : 8 }}
          >
            <Form.Item
              name="name"
              label={intl.formatMessage({ id: 'joinUs.form.name', defaultMessage: '姓名' })}
              rules={[{ required: true, message: intl.formatMessage({ id: 'joinUs.form.name.required', defaultMessage: '请输入姓名' }) }]}
            >
              <Input size="large" placeholder={intl.formatMessage({ id: 'joinUs.form.name.placeholder', defaultMessage: '请输入您的姓名' })} />
            </Form.Item>
            
            <Form.Item
              name="email"
              label={intl.formatMessage({ id: 'joinUs.form.email', defaultMessage: '邮箱' })}
              rules={[
                { required: true, message: intl.formatMessage({ id: 'joinUs.form.email.required', defaultMessage: '请输入邮箱' }) },
                { type: 'email', message: intl.formatMessage({ id: 'joinUs.form.email.invalid', defaultMessage: '请输入有效的邮箱地址' }) }
              ]}
            >
              <Input size="large" placeholder={intl.formatMessage({ id: 'joinUs.form.email.placeholder', defaultMessage: '请输入您的邮箱' })} />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label={intl.formatMessage({ id: 'joinUs.form.phone', defaultMessage: '手机号码' })}
            >
              <Input size="large" placeholder={intl.formatMessage({ id: 'joinUs.form.phone.placeholder', defaultMessage: '请输入您的手机号码' })} />
            </Form.Item>
            
            <Form.Item
              name="experience"
              label={intl.formatMessage({ id: 'joinUs.form.experience', defaultMessage: '工作经验' })}
            >
              <Select size="large" placeholder={intl.formatMessage({ id: 'joinUs.form.experience.placeholder', defaultMessage: '请选择工作经验' })}>
                <Select.Option value="0-2">{intl.formatMessage({ id: 'joinUs.form.experience.0-2', defaultMessage: '0-2年' })}</Select.Option>
                <Select.Option value="3-5">{intl.formatMessage({ id: 'joinUs.form.experience.3-5', defaultMessage: '3-5年' })}</Select.Option>
                <Select.Option value="5-10">{intl.formatMessage({ id: 'joinUs.form.experience.5-10', defaultMessage: '5-10年' })}</Select.Option>
                <Select.Option value="10+">{intl.formatMessage({ id: 'joinUs.form.experience.10+', defaultMessage: '10年以上' })}</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="resume"
              label={intl.formatMessage({ id: 'joinUs.form.resume', defaultMessage: '简历' })}
            >
              <Upload.Dragger 
                maxCount={1}
                accept=".pdf,.doc,.docx"
                beforeUpload={(file) => {
                  const isValidType = file.type === 'application/pdf' || 
                    file.type === 'application/msword' || 
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                  if (!isValidType) {
                    message.error(intl.formatMessage({ id: 'joinUs.form.resume.format', defaultMessage: '支持 PDF、DOC、DOCX 格式' }));
                    return Upload.LIST_IGNORE;
                  }
                  const isLt10M = file.size / 1024 / 1024 < 10;
                  if (!isLt10M) {
                    message.error(intl.formatMessage({ id: 'joinUs.form.resume.sizeLimit', defaultMessage: '文件大小不能超过 10MB' }));
                    return Upload.LIST_IGNORE;
                  }
                  return false; // 阻止自动上传，由表单提交时处理
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 32, color: '#0071e3' }} />
                </p>
                <p className="ant-upload-text">
                  {intl.formatMessage({ id: 'joinUs.form.resume.hint', defaultMessage: '点击或拖拽文件到此处上传' })}
                </p>
                <p className="ant-upload-hint">
                  {intl.formatMessage({ id: 'joinUs.form.resume.format', defaultMessage: '支持 PDF、DOC、DOCX 格式' })}
                </p>
              </Upload.Dragger>
            </Form.Item>
            
            <Form.Item
              name="message"
              label={intl.formatMessage({ id: 'joinUs.form.message', defaultMessage: '自我介绍' })}
            >
              <Input.TextArea 
                rows={4} 
                placeholder={intl.formatMessage({ id: 'joinUs.form.message.placeholder', defaultMessage: '简单介绍一下自己，为什么想加入我们？' })}
              />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block
                loading={submitting}
                style={{ 
                  height: 52, 
                  fontSize: 17, 
                  fontWeight: 500,
                  borderRadius: 12
                }}
              >
                {submitting ? intl.formatMessage({ id: 'common.submitting', defaultMessage: '提交中...' }) : intl.formatMessage({ id: 'joinUs.form.submit', defaultMessage: '提交申请' })}
              </Button>
            </Form.Item>
            </Form>
        </StyledModal>

        {/* Application Detail Modal */}
        <ApplicationDetailModal
          title={intl.formatMessage({ id: 'joinUs.myApplications.detailTitle', defaultMessage: '申请详情' })}
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          width={560}
          centered
        >
          {selectedApplication && (
            <>
              {/* 基本信息 */}
              <DetailSection>
                <h4>{intl.formatMessage({ id: 'joinUs.detail.basicInfo', defaultMessage: '基本信息' })}</h4>
                <DetailGrid>
                  <DetailItem>
                    <div className="icon"><UserOutlined /></div>
                    <div className="content">
                      <div className="label">{intl.formatMessage({ id: 'joinUs.form.name', defaultMessage: '姓名' })}</div>
                      <div className="value">{selectedApplication.name}</div>
                    </div>
                  </DetailItem>
                  <DetailItem>
                    <div className="icon"><MailOutlined /></div>
                    <div className="content">
                      <div className="label">{intl.formatMessage({ id: 'joinUs.form.email', defaultMessage: '邮箱' })}</div>
                      <div className="value">{selectedApplication.email}</div>
                    </div>
                  </DetailItem>
                  {selectedApplication.phone && (
                    <DetailItem>
                      <div className="icon"><PhoneOutlined /></div>
                      <div className="content">
                        <div className="label">{intl.formatMessage({ id: 'joinUs.form.phone', defaultMessage: '手机号码' })}</div>
                        <div className="value">{selectedApplication.phone}</div>
                      </div>
                    </DetailItem>
                  )}
                  <DetailItem>
                    <div className="icon"><ClockCircleOutlined /></div>
                    <div className="content">
                      <div className="label">{intl.formatMessage({ id: 'joinUs.form.experience', defaultMessage: '工作经验' })}</div>
                      <div className="value">{getExperienceText(selectedApplication.experience)}</div>
                    </div>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {/* 职位信息 */}
              <DetailSection>
                <h4>{intl.formatMessage({ id: 'joinUs.detail.positionInfo', defaultMessage: '职位信息' })}</h4>
                <DetailGrid>
                  <DetailItem>
                    <div className="icon"><TeamOutlined /></div>
                    <div className="content">
                      <div className="label">{intl.formatMessage({ id: 'joinUs.detail.position', defaultMessage: '申请职位' })}</div>
                      <div className="value">{selectedApplication.position}</div>
                    </div>
                  </DetailItem>
                  <DetailItem>
                    <div className="icon"><GlobalOutlined /></div>
                    <div className="content">
                      <div className="label">{intl.formatMessage({ id: 'joinUs.detail.category', defaultMessage: '职位分类' })}</div>
                      <div className="value">{getCategoryText(selectedApplication.category)}</div>
                    </div>
                  </DetailItem>
                  <DetailItem>
                    <div className="icon"><EnvironmentOutlined /></div>
                    <div className="content">
                      <div className="label">{intl.formatMessage({ id: 'joinUs.detail.location', defaultMessage: '工作地点' })}</div>
                      <div className="value">{selectedApplication.location === 'remote' ? intl.formatMessage({ id: 'joinUs.location.remote', defaultMessage: '远程' }) : selectedApplication.location}</div>
                    </div>
                  </DetailItem>
                  <DetailItem>
                    <div className="icon"><CalendarOutlined /></div>
                    <div className="content">
                      <div className="label">{intl.formatMessage({ id: 'joinUs.detail.applyTime', defaultMessage: '申请时间' })}</div>
                      <div className="value">{selectedApplication.createTime}</div>
                    </div>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {/* 简历 */}
              {selectedApplication.resumeUrl && (
                <DetailSection>
                  <h4>{intl.formatMessage({ id: 'joinUs.form.resume', defaultMessage: '简历' })}</h4>
                  <ResumeLink href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <FilePdfOutlined className="icon" />
                    {selectedApplication.resumeName || intl.formatMessage({ id: 'joinUs.detail.downloadResume', defaultMessage: '下载简历' })}
                    <DownloadOutlined />
                  </ResumeLink>
                </DetailSection>
              )}

              {/* 自我介绍 */}
              {selectedApplication.message && (
                <DetailSection>
                  <h4>{intl.formatMessage({ id: 'joinUs.form.message', defaultMessage: '自我介绍' })}</h4>
                  <MessageBox>
                    <p>{selectedApplication.message}</p>
                  </MessageBox>
                </DetailSection>
              )}

              {/* 状态 */}
              <DetailSection>
                <h4>{intl.formatMessage({ id: 'joinUs.detail.status', defaultMessage: '申请状态' })}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div 
                    className={`status ${selectedApplication.status?.toLowerCase()}`}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      background: selectedApplication.status === 'PENDING' ? 'rgba(255, 193, 7, 0.15)' :
                                 selectedApplication.status === 'REVIEWING' ? 'rgba(33, 150, 243, 0.15)' :
                                 selectedApplication.status === 'INTERVIEW' ? 'rgba(156, 39, 176, 0.15)' :
                                 selectedApplication.status === 'ACCEPTED' ? 'rgba(76, 175, 80, 0.15)' :
                                 'rgba(244, 67, 54, 0.15)',
                      color: selectedApplication.status === 'PENDING' ? '#ffc107' :
                             selectedApplication.status === 'REVIEWING' ? '#2196f3' :
                             selectedApplication.status === 'INTERVIEW' ? '#9c27b0' :
                             selectedApplication.status === 'ACCEPTED' ? '#4caf50' :
                             '#f44336'
                    }}
                  >
                    {getStatusText(selectedApplication.status)}
                  </div>
                </div>
              </DetailSection>
            </>
          )}
        </ApplicationDetailModal>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default JoinUsPage;
