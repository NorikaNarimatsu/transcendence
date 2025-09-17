import { useNavigate } from 'react-router-dom';
import ButtonPurple from '../components/ButtonPurple';

export default function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="bg-pink-dark shadow-no-blur-70 flex flex-col m-8 p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl text-blue-deep font-pixelify text-shadow font-bold">
              Welcome to ft_transcendence
            </h1>
          </header>

          {/* Main content */}
          <section className="flex-1 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-deep p-4 rounded-lg shadow-no-blur-50">
                <h2 className="text-2xl text-white font-dotgothic mb-2">Play Game</h2>
                <p className="text-white font-dotgothic">Start a new Pong match</p>
              </div>
              <div className="bg-blue-deep p-4 rounded-lg shadow-no-blur-50">
                <h2 className="text-2xl text-white font-dotgothic mb-2">Profile</h2>
                <p className="text-white font-dotgothic">View your stats</p>
              </div>
            </div>
          </section>

          {/* Logout button */}
          <footer className="self-end">
            <button onClick={handleLogout}>
              <ButtonPurple>
                <span className="font-dotgothic">Logout</span>
              </ButtonPurple>
            </button>
          </footer>
        </div>
      </div>
    </main>
  );
}