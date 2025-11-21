import React from 'react';
import { Layout } from 'antd';
import { FormattedMessage } from 'react-intl';

const { Content } = Layout;

const Starred = () => {
  return (
    <Content>
      <div style={{ padding: 24 }}>
        <h2><FormattedMessage id="sidebar.starred" /></h2>
        <p>收藏夹功能开发中...</p>
      </div>
    </Content>
  );
};

export default Starred; 