import React from 'react';
import SimpleHeader from 'components/headers/simple';
import { PageContainer } from './styles';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import TechnologySection from './components/TechnologySection';
import CallToActionSection from './components/CallToActionSection'; // 复用

const HomePage = () => {
  return (
    <PageContainer>
      <SimpleHeader />
      <HeroSection />
      <FeaturesSection />
      <TechnologySection />
      <PricingSection />
      <CallToActionSection />
    </PageContainer>
  );
};

export default HomePage;