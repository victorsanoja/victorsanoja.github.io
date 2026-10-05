// Visor de capturas: clic para verlas en grande y en su color real; se cierra con otro clic o con Esc.
export function iniciarCapturas() {
  const visor = document.getElementById('lightbox'), img = visor.appendChild(document.createElement('img'));
  // con el visor abierto, el resto de la página no recibe el foco ni los clics (aria-modal solo lo anuncia)
  const pagina = document.querySelector('main');
  let origen = null;
  const cerrar = () => { visor.hidden = true; pagina.inert = false; origen?.focus(); };
  document.querySelectorAll('.shot-btn').forEach((b) => b.addEventListener('click', () => {
    const real = b.querySelector('.real');
    img.src = real.src;
    img.alt = real.alt;
    origen = b;
    pagina.inert = true;
    visor.hidden = false;
    visor.focus();
  }, { passive: true }));
  visor.tabIndex = -1;
  visor.addEventListener('click', cerrar, { passive: true });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !visor.hidden) cerrar(); }, { passive: true });
}
