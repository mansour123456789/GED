import React, { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'fr' | 'ar';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  isRtl: boolean;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gedrn13_lang');
      if (stored === 'ar' || stored === 'fr') return stored;
    }
    return 'fr';
  });

  const isRtl = lang === 'ar';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    localStorage.setItem('gedrn13_lang', lang);
  }, [lang, isRtl]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'fr' ? 'ar' : 'fr'));
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, isRtl }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
};
