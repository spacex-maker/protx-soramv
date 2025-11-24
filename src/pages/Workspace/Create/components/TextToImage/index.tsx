import React, { useState, useEffect } from 'react';
import { Grid } from 'antd';
import TextToImageDesktop from './TextToImage';
import TextToImageMobile from './mobile/TextToImageMobile';

const { useBreakpoint } = Grid;

const TextToImage: React.FC = () => {
  const screens = useBreakpoint();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 使用 breakpoint 和窗口宽度双重判断
  // 移动端断点：小于 768px
  const shouldUseMobile = !screens.md || isMobile;

  return shouldUseMobile ? (
    <TextToImageMobile />
  ) : (
    <TextToImageDesktop />
  );
};

export default TextToImage;
export type { ModelFamily, Model } from './types';

