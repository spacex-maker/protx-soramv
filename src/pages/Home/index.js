import React from 'react';
import SimpleHeader from 'components/headers/simple';
import { PageContainer } from './styles';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import MediaToolsSection from './components/MediaToolsSection';
import CommunitySection from './components/CommunitySection';
import PromptMarketSection from './components/PromptMarketSection';
import CallToActionSection from './components/CallToActionSection';
import FooterSection from './components/FooterSection';
import SEO, { SEOConfigs } from 'components/SEO';

const HomePage = () => {
  return (
    <PageContainer>
      <SEO {...SEOConfigs.home} />
      <SimpleHeader />
      <HeroSection />
      <FeaturesSection />
      <CommunitySection />
      <PromptMarketSection />
      <PricingSection />
      <MediaToolsSection />
      <CallToActionSection />
      <FooterSection />
    </PageContainer>
  );
};

export default HomePage;