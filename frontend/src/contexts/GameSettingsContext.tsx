import React, { createContext, useContext, useState } from "react"
import type { ReactNode } from 'react'

type GameMode = 'easy' | 'medium' | 'hard';

interface PongSettings {
	ballSpeed: number;
	paddleSpeed: number;
}

interface SnakeSettings {
	snakeSpeed: number;
}

interface GameSettings {
	pong: {
		mode: GameMode;
		settings: PongSettings;
	};
	snake: {
		mode: GameMode;
		settings: SnakeSettings;
	};
}

interface GameSettingsContextType {
	gameSettings: GameSettings;
	setPongMode: (mode: GameMode) => void;
	setSnakeMode: (mode: GameMode) => void;
	getPongSettings: () => PongSettings;
	getSnakeSettings: () => SnakeSettings;
}

const GameSettingsContext = createContext<GameSettingsContextType | undefined>(undefined);

const PONG_MODES: Record<GameMode, PongSettings> = {
	easy: { ballSpeed: 6, paddleSpeed: 6 },
	medium: { ballSpeed: 9, paddleSpeed: 6 },
	hard: { ballSpeed: 12, paddleSpeed: 10 }
};

const SNAKE_MODES: Record<GameMode, SnakeSettings> = {
	easy: { snakeSpeed: 150 },
	medium: { snakeSpeed: 125 },
	hard: {snakeSpeed: 100}
};

export function GameSettingsProvider({ children }: { children: ReactNode }) {
	
	const [gameSettings, setGameSettings] = useState<GameSettings>({
		pong: {
			mode: 'medium',
			settings: PONG_MODES.medium
		},
		snake: {
			mode: 'medium',
			settings: SNAKE_MODES.medium
		}
	})

	const setPongMode = (mode: GameMode) => {
		setGameSettings(prev => ({
			...prev,
			pong: {
				mode,
				settings: PONG_MODES[mode]
			}
		}));
	};

	const setSnakeMode = (mode: GameMode) => {
		setGameSettings(prev => ({
			...prev,
			snake: {
				mode,
				settings: SNAKE_MODES[mode]
			}
		}));
	};

	const getPongSettings = () => gameSettings.pong.settings;
	const getSnakeSettings = () => gameSettings.snake.settings;

	return (
		<GameSettingsContext.Provider
			value={{
				gameSettings,
				setPongMode,
				setSnakeMode,
				getPongSettings,
				getSnakeSettings
			}}>
			{children}
		</GameSettingsContext.Provider>
	)
}

export function useGameSettings() {
	const context = useContext(GameSettingsContext);
	if (!context){
		throw new Error (`useGameSettings must be used within GameSettingsProvider`);
	}
	return context;
}