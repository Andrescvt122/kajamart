// src/features/sales/SaleDetailModal.jsx
import React, { useMemo } from "react";
import { formatMoney } from "./helper/formatters";

const formatDate = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(value);
  }
};

// toma el primer valor "usable" (no null/undefined/"")
const pick = (...vals) => {
  for (const v of vals) {
    if (v === 0) return 0; // 0 es válido
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return undefined;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const SaleDetailModal = ({ sale, onClose }) => {
  if (!sale) return null;

  // =========================
  // Encabezado (venta)
  // =========================
  const idVenta = pick(sale?.id_venta, sale?.id) ?? "";
  const fechaRaw = pick(sale?.fecha_venta, sale?.fecha, sale?.createdAt);
  const estado = pick(sale?.estado_venta, sale?.estado) ?? "";
  const medioPago = pick(sale?.metodo_pago, sale?.medioPago, sale?.metodoPago) ?? "";

  // Cliente puede venir por relación "clientes" o ya mapeado
  const clienteNombre =
    pick(
      sale?.clientes?.nombre_cliente,
      sale?.clientes?.nombre,
      sale?.cliente,
      sale?.nombre_cliente
    ) || "Cliente de Caja";

  // =========================
  // Detalle (productos)
  // =========================
  const productos = useMemo(() => {
    // 1) Prisma: detalle_venta
    const det = Array.isArray(sale?.detalle_venta) ? sale.detalle_venta : null;

    if (det && det.length > 0) {
      return det.map((d, idx) => {
        // ✅ TU JOIN real: detalle_venta -> detalle_productos -> productos
        const nombre =
          pick(
            d?.detalle_productos?.productos?.nombre, // ✅ FULL JOIN
            d?.detalle_productos?.nombre,            // por si existe nombre en detalle_productos
            d?.productos?.nombre,                    // si algun día la relación cambia
            d?.producto?.nombre,                     // idem
            d?.nombre,                               // si por algún motivo viene directo
            d?.nombre_producto,
            d?.producto_nombre,
            d?.descripcion
          ) || "Sin nombre";

        const cantidad = toNumber(pick(d?.cantidad, d?.cant, d?.qty));

        const precioUnitario = toNumber(
          pick(
            d?.precio_unitario,
            d?.precioUnitario,
            d?.precio,
            d?.valor_unitario,
            d?.detalle_productos?.precio_venta,       // opcional si existe en detalle_productos
            d?.detalle_productos?.productos?.precio_venta
          )
        );

        const subtotal = toNumber(
          pick(d?.subtotal, d?.sub_total, d?.total_item, cantidad * precioUnitario)
        );

        return {
          key: pick(d?.id_detalle, d?.id_detalle_venta, d?.id, `${idVenta}-${idx}`),
          nombre,
          cantidad,
          precioUnitario,
          subtotal,
        };
      });
    }

    // 2) fallback: si viene en sale.productos (JSON)
    const prods = Array.isArray(sale?.productos) ? sale.productos : null;
    if (prods && prods.length > 0) {
      return prods.map((p, idx) => {
        const nombre =
          pick(p?.nombre, p?.producto, p?.productos?.nombre, p?.detalle_productos?.productos?.nombre) ||
          "Sin nombre";
        const cantidad = toNumber(pick(p?.cantidad, p?.cant, p?.qty));
        const precioUnitario = toNumber(pick(p?.precioUnitario, p?.precio_unitario, p?.precio));
        const subtotal = toNumber(pick(p?.subtotal, cantidad * precioUnitario));

        return {
          key: pick(p?.productoId, p?.id, `${idVenta}-json-${idx}`),
          nombre,
          cantidad,
          precioUnitario,
          subtotal,
        };
      });
    }

    return [];
  }, [sale, idVenta]);

  const totalPorProductos = useMemo(
    () => productos.reduce((acc, p) => acc + toNumber(p.subtotal), 0),
    [productos]
  );

  const totalBase = toNumber(pick(sale?.total, totalPorProductos));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
          Detalles de la Venta
        </h2>

        {/* Información general */}
        <div className="grid grid-cols-2 gap-3 text-gray-700 mb-4 text-sm">
          <p>
            <strong>ID Venta:</strong> {idVenta}
          </p>
          <p>
            <strong>Fecha:</strong> {formatDate(fechaRaw)}
          </p>
          <p>
            <strong>Cliente:</strong> {clienteNombre}
          </p>
          <p>
            <strong>Medio de Pago:</strong> {medioPago}
          </p>
          <p>
            <strong>Estado:</strong> {estado}
          </p>
          <p>
            <strong>Total:</strong> {formatMoney(totalBase)}
          </p>
        </div>

        {/* Tabla de productos */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="p-2 text-left rounded-tl-lg">Producto</th>
                <th className="p-2 text-center">Cantidad</th>
                <th className="p-2 text-center">Precio Unitario</th>
                <th className="p-2 text-center rounded-tr-lg">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {productos.length === 0 ? (
                <tr className="border-b">
                  <td colSpan={4} className="p-4 text-center text-gray-400">
                    No hay detalles para esta venta.
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr
                    key={p.key}
                    className="border-b hover:bg-green-50 transition text-gray-700"
                  >
                    <td className="p-2 text-black">{p.nombre}</td>
                    <td className="p-2 text-center">{p.cantidad}</td>
                    <td className="p-2 text-center">{formatMoney(p.precioUnitario)}</td>
                    <td className="p-2 text-center font-semibold text-green-700">
                      {formatMoney(p.subtotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total general */}
        <div className="flex justify-end mt-4">
          <div className="bg-green-100 border border-green-400 px-4 py-2 rounded-lg shadow-md">
            <p className="text-sm font-semibold text-green-800">
              Total a pagar: {formatMoney(totalBase)}
            </p>
          </div>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;
