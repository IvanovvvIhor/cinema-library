import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import ukTranslation from './locales/uk.json';

i18n
  // Підключаємо детектор мови (він сам буде писати в localStorage)
  .use(LanguageDetector)
  // Передаємо інстанс в react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      uk: { translation: ukTranslation }
    },
    fallbackLng: 'en', // Якщо перекладу немає, показуємо англійську
    interpolation: {
      escapeValue: false, // React вже має вбудований захист від XSS
    }
  });

export default i18n;