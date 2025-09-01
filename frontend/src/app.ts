// frontend/src/app.ts
import { createDOM } from './ui/dom.js';
import { HUD } from './ui/hud.js';
import { Overlay } from './ui/overlay.js';
import { Keyboard } from './input/keyboard.js';
import { Game } from './engine/game.js';
import { initRouter, goto } from './router/hash.js';
import { State } from './types.js';

export function startApp() {
  const dom = createDOM();
  const hud = new HUD(dom);
  const kb  = new Keyboard();

  const game = new Game(dom, hud, kb);
  game.init();

  const overlay = new Overlay(dom, (left, right) => {
    hud.setNames(left, right);
    overlay.hide();
    game.resetMatch(false);
    goto('#/game');
  });

  initRouter({
    menu() { overlay.show(); game.setState(State.MENU); },
    game() { overlay.hide(); if (game.state === State.MENU) game.resetMatch(true); game.startLoop(); }
  });

  if (!location.hash) goto('#/menu');
}
