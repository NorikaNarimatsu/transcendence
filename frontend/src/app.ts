/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   app.ts                                             :+:    :+:            */
/*                                                     +:+                    */
/*   By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                     */
/*                                                   +#+                      */
/*   Created: 2025/09/03 15:42:43 by nnarimatsu    #+#    #+#                 */
/*   Updated: 2025/09/03 18:15:27 by nnarimatsu    ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

import { createDOM } from './ui/dom.js';
import { inGameInfo } from './ui/inGameInfo.js';
import { Overlay } from './ui/overlay.js';
import { PageManager } from './ui/pageManager.js';
import { Keyboard } from './input/keyboard.js';
import { Game } from './engine/game.js';
import { RouteHandlers } from './router/routesHandlers.js';
import { EventHandlers } from './events/eventHandlers.js';
import { initRouter, goto } from './router/hash.js';

export function startApp() {
  // Initialize core components
  const dom = createDOM();
  const ingameinfo = new inGameInfo(dom);
  const keyboard = new Keyboard();
  const game = new Game(dom, ingameinfo, keyboard);
  game.init();

  // Initialize overlay with its callback
  const overlay = new Overlay(dom, (left, right) => {
    ingameinfo.setNames(left, right);
    overlay.hide();
    game.resetMatch(false);
    goto('#/ponggame');
  });

  // Initialize page manager
  const pages = {
    welcome: dom.welcomePage,
    signup: dom.signupPage,
    profile: dom.profilePage
  };
  const gameElements = {
    wrap: dom.wrap,
    ingameinfo: dom.ingameinfo,
    controls: dom.controls
  };
  const pageManager = new PageManager(pages, gameElements);

  // Initialize route handlers
  const routeHandlers = new RouteHandlers(pageManager, overlay, game);

  // Initialize event handlers
  const eventHandlers = new EventHandlers(dom, overlay, ingameinfo, game);
  eventHandlers.init();

  // Setup routing
  initRouter({
    welcome: routeHandlers.welcome,
    signup: routeHandlers.signup,
    profile: routeHandlers.profile,
    pongmenu: routeHandlers.pong,
    ponggame: routeHandlers.gameRoute
  });

  // Start on welcome page
  if (!location.hash) {
    goto('#/welcome');
  }
}