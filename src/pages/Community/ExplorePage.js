import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CompassOutlined, HomeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import SimpleHeader from 'components/headers/simple';
import FooterSection from 'pages/Home/components/FooterSection';
import ExploreChannels from './ExploreChannels';
import { COMMUNITY_PLAZA_PATH } from 'utils/communityRoutes';

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${(p) => (p.theme.mode === 'dark' ? '#0a0a0b' : '#f5f7fa')};
  color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#1f1f1f')};
`;

const Main = styled.main`
  max-width: 1600px;
  margin: 0 auto;
  padding: 96px 40px 80px;

  @media (max-width: 768px) {
    padding: 80px 20px 48px;
  }
`;

const Hero = styled.div`
  margin-bottom: 48px;

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    margin-bottom: 16px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: ${(p) => (p.theme.mode === 'dark' ? '#a78bfa' : '#6200ea')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.15)' : 'rgba(98, 0, 234, 0.08)')};
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(131, 56, 236, 0.35)' : 'rgba(98, 0, 234, 0.12)')};
  }

  h1 {
    margin: 0 0 12px;
    font-size: clamp(32px, 4vw, 44px);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  p {
    margin: 0;
    max-width: 640px;
    font-size: 17px;
    line-height: 1.65;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.58)')};
  }
`;

const CommunityExplorePage = () => {
  const navigate = useNavigate();

  return (
  <PageLayout>
    <SimpleHeader />
    <Main>
      <Hero>
        <Button
          type="text"
          icon={<HomeOutlined />}
          onClick={() => navigate(COMMUNITY_PLAZA_PATH)}
          style={{ marginBottom: 16, marginLeft: -8, paddingLeft: 8 }}
        >
          <FormattedMessage id="community.plaza.title" defaultMessage="Community Plaza" />
        </Button>
        <div className="eyebrow">
          <CompassOutlined />
          <FormattedMessage id="community.explore.eyebrow" defaultMessage="Communities" />
        </div>
        <h1>
          <FormattedMessage id="community.explore.title" defaultMessage="Explore Communities" />
        </h1>
        <p>
          <FormattedMessage
            id="community.explore.subtitle"
            defaultMessage="Discover inspiration, remix workflows, and connect with thousands of AI creators."
          />
        </p>
      </Hero>
      <ExploreChannels />
    </Main>
    <FooterSection />
  </PageLayout>
  );
};

export default CommunityExplorePage;
