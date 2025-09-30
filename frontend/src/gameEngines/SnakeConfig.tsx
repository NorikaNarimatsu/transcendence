export type Position = { x: number; y: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

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