import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import SimpleHeader from 'components/headers/simple';
import FooterSection from '../Home/components/FooterSection';
import { VerificationHistoryLink } from './verificationShared';
import { formatDateTime, formatFirstAvailableDateTime } from './verificationDateUtils';

const pulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.06); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

export const VARIANTS = {
  pending: {
    orb1: 'rgba(124, 58, 237, 0.35)',
    orb2: 'rgba(59, 130, 246, 0.28)',
    orb3: 'rgba(167, 139, 250, 0.22)',
    bg1: 'rgba(124, 58, 237, 0.42)',
    bg2: 'rgba(59, 130, 246, 0.22)',
    bg3: 'rgba(167, 139, 250, 0.28)',
    bg4: 'rgba(99, 102, 241, 0.15)',
    grid: 'rgba(124, 58, 237, 0.06)',
    glow: 'rgba(124, 58, 237, 0.55)',
    ring: 'rgba(167, 139, 250, 0.45)',
    ringInner: 'rgba(99, 102, 241, 0.25)',
    iconGradient: '145deg, rgba(124, 58, 237, 0.9), rgba(79, 70, 229, 0.75)',
    iconShadow: '124, 58, 237',
    titleGradient: '135deg, #ffffff 0%, #ddd6fe 45%, #a5b4fc 100%',
    badgeColor: '#c4b5fd',
    badgeBg: 'rgba(124, 58, 237, 0.18)',
    badgeBorder: 'rgba(167, 139, 250, 0.35)',
    badgeShadow: 'rgba(124, 58, 237, 0.2)',
    lineDone: 'linear-gradient(90deg, #7c3aed, #6366f1)',
    dotDone: '135deg, #7c3aed, #6366f1',
    dotShadow: '124, 58, 237',
    panelTitle: 'rgba(196, 181, 253, 0.85)',
    linkColor: 'rgba(196, 181, 253, 0.75)',
    linkHover: '#ddd6fe',
    btnHoverBorder: 'rgba(167, 139, 250, 0.45)',
    btnHoverShadow: 'rgba(124, 58, 237, 0.25)',
  },
  verified: {
    orb1: 'rgba(16, 185, 129, 0.32)',
    orb2: 'rgba(52, 211, 153, 0.24)',
    orb3: 'rgba(110, 231, 183, 0.2)',
    bg1: 'rgba(16, 185, 129, 0.38)',
    bg2: 'rgba(52, 211, 153, 0.2)',
    bg3: 'rgba(110, 231, 183, 0.22)',
    bg4: 'rgba(5, 150, 105, 0.12)',
    grid: 'rgba(16, 185, 129, 0.06)',
    glow: 'rgba(16, 185, 129, 0.5)',
    ring: 'rgba(110, 231, 183, 0.5)',
    ringInner: 'rgba(52, 211, 153, 0.28)',
    iconGradient: '145deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.88)',
    iconShadow: '16, 185, 129',
    titleGradient: '135deg, #ffffff 0%, #a7f3d0 45%, #6ee7b7 100%',
    badgeColor: '#a7f3d0',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeBorder: 'rgba(110, 231, 183, 0.4)',
    badgeShadow: 'rgba(16, 185, 129, 0.22)',
    lineDone: 'linear-gradient(90deg, #10b981, #34d399)',
    dotDone: '135deg, #10b981, #34d399',
    dotShadow: '16, 185, 129',
    panelTitle: 'rgba(167, 243, 208, 0.9)',
    linkColor: 'rgba(167, 243, 208, 0.75)',
    linkHover: '#d1fae5',
    btnHoverBorder: 'rgba(110, 231, 183, 0.45)',
    btnHoverShadow: 'rgba(16, 185, 129, 0.28)',
  },
  rejected: {
    orb1: 'rgba(239, 68, 68, 0.3)',
    orb2: 'rgba(248, 113, 113, 0.22)',
    orb3: 'rgba(251, 146, 60, 0.18)',
    bg1: 'rgba(239, 68, 68, 0.35)',
    bg2: 'rgba(248, 113, 113, 0.18)',
    bg3: 'rgba(251, 146, 60, 0.16)',
    bg4: 'rgba(220, 38, 38, 0.12)',
    grid: 'rgba(239, 68, 68, 0.06)',
    glow: 'rgba(239, 68, 68, 0.48)',
    ring: 'rgba(252, 165, 165, 0.45)',
    ringInner: 'rgba(248, 113, 113, 0.25)',
    iconGradient: '145deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.88)',
    iconShadow: '239, 68, 68',
    titleGradient: '135deg, #ffffff 0%, #fecaca 45%, #fca5a5 100%',
    badgeColor: '#fecaca',
    badgeBg: 'rgba(239, 68, 68, 0.18)',
    badgeBorder: 'rgba(252, 165, 165, 0.4)',
    badgeShadow: 'rgba(239, 68, 68, 0.22)',
    lineDone: 'linear-gradient(90deg, #ef4444, #f87171)',
    dotDone: '135deg, #ef4444, #f87171',
    dotShadow: '239, 68, 68',
    panelTitle: 'rgba(254, 202, 202, 0.9)',
    linkColor: 'rgba(254, 202, 202, 0.75)',
    linkHover: '#fee2e2',
    btnHoverBorder: 'rgba(252, 165, 165, 0.45)',
    btnHoverShadow: 'rgba(239, 68, 68, 0.25)',
  },
};

const getVariant = (variant) => VARIANTS[variant] || VARIANTS.pending;

export { formatDateTime, formatFirstAvailableDateTime } from './verificationDateUtils';

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-top: 70px;
  background: #07060f;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const BackgroundLayer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 90% 55% at 50% -15%, ${(p) => getVariant(p.$variant).bg1}, transparent 65%),
    radial-gradient(ellipse 55% 45% at 95% 35%, ${(p) => getVariant(p.$variant).bg2}, transparent 60%),
    radial-gradient(ellipse 50% 40% at 5% 75%, ${(p) => getVariant(p.$variant).bg3}, transparent 55%),
    radial-gradient(ellipse 40% 30% at 50% 100%, ${(p) => getVariant(p.$variant).bg4}, transparent 50%),
    linear-gradient(180deg, #07060f 0%, #0f0b1e 45%, #080612 100%);
`;

const GridOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image:
    linear-gradient(${(p) => getVariant(p.$variant).grid} 1px, transparent 1px),
    linear-gradient(90deg, ${(p) => getVariant(p.$variant).grid} 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse 75% 65% at 50% 35%, black 20%, transparent 75%);
`;

const Orb = styled(motion.div)`
  position: fixed;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 1;
`;

const ContentWrap = styled(motion.div)`
  position: relative;
  z-index: 10;
  flex: 1;
  width: min(920px, 92%);
  margin: 0 auto;
  padding: 48px 0 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 768px) {
    padding: 32px 0 48px;
  }
`;

export const HeroBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
`;

const IconStage = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    width: 130px;
    height: 130px;
    margin-bottom: 28px;
  }
`;

const GlowCore = styled.div`
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background: radial-gradient(circle, ${(p) => getVariant(p.$variant).glow} 0%, transparent 70%);
  animation: ${pulse} 3s ease-in-out infinite;
`;

const ScanRing = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px dashed ${(p) => getVariant(p.$variant).ring};
  animation: ${(p) => (p.$animateRing ? css`${spin} 14s linear infinite` : 'none')};
`;

const ScanRingInner = styled.div`
  position: absolute;
  inset: 14%;
  border-radius: 50%;
  border: 1px solid ${(p) => getVariant(p.$variant).ringInner};
  animation: ${(p) => (p.$animateRing ? css`${spin} 10s linear infinite reverse` : 'none')};
`;

const IconCircle = styled.div`
  position: relative;
  z-index: 2;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  color: #fff;
  background: linear-gradient(${(p) => getVariant(p.$variant).iconGradient});
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12),
    0 0 48px rgba(${(p) => getVariant(p.$variant).iconShadow}, 0.55),
    0 20px 40px rgba(0, 0, 0, 0.35);

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 36px;
  }
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  margin-bottom: 20px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${(p) => getVariant(p.$variant).badgeColor};
  background: ${(p) => getVariant(p.$variant).badgeBg};
  border: 1px solid ${(p) => getVariant(p.$variant).badgeBorder};
  box-shadow: 0 0 24px ${(p) => getVariant(p.$variant).badgeShadow};
`;

export const GradientTitle = styled.h1`
  margin: 0 0 16px;
  font-size: clamp(32px, 5.5vw, 48px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  background: linear-gradient(${(p) => getVariant(p.$variant).titleGradient});
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 6s linear infinite;
`;

export const Subtitle = styled.p`
  margin: 0;
  max-width: 520px;
  font-size: clamp(15px, 2.5vw, 18px);
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.72);
`;

export const ProgressTrack = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  width: min(560px, 100%);
  margin: 0 auto 40px;
  padding: 0 8px;
`;

const ProgressStep = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 0;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 18px;
    left: calc(50% + 22px);
    width: calc(100% - 44px);
    height: 2px;
    background: ${(p) =>
      p.$lineDone ? getVariant(p.$variant).lineDone : 'rgba(255, 255, 255, 0.08)'};
    z-index: 0;
  }
`;

const makeDotStyles = (variant, type) => {
  const v = getVariant(variant);
  if (type === 'active') {
    return css`
      color: #fff;
      background: linear-gradient(${v.dotDone});
      box-shadow: 0 0 0 4px rgba(${v.dotShadow}, 0.25), 0 0 32px rgba(${v.dotShadow}, 0.45);
      animation: ${pulse} 2s ease-in-out infinite;
    `;
  }
  if (type === 'done') {
    return css`
      color: #fff;
      background: linear-gradient(${v.dotDone});
      box-shadow: 0 0 20px rgba(${v.dotShadow}, 0.3);
    `;
  }
  if (type === 'failed') {
    return css`
      color: #fff;
      background: linear-gradient(135deg, #ef4444, #f87171);
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.25), 0 0 32px rgba(239, 68, 68, 0.45);
      animation: ${pulse} 2s ease-in-out infinite;
    `;
  }
  return css`
    color: rgba(148, 163, 184, 0.6);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  `;
};

const StepDot = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  position: relative;
  z-index: 1;
  margin-bottom: 12px;
  transition: all 0.3s ease;

  ${(p) => {
    if (p.$failed) return makeDotStyles(p.$variant, 'failed');
    if (p.$active) return makeDotStyles(p.$variant, 'active');
    if (p.$done) return makeDotStyles(p.$variant, 'done');
    return makeDotStyles(p.$variant, 'default');
  }}
`;

const StepLabel = styled.span`
  font-size: 13px;
  font-weight: ${(p) => (p.$active || p.$failed ? 600 : 500)};
  color: ${(p) => {
    if (p.$failed) return '#fecaca';
    if (p.$active) return getVariant(p.$variant).badgeColor;
    if (p.$done) return 'rgba(226, 232, 240, 0.85)';
    return 'rgba(148, 163, 184, 0.55)';
  }};
  white-space: nowrap;
`;

export const GlassPanel = styled(motion.div)`
  width: 100%;
  max-width: 560px;
  padding: 28px 32px;
  border-radius: 24px;
  text-align: left;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  background: ${(p) =>
    p.$danger ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.035)'};
  border: 1px solid
    ${(p) => (p.$danger ? 'rgba(239, 68, 68, 0.22)' : 'rgba(255, 255, 255, 0.08)')};
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  @media (max-width: 768px) {
    padding: 22px 20px;
    border-radius: 20px;
  }
`;

export const PanelTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${(p) => (p.$danger ? '#fecaca' : getVariant(p.$variant).panelTitle)};
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

export const InfoLabel = styled.span`
  font-size: 14px;
  color: rgba(148, 163, 184, 0.75);
  flex-shrink: 0;
`;

export const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.95);
  text-align: right;
  word-break: break-all;

  @media (max-width: 480px) {
    text-align: left;
  }
`;

export const RejectText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.75;
  color: rgba(254, 226, 226, 0.92);
  white-space: pre-wrap;
  word-break: break-word;
`;

export const ActionRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

export const GhostButton = styled(Button)`
  && {
    height: 48px;
    min-width: 160px;
    padding: 0 28px;
    border-radius: 999px !important;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    background: rgba(255, 255, 255, 0.06) !important;
    color: rgba(241, 245, 249, 0.95) !important;
    backdrop-filter: blur(12px);

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      border-color: ${(p) => getVariant(p.$variant).btnHoverBorder} !important;
      box-shadow: 0 0 32px ${(p) => getVariant(p.$variant).btnHoverShadow};
    }
  }
`;

export const AccentButton = styled(Button)`
  && {
    height: 48px;
    min-width: 160px;
    padding: 0 28px;
    border-radius: 999px !important;
    font-weight: 600;
    border: none !important;
    background: linear-gradient(${(p) => getVariant(p.$variant).dotDone}) !important;
    color: #fff !important;
    box-shadow: 0 0 32px rgba(${(p) => getVariant(p.$variant).dotShadow}, 0.35);

    &:hover {
      opacity: 0.92;
      color: #fff !important;
      box-shadow: 0 0 40px rgba(${(p) => getVariant(p.$variant).dotShadow}, 0.5);
    }
  }
`;

const HistoryLinkWrap = styled.div`
  .ant-btn-link {
    color: ${(p) => getVariant(p.$variant).linkColor} !important;

    &:hover {
      color: ${(p) => getVariant(p.$variant).linkHover} !important;
    }
  }
`;

export const VerificationImmersiveShell = ({ variant = 'pending', children }) => {
  const v = getVariant(variant);

  return (
    <Page>
      <BackgroundLayer $variant={variant} />
      <GridOverlay $variant={variant} />
      <Orb
        style={{ width: 320, height: 320, top: '8%', left: '-8%', background: v.orb1 }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Orb
        style={{ width: 280, height: 280, top: '55%', right: '-6%', background: v.orb2 }}
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Orb
        style={{ width: 200, height: 200, bottom: '10%', left: '15%', background: v.orb3 }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <SimpleHeader />
      {children}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <FooterSection />
      </div>
    </Page>
  );
};

export const VerificationHeroIcon = ({ variant = 'pending', icon, animateRing = true }) => (
  <IconStage>
    <GlowCore $variant={variant} />
    <ScanRing $variant={variant} $animateRing={animateRing} />
    <ScanRingInner $variant={variant} $animateRing={animateRing} />
    <IconCircle $variant={variant}>{icon}</IconCircle>
  </IconStage>
);

export const VerificationProgress = ({ variant = 'pending', steps }) => (
  <ProgressTrack>
    {steps.map((step) => (
        <ProgressStep key={step.key} $variant={variant} $lineDone={step.done}>
          <StepDot
            $variant={variant}
            $done={step.done}
            $active={step.active}
            $failed={step.failed}
          >
            {step.icon}
          </StepDot>
          <StepLabel
            $variant={variant}
            $done={step.done}
            $active={step.active}
            $failed={step.failed}
          >
            {step.label}
          </StepLabel>
        </ProgressStep>
      ))}
  </ProgressTrack>
);

export const VerificationInfoPanel = ({ variant = 'pending', title, rows, danger = false, delay = 0.15 }) => {
  if (!rows?.length && !title) return null;

  return (
    <GlassPanel
      $variant={variant}
      $danger={danger}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {title ? (
        <PanelTitle $variant={variant} $danger={danger}>
          {title}
        </PanelTitle>
      ) : null}
      {rows?.map((row) => (
        <InfoRow key={row.label}>
          <InfoLabel>{row.label.replace(/：$/, '')}</InfoLabel>
          <InfoValue>{row.value}</InfoValue>
        </InfoRow>
      ))}
    </GlassPanel>
  );
};

export const VerificationImmersiveContent = ({ children }) => (
  <ContentWrap initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
    {children}
  </ContentWrap>
);

export const VerificationImmersiveActions = ({ variant = 'pending', children, showHistory = true }) => (
  <ActionRow>
    {children}
    {showHistory ? (
      <HistoryLinkWrap $variant={variant}>
        <VerificationHistoryLink />
      </HistoryLinkWrap>
    ) : null}
  </ActionRow>
);

export const buildInfoRows = (intl, realnameInfo, options = {}) => {
  const { includeIdNumber = false, includeSubmitTime = false } = options;

  const verifyTime = formatFirstAvailableDateTime(
    realnameInfo?.verifiedAt,
    realnameInfo?.realnameVerifiedTime
  );
  const submitTime = formatFirstAvailableDateTime(
    realnameInfo?.submittedAt,
    realnameInfo?.realnameSubmitTime
  );

  return [
    realnameInfo?.realName && {
      label: intl.formatMessage({ id: 'verification.info.name', defaultMessage: '姓名：' }),
      value: realnameInfo.realName,
    },
    realnameInfo?.idType && {
      label: intl.formatMessage({ id: 'verification.info.idType', defaultMessage: '证件类型：' }),
      value: realnameInfo.idType,
    },
    includeIdNumber &&
      realnameInfo?.idNumber && {
        label: intl.formatMessage({ id: 'verification.info.idNumber', defaultMessage: '证件号码：' }),
        value: realnameInfo.idNumber,
      },
    realnameInfo?.kycCountry && {
      label: intl.formatMessage({ id: 'verification.info.country', defaultMessage: '国家/地区：' }),
      value: realnameInfo.kycCountry,
    },
    verifyTime && {
      label: intl.formatMessage({ id: 'verification.info.verifyTime', defaultMessage: '认证时间：' }),
      value: verifyTime,
    },
    includeSubmitTime &&
      submitTime && {
        label: intl.formatMessage({ id: 'verification.info.submitTime', defaultMessage: '提交时间：' }),
        value: submitTime,
      },
  ].filter(Boolean);
};
