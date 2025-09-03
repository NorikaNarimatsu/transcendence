// frontend/src/router/hash.ts

// MODIFIED: Add 'signup' and 'profile' to Routes type
type Routes = { 
  welcome: () => void; 
  signup: () => void;   // NEW
  profile: () => void;  // NEW
  menu: () => void; 
  game: () => void;
};

let routes: Routes;

export function initRouter(r: Routes) {
  routes = r;
  addEventListener('hashchange', handle);
  handle();
}

// MODIFIED: Add new routes to goto function
export function goto(hash: '#/welcome' | '#/signup' | '#/profile' | '#/menu' | '#/game') {
  if (location.hash !== hash) location.hash = hash;
  else handle();
}

function handle() {
  const h = location.hash || '#/welcome';
  
  if (h === '#/welcome') routes.welcome();
  else if (h === '#/signup') routes.signup();    // NEW
  else if (h === '#/profile') routes.profile();  // NEW
  else if (h === '#/menu') routes.menu();
  else routes.game();
}