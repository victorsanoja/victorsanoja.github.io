import { U } from './reticula.js';

const RADIO = 140, INTENSIDAD = .2, APAGADO = .93;

// Luz del cursor sobre las líneas de la retícula, marcadores de las reglas y lectura de coordenadas.
export function iniciarLuz(hojas) {
  const nada = { redibujar() {} };
  if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return nada;
  const html = document.documentElement;
  const canvas = document.getElementById('light'), ctx = canvas.getContext('2d');
  const lit = new Map();
  const key = (s, i, j) => s + ',' + i + ',' + j;
  let CW = 0, CH = 0, tx = -9999, ty = -9999, cx = -9999, cy = -9999, dentro = false, raf = null;
  // la portada no se ilumina mientras está sin dibujar
  const oculta = (si) => si === 0 && html.classList.contains('primera');

  const ajustarCanvas = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    CW = innerWidth; CH = innerHeight;
    canvas.width = CW * dpr; canvas.height = CH * dpr;
    canvas.style.width = CW + 'px'; canvas.style.height = CH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const tramo = (x1, y1, x2, y2, a) => {
    if (a < .01) return;
    ctx.globalAlpha = a * INTENSIDAD;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const nivel = (s, i, j) => { const n = lit.get(key(s, i, j)); return n ? n.a : 0; };

  function fotograma() {
    let cambio = false;
    if (Math.abs(tx - cx) > .3 || Math.abs(ty - cy) > .3) { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cambio = true; }
    else { cx = tx; cy = ty; }
    for (const n of lit.values()) n.p = n.a;
    if (dentro) hojas.forEach((h, si) => {
      if (oculta(si)) return;
      const F = h.F, gx = cx + scrollX - F.x, gy = cy + scrollY - F.y;
      if (gx < -RADIO || gy < -RADIO || gx > F.w + RADIO || gy > F.h + RADIO) return;
      const iMax = F.w / U, jMax = F.h / U;
      for (let j = Math.max(0, Math.floor((gy - RADIO) / U)); j <= Math.min(jMax, Math.ceil((gy + RADIO) / U)); j++) {
        for (let i = Math.max(0, Math.floor((gx - RADIO) / U)); i <= Math.min(iMax, Math.ceil((gx + RADIO) / U)); i++) {
          const dx = i * U - gx, dy = j * U - gy, d2 = dx * dx + dy * dy;
          if (d2 >= RADIO * RADIO) continue;
          const t = 1 - Math.sqrt(d2) / RADIO, brillo = t * t;
          if (brillo * APAGADO < .004) continue;
          const k = key(si, i, j), n = lit.get(k);
          if (!n) lit.set(k, { s: si, i, j, a: brillo, p: 0 }); else if (brillo > n.a) n.a = brillo;
        }
      }
    });
    for (const [k, n] of lit) {
      n.a *= APAGADO;
      if (n.a < .004) { lit.delete(k); cambio = true; continue; }
      if (n.a !== n.p) cambio = true;
    }
    ctx.clearRect(0, 0, CW, CH);
    ctx.save();
    ctx.beginPath();
    hojas.forEach((h, si) => { if (!oculta(si)) ctx.rect(h.F.x - scrollX, h.F.y - scrollY, h.F.w + 1, h.F.h + 1); });
    ctx.clip();
    ctx.strokeStyle = ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (const n of lit.values()) {
      const F = hojas[n.s].F, x = F.x - scrollX + n.i * U + .5, y = F.y - scrollY + n.j * U + .5;
      tramo(x, y, x + U, y, (n.a + nivel(n.s, n.i + 1, n.j)) / 2);
      tramo(x, y, x, y + U, (n.a + nivel(n.s, n.i, n.j + 1)) / 2);
      if (!lit.has(key(n.s, n.i - 1, n.j))) tramo(x - U, y, x, y, n.a / 2);
      if (!lit.has(key(n.s, n.i, n.j - 1))) tramo(x, y - U, x, y, n.a / 2);
      ctx.globalAlpha = Math.min(1, n.a * INTENSIDAD * 1.2);
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
    ctx.restore();
    raf = cambio ? requestAnimationFrame(fotograma) : null;
  }
  const pedir = () => { if (!raf) raf = requestAnimationFrame(fotograma); };

  // también al hacer scroll, porque la hoja se mueve bajo el cursor
  const seguir = () => {
    for (const h of hojas) {
      const gx = Math.round(tx + scrollX - h.F.x), gy = Math.round(ty + scrollY - h.F.y);
      const sobre = dentro && gx >= 0 && gy >= 0 && gx <= h.F.w && gy <= h.F.h;
      h.coords.textContent = sobre ? `X ${String(gx).padStart(4, '0')} · Y ${String(gy).padStart(4, '0')} px` : 'X ---- · Y ---- px';
      h.marcaX.classList.toggle('on', sobre);
      h.marcaY.classList.toggle('on', sobre);
      if (sobre) { h.marcaX.style.transform = `translateX(${gx}px)`; h.marcaY.style.transform = `translateY(${gy}px)`; }
    }
  };

  ajustarCanvas();
  addEventListener('scroll', () => { seguir(); pedir(); }, { passive: true });
  addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!dentro) { cx = tx; cy = ty; dentro = true; }
    seguir();
    pedir();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { dentro = false; seguir(); pedir(); }, { passive: true });
  return { redibujar() { ajustarCanvas(); pedir(); } };
}
