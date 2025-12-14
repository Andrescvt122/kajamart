export const normalize = (t) =>
  String(t ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function calcTotal(productos = []) {
  return productos.reduce((acc, p) => acc + Number(p.subtotal || 0), 0);
}

// Mapea lo que tienes en pantalla al payload que espera el backend
export function buildSalePayload({
  clienteSeleccionado,
  clienteCaja,
  productos,
  metodoPago,
}) {
  const cliente = clienteSeleccionado || clienteCaja;

  return {
    fecha: new Date().toISOString().slice(0, 10),

    // backend: ventas.id_cliente (int) => clienteId debe ser el ID real del cliente en BD
    clienteId: cliente?.id ?? cliente?.id_cliente ?? null,

    // esto es solo informativo en frontend (no lo guardas en DB)
    cliente: cliente?.nombre ?? cliente?.nombre_cliente ?? "Cliente de Caja",

    // backend espera medioPago
    medioPago: metodoPago === "efectivo" ? "Efectivo" : "Transferencia",

    estado: "Completada",

    // IMPORTANTÍSIMO: aquí debe salir el productoId y precioUnitario desde tu estado actual
    productos: (productos || []).map((p) => ({
      // tu estado en IndexRegisterSale usa productoId
      productoId: p.productoId ?? p.id_detalle_producto ?? p.codigo ?? p.id ?? null,

      // tu estado usa nombre
      nombre: p.nombre ?? p.productos?.nombre ?? "Sin nombre",

      cantidad: Number(p.cantidad ?? 0),

      // tu estado usa precioUnitario (NO "precio")
      precioUnitario: Number(p.precioUnitario ?? p.precio ?? p.precio_unitario ?? 0),

      // si no viene subtotal lo calculo para no mandar 0
      subtotal: Number(
        p.subtotal ?? (Number(p.cantidad ?? 0) * Number(p.precioUnitario ?? p.precio ?? 0)) ?? 0
      ),
    })),
  };
}
