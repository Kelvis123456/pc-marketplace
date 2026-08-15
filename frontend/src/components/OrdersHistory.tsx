import { type Pedido, subtotalItem, totalPedido } from "../domain/marketplace";
import { IconCheck, IconTrash } from "./icons";

interface Props {
  pedidos: Pedido[];
  onEliminar: (pedido: Pedido) => void;
}

export function OrdersHistory({ pedidos, onEliminar }: Props) {
  if (pedidos.length === 0) {
    return (
      <div className="empty-state">
        <strong>Todavia no hay pedidos</strong>
        Ve a "Nuevo pedido" para registrar el primero.
      </div>
    );
  }

  const ordenados = [...pedidos].sort((a, b) => b.id - a.id);

  return (
    <div className="orders-grid">
      {ordenados.map((pedido) => (
        <article className="order-card" key={pedido.id}>
          <div className="ticket-perf" />
          <div className="order-card-head">
            <div>
              <div className="ticket-id">PEDIDO #{pedido.id}</div>
              <div className="order-card-client">{pedido.cliente}</div>
            </div>
            <span className="ticket-status">
              <IconCheck size={12} /> {pedido.estado}
            </span>
          </div>
          <div className="order-card-body">
            {pedido.items.map((item) => (
              <div className="ticket-line" key={item.componenteId}>
                <span className="ticket-line-name">
                  {item.nombreComponente} x{item.cantidad}
                </span>
                <span className="ticket-line-meta">${subtotalItem(item).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-card-foot">
            <span className="ticket-total-value" style={{ fontSize: "17px" }}>
              ${totalPedido(pedido).toFixed(2)}
            </span>
            <button className="btn btn-danger" onClick={() => onEliminar(pedido)}>
              <IconTrash size={14} /> Cancelar
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
