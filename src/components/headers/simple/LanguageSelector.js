import React, { useState } from 'react';
import { Dropdown, Grid } from 'antd';
import { GlobalOutlined, DownOutlined } from '@ant-design/icons';
import { LanguageButton, LanguageDropdownPanel, LanguageDropdownItem } from './styles';
import MobileLanguageSelector from './MobileLanguageSelector';

const LanguageSelector = ({ locale, languages, onLanguageChange }) => {
  const screens = Grid.useBreakpoint();
  const [open, setOpen] = useState(false);

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

  const currentLanguage = languages.find(l => l.languageCode === locale);

  const handleSelect = (languageCode) => {
    onLanguageChange(languageCode);
    setOpen(false);
  };

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      dropdownRender={() => (
        <LanguageDropdownPanel>
          {languages.map((language) => (
            <LanguageDropdownItem
              key={language.languageCode}
              type="button"
              className={locale === language.languageCode ? 'selected' : ''}
              onClick={() => handleSelect(language.languageCode)}
            >
              {language.languageNameNative}
            </LanguageDropdownItem>
          ))}
        </LanguageDropdownPanel>
      )}
    >
      <LanguageButton type="button">
        <GlobalOutlined />
        <span style={{ fontSize: '0.8125rem', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentLanguage?.languageNameNative || locale}
        </span>
        <DownOutlined style={{ fontSize: '0.625rem', opacity: 0.6 }} />
      </LanguageButton>
    </Dropdown>
  );
};

export default LanguageSelector; 