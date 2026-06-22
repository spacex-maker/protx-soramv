import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { VERIFICATION_ROUTES } from './verificationRoutes';
import { VerificationHistoryLink, VerificationLoading } from './verificationShared';
import { useVerificationStatus } from './useVerificationStatus';
import SimpleHeader from 'components/headers/simple';
import FooterSection from '../Home/components/FooterSection';
import { formatFirstAvailableDateTime } from './verificationDateUtils';

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

const PendingPage = styled.div`
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
    radial-gradient(ellipse 90% 55% at 50% -15%, rgba(124, 58, 237, 0.42), transparent 65%),
    radial-gradient(ellipse 55% 45% at 95% 35%, rgba(59, 130, 246, 0.22), transparent 60%),
    radial-gradient(ellipse 50% 40% at 5% 75%, rgba(167, 139, 250, 0.28), transparent 55%),
    radial-gradient(ellipse 40% 30% at 50% 100%, rgba(99, 102, 241, 0.15), transparent 50%),
    linear-gradient(180deg, #07060f 0%, #0f0b1e 45%, #080612 100%);
`;

const GridOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(124, 58, 237, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124, 58, 237, 0.06) 1px, transparent 1px);
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

const HeroBlock = styled.div`
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
  background: radial-gradient(circle, rgba(124, 58, 237, 0.55) 0%, transparent 70%);
  animation: ${pulse} 3s ease-in-out infinite;
`;

const ScanRing = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px dashed rgba(167, 139, 250, 0.45);
  animation: ${spin} 14s linear infinite;
`;

const ScanRingInner = styled.div`
  position: absolute;
  inset: 14%;
  border-radius: 50%;
  border: 1px solid rgba(99, 102, 241, 0.25);
  animation: ${spin} 10s linear infinite reverse;
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
  color: #ede9fe;
  background: linear-gradient(145deg, rgba(124, 58, 237, 0.9), rgba(79, 70, 229, 0.75));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12),
    0 0 48px rgba(124, 58, 237, 0.55),
    0 20px 40px rgba(0, 0, 0, 0.35);

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 36px;
  }
`;

const StatusBadge = styled.span`
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
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.18);
  border: 1px solid rgba(167, 139, 250, 0.35);
  box-shadow: 0 0 24px rgba(124, 58, 237, 0.2);
`;

const GradientTitle = styled.h1`
  margin: 0 0 16px;
  font-size: clamp(32px, 5.5vw, 48px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #ddd6fe 45%, #a5b4fc 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 6s linear infinite;
`;

const Subtitle = styled.p`
  margin: 0;
  max-width: 520px;
  font-size: clamp(15px, 2.5vw, 18px);
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.72);
`;

const ProgressTrack = styled.div`
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
    background: ${(props) =>
      props.$done
        ? 'linear-gradient(90deg, #7c3aed, #6366f1)'
        : 'rgba(255, 255, 255, 0.08)'};
    z-index: 0;
  }
`;

const stepDotActiveStyles = css`
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.25), 0 0 32px rgba(124, 58, 237, 0.45);
  animation: ${pulse} 2s ease-in-out infinite;
`;

const stepDotDoneStyles = css`
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
`;

const stepDotDefaultStyles = css`
  color: rgba(148, 163, 184, 0.6);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

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

  ${(props) =>
    props.$active ? stepDotActiveStyles : props.$done ? stepDotDoneStyles : stepDotDefaultStyles}
`;

const StepLabel = styled.span`
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  color: ${(props) =>
    props.$active ? '#e9d5ff' : props.$done ? 'rgba(226, 232, 240, 0.85)' : 'rgba(148, 163, 184, 0.55)'};
  white-space: nowrap;
`;

const GlassPanel = styled(motion.div)`
  width: 100%;
  max-width: 560px;
  padding: 28px 32px;
  border-radius: 24px;
  text-align: left;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  @media (max-width: 768px) {
    padding: 22px 20px;
    border-radius: 20px;
  }
`;

const PanelTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(196, 181, 253, 0.85);
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const InfoRow = styled.div`
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

const InfoLabel = styled.span`
  font-size: 14px;
  color: rgba(148, 163, 184, 0.75);
  flex-shrink: 0;
`;

const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.95);
  text-align: right;
  word-break: break-all;

  @media (max-width: 480px) {
    text-align: left;
  }
`;

const ActionRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
`;

const PrimaryButton = styled(Button)`
  && {
    height: 48px;
    min-width: 180px;
    padding: 0 32px;
    border-radius: 999px !important;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    background: rgba(255, 255, 255, 0.06) !important;
    color: rgba(241, 245, 249, 0.95) !important;
    backdrop-filter: blur(12px);

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      border-color: rgba(167, 139, 250, 0.45) !important;
      box-shadow: 0 0 32px rgba(124, 58, 237, 0.25);
    }
  }
`;

const HistoryLinkWrap = styled.div`
  .ant-btn-link {
    color: rgba(196, 181, 253, 0.75) !important;

    &:hover {
      color: #ddd6fe !important;
    }
  }
`;

const VerificationPending = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { loading, realnameInfo, kycStatus } = useVerificationStatus(true);

  useEffect(() => {
    if (loading) return;
    if (kycStatus === 0) {
      navigate(VERIFICATION_ROUTES.apply, { replace: true });
    } else if (kycStatus === 2) {
      navigate(VERIFICATION_ROUTES.verified, { replace: true });
    } else if (kycStatus === 3 || kycStatus === 4) {
      navigate(VERIFICATION_ROUTES.rejected, { replace: true });
    }
  }, [loading, kycStatus, navigate]);

  if (loading || kycStatus !== 1) {
    return <VerificationLoading />;
  }

  const infoRows = [
    realnameInfo?.realName && {
      label: intl.formatMessage({ id: 'verification.info.name', defaultMessage: '姓名：' }),
      value: realnameInfo.realName,
    },
    realnameInfo?.idType && {
      label: intl.formatMessage({ id: 'verification.info.idType', defaultMessage: '证件类型：' }),
      value: realnameInfo.idType,
    },
    realnameInfo?.idNumber && {
      label: intl.formatMessage({ id: 'verification.info.idNumber', defaultMessage: '证件号码：' }),
      value: realnameInfo.idNumber,
    },
    realnameInfo?.kycCountry && {
      label: intl.formatMessage({ id: 'verification.info.country', defaultMessage: '国家/地区：' }),
      value: realnameInfo.kycCountry,
    },
    realnameInfo?.submittedAt || realnameInfo?.realnameSubmitTime
      ? {
      label: intl.formatMessage({ id: 'verification.info.submitTime', defaultMessage: '提交时间：' }),
      value: formatFirstAvailableDateTime(realnameInfo?.submittedAt, realnameInfo?.realnameSubmitTime),
    }
      : null,
  ].filter(Boolean);

  const steps = [
    {
      key: 'submit',
      label: intl.formatMessage({ id: 'verification.pending.step.submit', defaultMessage: '已提交' }),
      done: true,
      active: false,
      icon: <CheckCircleFilled />,
    },
    {
      key: 'review',
      label: intl.formatMessage({ id: 'verification.pending.step.review', defaultMessage: '审核中' }),
      done: false,
      active: true,
      icon: <ClockCircleOutlined />,
    },
    {
      key: 'done',
      label: intl.formatMessage({ id: 'verification.pending.step.done', defaultMessage: '完成认证' }),
      done: false,
      active: false,
      icon: <SafetyCertificateOutlined />,
    },
  ];

  return (
    <PendingPage>
      <BackgroundLayer />
      <GridOverlay />
      <Orb
        style={{ width: 320, height: 320, top: '8%', left: '-8%', background: 'rgba(124, 58, 237, 0.35)' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Orb
        style={{ width: 280, height: 280, top: '55%', right: '-6%', background: 'rgba(59, 130, 246, 0.28)' }}
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Orb
        style={{ width: 200, height: 200, bottom: '10%', left: '15%', background: 'rgba(167, 139, 250, 0.22)' }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <SimpleHeader />

      <ContentWrap initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <HeroBlock>
          <IconStage>
            <GlowCore />
            <ScanRing />
            <ScanRingInner />
            <IconCircle>
              <SafetyCertificateOutlined />
            </IconCircle>
          </IconStage>

          <StatusBadge>
            <ClockCircleOutlined />
            {intl.formatMessage({ id: 'verification.status.pending', defaultMessage: '审核中' })}
          </StatusBadge>

          <GradientTitle>
            {intl.formatMessage({ id: 'verification.reviewing.title', defaultMessage: '实名认证审核中' })}
          </GradientTitle>

          <Subtitle>
            {realnameInfo?.statusDescription ||
              intl.formatMessage({
                id: 'verification.reviewing.desc',
                defaultMessage: '您的实名认证资料正在审核中，预计1-3个工作日完成审核',
              })}
          </Subtitle>
        </HeroBlock>

        <ProgressTrack>
          {steps.map((step) => (
            <ProgressStep key={step.key} $done={step.done}>
              <StepDot $done={step.done} $active={step.active}>
                {step.icon}
              </StepDot>
              <StepLabel $done={step.done} $active={step.active}>
                {step.label}
              </StepLabel>
            </ProgressStep>
          ))}
        </ProgressTrack>

        {infoRows.length > 0 ? (
          <GlassPanel
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <PanelTitle>
              {intl.formatMessage({ id: 'verification.pending.infoTitle', defaultMessage: '本次提交信息' })}
            </PanelTitle>
            {infoRows.map((row) => (
              <InfoRow key={row.label}>
                <InfoLabel>{row.label.replace(/：$/, '')}</InfoLabel>
                <InfoValue>{row.value}</InfoValue>
              </InfoRow>
            ))}
          </GlassPanel>
        ) : null}

        <ActionRow>
          <PrimaryButton size="large" onClick={() => navigate('/profile')}>
            {intl.formatMessage({ id: 'verification.back.profile', defaultMessage: '返回个人中心' })}
          </PrimaryButton>
          <HistoryLinkWrap>
            <VerificationHistoryLink />
          </HistoryLinkWrap>
        </ActionRow>
      </ContentWrap>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <FooterSection />
      </div>
    </PendingPage>
  );
};

export default VerificationPending;
