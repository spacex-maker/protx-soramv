import React, { useState } from 'react';
import { Drawer, List, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

const LanguageButton = styled(Button)`
  padding: 0.5rem;
  color: var(--ant-color-text);
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover, &:focus {
    color: var(--ant-color-text-secondary);
    background: var(--ant-color-bg-container);
  }

  .anticon {
    font-size: 1.25rem;
  }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 0;
  }
`;

const LanguageItem = styled(List.Item)`
  padding: 16px !important;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: var(--ant-color-bg-container);
  }

  &.selected {
    color: var(--ant-color-primary);
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(59, 130, 246, 0.1)' 
      : 'rgba(59, 130, 246, 0.05)'};
  }
`;

const MobileLanguageSelector = ({ locale, languages, onLanguageChange }) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleLanguageSelect = (languageCode) => {
    onLanguageChange(languageCode);
    onClose();
  };

  return (
    <>
      <LanguageButton onClick={showDrawer}>
        <GlobalOutlined />
      </LanguageButton>
      
      <StyledDrawer
        title={<FormattedMessage id="language.selector.title" defaultMessage="选择语言" />}
        placement="bottom"
        onClose={onClose}
        open={open}
        height={400}
        styles={{ body: { padding: 0 } }}
      >
        <List
          dataSource={languages}
          renderItem={item => (
            <LanguageItem
              onClick={() => handleLanguageSelect(item.languageCode)}
              className={locale === item.languageCode ? 'selected' : ''}
            >
              {item.languageNameNative}
            </LanguageItem>
          )}
        />
      </StyledDrawer>
    </>
  );
};

export default MobileLanguageSelector; 