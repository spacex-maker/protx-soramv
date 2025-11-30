import React, { createContext, useState, useContext } from 'react';
import { IntlProvider } from 'react-intl';
import zh_CN from '../locales/zh_CN';
import en_US from '../locales/en_US';
import ja_JP from '../locales/ja_JP';
import ko_KR from '../locales/ko_KR';
import fr_FR from '../locales/fr_FR';
import de_DE from '../locales/de_DE';
import es_ES from '../locales/es_ES';
import it_IT from '../locales/it_IT';
import pt_PT from '../locales/pt_PT';
import ru_RU from '../locales/ru_RU';
import ar_SA from '../locales/ar_SA';

const messages = {
  'zh-CN': zh_CN,
  'en-US': en_US,
  'ja-JP': ja_JP,
  'ko-KR': ko_KR,
  'fr-FR': fr_FR,
  'de-DE': de_DE,
  'es-ES': es_ES,
  'it-IT': it_IT,
  'pt-PT': pt_PT,
  'ru-RU': ru_RU,
  'ar-SA': ar_SA
};

const LOCALES = {
  'zh': 'zh-CN',
  'en': 'en-US',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'es': 'es-ES',
  'it': 'it-IT',
  'pt': 'pt-PT',
  'ru': 'ru-RU',
  'ar': 'ar-SA'
};

export const LocaleContext = createContext();

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    // 1. 优先从 URL 参数读取语言
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && LOCALES[urlLang]) {
      localStorage.setItem('locale', urlLang); // 保存到 localStorage
      return LOCALES[urlLang];
    }
    
    // 2. 其次从 localStorage 读取
    const saved = localStorage.getItem('locale');
    if (saved && LOCALES[saved]) {
      return LOCALES[saved];
    }
    
    // 3. 默认中文
    return 'zh-CN';
  });

  const changeLocale = (newLocale) => {
    const standardLocale = LOCALES[newLocale] || LOCALES['zh'];
    setLocale(standardLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LocaleContext.Provider value={{ 
      locale: locale.split('-')[0], 
      changeLocale 
    }}>
      <IntlProvider
        messages={messages[locale]}
        locale={locale}
        defaultLocale="zh-CN"
      >
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext); 