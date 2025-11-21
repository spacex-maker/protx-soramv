import React from 'react';
import { Grid } from 'antd';

import MobileFileEncryptModal from './MobileFileEncryptModal';
import DesktopFileEncryptModal from './DesktopFileEncryptModal';
const { useBreakpoint } = Grid;

const FileEncryptModal = (props) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  if (isMobile) {
    return <MobileFileEncryptModal {...props} />;
  }

  return <DesktopFileEncryptModal {...props} />;
};

export default FileEncryptModal; 