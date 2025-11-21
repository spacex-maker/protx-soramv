import React from 'react';
import { Layout } from 'antd';
import { FormattedMessage } from 'react-intl';

const { Content } = Layout;

const Folders = () => {
  return (
    <Content>
      <div style={{ padding: 24 }}>
        <h2><FormattedMessage id="sidebar.folders" /></h2>
        <p>文件夹功能开发中...</p>
      </div>
    </Content>
  );
};

export default Folders; 