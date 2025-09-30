import { Snake, Position } from './SnakeConfig';

export const GRID_SIZE_X = 20;
export const GRID_SIZE_Y = 12;
export const CELL_SIZE = 50;
export const SNAKE_VELOCITY = 200;

export function getRandomPosition(): Position {
    return {
        x: Math.floor(Math.random() * GRID_SIZE_X),
        y: Math.floor(Math.random() * GRID_SIZE_Y),
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

    constructor(isMultiplayer: boolean = false, player1Name: string = 'Player 1', player2Name: string = 'Guest') {
        this.snake1 = new Snake({ x: 10, y: 10 }, 'RIGHT', 'blue', player1Name);
        this.snake2 = isMultiplayer ? new Snake({ x: 5, y: 5 }, 'LEFT', 'pink', player2Name) : null;
        this.food = getRandomPosition();
        this.gameOver = false;
        this.waitingToStart = true;
        this.winner = null;
        this.isMultiplayer = isMultiplayer;
    }

    private isValidPosition(position: Position): boolean {
        return position.x >= 0 && 
               position.x < GRID_SIZE_X && 
               position.y >= 0 && 
               position.y < GRID_SIZE_Y;
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
            this.food = getRandomPosition();
        }

        snake.move(ateFood);
        return true;
    }

    public update(): void {
        if (this.gameOver || this.waitingToStart) return;

        // Update snake 1
        const snake1Alive = this.updateSnake(this.snake1, this.snake2);
        if (!snake1Alive) {
            this.winner = 2;
            this.gameOver = true;
            return;
        }

        // Update snake 2 if multiplayer
        if (this.isMultiplayer && this.snake2) {
            const snake2Alive = this.updateSnake(this.snake2, this.snake1);
            if (!snake2Alive) {
                this.winner = 1;
                this.gameOver = true;
                return;
            }
        }
    }

    // Start/restart the game
    public startGame(): void {
        this.waitingToStart = false;
        this.gameOver = false;
        this.winner = null;
        this.food = getRandomPosition();

        // Reset snakes
        this.snake1.reset({ x: 5, y: 5 }, 'RIGHT');
        if (this.snake2) {
            this.snake2.reset({ x: 10, y: 10 }, 'LEFT');
        }
    }

    // Handle keyboard input
    public handleInput(key: string): void {
        if (this.waitingToStart && key === 'Space') {
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
        if (!this.isMultiplayer) return this.snake1.name;
        
        if (this.winner === 1) return this.snake1.name;
        if (this.winner === 2) return this.snake2?.name || 'Guest';
        
        return '';
    }
}