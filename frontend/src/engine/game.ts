/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   game.ts                                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                     */
/*                                                   +#+                      */
/*   Created: 2025/09/01 17:34:57 by nnarimatsu    #+#    #+#                 */
/*   Updated: 2025/09/03 17:42:43 by nnarimatsu    ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

import { W, H, PADDLE_W, PADDLE_H, BALL_R, SCORE_TO_WIN, State, colors} from '../constants.js';
import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import type { DOMRefs } from '../ui/dom.js';
import { Keyboard } from '../input/keyboard.js';
import { inGameInfo } from '../ui/inGameInfo.js';


export class Game
{
  left = new Paddle(24, (H - PADDLE_H)/2);
  right= new Paddle(W - 24 - PADDLE_W, (H - PADDLE_H)/2);
  ball = new Ball();
  scoreL = 0;
  scoreR = 0;
  state: State = State.MENU; // Menu, Ready, Playing, Paused, Scored, Gameover

  private animationFrameID: number | null = null; // type declaration that can be number of null
  private last = performance.now(); // Stores the timestamp of the previous frame in milliseconds

  // DOM refers to the Document Object Model (the HTML structure)
  constructor(private dom: DOMRefs, private gameInfo: inGameInfo, private keyboard: Keyboard) {}

  init()
  {
    this.gameInfo.setScore(0, 0);
    const toRight = Math.random() > 0.5; // randomly choose the serving side
    this.ball.serve(toRight);
    this.state = State.READY; // Menu, Ready, Playing, Paused, Scored, Gameover
  }

  setState(s: State) { this.state = s; }

  startLoop()
  {
    if (this.animationFrameID !== null)
        return; // already running
    this.last = performance.now(); //store previous frame
    const current_time = (now: number) =>
    {
      const dt = Math.min(0.016, (now - this.last) / 1000); // 1/60 = 0.0166...
      this.last = now;

      // player 1's input
      const upL = this.keyboard.down('KeyW');
      const downL = this.keyboard.down('KeyS');
      // player 2's input
      const upR = this.keyboard.down('ArrowUp');
      const downR = this.keyboard.down('ArrowDown');
      
      // update the paddel
      this.left.update(dt, upL, downL);
      this.right.update(dt, upR, downR);

      if (this.state === State.PLAYING) // Menu, Ready, Playing, Paused, Scored, Gameover
      {
        this.ball.update(dt);
        // collisions
        if (this.ball.vx < 0) 
          this.collide(this.left, false);  // Ball moving LEFT towards left paddle
        else                  
          this.collide(this.right, true);  // Ball moving RIGHT towards right paddle
        // scoring
        if (this.ball.x < -BALL_R) 
            this.point(true);
        if (this.ball.x > W + BALL_R) 
            this.point(false);
      }
      this.render();
      this.animationFrameID = requestAnimationFrame(current_time);
    };
    this.animationFrameID = requestAnimationFrame(current_time); // not sure this line yet......
    
    // keys for start/pause/reset
    addEventListener('keydown', (e) =>
    {
      if (e.code === 'Space' && (this.state === State.READY || this.state === State.PAUSED)) 
        this.state = State.PLAYING;
      if (e.code === 'KeyP' && this.state === State.PLAYING) 
        this.state = State.PAUSED; // Menu, Ready, Playing, Paused, Scored, Gameover
      if (e.code === 'KeyR') 
        this.resetMatch(false);
    })
  }

  resetMatch(resetNames: boolean)
  {
    this.scoreL = 0;
    this.scoreR = 0;
    this.gameInfo.setScore(this.scoreL, this.scoreR);
    this.left.y = (H - PADDLE_H)/2;
    this.right.y = (H - PADDLE_H)/2;
    const toRight = Math.random() > 0.5; // randomly choose the serving side
    this.ball.serve(toRight);
    this.state = State.READY; // Menu, Ready, Playing, Paused, Scored, Gameover
  }

  private collide(p: Paddle, towardsRight: boolean)
  {
    // Check X-side coallition!!!
    const ballRadius = BALL_R;
    const paddleFront = towardsRight 
        ? p.x 
        : (p.x + p.w);
    const ballEdge = towardsRight
        ? (this.ball.x + ballRadius) 
        : (this.ball.x - ballRadius);
    // Check if ball is at or past paddle front
    const atPaddle = towardsRight 
        ? (ballEdge >= paddleFront && this.ball.x - ballRadius <= p.x + p.w)
        : (ballEdge <= paddleFront && this.ball.x + ballRadius >= p.x);
    
    // Check Y-side coallition!!!
    const inY = this.ball.y + ballRadius > p.y && this.ball.y - ballRadius < p.y + p.h;
    if (!(atPaddle && inY))
      return;
    
    // Only bounce if ball is moving toward paddle
    if ((towardsRight && this.ball.vx < 0) || (!towardsRight && this.ball.vx > 0))
        return; // Already bounced
    
    // Calculate bounce
    const hit = ((this.ball.y - (p.y + p.h/2)) / (p.h/2)); // -1..1
    const ang = hit * 0.6; // ~±34°
    
    const dir = towardsRight ? -1 : 1;
    
    const nextSpeed = Math.min(this.ball.speed * 1.035, 900);
    this.ball.speed = nextSpeed;
    this.ball.vx = Math.cos(ang) * nextSpeed * dir;
    this.ball.vy = Math.sin(ang) * nextSpeed;
    
    // Place ball at paddle edge
    this.ball.x = towardsRight 
      ? paddleFront - ballRadius - 1 
      : paddleFront + ballRadius + 1;
  }
  private point(toRight: boolean)
  {
    if (toRight)
        this.scoreR++;
    else
        this.scoreL++;
    this.gameInfo.setScore(this.scoreL, this.scoreR);

    if (this.scoreL >= SCORE_TO_WIN || this.scoreR >= SCORE_TO_WIN)
      this.state = State.GAMEOVER; // Menu, Ready, Playing, Paused, Scored, Gameover
    else
    {
      this.ball.serve(!toRight);
      this.state = State.READY; // Menu, Ready, Playing, Paused, Scored, Gameover
    }
  }

  private render()
  {
    const { ctx } = this.dom;
  
    // Background
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, W, H);
  
    // Mid dashed line
    ctx.fillStyle = colors.peach;
    ctx.globalAlpha = 0.65;
    for (let y = 10; y < H; y += 24) ctx.fillRect(W / 2 - 2, y, 4, 12);
    ctx.globalAlpha = 1;
  
    // Paddles
    ctx.fillStyle = colors.peach;
    this.left.draw(ctx);
    ctx.fillStyle = colors.peach;
    this.right.draw(ctx);
  
    // Ball
    ctx.beginPath();
    ctx.fillStyle = colors.pink;
    ctx.arc(this.ball.x, this.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  
    // gameInfo
    ctx.fillStyle = colors.peach;
    ctx.textAlign = 'center';

    switch (this.state) {
      case State.READY:
        ctx.font = '20px system-ui, sans-serif';
        ctx.fillText('Press SPACE to serve', W / 2, 40);
        break;
      case State.PAUSED:
        ctx.font = '20px system-ui, sans-serif';
        ctx.fillText('Paused (P to resume)', W / 2, 40);
        break;
      case State.GAMEOVER:
        ctx.font = '32px system-ui, sans-serif';  // Bigger for game over
        const winner = this.scoreL > this.scoreR
          ? document.getElementById('leftName')?.textContent || 'Left Player'
          : document.getElementById('rightName')?.textContent || 'Right Player';
        ctx.fillText(`${winner} wins! (R to reset)`, W / 2, 40);
        break;
    }
  }
}

/*
Bouncing
         hit = -1 → ┌─────┐ ← Top edge (sharp upward angle)
                    │     │
         hit = 0  → │  •  │ ← Center (straight bounce)
                    │     │
         hit = +1 → └─────┘ ← Bottom edge (sharp downward angle)
*/