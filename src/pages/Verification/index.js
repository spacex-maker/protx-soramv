import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { VerificationPageRoot } from './verificationShared';
import VerificationRedirect from './VerificationRedirect';
import VerificationApply from './VerificationApply';
import VerificationPending from './VerificationPending';
import VerificationVerified from './VerificationVerified';
import VerificationRejected from './VerificationRejected';
import VerificationHistory from './VerificationHistory';
import VerificationUnbindApply from './VerificationUnbindApply';
import VerificationUnbindPending from './VerificationUnbindPending';
import VerificationUnbindRejected from './VerificationUnbindRejected';

const VerificationPage = () => (
  <VerificationPageRoot>
    <Routes>
      <Route index element={<VerificationRedirect />} />
      <Route path="apply" element={<VerificationApply />} />
      <Route path="pending" element={<VerificationPending />} />
      <Route path="verified" element={<VerificationVerified />} />
      <Route path="rejected" element={<VerificationRejected />} />
      <Route path="history" element={<VerificationHistory />} />
      <Route path="unbind/apply" element={<VerificationUnbindApply />} />
      <Route path="unbind/pending" element={<VerificationUnbindPending />} />
      <Route path="unbind/rejected" element={<VerificationUnbindRejected />} />
      <Route path="*" element={<Navigate to="/verification" replace />} />
    </Routes>
  </VerificationPageRoot>
);

export default VerificationPage;
