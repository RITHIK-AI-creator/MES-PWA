import React, { createContext, useState, ReactNode, useEffect } from 'react';
import en from '../locales/en.json';
import ja from '../locales/ja.json';

type Language = 'en' | 'ja';

type Dictionary = {
  [key: string]: any;
};

const dictionaries: Record<Language, Dictionary> = {
  en,
  ja,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'en' || saved === 'ja') return saved;
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    if (!key) return key;

    // First check for exact backend match
    if (dictionaries[language]?.backend && dictionaries[language].backend[key]) {
      return dictionaries[language].backend[key];
    }

    const keys = key.split('.');
    let value: any = dictionaries[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = key; // fallback
        break;
      }
    }

    let result = typeof value === 'string' ? value : key;

    if (params) {
      Object.keys(params).forEach(p => {
        result = result.replace(new RegExp(`{{${p}}}`, 'g'), params[p]);
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
