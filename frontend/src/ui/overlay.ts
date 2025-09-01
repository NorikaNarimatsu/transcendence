import type { DOMRefs } from './dom.js';

export class Overlay {
  constructor(private dom: DOMRefs, onStart: (left: string, right: string) => void) {
    dom.startBtn.addEventListener('click', () => {
      const left  = (dom.leftInput.value  || 'LEFT').trim().slice(0, 16);
      const right = (dom.rightInput.value || 'RIGHT').trim().slice(0, 16);
      onStart(left || 'LEFT', right || 'RIGHT');
    });
  }
  show() { this.dom.overlay.style.display = 'grid'; }
  hide() { this.dom.overlay.style.display = 'none'; }
}
