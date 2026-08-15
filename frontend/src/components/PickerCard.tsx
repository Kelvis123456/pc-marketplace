import { useEffect, useState } from "react";
import type { Componente } from "../domain/marketplace";
import { StockGauge } from "./StockGauge";
import { IconPlus } from "./icons";

interface Props {
  componente: Componente;
  enTicket: number;
  onAgregar: (cantidad: number) => void;
}

export function PickerCard({ componente, enTicket, onAgregar }: Props) {
  const disponible = componente.stock - enTicket;
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    setCantidad((c) => Math.min(c, Math.max(disponible, 1)));
  }, [disponible]);

  return (
    <article className="component-card picker-card">
      <div className="card-top">
        <span className="category-tag">{componente.categoria}</span>
        {enTicket > 0 && <span className="eyebrow">en pedido: {enTicket}</span>}
      </div>
      <div>
        <h3 className="card-name">{componente.nombre}</h3>
        <p className="card-brand">
          {componente.marca} &middot; {componente.modelo}
        </p>
      </div>
      <div className="card-bottom">
        <span className="card-price mono">${componente.precio.toFixed(2)}</span>
        <StockGauge stock={disponible} />
      </div>
      {disponible > 0 && (
        <>
          <div className="qty-row">
            <button
              type="button"
              className="qty-btn"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              aria-label={`Restar cantidad de ${componente.nombre}`}
            >
              –
            </button>
            <span className="qty-value mono">{cantidad}</span>
            <button
              type="button"
              className="qty-btn"
              onClick={() => setCantidad((c) => Math.min(disponible, c + 1))}
              aria-label={`Sumar cantidad de ${componente.nombre}`}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="btn btn-secondary add-to-order-btn"
            onClick={() => {
              onAgregar(cantidad);
              setCantidad(1);
            }}
          >
            <IconPlus size={14} /> Agregar al pedido
          </button>
        </>
      )}
    </article>
  );
}
