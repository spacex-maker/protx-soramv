import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { VerificationPageRoot } from './verificationShared';
import VerificationRedirect from './VerificationRedirect';
import VerificationApply from './VerificationApply';
import VerificationPending from './VerificationPending';
import VerificationVerified from './VerificationVerified';
import VerificationRejected from './VerificationRejected';
import VerificationHistory from './VerificationHistory';

const VerificationPage = () => (
  <VerificationPageRoot>
    <Routes>
      <Route index element={<VerificationRedirect />} />
      <Route path="apply" element={<VerificationApply />} />
      <Route path="pending" element={<VerificationPending />} />
      <Route path="verified" element={<VerificationVerified />} />
      <Route path="rejected" element={<VerificationRejected />} />
      <Route path="history" element={<VerificationHistory />} />
      <Route path="*" element={<Navigate to="/verification" replace />} />
    </Routes>
  </VerificationPageRoot>
);

export default VerificationPage;
