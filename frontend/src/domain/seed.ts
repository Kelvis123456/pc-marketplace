import { type Componente, type Pedido, construirPedido } from "./marketplace";

export interface EstadoInicial {
  componentes: Componente[];
  pedidos: Pedido[];
  siguienteIdComponente: number;
  siguienteIdPedido: number;
}

const COMPONENTES_EJEMPLO: Omit<Componente, "id">[] = [
  { nombre: "RTX 4080", categoria: "GPU", marca: "NVIDIA", modelo: "Founders Edition", precio: 1199.99, stock: 8 },
  { nombre: "Ryzen 9 7950X", categoria: "CPU", marca: "AMD", modelo: "7950X", precio: 599.99, stock: 12 },
  { nombre: "Vengeance 32GB", categoria: "RAM", marca: "Corsair", modelo: "CMK32GX5M2B5600", precio: 109.99, stock: 25 },
  { nombre: "990 Pro 2TB", categoria: "SSD", marca: "Samsung", modelo: "MZ-V9P2T0", precio: 149.99, stock: 15 },
  { nombre: "RM850x", categoria: "PSU", marca: "Corsair", modelo: "RM850x", precio: 129.99, stock: 10 },
];

const PEDIDOS_EJEMPLO: { cliente: string; items: [string, number][] }[] = [
  { cliente: "Carlos Mendez", items: [["RTX 4080", 1], ["Vengeance 32GB", 2]] },
  { cliente: "Laura Gomez", items: [["Ryzen 9 7950X", 1], ["RM850x", 1]] },
  { cliente: "TechZone (mayorista)", items: [["990 Pro 2TB", 3]] },
  { cliente: "Andres Ruiz", items: [["RTX 4080", 1], ["Ryzen 9 7950X", 1], ["Vengeance 32GB", 1]] },
  { cliente: "Sin nombre", items: [["RM850x", 2], ["990 Pro 2TB", 1]] },
];

export function crearEstadoInicial(): EstadoInicial {
  let siguienteIdComponente = 1;
  let componentes: Componente[] = COMPONENTES_EJEMPLO.map((datos) => ({
    id: siguienteIdComponente++,
    ...datos,
  }));

  const idPorNombre = (nombre: string) => componentes.find((c) => c.nombre === nombre)!.id;

  let siguienteIdPedido = 1;
  const pedidos: Pedido[] = [];
  for (const orden of PEDIDOS_EJEMPLO) {
    const solicitudes = orden.items.map(([nombre, cantidad]) => ({
      componenteId: idPorNombre(nombre),
      cantidad,
    }));
    const { pedido, componentesActualizados } = construirPedido(
      siguienteIdPedido++,
      orden.cliente,
      solicitudes,
      componentes
    );
    componentes = componentesActualizados;
    pedidos.push(pedido);
  }

  return { componentes, pedidos, siguienteIdComponente, siguienteIdPedido };
}
