import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react';
import { PongEngine } from '../../gameEngines/PongEngine';
import type { GameState, GameConfig } from '../../gameEngines/PongEngine';
import { calculateGameConfig } from '../../gameEngines/pongConfig';
import { useUser } from '../user/UserContext';
import { useSelectedPlayer } from '../user/PlayerContext';
import { useTournament } from '../tournament/tournamentContext';
import ButtonPink from '../../components/ButtonDarkPink';

//Icons import
import home_icon from '../../assets/icons/Home.png';
import gear_icon from '../../assets/icons/Settings.png';

//Game instructions+Settings+Stats components
import GameInstructions from '../../components/GameInstructionsPongGame';
import GameSettings from '../../components/SettingsGames';
import { useGameSettings } from '../../contexts/GameSettingsContext';

import type { SelectedPlayer } from '../user/PlayerContext';
import { useLanguage } from '../../contexts/LanguageContext';

import apiCentral from '../../utils/apiCentral';

export default function PongGame(): JSX.Element {
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'single';
    // const tournamentBracketID = params.get('tournamentBracketID') || null;
    // const tournamentMatchID  = params.get('tournamentMatchID') || null;    

    // ADD: Get all players from global context
    const { selectedPlayer, aiPlayer, guestPlayer } = useSelectedPlayer();

    const { currentMatch } = useTournament();

	const { gameSettings, getPongSettings } = useGameSettings();
	const currentDifficulty = gameSettings.pong.mode;
	const pongSettings = getPongSettings();

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

    const { lang, t } = useLanguage();
    const translation = t[lang];

    const [view, setView] = useState<"game"|"instructions"|"settings">('instructions')
    const [backgroundColor, setBackgroundColor] = useState<string>('bg-pink-dark');
    //To make sure the game settings and game Stats dont show when we start a match:
    useEffect(() => {
    if (!gameState.gameStarted && !gameState.gameEnded && 
        (gameState.leftScore > 0 || gameState.rightScore > 0)) {
        setView("instructions");
    }
  }, [gameState.gameStarted, gameState.gameEnded, gameState.leftScore, gameState.rightScore]);

    const getLeftPlayer = (): SelectedPlayer | null => {
        if (mode === 'tournament') {
            // For tournament, use selectedPlayer array with index 0 for left player
            return currentMatch?.player1 || null;
        } else {
            // For single and 2players mode, left player is always the current user
            return user;
        }
    };

    const getRightPlayer = (): SelectedPlayer | null => {
        if (mode === 'single') {
            return aiPlayer;
        } else if (mode === '2players') {
            return selectedPlayer || guestPlayer;
        } else if (mode === 'tournament') {
            // For tournament, use selectedPlayer array with index 1 for right player
            return currentMatch?.player2 || null;
        }
        return null;
    };
    
    const leftPlayer = getLeftPlayer();
    const rightPlayer = getRightPlayer();

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            const newConfig = calculateGameConfig();
			const pongSettings = getPongSettings();
            setGameConfig(newConfig);
            if (engineRef.current) {
                engineRef.current.stop();
                const leftPlayerName = leftPlayer?.name || 'Player 1';
                const rightPlayerName = rightPlayer?.name || 'Player 2';
                engineRef.current = new PongEngine(newConfig, setGameState, mode, leftPlayerName, rightPlayerName, pongSettings);
                engineRef.current.start();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mode, leftPlayer?.name, rightPlayer?.name, currentDifficulty]);

    const sendMatchResult = async (finalGameState: GameState) => {
      try {
          let winnerID: number;
          if (finalGameState.leftScore > finalGameState.rightScore) {
              winnerID = leftPlayer?.userID || 0;
          } else if (finalGameState.rightScore > finalGameState.leftScore) {
              winnerID = rightPlayer?.userID || 2;
          } else {
              winnerID = leftPlayer?.userID || 0; // Default to left player for ties
          }
          const matchData = {
              matchType: 'pong',
              matchMode: mode,
              tournamentBracketID: mode  === 'tournament' ? currentMatch?.tournamentBracketID : null,
              tournamentMatchID: mode === 'tournament' ? currentMatch?.tournamentMatchID : null,
              user1ID: leftPlayer?.userID, // Left player
              user2ID: rightPlayer?.userID || 2, // Right player or Guest (userID=2)
              user1Score: finalGameState.leftScore,
              user2Score: finalGameState.rightScore,
              winnerID: winnerID,
              startedAt: finalGameState.startedAt,
              endedAt: finalGameState.endedAt
          };

          console.log('=== SENDING MATCH RESULT ===');
          console.log('Match Data:', matchData);

          const response = await apiCentral.post('/match', matchData);

          if (response.data) {
              const result = response.data;
              console.log('Match saved successfully:', result);
              console.log('Winner:', result.winner, 'Winner ID:', result.winnerID);
              if (result.duration) {
                  console.log('Match Duration:', result.duration, 'seconds');
              }

              if (mode === 'tournament') {
                    navigate('/tournament/bracket');
                }
          } else {
              console.error('Failed to save match:', response.error);
          }
      } catch (error) {
          console.error('Error sending match result:', error);
      }
  };

    // Add tournament mode validation
    useEffect(() => {
        if (mode === 'tournament' && !currentMatch) {
            console.error('Tournament mode requires match info');
            navigate('/tournament/bracket');
            return;
        }
    }, [mode, currentMatch, navigate]);

    // Game engine and keyboard events
    useEffect(() => {
        const leftPlayerName = leftPlayer?.name || 'Player 1';
        const rightPlayerName = rightPlayer?.name || 'Player 2';
		const pongSettings = getPongSettings();

         // SHOULD BE DELETED THESE COMENTS LATER // THIS IS FOR DEGUB
        console.log('=== PONG GAME STARTED ===');
        console.log('Game Mode:', mode);
		console.log('Difficulty Settings:', pongSettings);
        console.log('Left Player (User):', {
            name: leftPlayer?.name,
            userID: leftPlayer?.userID,
            avatarUrl: leftPlayer?.avatarUrl
        });
        console.log('Right Player (Opponent):', {
            name: rightPlayer?.name,
            userID: rightPlayer?.userID,
            avatarUrl: rightPlayer?.avatarUrl,
            type: mode === 'single' ? 'AI' : (selectedPlayer ? 'Selected Player' : 'Guest')
        });
        console.log('Global Context Players:', {
            selectedPlayer: selectedPlayer,
            aiPlayer: aiPlayer,
            guestPlayer: guestPlayer
        });
        console.log('Final Player Names:', {
            leftPlayerName: leftPlayerName,
            rightPlayerName: rightPlayerName
        });
        console.log('========================');
        // SHOULD BE DELETED THESE COMENTS LATER

        engineRef.current = new PongEngine(gameConfig, setGameState, mode, leftPlayerName, rightPlayerName, pongSettings);

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
    }, [gameConfig, mode, leftPlayer?.name, rightPlayer, currentDifficulty]);

	useEffect(() => {
        console.log('Difficulty changed:', pongSettings);
        
        // Only recreate if game is actively running
        if (engineRef.current && gameState.gameStarted && !gameState.gameEnded) {
            const leftPlayerName = leftPlayer?.name || 'Player 1';
            const rightPlayerName = rightPlayer?.name || 'Player 2';
            
            console.log('Recreating engine with new difficulty...');
            
            // Stop current engine
            engineRef.current.stop();
            
            // Create new engine with updated settings
            engineRef.current = new PongEngine(
                gameConfig,
                setGameState,
                mode,
                leftPlayerName,
                rightPlayerName,
                pongSettings
            );
            
            // Restart
            engineRef.current.start();
            
            console.log('Engine recreated successfully');
        }
    }, [currentDifficulty]);

    useEffect(() => {
      if (gameState.gameEnded && gameState.winner) {
          console.log('Game ended, sending match result...');
          sendMatchResult(gameState);
      }
  }, [gameState.gameEnded, gameState.winner]); // Send result when game ends

    return (
      <main className="min-h-screen flex flex-col">
          <header className="h-40 bg-blue-deep grid grid-cols-3 items-center">
              <div className="flex items-center justify-start gap-2">
                  <h1 className="player-name">{leftPlayer?.name}</h1>
                  <img src={leftPlayer?.avatarUrl} alt="Avatar" className="avatar" />
              </div>
              <div className="flex justify-center">
                  <p className="player-name">{gameState.leftScore} - {gameState.rightScore}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                  <img 
                      src={rightPlayer?.avatarUrl || '/avatars/Avatar_2.png'} 
                      alt="Opponent Avatar" 
                      className="avatar" 
                  />
                  <h2 className="player-name">
                      {rightPlayer?.name || 'Guest'}
                  </h2>
              </div>
          </header>
      <section className="flex-1 bg-pink-grid flex items-center justify-center">
        <div 
          className={`relative shadow-no-blur-70 ${backgroundColor}`}
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
                  {gameState.winner} {translation.pages.pongGame.wins}!
                </p>
                <div className="flex flex-col gap-4">
                  <p className="text-white text-xl font-pixelify opacity-75">
                    {translation.pages.pongGame.pressSpaceToPlayAgain}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!gameState.gameStarted && !gameState.gameEnded && view === `instructions` && (
              <GameInstructions></GameInstructions>
          )}

          {!gameState.gameStarted && !gameState.gameEnded && view === "settings" && (
              <GameSettings
                  onBackgroundChange={setBackgroundColor}
				  gameType='pong'
               />
          )}
        </div>
      </section>

      <footer className="h-40 bg-blue-deep grid place-items-center">
          <div className="col-start-1 row-start-1">
              <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl animate-marquee">PONG GAME</h1>
          </div>
          <div className="col-start-1 row-start-1 z-10 flex gap-4">
              <ButtonPink onClick={handleBackToProfile} className="!mt-0">
                  <img src={home_icon} alt="Home" className="h-8 w-auto"/>
              </ButtonPink>
              <ButtonPink onClick={() => {
                if (view === "settings"){
                  setView("instructions")
                } else {
                  setView("settings")
                }
              }
                } className="!mt-0" >
                  <img src={gear_icon} alt="Game Settings" className="h-8 w-auto"/>
              </ButtonPink>
          </div>
      </footer>
    </main>
  );
}