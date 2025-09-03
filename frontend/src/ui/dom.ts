// frontend/src/ui/dom.ts
import { overlayHTML, welcomePageHTML, signupPageHTML, profilePageHTML } from './templates.js';

export type DOMRefs = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  overlay: HTMLElement;
  leftInput: HTMLInputElement;
  rightInput: HTMLInputElement;
  startBtn: HTMLButtonElement;
  score: HTMLElement;
  leftName: HTMLElement;
  rightName: HTMLElement;
  welcomePage: HTMLElement;
  playButton: HTMLButtonElement;
  wrap: HTMLElement;      // ADDED
  hud: HTMLElement;       // ADDED
  controls: HTMLElement;  // ADDED
  signupPage: HTMLElement;
  emailInput: HTMLInputElement;
  continueBtn: HTMLButtonElement;
  profilePage: HTMLElement;
  playSnakeBtn: HTMLButtonElement;
  playPongBtn: HTMLButtonElement;
};

export function createDOM(): DOMRefs {
  // --- MODIFIED SECTION START ---

  // Step 1: Inject the modular HTML into the page
  document.body.insertAdjacentHTML('beforeend', overlayHTML);
  document.body.insertAdjacentHTML('beforeend', welcomePageHTML);
  document.body.insertAdjacentHTML('beforeend', signupPageHTML);    // NEW
  document.body.insertAdjacentHTML('beforeend', profilePageHTML);   // NEW

  // Step 2: Now that the HTML exists, find all the elements
  const canvas     = document.getElementById('game') as HTMLCanvasElement;
  const ctx        = canvas.getContext('2d') as CanvasRenderingContext2D;
  const overlay    = document.getElementById('overlay') as HTMLElement;
  const leftInput  = document.getElementById('leftInput') as HTMLInputElement;
  const rightInput = document.getElementById('rightInput') as HTMLInputElement;
  const startBtn   = document.getElementById('startBtn') as HTMLButtonElement;
  const score      = document.getElementById('score') as HTMLElement;
  const leftName   = document.getElementById('leftName') as HTMLElement;
  const rightName  = document.getElementById('rightName') as HTMLElement;
  const welcomePage = document.getElementById('welcome-page') as HTMLElement;
  const playButton  = document.getElementById('play-game-btn') as HTMLButtonElement;
  const wrap     = document.getElementById('wrap') as HTMLElement;
  const hud      = document.getElementById('hud') as HTMLElement;
  const controls = document.getElementById('controls') as HTMLElement;
  const signupPage = document.getElementById('signup-page') as HTMLElement;
  const emailInput = document.getElementById('email-input') as HTMLInputElement;
  const continueBtn = document.getElementById('continue-btn') as HTMLButtonElement;
  const profilePage = document.getElementById('profile-page') as HTMLElement;
  const playSnakeBtn = document.getElementById('play-snake-btn') as HTMLButtonElement;
  const playPongBtn = document.getElementById('play-pong-btn') as HTMLButtonElement;

  if (!canvas || !ctx || !welcomePage || !playButton || !signupPage || !profilePage)
    throw new Error('Core DOM element not found');

  return { canvas, ctx, overlay, leftInput, rightInput, startBtn, score, leftName, rightName, welcomePage, playButton, wrap, hud, controls,     signupPage, emailInput, continueBtn,
    profilePage, playSnakeBtn, playPongBtn };
}