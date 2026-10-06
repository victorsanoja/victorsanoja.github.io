import { U } from './reticula.js';

const PAUSA = 150; // ms sin eventos de la rueda que separan un gesto del siguiente
const SUAVIDAD = 4.5; // por segundo: equivale a acercarse un 7,5 % por fotograma a 60 Hz, y va igual de rápido a 30 o a 144
const FLECHA = 4 * U;

// Imán entre hojas: solo con puntero fino (ratón o panel táctil), en escritorio y sin movimiento reducido.
export function actualizarIman() {
  const html = document.documentElement;
  const fino = !matchMedia('(pointer: coarse)').matches;
  const calma = matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.toggle('iman', fino && !calma && html.classList.contains('plano'));
}

// Scroll suave con la rueda: la página se acerca poco a poco a donde manda la rueda, sin escalones.
// Con el imán, además, cada hoja se recorre entera y un gesto hacia fuera desde su borde salta a la vecina:
// hacia abajo al principio de la siguiente, hacia arriba al final de la anterior.
export function iniciarScroll(hojas) {
  const html = document.documentElement;
  const visor = document.getElementById('lightbox');
  const tactil = matchMedia('(pointer: coarse)'), calma = matchMedia('(prefers-reduced-motion: reduce)');
  let y = 0, objetivo = 0, antes = 0, raf = 0, ultimo = -Infinity, gastado = false;

  const paso = (ahora) => {
    // tras un fotograma muy lento se avanza como mucho lo de 0,1 s: si no, la página daría un salto
    const dt = ahora > antes ? Math.min(.1, (ahora - antes) / 1000) : 1 / 60;
    antes = ahora;
    y += (objetivo - y) * (1 - Math.exp(-SUAVIDAD * dt));
    if (Math.abs(objetivo - y) < .5) y = objetivo;
    scrollTo({ top: y, behavior: 'instant' });
    raf = y === objetivo ? 0 : requestAnimationFrame(paso);
  };
  const mover = (destino) => {
    objetivo = Math.max(0, Math.min(html.scrollHeight - html.clientHeight, destino));
    if (!raf) { antes = performance.now(); raf = requestAnimationFrame(paso); }
  };
  // si otra cosa mueve la página (la barra de scroll, un enlace, buscar en la página), manda ella
  addEventListener('scroll', () => {
    if (raf && Math.abs(scrollY - y) < 1) return;
    cancelAnimationFrame(raf);
    raf = 0;
    y = objetivo = scrollY;
  }, { passive: true });

  const desplazar = (delta, nuevo) => {
    if (!raf) y = objetivo = scrollY;
    if (nuevo) gastado = false;
    if (gastado) return;
    if (!html.classList.contains('iman')) return mover(objetivo + delta);
    const vh = html.clientHeight;
    const tramos = hojas.map(({ root }) => ({ top: root.offsetTop, fin: root.offsetTop + Math.max(0, root.offsetHeight - vh) }));
    const i = Math.max(0, tramos.findLastIndex((t) => t.top <= objetivo + vh / 2));
    const { top, fin } = tramos[i];
    // la inercia del panel táctil sigue mandando eventos un rato: el resto del gesto que salta se ignora
    if (delta > 0 && objetivo >= fin - 1) { gastado = true; if (i + 1 < tramos.length) mover(tramos[i + 1].top); return; }
    if (delta < 0 && objetivo <= top + 1) { gastado = true; if (i > 0) mover(tramos[i - 1].fin); return; }
    const destino = Math.min(fin, Math.max(top, objetivo + delta));
    // el gesto que llega al borde se queda ahí: para pasar de hoja hace falta otro, y así se ve el final de cada una
    gastado = destino === fin || destino === top;
    mover(destino);
  };

  // durante la carga de la primera visita la página no se mueve (al terminar, el visitante tiene que ver la portada),
  // y con una captura ampliada tampoco se mueve lo que queda detrás
  const quieta = () => html.classList.contains('primera') || !visor.hidden;
  addEventListener('wheel', (e) => {
    // deltaY antes que deltaMode: si se mira primero deltaMode, Firefox cuenta en líneas en vez de en píxeles
    const dy = e.deltaY;
    // con Ctrl la rueda (y el pellizco del panel táctil) es zoom, y un gesto horizontal no mueve esta página
    if (e.ctrlKey || !dy || Math.abs(e.deltaX) > Math.abs(dy)) return;
    if (quieta()) { e.preventDefault(); return; }
    if (tactil.matches || calma.matches) return;
    e.preventDefault();
    // la hora del evento y no la de ahora: si el equipo va cargado, los eventos se atienden a golpes y la pausa no se notaría
    const nuevo = e.timeStamp - ultimo > PAUSA;
    ultimo = e.timeStamp;
    desplazar(dy * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? html.clientHeight : 1), nuevo);
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const pagina = html.clientHeight - FLECHA;
    const d = e.shiftKey ? { ' ': -pagina }[e.key] : { ArrowDown: FLECHA, ArrowUp: -FLECHA, PageDown: pagina, PageUp: -pagina, ' ': pagina }[e.key];
    if (!d) return;
    // Espacio sobre un botón lo pulsa
    if (e.key === ' ' && e.target.closest?.('button')) return;
    if (quieta()) { e.preventDefault(); return; }
    // sin imán, el navegador ya mueve la página con suavidad
    if (!html.classList.contains('iman')) return;
    e.preventDefault();
    desplazar(d, !e.repeat);
  });
}
