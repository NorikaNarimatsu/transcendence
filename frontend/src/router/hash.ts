type Routes = { menu: () => void; game: () => void };

let routes: Routes;

export function initRouter(r: Routes) {
  routes = r;
  addEventListener('hashchange', handle);
  handle();
}

export function goto(hash: '#/menu' | '#/game') {
  if (location.hash !== hash) location.hash = hash;
  else handle(); // same route -> re-run handler
}

function handle() {
  const h = location.hash || '#/menu';
  if (h === '#/menu') routes.menu();
  else routes.game();
}
