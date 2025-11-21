import React from 'react';
import SimpleHeader from 'components/headers/simple';
import { PageContainer } from './styles';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import StatsSection from './components/StatsSection';
import PricingSection from './components/PricingSection';
import SecuritySection from './components/SecuritySection';
import CallToActionSection from './components/CallToActionSection';

const HomePage = () => {
  return (
    <PageContainer>
      <SimpleHeader />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <PricingSection />
      <SecuritySection />
      <CallToActionSection />
    </PageContainer>
  );
};

export default HomePage; 