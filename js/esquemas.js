// Esquema de la portada: al pasar el ratón por una habilidad o un proyecto se iluminan sus conexiones.
export function iniciarEsquemas() {
  if (matchMedia('(pointer: coarse)').matches) return;
  const svg = document.querySelector('.schema.portada.h');
  const encender = (s, p) => {
    svg.classList.add('focus');
    svg.querySelectorAll('.edge, .signal').forEach((e) => e.classList.toggle('hot', s ? e.dataset.s === s : e.dataset.p === p));
    const ps = new Set(), ss = new Set();
    svg.querySelectorAll('.edge.hot').forEach((e) => { ps.add(e.dataset.p); ss.add(e.dataset.s); });
    svg.querySelectorAll('.node').forEach((n) => n.classList.toggle('hot', ss.has(n.dataset.s) || ps.has(n.dataset.p)));
  };
  const apagar = () => {
    svg.classList.remove('focus');
    svg.querySelectorAll('.hot').forEach((h) => h.classList.remove('hot'));
  };
  svg.querySelectorAll('.node').forEach((n) => {
    n.addEventListener('mouseenter', () => encender(n.dataset.s, n.dataset.p), { passive: true });
    n.addEventListener('mouseleave', apagar, { passive: true });
  });
}

// Los paquetes del flujo se mueven sin parar: fuera de la pantalla se paran, para no gastar procesador en algo que no se ve.
export function pausarFueraDeVista() {
  const vigia = new IntersectionObserver((vistas) => vistas.forEach((v) => v.target.classList.toggle('parado', !v.isIntersecting)));
  new Set([...document.querySelectorAll('.packet')].map((p) => p.ownerSVGElement)).forEach((s) => vigia.observe(s));
}
