'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

export type Language = 'es' | 'en';

export interface TranslateFn {
  (es: string, en: string): string;
  (es: React.ReactNode, en: React.ReactNode): React.ReactNode;
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslateFn;
}

const STORAGE_KEY = 'lab_running_lang';

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
  t: ((es: React.ReactNode) => es) as TranslateFn,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<Language>('es');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'es' || saved === 'en') {
        setLangState(saved);
        document.documentElement.lang = saved;
      } else if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')) {
        setLangState('en');
        document.documentElement.lang = 'en';
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem(STORAGE_KEY, nextLang);
      document.documentElement.lang = nextLang;
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const t: TranslateFn = useCallback(
    ((es: React.ReactNode, en: React.ReactNode) =>
      lang === 'en' ? en : es) as TranslateFn,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t }),
    [lang, setLang, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
