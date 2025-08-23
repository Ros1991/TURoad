import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage as changeI18nLanguage } from '../locales/i18n';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  availableLanguages: { code: string; name: string }[];
  onLanguageChange: (callback: (language: string) => void) => () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'pt');
  const [languageCallbacks, setLanguageCallbacks] = useState<((language: string) => void)[]>([]);

  console.log('🌍 LanguageProvider: Re-rendering with language:', currentLanguage);

  useEffect(() => {
    // Listen for language changes from i18n
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      // Notify all registered callbacks
      languageCallbacks.forEach(callback => callback(lng));
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup listener on unmount
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]); // Remove languageCallbacks dependency to prevent re-registering

  const changeLanguage = useCallback(async (language: string) => {
    try {
      console.log('🌍 LanguageProvider: Changing language to:', language);
      await changeI18nLanguage(language);
      setCurrentLanguage(language);
      // Callbacks are triggered by i18n languageChanged event
    } catch (error) {
      console.warn('Error changing language:', error);
    }
  }, []);

  const onLanguageChange = useCallback((callback: (language: string) => void) => {
    setLanguageCallbacks(prev => [...prev, callback]);
    
    // Return cleanup function
    return () => {
      setLanguageCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  const contextValue: LanguageContextType = useMemo(() => ({
    currentLanguage,
    changeLanguage,
    availableLanguages,
    onLanguageChange,
  }), [currentLanguage, changeLanguage, onLanguageChange]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
