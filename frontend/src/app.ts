// frontend/src/app.ts
import { createDOM } from './ui/dom.js';
import { HUD } from './ui/hud.js';
import { Overlay } from './ui/overlay.js';
import { Keyboard } from './input/keyboard.js';
import { Game } from './engine/game.js';
import { initRouter, goto } from './router/hash.js';
import { State } from './types.js';
// frontend/src/app.ts

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

  // MODIFIED: Play button now goes to signup instead of menu
  dom.playButton.addEventListener('click', () => {
    goto('#/signup');
  });

  // NEW: Continue button on signup page
  dom.continueBtn.addEventListener('click', () => {
    const email = dom.emailInput.value;
    if (email) {
      // Store email for later use (you can add to localStorage or state)
      console.log('User email:', email);
      goto('#/profile');
    }
  });

  // NEW: Play Snake button (placeholder)
  dom.playSnakeBtn.addEventListener('click', () => {
    alert('Snake game coming soon!');
  });

  // NEW: Play Pong button goes to menu (name entry)
  dom.playPongBtn.addEventListener('click', () => {
    goto('#/menu');
  });

  initRouter({
    welcome() {
      // Hide everything
      dom.welcomePage.style.display = 'flex';
      dom.signupPage.style.display = 'none';
      dom.profilePage.style.display = 'none';
      overlay.hide();
      dom.wrap.style.display = 'none';
      dom.hud.style.display = 'none';
      dom.controls.style.display = 'none';
    },
    
    // NEW: Signup route
    signup() {
      dom.welcomePage.style.display = 'none';
      dom.signupPage.style.display = 'block';
      dom.profilePage.style.display = 'none';
      overlay.hide();
      dom.wrap.style.display = 'none';
      dom.hud.style.display = 'none';
      dom.controls.style.display = 'none';
    },
    
    // NEW: Profile route
    profile() {
      dom.welcomePage.style.display = 'none';
      dom.signupPage.style.display = 'none';
      dom.profilePage.style.display = 'flex';
      overlay.hide();
      dom.wrap.style.display = 'none';
      dom.hud.style.display = 'none';
      dom.controls.style.display = 'none';
    },
    
    menu() {
      dom.welcomePage.style.display = 'none';
      dom.signupPage.style.display = 'none';
      dom.profilePage.style.display = 'none';
      overlay.show();
      dom.wrap.style.display = 'none';
      dom.hud.style.display = 'none';
      dom.controls.style.display = 'none';
    },
    
    game() {
      dom.welcomePage.style.display = 'none';
      dom.signupPage.style.display = 'none';
      dom.profilePage.style.display = 'none';
      overlay.hide();
      dom.wrap.style.display = 'grid';
      dom.hud.style.display = 'flex';
      dom.controls.style.display = 'block';
      if (game.state === State.MENU) game.resetMatch(true);
      game.startLoop();
    }
  });

  if (!location.hash) goto('#/welcome');
}