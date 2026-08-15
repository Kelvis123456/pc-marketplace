import type { CSSProperties } from "react";

const UMBRAL_BAJO = 5;
const TOTAL_TICKS = 5;

/**
 * De 1 a UMBRAL_BAJO unidades, las barritas son una cuenta exacta (1 barrita = 1 unidad),
 * asi que cantidades distintas dentro de la zona de riesgo se ven distintas sin ambiguedad.
 * De ahi para arriba, "todo lleno en verde" es un estado (como el icono de señal del celular),
 * no una medida proporcional -- por eso el numero exacto siempre se muestra al lado.
 */
function nivelStock(stock: number): { ticks: number; color: string } {
  if (stock <= 0) return { ticks: 0, color: "var(--danger)" };
  if (stock <= UMBRAL_BAJO) return { ticks: stock, color: "var(--amber)" };
  return { ticks: TOTAL_TICKS, color: "var(--green)" };
}

export function StockGauge({ stock }: { stock: number }) {
  const { ticks, color } = nivelStock(Math.max(stock, 0));
  const agotado = stock <= 0;

  return (
    <div className="gauge">
      <div className="gauge-ticks" style={{ "--gauge-color": color } as CSSProperties}>
        {Array.from({ length: TOTAL_TICKS }).map((_, i) => (
          <span key={i} className={`gauge-tick${i < ticks ? " filled" : ""}`} />
        ))}
      </div>
      <span className={`gauge-label${agotado ? " gauge-label-danger" : ""}`}>
        {agotado ? "agotado" : `${stock} u.`}
      </span>
    </div>
  );
}
