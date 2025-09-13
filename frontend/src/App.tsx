import ButtonDarkPink from './components/ButtonDarkPink'
import type { JSX } from 'react';

export default function App(): JSX.Element{

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-40 bg-blue-deep"></header>

      {/* Center content with grid background */}
      <section className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl text-blue-deep font-pixelify">Welcome to..</h1>
          <p className="text-3xl text-blue-deep font-dotgothic">
            the best pong game you ever saw!
          </p>
        <ButtonDarkPink to="/signup">Let's play</ButtonDarkPink>
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