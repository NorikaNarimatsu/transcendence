/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   constants.ts                                       :+:    :+:            */
/*                                                     +:+                    */
/*   By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                     */
/*                                                   +#+                      */
/*   Created: 2025/09/03 15:42:08 by nnarimatsu    #+#    #+#                 */
/*   Updated: 2025/09/03 16:24:54 by nnarimatsu    ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

export const W = 900;
export const H = 540;

export const PADDLE_W = 14;
export const PADDLE_H = 100;
export const PADDLE_SPEED = 420;

export const BALL_R = 8;
export const BALL_SPEED_START = 360;
export const BALL_SPEED_MAX   = 900;
export const BALL_ACCEL       = 1.035;

export const SCORE_TO_WIN = 3;

export enum State
{
    MENU,
    READY,
    PLAYING,
    PAUSED,
    SCORED,
    GAMEOVER
}

export const colors = {
    primary:  '#1900A7', // darkblue
    accent:   '#7A63FE', // bg end
    pink:     '#EC8FC7', // pink
    peach:    '#FFC7E9', // peach ish pink
  };
