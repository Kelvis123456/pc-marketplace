import { IconAlert, IconCheck } from "./icons";

export interface ToastItem {
  id: number;
  mensaje: string;
  tipo: "success" | "error";
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tipo}`}>
          {t.tipo === "success" ? <IconCheck size={14} /> : <IconAlert size={14} />}
          {t.mensaje}
        </div>
      ))}
    </div>
  );
}
