import { Snake, type Position, type SnakeGameConfig } from './SnakeConfig';

export const SNAKE_VELOCITY = 200;
export const WINNING_SCORE = 10; // First to eat 10 times WIN

export function getRandomPosition(config: SnakeGameConfig): Position {
    return {
        x: Math.floor(Math.random() * config.gridSizeX),
        y: Math.floor(Math.random() * config.gridSizeY),
    };
}

export class SnakeGameEngine {
    public snake1: Snake;
    public snake2: Snake | null;
    public food: Position;
    public gameOver: boolean;
    public waitingToStart: boolean;
    public winner: number | null;
    public isMultiplayer: boolean;
    public startedAt: string | null;
    public endedAt: string | null;
    private config: SnakeGameConfig;

    constructor(config: SnakeGameConfig, isMultiplayer: boolean = false, player1Name: string = 'Player 1', player2Name: string = 'Guest') {
        this.config = config;

        // Snake 1 starts on the left side, upper position
        this.snake1 = new Snake(
            { x: Math.floor(config.gridSizeX * 0.25), y: Math.floor(config.gridSizeY * 0.3)}, 
            'RIGHT', 
            'blue', 
            player1Name
        );
        
        // Snake 2 starts on the right side, lower position (if multiplayer)
        this.snake2 = isMultiplayer ? new Snake(
            { x: Math.floor(config.gridSizeX * 0.75), y: Math.floor(config.gridSizeY * 0.7)}, 
            'LEFT', 
            'pink', 
            player2Name
        ) : null;

        this.food = getRandomPosition(config);
        this.gameOver = false;
        this.waitingToStart = true;
        this.winner = null;
        this.isMultiplayer = isMultiplayer;
        this.startedAt = null;
        this.endedAt = null;
    }

    public updateConfig (newConfig: SnakeGameConfig): void {
        this.config = newConfig;
    }

    private isValidPosition(position: Position): boolean {
        return position.x >= 0 && 
               position.x < this.config.gridSizeX && 
               position.y >= 0 && 
               position.y < this.config.gridSizeY;
    }

    private checkFoodCollision(position: Position): boolean {
        return position.x === this.food.x && position.y === this.food.y;
    }

    private updateSnake(snake: Snake, otherSnake: Snake | null): boolean {
        const nextPosition = snake.getNextPosition();

        if (!this.isValidPosition(nextPosition)) {
            return false;
        }

        if (snake.checkCollision(nextPosition)) {
            return false;
        }

        if (otherSnake && otherSnake.checkCollision(nextPosition)) {
            return false;
        }

        const ateFood = this.checkFoodCollision(nextPosition);
        if (ateFood) {
            snake.incrementScore();
            this.food = getRandomPosition(this.config);

            if (snake.score >= WINNING_SCORE){
                if (this.isMultiplayer) {
                        this.winner = snake === this.snake1 ? 1 : 2;
                        this.gameOver = true;
                        return true;
                }
                else {
                    // single just win if it reaches 10 foods
                    this.winner = 1;
                }
            }
        }

        snake.move(ateFood);
        return true;
    }

    public update(): void {
        if (this.gameOver || this.waitingToStart) return;

        // Update snake 1
            const snake1Alive = this.updateSnake(this.snake1, this.snake2);
            if (!snake1Alive) {
            if (this.isMultiplayer) {
                this.winner = 2;
            }
            this.gameOver = true;
            this.endedAt = new Date().toISOString();
            return;
        }

        // If snake1 eats 10 times
        if (this.gameOver) return;

        // Update snake 2 if multiplayer
        if (this.isMultiplayer && this.snake2) {
            const snake2Alive = this.updateSnake(this.snake2, this.snake1);
            if (!snake2Alive) {
                this.winner = 1;
                this.gameOver = true;
                this.endedAt = new Date().toISOString();
                return;
            }
        }
    }

    // Start/restart the game
    public startGame(): void {
        this.waitingToStart = false;
        this.gameOver = false;
        this.winner = null;
        this.startedAt = new Date().toISOString();
        this.endedAt = null;
        this.food = getRandomPosition(this.config);

        this.snake1.reset({ x: Math.floor(this.config.gridSizeX * 0.25), y: Math.floor(this.config.gridSizeY * 0.3)}, 'RIGHT');
        if (this.snake2) {
            this.snake2.reset({ x: Math.floor(this.config.gridSizeX * 0.75), y: Math.floor(this.config.gridSizeY * 0.7) }, 'LEFT');
        }
    }

    // Handle keyboard input
    public handleInput(key: string): void {
        if (this.waitingToStart && key === 'Space') {
            this.startGame();
            return;
        }

        if (this.gameOver && key === 'Space') {
            this.startGame();
            return;
        }

        if (this.gameOver || this.waitingToStart) return;

        // Player 1 controls (Arrow keys)
        switch (key) {
            case 'ArrowUp': this.snake1.changeDirection('UP'); break;
            case 'ArrowDown': this.snake1.changeDirection('DOWN'); break;
            case 'ArrowLeft': this.snake1.changeDirection('LEFT'); break;
            case 'ArrowRight': this.snake1.changeDirection('RIGHT'); break;
        }

        // Player 2 controls (WASD) - only in multiplayer
        if (this.isMultiplayer && this.snake2) {
            switch (key) {
                case 'w': this.snake2.changeDirection('UP'); break;
                case 's': this.snake2.changeDirection('DOWN'); break;
                case 'a': this.snake2.changeDirection('LEFT'); break;
                case 'd': this.snake2.changeDirection('RIGHT'); break;
            }
        }
    }

    // Get winner name
    public getWinnerName(): string {
        if (this.winner === 1) return this.snake1.name;
        if (this.winner === 2) return this.snake2?.name || 'Guest';
        
        return '';
    }

    getWinner(): string {
        if (!this.isMultiplayer) {
            return this.winner === 1 ? 'player1' : 'tie';
        }

        if (this.winner === 1) return 'player1';
        if (this.winner === 2) return 'player2';

        return 'tie';
    }
    public getConfig(): SnakeGameConfig {
        return this.config;
    }
}