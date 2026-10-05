// Imán y saltos entre hojas: solo con puntero fino (ratón o panel táctil), en escritorio y sin movimiento reducido.
export function actualizarIman() {
  const html = document.documentElement;
  const fino = !matchMedia('(pointer: coarse)').matches;
  const calma = matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.toggle('iman', fino && !calma && html.classList.contains('plano'));
}

// En el borde de una hoja más alta que la pantalla, el imán devolvía el scroll a ese borde y costaba pasar a la
// siguiente. Un gesto hacia fuera salta a la vecina: hacia abajo al principio de la siguiente, hacia arriba al final de la anterior.
export function iniciarSaltos(hojas) {
  const html = document.documentElement;
  const visor = document.getElementById('lightbox');
  let bloqueo = 0;
  const saltar = (dir, e) => {
    const y = scrollY, vh = innerHeight;
    const lista = hojas.map((h) => ({ top: h.root.offsetTop, end: h.root.offsetTop + h.root.offsetHeight }));
    const i = lista.findIndex((r) => y + vh / 2 >= r.top && y + vh / 2 < r.end);
    if (i < 0) return;
    let destino = null;
    if (dir > 0 && y + vh >= lista[i].end - 2 && i + 1 < lista.length) destino = lista[i + 1].top;
    if (dir < 0 && y <= lista[i].top + 2 && i > 0) destino = lista[i - 1].end - vh;
    if (destino === null) return;
    e.preventDefault();
    // la inercia del panel táctil sigue mandando eventos un rato: se ignoran mientras dura el salto
    bloqueo = performance.now() + 800;
    scrollTo({ top: destino });
  };
  // durante la carga de la primera visita la página no se mueve: al terminar, el visitante tiene que ver la portada
  const cargando = () => html.classList.contains('primera');
  addEventListener('wheel', (e) => {
    // con Ctrl la rueda (y el pellizco del panel táctil) es zoom, no un salto
    if (!e.deltaY || e.ctrlKey) return;
    if (cargando()) { e.preventDefault(); return; }
    if (!html.classList.contains('iman') || !visor.hidden) return;
    if (performance.now() < bloqueo) { e.preventDefault(); return; }
    saltar(Math.sign(e.deltaY), e);
  }, { passive: false });
  addEventListener('keydown', (e) => {
    const dir = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 }[e.key];
    if (!dir || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    // Espacio sobre un botón lo pulsa
    if (e.key === ' ' && e.target.closest?.('button')) return;
    if (cargando()) { e.preventDefault(); return; }
    if (html.classList.contains('iman') && visor.hidden) saltar(dir, e);
  });
}
