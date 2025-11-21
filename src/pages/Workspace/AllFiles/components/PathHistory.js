import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const StyledBreadcrumb = styled(Breadcrumb)`
  margin: 4px 0;
  padding: 0;
  line-height: normal;
  
  .ant-breadcrumb-link {
    display: flex;
    align-items: center;
    font-size: 14px;
    
    &:hover {
      color: var(--ant-color-primary);
    }
  }

  .ant-breadcrumb-separator {
    margin: 0 4px;
  }
`;

const PathHistory = ({ pathHistory, onHomeClick, onPathClick }) => {
  return (
    <StyledBreadcrumb
      items={[
        {
          title: (
            <HomeOutlined
              style={{ cursor: 'pointer' }}
              onClick={onHomeClick}
            />
          ),
        },
        ...pathHistory.map((path, index) => ({
          title: (
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => onPathClick(index)}
            >
              {path.name}
            </span>
          ),
        })),
      ]}
    />
  );
};

export default PathHistory; 