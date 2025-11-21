import React from 'react';
import { Grid } from 'antd';
import FeedbackModal from './FeedbackModal';
import MobileFeedbackModal from './MobileFeedbackModal';

const { useBreakpoint } = Grid;

const FeedbackModalEntry = ({ open, onClose }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  return isMobile ? (
    <MobileFeedbackModal open={open} onClose={onClose} />
  ) : (
    <FeedbackModal open={open} onClose={onClose} />
  );
};

export default FeedbackModalEntry; 