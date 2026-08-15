import { useEffect, useState, type FormEvent } from "react";
import type { Componente, DatosComponente } from "../domain/marketplace";
import { IconAlert, IconClose } from "./icons";

interface Props {
  open: boolean;
  initial: Componente | null;
  onClose: () => void;
  onSubmit: (datos: DatosComponente) => void;
}

export function ComponentDrawer({ open, initial, onClose, onSubmit }: Props) {
  const esEdicion = initial !== null;

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNombre(initial?.nombre ?? "");
    setCategoria(initial?.categoria ?? "");
    setMarca(initial?.marca ?? "");
    setModelo(initial?.modelo ?? "");
    setPrecio(initial ? String(initial.precio) : "");
    setStock(initial ? String(initial.stock) : "");
    setError(null);
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !categoria.trim() || !marca.trim() || !modelo.trim()) {
      setError("Completa nombre, categoria, marca y modelo.");
      return;
    }
    const precioNum = Number(precio);
    const stockNum = Number(stock);
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      setError("El precio debe ser un numero mayor o igual a 0.");
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setError("El stock debe ser un numero entero mayor o igual a 0.");
      return;
    }
    onSubmit({
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      precio: precioNum,
      stock: stockNum,
    });
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-header">
          <h2 className="drawer-title" id="drawer-title">
            {esEdicion ? "Editar componente" : "Agregar componente"}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="drawer-body" id="component-form">
          {error && (
            <div className="form-error-banner">
              <IconAlert size={14} /> {error}
            </div>
          )}
          <div className="field">
            <label htmlFor="f-nombre">Nombre</label>
            <input
              id="f-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="RTX 4080"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="f-categoria">Categoria</label>
            <input
              id="f-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="GPU"
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="f-marca">Marca</label>
              <input id="f-marca" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="NVIDIA" />
            </div>
            <div className="field">
              <label htmlFor="f-modelo">Modelo / SKU</label>
              <input
                id="f-modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Founders Edition"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="f-precio">Precio (USD)</label>
              <input
                id="f-precio"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="999.99"
              />
            </div>
            <div className="field">
              <label htmlFor="f-stock">Stock</label>
              <input
                id="f-stock"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
        </form>
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" type="submit" form="component-form">
            {esEdicion ? "Guardar cambios" : "Agregar componente"}
          </button>
        </div>
      </div>
    </>
  );
}
