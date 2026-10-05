const NS = 'http://www.w3.org/2000/svg';
const MS_POR_LETRA = 30, PAUSA = 70;
let secuencia = 0;

// Anotación a mano: la tinta avanza palabra a palabra con un punto de pluma y al final se dibuja la flecha.
// Se prepara antes de quitar .primera: los retardos de la flecha deben estar puestos antes de que empiece su transición.
export function prepararNota(nota) {
  const svg = nota.ownerSVGElement;
  const texto = nota.querySelector('text');
  const [curva, punta] = nota.querySelectorAll('.hint-arrow');
  const x = +texto.getAttribute('x'), y = +texto.getAttribute('y');
  const frase = texto.textContent, palabras = frase.split(' ');
  const total = frase.length * MS_POR_LETRA + (palabras.length - 1) * PAUSA;
  const retardo = +nota.dataset.retardo;
  const id = 'nota-' + (++secuencia);
  const defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
  const clip = document.createElementNS(NS, 'clipPath');
  clip.id = id;
  const rect = clip.appendChild(document.createElementNS(NS, 'rect'));
  Object.entries({ x: x - 4, y: y - 30, width: 0, height: 40 }).forEach(([k, v]) => rect.setAttribute(k, v));
  defs.appendChild(clip);
  texto.setAttribute('clip-path', `url(#${id})`);
  const pluma = texto.parentNode.appendChild(document.createElementNS(NS, 'circle'));
  pluma.setAttribute('r', 1.6);
  pluma.setAttribute('class', 'pen');
  // la punta es otro trazo que empieza al acabar la curva: el discontinuo se reinicia en cada subtrazo y saldría al principio
  const a0 = (retardo + total + 150) / 1000;
  curva.style.cssText = `--dur:.5s;--d:${a0}s`;
  punta.style.cssText = `--dur:.15s;--d:${(a0 + .45).toFixed(3)}s`;
  return { texto, rect, pluma, x, y, frase, palabras, total, retardo };
}

export function escribirNota({ texto, rect, pluma, x, y, frase, palabras, total, retardo }) {
  // si se pasó a la versión vertical durante la carga, su esquema está oculto y no se puede medir: se muestra entera
  if (!texto.getClientRects().length) { texto.removeAttribute('clip-path'); return; }
  const b = texto.getBBox(), largo = b.x + b.width - (x - 4) + 6;
  setTimeout(() => {
    const t0 = performance.now();
    pluma.style.opacity = 1;
    const paso = (ahora) => {
      let queda = ahora - t0, letras = 0;
      for (const p of palabras) {
        const tp = (p.length + 1) * MS_POR_LETRA;
        if (queda <= tp) { letras += queda / MS_POR_LETRA; break; }
        queda -= tp + PAUSA; letras += p.length + 1;
        if (queda < 0) break;
      }
      // el primer fotograma puede llevar una hora anterior a t0: sin el Math.max el ancho saldría negativo
      const avance = Math.max(0, Math.min(1, letras / frase.length));
      rect.setAttribute('width', avance * largo);
      pluma.setAttribute('cx', x - 4 + avance * largo - 4);
      pluma.setAttribute('cy', y - 7 + Math.sin(ahora / 38) * 4);
      if (ahora - t0 < total) requestAnimationFrame(paso);
      else { rect.setAttribute('width', largo); pluma.style.opacity = 0; }
    };
    requestAnimationFrame(paso);
  }, retardo);
}
