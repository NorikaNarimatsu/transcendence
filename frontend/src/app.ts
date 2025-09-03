// frontend/src/app.ts

import { createDOM } from './ui/dom.js';
import { HUD } from './ui/hud.js';
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
  const hud = new HUD(dom);
  const keyboard = new Keyboard();
  const game = new Game(dom, hud, keyboard);
  game.init();

  // Initialize overlay with its callback
  const overlay = new Overlay(dom, (left, right) => {
    hud.setNames(left, right);
    overlay.hide();
    game.resetMatch(false);
    goto('#/game');
  });

  // Initialize page manager
  const pages = {
    welcome: dom.welcomePage,
    signup: dom.signupPage,
    profile: dom.profilePage
  };
  const gameElements = {
    wrap: dom.wrap,
    hud: dom.hud,
    controls: dom.controls
  };
  const pageManager = new PageManager(pages, gameElements);

  // Initialize route handlers
  const routeHandlers = new RouteHandlers(pageManager, overlay, game);

  // Initialize event handlers
  const eventHandlers = new EventHandlers(dom, overlay, hud, game);
  eventHandlers.init();

  // Setup routing
  initRouter({
    welcome: routeHandlers.welcome,
    signup: routeHandlers.signup,
    profile: routeHandlers.profile,
    menu: routeHandlers.menu,
    game: routeHandlers.gameRoute
  });

  // Start on welcome page
  if (!location.hash) {
    goto('#/welcome');
  }
}