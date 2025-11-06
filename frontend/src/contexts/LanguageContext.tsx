import type { ReactNode } from 'react';
import { useContext, useState, useEffect } from 'react'
import { createContext } from 'react'
import en from '../locales/en.json'
import pt from '../locales/pt.json'
import pl from '../locales/pl.json'

export type Language = 'en' | 'pt' | 'pl';

interface TranslationContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: {
        en: typeof en;
        pt: typeof pt;
        pl: typeof pl;
    }
    clearLang: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function isValidLanguage(lang: string): lang is Language {
    return ['en', 'pt', 'pl'].includes(lang);
}

export default function TranslationProvider({ children }: {children: ReactNode}) {
    
    const t = { en, pt, pl };
    
    const [lang, setLang] = useState<Language>(() => {
        const currentLang = localStorage.getItem('lang');
        console.log("Initial language from localStorage:", currentLang);
        if (currentLang && isValidLanguage(currentLang)) {
            return currentLang;
        }
        return 'en';
    });

    const clearLang = () => {
        setLang('en');
        try { localStorage.removeItem('lang'); } catch {}
    };

    // Listen for localStorage changes and update language
    useEffect(() => {
        const handleStorageChange = () => {
            const newLang = localStorage.getItem('lang');
            console.log("Storage changed, new language:", newLang);
            if (newLang && isValidLanguage(newLang) && newLang !== lang) {
                setLang(newLang);
            }
        };

        // Listen for storage events (changes from other tabs/windows)
        window.addEventListener('storage', handleStorageChange);

        // Also check periodically for changes in same tab (fallback)
        const interval = setInterval(() => {
            const currentLang = localStorage.getItem('lang');
            if (currentLang && isValidLanguage(currentLang) && currentLang !== lang) {
                console.log("Detected language change via polling:", currentLang);
                setLang(currentLang);
            }
        }, 500); // Check every 500ms

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [lang]);

    // Save language to localStorage when it changes
    useEffect(() => {
        console.log("Saving language to localStorage:", lang);
        localStorage.setItem('lang', lang);
    }, [lang]);

    return (
        <TranslationContext.Provider value={{ lang, t, setLang, clearLang }}>
            {children}
        </TranslationContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a TranslationProvider');
    }
    return context;
}