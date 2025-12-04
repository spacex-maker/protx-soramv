import React, { useState, useEffect } from 'react';
import { Grid, Tabs } from 'antd';
import { FormattedMessage } from 'react-intl';
import { ApartmentOutlined, UnorderedListOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import WorkflowDesktop from './Workflow';
import WorkflowMobile from './mobile/WorkflowMobile';
import WorkflowList from './WorkflowList';

const { useBreakpoint } = Grid;

const StyledTabs = styled(Tabs)`
  .ant-tabs-content-holder {
    overflow: auto;
  }
`;

const Workflow: React.FC = () => {
  const screens = useBreakpoint();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shouldUseMobile = !screens.md || isMobile;

  // 处理从列表选择工作流
  const handleSelectWorkflow = (id: number) => {
    setSelectedWorkflowId(id);
    setActiveTab('editor');
  };

  // 处理创建新工作流
  const handleCreateNew = () => {
    setSelectedWorkflowId(null);
    setActiveTab('editor');
  };

  // 移动端直接显示编辑器
  if (shouldUseMobile) {
    return <WorkflowMobile />;
  }

  // 桌面端显示标签页
  return (
    <StyledTabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        {
          key: 'list',
          label: (
            <span>
              <UnorderedListOutlined />
              <FormattedMessage id="workflow.myWorkflows" defaultMessage="我的工作流" />
            </span>
          ),
          children: (
            <WorkflowList
              onSelectWorkflow={handleSelectWorkflow}
              onCreateNew={handleCreateNew}
            />
          ),
        },
        {
          key: 'editor',
          label: (
            <span>
              <ApartmentOutlined />
              <FormattedMessage id="workflow.editor" defaultMessage="编辑器" />
            </span>
          ),
          children: (
            <WorkflowDesktop 
              workflowId={selectedWorkflowId}
              onWorkflowCreated={(id) => {
                setSelectedWorkflowId(id);
                // 可以选择是否自动切换到列表
                // setActiveTab('list');
              }}
            />
          ),
        },
      ]}
    />
  );
};

export default Workflow;

