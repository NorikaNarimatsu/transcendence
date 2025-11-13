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
    startedAt?: string;
    endedAt?: string;
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

  export interface DifficultySettings {
	ballSpeed: number;
	paddleSpeed: number;
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
    private aiDelayFrames = 5; // AI only reacts every 6 frames
  

    private mode: string;
    private leftPlayerName: string;
    private rightPlayerName: string;

	private difficultySettings: DifficultySettings;

    constructor(config: GameConfig, onStateChange: (state: GameState) => void, mode: string = 'single', leftPlayerName: string = 'Player 1', rightPlayerName: string = 'AI', difficultySettings?: DifficultySettings) {
      this.config = config;
      this.onStateChange = onStateChange;
      this.mode = mode;
      this.leftPlayerName = leftPlayerName;
      this.rightPlayerName = rightPlayerName;

	  this.difficultySettings = difficultySettings || {
		ballSpeed: config.ballSpeed,
		paddleSpeed: config.paddleSpeed
	  };

	  this.config.ballSpeed = this.difficultySettings.ballSpeed;
	  this.config.paddleSpeed = this.difficultySettings.paddleSpeed;
      
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
      const angle = (Math.random() * Math.PI / 6) - Math.PI / 12;
      const direction = Math.random() < 0.5 ? -1 : 1;
      this.ballVelocity.dx = direction * this.config.ballSpeed * Math.cos(angle);
      this.ballVelocity.dy = this.config.ballSpeed * Math.sin(angle);
      
      const startTime = new Date().toISOString();
      this.updateState({ 
        gameStarted: true,
        startedAt: startTime
      });
    }
  
    private resetBall(): void {
        const centerX = (this.config.gameWidth / 2 ) - (this.config.ballSize / 2);
        const centerY = (this.config.gameHeight / 2) - ( this.config.ballSize / 2);
        const centerPaddleY = (this.config.gameHeight - this.config.paddleHeight) / 2;

        this.ballPosition.x = centerX;
        this.ballPosition.y = centerY;
        this.ballVelocity.dx = 0;
        this.ballVelocity.dy = 0;

        // Reset paddles to center
        this.paddlePositions.left = centerPaddleY;
        this.paddlePositions.right = centerPaddleY;

        this.updateState({
          ballX: centerX,
          ballY: centerY,
          leftPaddleY: centerPaddleY,
          rightPaddleY: centerPaddleY,
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
        const endTime = new Date().toISOString();
        this.updateState({
          gameEnded: true,
          winner: this.leftPlayerName,
          endedAt: endTime
        });
        this.resetBall();
      } else if (this.gameState.rightScore >= this.config.winScore) {
        const endTime = new Date().toISOString();
        this.updateState({
          gameEnded: true,
          winner: this.rightPlayerName,
          endedAt: endTime
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
              const moveFraction = 0.5;
              let delta = ballCenter - paddleCenter;

              // Limit maximum movement per frame
              delta = Math.max(-this.config.paddleSpeed, Math.min(this.config.paddleSpeed, delta * moveFraction));
              rightY = Math.max(0, Math.min(rightY + delta, this.config.gameHeight - this.config.paddleHeight));

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

        // Add angle based on hit position
        const paddleCenter = this.paddlePositions.left + this.config.paddleHeight / 2;
        const hitPos = (nextBallY + this.config.ballSize / 2) - paddleCenter;
        const maxBounceAngle = Math.PI / 5; // 60 degrees
        const normalized = hitPos / (this.config.paddleHeight / 2);
        const bounceAngle = normalized * maxBounceAngle;
        const speed = Math.sqrt(this.ballVelocity.dx ** 2 + this.ballVelocity.dy ** 2) || this.config.ballSpeed;
        this.ballVelocity.dx = speed * Math.cos(bounceAngle);
        this.ballVelocity.dy = speed * Math.sin(bounceAngle);
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

        // Add angle based on hit position
        const paddleCenter = this.paddlePositions.right + this.config.paddleHeight / 2;
        const hitPos = (nextBallY + this.config.ballSize / 2) - paddleCenter;
        const maxBounceAngle = Math.PI / 3; // 60 degrees
        const normalized = hitPos / (this.config.paddleHeight / 2);
        const bounceAngle = normalized * maxBounceAngle;
        const speed = Math.sqrt(this.ballVelocity.dx ** 2 + this.ballVelocity.dy ** 2) || this.config.ballSpeed;
        this.ballVelocity.dx = -speed * Math.cos(bounceAngle);
        this.ballVelocity.dy = speed * Math.sin(bounceAngle);
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