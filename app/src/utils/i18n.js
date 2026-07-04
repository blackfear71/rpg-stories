import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

/**
 * Charge les fichiers de traduction, détecte la langue du navigateur et connecte à React
 */
i18n.use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'fr', // langue par défaut
        supportedLngs: ['fr', 'en'], // langues supportées
        debug: false,
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage']
        },
        backend: {
            loadPath: `/locales/{{lng}}/{{ns}}.json?v=${__APP_VERSION__}`
        }
    });

// Met à jour la balise <html lang="">
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

export default i18n;
