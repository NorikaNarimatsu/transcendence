import { ReactNode, useContext, useState } from 'react'
import { createContext } from 'react'
import en from '../locales/en.json'
import pt from '../locales/pt.json'
import pl from '../locales/pl.json'
import jp from '../locales/jp.json'


type Language = 'en' | 'pt' | 'pl' | 'jp';

interface TranslationContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: {
        en: typeof en;
        pt: typeof pt;
        pl: typeof pl;
        jp: typeof jp;
    }
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export default function TranslationProvider({ children }: {children: ReactNode}) {
    
    const t = { en, pt, pl, jp };
    const [lang, setLang] = useState<Language>('en');

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