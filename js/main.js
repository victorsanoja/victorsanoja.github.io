import { prepararHojas, dibujarBordes, maquetar } from './reticula.js';
import { iniciarLuz } from './luz.js';
import { iniciarCarga } from './carga.js';
import { iniciarEsquemas } from './esquemas.js';
import { actualizarIman, iniciarSaltos } from './hojas.js';
import { iniciarCapturas } from './capturas.js';
import { iniciarContacto } from './contacto.js';

const hojas = prepararHojas();
dibujarBordes();
maquetar(hojas);
// lo primero tras maquetar: si otro módulo fallara, la carga no se quedaría tapando el CV
iniciarCarga(hojas[0]);
actualizarIman();
const luz = iniciarLuz(hojas);

let pendiente = false;
const rehacer = () => {
  pendiente = false;
  maquetar(hojas);
  actualizarIman();
  luz.redibujar();
};
addEventListener('resize', () => {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(rehacer);
}, { passive: true });
// con las fuentes definitivas cambia la altura de los textos, y en el modo pila de eso dependen las filas de cada hoja
document.fonts.ready.then(rehacer);

iniciarEsquemas();
iniciarSaltos(hojas);
iniciarCapturas();
iniciarContacto();
