import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import CompanyHeroSection from './sections/CompanyHeroSection';
import CompanyAboutSection from './sections/CompanyAboutSection';
import CompanyProductsSection from './sections/CompanyProductsSection';
import CompanyHighlightsSection from './sections/CompanyHighlightsSection';
import CompanyFooterSection from './sections/CompanyFooterSection';
import FooterSection from '../components/FooterSection';

const PageWrap = styled.div`
  min-height: 100vh;
  background: #0a0e17;
  color: #e8eaed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const CompanyPageLayout = ({ data, theme }) => {
  const title = `${data.name}${data.nameCn ? ` · ${data.nameCn}` : ''} | Open Robot X`;

  return (
    <PageWrap>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={data.tagline + ' — ' + (data.aboutParagraphs?.[0] || '')} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
      </Helmet>
      <CompanyHeroSection data={data} theme={theme} />
      <CompanyAboutSection data={data} theme={theme} />
      <CompanyProductsSection data={data} theme={theme} />
      <CompanyHighlightsSection data={data} theme={theme} />
      <CompanyFooterSection data={data} />
      <FooterSection />
    </PageWrap>
  );
};

export default CompanyPageLayout;
