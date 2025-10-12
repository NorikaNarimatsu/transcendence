import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react';
import { PongEngine } from '../../gameEngines/PongEngine';
import type { GameState, GameConfig } from '../../gameEngines/PongEngine';
import { calculateGameConfig } from '../../gameEngines/pongConfig';
import { useUser } from '../user/UserContext';
import { useSelectedPlayer } from '../user/PlayerContext';
import type { SelectedPlayer } from '../user/PlayerContext';

export default function PongGame(): JSX.Element {
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'single';
    const players = params.get('players');
    
    // ADD: Get all players from global context
    const { selectedPlayer, aiPlayer, guestPlayer } = useSelectedPlayer();

    const [gameConfig, setGameConfig] = useState<GameConfig>(calculateGameConfig());
    const [gameState, setGameState] = useState<GameState>({
        leftPaddleY: (gameConfig.gameHeight - gameConfig.paddleHeight) / 2,
        rightPaddleY: (gameConfig.gameHeight - gameConfig.paddleHeight) / 2,
        ballX: (gameConfig.gameWidth - gameConfig.ballSize) / 2,
        ballY: (gameConfig.gameHeight - gameConfig.ballSize) / 2,
        leftScore: 0,
        rightScore: 0,
        gameStarted: false,
        gameEnded: false,
        winner: ''
    });

    const engineRef = useRef<PongEngine | null>(null);

    const handleBackToProfile = () => {
        navigate('/playerProfile');
    };

    const getOpponent = (): SelectedPlayer | null => {
      if (mode === 'single') {
          return aiPlayer;
      } else if (mode === '2players') {
          // If a player is selected, use them; otherwise use Guest
          return selectedPlayer || guestPlayer;
      }
      return null;
  };
  
  const opponent = getOpponent();

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            const newConfig = calculateGameConfig();
            setGameConfig(newConfig);
            if (engineRef.current) {
                engineRef.current.stop();
                const leftPlayer = user?.name || 'Player 1';
                const rightPlayer = opponent?.name || 'Player 2';
                engineRef.current = new PongEngine(newConfig, setGameState, mode, leftPlayer, rightPlayer);
                engineRef.current.start();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mode, user?.name, opponent]);

    // Game engine and keyboard events
    useEffect(() => {
        const leftPlayer = user?.name || 'Player 1';
        const rightPlayer = opponent?.name || 'Player 2';

         // SHOULD BE DELETED THESE COMENTS LATER // THIS IS FOR DEGUB
        console.log('=== PONG GAME STARTED ===');
        console.log('Game Mode:', mode);
        console.log('Left Player (User):', {
            name: user?.name,
            userID: user?.userID,
            avatarUrl: user?.avatarUrl
        });
        console.log('Right Player (Opponent):', {
            name: opponent?.name,
            userID: opponent?.userID,
            avatarUrl: opponent?.avatarUrl,
            type: mode === 'single' ? 'AI' : (selectedPlayer ? 'Selected Player' : 'Guest')
        });
        console.log('Global Context Players:', {
            selectedPlayer: selectedPlayer,
            aiPlayer: aiPlayer,
            guestPlayer: guestPlayer
        });
        console.log('Final Player Names:', {
            leftPlayerName: leftPlayer,
            rightPlayerName: rightPlayer
        });
        console.log('========================');
        // SHOULD BE DELETED THESE COMENTS LATER

        engineRef.current = new PongEngine(gameConfig, setGameState, mode, leftPlayer, rightPlayer);

        const handleKeyDown = (e: KeyboardEvent) => {
            engineRef.current?.handleKeyDown(e.key);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            engineRef.current?.handleKeyUp(e.key);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        engineRef.current.start();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            engineRef.current?.stop();
        };
    }, [gameConfig, mode, user?.name, opponent]);

    return (
      <main className="min-h-screen flex flex-col">
          <header className="h-40 bg-blue-deep grid grid-cols-3 items-center">
              <div className="flex items-center justify-start gap-2">
                  <h1 className="player-name">{user?.name}</h1>
                  <img src={user?.avatarUrl} alt="Avatar" className="avatar" />
              </div>
              <div className="flex justify-center">
                  <p className="player-name">{gameState.leftScore} - {gameState.rightScore}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                  <img 
                      src={opponent?.avatarUrl || '/avatars/Avatar_2.png'} 
                      alt="Opponent Avatar" 
                      className="avatar" 
                  />
                  <h2 className="player-name">
                      {opponent?.name || 'Guest'}
                  </h2>
              </div>
          </header>
      <section className="flex-1 bg-pink-grid flex items-center justify-center">
        <div 
          className="relative bg-pink-dark shadow-no-blur-70"
          style={{ 
            width: `${gameConfig.gameWidth}px`, 
            height: `${gameConfig.gameHeight}px` 
          }}
        >
          {/* Center line */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 bg-white opacity-30 rounded-xl"
            style={{ 
              left: `${gameConfig.gameWidth / 2 - 2.5}px`,
              width: '5px',
              height: `${gameConfig.gameHeight * 0.9}px`
            }}
          />
          
          <div 
            className="paddle absolute"
            style={{ 
              top: `${gameState.leftPaddleY}px`,
              left: '12px',
              width: `${gameConfig.paddleWidth}px`,
              height: `${gameConfig.paddleHeight}px`
            }}
          />
          <div 
            className="paddle absolute"
            style={{ 
              top: `${gameState.rightPaddleY}px`,
              right: '12px',
              width: `${gameConfig.paddleWidth}px`,
              height: `${gameConfig.paddleHeight}px`
            }}
          />
          
          <div 
            className="ball absolute"
            style={{ 
              top: `${gameState.ballY}px`, 
              left: `${gameState.ballX}px`,
              width: `${gameConfig.ballSize}px`,
              height: `${gameConfig.ballSize}px`
            }}
          />

          {gameState.gameEnded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center">
                <p className="text-white text-4xl font-pixelify mb-6">
                  {gameState.winner} Wins!
                </p>
                <div className="flex flex-col gap-4">
                  <p className="text-white text-xl font-pixelify opacity-75">
                    Press SPACE to play again
                  </p>
                  <button
                    onClick={handleBackToProfile}
                    className="px-6 py-3 bg-pink-light text-blue-deep font-pixelify text-lg rounded-lg hover:bg-pink-medium transition-colors duration-200 mx-auto"
                  >
                    Back to Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {!gameState.gameStarted && !gameState.gameEnded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <p className="text-white text-2xl font-pixelify">
                Press SPACE to start
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="h-40 bg-blue-deep">
        <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl text-center m-[15px]">PONG GAME</h1>
      </footer>
    </main>
  );
}