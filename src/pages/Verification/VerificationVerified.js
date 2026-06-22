import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { CheckCircleFilled, SafetyCertificateOutlined } from '@ant-design/icons';
import { VERIFICATION_ROUTES } from './verificationRoutes';
import { VerificationLoading } from './verificationShared';
import { useVerificationStatus } from './useVerificationStatus';
import {
  AccentButton,
  buildInfoRows,
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

const VerificationVerified = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { loading, realnameInfo, kycStatus } = useVerificationStatus(true);

  useEffect(() => {
    if (loading) return;
    if (kycStatus === 0) {
      navigate(VERIFICATION_ROUTES.apply, { replace: true });
    } else if (kycStatus === 1) {
      navigate(VERIFICATION_ROUTES.pending, { replace: true });
    } else if (kycStatus === 3 || kycStatus === 4) {
      navigate(VERIFICATION_ROUTES.rejected, { replace: true });
    }
  }, [loading, kycStatus, navigate]);

  if (loading || kycStatus !== 2) {
    return <VerificationLoading />;
  }

  const infoRows = buildInfoRows(intl, realnameInfo);

  const steps = [
    {
      key: 'submit',
      label: intl.formatMessage({ id: 'verification.pending.step.submit', defaultMessage: '已提交' }),
      done: true,
      icon: <CheckCircleFilled />,
    },
    {
      key: 'review',
      label: intl.formatMessage({ id: 'verification.verified.step.review', defaultMessage: '审核通过' }),
      done: true,
      icon: <CheckCircleFilled />,
    },
    {
      key: 'done',
      label: intl.formatMessage({ id: 'verification.pending.step.done', defaultMessage: '完成认证' }),
      done: true,
      active: true,
      icon: <SafetyCertificateOutlined />,
    },
  ];

  return (
    <VerificationImmersiveShell variant="verified">
      <VerificationImmersiveContent>
        <HeroBlock>
          <VerificationHeroIcon
            variant="verified"
            icon={<CheckCircleFilled />}
            animateRing={false}
          />
          <StatusBadge $variant="verified">
            <CheckCircleFilled />
            {intl.formatMessage({ id: 'verification.status.approved', defaultMessage: '已通过' })}
          </StatusBadge>
          <GradientTitle $variant="verified">
            {intl.formatMessage({ id: 'verification.verified.title', defaultMessage: '您已完成实名认证' })}
          </GradientTitle>
          <Subtitle>
            {realnameInfo?.statusDescription ||
              intl.formatMessage({ id: 'verification.verified.desc', defaultMessage: '您的实名认证已通过审核' })}
          </Subtitle>
        </HeroBlock>

        <VerificationProgress variant="verified" steps={steps} />

        <VerificationInfoPanel
          variant="verified"
          title={intl.formatMessage({ id: 'verification.verified.infoTitle', defaultMessage: '认证信息' })}
          rows={infoRows}
        />

        <VerificationImmersiveActions variant="verified">
          <AccentButton $variant="verified" size="large" onClick={() => navigate('/profile')}>
            {intl.formatMessage({ id: 'verification.back.profile', defaultMessage: '返回个人中心' })}
          </AccentButton>
        </VerificationImmersiveActions>
      </VerificationImmersiveContent>
    </VerificationImmersiveShell>
  );
};

export default VerificationVerified;
