import React from 'react';
import type { JSX } from 'react';
import { useState } from 'react';
import ButtonDarkPink from './components/ButtonDarkPink'
import TypewriterText from './components/TypewriterAnimation';

export default function App(): JSX.Element{
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-40 bg-blue-deep"></header>

      {/* Center content with grid background */}
      <section className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl text-blue-deep font-pixelify">
            <TypewriterText 
              text="Welcome to..." 
              speed={120}
              onComplete={() => setShowSubtitle(true)}
            />
          </h1>
          <p className="text-3xl text-blue-deep font-dotgothic">
            {showSubtitle && (
              <TypewriterText 
                text="the best pong game you ever saw!" 
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
            <ButtonDarkPink to="/signup">Let's play</ButtonDarkPink>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <footer className="h-40 bg-blue-deep"></footer>
    </main>
  )
}





////////////////// Backend test //////////////////

// import { BackendTest } from './components/Test';

// function App() {
//   return (
//     <div>
//       <h1>Transcendence</h1>
//       <BackendTest />
//     </div>
//   );
// }


////////////////// Connection test //////////////////

// import { ItemsList } from './components/Test';

// export default function App() {
//   return (
//     <div>
//       <h1>Transcendence</h1>
//       <ItemsList />
//     </div>
//   );
// }

////////////////// Name test //////////////////
// import { NameTest } from './components/Test';

// export default function App() {
//   return (
//     <main className="min-h-screen flex flex-col">
//       <div className="flex-1 bg-pink-grid flex items-center justify-center">
//         <NameTest />
//       </div>
//     </main>
//   );
// }