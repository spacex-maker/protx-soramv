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

/**
 * 检测浏览器/系统语言
 * @returns {string} 语言代码 (如 'zh', 'en', 'ja' 等)
 */
function detectBrowserLanguage() {
  // 方法1: 使用 navigator.language (浏览器首选语言)
  const browserLang = navigator.language || navigator.userLanguage;
  
  // 方法2: 使用 navigator.languages (所有支持的语言列表，按优先级排序)
  const languages = navigator.languages || [browserLang];
  
  // 方法3: 使用 Intl API 获取系统区域设置
  let systemLocale = 'zh-CN';
  try {
    systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  } catch (e) {
    // 降级处理
  }
  
  // 合并所有可能的语言源
  const allLangs = [browserLang, systemLocale, ...languages];
  
  // 遍历查找第一个匹配的语言
  for (const lang of allLangs) {
    if (!lang) continue;
    
    // 提取语言代码 (例如: "zh-CN" -> "zh", "en-US" -> "en")
    const langCode = lang.split('-')[0].toLowerCase();
    
    // 检查是否支持该语言
    if (LOCALES[langCode]) {
      return langCode;
    }
    
    // 也检查完整格式 (例如: "zh-CN" -> "zh-CN")
    const fullLang = lang.split('-').map((part, i) => 
      i === 0 ? part.toLowerCase() : part.toUpperCase()
    ).join('-');
    
    // 检查完整格式是否在 messages 中
    if (messages[fullLang]) {
      // 找到对应的短代码
      for (const [code, full] of Object.entries(LOCALES)) {
        if (full === fullLang) {
          return code;
        }
      }
    }
  }
  
  return null; // 未找到匹配的语言
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    // 1. 优先从 URL 参数读取语言
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && LOCALES[urlLang]) {
      localStorage.setItem('locale', urlLang); // 保存到 localStorage
      return LOCALES[urlLang];
    }
    
    // 2. 如果用户已登录，尝试从用户设置读取
    const token = localStorage.getItem('token');
    if (token) {
      const userSettings = localStorage.getItem('userSettings');
      if (userSettings) {
        try {
          const settings = JSON.parse(userSettings);
          const userLang = settings.interface?.language;
          if (userLang) {
            // 转换格式: zh-CN -> zh 或直接使用
            const langCode = userLang.split('-')[0].toLowerCase();
            if (LOCALES[langCode]) {
              return LOCALES[langCode];
            }
            // 也尝试直接匹配完整格式
            if (messages[userLang]) {
              return userLang;
            }
          }
        } catch (e) {
          console.error('Failed to parse user settings for locale', e);
        }
      }
    }
    
    // 3. 其次从 localStorage 读取旧的 locale 设置
    const saved = localStorage.getItem('locale');
    if (saved && LOCALES[saved]) {
      return LOCALES[saved];
    }
    
    // 4. 自动检测浏览器/系统语言
    const detectedLang = detectBrowserLanguage();
    if (detectedLang) {
      return LOCALES[detectedLang];
    }
    
    // 5. 默认中文
    return 'zh-CN';
  });

  const changeLocale = (newLocale) => {
    // 支持短代码（zh, en）或完整代码（zh-CN, en-US）
    let standardLocale = LOCALES[newLocale];
    if (!standardLocale && messages[newLocale]) standardLocale = newLocale;
    if (!standardLocale) standardLocale = LOCALES['zh'] || 'zh-CN';
    setLocale(standardLocale);
    localStorage.setItem('locale', standardLocale.split('-')[0]);
    
    // 如果用户已登录，同步更新 userSettings
    const token = localStorage.getItem('token');
    if (token) {
      const userSettings = localStorage.getItem('userSettings');
      if (userSettings) {
        try {
          const settings = JSON.parse(userSettings);
          settings.interface = settings.interface || {};
          settings.interface.language = standardLocale;
          localStorage.setItem('userSettings', JSON.stringify(settings));
        } catch (e) {
          console.error('Failed to update user settings locale', e);
        }
      }
    }
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