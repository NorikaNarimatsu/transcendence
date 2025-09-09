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
  };
  
  export function createDOM(): DOMRefs {
    const canvas    = document.getElementById('game') as HTMLCanvasElement;
    const ctx       = canvas.getContext('2d') as CanvasRenderingContext2D;
    const overlay   = document.getElementById('overlay') as HTMLElement;
    const leftInput = document.getElementById('leftInput') as HTMLInputElement;
    const rightInput= document.getElementById('rightInput') as HTMLInputElement;
    const startBtn  = document.getElementById('startBtn') as HTMLButtonElement;
    const score     = document.getElementById('score') as HTMLElement;
    const leftName  = document.getElementById('leftName') as HTMLElement;
    const rightName = document.getElementById('rightName') as HTMLElement;
  
    if (!canvas || !ctx) throw new Error('Canvas not found');
  
    return { canvas, ctx, overlay, leftInput, rightInput, startBtn, score, leftName, rightName };
  }
  