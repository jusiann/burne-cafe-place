import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { STORAGE_KEYS, getItem, setItem } from '../constants/storage.utils.js';
import trLocale from './tr.json';
import enLocale from './en.json';

const locales = { tr: trLocale, en: enLocale };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        return getItem(STORAGE_KEYS.LANGUAGE) || 'tr';
    });

    const setLanguage = useCallback((lang) => {
        setLanguageState(lang);
        setItem(STORAGE_KEYS.LANGUAGE, lang);
    }, []);

    const t = useCallback((path) => {
        const keys = path.split('.');
        let result = locales[language];

        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                console.warn(`[i18n] Missing key: ${path} for language: ${language}`);
                return path;
            }
        }

        return result;
    }, [language]);

    const toggleLanguage = useCallback(() => {
        const newLang = language === 'tr' ? 'en' : 'tr';
        setLanguage(newLang);
    }, [language, setLanguage]);

    const value = useMemo(() => ({
        language,
        setLanguage,
        t,
        translate: t,
        toggleLanguage,
        isTurkish: language === 'tr',
        isEnglish: language === 'en',
    }), [language, setLanguage, t, toggleLanguage]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default useLanguage;

export const useLanguageContext = useLanguage;
