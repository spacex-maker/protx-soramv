import React from 'react';
import { Grid } from 'antd';
import FeedbackModal from './FeedbackModal';
import MobileFeedbackModal from './MobileFeedbackModal';

const { useBreakpoint } = Grid;

const FeedbackModalEntry = ({ open, onClose, zIndex }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  return isMobile ? (
    <MobileFeedbackModal open={open} onClose={onClose} zIndex={zIndex} />
  ) : (
    <FeedbackModal open={open} onClose={onClose} zIndex={zIndex} />
  );
};

export default FeedbackModalEntry; 