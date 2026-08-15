import type { Vista } from "../types";
import { IconChip } from "./icons";

interface Props {
  vista: Vista;
  onCambiarVista: (vista: Vista) => void;
  totalComponentes: number;
  totalPedidos: number;
  onReiniciar: () => void;
}

const TABS: { id: Vista; label: string }[] = [
  { id: "catalogo", label: "Catalogo" },
  { id: "pedido", label: "Nuevo pedido" },
  { id: "historial", label: "Pedidos" },
];

export function TopBar({ vista, onCambiarVista, totalComponentes, totalPedidos, onReiniciar }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <IconChip size={26} className="brand-mark" />
        <div className="brand-text">
          <span className="brand-word">BANCO</span>
          <span className="brand-sub">componentes de pc</span>
        </div>
      </div>
      <nav className="nav-tabs" aria-label="Secciones">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab${vista === tab.id ? " active" : ""}`}
            onClick={() => onCambiarVista(tab.id)}
            aria-current={vista === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="topbar-spacer" />
      <div className="status-strip">
        <span>
          <span className="status-dot" />
          guardado local
        </span>
        <span>
          <strong>{totalComponentes}</strong> componentes
        </span>
        <span>
          <strong>{totalPedidos}</strong> pedidos
        </span>
      </div>
      <button className="btn btn-ghost" onClick={onReiniciar} title="Restablecer datos de ejemplo">
        Reiniciar
      </button>
    </header>
  );
}
