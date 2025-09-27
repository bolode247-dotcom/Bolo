import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en, fr } from './locales';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

i18next.use(initReactI18next).init({
  debug: true,
  fallbackLng: 'en',

  interpolation: { escapeValue: false }, // react already safes from xss
  resources,
  lng: 'en', // default language
});

export default i18next;
