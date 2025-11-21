import React from 'react';
import { Dropdown, Grid } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { LanguageButton } from './styles';
import MobileLanguageSelector from './MobileLanguageSelector';

const LanguageSelector = ({ locale, languages, onLanguageChange }) => {
  const screens = Grid.useBreakpoint();

  // 在移动端使用 MobileLanguageSelector
  if (!screens.md) {
    return (
      <MobileLanguageSelector
        locale={locale}
        languages={languages}
        onLanguageChange={onLanguageChange}
      />
    );
  }

  // 在桌面端使用 Dropdown
  const languageItems = languages.map(language => ({
    key: language.languageCode,
    label: language.languageNameNative
  }));

  return (
    <Dropdown
      menu={{
        items: languageItems,
        selectedKeys: [locale],
        onClick: ({ key }) => onLanguageChange(key),
      }}
      placement="bottomRight"
    >
      <LanguageButton>
        <GlobalOutlined />
      </LanguageButton>
    </Dropdown>
  );
};

export default LanguageSelector; 