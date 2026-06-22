export const VERIFICATION_ROUTES = {
  root: '/verification',
  apply: '/verification/apply',
  pending: '/verification/pending',
  verified: '/verification/verified',
  rejected: '/verification/rejected',
  history: '/verification/history',
};

/** 根据 kycStatus 返回对应路由 */
export const getVerificationRouteByStatus = (kycStatus) => {
  switch (kycStatus) {
    case 1:
      return VERIFICATION_ROUTES.pending;
    case 2:
      return VERIFICATION_ROUTES.verified;
    case 3:
      return VERIFICATION_ROUTES.rejected;
    case 4:
      return VERIFICATION_ROUTES.rejected;
    default:
      return VERIFICATION_ROUTES.apply;
  }
};
