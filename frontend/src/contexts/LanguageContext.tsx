import { ReactNode, useContext, useState } from 'react'
import { createContext } from 'react'
import en from '../locales/en.json'
import pt from '../locales/pt.json'
import pl from '../locales/pl.json'

export type Language = 'en' | 'pt' | 'pl' ;

interface TranslationContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: {
        en: typeof en;
        pt: typeof pt;
        pl: typeof pl;
    }
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

function isValidLanguage(lang: string): lang is Language {
    return ['en', 'pt', 'pl'].includes(lang);
}

export default function TranslationProvider({ children }: {children: ReactNode}) {
    
    const t = { en, pt, pl };
     const [lang, setLang] = useState<Language>(() => {
         // if (){
            //     //Check database first for the user
            // }
        const currentLang = localStorage.getItem('lang');
        if (currentLang) {
            try {
                if (currentLang && isValidLanguage(currentLang)) {
                    return currentLang;
                }
            } catch (error) {
                console.error('Error parsing user from localStorage:', error);
            }
        }        
        return 'en';
    });
    return (
        <TranslationContext.Provider value={{ lang, t, setLang }}>
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