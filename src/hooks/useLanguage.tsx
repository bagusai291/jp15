import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import idTranslations from '@/locales/id.json';
import enTranslations from '@/locales/en.json';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: idTranslations,
  en: enTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'id' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    // Handle string interpolation with parameters
    const interpolate = (text: string, params?: Record<string, any>): string => {
      if (!params) return text;
      
      return text.replace(/{([^}]*)}/g, (match, key) => {
        const value = params[key];
        return value !== undefined ? value : match;
      });
    };
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Indonesian if key not found
        value = translations.id;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    // If the value is a string, return it (possibly interpolated)
    if (typeof value === 'string') {
      // Check if this is a call with parameters
      const match = key.match(/^(.+),\s*(.+)$/);
      if (match) {
        try {
          const actualKey = match[1];
          const paramsStr = match[2];
          const params = JSON.parse(`{${paramsStr}}`);
          
          // Get the string again without the params part
          const baseValue = t(actualKey);
          return interpolate(baseValue, params);
        } catch (e) {
          console.error('Error parsing parameters for translation:', e);
          return value;
        }
      }
      
      return value;
    }
    
    return key;
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};