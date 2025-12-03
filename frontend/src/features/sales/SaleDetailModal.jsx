// src/features/sales/SaleDetailModal.jsx
import React from "react";
import { formatMoney } from "./helper/formatters";

const SaleDetailModal = ({ sale, onClose }) => {
  if (!sale) return null;

  // Productos de ejemplo o los que vengan en la venta
  const productosEjemplo = sale.productos || [
    { nombre: "Aceite Vegetal 1L", cantidad: 10, precioUnitario: 9500, subtotal: 95000 },
    { nombre: "Arroz Premium 500g", cantidad: 5, precioUnitario: 3000, subtotal: 15000 },
    { nombre: "Azúcar Blanca 1kg", cantidad: 3, precioUnitario: 4200, subtotal: 12600 },
  ];

  // Total calculado por los productos; si la venta ya trae total, úsalo como base
  const totalPorProductos = productosEjemplo.reduce(
    (acc, p) => acc + Number(p.subtotal || 0),
    0
  );
  const totalBase = Number(sale.total) || totalPorProductos;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
          Detalles de la Venta
        </h2>

        {/* Información general */}
        <div className="grid grid-cols-2 gap-3 text-gray-700 mb-4 text-sm">
          <p>
            <strong>ID Venta:</strong> {sale.id}
          </p>
          <p>
            <strong>Fecha:</strong> {sale.fecha}
          </p>
          <p>
            <strong>Cliente:</strong> {sale.cliente}
          </p>
          <p>
            <strong>Medio de Pago:</strong> {sale.medioPago}
          </p>

          <p>
            <strong>Estado:</strong> {sale.estado}
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
              {productosEjemplo.map((p, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-green-50 transition text-gray-700"
                >
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2 text-center">{p.cantidad}</td>
                  <td className="p-2 text-center">
                    {formatMoney(p.precioUnitario)}
                  </td>
                  <td className="p-2 text-center font-semibold text-green-700">
                    {formatMoney(p.subtotal)}
                  </td>
                </tr>
              ))}
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
