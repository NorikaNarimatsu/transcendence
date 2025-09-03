/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   routesHandlers.ts                                  :+:    :+:            */
/*                                                     +:+                    */
/*   By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                     */
/*                                                   +#+                      */
/*   Created: 2025/09/03 18:32:34 by nnarimatsu    #+#    #+#                 */
/*   Updated: 2025/09/03 18:32:35 by nnarimatsu    ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */



// frontend/src/routes/handlers.ts

import { PageManager } from '../ui/pageManager.js';
import { Overlay } from '../ui/overlay.js';
import { Game } from '../engine/game.js';
import { State } from '../constants.js';

export class RouteHandlers {
  constructor(
    private pageManager: PageManager,
    private overlay: Overlay,
    private game: Game
  ) {}

  welcome = () => {
    this.pageManager.showPage('welcome');
    this.overlay.hide();
  }

  signup = () => {
    this.pageManager.showPage('signup');
    this.overlay.hide();
  }

  profile = () => {
    this.pageManager.showPage('profile');
    this.overlay.hide();
  }

  pong = () => {
    this.pageManager.showPage('none');
    this.overlay.show();
  }

  gameRoute = () => {
    this.pageManager.showPage('none');
    this.pageManager.showGameElements();
    this.overlay.hide();
    
    if (this.game.state === State.MENU) {
      this.game.resetMatch(true);
    }
    this.game.startLoop();
  }
}