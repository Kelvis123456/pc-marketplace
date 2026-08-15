import { useMemo, useState } from "react";
import type { Componente, SolicitudItem } from "../domain/marketplace";
import { PickerCard } from "./PickerCard";
import { IconAlert, IconClose, IconTicket } from "./icons";

interface Props {
  componentes: Componente[];
  onConfirmar: (cliente: string, items: SolicitudItem[]) => string | null;
}

export function PedidosView({ componentes, onConfirmar }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [cliente, setCliente] = useState("");
  const [carrito, setCarrito] = useState<Map<number, number>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const filtrados = componentes.filter((c) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return [c.nombre, c.categoria, c.marca, c.modelo].some((v) => v.toLowerCase().includes(q));
  });

  const lineas = useMemo(
    () =>
      Array.from(carrito.entries()).map(([componenteId, cantidad]) => {
        const componente = componentes.find((c) => c.id === componenteId);
        const precioUnitario = componente?.precio ?? 0;
        return {
          componenteId,
          nombre: componente?.nombre ?? "Componente eliminado",
          cantidad,
          subtotal: Math.round(precioUnitario * cantidad * 100) / 100,
        };
      }),
    [carrito, componentes]
  );

  const total = useMemo(() => Math.round(lineas.reduce((s, l) => s + l.subtotal, 0) * 100) / 100, [lineas]);

  function agregar(componenteId: number, cantidad: number) {
    setCarrito((prev) => {
      const next = new Map(prev);
      next.set(componenteId, (next.get(componenteId) ?? 0) + cantidad);
      return next;
    });
    setError(null);
  }

  function quitar(componenteId: number) {
    setCarrito((prev) => {
      const next = new Map(prev);
      next.delete(componenteId);
      return next;
    });
  }

  function confirmar() {
    const items: SolicitudItem[] = Array.from(carrito.entries()).map(([componenteId, cantidad]) => ({
      componenteId,
      cantidad,
    }));
    const resultado = onConfirmar(cliente, items);
    if (resultado) {
      setError(resultado);
      return;
    }
    setCliente("");
    setCarrito(new Map());
    setError(null);
  }

  return (
    <section>
      <div className="view-header">
        <div>
          <h1 className="view-title">Nuevo pedido</h1>
          <p className="view-desc">Elige componentes del catalogo; el stock se descuenta al confirmar.</p>
        </div>
      </div>

      <div className="pedido-layout">
        <div>
          <div className="toolbar">
            <input
              className="search-input"
              placeholder="Buscar componente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar componente para el pedido"
            />
          </div>
          {filtrados.length === 0 ? (
            <div className="empty-state">
              <strong>Sin resultados</strong>
              Prueba con otro termino de busqueda.
            </div>
          ) : (
            <div className="grid">
              {filtrados.map((c) => (
                <PickerCard
                  key={c.id}
                  componente={c}
                  enTicket={carrito.get(c.id) ?? 0}
                  onAgregar={(cantidad) => agregar(c.id, cantidad)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="ticket">
          <div className="ticket-perf" />
          <div className="ticket-body">
            <div className="ticket-heading">
              <div className="ticket-id">PEDIDO // NUEVO</div>
              <div className="ticket-brand">Resumen del pedido</div>
            </div>

            <div className="field">
              <label htmlFor="ticket-cliente">Cliente</label>
              <input
                id="ticket-cliente"
                className="ticket-client-input"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre del cliente (opcional)"
              />
            </div>

            <div className="ticket-divider" />

            {lineas.length === 0 ? (
              <p className="ticket-empty">
                Todavia no agregaste componentes.
                <br />
                Elige del catalogo a la izquierda.
              </p>
            ) : (
              lineas.map((linea) => (
                <div className="ticket-line" key={linea.componenteId}>
                  <span className="ticket-line-name">
                    {linea.nombre} x{linea.cantidad}
                  </span>
                  <span className="ticket-line-meta">
                    ${linea.subtotal.toFixed(2)}
                    <button
                      type="button"
                      className="ticket-remove"
                      onClick={() => quitar(linea.componenteId)}
                      aria-label={`Quitar ${linea.nombre} del pedido`}
                    >
                      <IconClose size={12} />
                    </button>
                  </span>
                </div>
              ))
            )}

            <div className="ticket-divider" />

            <div className="ticket-total-row">
              <span className="ticket-total-label">Total</span>
              <span className="ticket-total-value">${total.toFixed(2)}</span>
            </div>

            {error && (
              <div className="form-error-banner">
                <IconAlert size={14} /> {error}
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary"
              style={{ justifyContent: "center" }}
              onClick={confirmar}
              disabled={lineas.length === 0}
            >
              <IconTicket size={14} /> Confirmar pedido
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
