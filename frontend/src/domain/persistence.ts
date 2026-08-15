// Guardado automatico del estado del marketplace en localStorage del navegador,
// serializado como JSON. Es la unica forma de persistir sin backend/servidor:
// no hay archivo visible en disco, vive en el almacenamiento local del navegador
// y es exclusivo de este origen/perfil. Si el usuario limpia datos del sitio o
// usa otro navegador, se pierde y la app vuelve a los datos de ejemplo.

import type { EstadoInicial } from "./seed";

const STORAGE_KEY = "banco-pc-marketplace:v1";

export function guardarEstado(estado: EstadoInicial) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena, etc.):
    // se ignora y la app sigue funcionando solo en memoria de la pestana.
  }
}

export function cargarEstado(): EstadoInicial | null {
  try {
    const crudo = window.localStorage.getItem(STORAGE_KEY);
    if (!crudo) return null;
    const datos = JSON.parse(crudo);
    if (
      !Array.isArray(datos?.componentes) ||
      !Array.isArray(datos?.pedidos) ||
      typeof datos?.siguienteIdComponente !== "number" ||
      typeof datos?.siguienteIdPedido !== "number"
    ) {
      return null;
    }
    return datos as EstadoInicial;
  } catch {
    return null;
  }
}

export function borrarEstadoGuardado() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorar
  }
}
