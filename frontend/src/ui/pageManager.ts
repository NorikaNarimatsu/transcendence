// frontend/src/ui/pageManager.ts

export class PageManager {
    private pages: Map<string, HTMLElement> = new Map();
    private gameElements: { wrap: HTMLElement; hud: HTMLElement; controls: HTMLElement };
  
    constructor(
      pages: { [key: string]: HTMLElement },
      gameElements: { wrap: HTMLElement; hud: HTMLElement; controls: HTMLElement }
    ) {
      // Store all pages
      Object.entries(pages).forEach(([name, element]) => {
        this.pages.set(name, element);
      });
      this.gameElements = gameElements;
    }
  
    showPage(pageName: string) {
      // Hide all pages first
      this.pages.forEach(page => {
        page.style.display = 'none';
      });
      
      // Hide game elements by default
      this.hideGameElements();
      
      // Show the requested page with appropriate display style
      const page = this.pages.get(pageName);
      if (page) {
        const displayStyle = pageName === 'welcome' || pageName === 'profile' ? 'flex' : 'block';
        page.style.display = displayStyle;
      }
    }
  
    showGameElements() {
      this.gameElements.wrap.style.display = 'grid';
      this.gameElements.hud.style.display = 'flex';
      this.gameElements.controls.style.display = 'block';
    }
  
    hideGameElements() {
      this.gameElements.wrap.style.display = 'none';
      this.gameElements.hud.style.display = 'none';
      this.gameElements.controls.style.display = 'none';
    }
  }