"""
Logica de dominio del marketplace de componentes de PC.
Todo vive en memoria: no se escribe a disco, no hay archivos, no hay base de datos.
Compartido entre la app de consola (app.py) y el backend web (backend/main.py).
"""

from dataclasses import dataclass, field


@dataclass
class Componente:
    id: int
    nombre: str
    categoria: str
    marca: str
    modelo: str
    precio: float
    stock: int


@dataclass
class ItemPedido:
    componente_id: int
    nombre_componente: str
    cantidad: int
    precio_unitario: float

    @property
    def subtotal(self):
        return round(self.cantidad * self.precio_unitario, 2)


@dataclass
class Pedido:
    id: int
    cliente: str
    items: list = field(default_factory=list)
    estado: str = "CONFIRMADO"

    @property
    def total(self):
        return round(sum(item.subtotal for item in self.items), 2)


class Marketplace:
    def __init__(self):
        self.componentes = []
        self.pedidos = []
        self._siguiente_id_componente = 1
        self._siguiente_id_pedido = 1

    def agregar_componente(self, nombre, categoria, marca, modelo, precio, stock):
        componente = Componente(
            id=self._siguiente_id_componente,
            nombre=nombre,
            categoria=categoria,
            marca=marca,
            modelo=modelo,
            precio=precio,
            stock=stock,
        )
        self.componentes.append(componente)
        self._siguiente_id_componente += 1
        return componente

    def buscar_componente(self, componente_id):
        for c in self.componentes:
            if c.id == componente_id:
                return c
        return None

    def actualizar_componente(self, componente_id, **campos):
        componente = self.buscar_componente(componente_id)
        if componente is None:
            raise ValueError(f"No existe un componente con id {componente_id}.")
        for campo, valor in campos.items():
            setattr(componente, campo, valor)
        return componente

    def eliminar_componente(self, componente_id):
        componente = self.buscar_componente(componente_id)
        if componente is None:
            raise ValueError(f"No existe un componente con id {componente_id}.")
        self.componentes.remove(componente)

    def buscar_pedido(self, pedido_id):
        for p in self.pedidos:
            if p.id == pedido_id:
                return p
        return None

    def eliminar_pedido(self, pedido_id):
        """Borra el pedido y devuelve el stock reservado a cada componente."""
        pedido = self.buscar_pedido(pedido_id)
        if pedido is None:
            raise ValueError(f"No existe un pedido con id {pedido_id}.")
        for item in pedido.items:
            componente = self.buscar_componente(item.componente_id)
            if componente is not None:
                componente.stock += item.cantidad
        self.pedidos.remove(pedido)

    def registrar_pedido(self, cliente, solicitudes):
        """solicitudes: lista de (componente_id, cantidad).
        Valida stock acumulado antes de confirmar nada (todo o nada).
        Lanza ValueError con el motivo si falla."""
        if not solicitudes:
            raise ValueError("El pedido no tiene items.")

        acumulado = {}
        for componente_id, cantidad in solicitudes:
            if cantidad <= 0:
                raise ValueError(f"Cantidad invalida para el componente {componente_id}.")
            componente = self.buscar_componente(componente_id)
            if componente is None:
                raise ValueError(f"No existe un componente con id {componente_id}.")
            acumulado[componente_id] = acumulado.get(componente_id, 0) + cantidad

        for componente_id, cantidad_total in acumulado.items():
            componente = self.buscar_componente(componente_id)
            if cantidad_total > componente.stock:
                raise ValueError(
                    f"Stock insuficiente para '{componente.nombre}' "
                    f"(pedido: {cantidad_total}, disponible: {componente.stock})."
                )

        items = []
        for componente_id, cantidad_total in acumulado.items():
            componente = self.buscar_componente(componente_id)
            componente.stock -= cantidad_total
            items.append(
                ItemPedido(
                    componente_id=componente.id,
                    nombre_componente=componente.nombre,
                    cantidad=cantidad_total,
                    precio_unitario=componente.precio,
                )
            )

        pedido = Pedido(id=self._siguiente_id_pedido, cliente=cliente, items=items)
        self.pedidos.append(pedido)
        self._siguiente_id_pedido += 1
        return pedido
