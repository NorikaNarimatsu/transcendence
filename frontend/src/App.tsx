import { Link, useNavigate } from 'react-router-dom'
import Button_DarkPink from './components/Button_DarkPink'

export default function App() {
  
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-40 bg-brand-deep_blue"></div>

      {/* Center content with grid background */}
      <div className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl text-brand-deep_blue font-pixelify">Welcome to..</h1>
          <p className="text-3xl text-brand-deep_blue font-dotgothic">
            the best pong game you ever saw!
          </p>
        <Button_DarkPink onClick={() => navigate('/login')}>Let's play</Button_DarkPink>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-40 bg-brand-deep_blue"></div>
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