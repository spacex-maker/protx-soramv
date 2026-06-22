import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVerificationRouteByStatus } from './verificationRoutes';
import { VerificationLoading } from './verificationShared';
import { useVerificationStatus } from './useVerificationStatus';

const VerificationRedirect = () => {
  const navigate = useNavigate();
  const { loading, kycStatus } = useVerificationStatus(true);

  useEffect(() => {
    if (loading) return;
    navigate(getVerificationRouteByStatus(kycStatus), { replace: true });
  }, [loading, kycStatus, navigate]);

  return <VerificationLoading />;
};

export default VerificationRedirect;
