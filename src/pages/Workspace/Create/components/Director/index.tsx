import React from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ProjectList from './ProjectList';
import ProjectWorkspace from './ProjectWorkspace';

const DirectorRoot = styled.div`
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
`;

/**
 * 创作 Tab 内嵌子页面，不用嵌套 Routes（在 Tabs 内常匹配不到，会空白）
 */
const Director: React.FC = () => {
  const location = useLocation();
  const projectMatch = location.pathname.match(/\/workspace\/create\/director\/project\/(\d+)/);
  const projectId = projectMatch?.[1];

  return (
    <DirectorRoot>
      {projectId ? <ProjectWorkspace projectId={projectId} /> : <ProjectList />}
    </DirectorRoot>
  );
};

export default Director;
