import React from 'react';
import { Card, Empty } from 'antd';
import { FormattedMessage } from 'react-intl';

const WorkflowMobile: React.FC = () => {
  return (
    <Card>
      <Empty
        description={
          <FormattedMessage
            id="workflow.mobile.notSupported"
            defaultMessage="移动端暂不支持工作流编辑，请在桌面端使用"
          />
        }
      />
    </Card>
  );
};

export default WorkflowMobile;

