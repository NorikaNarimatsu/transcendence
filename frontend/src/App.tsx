import type { JSX } from 'react';
import { useState } from 'react';
import ButtonDarkPink from './components/ButtonDarkPink';
import TypewriterText from './components/TypewriterAnimation';
import { useLanguage } from './contexts/LanguageContext';

export default function App(): JSX.Element{
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const { lang, t, setLang } = useLanguage();
  const translation = t[lang];
    
  const handleLanguageChange = (newLang: "en" | "pt" | "pl" | "jp") => {
    setLang(newLang);
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-40 bg-blue-deep"></header>

      {/* Center content with grid background */}
      <section className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl text-blue-deep font-pixelify">
            <TypewriterText
              key={`welcome-${lang}`}
              text={translation.pages.landing.welcome} 
              speed={120}
              onComplete={() => setShowSubtitle(true)}
            />
          </h1>
          <p className="text-3xl text-blue-deep font-dotgothic">
            {showSubtitle && (
              <TypewriterText 
                key={`subtitle-${lang}`}
                text={translation.pages.landing.subtitle}
                speed={80}
                delay={500}
                cursorHideDelay={2000}
                onComplete={() => setShowButton(true)}
              />
            )}
          </p>
          <div className={`transition-all duration-1000 ease-in-out ${
            showButton
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}>
            <ButtonDarkPink to="/signup">{translation.pages.landing.play}</ButtonDarkPink>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <footer className="h-40 bg-blue-deep flex justify-center items-center">
          <select
            value={lang}
            onChange={(e) => handleLanguageChange(e.target.value as "en" | "pt")}
            className="appearance-none bg-pink-light text-blue-deep font-dotgothic px-4 py-2 pr-8 rounded border-2 border-blue-deep focus:outline-none focus:ring-2 focus:ring-pink-dark cursor-pointer"
            >
            <option value="en">🇬🇧 English</option>
            <option value="pt">🇵🇹 Portuguese</option>
            <option value="pl">🇵🇱 Polish</option>
            <option value="jp">🇯🇵 Japanese</option>
          </select>
      </footer>
    </main>
  )
}
