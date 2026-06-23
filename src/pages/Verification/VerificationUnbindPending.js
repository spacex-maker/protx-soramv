import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { CheckCircleFilled, ClockCircleOutlined, UnlockOutlined } from '@ant-design/icons';
import { VERIFICATION_ROUTES } from './verificationRoutes';
import { VerificationLoading } from './verificationShared';
import { useVerificationStatus } from './useVerificationStatus';
import { formatFirstAvailableDateTime } from './verificationDateUtils';
import {
  GhostButton,
  GradientTitle,
  HeroBlock,
  StatusBadge,
  Subtitle,
  VerificationHeroIcon,
  VerificationImmersiveActions,
  VerificationImmersiveContent,
  VerificationImmersiveShell,
  VerificationInfoPanel,
  VerificationProgress,
} from './verificationImmersive';

const VerificationUnbindPending = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { loading, realnameInfo, kycStatus } = useVerificationStatus(true);

  useEffect(() => {
    if (loading) return;
    if (kycStatus === 0 || kycStatus === 1 || kycStatus === 2) {
      navigate(VERIFICATION_ROUTES.root, { replace: true });
    } else if (kycStatus === 6) {
      navigate(VERIFICATION_ROUTES.unbindRejected, { replace: true });
    } else if (kycStatus !== 5) {
      navigate(VERIFICATION_ROUTES.root, { replace: true });
    }
  }, [loading, kycStatus, navigate]);

  if (loading || kycStatus !== 5) {
    return <VerificationLoading />;
  }

  const infoRows = [
    realnameInfo?.applyReason && {
      label: intl.formatMessage({ id: 'verification.unbind.reason.label', defaultMessage: '解绑原因' }),
      value: realnameInfo.applyReason,
    },
    realnameInfo?.realName && {
      label: intl.formatMessage({ id: 'verification.info.name', defaultMessage: '姓名：' }),
      value: realnameInfo.realName,
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
      label: intl.formatMessage({ id: 'verification.unbind.step.review', defaultMessage: '解绑审核中' }),
      done: false,
      active: true,
      icon: <ClockCircleOutlined />,
    },
    {
      key: 'done',
      label: intl.formatMessage({ id: 'verification.unbind.step.done', defaultMessage: '完成解绑' }),
      done: false,
      icon: <UnlockOutlined />,
    },
  ];

  return (
    <VerificationImmersiveShell variant="pending">
      <VerificationImmersiveContent>
        <HeroBlock>
          <VerificationHeroIcon variant="pending" icon={<ClockCircleOutlined />} animateRing />
          <StatusBadge $variant="pending">
            <ClockCircleOutlined />
            {intl.formatMessage({ id: 'verification.unbind.status.pending', defaultMessage: '解绑审核中' })}
          </StatusBadge>
          <GradientTitle $variant="pending">
            {intl.formatMessage({ id: 'verification.unbind.pending.title', defaultMessage: '解绑申请审核中' })}
          </GradientTitle>
          <Subtitle>
            {realnameInfo?.statusDescription ||
              intl.formatMessage({
                id: 'verification.unbind.pending.desc',
                defaultMessage: '您的解绑申请正在审核中，预计1-3个工作日完成审核',
              })}
          </Subtitle>
        </HeroBlock>

        <VerificationProgress variant="pending" steps={steps} />

        <VerificationInfoPanel
          variant="pending"
          title={intl.formatMessage({ id: 'verification.unbind.pending.infoTitle', defaultMessage: '本次解绑申请' })}
          rows={infoRows}
        />

        <VerificationImmersiveActions variant="pending">
          <GhostButton $variant="pending" size="large" onClick={() => navigate('/profile')}>
            {intl.formatMessage({ id: 'verification.back.profile', defaultMessage: '返回个人中心' })}
          </GhostButton>
        </VerificationImmersiveActions>
      </VerificationImmersiveContent>
    </VerificationImmersiveShell>
  );
};

export default VerificationUnbindPending;
