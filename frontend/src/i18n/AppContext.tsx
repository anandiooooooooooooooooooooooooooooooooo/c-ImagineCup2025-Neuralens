import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { translations } from './translations';
import type { Language, TranslationKey } from './translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>('dark');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('neuralens_system_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.language) setLanguageState(parsed.language as Language);
      if (parsed.theme) {
        setThemeState(parsed.theme);
        applyTheme(parsed.theme);
      }
    } else {
      // Apply default theme
      applyTheme('dark');
    }
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', newTheme);
    }
  };

  // Watch for system theme changes when auto mode
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Update localStorage
    const savedSettings = localStorage.getItem('neuralens_system_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.language = lang;
    localStorage.setItem('neuralens_system_settings', JSON.stringify(settings));
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    // Update localStorage
    const savedSettings = localStorage.getItem('neuralens_system_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.theme = newTheme;
    localStorage.setItem('neuralens_system_settings', JSON.stringify(settings));
  };

  const t = (key: TranslationKey): string => {
    const langTranslations = translations[language];
    return langTranslations?.[key] || translations.en[key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
