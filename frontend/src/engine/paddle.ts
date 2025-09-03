/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   paddle.ts                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                     */
/*                                                   +#+                      */
/*   Created: 2025/09/03 15:38:33 by nnarimatsu    #+#    #+#                 */
/*   Updated: 2025/09/03 15:41:33 by nnarimatsu    ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

import { PADDLE_W, PADDLE_H, PADDLE_SPEED, H } from '../constants.js';

// A value that is guaranteed to be between lo and hi (inclusive)
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export class Paddle
{
  x: number;
  y: number;
  w = PADDLE_W;
  h = PADDLE_H;
  
  constructor(x: number, y: number) { this.x = x; this.y = y; }

  update(dt: number, up: boolean, down: boolean)
  {
    const dy = (up ? -1 : 0) + (down ? 1 : 0);
    this.y += dy * PADDLE_SPEED * dt;
    this.y = clamp(this.y, 0, H - this.h);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}
