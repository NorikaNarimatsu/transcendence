/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   game.ts                                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                     */
/*                                                   +#+                      */
/*   Created: 2025/09/01 17:34:57 by nnarimatsu    #+#    #+#                 */
/*   Updated: 2025/09/01 17:39:53 by nnarimatsu    ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

import { makeBgGradient, colors } from '../theme.js';
import { W, H, PADDLE_W, PADDLE_H, BALL_R, SCORE_TO_WIN } from '../constants.js';
import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import type { DOMRefs } from '../ui/dom.js';
import { Keyboard } from '../input/keyboard.js';
import { HUD } from '../ui/hud.js';
import { State } from '../types.js';

export class Game
{
  left = new Paddle(24, (H - PADDLE_H)/2);
  right= new Paddle(W - 24 - PADDLE_W, (H - PADDLE_H)/2);
  ball = new Ball();
  scoreL = 0;
  scoreR = 0;
  state: State = State.MENU;

  private rafId: number | null = null;
  private last = performance.now();

  constructor(private dom: DOMRefs, private hud: HUD, private kb: Keyboard) {}

  init()
  {
    this.hud.setScore(0, 0);
    this.ball.serve(Math.random() > 0.5);
    this.state = State.READY;
  }

  setState(s: State) { this.state = s; }

  startLoop()
  {
    if (this.rafId !== null)
        return; // already running
    this.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - this.last) / 1000);
      this.last = now;

      // input (allow paddles to move when paused/ready)
      const upL = this.kb.down('KeyW'), downL = this.kb.down('KeyS');
      const upR = this.kb.down('ArrowUp'), downR = this.kb.down('ArrowDown');
      this.left.update(dt, upL, downL);
      this.right.update(dt, upR, downR);

      if (this.state === State.PLAYING)
      {
        this.ball.update(dt);
        // collisions
        if (this.ball.vx < 0) 
            this.collide(this.left, true);
        else                  
            this.collide(this.right, false);
        // scoring
        if (this.ball.x < -BALL_R) 
            this.point(true);
        if (this.ball.x > W + BALL_R) 
            this.point(false);
      }

      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);

    // keys for start/pause/reset
    addEventListener('keydown', (e) => {
      if (e.code === 'Space' && (this.state === State.READY || this.state === State.PAUSED)) 
        this.state = State.PLAYING;
      if (e.code === 'KeyP' && this.state === State.PLAYING) 
        this.state = State.PAUSED;
      if (e.code === 'KeyR') 
        this.resetMatch(false);
    }, { once: false });
  }

  resetMatch(resetNames: boolean) {
    this.scoreL = 0; this.scoreR = 0;
    this.hud.setScore(this.scoreL, this.scoreR);
    this.left.y = (H - PADDLE_H)/2; this.right.y = (H - PADDLE_H)/2;
    this.ball.serve(Math.random() > 0.5);
    this.state = State.READY;
    // names handled by HUD owner; no need here
  }

  private collide(p: Paddle, towardsRight: boolean) {
    const inX = this.ball.x + BALL_R > p.x && this.ball.x - BALL_R < p.x + p.w;
    const inY = this.ball.y + BALL_R > p.y && this.ball.y - BALL_R < p.y + p.h;
    if (!(inX && inY)) 
        return;

    const hit = ((this.ball.y - (p.y + p.h/2)) / (p.h/2)); // -1..1
    const ang = hit * 0.6; // ~±34°
    const dir = towardsRight ? 1 : -1;

    // speed increase is inside Ball; recompute components here
    const nextSpeed = Math.min(this.ball.speed * 1.035, 900);
    this.ball.speed = nextSpeed;
    this.ball.vx = Math.cos(ang) * nextSpeed * dir;
    this.ball.vy = Math.sin(ang) * nextSpeed;

    this.ball.x = towardsRight ? p.x - BALL_R - 1 : p.x + p.w + BALL_R + 1; // nudge out
  }

  private point(toRight: boolean) {
    if (toRight)
        this.scoreR++;
    else
        this.scoreL++;
    this.hud.setScore(this.scoreL, this.scoreR);

    if (this.scoreL >= SCORE_TO_WIN || this.scoreR >= SCORE_TO_WIN)
      this.state = State.GAMEOVER;
    else
    {
      this.ball.serve(!toRight);
      this.state = State.READY;
    }
  }

  private render() {
    const { ctx } = this.dom;
  
    // Background (gradient fill instead of clear)
    const bg = makeBgGradient(ctx, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  
    // Mid dashed line
    ctx.fillStyle = colors.midline;
    ctx.globalAlpha = 0.65;
    for (let y = 10; y < H; y += 24) ctx.fillRect(W / 2 - 2, y, 4, 12);
    ctx.globalAlpha = 1;
  
    // Left paddle (blush)
    ctx.fillStyle = colors.blush;
    this.left.draw(ctx);
  
    // Right paddle (pink)
    ctx.fillStyle = colors.pink;
    this.right.draw(ctx);
  
    // Ball (blush)
    ctx.beginPath();
    ctx.fillStyle = colors.blush;
    ctx.arc(this.ball.x, this.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  
    // HUD / state text
    ctx.fillStyle = colors.text;
    ctx.font = '16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    if (this.state === State.READY)   ctx.fillText('Press SPACE to serve', W / 2, 40);
    if (this.state === State.PAUSED)  ctx.fillText('Paused (P to resume)', W / 2, 40);
    if (this.state === State.GAMEOVER) {
      const winner = this.scoreL > this.scoreR
        ? (document.getElementById('leftName')!.textContent || 'Left')
        : (document.getElementById('rightName')!.textContent || 'Right');
      ctx.fillText(`${winner} wins! (R to reset)`, W / 2, 40);
    }
  }
}