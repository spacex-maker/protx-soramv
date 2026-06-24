import React, { useState, useEffect } from 'react';
import { Grid } from 'antd';
import TextToImageDesktop from './TextToImage';
import TextToImageMobile from './mobile/TextToImageMobile';

const { useBreakpoint } = Grid;

const TextToImage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const screens = useBreakpoint();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shouldUseMobile = !screens.md || isMobile;

  return shouldUseMobile ? (
    React.createElement(TextToImageMobile, { embedded })
  ) : (
    React.createElement(TextToImageDesktop, { embedded })
  );
};

export default TextToImage;
export type { ModelFamily, Model } from './types';
