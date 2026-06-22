import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Card, Alert, ConfigProvider, theme, Spin, Button } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import SimpleHeader from 'components/headers/simple';
import FooterSection from '../Home/components/FooterSection';

export const verificationTheme = {
  token: {
    colorPrimary: '#7c3aed',
    borderRadius: 10,
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    Button: { borderRadius: 10 },
    Input: { borderRadius: 10 },
    Select: { borderRadius: 10 },
  },
};

export const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${(props) => props.$token.colorBgLayout};
  background-image:
    radial-gradient(at 0% 0%, ${(props) => props.$token.colorPrimary}15 0px, transparent 50%),
    radial-gradient(at 100% 0%, #8b5cf615 0px, transparent 50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: 70px;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

export const ContentContainer = styled(motion.div)`
  max-width: 800px;
  width: 95%;
  margin: 24px auto 40px;
  position: relative;
  z-index: 10;
  flex: 1;
`;

export const MainCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
  border: 1px solid ${(props) => props.$token.colorBorderSecondary};
  background: ${(props) => props.$token.colorBgContainer};

  .ant-card-body {
    padding: 32px;

    @media (max-width: 768px) {
      padding: 20px;
    }
  }
`;

export const StepContainer = styled.div`
  margin: 20px 0 24px;

  .ant-steps-item-finish .ant-steps-item-icon {
    background-color: ${(props) => props.$token.colorSuccess};
    border-color: ${(props) => props.$token.colorSuccess};
  }

  .ant-steps-item-process .ant-steps-item-icon {
    background-color: ${(props) => props.$token.colorPrimary};
    border-color: ${(props) => props.$token.colorPrimary};
  }
`;

export const FormSection = styled.div`
  margin-top: 20px;

  .ant-form-item {
    margin-bottom: 20px;
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

export const FormLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.$token.colorText};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const UploadBox = styled.div`
  .ant-upload-drag {
    border-radius: 12px !important;
    background: ${(props) => props.$token.colorBgLayout} !important;
    border: 2px dashed ${(props) => props.$token.colorBorder} !important;
    transition: all 0.3s;
    padding: 16px !important;
    min-height: 160px !important;

    &:hover {
      border-color: ${(props) => props.$token.colorPrimary} !important;
      background: ${(props) => props.$token.colorPrimaryBg} !important;
    }
  }

  .ant-upload-list-item {
    border-radius: 8px !important;
  }
`;

export const InfoAlert = styled(Alert)`
  margin-bottom: 20px;
  border-radius: 10px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid ${(props) => props.$token.colorBorderSecondary};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const SuccessContainer = styled.div`
  text-align: center;
  padding: 60px 20px;

  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${(props) => props.$token.colorSuccessBg};
    color: ${(props) => props.$token.colorSuccess};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin: 0 auto 24px;
  }

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: ${(props) => props.$token.colorText};
    margin-bottom: 12px;
  }

  p {
    color: ${(props) => props.$token.colorTextSecondary};
    margin-bottom: 32px;
  }
`;

export const VerificationShell = ({ children }) => {
  const { token } = theme.useToken();
  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      <ContentContainer initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {children}
      </ContentContainer>
      <FooterSection />
    </PageLayout>
  );
};

export const VerificationPageRoot = ({ children }) => (
  <ConfigProvider theme={verificationTheme}>{children}</ConfigProvider>
);

export const VerificationLoading = () => {
  const { token } = theme.useToken();
  return (
    <VerificationPageRoot>
      <VerificationShell>
        <MainCard $token={token}>
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        </MainCard>
      </VerificationShell>
    </VerificationPageRoot>
  );
};

export const VerificationHistoryLink = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { token } = theme.useToken();

  return (
    <div style={{ textAlign: 'center', marginTop: 16 }}>
      <Button
        type="link"
        icon={<HistoryOutlined />}
        onClick={() => navigate('/verification/history')}
        style={{ color: token.colorTextSecondary, padding: 0 }}
      >
        {intl.formatMessage({ id: 'verification.history.viewRecords', defaultMessage: '查看认证记录' })}
      </Button>
    </div>
  );
};
