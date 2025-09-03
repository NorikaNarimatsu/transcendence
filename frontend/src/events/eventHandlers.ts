// frontend/src/events/handlers.ts

import { goto } from '../router/hash.js';
import { Overlay } from '../ui/overlay.js';
import { HUD } from '../ui/hud.js';
import { Game } from '../engine/game.js';
import type { DOMRefs } from '../ui/dom.js';

export class EventHandlers {
  constructor(
    private dom: DOMRefs,
    private overlay: Overlay,
    private hud: HUD,
    private game: Game
  ) {}

  init() {
    // Welcome page events
    this.dom.playButton.addEventListener('click', this.handlePlayClick);
    
    // Signup page events
    this.dom.continueBtn.addEventListener('click', this.handleContinueClick);
    
    // Profile page events
    this.dom.playSnakeBtn.addEventListener('click', this.handlePlaySnakeClick);
    this.dom.playPongBtn.addEventListener('click', this.handlePlayPongClick);
    
    // Overlay events - already handled by Overlay class constructor
  }

  private handlePlayClick = () => {
    goto('#/signup');
  }

  private handleContinueClick = () => {
    const email = this.dom.emailInput.value.trim();
    if (!email) {
      alert('Please enter a valid email');
      return;
    }
    
    // Store email (you can enhance this later)
    localStorage.setItem('userEmail', email);
    console.log('User email:', email);
    goto('#/profile');
  }

  private handlePlaySnakeClick = () => {
    alert('Snake game coming soon!');
  }

  private handlePlayPongClick = () => {
    goto('#/menu');
  }
}