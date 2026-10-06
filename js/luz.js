import { U } from './reticula.js';

const RADIO = 140, INTENSIDAD = .2, APAGADO = .93, NIVELES = 32;

// Luz del cursor sobre las líneas de la retícula, marcadores de las reglas y lectura de coordenadas.
export function iniciarLuz(hojas) {
  const nada = { redibujar() {} };
  if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return nada;
  const html = document.documentElement;
  const canvas = document.getElementById('light'), ctx = canvas.getContext('2d');
  const lit = new Map();
  // clave numérica: con cadenas, cada fotograma creaba cientos que luego había que recoger
  const key = (s, i, j) => s * 1e8 + j * 1e4 + i;
  // trazos y puntos agrupados por intensidad: unas pocas órdenes de dibujo por fotograma en vez de una por segmento
  const cubos = () => Array.from({ length: Math.ceil(NIVELES * 1.2) + 1 }, () => []);
  const lineas = cubos(), puntos = cubos();
  const lectura = hojas.map((h) => ({ texto: h.coords.textContent, sobre: false, gx: NaN, gy: NaN }));
  let tx = -9999, ty = -9999, cx = -9999, cy = -9999, dentro = false, raf = null, antes = 0, caja = null;
  // la portada no se ilumina mientras está sin dibujar
  const oculta = (si) => si === 0 && html.classList.contains('primera');

  const ajustarCanvas = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2), CW = innerWidth, CH = innerHeight;
    canvas.width = CW * dpr; canvas.height = CH * dpr;
    canvas.style.width = CW + 'px'; canvas.style.height = CH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    caja = null;
  };
  const tramo = (x1, y1, x2, y2, a) => { if (a >= .5 / NIVELES) lineas[Math.round(a * NIVELES)].push(x1, y1, x2, y2); };
  const nivel = (s, i, j) => { const n = lit.get(key(s, i, j)); return n ? n.a : 0; };

  // coordenadas y marcadores: solo se toca la página cuando algo cambia
  const leer = (sx, sy) => hojas.forEach((h, si) => {
    const l = lectura[si], gx = Math.round(tx + sx - h.F.x), gy = Math.round(ty + sy - h.F.y);
    const sobre = dentro && gx >= 0 && gy >= 0 && gx <= h.F.w && gy <= h.F.h;
    const texto = sobre ? `X ${String(gx).padStart(4, '0')} · Y ${String(gy).padStart(4, '0')} px` : 'X ---- · Y ---- px';
    if (texto !== l.texto) h.coords.textContent = l.texto = texto;
    if (sobre !== l.sobre) {
      h.marcaX.classList.toggle('on', sobre);
      h.marcaY.classList.toggle('on', sobre);
      l.sobre = sobre;
    }
    if (sobre && gx !== l.gx) h.marcaX.style.transform = `translateX(${l.gx = gx}px)`;
    if (sobre && gy !== l.gy) h.marcaY.style.transform = `translateY(${l.gy = gy}px)`;
  });

  function fotograma(ahora) {
    // la posición del scroll se lee una sola vez y antes de escribir nada: leerla entre escrituras obliga a recalcular la página
    const sx = scrollX, sy = scrollY;
    // fotogramas de 60 Hz transcurridos: así la luz sigue al cursor y se apaga igual de rápido en un equipo lento
    const f = ahora > antes ? Math.min(4, (ahora - antes) / (1000 / 60)) : 1;
    antes = ahora;
    leer(sx, sy);
    let cambio = false;
    if (Math.abs(tx - cx) > .3 || Math.abs(ty - cy) > .3) {
      const k = 1 - Math.pow(.8, f);
      cx += (tx - cx) * k; cy += (ty - cy) * k; cambio = true;
    } else { cx = tx; cy = ty; }
    for (const n of lit.values()) n.p = n.a;
    if (dentro) hojas.forEach((h, si) => {
      if (oculta(si)) return;
      const F = h.F, gx = cx + sx - F.x, gy = cy + sy - F.y;
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
    const apagado = Math.pow(APAGADO, f);
    for (const [k, n] of lit) {
      n.a *= apagado;
      if (n.a < .004) { lit.delete(k); cambio = true; continue; }
      if (n.a !== n.p) cambio = true;
    }

    // solo se borra lo que se pintó en el fotograma anterior
    if (caja) ctx.clearRect(caja[0], caja[1], caja[2] - caja[0], caja[3] - caja[1]);
    caja = null;
    if (lit.size) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const n of lit.values()) {
        const F = hojas[n.s].F, x = F.x - sx + n.i * U + .5, y = F.y - sy + n.j * U + .5;
        tramo(x, y, x + U, y, (n.a + nivel(n.s, n.i + 1, n.j)) / 2);
        tramo(x, y, x, y + U, (n.a + nivel(n.s, n.i, n.j + 1)) / 2);
        if (!lit.has(key(n.s, n.i - 1, n.j))) tramo(x - U, y, x, y, n.a / 2);
        if (!lit.has(key(n.s, n.i, n.j - 1))) tramo(x, y - U, x, y, n.a / 2);
        puntos[Math.round(n.a * 1.2 * NIVELES)].push(x - 1, y - 1);
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      caja = [x0 - U - 2, y0 - U - 2, x1 + U + 2, y1 + U + 2];
      ctx.save();
      ctx.beginPath();
      hojas.forEach((h, si) => { if (!oculta(si)) ctx.rect(h.F.x - sx, h.F.y - sy, h.F.w + 1, h.F.h + 1); });
      ctx.clip();
      ctx.strokeStyle = ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (let v = 1; v < lineas.length; v++) {
        const c = lineas[v], p = puntos[v];
        ctx.globalAlpha = v / NIVELES * INTENSIDAD;
        if (c.length) {
          ctx.beginPath();
          for (let q = 0; q < c.length; q += 4) { ctx.moveTo(c[q], c[q + 1]); ctx.lineTo(c[q + 2], c[q + 3]); }
          ctx.stroke();
          c.length = 0;
        }
        for (let q = 0; q < p.length; q += 2) ctx.fillRect(p[q], p[q + 1], 2, 2);
        p.length = 0;
      }
      lineas[0].length = puntos[0].length = 0;
      ctx.restore();
    }
    raf = cambio ? requestAnimationFrame(fotograma) : null;
  }
  const pedir = () => {
    if (raf) return;
    antes = performance.now();
    raf = requestAnimationFrame(fotograma);
  };

  ajustarCanvas();
  // también al hacer scroll, porque la hoja se mueve bajo el cursor
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!dentro) { cx = tx; cy = ty; dentro = true; }
    pedir();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { dentro = false; pedir(); }, { passive: true });
  return { redibujar() { ajustarCanvas(); pedir(); } };
}
