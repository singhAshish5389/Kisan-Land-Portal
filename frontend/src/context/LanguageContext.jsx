import React, { createContext, useState, useContext, useCallback } from 'react';
import translations from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('meri_khautani_lang') || 'hi';
  });

  const toggleLanguage = useCallback(() => {
    setLang(prev => {
      const next = prev === 'hi' ? 'en' : 'hi';
      localStorage.setItem('meri_khautani_lang', next);
      return next;
    });
  }, []);

  const setLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('meri_khautani_lang', newLang);
  }, []);

  // Translation function
  const t = useCallback((key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
