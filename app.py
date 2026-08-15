"""
Marketplace de componentes de PC - app de consola.
Todo vive en memoria: no se escribe a disco, no hay archivos, no hay base de datos.
Al cerrar el programa, se pierden todos los datos.
"""

from marketplace import Marketplace


def pedir_texto(mensaje, permitir_vacio=False):
    while True:
        valor = input(mensaje).strip()
        if valor or permitir_vacio:
            return valor
        print("  Este campo no puede estar vacio.")


def pedir_float(mensaje):
    while True:
        crudo = input(mensaje).strip()
        try:
            valor = float(crudo)
            if valor < 0:
                print("  El valor no puede ser negativo.")
                continue
            return valor
        except ValueError:
            print("  Ingresa un numero valido (ej: 999.99).")


def pedir_int(mensaje):
    while True:
        crudo = input(mensaje).strip()
        try:
            valor = int(crudo)
            if valor < 0:
                print("  El valor no puede ser negativo.")
                continue
            return valor
        except ValueError:
            print("  Ingresa un numero entero valido.")


def accion_agregar_componente(mp):
    print("\n-- Agregar componente --")
    nombre = pedir_texto("Nombre: ")
    categoria = pedir_texto("Categoria (ej: GPU, CPU, RAM): ")
    marca = pedir_texto("Marca: ")
    modelo = pedir_texto("Modelo/SKU: ")
    precio = pedir_float("Precio: ")
    stock = pedir_int("Stock: ")
    componente = mp.agregar_componente(nombre, categoria, marca, modelo, precio, stock)
    print(f"Componente agregado con id={componente.id}.")


def accion_listar_componentes(mp):
    print("\n-- Componentes --")
    if not mp.componentes:
        print("No hay componentes registrados todavia.")
        return
    encabezado = f"{'ID':<4} {'Nombre':<20} {'Categoria':<12} {'Marca':<12} {'Modelo':<14} {'Precio':>10} {'Stock':>6}"
    print(encabezado)
    print("-" * len(encabezado))
    for c in mp.componentes:
        print(
            f"{c.id:<4} {c.nombre:<20} {c.categoria:<12} {c.marca:<12} {c.modelo:<14} "
            f"{c.precio:>10.2f} {c.stock:>6}"
        )


def accion_registrar_pedido(mp):
    print("\n-- Registrar pedido --")
    if not mp.componentes:
        print("No hay componentes registrados; agrega alguno primero.")
        return

    cliente = pedir_texto("Cliente (opcional, Enter para omitir): ", permitir_vacio=True)
    if not cliente:
        cliente = "Sin nombre"

    accion_listar_componentes(mp)
    terminadores = {"", "fin", "listo", "salir", "done"}

    solicitudes = []
    while True:
        if solicitudes:
            print("\nItems agregados hasta ahora:")
            for cid, cant in solicitudes:
                print(f"  - {mp.buscar_componente(cid).nombre} x{cant}")

        crudo_id = input(
            "\nID del componente a agregar (Enter o 'fin' para terminar): "
        ).strip()
        if crudo_id.lower() in terminadores:
            break
        try:
            componente_id = int(crudo_id)
        except ValueError:
            print("  ID invalido. Escribe el numero de ID o deja vacio para terminar.")
            continue
        if mp.buscar_componente(componente_id) is None:
            print("  No existe un componente con ese id.")
            continue
        cantidad = pedir_int("Cantidad: ")
        if cantidad <= 0:
            print("  La cantidad debe ser mayor a cero.")
            continue
        solicitudes.append((componente_id, cantidad))
        print("  Item agregado al pedido.")

    try:
        pedido = mp.registrar_pedido(cliente, solicitudes)
    except ValueError as e:
        print(f"\nNo se pudo registrar el pedido: {e}")
        return

    print(f"\nPedido #{pedido.id} confirmado para '{pedido.cliente}'.")
    for item in pedido.items:
        print(f"  - {item.nombre_componente} x{item.cantidad} -> ${item.subtotal:.2f}")
    print(f"  Total: ${pedido.total:.2f}")


def accion_ver_pedidos(mp):
    print("\n-- Pedidos --")
    if not mp.pedidos:
        print("No hay pedidos registrados todavia.")
        return
    for pedido in mp.pedidos:
        print(f"\nPedido #{pedido.id} | Cliente: {pedido.cliente} | Estado: {pedido.estado}")
        for item in pedido.items:
            print(f"  - {item.nombre_componente} x{item.cantidad} -> ${item.subtotal:.2f}")
        print(f"  Total: ${pedido.total:.2f}")


def mostrar_menu():
    print("\n=== Marketplace de Componentes de PC ===")
    print("1) Agregar componente")
    print("2) Listar componentes")
    print("3) Registrar pedido")
    print("4) Ver pedidos")
    print("5) Salir")


def main():
    mp = Marketplace()
    acciones = {
        "1": accion_agregar_componente,
        "2": accion_listar_componentes,
        "3": accion_registrar_pedido,
        "4": accion_ver_pedidos,
    }

    while True:
        mostrar_menu()
        opcion = input("> ").strip()
        if opcion == "5":
            print("Hasta luego.")
            break
        accion = acciones.get(opcion)
        if accion is None:
            print("Opcion invalida, intenta de nuevo.")
            continue
        accion(mp)


if __name__ == "__main__":
    main()
