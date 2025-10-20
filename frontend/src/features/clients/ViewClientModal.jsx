// ViewClientModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ViewClientModal({ isOpen, onClose, client }) {
  if (!client) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Detalles del Cliente
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="space-y-3">
              <p><span className="font-semibold">ID:</span> {client.id}</p>
              <p><span className="font-semibold">Nombre:</span> {client.nombre}</p>
              <p>
                <span className="font-semibold">Documento:</span>{" "}
                {client.tipoDocumento} {client.numeroDocumento}
              </p>
              <p><span className="font-semibold">Correo:</span> {client.correo}</p>
              <p><span className="font-semibold">Teléfono:</span> {client.telefono}</p>
              <p>
                <span className="font-semibold">Estado:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    client.estado === "Activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {client.estado}
                </span>
              </p>
              <p><span className="font-semibold">Fecha:</span> {client.fecha}</p>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
