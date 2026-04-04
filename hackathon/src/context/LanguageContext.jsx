import React, { createContext, useContext } from 'react';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const t = (key) => key;
  
  return (
    <LanguageContext.Provider value={{ t, lang: 'en', theme: 'dark' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) return { t: (k) => k };
  return context;
};