import React, { useState, useRef } from 'react';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { ContentWrapper, Section } from '../styles';
import PageTransition from '../../../components/misc/PageTransition';

const { Title, Paragraph } = Typography;

// 炫彩渐变动画
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
`;

// 炫彩按钮样式
const RainbowButton = styled(motion.button)`
  position: relative;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 炫彩渐变背景 */
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #00f2fe 100%
  );
  background-size: 300% 300%;
  animation: ${gradientShift} 8s ease infinite;
  
  /* 光泽效果 */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
    );
    animation: ${shimmer} 3s infinite;
    z-index: 2;
  }
  
  /* 文字层 */
  span {
    position: relative;
    z-index: 3;
    display: inline-block;
  }
  
  /* 悬停效果 */
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 
      0 20px 40px rgba(102, 126, 234, 0.4),
      0 0 60px rgba(118, 75, 162, 0.3),
      inset 0 0 30px rgba(255, 255, 255, 0.1);
    animation-duration: 4s;
  }
  
  /* 点击效果 */
  &:active {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 
      0 10px 20px rgba(102, 126, 234, 0.3),
      0 0 30px rgba(118, 75, 162, 0.2);
  }
  
  /* 脉冲动画 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 100px;
    z-index: 0;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  /* 禁用状态 */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
    animation-play-state: paused;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  /* 响应式 */
  @media (max-width: 768px) {
    padding: 14px 36px;
    font-size: 16px;
  }
`;

const CallToActionSection = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [triggerPoint, setTriggerPoint] = useState({ 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0, 
    left: 0, 
    top: 0, 
    borderRadius: 0 
  });
  const buttonRef = useRef(null);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 获取按钮在视口中的精确位置和尺寸
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTriggerPoint({ 
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        borderRadius: 100
      });
    } else {
      // 如果无法获取按钮位置，使用点击位置和默认尺寸
      setTriggerPoint({ 
        x: e.clientX, 
        y: e.clientY,
        width: 200,
        height: 56,
        left: e.clientX - 100,
        top: e.clientY - 28,
        borderRadius: 100
      });
    }
    
    // 启动过渡动效
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    // 延迟跳转，确保动画完全完成
    setTimeout(() => {
      navigate('/signup');
      // 重置状态，以便下次可以再次使用
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 200);
  };

  return (
    <>
      <Section>
        <ContentWrapper style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Title level={2} style={{ marginBottom: '24px' }}>
              {intl.formatMessage({ id: 'cta.title', defaultMessage: '开始创作您的视频' })}
            </Title>
            <Paragraph style={{ fontSize: '18px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              {intl.formatMessage({ 
                id: 'cta.description', 
                defaultMessage: '立即注册，使用 AI 技术将您的创意转化为惊艳的视频作品' 
              })}
            </Paragraph>
            <RainbowButton
              ref={buttonRef}
              onClick={handleButtonClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              disabled={isTransitioning}
              type="button"
            >
              <span>
                {intl.formatMessage({ id: 'cta.button', defaultMessage: '免费开始创作' })}
              </span>
            </RainbowButton>
          </motion.div>
        </ContentWrapper>
      </Section>

      {/* 全局过渡动效 */}
      <PageTransition
        isActive={isTransitioning}
        buttonRect={triggerPoint}
        onComplete={handleTransitionComplete}
        targetPath="/signup"
      />
    </>
  );
};

export default CallToActionSection; 