import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { CheckCircleFilled, CloseCircleFilled, ReloadOutlined, UnlockOutlined } from '@ant-design/icons';
import { VERIFICATION_ROUTES } from './verificationRoutes';
import { VerificationLoading } from './verificationShared';
import { useVerificationStatus } from './useVerificationStatus';
import {
  AccentButton,
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
import { formatFirstAvailableDateTime } from './verificationDateUtils';

const VerificationUnbindRejected = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { loading, realnameInfo, kycStatus } = useVerificationStatus(true);

  useEffect(() => {
    if (loading) return;
    if (kycStatus === 0 || kycStatus === 1 || kycStatus === 5) {
      navigate(VERIFICATION_ROUTES.root, { replace: true });
    } else if (kycStatus !== 6) {
      navigate(VERIFICATION_ROUTES.root, { replace: true });
    }
  }, [loading, kycStatus, navigate]);

  if (loading || kycStatus !== 6) {
    return <VerificationLoading />;
  }

  const rejectReason = realnameInfo?.rejectReason || realnameInfo?.realnameRejectReason;

  const infoRows = [
    realnameInfo?.applyReason && {
      label: intl.formatMessage({ id: 'verification.unbind.reason.label', defaultMessage: '解绑原因' }),
      value: realnameInfo.applyReason,
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
      label: intl.formatMessage({ id: 'verification.unbind.step.submit', defaultMessage: '已提交解绑申请' }),
      done: true,
      icon: <CheckCircleFilled />,
    },
    {
      key: 'review',
      label: intl.formatMessage({ id: 'verification.unbind.step.failed', defaultMessage: '解绑未通过' }),
      failed: true,
      icon: <CloseCircleFilled />,
    },
    {
      key: 'resubmit',
      label: intl.formatMessage({ id: 'verification.unbind.resubmit', defaultMessage: '重新申请' }),
      icon: <ReloadOutlined />,
    },
  ];

  return (
    <VerificationImmersiveShell variant="rejected">
      <VerificationImmersiveContent>
        <HeroBlock>
          <VerificationHeroIcon variant="rejected" icon={<CloseCircleFilled />} animateRing />
          <StatusBadge $variant="rejected">
            <CloseCircleFilled />
            {intl.formatMessage({ id: 'verification.unbind.status.rejected', defaultMessage: '解绑未通过' })}
          </StatusBadge>
          <GradientTitle $variant="rejected">
            {intl.formatMessage({ id: 'verification.unbind.rejected.title', defaultMessage: '解绑申请未通过' })}
          </GradientTitle>
          <Subtitle>
            {realnameInfo?.statusDescription ||
              intl.formatMessage({
                id: 'verification.unbind.rejected.desc',
                defaultMessage: '您的解绑申请未通过审核，实名绑定仍然有效',
              })}
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
          title={intl.formatMessage({ id: 'verification.unbind.pending.infoTitle', defaultMessage: '本次解绑申请' })}
          rows={infoRows}
          delay={0.2}
        />

        <VerificationImmersiveActions variant="rejected">
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <GhostButton $variant="rejected" size="large" onClick={() => navigate(VERIFICATION_ROUTES.verified)}>
              {intl.formatMessage({ id: 'verification.back.profile', defaultMessage: '返回个人中心' })}
            </GhostButton>
            <AccentButton
              $variant="pending"
              size="large"
              onClick={() => navigate(VERIFICATION_ROUTES.unbindApply)}
            >
              {intl.formatMessage({ id: 'verification.unbind.resubmit', defaultMessage: '重新申请' })}
            </AccentButton>
          </div>
        </VerificationImmersiveActions>
      </VerificationImmersiveContent>
    </VerificationImmersiveShell>
  );
};

export default VerificationUnbindRejected;
