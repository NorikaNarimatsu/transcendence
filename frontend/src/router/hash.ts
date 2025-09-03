// frontend/src/router/hash.ts

// MODIFIED: Add 'signup' and 'profile' to Routes type
type Routes = { 
  welcome: () => void; 
  signup: () => void;   // NEW
  profile: () => void;  // NEW
  pongmenu: () => void; 
  ponggame: () => void;
};

let routes: Routes;

export function initRouter(r: Routes) {
  routes = r;
  addEventListener('hashchange', handle);
  handle();
}

// MODIFIED: Add new routes to goto function
export function goto(hash: '#/welcome' | '#/signup' | '#/profile' | '#/pongmenu' | '#/ponggame') {
  if (location.hash !== hash) location.hash = hash;
  else handle();
}

function handle() {
  const h = location.hash || '#/welcome';
  
  if (h === '#/welcome') routes.welcome();
  else if (h === '#/signup') routes.signup();    // NEW
  else if (h === '#/profile') routes.profile();  // NEW
  else if (h === '#/pong') routes.pongmenu();
  else routes.ponggame();
}