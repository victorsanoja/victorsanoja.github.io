// El scroll es el del navegador. Solo se para durante la carga de la primera visita (al terminar, el visitante
// tiene que ver la portada) y con una captura ampliada abierta (no se mueve lo que queda detrás).
export function iniciarScroll() {
  const html = document.documentElement;
  const visor = document.getElementById('lightbox');
  const quieta = () => html.classList.contains('primera') || !visor.hidden;
  addEventListener('wheel', (e) => {
    // con Ctrl la rueda (y el pellizco del panel táctil) es zoom
    if (!e.ctrlKey && quieta()) e.preventDefault();
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || !quieta()) return;
    // Espacio sobre un botón lo pulsa
    if (e.key === ' ' && e.target.closest?.('button')) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) e.preventDefault();
  });
}
