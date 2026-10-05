import { prepararNota, escribirNota } from './notas.js';

const SIGNOS = '#%/$_:*@+=<>0123456789';
const DURACION = 1500;

function descodificar(n) {
  const final = n.dataset.text, dur = Math.max(260, final.length * 26);
  setTimeout(() => {
    const t0 = performance.now();
    const paso = (ahora) => {
      const p = Math.min(1, (ahora - t0) / dur), hechas = Math.floor(p * final.length);
      let s = final.slice(0, hechas);
      for (let i = hechas; i < final.length; i++) s += final[i] === ' ' ? ' ' : SIGNOS[(Math.random() * SIGNOS.length) | 0];
      n.textContent = s;
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }, +n.dataset.scramble);
}

// Pantalla de carga y trazado de la portada. Solo en la primera visita: el script del <head> pone .primera.
export function iniciarCarga(portada) {
  const html = document.documentElement;
  if (!html.classList.contains('primera')) return;
  const loader = document.getElementById('loader');
  const pct = loader.querySelector('.pct'), barra = loader.querySelector('.ld-bar i'), xy = loader.querySelector('.ld-xy');
  // en móvil el esquema horizontal está oculto y su nota no se puede medir
  const notas = [...portada.root.querySelectorAll('.nota')].filter((n) => n.ownerSVGElement.getClientRects().length).map(prepararNota);
  const textos = [...portada.root.querySelectorAll('[data-scramble]')];
  // se reserva el hueco con espacios duros (la fuente es monoespaciada): vaciar los textos cambiaría la altura de la hoja
  textos.forEach((n) => { n.dataset.text = n.textContent; n.textContent = n.textContent.replace(/\S/g, '\u00a0'); });

  let terminado = false;
  const terminar = () => {
    if (terminado) return;
    terminado = true;
    pct.textContent = '100';
    barra.style.width = '100%';
    loader.classList.add('out');
    html.classList.remove('primera');
    try { localStorage.setItem('cv-visto', '1'); } catch (e) { /* sin almacenamiento: la carga volverá a salir */ }
    textos.forEach(descodificar);
    notas.forEach(escribirNota);
    setTimeout(() => loader.classList.remove('out'), 900);
    removeEventListener('keydown', terminar);
    loader.removeEventListener('click', terminar);
  };

  document.fonts.ready.then(() => {
    // si las fuentes tardan tanto que el <head> ya quitó la carga, se termina sin animación de espera
    if (!html.classList.contains('primera')) return terminar();
    loader.classList.add('on');
    addEventListener('keydown', terminar, { passive: true });
    loader.addEventListener('click', terminar, { passive: true });
    const t0 = performance.now();
    const tic = (ahora) => {
      if (terminado) return;
      const p = Math.min(1, (ahora - t0) / DURACION), e = 1 - Math.pow(1 - p, 3);
      pct.textContent = String(Math.round(e * 100)).padStart(3, '0');
      barra.style.width = (e * 100) + '%';
      const temblor = (1 - e) * 40;
      xy.textContent = `X ${(innerWidth / 2 + (Math.random() - .5) * temblor).toFixed(1).padStart(6, '0')} · Y ${(innerHeight / 2 + (Math.random() - .5) * temblor).toFixed(1).padStart(6, '0')}`;
      if (p < 1) requestAnimationFrame(tic); else setTimeout(terminar, 180);
    };
    requestAnimationFrame(tic);
  });
}
