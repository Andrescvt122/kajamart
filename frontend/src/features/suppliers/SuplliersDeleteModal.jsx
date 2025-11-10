// pages/suppliers/SuppliersDeleteModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function SuppliersDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  supplier,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
            initial={{ scale: 0.9, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -50 }}
            transition={{ duration: 0.2 }}
          >
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {/* Título */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmar eliminación
            </h2>

            {/* Mensaje */}
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar al proveedor{" "}
              <span className="font-medium text-gray-900">
                {supplier?.nombre || "desconocido"}
              </span>
              ? Esta acción no se puede deshacer.
            </p>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (supplier) onConfirm(supplier);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
