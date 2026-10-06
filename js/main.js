import { prepararHojas, dibujarBordes, maquetar } from './reticula.js';
import { iniciarLuz } from './luz.js';
import { iniciarCarga } from './carga.js';
import { iniciarEsquemas, pausarFueraDeVista } from './esquemas.js';
import { actualizarIman, iniciarScroll } from './hojas.js';
import { iniciarCapturas } from './capturas.js';
import { iniciarContacto } from './contacto.js';

const hojas = prepararHojas();
dibujarBordes();
maquetar(hojas);
// lo primero tras maquetar: si otro módulo fallara, la carga no se quedaría tapando el CV
iniciarCarga(hojas[0]);
actualizarIman();
const luz = iniciarLuz(hojas);

const html = document.documentElement;
let pendiente = false, ancho = html.clientWidth;
const rehacer = (siempre) => {
  pendiente = false;
  // en el móvil la barra del navegador cambia el alto de la pantalla al hacer scroll, y en el modo pila el alto no cambia la composición
  if (siempre || html.clientWidth !== ancho || html.classList.contains('plano')) {
    ancho = html.clientWidth;
    maquetar(hojas);
    actualizarIman();
  }
  luz.redibujar();
};
addEventListener('resize', () => {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(() => rehacer(false));
}, { passive: true });
// con las fuentes definitivas cambia la altura de los textos, y en el modo pila de eso dependen las filas de cada hoja
document.fonts.ready.then(() => rehacer(true));

iniciarEsquemas();
pausarFueraDeVista();
iniciarScroll(hojas);
iniciarCapturas();
iniciarContacto();
