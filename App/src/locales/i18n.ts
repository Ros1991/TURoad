import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import pt from './pt.json';
import en from './en.json';
import es from './es.json';

const LANGUAGE_STORAGE_KEY = '@TURoad:language';

// Initialize with stored language or default
const initI18n = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    const initialLanguage = storedLanguage || 'pt';
    
    await i18n.use(initReactI18next).init({
      resources: {
        pt: { translation: pt },
        en: { translation: en },
        es: { translation: es },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  } catch (error) {
    console.warn('Error loading language from storage:', error);
    // Fallback to default initialization
    await i18n.use(initReactI18next).init({
      resources: {
        pt: { translation: pt },
        en: { translation: en },
        es: { translation: es },
      },
      lng: 'pt',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  }
};

// Function to change language and persist it
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.warn('Error saving language to storage:', error);
    // Still change language even if storage fails
    await i18n.changeLanguage(language);
  }
};

// Initialize i18n
initI18n();

export default i18n;

