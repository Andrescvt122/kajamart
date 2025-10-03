// SaleDetailModal.jsx
import React from "react";
import { motion } from "framer-motion";

export default function SaleDetailModal({ isOpen, onClose, sale }) {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        className="bg-white rounded-xl p-6 w-full max-w-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className="text-xl font-semibold mb-4 text-black">Detalles de la Venta</h3>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>ID Venta:</strong> {sale.id}</p>
          <p><strong>Fecha:</strong> {sale.fecha}</p>
          <p><strong>Cliente:</strong> {sale.cliente}</p>
          <p><strong>Total:</strong> {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(sale.total)}</p>
          <p><strong>Medio de Pago:</strong> {sale.medioPago}</p>
          <p><strong>IVA:</strong> {sale.iva}</p>
          <p><strong>ICU:</strong> {sale.icu}</p>
          <p><strong>Estado:</strong> {sale.estado}</p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
