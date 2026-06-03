import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import ukTranslation from './locales/uk.json';

i18n
  // Підключаємо детектор мови
  .use(LanguageDetector)
  // Передаємо інстанс в react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      uk: { translation: ukTranslation }
    },
    // Вказуємо українську як стартову, якщо в кеші ще нічого немає
    lng: localStorage.getItem('i18nextLng') || 'uk', 
    // Якщо перекладу немає, показуємо українську
    fallbackLng: 'uk', 
    interpolation: {
      escapeValue: false, // React вже має вбудований захист від XSS
    }
  });

export default i18n;