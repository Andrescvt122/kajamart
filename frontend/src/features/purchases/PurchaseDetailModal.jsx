// PurchaseDetailModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const PurchaseDetailModal = ({ purchase, onClose }) => {
  if (!purchase) return null;

  // Simulación de productos registrados en la compra
  const productosEjemplo = purchase.productos || [
    {
      nombre: "Aceite Vegetal 1L",
      cantidad: 10,
      subida: 5,
      descuento: 2,
      precioCompra: 8000,
      precioVenta: 9500,
      subtotal: 80000,
    },
    {
      nombre: "Arroz Premium 500g",
      cantidad: 5,
      subida: 4,
      descuento: 0,
      precioCompra: 2500,
      precioVenta: 3000,
      subtotal: 12500,
    },
  ];

  const totalCompra = productosEjemplo.reduce(
    (acc, p) => acc + (p.subtotal || p.cantidad * (p.precio || 0)),
    0
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-green-800">
              Detalles de la Compra
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          </div>

          {/* Información general */}
          <div className="grid grid-cols-2 gap-4 text-gray-700 mb-4 text-sm">
            <p>
              <strong>ID Compra:</strong> {purchase.id || "C001"}
            </p>
            <p>
              <strong>Factura:</strong> {purchase.factura || "FAC-0001"}
            </p>
            <p>
              <strong>Proveedor:</strong> {purchase.proveedor || "Global Supplies Inc."}
            </p>
            <p>
              <strong>NIT:</strong> {purchase.nit || "N/A"}
            </p>
            <p>
              <strong>Fecha de compra:</strong> {purchase.fecha || "25/07/2024"}
            </p>
            <p>
              <strong>Comprobante:</strong>{" "}
              {purchase.comprobante || "comprobante_original.pdf"}
            </p>
          </div>

          {/* Tabla de productos */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="p-2 text-left rounded-tl-lg">Producto</th>
                  <th className="p-2 text-center">Cantidad</th>
                  <th className="p-2 text-center">Precio</th>
                  <th className="p-2 text-center rounded-tr-lg">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {productosEjemplo.map((p, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-green-50 transition text-gray-700"
                  >
                    <td className="p-2">{p.nombre}</td>
                    <td className="p-2 text-center">{p.cantidad}</td>
                    <td className="p-2 text-center">
                      ${p.precio?.toLocaleString() || p.precioCompra?.toLocaleString()}
                    </td>
                    <td className="p-2 text-center font-semibold text-green-700">
                      $
                      {(p.subtotal ||
                        (p.cantidad * (p.precio || p.precioCompra))).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end mt-4">
            <div className="bg-green-100 border border-green-400 px-4 py-2 rounded-lg shadow-md">
              <p className="text-green-800 font-semibold">
                Total a pagar: ${totalCompra.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurchaseDetailModal;
