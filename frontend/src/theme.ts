// frontend/src/theme.ts
export const colors = {
    primary:  '#1900A7', // bg start
    accent:   '#7A63FE', // bg end
    pink:     '#EC8FC7', // right paddle / accents
    blush:    '#FFC7E9', // left paddle / ball / accents
    text:     '#FFC7E9', // HUD text
    midline:  '#FFC7E9', // center dashed line
  };
  
  // Helper to make a nice gradient background
  export function makeBgGradient(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, colors.primary);
    g.addColorStop(1, colors.accent);
    return g;
  }

  