export interface GameState {
    leftPaddleY: number;
    rightPaddleY: number;
    ballX: number;
    ballY: number;
    leftScore: number;
    rightScore: number;
    gameStarted: boolean;
    gameEnded: boolean;
    winner: string;
  }
  
  export interface GameConfig {
    gameWidth: number;
    gameHeight: number;
    paddleWidth: number;
    paddleHeight: number;
    ballSize: number;
    paddleSpeed: number;
    ballSpeed: number;
    winScore: number;
  }
  
  export class PongEngine {
    private config: GameConfig;
    private ballVelocity = { dx: 0, dy: 0 };
    private ballPosition: { x: number; y: number };
    private paddlePositions: { left: number; right: number };
    private keysPressed: { [key: string]: boolean } = {};
    private gameState: GameState;
    private onStateChange: (state: GameState) => void;
    private animationId: number | null = null;

    private aiDelayCounter = 0;
    private aiDelayFrames = 8; // AI only reacts every 6 frames
  

    private mode: string;

    constructor(config: GameConfig, onStateChange: (state: GameState) => void, mode: string = 'single') {
      this.config = config;
      this.onStateChange = onStateChange;
      this.mode = mode;

      this.config = config;
      this.onStateChange = onStateChange;
      
      // Initialize positions properly centered
      this.ballPosition = { 
        x: (this.config.gameWidth - this.config.ballSize) / 2, 
        y: (this.config.gameHeight - this.config.ballSize) / 2 
      };
      this.paddlePositions = { 
        left: (this.config.gameHeight - this.config.paddleHeight) / 2, 
        right: (this.config.gameHeight - this.config.paddleHeight) / 2 
      };
      this.gameState = this.getInitialState();
    }
  
    private getInitialState(): GameState {
      return {
        leftPaddleY: (this.config.gameHeight - this.config.paddleHeight) / 2,
        rightPaddleY: (this.config.gameHeight - this.config.paddleHeight) / 2,
        ballX: (this.config.gameWidth - this.config.ballSize) / 2,
        ballY: (this.config.gameHeight - this.config.ballSize) / 2,
        leftScore: 0,
        rightScore: 0,
        gameStarted: false,
        gameEnded: false,
        winner: ''
      };
    }
  
    public getState(): GameState {
      return { ...this.gameState };
    }
  
    public handleKeyDown(key: string): void {
      this.keysPressed[key] = true;    
      if (key === " ") {
        if (this.gameState.gameEnded) {
          this.resetGame();
        } else if (this.ballVelocity.dx === 0 && this.ballVelocity.dy === 0) {
          this.launchBall();
        }
      }
    }
  
    public handleKeyUp(key: string): void {
      this.keysPressed[key] = false;
    }

    private launchBall(): void {
      const angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
      const direction = Math.random() < 0.5 ? -1 : 1;
      this.ballVelocity.dx = direction * this.config.ballSpeed * Math.cos(angle);
      this.ballVelocity.dy = this.config.ballSpeed * Math.sin(angle);
      this.updateState({ gameStarted: true });
    }
  
    private resetBall(): void {
        const centerX = (this.config.gameWidth / 2 ) - (this.config.ballSize / 2);
        const centerY = (this.config.gameHeight / 2) - ( this.config.ballSize / 2);
        
        this.ballPosition.x = centerX;
        this.ballPosition.y = centerY;
        this.ballVelocity.dx = 0;
        this.ballVelocity.dy = 0;
        
        this.updateState({
          ballX: centerX,
          ballY: centerY,
          gameStarted: false
        });
      }
    
      private resetGame(): void {
        const centerX = (this.config.gameWidth - this.config.ballSize) / 2;
        const centerY = (this.config.gameHeight - this.config.ballSize) / 2;
        const centerPaddleY = (this.config.gameHeight - this.config.paddleHeight) / 2;
        
        this.ballPosition = { x: centerX, y: centerY };
        this.paddlePositions = { left: centerPaddleY, right: centerPaddleY };
        this.ballVelocity = { dx: 0, dy: 0 };
        
        this.gameState = this.getInitialState();
        this.onStateChange(this.gameState);
      }
  
    private updateState(partialState: Partial<GameState>): void {
      this.gameState = { ...this.gameState, ...partialState };
      this.onStateChange(this.gameState);
    }
  
    private checkGameEnd(): void {
      if (this.gameState.leftScore >= this.config.winScore) {
        this.updateState({
          gameEnded: true,
          winner: 'Norika'
        });
        this.resetBall();
      } else if (this.gameState.rightScore >= this.config.winScore) {
        this.updateState({
          gameEnded: true,
          winner: 'Sara'
        });
        this.resetBall();
      }
    }
  
    private updatePaddles(): void {
      // Left paddle: always human
      // Right paddle: AI if single mode, else human
      let leftY = this.paddlePositions.left;
      if (this.keysPressed["w"] || this.keysPressed["W"]) {
        leftY = Math.max(leftY - this.config.paddleSpeed, 0);
      }
      if (this.keysPressed["s"] || this.keysPressed["S"]) {
        leftY = Math.min(leftY + this.config.paddleSpeed, this.config.gameHeight - this.config.paddleHeight);
      }
      this.paddlePositions.left = leftY;
  
      let rightY = this.paddlePositions.right;

      if (this.mode === 'single') {
        this.aiDelayCounter++;
        if (this.aiDelayCounter >= this.aiDelayFrames) {
          const ballCenter = this.ballPosition.y + this.config.ballSize / 2;
          const paddleCenter = rightY + this.config.paddleHeight / 2;
          const tolerance = 8;
          if (ballCenter < paddleCenter - tolerance) {
            rightY = Math.max(rightY - this.config.paddleSpeed, 0);
          } else if (ballCenter > paddleCenter + tolerance) {
            rightY = Math.min(rightY + this.config.paddleSpeed, this.config.gameHeight - this.config.paddleHeight);
          }
          this.aiDelayCounter = 0;
        }
      } else {
        // Human control
        if (this.keysPressed["ArrowUp"]) {
          rightY = Math.max(rightY - this.config.paddleSpeed, 0);
        }
        if (this.keysPressed["ArrowDown"]) {
          rightY = Math.min(rightY + this.config.paddleSpeed, this.config.gameHeight - this.config.paddleHeight);
        }
      }
      this.paddlePositions.right = rightY;
  
      this.updateState({
        leftPaddleY: leftY,
        rightPaddleY: rightY
      });
    }
  
    private updateBall(): void {
      if (this.ballVelocity.dx === 0 && this.ballVelocity.dy === 0) return;
  
      let nextBallX = this.ballPosition.x + this.ballVelocity.dx;
      let nextBallY = this.ballPosition.y + this.ballVelocity.dy;
  
      // Top/bottom wall bounce
      if (nextBallY <= 0 || nextBallY >= this.config.gameHeight - this.config.ballSize) {
        this.ballVelocity.dy = -this.ballVelocity.dy;
        nextBallY = Math.max(0, Math.min(nextBallY, this.config.gameHeight - this.config.ballSize));
      }
  
      // Left wall collision (right player scores)
      if (nextBallX <= 0) {
        this.updateState({ rightScore: this.gameState.rightScore + 1 });
        this.resetBall();
        this.checkGameEnd();
        return;
      }
  
      // Right wall collision (left player scores)
      if (nextBallX >= this.config.gameWidth - this.config.ballSize) {
        this.updateState({ leftScore: this.gameState.leftScore + 1 });
        this.resetBall();
        this.checkGameEnd();
        return;
      }
  
      // Left paddle collision
      if (
        nextBallX <= this.config.paddleWidth &&
        this.ballPosition.x > this.config.paddleWidth &&
        nextBallY + this.config.ballSize >= this.paddlePositions.left &&
        nextBallY <= this.paddlePositions.left + this.config.paddleHeight
      ) {
        this.ballVelocity.dx = Math.abs(this.ballVelocity.dx);
        nextBallX = this.config.paddleWidth;
      }
  
      // Right paddle collision
      if (
        nextBallX + this.config.ballSize >= this.config.gameWidth - this.config.paddleWidth &&
        this.ballPosition.x + this.config.ballSize < this.config.gameWidth - this.config.paddleWidth &&
        nextBallY + this.config.ballSize >= this.paddlePositions.right &&
        nextBallY <= this.paddlePositions.right + this.config.paddleHeight
      ) {
        this.ballVelocity.dx = -Math.abs(this.ballVelocity.dx);
        nextBallX = this.config.gameWidth - this.config.paddleWidth - this.config.ballSize;
      }
  
      // Update ball position
      this.ballPosition.x = nextBallX;
      this.ballPosition.y = nextBallY;
      
      this.updateState({
        ballX: nextBallX,
        ballY: nextBallY
      });
    }
  
    private gameLoop = (): void => {
      if (this.gameState.gameEnded) {
        this.animationId = requestAnimationFrame(this.gameLoop);
        return;
      }
      this.updatePaddles();
      this.updateBall();
      this.animationId = requestAnimationFrame(this.gameLoop);
    };
  
    public start(): void {
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  
    public stop(): void {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }