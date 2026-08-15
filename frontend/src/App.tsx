import { useEffect, useRef, useState } from "react";
import {
  type Componente,
  type DatosComponente,
  type Pedido,
  type SolicitudItem,
  ErrorMarketplace,
  construirPedido,
  crearComponente,
  devolverStockDePedido,
  totalPedido,
} from "./domain/marketplace";
import { crearEstadoInicial, type EstadoInicial } from "./domain/seed";
import { cargarEstado, guardarEstado, borrarEstadoGuardado } from "./domain/persistence";
import type { Vista } from "./types";
import { TopBar } from "./components/TopBar";
import { CatalogView } from "./components/CatalogView";
import { PedidosView } from "./components/PedidosView";
import { OrdersHistory } from "./components/OrdersHistory";
import { ComponentDrawer } from "./components/ComponentDrawer";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ToastStack, type ToastItem } from "./components/Toast";

function App() {
  const estadoInicialRef = useRef<EstadoInicial | null>(null);
  if (estadoInicialRef.current === null) {
    estadoInicialRef.current = cargarEstado() ?? crearEstadoInicial();
  }
  const seed = estadoInicialRef.current;

  const [componentes, setComponentes] = useState<Componente[]>(() => seed.componentes);
  const [pedidos, setPedidos] = useState<Pedido[]>(() => seed.pedidos);
  const nextComponentId = useRef(seed.siguienteIdComponente);
  const nextPedidoId = useRef(seed.siguienteIdPedido);

  useEffect(() => {
    guardarEstado({
      componentes,
      pedidos,
      siguienteIdComponente: nextComponentId.current,
      siguienteIdPedido: nextPedidoId.current,
    });
  }, [componentes, pedidos]);

  const [vista, setVista] = useState<Vista>("catalogo");

  const [drawer, setDrawer] = useState<{ open: boolean; componente: Componente | null }>({
    open: false,
    componente: null,
  });
  const [componenteAEliminar, setComponenteAEliminar] = useState<Componente | null>(null);
  const [pedidoACancelar, setPedidoACancelar] = useState<Pedido | null>(null);
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(1);

  function notificar(mensaje: string, tipo: ToastItem["tipo"] = "success") {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }

  function abrirCrearComponente() {
    setDrawer({ open: true, componente: null });
  }

  function abrirEditarComponente(componente: Componente) {
    setDrawer({ open: true, componente });
  }

  function cerrarDrawer() {
    setDrawer({ open: false, componente: null });
  }

  function handleDrawerSubmit(datos: DatosComponente) {
    if (drawer.componente) {
      const id = drawer.componente.id;
      setComponentes((prev) => prev.map((c) => (c.id === id ? { id, ...datos } : c)));
      notificar(`"${datos.nombre}" actualizado.`);
    } else {
      const nuevo = crearComponente(nextComponentId.current++, datos);
      setComponentes((prev) => [...prev, nuevo]);
      notificar(`"${nuevo.nombre}" agregado al catalogo.`);
    }
    cerrarDrawer();
  }

  function handleEliminarComponente(componente: Componente) {
    setComponentes((prev) => prev.filter((c) => c.id !== componente.id));
    notificar(`"${componente.nombre}" eliminado del catalogo.`);
    setComponenteAEliminar(null);
  }

  function handleConfirmarPedido(cliente: string, items: SolicitudItem[]): string | null {
    try {
      const { pedido, componentesActualizados } = construirPedido(
        nextPedidoId.current,
        cliente,
        items,
        componentes
      );
      nextPedidoId.current += 1;
      setComponentes(componentesActualizados);
      setPedidos((prev) => [...prev, pedido]);
      notificar(`Pedido #${pedido.id} confirmado por $${totalPedido(pedido).toFixed(2)}.`);
      return null;
    } catch (e) {
      if (e instanceof ErrorMarketplace) return e.message;
      throw e;
    }
  }

  function handleCancelarPedido(pedido: Pedido) {
    setComponentes((prev) => devolverStockDePedido(pedido, prev));
    setPedidos((prev) => prev.filter((p) => p.id !== pedido.id));
    notificar(`Pedido #${pedido.id} cancelado; stock devuelto al catalogo.`);
    setPedidoACancelar(null);
  }

  function handleReiniciarDatos() {
    borrarEstadoGuardado();
    const nuevo = crearEstadoInicial();
    setComponentes(nuevo.componentes);
    setPedidos(nuevo.pedidos);
    nextComponentId.current = nuevo.siguienteIdComponente;
    nextPedidoId.current = nuevo.siguienteIdPedido;
    notificar("Datos de ejemplo restablecidos.");
    setConfirmarReinicio(false);
  }

  return (
    <div className="app-shell">
      <TopBar
        vista={vista}
        onCambiarVista={setVista}
        totalComponentes={componentes.length}
        totalPedidos={pedidos.length}
        onReiniciar={() => setConfirmarReinicio(true)}
      />

      <main className="main">
        {vista === "catalogo" && (
          <CatalogView
            componentes={componentes}
            onCrear={abrirCrearComponente}
            onEditar={abrirEditarComponente}
            onEliminar={setComponenteAEliminar}
          />
        )}

        {vista === "pedido" &&
          (componentes.length === 0 ? (
            <div className="empty-state">
              <strong>No hay componentes en el catalogo</strong>
              Agrega al menos uno en la pestana Catalogo antes de registrar un pedido.
            </div>
          ) : (
            <PedidosView componentes={componentes} onConfirmar={handleConfirmarPedido} />
          ))}

        {vista === "historial" && (
          <section>
            <div className="view-header">
              <div>
                <h1 className="view-title">Pedidos</h1>
                <p className="view-desc">Historial de pedidos confirmados en esta sesion.</p>
              </div>
            </div>
            <OrdersHistory pedidos={pedidos} onEliminar={setPedidoACancelar} />
          </section>
        )}
      </main>

      <ComponentDrawer open={drawer.open} initial={drawer.componente} onClose={cerrarDrawer} onSubmit={handleDrawerSubmit} />

      <ConfirmDialog
        open={componenteAEliminar !== null}
        title="Eliminar componente"
        description={
          componenteAEliminar
            ? `Se eliminara "${componenteAEliminar.nombre}" del catalogo. Los pedidos ya confirmados no se ven afectados.`
            : ""
        }
        onConfirm={() => componenteAEliminar && handleEliminarComponente(componenteAEliminar)}
        onCancel={() => setComponenteAEliminar(null)}
      />

      <ConfirmDialog
        open={pedidoACancelar !== null}
        title="Cancelar pedido"
        confirmLabel="Cancelar pedido"
        description={
          pedidoACancelar
            ? `Se cancelara el pedido #${pedidoACancelar.id} de "${pedidoACancelar.cliente}" y se devolvera el stock reservado al catalogo.`
            : ""
        }
        onConfirm={() => pedidoACancelar && handleCancelarPedido(pedidoACancelar)}
        onCancel={() => setPedidoACancelar(null)}
      />

      <ConfirmDialog
        open={confirmarReinicio}
        title="Restablecer datos de ejemplo"
        confirmLabel="Restablecer"
        description="Se borraran todos los componentes y pedidos guardados en este navegador, y se vuelve a los 5 componentes y 5 pedidos de ejemplo iniciales."
        onConfirm={handleReiniciarDatos}
        onCancel={() => setConfirmarReinicio(false)}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}

export default App;
