// Logica de dominio del marketplace. Este modulo es puro: no hace fetch ni
// toca localStorage. El guardado automatico entre sesiones vive aparte, en
// persistence.ts, y lo orquesta App.tsx.

export interface Componente {
  id: number;
  nombre: string;
  categoria: string;
  marca: string;
  modelo: string;
  precio: number;
  stock: number;
}

export type DatosComponente = Omit<Componente, "id">;

export interface ItemPedido {
  componenteId: number;
  nombreComponente: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: number;
  cliente: string;
  items: ItemPedido[];
  estado: "CONFIRMADO";
}

export interface SolicitudItem {
  componenteId: number;
  cantidad: number;
}

export class ErrorMarketplace extends Error {}

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}

export function subtotalItem(item: ItemPedido): number {
  return redondear(item.cantidad * item.precioUnitario);
}

export function totalPedido(pedido: Pedido): number {
  return redondear(pedido.items.reduce((acc, item) => acc + subtotalItem(item), 0));
}

export function crearComponente(id: number, datos: DatosComponente): Componente {
  return { id, ...datos };
}

/**
 * Construye un pedido a partir de solicitudes (componenteId, cantidad),
 * validando el stock acumulado antes de confirmar nada (todo o nada).
 * Devuelve el pedido nuevo y la lista de componentes ya con el stock
 * descontado; no muta los arreglos recibidos.
 */
export function construirPedido(
  id: number,
  cliente: string,
  solicitudes: SolicitudItem[],
  componentes: Componente[]
): { pedido: Pedido; componentesActualizados: Componente[] } {
  if (solicitudes.length === 0) {
    throw new ErrorMarketplace("El pedido no tiene items.");
  }

  const acumulado = new Map<number, number>();
  for (const { componenteId, cantidad } of solicitudes) {
    if (cantidad <= 0) {
      throw new ErrorMarketplace(`Cantidad invalida para el componente ${componenteId}.`);
    }
    const componente = componentes.find((c) => c.id === componenteId);
    if (!componente) {
      throw new ErrorMarketplace(`No existe un componente con id ${componenteId}.`);
    }
    acumulado.set(componenteId, (acumulado.get(componenteId) ?? 0) + cantidad);
  }

  for (const [componenteId, cantidadTotal] of acumulado) {
    const componente = componentes.find((c) => c.id === componenteId)!;
    if (cantidadTotal > componente.stock) {
      throw new ErrorMarketplace(
        `Stock insuficiente para "${componente.nombre}" (pedido: ${cantidadTotal}, disponible: ${componente.stock}).`
      );
    }
  }

  const componentesActualizados = componentes.map((c) => ({ ...c }));
  const items: ItemPedido[] = [];
  for (const [componenteId, cantidadTotal] of acumulado) {
    const componente = componentesActualizados.find((c) => c.id === componenteId)!;
    componente.stock -= cantidadTotal;
    items.push({
      componenteId,
      nombreComponente: componente.nombre,
      cantidad: cantidadTotal,
      precioUnitario: componente.precio,
    });
  }

  const pedido: Pedido = {
    id,
    cliente: cliente.trim() || "Sin nombre",
    items,
    estado: "CONFIRMADO",
  };

  return { pedido, componentesActualizados };
}

/** Devuelve el stock reservado por un pedido a la lista de componentes dada. */
export function devolverStockDePedido(pedido: Pedido, componentes: Componente[]): Componente[] {
  return componentes.map((c) => {
    const item = pedido.items.find((i) => i.componenteId === c.id);
    return item ? { ...c, stock: c.stock + item.cantidad } : c;
  });
}
