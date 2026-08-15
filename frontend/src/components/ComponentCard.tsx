import type { Componente } from "../domain/marketplace";
import { StockGauge } from "./StockGauge";
import { IconEdit, IconTrash } from "./icons";

interface Props {
  componente: Componente;
  onEdit: () => void;
  onDelete: () => void;
}

export function ComponentCard({ componente, onEdit, onDelete }: Props) {
  return (
    <article className="component-card">
      <div className="card-top">
        <span className="category-tag">{componente.categoria}</span>
        <div className="card-actions">
          <button className="btn-icon" onClick={onEdit} aria-label={`Editar ${componente.nombre}`}>
            <IconEdit />
          </button>
          <button className="btn-icon" onClick={onDelete} aria-label={`Eliminar ${componente.nombre}`}>
            <IconTrash />
          </button>
        </div>
      </div>
      <div>
        <h3 className="card-name">{componente.nombre}</h3>
        <p className="card-brand">
          {componente.marca} &middot; {componente.modelo}
        </p>
      </div>
      <div className="card-bottom">
        <span className="card-price mono">${componente.precio.toFixed(2)}</span>
        <StockGauge stock={componente.stock} />
      </div>
    </article>
  );
}
