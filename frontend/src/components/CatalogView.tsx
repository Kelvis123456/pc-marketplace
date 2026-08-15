import { useState } from "react";
import type { Componente } from "../domain/marketplace";
import { ComponentCard } from "./ComponentCard";
import { IconPlus } from "./icons";

interface Props {
  componentes: Componente[];
  onCrear: () => void;
  onEditar: (componente: Componente) => void;
  onEliminar: (componente: Componente) => void;
}

export function CatalogView({ componentes, onCrear, onEditar, onEliminar }: Props) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = componentes.filter((c) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return [c.nombre, c.categoria, c.marca, c.modelo].some((v) => v.toLowerCase().includes(q));
  });

  return (
    <section>
      <div className="view-header">
        <div>
          <h1 className="view-title">Catalogo</h1>
          <p className="view-desc">Componentes disponibles para armar pedidos. Vive en memoria de esta pestana.</p>
        </div>
        <button className="btn btn-primary" onClick={onCrear}>
          <IconPlus /> Agregar componente
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por nombre, categoria o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar componente"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="empty-state">
          <strong>{componentes.length === 0 ? "El catalogo esta vacio" : "Sin resultados"}</strong>
          {componentes.length === 0
            ? "Agrega el primer componente para empezar a armar pedidos."
            : "Prueba con otro termino de busqueda."}
        </div>
      ) : (
        <div className="grid">
          {filtrados.map((c) => (
            <ComponentCard key={c.id} componente={c} onEdit={() => onEditar(c)} onDelete={() => onEliminar(c)} />
          ))}
        </div>
      )}
    </section>
  );
}
