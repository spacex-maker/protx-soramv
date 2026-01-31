/**
 * 工作台 - 充值
 * 嵌入充值页面，无独立头部
 */
import React from 'react';
import { theme } from 'antd';
import RechargePage from '../../Recharge';

const Recharge = () => {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        padding: 24,
        overflow: 'auto',
        height: '100%',
        boxSizing: 'border-box',
        background: token.colorBgContainer,
      }}
    >
      <RechargePage embedded />
    </div>
  );
};

export default Recharge;
