export type Position = { x: number; y: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface SnakeGameConfig {
    gameWidth: number;
    gameHeight: number;
    gridSizeX: number;
    gridSizeY: number;
    cellSize: number;
}

// Function to calculate snake game config based on screen size
export const calculateSnakeGameConfig = (): SnakeGameConfig => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Reserve space for header (160px) and footer (160px)
    const availableHeight = screenHeight - 320;
    
    const maxWidth = Math.min(screenWidth * 0.8, 1200);
    const maxHeight = Math.min(availableHeight * 0.8, 700);
    
    // Keep aspect ratio similar to original (20x12 grid)
    const aspectRatio = 20 / 12;
    
    let gameWidth, gameHeight;
    if (maxWidth / maxHeight > aspectRatio) {
        gameHeight = maxHeight;
        gameWidth = gameHeight * aspectRatio;
    } else {
        gameWidth = maxWidth;
        gameHeight = gameWidth / aspectRatio;
    }
    
    // Calculate grid size to maintain reasonable cell count
    const gridSizeX = 20; // Keep original grid size
    const gridSizeY = 12;
    
    const cellSize = Math.floor(Math.min(gameWidth / gridSizeX, gameHeight / gridSizeY));
    
    return {
        gameWidth: cellSize * gridSizeX,
        gameHeight: cellSize * gridSizeY,
        gridSizeX,
        gridSizeY,
        cellSize
    };
};

export class Snake {
    public body: Position[];
    public direction: Direction;
    public score: number;
    public color: 'blue' | 'pink';
    public name: string;

    constructor(
        initialPosition: Position, 
        initialDirection: Direction, 
        color: 'blue' | 'pink' = 'blue',
        name: string = 'Player'
    ) {
        this.body = [initialPosition];
        this.direction = initialDirection;
        this.score = 0;
        this.color = color;
        this.name = name;
    }

    getHead(): Position {
        return this.body[0];
    }

    getNextPosition(): Position {
        const head = this.getHead();
        
        switch (this.direction) {
            case 'UP': return { x: head.x, y: head.y - 1 };
            case 'DOWN': return { x: head.x, y: head.y + 1 };
            case 'LEFT': return { x: head.x - 1, y: head.y };
            case 'RIGHT': return { x: head.x + 1, y: head.y };
        }
    }

    move(ateFood: boolean = false): void {
        const newHead = this.getNextPosition();
        this.body.unshift(newHead);
        
        if (!ateFood) {
            this.body.pop();
        }
    }

    checkCollision(position: Position): boolean {
        return this.body.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }

    changeDirection(newDirection: Direction): void {
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };

        if (opposites[this.direction] !== newDirection) {
            this.direction = newDirection;
        }
    }

    reset(position: Position, direction: Direction): void {
        this.body = [position];
        this.direction = direction;
        this.score = 0;
    }

    incrementScore(): void {
        this.score++;
    }
}