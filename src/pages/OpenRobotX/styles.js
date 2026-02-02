import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

export const glowPulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

export const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0e17;
  color: #e8eaed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
`;

export const Section = styled.section`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 48px 16px;
  }
`;

export const SectionTitle = styled(motion.h2)`
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  color: #fff;
`;

export const SectionSubtitle = styled(motion.p)`
  font-size: clamp(15px, 2vw, 18px);
  text-align: center;
  color: #9aa0a6;
  max-width: 640px;
  margin: 0 auto 48px;
  line-height: 1.6;
`;
