// components/products/DetailProductModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Barcode,
  Calendar,
  Boxes,
  Layers,
  Package,
  Hash,
  DollarSign,
  Percent,
  TrendingUp,
  QrCode,
  XCircle,
} from "lucide-react";

export default function DetailProductModal({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null;

  const infoItems = [
    { label: "Producto ID", value: product.id, icon: Hash },
    { label: "Nombre", value: product.nombre, icon: Package },
    { label: "Código de barras", value: product.barcode, icon: Barcode },
    { label: "ICU", value: product.icu, icon: QrCode },
    { label: "Precio Compra", value: product.precioCompra, icon: DollarSign },
    { label: "Precio Venta", value: product.precioVenta, icon: DollarSign },
    { label: "Subida de Venta (%)", value: product.subidaVenta, icon: TrendingUp },
    { label: "IVA", value: product.iva, icon: Percent },
    { label: "Fecha de vencimiento", value: product.vencimiento, icon: Calendar },
    { label: "Max Stock", value: product.maxStock ?? 500, icon: Boxes },
    { label: "Mini Stock", value: product.minStock ?? 50, icon: Layers },
    { label: "Stock total", value: product.stockTotal ?? 76, icon: Boxes },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalles del Producto
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-600 transition"
              >
                <XCircle className="w-7 h-7" />
              </button>
            </div>

            {/* Imagen */}
            <div className="flex justify-center mb-6">
              {product.imagen ? (
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="w-48 h-48 object-cover rounded-xl border shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentNode.innerHTML =
                      '<div class="w-48 h-48 flex items-center justify-center rounded-xl border-2 border-dashed text-gray-500">Imagen no encontrada</div>';
                  }}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center rounded-xl border-2 border-dashed text-gray-500">
                  Imagen no encontrada
                </div>
              )}
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map(({ label, value, icon: Icon }, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border hover:shadow-md transition"
                >
                  <Icon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
