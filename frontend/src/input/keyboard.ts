export class Keyboard {
    private keys: Record<string, boolean> = {};
  
    constructor() {
      addEventListener('keydown', e => { this.keys[e.code] = true; });
      addEventListener('keyup',   e => { this.keys[e.code] = false; });
    }
    down(code: string) { return !!this.keys[code]; }
  }
  