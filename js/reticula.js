export const U = 24;
const MAYOR = 5;
const COMPOSICION = 54; // columnas del bloque principal en escritorio: 23 de texto + 4 de aire + 27 de esquema
const NS = 'http://www.w3.org/2000/svg';

const colocar = (n, col, cols, fila, filas) => {
  n.style.gridColumn = `${col + 1} / span ${cols}`;
  n.style.gridRow = `${fila + 1} / span ${filas}`;
};

// Composición de escritorio de cada hoja: filas mínimas y posición de cada pieza (columna, ancho, fila, alto).
// cl y cr son la primera y la última columna del bloque principal; los esquemas anchos (52 columnas) se centran entre ellas.
const PLANOS = {
  'hoja-1': {
    filas: 33,
    colocar(k, { R, cl, cr }) {
      const rt = 3 + Math.max(0, Math.floor((R - 6 - 3 - 23) / 2));
      colocar(k('label'), cl, 23, rt, 1);
      colocar(k('name'), cl, 23, rt + 2, 6);
      colocar(k('cota'), cl, 23, rt + 8, 1);
      colocar(k('role'), cl, 20, rt + 10, 3);
      colocar(k('spec'), cl, 20, rt + 14, 4);
      colocar(k('ctas'), cl, 16, rt + 19, 1);
      colocar(k('schema'), cr - 27, 27, rt, 23);
    },
  },
  'hoja-2': {
    filas: 81,
    colocar(k, { cl, cr }) {
      const L = cl, RC = cr - 27, fl = L + Math.max(0, Math.floor((cr - cl - 52) / 2));
      colocar(k('label'), L, 23, 3, 1);
      colocar(k('title'), L, 23, 5, 3);
      colocar(k('cota'), L, 23, 8, 1);
      colocar(k('summary'), L, 20, 10, 4);
      colocar(k('figLabel'), RC, 27, 3, 1);
      colocar(k('figures'), RC, 27, 5, 4);
      colocar(k('ficha'), RC, 27, 10, 5);
      colocar(k('flowLabel'), fl, 23, 16, 1);
      colocar(k('flow'), fl, 52, 18, 13);
      colocar(k('retoLabel'), L, 23, 33, 1);
      colocar(k('retoH'), L, 23, 35, 1);
      colocar(k('star'), L, 23, 37, 13);
      // capturas en zigzag: la 1 a la derecha del reto, la 2 a la izquierda con su texto al lado
      colocar(k('cap1Label'), RC, 27, 33, 1);
      colocar(k('shot1'), RC, 27, 35, 15);
      colocar(k('cap1'), RC, 27, 51, 3);
      colocar(k('cap2Label'), L, 27, 56, 1);
      colocar(k('shot2'), L, 27, 58, 15);
      colocar(k('cap2'), L + 31, cr - L - 31, 58, 4);
    },
  },
  'hoja-3': {
    filas: 58,
    colocar(k, { cl, cr }) {
      const L = cl, RC = cr - 27;
      colocar(k('label'), L, 23, 3, 1);
      colocar(k('title'), L, 23, 5, 3);
      colocar(k('cota'), L, 23, 8, 1);
      colocar(k('ymLabel'), L, 23, 11, 1);
      colocar(k('ymH'), L, 23, 13, 1);
      colocar(k('ymText'), L, 23, 15, 3);
      colocar(k('ymFicha'), L, 23, 19, 2);
      colocar(k('tasks'), RC, 27, 11, 17);
      colocar(k('dvLabel'), L, 23, 30, 1);
      colocar(k('dvShot'), L, 23, 32, 13);
      colocar(k('dvText'), L, 23, 46, 3);
      colocar(k('dvLink'), L, 23, 49, 1);
      colocar(k('vtLabel'), RC, 27, 30, 1);
      colocar(k('vtShot'), RC, 27, 32, 15);
      colocar(k('vtText'), RC, 27, 48, 2);
      colocar(k('vtLink'), RC, 27, 50, 1);
    },
  },
  'hoja-4': {
    filas: 50,
    colocar(k, { cl, cr }) {
      const L = cl, RC = cr - 27, fl = L + Math.max(0, Math.floor((cr - cl - 52) / 2));
      colocar(k('label'), L, 23, 3, 1);
      colocar(k('title'), L, 23, 5, 6);
      colocar(k('cota'), L, 23, 11, 1);
      colocar(k('intro'), RC, 27, 5, 3);
      colocar(k('ficha'), RC, 27, 9, 3);
      colocar(k('loopLabel'), fl, 52, 14, 1);
      colocar(k('loop'), fl, 52, 16, 8);
      colocar(k('hLabel'), L, 23, 26, 1);
      colocar(k('hH'), L, 23, 28, 1);
      colocar(k('hText'), L, 23, 30, 3);
      colocar(k('hFicha'), L, 23, 34, 3);
      colocar(k('rLabel'), RC, 27, 26, 1);
      colocar(k('rules'), RC, 27, 28, 15);
    },
  },
  'hoja-5': {
    filas: 52,
    colocar(k, { cl, cr }) {
      const L = cl, RC = cr - 27, fl = L + Math.max(0, Math.floor((cr - cl - 52) / 2));
      colocar(k('label'), L, 23, 3, 1);
      colocar(k('title'), L, 23, 5, 3);
      colocar(k('cota'), L, 23, 8, 1);
      colocar(k('intro'), RC, 27, 5, 4);
      colocar(k('ganttLabel'), fl, 52, 11, 1);
      colocar(k('gantt'), fl, 52, 13, 11);
      colocar(k('expLabel'), L, 23, 26, 1);
      colocar(k('jobs'), L, 23, 28, 15);
      colocar(k('eduLabel'), RC, 27, 26, 1);
      colocar(k('edu'), RC, 27, 28, 4);
      colocar(k('bach'), RC, 27, 33, 2);
      colocar(k('eduFicha'), RC, 27, 36, 2);
    },
  },
  'hoja-6': {
    filas: 30,
    colocar(k, { cl, cr }) {
      const L = cl, RC = cr - 27;
      colocar(k('label'), L, 23, 3, 1);
      colocar(k('title'), L, 23, 5, 3);
      colocar(k('cota'), L, 23, 8, 1);
      colocar(k('contact'), L, 23, 11, 7);
      colocar(k('ficha'), L, 23, 19, 3);
      // foto de 12 × 15 celdas (288 × 360 px, 4:5) con sus cotas debajo y a la derecha
      colocar(k('foto'), RC + 4, 14, 3, 19);
    },
  },
};

export function prepararHojas() {
  return [...document.querySelectorAll('.sheet')].map((root) => {
    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.dataset.box = '';
    frame.style.setProperty('--q', '.38s');
    frame.appendChild(document.createElement('div')).className = 'grid';
    const reglaX = document.createElementNS(NS, 'svg'), reglaY = document.createElementNS(NS, 'svg');
    reglaX.setAttribute('class', 'ruler x');
    reglaY.setAttribute('class', 'ruler y');
    reglaX.setAttribute('aria-hidden', 'true');
    reglaY.setAttribute('aria-hidden', 'true');
    const marcaX = document.createElement('i'), marcaY = document.createElement('i');
    marcaX.className = 'marker x';
    marcaY.className = 'marker y';
    root.prepend(frame, reglaX, reglaY, marcaX, marcaY);
    const k = (nombre) => root.querySelector(`[data-k="${nombre}"]`);
    return {
      root, k, frame, reglaX, reglaY, marcaX, marcaY,
      content: root.querySelector('.content'),
      coords: k('coords'),
      plano: PLANOS[root.id],
      F: { x: 0, y: 0, w: 0, h: 0 },
      reglas: '',
    };
  });
}

export function dibujarBordes() {
  document.querySelectorAll('[data-box]').forEach((b) => ['t', 'r', 'b', 'l'].forEach((lado, i) => {
    const x = document.createElement('i');
    x.className = 'bx ' + lado;
    x.style.setProperty('--i', i);
    b.appendChild(x);
  }));
}

const fijar = (n, vars) => { for (const [k, v] of Object.entries(vars)) n.style.setProperty(k, v); };

const margen = (sw) => {
  if (sw < 600) return 16;
  // un portátil de 1366 px se queda en 53 columnas con 34 px de margen; con 24 llega a las 54 del escritorio
  return Math.floor((sw - 68) / U) < COMPOSICION && Math.floor((sw - 48) / U) >= COMPOSICION ? 24 : 34;
};

export function maquetar(hojas) {
  const html = document.documentElement;
  const sw = html.clientWidth, vh = innerHeight;
  const m = margen(sw);
  const N = Math.floor((sw - 2 * m) / U);
  const enPlano = N >= COMPOSICION;
  html.classList.toggle('plano', enPlano);
  html.style.setProperty('--m', m + 'px');
  if (enPlano) for (const h of hojas) maquetarPlano(h, sw, vh, m, N);
  else {
    // primero se escribe en todas las hojas y luego se mide: medir entre escrituras obligaría a recalcular la página en cada hoja
    for (const h of hojas) prepararPila(h, sw, m, N);
    const alturas = hojas.map((h) => h.content.offsetHeight);
    hojas.forEach((h, i) => cerrarPila(h, alturas[i], vh, m, N));
  }
  // las posiciones en la página se calculan aquí, nunca dentro de mousemove
  for (const h of hojas) {
    const r = h.frame.getBoundingClientRect();
    h.F.x = r.left + scrollX;
    h.F.y = r.top + scrollY;
  }
}

function maquetarPlano(h, sw, vh, m, N) {
  const R = Math.max(h.plano.filas, Math.floor((vh - 2 * m) / U));
  const W = N * U, H = R * U, SH = Math.max(vh, H + 2 * m);
  const X = Math.floor((sw - W) / 2), Y = Math.floor((SH - H) / 2);
  h.root.style.height = SH + 'px';
  h.content.style.minHeight = '';
  fijar(h.root, { '--X': X + 'px', '--Y': Y + 'px', '--W': W + 'px', '--H': H + 'px', '--N': N, '--R': R });
  // en una hoja larga la retícula se revela desde el centro de lo que se ve al llegar, no desde el centro de la hoja
  h.frame.style.setProperty('--cy', Math.min(H / 2, vh / 2 - Y) + 'px');
  // con 54-55 columnas (por ejemplo, cuando la barra de scroll resta ancho) el bloque se pega al marco en vez de apilarse
  const cl = N < COMPOSICION + 2 ? 1 : Math.max(2, Math.floor((N - COMPOSICION) / 2)), cr = N - cl;
  colocar(h.k('mono'), 1, 2, 1, 1);
  colocar(h.k('nav'), N - 21, 20, 1, 1);
  colocar(h.k('coords'), 1, 12, R - 2, 1);
  colocar(h.k('tb'), N - 15, 14, R - 5, 4);
  h.plano.colocar(h.k, { R, cl, cr });
  Object.assign(h.F, { w: W, h: H });
  dibujarReglas(h, N, R, m);
}

function prepararPila(h, sw, m, N) {
  const C = Math.min(N - 2, 27), cl = Math.floor((N - C) / 2);
  const W = N * U, X = Math.floor((sw - W) / 2);
  h.root.style.height = '';
  fijar(h.root, { '--X': X + 'px', '--Y': m + 'px', '--W': W + 'px', '--N': N, '--C': C, '--cl': cl });
  h.content.style.minHeight = '';
}

function cerrarPila(h, alto, vh, m, N) {
  const R = Math.ceil(alto / U), W = N * U;
  h.content.style.minHeight = R * U + 'px';
  fijar(h.root, { '--H': R * U + 'px', '--R': R });
  h.frame.style.setProperty('--cy', Math.min(R * U / 2, vh / 2 - m) + 'px');
  Object.assign(h.F, { w: W, h: R * U });
  dibujarReglas(h, N, R, m);
}

function dibujarReglas(h, N, R, m) {
  // al redimensionar, casi siempre las reglas siguen midiendo lo mismo: rehacerlas son cientos de elementos
  const medida = `${N} ${R} ${m}`;
  if (h.reglas === medida) return;
  h.reglas = medida;
  const { reglaX, reglaY } = h;
  const el = (tag, attrs, padre) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return padre.appendChild(n);
  };
  reglaX.replaceChildren();
  reglaY.replaceChildren();
  reglaX.setAttribute('width', N * U + 1);
  reglaX.setAttribute('height', m);
  reglaX.setAttribute('viewBox', `0 0 ${N * U + 1} ${m}`);
  reglaY.setAttribute('width', m);
  reglaY.setAttribute('height', R * U + 1);
  reglaY.setAttribute('viewBox', `0 0 ${m} ${R * U + 1}`);
  for (let i = 0; i <= N; i++) {
    const x = i * U + .5, mayor = i % MAYOR === 0, d = `--d:${(.3 + i * .012).toFixed(3)}s`;
    el('line', { x1: x, x2: x, y1: m, y2: m - (mayor ? 9 : 4), style: d }, reglaX);
    if (mayor) el('text', { x: i * U, y: m - 13, 'text-anchor': i === 0 ? 'start' : 'middle', style: d }, reglaX).textContent = i * U;
  }
  for (let j = 0; j <= R; j++) {
    const y = j * U + .5, mayor = j % MAYOR === 0, d = `--d:${(.3 + j * .012).toFixed(3)}s`;
    el('line', { y1: y, y2: y, x1: m, x2: m - (mayor ? 9 : 4), style: d }, reglaY);
    if (mayor && j > 0) el('text', { x: m - 12, y: j * U + 3, 'text-anchor': 'end', style: d }, reglaY).textContent = j * U;
  }
}
