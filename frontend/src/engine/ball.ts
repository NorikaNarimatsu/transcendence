/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   ball.ts                                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                     */
/*                                                   +#+                      */
/*   Created: 2025/09/01 17:34:50 by nnarimatsu    #+#    #+#                 */
/*   Updated: 2025/09/01 17:34:52 by nnarimatsu    ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

import { W, H, BALL_R, BALL_SPEED_START, BALL_SPEED_MAX, BALL_ACCEL } from '../constants.js';

export class Ball
{
  x = W/2;
  y = H/2;
  vx = 0;
  vy = 0;
  speed = BALL_SPEED_START;

  serve(toRight: boolean)
  {
    this.x = W/2; this.y = H/2;
    this.speed = BALL_SPEED_START;
    const angle = (Math.random() * 0.7 - 0.35); // ~[-20°,20°]
    const dir = toRight ? 1 : -1;
    this.vx = Math.cos(angle) * this.speed * dir;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(dt: number) {
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.y < BALL_R)
    {
        this.y = BALL_R;
        this.vy = Math.abs(this.vy);
    }
    if (this.y > H - BALL_R)
    { 
        this.y = H - BALL_R;
        this.vy = -Math.abs(this.vy);
    }
  }

  draw(ctx: CanvasRenderingContext2D)
  {
    ctx.beginPath();
    ctx.arc(this.x, this.y, BALL_R, 0, Math.PI*2);
    ctx.fill();
  }
}
