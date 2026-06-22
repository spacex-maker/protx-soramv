import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { VERIFICATION_ROUTES } from './verificationRoutes';
import { VerificationLoading } from './verificationShared';
import { useVerificationStatus } from './useVerificationStatus';
import {
  AccentButton,
  buildInfoRows,
  GhostButton,
  GlassPanel,
  GradientTitle,
  HeroBlock,
  PanelTitle,
  RejectText,
  StatusBadge,
  Subtitle,
  VerificationHeroIcon,
  VerificationImmersiveActions,
  VerificationImmersiveContent,
  VerificationImmersiveShell,
  VerificationInfoPanel,
  VerificationProgress,
} from './verificationImmersive';

const VerificationRejected = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { loading, realnameInfo, kycStatus } = useVerificationStatus(true);

  useEffect(() => {
    if (loading) return;
    if (kycStatus === 0) {
      navigate(VERIFICATION_ROUTES.apply, { replace: true });
    } else if (kycStatus === 1) {
      navigate(VERIFICATION_ROUTES.pending, { replace: true });
    } else if (kycStatus === 2) {
      navigate(VERIFICATION_ROUTES.verified, { replace: true });
    }
  }, [loading, kycStatus, navigate]);

  if (loading || (kycStatus !== 3 && kycStatus !== 4)) {
    return <VerificationLoading />;
  }

  const rejectReason = realnameInfo?.rejectReason || realnameInfo?.realnameRejectReason;

  const infoRows = buildInfoRows(intl, realnameInfo, {
    includeIdNumber: true,
    includeSubmitTime: true,
  });

  const steps = [
    {
      key: 'submit',
      label: intl.formatMessage({ id: 'verification.pending.step.submit', defaultMessage: '已提交' }),
      done: true,
      icon: <CheckCircleFilled />,
    },
    {
      key: 'review',
      label: intl.formatMessage({ id: 'verification.rejected.step.failed', defaultMessage: '审核未通过' }),
      failed: true,
      icon: <CloseCircleFilled />,
    },
    {
      key: 'resubmit',
      label: intl.formatMessage({ id: 'verification.resubmit', defaultMessage: '重新提交' }),
      icon: <ReloadOutlined />,
    },
  ];

  return (
    <VerificationImmersiveShell variant="rejected">
      <VerificationImmersiveContent>
        <HeroBlock>
          <VerificationHeroIcon
            variant="rejected"
            icon={<CloseCircleFilled />}
            animateRing
          />
          <StatusBadge $variant="rejected">
            <CloseCircleFilled />
            {intl.formatMessage({ id: 'verification.status.rejected', defaultMessage: '未通过' })}
          </StatusBadge>
          <GradientTitle $variant="rejected">
            {intl.formatMessage({ id: 'verification.rejected.title', defaultMessage: '实名认证未通过' })}
          </GradientTitle>
          <Subtitle>
            {realnameInfo?.statusDescription ||
              intl.formatMessage({ id: 'verification.rejected.desc', defaultMessage: '您的实名认证未通过审核' })}
          </Subtitle>
        </HeroBlock>

        <VerificationProgress variant="rejected" steps={steps} />

        {rejectReason ? (
          <GlassPanel
            $variant="rejected"
            $danger
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: 20 }}
          >
            <PanelTitle $variant="rejected" $danger>
              {intl.formatMessage({ id: 'verification.rejected.reason', defaultMessage: '拒绝原因' })}
            </PanelTitle>
            <RejectText>{rejectReason}</RejectText>
          </GlassPanel>
        ) : null}

        <VerificationInfoPanel
          variant="rejected"
          title={intl.formatMessage({ id: 'verification.pending.infoTitle', defaultMessage: '本次提交信息' })}
          rows={infoRows}
          delay={0.2}
        />

        <VerificationImmersiveActions variant="rejected">
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <GhostButton $variant="rejected" size="large" onClick={() => navigate('/profile')}>
              {intl.formatMessage({ id: 'verification.back.profile', defaultMessage: '返回个人中心' })}
            </GhostButton>
            <AccentButton
              $variant="pending"
              size="large"
              onClick={() => navigate(VERIFICATION_ROUTES.apply)}
            >
              {intl.formatMessage({ id: 'verification.resubmit', defaultMessage: '重新提交' })}
            </AccentButton>
          </div>
        </VerificationImmersiveActions>
      </VerificationImmersiveContent>
    </VerificationImmersiveShell>
  );
};

export default VerificationRejected;
