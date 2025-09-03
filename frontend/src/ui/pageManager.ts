/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   pageManager.ts                                     :+:    :+:            */
/*                                                     +:+                    */
/*   By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                     */
/*                                                   +#+                      */
/*   Created: 2025/09/03 18:31:58 by nnarimatsu    #+#    #+#                 */
/*   Updated: 2025/09/03 18:51:39 by nnarimatsu    ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// frontend/src/ui/pageManager.ts

export class PageManager {
    private pages: Map<string, HTMLElement> = new Map();
    private gameElements: { wrap: HTMLElement; ingameinfo: HTMLElement; controls: HTMLElement };
  
    constructor(
      pages: { [key: string]: HTMLElement },
      gameElements: { wrap: HTMLElement; ingameinfo: HTMLElement; controls: HTMLElement }
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
        // Fix: Add signup to the flex display list
        const displayStyle = pageName === 'welcome' || pageName === 'profile' || pageName === 'signup' ? 'flex' : 'block';
        page.style.display = displayStyle;
      }
    }
  
    showGameElements() {
      this.gameElements.wrap.style.display = 'grid';
      this.gameElements.ingameinfo.style.display = 'flex';
      this.gameElements.controls.style.display = 'block';
    }
  
    hideGameElements() {
      this.gameElements.wrap.style.display = 'none';
      this.gameElements.ingameinfo.style.display = 'none';
      this.gameElements.controls.style.display = 'none';
    }
  }