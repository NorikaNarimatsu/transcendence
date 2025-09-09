import type { DOMRefs } from './dom.js';

export class HUD {
  constructor(private dom: DOMRefs) {}

  setNames(left: string, right: string) {
    this.dom.leftName.textContent  = left;
    this.dom.rightName.textContent = right;
  }

  setScore(l: number, r: number) {
    this.dom.score.textContent = `${l} : ${r}`;
  }
}
